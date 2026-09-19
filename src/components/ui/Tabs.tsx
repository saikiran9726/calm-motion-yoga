import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center space-x-1 border-b border-border-subtle overflow-x-auto no-scrollbar',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-4 py-3 text-caption-medium transition-colors whitespace-nowrap cursor-pointer select-none',
              isActive ? 'text-forest font-semibold' : 'text-secondary hover:text-primary'
            )}
          >
            <span className="flex items-center gap-1.5">
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-pill text-[11px] font-bold transition-colors',
                    isActive ? 'bg-forest text-offwhite' : 'bg-forest/5 text-secondary'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>

            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest rounded-full"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
