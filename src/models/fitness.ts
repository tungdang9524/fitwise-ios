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
}

export interface LibraryExercise {
  id: string;
  name: string;
  targetMuscleGroup: string;
  instructions: string[];
  techniqueNotes: string;
  isCustom?: boolean;
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

export interface ReminderSetting {
  id: string;
  title: string;
  time: string; // HH:MM
  type: 'workout' | 'meal' | 'water';
  enabled: boolean;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
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

export interface FitnessState {
  profile: UserProfile | null;
  workouts: WorkoutSession[];
  foodEntries: FoodEntry[];
  progressLogs: ProgressLog[];
  reminders: ReminderSetting[];
  customExercises: LibraryExercise[];
  foodPresets: FoodPreset[];
  hasCompletedSetup: boolean;
  deletedExerciseIds?: string[];
}
