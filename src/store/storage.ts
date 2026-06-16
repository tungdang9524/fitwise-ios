import AsyncStorage from '@react-native-async-storage/async-storage';
import { FitnessState } from '../models/fitness';

const STATE_STORAGE_KEY = '@fitwise_state';

export const saveFitnessState = async (state: FitnessState): Promise<void> => {
  try {
    const serializedState = JSON.stringify(state);
    await AsyncStorage.setItem(STATE_STORAGE_KEY, serializedState);
  } catch (e) {
    console.error('Failed to save fitness state to AsyncStorage', e);
  }
};

export const loadFitnessState = async (): Promise<FitnessState | null> => {
  try {
    const serializedState = await AsyncStorage.getItem(STATE_STORAGE_KEY);
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState) as FitnessState;
  } catch (e) {
    console.error('Failed to load fitness state from AsyncStorage', e);
    return null;
  }
};

export const clearFitnessState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STATE_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear fitness state', e);
  }
};
