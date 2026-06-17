import React from 'react';
import { StyleSheet, View, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Polygon, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { formatDisplayDate } from '../utils/dates';
import { RootStackParamList } from '../navigation/types';
import { ProgressLog } from '../models/fitness';

type ProgressScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ProgressScreen: React.FC = () => {
  const { state, deleteProgressLog } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation<ProgressScreenNavProp>();

  const progressLogs = state.progressLogs;

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

  const getWeeklyCorrelationData = () => {
    const data: { weekLabel: string; avgWeight: number; totalVolume: number }[] = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const start = new Date(today);
      start.setDate(today.getDate() - (i + 1) * 7 + 1);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(today);
      end.setDate(today.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);
      
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      
      const weeklyWeights = progressLogs
        .filter(log => log.date >= startStr && log.date <= endStr)
        .map(log => log.weight);
      
      let avgWeight = 0;
      if (weeklyWeights.length > 0) {
        avgWeight = weeklyWeights.reduce((a, b) => a + b, 0) / weeklyWeights.length;
      } else {
        const priorLogs = progressLogs.filter(log => log.date < startStr);
        if (priorLogs.length > 0) {
          const sorted = [...priorLogs].sort((a, b) => b.date.localeCompare(a.date));
          avgWeight = sorted[0].weight;
        } else {
          avgWeight = state.profile?.weight || 70;
        }
      }
      
      let totalVolume = 0;
      state.workouts
        .filter(w => w.date >= startStr && w.date <= endStr)
        .forEach(w => {
          w.exercises.forEach(ex => {
            ex.sets.forEach(s => {
              if (s.completed) {
                totalVolume += s.reps * s.weight;
              }
            });
          });
        });
        
      const weekLabel = `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')}`;
      data.push({ weekLabel, avgWeight, totalVolume });
    }
    return data;
  };

  const renderRadarChart = () => {
    const latestLogWithMeas = [...progressLogs]
      .sort((a, b) => b.date.localeCompare(a.date))
      .find((l) => l.measurements && (l.measurements.chest || l.measurements.waist || l.measurements.bicepsL || l.measurements.thighL));
    
    const hasRealMeas = !!latestLogWithMeas;
    const currentWeight = progressLogs.length > 0 ? progressLogs[0].weight : (state.profile?.weight || 70);
    
    const chestVal = latestLogWithMeas?.measurements?.chest || 0;
    
    const bicepsL = latestLogWithMeas?.measurements?.bicepsL || 0;
    const bicepsR = latestLogWithMeas?.measurements?.bicepsR || 0;
    const armsVal = (bicepsL && bicepsR) ? ((bicepsL + bicepsR) / 2) : (bicepsL || bicepsR || 0);

    const thighL = latestLogWithMeas?.measurements?.thighL || 0;
    const thighR = latestLogWithMeas?.measurements?.thighR || 0;
    const legsVal = (thighL && thighR) ? ((thighL + thighR) / 2) : (thighL || thighR || 0);

    const waistVal = latestLogWithMeas?.measurements?.waist || 0;
    const weightVal = latestLogWithMeas?.weight || currentWeight;

    const R = 70;
    const X0 = 150;
    const Y0 = 100;
    const angles = [
      -Math.PI / 2,
      -Math.PI / 2 + (2 * Math.PI) / 5,
      -Math.PI / 2 + (4 * Math.PI) / 5,
      -Math.PI / 2 + (6 * Math.PI) / 5,
      -Math.PI / 2 + (8 * Math.PI) / 5,
    ];

    const values = [chestVal, armsVal, legsVal, waistVal, weightVal];
    const mins = [60, 20, 35, 50, 40];
    const maxs = [140, 55, 80, 120, 130];
    const names = ['Chest', 'Arms', 'Legs', 'Waist', 'Weight'];
    const units = ['cm', 'cm', 'cm', 'cm', 'kg'];

    const normalizedScores = values.map((v, i) => {
      if (v === 0) return 0;
      const score = ((v - mins[i]) / (maxs[i] - mins[i])) * 100;
      return Math.max(0, Math.min(100, score));
    });

    const userPoints = angles.map((angle, idx) => {
      const score = normalizedScores[idx];
      const x = X0 + (score / 100) * R * Math.cos(angle);
      const y = Y0 + (score / 100) * R * Math.sin(angle);
      return { x, y };
    });

    const userPointsStr = userPoints.map(p => `${p.x},${p.y}`).join(' ');

    const getLabelCoords = (index: number) => {
      const angle = angles[index];
      const offset = index === 0 ? 18 : 10;
      const x = X0 + (R + offset) * Math.cos(angle);
      const y = Y0 + (R + offset) * Math.sin(angle);
      
      let textAnchor: 'middle' | 'start' | 'end' = 'middle';
      if (index === 1 || index === 2) textAnchor = 'start';
      if (index === 3 || index === 4) textAnchor = 'end';
      
      return { x, y, textAnchor };
    };

    const gridPentagons = [0.2, 0.4, 0.6, 0.8, 1.0].map((f) => {
      return angles.map((angle) => {
        const x = X0 + f * R * Math.cos(angle);
        const y = Y0 + f * R * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
    });

    return (
      <Card variant="glass" style={styles.chartCard}>
        <AppText variant="label" color="textSecondary" style={styles.graphTitle}>
          Body Stats Radar
        </AppText>

        <View style={styles.svgContainer}>
          <Svg width="100%" height={210} viewBox="0 0 300 210">
            {gridPentagons.map((pointsStr, idx) => (
              <Polygon
                key={idx}
                points={pointsStr}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
            ))}

            {angles.map((angle, idx) => {
              const x = X0 + R * Math.cos(angle);
              const y = Y0 + R * Math.sin(angle);
              return (
                <Line
                  key={idx}
                  x1={X0}
                  y1={Y0}
                  x2={x}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="1"
                />
              );
            })}

            <Polygon
              points={userPointsStr}
              fill={`${theme.primary}33`}
              stroke={theme.primary}
              strokeWidth="2.5"
            />

            {userPoints.map((p, idx) => (
              <Circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="4"
                fill={theme.background}
                stroke={theme.primary}
                strokeWidth="2"
              />
            ))}

            {angles.map((_, idx) => {
              const coords = getLabelCoords(idx);
              return (
                <React.Fragment key={idx}>
                  <SvgText
                    x={coords.x}
                    y={coords.y - 4}
                    fill={theme.text}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor={coords.textAnchor}
                  >
                    {names[idx]}
                  </SvgText>
                  <SvgText
                    x={coords.x}
                    y={coords.y + 7}
                    fill={theme.textMuted}
                    fontSize="9.5"
                    textAnchor={coords.textAnchor}
                  >
                    {values[idx] === 0 ? '0' : values[idx].toFixed(1)} {units[idx]}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </View>
      </Card>
    );
  };

  const renderCorrelationGraph = () => {
    const weeklyData = getWeeklyCorrelationData();
    const weights = weeklyData.map(d => d.avgWeight).filter(w => w > 0);
    const volumes = weeklyData.map(d => d.totalVolume);
    
    let minW = weights.length > 0 ? Math.min(...weights) - 1.5 : 55;
    let maxW = weights.length > 0 ? Math.max(...weights) + 1.5 : 85;
    if (minW === maxW) {
      minW -= 5;
      maxW += 5;
    }
    const wRange = maxW - minW;

    const maxV = Math.max(...volumes, 2000);
    const minV = 0;
    const vRange = maxV - minV;

    const width = 300;
    const height = 135;
    const paddingLeft = 35;
    const paddingRight = 40;
    const paddingTop = 15;
    const paddingBottom = 25;

    const points = weeklyData.map((d, idx) => {
      const x = paddingLeft + idx * ((width - paddingLeft - paddingRight) / 5);
      const yW = height - paddingBottom - ((d.avgWeight - minW) * (height - paddingTop - paddingBottom)) / wRange;
      const yV = height - paddingBottom - ((d.totalVolume - minV) * (height - paddingTop - paddingBottom)) / vRange;
      return { x, yW, yV, weight: d.avgWeight, volume: d.totalVolume, label: d.weekLabel };
    });

    let weightPath = '';
    let volumePath = '';
    let volumeAreaPath = `M ${points[0].x} ${height - paddingBottom}`;

    points.forEach((p, idx) => {
      if (idx === 0) {
        weightPath = `M ${p.x} ${p.yW}`;
        volumePath = `M ${p.x} ${p.yV}`;
      } else {
        weightPath += ` L ${p.x} ${p.yW}`;
        volumePath += ` L ${p.x} ${p.yV}`;
      }
      volumeAreaPath += ` L ${p.x} ${p.yV}`;
      if (idx === points.length - 1) {
        volumeAreaPath += ` L ${p.x} ${height - paddingBottom} Z`;
      }
    });

    const leftTicks = [maxW, (minW + maxW) / 2, minW];
    const rightTicks = [maxV, maxV / 2, minV];

    return (
      <Card variant="glass" style={styles.chartCard}>
        <AppText variant="label" color="textSecondary" style={styles.graphTitle}>
          Strength & Weight Correlation (6 Wks)
        </AppText>
        
        <View style={styles.svgContainer}>
          <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <Defs>
              <LinearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.25" />
                <Stop offset="100%" stopColor={theme.primary} stopOpacity="0.01" />
              </LinearGradient>
            </Defs>

            {/* Left Y-axis line (Weight) */}
            <Line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />

            {/* Right Y-axis line (Volume) */}
            <Line x1={width - paddingRight} y1={paddingTop} x2={width - paddingRight} y2={height - paddingBottom} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />

            {/* X-axis line */}
            <Line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />

            {/* Left Y-ticks & Weight labels (Amber) */}
            {leftTicks.map((val, idx) => {
              const y = height - paddingBottom - ((val - minW) * (height - paddingTop - paddingBottom)) / wRange;
              return (
                <React.Fragment key={idx}>
                  <Line x1={paddingLeft - 3} y1={y} x2={paddingLeft} y2={y} stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                  <SvgText x={paddingLeft - 6} y={y + 3} fill={theme.secondary} fontSize="8" textAnchor="end">
                    {val.toFixed(0)}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {/* Right Y-ticks & Volume labels (Teal) */}
            {rightTicks.map((val, idx) => {
              const y = height - paddingBottom - ((val - minV) * (height - paddingTop - paddingBottom)) / vRange;
              return (
                <React.Fragment key={idx}>
                  <Line x1={width - paddingRight} y1={y} x2={width - paddingRight + 3} y2={y} stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                  <SvgText x={width - paddingRight + 6} y={y + 3} fill={theme.primary} fontSize="8" textAnchor="start">
                    {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {/* Volume Area and line */}
            <Path d={volumeAreaPath} fill="url(#volumeGrad)" />
            <Path d={volumePath} fill="none" stroke={theme.primary} strokeWidth="2.5" />

            {/* Weight Line */}
            <Path d={weightPath} fill="none" stroke={theme.secondary} strokeWidth="3" />

            {/* Weight marker dots & bottom X-labels */}
            {points.map((p, idx) => (
              <React.Fragment key={idx}>
                {/* Weight Dot */}
                <Circle
                  cx={p.x}
                  cy={p.yW}
                  r="4.5"
                  fill={theme.background}
                  stroke={theme.secondary}
                  strokeWidth="2"
                />

                {/* X label date */}
                <SvgText x={p.x} y={height - 8} fill={theme.textMuted} fontSize="8.5" textAnchor="middle">
                  {p.label}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, { backgroundColor: theme.secondary }]} />
            <AppText variant="caption" color="textSecondary">Weight (kg)</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, { backgroundColor: theme.primary }]} />
            <AppText variant="caption" color="textSecondary">Lifting Volume (kg)</AppText>
          </View>
        </View>
      </Card>
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
    const height = 135;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 25;

    const points = lastFiveLogs.map((log, index) => {
      const x = paddingLeft + (index * (width - paddingLeft - paddingRight)) / (lastFiveLogs.length - 1);
      const y = height - paddingBottom - ((log.weight - minWeight) * (height - paddingTop - paddingBottom)) / range;
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

    const yTicks = [maxWeight, (minWeight + maxWeight) / 2, minWeight];

    return (
      <Card variant="normal" style={styles.graphCard}>
        <AppText variant="label" color="textSecondary" style={styles.graphTitle}>Weight Trend (Past 5 logs)</AppText>
        <View style={styles.svgContainer}>
          <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Draw Y-axis line */}
            <Line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
            
            {/* Draw X-axis line */}
            <Line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />

            {/* Y-axis Ticks & Labels */}
            {yTicks.map((val, idx) => {
              const y = height - paddingBottom - ((val - minWeight) * (height - paddingTop - paddingBottom)) / range;
              return (
                <React.Fragment key={idx}>
                  <Line x1={paddingLeft - 3} y1={y} x2={paddingLeft} y2={y} stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                  <SvgText x={paddingLeft - 6} y={y + 3} fill={theme.textMuted} fontSize="8" textAnchor="end">
                    {val.toFixed(1)}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {/* Draw connecting line */}
            <Path d={pathD} fill="none" stroke={theme.primary} strokeWidth="3" />
            
            {/* Draw data points, values, and dates */}
            {points.map((p, idx) => (
              <React.Fragment key={idx}>
                {/* Weight value above point */}
                <SvgText x={p.x} y={p.y - 8} fill={theme.text} fontSize="9" fontWeight="bold" textAnchor="middle">
                  {p.weight}
                </SvgText>

                {/* Point circle */}
                <Circle cx={p.x} cy={p.y} r="4.5" fill={theme.background} stroke={theme.primary} strokeWidth="2" />

                {/* Date below X-axis */}
                <SvgText x={p.x} y={height - 8} fill={theme.textMuted} fontSize="8.5" textAnchor="middle">
                  {p.date.split('-').slice(1).join('/')}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </View>
      </Card>
    );
  };


  return (
    <Screen scrollable>
      {/* Dynamic weight graph */}
      {renderTrendGraph()}

      {/* Strength vs. Weight Correlation */}
      {renderCorrelationGraph()}

      {/* Body Stats Radar Chart */}
      {renderRadarChart()}

      {/* Track button */}
      <View style={styles.actionRow}>
        <PrimaryButton 
          title="Record New Measurements" 
          onPress={() => navigation.navigate('AddProgressLog')} 
          style={styles.actionBtn}
        />
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
  graphEmptyCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  graphEmptyText: {
    textAlign: 'center',
    marginTop: 8,
  },
  chartCard: {
    padding: 16,
    marginVertical: 8,
  },

  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  actionRow: {
    marginVertical: 6,
  },
  actionBtn: {
    width: '100%',
  },
  sectionHeader: {
    marginBottom: 8,
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
