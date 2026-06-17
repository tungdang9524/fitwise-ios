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
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');
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

  const handleToggleView = (mode: 'front' | 'back') => {
    setViewMode(mode);
    setSelectedMuscle(mode === 'front' ? 'Chest' : 'Traps');
  };

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

      {/* View Mode Toggle Switch */}
      <View style={[styles.toggleContainer, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          onPress={() => handleToggleView('front')}
          style={[styles.toggleBtn, viewMode === 'front' && { backgroundColor: theme.surfaceElevated }]}
        >
          <AppText variant="bodyBold" color={viewMode === 'front' ? 'primary' : 'textMuted'}>
            Front View
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleToggleView('back')}
          style={[styles.toggleBtn, viewMode === 'back' && { backgroundColor: theme.surfaceElevated }]}
        >
          <AppText variant="bodyBold" color={viewMode === 'back' ? 'primary' : 'textMuted'}>
            Back View
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Interactive Human Mannequin SVG Display */}
      <Card variant="glass" style={styles.mannequinCard}>
        <View style={styles.mannequinRow}>
          {/* Legend Tiers */}
          <View style={styles.legendCabinet}>
            <AppText variant="caption" color="textMuted" style={styles.legendTitle}>TIERS</AppText>
            {[
              { label: 'Elite (80+)', color: '#00e5ff' },
              { label: 'Strong (60-80)', color: '#aeff00' },
              { label: 'Developing (40-60)', color: '#f97316' },
              { label: 'Weak (20-40)', color: '#ef4444' },
              { label: 'Unused (0-20)', color: '#64748b' },
            ].map((t) => (
              <View key={t.label} style={styles.legendItem}>
                <View style={[styles.legendIndicator, { backgroundColor: t.color }]} />
                <AppText variant="caption" style={{ fontSize: 9 }} color="textSecondary">
                  {t.label}
                </AppText>
              </View>
            ))}
          </View>

          {/* Mannequin Interactive SVG Viewport */}
          <View style={styles.svgContainer}>
            {viewMode === 'front' ? (
              <Svg width="180" height="280" viewBox="0 0 200 320">
                {/* Mannequin Static Silhouette Guides */}
                <Circle cx="100" cy="35" r="14" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <Path d="M100,50 L132,70 L144,95 L138,125 L124,175 L100,180 L76,175 L62,125 L56,95 L68,70 Z" fill="rgba(255,255,255,0.01)" />
                <Path d="M72,180 L80,256 L90,312 M128,180 L120,256 L110,312" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />

                {/* Left Chest */}
                <Polygon
                  points="101,80 132,80 128,105 101,105"
                  fill={getScoreColor(data.muscleGroups['Chest'].score)}
                  stroke={selectedMuscle === 'Chest' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Chest' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Chest')}
                />
                {/* Right Chest */}
                <Polygon
                  points="99,80 68,80 72,105 99,105"
                  fill={getScoreColor(data.muscleGroups['Chest'].score)}
                  stroke={selectedMuscle === 'Chest' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Chest' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Chest')}
                />

                {/* Left Front Delt */}
                <Polygon
                  points="132,80 148,92 140,112 128,105"
                  fill={getScoreColor(data.muscleGroups['Front Delts'].score)}
                  stroke={selectedMuscle === 'Front Delts' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Front Delts' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Front Delts')}
                />
                {/* Right Front Delt */}
                <Polygon
                  points="68,80 52,92 60,112 72,105"
                  fill={getScoreColor(data.muscleGroups['Front Delts'].score)}
                  stroke={selectedMuscle === 'Front Delts' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Front Delts' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Front Delts')}
                />

                {/* Left Bicep */}
                <Polygon
                  points="140,112 152,126 144,148 132,130"
                  fill={getScoreColor(data.muscleGroups['Biceps'].score)}
                  stroke={selectedMuscle === 'Biceps' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Biceps' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Biceps')}
                />
                {/* Right Bicep */}
                <Polygon
                  points="60,112 48,126 56,148 68,130"
                  fill={getScoreColor(data.muscleGroups['Biceps'].score)}
                  stroke={selectedMuscle === 'Biceps' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Biceps' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Biceps')}
                />

                {/* Left Forearms */}
                <Polygon
                  points="144,148 158,162 148,198 136,190"
                  fill={getScoreColor(data.muscleGroups['Forearms'].score)}
                  stroke={selectedMuscle === 'Forearms' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Forearms' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Forearms')}
                />
                {/* Right Forearms */}
                <Polygon
                  points="56,148 42,162 52,198 64,190"
                  fill={getScoreColor(data.muscleGroups['Forearms'].score)}
                  stroke={selectedMuscle === 'Forearms' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Forearms' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Forearms')}
                />

                {/* Abs Core Center */}
                <Polygon
                  points="85,108 115,108 112,170 88,170"
                  fill={getScoreColor(data.muscleGroups['Abs'].score)}
                  stroke={selectedMuscle === 'Abs' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Abs' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Abs')}
                />

                {/* Left Obliques */}
                <Polygon
                  points="115,108 128,122 120,170 112,170"
                  fill={getScoreColor(data.muscleGroups['Obliques'].score)}
                  stroke={selectedMuscle === 'Obliques' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Obliques' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Obliques')}
                />
                {/* Right Obliques */}
                <Polygon
                  points="85,108 72,122 80,170 88,170"
                  fill={getScoreColor(data.muscleGroups['Obliques'].score)}
                  stroke={selectedMuscle === 'Obliques' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Obliques' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Obliques')}
                />

                {/* Left Quadriceps */}
                <Polygon
                  points="101,180 128,180 118,255 101,250"
                  fill={getScoreColor(data.muscleGroups['Quadriceps'].score)}
                  stroke={selectedMuscle === 'Quadriceps' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Quadriceps' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Quadriceps')}
                />
                {/* Right Quadriceps */}
                <Polygon
                  points="99,180 72,180 82,255 99,250"
                  fill={getScoreColor(data.muscleGroups['Quadriceps'].score)}
                  stroke={selectedMuscle === 'Quadriceps' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Quadriceps' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Quadriceps')}
                />
              </Svg>
            ) : (
              <Svg width="180" height="280" viewBox="0 0 200 320">
                {/* Mannequin Static Silhouette Guides */}
                <Circle cx="100" cy="35" r="14" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <Path d="M100,50 L132,70 L144,95 L138,125 L124,175 L100,180 L76,175 L62,125 L56,95 L68,70 Z" fill="rgba(255,255,255,0.01)" />
                <Path d="M72,180 L80,256 L90,312 M128,180 L120,256 L110,312" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />

                {/* Upper Traps / Neck */}
                <Polygon
                  points="82,55 118,55 125,80 75,80"
                  fill={getScoreColor(data.muscleGroups['Traps'].score)}
                  stroke={selectedMuscle === 'Traps' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Traps' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Traps')}
                />

                {/* Left Rear Delt */}
                <Polygon
                  points="132,80 144,95 136,112 126,102"
                  fill={getScoreColor(data.muscleGroups['Rear Delts'].score)}
                  stroke={selectedMuscle === 'Rear Delts' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Rear Delts' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Rear Delts')}
                />
                {/* Right Rear Delt */}
                <Polygon
                  points="68,80 56,95 64,112 74,102"
                  fill={getScoreColor(data.muscleGroups['Rear Delts'].score)}
                  stroke={selectedMuscle === 'Rear Delts' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Rear Delts' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Rear Delts')}
                />

                {/* Left Lats */}
                <Polygon
                  points="112,105 130,138 118,170 101,170"
                  fill={getScoreColor(data.muscleGroups['Lats'].score)}
                  stroke={selectedMuscle === 'Lats' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Lats' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Lats')}
                />
                {/* Right Lats */}
                <Polygon
                  points="88,105 70,138 82,170 99,170"
                  fill={getScoreColor(data.muscleGroups['Lats'].score)}
                  stroke={selectedMuscle === 'Lats' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Lats' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Lats')}
                />

                {/* Left Triceps */}
                <Polygon
                  points="132,105 142,130 134,148 126,128"
                  fill={getScoreColor(data.muscleGroups['Triceps'].score)}
                  stroke={selectedMuscle === 'Triceps' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Triceps' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Triceps')}
                />
                {/* Right Triceps */}
                <Polygon
                  points="68,105 58,130 66,148 74,128"
                  fill={getScoreColor(data.muscleGroups['Triceps'].score)}
                  stroke={selectedMuscle === 'Triceps' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Triceps' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Triceps')}
                />

                {/* Lower Back */}
                <Polygon
                  points="88,170 112,170 108,195 92,195"
                  fill={getScoreColor(data.muscleGroups['Lower Back'].score)}
                  stroke={selectedMuscle === 'Lower Back' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Lower Back' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Lower Back')}
                />

                {/* Left Glute */}
                <Polygon
                  points="101,198 125,206 118,242 101,242"
                  fill={getScoreColor(data.muscleGroups['Glutes'].score)}
                  stroke={selectedMuscle === 'Glutes' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Glutes' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Glutes')}
                />
                {/* Right Glute */}
                <Polygon
                  points="99,198 75,206 82,242 99,242"
                  fill={getScoreColor(data.muscleGroups['Glutes'].score)}
                  stroke={selectedMuscle === 'Glutes' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Glutes' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Glutes')}
                />

                {/* Left Hamstring */}
                <Polygon
                  points="101,246 123,246 116,290 101,290"
                  fill={getScoreColor(data.muscleGroups['Hamstrings'].score)}
                  stroke={selectedMuscle === 'Hamstrings' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Hamstrings' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Hamstrings')}
                />
                {/* Right Hamstring */}
                <Polygon
                  points="99,246 77,246 84,290 99,290"
                  fill={getScoreColor(data.muscleGroups['Hamstrings'].score)}
                  stroke={selectedMuscle === 'Hamstrings' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Hamstrings' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Hamstrings')}
                />

                {/* Left Calf */}
                <Polygon
                  points="101,292 120,292 114,316 101,316"
                  fill={getScoreColor(data.muscleGroups['Calves'].score)}
                  stroke={selectedMuscle === 'Calves' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Calves' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Calves')}
                />
                {/* Right Calf */}
                <Polygon
                  points="99,292 80,292 86,316 99,316"
                  fill={getScoreColor(data.muscleGroups['Calves'].score)}
                  stroke={selectedMuscle === 'Calves' ? '#ffffff' : 'rgba(12,15,18,0.4)'}
                  strokeWidth={selectedMuscle === 'Calves' ? 2 : 1}
                  onPress={() => setSelectedMuscle('Calves')}
                />
              </Svg>
            )}
          </View>
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
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginVertical: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  mannequinCard: {
    padding: 16,
    alignItems: 'center',
  },
  mannequinRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendCabinet: {
    width: '45%',
    gap: 6,
  },
  legendTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  svgContainer: {
    width: '50%',
    alignItems: 'center',
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
