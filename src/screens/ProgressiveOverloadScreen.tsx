import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { formatDisplayDate } from '../utils/dates';
import { RootStackParamList } from '../navigation/types';

type ProgressiveOverloadRouteProp = RouteProp<RootStackParamList, 'ProgressiveOverload'>;

interface ExerciseHistoryPoint {
  date: string;
  workoutName: string;
  volume: number;
  maxWeight: number;
  max1RM: number;
  setsText: string;
  setsCount: number;
  topSet: { weight: number; reps: number };
}

// 1RM Calculation using Epley Formula
const calculate1RM = (weight: number, reps: number): number => {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
};

export const ProgressiveOverloadScreen: React.FC = () => {
  const { state } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<ProgressiveOverloadRouteProp>();

  // Extract all unique exercises the user has performed
  const exercisesInHistory = useMemo(() => {
    const map = new Map<string, { id: string; name: string; muscleGroup: string }>();
    state.workouts.forEach((session) => {
      session.exercises.forEach((ex) => {
        if (ex.exerciseId) {
          map.set(ex.exerciseId, {
            id: ex.exerciseId,
            name: ex.name,
            muscleGroup: ex.muscleGroup,
          });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [state.workouts]);

  // Selected exercise state
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(() => {
    if (route.params?.initialExerciseId) return route.params.initialExerciseId;
    return exercisesInHistory[0]?.id || '';
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedExercise = useMemo(() => {
    return exercisesInHistory.find((ex) => ex.id === selectedExerciseId);
  }, [exercisesInHistory, selectedExerciseId]);

  // Calculate history points for selected exercise
  const exerciseHistory = useMemo((): ExerciseHistoryPoint[] => {
    if (!selectedExerciseId) return [];

    const points: ExerciseHistoryPoint[] = [];

    // Filter workouts and find selected exercise entries
    state.workouts.forEach((session) => {
      const match = session.exercises.find((ex) => ex.exerciseId === selectedExerciseId);
      if (match && match.sets && match.sets.length > 0) {
        const completedSets = match.sets.filter((s) => s.completed);
        if (completedSets.length > 0) {
          // Calculate max weight, total volume, and max 1RM
          let totalVolume = 0;
          let maxWeight = 0;
          let max1RM = 0;
          let topSet = { weight: 0, reps: 0 };

          completedSets.forEach((set) => {
            const vol = set.weight * set.reps;
            totalVolume += vol;
            if (set.weight > maxWeight) {
              maxWeight = set.weight;
            }
            const oneRepMax = calculate1RM(set.weight, set.reps);
            if (oneRepMax > max1RM) {
              max1RM = oneRepMax;
              topSet = { weight: set.weight, reps: set.reps };
            }
          });

          const setsText = completedSets.map((s) => `${s.weight}kg x ${s.reps}`).join(', ');

          points.push({
            date: session.date,
            workoutName: session.name,
            volume: Math.round(totalVolume),
            maxWeight,
            max1RM,
            setsText,
            setsCount: completedSets.length,
            topSet,
          });
        }
      }
    });

    // Sort by date ascending to build progression path
    return points.sort((a, b) => a.date.localeCompare(b.date));
  }, [state.workouts, selectedExerciseId]);

  // Derived Stats
  const stats = useMemo(() => {
    if (exerciseHistory.length === 0) return null;

    const all1RM = exerciseHistory.map((p) => p.max1RM);
    const allWeight = exerciseHistory.map((p) => p.maxWeight);
    const allVolume = exerciseHistory.map((p) => p.volume);

    const latest = exerciseHistory[exerciseHistory.length - 1];
    const previous = exerciseHistory[exerciseHistory.length - 2] || null;

    const pr1RM = Math.max(...all1RM);
    const prWeight = Math.max(...allWeight);
    const prVolume = Math.max(...allVolume);

    return {
      latest,
      previous,
      pr1RM,
      prWeight,
      prVolume,
    };
  }, [exerciseHistory]);

  // Overload suggestions for the next workout based on latest session
  const overloadRecommendations = useMemo(() => {
    if (!stats || !stats.latest) return null;

    const topSet = stats.latest.topSet;
    const baseWeight = topSet.weight;
    const baseReps = topSet.reps;
    const baseSetsCount = stats.latest.setsCount;

    // Weight Overload: +2.5kg for same reps (or +5% if bodyweight / no tạ)
    const weightIncrease = baseWeight > 0 ? 2.5 : 0;
    const targetWeight = baseWeight + weightIncrease;

    // Rep Overload: keep same weight, perform 1-2 extra reps in first sets
    const targetReps = baseReps + 1;

    // Volume Overload: add an extra set
    const targetSetsCount = baseSetsCount + 1;

    return {
      weight: {
        title: 'Option A: Weight Load',
        desc: 'Increase weight slightly to challenge tension.',
        target: `${targetWeight} kg x ${baseReps} reps`,
        change: weightIncrease > 0 ? `+${weightIncrease} kg tạ` : 'Tăng trở lực',
      },
      reps: {
        title: 'Option B: Repetition Load',
        desc: 'Focus on higher metabolic capacity with same weight.',
        target: `${baseWeight} kg x ${targetReps} reps`,
        change: `+1 rep mỗi hiệp`,
      },
      volume: {
        title: 'Option C: Volume Load',
        desc: 'Accumulate more muscle fatigue by adding an extra set.',
        target: `${targetSetsCount} sets of ${baseWeight} kg x ${baseReps} reps`,
        change: `+1 set tập luyện`,
      },
    };
  }, [stats]);

  return (
    <Screen scrollable>
      {/* Header back navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Progressive Overload</AppText>
      </View>

      {exercisesInHistory.length === 0 ? (
        <Card variant="glass" style={styles.guidanceCard}>
          <Ionicons name="analytics" size={48} color={theme.primary} style={{ alignSelf: 'center' }} />
          <AppText variant="h2" style={{ textAlign: 'center', marginTop: 12 }}>No Workout History Yet</AppText>
          <AppText variant="body" color="textSecondary" style={{ textAlign: 'center', marginTop: 8 }}>
            To analyze Progressive Overload, you need to track and complete at least one exercise in a workout session.
          </AppText>
          <AppText variant="caption" color="textMuted" style={{ textAlign: 'center', marginTop: 16 }}>
            💡 Progressive overload means gradually increasing the weight, reps, or sets over time to force adaptation and build strength.
          </AppText>
        </Card>
      ) : (
        <View style={styles.container}>
          {/* Custom Dropdown Trigger */}
          <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>SELECT EXERCISE</AppText>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={[styles.dropdownTrigger, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownLeft}>
                <Ionicons name="barbell-outline" size={20} color={theme.primary} />
                <AppText variant="bodyBold" style={{ marginLeft: 8, flexShrink: 1 }} numberOfLines={1}>
                  {selectedExercise ? selectedExercise.name : 'Choose an exercise'}
                </AppText>
                {selectedExercise && (
                  <View style={[styles.muscleTag, { backgroundColor: `${theme.primary}15` }]}>
                    <AppText variant="caption" style={{ color: theme.primary, fontSize: 10, fontWeight: 'bold' }}>
                      {selectedExercise.muscleGroup}
                    </AppText>
                  </View>
                )}
              </View>
              <Ionicons 
                name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={theme.textMuted} 
              />
            </TouchableOpacity>

            {isDropdownOpen && (
              <Card variant="glass" style={[styles.dropdownListContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                  {exercisesInHistory.map((ex) => {
                    const isSelected = ex.id === selectedExerciseId;
                    return (
                      <TouchableOpacity
                        key={ex.id}
                        style={[
                          styles.dropdownItem,
                          { 
                            borderBottomColor: theme.border,
                            backgroundColor: isSelected ? `${theme.primary}12` : 'transparent'
                          }
                        ]}
                        onPress={() => {
                          setSelectedExerciseId(ex.id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
                          <AppText 
                            variant={isSelected ? 'bodyBold' : 'body'} 
                            style={{ color: isSelected ? theme.primary : theme.text, flex: 1, marginRight: 8 }}
                            numberOfLines={1}
                          >
                            {ex.name}
                          </AppText>
                          <AppText variant="caption" color="textMuted">
                            {ex.muscleGroup}
                          </AppText>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark" size={18} color={theme.primary} style={{ marginLeft: 8 }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Card>
            )}
          </View>

          {exerciseHistory.length === 0 ? (
            <Card variant="glass" style={{ padding: 20, alignItems: 'center' }}>
              <AppText variant="body" color="textSecondary">No completed sets found for this exercise.</AppText>
            </Card>
          ) : (
            stats && (
              <>
                {/* Progression Overview Cards */}
                <View style={styles.statsRow}>
                  <Card variant="glass" style={styles.statCard}>
                    <View style={styles.cardHeaderRow}>
                      <Ionicons name="trophy-outline" size={16} color="#ffaa00" />
                      <AppText variant="caption" color="textMuted" style={{ marginLeft: 4 }}>EST. 1RM</AppText>
                    </View>
                    <AppText variant="h2" color="primary" style={{ marginTop: 4 }}>
                      {stats.pr1RM} kg
                    </AppText>
                    <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                      Latest: {stats.latest.max1RM} kg
                    </AppText>
                  </Card>

                  <Card variant="glass" style={styles.statCard}>
                    <View style={styles.cardHeaderRow}>
                      <Ionicons name="barbell-outline" size={16} color={theme.accent} />
                      <AppText variant="caption" color="textMuted" style={{ marginLeft: 4 }}>MAX WEIGHT</AppText>
                    </View>
                    <AppText variant="h2" color="accent" style={{ marginTop: 4 }}>
                      {stats.prWeight} kg
                    </AppText>
                    <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                      Latest: {stats.latest.maxWeight} kg
                    </AppText>
                  </Card>

                  <Card variant="glass" style={styles.statCard}>
                    <View style={styles.cardHeaderRow}>
                      <Ionicons name="fitness-outline" size={16} color={theme.secondary} />
                      <AppText variant="caption" color="textMuted" style={{ marginLeft: 4 }}>MAX VOLUME</AppText>
                    </View>
                    <AppText variant="h2" color="secondary" style={{ marginTop: 4 }}>
                      {stats.prVolume} kg
                    </AppText>
                    <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                      Latest: {stats.latest.volume} kg
                    </AppText>
                  </Card>
                </View>

                {/* Progression Insights */}
                {stats.previous && (
                  <Card variant="normal" style={[styles.insightCard, { borderColor: theme.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="trending-up-outline" size={20} color={theme.primary} />
                      <AppText variant="bodyBold" style={{ marginLeft: 8 }}>Session-over-Session Trend</AppText>
                    </View>
                    <View style={styles.insightDeltaRow}>
                      <View style={styles.insightCol}>
                        <AppText variant="caption" color="textMuted">ONE-REP MAX</AppText>
                        <View style={styles.deltaValueRow}>
                          <AppText variant="bodyBold">
                            {stats.latest.max1RM} kg
                          </AppText>
                          {stats.latest.max1RM > stats.previous.max1RM ? (
                            <AppText variant="caption" style={{ color: '#10b981', marginLeft: 4 }}>
                              (▲ {Math.round((stats.latest.max1RM - stats.previous.max1RM) * 10) / 10}kg)
                            </AppText>
                          ) : stats.latest.max1RM < stats.previous.max1RM ? (
                            <AppText variant="caption" style={{ color: theme.error, marginLeft: 4 }}>
                              (▼ {Math.round((stats.previous.max1RM - stats.latest.max1RM) * 10) / 10}kg)
                            </AppText>
                          ) : (
                            <AppText variant="caption" color="textMuted" style={{ marginLeft: 4 }}>(=)</AppText>
                          )}
                        </View>
                      </View>

                      <View style={styles.insightCol}>
                        <AppText variant="caption" color="textMuted">TOTAL VOLUME</AppText>
                        <View style={styles.deltaValueRow}>
                          <AppText variant="bodyBold">
                            {stats.latest.volume} kg
                          </AppText>
                          {stats.latest.volume > stats.previous.volume ? (
                            <AppText variant="caption" style={{ color: '#10b981', marginLeft: 4 }}>
                              (▲ +{stats.latest.volume - stats.previous.volume}kg)
                            </AppText>
                          ) : stats.latest.volume < stats.previous.volume ? (
                            <AppText variant="caption" style={{ color: theme.error, marginLeft: 4 }}>
                              (▼ -{stats.previous.volume - stats.latest.volume}kg)
                            </AppText>
                          ) : (
                            <AppText variant="caption" color="textMuted" style={{ marginLeft: 4 }}>(=)</AppText>
                          )}
                        </View>
                      </View>
                    </View>
                  </Card>
                )}

                {/* Progressive Overload Recommendations */}
                {overloadRecommendations && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="sparkles" size={18} color={theme.primary} />
                      <AppText variant="h3" style={{ marginLeft: 8 }}>Next Session Overload Targets</AppText>
                    </View>
                    <AppText variant="caption" color="textMuted" style={{ marginTop: 2, marginBottom: 12 }}>
                      To trigger muscle growth, select and hit one of the targets below in your next session.
                    </AppText>

                    <Card variant="glass" style={styles.recContainer}>
                      {[overloadRecommendations.weight, overloadRecommendations.reps, overloadRecommendations.volume].map((rec, index) => {
                        const colors = ['#00E5FF', '#10B981', '#FF9900'];
                        return (
                          <View key={rec.title} style={styles.recRow}>
                            <View style={styles.recBulletCol}>
                              <View style={[styles.recBadge, { backgroundColor: `${colors[index]}15`, borderColor: colors[index] }]}>
                                <AppText variant="caption" style={{ color: colors[index], fontWeight: 'bold' }}>
                                  0{index + 1}
                                </AppText>
                              </View>
                            </View>
                            <View style={styles.recContentCol}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                <AppText variant="bodyBold" style={{ color: theme.text }}>{rec.title}</AppText>
                                <View style={[styles.changeTag, { backgroundColor: `${colors[index]}15` }]}>
                                  <AppText variant="caption" style={{ color: colors[index], fontWeight: 'bold', fontSize: 10 }}>{rec.change}</AppText>
                                </View>
                              </View>
                              <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>{rec.desc}</AppText>
                              <View style={[styles.targetBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                <AppText variant="bodyBold" color="primary">{rec.target}</AppText>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </Card>
                  </View>
                )}

                {/* Progression History Log List */}
                <View style={styles.section}>
                  <AppText variant="h3" style={styles.sectionTitle}>Progression History</AppText>
                  <Card variant="normal" style={styles.historyCard}>
                    {exerciseHistory.map((item, index) => {
                      const prevItem = index > 0 ? exerciseHistory[index - 1] : null;
                      const hasVolumeGrown = prevItem ? item.volume > prevItem.volume : false;
                      const has1RMGrown = prevItem ? item.max1RM > prevItem.max1RM : false;

                      return (
                        <View key={item.date + index}>
                          <View style={styles.historyRow}>
                            <View style={styles.historyDateCol}>
                              <AppText variant="bodyBold">{formatDisplayDate(item.date)}</AppText>
                              <AppText variant="caption" color="textMuted">{item.workoutName}</AppText>
                            </View>

                            <View style={styles.historyDetailsCol}>
                              <AppText variant="caption" color="textSecondary" style={{ fontWeight: 'bold' }}>
                                {item.setsCount} sets ({item.setsText})
                              </AppText>
                              <View style={styles.historyMetricsRow}>
                                <View style={styles.historyMetricItem}>
                                  <AppText variant="caption" color="textMuted">Volume: </AppText>
                                  <AppText variant="caption" color="textSecondary" style={{ fontWeight: 'bold' }}>
                                    {item.volume} kg
                                  </AppText>
                                  {hasVolumeGrown && (
                                    <Ionicons name="arrow-up-circle" size={12} color="#10b981" style={{ marginLeft: 2 }} />
                                  )}
                                </View>
                                <View style={[styles.historyMetricItem, { marginLeft: 12 }]}>
                                  <AppText variant="caption" color="textMuted">Max 1RM: </AppText>
                                  <AppText variant="caption" color="textSecondary" style={{ fontWeight: 'bold' }}>
                                    {item.max1RM} kg
                                  </AppText>
                                  {has1RMGrown && (
                                    <Ionicons name="arrow-up-circle" size={12} color="#10b981" style={{ marginLeft: 2 }} />
                                  )}
                                </View>
                              </View>
                            </View>
                          </View>
                          {index < exerciseHistory.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                        </View>
                      );
                    })}
                  </Card>
                </View>
              </>
            )
          )}
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  backBtn: {
    paddingRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: 16,
  },
  dropdownTrigger: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  muscleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  dropdownListContainer: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    maxHeight: 220,
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1001,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 10,
    alignItems: 'flex-start',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guidanceCard: {
    padding: 24,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
  },
  insightCard: {
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  insightDeltaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  insightCol: {
    flex: 1,
  },
  deltaValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  recContainer: {
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  recRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recBulletCol: {
    alignItems: 'center',
  },
  recBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recContentCol: {
    flex: 1,
  },
  changeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  targetBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  historyCard: {
    padding: 16,
    borderRadius: 16,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  historyDateCol: {
    flex: 1,
  },
  historyDetailsCol: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  historyMetricsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  historyMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
  },
});

export default ProgressiveOverloadScreen;
