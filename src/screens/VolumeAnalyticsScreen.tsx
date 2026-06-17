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
import { WorkoutSession } from '../models/fitness';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

// Targets based on BodyStats (weekly in kg)
const TARGET_WEEKLY_VOLUMES: Record<string, number> = {
  Chest: 6000,
  Back: 7000,
  Legs: 8000,
  Shoulders: 4500,
  Arms: 4000,
  Core: 2000,
};

export const VolumeAnalyticsScreen: React.FC = () => {
  const { state } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation();

  // 1. Setup Dates
  const now = new Date();
  
  // This Week (starting Monday)
  const thisWeekStart = useMemo(() => {
    const d = new Date(now);
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);

  // This Month
  const thisMonthStart = useMemo(() => {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, [now]);

  // Last Month
  const lastMonthStart = useMemo(() => {
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }, [now]);
  
  const lastMonthEnd = useMemo(() => {
    return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  }, [now]);

  // Helper: Calculate Volume of completed sets in a workout list
  const calculateWorkoutVolume = (workout: WorkoutSession) => {
    return workout.exercises.reduce((sumEx, ex) => {
      return sumEx + ex.sets.reduce((sumSet, set) => {
        if (set.completed) {
          return sumSet + (set.weight * set.reps);
        }
        return sumSet;
      }, 0);
    }, 0);
  };

  // Helper: Group volume by muscle group for a list of workouts
  const calculateVolumeByMuscle = (workouts: WorkoutSession[]) => {
    const map: Record<string, number> = {
      Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0, Core: 0
    };

    workouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        // Map target muscle group
        let muscle = ex.muscleGroup;
        if (muscle === 'Triceps' || muscle === 'Biceps' || muscle === 'Forearms') {
          muscle = 'Arms';
        }
        if (muscle === 'Quadriceps' || muscle === 'Hamstrings' || muscle === 'Calves' || muscle === 'Glutes') {
          muscle = 'Legs';
        }
        if (muscle === 'Abs') {
          muscle = 'Core';
        }

        if (map[muscle] !== undefined) {
          const exerciseVolume = ex.sets.reduce((sum, s) => s.completed ? sum + (s.weight * s.reps) : sum, 0);
          map[muscle] += exerciseVolume;
        }
      });
    });

    return map;
  };

  // 2. Data Filtering
  const workoutsThisWeek = useMemo(() => {
    return state.workouts.filter((w) => new Date(w.date) >= thisWeekStart);
  }, [state.workouts, thisWeekStart]);

  const workoutsThisMonth = useMemo(() => {
    return state.workouts.filter((w) => new Date(w.date) >= thisMonthStart);
  }, [state.workouts, thisMonthStart]);

  const workoutsLastMonth = useMemo(() => {
    return state.workouts.filter((w) => {
      const d = new Date(w.date);
      return d >= lastMonthStart && d <= lastMonthEnd;
    });
  }, [state.workouts, lastMonthStart, lastMonthEnd]);

  // 3. Compute Volumes
  const volumeThisWeek = useMemo(() => {
    return workoutsThisWeek.reduce((sum, w) => sum + calculateWorkoutVolume(w), 0);
  }, [workoutsThisWeek]);

  const volumeThisMonth = useMemo(() => {
    return workoutsThisMonth.reduce((sum, w) => sum + calculateWorkoutVolume(w), 0);
  }, [workoutsThisMonth]);

  const volumeLastMonth = useMemo(() => {
    return workoutsLastMonth.reduce((sum, w) => sum + calculateWorkoutVolume(w), 0);
  }, [workoutsLastMonth]);

  // Muscle Volume details
  const muscleVolumeThisMonth = useMemo(() => {
    return calculateVolumeByMuscle(workoutsThisMonth);
  }, [workoutsThisMonth]);

  const muscleVolumeLastMonth = useMemo(() => {
    return calculateVolumeByMuscle(workoutsLastMonth);
  }, [workoutsLastMonth]);

  const muscleVolumeThisWeek = useMemo(() => {
    return calculateVolumeByMuscle(workoutsThisWeek);
  }, [workoutsThisWeek]);

  // Total Volume comparison percentage
  const totalVolumeProgress = useMemo(() => {
    if (volumeLastMonth === 0) return 0;
    return Math.round(((volumeThisMonth - volumeLastMonth) / volumeLastMonth) * 100);
  }, [volumeThisMonth, volumeLastMonth]);

  // 4. Muscle Balance & Sugesstions
  const weeklyUpperVolume = useMemo(() => {
    return (
      (muscleVolumeThisWeek['Chest'] || 0) +
      (muscleVolumeThisWeek['Back'] || 0) +
      (muscleVolumeThisWeek['Shoulders'] || 0) +
      (muscleVolumeThisWeek['Arms'] || 0)
    );
  }, [muscleVolumeThisWeek]);

  const weeklyLowerVolume = useMemo(() => {
    return muscleVolumeThisWeek['Legs'] || 0;
  }, [muscleVolumeThisWeek]);

  const weeklyCoreVolume = useMemo(() => {
    return muscleVolumeThisWeek['Core'] || 0;
  }, [muscleVolumeThisWeek]);

  // Upper Body Target: 6000 + 7000 + 4500 + 4000 = 21500
  // Lower Body Target: 8000
  // Core Target: 2000
  const upperBodyScore = useMemo(() => {
    return Math.min(100, Math.round((weeklyUpperVolume / 21500) * 100));
  }, [weeklyUpperVolume]);

  const lowerBodyScore = useMemo(() => {
    return Math.min(100, Math.round((weeklyLowerVolume / 8000) * 100));
  }, [weeklyLowerVolume]);

  const coreScore = useMemo(() => {
    return Math.min(100, Math.round((weeklyCoreVolume / 2000) * 100));
  }, [weeklyCoreVolume]);

  // Suggestions generator (Strictly offline, fitness-only insights)
  const fitnessSuggestions = useMemo(() => {
    const list: string[] = [];
    
    // Check if training lower body vs upper body is unbalanced
    if (upperBodyScore > lowerBodyScore + 30) {
      list.push("Your leg training volume is lower compared to other muscle groups.");
      list.push("Consider adding more lower body exercises like squats, Romanian deadlifts, or leg press to balance development.");
    } else if (lowerBodyScore > upperBodyScore + 30) {
      list.push("Your upper body training volume is lagging behind your lower body work.");
      list.push("Consider incorporating more chest presses, overhead presses, or pull-ups to build balanced upper-body strength.");
    }

    if (coreScore < 20) {
      list.push("Core training frequency is low.");
      list.push("Adding dedicated core movements (hanging leg raises, planks) twice a week will support compound lift stability.");
    }

    if (volumeThisMonth > volumeLastMonth && volumeLastMonth > 0) {
      list.push("Excellent work! You are applying progressive overload this month compared to last month.");
    } else if (volumeThisMonth < volumeLastMonth && workoutsThisMonth.length < workoutsLastMonth.length) {
      list.push("Training frequency is lower this month. Try to schedule consistent sessions to maintain training volume.");
    }

    if (list.length === 0) {
      list.push("Your training volume is currently well-balanced across body regions!");
      list.push("Continue maintaining your current split and applying steady progressive overload.");
    }

    return list;
  }, [upperBodyScore, lowerBodyScore, coreScore, volumeThisMonth, volumeLastMonth, workoutsThisMonth, workoutsLastMonth]);

  // Max volume in weekly muscle volumes for scaling chart
  const maxWeeklyMuscleVolume = useMemo(() => {
    const vals = Object.values(muscleVolumeThisWeek);
    const maxVal = Math.max(...vals);
    return maxVal > 0 ? maxVal : 1000;
  }, [muscleVolumeThisWeek]);

  return (
    <Screen scrollable>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Volume Analytics</AppText>
      </View>

      {/* Overview Card */}
      <Card variant="glass" style={styles.overviewCard}>
        <AppText variant="caption" color="textMuted">MONTHLY TOTAL VOLUME</AppText>
        <View style={styles.ovRow}>
          <AppText variant="h1">{volumeThisMonth.toLocaleString()} kg</AppText>
          {volumeLastMonth > 0 && (
            <View style={[styles.progressBadge, { backgroundColor: totalVolumeProgress >= 0 ? `${theme.success}15` : `${theme.error}15`, borderColor: totalVolumeProgress >= 0 ? theme.success : theme.error }]}>
              <Ionicons name={totalVolumeProgress >= 0 ? "trending-up" : "trending-down"} size={14} color={totalVolumeProgress >= 0 ? theme.success : theme.error} />
              <AppText variant="caption" style={{ color: totalVolumeProgress >= 0 ? theme.success : theme.error, fontWeight: 'bold' }}>
                {totalVolumeProgress >= 0 ? `+${totalVolumeProgress}%` : `${totalVolumeProgress}%`}
              </AppText>
            </View>
          )}
        </View>
        <AppText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
          Last Month: {volumeLastMonth.toLocaleString()} kg
        </AppText>
      </Card>

      {/* Week overview */}
      <View style={styles.weekOverviewRow}>
        <View style={[styles.weekBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="bodyBold" color="primary">{volumeThisWeek.toLocaleString()} kg</AppText>
          <AppText variant="caption" color="textSecondary">Weekly Volume</AppText>
        </View>
        <View style={[styles.weekBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="bodyBold">{workoutsThisWeek.length}</AppText>
          <AppText variant="caption" color="textSecondary">Workouts this week</AppText>
        </View>
      </View>

      {/* Weekly Muscle Volume Bar Chart */}
      <View style={styles.chartSection}>
        <AppText variant="h3" style={styles.sectionTitle}>Weekly Muscle Volume (kg)</AppText>
        <Card variant="glass" style={styles.chartCard}>
          <View style={styles.barsContainer}>
            {MUSCLE_GROUPS.map((muscle) => {
              const val = muscleVolumeThisWeek[muscle] || 0;
              const percent = Math.min(100, Math.round((val / maxWeeklyMuscleVolume) * 100));
              return (
                <View key={muscle} style={styles.barItem}>
                  <View style={styles.barWrapper}>
                    {/* Bar background track */}
                    <View style={[styles.barTrack, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]} />
                    {/* Active Bar */}
                    <View 
                      style={[
                        styles.barActive, 
                        { 
                          height: `${percent}%`, 
                          backgroundColor: muscle === 'Legs' ? theme.secondary : (muscle === 'Core' ? theme.accent : theme.primary)
                        }
                      ]} 
                    />
                  </View>
                  <AppText variant="caption" color="textSecondary" style={styles.barValueText}>
                    {val > 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                  </AppText>
                  <AppText variant="caption" color="textMuted" style={styles.barLabel}>
                    {muscle.slice(0, 3).toUpperCase()}
                  </AppText>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Muscle Balance Analysis */}
      <View style={styles.balanceSection}>
        <AppText variant="h3" style={styles.sectionTitle}>Muscle Balance</AppText>
        <Card variant="normal" style={styles.balanceCard}>
          {/* Upper Body */}
          <View style={styles.balanceRow}>
            <View style={styles.balanceHeader}>
              <AppText variant="bodyBold">Upper Body Volume</AppText>
              <AppText variant="caption" color="textSecondary">{weeklyUpperVolume.toLocaleString()} / 21,500 kg ({upperBodyScore}%)</AppText>
            </View>
            <ProgressBar progress={weeklyUpperVolume / 21500} color={theme.primary} />
          </View>

          {/* Lower Body */}
          <View style={styles.balanceRow}>
            <View style={styles.balanceHeader}>
              <AppText variant="bodyBold">Lower Body Volume</AppText>
              <AppText variant="caption" color="textSecondary">{weeklyLowerVolume.toLocaleString()} / 8,000 kg ({lowerBodyScore}%)</AppText>
            </View>
            <ProgressBar progress={weeklyLowerVolume / 8000} color={theme.secondary} />
          </View>

          {/* Core */}
          <View style={styles.balanceRow}>
            <View style={styles.balanceHeader}>
              <AppText variant="bodyBold">Core Volume</AppText>
              <AppText variant="caption" color="textSecondary">{weeklyCoreVolume.toLocaleString()} / 2,000 kg ({coreScore}%)</AppText>
            </View>
            <ProgressBar progress={weeklyCoreVolume / 2000} color={theme.accent} />
          </View>
        </Card>
      </View>

      {/* Monthly Muscle Progress Comparisons */}
      <View style={styles.progressSection}>
        <AppText variant="h3" style={styles.sectionTitle}>Monthly Comparison</AppText>
        {MUSCLE_GROUPS.map((muscle) => {
          const thisVol = muscleVolumeThisMonth[muscle] || 0;
          const lastVol = muscleVolumeLastMonth[muscle] || 0;
          
          let changePercent = 0;
          if (lastVol > 0) {
            changePercent = Math.round(((thisVol - lastVol) / lastVol) * 100);
          }

          return (
            <Card key={muscle} variant="glass" style={styles.muscleProgressItem}>
              <View style={styles.mpHeader}>
                <AppText variant="bodyBold">{muscle}</AppText>
                {lastVol > 0 ? (
                  <AppText 
                    variant="caption" 
                    style={{ 
                      color: changePercent >= 0 ? theme.success : theme.error,
                      fontWeight: 'bold' 
                    }}
                  >
                    {changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`}
                  </AppText>
                ) : (
                  <AppText variant="caption" color="textMuted">New Muscle</AppText>
                )}
              </View>
              <View style={styles.mpVolRow}>
                <View style={styles.flex}>
                  <AppText variant="caption" color="textMuted">THIS MONTH</AppText>
                  <AppText variant="body">{thisVol.toLocaleString()} kg</AppText>
                </View>
                <View style={[styles.flex, { alignItems: 'flex-end' }]}>
                  <AppText variant="caption" color="textMuted">LAST MONTH</AppText>
                  <AppText variant="body">{lastVol.toLocaleString()} kg</AppText>
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      {/* RPG suggestions */}
      <View style={[styles.suggestionsSection, { marginBottom: 30 }]}>
        <AppText variant="h3" style={styles.sectionTitle}>Fitness Suggestions</AppText>
        <Card variant="glass" style={styles.suggestionsCard}>
          <View style={styles.sugHeader}>
            <Ionicons name="bulb-outline" size={20} color={theme.primary} />
            <AppText variant="bodyBold" color="primary" style={{ marginLeft: 6 }}>TRAINING COUNSEL</AppText>
          </View>
          <View style={{ gap: 8 }}>
            {fitnessSuggestions.map((sug, idx) => (
              <AppText key={idx} variant="body" color="textSecondary" style={styles.sugText}>
                {sug}
              </AppText>
            ))}
          </View>
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  backBtn: {
    paddingRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  overviewCard: {
    padding: 16,
    marginVertical: 8,
  },
  ovRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weekOverviewRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  weekBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  chartSection: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  chartCard: {
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  barsContainer: {
    flexDirection: 'row',
    height: 180,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    flex: 1,
    width: 14,
    borderRadius: 7,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  barTrack: {
    ...StyleSheet.absoluteFillObject,
  },
  barActive: {
    width: '100%',
    borderRadius: 7,
  },
  barValueText: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: 'bold',
  },
  barLabel: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: 'bold',
  },
  balanceSection: {
    marginTop: 20,
  },
  balanceCard: {
    padding: 16,
    gap: 16,
  },
  balanceRow: {
    gap: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSection: {
    marginTop: 20,
  },
  muscleProgressItem: {
    marginVertical: 4,
    padding: 12,
  },
  mpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mpVolRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  flex: {
    flex: 1,
  },
  suggestionsSection: {
    marginTop: 20,
  },
  suggestionsCard: {
    padding: 16,
    gap: 12,
  },
  sugHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sugText: {
    lineHeight: 18,
  },
});

export default VolumeAnalyticsScreen;
