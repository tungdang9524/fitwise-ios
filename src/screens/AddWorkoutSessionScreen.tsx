import React, { useState } from 'react';
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
  const { state, addWorkout, updateWorkout } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<AddWorkoutNavProp>();
  const route = useRoute<AddWorkoutRouteProp>();

  // Checking if we are editing an existing session
  const editingWorkoutId = route.params?.workoutId;
  const existingWorkout = editingWorkoutId ? state.workouts.find((w) => w.id === editingWorkoutId) : null;

  const [sessionName, setSessionName] = useState(existingWorkout?.name || 'Workout Session');
  const [exercises, setExercises] = useState<ExerciseLog[]>(existingWorkout?.exercises || []);
  const [notes, setNotes] = useState(existingWorkout?.notes || '');
  const [muscleGroups, setMuscleGroups] = useState<string[]>(existingWorkout?.muscleGroups || []);

  // Exercise Selection Modal state
  const [libraryModalVisible, setLibraryModalVisible] = useState(false);

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
      startTime: existingWorkout?.startTime || new Date().toISOString(),
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
    }

    navigation.goBack();
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="h2">{existingWorkout ? 'Edit Workout Session' : 'Track Workout Session'}</AppText>
      </View>

      <Card variant="glass" style={styles.sessionCard}>
        <AppText variant="label" color="textSecondary" style={styles.label}>Workout Title</AppText>
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
});
export default AddWorkoutSessionScreen;
