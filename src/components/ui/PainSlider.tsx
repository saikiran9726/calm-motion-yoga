import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface PainSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}

export const PainSlider: React.FC<PainSliderProps> = ({
  value,
  onChange,
  label = 'Pain level today',
  className,
}) => {
  const getPainDescription = (val: number) => {
    if (val === 0) return { text: 'No pain', sub: 'Movement feels completely free' };
    if (val <= 3) return { text: 'Mild', sub: 'Noticeable but comfortable to move' };
    if (val <= 6) return { text: 'Moderate', sub: 'Tender; gentler movements advised' };
    if (val <= 8) return { text: 'Significant', sub: 'Take gentle care, do not push' };
    return { text: 'Intense', sub: 'Stop or rest if experiencing acute pain' };
  };

  const currentDesc = getPainDescription(value);

  // Calculate gentle background accent color based on pain level
  const getAccentColor = (val: number) => {
    if (val === 0) return 'bg-sage/50 text-forest';
    if (val <= 3) return 'bg-sage text-forest';
    if (val <= 6) return 'bg-sand text-primary';
    return 'bg-coral-light text-forest';
  };

  return (
    <div className={cn('w-full bg-white rounded-card p-5 border border-border-subtle shadow-card', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-body-medium font-semibold text-primary block">{label}</span>
          <span className="text-metadata text-secondary block mt-0.5">{currentDesc.sub}</span>
        </div>
        <div
          className={cn(
            'h-10 min-w-[56px] px-3.5 rounded-pill flex items-center justify-center font-bold text-heading transition-colors duration-calm',
            getAccentColor(value)
          )}
        >
          <span className="text-base font-semibold mr-1">Level</span>
          <span>{value}</span>
        </div>
      </div>

      <div className="relative py-3">
        {/* Custom Track */}
        <div className="relative h-3 w-full rounded-pill bg-forest/5 overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 bottom-0 rounded-pill bg-forest transition-all"
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>

        {/* Real Native Range Input layered on top with opacity for seamless mobile drag */}
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none z-10"
          aria-label={label}
        />

        {/* Custom Visual Thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-forest border-4 border-white shadow-floating pointer-events-none flex items-center justify-center"
          animate={{ left: `${(value / 10) * 100}%` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <div className="w-2 h-2 rounded-full bg-offwhite" />
        </motion.div>
      </div>

      {/* Numerical Markers */}
      <div className="flex justify-between items-center px-1 text-metadata text-secondary mt-1">
        <span>0 (None)</span>
        <span>5 (Moderate)</span>
        <span>10 (Severe)</span>
      </div>

      {/* Discrete tap buttons for easy accessibility */}
      <div className="grid grid-cols-11 gap-1 mt-4 pt-3 border-t border-border-subtle/70">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              'h-8 rounded-lg text-metadata font-medium transition-colors select-none cursor-pointer',
              value === num
                ? 'bg-forest text-offwhite font-bold shadow-soft'
                : 'text-secondary hover:bg-forest/5 active:bg-forest/10'
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};
