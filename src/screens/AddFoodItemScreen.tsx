import React, { useState, useMemo, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
type AddFoodRouteProp = RouteProp<RootStackParamList, 'AddFoodItem'>;

export const AddFoodItemScreen: React.FC = () => {
  const { state, addFoodEntry, updateFoodEntry } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<AddFoodNavProp>();
  const route = useRoute<AddFoodRouteProp>();
  const foodEntryId = route.params?.foodEntryId;
  const isEditMode = !!foodEntryId;

  // Camera, Barcode & AI states
  const [isScanning, setIsScanning] = useState(false);
  const [isFetchingBarcode, setIsFetchingBarcode] = useState(false);
  const [isAiCamera, setIsAiCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const hasScannedRef = useRef(false);
  const cameraRef = useRef<any>(null);

  const handleStartScan = async () => {
    if (!permission) {
      const status = await requestPermission();
      if (!status.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to scan barcodes.');
        return;
      }
    } else if (!permission.granted) {
      const status = await requestPermission();
      if (!status.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to scan barcodes.');
        return;
      }
    }
    hasScannedRef.current = false;
    setIsScanning(true);
  };

  const handleStartAiCamera = async () => {
    if (!state.geminiApiKey || !state.geminiApiKey.trim()) {
      Alert.alert(
        'Gemini Key Required',
        'Please configure your Gemini API Key in Settings first to use the AI Food Scanner.'
      );
      return;
    }
    if (!permission) {
      const status = await requestPermission();
      if (!status.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to scan food.');
        return;
      }
    } else if (!permission.granted) {
      const status = await requestPermission();
      if (!status.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to scan food.');
        return;
      }
    }
    setIsAiCamera(true);
  };

  const handleCaptureAiPhoto = async () => {
    if (!cameraRef.current) return;
    try {
      setIsAiCamera(false);
      setIsAnalyzing(true);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
      });

      if (!photo || !photo.base64) {
        throw new Error('Failed to capture photo base64.');
      }

      await analyzeFoodPhoto(photo.base64);
    } catch (e) {
      Alert.alert('Error', 'Failed to capture food photo. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const analyzeFoodPhoto = async (base64Image: string) => {
    const apiKey = state.geminiApiKey;
    if (!apiKey) {
      Alert.alert('Error', 'Gemini API Key is not set.');
      setIsAnalyzing(false);
      return;
    }

    try {
      const prompt = `Analyze this photo of a meal. Identify the food name, portion/serving size description, and estimate calories (kcal), protein (g), carbs (g), and fats (g). Respond ONLY in this exact JSON schema: { "name": "string", "servingSize": "string", "calories": number, "protein": number, "carbohydrates": number, "fats": number }`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: 'image/jpeg',
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok || data.error) {
        const errorMsg = data.error?.message || 'Failed to analyze food.';
        throw new Error(errorMsg);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No analysis text returned from Gemini.');
      }

      // Parse JSON from text
      const parsed = JSON.parse(text.trim());
      
      setCustomName(parsed.name || 'AI Food Log');
      setCustomCalories(String(parsed.calories || 0));
      setCustomServingSize(parsed.servingSize || '1 portion');
      setCustomProtein(String(parsed.protein || 0));
      setCustomCarbs(String(parsed.carbohydrates || parsed.carbs || 0));
      setCustomFats(String(parsed.fats || 0));
      setCustomQuantity('1.0');

      Alert.alert(
        'AI Food Scan Success',
        `Identified: "${parsed.name}"\nEstimated Calories: ${parsed.calories} kcal\n\nForm fields pre-filled successfully!`
      );
    } catch (e: any) {
      console.error(e);
      Alert.alert('Analysis Failed', e.message || 'Failed to analyze the photo. Please check your API key and connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;
    setIsScanning(false);
    setIsFetchingBarcode(true);

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${data}.json`);
      const result = await response.json();

      if (result.status === 1 && result.product) {
        const product = result.product;
        const nutriments = product.nutriments || {};

        const name = product.product_name || product.product_name_en || product.product_name_vi || `Barcode: ${data}`;
        
        let calories = 0;
        if (nutriments['energy-kcal_serving'] !== undefined) {
          calories = Math.round(Number(nutriments['energy-kcal_serving']));
        } else if (nutriments['energy-kcal_100g'] !== undefined) {
          calories = Math.round(Number(nutriments['energy-kcal_100g']));
        } else if (nutriments['energy-kj_serving'] !== undefined) {
          calories = Math.round(Number(nutriments['energy-kj_serving']) / 4.184);
        } else if (nutriments['energy-kj_100g'] !== undefined) {
          calories = Math.round(Number(nutriments['energy-kj_100g']) / 4.184);
        }

        const servingSize = product.serving_size || (nutriments['energy-kcal_serving'] !== undefined ? '1 serving' : '100g');

        const protein = Number(nutriments.proteins_serving || nutriments.proteins_100g || 0);
        const carbs = Number(nutriments.carbohydrates_serving || nutriments.carbohydrates_100g || 0);
        const fats = Number(nutriments.fat_serving || nutriments.fat_100g || 0);

        setCustomName(name);
        setCustomCalories(String(calories));
        setCustomServingSize(servingSize);
        setCustomProtein(String(protein));
        setCustomCarbs(String(carbs));
        setCustomFats(String(fats));
        setCustomQuantity('1.0');

        setActiveTab('custom');
        
        Alert.alert(
          'Barcode Scanned',
          `Successfully loaded details for:\n"${name}"\n\nMacros pre-filled in Custom Entry.`
        );
      } else {
        Alert.alert(
          'Product Not Found',
          `Could not find details for barcode: ${data}. You can still add it manually.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setCustomName(`Barcode: ${data}`);
                setActiveTab('custom');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch food details. Please check your internet connection.');
    } finally {
      setIsFetchingBarcode(false);
      setTimeout(() => {
        hasScannedRef.current = false;
      }, 1500);
    }
  };

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

  useEffect(() => {
    if (isEditMode && foodEntryId) {
      const existingEntry = state.foodEntries.find((f) => f.id === foodEntryId);
      if (existingEntry) {
        const qty = existingEntry.quantity || 1.0;
        setCustomName(existingEntry.name);
        setCustomCalories(String(Math.round(existingEntry.calories / qty)));
        setCustomServingSize(existingEntry.servingSize || '1 portion');
        setCustomProtein(String(Math.round((existingEntry.protein / qty) * 10) / 10));
        setCustomCarbs(String(Math.round((existingEntry.carbohydrates / qty) * 10) / 10));
        setCustomFats(String(Math.round((existingEntry.fats / qty) * 10) / 10));
        setCustomQuantity(String(qty));
        setActiveTab('custom');
      }
    }
  }, [isEditMode, foodEntryId, state.foodEntries]);

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

    const scaledCalories = Math.round(baseCalVal * qMult);
    const scaledProtein = Math.round(proteinVal * qMult * 10) / 10;
    const scaledCarbs = Math.round(carbsVal * qMult * 10) / 10;
    const scaledFats = Math.round(fatsVal * qMult * 10) / 10;

    if (isEditMode && foodEntryId) {
      const originalEntry = state.foodEntries.find((f) => f.id === foodEntryId);
      const updatedFoodEntry: FoodEntry = {
        id: foodEntryId,
        date: originalEntry ? originalEntry.date : getLocalDateString(),
        time: originalEntry ? originalEntry.time : new Date().toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        name: customName.trim(),
        calories: scaledCalories,
        protein: scaledProtein,
        carbohydrates: scaledCarbs,
        fats: scaledFats,
        servingSize: customServingSize.trim(),
        quantity: qMult,
      };
      updateFoodEntry(updatedFoodEntry);
    } else {
      const timeStr = new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
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
    }

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

  if (isAiCamera) {
    return (
      <View style={styles.scannerWrapper}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
        >
          {/* Overlay UI */}
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerHeader}>
              <TouchableOpacity style={styles.closeScanBtn} onPress={() => setIsAiCamera(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <AppText variant="h3" style={{ color: '#fff' }}>AI Food Scanner</AppText>
              <View style={{ width: 28 }} />
            </View>

            {/* Scanning area outline */}
            <View style={styles.scannerFocusContainer}>
              <View style={[styles.scannerFocusFrame, { borderColor: theme.primary, borderStyle: 'dashed' }]} />
              <AppText variant="caption" style={styles.scannerHint}>
                Place food inside the frame and take a photo
              </AppText>
            </View>

            {/* Capture shutter button */}
            <View style={styles.shutterContainer}>
              <TouchableOpacity style={[styles.shutterBtn, { backgroundColor: theme.primary }]} onPress={handleCaptureAiPhoto}>
                <Ionicons name="camera" size={32} color="#0c0f12" />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  if (isScanning) {
    return (
      <View style={styles.scannerWrapper}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
          }}
          onBarcodeScanned={handleBarCodeScanned}
        >
          {/* Overlay UI */}
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerHeader}>
              <TouchableOpacity style={styles.closeScanBtn} onPress={() => setIsScanning(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <AppText variant="h3" style={{ color: '#fff' }}>Scan Food Barcode</AppText>
              <View style={{ width: 28 }} />
            </View>

            {/* Scanning area outline */}
            <View style={styles.scannerFocusContainer}>
              <View style={styles.scannerFocusFrame} />
              <AppText variant="caption" style={styles.scannerHint}>
                Align barcode inside the frame
              </AppText>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.flex}>
        <Screen scrollable={activeTab !== 'presets'}>
      {(isFetchingBarcode || isAnalyzing) && (
        <View style={styles.fetchingOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
          <AppText style={styles.fetchingText}>
            {isFetchingBarcode ? 'Fetching product data...' : 'AI is analyzing your meal...'}
          </AppText>
        </View>
      )}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>{isEditMode ? 'Edit Food Log' : 'Log Food Item'}</AppText>
      </View>

      {/* Custom Tab Switcher */}
      {!isEditMode && (
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
      )}

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
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginRight: 8 }}>
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
              keyboardDismissMode="on-drag"
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
                  <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustQuantity(-1)}>
                    <AppText variant="bodyBold">-1</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustQuantity(-0.5)}>
                    <AppText variant="bodyBold">-0.5</AppText>
                  </TouchableOpacity>
                  
                  <TextInput
                    style={[styles.quantityInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                    keyboardType="decimal-pad"
                    value={quantity}
                    onChangeText={setQuantity}
                    selectTextOnFocus
                  />

                  <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustQuantity(0.5)}>
                    <AppText variant="bodyBold">+0.5</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustQuantity(1)}>
                    <AppText variant="bodyBold">+1</AppText>
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
          {/* Scan options row */}
          <View style={styles.scanOptionsRow}>
            {/* Barcode scanner */}
            <TouchableOpacity 
              style={[styles.scanOptionItem, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
              onPress={handleStartScan}
            >
              <Ionicons name="barcode-outline" size={22} color={theme.primary} />
              <AppText variant="caption" style={{ fontWeight: 'bold', marginTop: 4 }}>Barcode Scan</AppText>
            </TouchableOpacity>

            {/* AI scanner */}
            <TouchableOpacity 
              style={[styles.scanOptionItem, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
              onPress={handleStartAiCamera}
            >
              <Ionicons name="sparkles-outline" size={22} color={theme.primary} />
              <AppText variant="caption" style={{ fontWeight: 'bold', marginTop: 4 }}>AI Food Scan</AppText>
            </TouchableOpacity>
          </View>

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
              <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustCustomQuantity(-1)}>
                <AppText variant="bodyBold">-1</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustCustomQuantity(-0.5)}>
                <AppText variant="bodyBold">-0.5</AppText>
              </TouchableOpacity>
              
              <TextInput
                style={[styles.quantityInputCustom, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                keyboardType="decimal-pad"
                value={customQuantity}
                onChangeText={setCustomQuantity}
                selectTextOnFocus
              />

              <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustCustomQuantity(0.5)}>
                <AppText variant="bodyBold">+0.5</AppText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.adjustBtn, { backgroundColor: theme.surfaceElevated }]} onPress={() => handleAdjustCustomQuantity(1)}>
                <AppText variant="bodyBold">+1</AppText>
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
            title={isEditMode ? `Update Log • ${customPreview.calories} kcal` : `Save Custom Log • ${customPreview.calories} kcal`}
            onPress={handleSaveCustomFood}
            style={styles.submitBtn}
          />
        </Card>
      )}
        </Screen>
      </View>
    </TouchableWithoutFeedback>
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
  scannerWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  closeScanBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scannerFocusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFocusFrame: {
    width: 280,
    height: 180,
    borderWidth: 2,
    borderColor: '#00E5FF',
    borderRadius: 12,
    backgroundColor: 'transparent',
    marginBottom: 20,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  scannerHint: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    textAlign: 'center',
  },
  scanBtn: {
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fetchingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  fetchingText: {
    marginTop: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  scanBarcodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  scanIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanOptionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  scanOptionItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  shutterContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});

export default AddFoodItemScreen;
