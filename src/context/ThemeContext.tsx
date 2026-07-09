import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  colorName: string;
  colors: {
    50: string;
    100: string;
    200: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  sidebarBg: string;
  sidebarBorder: string;
  sidebarHover: string;
}

export const themes: Theme[] = [
  {
    id: 'indigo',
    name: 'Xanh Indigo (Mặc định)',
    colorName: 'Indigo',
    colors: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },
    sidebarBg: '#0f172a',      // slate-900
    sidebarBorder: '#1e293b',  // slate-800
    sidebarHover: '#1e293b',   // slate-800
  },
  {
    id: 'emerald',
    name: 'Xanh Lục Bảo (Emerald)',
    colorName: 'Emerald',
    colors: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
    sidebarBg: '#022c22',      // emerald-950
    sidebarBorder: '#064e3b',  // emerald-900
    sidebarHover: '#064e3b',   // emerald-900
  },
  {
    id: 'violet',
    name: 'Tím Hoàng Gia (Violet)',
    colorName: 'Violet',
    colors: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
    },
    sidebarBg: '#1e1b4b',      // indigo-950
    sidebarBorder: '#312e81',  // indigo-900
    sidebarHover: '#312e81',   // indigo-900
  },
  {
    id: 'rose',
    name: 'Hồng Tinh Tế (Rose)',
    colorName: 'Rose',
    colors: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
      950: '#4c0519',
    },
    sidebarBg: '#1c1917',      // stone-900
    sidebarBorder: '#292524',  // stone-800
    sidebarHover: '#292524',   // stone-800
  },
  {
    id: 'amber',
    name: 'Vàng Hổ Phách (Amber)',
    colorName: 'Amber',
    colors: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    sidebarBg: '#1c1917',      // stone-900
    sidebarBorder: '#292524',  // stone-800
    sidebarHover: '#292524',   // stone-800
  },
  {
    id: 'dark-slate',
    name: 'Đen Đá Obsidian (Obsidian)',
    colorName: 'Obsidian',
    colors: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    sidebarBg: '#020617',      // slate-950
    sidebarBorder: '#0f172a',  // slate-900
    sidebarHover: '#0f172a',   // slate-900
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  setThemeById: (id: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  // Apply theme colors to root document element style properties
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // Set color variables
    root.style.setProperty('--primary-50', theme.colors[50]);
    root.style.setProperty('--primary-100', theme.colors[100]);
    root.style.setProperty('--primary-200', theme.colors[200]);
    root.style.setProperty('--primary-500', theme.colors[500]);
    root.style.setProperty('--primary-600', theme.colors[600]);
    root.style.setProperty('--primary-700', theme.colors[700]);
    root.style.setProperty('--primary-800', theme.colors[800]);
    root.style.setProperty('--primary-900', theme.colors[900]);
    root.style.setProperty('--primary-950', theme.colors[950]);
    
    // Set sidebar variables
    root.style.setProperty('--sidebar-bg', theme.sidebarBg);
    root.style.setProperty('--sidebar-border', theme.sidebarBorder);
    root.style.setProperty('--sidebar-hover', theme.sidebarHover);
  };

  useEffect(() => {
    const savedThemeId = localStorage.getItem('englishpro-theme-id');
    if (savedThemeId) {
      const found = themes.find(t => t.id === savedThemeId);
      if (found) {
        setCurrentTheme(found);
        applyTheme(found);
      } else {
        applyTheme(themes[0]);
      }
    } else {
      applyTheme(themes[0]);
    }
  }, []);

  const setThemeById = (id: string) => {
    const found = themes.find(t => t.id === id);
    if (found) {
      setCurrentTheme(found);
      applyTheme(found);
      localStorage.setItem('englishpro-theme-id', id);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setThemeById, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
