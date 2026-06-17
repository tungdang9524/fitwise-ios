import React, { useState, useMemo } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { getLocalDateString } from '../utils/dates';
import { FoodEntry, FoodPreset } from '../models/fitness';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';

type AddFoodNavProp = NativeStackNavigationProp<RootStackParamList, 'AddFoodItem'>;

export const AddFoodItemScreen: React.FC = () => {
  const { state, addFoodEntry } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<AddFoodNavProp>();

  // Tabs: 'presets' | 'custom'
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Presets tab states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<FoodPreset | null>(null);
  const [quantity, setQuantity] = useState('1.0');

  // Custom tab states
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customServingSize, setCustomServingSize] = useState('1 portion');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFats, setCustomFats] = useState('');
  const [customQuantity, setCustomQuantity] = useState('1.0');

  // Filter food presets based on search query
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return state.foodPresets;
    const q = searchQuery.toLowerCase().trim();
    return state.foodPresets.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.servingSize && p.servingSize.toLowerCase().includes(q))
    );
  }, [searchQuery, state.foodPresets]);

  // Adjust quantity helper for presets
  const handleAdjustQuantity = (delta: number) => {
    const current = parseFloat(quantity) || 1.0;
    const nextVal = Math.max(0.1, Math.round((current + delta) * 10) / 10);
    setQuantity(String(nextVal));
  };

  // Adjust quantity helper for custom foods
  const handleAdjustCustomQuantity = (delta: number) => {
    const current = parseFloat(customQuantity) || 1.0;
    const nextVal = Math.max(0.1, Math.round((current + delta) * 10) / 10);
    setCustomQuantity(String(nextVal));
  };

  const handleSelectPreset = (preset: FoodPreset) => {
    setSelectedPreset(preset);
    setQuantity('1.0');
  };

  const handleSavePresetFood = () => {
    if (!selectedPreset) return;
    const qMult = parseFloat(quantity);
    if (isNaN(qMult) || qMult <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity multiplier.');
      return;
    }

    const timeStr = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const scaledCalories = Math.round(selectedPreset.calories * qMult);
    const scaledProtein = Math.round(selectedPreset.protein * qMult * 10) / 10;
    const scaledCarbs = Math.round(selectedPreset.carbohydrates * qMult * 10) / 10;
    const scaledFats = Math.round(selectedPreset.fats * qMult * 10) / 10;

    const newFoodEntry: FoodEntry = {
      id: `food_${Date.now()}`,
      date: getLocalDateString(),
      time: timeStr,
      name: selectedPreset.name,
      calories: scaledCalories,
      protein: scaledProtein,
      carbohydrates: scaledCarbs,
      fats: scaledFats,
      servingSize: selectedPreset.servingSize,
      quantity: qMult,
    };

    addFoodEntry(newFoodEntry);
    navigation.goBack();
  };

  const handleSaveCustomFood = () => {
    if (!customName.trim()) {
      Alert.alert('Validation Error', 'Please enter a food name.');
      return;
    }
    const baseCalVal = parseInt(customCalories);
    if (isNaN(baseCalVal) || baseCalVal < 0) {
      Alert.alert('Validation Error', 'Please enter a valid calorie amount.');
      return;
    }
    const qMult = parseFloat(customQuantity) || 1.0;
    if (isNaN(qMult) || qMult <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity.');
      return;
    }

    const proteinVal = parseFloat(customProtein) || 0;
    const carbsVal = parseFloat(customCarbs) || 0;
    const fatsVal = parseFloat(customFats) || 0;

    const timeStr = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const scaledCalories = Math.round(baseCalVal * qMult);
    const scaledProtein = Math.round(proteinVal * qMult * 10) / 10;
    const scaledCarbs = Math.round(carbsVal * qMult * 10) / 10;
    const scaledFats = Math.round(fatsVal * qMult * 10) / 10;

    const newFoodEntry: FoodEntry = {
      id: `food_${Date.now()}`,
      date: getLocalDateString(),
      time: timeStr,
      name: customName.trim(),
      calories: scaledCalories,
      protein: scaledProtein,
      carbohydrates: scaledCarbs,
      fats: scaledFats,
      servingSize: customServingSize.trim(),
      quantity: qMult,
    };

    addFoodEntry(newFoodEntry);
    navigation.goBack();
  };

  // Preview calculated values for preset
  const presetPreview = useMemo(() => {
    if (!selectedPreset) return null;
    const q = parseFloat(quantity) || 0;
    return {
      calories: Math.round(selectedPreset.calories * q),
      protein: Math.round(selectedPreset.protein * q * 10) / 10,
      carbs: Math.round(selectedPreset.carbohydrates * q * 10) / 10,
      fats: Math.round(selectedPreset.fats * q * 10) / 10,
    };
  }, [selectedPreset, quantity]);

  // Preview calculated values for custom
  const customPreview = useMemo(() => {
    const q = parseFloat(customQuantity) || 0;
    const baseCals = parseFloat(customCalories) || 0;
    const baseProtein = parseFloat(customProtein) || 0;
    const baseCarbs = parseFloat(customCarbs) || 0;
    const baseFats = parseFloat(customFats) || 0;
    return {
      calories: Math.round(baseCals * q),
      protein: Math.round(baseProtein * q * 10) / 10,
      carbs: Math.round(baseCarbs * q * 10) / 10,
      fats: Math.round(baseFats * q * 10) / 10,
    };
  }, [customQuantity, customCalories, customProtein, customCarbs, customFats]);

  return (
    <Screen scrollable={activeTab !== 'presets'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Log Food Item</AppText>
      </View>

      {/* Custom Tab Switcher */}
      <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          onPress={() => {
            setActiveTab('presets');
            setSelectedPreset(null);
          }}
          style={[styles.tabBtn, activeTab === 'presets' && { backgroundColor: theme.surfaceElevated }]}
        >
          <AppText variant="bodyBold" color={activeTab === 'presets' ? 'primary' : 'textMuted'}>
            Quick Presets
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('custom')}
          style={[styles.tabBtn, activeTab === 'custom' && { backgroundColor: theme.surfaceElevated }]}
        >
          <AppText variant="bodyBold" color={activeTab === 'custom' ? 'primary' : 'textMuted'}>
            Custom Entry
          </AppText>
        </TouchableOpacity>
      </View>

      {/* QUICK PRESETS TAB CONTENT */}
      {activeTab === 'presets' && (
        <View style={styles.presetsTabWrapper}>
          {/* Search Box */}
          <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search foods, Phở, Bún chả..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* List of presets */}
          <View style={styles.presetsListContainer}>
            <ScrollView 
              showsVerticalScrollIndicator={true} 
              contentContainerStyle={styles.presetsScrollContent}
              style={styles.presetsListScroll}
              keyboardShouldPersistTaps="handled"
            >
              {filteredPresets.length === 0 ? (
                <AppText variant="body" color="textMuted" style={styles.noResults}>
                  No food matching your search.
                </AppText>
              ) : (
                filteredPresets.map((preset) => {
                  const isSelected = selectedPreset?.id === preset.id;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.presetListItem,
                        { 
                          backgroundColor: isSelected ? `${theme.primary}12` : theme.surface,
                          borderColor: isSelected ? theme.primary : theme.border 
                        }
                      ]}
                      onPress={() => handleSelectPreset(preset)}
                    >
                      <AppText variant="h2" style={styles.presetListIcon}>{preset.icon}</AppText>
                      <View style={styles.flex}>
                        <AppText variant="bodyBold">{preset.name}</AppText>
                        <AppText variant="caption" color="textSecondary">
                          Serving: {preset.servingSize} • P: {preset.protein}g C: {preset.carbohydrates}g F: {preset.fats}g
                        </AppText>
                      </View>
                      <View style={styles.rightAligned}>
                        <AppText variant="bodyBold" color="primary">{preset.calories} kcal</AppText>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>

          {/* Quantity Inspector Drawer (shows when preset selected) */}
          {selectedPreset && presetPreview && (
            <Card variant="elevated" style={[styles.inspectorCard, { borderColor: theme.primary }]}>
              <View style={styles.inspectorTitleRow}>
                <AppText variant="h2" style={{ marginRight: 8 }}>{selectedPreset.icon}</AppText>
                <View style={styles.flex}>
                  <AppText variant="bodyBold" style={{ fontSize: 16 }}>{selectedPreset.name}</AppText>
                  <AppText variant="caption" color="textSecondary">Base: {selectedPreset.servingSize}</AppText>
                </View>
                <TouchableOpacity onPress={() => setSelectedPreset(null)}>
                  <Ionicons name="close-circle-outline" size={24} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Adjuster */}
              <View style={styles.adjusterRow}>
                <AppText variant="body">Portions / Quantity:</AppText>
                <View style={styles.adjusterControls}>
                  <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustQuantity(-0.5)}>
                    <AppText variant="bodyBold">-0.5</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustQuantity(-0.1)}>
                    <AppText variant="bodyBold">-0.1</AppText>
                  </TouchableOpacity>
                  
                  <TextInput
                    style={[styles.quantityInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                    keyboardType="decimal-pad"
                    value={quantity}
                    onChangeText={setQuantity}
                    selectTextOnFocus
                  />

                  <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustQuantity(0.1)}>
                    <AppText variant="bodyBold">+0.1</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustQuantity(0.5)}>
                    <AppText variant="bodyBold">+0.5</AppText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick Preset multipliers */}
              <View style={styles.quickMultRow}>
                {['0.5', '1.0', '1.5', '2.0', '3.0'].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.quickMultBtn,
                      { 
                        backgroundColor: quantity === val ? theme.primary : theme.surfaceElevated,
                      }
                    ]}
                    onPress={() => setQuantity(val)}
                  >
                    <AppText variant="caption" style={{ fontWeight: 'bold', color: quantity === val ? '#0c0f12' : theme.text }}>
                      {val}x
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Dynamic Preview */}
              <View style={[styles.previewCabinet, { backgroundColor: theme.background }]}>
                <View style={styles.previewValRow}>
                  <View style={styles.previewCol}>
                    <AppText variant="h3" color="primary">{presetPreview.calories}</AppText>
                    <AppText variant="caption" color="textMuted">KCAL</AppText>
                  </View>
                  <View style={styles.previewCol}>
                    <AppText variant="bodyBold">{presetPreview.protein}g</AppText>
                    <AppText variant="caption" color="textSecondary">PROTEIN</AppText>
                  </View>
                  <View style={styles.previewCol}>
                    <AppText variant="bodyBold">{presetPreview.carbs}g</AppText>
                    <AppText variant="caption" color="textSecondary">CARBS</AppText>
                  </View>
                  <View style={styles.previewCol}>
                    <AppText variant="bodyBold">{presetPreview.fats}g</AppText>
                    <AppText variant="caption" color="textSecondary">FATS</AppText>
                  </View>
                </View>
              </View>

              <PrimaryButton
                title={`Log ${quantity} portion(s) • ${presetPreview.calories} kcal`}
                onPress={handleSavePresetFood}
                style={styles.saveBtn}
              />
            </Card>
          )}
        </View>
      )}

      {/* CUSTOM FOOD ENTRY TAB CONTENT */}
      {activeTab === 'custom' && (
        <Card variant="glass" style={styles.formCard}>
          <AppText variant="label" color="textSecondary" style={styles.label}>Food Name</AppText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. Bún Thịt Nướng Tự Làm"
            placeholderTextColor={theme.textMuted}
            value={customName}
            onChangeText={setCustomName}
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <AppText variant="label" color="textSecondary" style={styles.label}>Base Calories (1 portion)</AppText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="0"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                value={customCalories}
                onChangeText={setCustomCalories}
              />
            </View>
            <View style={styles.col}>
              <AppText variant="label" color="textSecondary" style={styles.label}>Serving Description</AppText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. 1 bowl, 150g"
                placeholderTextColor={theme.textMuted}
                value={customServingSize}
                onChangeText={setCustomServingSize}
              />
            </View>
          </View>

          {/* Custom Quantity */}
          <View style={styles.customQuantityContainer}>
            <AppText variant="label" color="textSecondary" style={styles.label}>Quantity Eaten</AppText>
            <View style={styles.customQuantityAdjuster}>
              <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustCustomQuantity(-0.5)}>
                <AppText variant="bodyBold">-0.5</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustCustomQuantity(-0.1)}>
                <AppText variant="bodyBold">-0.1</AppText>
              </TouchableOpacity>
              
              <TextInput
                style={[styles.quantityInputCustom, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                keyboardType="decimal-pad"
                value={customQuantity}
                onChangeText={setCustomQuantity}
                selectTextOnFocus
              />

              <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustCustomQuantity(0.1)}>
                <AppText variant="bodyBold">+0.1</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustCustomQuantity(0.5)}>
                <AppText variant="bodyBold">+0.5</AppText>
              </TouchableOpacity>
            </View>
          </View>

          <AppText variant="label" color="textSecondary" style={styles.label}>Base Macronutrients (Grams)</AppText>
          <View style={styles.row}>
            <View style={styles.col}>
              <AppText variant="caption" color="primary" style={styles.macroLabel}>Protein</AppText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="0g"
                placeholderTextColor={theme.textMuted}
                keyboardType="decimal-pad"
                value={customProtein}
                onChangeText={setCustomProtein}
              />
            </View>
            <View style={styles.col}>
              <AppText variant="caption" color="secondary" style={styles.macroLabel}>Carbs</AppText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="0g"
                placeholderTextColor={theme.textMuted}
                keyboardType="decimal-pad"
                value={customCarbs}
                onChangeText={setCustomCarbs}
              />
            </View>
            <View style={styles.col}>
              <AppText variant="caption" color="accent" style={styles.macroLabel}>Fats</AppText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="0g"
                placeholderTextColor={theme.textMuted}
                keyboardType="decimal-pad"
                value={customFats}
                onChangeText={setCustomFats}
              />
            </View>
          </View>

          {/* Dynamic Custom Preview */}
          <View style={[styles.previewCabinet, { backgroundColor: theme.background, marginTop: 12 }]}>
            <AppText variant="caption" color="textMuted" style={{ textAlign: 'center', marginBottom: 4 }}>CALCULATED LOG TOTALS</AppText>
            <View style={styles.previewValRow}>
              <View style={styles.previewCol}>
                <AppText variant="h3" color="primary">{customPreview.calories}</AppText>
                <AppText variant="caption" color="textMuted">KCAL</AppText>
              </View>
              <View style={styles.previewCol}>
                <AppText variant="bodyBold">{customPreview.protein}g</AppText>
                <AppText variant="caption" color="textSecondary">PROTEIN</AppText>
              </View>
              <View style={styles.previewCol}>
                <AppText variant="bodyBold">{customPreview.carbs}g</AppText>
                <AppText variant="caption" color="textSecondary">CARBS</AppText>
              </View>
              <View style={styles.previewCol}>
                <AppText variant="bodyBold">{customPreview.fats}g</AppText>
                <AppText variant="caption" color="textSecondary">FATS</AppText>
              </View>
            </View>
          </View>

          <PrimaryButton
            title={`Save Custom Log • ${customPreview.calories} kcal`}
            onPress={handleSaveCustomFood}
            style={styles.submitBtn}
          />
        </Card>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  backBtn: {
    paddingRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    marginVertical: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  presetsTabWrapper: {
    flex: 1,
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  presetsListContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  presetsListScroll: {
    flex: 1,
  },
  presetsScrollContent: {
    gap: 8,
  },
  presetListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  presetListIcon: {
    fontSize: 22,
  },
  rightAligned: {
    alignItems: 'flex-end',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
  },
  inspectorCard: {
    padding: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  inspectorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adjusterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  adjusterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  adjustBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quantityInput: {
    width: 50,
    height: 32,
    borderWidth: 1,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    padding: 0,
  },
  quantityInputCustom: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickMultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  quickMultBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  previewCabinet: {
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  previewValRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewCol: {
    alignItems: 'center',
  },
  saveBtn: {
    marginTop: 6,
  },
  formCard: {
    padding: 16,
    gap: 8,
  },
  label: {
    marginTop: 4,
  },
  macroLabel: {
    marginBottom: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  customQuantityContainer: {
    gap: 6,
  },
  customQuantityAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  submitBtn: {
    marginTop: 14,
  },
  flex: {
    flex: 1,
  },
});

export default AddFoodItemScreen;
