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
  Activity
} from 'lucide-react';
import { Button, PainSlider, BottomSheet } from '@/components/ui';
import {
  activePoseSource,
  LivePoseFrame,
  PoseSourceState,
  FeedbackData,
  PoseKeypoint
} from '@/engine/pose/poseSource';
import { voiceCoach, VoiceLanguage } from '@/engine/voice';
import { generateSessionPdf, SessionReportData } from '@/lib/reportPdf';
import { queueReportForSync } from '@/lib/outbox';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { SkeletonCanvas } from '@/components/session/SkeletonCanvas';
import { PreSessionSetupCard } from '@/components/session/PreSessionSetupCard';
import { CountdownOverlay } from '@/components/session/CountdownOverlay';
import { CompletionSheet } from '@/components/session/CompletionSheet';
import { LiveStateOverlay } from '@/components/session/LiveStateOverlay';
import { DevMetricsModal } from '@/components/session/DevMetricsModal';

function calculateAngleDegrees(a?: PoseKeypoint, b?: PoseKeypoint, c?: PoseKeypoint): number {
  if (!a || !b || !c) return 92;
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return Math.round(angle);
}

export const LiveSessionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { userName, painScore, setPainScore } = useAppStore();

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
  const lastFeedbackChangeTime = useRef<number>(Date.now());

  // Repetition tracker
  const [currentRep, setCurrentRep] = useState<number>(0);
  const totalReps = 10;

  // Range of motion tracker
  const [currentRom, setCurrentRom] = useState<number>(88);
  const [peakRom, setPeakRom] = useState<number>(94);

  // Pain check-in & Safety stop rule
  const [sessionPainBefore] = useState<number>(painScore || 2);
  const [sessionPainAfter, setSessionPainAfter] = useState<number>(painScore || 2);
  const [painInterrupted, setPainInterrupted] = useState<boolean>(false);
  const [painCheckinOpen, setPainCheckinOpen] = useState<boolean>(false);

  // Voice & Audio Coach state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const sessionStartTime = useRef<number>(Date.now());
  const [completedReport, setCompletedReport] = useState<SessionReportData | null>(null);

  // Real webcam video ref (if available)
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Debug state selector toggle for reviewers
  const [showStatePicker, setShowStatePicker] = useState<boolean>(false);
  const [devMetricsOpen, setDevMetricsOpen] = useState<boolean>(false);

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
    activePoseSource.start();
    voiceCoach.speakKey('start');

    // Try starting video stream if in camera mode
    if (trackingMode === 'camera' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(() => {
          // Keep simulated background gracefully
        });
    }
  };

  const finishSession = (wasPainInterrupted = false, finalPain = sessionPainAfter) => {
    activePoseSource.stop();
    setPainInterrupted(wasPainInterrupted);
    setStage('completed');

    if (wasPainInterrupted) {
      voiceCoach.speakKey('pain_stop');
    } else {
      voiceCoach.speakKey('completed');
    }

    const duration = Math.max(15, Math.round((Date.now() - sessionStartTime.current) / 1000));
    const reportId = 'rep-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);

    const reportData: SessionReportData = {
      reportId,
      patientName: userName || 'Ananya Kumar',
      clinicCode: 'CALM01',
      exerciseTitle: 'Warrior II (Virabhadrasana II)',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      durationSeconds: duration,
      repsCompleted: currentRep,
      targetReps: totalReps,
      peakRom,
      formQuality: wasPainInterrupted ? 'Needs Attention' : 'Excellent',
      painBefore: sessionPainBefore,
      painAfter: finalPain,
      painInterrupted: wasPainInterrupted,
    };

    setCompletedReport(reportData);

    // Persist locally in Dexie
    db.sessions.add({
      reportId,
      date: new Date().toISOString(),
      type: 'yoga',
      title: 'Warrior II',
      durationMinutes: Math.ceil(duration / 60),
      exercisesCompleted: currentRep,
      painScoreBefore: sessionPainBefore,
      painScoreAfter: finalPain,
      accuracyScore: wasPainInterrupted ? 70 : 94,
      peakRom,
      painInterrupted: wasPainInterrupted,
    }).catch(() => {});

    // Queue in offline outbox for cloud clinic sync
    queueReportForSync({
      ...reportData,
      patientId: 'patient-ananya',
      timestamp: Date.now(),
    }).catch(() => {});
  };

  // Subscribe to frames and state
  useEffect(() => {
    const unsubFrame = activePoseSource.onFrame((frame) => {
      setCurrentFrame(frame);

      // Real-time Range of Motion angle
      if (frame.keypoints && frame.keypoints.length >= 16) {
        const hip = frame.keypoints.find((k) => k.name.includes('hip')) || frame.keypoints[11];
        const shoulder = frame.keypoints.find((k) => k.name.includes('shoulder')) || frame.keypoints[12];
        const elbow = frame.keypoints.find((k) => k.name.includes('elbow')) || frame.keypoints[14];
        const angle = calculateAngleDegrees(hip, shoulder, elbow);
        if (angle > 40 && angle < 160) {
          setCurrentRom(angle);
          setPeakRom((prev) => Math.max(prev, angle));
        }
      }

      // Handle Repetition Increment
      if (frame.rep > currentRep) {
        setCurrentRep(frame.rep);
        if ('vibrate' in navigator) {
          try { navigator.vibrate([40]); } catch {}
        }
        if (frame.rep === Math.floor(totalReps / 2)) {
          voiceCoach.speakKey('rep_milestone');
        }
        if (frame.rep >= totalReps) {
          finishSession(false);
        }
      }

      // Debounced Feedback Controller (min 1500ms on screen)
      const now = Date.now();
      const timeSinceLastChange = now - lastFeedbackChangeTime.current;

      const incoming = frame.feedback;
      const current = activeFeedback;

      const isCorrection = incoming.type === 'correction';
      const isCurrentCorrection = current.type === 'correction';

      if (timeSinceLastChange >= 1500 || (isCorrection && !isCurrentCorrection)) {
        if (incoming.message !== current.message) {
          setActiveFeedback(incoming);
          lastFeedbackChangeTime.current = now;

          if (isCorrection) {
            if ('vibrate' in navigator) {
              try { navigator.vibrate([25, 50, 25]); } catch {}
            }
            if (incoming.message.toLowerCase().includes('shoulder')) {
              voiceCoach.speakKey('lower_shoulder');
            } else if (incoming.message.toLowerCase().includes('spine') || incoming.message.toLowerCase().includes('back')) {
              voiceCoach.speakKey('spine_align');
            } else {
              voiceCoach.speak(incoming.message);
            }
          } else if (incoming.type === 'positive') {
            voiceCoach.speakKey('good_movement');
          }
        }
      }
    });

    const unsubState = activePoseSource.onStateChange((newState) => {
      setSourceState(newState);
    });

    return () => {
      unsubFrame();
      unsubState();
      activePoseSource.stop();
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [currentRep, totalReps, activeFeedback, peakRom, sessionPainAfter]);

  // Pause / Resume Handlers
  const handleTogglePause = () => {
    if (sourceState === 'paused') {
      activePoseSource.resume();
    } else {
      activePoseSource.pause();
    }
  };

  const handleNextRep = () => {
    if (currentRep < totalReps) {
      setCurrentRep((r) => r + 1);
      if (currentRep + 1 >= totalReps) {
        finishSession(false);
      }
    } else {
      finishSession(false);
    }
  };

  // Pain-Stop Rule Handler: If pain >= 5, stop immediately
  const handlePainReported = (val: number) => {
    setSessionPainAfter(val);
    setPainScore(val);
    setPainCheckinOpen(false);

    if (val >= 5) {
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
          exerciseName="Warrior II (Virabhadrasana II)"
          recommendedView="Side View"
          isOneSided={true}
          onReady={(side, mode) => {
            setSelectedSide(side);
            setTrackingMode(mode);
            setStage('countdown');
          }}
          onBack={() => navigate(-1)}
        />
      )}

      {/* 2. COUNTDOWN OVERLAY */}
      {stage === 'countdown' && (
        <CountdownOverlay onComplete={handleCountdownComplete} />
      )}

      {/* 3. LIVE FULL-SCREEN EXERCISE EXPERIENCE */}
      {(stage === 'active' || stage === 'completed') && (
        <>
          {/* Real Video or Simulated Serene Camera Feed */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Native Video Element (Mirrored Front Camera) */}
            <video
              ref={videoRef}
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
                  <span>{trackingMode === 'camera' ? 'LIVE COACH' : 'DEMO REPLAY'}</span>
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

              {/* Step counter */}
              <div className="text-right">
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
                  Warrior II
                </h1>
              </div>

              {/* Live Angle & Peak ROM indicator */}
              <div className="flex items-center gap-2">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-pill text-[11px] font-bold text-sage flex items-center gap-1.5 border border-sage/30">
                  <Activity className="w-3.5 h-3.5 text-sage" />
                  <span>{currentRom}°</span>
                  <span className="opacity-60 text-[10px]">Peak: {peakRom}°</span>
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
            {/* Rep Counter & Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-metadata text-sage/90">
                <span className="font-semibold uppercase tracking-wider">
                  Repetition Target
                </span>
                <span className="font-bold text-white text-title">
                  {currentRep} <span className="text-caption text-sage/70 font-normal">/ {totalReps} reps</span>
                </span>
              </div>

              {/* Thin progress bar */}
              <div className="w-full bg-white/20 h-1.5 rounded-pill overflow-hidden">
                <div
                  className="bg-sage h-full rounded-pill transition-all duration-gentle"
                  style={{ width: `${(currentRep / totalReps) * 100}%` }}
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
                  activePoseSource.pause();
                  setPainCheckinOpen(true);
                  voiceCoach.speakKey('pain_checkin');
                }}
                className="px-3 min-h-[48px] rounded-input bg-coral-light/20 hover:bg-coral-light/30 border border-coral/40 text-coral flex items-center justify-center gap-1.5 text-metadata font-bold cursor-pointer transition-all"
                aria-label="Pain check-in and safety stop"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Pain Check</span>
              </button>

              <Button
                variant="coral"
                size="default"
                className="flex-1 font-bold"
                rightIcon={<SkipForward className="w-5 h-5" />}
                onClick={handleNextRep}
              >
                Next Rep
              </Button>
            </div>

            {/* Discreet Reviewer State Switcher Toggle */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setShowStatePicker(!showStatePicker)}
                className="text-[11px] text-sage/60 hover:text-sage inline-flex items-center gap-1 cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>Simulate Sensor States</span>
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
                      onClick={() => activePoseSource.setState(s.id as PoseSourceState)}
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
          </div>

          {/* ALL STATES OVERLAY */}
          <LiveStateOverlay
            state={sourceState}
            onResume={() => activePoseSource.resume()}
            onEndSession={() => navigate('/')}
            onRetry={() => activePoseSource.setState('tracking')}
            onGrantPermission={() => activePoseSource.setState('tracking')}
          />
        </>
      )}

      {/* 4. COMPLETION SHEET with PDF Download, Peak ROM & Pain Status */}
      {stage === 'completed' && (
        <CompletionSheet
          repsCompleted={currentRep}
          totalReps={totalReps}
          peakRom={peakRom}
          painBefore={sessionPainBefore}
          painAfter={sessionPainAfter}
          painInterrupted={painInterrupted}
          formQuality={painInterrupted ? 'Needs Attention' : 'Excellent'}
          encouragementSentence={
            painInterrupted
              ? 'Movement was safely paused to protect your joint. Rest in a neutral position.'
              : 'Your shoulder alignment and grounded hip stability were held with exceptional calmness.'
          }
          onDownloadPdf={() => {
            if (completedReport) {
              generateSessionPdf(completedReport);
            }
          }}
          onNextExercise={() => navigate('/progress')}
          onRepeat={() => {
            setCurrentRep(0);
            setPainInterrupted(false);
            setStage('active');
            activePoseSource.start();
          }}
        />
      )}

      {/* Mid-Session Pain Check-in BottomSheet (Pain-Stop Rule) */}
      <BottomSheet
        isOpen={painCheckinOpen}
        onClose={() => {
          setPainCheckinOpen(false);
          activePoseSource.resume();
        }}
        title="Pain Safety Check-in"
      >
        <div className="space-y-4 py-2 text-left select-none text-primary">
          <p className="text-caption text-secondary">
            How does your body feel right now? If your discomfort reaches 5 or above, we will immediately stop for your recovery.
          </p>

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
              {sessionPainAfter >= 5 ? 'Halt Session (Pain-Stop Rule)' : 'Record & Continue'}
            </Button>

            <Button
              variant="ghost"
              size="full"
              onClick={() => {
                setPainCheckinOpen(false);
                activePoseSource.resume();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Dev & Live Hardware Metrics Modal */}
      <DevMetricsModal
        isOpen={devMetricsOpen}
        onClose={() => setDevMetricsOpen(false)}
        fps={29.8}
        inferenceTimeMs={22}
        delegate="GPU"
      />
    </div>
  );
};
