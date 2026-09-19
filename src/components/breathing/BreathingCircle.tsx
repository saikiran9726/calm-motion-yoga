import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface BreathingCircleProps {
  inhaleSec?: number;
  holdSec?: number;
  exhaleSec?: number;
  cue?: string;
  className?: string;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  inhaleSec = 4,
  holdSec = 2,
  exhaleSec = 4,
  cue = 'Slow, gentle breaths in harmony with your movement.',
  className = '',
}) => {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [countdown, setCountdown] = useState<number>(inhaleSec);

  useEffect(() => {
    let currentPhase: BreathPhase = 'inhale';
    let timeLeft = inhaleSec;

    const timer = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = holdSec > 0 ? 'hold' : 'exhale';
          timeLeft = currentPhase === 'hold' ? holdSec : exhaleSec;
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          timeLeft = exhaleSec;
        } else {
          currentPhase = 'inhale';
          timeLeft = inhaleSec;
        }
        setPhase(currentPhase);
      }
      setCountdown(timeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [inhaleSec, holdSec, exhaleSec]);

  const phaseDetails = {
    inhale: { label: 'Inhale Gently', sub: 'Expand chest & lengthen', scale: 1.3, bg: 'bg-sage/70' },
    hold: { label: 'Hold & Settle', sub: 'Retain softness within', scale: 1.3, bg: 'bg-sand/60' },
    exhale: { label: 'Exhale Slowly', sub: 'Release all tension down', scale: 0.9, bg: 'bg-lavender/70' },
  };

  const current = phaseDetails[phase];

  return (
    <div className={`flex flex-col items-center justify-center p-5 bg-white/70 rounded-card border border-border-subtle shadow-card text-center ${className}`}>
      <span className="text-metadata font-bold text-forest uppercase tracking-wider mb-3">
        Guided Breath Rhythm
      </span>

      {/* Animated breathing circle */}
      <div className="relative w-40 h-40 flex items-center justify-center my-3">
        {/* Outer expanding halo */}
        <motion.div
          animate={{ scale: current.scale }}
          transition={{ duration: phase === 'hold' ? 0 : phase === 'inhale' ? inhaleSec : exhaleSec, ease: 'easeInOut' }}
          className={`absolute w-32 h-32 rounded-full ${current.bg} opacity-50 blur-sm`}
        />

        {/* Middle ring */}
        <motion.div
          animate={{ scale: current.scale }}
          transition={{ duration: phase === 'hold' ? 0 : phase === 'inhale' ? inhaleSec : exhaleSec, ease: 'easeInOut' }}
          className="w-28 h-28 rounded-full bg-forest/10 border-2 border-forest/20 flex flex-col items-center justify-center shadow-soft relative z-10"
        >
          <span className="text-display font-bold text-forest leading-none">
            {countdown}s
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-forest/80 mt-1">
            {phase}
          </span>
        </motion.div>
      </div>

      <div className="mt-2 space-y-0.5">
        <h4 className="text-body-medium font-bold text-primary">{current.label}</h4>
        <p className="text-caption text-secondary max-w-xs">{current.sub}</p>
      </div>

      {cue && (
        <p className="text-metadata text-secondary/80 mt-3 pt-3 border-t border-border-subtle/80 italic">
          "{cue}"
        </p>
      )}
    </div>
  );
};
