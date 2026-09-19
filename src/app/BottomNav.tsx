import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Compass, TrendingUp, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', label: t('nav.home', 'Home'), icon: Home },
    { to: '/explore', label: t('nav.explore', 'Explore'), icon: Compass },
    { to: '/progress', label: t('nav.progress', 'Progress'), icon: TrendingUp },
    { to: '/profile', label: t('nav.you', 'You'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-border-subtle/80 pb-safe shadow-modal">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center justify-center py-1 px-3 min-w-[48px] min-h-[48px] rounded-xl transition-colors duration-fast select-none cursor-pointer',
                  isActive ? 'text-forest font-semibold' : 'text-secondary hover:text-primary'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex items-center justify-center w-8 h-8">
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        className="absolute inset-0 bg-sage/60 rounded-full z-0"
                      />
                    )}
                    <Icon
                      className={cn(
                        'w-5 h-5 relative z-10 transition-transform duration-fast',
                        isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                      )}
                    />
                  </div>
                  <span className="text-[11px] mt-0.5 tracking-tight relative z-10">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
