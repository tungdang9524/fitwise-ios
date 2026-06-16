import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { FitnessState, UserProfile, WorkoutSession, FoodEntry, ProgressLog, ReminderSetting, LibraryExercise, FoodPreset, PersonalRecord } from '../models/fitness';
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
  | { type: 'DELETE_EXERCISE'; payload: string }
  | { type: 'UPDATE_REMINDER'; payload: ReminderSetting }
  | { type: 'ADD_REMINDER'; payload: ReminderSetting }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'ADD_FOOD_PRESET'; payload: FoodPreset }
  | { type: 'UPDATE_FOOD_PRESET'; payload: FoodPreset }
  | { type: 'DELETE_FOOD_PRESET'; payload: string }
  | { type: 'UPDATE_TARGETS'; payload: { targetCalories: number; targetProtein: number; targetCarbs: number; targetFats: number } }
  | { type: 'RESET_STATE' };

// Gamification Helpers
const awardXP = (xpAmount: number, currentXp: number, currentLevel: number): { xp: number; level: number } => {
  let xp = currentXp + xpAmount;
  let level = currentLevel;
  while (xp >= level * 500) {
    xp -= level * 500;
    level += 1;
  }
  return { xp, level };
};

const checkProteinMaster = (foodEntries: FoodEntry[], targetProtein: number): boolean => {
  if (targetProtein <= 0) return false;
  const proteinByDate: Record<string, number> = {};
  foodEntries.forEach((entry) => {
    proteinByDate[entry.date] = (proteinByDate[entry.date] || 0) + entry.protein;
  });
  const daysMet = Object.values(proteinByDate).filter((total) => total >= targetProtein).length;
  return daysMet >= 30;
};

const checkAchievements = (
  workoutsCount: number,
  prCount: number,
  unlockedList: string[]
): string[] => {
  const list = [...unlockedList];
  if (workoutsCount >= 1 && !list.includes('first_workout')) {
    list.push('first_workout');
  }
  if (prCount >= 1 && !list.includes('strength_builder')) {
    list.push('strength_builder');
  }
  if (prCount >= 10 && !list.includes('pr_hunter')) {
    list.push('pr_hunter');
  }
  if (workoutsCount >= 100 && !list.includes('consistency_king')) {
    list.push('consistency_king');
  }
  return list;
};

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
  deletedExerciseIds: [],
  xp: 0,
  level: 1,
  unlockedAchievements: [],
  lastNutritionXpDate: '',
  personalRecords: {},
};

