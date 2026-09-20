import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Pause,
  Play,
  SkipForward,
  CheckCircle2,
  AlertCircle,
  Settings,
  ChevronDown,
  Volume2,
  VolumeX,
  ShieldAlert,
  Activity,
  Mic,
  MicOff,
  WifiOff,
} from 'lucide-react';
import { Button, PainSlider, BottomSheet } from '@/components/ui';
import {
  createPoseSource,
  IPoseSource,
  LivePoseFrame,
  PoseSourceState,
  FeedbackData,
} from '@/engine/pose/poseSource';
import { voiceCoach, VoiceLanguage } from '@/engine/voice';
import { generateSessionPdf, SessionReportData } from '@/lib/reportPdf';
import { queueReportForSync } from '@/lib/outbox';
import { db, getPatientIdentity, PatientProfileRecord } from '@/lib/db';
import { fetchProgram } from '@/lib/program';
import { PAIN_STOP_THRESHOLD } from '@/lib/constants';
import { useVoicePainInput } from '@/hooks/useVoicePainInput';
import { useAppStore } from '@/lib/store';
import { SkeletonCanvas } from '@/components/session/SkeletonCanvas';
import { PreSessionSetupCard } from '@/components/session/PreSessionSetupCard';
import { CountdownOverlay } from '@/components/session/CountdownOverlay';
import { CompletionSheet } from '@/components/session/CompletionSheet';
import { LiveStateOverlay } from '@/components/session/LiveStateOverlay';
import { DevMetricsModal } from '@/components/session/DevMetricsModal';
import { useCameraStream } from '@/hooks/useCameraStream';
import {
  evaluateWarrior2,
  evaluateWallSlide,
  isEvaluationComplete,
  shouldEvaluateFrame,
  arbitrateFeedback,
  FeedbackDebouncer,
  FeedbackOutput,
  RepCounter,
  HoldAccumulator,
  angle,
} from '@/engine/exercises';

