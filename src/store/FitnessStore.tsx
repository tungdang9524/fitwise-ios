import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { 
  FitnessState, UserProfile, WorkoutSession, FoodEntry, ProgressLog, ReminderSetting, 
  LibraryExercise, FoodPreset, PersonalRecord, WorkoutTemplate, WaterLog, SleepLog 
} from '../models/fitness';
import { calculateBodyVisualizerData } from '../utils/muscleMapping';
import { saveFitnessState, loadFitnessState, clearFitnessState } from './storage';
import { calculateCaloricTargets } from '../utils/formulas';
import { FOOD_PRESETS } from '../data/foodPresets';
import { getLocalDateString, calculateStreak } from '../utils/dates';

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
  | { type: 'ADD_TEMPLATE'; payload: WorkoutTemplate }
  | { type: 'UPDATE_TEMPLATE'; payload: WorkoutTemplate }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'DUPLICATE_TEMPLATE'; payload: string }
  | { type: 'ADD_WATER'; payload: { amount: number; date: string } }
  | { type: 'SET_WATER_GOAL'; payload: number }
  | { type: 'DELETE_WATER_LOG'; payload: string }
  | { type: 'ADD_SLEEP'; payload: SleepLog }
  | { type: 'UPDATE_SLEEP'; payload: SleepLog }
  | { type: 'DELETE_SLEEP'; payload: string }
  | { type: 'SET_SLEEP_GOAL'; payload: number }
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
  unlockedList: string[],
  waterLogs: WaterLog[] = [],
  waterGoal: number = 2000,
  sleepLogs: SleepLog[] = [],
  sleepGoal: number = 480,
  workouts: WorkoutSession[] = [],
  profile: UserProfile | null = null,
  customExercises: LibraryExercise[] = []
): string[] => {
  const list = [...unlockedList];

  // Body Visualizer Achievements
  if (workouts.length > 0 && profile) {
    const visData = calculateBodyVisualizerData(workouts, customExercises, profile);
    if (visData.overallScore >= 60 && !list.includes('iron_builder')) {
      list.push('iron_builder');
    }
    if (visData.overallScore >= 75 && !list.includes('gym_legend')) {
      list.push('gym_legend');
    }
  }

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

  // Water Achievements
  const totalsByDate: Record<string, number> = {};
  (waterLogs || []).forEach((log) => {
    totalsByDate[log.date] = (totalsByDate[log.date] || 0) + log.amount;
  });
  const totalCompletedDays = Object.keys(totalsByDate).filter(d => totalsByDate[d] >= waterGoal).length;

  let streak = 0;
  if (waterLogs && waterLogs.length > 0) {
    const todayStr = getLocalDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);
    const completedDates = new Set(
      Object.keys(totalsByDate).filter((date) => totalsByDate[date] >= waterGoal)
    );

    if (completedDates.has(todayStr) || completedDates.has(yesterdayStr)) {
      const checkDate = new Date();
      if (!completedDates.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      while (true) {
        const checkStr = getLocalDateString(checkDate);
        if (completedDates.has(checkStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  if ((totalCompletedDays >= 7 || streak >= 7) && !list.includes('hydration_starter')) {
    list.push('hydration_starter');
  }
  if ((totalCompletedDays >= 30 || streak >= 30) && !list.includes('hydration_master')) {
    list.push('hydration_master');
  }

  // Early Sleeper check
  let earlySleepDays = 0;
  (sleepLogs || []).forEach((log) => {
    const [h] = log.bedtime.split(':').map(Number);
    if (h >= 18 && h < 23) {
      earlySleepDays++;
    }
  });
  if (earlySleepDays >= 7 && !list.includes('early_sleeper')) {
    list.push('early_sleeper');
  }

  // Recovery Master check
  let recoveryMasterDays = 0;
  (sleepLogs || []).forEach((log) => {
    if (log.duration >= 480) { // 8 hours
      recoveryMasterDays++;
    }
  });
  if (recoveryMasterDays >= 30 && !list.includes('recovery_master')) {
    list.push('recovery_master');
  }

  return list;
};

const calculateSleepScores = (
  durationMins: number,
  quality: number, // 1-10
  bedtimeStr: string, // "HH:MM"
  wakeupStr: string, // "HH:MM"
  pastLogs: SleepLog[],
  sleepGoal: number
): {
  sleepScore: number;
  durationScore: number;
  consistencyScore: number;
  qualityScore: number;
} => {
  const durationScore = Math.min(100, Math.round((durationMins / sleepGoal) * 100));
  const qualityScore = quality * 10;

  let consistencyScore = 85;
  if (pastLogs.length >= 2) {
    const allLogs = [...pastLogs.slice(0, 4), { bedtime: bedtimeStr, wakeupTime: wakeupStr }];
    
    const getBedtimeMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h >= 12 ? (h - 12) * 60 + m : (h + 12) * 60 + m;
    };

    const getWakeupMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const bedTimes = allLogs.map((l) => getBedtimeMins(l.bedtime));
    const wakeTimes = allLogs.map((l) => getWakeupMins(l.wakeupTime));

    const avgBed = bedTimes.reduce((s, val) => s + val, 0) / bedTimes.length;
    const avgWake = wakeTimes.reduce((s, val) => s + val, 0) / wakeTimes.length;

    const devBed = bedTimes.map((t) => Math.abs(t - avgBed)).reduce((s, val) => s + val, 0) / bedTimes.length;
    const devWake = wakeTimes.map((t) => Math.abs(t - avgWake)).reduce((s, val) => s + val, 0) / wakeTimes.length;

    const totalDev = devBed + devWake;
    consistencyScore = Math.max(50, Math.min(100, Math.round(100 - totalDev * 0.25)));
  }

  const sleepScore = Math.round(durationScore * 0.5 + consistencyScore * 0.3 + qualityScore * 0.2);

  return {
    sleepScore,
    durationScore,
    consistencyScore,
    qualityScore,
  };
};

const calculateSleepStreak = (logs: SleepLog[], sleepGoal: number): { currentStreak: number; longestStreak: number } => {
  if (!logs || logs.length === 0) return { currentStreak: 0, longestStreak: 0 };
  
  const metDates = new Set<string>();
  logs.forEach((log) => {
    if (log.duration >= sleepGoal) {
      metDates.add(log.date);
    }
  });

  if (metDates.size === 0) return { currentStreak: 0, longestStreak: 0 };

  const sortedDates = Array.from(metDates).sort();
  
  const todayStr = getLocalDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);
  
  let currentStreak = 0;
  if (metDates.has(todayStr) || metDates.has(yesterdayStr)) {
    let checkDate = new Date();
    if (!metDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const checkStr = getLocalDateString(checkDate);
      if (metDates.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  let prevDate: Date | null = null;
  let currentRun = 0;
  
  const datesChronological = sortedDates.map(d => new Date(d)).sort((a,b) => a.getTime() - b.getTime());
  datesChronological.forEach((d) => {
    if (prevDate === null) {
      currentRun = 1;
    } else {
      const diffTime = Math.abs(d.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        if (currentRun > longestStreak) longestStreak = currentRun;
        currentRun = 1;
      }
    }
    prevDate = d;
  });

  if (currentRun > longestStreak) longestStreak = currentRun;

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
  };
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
  templates: [],
  waterLogs: [],
  waterGoal: 2000,
  longestStreak: 0,
  sleepLogs: [],
  sleepGoal: 480,
  longestSleepStreak: 0,
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
        templates: loaded.templates || [],
        waterLogs: loaded.waterLogs || [],
        waterGoal: loaded.waterGoal || 2000,
        longestStreak: loaded.longestStreak || 0,
        sleepLogs: loaded.sleepLogs || [],
        sleepGoal: loaded.sleepGoal || 480,
        longestSleepStreak: loaded.longestSleepStreak || 0,
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

      // Calculate streak and update longestStreak
      const workoutDates = newWorkoutsList.map((w) => w.date);
      const foodDates = state.foodEntries.map((f) => f.date);
      const currentStreak = calculateStreak(workoutDates, foodDates);
      const newLongestStreak = Math.max(state.longestStreak || 0, currentStreak);

      let newUnlocked = checkAchievements(
        newWorkoutsList.length,
        prCount,
        state.unlockedAchievements || [],
        state.waterLogs || [],
        state.waterGoal || 2000,
        state.sleepLogs || [],
        state.sleepGoal || 480,
        newWorkoutsList,
        state.profile,
        state.customExercises || []
      );
      
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
        longestStreak: newLongestStreak,
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

    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [...(state.templates || []), action.payload],
      };

    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: (state.templates || []).map((t) => (t.id === action.payload.id ? action.payload : t)),
      };

    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: (state.templates || []).filter((t) => t.id !== action.payload),
      };

    case 'DUPLICATE_TEMPLATE': {
      const templateToCopy = (state.templates || []).find((t) => t.id === action.payload);
      if (!templateToCopy) return state;
      const duplicated: WorkoutTemplate = {
        ...templateToCopy,
        id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: `${templateToCopy.name} Copy`,
        exercises: templateToCopy.exercises.map((ex) => ({
          ...ex,
          id: `ex_tpl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          sets: ex.sets.map((s) => ({
            ...s,
            id: `set_tpl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          })),
        })),
      };
      return {
        ...state,
        templates: [...(state.templates || []), duplicated],
      };
    }

    case 'ADD_WATER': {
      const { amount, date } = action.payload;
      const newLog: WaterLog = {
        id: `water_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        date,
        amount,
      };
      const newWaterLogs = [...(state.waterLogs || []), newLog];
      
      const waterGoal = state.waterGoal || 2000;
      const dateLogsBefore = (state.waterLogs || []).filter((l) => l.date === date);
      const totalBefore = dateLogsBefore.reduce((sum, l) => sum + l.amount, 0);
      const totalAfter = totalBefore + amount;
      
      let xpEarned = 0;
      if (totalBefore < waterGoal && totalAfter >= waterGoal) {
        xpEarned = 20; // +20 XP for daily water goal completion
      }
      
      const currentLevel = state.level || 1;
      const currentXp = state.xp || 0;
      const { xp: newXp, level: newLevel } = awardXP(xpEarned, currentXp, currentLevel);
      
      const prCount = Object.keys(state.personalRecords || {}).length;
      const newUnlocked = checkAchievements(
        state.workouts.length,
        prCount,
        state.unlockedAchievements || [],
        newWaterLogs,
        waterGoal,
        state.sleepLogs || [],
        state.sleepGoal || 480,
        state.workouts,
        state.profile,
        state.customExercises || []
      );
      
      return {
        ...state,
        waterLogs: newWaterLogs,
        xp: newXp,
        level: newLevel,
        unlockedAchievements: newUnlocked,
      };
    }

    case 'SET_WATER_GOAL': {
      const newGoal = action.payload;
      const prCount = Object.keys(state.personalRecords || {}).length;
      const newUnlocked = checkAchievements(
        state.workouts.length,
        prCount,
        state.unlockedAchievements || [],
        state.waterLogs || [],
        newGoal,
        state.sleepLogs || [],
        state.sleepGoal || 480,
        state.workouts,
        state.profile,
        state.customExercises || []
      );
      return {
        ...state,
        waterGoal: newGoal,
        unlockedAchievements: newUnlocked,
      };
    }

    case 'DELETE_WATER_LOG': {
      const newWaterLogs = (state.waterLogs || []).filter((l) => l.id !== action.payload);
      return {
        ...state,
        waterLogs: newWaterLogs,
      };
    }

    case 'ADD_SLEEP': {
      const sleepLog = action.payload;
      const newSleepLogs = [sleepLog, ...(state.sleepLogs || [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const sleepGoal = state.sleepGoal || 480;
      const { currentStreak, longestStreak } = calculateSleepStreak(newSleepLogs, sleepGoal);
      
      let xpEarned = 0;
      if (sleepLog.duration >= sleepGoal) {
        const dateLogs = (state.sleepLogs || []).filter(l => l.date === sleepLog.date && l.duration >= sleepGoal);
        if (dateLogs.length === 0) {
          xpEarned = 20; // +20 XP for sleep goal met
        }
      }
      
      const currentLevel = state.level || 1;
      const currentXp = state.xp || 0;
      const { xp: newXp, level: newLevel } = awardXP(xpEarned, currentXp, currentLevel);
      
      const prCount = Object.keys(state.personalRecords || {}).length;
      const newUnlocked = checkAchievements(
        state.workouts.length,
        prCount,
        state.unlockedAchievements || [],
        state.waterLogs || [],
        state.waterGoal || 2000,
        newSleepLogs,
        sleepGoal,
        state.workouts,
        state.profile,
        state.customExercises || []
      );

      return {
        ...state,
        sleepLogs: newSleepLogs,
        longestSleepStreak: Math.max(state.longestSleepStreak || 0, longestStreak),
        xp: newXp,
        level: newLevel,
        unlockedAchievements: newUnlocked,
      };
    }

    case 'UPDATE_SLEEP': {
      const updatedLog = action.payload;
      const newSleepLogs = (state.sleepLogs || []).map((s) => (s.id === updatedLog.id ? updatedLog : s)).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const sleepGoal = state.sleepGoal || 480;
      const { longestStreak } = calculateSleepStreak(newSleepLogs, sleepGoal);

      return {
        ...state,
        sleepLogs: newSleepLogs,
        longestSleepStreak: Math.max(state.longestSleepStreak || 0, longestStreak),
      };
    }

    case 'DELETE_SLEEP': {
      const newSleepLogs = (state.sleepLogs || []).filter((s) => s.id !== action.payload);
      const sleepGoal = state.sleepGoal || 480;
      const { longestStreak } = calculateSleepStreak(newSleepLogs, sleepGoal);

      return {
        ...state,
        sleepLogs: newSleepLogs,
        longestSleepStreak: Math.max(state.longestSleepStreak || 0, longestStreak),
      };
    }

    case 'SET_SLEEP_GOAL': {
      const newGoal = action.payload;
      const prCount = Object.keys(state.personalRecords || {}).length;
      const newUnlocked = checkAchievements(
        state.workouts.length,
        prCount,
        state.unlockedAchievements || [],
        state.waterLogs || [],
        state.waterGoal || 2000,
        state.sleepLogs || [],
        newGoal,
        state.workouts,
        state.profile,
        state.customExercises || []
      );

      return {
        ...state,
        sleepGoal: newGoal,
        unlockedAchievements: newUnlocked,
      };
    }

    case 'RESET_STATE':
      return initialFitnessState;

    default:
      return state;
  }
};interface FitnessContextType {
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
  addTemplate: (template: WorkoutTemplate) => void;
  updateTemplate: (template: WorkoutTemplate) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  addWater: (amount: number, date: string) => void;
  setWaterGoal: (goal: number) => void;
  deleteWaterLog: (id: string) => void;
  addSleepLog: (sleep: Omit<SleepLog, 'id' | 'sleepScore' | 'durationScore' | 'consistencyScore' | 'qualityScore'>) => void;
  updateSleepLog: (sleep: SleepLog) => void;
  deleteSleepLog: (id: string) => void;
  setSleepGoal: (goal: number) => void;
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

  const addTemplate = (template: WorkoutTemplate) => {
    dispatch({ type: 'ADD_TEMPLATE', payload: template });
  };

  const updateTemplate = (template: WorkoutTemplate) => {
    dispatch({ type: 'UPDATE_TEMPLATE', payload: template });
  };

  const deleteTemplate = (id: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', payload: id });
  };

  const duplicateTemplate = (id: string) => {
    dispatch({ type: 'DUPLICATE_TEMPLATE', payload: id });
  };

  const addWater = (amount: number, date: string) => {
    dispatch({ type: 'ADD_WATER', payload: { amount, date } });
  };

  const setWaterGoal = (goal: number) => {
    dispatch({ type: 'SET_WATER_GOAL', payload: goal });
  };

  const deleteWaterLog = (id: string) => {
    dispatch({ type: 'DELETE_WATER_LOG', payload: id });
  };

  const addSleepLog = (sleep: Omit<SleepLog, 'id' | 'sleepScore' | 'durationScore' | 'consistencyScore' | 'qualityScore'>) => {
    const sleepGoal = state.sleepGoal || 480;
    const scores = calculateSleepScores(
      sleep.duration,
      sleep.quality,
      sleep.bedtime,
      sleep.wakeupTime,
      state.sleepLogs || [],
      sleepGoal
    );
    
    const newLog: SleepLog = {
      ...sleep,
      ...scores,
      id: `sleep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    dispatch({ type: 'ADD_SLEEP', payload: newLog });
  };

  const updateSleepLog = (sleep: SleepLog) => {
    const sleepGoal = state.sleepGoal || 480;
    const pastLogsFiltered = (state.sleepLogs || []).filter(s => s.id !== sleep.id);
    const scores = calculateSleepScores(
      sleep.duration,
      sleep.quality,
      sleep.bedtime,
      sleep.wakeupTime,
      pastLogsFiltered,
      sleepGoal
    );
    
    const updatedLog: SleepLog = {
      ...sleep,
      ...scores,
    };
    dispatch({ type: 'UPDATE_SLEEP', payload: updatedLog });
  };

  const deleteSleepLog = (id: string) => {
    dispatch({ type: 'DELETE_SLEEP', payload: id });
  };

  const setSleepGoal = (goal: number) => {
    dispatch({ type: 'SET_SLEEP_GOAL', payload: goal });
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
        addTemplate,
        updateTemplate,
        deleteTemplate,
        duplicateTemplate,
        addWater,
        setWaterGoal,
        deleteWaterLog,
        addSleepLog,
        updateSleepLog,
        deleteSleepLog,
        setSleepGoal,
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
