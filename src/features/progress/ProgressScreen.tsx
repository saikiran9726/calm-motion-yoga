import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, ProgressRing, Skeleton, EmptyState } from '@/components/ui';
import { CheckCircle2, Flame, Calendar, Activity, ArrowUpRight, Sparkles } from 'lucide-react';

export const ProgressScreen: React.FC = () => {
  const { t } = useTranslation();
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'empty'>('normal');

  return (
    <div className="p-5 pb-28 space-y-6 select-none bg-offwhite min-h-screen">
      {/* Top Header with subtle state toggle for review */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-heading font-bold text-primary tracking-tight">
            {t('progress.title', 'Your Journey')}
          </h1>
          <p className="text-caption text-secondary mt-0.5">
            Simple, grounded movement consistency over time.
          </p>
        </div>

        {/* Quick state switcher for reviewers */}
        <div className="flex bg-forest/5 p-1 rounded-pill border border-border-subtle text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setViewState('normal')}
            className={`px-2 py-0.5 rounded-pill transition-colors ${
              viewState === 'normal' ? 'bg-forest text-offwhite shadow-soft' : 'text-secondary'
            }`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => setViewState('loading')}
            className={`px-2 py-0.5 rounded-pill transition-colors ${
              viewState === 'loading' ? 'bg-forest text-offwhite shadow-soft' : 'text-secondary'
            }`}
          >
            Loading
          </button>
          <button
            type="button"
            onClick={() => setViewState('empty')}
            className={`px-2 py-0.5 rounded-pill transition-colors ${
              viewState === 'empty' ? 'bg-forest text-offwhite shadow-soft' : 'text-secondary'
            }`}
          >
            Empty
          </button>
        </div>
      </div>

      {viewState === 'loading' && (
        <div className="space-y-4">
          <Skeleton variant="rounded" className="h-40 w-full rounded-card" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton variant="rounded" className="h-24 w-full rounded-card" />
            <Skeleton variant="rounded" className="h-24 w-full rounded-card" />
            <Skeleton variant="rounded" className="h-24 w-full rounded-card" />
          </div>
          <Skeleton variant="rounded" className="h-48 w-full rounded-card" />
        </div>
      )}

      {viewState === 'empty' && (
        <EmptyState
          title="No Movement Logs Yet"
          description="Complete your first morning session or yoga practice to begin your consistency record."
          actionLabel="Start Daily Practice"
          onAction={() => setViewState('normal')}
        />
      )}

      {viewState === 'normal' && (
        <>
          {/* Main Consistency Ring */}
          <Card variant="default" className="p-6 flex items-center justify-between shadow-card">
            <div className="space-y-1">
              <span className="text-metadata font-bold text-secondary uppercase tracking-wider">
                {t('progress.consistency', 'Weekly Consistency')}
              </span>
              <h2 className="text-display text-forest font-bold">78%</h2>
              <p className="text-caption text-secondary">5 of 6 planned sessions completed</p>
              <div className="flex items-center gap-1.5 text-metadata text-forest font-semibold pt-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>On track for monthly recovery goal</span>
              </div>
            </div>

            <ProgressRing value={78} size={94} strokeWidth={9} variant="forest" />
          </Card>

          {/* 3 Key Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <Card variant="sage" className="p-3.5 text-center space-y-1 rounded-card-sm">
              <Calendar className="w-4 h-4 text-forest mx-auto opacity-70" />
              <span className="text-title font-bold text-forest block">5 / 6</span>
              <span className="text-metadata text-secondary block leading-tight">
                {t('progress.completedSessions', 'Sessions')}
              </span>
            </Card>

            <Card variant="sand" className="p-3.5 text-center space-y-1 rounded-card-sm">
              <Activity className="w-4 h-4 text-primary mx-auto opacity-70" />
              <span className="text-title font-bold text-primary block">31</span>
              <span className="text-metadata text-secondary block leading-tight">
                {t('progress.exercisesDone', 'Exercises')}
              </span>
            </Card>

            <Card variant="lavender" className="p-3.5 text-center space-y-1 rounded-card-sm">
              <Flame className="w-4 h-4 text-forest mx-auto opacity-70" />
              <span className="text-title font-bold text-primary block">8 d</span>
              <span className="text-metadata text-secondary block leading-tight">
                {t('progress.streak', 'Best Streak')}
              </span>
            </Card>
          </div>

          {/* Movement Improvement - Week 1 -> Week 2 -> Week 3 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-metadata font-bold text-secondary uppercase tracking-wider">
                {t('progress.movementImprovement', 'Movement Improvement')}
              </span>
              <span className="text-metadata text-forest font-semibold flex items-center">
                +34° range increase <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </span>
            </div>

            <Card variant="default" className="p-5 space-y-4 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-body-medium font-bold text-primary">
                    {t('progress.shoulderMobility', 'Shoulder Mobility')}
                  </h3>
                  <p className="text-caption text-forest font-semibold mt-0.5">
                    "Your shoulder lift is improving."
                  </p>
                </div>
                <span className="text-metadata font-medium text-forest bg-sage/60 px-2.5 py-0.5 rounded-pill">
                  Supervised Track
                </span>
              </div>

              {/* Simple 3-step progression timeline */}
              <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
                <div className="bg-forest/5 rounded-card-sm p-3 space-y-1">
                  <span className="text-metadata text-secondary block">
                    {t('progress.week1', 'Week 1')}
                  </span>
                  <span className="text-title font-bold text-secondary">62°</span>
                  <div className="h-1.5 w-full bg-forest/20 rounded-pill mt-2">
                    <div className="h-full bg-secondary rounded-pill" style={{ width: '45%' }} />
                  </div>
                </div>

                <div className="bg-forest/5 rounded-card-sm p-3 space-y-1">
                  <span className="text-metadata text-secondary block">
                    {t('progress.week2', 'Week 2')}
                  </span>
                  <span className="text-title font-bold text-secondary">78°</span>
                  <div className="h-1.5 w-full bg-forest/20 rounded-pill mt-2">
                    <div className="h-full bg-secondary rounded-pill" style={{ width: '65%' }} />
                  </div>
                </div>

                <div className="bg-sage/40 rounded-card-sm p-3 space-y-1 border-2 border-forest/20 shadow-soft">
                  <span className="text-metadata font-bold text-forest block">
                    {t('progress.week3', 'Week 3')}
                  </span>
                  <span className="text-title font-bold text-forest">95°</span>
                  <div className="h-1.5 w-full bg-forest/15 rounded-pill mt-2">
                    <div className="h-full bg-forest rounded-pill" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-caption text-secondary border-t border-border-subtle">
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                <span>Steady scapular rotation achieved without muscle guarding or pinch pain.</span>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
