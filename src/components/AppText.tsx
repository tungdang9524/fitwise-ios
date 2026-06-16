import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface AppTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodyBold' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'accent' | 'text' | 'textSecondary' | 'textMuted' | 'success' | 'warning' | 'error';
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  variant = 'body',
  color = 'text',
  style,
  numberOfLines,
}) => {
  const { theme } = useTheme();

  // Color mapping
  let textColor = theme.text;
  if (color === 'primary') textColor = theme.primary;
  else if (color === 'secondary') textColor = theme.secondary;
  else if (color === 'accent') textColor = theme.accent;
  else if (color === 'textSecondary') textColor = theme.textSecondary;
  else if (color === 'textMuted') textColor = theme.textMuted;
  else if (color === 'success') textColor = theme.success;
  else if (color === 'warning') textColor = theme.warning;
  else if (color === 'error') textColor = theme.error;

  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        { color: textColor },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    // Normal sans-serif default font
    fontFamily: 'System',
  },
  h1: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
