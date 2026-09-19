import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'rounded' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rounded',
  ...props
}) => {
  const variantStyles = {
    rectangular: 'rounded-none',
    rounded: 'rounded-input',
    circular: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-forest/10',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};
