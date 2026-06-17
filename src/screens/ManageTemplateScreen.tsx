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
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList } from '../navigation/types';
import { WorkoutTemplate, TemplateExercise, TemplateSet, LibraryExercise } from '../models/fitness';
import ExerciseLibraryScreen from './ExerciseLibraryScreen';

type ManageTemplateNavProp = NativeStackNavigationProp<RootStackParamList, 'ManageTemplate'>;
type ManageTemplateRouteProp = RouteProp<RootStackParamList, 'ManageTemplate'>;

export const ManageTemplateScreen: React.FC = () => {
  const { state, addTemplate, updateTemplate } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<ManageTemplateNavProp>();
  const route = useRoute<ManageTemplateRouteProp>();

  const templateId = route.params?.templateId;
  const existingTemplate = templateId ? (state.templates || []).find((t) => t.id === templateId) : null;

  const [name, setName] = useState(existingTemplate?.name || '');
  const [notes, setNotes] = useState(existingTemplate?.notes || '');
  const [muscleGroups, setMuscleGroups] = useState<string[]>(existingTemplate?.muscleGroups || []);
  const [exercises, setExercises] = useState<TemplateExercise[]>(existingTemplate?.exercises || []);

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
    if (exercises.some((e) => e.exerciseId === libEx.id)) {
      Alert.alert('Already Added', `${libEx.name} is already in this template.`);
      setLibraryModalVisible(false);
      return;
    }

    const newEx: TemplateExercise = {
      id: `ex_tpl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      exerciseId: libEx.id,
      name: libEx.name,
      muscleGroup: libEx.targetMuscleGroup,
      sets: [
        { id: `set_tpl_${Date.now()}_0`, reps: 10, weight: 20 }
      ],
    };

    setExercises([...exercises, newEx]);
    setLibraryModalVisible(false);

    if (!muscleGroups.includes(libEx.targetMuscleGroup)) {
      setMuscleGroups([...muscleGroups, libEx.targetMuscleGroup]);
    }
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const handleAddSet = (exId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id !== exId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: TemplateSet = {
          id: `set_tpl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          reps: lastSet ? lastSet.reps : 10,
          weight: lastSet ? lastSet.weight : 20,
        };
        return {
          ...ex,
          sets: [...ex.sets, newSet],
        };
      })
    );
  };

  const handleUpdateSet = (exId: string, setId: string, field: 'reps' | 'weight', val: any) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id !== exId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set) => {
            if (set.id !== setId) return set;
            return {
              ...set,
              [field]: parseFloat(val) || 0,
            };
          }),
        };
      })
    );
  };

  const handleRemoveSet = (exId: string, setId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id !== exId) return ex;
        if (ex.sets.length <= 1) {
          Alert.alert('Action Blocked', 'Each exercise must have at least one set.');
          return ex;
        }
        return {
          ...ex,
          sets: ex.sets.filter((s) => s.id !== setId),
        };
      })
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a template name.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one exercise to the template.');
      return;
    }

    const tplData: WorkoutTemplate = {
      id: existingTemplate?.id || `tpl_${Date.now()}`,
      name: name.trim(),
      notes: notes.trim(),
      muscleGroups: muscleGroups.length > 0 ? muscleGroups : ['Full Body'],
      exercises,
    };

    if (existingTemplate) {
      updateTemplate(tplData);
    } else {
      addTemplate(tplData);
    }

    navigation.goBack();
  };

  return (
    <Screen scrollable>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>
          {existingTemplate ? 'Edit Template' : 'Create Template'}
        </AppText>
      </View>

      <Card variant="glass" style={styles.formCard}>
        <AppText variant="label" color="textSecondary" style={styles.label}>Template Name</AppText>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
          placeholder="e.g. Hypertrophy Pull Day"
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={setName}
        />

        <AppText variant="label" color="textSecondary" style={styles.label}>Template Notes</AppText>
        <TextInput
          style={[styles.notesInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
          placeholder="e.g. Focus on contraction, rest 90s between sets..."
          placeholderTextColor={theme.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
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
      </Card>

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
            No exercises added to this template yet.
          </AppText>
        </Card>
      ) : (
        exercises.map((ex, exIdx) => (
          <Card key={ex.id} variant="normal" style={styles.exerciseCard}>
            <View style={styles.exCardHeader}>
              <View style={styles.flex}>
                <AppText variant="bodyBold">{exIdx + 1}. {ex.name}</AppText>
                <AppText variant="caption" color="textSecondary">{ex.muscleGroup}</AppText>
              </View>
              <TouchableOpacity onPress={() => handleRemoveExercise(ex.id)} style={styles.removeExBtn}>
                <Ionicons name="trash-outline" size={16} color={theme.error} />
              </TouchableOpacity>
            </View>

            {/* Set Headers */}
            <View style={styles.setHeaders}>
              <AppText variant="caption" color="textMuted" style={styles.setColNumber}>SET</AppText>
              <AppText variant="caption" color="textMuted" style={styles.setColInput}>WEIGHT (KG)</AppText>
              <AppText variant="caption" color="textMuted" style={styles.setColInput}>REPS</AppText>
              <View style={styles.setColDeleteSpace} />
            </View>

            {/* Set Rows */}
            {ex.sets.map((set, setIdx) => (
              <View key={set.id} style={styles.setRow}>
                <AppText variant="bodyBold" color="textSecondary" style={styles.setColNumber}>{setIdx + 1}</AppText>
                <TextInput
                  style={[styles.setInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  keyboardType="numeric"
                  value={String(set.weight)}
                  onChangeText={(val) => handleUpdateSet(ex.id, set.id, 'weight', val)}
                />
                <TextInput
                  style={[styles.setInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  keyboardType="numeric"
                  value={String(set.reps)}
                  onChangeText={(val) => handleUpdateSet(ex.id, set.id, 'reps', val)}
                />
                <TouchableOpacity onPress={() => handleRemoveSet(ex.id, set.id)} style={styles.removeSetBtn}>
                  <Ionicons name="close-circle-outline" size={18} color={theme.error} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity 
              style={[styles.addSetRowBtn, { backgroundColor: theme.surfaceElevated }]}
              onPress={() => handleAddSet(ex.id)}
            >
              <Ionicons name="add" size={14} color={theme.text} />
              <AppText variant="caption">Add Set</AppText>
            </TouchableOpacity>
          </Card>
        ))
      )}

      <PrimaryButton
        title={existingTemplate ? 'Update Template' : 'Save Template'}
        onPress={handleSave}
        style={styles.saveBtn}
      />

      {/* Exercise Selection Modal */}
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
  formCard: {
    padding: 16,
    gap: 8,
  },
  label: {
    marginTop: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  notesInput: {
    height: 70,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    fontSize: 14,
    textAlignVertical: 'top',
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
  removeExBtn: {
    padding: 6,
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
  setColDeleteSpace: {
    width: 30,
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
  removeSetBtn: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    marginTop: 12,
    gap: 4,
  },
  saveBtn: {
    marginVertical: 24,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeaderClose: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  flex: {
    flex: 1,
  },
});

export default ManageTemplateScreen;
