import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { useFitness } from '../store/FitnessStore';
import { STATIC_EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';

type ExerciseDetailsRouteProp = RouteProp<RootStackParamList, 'ExerciseDetails'>;

export const ExerciseDetailsScreen: React.FC = () => {
  const route = useRoute<ExerciseDetailsRouteProp>();
  const { state } = useFitness();
  const { theme } = useTheme();

  const { exerciseId } = route.params;

  // Search static and custom
  const exercise = [...STATIC_EXERCISE_LIBRARY, ...state.customExercises].find(
    (e) => e.id === exerciseId
  );

  if (!exercise) {
    return (
      <Screen>
        <View style={styles.centered}>
          <AppText variant="body" color="error">Exercise not found.</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="h1">{exercise.name}</AppText>
        <View style={[styles.badge, { backgroundColor: 'rgba(174, 255, 0, 0.15)', borderColor: theme.primary }]}>
          <AppText variant="caption" color="primary" style={styles.badgeText}>
            {exercise.targetMuscleGroup.toUpperCase()}
          </AppText>
        </View>
      </View>

      {/* Instructions Section */}
      <View style={styles.section}>
        <AppText variant="h3" style={styles.sectionTitle}>How to Perform</AppText>
        {exercise.instructions.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <AppText variant="caption" style={styles.stepNumText}>
                {index + 1}
              </AppText>
            </View>
            <AppText variant="body" style={styles.stepText}>
              {step}
            </AppText>
          </View>
        ))}
      </View>

      {/* Technique Notes */}
      {exercise.techniqueNotes && (
        <Card variant="elevated" style={styles.notesCard}>
          <View style={styles.notesTitleRow}>
            <Ionicons name="bulb" size={20} color={theme.warning} />
            <AppText variant="bodyBold" color="warning">Trainer Pro-Tip</AppText>
          </View>
          <AppText variant="body" color="textSecondary" style={styles.notesText}>
            {exercise.techniqueNotes}
          </AppText>
        </Card>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginVertical: 16,
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontWeight: 'bold',
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumText: {
    color: '#0c0f12',
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
  },
  notesCard: {
    marginTop: 20,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  notesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  notesText: {
    lineHeight: 20,
  },
});
export default ExerciseDetailsScreen;
