import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { getLocalDateString, formatDisplayDate, calculateStreak } from '../utils/dates';
import { WorkoutSession } from '../models/fitness';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WorkoutCalendarScreen: React.FC = () => {
  const { state } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(getLocalDateString(new Date()));

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11

  // 1. Stats Calculations
  const totalWorkouts = state.workouts.length;

  const workoutsThisWeek = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 1 = Mon...
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);
    return state.workouts.filter((w) => {
      const d = new Date(w.date);
      return d >= monday;
    }).length;
  }, [state.workouts]);

  const workoutsThisMonth = useMemo(() => {
    const now = new Date();
    return state.workouts.filter((w) => {
      const d = new Date(w.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [state.workouts]);

  // Streak calculations
  const workoutDates = useMemo(() => state.workouts.map((w) => w.date), [state.workouts]);
  const foodDates = useMemo(() => state.foodEntries.map((f) => f.date), [state.foodEntries]);
  const currentStreak = useMemo(() => calculateStreak(workoutDates, foodDates), [workoutDates, foodDates]);
  const longestStreak = state.longestStreak || 0;

  // 2. Calendar Logic (Monday-start)
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayIndex = useMemo(() => {
    // getDay(): 0 = Sun, 1 = Mon ... 6 = Sat
    // We want: 0 = Mon, 1 = Tue ... 6 = Sun
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  }, [currentYear, currentMonth]);

  const calendarDays = useMemo(() => {
    const days: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean } | null> = [];
    
    // Empty slots before first day
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDayIndex]);

  // Map of date -> workouts on that day
  const workoutsByDate = useMemo(() => {
    const map: Record<string, WorkoutSession[]> = {};
    state.workouts.forEach((w) => {
      if (!map[w.date]) map[w.date] = [];
      map[w.date].push(w);
    });
    return map;
  }, [state.workouts]);

  // Total volume by workout
  const getWorkoutVolume = (workout: WorkoutSession) => {
    return workout.exercises.reduce((sumEx, ex) => {
      return sumEx + ex.sets.reduce((sumSet, set) => {
        if (set.completed) {
          return sumSet + (set.weight * set.reps);
        }
        return sumSet;
      }, 0);
    }, 0);
  };

  const getWorkoutDurationMins = (workout: WorkoutSession) => {
    if (!workout.endTime) return 45; // fallback
    try {
      const diffMs = new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime();
      return Math.max(5, Math.round(diffMs / (1000 * 60)));
    } catch (e) {
      return 45;
    }
  };

  // Intensity color for a date based on completed volume
  const getDateColor = (dateStr: string) => {
    const list = workoutsByDate[dateStr];
    if (!list || list.length === 0) return null;

    const totalVolume = list.reduce((sum, w) => sum + getWorkoutVolume(w), 0);
    
    // Levels like GitHub grid
    if (totalVolume === 0) return 'rgba(174, 255, 0, 0.25)'; // tracked but no volume
    if (totalVolume < 3000) return 'rgba(174, 255, 0, 0.4)';  // light workout
    if (totalVolume < 8000) return 'rgba(174, 255, 0, 0.7)';  // medium
    return '#aeff00'; // high volume / primary Electric Lime
  };

  const selectedWorkouts = workoutsByDate[selectedDateStr] || [];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  return (
    <Screen scrollable>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Workout Calendar</AppText>
      </View>

      {/* Streak Dashboard Card */}
      <Card variant="glass" style={styles.streakCard}>
        <View style={styles.streakRow}>
          <View style={styles.streakBlock}>
            <View style={styles.streakIconWrap}>
              <Ionicons name="flame" size={26} color="#ff9900" />
            </View>
            <View>
              <AppText variant="caption" color="textMuted">CURRENT STREAK</AppText>
              <AppText variant="h2" style={{ color: '#ff9900' }}>{currentStreak} Days</AppText>
            </View>
          </View>
          <View style={[styles.streakDivider, { backgroundColor: theme.border }]} />
          <View style={styles.streakBlock}>
            <View style={styles.streakIconWrap}>
              <Ionicons name="trophy-outline" size={26} color={theme.primary} />
            </View>
            <View>
              <AppText variant="caption" color="textMuted">LONGEST STREAK</AppText>
              <AppText variant="h2">{longestStreak} Days</AppText>
            </View>
          </View>
        </View>
      </Card>

      {/* Stats Counter Section */}
      <View style={styles.statsSection}>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="bodyBold" color="primary">{workoutsThisWeek}</AppText>
          <AppText variant="caption" color="textSecondary">This Week</AppText>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="bodyBold" color="secondary">{workoutsThisMonth}</AppText>
          <AppText variant="caption" color="textSecondary">This Month</AppText>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="bodyBold">{totalWorkouts}</AppText>
          <AppText variant="caption" color="textSecondary">Total Completed</AppText>
        </View>
      </View>

      {/* Calendar Controller */}
      <Card variant="normal" style={styles.calendarCard}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <AppText variant="bodyBold" style={styles.monthText}>
            {MONTHS[currentMonth]} {currentYear}
          </AppText>
          <TouchableOpacity onPress={handleNextMonth} style={styles.arrowBtn}>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Day titles */}
        <View style={styles.weekdaysRow}>
          {WEEKDAYS.map((day, idx) => (
            <AppText key={idx} variant="caption" color="textMuted" style={styles.weekdayCell}>
              {day}
            </AppText>
          ))}
        </View>

        {/* Days grid */}
        <View style={styles.daysGrid}>
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <View key={`empty-${idx}`} style={styles.dayCell} />;
            }

            const { dateStr, dayNum } = day;
            const intensityColor = getDateColor(dateStr);
            const isSelected = selectedDateStr === dateStr;
            const isToday = getLocalDateString() === dateStr;

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dayCell,
                  intensityColor ? { backgroundColor: intensityColor } : { backgroundColor: 'rgba(255,255,255,0.02)' },
                  isSelected && { borderColor: theme.borderActive, borderWidth: 2 },
                  isToday && !isSelected && { borderColor: theme.textMuted, borderWidth: 1 }
                ]}
                onPress={() => setSelectedDateStr(dateStr)}
              >
                <AppText 
                  variant="caption" 
                  style={[
                    styles.dayText,
                    intensityColor ? { color: '#0c0f12', fontWeight: 'bold' } : { color: theme.text },
                    isSelected && { color: theme.text }
                  ]}
                >
                  {dayNum}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Date Details Section */}
      <View style={styles.detailsSection}>
        <AppText variant="h3" style={styles.detailsHeader}>
          {formatDisplayDate(selectedDateStr)} Logs
        </AppText>

        {selectedWorkouts.length === 0 ? (
          <Card variant="glass" style={styles.emptyDetailsCard}>
            <Ionicons name="barbell-outline" size={32} color={theme.textMuted} style={{ marginBottom: 8 }} />
            <AppText variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
              No workouts tracked for this day.
            </AppText>
          </Card>
        ) : (
          selectedWorkouts.map((workout) => (
            <Card key={workout.id} variant="glass" style={styles.workoutItem}>
              <View style={styles.workoutMain}>
                <View style={styles.workoutIconWrap}>
                  <Ionicons name="barbell" size={24} color={theme.primary} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyBold">{workout.name}</AppText>
                  <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                    Muscles: {workout.muscleGroups.join(', ')}
                  </AppText>
                </View>
              </View>

              <View style={[styles.workoutStatsRow, { borderTopColor: theme.border }]}>
                <View style={styles.statMini}>
                  <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                  <AppText variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>
                    {getWorkoutDurationMins(workout)} mins
                  </AppText>
                </View>
                <View style={styles.statMini}>
                  <Ionicons name="flash-outline" size={14} color={theme.textMuted} />
                  <AppText variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>
                    Volume: {getWorkoutVolume(workout).toLocaleString()} kg
                  </AppText>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  backBtn: {
    paddingRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  streakCard: {
    padding: 16,
    marginVertical: 8,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  streakDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 12,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  calendarCard: {
    padding: 12,
    marginVertical: 8,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowBtn: {
    padding: 6,
  },
  monthText: {
    fontSize: 16,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayText: {
    fontSize: 12,
  },
  detailsSection: {
    marginTop: 16,
    paddingBottom: 30,
  },
  detailsHeader: {
    marginBottom: 10,
  },
  emptyDetailsCard: {
    padding: 24,
    alignItems: 'center',
  },
  workoutItem: {
    marginVertical: 6,
    padding: 14,
  },
  workoutMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workoutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(174, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  workoutStatsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 20,
  },
  statMini: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default WorkoutCalendarScreen;
