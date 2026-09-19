import React from 'react';
import {
  Camera,
  AlertCircle,
  Sun,
  Move,
  Play,
  RotateCcw,
  XCircle,
  HelpCircle,
  LogOut,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui';
import { PoseSourceState } from '@/engine/pose/poseSource';

export interface LiveStateOverlayProps {
  state: PoseSourceState;
  onResume?: () => void;
  onEndSession?: () => void;
  onRetry?: () => void;
  onGrantPermission?: () => void;
}

export const LiveStateOverlay: React.FC<LiveStateOverlayProps> = ({
  state,
  onResume,
  onEndSession,
  onRetry,
  onGrantPermission,
}) => {
  if (state === 'tracking' || state === 'ready') return null;

  return (
    <div className="absolute inset-0 z-30 bg-[#0E1B18]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center select-none">
      {/* 1. PAUSED STATE */}
      {state === 'paused' && (
        <div className="max-w-xs w-full space-y-5 animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 rounded-full bg-forest border border-sage/30 text-sage mx-auto flex items-center justify-center shadow-soft">
            <Play className="w-7 h-7 fill-current ml-1" />
          </div>
          <div>
            <h3 className="text-heading font-bold text-white">Session Paused</h3>
            <p className="text-caption text-sage/80 mt-1">
              Take a breath. Movement tracking is frozen while you rest.
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            <Button
              variant="coral"
              size="full"
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              onClick={onResume}
            >
              Resume Movement
            </Button>
            <Button
              variant="ghost"
              size="full"
              className="text-sage/90 hover:text-white"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={onEndSession}
            >
              End Session
            </Button>
          </div>
        </div>
      )}

      {/* 2. USER OUT OF FRAME */}
      {state === 'user_out_of_frame' && (
        <div className="max-w-xs w-full space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-sand/30 text-sand mx-auto flex items-center justify-center">
            <Move className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-heading font-bold text-white">Step Into the Frame</h3>
            <p className="text-caption text-sage/80 mt-1">
              Please step into view so our coach can watch your alignment.
            </p>
          </div>
        </div>
      )}

      {/* 3. STEP BACK FOR FULL BODY */}
      {state === 'step_back' && (
        <div className="max-w-xs w-full space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-sage/30 text-sage mx-auto flex items-center justify-center">
            <Move className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-heading font-bold text-white">Step Back Slightly</h3>
            <p className="text-caption text-sage/80 mt-1">
              Move back 2–3 feet so we can see your full body from shoulders down to feet.
            </p>
          </div>
        </div>
      )}

      {/* 4. LOW LIGHT */}
      {state === 'low_light' && (
        <div className="max-w-xs w-full space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-sand/30 text-sand mx-auto flex items-center justify-center">
            <Sun className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-heading font-bold text-white">Lighting is Dim</h3>
            <p className="text-caption text-sage/80 mt-1">
              Turn on room lights or face a window so your joints are clearly recognized.
            </p>
          </div>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              I've Adjusted Light
            </Button>
          )}
        </div>
      )}

      {/* 5. MODEL LOADING */}
      {state === 'model_loading' && (
        <div className="max-w-xs w-full space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-forest border border-sage/40 text-sage mx-auto flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-heading font-bold text-white">Preparing Motion Coach</h3>
            <p className="text-caption text-sage/80 mt-1">
              Loading on-device geometric tracking. Everything runs 100% private in memory.
            </p>
          </div>
        </div>
      )}

      {/* 6. PERMISSION REQUESTING */}
      {state === 'requesting_permission' && (
        <div className="max-w-xs w-full space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-sage/30 text-sage mx-auto flex items-center justify-center">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-heading font-bold text-white">Requesting Camera Access</h3>
            <p className="text-caption text-sage/80 mt-1">
              Please tap Allow when your browser prompts you.
            </p>
          </div>
          {onGrantPermission && (
            <Button variant="coral" size="full" onClick={onGrantPermission}>
              Prompt Camera Access
            </Button>
          )}
        </div>
      )}

      {/* 7. PERMISSION DENIED */}
      {state === 'permission_denied' && (
        <div className="max-w-xs w-full space-y-4 text-left animate-in fade-in duration-200">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-coral/30 text-coral mx-auto flex items-center justify-center mb-2">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-heading font-bold text-white">Camera Access Denied</h3>
            <p className="text-caption text-sage/80 mt-1">
              Camera is required for live angle corrections.
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-card-sm border border-white/10 space-y-2 text-caption text-sage/90">
            <span className="font-bold text-white block flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-coral" /> Quick Fix Steps:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-metadata">
              <li>Tap the <strong>Lock / Settings</strong> icon in the address bar.</li>
              <li>Change <strong>Camera</strong> to <strong>Allow</strong>.</li>
              <li>Tap Retry below.</li>
            </ol>
          </div>

          {onRetry && (
            <Button
              variant="coral"
              size="full"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={onRetry}
            >
              Retry Camera Connection
            </Button>
          )}
        </div>
      )}

      {/* 8. NO CAMERA FOUND */}
      {state === 'no_camera' && (
        <div className="max-w-xs w-full space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-coral/30 text-coral mx-auto flex items-center justify-center">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-heading font-bold text-white">No Camera Detected</h3>
            <p className="text-caption text-sage/80 mt-1">
              We couldn't connect to a front-facing video sensor on this device.
            </p>
          </div>
          {onRetry && (
            <Button variant="secondary" size="full" onClick={onRetry}>
              Check Again
            </Button>
          )}
        </div>
      )}

      {/* 9. GENERAL ERROR / TRACKING UNAVAILABLE */}
      {(state === 'error' || state === 'uninitialized') && (
        <div className="max-w-xs w-full space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-coral/30 text-coral mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-heading font-bold text-white">Motion Coach Paused</h3>
            <p className="text-caption text-sage/80 mt-1">
              We encountered a temporary interruption with the sensor stream.
            </p>
          </div>
          {onRetry && (
            <Button
              variant="coral"
              size="full"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={onRetry}
            >
              Restart Tracking
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
