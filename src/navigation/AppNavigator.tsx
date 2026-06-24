import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity } from 'react-native';

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
import ManagePresetsScreen from '../screens/ManagePresetsScreen';
import TargetSettingsScreen from '../screens/TargetSettingsScreen';
import BodyStatsScreen from '../screens/BodyStatsScreen';
import WorkoutCalendarScreen from '../screens/WorkoutCalendarScreen';
import WorkoutTemplatesScreen from '../screens/WorkoutTemplatesScreen';
import ManageTemplateScreen from '../screens/ManageTemplateScreen';
import VolumeAnalyticsScreen from '../screens/VolumeAnalyticsScreen';
import WaterTrackerScreen from '../screens/WaterTrackerScreen';
import SleepTrackerScreen from '../screens/SleepTrackerScreen';
import UserProfileScreen from '../screens/UserProfileScreen';

// Placeholders for secondary stacks (we will create actual screens for these soon)
const TempScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c0f12' }}>
    <Text style={{ color: '#fff' }}>{title} Placeholder</Text>
  </View>
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const ActiveWorkoutTimer = ({ startTime, theme }: { startTime: string; theme: any }) => {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const update = () => {
      const start = new Date(startTime).getTime();
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>
      {formatTimer(elapsed)}
    </Text>
  );
};

const TabNavigator = () => {
  const { theme } = useTheme();
  const { state } = useFitness();
  const navigation = useNavigation<any>();

  return (
    <View style={{ flex: 1 }}>
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

      {state.activeWorkout && (
        <TouchableOpacity
          style={[styles.activeWorkoutBar, { backgroundColor: theme.surfaceElevated, borderTopColor: theme.border }]}
          onPress={() => {
            navigation.navigate('AddWorkoutSession', {
              workoutId: state.activeWorkout?.editingWorkoutId,
              templateId: state.activeWorkout?.templateId,
            });
          }}
        >
          <Ionicons name="barbell" size={24} color={theme.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 14 }}>
              Active: {state.activeWorkout.name}
            </Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>
              Tap to resume workout
            </Text>
          </View>
          <ActiveWorkoutTimer startTime={state.activeWorkout.startTime} theme={theme} />
        </TouchableOpacity>
      )}
    </View>
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
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{ title: 'User Profile' }}
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
  activeWorkoutBar: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
});
