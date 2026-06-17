import React, { useState, useMemo } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Modal, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { getLocalDateString, formatDisplayDate } from '../utils/dates';
import { SleepLog } from '../models/fitness';

export const SleepTrackerScreen: React.FC = () => {
  const { state, addSleepLog, updateSleepLog, deleteSleepLog, setSleepGoal } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const todayStr = getLocalDateString();
  const sleepGoal = state.sleepGoal || 480; // 8 hours default (in minutes)

  // Local State
  const [goalInput, setGoalInput] = useState(String(sleepGoal / 60));
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLog, setEditingLog] = useState<SleepLog | null>(null);

  // Form State
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeupTime, setWakeupTime] = useState('07:00');
  const [quality, setQuality] = useState(7); // default 7/10
  const [notes, setNotes] = useState('');
  const [logDate, setLogDate] = useState(todayStr);

  // Constants
  const availableQualityRatings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Helper: Format duration (minutes -> "Xh Ym")
  const formatDuration = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hrs}h ${m}m`;
  };

  // Helper: Calculate duration in minutes from HH:MM strings
  const calculateDurationMins = (bedStr: string, wakeStr: string): number => {
    const [bedH, bedM] = bedStr.split(':').map(Number);
    const [wakeH, wakeM] = wakeStr.split(':').map(Number);
    
    if (isNaN(bedH) || isNaN(bedM) || isNaN(wakeH) || isNaN(wakeM)) return 0;
    
    const bedMins = bedH * 60 + bedM;
    const wakeMins = wakeH * 60 + wakeM;
    
    if (wakeMins >= bedMins) {
      return wakeMins - bedMins;
    } else {
      // Slept across midnight
      return (1440 - bedMins) + wakeMins;
    }
  };

  // Calculated form duration preview
  const formDurationPreview = useMemo(() => {
    const mins = calculateDurationMins(bedtime, wakeupTime);
    return formatDuration(mins);
  }, [bedtime, wakeupTime]);

  // Today's Sleep Calculation
  const todayLogs = useMemo(() => {
    return (state.sleepLogs || []).filter((l) => l.date === todayStr);
  }, [state.sleepLogs, todayStr]);

  const todayTotalDuration = useMemo(() => {
    return todayLogs.reduce((sum, l) => sum + l.duration, 0);
  }, [todayLogs]);

  const todaySleepScore = useMemo(() => {
    return todayLogs.length > 0 ? todayLogs[0].sleepScore : 0;
  }, [todayLogs]);

  const todaySleepLog = todayLogs.length > 0 ? todayLogs[0] : null;

  // Active Recovery Score Calculation
  const recoveryScore = useMemo(() => {
    const lastNightSleep = (state.sleepLogs || []).find((l) => l.date === todayStr);
    const sleepContribution = lastNightSleep ? lastNightSleep.sleepScore : 70;
    
    const getPastDateStr = (daysAgo: number) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const yesterdayStr = getPastDateStr(1);
    const twoDaysAgoStr = getPastDateStr(2);
    const threeDaysAgoStr = getPastDateStr(3);
    
    const workoutsYesterday = state.workouts.filter((w) => w.date === yesterdayStr);
    const workouts2DaysAgo = state.workouts.filter((w) => w.date === twoDaysAgoStr);
    const workouts3DaysAgo = state.workouts.filter((w) => w.date === threeDaysAgoStr);
    
    const penalty = 
      (workoutsYesterday.length * 20) + 
      (workouts2DaysAgo.length * 10) + 
      (workouts3DaysAgo.length * 5);
      
    return Math.max(10, Math.min(100, sleepContribution - penalty));
  }, [state.sleepLogs, state.workouts, todayStr]);

  const recoveryMessage = useMemo(() => {
    if (recoveryScore >= 80) return 'Ready for workout 💪';
    if (recoveryScore >= 50) return 'Moderate recovery. Good training ready.';
    return 'Your recovery is lower today. Consider a lighter workout.';
  }, [recoveryScore]);

  // Sleep Goal edit handlers
  const handleSaveGoal = () => {
    const hours = parseFloat(goalInput);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      Alert.alert('Validation Error', 'Please enter a valid number of hours (0.5 to 24).');
      return;
    }
    setSleepGoal(Math.round(hours * 60));
    setIsEditingGoal(false);
    Alert.alert('Success', `Daily sleep goal updated to ${hours} hours.`);
  };

  // Log CRUD Actions
  const handleOpenAddModal = () => {
    setEditingLog(null);
    setBedtime('23:00');
    setWakeupTime('07:00');
    setQuality(7);
    setNotes('');
    setLogDate(todayStr);
    setModalVisible(true);
  };

  const handleOpenEditModal = (log: SleepLog) => {
    setEditingLog(log);
    setBedtime(log.bedtime);
    setWakeupTime(log.wakeupTime);
    setQuality(log.quality);
    setNotes(log.notes || '');
    setLogDate(log.date);
    setModalVisible(true);
  };

  const handleSaveLog = () => {
    const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(bedtime.trim()) || !timeRegex.test(wakeupTime.trim())) {
      Alert.alert('Validation Error', 'Please enter bedtime and wake-up time in HH:MM format (e.g. 23:30).');
      return;
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(logDate.trim())) {
      Alert.alert('Validation Error', 'Please enter date in YYYY-MM-DD format.');
      return;
    }

    const duration = calculateDurationMins(bedtime, wakeupTime);
    if (duration === 0) {
      Alert.alert('Validation Error', 'Duration cannot be 0. Please verify bedtime and wakeup times.');
      return;
    }

    if (editingLog) {
      updateSleepLog({
        ...editingLog,
        date: logDate.trim(),
        bedtime: bedtime.trim(),
        wakeupTime: wakeupTime.trim(),
        duration,
        quality,
        notes: notes.trim(),
      });
      Alert.alert('Success', 'Sleep log updated successfully!');
    } else {
      // Check if log for this date already exists
      const existing = (state.sleepLogs || []).some((l) => l.date === logDate.trim());
      if (existing) {
        Alert.alert('Already Logged', 'A sleep log already exists for this date. Edit the existing log instead.');
        return;
      }

      addSleepLog({
        date: logDate.trim(),
        bedtime: bedtime.trim(),
        wakeupTime: wakeupTime.trim(),
        duration,
        quality,
        notes: notes.trim(),
      });
      Alert.alert('Success', 'Sleep log saved successfully!');
    }

    setModalVisible(false);
  };

  const handleDeleteLog = (id: string, date: string) => {
    Alert.alert(
      'Delete Sleep Log',
      `Are you sure you want to delete the sleep log for ${formatDisplayDate(date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSleepLog(id) },
      ]
    );
  };

  // Current active sleep streak
  const sleepStreak = useMemo(() => {
    if (!state.sleepLogs || state.sleepLogs.length === 0) return 0;
    
    const metDates = new Set<string>();
    state.sleepLogs.forEach((log) => {
      if (log.duration >= sleepGoal) {
        metDates.add(log.date);
      }
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);
    
    let streak = 0;
    if (metDates.has(todayStr) || metDates.has(yesterdayStr)) {
      let checkDate = new Date();
      if (!metDates.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      while (true) {
        const checkStr = getLocalDateString(checkDate);
        if (metDates.has(checkStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
    return streak;
  }, [state.sleepLogs, sleepGoal, todayStr]);

  // Workout & Sleep correlation statistics
  const sleepAnalytics = useMemo(() => {
    const workouts = state.workouts || [];
    const sleepLogs = state.sleepLogs || [];
    
    if (workouts.length === 0 || sleepLogs.length === 0) {
      return { hasData: false, goodSleepVolume: 0, badSleepVolume: 0, diffPct: 0 };
    }

    // Map sleep logs by date
    const sleepMap = new Map<string, SleepLog>();
    sleepLogs.forEach((l) => sleepMap.set(l.date, l));

    const goodSleepWorkouts: number[] = []; // Workout volumes when sleep >= 7h (420 mins)
    const poorSleepWorkouts: number[] = []; // Workout volumes when sleep < 6h (360 mins)

    workouts.forEach((w) => {
      // Find sleep for the night before (w.date matches sleep log date)
      const sleepBefore = sleepMap.get(w.date);
      if (sleepBefore) {
        const workoutVolume = w.exercises.reduce((accEx, ex) => {
          return accEx + ex.sets.reduce((accSet, s) => s.completed ? accSet + (s.weight * s.reps) : accSet, 0);
        }, 0);

        if (workoutVolume > 0) {
          if (sleepBefore.duration >= 420) {
            goodSleepWorkouts.push(workoutVolume);
          } else if (sleepBefore.duration < 360) {
            poorSleepWorkouts.push(workoutVolume);
          }
        }
      }
    });

    if (goodSleepWorkouts.length === 0 && poorSleepWorkouts.length === 0) {
      return { hasData: false, goodSleepVolume: 0, badSleepVolume: 0, diffPct: 0 };
    }

    const avgGood = goodSleepWorkouts.length > 0 
      ? Math.round(goodSleepWorkouts.reduce((s,v) => s+v, 0) / goodSleepWorkouts.length)
      : 0;

    const avgPoor = poorSleepWorkouts.length > 0 
      ? Math.round(poorSleepWorkouts.reduce((s,v) => s+v, 0) / poorSleepWorkouts.length)
      : 0;

    let diffPct = 0;
    if (avgPoor > 0 && avgGood > 0) {
      diffPct = Math.round(((avgGood - avgPoor) / avgPoor) * 100);
    }

    return {
      hasData: avgGood > 0 || avgPoor > 0,
      goodSleepVolume: avgGood,
      badSleepVolume: avgPoor,
      diffPct,
    };
  }, [state.workouts, state.sleepLogs]);

  // Weekly Sleep Analytics Report
  const weeklyAnalytics = useMemo(() => {
    const logs = state.sleepLogs || [];
    if (logs.length === 0) return null;

    // Last 7 logs or logs in the past week
    const last7Logs = logs.slice(0, 7);
    const totalDuration = last7Logs.reduce((sum, l) => sum + l.duration, 0);
    const avgDuration = Math.round(totalDuration / last7Logs.length);
    const avgScore = Math.round(last7Logs.reduce((sum, l) => sum + l.sleepScore, 0) / last7Logs.length);

    // Find best and worst day of week
    const weekdayDurations: Record<string, number[]> = {};
    logs.forEach((log) => {
      const dateObj = new Date(log.date);
      const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'long' });
      if (!weekdayDurations[dayName]) weekdayDurations[dayName] = [];
      weekdayDurations[dayName].push(log.duration);
    });

    let bestDay = 'N/A';
    let bestAvg = 0;
    let worstDay = 'N/A';
    let worstAvg = Infinity;

    Object.keys(weekdayDurations).forEach((day) => {
      const avg = weekdayDurations[day].reduce((s, v) => s + v, 0) / weekdayDurations[day].length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestDay = day;
      }
      if (avg < worstAvg) {
        worstAvg = avg;
        worstDay = day;
      }
    });

    return {
      avgDuration,
      avgScore,
      bestDay,
      worstDay: worstDay === String(Infinity) ? 'N/A' : worstDay,
    };
  }, [state.sleepLogs]);

  return (
    <Screen scrollable>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Sleep & Recovery</AppText>
      </View>

      {/* Sleep Goal Setting Card */}
      <Card variant="glass" style={styles.goalCard}>
        <View style={styles.goalRow}>
          <View style={styles.flex}>
            <AppText variant="caption" color="textSecondary">DAILY SLEEP GOAL</AppText>
            {isEditingGoal ? (
              <View style={styles.goalInputRow}>
                <TextInput
                  style={[styles.goalInput, { borderColor: theme.primary, color: theme.text }]}
                  keyboardType="numeric"
                  value={goalInput}
                  onChangeText={setGoalInput}
                />
                <AppText variant="body" style={{ marginLeft: 6 }}>hours</AppText>
              </View>
            ) : (
              <AppText variant="h3" style={{ marginTop: 4 }}>
                {sleepGoal / 60} Hours
              </AppText>
            )}
          </View>
          {isEditingGoal ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => setIsEditingGoal(false)} style={styles.goalBtn}>
                <AppText variant="caption" color="textMuted">Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveGoal} style={[styles.goalBtn, { backgroundColor: theme.primary }]}>
                <AppText variant="caption" style={{ color: '#0c0f12', fontWeight: 'bold' }}>Save</AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingGoal(true)} style={[styles.goalBtn, { borderColor: theme.border }]}>
              <Ionicons name="create-outline" size={14} color={theme.textSecondary} />
              <AppText variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>Set Goal</AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Goal completion progress bar */}
        <View style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <AppText variant="caption" color="textSecondary">
              Today: {formatDuration(todayTotalDuration)}
            </AppText>
            <AppText variant="caption" color="primary" style={{ fontWeight: 'bold' }}>
              {Math.min(100, Math.round((todayTotalDuration / sleepGoal) * 100))}%
            </AppText>
          </View>
          <ProgressBar progress={Math.min(1.0, todayTotalDuration / sleepGoal)} color={theme.primary} />
        </View>
      </Card>

      {/* Recovery Dashboard Status */}
      <Card variant="elevated" style={[styles.recoveryCard, { borderColor: recoveryScore >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.2)' }]}>
        <View style={styles.recoveryRow}>
          <View style={styles.recoveryCircle}>
            <AppText variant="h2" color="primary" style={{ fontWeight: '800' }}>{recoveryScore}%</AppText>
            <AppText variant="caption" color="textMuted" style={{ fontSize: 9 }}>RECOVERY</AppText>
          </View>
          <View style={styles.flex}>
            <AppText variant="bodyBold" style={{ fontSize: 16 }}>{recoveryMessage}</AppText>
            <AppText variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
              Calculated using last night's Sleep Score ({todaySleepScore || '--'}/100) and recent workouts load.
            </AppText>
          </View>
        </View>
      </Card>

      {/* Today's Sleep Score Breakdown (Only if logged) */}
      {todaySleepLog && (
        <Card variant="normal" style={styles.scoreBreakdownCard}>
          <View style={{ marginBottom: 12 }}>
            <AppText variant="caption" color="textSecondary">TODAY'S SLEEP SCORE</AppText>
            <AppText variant="h2" color="primary" style={{ marginTop: 2 }}>{todaySleepLog.sleepScore} / 100</AppText>
          </View>
          <View style={styles.breakdownGrid}>
            <View style={styles.breakdownCol}>
              <AppText variant="bodyBold">{todaySleepLog.durationScore}/100</AppText>
              <AppText variant="caption" color="textSecondary">Duration (50%)</AppText>
            </View>
            <View style={styles.breakdownCol}>
              <AppText variant="bodyBold">{todaySleepLog.consistencyScore}/100</AppText>
              <AppText variant="caption" color="textSecondary">Consistency (30%)</AppText>
            </View>
            <View style={styles.breakdownCol}>
              <AppText variant="bodyBold">{todaySleepLog.qualityScore}/100</AppText>
              <AppText variant="caption" color="textSecondary">Quality (20%)</AppText>
            </View>
          </View>
        </Card>
      )}

      {/* Main logging call to action button */}
      <View style={styles.actionRow}>
        <PrimaryButton
          title={todaySleepLog ? "✓ Slept Logged Today" : "+ Log Last Night's Sleep"}
          onPress={handleOpenAddModal}
          disabled={!!todaySleepLog}
          style={styles.addBtn}
        />
        {sleepStreak > 0 && (
          <View style={[styles.streakBadge, { borderColor: '#ff9900' }]}>
            <Ionicons name="flame" size={18} color="#ff9900" />
            <AppText variant="bodyBold" style={{ color: '#ff9900', marginLeft: 4 }}>{sleepStreak} Days</AppText>
          </View>
        )}
      </View>

      {/* Sleep & Workout Correlation Analytics */}
      <Card variant="glass" style={styles.analyticsCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Ionicons name="barbell-outline" size={20} color={theme.secondary} />
          <AppText variant="bodyBold" style={{ marginLeft: 8 }}>Sleep & Workout Analytics</AppText>
        </View>
        {sleepAnalytics.hasData ? (
          <View style={{ gap: 8 }}>
            <View style={styles.analyticsRow}>
              <AppText variant="caption" color="textSecondary">Avg Workout Volume (Sleep 7h+):</AppText>
              <AppText variant="bodyBold" color="primary">{sleepAnalytics.goodSleepVolume} kg</AppText>
            </View>
            <View style={styles.analyticsRow}>
              <AppText variant="caption" color="textSecondary">Avg Workout Volume (Sleep &lt; 6h):</AppText>
              <AppText variant="bodyBold" color="textMuted">{sleepAnalytics.badSleepVolume} kg</AppText>
            </View>
            {sleepAnalytics.diffPct > 0 && (
              <View style={[styles.insightBox, { backgroundColor: 'rgba(174, 255, 0, 0.08)' }]}>
                <Ionicons name="trending-up" size={16} color={theme.primary} />
                <AppText variant="caption" color="primary" style={{ marginLeft: 6, fontWeight: 'bold', flex: 1 }}>
                  Insight: You lift on average {sleepAnalytics.diffPct}% heavier when getting 7+ hours of sleep!
                </AppText>
              </View>
            )}
          </View>
        ) : (
          <AppText variant="caption" color="textMuted">
            Log workouts and sleep logs consistently to unlock sleep-to-workout performance correlations.
          </AppText>
        )}
      </Card>

      {/* Weekly Sleep Analytics Report */}
      {weeklyAnalytics && (
        <Card variant="glass" style={styles.weeklyReportCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
            <AppText variant="bodyBold" style={{ marginLeft: 8 }}>Weekly Sleep Report</AppText>
          </View>
          <View style={styles.reportGrid}>
            <View style={styles.reportItem}>
              <AppText variant="caption" color="textSecondary">Avg Duration</AppText>
              <AppText variant="bodyBold" style={{ marginTop: 2 }}>{formatDuration(weeklyAnalytics.avgDuration)}</AppText>
            </View>
            <View style={styles.reportItem}>
              <AppText variant="caption" color="textSecondary">Avg Sleep Score</AppText>
              <AppText variant="bodyBold" color="primary" style={{ marginTop: 2 }}>{weeklyAnalytics.avgScore}/100</AppText>
            </View>
            <View style={styles.reportItem}>
              <AppText variant="caption" color="textSecondary">Best Sleep Day</AppText>
              <AppText variant="bodyBold" color="success" style={{ marginTop: 2 }}>{weeklyAnalytics.bestDay}</AppText>
            </View>
            <View style={styles.reportItem}>
              <AppText variant="caption" color="textSecondary">Worst Sleep Day</AppText>
              <AppText variant="bodyBold" color="error" style={{ marginTop: 2 }}>{weeklyAnalytics.worstDay}</AppText>
            </View>
          </View>
        </Card>
      )}

      {/* Sleep Achievements Checklist */}
      <View style={{ marginTop: 16 }}>
        <AppText variant="h3" style={styles.sectionTitle}>Sleep Achievements</AppText>
        <Card variant="glass" style={styles.badgeCard}>
          {/* Badge 1 */}
          <View style={styles.badgeItem}>
            <View style={[styles.badgeIconWrap, { 
              backgroundColor: (state.unlockedAchievements || []).includes('early_sleeper') ? 'rgba(143, 0, 255, 0.12)' : 'rgba(255,255,255,0.03)',
              borderColor: (state.unlockedAchievements || []).includes('early_sleeper') ? '#8F00FF' : theme.border
            }]}>
              <Ionicons name="moon" size={24} color={(state.unlockedAchievements || []).includes('early_sleeper') ? '#8F00FF' : theme.textMuted} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyBold" color={(state.unlockedAchievements || []).includes('early_sleeper') ? 'text' : 'textMuted'}>
                Early Sleeper
              </AppText>
              <AppText variant="caption" color="textMuted">
                Sleep before 11 PM for 7 total days.
              </AppText>
            </View>
            {(state.unlockedAchievements || []).includes('early_sleeper') && (
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Badge 2 */}
          <View style={styles.badgeItem}>
            <View style={[styles.badgeIconWrap, { 
              backgroundColor: (state.unlockedAchievements || []).includes('recovery_master') ? 'rgba(0, 255, 102, 0.12)' : 'rgba(255,255,255,0.03)',
              borderColor: (state.unlockedAchievements || []).includes('recovery_master') ? '#00FF66' : theme.border
            }]}>
              <Ionicons name="battery-charging" size={24} color={(state.unlockedAchievements || []).includes('recovery_master') ? '#00FF66' : theme.textMuted} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyBold" color={(state.unlockedAchievements || []).includes('recovery_master') ? 'text' : 'textMuted'}>
                Recovery Master
              </AppText>
              <AppText variant="caption" color="textMuted">
                Log 8+ hours of sleep for 30 total days.
              </AppText>
            </View>
            {(state.unlockedAchievements || []).includes('recovery_master') && (
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Badge 3 */}
          <View style={styles.badgeItem}>
            <View style={[styles.badgeIconWrap, { 
              backgroundColor: (state.unlockedAchievements || []).includes('sleep_champion') ? 'rgba(156, 39, 176, 0.12)' : 'rgba(255,255,255,0.03)',
              borderColor: (state.unlockedAchievements || []).includes('sleep_champion') ? '#9C27B0' : theme.border
            }]}>
              <Ionicons name="moon" size={24} color={(state.unlockedAchievements || []).includes('sleep_champion') ? '#9C27B0' : theme.textMuted} />
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyBold" color={(state.unlockedAchievements || []).includes('sleep_champion') ? 'text' : 'textMuted'}>
                Sleep Champion
              </AppText>
              <AppText variant="caption" color="textMuted">
                Log at least 7 total days of sleep.
              </AppText>
            </View>
            {(state.unlockedAchievements || []).includes('sleep_champion') && (
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            )}
          </View>
        </Card>
      </View>

      {/* Sleep History Timeline */}
      <View style={{ marginTop: 20, marginBottom: 40 }}>
        <AppText variant="h3" style={styles.sectionTitle}>Sleep History Logs</AppText>
        {(state.sleepLogs || []).length === 0 ? (
          <Card variant="glass" style={styles.emptyCard}>
            <Ionicons name="moon-outline" size={36} color={theme.textMuted} />
            <AppText variant="caption" color="textSecondary" style={{ marginTop: 8 }}>
              No sleep data logged yet.
            </AppText>
          </Card>
        ) : (
          (state.sleepLogs || []).map((log) => (
            <Card key={log.id} variant="glass" style={styles.logCard}>
              <View style={styles.logHeader}>
                <View style={styles.flex}>
                  <AppText variant="bodyBold">{formatDisplayDate(log.date)}</AppText>
                  <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
                    {log.bedtime} - {log.wakeupTime} ({formatDuration(log.duration)})
                  </AppText>
                </View>
                <View style={styles.logMeta}>
                  <View style={[styles.miniScoreBadge, { backgroundColor: theme.surfaceElevated }]}>
                    <AppText variant="caption" style={{ fontWeight: 'bold' }}>{log.sleepScore} score</AppText>
                  </View>
                  <TouchableOpacity onPress={() => handleOpenEditModal(log)} style={styles.iconActionBtn}>
                    <Ionicons name="create-outline" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteLog(log.id, log.date)} style={styles.iconActionBtn}>
                    <Ionicons name="trash-outline" size={16} color={theme.error} />
                  </TouchableOpacity>
                </View>
              </View>
              {log.notes ? (
                <View style={[styles.logNotesBox, { backgroundColor: theme.background }]}>
                  <AppText variant="caption" color="textSecondary">{log.notes}</AppText>
                </View>
              ) : null}
            </Card>
          ))
        )}
      </View>

      {/* Log Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <AppText variant="h3">{editingLog ? 'Edit Sleep Log' : 'Log Last Night\'s Sleep'}</AppText>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <AppText variant="bodyBold" color="primary">Cancel</AppText>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Card variant="glass" style={styles.modalCard}>
              <AppText variant="label" color="textSecondary" style={styles.label}>Log Date (YYYY-MM-DD)</AppText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. 2026-06-17"
                placeholderTextColor={theme.textMuted}
                value={logDate}
                onChangeText={setLogDate}
              />

              <AppText variant="label" color="textSecondary" style={styles.label}>Bedtime (HH:MM)</AppText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. 23:00"
                placeholderTextColor={theme.textMuted}
                value={bedtime}
                onChangeText={setBedtime}
              />

              <AppText variant="label" color="textSecondary" style={styles.label}>Wake-up Time (HH:MM)</AppText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. 07:00"
                placeholderTextColor={theme.textMuted}
                value={wakeupTime}
                onChangeText={setWakeupTime}
              />

              <View style={[styles.previewDurationBox, { backgroundColor: theme.background }]}>
                <AppText variant="caption" color="textSecondary">Calculated Duration:</AppText>
                <AppText variant="bodyBold" color="primary" style={{ marginTop: 2 }}>{formDurationPreview}</AppText>
              </View>

              <AppText variant="label" color="textSecondary" style={styles.label}>Sleep Quality Rating (1-10)</AppText>
              <View style={styles.ratingRow}>
                {availableQualityRatings.map((rating) => {
                  const isSelected = quality === rating;
                  return (
                    <TouchableOpacity
                      key={rating}
                      onPress={() => setQuality(rating)}
                      style={[styles.ratingBtn, {
                        backgroundColor: isSelected ? theme.primary : theme.background,
                        borderColor: isSelected ? theme.primary : theme.border
                      }]}
                    >
                      <AppText variant="caption" style={{ color: isSelected ? '#0c0f12' : theme.text, fontWeight: 'bold' }}>
                        {rating}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <AppText variant="label" color="textSecondary" style={styles.label}>Notes</AppText>
              <TextInput
                style={[styles.notesInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="How did you sleep? (e.g. woke up once, fell asleep quickly...)"
                placeholderTextColor={theme.textMuted}
                multiline
                value={notes}
                onChangeText={setNotes}
              />

              <PrimaryButton
                title={editingLog ? 'Update Sleep Record' : 'Save Sleep Record'}
                onPress={handleSaveLog}
                style={{ marginTop: 20 }}
              />
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  goalCard: {
    padding: 16,
    marginVertical: 8,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  goalInput: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  goalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  flex: {
    flex: 1,
  },
  recoveryCard: {
    padding: 16,
    marginVertical: 8,
    borderWidth: 1.5,
  },
  recoveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  recoveryCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#aeff00',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  scoreBreakdownCard: {
    padding: 16,
    marginVertical: 8,
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  breakdownCol: {
    flex: 1,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  addBtn: {
    flex: 1,
    marginVertical: 0,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 153, 0, 0.05)',
  },
  analyticsCard: {
    padding: 16,
    marginVertical: 8,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  weeklyReportCard: {
    padding: 16,
    marginVertical: 8,
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reportItem: {
    width: '47%',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  badgeCard: {
    padding: 16,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  badgeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
  },
  logCard: {
    padding: 14,
    marginVertical: 6,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  iconActionBtn: {
    padding: 6,
  },
  logNotesBox: {
    marginTop: 10,
    padding: 8,
    borderRadius: 6,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalScroll: {
    padding: 20,
  },
  modalCard: {
    padding: 16,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  previewDurationBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ratingBtn: {
    width: '18%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  notesInput: {
    height: 72,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    fontSize: 14,
    textAlignVertical: 'top',
  },
});

export default SleepTrackerScreen;
