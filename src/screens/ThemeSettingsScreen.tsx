import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeProvider';

export const ThemeSettingsScreen: React.FC = () => {
  const { theme, themeType, setThemeType } = useTheme();

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="h2">Application Theme</AppText>
        <AppText variant="body" color="textSecondary" style={styles.subtitle}>
          Choose your preferred theme appearance.
        </AppText>
      </View>

      <Card variant="glass" style={styles.card}>
        <View style={styles.segments}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              {
                backgroundColor: themeType === 'dark' ? theme.primary : theme.background,
                borderColor: themeType === 'dark' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setThemeType('dark')}
          >
            <Ionicons name="moon-outline" size={18} color={themeType === 'dark' ? '#0c0f12' : theme.text} style={styles.icon} />
            <AppText variant="bodyBold" style={{ color: themeType === 'dark' ? '#0c0f12' : theme.text }}>
              Dark Mode
            </AppText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.segmentButton,
              {
                backgroundColor: themeType === 'light' ? theme.primary : theme.background,
                borderColor: themeType === 'light' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setThemeType('light')}
          >
            <Ionicons name="sunny-outline" size={18} color={themeType === 'light' ? '#0c0f12' : theme.text} style={styles.icon} />
            <AppText variant="bodyBold" style={{ color: themeType === 'light' ? '#0c0f12' : theme.text }}>
              Light Mode
            </AppText>
          </TouchableOpacity>
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginVertical: 16,
  },
  subtitle: {
    marginTop: 6,
  },
  card: {
    marginTop: 10,
    padding: 16,
  },
  segments: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
});
export default ThemeSettingsScreen;
