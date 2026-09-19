import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Activity,
  HeartPulse,
  Wind,
  Flame,
  RefreshCw,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Card, Chip } from '@/components/ui';
import { PHYSIO_PROGRAMS } from '@/data/physio';
import { PoseIllustration } from '@/components/illustrations/PoseIllustration';

export const ExploreScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', icon: null },
    { id: 'yoga', label: t('explore.categories.yoga', 'Yoga'), icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'physio', label: t('explore.categories.physio', 'Physiotherapy'), icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'mobility', label: t('explore.categories.mobility', 'Mobility'), icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { id: 'breathing', label: t('explore.categories.breathing', 'Breathing'), icon: <Wind className="w-3.5 h-3.5" /> },
    { id: 'strength', label: t('explore.categories.strength', 'Strength'), icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'recovery', label: t('explore.categories.recovery', 'Recovery'), icon: <RefreshCw className="w-3.5 h-3.5" /> },
  ];

  // 6 Yoga Collections per spec
  const yogaCollections = [
    { id: 'morning', title: 'Morning Yoga', duration: '15 min', level: 'All Levels', desc: 'Awaken spinal fluidity and clear mental fog.', theme: 'sage', poseId: 'warrior-2' },
    { id: 'flexibility', title: 'Deep Flexibility', duration: '20 min', level: 'Intermediate', desc: 'Hip openers, long hamstring releases, and poise.', theme: 'lavender', poseId: 'triangle-pose' },
    { id: 'stress_relief', title: 'Stress Relief & Unwind', duration: '18 min', level: 'Gentle', desc: 'Somatic breath sync, restorative folds, and calm.', theme: 'sand', poseId: 'child-pose' },
    { id: 'mobility', title: 'Spinal Mobility Flow', duration: '12 min', level: 'Beginner', desc: 'Cat-cow waves, neck releases, and thoracic mobility.', theme: 'sage', poseId: 'cat-cow' },
    { id: 'beginner', title: 'Beginner Essentials', duration: '10 min', level: 'Foundational', desc: 'Foundational postures with guided joint cues.', theme: 'sand', poseId: 'mountain-pose' },
    { id: 'advanced', title: 'Advanced Balance', duration: '25 min', level: 'Advanced', desc: 'Grounded single-leg rooting and core equilibrium.', theme: 'lavender', poseId: 'tree-pose' },
  ];

  const currentPhysio = PHYSIO_PROGRAMS['shoulder-mobility'];

  const showYoga = selectedCategory === 'all' || selectedCategory === 'yoga' || selectedCategory === 'mobility' || selectedCategory === 'breathing';
  const showPhysio = selectedCategory === 'all' || selectedCategory === 'physio' || selectedCategory === 'strength' || selectedCategory === 'recovery';

  return (
    <div className="p-5 space-y-7 select-none">
      {/* Top Header */}
      <div className="pt-1">
        <h1 className="text-heading font-bold text-primary tracking-tight">
          {t('explore.title', 'Explore Practices')}
        </h1>
        <p className="text-caption text-secondary mt-0.5">
          Mindful organic yoga flow & structured clinical recovery tracks.
        </p>
      </div>

      {/* 6 Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            selected={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            icon={cat.icon}
          >
            {cat.label}
          </Chip>
        ))}
      </div>

      {/* AREA 1: YOGA (Peaceful, Organic, Rounded Blob shapes, Large Cards with SVG art) */}
      {showYoga && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-sage flex items-center justify-center text-forest">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-caption-medium font-bold text-forest uppercase tracking-wider">
                Yoga Sanctuary (Peaceful & Organic)
              </span>
            </div>
            <span className="text-metadata text-secondary font-medium">6 Collections</span>
          </div>

          {/* Featured Large Organic Card with SVG art */}
          <div
            onClick={() => navigate('/yoga/pose/warrior-2')}
            className="group cursor-pointer rounded-[28px] bg-gradient-to-br from-sage/50 via-sand-light to-lavender-light p-6 border border-sage/60 shadow-card transition-all duration-calm hover:shadow-floating active:scale-[0.99]"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-2 text-left">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-forest bg-white/80 px-2.5 py-0.5 rounded-pill uppercase">
                  Featured Flow • Guided
                </span>
                <h3 className="text-display font-bold text-primary leading-tight">
                  Warrior II & Grounded Poise
                </h3>
                <p className="text-caption text-secondary max-w-xs leading-relaxed">
                  Open your hips, align your shoulders, and cultivate steady, centered breathing.
                </p>
                <div className="flex items-center gap-3 pt-2 text-metadata text-forest font-semibold">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 15 min</span>
                  <span>•</span>
                  <span>Beginner Friendly</span>
                  <span className="ml-auto inline-flex items-center text-primary group-hover:translate-x-1 transition-transform">
                    Explore Pose <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>

              <div className="w-40 h-40 shrink-0">
                <PoseIllustration poseType="warrior2" showAlignment={false} className="w-40 h-40" />
              </div>
            </div>
          </div>

          {/* 6 Yoga Collections Grid (Organic Soft Palettes) */}
          <div className="grid grid-cols-1 gap-3 pt-1">
            {yogaCollections.map((col) => (
              <Card
                key={col.id}
                variant={col.theme as any}
                interactive
                onClick={() => navigate(`/yoga/pose/${col.poseId}`)}
                className="p-4 rounded-[22px]"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-body-medium font-bold text-primary">{col.title}</h4>
                      <span className="text-[11px] font-semibold text-forest bg-white/70 px-2 py-0.5 rounded-pill">
                        {col.level}
                      </span>
                    </div>
                    <p className="text-caption text-secondary">{col.desc}</p>
                    <span className="text-metadata text-forest font-semibold flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3" /> {col.duration} • Tap to view alignment
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-forest shadow-soft shrink-0 ml-3">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AREA 2: PHYSIOTHERAPY (Structured, Clinical, Tighter Grid, Week Timeline, Checklist Rows) */}
      {showPhysio && (
        <div className="space-y-4 pt-4 border-t border-border-subtle/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-forest text-offwhite flex items-center justify-center">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span className="text-caption-medium font-bold text-primary uppercase tracking-wider">
                Physiotherapy Tracks (Clinical Protocol)
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/physio/recovery')}
              className="text-metadata text-forest font-bold hover:underline inline-flex items-center"
            >
              My Recovery <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          {/* Structured Clinical Card: Deep Forest accents, Week timeline, Checklist */}
          <div className="bg-white rounded-card p-5 border-l-4 border-l-forest border-y border-r border-border-subtle shadow-card space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-metadata font-mono font-bold text-forest bg-sage/60 px-2.5 py-0.5 rounded-md">
                  CLINICAL PROTOCOL #08
                </span>
                <h3 className="text-title font-bold text-primary mt-1.5">
                  {currentPhysio.title}
                </h3>
                <p className="text-caption text-secondary">{currentPhysio.subtitle}</p>
              </div>
              <span className="text-metadata font-bold text-forest bg-sage/50 px-2.5 py-1 rounded-pill">
                Week {currentPhysio.currentWeek} of {currentPhysio.totalWeeks}
              </span>
            </div>

            {/* Week Timeline */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-metadata text-secondary font-medium">
                <span>Week 1</span>
                <span>Week 2</span>
                <span className="text-forest font-bold">Week 3 (Current)</span>
                <span>Week 4</span>
                <span>Week 5</span>
                <span>Week 6</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((wk) => (
                  <div
                    key={wk}
                    className={`h-2 rounded-sm ${
                      wk < 3
                        ? 'bg-forest'
                        : wk === 3
                        ? 'bg-forest/80'
                        : 'bg-forest/15'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Checklist Rows with Clear Labels */}
            <div className="space-y-2 pt-2 border-t border-border-subtle/70">
              <span className="text-metadata font-bold text-secondary uppercase tracking-wider block">
                Today's Prescribed Checklist
              </span>
              <div className="space-y-1.5">
                {currentPhysio.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-2.5 rounded-input bg-forest/5 text-caption font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          ex.done ? 'text-forest fill-sage' : 'text-secondary/40'
                        }`}
                      />
                      <span className={ex.done ? 'text-primary' : 'text-secondary'}>
                        {ex.name}
                      </span>
                    </div>
                    <span className="text-metadata font-mono text-secondary">
                      {ex.defaultReps}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Recovery Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/physio/recovery')}
                className="w-full h-12 rounded-button bg-forest text-offwhite text-caption-medium font-bold flex items-center justify-center gap-2 shadow-soft hover:bg-forest-hover transition-colors cursor-pointer"
              >
                <span>Open Full Recovery Track</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
