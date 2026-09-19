import React from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw, ArrowRight, ShieldCheck, FileDown, AlertCircle, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui';

export interface CompletionSheetProps {
  repsCompleted: number;
  totalReps: number;
  peakRom?: number;
  formQuality?: 'Excellent' | 'Good' | 'Needs Attention';
  encouragementSentence?: string;
  painBefore?: number;
  painAfter?: number;
  painInterrupted?: boolean;
  isSynced?: boolean;
  onDownloadPdf?: () => void;
  onNextExercise: () => void;
  onRepeat: () => void;
}

export const CompletionSheet: React.FC<CompletionSheetProps> = ({
  repsCompleted = 10,
  totalReps = 10,
  peakRom = 92,
  formQuality = 'Excellent',
  encouragementSentence = 'Your hip stability and shoulder balance were remarkably consistent throughout the movement.',
  painBefore = 2,
  painAfter = 2,
  painInterrupted = false,
  isSynced = true,
  onDownloadPdf,
  onNextExercise,
  onRepeat,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/65 backdrop-blur-sm select-none overflow-y-auto">
      {/* Soft Expanding Check Animation in Center */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center pointer-events-none min-h-[160px]">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.15, 1], opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-floating ${
            painInterrupted ? 'bg-coral-light border-coral text-coral-dark' : 'bg-forest border-sage/80 text-sage'
          }`}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            className={`absolute inset-0 rounded-full border-2 ${
              painInterrupted ? 'border-coral' : 'border-sage'
            }`}
          />
          {painInterrupted ? (
            <AlertCircle className="w-12 h-12 stroke-[2.5]" />
          ) : (
            <Check className="w-12 h-12 stroke-[3]" />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-3"
        >
          <h2 className="text-display text-white font-bold tracking-tight">
            {painInterrupted ? 'Session Paused for Safety' : 'Practice Completed'}
          </h2>
          <p className="text-caption text-sage/80 mt-0.5">
            {painInterrupted
              ? 'Clinical pain-stop rule safely protected your joint'
              : 'Logged safely in your on-device movement journal'}
          </p>
        </motion.div>
      </div>

      {/* Summary Bottom Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-md mx-auto bg-white rounded-t-[32px] p-5 pb-safe shadow-modal border-t border-border-subtle space-y-4 text-primary"
      >
        <div className="w-12 h-1.5 rounded-full bg-forest/15 mx-auto -mt-1" />

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 bg-forest/5 rounded-card-sm border border-border-subtle text-center">
            <span className="text-[11px] text-secondary font-bold uppercase tracking-wider block">Reps</span>
            <span className="text-title font-bold text-forest block mt-0.5">
              {repsCompleted} / {totalReps}
            </span>
            <span className="text-[10px] text-secondary">Completed</span>
          </div>

          <div className="p-3 bg-sage/30 rounded-card-sm border border-sage/50 text-center">
            <span className="text-[11px] text-forest font-bold uppercase tracking-wider block">Peak ROM</span>
            <span className="text-title font-bold text-forest block mt-0.5">
              {peakRom}°
            </span>
            <span className="text-[10px] text-forest font-medium">{formQuality}</span>
          </div>

          <div className="p-3 bg-sand/30 rounded-card-sm border border-sand/50 text-center">
            <span className="text-[11px] text-secondary font-bold uppercase tracking-wider block">Pain</span>
            <span className="text-title font-bold text-primary block mt-0.5">
              {painBefore} → {painAfter}
            </span>
            <span className="text-[10px] text-secondary">Self-Report</span>
          </div>
        </div>

        {/* Clinical Guidance / Encouragement Note */}
        <div className={`p-3.5 rounded-card-sm border text-caption leading-relaxed font-medium ${
          painInterrupted
            ? 'bg-coral-light/30 border-coral/40 text-primary'
            : 'bg-sand/30 border-sand/60 text-primary'
        }`}>
          "{encouragementSentence}"
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center justify-between text-metadata px-1 text-secondary">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            100% on-device edge AI
          </span>
          <span className="flex items-center gap-1 text-forest font-semibold">
            {isSynced ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Clinic Synced
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                Saved in offline outbox
              </>
            )}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* PDF Download Button */}
          {onDownloadPdf && (
            <Button
              variant="secondary"
              size="full"
              leftIcon={<FileDown className="w-4 h-4 text-forest" />}
              onClick={onDownloadPdf}
              className="bg-forest/5 hover:bg-forest/10 border-forest/20 text-forest font-bold"
            >
              Download Session Report (PDF)
            </Button>
          )}

          <Button
            variant="coral"
            size="full"
            rightIcon={<ArrowRight className="w-5 h-5" />}
            onClick={onNextExercise}
          >
            Finish Session
          </Button>

          <Button
            variant="ghost"
            size="full"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={onRepeat}
            className="text-secondary hover:text-primary"
          >
            Repeat Movement
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
