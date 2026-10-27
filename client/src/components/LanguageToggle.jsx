import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

// Shows the name of the language you can switch to
export default function LanguageToggle({ className = '' }) {
  const { lang, t, toggle } = useLanguage();
  return (
    <button type="button" onClick={toggle}
      aria-label={lang === 'en' ? 'Badilisha lugha kuwa Kiswahili' : 'Switch language to English'}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${className}`}>
      <Languages size={15} aria-hidden="true" />
      <span className="hidden sm:inline">{t('lang.toggle')}</span>
      {/* Short code on phones so the header keeps room for the farm name */}
      <span className="sm:hidden">{lang === 'en' ? 'SW' : 'EN'}</span>
    </button>
  );
}
