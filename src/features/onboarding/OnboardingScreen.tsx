import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ShieldCheck,
  Sparkles,
  Activity,
  HeartHandshake,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  EyeOff,
  WifiOff
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useAppStore, UserGoal } from '@/lib/store';

export const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { userGoal, setUserGoal, setCameraPermission, setIsOnboarded, addToast } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cameraDeniedMode, setCameraDeniedMode] = useState<boolean>(false);

  // Step 1: Languages
  const languages = [
    {
      code: 'en',
      title: 'English',
      subtitle: 'Primary instructions in English',
      native: 'English',
    },
    {
      code: 'hi',
      title: 'Hindi',
      subtitle: 'हिन्दी में निर्देश और मार्गदर्शन',
      native: 'हिन्दी',
    },
    {
      code: 'te',
      title: 'Telugu',
      subtitle: 'తెలుగులో స్పష్టమైన సూచనలు',
      native: 'తెలుగు',
    },
  ];

  // Step 2: Goals
  const goals: { id: UserGoal; title: string; subtitle: string; icon: React.ReactNode; tag: string }[] = [
    {
      id: 'yoga',
      title: 'Mindful Yoga',
      subtitle: 'Gentle flow, breathwork, balance and spinal fluidity.',
      icon: <Sparkles className="w-6 h-6 text-forest" />,
      tag: 'Organic Flow',
    },
    {
      id: 'physio',
      title: 'Physiotherapy & Rehab',
      subtitle: 'Clinical recovery tracks, joint mobility, posture checks.',
      icon: <Activity className="w-6 h-6 text-forest" />,
      tag: 'Structured Clinical',
    },
    {
      id: 'both',
      title: 'Both Yoga & Physio',
      subtitle: 'Balanced healing: therapeutic recovery combined with daily mindful flow.',
      icon: <HeartHandshake className="w-6 h-6 text-forest" />,
      tag: 'Holistic Health',
    },
  ];

  const handleNextFromStep1 = () => {
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    setStep(3);
  };

  const handleAllowCamera = async () => {
    try {
      // Attempt camera access via browser API if supported
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // Stop stream immediately since this is just a permission check during onboarding
          stream.getTracks().forEach((t) => t.stop());
          setCameraPermission('granted');
          addToast({
            title: 'Camera access granted',
            description: 'On-device live coaching is ready.',
            type: 'success',
          });
        } catch {
          // If user clicked deny or device denied
          setCameraPermission('denied');
          setCameraDeniedMode(true);
          return;
        }
      } else {
        setCameraPermission('granted');
      }
      completeOnboarding();
    } catch {
      setCameraPermission('granted');
      completeOnboarding();
    }
  };

  const handleNotNow = () => {
    setCameraPermission('prompt');
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-offwhite p-5 flex flex-col justify-between max-w-md mx-auto select-none pt-safe pb-safe">
      {/* Step Progress Indicators */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2 text-metadata text-secondary font-semibold">
          <span>STEP {step} OF 3</span>
          <span>{step === 1 ? 'Language' : step === 2 ? 'Your Goal' : 'Camera Guidance'}</span>
        </div>
        <div className="flex gap-1.5 w-full">
          <div className={`h-1.5 flex-1 rounded-pill transition-colors duration-calm ${step >= 1 ? 'bg-forest' : 'bg-forest/10'}`} />
          <div className={`h-1.5 flex-1 rounded-pill transition-colors duration-calm ${step >= 2 ? 'bg-forest' : 'bg-forest/10'}`} />
          <div className={`h-1.5 flex-1 rounded-pill transition-colors duration-calm ${step >= 3 ? 'bg-forest' : 'bg-forest/10'}`} />
        </div>
      </div>

      {/* Main Step Content with AnimatePresence */}
      <div className="my-auto py-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: LANGUAGE */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <span className="text-metadata font-bold text-forest uppercase tracking-wider">
                  Welcome to Calm Motion
                </span>
                <h1 className="text-display font-bold text-primary tracking-tight">
                  Choose your language
                </h1>
                <p className="text-body text-secondary">
                  You can change this anytime in your profile settings.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {languages.map((lang) => {
                  const isSelected = i18n.language.startsWith(lang.code);
                  return (
                    <Card
                      key={lang.code}
                      interactive
                      onClick={() => i18n.changeLanguage(lang.code)}
                      className={`p-4 transition-all duration-fast ${
                        isSelected
                          ? 'border-forest bg-sage/25 ring-2 ring-forest shadow-soft'
                          : 'bg-white hover:border-forest/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h3 className="text-title font-bold text-primary">{lang.title}</h3>
                            <span className="text-metadata text-forest font-semibold bg-sage/60 px-2 py-0.5 rounded-pill">
                              {lang.native}
                            </span>
                          </div>
                          <p className="text-caption text-secondary">{lang.subtitle}</p>
                        </div>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-forest text-offwhite' : 'border border-border-subtle bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: GOALS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <span className="text-metadata font-bold text-forest uppercase tracking-wider">
                  Personalized Path
                </span>
                <h1 className="text-display font-bold text-primary tracking-tight">
                  What is your primary goal?
                </h1>
                <p className="text-body text-secondary">
                  We'll tailor your daily session cards and recovery progress.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {goals.map((g) => {
                  const isSelected = userGoal === g.id;
                  return (
                    <Card
                      key={g.id}
                      interactive
                      onClick={() => setUserGoal(g.id)}
                      className={`p-4 transition-all duration-fast ${
                        isSelected
                          ? 'border-forest bg-sage/25 ring-2 ring-forest shadow-soft'
                          : 'bg-white hover:border-forest/30'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-sage/50 flex items-center justify-center shrink-0 mt-0.5">
                          {g.icon}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-title font-bold text-primary">{g.title}</h3>
                            <span className="text-[11px] font-semibold text-forest bg-sage/60 px-2 py-0.5 rounded-pill">
                              {g.tag}
                            </span>
                          </div>
                          <p className="text-caption text-secondary">{g.subtitle}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: CAMERA PERMISSION & PRIVACY */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {!cameraDeniedMode ? (
                <>
                  <div className="text-center space-y-2">
                    <div className="w-20 h-20 rounded-full bg-sage/60 text-forest mx-auto flex items-center justify-center shadow-soft mb-2">
                      <ShieldCheck className="w-10 h-10 stroke-[1.75]" />
                    </div>
                    <span className="text-metadata font-bold text-forest uppercase tracking-wider">
                      On-Device Motion Coach
                    </span>
                    <h1 className="text-display font-bold text-primary tracking-tight">
                      Camera Guidance & Privacy
                    </h1>
                    <p className="text-body text-secondary max-w-sm mx-auto leading-relaxed">
                      "Your camera helps us guide your movement. Your video never leaves this phone."
                    </p>
                  </div>

                  {/* Privacy features */}
                  <div className="bg-white rounded-card p-4 border border-border-subtle shadow-card space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sage/40 flex items-center justify-center text-forest shrink-0">
                        <EyeOff className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-caption-medium font-bold text-primary block">Private On-Device Processing</span>
                        <span className="text-metadata text-secondary block">Camera video is processed on the device and is never uploaded. Only summary metrics are sent to the clinic when joined and online.</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sage/40 flex items-center justify-center text-forest shrink-0">
                        <WifiOff className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-caption-medium font-bold text-primary block">Works Offline</span>
                        <span className="text-metadata text-secondary block">Works offline; syncs when back online.</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* CAMERA DENIED STATE WITH SIMPLE FIX STEPS */
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-coral/20 text-coral-dark mx-auto flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="text-center space-y-1">
                    <h2 className="text-heading font-bold text-primary">Camera Access is Blocked</h2>
                    <p className="text-caption text-secondary">
                      Without the camera, live joint feedback is paused, but all exercises and timers remain accessible.
                    </p>
                  </div>

                  <Card variant="sand" className="p-4 space-y-2.5 text-left">
                    <h4 className="text-caption-medium font-bold text-primary flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-forest" />
                      How to enable camera on your phone:
                    </h4>
                    <ol className="text-caption text-secondary space-y-1.5 list-decimal list-inside">
                      <li>Tap the <strong>Site Settings</strong> or <strong>Lock icon</strong> in your browser address bar.</li>
                      <li>Select <strong>Permissions</strong> → <strong>Camera</strong>.</li>
                      <li>Switch to <strong>Allow</strong> and refresh the page.</li>
                    </ol>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Button Area: ONE Primary Button Per Step */}
      <div className="pt-4 border-t border-border-subtle/80 space-y-2">
        {step === 1 && (
          <Button
            variant="primary"
            size="full"
            rightIcon={<ArrowRight className="w-5 h-5" />}
            onClick={handleNextFromStep1}
          >
            Continue
          </Button>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <Button
              variant="primary"
              size="full"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={handleNextFromStep2}
            >
              Confirm Goal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2.5">
            {!cameraDeniedMode ? (
              <>
                <Button
                  variant="coral"
                  size="full"
                  onClick={handleAllowCamera}
                >
                  Allow Camera
                </Button>
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full text-secondary"
                  onClick={handleNotNow}
                >
                  Not now, explore first
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="full"
                  onClick={handleAllowCamera}
                >
                  I've Enabled It — Retry
                </Button>
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full"
                  onClick={completeOnboarding}
                >
                  Continue without camera
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
