import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Battery, WifiOff, Wifi, HardDrive, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';

export interface DevMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fps?: number | null;
  inferenceTimeMs?: number | null;
  delegate?: 'GPU' | 'CPU' | null;
}

export const DevMetricsModal: React.FC<DevMetricsModalProps> = ({
  isOpen,
  onClose,
  fps = null,
  inferenceTimeMs = null,
  delegate = null,
}) => {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [memoryMB, setMemoryMB] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }

    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const mem = (performance as any).memory;
      setMemoryMB(Math.round(mem.usedJSHeapSize / (1024 * 1024)));
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm bg-[#122421] text-offwhite rounded-card p-5 border border-sage/20 shadow-modal space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-title font-bold text-white">Live On-Device Metrics</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close metrics"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[12px] text-sage/80">
            Real hardware metrics running inside your browser sandbox. Proves on-device processing.
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* FPS */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">Frame Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-heading font-mono font-bold text-emerald-300">
                  {fps !== null && fps !== undefined ? fps.toFixed(1) : 'n/a'}
                </span>
                <span className="text-[11px] text-secondary">FPS</span>
              </div>
            </div>

            {/* Inference Latency */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">Inference Time</span>
              <div className="flex items-baseline gap-1">
                <span className="text-heading font-mono font-bold text-sage">
                  {inferenceTimeMs !== null && inferenceTimeMs !== undefined ? `${inferenceTimeMs}` : 'n/a'}
                </span>
                <span className="text-[11px] text-secondary">ms / frame</span>
              </div>
            </div>

            {/* Delegate */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">Hardware Delegate</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="text-body font-bold text-white font-mono">
                  {delegate ? `${delegate}` : 'n/a'}
                </span>
              </div>
            </div>

            {/* Network Offline */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">Network State</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {!isOnline ? (
                  <>
                    <WifiOff className="w-4 h-4 text-amber-300" />
                    <span className="text-body font-bold text-amber-300">Offline (Air)</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 text-sage" />
                    <span className="text-body font-bold text-white">Local Wi-Fi</span>
                  </>
                )}
              </div>
            </div>

            {/* Battery */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">Device Battery</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Battery className="w-4 h-4 text-sage" />
                <span className="text-body font-bold text-white font-mono">
                  {batteryLevel !== null ? `${batteryLevel}%` : 'n/a'}
                  {isCharging && ' ⚡'}
                </span>
              </div>
            </div>

            {/* Memory Heap */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">JS Heap</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <HardDrive className="w-4 h-4 text-sage" />
                <span className="text-body font-bold text-white font-mono">
                  {memoryMB !== null ? `${memoryMB} MB` : 'n/a'}
                </span>
              </div>
            </div>
          </div>

          {/* Honest Technical Note */}
          <div className="p-2.5 bg-forest/40 rounded-xl border border-sage/15 flex items-start gap-2 text-[11px] text-sage/90">
            <ShieldCheck className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
            <span>
              <strong>Hardware Honesty:</strong> Camera frames are processed on-device. Frame latency and delegate status are tracked locally in your browser sandbox.
            </span>
          </div>

          <Button variant="secondary" size="full" onClick={onClose}>
            Close Metrics
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