const fitnessReducer = (state: FitnessState, action: FitnessAction): FitnessState => {
  switch (action.type) {
    case 'INITIALIZE_STATE': {
      const loaded = action.payload;
      return {
        ...loaded,
        foodPresets: loaded.foodPresets || FOOD_PRESETS,
        reminders: loaded.reminders || initialFitnessState.reminders,
        deletedExerciseIds: loaded.deletedExerciseIds || [],
        xp: loaded.xp !== undefined ? loaded.xp : 0,
        level: loaded.level !== undefined ? loaded.level : 1,
        unlockedAchievements: loaded.unlockedAchievements || [],
        lastNutritionXpDate: loaded.lastNutritionXpDate || '',
        personalRecords: loaded.personalRecords || {},
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

      const newUnlocked = [...(state.unlockedAchievements || [])];
      if (checkProteinMaster(state.foodEntries, targets.targetProtein) && !newUnlocked.includes('protein_master')) {
        newUnlocked.push('protein_master');
      }

      return {
        ...state,
        profile: newProfile,
        hasCompletedSetup: true,
        unlockedAchievements: newUnlocked,
      };
    }

    case 'ADD_WORKOUT': {
      const workout = action.payload;
      let xpEarned = 50; // +50 XP for completed workout
      let prsEarned = 0;
      const updatedPRs = { ...(state.personalRecords || {}) };
      
      workout.exercises.forEach((ex) => {
        const completedSets = ex.sets.filter((s) => s.completed);
        if (completedSets.length > 0) {
          const maxWeightThisWorkout = Math.max(...completedSets.map((s) => s.weight));
          const maxWeightReps = completedSets.find((s) => s.weight === maxWeightThisWorkout)?.reps || 10;
          
          const existingPR = updatedPRs[ex.exerciseId];
          if (!existingPR || maxWeightThisWorkout > existingPR.weight) {
            updatedPRs[ex.exerciseId] = {
              exerciseId: ex.exerciseId,
              exerciseName: ex.name,
              weight: maxWeightThisWorkout,
              reps: maxWeightReps,
              date: workout.date,
            };
            prsEarned += 1;
          }
        }
      });
      
      xpEarned += prsEarned * 100; // +100 XP per PR
      
      const currentLevel = state.level || 1;
      const currentXp = state.xp || 0;
      const { xp: newXp, level: newLevel } = awardXP(xpEarned, currentXp, currentLevel);
      
      const newWorkoutsList = [workout, ...state.workouts];
      const prCount = Object.keys(updatedPRs).length;
      let newUnlocked = checkAchievements(newWorkoutsList.length, prCount, state.unlockedAchievements || []);
      
      const targetProtein = state.profile?.targetProtein || 150;
      if (checkProteinMaster(state.foodEntries, targetProtein) && !newUnlocked.includes('protein_master')) {
        newUnlocked.push('protein_master');
      }

      return {
        ...state,
        workouts: newWorkoutsList,
        xp: newXp,
        level: newLevel,
        personalRecords: updatedPRs,
        unlockedAchievements: newUnlocked,
      };
    }

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

    case 'ADD_FOOD_ENTRY': {
      const foodEntry = action.payload;
      const dateStr = foodEntry.date;
      const targetCalories = state.profile?.targetCalories || 2000;
      const targetProtein = state.profile?.targetProtein || 150;
      
      const dailyFoods = [foodEntry, ...state.foodEntries].filter((f) => f.date === dateStr);
      const totalCalories = dailyFoods.reduce((sum, f) => sum + f.calories, 0);
      const totalProtein = dailyFoods.reduce((sum, f) => sum + f.protein, 0);
      
      let xpEarned = 0;
      let newLastNutritionXpDate = state.lastNutritionXpDate || '';
      
      if (
        totalCalories >= targetCalories * 0.9 &&
        totalCalories <= targetCalories * 1.1 &&
        totalProtein >= targetProtein &&
        state.lastNutritionXpDate !== dateStr
      ) {
        xpEarned = 20; // +20 XP for meeting goals
        newLastNutritionXpDate = dateStr;
      }
      
      const currentLevel = state.level || 1;
      const currentXp = state.xp || 0;
      const { xp: newXp, level: newLevel } = awardXP(xpEarned, currentXp, currentLevel);
      
      const newFoodEntries = [foodEntry, ...state.foodEntries];
      const newUnlocked = [...(state.unlockedAchievements || [])];
      if (checkProteinMaster(newFoodEntries, targetProtein) && !newUnlocked.includes('protein_master')) {
        newUnlocked.push('protein_master');
      }

      return {
        ...state,
        foodEntries: newFoodEntries,
        xp: newXp,
        level: newLevel,
        lastNutritionXpDate: newLastNutritionXpDate,
        unlockedAchievements: newUnlocked,
      };
    }

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

    case 'DELETE_EXERCISE':
      return {
        ...state,
        customExercises: state.customExercises.filter((e) => e.id !== action.payload),
        deletedExerciseIds: [...(state.deletedExerciseIds || []), action.payload],
      };

    case 'DELETE_FOOD_PRESET':
      return {
        ...state,
        foodPresets: state.foodPresets.filter((f) => f.id !== action.payload),
      };

    case 'UPDATE_FOOD_PRESET':
      return {
        ...state,
        foodPresets: state.foodPresets.map((f) => (f.id === action.payload.id ? action.payload : f)),
      };

    case 'UPDATE_TARGETS': {
      if (!state.profile) return state;
      const targetProtein = action.payload.targetProtein;
      const newUnlocked = [...(state.unlockedAchievements || [])];
      if (checkProteinMaster(state.foodEntries, targetProtein) && !newUnlocked.includes('protein_master')) {
        newUnlocked.push('protein_master');
      }
      return {
        ...state,
        profile: {
          ...state.profile,
          targetCalories: action.payload.targetCalories,
          targetProtein: action.payload.targetProtein,
          targetCarbs: action.payload.targetCarbs,
          targetFats: action.payload.targetFats,
        },
        unlockedAchievements: newUnlocked,
      };
    }

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
  deleteExercise: (id: string) => void;
  updateReminder: (reminder: ReminderSetting) => void;
  addReminder: (reminder: ReminderSetting) => void;
  deleteReminder: (id: string) => void;
  addFoodPreset: (preset: FoodPreset) => void;
  updateFoodPreset: (preset: FoodPreset) => void;
  deleteFoodPreset: (id: string) => void;
  updateTargets: (targets: { targetCalories: number; targetProtein: number; targetCarbs: number; targetFats: number }) => void;
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

  const deleteExercise = (id: string) => {
    dispatch({ type: 'DELETE_EXERCISE', payload: id });
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

  const updateFoodPreset = (preset: FoodPreset) => {
    dispatch({ type: 'UPDATE_FOOD_PRESET', payload: preset });
  };

  const deleteFoodPreset = (id: string) => {
    dispatch({ type: 'DELETE_FOOD_PRESET', payload: id });
  };

  const updateTargets = (targets: { targetCalories: number; targetProtein: number; targetCarbs: number; targetFats: number }) => {
    dispatch({ type: 'UPDATE_TARGETS', payload: targets });
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
        deleteExercise,
        updateReminder,
        addReminder,
        deleteReminder,
        addFoodPreset,
        updateFoodPreset,
        deleteFoodPreset,
        updateTargets,
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
