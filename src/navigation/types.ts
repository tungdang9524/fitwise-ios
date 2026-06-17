export type RootStackParamList = {
  MainTabs: undefined;
  SetupProfile: undefined;
  EditProfile: undefined;
  AddWorkoutSession: { workoutId?: string; templateId?: string } | undefined;
  ActiveWorkout: { sessionName: string; muscleGroups: string[] };
  AddFoodItem: undefined;
  ExerciseDetails: { exerciseId: string };
  AddProgressLog: undefined;
  ManageReminders: undefined;
  ManagePresets: undefined;
  BackupRestore: undefined;
  ThemeSettings: undefined;
  TargetSettings: undefined;
  BodyStats: undefined;
  WorkoutCalendar: undefined;
  WorkoutTemplates: undefined;
  ManageTemplate: { templateId?: string } | undefined;
  VolumeAnalytics: undefined;
  WaterTracker: undefined;
  SleepTracker: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Nutrition: undefined;
  Progress: undefined;
  Settings: undefined;
};
