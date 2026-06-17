import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { formatDisplayDate } from '../utils/dates';
import { RootStackParamList } from '../navigation/types';
import ExerciseLibraryScreen from './ExerciseLibraryScreen';

type WorkoutsScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

export const WorkoutsScreen: React.FC = () => {
  const { state, deleteWorkout } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<WorkoutsScreenNavProp>();

  const [activeTab, setActiveTab] = useState<'history' | 'library'>('history');
  const [historyFilter, setHistoryFilter] = useState<'day' | 'week' | 'month' | 'all'>('all');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${name}" from your history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteWorkout(id) },
      ]
    );
  };

  // Date filters
  const filteredWorkouts = state.workouts.filter((w) => {
    if (historyFilter === 'all') return true;

    const wDate = new Date(w.date);
    const now = new Date();
    // Normalize times
    wDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(now.getTime() - wDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (historyFilter === 'day') {
      return diffDays <= 1; // Today
    } else if (historyFilter === 'week') {
      return diffDays <= 7; // Past week
    } else if (historyFilter === 'month') {
      return diffDays <= 30; // Past 30 days
    }
    return true;
  });

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      {/* Upper Segmented Control Tab */}
      <View style={[styles.tabSegmentContainer, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('history')}
        >
          <AppText variant="bodyBold" color={activeTab === 'history' ? 'primary' : 'textSecondary'}>
            History Logs
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'library' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('library')}
        >
          <AppText variant="bodyBold" color={activeTab === 'library' ? 'primary' : 'textSecondary'}>
            Exercise Library
          </AppText>
        </TouchableOpacity>
      </View>

      {activeTab === 'library' ? (
        <ExerciseLibraryScreen />
      ) : (
        <ScrollView contentContainerStyle={styles.historyScroll}>
          {/* Main Action buttons */}
          <View style={styles.actionRow}>
            <PrimaryButton
              title="Track New Workout"
              style={styles.actionBtn}
              onPress={() => navigation.navigate('AddWorkoutSession')}
            />
            <TouchableOpacity 
              style={[styles.calendarBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => navigation.navigate('WorkoutCalendar')}
            >
              <Ionicons name="calendar" size={22} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Filters Segment */}
          <View style={styles.filterSegment}>
            {(['day', 'week', 'month', 'all'] as const).map((filter) => {
              const isSelected = historyFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterTab,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setHistoryFilter(filter)}
                >
                  <AppText variant="caption" style={{ color: isSelected ? '#0c0f12' : theme.text }}>
                    {filter.toUpperCase()}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Workouts History List */}
          {filteredWorkouts.length === 0 ? (
            <Card variant="glass" style={styles.emptyCard}>
              <Ionicons name="barbell-outline" size={48} color={theme.textMuted} />
              <AppText variant="body" color="textSecondary" style={styles.emptyText}>
                No workout sessions found for the selected filter.
              </AppText>
            </Card>
          ) : (
            filteredWorkouts.map((workout) => {
              const isExpanded = expandedWorkoutId === workout.id;
              return (
                <Card key={workout.id} variant="glass" style={styles.workoutItem}>
                  <TouchableOpacity
                    style={styles.itemHeader}
                    onPress={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                  >
                    <View style={styles.flex}>
                      <AppText variant="h3">{workout.name}</AppText>
                      <AppText variant="caption" color="textSecondary">
                        {formatDisplayDate(workout.date)} • {workout.muscleGroups.join(', ')}
                      </AppText>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={theme.textMuted}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      {workout.notes ? (
                        <View style={styles.notesSection}>
                          <AppText variant="caption" color="textMuted">NOTES</AppText>
                          <AppText variant="body" style={styles.noteText}>{workout.notes}</AppText>
                        </View>
                      ) : null}

                      <View style={styles.exercisesSection}>
                        <AppText variant="caption" color="textMuted" style={styles.exTitle}>EXERCISES</AppText>
                        {workout.exercises.map((ex) => (
                          <View key={ex.id} style={styles.exerciseLogItem}>
                            <AppText variant="bodyBold">{ex.name}</AppText>
                            {ex.notes ? <AppText variant="caption" color="textMuted">Note: {ex.notes}</AppText> : null}
                            <View style={styles.setsGrid}>
                              {ex.sets.map((set, setIdx) => (
                                <AppText key={set.id} variant="caption" color="textSecondary" style={styles.setGridItem}>
                                  Set {setIdx + 1}: {set.weight}kg x {set.reps} {set.completed ? '✓' : ''}
                                </AppText>
                              ))}
                            </View>
                          </View>
                        ))}
                      </View>

                      {/* Edit & Delete CTA Actions */}
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={[styles.actionLink, { borderColor: theme.border }]}
                          onPress={() => navigation.navigate('AddWorkoutSession', { workoutId: workout.id })}
                        >
                          <Ionicons name="create-outline" size={16} color={theme.primary} />
                          <AppText variant="caption" color="primary">Edit Log</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionLink, { borderColor: theme.border }]}
                          onPress={() => handleDelete(workout.id, workout.name)}
                        >
                          <Ionicons name="trash-outline" size={16} color={theme.error} />
                          <AppText variant="caption" color="error">Delete</AppText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </ScrollView>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  tabSegmentContainer: {
    flexDirection: 'row',
    height: 52,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  historyScroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  actionBtn: {
    flex: 1,
  },
  calendarBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSegment: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  filterTab: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
  },
  workoutItem: {
    marginVertical: 6,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  expandedContent: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  notesSection: {
    marginVertical: 6,
  },
  noteText: {
    marginTop: 2,
  },
  exercisesSection: {
    marginTop: 12,
  },
  exTitle: {
    marginBottom: 6,
  },
  exerciseLogItem: {
    marginVertical: 6,
  },
  setsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  setGridItem: {
    width: '48%',
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
export default WorkoutsScreen;
