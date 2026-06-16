// Modern dynamic theme colors for Fitwise (Aesthetics: Dark Slate & Electric Lime/Coral Accent)
export const themeColors = {
  dark: {
    background: '#0c0f12', // Deep Space Slate
    surface: '#171c22', // Dark Card Surface
    surfaceElevated: '#222932', // Elevated Card Surface for inputs/overlays
    border: 'rgba(255, 255, 255, 0.08)', // Thin translucent border for glassmorphism
    borderActive: '#aeff00', // Electric Lime border

    text: '#ffffff', // High contrast white
    textSecondary: '#94a3b8', // Muted slate gray
    textMuted: '#64748b', // Highly muted slate gray for labels

    primary: '#aeff00', // Electric Lime
    secondary: '#ff5d3b', // Coral Orange
    accent: '#00e5ff', // Neon Cyan (hydration/water tracker)

    success: '#10b981', // Emerald Green
    warning: '#f59e0b', // Amber Orange
    error: '#ef4444', // Red

    glassBg: 'rgba(23, 28, 34, 0.75)', // Glassmorphic translucent background
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceElevated: '#f1f5f9',
    border: 'rgba(0, 0, 0, 0.06)',
    borderActive: '#82c000',

    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',

    primary: '#82c000', // Subdued lime
    secondary: '#e14d2a', // Subdued coral
    accent: '#06b6d4', // Subdued cyan

    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',

    glassBg: 'rgba(255, 255, 255, 0.85)',
    overlay: 'rgba(0, 0, 0, 0.3)',
  }
};

export type ThemeType = 'dark' | 'light';
