import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { FitnessGoal, UserProfile } from '../models/fitness';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';

export const SetupProfileScreen: React.FC = () => {
  const { state, updateProfile } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation();

  // If user already has profile, pre-fill it. Otherwise start fresh.
  const profile = state.profile;

  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [height, setHeight] = useState(profile?.height ? String(profile.height) : '');
  const [weight, setWeight] = useState(profile?.weight ? String(profile.weight) : '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(profile?.gender || 'male');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile?.fitnessGoal || 'weight_maintenance');
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>(profile?.activityLevel || 'moderately_active');

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }
    const ageVal = parseInt(age);
    if (isNaN(ageVal) || ageVal <= 0 || ageVal > 120) {
      Alert.alert('Validation Error', 'Please enter a valid age.');
      return;
    }
    const heightVal = parseFloat(height);
    if (isNaN(heightVal) || heightVal <= 50 || heightVal > 300) {
      Alert.alert('Validation Error', 'Please enter a valid height (cm).');
      return;
    }
    const weightVal = parseFloat(weight);
    if (isNaN(weightVal) || weightVal <= 10 || weightVal > 500) {
      Alert.alert('Validation Error', 'Please enter a valid weight (kg).');
      return;
    }

    updateProfile({
      name: name.trim(),
      age: ageVal,
      gender,
      height: heightVal,
      weight: weightVal,
      fitnessGoal,
      activityLevel,
    });

    if (state.hasCompletedSetup) {
      navigation.goBack();
    }
  };

  const activityOptions: { label: string; value: UserProfile['activityLevel']; desc: string }[] = [
    { label: 'Sedentary', value: 'sedentary', desc: 'Little to no exercise' },
    { label: 'Lightly Active', value: 'lightly_active', desc: 'Light workout 1-3 days/week' },
    { label: 'Moderately Active', value: 'moderately_active', desc: 'Moderate exercise 3-5 days/week' },
    { label: 'Very Active', value: 'very_active', desc: 'Hard workout 6-7 days/week' },
  ];

  const goalOptions: { label: string; value: FitnessGoal }[] = [
    { label: 'Fat Loss', value: 'fat_loss' },
    { label: 'Maintenance', value: 'weight_maintenance' },
    { label: 'Muscle Gain', value: 'muscle_gain' },
  ];

  const genderOptions: { label: string; value: 'male' | 'female' | 'other' }[] = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <Screen scrollable style={{ paddingBottom: 60 }}>
      <View style={styles.header}>
        <AppText variant="h1" color="primary">Fitwise Setup</AppText>
        <AppText variant="body" color="textSecondary" style={styles.subtitle}>
          We use this information to calculate your personal calorie and macronutrient requirements.
        </AppText>
      </View>

      <View style={styles.formSection}>
        <AppText variant="label" color="textSecondary" style={styles.label}>Name</AppText>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Enter your name"
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={setName}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <AppText variant="label" color="textSecondary" style={styles.label}>Age</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. 25"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
            />
          </View>
          <View style={styles.col}>
            <AppText variant="label" color="textSecondary" style={styles.label}>Height (cm)</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. 175"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              value={height}
              onChangeText={setHeight}
            />
          </View>
          <View style={styles.col}>
            <AppText variant="label" color="textSecondary" style={styles.label}>Weight (kg)</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. 70"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>

        <AppText variant="label" color="textSecondary" style={styles.label}>Gender</AppText>
        <View style={styles.segments}>
          {genderOptions.map((opt) => {
            const isSelected = gender === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.segmentButton,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setGender(opt.value)}
              >
                <AppText
                  variant="bodyBold"
                  style={{ color: isSelected ? '#0c0f12' : theme.text }}
                >
                  {opt.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        <AppText variant="label" color="textSecondary" style={styles.label}>Fitness Goal</AppText>
        <View style={styles.segments}>
          {goalOptions.map((opt) => {
            const isSelected = fitnessGoal === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.segmentButton,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setFitnessGoal(opt.value)}
              >
                <AppText
                  variant="bodyBold"
                  style={{ color: isSelected ? '#0c0f12' : theme.text }}
                >
                  {opt.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        <AppText variant="label" color="textSecondary" style={styles.label}>Activity Level</AppText>
        {activityOptions.map((opt) => {
          const isSelected = activityLevel === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.activityCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: isSelected ? theme.primary : theme.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setActivityLevel(opt.value)}
            >
              <View>
                <AppText variant="bodyBold" color={isSelected ? 'primary' : 'text'}>
                  {opt.label}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {opt.desc}
                </AppText>
              </View>
            </TouchableOpacity>
          );
        })}

        <PrimaryButton
          title={profile ? 'Save Changes' : 'Complete Registration'}
          onPress={handleSubmit}
          style={styles.submitBtn}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginVertical: 20,
  },
  subtitle: {
    marginTop: 8,
  },
  formSection: {
    marginTop: 10,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
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
  segments: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 6,
  },
  submitBtn: {
    marginTop: 24,
  },
});
export default SetupProfileScreen;
