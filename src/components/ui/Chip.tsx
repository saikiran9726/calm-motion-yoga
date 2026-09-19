import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ChipProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  selected?: boolean;
  variant?: 'default' | 'sage' | 'sand' | 'lavender' | 'coral';
  size?: 'sm' | 'default';
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  selected = false,
  variant = 'default',
  size = 'default',
  icon,
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs font-semibold',
    default: 'h-10 px-4 text-sm font-medium',
  };

  const selectedVariants = {
    default: 'bg-forest text-offwhite border-forest shadow-soft',
    sage: 'bg-forest text-offwhite border-forest',
    sand: 'bg-forest text-offwhite border-forest',
    lavender: 'bg-forest text-offwhite border-forest',
    coral: 'bg-forest text-offwhite border-forest',
  };

  const unselectedVariants = {
    default: 'bg-white text-secondary border-border-subtle hover:text-primary hover:bg-forest/5',
    sage: 'bg-sage/40 text-forest border-sage/60 hover:bg-sage/70',
    sand: 'bg-sand-light text-primary border-sand/40 hover:bg-sand/30',
    lavender: 'bg-lavender-light text-primary border-lavender/40 hover:bg-lavender/30',
    coral: 'bg-coral-light text-primary border-coral/40 hover:bg-coral/30',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'inline-flex items-center justify-center rounded-pill border font-medium transition-all duration-fast select-none cursor-pointer',
        sizeStyles[size],
        selected ? selectedVariants[variant] : unselectedVariants[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="mr-1.5 inline-flex items-center">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};
