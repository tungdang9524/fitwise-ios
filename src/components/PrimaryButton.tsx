import React from 'react';
import { StyleSheet, Pressable, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  // Button background colors
  let backgroundColor = theme.primary;
  let borderColor = 'transparent';
  let borderWidth = 0;
  let textColor = '#0c0f12'; // Black contrast on neon green/orange

  if (variant === 'secondary') {
    backgroundColor = theme.secondary;
    textColor = '#ffffff';
  } else if (variant === 'danger') {
    backgroundColor = theme.error;
    textColor = '#ffffff';
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    borderColor = theme.primary;
    borderWidth = 1.5;
    textColor = theme.primary;
  }

  if (disabled) {
    backgroundColor = theme.surfaceElevated;
    borderColor = 'transparent';
    borderWidth = 0;
    textColor = theme.textMuted;
  }

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          opacity: pressed && !disabled ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <AppText variant="bodyBold" style={[styles.text, { color: textColor }, textStyle]}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 8,
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
