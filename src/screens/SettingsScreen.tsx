import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { Card } from '../components/Card';
import { useFitness } from '../store/FitnessStore';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';
import { ReminderSetting, FoodPreset, FitnessState } from '../models/fitness';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const { state, dispatch, resetState, addReminder, deleteReminder, addFoodPreset, deleteFoodPreset } = useFitness();
  const { theme, themeType, setThemeType } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const profile = state.profile;

  // Reminders Modals State
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [remTitle, setRemTitle] = useState('');
  const [remTime, setRemTime] = useState('08:00');
  const [remType, setRemType] = useState<'workout' | 'meal' | 'water'>('workout');

  // Presets Modals State
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [preName, setPreName] = useState('');
  const [preIcon, setPreIcon] = useState('🍎');
  const [preCalories, setPreCalories] = useState('');
  const [preProtein, setPreProtein] = useState('');
  const [preCarbs, setPreCarbs] = useState('');
  const [preFats, setPreFats] = useState('');
  const [preServing, setPreServing] = useState('100g');

  // Backup & Import State
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState('');

  const handleAddReminder = () => {
    if (!remTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for the reminder.');
      return;
    }
    const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(remTime.trim())) {
      Alert.alert('Validation Error', 'Please enter time in HH:MM format (e.g. 08:30).');
      return;
    }

    const newReminder: ReminderSetting = {
      id: `reminder_${Date.now()}`,
      title: remTitle.trim(),
      time: remTime.trim(),
      type: remType,
      enabled: true,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    };

    addReminder(newReminder);
    setRemTitle('');
    setRemTime('08:00');
    setRemType('workout');
    setReminderModalVisible(false);
  };

  const handleAddPreset = () => {
    if (!preName.trim()) {
      Alert.alert('Validation Error', 'Please enter a food name.');
      return;
    }
    const calVal = parseInt(preCalories);
    if (isNaN(calVal) || calVal < 0) {
      Alert.alert('Validation Error', 'Please enter valid calories.');
      return;
    }

    const newPreset: FoodPreset = {
      id: `preset_${Date.now()}`,
      name: preName.trim(),
      icon: preIcon.trim() || '🍎',
      calories: calVal,
      protein: parseFloat(preProtein) || 0,
      carbohydrates: parseFloat(preCarbs) || 0,
      fats: parseFloat(preFats) || 0,
      servingSize: preServing.trim() || '100g',
    };

    addFoodPreset(newPreset);
    setPreName('');
    setPreIcon('🍎');
    setPreCalories('');
    setPreProtein('');
    setPreCarbs('');
    setPreFats('');
    setPreServing('100g');
    setPresetModalVisible(false);
  };

  const handleImportBackup = () => {
    if (!importText.trim()) {
      Alert.alert('Validation Error', 'Please paste a backup JSON string.');
      return;
    }

    try {
      const parsed = JSON.parse(importText.trim());
      
      // Validation keys check
      if (
        parsed && 
        typeof parsed === 'object' &&
        'hasCompletedSetup' in parsed
      ) {
        dispatch({
          type: 'INITIALIZE_STATE',
          payload: parsed as FitnessState,
        });
        
        Alert.alert('Success', 'Backup data successfully restored!');
        setImportText('');
        setImportModalVisible(false);
      } else {
        Alert.alert('Import Failed', 'Invalid format. The JSON does not match a Fitwise backup schema.');
      }
    } catch (e) {
      Alert.alert('Parser Error', 'Invalid JSON string. Please ensure the string is complete.');
    }
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'workout': return 'barbell';
      case 'meal': return 'nutrition';
      case 'water': return 'water';
      default: return 'alarm';
    }
  };

  return (
    <Screen scrollable style={{ paddingBottom: 60 }}>
      <View style={styles.container}>
        <AppText variant="h2" style={styles.title}>Settings & Configuration</AppText>
        
        {profile && (
          <Card variant="glass" style={styles.profileSummary}>
            <AppText variant="bodyBold">{profile.name}</AppText>
            <AppText variant="caption" color="textSecondary">
              Age: {profile.age} • Height: {profile.height}cm • Weight: {profile.weight}kg
            </AppText>
            <AppText variant="caption" color="primary" style={styles.goalText}>
              Goal: {profile.fitnessGoal.replace('_', ' ').toUpperCase()}
            </AppText>
          </Card>
        )}

        <PrimaryButton 
          title="Edit Personal Profile" 
          variant="outline" 
          onPress={() => navigation.navigate('EditProfile')} 
          style={styles.editProfileBtn}
        />

        {/* Section: Theme Selector */}
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitleHeader}>Application Theme</AppText>
          <Card variant="glass" style={styles.themeSelectorCard}>
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
                <Ionicons name="moon-outline" size={16} color={themeType === 'dark' ? '#0c0f12' : theme.text} style={styles.tabIconSpacing} />
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
                <Ionicons name="sunny-outline" size={16} color={themeType === 'light' ? '#0c0f12' : theme.text} style={styles.tabIconSpacing} />
                <AppText variant="bodyBold" style={{ color: themeType === 'light' ? '#0c0f12' : theme.text }}>
                  Light Mode
                </AppText>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Section: Backup and Restore */}
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitleHeader}>Data Backup & Import</AppText>
          <Card variant="glass" style={styles.backupCard}>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.actionBtnHalf, { borderColor: theme.border }]}
                onPress={() => setBackupModalVisible(true)}
              >
                <Ionicons name="cloud-upload-outline" size={20} color={theme.primary} />
                <AppText variant="bodyBold" color="primary">Export Data</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtnHalf, { borderColor: theme.border }]}
                onPress={() => setImportModalVisible(true)}
              >
                <Ionicons name="cloud-download-outline" size={20} color={theme.primary} />
                <AppText variant="bodyBold" color="primary">Import Data</AppText>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Section: Reminders Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="h3">Daily Reminders</AppText>
            <TouchableOpacity onPress={() => setReminderModalVisible(true)}>
              <AppText variant="caption" color="primary">+ Add</AppText>
            </TouchableOpacity>
          </View>
          <Card variant="glass" style={styles.listCard}>
            {state.reminders.length === 0 ? (
              <AppText variant="caption" color="textMuted" style={styles.emptyText}>
                No reminders configured.
              </AppText>
            ) : (
              state.reminders.map((rem) => (
                <View key={rem.id} style={styles.listItem}>
                  <Ionicons name={getIconName(rem.type)} size={18} color={theme.textSecondary} style={styles.itemIcon} />
                  <View style={styles.flex}>
                    <AppText variant="bodyBold">{rem.title}</AppText>
                    <AppText variant="caption" color="textSecondary">{rem.time} • {rem.enabled ? 'Enabled' : 'Disabled'}</AppText>
                  </View>
                  <TouchableOpacity onPress={() => deleteReminder(rem.id)}>
                    <Ionicons name="trash-outline" size={18} color={theme.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </Card>
        </View>

        {/* Section: Quick Presets Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="h3">Quick Presets Suggestions</AppText>
            <TouchableOpacity onPress={() => setPresetModalVisible(true)}>
              <AppText variant="caption" color="primary">+ Add</AppText>
            </TouchableOpacity>
          </View>
          <Card variant="glass" style={styles.listCard}>
            {state.foodPresets.length === 0 ? (
              <AppText variant="caption" color="textMuted" style={styles.emptyText}>
                No custom food presets.
              </AppText>
            ) : (
              state.foodPresets.map((preset) => (
                <View key={preset.id} style={styles.listItem}>
                  <AppText variant="body" style={styles.itemIcon}>{preset.icon}</AppText>
                  <View style={styles.flex}>
                    <AppText variant="bodyBold">{preset.name}</AppText>
                    <AppText variant="caption" color="textSecondary">
                      {preset.calories} kcal • P: {preset.protein}g • C: {preset.carbohydrates}g • F: {preset.fats}g
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => deleteFoodPreset(preset.id)}>
                    <Ionicons name="trash-outline" size={18} color={theme.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </Card>
        </View>

        {/* System Reset Section */}
        <View style={styles.section}>
          <PrimaryButton 
            title="Reset Local State Data" 
            variant="danger" 
            onPress={() => {
              Alert.alert(
                'Reset All Data',
                'This will permanently delete all your workouts, nutrition history, measurements, and profile configurations. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset Data', style: 'destructive', onPress: resetState }
                ]
              );
            }} 
            style={styles.resetBtn}
          />
        </View>
      </View>

      {/* Add Reminder Modal */}
      <Modal visible={reminderModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <AppText variant="h3">Create Daily Reminder</AppText>
              <TouchableOpacity onPress={() => setReminderModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <AppText variant="label" color="textSecondary" style={styles.formLabel}>Reminder Title</AppText>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. Afternoon Water Intake"
                placeholderTextColor={theme.textMuted}
                value={remTitle}
                onChangeText={setRemTitle}
              />

              <AppText variant="label" color="textSecondary" style={styles.formLabel}>Alert Time (24h HH:MM format)</AppText>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. 14:30"
                placeholderTextColor={theme.textMuted}
                value={remTime}
                onChangeText={setRemTime}
              />

              <AppText variant="label" color="textSecondary" style={styles.formLabel}>Type</AppText>
              <View style={styles.segments}>
                {(['workout', 'meal', 'water'] as const).map((type) => {
                  const isSelected = remType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.segmentButton,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.background,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setRemType(type)}
                    >
                      <AppText variant="bodyBold" style={{ color: isSelected ? '#0c0f12' : theme.text }}>
                        {type.toUpperCase()}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <PrimaryButton
                title="Create Reminder"
                onPress={handleAddReminder}
                style={styles.modalSubmitBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Preset Modal */}
      <Modal visible={presetModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <AppText variant="h3">New Food Preset</AppText>
              <TouchableOpacity onPress={() => setPresetModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <View style={styles.row}>
                <View style={[styles.col, { flex: 1.5 }]}>
                  <AppText variant="label" color="textSecondary" style={styles.formLabel}>Food Name</AppText>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="e.g. Greek Yogurt"
                    placeholderTextColor={theme.textMuted}
                    value={preName}
                    onChangeText={setPreName}
                  />
                </View>
                <View style={[styles.col, { flex: 0.5 }]}>
                  <AppText variant="label" color="textSecondary" style={styles.formLabel}>Emoji Icon</AppText>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border, textAlign: 'center' }]}
                    placeholder="🍯"
                    placeholderTextColor={theme.textMuted}
                    value={preIcon}
                    onChangeText={setPreIcon}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <AppText variant="label" color="textSecondary" style={styles.formLabel}>Calories (kcal)</AppText>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="e.g. 120"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="number-pad"
                    value={preCalories}
                    onChangeText={setPreCalories}
                  />
                </View>
                <View style={styles.col}>
                  <AppText variant="label" color="textSecondary" style={styles.formLabel}>Serving Size</AppText>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="e.g. 100g, 1 cup"
                    placeholderTextColor={theme.textMuted}
                    value={preServing}
                    onChangeText={setPreServing}
                  />
                </View>
              </View>

              <AppText variant="label" color="textSecondary" style={styles.formLabel}>Macros (Grams)</AppText>
              <View style={styles.row}>
                <View style={styles.col}>
                  <AppText variant="caption" color="textMuted">Protein</AppText>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="decimal-pad"
                    value={preProtein}
                    onChangeText={setPreProtein}
                  />
                </View>
                <View style={styles.col}>
                  <AppText variant="caption" color="textMuted">Carbs</AppText>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="decimal-pad"
                    value={preCarbs}
                    onChangeText={setPreCarbs}
                  />
                </View>
                <View style={styles.col}>
                  <AppText variant="caption" color="textMuted">Fats</AppText>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="decimal-pad"
                    value={preFats}
                    onChangeText={setPreFats}
                  />
                </View>
              </View>

              <PrimaryButton
                title="Create Food Preset"
                onPress={handleAddPreset}
                style={styles.modalSubmitBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Export Backup Modal */}
      <Modal visible={backupModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <AppText variant="h3">Export Fitwise Data</AppText>
              <TouchableOpacity onPress={() => setBackupModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <AppText variant="body" color="textSecondary" style={styles.introText}>
                Copy the text below and save it somewhere safe. You can paste this text back in the "Import" tab to restore your settings, workouts, and progress.
              </AppText>
              
              <TextInput
                style={[styles.backupTextarea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={JSON.stringify(state)}
                editable={false}
                selectTextOnFocus
                multiline
              />
              
              <PrimaryButton
                title="Done"
                onPress={() => setBackupModalVisible(false)}
                style={styles.modalSubmitBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Import Backup Modal */}
      <Modal visible={importModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <AppText variant="h3">Import Fitwise Data</AppText>
              <TouchableOpacity onPress={() => setImportModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <AppText variant="body" color="textSecondary" style={styles.introText}>
                Paste your backup JSON string below. This will overwrite all current data in the application.
              </AppText>
              
              <TextInput
                style={[styles.backupTextarea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Paste backup JSON string here..."
                placeholderTextColor={theme.textMuted}
                value={importText}
                onChangeText={setImportText}
                multiline
              />
              
              <PrimaryButton
                title="Verify & Restore Data"
                onPress={handleImportBackup}
                style={styles.modalSubmitBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  title: {
    marginBottom: 20,
  },
  profileSummary: {
    marginVertical: 4,
    gap: 4,
  },
  goalText: {
    marginTop: 6,
    fontWeight: 'bold',
  },
  editProfileBtn: {
    marginVertical: 12,
  },
  section: {
    marginTop: 20,
  },
  sectionTitleHeader: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  themeSelectorCard: {
    padding: 12,
  },
  backupCard: {
    padding: 12,
  },
  listCard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  itemIcon: {
    width: 32,
    textAlign: 'center',
    marginRight: 12,
  },
  flex: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 12,
  },
  resetBtn: {
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalForm: {
    paddingBottom: 40,
    gap: 4,
  },
  formLabel: {
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  segments: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconSpacing: {
    marginRight: 6,
  },
  actionBtnHalf: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  modalSubmitBtn: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  introText: {
    lineHeight: 18,
    marginBottom: 16,
  },
  backupTextarea: {
    height: 180,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    lineHeight: 18,
    textAlignVertical: 'top',
    fontFamily: 'System',
  },
});
export default SettingsScreen;
