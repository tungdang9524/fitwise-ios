import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Modal, Alert, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { getLocalDateString } from '../utils/dates';
import { WorkoutSession, ExerciseLog, LibraryExercise, SetLog } from '../models/fitness';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';
import ExerciseLibraryScreen from './ExerciseLibraryScreen';

type AddWorkoutNavProp = NativeStackNavigationProp<RootStackParamList, 'AddWorkoutSession'>;
type AddWorkoutRouteProp = RouteProp<RootStackParamList, 'AddWorkoutSession'>;

export const AddWorkoutSessionScreen: React.FC = () => {
  const { state, addWorkout, updateWorkout, startActiveWorkout, updateActiveWorkout, clearActiveWorkout } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<AddWorkoutNavProp>();
  const route = useRoute<AddWorkoutRouteProp>();

  // Checking if we are editing an existing session
  const editingWorkoutId = route.params?.workoutId;
  const existingWorkout = editingWorkoutId ? state.workouts.find((w) => w.id === editingWorkoutId) : null;

  const [sessionName, setSessionName] = useState('Workout Session');
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [notes, setNotes] = useState('');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Exercise Selection Modal state
  const [libraryModalVisible, setLibraryModalVisible] = useState(false);

  const [showDetails, setShowDetails] = useState(!!existingWorkout);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (isInitialized) return;

    if (state.activeWorkout && !existingWorkout) {
      const templateId = route.params?.templateId;
      const isDifferent = 
        (templateId && templateId !== state.activeWorkout.templateId) ||
        (editingWorkoutId && editingWorkoutId !== state.activeWorkout.editingWorkoutId) ||
        (!templateId && !editingWorkoutId && state.activeWorkout.templateId);
        
      if (isDifferent) {
        Alert.alert(
          'Workout in Progress',
          'You already have an active workout session. Would you like to resume it or start a new session instead?',
          [
            {
              text: 'Resume Active',
              onPress: () => {
                const act = state.activeWorkout!;
                setSessionName(act.name);
                setExercises(act.exercises);
                setNotes(act.notes);
                setMuscleGroups(act.muscleGroups);
                const start = new Date(act.startTime).getTime();
                setSecondsElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
                setIsInitialized(true);
              }
            },
            {
              text: 'Start New (Discard Active)',
              style: 'destructive',
              onPress: () => {
                clearActiveWorkout();
                setupFreshWorkout();
              }
            }
          ]
        );
      } else {
        const act = state.activeWorkout;
        setSessionName(act.name);
        setExercises(act.exercises);
        setNotes(act.notes);
        setMuscleGroups(act.muscleGroups);
        const start = new Date(act.startTime).getTime();
        setSecondsElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
        setIsInitialized(true);
      }
    } else {
      setupFreshWorkout();
    }

    function setupFreshWorkout() {
      const templateId = route.params?.templateId;
      if (existingWorkout) {
        setSessionName(existingWorkout.name);
        setExercises(existingWorkout.exercises);
        setNotes(existingWorkout.notes || '');
        setMuscleGroups(existingWorkout.muscleGroups);
        setIsInitialized(true);
      } else if (templateId) {
        const template = (state.templates || []).find((t) => t.id === templateId);
        if (template) {
          setSessionName(template.name);
          setNotes(template.notes || '');
          setMuscleGroups(template.muscleGroups);

          const loadedExercises: ExerciseLog[] = template.exercises.map((tplEx) => {
            let previousSets: SetLog[] = [];
            for (const workout of state.workouts) {
              const historyEx = workout.exercises.find((e) => e.exerciseId === tplEx.exerciseId);
              if (historyEx) {
                const completedHistorySets = historyEx.sets.filter((s) => s.completed);
                if (completedHistorySets.length > 0) {
                  previousSets = completedHistorySets.map((s, idx) => ({
                    id: `set_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
                    weight: s.weight,
                    reps: s.reps,
                    completed: false,
                  }));
                  break;
                }
              }
            }

            if (previousSets.length === 0) {
              previousSets = tplEx.sets.map((s, idx) => ({
                id: `set_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
                weight: s.weight,
                reps: s.reps,
                completed: false,
              }));
            }

            return {
              id: `ex_log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              exerciseId: tplEx.exerciseId,
              name: tplEx.name,
              muscleGroup: tplEx.muscleGroup,
              sets: previousSets,
              notes: '',
            };
          });

          setExercises(loadedExercises);
          startActiveWorkout({
            name: template.name,
            exercises: loadedExercises,
            notes: template.notes || '',
            muscleGroups: template.muscleGroups,
            startTime: new Date().toISOString(),
            templateId,
          });
        }
        setIsInitialized(true);
      } else {
        setSessionName('Workout Session');
        setExercises([]);
        setNotes('');
        setMuscleGroups([]);
        startActiveWorkout({
          name: 'Workout Session',
          exercises: [],
          notes: '',
          muscleGroups: [],
          startTime: new Date().toISOString(),
        });
        setIsInitialized(true);
      }
    }
  }, [route.params?.templateId, route.params?.workoutId, state.activeWorkout, state.templates, state.workouts, existingWorkout, isInitialized]);

  useEffect(() => {
    if (isInitialized && !existingWorkout && state.activeWorkout) {
      updateActiveWorkout({
        name: sessionName,
        exercises,
        notes,
        muscleGroups,
      });
    }
  }, [isInitialized, existingWorkout, sessionName, exercises, notes, muscleGroups]);

  useEffect(() => {
    if (!existingWorkout) {
      const update = () => {
        if (state.activeWorkout) {
          const start = new Date(state.activeWorkout.startTime).getTime();
          setSecondsElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
        } else {
          setSecondsElapsed((prev) => prev + 1);
        }
      };
      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [existingWorkout, state.activeWorkout?.startTime]);

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const availableMuscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Warm-up', 'Stretching'];

  const toggleMuscleGroup = (muscle: string) => {
    if (muscleGroups.includes(muscle)) {
      setMuscleGroups(muscleGroups.filter((m) => m !== muscle));
    } else {
      setMuscleGroups([...muscleGroups, muscle]);
    }
  };

  const handleAddExerciseFromLibrary = (libEx: LibraryExercise) => {
    // Check if exercise already exists in this workout log
    if (exercises.some((e) => e.exerciseId === libEx.id)) {
      Alert.alert('Already Added', `${libEx.name} is already in this workout session.`);
      setLibraryModalVisible(false);
      return;
    }

    const newLog: ExerciseLog = {
      id: `ex_log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      exerciseId: libEx.id,
      name: libEx.name,
      muscleGroup: libEx.targetMuscleGroup,
      sets: [
        { id: `set_${Date.now()}_0`, reps: 10, weight: 20, completed: false }
      ],
      notes: '',
    };

    setExercises([...exercises, newLog]);
    setLibraryModalVisible(false);

    // Auto-select muscle group if not already selected
    if (!muscleGroups.includes(libEx.targetMuscleGroup)) {
      setMuscleGroups([...muscleGroups, libEx.targetMuscleGroup]);
    }
  };

  const handleRemoveExercise = (logId: string) => {
    setExercises(exercises.filter((e) => e.id !== logId));
  };

  const handleAddSet = (logId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id !== logId) return ex;
        
        // Pre-fill with last set's values
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: SetLog = {
          id: `set_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          reps: lastSet ? lastSet.reps : 10,
          weight: lastSet ? lastSet.weight : 20,
          completed: false,
        };

        return {
          ...ex,
          sets: [...ex.sets, newSet],
        };
      })
    );
  };

  const handleUpdateSet = (logId: string, setId: string, field: 'reps' | 'weight' | 'completed', value: any) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id !== logId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set) => {
            if (set.id !== setId) return set;
            return {
              ...set,
              [field]: field === 'completed' ? value : parseFloat(value) || 0,
            };
          }),
        };
      })
    );
  };

  const handleRemoveSet = (logId: string, setId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id !== logId) return ex;
        
        // Prevent deleting the last set completely, keep at least one
        if (ex.sets.length <= 1) {
          Alert.alert('Action Blocked', 'An exercise log must contain at least one set.');
          return ex;
        }

        return {
          ...ex,
          sets: ex.sets.filter((s) => s.id !== setId),
        };
      })
    );
  };

  const handleUpdateExerciseNotes = (logId: string, txt: string) => {
    setExercises(
      exercises.map((ex) => (ex.id === logId ? { ...ex, notes: txt } : ex))
    );
  };

  const handleSaveWorkout = () => {
    if (!sessionName.trim()) {
      Alert.alert('Validation Error', 'Please enter a name for the workout session.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('Empty Session', 'Please add at least one exercise to save the session.');
      return;
    }

    const sessionData: WorkoutSession = {
      id: existingWorkout?.id || `workout_${Date.now()}`,
      date: existingWorkout?.date || getLocalDateString(),
      startTime: (existingWorkout || !state.activeWorkout) ? (existingWorkout?.startTime || new Date().toISOString()) : state.activeWorkout.startTime,
      endTime: new Date().toISOString(),
      name: sessionName.trim(),
      muscleGroups: muscleGroups.length > 0 ? muscleGroups : ['Full Body'],
      exercises,
      notes: notes.trim(),
    };

    if (existingWorkout) {
      updateWorkout(sessionData);
    } else {
      addWorkout(sessionData);
      clearActiveWorkout();
    }

    navigation.goBack();
  };

  const handleDiscardWorkout = () => {
    Alert.alert(
      'Discard Workout',
      'Are you sure you want to discard this workout session? Your current progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            clearActiveWorkout();
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText variant="h2">{existingWorkout ? 'Edit Session' : 'Track Session'}</AppText>
          {!existingWorkout && (
            <View style={[styles.timerContainer, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
              <Ionicons name="time-outline" size={16} color={theme.primary} />
              <AppText variant="bodyBold" style={[styles.timerText, { color: theme.primary }]}>
                {formatTimer(secondsElapsed)}
              </AppText>
            </View>
          )}
        </View>
      </View>

      {!showDetails ? (
        <Card variant="glass" style={styles.compactDetailsCard}>
          <View style={styles.compactRow}>
            <View style={styles.flex}>
              <AppText variant="caption" color="textSecondary" style={{ fontWeight: 'bold' }}>ACTIVE SESSION</AppText>
              <AppText variant="bodyBold" style={{ fontSize: 16, marginTop: 4 }}>
                {sessionName || 'Workout Session'}
              </AppText>
              {muscleGroups.length > 0 && (
                <AppText variant="caption" color="textMuted" style={{ marginTop: 4 }}>
                  Focus: {muscleGroups.join(', ')}
                </AppText>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.editDetailsBtn, { borderColor: theme.border }]}
              onPress={() => setShowDetails(true)}
            >
              <Ionicons name="create-outline" size={14} color={theme.primary} />
              <AppText variant="caption" color="primary" style={{ marginLeft: 4, fontWeight: 'bold' }}>Details</AppText>
            </TouchableOpacity>
          </View>
        </Card>
      ) : (
        <Card variant="glass" style={styles.sessionCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <AppText variant="label" color="textSecondary" style={styles.label}>Workout Title</AppText>
            <TouchableOpacity onPress={() => setShowDetails(false)} style={{ marginTop: 8 }}>
              <AppText variant="caption" color="primary" style={{ fontWeight: 'bold' }}>Minimize</AppText>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.titleInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. Chest & Triceps"
            placeholderTextColor={theme.textMuted}
            value={sessionName}
            onChangeText={setSessionName}
          />

          <AppText variant="label" color="textSecondary" style={styles.label}>Target Muscle Groups</AppText>
          <View style={styles.muscleRow}>
            {availableMuscleGroups.map((muscle) => {
              const isSelected = muscleGroups.includes(muscle);
              return (
                <TouchableOpacity
                  key={muscle}
                  style={[
                    styles.muscleBadge,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.background,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => toggleMuscleGroup(muscle)}
                >
                  <AppText variant="caption" style={{ color: isSelected ? '#0c0f12' : theme.text }}>
                    {muscle}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          <AppText variant="label" color="textSecondary" style={styles.label}>Session Notes</AppText>
          <TextInput
            style={[styles.notesInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="Feelings, workout summary, energy levels..."
            placeholderTextColor={theme.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </Card>
      )}

      {/* Exercises Log Section */}
      <View style={styles.exercisesHeader}>
        <AppText variant="h3">Exercises</AppText>
        <TouchableOpacity 
          style={[styles.addExBtn, { borderColor: theme.primary }]}
          onPress={() => setLibraryModalVisible(true)}
        >
          <AppText variant="caption" color="primary">+ Add Exercise</AppText>
        </TouchableOpacity>
      </View>

      {exercises.length === 0 ? (
        <Card variant="glass" style={styles.emptyCard}>
          <Ionicons name="add-circle" size={32} color={theme.textMuted} />
          <AppText variant="body" color="textSecondary" style={styles.emptyText}>
            No exercises added to this session yet.
          </AppText>
        </Card>
      ) : (
        exercises.map((exLog, exIdx) => (
          <Card key={exLog.id} variant="normal" style={styles.exerciseCard}>
            <View style={styles.exCardHeader}>
              <View style={styles.flex}>
                <AppText variant="bodyBold">{exIdx + 1}. {exLog.name}</AppText>
                <AppText variant="caption" color="textMuted">{exLog.muscleGroup}</AppText>
              </View>
              <TouchableOpacity onPress={() => handleRemoveExercise(exLog.id)}>
                <Ionicons name="trash-outline" size={20} color={theme.error} />
              </TouchableOpacity>
            </View>

            {/* Set Headers */}
            <View style={styles.setHeaders}>
              <AppText variant="caption" color="textMuted" style={styles.setColNumber}>SET</AppText>
              <AppText variant="caption" color="textMuted" style={styles.setColInput}>WEIGHT (kg)</AppText>
              <AppText variant="caption" color="textMuted" style={styles.setColInput}>REPS</AppText>
              <AppText variant="caption" color="textMuted" style={styles.setColCheck}>DONE</AppText>
            </View>

            {/* Sets list */}
            {exLog.sets.map((set, setIdx) => (
              <View key={set.id} style={styles.setRow}>
                <TouchableOpacity 
                  onPress={() => handleRemoveSet(exLog.id, set.id)}
                  style={styles.setColNumber}
                >
                  <AppText variant="body" color="textSecondary">
                    {setIdx + 1}
                  </AppText>
                </TouchableOpacity>
                
                <TextInput
                  style={[styles.setInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  keyboardType="numeric"
                  value={String(set.weight)}
                  onChangeText={(val) => handleUpdateSet(exLog.id, set.id, 'weight', val)}
                />
                
                <TextInput
                  style={[styles.setInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  keyboardType="number-pad"
                  value={String(set.reps)}
                  onChangeText={(val) => handleUpdateSet(exLog.id, set.id, 'reps', val)}
                />

                <TouchableOpacity 
                  style={[
                    styles.setColCheck, 
                    styles.checkbox, 
                    { 
                      backgroundColor: set.completed ? theme.success : 'transparent',
                      borderColor: set.completed ? theme.success : theme.border
                    }
                  ]}
                  onPress={() => handleUpdateSet(exLog.id, set.id, 'completed', !set.completed)}
                >
                  {set.completed && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                </TouchableOpacity>
              </View>
            ))}

            {/* Exercise Notes & Add Set Row */}
            <View style={styles.exerciseCardFooter}>
              <TextInput
                style={[styles.exNotesInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Exercise notes (e.g. drop sets, RPE 9...)"
                placeholderTextColor={theme.textMuted}
                value={exLog.notes}
                onChangeText={(val) => handleUpdateExerciseNotes(exLog.id, val)}
              />
              <TouchableOpacity 
                style={[styles.addSetRowBtn, { backgroundColor: theme.surfaceElevated }]}
                onPress={() => handleAddSet(exLog.id)}
              >
                <Ionicons name="add" size={16} color={theme.text} />
                <AppText variant="caption">Add Set</AppText>
              </TouchableOpacity>
            </View>
          </Card>
        ))
      )}

      {/* Save Button */}
      <PrimaryButton
        title={existingWorkout ? 'Update Workout Session' : 'Complete & Save Workout'}
        onPress={handleSaveWorkout}
        style={styles.saveBtn}
      />

      {!existingWorkout && (
        <TouchableOpacity 
          onPress={handleDiscardWorkout}
          style={styles.discardBtn}
        >
          <AppText variant="bodyBold" color="error">Discard Workout Session</AppText>
        </TouchableOpacity>
      )}

      {/* Exercise Selection Overlay Modal */}
      <Modal visible={libraryModalVisible} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeaderClose, { borderBottomColor: theme.border }]}>
            <AppText variant="h3">Select Exercise</AppText>
            <TouchableOpacity onPress={() => setLibraryModalVisible(false)}>
              <AppText variant="bodyBold" color="primary">Cancel</AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.flex}>
            <ExerciseLibraryScreen onSelectExercise={handleAddExerciseFromLibrary} hideHeader />
          </View>
        </SafeAreaView>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginVertical: 12,
  },
  sessionCard: {
    padding: 16,
    gap: 8,
  },
  label: {
    marginTop: 8,
  },
  titleInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  muscleBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  notesInput: {
    height: 60,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  addExBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    textAlign: 'center',
  },
  exerciseCard: {
    marginVertical: 8,
    padding: 16,
  },
  exCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flex: {
    flex: 1,
  },
  setHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  setColNumber: {
    width: 40,
    textAlign: 'center',
  },
  setColInput: {
    flex: 1,
    textAlign: 'center',
  },
  setColCheck: {
    width: 60,
    alignItems: 'center',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  setInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 8,
    textAlign: 'center',
    fontSize: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    marginLeft: 18,
  },
  exerciseCardFooter: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  exNotesInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 13,
  },
  addSetRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    gap: 4,
  },
  saveBtn: {
    marginVertical: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0c0f12',
  },
  modalHeaderClose: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  compactDetailsCard: {
    padding: 14,
    marginVertical: 8,
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  discardBtn: {
    marginVertical: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
});
export default AddWorkoutSessionScreen;
