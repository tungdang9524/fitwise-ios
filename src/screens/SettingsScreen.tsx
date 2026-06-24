import React from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { useFitness } from '../store/FitnessStore';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingsMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  onPress: () => void;
  iconColor: string;
}

export const SettingsScreen: React.FC = () => {
  const { state, setGeminiApiKey } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const profile = state.profile;

  const menuItems: SettingsMenuItemProps[] = [
    {
      icon: 'person-outline',
      title: 'Edit Personal Profile',
      desc: 'Update weight, height, age, and activity level goals.',
      onPress: () => navigation.navigate('EditProfile'),
      iconColor: theme.primary,
    },
    {
      icon: 'calculator-outline',
      title: 'Calorie & Macro Targets',
      desc: 'Manually customize calories, protein, carbs, and fats.',
      onPress: () => navigation.navigate('TargetSettings'),
      iconColor: theme.primary,
    },
    {
      icon: 'color-palette-outline',
      title: 'Theme Settings',
      desc: 'Toggle between application Light Mode and Dark Mode.',
      onPress: () => navigation.navigate('ThemeSettings'),
      iconColor: theme.primary,
    },
    {
      icon: 'nutrition-outline',
      title: 'Quick Presets Suggestions',
      desc: 'Add or delete quick presets suggested in logging.',
      onPress: () => navigation.navigate('ManagePresets'),
      iconColor: theme.accent,
    },
    {
      icon: 'cloud-upload-outline',
      title: 'Data Backup & Import',
      desc: 'Export dataset string or restore backups & factory reset.',
      onPress: () => navigation.navigate('BackupRestore'),
      iconColor: theme.success,
    },
  ];

  return (
    <Screen scrollable>
      <View style={styles.container}>
        <AppText variant="h2" style={styles.title}>Settings</AppText>
        
        {/* Profile Card Header */}
        {profile && (
          <Card variant="glass" style={styles.profileSummary}>
            <View style={styles.row}>
              <View style={styles.profileIconWrap}>
                <Ionicons name="person" size={24} color={theme.primary} />
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyBold">{profile.name}</AppText>
                <AppText variant="caption" color="textSecondary">
                  Age: {profile.age} • Height: {profile.height}cm • Weight: {profile.weight}kg
                </AppText>
                <AppText variant="caption" color="primary" style={styles.goalText}>
                  {profile.fitnessGoal.replace('_', ' ').toUpperCase()}
                </AppText>
              </View>
            </View>
          </Card>
        )}

        {/* Menu Rows list */}
        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <Card key={index} variant="normal" style={styles.menuCard} onPress={item.onPress}>
              <View style={styles.menuRow}>
                <View style={[styles.menuIconWrap, { backgroundColor: `${item.iconColor}1a` }]}>
                  <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyBold">{item.title}</AppText>
                  <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                    {item.desc}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </View>
            </Card>
          ))}
        </View>
        {/* Gemini AI Settings */}
        <Card variant="glass" style={styles.geminiCard}>
          <View style={styles.geminiHeader}>
            <Ionicons name="sparkles" size={18} color={theme.primary} />
            <AppText variant="bodyBold" style={{ marginLeft: 6 }}>Gemini AI Settings</AppText>
          </View>
          <AppText variant="caption" color="textSecondary" style={{ marginVertical: 4 }}>
            Enter your Google Gemini API Key to enable the AI Food Scanner feature.
          </AppText>
          <TextInput
            style={[styles.apiKeyInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
            placeholder="Enter Gemini API Key (AIzaSy...)"
            placeholderTextColor={theme.textMuted}
            secureTextEntry
            value={state.geminiApiKey || ''}
            onChangeText={setGeminiApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  title: {
    marginBottom: 16,
  },
  profileSummary: {
    marginVertical: 8,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(174, 255, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  goalText: {
    marginTop: 4,
    fontWeight: 'bold',
  },
  menuList: {
    marginTop: 12,
  },
  menuCard: {
    marginVertical: 5,
    padding: 12,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  geminiCard: {
    marginTop: 16,
    padding: 16,
  },
  geminiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  apiKeyInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    marginTop: 8,
  },
});
export default SettingsScreen;
