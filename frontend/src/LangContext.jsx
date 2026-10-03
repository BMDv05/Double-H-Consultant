import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LANGS, translate } from './i18n.js';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('dh-lang');
    return LANGS[saved] ? saved : 'en';
  });

  useEffect(() => {
    const dir = LANGS[lang].dir;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem('dh-lang', lang);
    document.title =
      lang === 'ar'
        ? 'دبل إتش للاستشارات — استشارات بشهادات أمريكية'
        : 'Double H Consulting — American-Certified Expertise';
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      dir: LANGS[lang].dir,
      setLang: (l) => setLangState(LANGS[l] ? l : 'en'),
      t: (key) => translate(lang, key),
    }),
    [lang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
