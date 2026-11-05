import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { STRINGS } from './strings';

const LanguageContext = createContext(null);

function initialLanguage() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'sw') return saved;
  } catch {}
  return navigator.language?.toLowerCase().startsWith('sw') ? 'sw' : 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang]);

  // Falls back to English, then to the key itself, so a missing string is visible but harmless
  const t = useCallback((key) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key, [lang]);
  const toggle = useCallback(() => setLang((l) => (l === 'en' ? 'sw' : 'en')), []);

  return (
    <LanguageContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
