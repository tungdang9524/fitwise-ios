export type RootStackParamList = {
  MainTabs: undefined;
  SetupProfile: undefined;
  EditProfile: undefined;
  AddWorkoutSession: { workoutId?: string } | undefined;
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
};

export type MainTabParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Nutrition: undefined;
  Progress: undefined;
  Settings: undefined;
};
