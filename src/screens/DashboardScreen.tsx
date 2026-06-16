import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { getLocalDateString, formatDisplayDate, calculateStreak } from '../utils/dates';
import { MainTabParamList } from '../navigation/types';

type DashboardNavProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

export const DashboardScreen: React.FC = () => {
  const { state } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<DashboardNavProp>();

  const profile = state.profile;
  const todayStr = getLocalDateString();

  // Calculate Streak
  const workoutDates = state.workouts.map((w) => w.date);
  const foodDates = state.foodEntries.map((f) => f.date);
  const currentStreak = calculateStreak(workoutDates, foodDates);

  // Calories & Macros Math
  const todayFoods = state.foodEntries.filter((f) => f.date === todayStr);
  const consumedCalories = todayFoods.reduce((sum, f) => sum + f.calories, 0);
  const consumedProtein = todayFoods.reduce((sum, f) => sum + f.protein, 0);
  const consumedCarbs = todayFoods.reduce((sum, f) => sum + f.carbohydrates, 0);
  const consumedFats = todayFoods.reduce((sum, f) => sum + f.fats, 0);

  const targetCalories = profile?.targetCalories || 2000;
  const targetProtein = profile?.targetProtein || 150;
  const targetCarbs = profile?.targetCarbs || 200;
  const targetFats = profile?.targetFats || 70;

  const remainingCalories = targetCalories - consumedCalories;
  const calorieProgress = consumedCalories / targetCalories;

  // Workouts Math
  const todayWorkouts = state.workouts.filter((w) => w.date === todayStr);
  const completedWorkoutToday = todayWorkouts.length > 0;

  // Goal naming mapping
  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case 'muscle_gain': return 'Muscle Gain';
      case 'fat_loss': return 'Fat Loss';
      case 'weight_maintenance': return 'Maintenance';
      default: return 'Maintenance';
    }
  };

  return (
    <Screen scrollable>
      {/* Header section */}
      <View style={styles.header}>
        <View style={styles.flex}>
          <AppText variant="caption" color="textMuted">
            {formatDisplayDate(todayStr).toUpperCase()}
          </AppText>
          <View style={styles.nameRow}>
            <AppText variant="h1" style={styles.title}>
              Hey, {profile?.name || 'Athlete'}!
            </AppText>
            {currentStreak > 0 && (
              <View style={[styles.streakBadge, { backgroundColor: 'rgba(255, 153, 0, 0.12)', borderColor: 'rgba(255, 153, 0, 0.25)' }]}>
                <Ionicons name="flame" size={16} color="#ff9900" />
                <AppText variant="caption" style={styles.streakText}>{currentStreak} Day Streak</AppText>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="person" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Goal Summary Header */}
      {profile && (
        <Card variant="glass" style={styles.goalCard}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <AppText variant="caption" color="textMuted">ACTIVE GOAL</AppText>
              <AppText variant="bodyBold" color="primary">{getGoalLabel(profile.fitnessGoal)}</AppText>
            </View>
            <View style={[styles.goalDetail, styles.flex, { alignItems: 'center' }]}>
              <AppText variant="caption" color="textMuted">ACTIVE STREAK</AppText>
              <View style={styles.streakRow}>
                <Ionicons name="flame" size={16} color="#ff9900" />
                <AppText variant="bodyBold" style={{ color: '#ff9900' }}>{currentStreak} Days</AppText>
              </View>
            </View>
            <View style={[styles.goalDetail, styles.flex, { alignItems: 'flex-end' }]}>
              <AppText variant="caption" color="textMuted">CURRENT WEIGHT</AppText>
              <AppText variant="bodyBold">{profile.weight} kg</AppText>
            </View>
          </View>
        </Card>
      )}

      {/* Workout State Card */}
      <Card variant="elevated" style={styles.workoutCard}>
        <View style={styles.rowCentered}>
          <View style={[styles.iconWrap, { backgroundColor: completedWorkoutToday ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 93, 59, 0.15)' }]}>
            <Ionicons 
              name={completedWorkoutToday ? "checkmark-circle" : "barbell"} 
              size={24} 
              color={completedWorkoutToday ? theme.success : theme.secondary} 
            />
          </View>
          <View style={styles.flex}>
            <AppText variant="bodyBold">Today's Workout</AppText>
            <AppText variant="caption" color="textSecondary">
              {completedWorkoutToday 
                ? `Logged: ${todayWorkouts[0].name}`
                : "No workout tracked today"}
            </AppText>
          </View>
          {!completedWorkoutToday && (
            <TouchableOpacity 
              style={[styles.trackBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Workouts')}
            >
              <AppText variant="caption" style={styles.trackBtnText}>Track</AppText>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Calories Card */}
      <Card variant="normal" style={styles.caloriesCard}>
        <View style={styles.row}>
          <View>
            <AppText variant="h2" style={styles.remainingVal}>
              {remainingCalories >= 0 ? remainingCalories : 0}
            </AppText>
            <AppText variant="caption" color="textMuted">CALORIES REMAINING</AppText>
          </View>
          <View style={styles.rightAligned}>
            <AppText variant="bodyBold">{consumedCalories} / {targetCalories}</AppText>
            <AppText variant="caption" color="textMuted">KCAL CONSUMED</AppText>
          </View>
        </View>
        
        <ProgressBar progress={calorieProgress} color={remainingCalories < 0 ? theme.error : theme.primary} style={styles.calProgress} />
        
        {remainingCalories < 0 && (
          <AppText variant="caption" color="error" style={styles.overCalorieWarning}>
            ⚠️ You are {Math.abs(remainingCalories)} kcal over your daily target limit.
          </AppText>
        )}
      </Card>

      {/* Macros Section */}
      <View style={styles.macrosSection}>
        <AppText variant="h3" style={styles.sectionHeader}>Daily Macros</AppText>
        <Card variant="glass" style={styles.macrosCard}>
          {/* Protein */}
          <View style={styles.macroRow}>
            <View style={styles.macroHeader}>
              <AppText variant="bodyBold" color="primary">Protein</AppText>
              <AppText variant="caption" color="textSecondary">
                {consumedProtein}g / {targetProtein}g
              </AppText>
            </View>
            <ProgressBar progress={consumedProtein / targetProtein} color={theme.primary} />
          </View>

          {/* Carbs */}
          <View style={styles.macroRow}>
            <View style={styles.macroHeader}>
              <AppText variant="bodyBold" color="secondary">Carbs</AppText>
              <AppText variant="caption" color="textSecondary">
                {consumedCarbs}g / {targetCarbs}g
              </AppText>
            </View>
            <ProgressBar progress={consumedCarbs / targetCarbs} color={theme.secondary} />
          </View>

          {/* Fats */}
          <View style={styles.macroRow}>
            <View style={styles.macroHeader}>
              <AppText variant="bodyBold" color="accent">Fats</AppText>
              <AppText variant="caption" color="textSecondary">
                {consumedFats}g / {targetFats}g
              </AppText>
            </View>
            <ProgressBar progress={consumedFats / targetFats} color={theme.accent} />
          </View>
        </Card>
      </View>

      {/* Recent Workout History */}
      <View style={styles.historySection}>
        <View style={styles.row}>
          <AppText variant="h3">Recent Activity</AppText>
          {state.workouts.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Workouts')}>
              <AppText variant="caption" color="primary">View All</AppText>
            </TouchableOpacity>
          )}
        </View>

        {state.workouts.length === 0 ? (
          <Card variant="glass" style={styles.emptyHistoryCard}>
            <Ionicons name="calendar-outline" size={36} color={theme.textMuted} style={styles.emptyIcon} />
            <AppText variant="body" color="textSecondary" style={styles.emptyText}>
              No workouts logged yet. Your fitness journey starts here!
            </AppText>
            <PrimaryButton 
              title="Log First Workout" 
              onPress={() => navigation.navigate('Workouts')}
              style={styles.emptyBtn}
            />
          </Card>
        ) : (
          state.workouts.slice(0, 3).map((workout) => (
            <Card key={workout.id} variant="glass" style={styles.workoutItem}>
              <View style={styles.rowCentered}>
                <View style={[styles.historyIconWrap, { backgroundColor: 'rgba(174, 255, 0, 0.1)' }]}>
                  <Ionicons name="barbell-outline" size={20} color={theme.primary} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyBold">{workout.name}</AppText>
                  <AppText variant="caption" color="textSecondary">
                    {formatDisplayDate(workout.date)} • {workout.exercises.length} Exercises
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    marginTop: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  streakText: {
    color: '#ff9900',
    fontWeight: 'bold',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCard: {
    marginVertical: 4,
    paddingVertical: 12,
  },
  workoutCard: {
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalDetail: {
    alignItems: 'flex-end',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  trackBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  trackBtnText: {
    color: '#0c0f12',
    fontWeight: 'bold',
  },
  caloriesCard: {
    marginTop: 8,
    padding: 20,
  },
  remainingVal: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 40,
  },
  rightAligned: {
    alignItems: 'flex-end',
  },
  calProgress: {
    marginTop: 16,
  },
  overCalorieWarning: {
    marginTop: 10,
    fontWeight: '600',
  },
  macrosSection: {
    marginTop: 20,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  macrosCard: {
    padding: 16,
    gap: 16,
  },
  macroRow: {
    gap: 6,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historySection: {
    marginTop: 24,
    paddingBottom: 20,
  },
  workoutItem: {
    marginVertical: 4,
  },
  historyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistoryCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyBtn: {
    width: '100%',
  },
});
export default DashboardScreen;
