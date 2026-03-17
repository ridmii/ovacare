import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from './GlassCard';

export function TranslationDemo() {
  const { t, i18n } = useTranslation();

  const demoTranslations = [
    { key: 'navbar.home', label: 'Navigation - Home' },
    { key: 'hero.title', label: 'Hero Title' },
    { key: 'hero.description', label: 'Hero Description' },
    { key: 'scan.title', label: 'Scan Page Title' },
    { key: 'common.loading', label: 'Loading Text' }
  ];

  return (
    <GlassCard className="p-6 m-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-ovacare-navy mb-2">
          🌐 Multi-Language Support Demo
        </h2>
        <p className="text-ovacare-gray">
          Current Language: <span className="font-semibold">{i18n.language.toUpperCase()}</span>
        </p>
      </div>

      <div className="grid gap-4">
        {demoTranslations.map((item) => (
          <div key={item.key} className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
            <div className="text-sm text-ovacare-gray">{item.label}:</div>
            <div className="text-ovacare-navy font-medium">{t(item.key)}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-ovacare-gray">
          Switch languages using the globe icon (🌐) in the navigation bar
        </p>
      </div>
    </GlassCard>
  );
}