import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { getLocalDateString } from '../utils/dates';
import { FoodEntry, FoodPreset } from '../models/fitness';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';

type AddFoodNavProp = NativeStackNavigationProp<RootStackParamList, 'AddFoodItem'>;

export const AddFoodItemScreen: React.FC = () => {
  const { state, addFoodEntry } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<AddFoodNavProp>();

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [servingSize, setServingSize] = useState('100g');

  const applyPreset = (preset: FoodPreset) => {
    setName(preset.name);
    setCalories(String(preset.calories));
    setProtein(String(preset.protein));
    setCarbs(String(preset.carbohydrates));
    setFats(String(preset.fats));
    setServingSize(preset.servingSize);
  };

  const handleSaveFood = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a food name.');
      return;
    }
    const calVal = parseInt(calories);
    if (isNaN(calVal) || calVal < 0) {
      Alert.alert('Validation Error', 'Please enter a valid calorie amount.');
      return;
    }
    const proteinVal = parseFloat(protein) || 0;
    const carbsVal = parseFloat(carbs) || 0;
    const fatsVal = parseFloat(fats) || 0;

    const timeStr = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const newFoodEntry: FoodEntry = {
      id: `food_${Date.now()}`,
      date: getLocalDateString(),
      time: timeStr,
      name: name.trim(),
      calories: calVal,
      protein: proteinVal,
      carbohydrates: carbsVal,
      fats: fatsVal,
      servingSize: servingSize.trim(),
    };

    addFoodEntry(newFoodEntry);
    navigation.goBack();
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="h2">Log Food Item</AppText>
      </View>

      {/* Preset Foods section */}
      <View style={styles.presetsSection}>
        <AppText variant="label" color="textSecondary" style={styles.sectionTitle}>Quick Add Presets</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
          {state.foodPresets.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={[styles.presetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => applyPreset(preset)}
            >
              <AppText variant="h2" style={styles.presetIcon}>{preset.icon}</AppText>
              <AppText variant="caption" color="text" numberOfLines={1} style={styles.presetName}>
                {preset.name.split(' ')[0]}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {preset.calories} kcal
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Card variant="glass" style={styles.formCard}>
        <AppText variant="label" color="textSecondary" style={styles.label}>Food Name</AppText>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
          placeholder="e.g. Grilled Chicken Breast"
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={setName}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <AppText variant="label" color="textSecondary" style={styles.label}>Calories (kcal)</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              value={calories}
              onChangeText={setCalories}
            />
          </View>
          <View style={styles.col}>
            <AppText variant="label" color="textSecondary" style={styles.label}>Serving Size</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. 100g, 1 cup"
              placeholderTextColor={theme.textMuted}
              value={servingSize}
              onChangeText={setServingSize}
            />
          </View>
        </View>

        <AppText variant="label" color="textSecondary" style={styles.label}>Macronutrients (Grams)</AppText>
        <View style={styles.row}>
          <View style={styles.col}>
            <AppText variant="caption" color="primary" style={styles.macroLabel}>Protein</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="0g"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
              value={protein}
              onChangeText={setProtein}
            />
          </View>
          <View style={styles.col}>
            <AppText variant="caption" color="secondary" style={styles.macroLabel}>Carbs</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="0g"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
              value={carbs}
              onChangeText={setCarbs}
            />
          </View>
          <View style={styles.col}>
            <AppText variant="caption" color="accent" style={styles.macroLabel}>Fats</AppText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="0g"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
              value={fats}
              onChangeText={setFats}
            />
          </View>
        </View>

        <PrimaryButton
          title="Save Food Log"
          onPress={handleSaveFood}
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
  presetsSection: {
    marginVertical: 10,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  presetsScroll: {
    gap: 10,
    paddingRight: 20,
  },
  presetCard: {
    width: 90,
    height: 105,
    borderWidth: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  presetIcon: {
    marginBottom: 4,
  },
  presetName: {
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
  formCard: {
    marginTop: 14,
    padding: 16,
    gap: 8,
  },
  label: {
    marginTop: 8,
  },
  macroLabel: {
    marginBottom: 4,
    fontWeight: 'bold',
    textAlign: 'center',
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
export default AddFoodItemScreen;
