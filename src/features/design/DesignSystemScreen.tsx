import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Check,
  Layers,
  Palette,
  Type,
  Maximize2
} from 'lucide-react';
import {
  Button,
  Card,
  Chip,
  SegmentedControl,
  PainSlider,
  ProgressRing,
  Skeleton,
  EmptyState,
  ErrorState,
  PermissionState,
  BottomSheet,
  Tabs,
} from '@/components/ui';
import { useAppStore } from '@/lib/store';

export const DesignSystemScreen: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useAppStore();

  const [activeTab, setActiveTab] = useState('components');
  const [segmentedValue, setSegmentedValue] = useState<'yoga' | 'physio' | 'mobility'>('yoga');
  const [painLevel, setPainLevel] = useState<number>(3);
  const [progressVal, setProgressVal] = useState<number>(75);
  const [selectedChip, setSelectedChip] = useState<string>('morning');
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const colors = [
    { name: 'Deep Forest', hex: '#123B35', class: 'bg-forest', text: 'text-white' },
    { name: 'Soft Sage', hex: '#DDEBE4', class: 'bg-sage', text: 'text-forest' },
    { name: 'Off White', hex: '#F7F8F5', class: 'bg-offwhite', text: 'text-primary' },
    { name: 'Warm Sand', hex: '#E9DFCF', class: 'bg-sand', text: 'text-primary' },
    { name: 'Muted Lavender', hex: '#E7E3F3', class: 'bg-lavender', text: 'text-primary' },
    { name: 'Soft Coral', hex: '#E9A99A', class: 'bg-coral', text: 'text-primary' },
    { name: 'Primary Text', hex: '#17201D', class: 'bg-primary', text: 'text-white' },
    { name: 'Secondary Text', hex: '#69736F', class: 'bg-secondary', text: 'text-white' },
  ];

  return (
    <div className="p-5 pb-32 space-y-8 bg-offwhite min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-forest/5 hover:bg-forest/10 flex items-center justify-center text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-title font-bold text-primary tracking-tight">
              Calm Motion Design System
            </h1>
            <p className="text-metadata text-secondary">
              Tokens, interactive states & reusable component catalog
            </p>
          </div>
        </div>
        <span className="text-metadata font-bold text-forest bg-sage/60 px-3 py-1 rounded-pill">
          Phase 0 Spec
        </span>
      </div>

      {/* Tabs navigation */}
      <Tabs
        tabs={[
          { id: 'components', label: 'Components' },
          { id: 'tokens', label: 'Color & Type' },
          { id: 'feedback', label: 'States & Modals' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: ALL COMPONENTS ACROSS STATES */}
      {activeTab === 'components' && (
        <div className="space-y-8">
          {/* 1. BUTTONS */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-body-medium font-bold text-primary flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest" />
                Buttons (56px touch target & 16px radius)
              </h2>
              <button
                type="button"
                onClick={() => setButtonLoading(!buttonLoading)}
                className="text-metadata text-forest font-semibold underline"
              >
                Toggle Loading ({buttonLoading ? 'On' : 'Off'})
              </button>
            </div>

            <div className="space-y-3">
              {/* Primary */}
              <div className="space-y-1">
                <span className="text-metadata text-secondary">Primary Variant:</span>
                <div className="grid grid-cols-1 gap-2.5">
                  <Button
                    variant="primary"
                    size="default"
                    isLoading={buttonLoading}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                    onClick={() => addToast({ title: 'Primary button clicked', type: 'success' })}
                  >
                    Primary Normal (56px)
                  </Button>
                  <Button variant="primary" disabled size="default">
                    Primary Disabled State
                  </Button>
                </div>
              </div>

              {/* Secondary & Coral */}
              <div className="space-y-1 pt-1">
                <span className="text-metadata text-secondary">Secondary & Coral Variants:</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="default"
                    onClick={() => addToast({ title: 'Secondary clicked', type: 'info' })}
                  >
                    Secondary
                  </Button>
                  <Button
                    variant="coral"
                    size="default"
                    onClick={() => addToast({ title: 'Coral action triggered', type: 'warning' })}
                  >
                    Soft Coral
                  </Button>
                </div>
              </div>

              {/* Ghost & Small */}
              <div className="space-y-1 pt-1">
                <span className="text-metadata text-secondary">Ghost & Small (44px):</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="ghost" size="sm">
                    Ghost Small (44px)
                  </Button>
                  <Button variant="secondary" size="sm" disabled>
                    Small Disabled
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* 2. CARDS */}
          <section className="space-y-3 pt-2">
            <h2 className="text-body-medium font-bold text-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-forest" />
              Cards (24px radius, soft surfaces, subtle borders)
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <Card variant="default" className="p-4">
                <h3 className="text-body-medium font-bold text-primary">Default Card (White)</h3>
                <p className="text-caption text-secondary mt-0.5">
                  Clean white with 1px border-subtle and soft elevation shadow.
                </p>
              </Card>

              <Card variant="sage" className="p-4">
                <h3 className="text-body-medium font-bold text-forest">Soft Sage Card (#DDEBE4)</h3>
                <p className="text-caption text-primary/80 mt-0.5">
                  Organic backdrop for yoga routines and mindfulness sessions.
                </p>
              </Card>

              <Card variant="sand" className="p-4">
                <h3 className="text-body-medium font-bold text-primary">Warm Sand Card (#E9DFCF)</h3>
                <p className="text-caption text-secondary mt-0.5">
                  Calm check-in cards and human reflection prompts.
                </p>
              </Card>

              <Card variant="lavender" className="p-4">
                <h3 className="text-body-medium font-bold text-primary">Muted Lavender Card (#E7E3F3)</h3>
                <p className="text-caption text-secondary mt-0.5">
                  Breathing pacing and evening recovery cards.
                </p>
              </Card>

              <Card variant="forest" className="p-4">
                <h3 className="text-body-medium font-bold text-white">Deep Forest Hero Card (#123B35)</h3>
                <p className="text-caption text-sage/90 mt-0.5">
                  Primary hero card for daily session starts and active tracking.
                </p>
              </Card>
            </div>
          </section>

          {/* 3. CHIPS */}
          <section className="space-y-3 pt-2">
            <h2 className="text-body-medium font-bold text-primary">
              Chips & Category Pills
            </h2>
            <div className="flex flex-wrap gap-2">
              {['morning', 'mobility', 'knee_rehab', 'calm_flow', 'strength'].map((key) => (
                <Chip
                  key={key}
                  selected={selectedChip === key}
                  onClick={() => setSelectedChip(key)}
                  icon={selectedChip === key ? <Check className="w-3 h-3" /> : undefined}
                >
                  {key.replace('_', ' ').toUpperCase()}
                </Chip>
              ))}
            </div>
          </section>

          {/* 4. SEGMENTED CONTROL */}
          <section className="space-y-3 pt-2">
            <h2 className="text-body-medium font-bold text-primary">
              Segmented Control
            </h2>
            <SegmentedControl
              options={[
                { value: 'yoga', label: 'Yoga' },
                { value: 'physio', label: 'Physiotherapy' },
                { value: 'mobility', label: 'Mobility' },
              ]}
              value={segmentedValue}
              onChange={setSegmentedValue}
            />
          </section>

          {/* 5. PAIN SLIDER */}
          <section className="space-y-3 pt-2">
            <h2 className="text-body-medium font-bold text-primary">
              Pain Slider (0 to 10 with large thumb & descriptive text)
            </h2>
            <PainSlider value={painLevel} onChange={setPainLevel} />
          </section>

          {/* 6. PROGRESS RING */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-body-medium font-bold text-primary">
                Progress Ring (Circular SVG)
              </h2>
              <div className="flex items-center gap-2 text-metadata text-secondary">
                <span>Adjust:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  className="w-24 accent-forest"
                />
                <span className="font-bold text-primary w-8">{progressVal}%</span>
              </div>
            </div>

            <div className="flex items-center justify-around bg-white p-5 rounded-card border border-border-subtle shadow-card">
              <ProgressRing value={progressVal} size={90} strokeWidth={8} variant="forest" />
              <ProgressRing value={progressVal} size={90} strokeWidth={8} variant="coral" />
              <ProgressRing value={progressVal} size={90} strokeWidth={8} variant="lavender" />
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: COLOR TOKENS & TYPOGRAPHY */}
      {activeTab === 'tokens' && (
        <div className="space-y-8">
          {/* Colors Palette */}
          <section className="space-y-3">
            <h2 className="text-body-medium font-bold text-primary flex items-center gap-2">
              <Palette className="w-4 h-4 text-forest" />
              Calm Motion Color Palette (Design Spec §1)
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {colors.map((c) => (
                <div
                  key={c.name}
                  className="p-4 rounded-card-sm border border-border-subtle bg-white shadow-soft flex flex-col justify-between h-28"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-full ${c.class} shadow-soft border border-black/10`} />
                    <span className="text-metadata font-mono font-bold text-secondary">
                      {c.hex}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-caption-medium font-bold text-primary">{c.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Typography Scale */}
          <section className="space-y-3 pt-2">
            <h2 className="text-body-medium font-bold text-primary flex items-center gap-2">
              <Type className="w-4 h-4 text-forest" />
              Typography Hierarchy (Self-Hosted Manrope)
            </h2>

            <Card variant="default" className="p-5 space-y-5 divide-y divide-border-subtle">
              <div>
                <span className="text-metadata text-secondary block mb-1">
                  Display (32px / 700)
                </span>
                <p className="text-display text-primary">Morning Mobility</p>
              </div>

              <div className="pt-3">
                <span className="text-metadata text-secondary block mb-1">
                  Section Heading (24px / 600)
                </span>
                <p className="text-heading text-primary">Explore Practices</p>
              </div>

              <div className="pt-3">
                <span className="text-metadata text-secondary block mb-1">
                  Card Title (18px / 600)
                </span>
                <p className="text-title text-primary">Shoulder Impingement Recovery</p>
              </div>

              <div className="pt-3">
                <span className="text-metadata text-secondary block mb-1">
                  Body (16px / 400 & 500)
                </span>
                <p className="text-body text-primary">
                  The phone camera observes user movement and gives gentle real-time guidance.
                </p>
              </div>

              <div className="pt-3">
                <span className="text-metadata text-secondary block mb-1">
                  Secondary Text (14px / 400)
                </span>
                <p className="text-caption text-secondary">
                  Processed 100% on-device. No frames leave your phone.
                </p>
              </div>

              <div className="pt-3">
                <span className="text-metadata text-secondary block mb-1">
                  Metadata (12px / 500 uppercase)
                </span>
                <p className="text-metadata text-secondary uppercase tracking-wider font-bold">
                  WEEK 3 OF 6 • 78% COMPLETE
                </p>
              </div>
            </Card>
          </section>

          {/* Radii & Motion Tokens */}
          <section className="space-y-3 pt-2">
            <h2 className="text-body-medium font-bold text-primary">
              Radii & Motion Tokens
            </h2>
            <Card variant="default" className="p-4 space-y-2 text-caption">
              <div className="flex justify-between py-1 border-b border-border-subtle">
                <span className="text-secondary">Card Radius</span>
                <span className="font-mono font-bold text-primary">24px (rounded-card) / 20px</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle">
                <span className="text-secondary">Input & Button Radius</span>
                <span className="font-mono font-bold text-primary">16px (rounded-button / input)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle">
                <span className="text-secondary">Fast Transition</span>
                <span className="font-mono font-bold text-primary">180ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-subtle">
                <span className="text-secondary">Calm Transition</span>
                <span className="font-mono font-bold text-primary">280ms</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-secondary">Gentle Easing Curve</span>
                <span className="font-mono font-bold text-primary">cubic-bezier(0.16, 1, 0.3, 1)</span>
              </div>
            </Card>
          </section>
        </div>
      )}

      {/* TAB 3: FEEDBACK STATES, SKELETON, ERRORS & MODALS */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* Skeleton loaders */}
          <section className="space-y-3">
            <h2 className="text-body-medium font-bold text-primary">
              Skeleton Loaders (Calm Shimmer)
            </h2>
            <Card variant="default" className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="space-y-2 flex-1">
                  <Skeleton variant="rounded" className="h-4 w-3/4" />
                  <Skeleton variant="rounded" className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton variant="rounded" className="h-20 w-full" />
            </Card>
          </section>

          {/* Toast Notification Triggers */}
          <section className="space-y-3">
            <h2 className="text-body-medium font-bold text-primary">
              Toast Notifications
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  addToast({
                    title: 'Good alignment',
                    description: 'Movement held for 5 seconds.',
                    type: 'success',
                  })
                }
              >
                Success
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  addToast({
                    title: 'Posture guidance',
                    description: 'Keep your back straight.',
                    type: 'info',
                  })
                }
              >
                Info
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  addToast({
                    title: 'Check knee angle',
                    description: 'Move your knee slightly inward.',
                    type: 'warning',
                  })
                }
              >
                Warning
              </Button>
            </div>
          </section>

          {/* EmptyState Component */}
          <section className="space-y-3">
            <h2 className="text-body-medium font-bold text-primary">Empty State</h2>
            <EmptyState
              title="No Recorded Sessions Today"
              description="Start your morning mobility or yoga practice to log movement consistency."
              actionLabel="Start Daily Practice"
              onAction={() => addToast({ title: 'Practice launched', type: 'info' })}
            />
          </section>

          {/* ErrorState Component */}
          <section className="space-y-3">
            <h2 className="text-body-medium font-bold text-primary">Error State</h2>
            <ErrorState
              title="Motion Tracking Paused"
              description="Ensure your full body is visible in good room lighting to resume tracking."
              onRetry={() => addToast({ title: 'Retrying camera calibration...', type: 'info' })}
            />
          </section>

          {/* PermissionState Component */}
          <section className="space-y-3">
            <h2 className="text-body-medium font-bold text-primary">
              Permission State (Offline Camera & Privacy)
            </h2>
            <PermissionState
              onGrant={() => addToast({ title: 'Camera access requested', type: 'success' })}
            />
          </section>

          {/* BottomSheet Modal Trigger */}
          <section className="space-y-3">
            <h2 className="text-body-medium font-bold text-primary">Bottom Sheet Modal</h2>
            <Button
              variant="secondary"
              size="full"
              leftIcon={<Maximize2 className="w-4 h-4" />}
              onClick={() => setSheetOpen(true)}
            >
              Open Interactive Bottom Sheet
            </Button>

            <BottomSheet
              isOpen={sheetOpen}
              onClose={() => setSheetOpen(false)}
              title="Alignment & Pose Parameters"
            >
              <div className="space-y-3">
                <p className="text-caption text-secondary">
                  The on-device pose model evaluates 33 skeletal keypoints at 30 fps without cloud offloading.
                </p>
                <div className="p-3 bg-sage/30 rounded-input border border-sage text-caption-medium text-forest">
                  Joint angle tolerance: ±8° for warrior postures
                </div>
                <Button variant="primary" size="full" onClick={() => setSheetOpen(false)}>
                  Done
                </Button>
              </div>
            </BottomSheet>
          </section>
        </div>
      )}
    </div>
  );
};
