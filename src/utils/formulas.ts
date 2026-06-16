import { UserProfile, FitnessGoal } from '../models/fitness';

export const calculateCaloricTargets = (
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female' | 'other',
  activityLevel: UserProfile['activityLevel'],
  goal: FitnessGoal
) => {
  // 1. Calculate BMR using Mifflin-St Jeor Equation
  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 78; // Neutral average
  }

  // 2. Adjust for Activity Level
  let tdee = bmr;
  switch (activityLevel) {
    case 'sedentary':
      tdee = bmr * 1.2;
      break;
    case 'lightly_active':
      tdee = bmr * 1.375;
      break;
    case 'moderately_active':
      tdee = bmr * 1.55;
      break;
    case 'very_active':
      tdee = bmr * 1.725;
      break;
    default:
      tdee = bmr * 1.2;
  }

  // 3. Adjust for Fitness Goals
  let targetCalories = Math.round(tdee);
  switch (goal) {
    case 'fat_loss':
      targetCalories = Math.round(tdee - 500); // 500 calorie deficit
      break;
    case 'muscle_gain':
      targetCalories = Math.round(tdee + 300); // 300 calorie surplus
      break;
    case 'weight_maintenance':
      targetCalories = Math.round(tdee);
      break;
  }

  // Ensure target calories don't drop below safe minimums (e.g. 1200 kcal)
  targetCalories = Math.max(targetCalories, 1200);

  // 4. Calculate Macronutrient Targets
  // Protein: 2.0g per kg of bodyweight
  const targetProtein = Math.round(weight * 2.0);
  const proteinCalories = targetProtein * 4;

  // Fats: 25% of total calories
  const targetFats = Math.round((targetCalories * 0.25) / 9);
  const fatCalories = targetFats * 9;

  // Carbohydrates: Remaining calories
  const remainingCalories = targetCalories - (proteinCalories + fatCalories);
  const targetCarbs = Math.max(Math.round(remainingCalories / 4), 0);

  return {
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFats,
  };
};
