import React from 'react';
import { StyleSheet, View, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'normal' | 'glass' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'normal',
}) => {
  const { theme } = useTheme();

  // Pick background styling
  let backgroundColor = theme.surface;
  if (variant === 'glass') backgroundColor = theme.glassBg;
  else if (variant === 'elevated') backgroundColor = theme.surfaceElevated;

  const cardStyle = [
    styles.card,
    {
      backgroundColor,
      borderColor: theme.border,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
