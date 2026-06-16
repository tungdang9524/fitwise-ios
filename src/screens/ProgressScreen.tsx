import React from 'react';
import { StyleSheet, View, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { formatDisplayDate } from '../utils/dates';
import { RootStackParamList } from '../navigation/types';
import { ProgressLog, ReminderSetting } from '../models/fitness';

type ProgressScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ProgressScreen: React.FC = () => {
  const { state, updateReminder, deleteProgressLog } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<ProgressScreenNavProp>();

  const progressLogs = state.progressLogs;
  const reminders = state.reminders;

  const handleReminderToggle = (reminder: ReminderSetting, val: boolean) => {
    updateReminder({
      ...reminder,
      enabled: val,
    });
  };

  const handleDeleteLog = (id: string, date: string) => {
    Alert.alert(
      'Delete Log',
      `Are you sure you want to delete progress log for ${formatDisplayDate(date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteProgressLog(id) },
      ]
    );
  };

  // Render weight history SVG graph (take up to 5 last entries, reverse to ascending order)
  const renderTrendGraph = () => {
    if (progressLogs.length < 2) {
      return (
        <Card variant="glass" style={styles.graphEmptyCard}>
          <Ionicons name="trending-up" size={32} color={theme.textMuted} />
          <AppText variant="caption" color="textSecondary" style={styles.graphEmptyText}>
            Log at least 2 weight entries to see weight change trends.
          </AppText>
        </Card>
      );
    }

    const lastFiveLogs = [...progressLogs].slice(0, 5).reverse();
    const weights = lastFiveLogs.map((l) => l.weight);
    const minWeight = Math.min(...weights) - 1;
    const maxWeight = Math.max(...weights) + 1;
    const range = maxWeight - minWeight;

    // SVG Layout Constants
    const width = 300;
    const height = 120;
    const padding = 20;

    const points = lastFiveLogs.map((log, index) => {
      const x = padding + (index * (width - padding * 2)) / (lastFiveLogs.length - 1);
      const y = height - padding - ((log.weight - minWeight) * (height - padding * 2)) / range;
      return { x, y, weight: log.weight, date: log.date };
    });

    let pathD = '';
    points.forEach((p, idx) => {
      if (idx === 0) {
        pathD = `M ${p.x} ${p.y}`;
      } else {
        pathD += ` L ${p.x} ${p.y}`;
      }
    });

    return (
      <Card variant="normal" style={styles.graphCard}>
        <AppText variant="label" color="textSecondary" style={styles.graphTitle}>Weight Trend (Past 5 logs)</AppText>
        <View style={styles.svgContainer}>
          <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Draw connecting line */}
            <Path d={pathD} fill="none" stroke={theme.primary} strokeWidth="3" />
            
            {/* Draw data points */}
            {points.map((p, idx) => (
              <React.Fragment key={idx}>
                <Circle cx={p.x} cy={p.y} r="5" fill={theme.background} stroke={theme.primary} strokeWidth="2.5" />
              </React.Fragment>
            ))}
          </Svg>
        </View>
        <View style={styles.graphXLabelRow}>
          {points.map((p, idx) => (
            <View key={idx} style={styles.graphXLabelCol}>
              <AppText variant="caption" style={styles.graphWeightText}>{p.weight} kg</AppText>
              <AppText variant="caption" color="textMuted" style={styles.graphDateText}>
                {p.date.split('-').slice(1).join('/')}
              </AppText>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'workout': return 'barbell';
      case 'meal': return 'nutrition';
      case 'water': return 'water';
      default: return 'alarm';
    }
  };

  const getReminderColor = (type: string) => {
    switch (type) {
      case 'workout': return theme.primary;
      case 'meal': return theme.secondary;
      case 'water': return theme.accent;
      default: return theme.text;
    }
  };

  return (
    <Screen scrollable>
      {/* Dynamic weight graph */}
      {renderTrendGraph()}

      {/* Track button */}
      <View style={styles.actionRow}>
        <PrimaryButton 
          title="Record New Measurements" 
          onPress={() => navigation.navigate('AddProgressLog')} 
          style={styles.actionBtn}
        />
      </View>

      {/* Reminders list panel */}
      <View style={styles.remindersSection}>
        <AppText variant="h3" style={styles.sectionHeader}>Daily Reminders</AppText>
        <Card variant="glass" style={styles.remindersCard}>
          {reminders.map((rem) => {
            const iconColor = getReminderColor(rem.type);
            return (
              <View key={rem.id} style={styles.reminderRow}>
                <View style={[styles.reminderIconWrap, { backgroundColor: `${iconColor}1a` }]}>
                  <Ionicons name={getReminderIcon(rem.type)} size={20} color={iconColor} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyBold">{rem.title}</AppText>
                  <AppText variant="caption" color="textSecondary">{rem.time}</AppText>
                </View>
                <Switch 
                  value={rem.enabled} 
                  onValueChange={(val) => handleReminderToggle(rem, val)} 
                  trackColor={{ false: theme.surfaceElevated, true: theme.primary }}
                  thumbColor={rem.enabled ? '#0c0f12' : theme.textMuted}
                />
              </View>
            );
          })}
        </Card>
      </View>

      {/* Progress history listing */}
      <View style={styles.historySection}>
        <AppText variant="h3" style={styles.sectionHeader}>Logs History</AppText>
        {progressLogs.length === 0 ? (
          <Card variant="glass" style={styles.emptyLogsCard}>
            <Ionicons name="scale-outline" size={36} color={theme.textMuted} />
            <AppText variant="body" color="textSecondary" style={styles.emptyLogsText}>
              No progress logs recorded yet.
            </AppText>
          </Card>
        ) : (
          progressLogs.map((log) => (
            <Card key={log.id} variant="glass" style={styles.logCard}>
              <View style={styles.logHeader}>
                <AppText variant="bodyBold">{formatDisplayDate(log.date)}</AppText>
                <TouchableOpacity onPress={() => handleDeleteLog(log.id, log.date)}>
                  <Ionicons name="trash-outline" size={16} color={theme.error} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.logGrid}>
                <View style={styles.gridItem}>
                  <AppText variant="caption" color="textMuted">Weight</AppText>
                  <AppText variant="bodyBold">{log.weight} kg</AppText>
                </View>
                {log.measurements?.waist && (
                  <View style={styles.gridItem}>
                    <AppText variant="caption" color="textMuted">Waist</AppText>
                    <AppText variant="bodyBold">{log.measurements.waist} cm</AppText>
                  </View>
                )}
                {log.measurements?.chest && (
                  <View style={styles.gridItem}>
                    <AppText variant="caption" color="textMuted">Chest</AppText>
                    <AppText variant="bodyBold">{log.measurements.chest} cm</AppText>
                  </View>
                )}
                {log.measurements?.bicepsL && (
                  <View style={styles.gridItem}>
                    <AppText variant="caption" color="textMuted">Biceps</AppText>
                    <AppText variant="bodyBold">{log.measurements.bicepsL} cm</AppText>
                  </View>
                )}
                {log.measurements?.thighL && (
                  <View style={styles.gridItem}>
                    <AppText variant="caption" color="textMuted">Thighs</AppText>
                    <AppText variant="bodyBold">{log.measurements.thighL} cm</AppText>
                  </View>
                )}
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  graphCard: {
    padding: 16,
    marginVertical: 12,
  },
  graphTitle: {
    marginBottom: 12,
  },
  svgContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  graphXLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  graphXLabelCol: {
    alignItems: 'center',
  },
  graphWeightText: {
    fontWeight: 'bold',
  },
  graphDateText: {
    fontSize: 9,
  },
  graphEmptyCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  graphEmptyText: {
    textAlign: 'center',
    marginTop: 8,
  },
  actionRow: {
    marginVertical: 6,
  },
  actionBtn: {
    width: '100%',
  },
  remindersSection: {
    marginTop: 18,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  remindersCard: {
    padding: 16,
    gap: 14,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  historySection: {
    marginTop: 24,
    paddingBottom: 20,
  },
  emptyLogsCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyLogsText: {
    textAlign: 'center',
    marginTop: 8,
  },
  logCard: {
    marginVertical: 6,
    padding: 14,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 8,
    marginBottom: 8,
  },
  logGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '28%',
  },
});
export default ProgressScreen;
