import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';

import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { useFitness } from '../store/FitnessStore';
import { useTheme } from '../theme/ThemeProvider';
import { formatDisplayDate } from '../utils/dates';
import { calculateBodyVisualizerData, MuscleSubGroup, getMuscleSubGroup } from '../utils/muscleMapping';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Sparkline: React.FC<{ history: number[]; color: string }> = ({ history, color }) => {
  if (!history || history.length === 0) return null;
  const width = SCREEN_WIDTH - 64;
  const height = 80;
  const padding = 12;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = history.map((score, index) => {
    const x = padding + (index / (history.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((score - 20) / 80) * chartHeight; // scale 20 to 100
    return { x, y, score };
  });

  const pathD = points.reduce((acc, p, index) => {
    return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <View style={styles.sparklineWrap}>
      <Svg width={width} height={height}>
        {/* Horizontal grid lines */}
        <Path d={`M ${padding} ${padding} L ${width - padding} ${padding}`} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <Path d={`M ${padding} ${padding + chartHeight} L ${width - padding} ${padding + chartHeight}`} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        
        {/* Sparkline curve */}
        <Path d={pathD} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        {points.map((p, idx) => (
          <Circle key={idx} cx={p.x} cy={p.y} r="5" fill={color} stroke="#0c0f12" strokeWidth="2" />
        ))}
      </Svg>
      {/* Month Labels */}
      <View style={styles.sparklineMonthsRow}>
        {months.map((m, idx) => (
          <AppText key={idx} variant="caption" color="textMuted" style={{ fontSize: 9 }}>
            {m}
          </AppText>
        ))}
      </View>
    </View>
  );
};

export const BodyVisualizerScreen: React.FC = () => {
  const { state } = useFitness();
  const { theme } = useTheme();
  const navigation = useNavigation();

  // Local State
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleSubGroup>('Chest');

  // Compute all analytics offline
  const data = useMemo(() => {
    return calculateBodyVisualizerData(
      state.workouts,
      state.customExercises || [],
      state.profile,
      state.xp || 0,
      state.level || 1
    );
  }, [state.workouts, state.customExercises, state.profile, state.xp, state.level]);

  // Color Helper based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00e5ff'; // Elite Cyan
    if (score >= 60) return '#aeff00'; // Strong Electric Lime
    if (score >= 40) return '#f97316'; // Developing Orange
    if (score >= 20) return '#ef4444'; // Weak Red
    return '#64748b'; // Very Weak Gray
  };

  const selectedDetails = data.muscleGroups[selectedMuscle];

  return (
    <Screen scrollable>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>Body Character Visualizer</AppText>
      </View>

      {/* RPG Character Summary Card */}
      <Card variant="glass" style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `${theme.primary}12`, borderColor: theme.primary }]}>
            <Ionicons name="body" size={26} color={theme.primary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="h3">{data.title}</AppText>
            <AppText variant="caption" color="textSecondary">
              Level {data.level} Athlete • Dynamic Character Stats
            </AppText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <AppText variant="h1" color="primary" style={styles.bigScoreText}>
              {data.overallScore}
            </AppText>
            <AppText variant="caption" color="textMuted">OVERALL SCORE</AppText>
          </View>
        </View>
      </Card>

      {/* Interactive Human Mannequin SVG Display */}
      <Card variant="glass" style={styles.mannequinCard}>
        <View style={styles.mannequinRow}>
          {/* Front Mannequin */}
          <View style={styles.mannequinCol}>
            <AppText variant="caption" color="textMuted" style={styles.mannequinLabel}>FRONT VIEW</AppText>
            <Svg width="135" height="260" viewBox="0 0 100 240">
              {/* Head Outline */}
              <Circle cx="50" cy="16" r="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              {/* Neck Outline */}
              <Path d="M47,21 L53,21 L53,28 L47,28 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              
              {/* Front Silhouette Outline */}
              <Path
                d="M50,28 L38,32 L30,38 L25,62 L22,96 L27,99 L31,78 L35,92 L35,152 L35,225 L46,225 L48,155 L50,150 L52,155 L54,225 L65,225 L65,152 L65,92 L69,78 L73,99 L78,96 L75,62 L70,38 L62,32 Z"
                fill="rgba(255,255,255,0.01)"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1.2"
              />

              {/* Left Chest */}
              <Polygon
                points="50,34 38,34 36,48 50,48"
                fill={getScoreColor(data.muscleGroups['Chest'].score)}
                stroke={selectedMuscle === 'Chest' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Chest' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Chest')}
              />
              {/* Right Chest */}
              <Polygon
                points="50,34 62,34 64,48 50,48"
                fill={getScoreColor(data.muscleGroups['Chest'].score)}
                stroke={selectedMuscle === 'Chest' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Chest' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Chest')}
              />

              {/* Left Front Delt */}
              <Polygon
                points="38,32 30,38 33,48 38,44"
                fill={getScoreColor(data.muscleGroups['Front Delts'].score)}
                stroke={selectedMuscle === 'Front Delts' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Front Delts' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Front Delts')}
              />
              {/* Right Front Delt */}
              <Polygon
                points="62,32 70,38 67,48 62,44"
                fill={getScoreColor(data.muscleGroups['Front Delts'].score)}
                stroke={selectedMuscle === 'Front Delts' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Front Delts' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Front Delts')}
              />

              {/* Left Bicep */}
              <Polygon
                points="30,48 25,62 29,72 33,58"
                fill={getScoreColor(data.muscleGroups['Biceps'].score)}
                stroke={selectedMuscle === 'Biceps' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Biceps' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Biceps')}
              />
              {/* Right Bicep */}
              <Polygon
                points="70,48 75,62 71,72 67,58"
                fill={getScoreColor(data.muscleGroups['Biceps'].score)}
                stroke={selectedMuscle === 'Biceps' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Biceps' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Biceps')}
              />

              {/* Left Forearm */}
              <Polygon
                points="29,72 23,96 27,99 31,78"
                fill={getScoreColor(data.muscleGroups['Forearms'].score)}
                stroke={selectedMuscle === 'Forearms' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Forearms' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Forearms')}
              />
              {/* Right Forearm */}
              <Polygon
                points="71,72 77,96 73,99 69,78"
                fill={getScoreColor(data.muscleGroups['Forearms'].score)}
                stroke={selectedMuscle === 'Forearms' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Forearms' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Forearms')}
              />

              {/* Abs Core Center */}
              <Polygon
                points="44,50 56,50 55,95 45,95"
                fill={getScoreColor(data.muscleGroups['Abs'].score)}
                stroke={selectedMuscle === 'Abs' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Abs' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Abs')}
              />

              {/* Left Obliques */}
              <Polygon
                points="44,50 36,52 38,92 45,90"
                fill={getScoreColor(data.muscleGroups['Obliques'].score)}
                stroke={selectedMuscle === 'Obliques' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Obliques' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Obliques')}
              />
              {/* Right Obliques */}
              <Polygon
                points="56,50 64,52 62,92 55,90"
                fill={getScoreColor(data.muscleGroups['Obliques'].score)}
                stroke={selectedMuscle === 'Obliques' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Obliques' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Obliques')}
              />

              {/* Left Quadriceps */}
              <Polygon
                points="34,98 49,98 47,155 35,152"
                fill={getScoreColor(data.muscleGroups['Quadriceps'].score)}
                stroke={selectedMuscle === 'Quadriceps' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Quadriceps' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Quadriceps')}
              />
              {/* Right Quadriceps */}
              <Polygon
                points="66,98 51,98 53,155 65,152"
                fill={getScoreColor(data.muscleGroups['Quadriceps'].score)}
                stroke={selectedMuscle === 'Quadriceps' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Quadriceps' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Quadriceps')}
              />
            </Svg>
          </View>

          {/* Back Mannequin */}
          <View style={styles.mannequinCol}>
            <AppText variant="caption" color="textMuted" style={styles.mannequinLabel}>BACK VIEW</AppText>
            <Svg width="135" height="260" viewBox="0 0 100 240">
              {/* Head Outline */}
              <Circle cx="50" cy="16" r="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              {/* Neck Outline */}
              <Path d="M47,21 L53,21 L53,28 L47,28 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              
              {/* Back Silhouette Outline */}
              <Path
                d="M50,28 L38,32 L30,38 L25,62 L29,72 L34,75 L36,102 L34,126 L34,180 L34,225 L48,225 L50,225 L52,225 L66,225 L66,180 L66,126 L64,102 L66,75 L71,72 L75,62 L70,38 L62,32 Z"
                fill="rgba(255,255,255,0.01)"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1.2"
              />

              {/* Upper Traps / Neck */}
              <Polygon
                points="42,28 58,28 62,42 38,42"
                fill={getScoreColor(data.muscleGroups['Traps'].score)}
                stroke={selectedMuscle === 'Traps' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Traps' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Traps')}
              />

              {/* Left Rear Delt */}
              <Polygon
                points="38,32 30,38 33,48 38,44"
                fill={getScoreColor(data.muscleGroups['Rear Delts'].score)}
                stroke={selectedMuscle === 'Rear Delts' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Rear Delts' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Rear Delts')}
              />
              {/* Right Rear Delt */}
              <Polygon
                points="62,32 70,38 67,48 62,44"
                fill={getScoreColor(data.muscleGroups['Rear Delts'].score)}
                stroke={selectedMuscle === 'Rear Delts' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Rear Delts' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Rear Delts')}
              />

              {/* Left Triceps */}
              <Polygon
                points="30,48 25,62 29,72 33,58"
                fill={getScoreColor(data.muscleGroups['Triceps'].score)}
                stroke={selectedMuscle === 'Triceps' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Triceps' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Triceps')}
              />
              {/* Right Triceps */}
              <Polygon
                points="70,48 75,62 71,72 67,58"
                fill={getScoreColor(data.muscleGroups['Triceps'].score)}
                stroke={selectedMuscle === 'Triceps' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Triceps' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Triceps')}
              />

              {/* Left Lats */}
              <Polygon
                points="50,44 38,44 34,75 50,70"
                fill={getScoreColor(data.muscleGroups['Lats'].score)}
                stroke={selectedMuscle === 'Lats' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Lats' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Lats')}
              />
              {/* Right Lats */}
              <Polygon
                points="50,44 62,44 66,75 50,70"
                fill={getScoreColor(data.muscleGroups['Lats'].score)}
                stroke={selectedMuscle === 'Lats' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Lats' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Lats')}
              />

              {/* Lower Back */}
              <Polygon
                points="44,72 56,72 54,95 46,95"
                fill={getScoreColor(data.muscleGroups['Lower Back'].score)}
                stroke={selectedMuscle === 'Lower Back' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Lower Back' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Lower Back')}
              />

              {/* Left Glute */}
              <Polygon
                points="50,96 36,102 38,125 50,125"
                fill={getScoreColor(data.muscleGroups['Glutes'].score)}
                stroke={selectedMuscle === 'Glutes' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Glutes' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Glutes')}
              />
              {/* Right Glute */}
              <Polygon
                points="50,96 64,102 62,125 50,125"
                fill={getScoreColor(data.muscleGroups['Glutes'].score)}
                stroke={selectedMuscle === 'Glutes' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Glutes' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Glutes')}
              />

              {/* Left Hamstring */}
              <Polygon
                points="34,126 49,126 47,180 35,178"
                fill={getScoreColor(data.muscleGroups['Hamstrings'].score)}
                stroke={selectedMuscle === 'Hamstrings' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Hamstrings' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Hamstrings')}
              />
              {/* Right Hamstring */}
              <Polygon
                points="66,126 51,126 53,180 65,178"
                fill={getScoreColor(data.muscleGroups['Hamstrings'].score)}
                stroke={selectedMuscle === 'Hamstrings' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Hamstrings' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Hamstrings')}
              />

              {/* Left Calf */}
              <Polygon
                points="34,182 48,182 46,225 35,225"
                fill={getScoreColor(data.muscleGroups['Calves'].score)}
                stroke={selectedMuscle === 'Calves' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Calves' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Calves')}
              />
              {/* Right Calf */}
              <Polygon
                points="66,182 52,182 54,225 65,225"
                fill={getScoreColor(data.muscleGroups['Calves'].score)}
                stroke={selectedMuscle === 'Calves' ? '#ffffff' : 'rgba(255,255,255,0.1)'}
                strokeWidth={selectedMuscle === 'Calves' ? 1.8 : 0.8}
                onPress={() => setSelectedMuscle('Calves')}
              />
            </Svg>
          </View>
        </View>

        {/* Legend Tiers */}
        <View style={styles.legendRow}>
          {[
            { label: 'Elite (80+)', color: '#00e5ff' },
            { label: 'Strong (60+)', color: '#aeff00' },
            { label: 'Developing (40+)', color: '#f97316' },
            { label: 'Weak (20+)', color: '#ef4444' },
            { label: 'Unused (0+)', color: '#64748b' },
          ].map((t) => (
            <View key={t.label} style={styles.legendItemHorizontal}>
              <View style={[styles.legendIndicator, { backgroundColor: t.color }]} />
              <AppText variant="caption" style={{ fontSize: 9 }} color="textSecondary">
                {t.label}
              </AppText>
            </View>
          ))}
        </View>

        <AppText variant="caption" color="textMuted" style={styles.interactiveHint}>
          👆 Tap any highlighted muscle group to view detailed logs and analytics.
        </AppText>
      </Card>

      {/* Selected Muscle Detail Breakdown Card */}
      <View style={{ marginTop: 12 }}>
        <AppText variant="h3" style={styles.sectionHeader}>{selectedMuscle.toUpperCase()}</AppText>
        
        <Card variant="elevated" style={[styles.detailCard, { borderColor: getScoreColor(selectedDetails.score) }]}>
          <View style={styles.detailHeader}>
            <View>
              <AppText variant="caption" color="textMuted">DEVELOPMENT TIER</AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                <View style={[styles.rankBadge, { backgroundColor: getScoreColor(selectedDetails.score) }]}>
                  <AppText variant="caption" style={{ color: '#0c0f12', fontWeight: 'bold', fontSize: 10 }}>
                    {selectedDetails.rank.toUpperCase()}
                  </AppText>
                </View>
                <AppText variant="bodyBold" style={{ fontSize: 18 }}>
                  Score: {selectedDetails.score}/100
                </AppText>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="caption" color="textMuted">MONTHLY GROWTH</AppText>
              <AppText variant="bodyBold" style={{ color: selectedDetails.growth >= 0 ? theme.success : theme.error, marginTop: 4 }}>
                {selectedDetails.growth >= 0 ? `+${selectedDetails.growth}%` : `${selectedDetails.growth}%`}
              </AppText>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.detailGridItem}>
              <AppText variant="caption" color="textMuted">Weekly Volume</AppText>
              <AppText variant="bodyBold" style={{ marginTop: 2 }}>
                {selectedDetails.weeklyVolume.toLocaleString()} kg
              </AppText>
            </View>
            <View style={styles.detailGridItem}>
              <AppText variant="caption" color="textMuted">Monthly Volume</AppText>
              <AppText variant="bodyBold" style={{ marginTop: 2 }}>
                {selectedDetails.monthlyVolume.toLocaleString()} kg
              </AppText>
            </View>
            <View style={styles.detailGridItem}>
              <AppText variant="caption" color="textMuted">Training Frequency</AppText>
              <AppText variant="bodyBold" style={{ marginTop: 2 }}>
                {selectedDetails.frequency} sessions/week
              </AppText>
            </View>
          </View>

          {/* Top Exercises */}
          <View style={{ marginTop: 12 }}>
            <AppText variant="caption" color="textMuted" style={{ marginBottom: 6 }}>TOP EXERCISES</AppText>
            <View style={styles.topExercisesRow}>
              {selectedDetails.topExercises.map((ex, index) => (
                <View key={index} style={[styles.exercisePill, { backgroundColor: theme.surfaceElevated }]}>
                  <AppText variant="caption" style={{ fontWeight: 'bold' }}>{ex}</AppText>
                </View>
              ))}
            </View>
          </View>

          {/* Contributors List */}
          <View style={{ marginTop: 16 }}>
            <AppText variant="caption" color="textMuted" style={{ marginBottom: 8 }}>VOLUME CONTRIBUTORS</AppText>
            {selectedDetails.contributors.map((c, index) => (
              <View key={index} style={styles.contributorRow}>
                <View style={styles.contributorMeta}>
                  <AppText variant="caption" style={{ fontWeight: 'bold' }} numberOfLines={1}>
                    {c.name}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {c.pct}%
                  </AppText>
                </View>
                <ProgressBar progress={c.pct / 100} color={getScoreColor(selectedDetails.score)} style={{ height: 4 }} />
              </View>
            ))}
          </View>

          {/* Development Trend history Chart */}
          <View style={{ marginTop: 20 }}>
            <AppText variant="caption" color="textMuted" style={{ marginBottom: 6 }}>DEVELOPMENT HISTORY (PAST 6 MONTHS)</AppText>
            <Sparkline history={selectedDetails.history} color={getScoreColor(selectedDetails.score)} />
          </View>
        </Card>
      </View>

      {/* Body Balance Analysis & Insights */}
      <View style={{ marginTop: 16 }}>
        <AppText variant="h3" style={styles.sectionHeader}>Body Balance Analysis</AppText>
        <Card variant="glass" style={styles.balanceCard}>
          <View style={styles.balanceGrid}>
            <View style={styles.balanceItem}>
              <AppText variant="caption" color="textSecondary">Strongest Muscle</AppText>
              <AppText variant="bodyBold" color="success" style={{ marginTop: 2 }}>
                {data.strongestMuscle} ({data.strongestScore})
              </AppText>
            </View>
            <View style={styles.balanceItem}>
              <AppText variant="caption" color="textSecondary">Lagging Muscle</AppText>
              <AppText variant="bodyBold" color="error" style={{ marginTop: 2 }}>
                {data.weakestMuscle} ({data.weakestScore})
              </AppText>
            </View>
            <View style={styles.balanceItem}>
              <AppText variant="caption" color="textSecondary">Needs Focus Area</AppText>
              <AppText variant="bodyBold" style={{ color: theme.secondary, marginTop: 2 }}>
                {data.needsFocus} ({data.muscleGroups[data.needsFocus].score})
              </AppText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Insights recommendations list */}
          <AppText variant="caption" color="textMuted" style={{ marginBottom: 8 }}>FITNESS INSIGHTS</AppText>
          <View style={{ gap: 8 }}>
            {data.insights.map((ins, index) => (
              <View key={index} style={styles.insightBullet}>
                <Ionicons name="bulb-outline" size={14} color={theme.primary} style={{ marginTop: 1 }} />
                <AppText variant="caption" style={{ flex: 1, lineHeight: 15 }}>{ins}</AppText>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Body Evolution Milestone logs */}
      <View style={{ marginTop: 16, marginBottom: 40 }}>
        <AppText variant="h3" style={styles.sectionHeader}>Body Evolution Milestones</AppText>
        <Card variant="glass" style={styles.evolutionCard}>
          {[
            { muscle: 'Chest', icon: 'shield-outline', color: '#00e5ff' },
            { muscle: 'Lats', icon: 'airplane-outline', color: '#aeff00' },
            { muscle: 'Quadriceps', icon: 'walk-outline', color: '#f97316' },
          ].map((item, idx) => {
            const mDetails = data.muscleGroups[item.muscle as MuscleSubGroup];
            const startScore = mDetails.history[0];
            const diff = mDetails.score - startScore;
            return (
              <View key={idx} style={styles.evolutionRow}>
                <View style={[styles.evolutionIconWrap, { borderColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyBold">{item.muscle}</AppText>
                  <AppText variant="caption" color="textMuted">
                    Start: {startScore} • Current: {mDetails.score}
                  </AppText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText variant="bodyBold" color={diff >= 0 ? 'success' : 'error'}>
                    {diff >= 0 ? `+${diff}` : diff}
                  </AppText>
                  <AppText variant="caption" color="textMuted">Growth</AppText>
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
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  bigScoreText: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  mannequinCard: {
    padding: 16,
    alignItems: 'center',
  },
  mannequinRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  mannequinCol: {
    flex: 1,
    alignItems: 'center',
  },
  mannequinLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  legendItemHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  interactiveHint: {
    textAlign: 'center',
    fontSize: 9,
    marginTop: 12,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  detailCard: {
    padding: 16,
    borderWidth: 1.5,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 12,
    marginBottom: 12,
  },
  detailGridItem: {
    flex: 1,
  },
  topExercisesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exercisePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contributorRow: {
    marginVertical: 6,
    gap: 4,
  },
  contributorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sparklineWrap: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  sparklineMonthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  balanceCard: {
    padding: 16,
  },
  balanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  insightBullet: {
    flexDirection: 'row',
    gap: 8,
  },
  evolutionCard: {
    padding: 16,
    gap: 12,
  },
  evolutionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  evolutionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BodyVisualizerScreen;
