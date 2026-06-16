import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TextInput, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { STATIC_EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { LibraryExercise } from '../models/fitness';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';

type ExerciseLibraryNavProp = NativeStackNavigationProp<RootStackParamList>;

interface ExerciseLibraryScreenProps {
  onSelectExercise?: (exercise: LibraryExercise) => void;
  hideHeader?: boolean;
}

export const ExerciseLibraryScreen: React.FC<ExerciseLibraryScreenProps> = ({
  onSelectExercise,
  hideHeader = false,
}) => {
  const { state, addCustomExercise, deleteExercise } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<ExerciseLibraryNavProp>();

  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  
  // Custom Exercise Creation Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Merge static and custom exercises, filtering out deleted ones
  const allExercises = [...STATIC_EXERCISE_LIBRARY, ...state.customExercises].filter(
    (e) => !state.deletedExerciseIds?.includes(e.id)
  );

  // Unique muscle groups for filters
  const muscleGroups = Array.from(new Set(allExercises.map((e) => e.targetMuscleGroup)));

  // Filtered exercises
  const filteredExercises = allExercises.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = muscleFilter ? e.targetMuscleGroup === muscleFilter : true;
    return matchesSearch && matchesMuscle;
  });

  const handleCreateCustom = () => {
    if (!customName.trim() || !customMuscle.trim()) {
      alert('Please fill in at least the name and muscle group.');
      return;
    }

    const newExercise: LibraryExercise = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      targetMuscleGroup: customMuscle.trim(),
      instructions: customInstructions.split('\n').filter((i) => i.trim() !== ''),
      techniqueNotes: customNotes.trim(),
      isCustom: true,
    };

    addCustomExercise(newExercise);
    setCustomName('');
    setCustomMuscle('');
    setCustomInstructions('');
    setCustomNotes('');
    setModalVisible(false);

    if (onSelectExercise) {
      onSelectExercise(newExercise);
    }
  };

  const handleDeleteExercise = (id: string, name: string) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${name}" from the exercise library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExercise(id),
        },
      ]
    );
  };

  const renderExerciseItem = ({ item }: { item: LibraryExercise }) => (
    <Card
      variant="glass"
      style={styles.card}
      onPress={() => {
        if (onSelectExercise) {
          onSelectExercise(item);
        } else {
          navigation.navigate('ExerciseDetails', { exerciseId: item.id });
        }
      }}
    >
      <View style={styles.row}>
        <View style={styles.flex}>
          <AppText variant="bodyBold">{item.name}</AppText>
          <AppText variant="caption" color="textSecondary" style={styles.muscleBadge}>
            {item.targetMuscleGroup}
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteExercise(item.id, item.name);
            }}
            style={{ padding: 6 }}
          >
            <Ionicons name="trash-outline" size={18} color={theme.error} />
          </TouchableOpacity>
          <Ionicons
            name={onSelectExercise ? 'add-circle' : 'chevron-forward'}
            size={24}
            color={theme.primary}
          />
        </View>
      </View>
    </Card>
  );

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      {!hideHeader && (
        <View style={styles.header}>
          <AppText variant="h2">Exercise Library</AppText>
          <TouchableOpacity
            style={[styles.customBtn, { borderColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <AppText variant="caption" color="primary">+ Custom</AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Input */}
      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search exercises..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search !== '' && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Muscle Group Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              {
                backgroundColor: muscleFilter === null ? theme.primary : theme.surface,
                borderColor: muscleFilter === null ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setMuscleFilter(null)}
          >
            <AppText variant="caption" style={{ color: muscleFilter === null ? '#0c0f12' : theme.text }}>
              All
            </AppText>
          </TouchableOpacity>
          {muscleGroups.map((muscle) => {
            const isSelected = muscleFilter === muscle;
            return (
              <TouchableOpacity
                key={muscle}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setMuscleFilter(muscle)}
              >
                <AppText variant="caption" style={{ color: isSelected ? '#0c0f12' : theme.text }}>
                  {muscle}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText variant="body" color="textMuted">No exercises match search criteria.</AppText>
            {onSelectExercise && (
              <PrimaryButton
                title="Create & Add Custom Exercise"
                onPress={() => setModalVisible(true)}
                style={styles.emptyCreateBtn}
              />
            )}
          </View>
        }
      />

      {/* Create Custom Exercise Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.modalHeader}>
                <AppText variant="h3">New Custom Exercise</AppText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalForm}>
                <AppText variant="label" color="textSecondary" style={styles.formLabel}>Exercise Name</AppText>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="e.g. Incline Dumbbell Press"
                  placeholderTextColor={theme.textMuted}
                  value={customName}
                  onChangeText={setCustomName}
                />

                <AppText variant="label" color="textSecondary" style={styles.formLabel}>Target Muscle Group</AppText>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="e.g. Chest, Legs, Shoulders"
                  placeholderTextColor={theme.textMuted}
                  value={customMuscle}
                  onChangeText={setCustomMuscle}
                />

                <AppText variant="label" color="textSecondary" style={styles.formLabel}>Instructions (One per line)</AppText>
                <TextInput
                  style={[styles.modalInput, styles.multilineInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="Step 1: Lower the weights..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={3}
                  value={customInstructions}
                  onChangeText={setCustomInstructions}
                />

                <AppText variant="label" color="textSecondary" style={styles.formLabel}>Technique Notes</AppText>
                <TextInput
                  style={[styles.modalInput, styles.multilineInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="Keep your elbows tucked..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={2}
                  value={customNotes}
                  onChangeText={setCustomNotes}
                />

                <PrimaryButton
                  title="Create Exercise"
                  onPress={handleCreateCustom}
                  style={styles.modalSubmitBtn}
                />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  customBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersContainer: {
    height: 48,
    marginTop: 10,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  muscleBadge: {
    marginTop: 4,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCreateBtn: {
    marginTop: 16,
    width: '80%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalForm: {
    paddingBottom: 40,
  },
  formLabel: {
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    marginTop: 20,
  },
});
export default ExerciseLibraryScreen;
