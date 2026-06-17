import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { STATIC_EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { FoodEntry, WorkoutSession, PersonalRecord } from '../models/fitness';

const { width } = Dimensions.get('window');

// Muscle categories
const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

// Bodyweight multipliers for elite status (100 score)
const BODYWEIGHT_MULTIPLIERS: Record<string, number> = {
  Chest: 1.4,      // 1.4x bodyweight bench press
  Back: 1.8,       // 1.8x bodyweight deadlift
  Legs: 1.8,       // 1.8x bodyweight squat
  Shoulders: 0.9,  // 0.9x bodyweight OHP
  Arms: 0.5,       // 0.5x bodyweight barbell curl / extensions
  Core: 0.4,       // 0.4x bodyweight weighted crunches/leg raises
};

// Target weekly volume in kg for 100 score
const TARGET_WEEKLY_VOLUMES: Record<string, number> = {
  Chest: 6000,
  Back: 7000,
  Legs: 8000,
  Shoulders: 4500,
  Arms: 4000,
  Core: 2000,
};

interface MuscleStats {
  score: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Master';
  strength: number;
  volume: number;
  consistency: number;
  progress: number;
  bestExercise: string;
  prText: string;
  weeklyVolumeValue: number;
  progressPercent: number;
}

export const BodyStatsScreen: React.FC = () => {
  const { state } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation();

  // Selected muscle group for details
  const [expandedMuscle, setExpandedMuscle] = useState<string | null>(null);

  const level = state.level || 1;
  const xp = state.xp || 0;
  const xpRequired = level * 500;
  const userWeight = state.profile?.weight || 70;

  // RPG Title
  const getLevelTitle = (lvl: number) => {
    if (lvl < 5) return 'Novice Recruit';
    if (lvl < 10) return 'Steady Grinder';
    if (lvl < 15) return 'Iron Builder';
    if (lvl < 20) return 'Power Lifter';
    return 'Elite Master';
  };

  // Rank properties
  const getRankProps = (rankName: string) => {
    switch (rankName) {
      case 'Bronze': return { color: '#CD7F32', label: 'Bronze', desc: 'Beginner' };
      case 'Silver': return { color: '#C0C0C0', label: 'Silver', desc: 'Developing' };
      case 'Gold': return { color: '#FFD700', label: 'Gold', desc: 'Strong' };
      case 'Diamond': return { color: '#00E5FF', label: 'Diamond', desc: 'Advanced' };
      case 'Master': return { color: '#E040FB', label: 'Master', desc: 'Elite' };
      default: return { color: '#CD7F32', label: 'Bronze', desc: 'Beginner' };
    }
  };

  const getMuscleRank = (score: number): 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Master' => {
    if (score < 50) return 'Bronze';
    if (score < 70) return 'Silver';
    if (score < 85) return 'Gold';
    if (score < 95) return 'Diamond';
    return 'Master';
  };

  // Process data for each muscle group
  const muscleStats: Record<string, MuscleStats> = {};

  // Get current date and 7 / 30 days ago
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  MUSCLE_GROUPS.forEach((muscle) => {
    // 1. Gather all exercises in this group
    const relatedExerciseIds = new Set(
      STATIC_EXERCISE_LIBRARY.filter((e) => e.targetMuscleGroup === muscle).map((e) => e.id)
    );
    state.customExercises.forEach((ex) => {
      if (ex.targetMuscleGroup === muscle) {
        relatedExerciseIds.add(ex.id);
      }
    });

    // 2. Fetch completed set logs
    const completedSetsInHistory: Array<{ date: string; weight: number; reps: number; exName: string; exId: string }> = [];
    const completedSetsIn7Days: typeof completedSetsInHistory = [];
    const completedSetsIn30Days: typeof completedSetsInHistory = [];

    state.workouts.forEach((w) => {
      const workoutDate = new Date(w.date);
      w.exercises.forEach((ex) => {
        if (relatedExerciseIds.has(ex.exerciseId)) {
          ex.sets.forEach((set) => {
            if (set.completed) {
              const record = {
                date: w.date,
                weight: set.weight,
                reps: set.reps,
                exName: ex.name,
                exId: ex.exerciseId,
              };
              completedSetsInHistory.push(record);
              if (workoutDate >= sevenDaysAgo) {
                completedSetsIn7Days.push(record);
              }
              if (workoutDate >= thirtyDaysAgo) {
                completedSetsIn30Days.push(record);
              }
            }
          });
        }
      });
    });

    // --- STRENGTH SCORE (40%) ---
    // Find PR (Max Weight in History)
    let maxWeight = 0;
    let maxWeightReps = 0;
    let bestExercise = 'N/A';

    completedSetsInHistory.forEach((s) => {
      if (s.weight > maxWeight) {
        maxWeight = s.weight;
        maxWeightReps = s.reps;
        bestExercise = s.exName;
      }
    });

    const targetWeight = (BODYWEIGHT_MULTIPLIERS[muscle] || 1.0) * userWeight;
    const strengthScore = maxWeight > 0 ? Math.min(100, Math.round((maxWeight / targetWeight) * 100)) : 30;

    // --- VOLUME SCORE (30%) ---
    const weeklyVolume = completedSetsIn7Days.reduce((sum, s) => sum + (s.weight * s.reps), 0);
    const volumeScore = weeklyVolume > 0 ? Math.min(100, Math.round((weeklyVolume / TARGET_WEEKLY_VOLUMES[muscle]) * 100)) : 0;

    // --- CONSISTENCY SCORE (20%) ---
    // Count unique workout days targeting this muscle in last 30 days
    const uniqueDaysIn30 = new Set(completedSetsIn30Days.map((s) => s.date)).size;
    let consistencyScore = 10;
    if (uniqueDaysIn30 >= 8) consistencyScore = 100;
    else if (uniqueDaysIn30 >= 4) consistencyScore = 80;
    else if (uniqueDaysIn30 >= 2) consistencyScore = 60;
    else if (uniqueDaysIn30 === 1) consistencyScore = 40;

    // --- PROGRESS SCORE (10%) ---
    // Compare oldest vs newest completed sets of the best exercise
    let progressScore = 50;
    let progressPercent = 0;
    if (bestExercise !== 'N/A') {
      const bestExSets = completedSetsInHistory.filter((s) => s.exName === bestExercise);
      if (bestExSets.length >= 2) {
        // Sort ascending by date
        bestExSets.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const firstWeight = bestExSets[0].weight;
        const currentWeight = bestExSets[bestExSets.length - 1].weight;
        if (firstWeight > 0) {
          progressPercent = Math.round(((currentWeight - firstWeight) / firstWeight) * 100);
          if (progressPercent >= 20) progressScore = 100;
          else if (progressPercent >= 10) progressScore = 85;
          else if (progressPercent >= 5) progressScore = 70;
          else if (progressPercent > 0) progressScore = 60;
          else progressScore = 50;
        }
      }
    }

    // --- OVERALL MUSCLE SCORE ---
    const score = Math.round(
      strengthScore * 0.4 +
      volumeScore * 0.3 +
      consistencyScore * 0.2 +
      progressScore * 0.1
    );

    muscleStats[muscle] = {
      score,
      rank: getMuscleRank(score),
      strength: strengthScore,
      volume: volumeScore,
      consistency: consistencyScore,
      progress: progressScore,
      bestExercise,
      prText: maxWeight > 0 ? `${maxWeight}kg x ${maxWeightReps} reps` : 'No records yet',
      weeklyVolumeValue: weeklyVolume,
      progressPercent,
    };
  });

  // Calculate Overall Body Score (0-100)
  const allScores = Object.values(muscleStats).map((m) => m.score);
  const overallBodyScore = Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length);

  // Overall breakdowns
  const overallStrength = Math.round(Object.values(muscleStats).reduce((sum, m) => sum + m.strength, 0) / 6);
  const overallVolume = Math.round(Object.values(muscleStats).reduce((sum, m) => sum + m.volume, 0) / 6);
  const overallConsistency = Math.round(Object.values(muscleStats).reduce((sum, m) => sum + m.consistency, 0) / 6);
  const overallProgress = Math.round(Object.values(muscleStats).reduce((sum, m) => sum + m.progress, 0) / 6);

  // Achievements Definition
  const ACHIEVEMENTS = [
    { id: 'first_workout', name: 'First Workout', desc: 'Log your first workout session to begin your fitness path.', icon: 'trophy-outline', color: '#E040FB' },
    { id: 'strength_builder', name: 'Strength Builder', desc: 'Achieve a new personal record on any heavy exercise.', icon: 'barbell-outline', color: '#FFD700' },
    { id: 'protein_master', name: 'Protein Master', desc: 'Successfully hit your daily protein goal for 30 days.', icon: 'nutrition-outline', color: '#00E5FF' },
    { id: 'consistency_king', name: 'Consistency King', desc: 'Prove your dedication by completing 100 workouts.', icon: 'ribbon-outline', color: '#4CAF50' },
    { id: 'pr_hunter', name: 'PR Hunter', desc: 'Set 10 different personal records in your history.', icon: 'flame-outline', color: '#FF5722' },
    { id: 'hydration_starter', name: 'Hydration Starter', desc: 'Successfully hit your daily water goal for 7 days.', icon: 'water-outline', color: '#00E5FF' },
    { id: 'hydration_master', name: 'Hydration Master', desc: 'Successfully hit your daily water goal for 30 days.', icon: 'trophy-outline', color: '#00E5FF' },
  ];

  const unlockedSet = new Set(state.unlockedAchievements || []);

  const handleToggleExpand = (muscle: string) => {
    if (expandedMuscle === muscle) {
      setExpandedMuscle(null);
    } else {
      setExpandedMuscle(muscle);
    }
  };

  return (
    <Screen scrollable>
      {/* Level Banner */}
      <Card variant="glass" style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `${theme.primary}12`, borderColor: theme.primary }]}>
            <AppText variant="h1" color="primary" style={styles.levelText}>{level}</AppText>
            <AppText variant="caption" color="textMuted">LEVEL</AppText>
          </View>
          <View style={styles.heroDetails}>
            <AppText variant="h2">{getLevelTitle(level)}</AppText>
            <AppText variant="caption" color="textSecondary" style={styles.xpText}>
              XP: {xp} / {xpRequired}
            </AppText>
            <ProgressBar progress={xp / xpRequired} color={theme.primary} style={styles.xpProgress} />
          </View>
        </View>
      </Card>

      {/* Overall Body Score Card */}
      <Card variant="normal" style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <View style={styles.scoreTextCol}>
            <AppText variant="caption" color="textMuted">OVERALL BODY SCORE</AppText>
            <AppText variant="h1" style={styles.scoreNumber}>{overallBodyScore}/100</AppText>
          </View>
          <View style={[styles.overallRankBadge, { backgroundColor: 'rgba(0, 229, 255, 0.08)', borderColor: '#00E5FF' }]}>
            <Ionicons name="shield-checkmark" size={18} color="#00E5FF" />
            <AppText variant="caption" style={{ color: '#00E5FF', fontWeight: 'bold' }}>Active Profile</AppText>
          </View>
        </View>

        {/* Breakdown Grid */}
        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownItem}>
            <AppText variant="caption" color="textMuted">Strength (40%)</AppText>
            <AppText variant="bodyBold">{overallStrength}/100</AppText>
            <ProgressBar progress={overallStrength / 100} color={theme.primary} style={styles.gridProgress} />
          </View>
          <View style={styles.breakdownItem}>
            <AppText variant="caption" color="textMuted">Volume (30%)</AppText>
            <AppText variant="bodyBold">{overallVolume}/100</AppText>
            <ProgressBar progress={overallVolume / 100} color={theme.secondary} style={styles.gridProgress} />
          </View>
          <View style={styles.breakdownItem}>
            <AppText variant="caption" color="textMuted">Consistency (20%)</AppText>
            <AppText variant="bodyBold">{overallConsistency}/100</AppText>
            <ProgressBar progress={overallConsistency / 100} color={theme.accent} style={styles.gridProgress} />
          </View>
          <View style={styles.breakdownItem}>
            <AppText variant="caption" color="textMuted">Progress (10%)</AppText>
            <AppText variant="bodyBold">{overallProgress}/100</AppText>
            <ProgressBar progress={overallProgress / 100} color={theme.success} style={styles.gridProgress} />
          </View>
        </View>
      </Card>

      {/* Muscle Groups Breakdown */}
      <View style={styles.section}>
        <AppText variant="h3" style={styles.sectionTitle}>Muscle Group Ratings</AppText>
        {MUSCLE_GROUPS.map((muscle) => {
          const stats = muscleStats[muscle];
          const rankInfo = getRankProps(stats.rank);
          const isExpanded = expandedMuscle === muscle;

          return (
            <Card key={muscle} variant="glass" style={styles.muscleCard} onPress={() => handleToggleExpand(muscle)}>
              <View style={styles.muscleMainRow}>
                <View style={styles.muscleNameCol}>
                  <AppText variant="bodyBold">{muscle}</AppText>
                  <AppText variant="caption" color="textSecondary">Rating Score: {stats.score}/100</AppText>
                </View>
                <View style={styles.muscleRankCol}>
                  <View style={[styles.rankBadge, { backgroundColor: `${rankInfo.color}15`, borderColor: rankInfo.color }]}>
                    <AppText variant="caption" style={{ color: rankInfo.color, fontWeight: 'bold' }}>{rankInfo.label}</AppText>
                  </View>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={theme.textMuted} />
                </View>
              </View>

              {isExpanded && (
                <View style={[styles.expandedContent, { borderTopColor: theme.border }]}>
                  {/* Detailed stat columns */}
                  <View style={styles.statDetailRow}>
                    <View style={styles.statDetailCol}>
                      <AppText variant="caption" color="textMuted">BEST EXERCISE</AppText>
                      <AppText variant="body" numberOfLines={1}>{stats.bestExercise}</AppText>
                    </View>
                    <View style={styles.statDetailCol}>
                      <AppText variant="caption" color="textMuted">PERSONAL RECORD</AppText>
                      <AppText variant="body">{stats.prText}</AppText>
                    </View>
                  </View>

                  <View style={styles.statDetailRow}>
                    <View style={styles.statDetailCol}>
                      <AppText variant="caption" color="textMuted">WEEKLY VOLUME</AppText>
                      <AppText variant="body">{stats.weeklyVolumeValue.toLocaleString()} kg</AppText>
                    </View>
                    <View style={styles.statDetailCol}>
                      <AppText variant="caption" color="textMuted">PROGRESS (EST.)</AppText>
                      <AppText variant="body" style={{ color: stats.progressPercent >= 0 ? theme.success : theme.error }}>
                        {stats.progressPercent >= 0 ? `+${stats.progressPercent}%` : `${stats.progressPercent}%`}
                      </AppText>
                    </View>
                  </View>

                  {/* Progressive bar breakdown */}
                  <View style={styles.progressiveBreakdown}>
                    <View style={styles.barItem}>
                      <View style={styles.barLabelRow}>
                        <AppText variant="caption" color="textSecondary">Strength Power</AppText>
                        <AppText variant="caption" color="textMuted">{stats.strength}/100</AppText>
                      </View>
                      <ProgressBar progress={stats.strength / 100} color={theme.primary} style={styles.barProgress} />
                    </View>
                    <View style={styles.barItem}>
                      <View style={styles.barLabelRow}>
                        <AppText variant="caption" color="textSecondary">Training Volume</AppText>
                        <AppText variant="caption" color="textMuted">{stats.volume}/100</AppText>
                      </View>
                      <ProgressBar progress={stats.volume / 100} color={theme.secondary} style={styles.barProgress} />
                    </View>
                  </View>
                </View>
              )}
            </Card>
          );
        })}
      </View>

      {/* Achievements Badges */}
      <View style={[styles.section, { marginBottom: 30 }]}>
        <AppText variant="h3" style={styles.sectionTitle}>Unlocked Achievements</AppText>
        <Card variant="glass" style={styles.achievementsCard}>
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedSet.has(ach.id);
            return (
              <View key={ach.id} style={[styles.achievementRow, !isUnlocked && styles.lockedRow]}>
                <View style={[
                  styles.achievementIconWrap, 
                  { 
                    backgroundColor: isUnlocked ? `${ach.color}15` : '#1c232d',
                    borderColor: isUnlocked ? ach.color : '#334155'
                  }
                ]}>
                  <Ionicons name={ach.icon as any} size={22} color={isUnlocked ? ach.color : '#64748b'} />
                </View>
                <View style={styles.flex}>
                  <View style={styles.achTitleRow}>
                    <AppText variant="bodyBold" style={{ color: isUnlocked ? theme.text : '#64748b' }}>{ach.name}</AppText>
                    {isUnlocked ? (
                      <View style={styles.unlockedLabel}>
                        <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                        <AppText variant="caption" color="success" style={{ marginLeft: 2, fontWeight: 'bold' }}>UNLOCKED</AppText>
                      </View>
                    ) : (
                      <AppText variant="caption" color="textMuted">LOCKED</AppText>
                    )}
                  </View>
                  <AppText variant="caption" color="textSecondary">{ach.desc}</AppText>
                </View>
              </View>
            );
          })}
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    padding: 16,
    marginVertical: 12,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  heroDetails: {
    flex: 1,
  },
  xpText: {
    marginTop: 2,
    marginBottom: 4,
  },
  xpProgress: {
    height: 8,
  },
  scoreCard: {
    padding: 18,
    marginVertical: 6,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTextCol: {
    flex: 1,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  overallRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  breakdownItem: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridProgress: {
    height: 4,
    marginTop: 6,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  muscleCard: {
    marginVertical: 5,
    padding: 14,
  },
  muscleMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muscleNameCol: {
    flex: 1,
  },
  muscleRankCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  expandedContent: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
    gap: 10,
  },
  statDetailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statDetailCol: {
    flex: 1,
  },
  progressiveBreakdown: {
    marginTop: 8,
    gap: 8,
  },
  barItem: {},
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barProgress: {
    height: 4,
  },
  flex: {
    flex: 1,
  },
  achievementsCard: {
    padding: 16,
    gap: 16,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  lockedRow: {
    opacity: 0.5,
  },
  achievementIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  unlockedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default BodyStatsScreen;
