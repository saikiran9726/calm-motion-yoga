import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'coral';
  size?: 'default' | 'sm' | 'full';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 active:outline-none disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer';

    const variants = {
      primary:
        'bg-forest text-offwhite hover:bg-forest-hover shadow-soft active:bg-forest-light',
      secondary:
        'bg-sage/40 text-forest hover:bg-sage/70 border border-forest/10 active:bg-sage',
      ghost:
        'bg-transparent text-secondary hover:text-primary hover:bg-forest/5 active:bg-forest/10',
      coral:
        'bg-coral text-primary hover:bg-coral-dark/90 shadow-soft',
    };

    const sizes = {
      default: 'h-14 min-h-[56px] px-6 text-base font-medium rounded-button',
      sm: 'h-12 min-h-[48px] px-4 text-sm font-medium rounded-input',
      full: 'w-full h-14 min-h-[56px] px-6 text-base font-medium rounded-button',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.985 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          baseStyles,
          sizes[size],
          variants[variant],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin text-current" />
        ) : leftIcon ? (
          <span className="mr-2.5 inline-flex items-center">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="ml-2.5 inline-flex items-center">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
