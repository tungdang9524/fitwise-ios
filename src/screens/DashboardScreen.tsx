import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { getLocalDateString, formatDisplayDate } from '../utils/dates';
import { STATIC_EXERCISE_LIBRARY } from '../data/exerciseLibrary';

const BODYWEIGHT_MULTIPLIERS: Record<string, number> = {
  Chest: 1.4,
  Back: 1.8,
  Legs: 1.8,
  Shoulders: 0.9,
  Arms: 0.5,
  Core: 0.4,
};

const ALL_ACHIEVEMENTS = [
  { id: 'first_workout', name: 'First Workout', icon: 'trophy-outline', color: '#E040FB' },
  { id: 'strength_builder', name: 'Strength Builder', icon: 'barbell-outline', color: '#FFD700' },
  { id: 'protein_master', name: 'Protein Master', icon: 'nutrition-outline', color: '#00E5FF' },
  { id: 'consistency_king', name: 'Consistency King', icon: 'ribbon-outline', color: '#4CAF50' },
  { id: 'pr_hunter', name: 'PR Hunter', icon: 'flame-outline', color: '#FF5722' },
  { id: 'hydration_starter', name: 'Hydration Starter', icon: 'water-outline', color: '#00E5FF' },
  { id: 'hydration_master', name: 'Hydration Master', icon: 'trophy-outline', color: '#00E5FF' },
  { id: 'early_sleeper', name: 'Early Sleeper', icon: 'moon-outline', color: '#8F00FF' },
  { id: 'recovery_master', name: 'Recovery Master', icon: 'battery-charging-outline', color: '#00FF66' },
];

