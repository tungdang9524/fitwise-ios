import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { RootStackParamList, MainTabParamList } from './types';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import NutritionScreen from '../screens/NutritionScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SetupProfileScreen from '../screens/SetupProfileScreen';
import AddWorkoutSessionScreen from '../screens/AddWorkoutSessionScreen';
import ExerciseDetailsScreen from '../screens/ExerciseDetailsScreen';
import AddFoodItemScreen from '../screens/AddFoodItemScreen';
import AddProgressLogScreen from '../screens/AddProgressLogScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';
import BackupRestoreScreen from '../screens/BackupRestoreScreen';
import ManageRemindersScreen from '../screens/ManageRemindersScreen';
import ManagePresetsScreen from '../screens/ManagePresetsScreen';
import TargetSettingsScreen from '../screens/TargetSettingsScreen';
import BodyStatsScreen from '../screens/BodyStatsScreen';
import WorkoutCalendarScreen from '../screens/WorkoutCalendarScreen';
import WorkoutTemplatesScreen from '../screens/WorkoutTemplatesScreen';
import ManageTemplateScreen from '../screens/ManageTemplateScreen';
import VolumeAnalyticsScreen from '../screens/VolumeAnalyticsScreen';
import WaterTrackerScreen from '../screens/WaterTrackerScreen';
import SleepTrackerScreen from '../screens/SleepTrackerScreen';

// Placeholders for secondary stacks (we will create actual screens for these soon)
import { Text } from 'react-native';
const TempScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c0f12' }}>
    <Text style={{ color: '#fff' }}>{title} Placeholder</Text>
  </View>
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'cube';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Workouts') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Nutrition') {
            iconName = focused ? 'nutrition' : 'nutrition-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        headerStyle: {
          backgroundColor: theme.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: theme.text,
        },
        headerTintColor: theme.text,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Summary' }} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} options={{ title: 'Workouts' }} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} options={{ title: 'Nutrition' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { state, isLoading } = useFitness();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            color: theme.text,
          },
        }}
      >
        {!state.hasCompletedSetup ? (
          <Stack.Screen
            name="SetupProfile"
            component={SetupProfileScreen}
            options={{ title: 'Get Started', headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            {/* Modal & Sub Stack Screens */}
            <Stack.Screen
              name="EditProfile"
              component={SetupProfileScreen}
              options={{ title: 'Edit Profile' }}
            />
            <Stack.Screen
              name="AddWorkoutSession"
              component={AddWorkoutSessionScreen}
              options={{ title: 'Log Workout' }}
            />
            <Stack.Screen
              name="ActiveWorkout"
              children={() => <TempScreen title="Active Workout Tracker" />}
              options={{ title: 'Active Workout', headerShown: false }}
            />
            <Stack.Screen
              name="AddFoodItem"
              component={AddFoodItemScreen}
              options={{ title: 'Add Food Log' }}
            />
            <Stack.Screen
              name="ExerciseDetails"
              component={ExerciseDetailsScreen}
              options={{ title: 'Exercise Guide' }}
            />
            <Stack.Screen
              name="AddProgressLog"
              component={AddProgressLogScreen}
              options={{ title: 'Log Progress' }}
            />
            <Stack.Screen
              name="ThemeSettings"
              component={ThemeSettingsScreen}
              options={{ title: 'Appearance' }}
            />
            <Stack.Screen
              name="BackupRestore"
              component={BackupRestoreScreen}
              options={{ title: 'Backup & Restore' }}
            />
            <Stack.Screen
              name="ManageReminders"
              component={ManageRemindersScreen}
              options={{ title: 'Configure Reminders' }}
            />
            <Stack.Screen
              name="ManagePresets"
              component={ManagePresetsScreen}
              options={{ title: 'Presets Suggestions' }}
            />
            <Stack.Screen
              name="TargetSettings"
              component={TargetSettingsScreen}
              options={{ title: 'Target Settings' }}
            />
            <Stack.Screen
              name="BodyStats"
              component={BodyStatsScreen}
              options={{ title: 'Body Character Stats' }}
            />
            <Stack.Screen
              name="WorkoutCalendar"
              component={WorkoutCalendarScreen}
              options={{ title: 'Workout Calendar' }}
            />
            <Stack.Screen
              name="WorkoutTemplates"
              component={WorkoutTemplatesScreen}
              options={{ title: 'Workout Templates' }}
            />
            <Stack.Screen
              name="ManageTemplate"
              component={ManageTemplateScreen}
              options={{ title: 'Manage Template' }}
            />
            <Stack.Screen
              name="VolumeAnalytics"
              component={VolumeAnalyticsScreen}
              options={{ title: 'Volume Analytics' }}
            />
            <Stack.Screen
              name="WaterTracker"
              component={WaterTrackerScreen}
              options={{ title: 'Water Tracker' }}
            />
            <Stack.Screen
              name="SleepTracker"
              component={SleepTrackerScreen}
              options={{ title: 'Sleep & Recovery' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
