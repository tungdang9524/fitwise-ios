import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { FitnessState, UserProfile, WorkoutSession, FoodEntry, ProgressLog, ReminderSetting, LibraryExercise, FoodPreset } from '../models/fitness';
import { saveFitnessState, loadFitnessState, clearFitnessState } from './storage';
import { calculateCaloricTargets } from '../utils/formulas';
import { FOOD_PRESETS } from '../data/foodPresets';

type FitnessAction =
  | { type: 'INITIALIZE_STATE'; payload: FitnessState }
  | { type: 'UPDATE_PROFILE'; payload: Omit<UserProfile, 'targetCalories' | 'targetProtein' | 'targetCarbs' | 'targetFats'> }
  | { type: 'ADD_WORKOUT'; payload: WorkoutSession }
  | { type: 'UPDATE_WORKOUT'; payload: WorkoutSession }
  | { type: 'DELETE_WORKOUT'; payload: string }
  | { type: 'ADD_FOOD_ENTRY'; payload: FoodEntry }
  | { type: 'DELETE_FOOD_ENTRY'; payload: string }
  | { type: 'ADD_PROGRESS_LOG'; payload: ProgressLog }
  | { type: 'DELETE_PROGRESS_LOG'; payload: string }
  | { type: 'ADD_CUSTOM_EXERCISE'; payload: LibraryExercise }
  | { type: 'UPDATE_REMINDER'; payload: ReminderSetting }
  | { type: 'ADD_REMINDER'; payload: ReminderSetting }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'ADD_FOOD_PRESET'; payload: FoodPreset }
  | { type: 'DELETE_FOOD_PRESET'; payload: string }
  | { type: 'RESET_STATE' };

