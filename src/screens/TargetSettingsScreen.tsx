import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { calculateCaloricTargets } from '../utils/formulas';

export const TargetSettingsScreen: React.FC = () => {
  const { state, updateTargets } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const profile = state.profile;

  // Local state for targets
  const [calories, setCalories] = useState(profile?.targetCalories?.toString() || '2000');
  const [protein, setProtein] = useState(profile?.targetProtein?.toString() || '150');
  const [carbs, setCarbs] = useState(profile?.targetCarbs?.toString() || '200');
  const [fats, setFats] = useState(profile?.targetFats?.toString() || '70');

  const handleUseSuggestion = () => {
    if (!profile) {
      Alert.alert('Error', 'Please complete personal profile setup first.');
      return;
    }
    const suggestion = calculateCaloricTargets(
      profile.weight,
      profile.height,
      profile.age,
      profile.gender,
      profile.activityLevel,
      profile.fitnessGoal
    );

    setCalories(suggestion.targetCalories.toString());
    setProtein(suggestion.targetProtein.toString());
    setCarbs(suggestion.targetCarbs.toString());
    setFats(suggestion.targetFats.toString());

    Alert.alert('Suggestions Loaded', 'Calories and macros updated with recommended targets.');
  };

  const handleSave = () => {
    const calVal = parseInt(calories);
    const protVal = parseInt(protein);
    const carbVal = parseInt(carbs);
    const fatVal = parseInt(fats);

    if (isNaN(calVal) || calVal <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid target for Calories.');
      return;
    }
    if (isNaN(protVal) || protVal < 0) {
      Alert.alert('Validation Error', 'Please enter a valid target for Protein.');
      return;
    }
    if (isNaN(carbVal) || carbVal < 0) {
      Alert.alert('Validation Error', 'Please enter a valid target for Carbohydrates.');
      return;
    }
    if (isNaN(fatVal) || fatVal < 0) {
      Alert.alert('Validation Error', 'Please enter a valid target for Fats.');
      return;
    }

    updateTargets({
      targetCalories: calVal,
      targetProtein: protVal,
      targetCarbs: carbVal,
      targetFats: fatVal,
    });

    Alert.alert('Success', 'Target calories and macros successfully updated!');
    navigation.goBack();
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="h2">Calorie & Macro Targets</AppText>
        <AppText variant="body" color="textSecondary" style={styles.subtitle}>
          Customize daily target limits manually or load recommended guidelines.
        </AppText>
      </View>

      <Card variant="glass" style={styles.card}>
        <View style={styles.form}>
          <AppText variant="label" color="textSecondary" style={styles.label}>Daily Calories Target (kcal)</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. 2000"
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            value={calories}
            onChangeText={setCalories}
          />

          <AppText variant="label" color="textSecondary" style={styles.label}>Protein Target (g)</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. 150"
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            value={protein}
            onChangeText={setProtein}
          />

          <AppText variant="label" color="textSecondary" style={styles.label}>Carbohydrates Target (g)</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. 200"
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            value={carbs}
            onChangeText={setCarbs}
          />

          <AppText variant="label" color="textSecondary" style={styles.label}>Fats Target (g)</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. 70"
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
            value={fats}
            onChangeText={setFats}
          />

          <View style={styles.btnRow}>
            <PrimaryButton
              title="Use App Suggestion"
              variant="outline"
              onPress={handleUseSuggestion}
              style={styles.actionBtn}
            />
          </View>

          <PrimaryButton
            title="Save Targets"
            onPress={handleSave}
            style={styles.saveBtn}
          />
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
    padding: 16,
    marginTop: 10,
  },
  form: {
    gap: 4,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  btnRow: {
    marginTop: 20,
    marginBottom: 4,
  },
  actionBtn: {
    marginVertical: 0,
  },
  saveBtn: {
    marginTop: 8,
    marginBottom: 16,
  },
});

export default TargetSettingsScreen;
