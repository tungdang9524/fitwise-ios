export type FitnessGoal = 'muscle_gain' | 'fat_loss' | 'weight_maintenance';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  fitnessGoal: FitnessGoal;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  targetCalories: number;
  targetProtein: number; // in grams
  targetCarbs: number;   // in grams
  targetFats: number;    // in grams
}

export interface SetLog {
  id: string;
  reps: number;
  weight: number; // in kg or lbs
  completed: boolean;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string; // references static library or custom
  name: string;
  muscleGroup: string;
  sets: SetLog[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO string
  endTime?: string;  // ISO string
  name: string; // e.g. "Upper Body Push"
  muscleGroups: string[]; // e.g. ["Chest", "Triceps"]
  exercises: ExerciseLog[];
  notes?: string;
}

export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  name: string;
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fats: number; // grams
  servingSize: string; // e.g. "100g", "1 cup"
  quantity?: number; // e.g. 1.5
}

export interface LibraryExercise {
  id: string;
  name: string;
  targetMuscleGroup: string;
  instructions: string[];
  techniqueNotes: string;
  isCustom?: boolean;
  noWeight?: boolean;
}

export interface ProgressLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  measurements?: {
    waist?: number;  // cm
    chest?: number;  // cm
    bicepsL?: number; // cm
    bicepsR?: number; // cm
    thighL?: number;  // cm
    thighR?: number;  // cm
  };
  photoUri?: string;
}

export interface FoodPreset {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  servingSize: string;
  icon: string;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

export interface FitnessState {
  profile: UserProfile | null;
  workouts: WorkoutSession[];
  foodEntries: FoodEntry[];
  progressLogs: ProgressLog[];
  customExercises: LibraryExercise[];
  foodPresets: FoodPreset[];
  hasCompletedSetup: boolean;
  deletedExerciseIds?: string[];
  // Gamification fields
  xp?: number;
  level?: number;
  unlockedAchievements?: string[];
  lastNutritionXpDate?: string; // YYYY-MM-DD
  personalRecords?: Record<string, PersonalRecord>; // exerciseId -> PersonalRecord
  
  // Offline Expansion fields
  templates?: WorkoutTemplate[];
  waterLogs?: WaterLog[];
  waterGoal?: number;
  longestStreak?: number;
  quickWaterAmount?: number;

  // Sleep Tracker fields
  sleepLogs?: SleepLog[];
  sleepGoal?: number; // target in minutes
  longestSleepStreak?: number;
  
  // Active Workout persistence
  activeWorkout?: ActiveWorkoutState | null;
}

export interface TemplateSet {
  id: string;
  reps: number;
  weight: number;
}

export interface TemplateExercise {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: TemplateSet[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  muscleGroups: string[];
  exercises: TemplateExercise[];
  notes?: string;
}

export interface WaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // in ml
}

export interface SleepLog {
  id: string;
  date: string; // YYYY-MM-DD
  bedtime: string; // HH:MM
  wakeupTime: string; // HH:MM
  duration: number; // in minutes
  quality: number; // 1-10 self rating
  notes?: string;
  sleepScore: number; // 0-100 overall score
  durationScore: number; // 0-100 sub-score
  consistencyScore: number; // 0-100 sub-score
  qualityScore: number; // 0-100 sub-score
}

export interface ActiveWorkoutState {
  name: string;
  exercises: ExerciseLog[];
  notes: string;
  muscleGroups: string[];
  startTime: string;
  templateId?: string;
  editingWorkoutId?: string;
}

