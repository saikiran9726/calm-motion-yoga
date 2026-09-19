import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAppStore, ToastMessage } from '@/lib/store';
import { cn } from '@/lib/utils';

export const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-forest shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-coral-dark shrink-0" />,
    info: <Info className="w-5 h-5 text-forest shrink-0" />,
  };

  const bgMap = {
    success: 'bg-white border-sage/80 shadow-floating',
    warning: 'bg-white border-coral/60 shadow-floating',
    info: 'bg-white border-border-subtle shadow-floating',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.95 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 rounded-button border text-primary min-w-[280px] max-w-sm pointer-events-auto',
        bgMap[toast.type || 'info']
      )}
    >
      {iconMap[toast.type || 'info']}
      <div className="flex-1 text-left">
        <p className="text-caption-medium font-semibold text-primary">{toast.title}</p>
        {toast.description && (
          <p className="text-metadata text-secondary mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-secondary hover:text-primary p-1 rounded-lg hover:bg-forest/5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed top-4 inset-x-4 z-50 flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
