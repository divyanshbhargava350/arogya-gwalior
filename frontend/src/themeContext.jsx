import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from './translations';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('sanjeevani_theme') || 'sanjeevani-day');
  const [lang, setLang] = useState(() => localStorage.getItem('sanjeevani_lang') || 'en');
  const [liteMode, setLiteMode] = useState(() => localStorage.getItem('sanjeevani_lite') === 'true');

  useEffect(() => {
    localStorage.setItem('sanjeevani_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Toggle dark class for Tailwind
    if (theme === 'night-ward') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sanjeevani_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('sanjeevani_lite', liteMode);
  }, [liteMode]);

  const t = (key) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || key;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, lang, setLang, liteMode, setLiteMode, t }}>
      <div className={`theme-container theme-${theme} ${theme === 'night-ward' ? 'dark' : ''}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
