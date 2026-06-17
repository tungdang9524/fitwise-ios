import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
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

export const WaterTrackerScreen: React.FC = () => {
  const { state, addWater, deleteWaterLog, setWaterGoal } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const todayStr = getLocalDateString();
  const waterGoal = state.waterGoal || 2000;
  
  // Custom goal input state
  const [goalInput, setGoalInput] = useState(String(waterGoal));
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Custom log amount state
  const [customAmount, setCustomAmount] = useState('');

  // 1. Calculations
  const todayLogs = useMemo(() => {
    return (state.waterLogs || []).filter((l) => l.date === todayStr);
  }, [state.waterLogs, todayStr]);

  const todayTotal = useMemo(() => {
    return todayLogs.reduce((sum, l) => sum + l.amount, 0);
  }, [todayLogs]);

  const waterProgress = Math.min(1.0, todayTotal / waterGoal);

  // Past 7 days dates
  const last7Days = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push(getLocalDateString(d));
    }
    return list;
  }, []);

  // Past 7 days totals
  const dailyIntake = useMemo(() => {
    return last7Days.map((dateStr) => {
      const logs = (state.waterLogs || []).filter((l) => l.date === dateStr);
      const sum = logs.reduce((acc, l) => acc + l.amount, 0);
      const dateObj = new Date(dateStr);
      return {
        dateStr,
        amount: sum,
        dayName: dateObj.toLocaleDateString(undefined, { weekday: 'short' }),
      };
    });
  }, [state.waterLogs, last7Days]);

  const weeklyAverage = useMemo(() => {
    const sum = dailyIntake.reduce((acc, d) => acc + d.amount, 0);
    return Math.round(sum / 7);
  }, [dailyIntake]);

  // Max daily amount for chart scaling
  const maxIntakeValue = useMemo(() => {
    const maxVal = Math.max(...dailyIntake.map((d) => d.amount), waterGoal);
    return maxVal > 0 ? maxVal : 2000;
  }, [dailyIntake, waterGoal]);

  // Streak calculation
  const waterStreak = useMemo(() => {
    if (!state.waterLogs || state.waterLogs.length === 0) return 0;
    
    const totalsByDate: Record<string, number> = {};
    state.waterLogs.forEach((log) => {
      totalsByDate[log.date] = (totalsByDate[log.date] || 0) + log.amount;
    });

    const completedDates = new Set(
      Object.keys(totalsByDate).filter((date) => totalsByDate[date] >= waterGoal)
    );

    if (completedDates.size === 0) return 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    if (!completedDates.has(todayStr) && !completedDates.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
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
    return streak;
  }, [state.waterLogs, waterGoal, todayStr]);

  // Achievements list
  const waterAchievements = [
    { id: 'hydration_starter', name: 'Hydration Starter', desc: 'Successfully hit your daily water goal for 7 days.', icon: 'water', color: '#00e5ff' },
    { id: 'hydration_master', name: 'Hydration Master', desc: 'Successfully hit your daily water goal for 30 days.', icon: 'trophy', color: '#ffd700' },
  ];

  const unlockedSet = new Set(state.unlockedAchievements || []);

  // 2. Actions
  const handleQuickAdd = (amount: number) => {
    addWater(amount, todayStr);
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid water volume in ml.');
      return;
    }
    addWater(amount, todayStr);
    setCustomAmount('');
  };

  const handleSaveGoal = () => {
    const newGoal = parseInt(goalInput);
    if (isNaN(newGoal) || newGoal < 500) {
      Alert.alert('Invalid Goal', 'Daily goal must be at least 500 ml.');
      return;
    }
    setWaterGoal(newGoal);
    setIsEditingGoal(false);
  };

  const handleDeleteLog = (id: string, amount: number) => {
    Alert.alert(
      'Delete Water Log',
      `Delete log of ${amount} ml?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteWaterLog(id) },
      ]
    );
  };

  return (
    <Screen scrollable>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Water Tracker</AppText>
      </View>

      {/* Hero Hydration Card */}
      <Card variant="glass" style={styles.heroCard}>
        <View style={styles.heroRow}>
          {/* Wave visual indicator */}
          <View style={[styles.waterCircle, { borderColor: `${theme.accent}50`, backgroundColor: `${theme.accent}08` }]}>
            <Ionicons name="water" size={32} color={theme.accent} />
            <AppText variant="h2" color="accent" style={styles.circlePercentage}>
              {Math.round(waterProgress * 100)}%
            </AppText>
          </View>

          <View style={styles.heroInfo}>
            <AppText variant="caption" color="textMuted">TODAY'S HYDRATION</AppText>
            <AppText variant="h1" style={styles.volumeText}>
              {todayTotal} <AppText variant="body" color="textSecondary">/ {waterGoal} ml</AppText>
            </AppText>

            {/* Goal modifier */}
            {isEditingGoal ? (
              <View style={styles.goalEditRow}>
                <TextInput
                  style={[styles.goalInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                  keyboardType="numeric"
                  value={goalInput}
                  onChangeText={setGoalInput}
                />
                <TouchableOpacity onPress={handleSaveGoal} style={[styles.goalBtn, { backgroundColor: theme.primary }]}>
                  <Ionicons name="checkmark" size={16} color="#0c0f12" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditingGoal(false)} style={[styles.goalBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                  <Ionicons name="close" size={16} color={theme.text} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setIsEditingGoal(true)} style={styles.goalDisplayRow}>
                <AppText variant="caption" color="textSecondary">Goal: {waterGoal} ml</AppText>
                <Ionicons name="create-outline" size={14} color={theme.textMuted} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ProgressBar progress={waterProgress} color={theme.accent} style={styles.heroProgress} />

        {todayTotal >= waterGoal && (
          <AppText variant="caption" color="accent" style={styles.goalAchievedText}>
            🎉 Daily goal completed! Hydration optimal.
          </AppText>
        )}
      </Card>

      {/* Streak Badge & Weekly Average */}
      <View style={styles.streakSection}>
        <View style={[styles.streakBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="water" size={20} color={theme.accent} />
          <View>
            <AppText variant="bodyBold" color="accent">{waterStreak} Days</AppText>
            <AppText variant="caption" color="textSecondary">Hydration Streak</AppText>
          </View>
        </View>
        <View style={[styles.streakBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="stats-chart" size={20} color={theme.primary} />
          <View>
            <AppText variant="bodyBold">{weeklyAverage} ml</AppText>
            <AppText variant="caption" color="textSecondary">Weekly Avg</AppText>
          </View>
        </View>
      </View>

      {/* Log Buttons */}
      <View style={styles.logButtonsSection}>
        <AppText variant="h3" style={styles.sectionTitle}>Quick Logger</AppText>
        <View style={styles.quickAddRow}>
          <TouchableOpacity onPress={() => handleQuickAdd(250)} style={[styles.quickAddBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppText variant="bodyBold" color="accent">+250ml</AppText>
            <AppText variant="caption" color="textMuted">Cup</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleQuickAdd(500)} style={[styles.quickAddBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppText variant="bodyBold" color="accent">+500ml</AppText>
            <AppText variant="caption" color="textMuted">Bottle</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleQuickAdd(1000)} style={[styles.quickAddBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppText variant="bodyBold" color="accent">+1000ml</AppText>
            <AppText variant="caption" color="textMuted">Shaker</AppText>
          </TouchableOpacity>
        </View>

        {/* Custom Logger */}
        <Card variant="normal" style={styles.customAddCard}>
          <TextInput
            style={[styles.customAddInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="Custom amount (ml)"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
            value={customAmount}
            onChangeText={setCustomAmount}
          />
          <TouchableOpacity onPress={handleCustomAdd} style={[styles.customAddBtn, { backgroundColor: theme.accent }]}>
            <AppText variant="bodyBold" style={{ color: '#0c0f12' }}>Add</AppText>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Past 7 days Chart */}
      <View style={styles.chartSection}>
        <AppText variant="h3" style={styles.sectionTitle}>7-Day Fluid History</AppText>
        <Card variant="glass" style={styles.chartCard}>
          <View style={styles.chartBarsContainer}>
            {dailyIntake.map((day) => {
              const heightPercent = Math.min(100, Math.round((day.amount / maxIntakeValue) * 100));
              const goalPercent = Math.min(100, Math.round((waterGoal / maxIntakeValue) * 100));
              const metGoal = day.amount >= waterGoal;

              return (
                <View key={day.dateStr} style={styles.chartBarItem}>
                  <View style={styles.barContainer}>
                    <View style={[styles.barTrack, { backgroundColor: 'rgba(255,255,255,0.03)' }]} />
                    <View 
                      style={[
                        styles.barFill, 
                        { 
                          height: `${heightPercent}%`, 
                          backgroundColor: metGoal ? theme.accent : 'rgba(0, 229, 255, 0.3)' 
                        }
                      ]} 
                    />
                    
                    {/* Goal Line indicator inside bar container */}
                    <View style={[styles.goalIndicatorLine, { bottom: `${goalPercent}%`, backgroundColor: theme.textMuted }]} />
                  </View>
                  <AppText variant="caption" color="textSecondary" style={styles.chartValueText}>
                    {day.amount > 0 ? `${(day.amount / 1000).toFixed(1)}L` : '0'}
                  </AppText>
                  <AppText variant="caption" color="textMuted" style={styles.chartLabel}>
                    {day.dayName}
                  </AppText>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Today's log list */}
      <View style={styles.historySection}>
        <AppText variant="h3" style={styles.sectionTitle}>Today's Water Log</AppText>
        {todayLogs.length === 0 ? (
          <Card variant="glass" style={styles.emptyLogsCard}>
            <AppText variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
              No water logged yet today. Keep up hydration habits!
            </AppText>
          </Card>
        ) : (
          todayLogs.map((log) => (
            <Card key={log.id} variant="glass" style={styles.logItem}>
              <View style={styles.logRow}>
                <View style={styles.logIconWrap}>
                  <Ionicons name="water-outline" size={18} color={theme.accent} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyBold">{log.amount} ml</AppText>
                  <AppText variant="caption" color="textMuted">Logged today</AppText>
                </View>
                <TouchableOpacity onPress={() => handleDeleteLog(log.id, log.amount)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={16} color={theme.error} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Hydration Achievements */}
      <View style={[styles.achSection, { marginBottom: 30 }]}>
        <AppText variant="h3" style={styles.sectionTitle}>Hydration Achievements</AppText>
        <Card variant="glass" style={styles.achCard}>
          {waterAchievements.map((ach) => {
            const isUnlocked = unlockedSet.has(ach.id);
            return (
              <View key={ach.id} style={[styles.achRow, !isUnlocked && styles.lockedAch]}>
                <View style={[styles.achIconWrap, { backgroundColor: isUnlocked ? `${ach.color}15` : '#1c232d', borderColor: isUnlocked ? ach.color : '#334155' }]}>
                  <Ionicons name={ach.icon as any} size={20} color={isUnlocked ? ach.color : '#64748b'} />
                </View>
                <View style={styles.flex}>
                  <View style={styles.achTitleRow}>
                    <AppText variant="bodyBold" style={{ color: isUnlocked ? theme.text : '#64748b' }}>{ach.name}</AppText>
                    {isUnlocked ? (
                      <AppText variant="caption" color="accent" style={{ fontWeight: 'bold' }}>UNLOCKED</AppText>
                    ) : (
                      <AppText variant="caption" color="textMuted">LOCKED</AppText>
                    )}
                  </View>
                  <AppText variant="caption" color="textSecondary">{ach.desc}</AppText>
                </View>
              </View>
            );
          })}
        </Card>
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
  heroCard: {
    padding: 16,
    marginVertical: 8,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  waterCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  circlePercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  volumeText: {
    fontSize: 28,
    lineHeight: 32,
  },
  goalDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  goalEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  goalInput: {
    width: 80,
    height: 32,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 13,
  },
  goalBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroProgress: {
    marginTop: 16,
    height: 8,
  },
  goalAchievedText: {
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  streakSection: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  streakBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  logButtonsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAddBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  customAddCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    marginTop: 8,
  },
  customAddInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  customAddBtn: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartSection: {
    marginTop: 20,
  },
  chartCard: {
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    height: 160,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  chartBarItem: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barContainer: {
    flex: 1,
    width: 14,
    borderRadius: 7,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  barTrack: {
    ...StyleSheet.absoluteFillObject,
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  goalIndicatorLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.5,
  },
  chartValueText: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: 'bold',
  },
  chartLabel: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: 'bold',
  },
  historySection: {
    marginTop: 20,
  },
  emptyLogsCard: {
    padding: 16,
    alignItems: 'center',
  },
  logItem: {
    marginVertical: 4,
    padding: 12,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  achSection: {
    marginTop: 20,
  },
  achCard: {
    padding: 16,
    gap: 16,
  },
  achRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  lockedAch: {
    opacity: 0.5,
  },
  achIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
});

export default WaterTrackerScreen;
