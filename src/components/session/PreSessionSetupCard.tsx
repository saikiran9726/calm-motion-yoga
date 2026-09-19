import React, { useState } from 'react';
import { ArrowLeft, Check, Sun, Smartphone, Eye, Play } from 'lucide-react';
import { Button, BottomSheet } from '@/components/ui';

export interface PreSessionSetupCardProps {
  exerciseName: string;
  recommendedView?: 'Side View' | 'Front View';
  isOneSided?: boolean;
  onReady: (selectedSide: 'left' | 'right', trackingMode: 'camera' | 'replay') => void;
  onBack: () => void;
}

export const PreSessionSetupCard: React.FC<PreSessionSetupCardProps> = ({
  exerciseName,
  recommendedView = 'Side View',
  isOneSided = true,
  onReady,
  onBack,
}) => {
  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('right');
  const [trackingMode, setTrackingMode] = useState<'camera' | 'replay'>('camera');
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-[#0E1B18] text-white flex flex-col justify-between p-5 pt-safe pb-safe overflow-y-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-metadata font-bold text-sage bg-white/10 px-3 py-1 rounded-pill">
          Pre-Session Setup
        </span>
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-4 space-y-5 max-w-sm mx-auto w-full text-center">
        <div>
          <span className="text-metadata text-sage/80 font-bold uppercase tracking-wider block">
            Target Practice
          </span>
          <h1 className="text-heading font-bold text-white mt-0.5">
            {exerciseName}
          </h1>
          <p className="text-caption text-sage/80 mt-1">
            Let's ensure your phone is placed for clear camera tracking.
          </p>
        </div>

        {/* SVG Placement Diagram (2m away, propped up, full body visible) */}
        <div className="bg-white/5 rounded-card p-4 border border-white/10">
          <svg viewBox="0 0 320 160" className="w-full h-36 object-contain">
            {/* Floor line */}
            <line x1="20" y1="140" x2="300" y2="140" stroke="#DDEBE4" strokeWidth="2" strokeOpacity="0.4" />
            {/* Mat */}
            <rect x="180" y="137" width="110" height="4" rx="2" fill="#DDEBE4" fillOpacity="0.5" />

            {/* Stand / Shelf with phone */}
            <rect x="42" y="90" width="6" height="50" rx="3" fill="#DDEBE4" fillOpacity="0.6" />
            <rect x="36" y="86" width="18" height="4" rx="2" fill="#DDEBE4" />
            {/* Phone propped up with screen */}
            <rect x="40" y="62" width="10" height="24" rx="3" fill="#E9DFCF" transform="rotate(-10 45 74)" />
            {/* Camera lens indicator */}
            <circle cx="43" cy="66" r="1.5" fill="#123B35" />

            {/* Field of View Cone */}
            <polygon points="52,70 280,30 280,140" fill="#DDEBE4" fillOpacity="0.08" stroke="#DDEBE4" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.3" />

            {/* Person Silhouette standing on mat */}
            <g transform="translate(225, 45)">
              <circle cx="15" cy="15" r="9" fill="#DDEBE4" fillOpacity="0.9" />
              <line x1="15" y1="24" x2="15" y2="60" stroke="#DDEBE4" strokeWidth="6" strokeLinecap="round" />
              {/* Arms */}
              <line x1="15" y1="34" x2="2" y2="48" stroke="#DDEBE4" strokeWidth="4" strokeLinecap="round" />
              <line x1="15" y1="34" x2="28" y2="48" stroke="#DDEBE4" strokeWidth="4" strokeLinecap="round" />
              {/* Legs */}
              <line x1="15" y1="60" x2="7" y2="95" stroke="#DDEBE4" strokeWidth="5" strokeLinecap="round" />
              <line x1="15" y1="60" x2="23" y2="95" stroke="#DDEBE4" strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* Distance Marker Arrow */}
            <line x1="55" y1="152" x2="225" y2="152" stroke="#E9DFCF" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="140" y="149" textAnchor="middle" fill="#E9DFCF" fontSize="10" fontFamily="sans-serif" fontWeight="bold">~2 Metres (6-7 ft)</text>
          </svg>

          {/* Quick checklist points */}
          <div className="grid grid-cols-2 gap-2 text-left text-metadata text-sage/90 pt-3 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-sage shrink-0" />
              Hip height & propped
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-sage shrink-0" />
              {recommendedView}
            </span>
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-sage shrink-0" />
              Good room lighting
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-sage shrink-0" />
              Full body visible
            </span>
          </div>
        </div>

        {/* Left / Right Side Selector (for one-sided movements) */}
        {isOneSided && (
          <div className="space-y-2 text-left">
            <span className="text-metadata text-sage/80 font-bold uppercase tracking-wider block">
              Active Focus Side
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedSide('left')}
                className={`h-12 rounded-input border font-semibold text-caption-medium transition-all cursor-pointer ${
                  selectedSide === 'left'
                    ? 'bg-sage text-forest border-sage shadow-soft'
                    : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/15'
                }`}
              >
                Left Side First
              </button>
              <button
                type="button"
                onClick={() => setSelectedSide('right')}
                className={`h-12 rounded-input border font-semibold text-caption-medium transition-all cursor-pointer ${
                  selectedSide === 'right'
                    ? 'bg-sage text-forest border-sage shadow-soft'
                    : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/15'
                }`}
              >
                Right Side First
              </button>
            </div>
          </div>
        )}

        {/* Tracking Mode Selection: Camera vs Recorded Movement Fallback */}
        <div className="space-y-2 text-left pt-1">
          <div className="flex items-center justify-between">
            <span className="text-metadata text-sage/80 font-bold uppercase tracking-wider">
              Tracking Source
            </span>
            <span className="text-[11px] text-sage/70">Judge-Friendly Mode</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setTrackingMode('camera')}
              className={`p-2.5 rounded-input border text-left transition-all cursor-pointer ${
                trackingMode === 'camera'
                  ? 'bg-sage text-forest border-sage shadow-soft'
                  : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/15'
              }`}
            >
              <span className="block text-caption-medium font-bold">Live Camera</span>
              <span className="block text-[11px] opacity-80 mt-0.5">On-device edge AI</span>
            </button>
            <button
              type="button"
              onClick={() => setTrackingMode('replay')}
              className={`p-2.5 rounded-input border text-left transition-all cursor-pointer ${
                trackingMode === 'replay'
                  ? 'bg-sage text-forest border-sage shadow-soft'
                  : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/15'
              }`}
            >
              <span className="block text-caption-medium font-bold">Recorded Replay</span>
              <span className="block text-[11px] opacity-80 mt-0.5">No camera needed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Buttons: I'm ready (primary) + Watch demo link */}
      <div className="space-y-3 pt-2 max-w-sm mx-auto w-full">
        <Button
          variant="coral"
          size="full"
          rightIcon={<Play className="w-5 h-5 fill-current" />}
          onClick={() => onReady(selectedSide, trackingMode)}
        >
          {trackingMode === 'camera' ? "I'm Ready (Start Camera)" : "Start Demo Replay"}
        </Button>

        <button
          type="button"
          onClick={() => setDemoOpen(true)}
          className="text-metadata text-sage/80 hover:text-white underline block mx-auto py-1"
        >
          Watch quick movement demo
        </button>
      </div>

      {/* Quick Movement Demo Sheet */}
      <BottomSheet
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        title={`${exerciseName} Demonstration`}
      >
        <div className="space-y-4 py-2 text-left select-none text-primary">
          <p className="text-caption text-secondary">
            Keep your torso upright and level your arms parallel to the ground. Our coach watches for shoulder elevation and front knee drift.
          </p>
          <div className="p-4 bg-sage/30 rounded-card-sm border border-sage/50">
            <h4 className="text-body-medium font-bold text-forest mb-1">Key Alignment Goal:</h4>
            <p className="text-caption text-secondary">
              Front knee stacked over ankle at 90°, shoulders relaxed and directly above the hips.
            </p>
          </div>
          <Button variant="primary" size="full" onClick={() => setDemoOpen(false)}>
            Got it, let's begin
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
