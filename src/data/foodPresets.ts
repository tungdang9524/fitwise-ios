import { FoodPreset } from '../models/fitness';

export const FOOD_PRESETS: FoodPreset[] = [
  { id: 'preset_chicken', name: 'Chicken Breast (Grilled)', calories: 165, protein: 31, carbohydrates: 0, fats: 3.6, servingSize: '100g', icon: '🍗' },
  { id: 'preset_rice', name: 'White Rice (Cooked)', calories: 130, protein: 2.7, carbohydrates: 28, fats: 0.3, servingSize: '100g', icon: '🍚' },
  { id: 'preset_egg', name: 'Whole Egg (Boiled)', calories: 78, protein: 6.3, carbohydrates: 0.6, fats: 5.3, servingSize: '1 large', icon: '🥚' },
  { id: 'preset_whey', name: 'Whey Protein Shake', calories: 120, protein: 24, carbohydrates: 3, fats: 1.5, servingSize: '1 scoop', icon: '🥛' },
  { id: 'preset_oats', name: 'Oatmeal (Cooked)', calories: 150, protein: 5, carbohydrates: 27, fats: 2.5, servingSize: '1 cup', icon: '🥣' },
  { id: 'preset_sweetpot', name: 'Sweet Potato (Baked)', calories: 86, protein: 1.6, carbohydrates: 20, fats: 0.1, servingSize: '100g', icon: '🍠' },
  { id: 'preset_pb', name: 'Peanut Butter', calories: 94, protein: 3.5, carbohydrates: 3, fats: 8, servingSize: '1 tbsp', icon: '🥜' },
  { id: 'preset_banana', name: 'Banana', calories: 105, protein: 1.3, carbohydrates: 27, fats: 0.3, servingSize: '1 medium', icon: '🍌' },
];