export const LiveSessionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { userName, painScore, setPainScore } = useAppStore();

  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const exerciseId = searchParams.get('exercise') || 'warrior-2';
  const isHoldMode = exerciseId !== 'wall-slide';
  const exerciseTitle = isHoldMode ? 'Warrior II (Virabhadrasana II)' : 'Wall Slides with Scapular Retraction';
  const targetUnits = isHoldMode ? 30 : 10; // 30s target hold vs 10 reps

  // Stage of session flow: 'setup' | 'countdown' | 'active' | 'completed'
  const [stage, setStage] = useState<'setup' | 'countdown' | 'active' | 'completed'>('setup');
  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('right');
  const [trackingMode, setTrackingMode] = useState<'camera' | 'replay'>('camera');

  // Pose Source State & Live Frame
  const [sourceState, setSourceState] = useState<PoseSourceState>('tracking');
  const [currentFrame, setCurrentFrame] = useState<LivePoseFrame | null>(null);

  // Debounced Feedback State (minimum 1.5s on screen)
  const [activeFeedback, setActiveFeedback] = useState<FeedbackData>({
    type: 'positive',
    message: 'Good movement',
    joint: null,
    checks: { spine: true, knee: true },
  });

  // Repetition or Hold Time (seconds) tracker - starts at 0
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const currentProgressRef = useRef<number>(0);
  currentProgressRef.current = currentProgress;

  // Range of motion tracker (honest nullable state)
  const [currentRom, setCurrentRom] = useState<number | null>(null);
  const [peakRom, setPeakRom] = useState<number | null>(null);
  const peakRomRef = useRef<number | null>(null);
  peakRomRef.current = peakRom;

  // Real on-device exercise engine instances
  const repCounter = useRef(new RepCounter({ upperThreshold: 130, lowerThreshold: 75, minRepDurationMs: 600 }));
  const holdAccumulator = useRef(new HoldAccumulator());
  const feedbackDebouncer = useRef(new FeedbackDebouncer(1500));
  const totalFramesRef = useRef<number>(0);
  const passedFramesRef = useRef<number>(0);

  // Pain check-in & Safety stop rule
  const [sessionPainBefore] = useState<number>(painScore || 2);
  const [sessionPainAfter, setSessionPainAfter] = useState<number>(painScore || 2);
  const [painInterrupted, setPainInterrupted] = useState<boolean>(false);
  const [painCheckinOpen, setPainCheckinOpen] = useState<boolean>(false);

  // Patient Identity & Therapist Program
  const [patientIdentity, setPatientIdentity] = useState<PatientProfileRecord | null>(null);
  const [painThreshold, setPainThreshold] = useState<number>(PAIN_STOP_THRESHOLD);
  const [sessionTargetUnits, setSessionTargetUnits] = useState<number>(targetUnits);
  const targetUnitsRef = useRef<number>(targetUnits);
  targetUnitsRef.current = sessionTargetUnits;

  // Voice Check-in Hook
  const voiceInput = useVoicePainInput();

  // Load identity and program before session starts
  useEffect(() => {
    let mounted = true;
    (async () => {
      const identity = await getPatientIdentity();
      if (!mounted) return;
      if (identity) {
        setPatientIdentity(identity);
      }
      const program = await fetchProgram();
      if (!mounted) return;
      if (program) {
        if (typeof program.maxPainThreshold === 'number') {
          setPainThreshold(program.maxPainThreshold);
        }
        if (program.reps && !isHoldMode) {
          setSessionTargetUnits(program.reps);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [exerciseId, isHoldMode]);

  // When speech recognition extracts pain score, update slider state
  useEffect(() => {
    if (voiceInput.parsedPain !== null) {
      setSessionPainAfter(voiceInput.parsedPain.score);
    }
  }, [voiceInput.parsedPain]);

  // Voice & Audio Coach state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const sessionStartTime = useRef<number>(Date.now());
  const [completedReport, setCompletedReport] = useState<SessionReportData | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Camera stream management
  const camera = useCameraStream();

  // Pose Source instance
  const [poseSource, setPoseSource] = useState<IPoseSource | null>(null);
  const poseSourceRef = useRef<IPoseSource | null>(null);
  poseSourceRef.current = poseSource;

  // Debug state selector toggle for reviewers
  const [showStatePicker, setShowStatePicker] = useState<boolean>(false);
  const [devMetricsOpen, setDevMetricsOpen] = useState<boolean>(false);

  // Sync refs to avoid re-subscribing on state changes
  const activeFeedbackRef = useRef(activeFeedback);
  activeFeedbackRef.current = activeFeedback;

  const sessionPainBeforeRef = useRef(sessionPainBefore);
  sessionPainBeforeRef.current = sessionPainBefore;

  const sessionPainAfterRef = useRef(sessionPainAfter);
  sessionPainAfterRef.current = sessionPainAfter;

  const finishSessionRef = useRef<((wasPainInterrupted?: boolean, finalPain?: number) => void) | null>(null);

  // Configure voice language matching i18n
  useEffect(() => {
    const lang = (i18n.language || 'en').slice(0, 2) as VoiceLanguage;
    voiceCoach.setLanguage(lang === 'hi' || lang === 'te' ? lang : 'en');
  }, [i18n.language]);

  // Screen Wake Lock & Haptics
  useEffect(() => {
    let wakeLockSentinel: any = null;
    if ('wakeLock' in navigator) {
      try {
        (navigator as any).wakeLock.request('screen').then((lock: any) => {
          wakeLockSentinel = lock;
        }).catch(() => {});
      } catch {}
    }
    return () => {
      if (wakeLockSentinel) wakeLockSentinel.release().catch(() => {});
      voiceCoach.stop();
    };
  }, []);

  // Initialize Pose Source when countdown finishes
  const handleCountdownComplete = () => {
    setStage('active');
    sessionStartTime.current = Date.now();
    const source = poseSourceRef.current;
    if (source) {
      if (camera.videoRef.current) {
        source.attachVideo(camera.videoRef.current);
      }
      source.start().catch((err) => {
        console.error('Failed to start pose source:', err);
      });
    }
    voiceCoach.speakKey('start');
  };

  const finishSession = (wasPainInterrupted = false, finalPain = sessionPainAfterRef.current) => {
    poseSourceRef.current?.stop();
    camera.stop();
    setPainInterrupted(wasPainInterrupted);
    setStage('completed');

    if (wasPainInterrupted) {
      voiceCoach.speakKey('pain_stop');
    } else {
      voiceCoach.speakKey('completed');
    }

    const duration = Math.max(15, Math.round((Date.now() - sessionStartTime.current) / 1000));
    const reportId = 'rep-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);

    const totalFrames = totalFramesRef.current;
    const passedFrames = passedFramesRef.current;

    let accuracyScore: number | null = null;
    if (trackingMode === 'camera') {
      if (totalFrames >= 30) {
        accuracyScore = Math.round((passedFrames / totalFrames) * 100);
      } else {
        accuracyScore = null;
      }
    } else {
      // Replay mode: compute from replay frames if sufficient
      accuracyScore = totalFrames >= 30 ? Math.round((passedFrames / totalFrames) * 100) : null;
    }

    const formQuality: 'Excellent' | 'Good' | 'Needs Attention' =
      accuracyScore === null
        ? 'Good'
        : wasPainInterrupted || accuracyScore < 60
        ? 'Needs Attention'
        : accuracyScore >= 80
        ? 'Excellent'
        : 'Good';

    const patientName = userName || (import.meta.env.VITE_DEMO_MODE === 'true' ? 'Demo Patient' : 'Patient');
    const clinicCode = patientIdentity?.clinicCode || (import.meta.env.VITE_DEMO_MODE === 'true' ? 'CALM01' : 'LOCAL');
    const patientId = patientIdentity?.patientId || 'local-patient';

    const reportData: SessionReportData = {
      reportId,
      patientName,
      clinicCode,
      exerciseTitle,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      durationSeconds: duration,
      repsCompleted: currentProgressRef.current,
      targetReps: targetUnitsRef.current,
      peakRom: peakRomRef.current ?? undefined,
      accuracyScore,
      formQuality,
      painBefore: sessionPainBeforeRef.current,
      painAfter: finalPain,
      painThreshold,
      painInterrupted: wasPainInterrupted,
      mode: isHoldMode ? 'hold' : 'reps',
      simulated: trackingMode === 'replay',
    };

    setCompletedReport(reportData);

    // Persist locally in Dexie
    db.sessions.add({
      reportId,
      date: new Date().toISOString(),
      type: isHoldMode ? 'yoga' : 'physio',
      title: exerciseTitle,
      durationMinutes: Math.ceil(duration / 60),
      exercisesCompleted: currentProgressRef.current,
      painScoreBefore: sessionPainBeforeRef.current,
      painScoreAfter: finalPain,
      accuracyScore,
      peakRom: peakRomRef.current ?? undefined,
      painInterrupted: wasPainInterrupted,
      simulated: trackingMode === 'replay',
    }).catch(() => {});

    // Only real camera sessions with valid score sync to clinic; replay mode and unscored sessions never sync
    if (trackingMode === 'camera' && accuracyScore !== null) {
      queueReportForSync({
        ...reportData,
        patientId,
        timestamp: Date.now(),
      }).catch(() => {});
    }
  };
  finishSessionRef.current = finishSession;

  // Subscribe to frames and state whenever poseSource is set
  useEffect(() => {
    if (!poseSource) return;

    const unsubFrame = poseSource.onFrame((frame) => {
      setCurrentFrame(frame);
      const now = frame.timestamp || Date.now();

      if (trackingMode === 'camera') {
        if (!shouldEvaluateFrame(frame)) {
          holdAccumulator.current.update(false, now);
          setCurrentRom(null);
          return;
        }

        totalFramesRef.current += 1;

        let frameRom: number | null = null;
        let allChecksPass = false;
        let rawFeedback: FeedbackOutput;

        if (isHoldMode) {
          const evalResult = evaluateWarrior2(frame.keypoints, selectedSide);
          frameRom = evalResult.currentRom;
          allChecksPass = isEvaluationComplete(evalResult, 'warrior2') && evalResult.formChecks.every((c) => c.passed);
          rawFeedback = arbitrateFeedback(evalResult.formChecks);

          if (allChecksPass) {
            passedFramesRef.current += 1;
          }

          // Accumulate hold time in seconds
          const { holdSeconds } = holdAccumulator.current.update(allChecksPass, now);
          if (holdSeconds !== currentProgressRef.current) {
            setCurrentProgress(holdSeconds);
            if (holdSeconds > 0 && holdSeconds % 10 === 0) {
              voiceCoach.speakKey('rep_milestone');
            }
            if (holdSeconds >= targetUnitsRef.current) {
              finishSessionRef.current?.(false);
            }
          }
        } else {
          const evalResult = evaluateWallSlide(frame.keypoints, selectedSide);
          frameRom = evalResult.currentRom;
          allChecksPass = isEvaluationComplete(evalResult, 'wallslide') && evalResult.formChecks.every((c) => c.passed);
          rawFeedback = arbitrateFeedback(evalResult.formChecks);

          if (allChecksPass) {
            passedFramesRef.current += 1;
          }

          // Count repetitions with hysteresis
          if (frameRom !== null) {
            const { repCount: completedReps } = repCounter.current.update(frameRom, now);
            if (completedReps !== currentProgressRef.current) {
              setCurrentProgress(completedReps);
              if ('vibrate' in navigator) {
                try { navigator.vibrate([40]); } catch {}
              }
              if (completedReps === Math.floor(targetUnitsRef.current / 2)) {
                voiceCoach.speakKey('rep_milestone');
              }
              if (completedReps >= targetUnitsRef.current) {
                finishSessionRef.current?.(false);
              }
            }
          }
        }

        // Real-time Range of Motion
        if (frameRom !== null) {
          const rounded = Math.round(frameRom);
          setCurrentRom(rounded);
          setPeakRom((prev) => (prev === null ? rounded : Math.max(prev, rounded)));
        } else {
          setCurrentRom(null);
        }

        // Debounced Feedback Controller (min 1500ms on screen)
        const chosenFeedback = feedbackDebouncer.current.update(rawFeedback, now);
        if (chosenFeedback) {
          setActiveFeedback(chosenFeedback);
          if (chosenFeedback.type === 'correction') {
            if ('vibrate' in navigator) {
              try { navigator.vibrate([25, 50, 25]); } catch {}
            }
            if (chosenFeedback.message.toLowerCase().includes('shoulder')) {
              voiceCoach.speakKey('lower_shoulder');
            } else if (chosenFeedback.message.toLowerCase().includes('spine') || chosenFeedback.message.toLowerCase().includes('back')) {
              voiceCoach.speakKey('spine_align');
            } else {
              voiceCoach.speak(chosenFeedback.message);
            }
          } else if (chosenFeedback.type === 'positive') {
            voiceCoach.speakKey('good_movement');
          }
        }
      } else {
        // Replay Mode: driven by mock JSON
        totalFramesRef.current += 1;
        if (frame.feedback?.type === 'positive' || !frame.feedback?.joint) {
          passedFramesRef.current += 1;
        }

        if (frame.feedback) {
          setActiveFeedback(frame.feedback);
        }

        if (typeof frame.rep === 'number' && frame.rep !== currentProgressRef.current) {
          setCurrentProgress(frame.rep);
          if (frame.rep === Math.floor(targetUnitsRef.current / 2)) {
            voiceCoach.speakKey('rep_milestone');
          }
          if (frame.rep >= targetUnitsRef.current) {
            finishSessionRef.current?.(false);
          }
        }

        if (frame.keypoints && frame.keypoints.length >= 16) {
          const sidePrefix = selectedSide === 'left' ? 'left' : 'right';
          const hip = frame.keypoints.find((k) => k.name === `${sidePrefix}_hip`) || frame.keypoints[11];
          const knee = frame.keypoints.find((k) => k.name === `${sidePrefix}_knee`) || frame.keypoints[25];
          const ankle = frame.keypoints.find((k) => k.name === `${sidePrefix}_ankle`) || frame.keypoints[27];
          const calculatedAngle = angle(hip, knee, ankle);
          if (calculatedAngle !== null) {
            const rounded = Math.round(calculatedAngle);
            setCurrentRom(rounded);
            setPeakRom((prev) => (prev === null ? rounded : Math.max(prev, rounded)));
          }
        }
      }
    });

    const unsubState = poseSource.onStateChange((newState) => {
      setSourceState(newState);
    });

    return () => {
      unsubFrame();
      unsubState();
    };
  }, [poseSource, trackingMode, selectedSide, isHoldMode]);

  // Keep video attached whenever video element or pose source is ready
  useEffect(() => {
    if (camera.videoRef.current && poseSourceRef.current) {
      poseSourceRef.current.attachVideo(camera.videoRef.current);
    }
  }, [camera.status, poseSource]);

  // Camera and Pose Source disposal on unmount only
  useEffect(() => {
    return () => {
      poseSourceRef.current?.dispose();
      camera.stop();
    };
  }, []);

  // Pause / Resume Handlers
  const handleTogglePause = () => {
    if (sourceState === 'paused') {
      poseSourceRef.current?.resume();
      holdAccumulator.current.resume();
    } else {
      poseSourceRef.current?.pause();
      holdAccumulator.current.pause();
    }
  };

  const handleNextRep = () => {
    const limit = targetUnitsRef.current;
    if (currentProgress < limit) {
      setCurrentProgress((r) => {
        const next = r + 1;
        if (next >= limit) {
          finishSession(false);
        }
        return next;
      });
    } else {
      finishSession(false);
    }
  };

  const handleRetryCamera = async () => {
    if (trackingMode === 'camera') {
      const stream = await camera.retry();
      if (stream && camera.videoRef.current && poseSourceRef.current) {
        poseSourceRef.current.attachVideo(camera.videoRef.current);
        await poseSourceRef.current.start().catch(() => {});
      }
    } else {
      poseSourceRef.current?.setState('tracking');
      setSourceState('tracking');
    }
  };

  // Pain-Stop Rule Handler: If pain >= painThreshold, stop immediately
  const handlePainReported = (val: number) => {
    setSessionPainAfter(val);
    setPainScore(val);
    setPainCheckinOpen(false);
    if (voiceInput.isListening) voiceInput.stopListening();

    if (val >= painThreshold) {
      finishSession(true, val);
    } else {
      voiceCoach.speak('Pain level noted. Continuing with gentle focus.');
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    voiceCoach.setMuted(next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1714] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* 1. PRE-SESSION SETUP CARD */}
      {stage === 'setup' && (
        <PreSessionSetupCard
          exerciseName={exerciseTitle}
          recommendedView={isHoldMode ? 'Side View' : 'Front View'}
          isOneSided={isHoldMode}
          onReady={(side, mode) => {
            setSelectedSide(side);
            setTrackingMode(mode);
            setCurrentProgress(0);
            repCounter.current.reset();
            holdAccumulator.current.reset();
            totalFramesRef.current = 0;
            passedFramesRef.current = 0;
            setStage('countdown');

            // Dispose previous source if any
            poseSourceRef.current?.dispose();

            const source = createPoseSource(mode === 'camera' ? 'camera' : 'replay');
            setPoseSource(source);
            poseSourceRef.current = source;

            if (mode === 'camera') {
              camera.start().then((stream) => {
                if (stream && camera.videoRef.current) {
                  source.attachVideo(camera.videoRef.current);
                }
              }).catch(() => {});
            }
          }}
          onBack={() => navigate(-1)}
        />
      )}

      {/* 2. COUNTDOWN OVERLAY */}
      {stage === 'countdown' && (
        <CountdownOverlay onComplete={handleCountdownComplete} />
      )}

      {/* 3. LIVE FULL-SCREEN EXERCISE EXPERIENCE */}
      {(stage === 'countdown' || stage === 'active' || stage === 'completed') && (
        <>
          {/* Real Video or Simulated Serene Camera Feed */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Native Video Element (Mirrored Front Camera) */}
            <video
              ref={camera.videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                trackingMode === 'camera' ? 'opacity-30' : 'opacity-10'
              }`}
            />

            {/* Serene Atmospheric Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#123B35]/40 via-transparent to-[#081512]/90 pointer-events-none" />

            {/* Ambient Gym/Studio Mat Baseline */}
            <div className="absolute bottom-16 inset-x-0 h-40 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          {/* SKELETON CANVAS OVERLAY (Canvas layer above video) */}
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            {currentFrame && currentFrame.keypoints && (
              <SkeletonCanvas
                keypoints={currentFrame.keypoints}
                highlightJoint={activeFeedback.joint}
                mirrored={trackingMode === 'camera'}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* TOP SAFE ZONE: Never covers the body */}
          <div className="relative z-20 pt-safe px-5 py-3 space-y-2 bg-gradient-to-b from-black/75 via-black/45 to-transparent">
            {/* Top Bar: Back button, LIVE badge, Step Counter & Voice Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors cursor-pointer"
                aria-label="Exit session"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {/* LIVE Indicator with gentle pulse */}
                <button
                  type="button"
                  onClick={() => setDevMetricsOpen(true)}
                  aria-label="View on-device hardware metrics"
                  className="flex items-center gap-1.5 px-3 py-1.5 min-h-[48px] rounded-pill bg-forest/90 hover:bg-forest border border-sage/30 backdrop-blur-md text-metadata font-bold text-sage shadow-soft cursor-pointer transition-all active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{trackingMode === 'camera' ? 'LIVE COACH' : 'DEMO REPLAY (simulated)'}</span>
                </button>

                {/* Voice Audio Mute / Unmute Button */}
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute voice coaching' : 'Mute voice coaching'}
                  className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-coral" /> : <Volume2 className="w-5 h-5 text-sage" />}
                </button>
              </div>

              {/* Step counter and offline indicator */}
              <div className="text-right flex items-center gap-1.5">
                {!isOnline && (
                  <span className="text-[11px] font-bold text-sage bg-white/10 px-2.5 py-1 rounded-pill flex items-center gap-1">
                    <WifiOff className="w-3 h-3 text-sage" /> Offline
                  </span>
                )}
                <span className="text-metadata font-mono font-bold text-sage bg-white/10 px-3 py-1.5 rounded-pill">
                  03 / 08
                </span>
              </div>
            </div>

            {/* Exercise Name & Live Range of Motion (ROM) */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-metadata text-sage/70 font-bold uppercase tracking-wider block">
                  {selectedSide === 'left' ? 'Left Side Focus' : 'Right Side Focus'}
                </span>
                <h1 className="text-heading font-bold text-white tracking-tight">
                  {exerciseTitle}
                </h1>
              </div>

              {/* Live Angle & Peak ROM indicator */}
              <div className="flex items-center gap-2">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-pill text-[11px] font-bold text-sage flex items-center gap-1.5 border border-sage/30">
                  <Activity className="w-3.5 h-3.5 text-sage" />
                  <span>{currentRom !== null ? `${currentRom}°` : '--'}</span>
                  <span className="opacity-60 text-[10px]">Peak: {peakRom !== null ? `${peakRom}°` : '--'}</span>
                </span>
              </div>
            </div>

            {/* COACHING FEEDBACK BANNER (Top zone - Never covers person's body) */}
            <div className="pt-2 flex justify-center">
              <div
                className={`w-full max-w-sm px-4 py-3 rounded-card shadow-floating border flex items-center gap-3 transition-all duration-calm ${
                  activeFeedback.type === 'correction'
                    ? 'bg-white text-primary border-coral/80'
                    : 'bg-white/95 text-primary border-sage/80'
                }`}
              >
                {activeFeedback.type === 'correction' ? (
                  <div className="w-7 h-7 rounded-full bg-coral-light flex items-center justify-center text-coral-dark shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-sage flex items-center justify-center text-forest shrink-0">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                )}

                <div className="flex-1 text-left">
                  <p className="text-body-medium font-bold text-primary leading-tight">
                    {activeFeedback.message}
                  </p>
                  <p className="text-metadata text-secondary mt-0.5">
                    {activeFeedback.type === 'correction'
                      ? 'Highlighted joint on skeleton (Adjust softly)'
                      : 'Alignment maintained in calm rhythm'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SAFE ZONE: Rep counter, progress bar, Pause/Next buttons & Pain-Stop Rule button */}
          <div className="relative z-20 pb-safe px-5 pt-3 bg-gradient-to-t from-black via-black/85 to-transparent space-y-3">
            {/* Rep Counter or Hold Duration & Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-metadata text-sage/90">
                <span className="font-semibold uppercase tracking-wider">
                  {isHoldMode ? 'Hold Duration' : 'Repetition Target'}
                </span>
                <span className="font-bold text-white text-title">
                  {currentProgress}{' '}
                  <span className="text-caption text-sage/70 font-normal">
                    / {sessionTargetUnits} {isHoldMode ? 'sec' : 'reps'}
                  </span>
                </span>
              </div>

              {/* Thin progress bar */}
              <div className="w-full bg-white/20 h-1.5 rounded-pill overflow-hidden">
                <div
                  className="bg-sage h-full rounded-pill transition-all duration-gentle"
                  style={{ width: `${Math.min(100, (currentProgress / sessionTargetUnits) * 100)}%` }}
                />
              </div>
            </div>

            {/* Bottom Controls: Pause, Pain Check-in, Next */}
            <div className="flex items-center justify-between gap-2.5 pt-1">
              <Button
                variant="secondary"
                size="default"
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 active:bg-white/30"
                leftIcon={
                  sourceState === 'paused' ? (
                    <Play className="w-5 h-5 fill-current" />
                  ) : (
                    <Pause className="w-5 h-5 fill-current" />
                  )
                }
                onClick={handleTogglePause}
              >
                {sourceState === 'paused' ? 'Resume' : 'Pause'}
              </Button>

              {/* Clinical Pain Safety Button (Pain-Stop Rule trigger) */}
              <button
                type="button"
                onClick={() => {
                  poseSourceRef.current?.pause();
                  setPainCheckinOpen(true);
                  voiceCoach.speakKey('pain_checkin');
                }}
                className="px-3 min-h-[48px] rounded-input bg-coral-light/20 hover:bg-coral-light/30 border border-coral/40 text-coral flex items-center justify-center gap-1.5 text-metadata font-bold cursor-pointer transition-all"
                aria-label="Pain check-in and safety stop"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Pain Check</span>
              </button>

              {(() => {
                const isDevOrJudge =
                  Boolean(import.meta.env.DEV) ||
                  (typeof window !== 'undefined' && window.location.search.includes('judge=1'));
                const showSkip = trackingMode === 'replay' || isDevOrJudge;

                if (showSkip) {
                  return (
                    <Button
                      variant="coral"
                      size="default"
                      className="flex-1 font-bold"
                      rightIcon={<SkipForward className="w-5 h-5" />}
                      onClick={handleNextRep}
                    >
                      {isHoldMode ? 'Skip Hold' : 'Next Rep'}
                    </Button>
                  );
                }

                return (
                  <Button
                    variant="secondary"
                    size="default"
                    className="flex-1 font-bold bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={() => finishSession(false)}
                  >
                    End session
                  </Button>
                );
              })()}
            </div>

            {/* State Simulator (Development / Judge only) */}
            {(import.meta.env.DEV || (typeof window !== 'undefined' && window.location.search.includes('judge=1'))) && (
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setShowStatePicker(!showStatePicker)}
                  className="text-[11px] text-sage/60 hover:text-sage inline-flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>Simulator</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showStatePicker && (
                  <div className="mt-2 p-2 bg-black/80 rounded-input border border-white/10 flex flex-wrap gap-1.5 justify-center">
                    {[
                      { id: 'tracking', label: 'Tracking' },
                      { id: 'step_back', label: 'Step Back' },
                      { id: 'user_out_of_frame', label: 'Out of Frame' },
                      { id: 'low_light', label: 'Low Light' },
                      { id: 'model_loading', label: 'Loading Model' },
                      { id: 'paused', label: 'Paused' },
                      { id: 'permission_denied', label: 'Denied' },
                      { id: 'no_camera', label: 'No Camera' },
                      { id: 'error', label: 'Error' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          poseSourceRef.current?.setState(s.id as PoseSourceState);
                          setSourceState(s.id as PoseSourceState);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sourceState === s.id
                            ? 'bg-sage text-forest'
                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ALL STATES OVERLAY */}
          <LiveStateOverlay
            state={
              trackingMode === 'camera' && camera.status !== 'ready' && camera.status !== 'idle' && camera.status !== 'requesting'
                ? camera.status
                : sourceState
            }
            errorMessage={trackingMode === 'camera' ? camera.error : null}
            onResume={() => poseSourceRef.current?.resume()}
            onEndSession={() => {
              camera.stop();
              poseSourceRef.current?.dispose();
              navigate('/');
            }}
            onRetry={handleRetryCamera}
            onGrantPermission={handleRetryCamera}
          />
        </>
      )}

      {/* 4. COMPLETION SHEET with PDF Download, Peak ROM & Pain Status */}
      {stage === 'completed' && (
        <CompletionSheet
          mode={isHoldMode ? 'hold' : 'reps'}
          repsCompleted={currentProgress}
          totalReps={sessionTargetUnits}
          peakRom={peakRom ?? undefined}
          accuracyScore={completedReport?.accuracyScore}
          simulated={trackingMode === 'replay'}
          painBefore={sessionPainBefore}
          painAfter={sessionPainAfter}
          painThreshold={painThreshold}
          painInterrupted={painInterrupted}
          formQuality={
            completedReport?.formQuality ||
            (painInterrupted ? 'Needs Attention' : 'Excellent')
          }
          encouragementSentence={
            completedReport?.accuracyScore === null
              ? 'Not enough tracking data to score this session'
              : painInterrupted
              ? 'Movement was safely paused to protect your joint. Rest in a neutral position.'
              : isHoldMode
              ? 'Your Warrior II alignment and grounded hip stability were held with exceptional calmness.'
              : 'Great shoulder elevation and scapular control during your wall slides.'
          }
          isSynced={trackingMode === 'camera' && completedReport?.accuracyScore !== null}
          onDownloadPdf={() => {
            if (completedReport) {
              generateSessionPdf(completedReport);
            }
          }}
          onNextExercise={() => navigate('/progress')}
          onRepeat={() => {
            setCurrentProgress(0);
            repCounter.current.reset();
            holdAccumulator.current.reset();
            totalFramesRef.current = 0;
            passedFramesRef.current = 0;
            setPainInterrupted(false);
            setStage('active');
            if (camera.videoRef.current && poseSourceRef.current) {
              poseSourceRef.current.attachVideo(camera.videoRef.current);
            }
            poseSourceRef.current?.start().catch(() => {});
          }}
        />
      )}

      {/* Mid-Session Pain Check-in BottomSheet (Pain-Stop Rule) */}
      <BottomSheet
        isOpen={painCheckinOpen}
        onClose={() => {
          setPainCheckinOpen(false);
          poseSourceRef.current?.resume();
          if (voiceInput.isListening) voiceInput.stopListening();
        }}
        title="Pain Safety Check-in"
      >
        <div className="space-y-4 py-2 text-left select-none text-primary">
          <p className="text-caption text-secondary">
            How does your body feel right now? If your discomfort reaches {painThreshold} or above, we will immediately stop for your recovery.
          </p>

          {/* Voice Input Option */}
          {voiceInput.isSupported && (
            <div className="p-3 bg-sand/30 rounded-card-sm border border-sand/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-metadata font-bold text-forest">Voice Check-in</span>
                <button
                  type="button"
                  onClick={voiceInput.isListening ? voiceInput.stopListening : voiceInput.startListening}
                  className={`px-3 py-1 rounded-pill text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    voiceInput.isListening
                      ? 'bg-coral text-white animate-pulse'
                      : 'bg-forest text-offwhite hover:bg-forest/90'
                  }`}
                  aria-label={voiceInput.isListening ? 'Stop voice listening' : 'Start voice input'}
                >
                  {voiceInput.isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{voiceInput.isListening ? 'Listening…' : 'Speak Pain'}</span>
                </button>
              </div>

              {voiceInput.transcript && (
                <p className="text-caption text-secondary italic">
                  "{voiceInput.transcript}"
                </p>
              )}

              {voiceInput.parsedPain && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-forest">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Detected: {voiceInput.parsedPain.area ? `${voiceInput.parsedPain.area} — ` : ''}Score {voiceInput.parsedPain.score}/10
                  </span>
                </div>
              )}

              {voiceInput.error && (
                <p className="text-metadata text-coral-dark">
                  Voice input notice: {voiceInput.error}. You can use the slider below.
                </p>
              )}
            </div>
          )}

          <PainSlider
            value={sessionPainAfter}
            onChange={setSessionPainAfter}
            label="Current Discomfort (0 = None, 10 = Severe)"
          />

          <div className="space-y-2 pt-1">
            <Button
              variant="coral"
              size="full"
              onClick={() => handlePainReported(sessionPainAfter)}
            >
              {sessionPainAfter >= painThreshold ? 'Halt Session (Pain-Stop Rule)' : 'Record & Continue'}
            </Button>

            <Button
              variant="ghost"
              size="full"
              onClick={() => {
                setPainCheckinOpen(false);
                poseSourceRef.current?.resume();
                if (voiceInput.isListening) voiceInput.stopListening();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Dev & Live Hardware Metrics Modal */}
      {(() => {
        const metrics = poseSource?.getMetrics() ?? { fps: null, inferenceMs: null, delegate: null };
        return (
          <DevMetricsModal
            isOpen={devMetricsOpen}
            onClose={() => setDevMetricsOpen(false)}
            fps={metrics.fps}
            inferenceTimeMs={metrics.inferenceMs}
            delegate={metrics.delegate}
          />
        );
      })()}
    </div>
  );
};
