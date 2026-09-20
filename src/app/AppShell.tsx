import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '@/components/ui/Toast';
import { useAppStore } from '@/lib/store';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const { reducedMotion, setReducedMotion } = useAppStore();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [setReducedMotion]);

  // Check if we are on full-screen routes or detail screens with their own sticky primary button
  const hideBottomNav =
    location.pathname.startsWith('/design') ||
    location.pathname.startsWith('/yoga/pose') ||
    location.pathname.startsWith('/physio/recovery');

  const pageVariants = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reducedMotion ? 0 : -8 },
  };

  return (
    <div className="min-h-screen bg-[#F0F2EE] flex justify-center selection:bg-sage selection:text-forest">
      {/* Mobile viewport container */}
      <div className="w-full max-w-md min-h-screen bg-offwhite flex flex-col relative shadow-floating overflow-x-hidden">
        <ToastContainer />

        {/* Quiet offline indicator */}
        {!isOnline && (
          <div className="bg-forest text-offwhite px-4 py-1.5 text-metadata font-medium flex items-center justify-between border-b border-sage/20 z-40 select-none">
            <span className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5 text-sage" />
              <span>Working offline • On-device engine active</span>
            </span>
            <span className="text-[10px] text-sage/80 bg-white/10 px-2 py-0.5 rounded-pill font-mono">
              Offline
            </span>
          </div>
        )}

        <main className="flex-1 pb-24 pt-safe overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {!hideBottomNav && <BottomNav />}
      </div>
    </div>
  );
};
