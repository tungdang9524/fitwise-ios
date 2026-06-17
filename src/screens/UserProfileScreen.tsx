import React, { useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { getLocalDateString } from '../utils/dates';

export const UserProfileScreen: React.FC = () => {
  const { state } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const profile = state.profile;
  const targetCalories = profile?.targetCalories || 2000;
  const targetProtein = profile?.targetProtein || 150;
  const targetCarbs = profile?.targetCarbs || 200;
  const targetFats = profile?.targetFats || 70;
  const waterGoal = state.waterGoal || 2000;
  const sleepGoal = state.sleepGoal || 480; // in minutes

  // Helper to get formatted labels
  const getGoalLabel = (goal?: string) => {
    switch (goal) {
      case 'muscle_gain': return 'Muscle Gain';
      case 'fat_loss': return 'Fat Loss';
      case 'weight_maintenance': return 'Weight Maintenance';
      default: return 'Weight Maintenance';
    }
  };

  const getActivityLabel = (level?: string) => {
    switch (level) {
      case 'sedentary': return 'Sedentary (Little/no exercise)';
      case 'lightly_active': return 'Lightly Active (1-3 days/wk)';
      case 'moderately_active': return 'Moderately Active (3-5 days/wk)';
      case 'very_active': return 'Very Active (6-7 days/wk)';
      default: return 'Moderately Active';
    }
  };

  // Helper to calculate streak backwards from today based on a set of met dates
  const calculateStreak = (metDates: Set<string>): number => {
    if (metDates.size === 0) return 0;

    const todayStr = getLocalDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    // If neither today nor yesterday met the target, streak is 0
    if (!metDates.has(todayStr) && !metDates.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    const checkDate = new Date();
    if (!metDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const checkStr = getLocalDateString(checkDate);
      if (metDates.has(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // 1. Workout Streak: any day with at least 1 completed workout
  const workoutStreak = useMemo(() => {
    const metDates = new Set(state.workouts.map(w => w.date));
    return calculateStreak(metDates);
  }, [state.workouts]);

  // 2. Calorie Streak: any day with total calories >= targetCalories
  const calorieStreak = useMemo(() => {
    const caloriesByDate: Record<string, number> = {};
    state.foodEntries.forEach(f => {
      caloriesByDate[f.date] = (caloriesByDate[f.date] || 0) + f.calories;
    });
    const metDates = new Set<string>();
    Object.keys(caloriesByDate).forEach(d => {
      if (caloriesByDate[d] >= targetCalories) {
        metDates.add(d);
      }
    });
    return calculateStreak(metDates);
  }, [state.foodEntries, targetCalories]);

  // 3. Protein Streak: any day with total protein >= targetProtein
  const proteinStreak = useMemo(() => {
    const proteinByDate: Record<string, number> = {};
    state.foodEntries.forEach(f => {
      proteinByDate[f.date] = (proteinByDate[f.date] || 0) + f.protein;
    });
    const metDates = new Set<string>();
    Object.keys(proteinByDate).forEach(d => {
      if (proteinByDate[d] >= targetProtein) {
        metDates.add(d);
      }
    });
    return calculateStreak(metDates);
  }, [state.foodEntries, targetProtein]);

  // 4. Water Streak: any day with total water >= waterGoal
  const waterStreak = useMemo(() => {
    const waterByDate: Record<string, number> = {};
    (state.waterLogs || []).forEach(w => {
      waterByDate[w.date] = (waterByDate[w.date] || 0) + w.amount;
    });
    const metDates = new Set<string>();
    Object.keys(waterByDate).forEach(d => {
      if (waterByDate[d] >= waterGoal) {
        metDates.add(d);
      }
    });
    return calculateStreak(metDates);
  }, [state.waterLogs, waterGoal]);

  // 5. Sleep Streak: any day with sleep duration >= sleepGoal
  const sleepStreak = useMemo(() => {
    const sleepByDate: Record<string, number> = {};
    (state.sleepLogs || []).forEach(s => {
      sleepByDate[s.date] = (sleepByDate[s.date] || 0) + s.duration;
    });
    const metDates = new Set<string>();
    Object.keys(sleepByDate).forEach(d => {
      if (sleepByDate[d] >= sleepGoal) {
        metDates.add(d);
      }
    });
    return calculateStreak(metDates);
  }, [state.sleepLogs, sleepGoal]);

  const streaks = [
    { name: 'Workout Streak', count: workoutStreak, icon: 'barbell', color: '#ff9900', desc: 'Workout logged' },
    { name: 'Calorie Streak', count: calorieStreak, icon: 'flame', color: '#ff5722', desc: 'Calories target met' },
    { name: 'Protein Streak', count: proteinStreak, icon: 'nutrition', color: '#10b981', desc: 'Protein target met' },
    { name: 'Hydration Streak', count: waterStreak, icon: 'water', color: '#00e5ff', desc: 'Water target met' },
    { name: 'Sleep Streak', count: sleepStreak, icon: 'moon', color: '#8f00ff', desc: 'Sleep duration met' },
  ];

  return (
    <Screen scrollable>
      {/* Profile Header Card */}
      <Card variant="glass" style={styles.headerCard}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `${theme.primary}12`, borderColor: theme.primary }]}>
            <Ionicons name="person" size={40} color={theme.primary} />
          </View>
          <View style={styles.nameContainer}>
            <AppText variant="h2">{profile?.name || 'Athlete'}</AppText>
            <AppText variant="caption" color="textMuted">
              Level {state.level || 1} • {getGoalLabel(profile?.fitnessGoal)}
            </AppText>
          </View>
        </View>
      </Card>

      {/* Streaks Card */}
      <View style={styles.section}>
        <AppText variant="h3" style={styles.sectionTitle}>Target Streaks</AppText>
        <AppText variant="caption" color="textMuted" style={styles.sectionSubtitle}>
          Streak increases when the daily progress bar is filled to 100%.
        </AppText>
        <Card variant="glass" style={styles.streaksCard}>
          {streaks.map((item, index) => (
            <View key={item.name}>
              <View style={styles.streakRow}>
                <View style={[styles.iconWrap, { backgroundColor: `${item.color}15`, borderColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <View style={styles.streakDetails}>
                  <AppText variant="bodyBold">{item.name}</AppText>
                  <AppText variant="caption" color="textMuted">{item.desc}</AppText>
                </View>
                <View style={styles.countContainer}>
                  <AppText variant="h3" style={{ color: item.count > 0 ? item.color : theme.textMuted }}>
                    {item.count}
                  </AppText>
                  <AppText variant="caption" color="textMuted" style={styles.daysLabel}>days</AppText>
                </View>
              </View>
              {index < streaks.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            </View>
          ))}
        </Card>
      </View>

      {/* Personal Info Grid */}
      <View style={styles.section}>
        <AppText variant="h3" style={styles.sectionTitle}>Personal Stats</AppText>
        <Card variant="normal" style={styles.infoCard}>
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <AppText variant="caption" color="textMuted">AGE</AppText>
              <AppText variant="bodyBold">{profile?.age || '--'} yrs</AppText>
            </View>
            <View style={styles.infoCol}>
              <AppText variant="caption" color="textMuted">GENDER</AppText>
              <AppText variant="bodyBold" style={{ textTransform: 'capitalize' }}>
                {profile?.gender || '--'}
              </AppText>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border, marginVertical: 12 }]} />
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <AppText variant="caption" color="textMuted">HEIGHT</AppText>
              <AppText variant="bodyBold">{profile?.height || '--'} cm</AppText>
            </View>
            <View style={styles.infoCol}>
              <AppText variant="caption" color="textMuted">WEIGHT</AppText>
              <AppText variant="bodyBold">{profile?.weight || '--'} kg</AppText>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border, marginVertical: 12 }]} />
          <View style={styles.fullWidthCol}>
            <AppText variant="caption" color="textMuted">ACTIVITY LEVEL</AppText>
            <AppText variant="bodyBold">{getActivityLabel(profile?.activityLevel)}</AppText>
          </View>
        </Card>
      </View>

      {/* Targets Grid */}
      <View style={styles.section}>
        <AppText variant="h3" style={styles.sectionTitle}>Daily Targets</AppText>
        <Card variant="normal" style={styles.infoCard}>
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <AppText variant="caption" color="textMuted">ENERGY</AppText>
              <AppText variant="bodyBold">{targetCalories} kcal</AppText>
            </View>
            <View style={styles.infoCol}>
              <AppText variant="caption" color="textMuted">PROTEIN</AppText>
              <AppText variant="bodyBold" color="primary">{targetProtein} g</AppText>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border, marginVertical: 12 }]} />
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <AppText variant="caption" color="textMuted">CARBS</AppText>
              <AppText variant="bodyBold" color="secondary">{targetCarbs} g</AppText>
            </View>
            <View style={styles.infoCol}>
              <AppText variant="caption" color="textMuted">FATS</AppText>
              <AppText variant="bodyBold" color="accent">{targetFats} g</AppText>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border, marginVertical: 12 }]} />
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <AppText variant="caption" color="textMuted">WATER GOAL</AppText>
              <AppText variant="bodyBold" style={{ color: '#00e5ff' }}>{waterGoal} ml</AppText>
            </View>
            <View style={styles.infoCol}>
              <AppText variant="caption" color="textMuted">SLEEP GOAL</AppText>
              <AppText variant="bodyBold" style={{ color: '#8f00ff' }}>
                {(sleepGoal / 60).toFixed(1)} hrs
              </AppText>
            </View>
          </View>
        </Card>
      </View>

      {/* Footnote Redirect to Settings */}
      <View style={styles.footerContainer}>
        <Ionicons name="information-circle-outline" size={16} color={theme.textMuted} style={{ marginRight: 6 }} />
        <AppText variant="caption" color="textMuted" style={styles.footerText}>
          Want to change these stats or targets? You can edit them anytime in Settings.
        </AppText>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    padding: 16,
    marginVertical: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: 16,
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  sectionSubtitle: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  streaksCard: {
    padding: 16,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDetails: {
    marginLeft: 14,
    flex: 1,
  },
  countContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  daysLabel: {
    marginTop: -2,
  },
  divider: {
    height: 1,
    opacity: 0.5,
  },
  infoCard: {
    padding: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  fullWidthCol: {
    width: '100%',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  footerText: {
    flex: 1,
    lineHeight: 16,
  },
});

export default UserProfileScreen;
