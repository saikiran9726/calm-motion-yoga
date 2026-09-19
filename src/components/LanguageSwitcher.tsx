import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు' },
  ];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 bg-forest/5 p-1 rounded-pill border border-border-subtle text-caption-medium select-none',
        className
      )}
    >
      <div className="pl-2 pr-1 text-forest">
        <Globe className="w-3.5 h-3.5" />
      </div>
      {languages.map((lang) => {
        const isActive = i18n.language.startsWith(lang.code);
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => i18n.changeLanguage(lang.code)}
            className={cn(
              'px-2.5 py-1 rounded-pill text-metadata transition-colors duration-fast cursor-pointer',
              isActive
                ? 'bg-white text-forest font-semibold shadow-soft'
                : 'text-secondary hover:text-primary'
            )}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
};
