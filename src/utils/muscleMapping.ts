import { WorkoutSession, LibraryExercise, UserProfile } from '../models/fitness';

export type MuscleSubGroup =
  | 'Chest'
  | 'Front Delts'
  | 'Biceps'
  | 'Forearms'
  | 'Abs'
  | 'Obliques'
  | 'Quadriceps'
  | 'Traps'
  | 'Rear Delts'
  | 'Lats'
  | 'Triceps'
  | 'Lower Back'
  | 'Glutes'
  | 'Hamstrings'
  | 'Calves';

// Bodyweight multiplier benchmarks for intermediate lift targets
export const MUSCLE_MULTIPLIERS: Record<MuscleSubGroup, number> = {
  Chest: 1.2,
  'Front Delts': 0.7,
  Biceps: 0.4,
  Forearms: 0.3,
  Abs: 0.3,
  Obliques: 0.3,
  Quadriceps: 1.4,
  Traps: 1.5,
  'Rear Delts': 0.4,
  Lats: 1.3,
  Triceps: 0.45,
  'Lower Back': 1.6,
  Glutes: 1.4,
  Hamstrings: 1.1,
  Calves: 0.9,
};

// Target monthly volumes in kg for 100% volume score (Intermediates)
export const MUSCLE_VOLUME_TARGETS: Record<MuscleSubGroup, number> = {
  Chest: 6000,
  'Front Delts': 3000,
  Biceps: 2500,
  Forearms: 1500,
  Abs: 2000,
  Obliques: 1500,
  Quadriceps: 7000,
  Traps: 4000,
  'Rear Delts': 2500,
  Lats: 6000,
  Triceps: 3000,
  'Lower Back': 5000,
  Glutes: 5000,
  Hamstrings: 5000,
  Calves: 2500,
};

// Helper: Map exercise to specific muscle subgroup
export const getMuscleSubGroup = (
  exerciseId: string,
  exerciseName: string,
  primaryGroup: string
): MuscleSubGroup => {
  const name = (exerciseName || '').toLowerCase();
  const id = (exerciseId || '').toLowerCase();
  const primary = primaryGroup || '';

  if (primary === 'Chest') {
    return 'Chest';
  }

  if (primary === 'Shoulders') {
    if (
      name.includes('rear') ||
      name.includes('face') ||
      name.includes('reverse fly') ||
      name.includes('reverse pec') ||
      id.includes('rear') ||
      id.includes('face_pull')
    ) {
      return 'Rear Delts';
    }
    return 'Front Delts';
  }

  if (primary === 'Arms') {
    if (
      name.includes('tricep') ||
      name.includes('skull') ||
      name.includes('dip') ||
      name.includes('extension') ||
      name.includes('pushdown') ||
      name.includes('kickback') ||
      id.includes('tricep') ||
      id.includes('skull') ||
      id.includes('dip') ||
      id.includes('pushdown')
    ) {
      return 'Triceps';
    }
    if (
      name.includes('forearm') ||
      name.includes('wrist') ||
      name.includes('reverse curl') ||
      id.includes('forearm') ||
      id.includes('wrist')
    ) {
      return 'Forearms';
    }
    return 'Biceps';
  }

  if (primary === 'Core') {
    if (
      name.includes('oblique') ||
      name.includes('twist') ||
      name.includes('wood') ||
      name.includes('side') ||
      id.includes('oblique') ||
      id.includes('twist')
    ) {
      return 'Obliques';
    }
    return 'Abs';
  }

  if (primary === 'Back') {
    if (
      name.includes('deadlift') ||
      name.includes('extension') ||
      name.includes('hyper') ||
      name.includes('lower back') ||
      id.includes('deadlift') ||
      id.includes('extension')
    ) {
      return 'Lower Back';
    }
    if (
      name.includes('shrug') ||
      name.includes('rack pull') ||
      name.includes('trap') ||
      id.includes('shrug') ||
      id.includes('rack_pull')
    ) {
      return 'Traps';
    }
    return 'Lats';
  }

  if (primary === 'Legs') {
    if (name.includes('calf') || name.includes('calves') || id.includes('calf') || id.includes('calves')) {
      return 'Calves';
    }
    if (
      name.includes('curl') ||
      name.includes('romanian') ||
      name.includes('rdl') ||
      name.includes('hamstring') ||
      name.includes('stiff') ||
      id.includes('curl') ||
      id.includes('romanian') ||
      id.includes('rdl')
    ) {
      return 'Hamstrings';
    }
    if (
      name.includes('thrust') ||
      name.includes('glute') ||
      id.includes('thrust') ||
      id.includes('glute')
    ) {
      return 'Glutes';
    }
    return 'Quadriceps';
  }

  // Fallback map based on strings if primary group is unaligned
  if (name.includes('squat') || name.includes('leg press') || name.includes('lung')) return 'Quadriceps';
  if (name.includes('curl')) return 'Biceps';
  if (name.includes('press') || name.includes('pushup') || name.includes('dip')) return 'Chest';
  if (name.includes('row') || name.includes('pulldown') || name.includes('pullup')) return 'Lats';

  return 'Chest'; // Ultimate default
};

