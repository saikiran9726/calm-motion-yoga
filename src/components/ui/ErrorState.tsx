import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something paused our flow',
  description = 'We could not complete this action. Your progress is safely kept on your phone.',
  onRetry,
  retryLabel = 'Try Again',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded-card bg-coral-light/30 border border-coral/30 shadow-soft',
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-coral/20 flex items-center justify-center text-coral-dark mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h3 className="text-title font-semibold text-primary mb-1.5">{title}</h3>
      <p className="text-caption text-secondary max-w-xs mb-6">{description}</p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
