import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const ACCENT_LIGHT = '#1D95A6';
export const ACCENT_DARK = '#D6A429';

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('ain-dark') === '1');

  useEffect(() => {
    localStorage.setItem('ain-dark', dark ? '1' : '0');
  }, [dark]);

  const accent = dark ? ACCENT_DARK : ACCENT_LIGHT;
  const accentContrast = dark ? '#1A1305' : '#FFFFFF';
  const accentSoft = dark ? 'rgba(214,164,41,0.15)' : 'rgba(29,149,166,0.12)';
  const accentBorderSoft = dark ? 'rgba(214,164,41,0.45)' : 'rgba(29,149,166,0.35)';

  const theme = {
    bg: dark ? '#0F1115' : '#F7F2E7',
    sidebarBg: dark ? '#14161C' : '#FFFFFF',
    sidebarBorder: dark ? 'border-gray-800' : 'border-gray-200',
    card: dark ? '#171A21' : '#F3F4F6',
    cardBorder: dark ? 'border-gray-800' : 'border-gray-300',
    textPrimary: dark ? 'text-gray-100' : 'text-gray-800',
    textSecondary: dark ? 'text-gray-400' : 'text-gray-500',
    textMuted: dark ? 'text-gray-500' : 'text-gray-400',
    divide: dark ? 'divide-gray-800' : 'divide-gray-200',
    border: dark ? 'border-gray-800' : 'border-gray-200',
    navInactive: dark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100',
    hover: dark ? 'hover:bg-white/5' : 'hover:bg-gray-50',
    inputBg: dark ? '#171A21' : '#FFFFFF',
  };

  return (
    <ThemeContext.Provider value={{ dark, setDark, accent, accentContrast, accentSoft, accentBorderSoft, theme }}>
      <style>{`
        .ain-accent-solid { background-color: ${accent}; color: ${accentContrast}; }
        .ain-accent-text { color: ${accent}; }
        .ain-accent-bg-soft { background-color: ${accentSoft}; color: ${accent}; }
        .ain-accent-hover:hover { border-color: ${accentBorderSoft}; }
        .ain-pill-active { background-color: ${accent}; color: ${accentContrast}; }
        .ain-accent-border { border-color: ${accent}; }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
