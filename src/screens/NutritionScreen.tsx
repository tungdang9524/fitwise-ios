import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { getLocalDateString, formatDisplayDate } from '../utils/dates';
import { RootStackParamList } from '../navigation/types';

type NutritionScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

export const NutritionScreen: React.FC = () => {
  const { state, deleteFoodEntry } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<NutritionScreenNavProp>();

  const handleDeleteFood = (id: string, name: string) => {
    Alert.alert(
      'Delete Food Entry',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteFoodEntry(id),
        },
      ]
    );
  };

  // Date switcher state
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  const profile = state.profile;
  const targetCalories = profile?.targetCalories || 2000;
  const targetProtein = profile?.targetProtein || 150;
  const targetCarbs = profile?.targetCarbs || 200;
  const targetFats = profile?.targetFats || 70;

  // Filter entries based on selected date
  const dateEntries = state.foodEntries.filter((f) => f.date === selectedDate);

  const totalCalories = dateEntries.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = dateEntries.reduce((sum, f) => sum + f.protein, 0);
  const totalCarbs = dateEntries.reduce((sum, f) => sum + f.carbohydrates, 0);
  const totalFats = dateEntries.reduce((sum, f) => sum + f.fats, 0);

  const calorieProgress = totalCalories / targetCalories;
  const proteinProgress = totalProtein / targetProtein;
  const carbsProgress = totalCarbs / targetCarbs;
  const fatsProgress = totalFats / targetFats;

  const remainingCalories = targetCalories - totalCalories;

  const changeDate = (daysOffset: number) => {
    const current = new Date(selectedDate + 'T00:00:00'); // Prevent timezone shifts
    current.setDate(current.getDate() + daysOffset);
    setSelectedDate(getLocalDateString(current));
  };

  const isTodaySelected = selectedDate === getLocalDateString();

  return (
    <Screen scrollable>
      {/* Date Switcher Header */}
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.arrowBtn} onPress={() => changeDate(-1)}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.dateLabelContainer}>
          <AppText variant="h3">
            {isTodaySelected ? 'Today' : formatDisplayDate(selectedDate)}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {selectedDate}
          </AppText>
        </View>

        <TouchableOpacity 
          style={styles.arrowBtn} 
          onPress={() => changeDate(1)}
          disabled={isTodaySelected}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={isTodaySelected ? theme.border : theme.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Calories Card Summary */}
      <Card variant="normal" style={styles.caloriesCard}>
        <View style={styles.row}>
          <View>
            <AppText variant="h2" style={styles.remainingVal}>
              {remainingCalories >= 0 ? remainingCalories : 0}
            </AppText>
            <AppText variant="caption" color="textMuted">CALORIES REMAINING</AppText>
          </View>
          <View style={styles.rightAligned}>
            <AppText variant="bodyBold">{totalCalories} / {targetCalories}</AppText>
            <AppText variant="caption" color="textMuted">KCAL CONSUMED</AppText>
          </View>
        </View>
        
        <ProgressBar 
          progress={calorieProgress} 
          color={remainingCalories < 0 ? theme.error : theme.primary} 
          style={styles.calProgress} 
        />
        
        {remainingCalories < 0 && (
          <AppText variant="caption" color="error" style={styles.overCalorieWarning}>
            ⚠️ You are {Math.abs(remainingCalories)} kcal over target on this day.
          </AppText>
        )}
      </Card>

      {/* Macros Grid Card */}
      <Card variant="glass" style={styles.macrosCard}>
        <AppText variant="label" color="textSecondary" style={styles.sectionHeader}>Daily Macros Breakdown</AppText>
        
        {/* Protein */}
        <View style={styles.macroRow}>
          <View style={styles.macroHeader}>
            <AppText variant="bodyBold" color="primary">Protein</AppText>
            <AppText variant="caption" color="textSecondary">
              {totalProtein}g / {targetProtein}g
            </AppText>
          </View>
          <ProgressBar progress={proteinProgress} color={theme.primary} />
        </View>

        {/* Carbs */}
        <View style={styles.macroRow}>
          <View style={styles.macroHeader}>
            <AppText variant="bodyBold" color="secondary">Carbs</AppText>
            <AppText variant="caption" color="textSecondary">
              {totalCarbs}g / {targetCarbs}g
            </AppText>
          </View>
          <ProgressBar progress={carbsProgress} color={theme.secondary} />
        </View>

        {/* Fats */}
        <View style={styles.macroRow}>
          <View style={styles.macroHeader}>
            <AppText variant="bodyBold" color="accent">Fats</AppText>
            <AppText variant="caption" color="textSecondary">
              {totalFats}g / {targetFats}g
            </AppText>
          </View>
          <ProgressBar progress={fatsProgress} color={theme.accent} />
        </View>
      </Card>

      {/* Food Log Entries List */}
      <View style={styles.foodSection}>
        <View style={styles.row}>
          <AppText variant="h3">Food Log</AppText>
          {isTodaySelected && (
            <PrimaryButton 
              title="+ Log Food" 
              onPress={() => navigation.navigate('AddFoodItem')}
              style={styles.logFoodBtn}
              textStyle={styles.logFoodBtnText}
            />
          )}
        </View>

        {dateEntries.length === 0 ? (
          <Card variant="glass" style={styles.emptyCard}>
            <Ionicons name="nutrition-outline" size={40} color={theme.textMuted} />
            <AppText variant="body" color="textSecondary" style={styles.emptyText}>
              No food logged for this day.
            </AppText>
          </Card>
        ) : (
          dateEntries.map((food) => (
            <Card key={food.id} variant="glass" style={styles.foodItemCard}>
              <View style={styles.foodRow}>
                <View style={styles.flex}>
                  <AppText variant="bodyBold">{food.name}</AppText>
                  <AppText variant="caption" color="textSecondary">
                    Serving: {food.servingSize}{food.quantity && food.quantity !== 1 ? ` (x${food.quantity})` : ''} • {food.time}
                  </AppText>
                  <View style={styles.macroPills}>
                    <View style={[styles.macroPill, { backgroundColor: 'rgba(174, 255, 0, 0.1)' }]}>
                      <AppText variant="caption" color="primary">P: {food.protein}g</AppText>
                    </View>
                    <View style={[styles.macroPill, { backgroundColor: 'rgba(255, 93, 59, 0.1)' }]}>
                      <AppText variant="caption" color="secondary">C: {food.carbohydrates}g</AppText>
                    </View>
                    <View style={[styles.macroPill, { backgroundColor: 'rgba(0, 229, 255, 0.1)' }]}>
                      <AppText variant="caption" color="accent">F: {food.fats}g</AppText>
                    </View>
                  </View>
                </View>
                
                <View style={styles.rightCol}>
                  <AppText variant="bodyBold">{food.calories} kcal</AppText>
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity 
                      style={styles.editBtn} 
                      onPress={() => navigation.navigate('AddFoodItem', { foodEntryId: food.id })}
                    >
                      <Ionicons name="pencil-outline" size={18} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteBtn} 
                      onPress={() => handleDeleteFood(food.id, food.name)}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  arrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateLabelContainer: {
    alignItems: 'center',
  },
  caloriesCard: {
    marginVertical: 6,
    padding: 16,
  },
  remainingVal: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  rightAligned: {
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calProgress: {
    marginTop: 14,
  },
  overCalorieWarning: {
    marginTop: 10,
    fontWeight: '600',
  },
  macrosCard: {
    marginTop: 10,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  macroRow: {
    gap: 6,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodSection: {
    marginTop: 20,
    paddingBottom: 20,
  },
  logFoodBtn: {
    height: 38,
    borderRadius: 8,
    marginVertical: 0,
    paddingHorizontal: 12,
  },
  logFoodBtnText: {
    fontSize: 13,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  emptyText: {
    textAlign: 'center',
  },
  foodItemCard: {
    marginVertical: 4,
    padding: 12,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  macroPills: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  macroPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 12,
  },
  deleteBtn: {
    padding: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editBtn: {
    padding: 4,
  },
});
export default NutritionScreen;
