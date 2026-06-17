import React from 'react';
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
import { RootStackParamList } from '../navigation/types';

type TemplatesScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

export const WorkoutTemplatesScreen: React.FC = () => {
  const { state, deleteTemplate, duplicateTemplate } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<TemplatesScreenNavProp>();

  const templates = state.templates || [];

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete the template "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTemplate(id) },
      ]
    );
  };

  const handleDuplicate = (id: string) => {
    duplicateTemplate(id);
  };

  return (
    <Screen scrollable>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Workout Templates</AppText>
      </View>

      <View style={styles.actionRow}>
        <PrimaryButton
          title="+ Create Template"
          onPress={() => navigation.navigate('ManageTemplate')}
          style={styles.createBtn}
        />
      </View>

      {templates.length === 0 ? (
        <Card variant="glass" style={styles.emptyCard}>
          <Ionicons name="copy-outline" size={48} color={theme.textMuted} style={styles.emptyIcon} />
          <AppText variant="body" color="textSecondary" style={styles.emptyText}>
            No workout templates created yet. Templates allow you to start workouts with one tap.
          </AppText>
          <PrimaryButton
            title="Create First Template"
            onPress={() => navigation.navigate('ManageTemplate')}
            style={{ width: '100%', marginTop: 8 }}
          />
        </Card>
      ) : (
        templates.map((tpl) => (
          <Card key={tpl.id} variant="glass" style={styles.tplCard}>
            <View style={styles.tplHeader}>
              <View style={styles.flex}>
                <AppText variant="h3">{tpl.name}</AppText>
                <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                  {tpl.muscleGroups.join(', ')} • {tpl.exercises.length} Exercises
                </AppText>
              </View>
              <View style={styles.tplActions}>
                <TouchableOpacity onPress={() => handleDuplicate(tpl.id)} style={styles.actionIconBtn}>
                  <Ionicons name="copy-outline" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('ManageTemplate', { templateId: tpl.id })} style={styles.actionIconBtn}>
                  <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(tpl.id, tpl.name)} style={styles.actionIconBtn}>
                  <Ionicons name="trash-outline" size={18} color={theme.error} />
                </TouchableOpacity>
              </View>
            </View>

            {tpl.notes ? (
              <AppText variant="caption" color="textMuted" numberOfLines={2} style={styles.tplNotes}>
                {tpl.notes}
              </AppText>
            ) : null}

            <View style={[styles.exPreviewList, { backgroundColor: theme.background }]}>
              {tpl.exercises.slice(0, 3).map((ex) => (
                <View key={ex.id} style={styles.exPreviewRow}>
                  <AppText variant="caption" color="textSecondary" style={styles.flex}>
                    • {ex.name}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {ex.sets.length} sets
                  </AppText>
                </View>
              ))}
              {tpl.exercises.length > 3 && (
                <AppText variant="caption" color="textMuted" style={{ marginTop: 2 }}>
                  + {tpl.exercises.length - 3} more exercises
                </AppText>
              )}
            </View>

            <PrimaryButton
              title="Start Workout"
              onPress={() => navigation.navigate('AddWorkoutSession', { templateId: tpl.id })}
              style={styles.startBtn}
            />
          </Card>
        ))
      )}
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
  actionRow: {
    marginVertical: 8,
  },
  createBtn: {
    width: '100%',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  tplCard: {
    marginVertical: 8,
    padding: 16,
  },
  tplHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tplActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tplNotes: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  exPreviewList: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  exPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  startBtn: {
    marginTop: 16,
  },
});

export default WorkoutTemplatesScreen;
