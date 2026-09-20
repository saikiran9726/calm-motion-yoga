import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  WifiOff,
  Check,
  Smartphone
} from 'lucide-react';
import { Button, Card, ProgressRing, BottomSheet } from '@/components/ui';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAppStore, BodyFeeling } from '@/lib/store';

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { todayFeeling, setTodayFeeling, userName } = useAppStore();

  const [setupSheetOpen, setSetupSheetOpen] = useState(false);
  const [judgeSheetOpen, setJudgeSheetOpen] = useState(false);

  // Dynamic greeting by time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const feelings: { id: BodyFeeling; label: string; emoji: string }[] = [
    { id: 'great', label: t('home.feeling_great', 'Great'), emoji: '🌱' },
    { id: 'okay', label: t('home.feeling_okay', 'Okay'), emoji: '🌤️' },
    { id: 'sore', label: t('home.feeling_sore', 'Sore'), emoji: '🩹' },
  ];

  // Mon-Sun row with actual check icon markers (not color alone!)
  const weekDays = [
    { day: 'Mon', done: true },
    { day: 'Tue', done: true },
    { day: 'Wed', done: true },
    { day: 'Thu', done: true },
    { day: 'Fri', done: false },
    { day: 'Sat', done: false },
    { day: 'Sun', done: false },
  ];

  return (
    <div className="p-5 space-y-6 select-none">
      {/* Top Header: Greeting, User Name, Offline Badge, Language Switcher */}
      <div className="flex items-start justify-between pt-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-metadata font-semibold text-secondary uppercase tracking-wider">
              {getGreeting()}
            </span>
            {/* Quiet "Works offline" badge */}
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-forest/90 bg-sage/50 px-2 py-0.5 rounded-pill">
              <WifiOff className="w-3 h-3 text-forest" />
              Works offline
            </span>
          </div>
          <h1 className="text-display font-bold text-primary tracking-tight">
            {userName}, Nourish Your Body
          </h1>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Judge & Reviewer Quick Guide Banner */}
      <div className="p-3.5 bg-sage/30 rounded-card-sm border border-sage/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🏆</span>
          <div>
            <span className="text-caption font-bold text-forest block">Hackathon Evaluator Guide</span>
            <span className="text-[11px] text-secondary">60-second test flows & demo modes</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setJudgeSheetOpen(true)}
          className="px-3 py-1 text-metadata font-bold text-forest bg-white rounded-pill shadow-soft border border-forest/20 hover:bg-forest/5"
        >
          Quick Guide
        </button>
      </div>

      {/* Check-in prompt: How is your body feeling today? */}
      <Card variant="sand" className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest" />
            <h2 className="text-caption-medium font-semibold text-primary">
              {t('home.howAreYou', 'How is your body feeling today?')}
            </h2>
          </div>
          {todayFeeling && (
            <span className="text-metadata text-forest font-bold bg-white/70 px-2.5 py-0.5 rounded-pill">
              Logged
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {feelings.map((f) => {
            const isSelected = todayFeeling === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setTodayFeeling(f.id)}
                className={`h-15 min-h-[58px] rounded-input border transition-all duration-fast flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'bg-forest text-offwhite border-forest shadow-soft scale-[1.02]'
                    : 'bg-white text-primary border-border-subtle hover:border-forest/30'
                }`}
                aria-label={`Feeling ${f.label}`}
              >
                <span className="text-xl leading-none">{f.emoji}</span>
                <span className="text-caption-medium font-medium mt-1">{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Gentle suggestion if Sore */}
        {todayFeeling === 'sore' && (
          <div className="p-3 bg-white/80 rounded-input border border-border-subtle text-caption text-primary flex items-start gap-2.5 mt-2">
            <span className="text-base leading-none">🍃</span>
            <div className="text-left">
              <span className="font-bold block">Gentle flow recommended</span>
              <span className="text-secondary text-metadata block mt-0.5">
                We've adjusted today's session with soft spinal unwinding and lower joint load.
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* TODAY'S SESSION (Hero Card - Tap 1 of 2 to start) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-metadata font-bold text-secondary uppercase tracking-wider">
            {t('home.todaySession', "Today's Session")}
          </span>
          <span className="inline-flex items-center gap-1.5 text-metadata font-semibold text-forest bg-sage/60 px-2.5 py-0.5 rounded-pill">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            Live Motion Coach
          </span>
        </div>

        <Card variant="forest" className="relative overflow-hidden space-y-5 p-6 shadow-floating">
          {/* Subtle curved background SVG aesthetic */}
          <div className="absolute -right-6 -bottom-6 w-48 h-48 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="48" />
            </svg>
          </div>

          <div className="space-y-1.5 relative z-10">
            <span className="text-metadata font-semibold text-sage/80 tracking-wide uppercase">
              Physiotherapy & Morning Flow
            </span>
            <h3 className="text-display text-white font-bold leading-tight">
              {todayFeeling === 'sore' ? 'Gentle Restorative Flow' : t('home.sessionTitle', 'Morning Mobility')}
            </h3>
            <p className="text-caption text-sage/90">
              {todayFeeling === 'sore' ? '10 min • 4 restorative movements' : t('home.sessionMeta', '12 min • 6 exercises')}
            </p>
          </div>

          {/* TAP 1: Opens Quick Pre-Session Sheet */}
          <div className="relative z-10 pt-1">
            <Button
              variant="coral"
              size="full"
              rightIcon={<Play className="w-5 h-5 fill-current" />}
              onClick={() => setSetupSheetOpen(true)}
            >
              {t('home.startSession', 'Start Session')}
            </Button>
          </div>

          <div className="flex items-center justify-between text-metadata text-sage/80 pt-1 border-t border-white/10 relative z-10">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sage" />
              On-device camera guidance
            </span>
            <span>2 taps to exercise</span>
          </div>
        </Card>
      </div>

      {/* YOUR PROGRESS: Weekly Consistency & Mon-Sun row with actual check icons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-metadata font-bold text-secondary uppercase tracking-wider">
            {t('home.yourProgress', 'Your Progress')}
          </span>
          <button
            type="button"
            onClick={() => navigate('/progress')}
            className="text-metadata font-semibold text-forest hover:underline inline-flex items-center"
          >
            View all <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <Card variant="default" className="p-5 flex items-center justify-between shadow-card">
          <div className="space-y-3 flex-1 pr-4">
            <div>
              <h4 className="text-body-medium font-semibold text-primary">
                {t('home.consistency', 'Weekly Consistency')}
              </h4>
              <p className="text-caption text-secondary">4 of 5 scheduled days achieved</p>
            </div>

            {/* Mon-Sun row with actual check icon markers (not color alone!) */}
            <div className="flex items-center gap-1.5 pt-1">
              {weekDays.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-metadata font-bold transition-colors ${
                      item.done
                        ? 'bg-forest text-offwhite shadow-soft'
                        : 'bg-forest/5 text-secondary border border-border-subtle'
                    }`}
                  >
                    {item.done ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <span className="text-[10px] text-secondary">•</span>
                    )}
                  </div>
                  <span className="text-[10px] text-secondary font-medium">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <ProgressRing value={72} size={84} strokeWidth={8} variant="forest">
            <span className="text-base font-bold text-forest">72%</span>
          </ProgressRing>
        </Card>
      </div>

      {/* Quick Access to Recovery & Practices */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Card
          variant="sage"
          interactive
          onClick={() => navigate('/physio/recovery')}
          className="p-4 space-y-1"
        >
          <span className="text-[11px] font-bold text-forest uppercase tracking-wider block">Clinical</span>
          <h4 className="text-body-medium font-bold text-primary">My Recovery</h4>
          <p className="text-metadata text-secondary">Shoulder Mobility • W3</p>
        </Card>

        <Card
          variant="sand"
          interactive
          onClick={() => navigate('/explore')}
          className="p-4 space-y-1"
        >
          <span className="text-[11px] font-bold text-forest uppercase tracking-wider block">Explore</span>
          <h4 className="text-body-medium font-bold text-primary">Pose Library</h4>
          <p className="text-metadata text-secondary">8 Mindful Yoga Poses</p>
        </Card>
      </div>

      {/* PRE-SESSION BOTTOM SHEET (Tap 2 to start exercise) */}
      <BottomSheet
        isOpen={setupSheetOpen}
        onClose={() => setSetupSheetOpen(false)}
        title="Session Setup"
      >
        <div className="space-y-4 py-1 select-none">
          <div className="flex items-center gap-3 p-3.5 rounded-card-sm bg-sage/30 border border-sage/50">
            <Smartphone className="w-7 h-7 text-forest shrink-0" />
            <div>
              <h4 className="text-body-medium font-bold text-primary">Position Your Device</h4>
              <p className="text-caption text-secondary">
                Prop phone at hip height ~6 feet away so your full body is visible.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-card-sm bg-sand/30 border border-sand/50 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-forest shrink-0" />
            <p className="text-caption text-secondary">
              Camera video is processed on the device and is never uploaded. Only summary metrics are sent to the clinic when joined and online.
            </p>
          </div>

          {/* TAP 2: Navigates immediately to Live Exercise Screen */}
          <div className="pt-2">
            <Button
              variant="coral"
              size="full"
              rightIcon={<Play className="w-5 h-5 fill-current" />}
              onClick={() => {
                setSetupSheetOpen(false);
                navigate('/session');
              }}
            >
              Begin Live Motion Coach
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* JUDGE & EVALUATOR WELCOME SHEET */}
      <BottomSheet
        isOpen={judgeSheetOpen}
        onClose={() => setJudgeSheetOpen(false)}
        title="Evaluator Fast-Track Guide"
      >
        <div className="space-y-4 py-1 select-none text-left">
          <p className="text-caption text-secondary">
            Welcome judges! Test our live edge AI motion tracking, cloud therapist sync, and clinical safeguards in under 60 seconds:
          </p>

          <div className="space-y-2.5">
            <div className="p-3.5 bg-forest/5 rounded-card-sm border border-border-subtle flex items-start gap-3">
              <span className="text-lg">1️⃣</span>
              <div>
                <strong className="text-caption font-bold text-primary block">Test Live Motion Coach</strong>
                <p className="text-metadata text-secondary mt-0.5">
                  Choose <em>Camera Mode</em> for on-device tracking, or <em>Recorded Replay</em> if evaluating without a camera.
                </p>
                <div className="pt-2">
                  <Button
                    variant="coral"
                    size="default"
                    className="text-metadata py-1.5 h-auto"
                    onClick={() => {
                      setJudgeSheetOpen(false);
                      navigate('/session');
                    }}
                  >
                    Try Live Coaching
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-forest/5 rounded-card-sm border border-border-subtle flex items-start gap-3">
              <span className="text-lg">2️⃣</span>
              <div>
                <strong className="text-caption font-bold text-primary block">Supervision Clinic Portal (/clinic)</strong>
                <p className="text-metadata text-secondary mt-0.5">
                  {import.meta.env.VITE_DEMO_MODE === "true" ? (
                    <>
                      Demo Passcode: <code className="font-mono font-bold text-forest">CALM2026</code>. Live 5s polling, patient cohort, program adjustment, and demo seed data.
                    </>
                  ) : (
                    t("home.askAdminPasscode", "Ask your clinic administrator for the passcode.")
                  )}
                </p>
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="default"
                    className="text-metadata py-1.5 h-auto"
                    onClick={() => {
                      setJudgeSheetOpen(false);
                      navigate('/clinic');
                    }}
                  >
                    Open Clinic Dashboard
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-forest/5 rounded-card-sm border border-border-subtle flex items-start gap-3">
              <span className="text-lg">3️⃣</span>
              <div>
                <strong className="text-caption font-bold text-primary block">Prototype Transparency & Limits</strong>
                <p className="text-metadata text-secondary mt-0.5">
                  Complete technical breakdown of on-device edge processing, privacy guarantees, and current hardware boundaries.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setJudgeSheetOpen(false);
                      navigate('/about');
                    }}
                    className="text-metadata font-bold text-forest underline cursor-pointer"
                  >
                    Read About This Prototype →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="full"
            onClick={() => setJudgeSheetOpen(false)}
          >
            Close Guide
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
