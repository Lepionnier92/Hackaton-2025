import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  tabBar: string;
  tabBarBorder: string;
  inputBackground: string;
  divider: string;
}

// Palette: #006241 (vert foncé), #d4e9e2 (vert clair), #1e3932 (vert très foncé), #dff9ba (vert lime)
export const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  backgroundSecondary: '#d4e9e2',
  card: '#FFFFFF',
  cardBorder: '#d4e9e2',
  text: '#1e3932',
  textSecondary: '#006241',
  textMuted: '#6b7280',
  primary: '#006241',
  primaryLight: '#d4e9e2',
  accent: '#006241',
  success: '#006241',
  warning: '#f97316',
  error: '#ef4444',
  tabBar: '#FFFFFF',
  tabBarBorder: '#d4e9e2',
  inputBackground: '#d4e9e2',
  divider: '#d4e9e2',
};

export const darkTheme: ThemeColors = {
  background: '#1e3932',
  backgroundSecondary: '#0f1f1c',
  card: '#006241',
  cardBorder: '#006241',
  text: '#FFFFFF',
  textSecondary: '#d4e9e2',
  textMuted: '#9CA3AF',
  primary: '#006241',
  primaryLight: '#dff9ba',
  accent: '#dff9ba',
  success: '#dff9ba',
  warning: '#f97316',
  error: '#ef4444',
  tabBar: '#1e3932',
  tabBarBorder: '#006241',
  inputBackground: '#006241',
  divider: '#006241',
};

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@tenex_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    loadStoredTheme();
  }, []);

  const loadStoredTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setThemeModeState(storedTheme);
      }
    } catch (error) {
      console.error('Erreur chargement thème:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Erreur sauvegarde thème:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isDark = themeMode === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        toggleTheme,
        setThemeMode,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
}
