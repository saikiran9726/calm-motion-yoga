import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'sage' | 'sand' | 'lavender' | 'forest';
  padding?: 'none' | 'sm' | 'default' | 'lg';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'default',
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-white border border-border-subtle shadow-card text-primary',
      elevated: 'bg-white border border-border-subtle shadow-floating text-primary',
      sage: 'bg-sage/40 border border-sage/60 text-primary',
      sand: 'bg-sand-light border border-sand/40 text-primary',
      lavender: 'bg-lavender-light border border-lavender/50 text-primary',
      forest: 'bg-forest text-offwhite border border-forest-light shadow-floating',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-4',
      default: 'p-5 md:p-6',
      lg: 'p-6 md:p-8',
    };

    return (
      <motion.div
        ref={ref}
        whileTap={interactive ? { scale: 0.99 } : undefined}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'rounded-card transition-all duration-calm',
          variants[variant],
          paddings[padding],
          interactive && 'cursor-pointer hover:border-forest/20 active:bg-offwhite/50',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
