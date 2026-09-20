import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  Circle,
  AlertCircle,
  Play,
  HelpCircle
} from 'lucide-react';
import { Button, PainSlider, BottomSheet } from '@/components/ui';
import { PHYSIO_PROGRAMS, PhysioExercise } from '@/data/physio';
import { useAppStore } from '@/lib/store';

export const MyRecoveryScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    activePhysioProgramId,
    setActivePhysioProgramId,
    physioChecklist,
    togglePhysioExercise,
    painScore,
    setPainScore,
    addToast,
  } = useAppStore();

  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<PhysioExercise | null>(null);

  const currentProgram = PHYSIO_PROGRAMS[activePhysioProgramId] || PHYSIO_PROGRAMS['shoulder-mobility'];

  const handleContinue = () => {
    addToast({
      title: 'Pain score recorded',
      description: `Pain level ${painScore}/10 noted for today's session.`,
      type: 'info',
    });
    navigate('/session');
  };

  return (
    <div className="p-5 pb-32 space-y-6 select-none bg-offwhite min-h-screen">
      {/* Top Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="w-10 h-10 rounded-full bg-forest/5 hover:bg-forest/10 flex items-center justify-center text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-metadata font-bold text-forest bg-sage/60 px-3 py-1 rounded-pill flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          Clinical Recovery Track
        </span>
      </div>

      {/* Program Selector Tabs (Shoulder Mobility & Knee Strength) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h1 className="text-display font-bold text-primary tracking-tight">
            My Recovery
          </h1>
          {/* Program Toggle Button */}
          <div className="flex gap-1 bg-forest/5 p-1 rounded-pill border border-border-subtle">
            <button
              type="button"
              onClick={() => setActivePhysioProgramId('shoulder-mobility')}
              className={`px-3 py-1 rounded-pill text-metadata font-bold transition-colors cursor-pointer ${
                activePhysioProgramId === 'shoulder-mobility'
                  ? 'bg-forest text-offwhite shadow-soft'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Shoulder
            </button>
            <button
              type="button"
              onClick={() => setActivePhysioProgramId('knee-strength')}
              className={`px-3 py-1 rounded-pill text-metadata font-bold transition-colors cursor-pointer ${
                activePhysioProgramId === 'knee-strength'
                  ? 'bg-forest text-offwhite shadow-soft'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Knee
            </button>
          </div>
        </div>
        <p className="text-caption text-secondary">
          Structured, step-by-step rehabilitation supervised by {currentProgram.assignedBy}.
        </p>
      </div>

      {/* 1. Program Card: Title, Week 3 of 6, 78% complete */}
      <div className="bg-white rounded-card p-5 border border-border-subtle shadow-card space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-metadata font-bold text-forest uppercase tracking-wider block">
              Active Prescription
            </span>
            <h2 className="text-title font-bold text-primary">{currentProgram.title}</h2>
            <p className="text-caption text-secondary">{currentProgram.subtitle}</p>
          </div>
          <span className="text-caption-medium font-bold text-forest bg-sage/60 px-3 py-1 rounded-pill shrink-0">
            Week {currentProgram.currentWeek} of {currentProgram.totalWeeks}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-metadata font-bold text-secondary">
            <span>Overall Recovery Progress</span>
            <span className="text-forest">{currentProgram.completionPercent}% Complete</span>
          </div>
          <div className="w-full bg-forest/10 rounded-pill h-2.5 overflow-hidden">
            <div
              className="bg-forest h-full rounded-pill transition-all duration-gentle"
              style={{ width: `${currentProgram.completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Today's Exercises Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-metadata font-bold text-secondary uppercase tracking-wider">
            Today's Exercises ({currentProgram.exercises.length} total)
          </span>
          <span className="text-metadata text-secondary">Tap name for guidance</span>
        </div>

        <div className="space-y-2.5">
          {currentProgram.exercises.map((ex) => {
            const isDone = physioChecklist[ex.id] ?? ex.done;
            return (
              <div
                key={ex.id}
                className={`p-4 rounded-card-sm border transition-all flex items-center justify-between ${
                  isDone
                    ? 'bg-sage/20 border-sage/60'
                    : 'bg-white border-border-subtle hover:border-forest/20'
                }`}
              >
                {/* Clickable toggle check button */}
                <button
                  type="button"
                  onClick={() => togglePhysioExercise(ex.id)}
                  className="flex items-start gap-3 text-left flex-1 cursor-pointer select-none"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isDone ? 'bg-forest text-offwhite shadow-soft' : 'border-2 border-secondary/40'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 fill-current stroke-white" />
                    ) : (
                      <Circle className="w-3 h-3 text-transparent" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-body-medium font-bold ${
                          isDone ? 'text-primary/70 line-through' : 'text-primary'
                        }`}
                      >
                        {ex.name}
                      </h4>
                      {ex.previewOnly && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Preview only
                        </span>
                      )}
                    </div>
                    <p className="text-metadata text-secondary">{ex.defaultReps} • {ex.targetArea}</p>
                  </div>
                </button>

                {/* Details Button */}
                <button
                  type="button"
                  onClick={() => setSelectedExerciseForModal(ex)}
                  className="p-2 rounded-full hover:bg-forest/5 text-secondary hover:text-primary transition-colors cursor-pointer"
                  title="View exercise instructions"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. "Pain today?" slider 0 to 10 with friendly labels */}
      <div className="space-y-2">
        <span className="text-metadata font-bold text-secondary uppercase tracking-wider block">
          Daily Pain Self-Assessment
        </span>
        <PainSlider
          value={painScore}
          onChange={setPainScore}
          label="How much pain/discomfort do you feel today?"
        />
      </div>

      {/* 4. Medical Disclaimer line */}
      <div className="p-3.5 rounded-input bg-sand/30 border border-sand/60 text-metadata text-secondary flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-forest shrink-0" />
        <span>This app gives movement guidance and is not a medical diagnosis.</span>
      </div>

      {/* Sticky Bottom Action: Continue Button */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-4 border-t border-border-subtle shadow-modal z-30 max-w-md mx-auto pb-safe">
        <Button
          variant="coral"
          size="full"
          rightIcon={<Play className="w-5 h-5 fill-current" />}
          onClick={handleContinue}
        >
          Continue Today's Session
        </Button>
      </div>

      {/* Exercise Guidance BottomSheet Modal */}
      <BottomSheet
        isOpen={selectedExerciseForModal !== null}
        onClose={() => setSelectedExerciseForModal(null)}
        title={selectedExerciseForModal?.name || 'Exercise Guidance'}
      >
        {selectedExerciseForModal && (
          <div className="space-y-4 py-1 select-none">
            <div>
              <span className="text-metadata font-bold text-forest uppercase tracking-wider block">
                Target Muscle Group
              </span>
              <p className="text-caption text-primary font-medium">{selectedExerciseForModal.targetArea}</p>
            </div>

            <div className="p-3.5 bg-forest/5 rounded-card-sm border border-forest/10 space-y-1">
              <span className="text-caption-medium font-bold text-primary block">Clinical Movement Tip:</span>
              <p className="text-caption text-secondary leading-relaxed">
                {selectedExerciseForModal.guidance}
              </p>
            </div>

            <div className="p-3.5 bg-sage/30 rounded-card-sm border border-sage/50 space-y-1">
              <span className="text-caption-medium font-bold text-forest block">Focus Point:</span>
              <p className="text-caption text-secondary leading-relaxed">
                {selectedExerciseForModal.focusPoint}
              </p>
            </div>

            <div className="p-3 bg-coral-light/40 rounded-card-sm border border-coral/30 text-metadata text-secondary flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-coral-dark shrink-0 mt-0.5" />
              <span>{selectedExerciseForModal.contraindications}</span>
            </div>

            <Button
              variant="primary"
              size="full"
              onClick={() => setSelectedExerciseForModal(null)}
            >
              Close Instructions
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};