const initialFitnessState: FitnessState = {
  profile: null,
  workouts: [],
  foodEntries: [],
  progressLogs: [],
  reminders: [
    { id: '1', title: 'Morning Workout', time: '07:00', type: 'workout', enabled: false, daysOfWeek: [1, 2, 3, 4, 5] },
    { id: '2', title: 'Lunch Meal Tracker', time: '13:00', type: 'meal', enabled: false, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
    { id: '3', title: 'Drink Water Reminder', time: '10:00', type: 'water', enabled: false, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
    { id: '4', title: 'Drink Water Reminder', time: '15:00', type: 'water', enabled: false, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
  ],
  customExercises: [],
  foodPresets: FOOD_PRESETS,
  hasCompletedSetup: false,
};

const fitnessReducer = (state: FitnessState, action: FitnessAction): FitnessState => {
  switch (action.type) {
    case 'INITIALIZE_STATE': {
      const loaded = action.payload;
      return {
        ...loaded,
        foodPresets: loaded.foodPresets || FOOD_PRESETS,
        reminders: loaded.reminders || initialFitnessState.reminders,
      };
    }

    case 'UPDATE_PROFILE': {
      const { name, age, gender, height, weight, fitnessGoal, activityLevel } = action.payload;
      const targets = calculateCaloricTargets(weight, height, age, gender, activityLevel, fitnessGoal);
      
      const newProfile: UserProfile = {
        name,
        age,
        gender,
        height,
        weight,
        fitnessGoal,
        activityLevel,
        ...targets,
      };

      return {
        ...state,
        profile: newProfile,
        hasCompletedSetup: true,
      };
    }

    case 'ADD_WORKOUT':
      return {
        ...state,
        workouts: [action.payload, ...state.workouts],
      };

    case 'UPDATE_WORKOUT':
      return {
        ...state,
        workouts: state.workouts.map((w) => (w.id === action.payload.id ? action.payload : w)),
      };

    case 'DELETE_WORKOUT':
      return {
        ...state,
        workouts: state.workouts.filter((w) => w.id !== action.payload),
      };

    case 'ADD_FOOD_ENTRY':
      return {
        ...state,
        foodEntries: [action.payload, ...state.foodEntries],
      };

    case 'DELETE_FOOD_ENTRY':
      return {
        ...state,
        foodEntries: state.foodEntries.filter((f) => f.id !== action.payload),
      };

    case 'ADD_PROGRESS_LOG':
      return {
        ...state,
        progressLogs: [action.payload, ...state.progressLogs].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      };

    case 'DELETE_PROGRESS_LOG':
      return {
        ...state,
        progressLogs: state.progressLogs.filter((p) => p.id !== action.payload),
      };

    case 'ADD_CUSTOM_EXERCISE':
      return {
        ...state,
        customExercises: [...state.customExercises, action.payload],
      };

    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map((r) => (r.id === action.payload.id ? action.payload : r)),
      };

    case 'ADD_REMINDER':
      return {
        ...state,
        reminders: [...state.reminders, action.payload],
      };

    case 'DELETE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter((r) => r.id !== action.payload),
      };

    case 'ADD_FOOD_PRESET':
      return {
        ...state,
        foodPresets: [action.payload, ...state.foodPresets],
      };

    case 'DELETE_FOOD_PRESET':
      return {
        ...state,
        foodPresets: state.foodPresets.filter((f) => f.id !== action.payload),
      };

    case 'RESET_STATE':
      return initialFitnessState;

    default:
      return state;
  }
};

interface FitnessContextType {
  state: FitnessState;
  dispatch: React.Dispatch<FitnessAction>;
  isLoading: boolean;
  updateProfile: (profile: Omit<UserProfile, 'targetCalories' | 'targetProtein' | 'targetCarbs' | 'targetFats'>) => void;
  addWorkout: (workout: WorkoutSession) => void;
  updateWorkout: (workout: WorkoutSession) => void;
  deleteWorkout: (id: string) => void;
  addFoodEntry: (food: FoodEntry) => void;
  deleteFoodEntry: (id: string) => void;
  addProgressLog: (log: ProgressLog) => void;
  deleteProgressLog: (id: string) => void;
  addCustomExercise: (exercise: LibraryExercise) => void;
  updateReminder: (reminder: ReminderSetting) => void;
  addReminder: (reminder: ReminderSetting) => void;
  deleteReminder: (id: string) => void;
  addFoodPreset: (preset: FoodPreset) => void;
  deleteFoodPreset: (id: string) => void;
  resetState: () => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(fitnessReducer, initialFitnessState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const savedState = await loadFitnessState();
        if (savedState) {
          dispatch({ type: 'INITIALIZE_STATE', payload: savedState });
        }
      } catch (e) {
        console.error('Failed to load state during startup', e);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveFitnessState(state);
    }
  }, [state, isLoading]);

  const updateProfile = (profile: Omit<UserProfile, 'targetCalories' | 'targetProtein' | 'targetCarbs' | 'targetFats'>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
  };

  const addWorkout = (workout: WorkoutSession) => {
    dispatch({ type: 'ADD_WORKOUT', payload: workout });
  };

  const updateWorkout = (workout: WorkoutSession) => {
    dispatch({ type: 'UPDATE_WORKOUT', payload: workout });
  };

  const deleteWorkout = (id: string) => {
    dispatch({ type: 'DELETE_WORKOUT', payload: id });
  };

  const addFoodEntry = (food: FoodEntry) => {
    dispatch({ type: 'ADD_FOOD_ENTRY', payload: food });
  };

  const deleteFoodEntry = (id: string) => {
    dispatch({ type: 'DELETE_FOOD_ENTRY', payload: id });
  };

  const addProgressLog = (log: ProgressLog) => {
    dispatch({ type: 'ADD_PROGRESS_LOG', payload: log });
  };

  const deleteProgressLog = (id: string) => {
    dispatch({ type: 'DELETE_PROGRESS_LOG', payload: id });
  };

  const addCustomExercise = (exercise: LibraryExercise) => {
    dispatch({ type: 'ADD_CUSTOM_EXERCISE', payload: exercise });
  };

  const updateReminder = (reminder: ReminderSetting) => {
    dispatch({ type: 'UPDATE_REMINDER', payload: reminder });
  };

  const addReminder = (reminder: ReminderSetting) => {
    dispatch({ type: 'ADD_REMINDER', payload: reminder });
  };

  const deleteReminder = (id: string) => {
    dispatch({ type: 'DELETE_REMINDER', payload: id });
  };

  const addFoodPreset = (preset: FoodPreset) => {
    dispatch({ type: 'ADD_FOOD_PRESET', payload: preset });
  };

  const deleteFoodPreset = (id: string) => {
    dispatch({ type: 'DELETE_FOOD_PRESET', payload: id });
  };

  const resetState = async () => {
    await clearFitnessState();
    dispatch({ type: 'RESET_STATE' });
  };

  return (
    <FitnessContext.Provider
      value={{
        state,
        dispatch,
        isLoading,
        updateProfile,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        addFoodEntry,
        deleteFoodEntry,
        addProgressLog,
        deleteProgressLog,
        addCustomExercise,
        updateReminder,
        addReminder,
        deleteReminder,
        addFoodPreset,
        deleteFoodPreset,
        resetState,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
