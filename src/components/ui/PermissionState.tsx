import React from 'react';
import { Camera, ShieldCheck, WifiOff, EyeOff } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface PermissionStateProps {
  onGrant?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const PermissionState: React.FC<PermissionStateProps> = ({
  onGrant,
  isLoading = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between min-h-[460px] p-6 text-center bg-white rounded-card border border-border-subtle shadow-card',
        className
      )}
    >
      <div className="w-full flex flex-col items-center pt-2">
        <div className="relative w-20 h-20 rounded-full bg-sage/60 flex items-center justify-center text-forest mb-5 shadow-soft">
          <Camera className="w-10 h-10 stroke-[1.75]" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-forest text-offwhite flex items-center justify-center shadow-soft">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <h3 className="text-heading font-semibold text-primary mb-2">
          Enable Camera Guidance
        </h3>
        <p className="text-body text-secondary max-w-sm mb-6 leading-relaxed">
          Calm Motion uses your camera in real time to guide your posture and joint alignment.
        </p>

        {/* Privacy guarantees */}
        <div className="w-full bg-sage/20 border border-sage/40 rounded-card-sm p-4 space-y-3 text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-forest shrink-0" />
            <span className="text-caption-medium text-primary">
              100% On-Device Pose Tracking
            </span>
          </div>
          <div className="flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-forest shrink-0" />
            <span className="text-caption-medium text-primary">
              No video or images ever leave your phone
            </span>
          </div>
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-forest shrink-0" />
            <span className="text-caption-medium text-primary">
              Works completely offline without internet
            </span>
          </div>
        </div>
      </div>

      <div className="w-full pt-6">
        <Button
          variant="primary"
          size="full"
          isLoading={isLoading}
          onClick={onGrant}
        >
          Allow Camera Access
        </Button>
        <p className="text-metadata text-secondary mt-3">
          You can change this anytime in your device settings.
        </p>
      </div>
    </div>
  );
};