export interface MuscleDetails {
  score: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Elite';
  weeklyVolume: number;
  monthlyVolume: number;
  frequency: number; // sessions per week
  growth: number; // percentage change in score/weight (e.g. +12%)
  topExercises: string[];
  contributors: Array<{ name: string; pct: number }>;
  history: number[]; // past 6 months scores (e.g. [50, 52, 55, 60, 68, 72])
}

export interface BodyVisualizerData {
  overallScore: number;
  level: number;
  title: string;
  strongestMuscle: MuscleSubGroup;
  strongestScore: number;
  weakestMuscle: MuscleSubGroup;
  weakestScore: number;
  needsFocus: MuscleSubGroup;
  recentImprovementMsg: string;
  muscleGroups: Record<MuscleSubGroup, MuscleDetails>;
  insights: string[];
}

export const getLocalDateObject = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const calculateBodyVisualizerData = (
  workouts: WorkoutSession[],
  customExercises: LibraryExercise[],
  profile: UserProfile | null,
  xp: number = 0,
  level: number = 1
): BodyVisualizerData => {
  const userWeight = profile?.weight || 70;
  const now = new Date();

  // Helper to determine time differences in days
  const getDaysAgo = (dateStr: string): number => {
    try {
      const date = getLocalDateObject(dateStr);
      const diffTime = Math.abs(now.getTime() - date.getTime());
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 999;
    }
  };

  const allSubGroups: MuscleSubGroup[] = [
    'Chest',
    'Front Delts',
    'Biceps',
    'Forearms',
    'Abs',
    'Obliques',
    'Quadriceps',
    'Traps',
    'Rear Delts',
    'Lats',
    'Triceps',
    'Lower Back',
    'Glutes',
    'Hamstrings',
    'Calves',
  ];

  // Initialize data structures for each subgroup
  const subGroupLogs: Record<
    MuscleSubGroup,
    Array<{
      date: string;
      exerciseName: string;
      volume: number;
      maxWeight: number;
      avgWeight: number;
      daysAgo: number;
    }>
  > = {} as any;

  const exerciseVolumesPerSubGroup: Record<MuscleSubGroup, Record<string, number>> = {} as any;

  allSubGroups.forEach((g) => {
    subGroupLogs[g] = [];
    exerciseVolumesPerSubGroup[g] = {};
  });

  // Parse workouts
  workouts.forEach((w) => {
    const daysAgo = getDaysAgo(w.date);
    w.exercises.forEach((ex) => {
      const completedSets = ex.sets.filter((s) => s.completed);
      if (completedSets.length === 0) return;

      // Map exercise to subgroup
      const subGroup = getMuscleSubGroup(ex.exerciseId, ex.name, ex.muscleGroup);

      const totalVol = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      const maxWt = Math.max(...completedSets.map((s) => s.weight));
      const avgWt = completedSets.reduce((sum, s) => sum + s.weight, 0) / completedSets.length;

      subGroupLogs[subGroup].push({
        date: w.date,
        exerciseName: ex.name,
        volume: totalVol,
        maxWeight: maxWt,
        avgWeight: avgWt,
        daysAgo,
      });

      exerciseVolumesPerSubGroup[subGroup][ex.name] =
        (exerciseVolumesPerSubGroup[subGroup][ex.name] || 0) + totalVol;
    });
  });

  // Calculate stats for each subgroup
  const muscleGroups: Record<MuscleSubGroup, MuscleDetails> = {} as any;

  allSubGroups.forEach((g) => {
    const logs = subGroupLogs[g];
    const multiplier = MUSCLE_MULTIPLIERS[g];
    const volTarget = MUSCLE_VOLUME_TARGETS[g];

    // 1. Strength (40%)
    let maxWeightLifted = 0;
    logs.forEach((l) => {
      if (l.maxWeight > maxWeightLifted) maxWeightLifted = l.maxWeight;
    });
    const targetWeight = multiplier * userWeight;
    const strengthScore =
      maxWeightLifted > 0
        ? Math.max(30, Math.min(100, Math.round((maxWeightLifted / targetWeight) * 100)))
        : 30;

    // 2. Volume (30%)
    const monthlyLogs = logs.filter((l) => l.daysAgo <= 30);
    const monthlyVolume = monthlyLogs.reduce((sum, l) => sum + l.volume, 0);
    const weeklyVolume = Math.round(monthlyVolume / 4);
    const volumeScore = Math.max(20, Math.min(100, Math.round((monthlyVolume / volTarget) * 100)));

    // 3. Consistency (20%)
    // Check how many of the last 4 weeks had at least 1 workout
    const activeWeeks = new Set<number>();
    logs.forEach((l) => {
      if (l.daysAgo <= 7) activeWeeks.add(1);
      else if (l.daysAgo <= 14) activeWeeks.add(2);
      else if (l.daysAgo <= 21) activeWeeks.add(3);
      else if (l.daysAgo <= 28) activeWeeks.add(4);
    });
    const weekCount = activeWeeks.size;
    const consistencyScore =
      weekCount === 4 ? 100 : weekCount === 3 ? 80 : weekCount === 2 ? 60 : weekCount === 1 ? 40 : 20;

    const frequency = Math.round((logs.filter((l) => l.daysAgo <= 28).length / 4) * 10) / 10;

    // 4. Progress (10%)
    // Compare avg weight in last 15 days vs 15 days before that
    const recentLogs = logs.filter((l) => l.daysAgo <= 15);
    const priorLogs = logs.filter((l) => l.daysAgo > 15 && l.daysAgo <= 30);

    const getAvgWeightFromLogs = (list: typeof logs) => {
      if (list.length === 0) return 0;
      return list.reduce((sum, l) => sum + l.avgWeight, 0) / list.length;
    };

    const avgRecent = getAvgWeightFromLogs(recentLogs);
    const avgPrior = getAvgWeightFromLogs(priorLogs);

    let progressScore = 60; // stable baseline
    let growth = 0;
    if (avgRecent > 0 && avgPrior > 0) {
      growth = Math.round(((avgRecent - avgPrior) / avgPrior) * 100);
      if (growth > 5) progressScore = 100;
      else if (growth > 0) progressScore = 80;
      else if (growth === 0) progressScore = 60;
      else progressScore = 40;
    } else if (avgRecent > 0) {
      // New exercise progress baseline
      progressScore = 70;
      growth = 5;
    }

    // Final Weighted Score
    const score = Math.round(
      strengthScore * 0.4 + volumeScore * 0.3 + consistencyScore * 0.2 + progressScore * 0.1
    );

    // Rank Mapping
    let rank: 'Bronze' | 'Silver' | 'Gold' | 'Elite' = 'Bronze';
    if (score >= 80) rank = 'Elite';
    else if (score >= 60) rank = 'Gold';
    else if (score >= 40) rank = 'Silver';

    // Top Exercises
    const exerciseVols = exerciseVolumesPerSubGroup[g];
    const sortedExercises = Object.keys(exerciseVols).sort((a, b) => exerciseVols[b] - exerciseVols[a]);
    const topExercises = sortedExercises.slice(0, 3);

    // Contributors
    const totalSubGroupVol = Object.values(exerciseVols).reduce((s, v) => s + v, 0);
    const contributors = sortedExercises.map((name) => {
      const vol = exerciseVols[name];
      const pct = totalSubGroupVol > 0 ? Math.round((vol / totalSubGroupVol) * 100) : 0;
      return { name, pct };
    }).slice(0, 4);

    // History approximation based on log timestamps
    const generateHistory = (targetScore: number, groupLogs: typeof logs) => {
      const historyList = [30, 30, 30, 30, 30, 30]; // baseline
      if (groupLogs.length === 0) return historyList;

      // Group logs by month offset (0 to 5 months ago)
      for (let i = 0; i < 6; i++) {
        const monthLogs = groupLogs.filter((l) => l.daysAgo >= i * 30 && l.daysAgo < (i + 1) * 30);
        if (monthLogs.length > 0) {
          const maxWtM = Math.max(...monthLogs.map((l) => l.maxWeight));
          const volM = monthLogs.reduce((sum, l) => sum + l.volume, 0);
          const strS = Math.max(30, Math.min(100, Math.round((maxWtM / targetWeight) * 100)));
          const volS = Math.max(20, Math.min(100, Math.round((volM / volTarget) * 100)));
          const finalS = Math.round(strS * 0.5 + volS * 0.5);
          historyList[5 - i] = finalS;
        } else {
          // If no logs, decay score slightly or keep baseline
          historyList[5 - i] = 30 + Math.max(0, 5 - i) * 3;
        }
      }
      historyList[5] = targetScore; // set current score as final
      // Ensure history flows smoothly
      for (let i = 1; i < 6; i++) {
        if (historyList[i] < historyList[i - 1] && historyList[i] === 30) {
          historyList[i] = historyList[i - 1];
        }
      }
      return historyList;
    };

    const history = generateHistory(score, logs);

    muscleGroups[g] = {
      score,
      rank,
      weeklyVolume,
      monthlyVolume,
      frequency,
      growth: Math.max(-50, Math.min(200, growth)),
      topExercises: topExercises.length > 0 ? topExercises : ['N/A'],
      contributors: contributors.length > 0 ? contributors : [{ name: 'None', pct: 100 }],
      history,
    };
  });

  // Calculate Overall Averages
  const scoreValues = Object.values(muscleGroups).map((m) => m.score);
  const overallScore = Math.round(scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length);

  // RPG Title
  let title = 'Iron Novice';
  if (overallScore >= 75) title = 'Aesthetic Elite';
  else if (overallScore >= 60) title = 'Iron Builder';
  else if (overallScore >= 45) title = 'Hypertrophy Knight';
  else if (overallScore >= 35) title = 'Gym Disciple';

  // Identify Strongest & Weakest Muscles
  let strongestMuscle: MuscleSubGroup = 'Chest';
  let strongestScore = -1;
  let weakestMuscle: MuscleSubGroup = 'Chest';
  let weakestScore = 999;

  allSubGroups.forEach((g) => {
    const s = muscleGroups[g].score;
    if (s > strongestScore) {
      strongestScore = s;
      strongestMuscle = g;
    }
    if (s < weakestScore) {
      weakestScore = s;
      weakestMuscle = g;
    }
  });

  // Needs Focus is the weakest large muscle group
  const largeMuscles: MuscleSubGroup[] = ['Chest', 'Lats', 'Quadriceps', 'Hamstrings', 'Glutes', 'Lower Back'];
  let needsFocus: MuscleSubGroup = 'Lats';
  let focusScore = 999;
  largeMuscles.forEach((g) => {
    const s = muscleGroups[g].score;
    if (s < focusScore) {
      focusScore = s;
      needsFocus = g;
    }
  });

  // Recent Improvement calculation (Find muscle with highest growth pct in last 30 days)
  let bestGrowth = -999;
  let improvedMuscle: MuscleSubGroup = 'Chest';
  allSubGroups.forEach((g) => {
    const gr = muscleGroups[g].growth;
    if (gr > bestGrowth && subGroupLogs[g].length > 0) {
      bestGrowth = gr;
      improvedMuscle = g;
    }
  });

  const recentImprovementMsg =
    bestGrowth > 0
      ? `${improvedMuscle} +${bestGrowth}%`
      : workouts.length > 0
      ? 'Consistent Training'
      : 'No recent change';

  // Insights Generator
  const insights: string[] = [];

  const chestScore = muscleGroups['Chest'].score;
  const latScore = muscleGroups['Lats'].score;
  if (latScore < chestScore - 15) {
    insights.push('Your back development is significantly lower than your chest.');
  }

  const quadVol = muscleGroups['Quadriceps'].monthlyVolume;
  const chestVol = muscleGroups['Chest'].monthlyVolume;
  const latVol = muscleGroups['Lats'].monthlyVolume;
  const upperVol = chestVol + latVol;
  if (quadVol < upperVol * 0.4 && workouts.length > 0) {
    insights.push('Leg volume is below your upper-body volume.');
  }

  const hamScore = muscleGroups['Hamstrings'].score;
  const quadScore = muscleGroups['Quadriceps'].score;
  if (hamScore < quadScore - 10) {
    insights.push('Consider increasing hamstring training frequency.');
  }

  const lowBackScore = muscleGroups['Lower Back'].score;
  if (lowBackScore < 50) {
    insights.push('Prioritize lower back and core core bracing stabilization.');
  }

  if (insights.length === 0) {
    insights.push('Great job! Your muscular development is well-balanced.');
    insights.push('Continue progressive overload to level up your score further.');
  }

  return {
    overallScore,
    level,
    title,
    strongestMuscle,
    strongestScore,
    weakestMuscle,
    weakestScore,
    needsFocus,
    recentImprovementMsg,
    muscleGroups,
    insights,
  };
};
