export type RootStackParamList = {
  MainTabs: undefined;
  SetupProfile: undefined;
  EditProfile: undefined;
  AddWorkoutSession: { workoutId?: string } | undefined;
  ActiveWorkout: { sessionName: string; muscleGroups: string[] };
  AddFoodItem: undefined;
  ExerciseDetails: { exerciseId: string };
  AddProgressLog: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Nutrition: undefined;
  Progress: undefined;
  Settings: undefined;
};
