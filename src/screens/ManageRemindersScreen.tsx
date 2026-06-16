import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Modal, ScrollView, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { ReminderSetting } from '../models/fitness';

export const ManageRemindersScreen: React.FC = () => {
  const { state, addReminder, deleteReminder, updateReminder } = useFitness();
  const { theme } = useTheme();

  const handleDeleteReminder = (id: string, title: string) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete the reminder "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteReminder(id),
        },
      ]
    );
  };

  // Add Reminder Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [remTitle, setRemTitle] = useState('');
  const [remTime, setRemTime] = useState('08:00');
  const [remType, setRemType] = useState<'workout' | 'meal' | 'water'>('workout');

  const handleReminderToggle = (reminder: ReminderSetting, val: boolean) => {
    updateReminder({
      ...reminder,
      enabled: val,
    });
  };

  const handleCreateReminder = () => {
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
    setModalVisible(false);
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'workout': return 'barbell';
      case 'meal': return 'nutrition';
      case 'water': return 'water';
      default: return 'alarm';
    }
  };

  const getReminderColor = (type: string) => {
    switch (type) {
      case 'workout': return theme.primary;
      case 'meal': return theme.secondary;
      case 'water': return theme.accent;
      default: return theme.text;
    }
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="h2">Manage Reminders</AppText>
        <AppText variant="body" color="textSecondary" style={styles.subtitle}>
          Add, configure, or toggle daily fitness alarms.
        </AppText>
      </View>

      <PrimaryButton
        title="Add Custom Reminder"
        onPress={() => setModalVisible(true)}
        style={styles.addBtn}
      />

      <Card variant="glass" style={styles.listCard}>
        {state.reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alarm-outline" size={32} color={theme.textMuted} />
            <AppText variant="body" color="textSecondary" style={styles.emptyText}>
              No reminders configured.
            </AppText>
          </View>
        ) : (
          state.reminders.map((rem) => {
            const iconColor = getReminderColor(rem.type);
            return (
              <View key={rem.id} style={styles.reminderRow}>
                <View style={[styles.iconWrap, { backgroundColor: `${iconColor}1a` }]}>
                  <Ionicons name={getReminderIcon(rem.type)} size={20} color={iconColor} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyBold">{rem.title}</AppText>
                  <AppText variant="caption" color="textSecondary">{rem.time}</AppText>
                </View>
                <View style={styles.actions}>
                  <Switch 
                    value={rem.enabled} 
                    onValueChange={(val) => handleReminderToggle(rem, val)} 
                    trackColor={{ false: theme.surfaceElevated, true: theme.primary }}
                    thumbColor={rem.enabled ? '#0c0f12' : theme.textMuted}
                  />
                  <TouchableOpacity onPress={() => handleDeleteReminder(rem.id, rem.title)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color={theme.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </Card>

      {/* Add Reminder Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.modalHeader}>
                <AppText variant="h3">Create Daily Reminder</AppText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
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
                  onPress={handleCreateReminder}
                  style={styles.modalSubmitBtn}
                />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  addBtn: {
    marginVertical: 8,
  },
  listCard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    textAlign: 'center',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {
    padding: 6,
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
    marginTop: 6,
  },
  segmentButton: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubmitBtn: {
    marginTop: 24,
  },
});
export default ManageRemindersScreen;