export const DashboardScreen: React.FC = () => {
  const { state, addWater } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const profile = state.profile;
  const todayStr = getLocalDateString();

  // 1. Calculate Active Streak
  const workoutDates = state.workouts.map((w) => w.date);
  const foodDates = state.foodEntries.map((f) => f.date);
  
  const activeDates = new Set<string>([...workoutDates, ...foodDates]);
  const currentStreak = useMemo(() => {
    if (activeDates.size === 0) return 0;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    const checkDate = new Date();
    if (!activeDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const checkStr = getLocalDateString(checkDate);
      if (activeDates.has(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [activeDates, todayStr]);

  // 2. Nutrition Math
  const todayFoods = state.foodEntries.filter((f) => f.date === todayStr);
  const consumedCalories = todayFoods.reduce((sum, f) => sum + f.calories, 0);
  const consumedProtein = todayFoods.reduce((sum, f) => sum + f.protein, 0);

  const targetCalories = profile?.targetCalories || 2000;
  const targetProtein = profile?.targetProtein || 150;

  // 3. Water Intake Math
  const todayWaterLogs = (state.waterLogs || []).filter((l) => l.date === todayStr);
  const todayWater = todayWaterLogs.reduce((sum, l) => sum + l.amount, 0);
  const waterGoal = state.waterGoal || 2000;
  const waterProgress = Math.min(1.0, todayWater / waterGoal);

  // 4. Today's Workout Math
  const todayWorkouts = state.workouts.filter((w) => w.date === todayStr);
  const completedWorkoutToday = todayWorkouts.length > 0;

  // Sleep & Recovery Math
  const todaySleepLogs = (state.sleepLogs || []).filter((l) => l.date === todayStr);
  const todaySleepMins = todaySleepLogs.reduce((sum, l) => sum + l.duration, 0);
  const todaySleepScore = todaySleepLogs.length > 0 ? todaySleepLogs[0].sleepScore : 0;
  
  const formatDurationHoursMins = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hrs}h ${m}m`;
  };
  
  const todaySleepDurationStr = todaySleepMins > 0 ? formatDurationHoursMins(todaySleepMins) : 'No log';
  const sleepGoal = state.sleepGoal || 480;

  const recoveryScore = useMemo(() => {
    const lastNightSleep = (state.sleepLogs || []).find((l) => l.date === todayStr);
    const sleepContribution = lastNightSleep ? lastNightSleep.sleepScore : 70;
    
    const getPastDateStr = (daysAgo: number) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const yesterdayStr = getPastDateStr(1);
    const twoDaysAgoStr = getPastDateStr(2);
    const threeDaysAgoStr = getPastDateStr(3);
    
    const workoutsYesterday = state.workouts.filter((w) => w.date === yesterdayStr);
    const workouts2DaysAgo = state.workouts.filter((w) => w.date === twoDaysAgoStr);
    const workouts3DaysAgo = state.workouts.filter((w) => w.date === threeDaysAgoStr);
    
    const penalty = 
      (workoutsYesterday.length * 20) + 
      (workouts2DaysAgo.length * 10) + 
      (workouts3DaysAgo.length * 5);
      
    return Math.max(10, Math.min(100, sleepContribution - penalty));
  }, [state.sleepLogs, state.workouts, todayStr]);
  
  const recoveryMessage = useMemo(() => {
    if (recoveryScore >= 80) return 'Ready for workout 💪';
    if (recoveryScore >= 50) return 'Moderate recovery';
    return 'Consider a lighter workout';
  }, [recoveryScore]);

  const sleepStreak = useMemo(() => {
    if (!state.sleepLogs || state.sleepLogs.length === 0) return 0;
    
    const metDates = new Set<string>();
    state.sleepLogs.forEach((log) => {
      if (log.duration >= sleepGoal) {
        metDates.add(log.date);
      }
    });
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);
    
    let streak = 0;
    if (metDates.has(todayStr) || metDates.has(yesterdayStr)) {
      let checkDate = new Date();
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
    }
    return streak;
  }, [state.sleepLogs, sleepGoal, todayStr]);

  // 5. Body Stats Summary Math
  const bodySummary = useMemo(() => {
    const categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
    const userWeight = state.profile?.weight || 70;
    
    const stats = categories.map((cat) => {
      const relatedExIds = new Set(
        STATIC_EXERCISE_LIBRARY.filter((e) => e.targetMuscleGroup === cat).map((e) => e.id)
      );
      state.customExercises.forEach((ex) => {
        if (ex.targetMuscleGroup === cat) relatedExIds.add(ex.id);
      });

      const completedSetsInHistory: Array<{ weight: number }> = [];
      state.workouts.forEach((w) => {
        w.exercises.forEach((ex) => {
          if (relatedExIds.has(ex.exerciseId)) {
            ex.sets.forEach((set) => {
              if (set.completed) completedSetsInHistory.push({ weight: set.weight });
            });
          }
        });
      });

      let maxWeight = 0;
      completedSetsInHistory.forEach((s) => {
        if (s.weight > maxWeight) maxWeight = s.weight;
      });
      const targetWeight = (BODYWEIGHT_MULTIPLIERS[cat] || 1.0) * userWeight;
      const score = maxWeight > 0 ? Math.min(100, Math.round((maxWeight / targetWeight) * 100)) : 30;
      return { name: cat, score };
    });

    const overallScore = Math.round(stats.reduce((sum, s) => sum + s.score, 0) / stats.length);
    const sorted = [...stats].sort((a, b) => b.score - a.score);

    return {
      overallScore,
      strongest: sorted[0]?.name || 'N/A',
      strongestScore: sorted[0]?.score || 0,
      weakest: sorted[sorted.length - 1]?.name || 'N/A',
      weakestScore: sorted[sorted.length - 1]?.score || 0,
      stats,
    };
  }, [state.workouts, state.customExercises, state.profile]);

  // Goal name mapping
  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case 'muscle_gain': return 'Muscle Gain';
      case 'fat_loss': return 'Fat Loss';
      case 'weight_maintenance': return 'Maintenance';
      default: return 'Maintenance';
    }
  };

  // 6. Today Score Game System
  const todayScore = useMemo(() => {
    const workoutCompleted = todayWorkouts.length > 0;
    const workoutPoints = workoutCompleted ? 25 : 0;
    
    const proteinRatio = targetProtein > 0 ? Math.min(1.0, consumedProtein / targetProtein) : 0;
    const proteinPoints = Math.round(proteinRatio * 20);
    
    const calorieRatio = targetCalories > 0 ? Math.min(1.0, consumedCalories / targetCalories) : 0;
    const caloriePoints = Math.round(calorieRatio * 20);
    
    const waterRatio = waterGoal > 0 ? Math.min(1.0, todayWater / waterGoal) : 0;
    const waterPoints = Math.round(waterRatio * 15);

    const sleepRatio = sleepGoal > 0 ? Math.min(1.0, todaySleepMins / sleepGoal) : 0;
    const sleepPoints = Math.round(sleepRatio * 20);
    
    const totalScore = workoutPoints + caloriePoints + proteinPoints + waterPoints + sleepPoints;
    
    return {
      total: Math.min(100, totalScore),
      breakdown: [
        { name: 'Workout Logged', points: workoutPoints, max: 25, achieved: workoutCompleted, icon: 'barbell-outline' },
        { name: 'Calories Met', points: caloriePoints, max: 20, achieved: calorieRatio >= 0.85, icon: 'flame-outline' },
        { name: 'Protein Met', points: proteinPoints, max: 20, achieved: proteinRatio >= 0.85, icon: 'nutrition-outline' },
        { name: 'Hydration Met', points: waterPoints, max: 15, achieved: waterRatio >= 0.85, icon: 'water-outline' },
        { name: 'Sleep Goal Met', points: sleepPoints, max: 20, achieved: sleepRatio >= 0.85, icon: 'moon-outline' },
      ],
    };
  }, [todayWorkouts, consumedCalories, targetCalories, consumedProtein, targetProtein, todayWater, waterGoal, todaySleepMins, sleepGoal]);

  // Target muscle parser for workout plan
  const todayTargetMuscles = useMemo(() => {
    if (todayWorkouts.length === 0) return '';
    const muscles = new Set<string>();
    todayWorkouts[0].exercises.forEach((ex) => {
      const dbEx = STATIC_EXERCISE_LIBRARY.find((e) => e.id === ex.exerciseId) || state.customExercises.find((e) => e.id === ex.exerciseId);
      if (dbEx) muscles.add(dbEx.targetMuscleGroup);
    });
    return Array.from(muscles).join(' • ');
  }, [todayWorkouts, state.customExercises]);

  const handleQuickAddWater = () => {
    addWater(250, todayStr);
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 18) return 'Good afternoon';
    return 'Good evening';
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
              {getGreeting()}, {profile?.name || 'Athlete'}! 👋
            </AppText>
          </View>
          <View style={styles.headerSubtitleRow}>
            <AppText variant="caption" color="textSecondary" style={styles.headerSubtitle}>
              {profile?.weight || 70} kg • {getGoalLabel(profile?.fitnessGoal || '')}
            </AppText>
            {currentStreak > 0 && (
              <View style={[styles.streakBadge, { backgroundColor: 'rgba(255, 153, 0, 0.08)', borderColor: 'rgba(255, 153, 0, 0.2)' }]}>
                <Ionicons name="flame" size={12} color="#ff9900" />
                <AppText variant="caption" style={styles.streakText}>Streak: {currentStreak} days</AppText>
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

      {/* Hero section: Daily Completion Score */}
      <Card variant="glass" style={styles.todayScoreCard}>
        <View style={styles.todayScoreHeader}>
          <View>
            <AppText variant="caption" color="textMuted">DAILY SCORE</AppText>
            <View style={styles.todayScoreRow}>
              <AppText variant="h1" color="primary" style={styles.bigScoreText}>{todayScore.total}</AppText>
              <AppText variant="h3" color="textMuted" style={styles.scoreMax}>/100</AppText>
            </View>
          </View>
          <ProgressBar progress={todayScore.total / 100} color={theme.primary} style={styles.todayScoreProgress} />
        </View>
        
        <View style={styles.breakdownGrid}>
          {todayScore.breakdown.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={[styles.breakdownIconWrap, { backgroundColor: item.achieved ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)' }]}>
                <Ionicons 
                  name={item.achieved ? "checkmark" : (item.icon as any)} 
                  size={14} 
                  color={item.achieved ? theme.success : theme.textMuted} 
                />
              </View>
              <View>
                <AppText variant="caption" style={{ fontWeight: 'bold' }} color={item.achieved ? 'text' : 'textMuted'}>
                  {item.points} pts
                </AppText>
                <AppText variant="caption" color="textMuted" style={{ fontSize: 10 }}>
                  {item.name}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Today's Plan section */}
      <View style={styles.workoutSection}>
        <AppText variant="h3" style={styles.sectionHeader}>Today's Workout</AppText>
        {completedWorkoutToday ? (
          <Card variant="elevated" style={[styles.workoutCard, { borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <View style={styles.rowCentered}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Ionicons name="checkmark-circle" size={24} color={theme.success} />
              </View>
              <View style={styles.flex}>
                <AppText variant="bodyBold">{todayWorkouts[0].name}</AppText>
                <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                  {todayTargetMuscles || 'Completed'} • {todayWorkouts[0].exercises.length} Exercises
                </AppText>
              </View>
              <View style={styles.completedBadge}>
                <AppText variant="caption" color="success" style={{ fontWeight: 'bold' }}>DONE</AppText>
              </View>
            </View>
          </Card>
        ) : (
          <Card variant="normal" style={styles.workoutCard}>
            <View style={{ marginBottom: 12 }}>
              <AppText variant="bodyBold" style={{ fontSize: 15 }}>No workout tracked today</AppText>
              <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                Train consistency. Start a blank workout or choose a saved template.
              </AppText>
            </View>
            <View style={styles.workoutActionRow}>
              <TouchableOpacity 
                style={[styles.workoutActionBtn, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('AddWorkoutSession')}
              >
                <Ionicons name="barbell-outline" size={16} color="#0c0f12" />
                <AppText variant="caption" style={styles.workoutActionBtnText}>Start Workout</AppText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.workoutActionBtnOutline, { borderColor: theme.border }]}
                onPress={() => navigation.navigate('WorkoutTemplates')}
              >
                <Ionicons name="copy-outline" size={16} color={theme.text} />
                <AppText variant="caption" style={{ fontWeight: 'bold', marginLeft: 6 }}>Templates</AppText>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.quickActionsSection}>
        <AppText variant="h3" style={styles.sectionHeader}>Quick Actions</AppText>
        <View style={styles.actionsGrid}>
          <TouchableOpacity onPress={() => navigation.navigate('AddWorkoutSession')} style={[styles.actionItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="barbell-outline" size={18} color={theme.secondary} />
            <AppText variant="caption" style={styles.actionLabel}>Start Gym</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('WorkoutCalendar')} style={[styles.actionItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="calendar-outline" size={18} color={theme.primary} />
            <AppText variant="caption" style={styles.actionLabel}>Calendar</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Progress')} style={[styles.actionItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="trending-up-outline" size={18} color={theme.success} />
            <AppText variant="caption" style={styles.actionLabel}>Progress</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('WaterTracker')} style={[styles.actionItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="water-outline" size={18} color={theme.accent} />
            <AppText variant="caption" style={styles.actionLabel}>Log Water</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Nutrition')} style={[styles.actionItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="nutrition-outline" size={18} color={theme.secondary} />
            <AppText variant="caption" style={styles.actionLabel}>Add Meal</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('SleepTracker')} style={[styles.actionItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="moon-outline" size={18} color="#c084fc" />
            <AppText variant="caption" style={styles.actionLabel}>Sleep Tracker</AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Body Overview Card */}
      <View style={styles.bodyOverviewSection}>
        <AppText variant="h3" style={styles.sectionHeader}>Body Status</AppText>
        <Card variant="glass" style={styles.bodyCard} onPress={() => navigation.navigate('BodyStats')}>
          <View style={styles.bodyCardHeader}>
            <AppText variant="bodyBold">Muscle Balance</AppText>
            <View style={[styles.bodyScoreBadge, { backgroundColor: 'rgba(174, 255, 0, 0.08)', borderColor: theme.primary }]}>
              <AppText variant="caption" color="primary" style={{ fontWeight: 'bold' }}>
                Overall: {bodySummary.overallScore}
              </AppText>
            </View>
          </View>
          <View style={styles.musclesOverviewGrid}>
            {bodySummary.stats.map((m) => (
              <View key={m.name} style={styles.muscleRow}>
                <View style={styles.muscleRowHeader}>
                  <AppText variant="caption" style={{ fontWeight: 'bold' }}>{m.name}</AppText>
                  <AppText variant="caption" color="textSecondary">{m.score}/100</AppText>
                </View>
                <ProgressBar progress={m.score / 100} color={theme.primary} style={styles.muscleProgress} />
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Water Tracker Widget */}
      <View style={styles.waterSection}>
        <Card variant="normal" style={styles.waterWidgetCard}>
          <View style={styles.rowCentered}>
            <View style={[styles.waterIconWrap, { backgroundColor: 'rgba(0, 229, 255, 0.08)' }]}>
              <Ionicons name="water" size={20} color={theme.accent} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyBold">Water Intake</AppText>
              <AppText variant="caption" color="textSecondary">
                {todayWater} / {waterGoal} ml
              </AppText>
            </View>
            <TouchableOpacity 
              onPress={handleQuickAddWater} 
              style={[styles.quickAddWaterBtn, { backgroundColor: `${theme.accent}10`, borderColor: theme.accent }]}
            >
              <AppText variant="caption" color="accent" style={{ fontWeight: 'bold' }}>+250ml</AppText>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      {/* Sleep & Recovery Widget */}
      <View style={styles.sleepSection}>
        <Card variant="normal" style={styles.sleepWidgetCard} onPress={() => navigation.navigate('SleepTracker')}>
          <View style={styles.rowCentered}>
            <View style={[styles.sleepIconWrap, { backgroundColor: 'rgba(168, 85, 247, 0.08)' }]}>
              <Ionicons name="moon" size={20} color="#c084fc" />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyBold">Sleep & Recovery</AppText>
              <AppText variant="caption" color="textSecondary">
                Today: {todaySleepDurationStr} {todaySleepScore > 0 ? `• Score: ${todaySleepScore}` : ''}
              </AppText>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View style={[styles.recoveryBadge, { 
                backgroundColor: recoveryScore >= 80 ? 'rgba(16, 185, 129, 0.1)' : recoveryScore >= 50 ? 'rgba(255, 193, 7, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderColor: recoveryScore >= 80 ? theme.success : recoveryScore >= 50 ? '#ffc107' : theme.error,
                borderWidth: 1,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8
              }]}>
                <AppText variant="caption" style={{ 
                  color: recoveryScore >= 80 ? theme.success : recoveryScore >= 50 ? '#ffc107' : theme.error, 
                  fontWeight: 'bold', 
                  fontSize: 10 
                }}>
                  Rec: {recoveryScore}%
                </AppText>
              </View>
              {sleepStreak > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="flame" size={12} color="#ff9900" />
                  <AppText variant="caption" style={{ color: '#ff9900', fontWeight: 'bold', fontSize: 10, marginLeft: 2 }}>
                    {sleepStreak}d streak
                  </AppText>
                </View>
              )}
            </View>
          </View>
        </Card>
      </View>

      {/* Achievements cabinet */}
      {state.unlockedAchievements && state.unlockedAchievements.length > 0 && (
        <View style={styles.achCabinetSection}>
          <AppText variant="h3" style={styles.sectionHeader}>Recent Achievements</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achScroll}>
            {state.unlockedAchievements.slice(0, 4).map((id) => {
              const ach = ALL_ACHIEVEMENTS.find(a => a.id === id);
              if (!ach) return null;
              return (
                <View key={id} style={[styles.achBadge, { backgroundColor: `${ach.color}10`, borderColor: ach.color }]}>
                  <Ionicons name={ach.icon as any} size={14} color={ach.color} />
                  <AppText variant="caption" style={{ color: ach.color, fontWeight: 'bold' }}>{ach.name}</AppText>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
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
  headerSubtitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  streakText: {
    color: '#ff9900',
    fontWeight: 'bold',
    fontSize: 10,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  todayScoreCard: {
    padding: 16,
    marginVertical: 8,
  },
  todayScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayScoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  bigScoreText: {
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 40,
  },
  scoreMax: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 2,
    marginBottom: 4,
  },
  todayScoreProgress: {
    width: 100,
    height: 8,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  breakdownItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 8,
    borderRadius: 10,
  },
  breakdownIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutSection: {
    marginTop: 16,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  workoutCard: {
    padding: 14,
    marginVertical: 4,
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  workoutActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  workoutActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  workoutActionBtnText: {
    color: '#0c0f12',
    fontWeight: 'bold',
  },
  workoutActionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickActionsSection: {
    marginTop: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  actionItem: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  actionLabel: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  bodyOverviewSection: {
    marginTop: 16,
  },
  bodyCard: {
    padding: 16,
    marginVertical: 4,
  },
  bodyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bodyScoreBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  musclesOverviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  muscleRow: {
    width: '48%',
    gap: 4,
  },
  muscleRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muscleProgress: {
    height: 4,
  },
  waterSection: {
    marginTop: 12,
  },
  waterWidgetCard: {
    padding: 12,
    marginVertical: 4,
  },
  waterIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddWaterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  achCabinetSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  achScroll: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  achBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  historySection: {
    marginTop: 24,
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
  sleepSection: {
    marginTop: 12,
  },
  sleepWidgetCard: {
    padding: 12,
    marginVertical: 4,
  },
  sleepIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recoveryBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
});

export default DashboardScreen;
