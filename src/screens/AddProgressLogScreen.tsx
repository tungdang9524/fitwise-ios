import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { getLocalDateString } from '../utils/dates';
import { ProgressLog } from '../models/fitness';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';

type AddProgressNavProp = NativeStackNavigationProp<RootStackParamList, 'AddProgressLog'>;

export const AddProgressLogScreen: React.FC = () => {
  const { state, addProgressLog } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<AddProgressNavProp>();

  // Pre-fill weight with profile or previous progress entry
  const lastLog = state.progressLogs[0];
  const defaultWeight = lastLog?.weight || state.profile?.weight || '';

  const [weight, setWeight] = useState(defaultWeight ? String(defaultWeight) : '');
  const [waist, setWaist] = useState(lastLog?.measurements?.waist ? String(lastLog.measurements.waist) : '');
  const [chest, setChest] = useState(lastLog?.measurements?.chest ? String(lastLog.measurements.chest) : '');
  const [biceps, setBiceps] = useState(lastLog?.measurements?.bicepsL ? String(lastLog.measurements.bicepsL) : '');
  const [thighs, setThighs] = useState(lastLog?.measurements?.thighL ? String(lastLog.measurements.thighL) : '');

  const handleSaveProgress = () => {
    const weightVal = parseFloat(weight);
    if (isNaN(weightVal) || weightVal <= 10 || weightVal > 500) {
      Alert.alert('Validation Error', 'Please enter a valid weight (kg).');
      return;
    }

    const waistVal = parseFloat(waist) || undefined;
    const chestVal = parseFloat(chest) || undefined;
    const bicepsVal = parseFloat(biceps) || undefined;
    const thighsVal = parseFloat(thighs) || undefined;

    const newLog: ProgressLog = {
      id: `progress_${Date.now()}`,
      date: getLocalDateString(),
      weight: weightVal,
      measurements: {
        waist: waistVal,
        chest: chestVal,
        bicepsL: bicepsVal,
        bicepsR: bicepsVal,
        thighL: thighsVal,
        thighR: thighsVal,
      },
    };

    addProgressLog(newLog);
    navigation.goBack();
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="h2">Record Measurements</AppText>
        <AppText variant="body" color="textSecondary" style={styles.subtitle}>
          Track body composition changes over time to monitor progress.
        </AppText>
      </View>

      <Card variant="glass" style={styles.formCard}>
        <AppText variant="label" color="textSecondary" style={styles.label}>Current Weight (kg)</AppText>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
          placeholder="e.g. 72.5"
          placeholderTextColor={theme.textMuted}
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
        />

        <AppText variant="label" color="textSecondary" style={styles.label}>Body Measurements (Optional, cm)</AppText>
        <View style={styles.row}>
          <View style={styles.col}>
            <AppText variant="caption" color="textSecondary" style={styles.inputLabel}>Waist</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={waist}
              onChangeText={setWaist}
            />
          </View>
          <View style={styles.col}>
            <AppText variant="caption" color="textSecondary" style={styles.inputLabel}>Chest</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={chest}
              onChangeText={setChest}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <AppText variant="caption" color="textSecondary" style={styles.inputLabel}>Biceps</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={biceps}
              onChangeText={setBiceps}
            />
          </View>
          <View style={styles.col}>
            <AppText variant="caption" color="textSecondary" style={styles.inputLabel}>Thighs</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={thighs}
              onChangeText={setThighs}
            />
          </View>
        </View>

        <PrimaryButton
          title="Save Progress Log"
          onPress={handleSaveProgress}
          style={styles.submitBtn}
        />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginVertical: 12,
  },
  subtitle: {
    marginTop: 6,
  },
  formCard: {
    marginTop: 14,
    padding: 16,
    gap: 8,
  },
  label: {
    marginTop: 8,
  },
  inputLabel: {
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  submitBtn: {
    marginTop: 20,
  },
});
export default AddProgressLogScreen;
