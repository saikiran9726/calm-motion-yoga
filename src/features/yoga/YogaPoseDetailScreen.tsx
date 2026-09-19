import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  Play,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { PoseIllustration } from '@/components/illustrations/PoseIllustration';
import { BreathingCircle } from '@/components/breathing/BreathingCircle';
import { YOGA_POSES } from '@/data/poses';

export const YogaPoseDetailScreen: React.FC = () => {
  const { poseId } = useParams<{ poseId: string }>();
  const navigate = useNavigate();

  const [showAlignment, setShowAlignment] = useState(true);

  // Find pose or fallback to warrior-2
  const currentPose = YOGA_POSES.find((p) => p.id === poseId) || YOGA_POSES[0];

  return (
    <div className="p-5 pb-28 space-y-6 select-none bg-offwhite min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="w-10 h-10 rounded-full bg-forest/5 hover:bg-forest/10 flex items-center justify-center text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-metadata font-bold text-forest bg-sage/60 px-3 py-1 rounded-pill flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Mindful Yoga Library
        </span>
      </div>

      {/* Title & Sanskrit */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-display font-bold text-primary tracking-tight">
            {currentPose.name}
          </h1>
          <span className="text-caption font-serif italic text-secondary">
            ({currentPose.sanskrit})
          </span>
        </div>
        <p className="text-body text-secondary leading-relaxed">
          {currentPose.description}
        </p>
      </div>

      {/* Large SVG Demonstration Card */}
      <Card variant="sage" className="p-5 relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-metadata font-bold text-forest uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> {currentPose.durationSeconds}s Duration
          </span>

          {/* Alignment Overlay Toggle */}
          <button
            type="button"
            onClick={() => setShowAlignment(!showAlignment)}
            className={`px-3 py-1 rounded-pill text-metadata font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showAlignment
                ? 'bg-forest text-offwhite shadow-soft'
                : 'bg-white/80 text-secondary border border-forest/20'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Alignment {showAlignment ? 'On' : 'Off'}</span>
          </button>
        </div>

        {/* The SVG Illustration */}
        <PoseIllustration
          poseType={currentPose.svgType}
          showAlignment={showAlignment}
          className="w-full h-64"
        />

        {/* Alignment Points Chips */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-forest/10">
          {currentPose.keyJoints.map((j, i) => (
            <span
              key={i}
              className="text-[11px] font-semibold text-forest bg-white/70 px-2.5 py-1 rounded-pill border border-forest/10"
            >
              {j}
            </span>
          ))}
        </div>
      </Card>

      {/* Breathing Guidance with Animated Breath Circle */}
      <BreathingCircle
        inhaleSec={currentPose.breathing.inhaleSec}
        holdSec={currentPose.breathing.holdSec}
        exhaleSec={currentPose.breathing.exhaleSec}
        cue={currentPose.breathing.cue}
      />

      {/* 3 Alignment Tips */}
      <div className="space-y-3">
        <span className="text-metadata font-bold text-secondary uppercase tracking-wider block">
          Key Alignment Principles
        </span>

        <Card variant="default" className="p-5 space-y-3.5 divide-y divide-border-subtle/70">
          {currentPose.alignmentTips.map((tip, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${idx > 0 ? 'pt-3.5' : ''}`}>
              <div className="w-6 h-6 rounded-full bg-sage/60 flex items-center justify-center text-forest shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-caption-medium text-primary leading-relaxed flex-1">
                {tip}
              </p>
            </div>
          ))}
        </Card>
      </div>

      {/* Quick Pose Switcher Bar (All 8 Poses) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-metadata font-bold text-secondary uppercase tracking-wider">
            All 8 Poses in Library
          </span>
          <span className="text-metadata text-forest font-semibold">
            {YOGA_POSES.findIndex((p) => p.id === currentPose.id) + 1} of 8
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {YOGA_POSES.map((p) => {
            const isSelected = p.id === currentPose.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => navigate(`/yoga/pose/${p.id}`)}
                className={`px-3.5 py-2 rounded-pill text-caption-medium font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-forest text-offwhite shadow-soft'
                    : 'bg-white text-secondary border border-border-subtle hover:border-forest/30'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Action: Start Motion Tracking */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-4 border-t border-border-subtle shadow-modal z-30 max-w-md mx-auto pb-safe">
        <Button
          variant="coral"
          size="full"
          rightIcon={<Play className="w-5 h-5 fill-current" />}
          onClick={() => navigate('/session')}
        >
          Start Motion Tracking ({currentPose.name})
        </Button>
      </div>
    </div>
  );
};
