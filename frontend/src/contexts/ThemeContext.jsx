import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useFinance } from './FinanceContext';

const ThemeContext = createContext(null);

const THEMES = ['dark', 'light', 'ocean'];

export function ThemeProvider({ children }) {
  const { data, save } = useFinance();

  const appearance = data?.appearance || { theme: 'dark', accent: '#00E5A0', currency: '₹ INR', language: 'English' };

  // Apply theme to <html> data-theme attribute
  useEffect(() => {
    const theme = appearance.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [appearance.theme]);

  // Apply accent colour as CSS variable
  useEffect(() => {
    const accent = appearance.accent || '#00E5A0';
    document.documentElement.style.setProperty('--primary', accent);
  }, [appearance.accent]);

  const setTheme = useCallback((theme) => {
    if (!data) return;
    const updated = { ...data, appearance: { ...data.appearance, theme } };
    save(updated);
  }, [data, save]);

  const setAccent = useCallback((accent) => {
    if (!data) return;
    const updated = { ...data, appearance: { ...data.appearance, accent } };
    save(updated);
  }, [data, save]);

  const setCurrency = useCallback((currency) => {
    if (!data) return;
    const updated = { ...data, appearance: { ...data.appearance, currency } };
    save(updated);
  }, [data, save]);

  const setLanguage = useCallback((language) => {
    if (!data) return;
    const updated = { ...data, appearance: { ...data.appearance, language } };
    save(updated);
  }, [data, save]);

  const value = useMemo(() => ({
    appearance, themes: THEMES, setTheme, setAccent, setCurrency, setLanguage,
  }), [appearance, setTheme, setAccent, setCurrency, setLanguage]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
