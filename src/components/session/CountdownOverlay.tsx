import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CountdownOverlayProps {
  onComplete: () => void;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete }) => {
  const steps = ['Ready', '3', '2', '1', 'Start'];
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex < steps.length - 1) {
      const duration = stepIndex === 0 ? 1100 : 900;
      const timer = setTimeout(() => {
        setStepIndex((i) => i + 1);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [stepIndex, steps.length, onComplete]);

  const currentText = steps[stepIndex];
  const isStart = currentText === 'Start';
  const isReady = currentText === 'Ready';

  return (
    <div className="fixed inset-0 z-50 bg-[#0E1B18]/90 backdrop-blur-md flex flex-col items-center justify-center select-none pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentText}
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.25, y: -10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center px-6"
        >
          {isReady && (
            <span className="text-metadata font-bold text-sage/80 uppercase tracking-widest mb-2">
              Set Your Stance
            </span>
          )}

          <div
            className={`flex items-center justify-center rounded-full font-bold shadow-floating ${
              isStart
                ? 'w-48 h-48 bg-coral text-primary text-display'
                : isReady
                ? 'w-44 h-44 bg-forest border-2 border-sage/40 text-sage text-heading'
                : 'w-40 h-40 bg-forest/80 border border-sage/30 text-white text-[72px]'
            }`}
          >
            <span>{currentText}</span>
          </div>

          <p className="text-caption text-sage/70 mt-6 max-w-xs">
            {isReady
              ? 'Stand centered in the camera frame'
              : isStart
              ? 'Begin smooth, steady movement'
              : 'Calm breath, preparing tracking'}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
