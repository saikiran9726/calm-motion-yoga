import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'default';
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
  size = 'default',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'relative inline-flex w-full items-center p-1 bg-forest/5 rounded-button border border-border-subtle select-none',
        size === 'sm' ? 'h-11 min-h-[44px]' : 'h-13 min-h-[52px]',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 flex-1 h-full inline-flex items-center justify-center font-medium transition-colors duration-fast px-3',
              size === 'sm' ? 'text-caption-medium' : 'text-body-medium',
              isSelected ? 'text-forest font-semibold' : 'text-secondary hover:text-primary'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="segmented-active-pill"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-white rounded-input shadow-soft z-[-1] border border-forest/10"
              />
            )}
            {option.icon && (
              <span className="mr-2 inline-flex items-center">{option.icon}</span>
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
