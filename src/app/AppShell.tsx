import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '@/components/ui/Toast';
import { useAppStore } from '@/lib/store';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const { reducedMotion, setReducedMotion } = useAppStore();

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
