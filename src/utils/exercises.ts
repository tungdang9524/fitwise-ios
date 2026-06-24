export const isNoWeightExercise = (exercise: {
  name: string;
  targetMuscleGroup?: string;
  muscleGroup?: string;
  noWeight?: boolean;
}): boolean => {
  if (exercise.noWeight) return true;

  const muscle = exercise.targetMuscleGroup || exercise.muscleGroup || '';
  if (muscle === 'Warm-up' || muscle === 'Stretching') return true;

  const nameLower = exercise.name.toLowerCase();
  const noWeightKeywords = [
    'push-up',
    'pushup',
    'pull-up',
    'pullup',
    'chin-up',
    'chinup',
    'crunch',
    'plank',
    'knee raise',
    'leg raise',
    'l-sit',
    'mountain climber',
    'bodyweight squat',
    'air squat',
    'bodyweight lunge',
    'jumping jack',
    'burpee',
    'jumping lunge',
    'bench dip',
    'hollow body',
    'superman',
    'bird dog',
    'glute bridge',
  ];

  return noWeightKeywords.some((keyword) => nameLower.includes(keyword));
};
