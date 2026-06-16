import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Modal, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { FoodPreset } from '../models/fitness';

export const ManagePresetsScreen: React.FC = () => {
  const { state, addFoodPreset, deleteFoodPreset } = useFitness();
  const { theme } = useTheme();

  // Add Preset Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [preName, setPreName] = useState('');
  const [preIcon, setPreIcon] = useState('🍎');
  const [preCalories, setPreCalories] = useState('');
  const [preProtein, setPreProtein] = useState('');
  const [preCarbs, setPreCarbs] = useState('');
  const [preFats, setPreFats] = useState('');
  const [preServing, setPreServing] = useState('100g');

  const handleCreatePreset = () => {
    if (!preName.trim()) {
      Alert.alert('Validation Error', 'Please enter a food name.');
      return;
    }
    const calVal = parseInt(preCalories);
    if (isNaN(calVal) || calVal < 0) {
      Alert.alert('Validation Error', 'Please enter valid calories.');
      return;
    }

    const newPreset: FoodPreset = {
      id: `preset_${Date.now()}`,
      name: preName.trim(),
      icon: preIcon.trim() || '🍎',
      calories: calVal,
      protein: parseFloat(preProtein) || 0,
      carbohydrates: parseFloat(preCarbs) || 0,
      fats: parseFloat(preFats) || 0,
      servingSize: preServing.trim() || '100g',
    };

    addFoodPreset(newPreset);
    setPreName('');
    setPreIcon('🍎');
    setPreCalories('');
    setPreProtein('');
    setPreCarbs('');
    setPreFats('');
    setPreServing('100g');
    setModalVisible(false);
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="h2">Food Presets suggestions</AppText>
        <AppText variant="body" color="textSecondary" style={styles.subtitle}>
          Manage quick presets suggested during calorie logging.
        </AppText>
      </View>

      <PrimaryButton
        title="Add Custom Preset Suggestion"
        onPress={() => setModalVisible(true)}
        style={styles.addBtn}
      />

      <Card variant="glass" style={styles.listCard}>
        {state.foodPresets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="nutrition-outline" size={32} color={theme.textMuted} />
            <AppText variant="body" color="textSecondary" style={styles.emptyText}>
              No custom food presets suggestions.
            </AppText>
          </View>
        ) : (
          state.foodPresets.map((preset) => (
            <View key={preset.id} style={styles.listItem}>
              <AppText variant="body" style={styles.itemIcon}>{preset.icon}</AppText>
              <View style={styles.flex}>
                <AppText variant="bodyBold">{preset.name}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {preset.calories} kcal • P: {preset.protein}g • C: {preset.carbohydrates}g • F: {preset.fats}g
                </AppText>
              </View>
              <TouchableOpacity onPress={() => deleteFoodPreset(preset.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color={theme.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </Card>

      {/* Add Preset Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.modalHeader}>
                <AppText variant="h3">New Food Preset</AppText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalForm}>
                <View style={styles.row}>
                  <View style={[styles.col, { flex: 1.5 }]}>
                    <AppText variant="label" color="textSecondary" style={styles.formLabel}>Food Name</AppText>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder="e.g. Greek Yogurt"
                      placeholderTextColor={theme.textMuted}
                      value={preName}
                      onChangeText={setPreName}
                    />
                  </View>
                  <View style={[styles.col, { flex: 0.5 }]}>
                    <AppText variant="label" color="textSecondary" style={styles.formLabel}>Emoji Icon</AppText>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border, textAlign: 'center' }]}
                      placeholder="🍯"
                      placeholderTextColor={theme.textMuted}
                      value={preIcon}
                      onChangeText={setPreIcon}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.col}>
                    <AppText variant="label" color="textSecondary" style={styles.formLabel}>Calories (kcal)</AppText>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder="e.g. 120"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="number-pad"
                      value={preCalories}
                      onChangeText={setPreCalories}
                    />
                  </View>
                  <View style={styles.col}>
                    <AppText variant="label" color="textSecondary" style={styles.formLabel}>Serving Size</AppText>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder="e.g. 100g, 1 cup"
                      placeholderTextColor={theme.textMuted}
                      value={preServing}
                      onChangeText={setPreServing}
                    />
                  </View>
                </View>

                <AppText variant="label" color="textSecondary" style={styles.formLabel}>Macros (Grams)</AppText>
                <View style={styles.row}>
                  <View style={styles.col}>
                    <AppText variant="caption" color="textMuted">Protein</AppText>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder="0"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="decimal-pad"
                      value={preProtein}
                      onChangeText={setPreProtein}
                    />
                  </View>
                  <View style={styles.col}>
                    <AppText variant="caption" color="textMuted">Carbs</AppText>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder="0"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="decimal-pad"
                      value={preCarbs}
                      onChangeText={setPreCarbs}
                    />
                  </View>
                  <View style={styles.col}>
                    <AppText variant="caption" color="textMuted">Fats</AppText>
                    <TextInput
                      style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder="0"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="decimal-pad"
                      value={preFats}
                      onChangeText={setPreFats}
                    />
                  </View>
                </View>

                <PrimaryButton
                  title="Create Food Preset"
                  onPress={handleCreatePreset}
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
    marginVertical: 16,
  },
  subtitle: {
    marginTop: 6,
  },
  addBtn: {
    marginVertical: 8,
  },
  listCard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  itemIcon: {
    width: 32,
    textAlign: 'center',
    marginRight: 12,
    fontSize: 20,
  },
  flex: {
    flex: 1,
  },
  deleteBtn: {
    padding: 6,
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
    gap: 4,
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
  modalSubmitBtn: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  col: {
    flex: 1,
  },
});
export default ManagePresetsScreen;
