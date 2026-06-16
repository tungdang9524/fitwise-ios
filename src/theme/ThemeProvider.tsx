import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { themeColors, ThemeType } from './colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  theme: typeof themeColors.dark;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@fitwise_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeType, setThemeTypeState] = useState<ThemeType>('dark'); // Default to dark mode

  useEffect(() => {
    // Load persisted theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeTypeState(savedTheme as ThemeType);
                } else if (systemScheme === 'light' || systemScheme === 'dark') {
          setThemeTypeState(systemScheme);
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, [systemScheme]);

  const setThemeType = async (type: ThemeType) => {
    try {
      setThemeTypeState(type);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, type);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const isDark = themeType === 'dark';
  const theme = isDark ? themeColors.dark : themeColors.light;

  return (
    <ThemeContext.Provider value={{ theme, themeType, setThemeType, isDark }}>
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
