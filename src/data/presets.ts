import {
  ExerciseCategory,
  ExerciseEntry,
  FitnessState,
  MealCategory,
  MealEntry,
  UserGoals,
  WaterLog,
  WeightLog,
} from '../types/fitness';
import { generateId, getTodayISO, shiftISODate } from '../utils/dateUtils';

export interface DietPlanPreset {
  id: string;
  name: string;
  subtitle: string;
  totalCalories: number;
  items: Omit<MealEntry, 'id' | 'date' | 'completed'>[];
}

export interface WorkoutPreset {
  id: string;
  name: string;
  subtitle: string;
  totalMinutes: number;
  items: Omit<ExerciseEntry, 'id' | 'date' | 'completed'>[];
}

export interface QuickFoodOption {
  name: string;
  category: MealCategory;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface QuickExerciseOption {
  name: string;
  category: ExerciseCategory;
  defaultSets?: number;
  defaultReps?: string;
  defaultWeightKg?: number;
  defaultDurationMin: number;
  kcalPerMin: number;
}

export const DIET_PRESETS: DietPlanPreset[] = [
  {
    id: 'balanced_2100',
    name: 'Balanced Maintenance',
    subtitle: '2,080 kcal · 142g Protein · Whole Foods',
    totalCalories: 2080,
    items: [
      {
        category: 'breakfast',
        name: 'Masala Oats with Roasted Almonds & Boiled Eggs',
        serving: '1 bowl + 2 eggs',
        calories: 440,
        protein: 24,
        carbs: 48,
        fats: 16,
        time: '08:15 AM',
      },
      {
        category: 'lunch',
        name: 'Grilled Chicken Breast, Brown Rice & Cucumber Salad',
        serving: '180g chicken + 150g rice',
        calories: 650,
        protein: 48,
        carbs: 66,
        fats: 18,
        time: '01:15 PM',
      },
      {
        category: 'snack',
        name: 'Moong Sprouts Chaat & Whey Protein Shake',
        serving: '1 bowl + 1 scoop',
        calories: 320,
        protein: 32,
        carbs: 34,
        fats: 5,
        time: '05:00 PM',
      },
      {
        category: 'dinner',
        name: 'Paneer Tikka, 2 Multigrain Rotis & Stir-Fry Greens',
        serving: '150g paneer + 2 rotis',
        calories: 670,
        protein: 38,
        carbs: 64,
        fats: 26,
        time: '08:30 PM',
      },
    ],
  },
  {
    id: 'fat_loss_1750',
    name: 'Lean Fat Loss Cut',
    subtitle: '1,740 kcal · 148g Protein · High Satiety',
    totalCalories: 1740,
    items: [
      {
        category: 'breakfast',
        name: 'Besan Chilla with Mint Chutney & Greek Yogurt',
        serving: '2 chillas + 120g curd',
        calories: 380,
        protein: 26,
        carbs: 40,
        fats: 12,
        time: '08:30 AM',
      },
      {
        category: 'lunch',
        name: 'Tandoori Chicken Salad with Quinoa & Olive Dressing',
        serving: '160g chicken + 100g quinoa',
        calories: 520,
        protein: 46,
        carbs: 42,
        fats: 16,
        time: '01:30 PM',
      },
      {
        category: 'snack',
        name: 'Roasted Makhana & Whey Isolate in Water',
        serving: '30g makhana + 1 scoop',
        calories: 250,
        protein: 28,
        carbs: 22,
        fats: 4,
        time: '05:15 PM',
      },
      {
        category: 'dinner',
        name: 'Soya Bhurji, Mixed Dal & Sauteed Broccoli',
        serving: '1 bowl bhurji + 1 bowl dal',
        calories: 590,
        protein: 48,
        carbs: 54,
        fats: 14,
        time: '08:15 PM',
      },
    ],
  },
  {
    id: 'veg_protein_2000',
    name: 'Vegetarian High-Protein',
    subtitle: '2,010 kcal · 128g Protein · Plant & Dairy',
    totalCalories: 2010,
    items: [
      {
        category: 'breakfast',
        name: 'Paneer Paratha (Light Ghee) & Curd Bowl',
        serving: '2 parathas + 150g curd',
        calories: 510,
        protein: 26,
        carbs: 56,
        fats: 19,
        time: '08:00 AM',
      },
      {
        category: 'lunch',
        name: 'Rajma Chawal Bowl with Roasted Papad & Kachumber',
        serving: '250g rajma + 160g rice',
        calories: 620,
        protein: 24,
        carbs: 94,
        fats: 13,
        time: '01:00 PM',
      },
      {
        category: 'snack',
        name: 'Peanut Butter Banana Smoothie with Whey',
        serving: '350ml glass',
        calories: 360,
        protein: 31,
        carbs: 38,
        fats: 10,
        time: '05:00 PM',
      },
      {
        category: 'dinner',
        name: 'Tofu & Bell Pepper Stir-Fry with Soya Chunks Pulao',
        serving: '150g tofu + 1 bowl pulao',
        calories: 520,
        protein: 47,
        carbs: 48,
        fats: 14,
        time: '08:30 PM',
      },
    ],
  },
  {
    id: 'muscle_gain_2600',
    name: 'Lean Muscle Surplus',
    subtitle: '2,590 kcal · 176g Protein · Performance Fuel',
    totalCalories: 2590,
    items: [
      {
        category: 'breakfast',
        name: 'Protein Oatmeal with Chia, Banana & 3 Egg Omelette',
        serving: '80g oats + 3 eggs',
        calories: 640,
        protein: 38,
        carbs: 72,
        fats: 21,
        time: '08:00 AM',
      },
      {
        category: 'lunch',
        name: 'Chicken Curry, Jeera Rice, Dal & 2 Rotis',
        serving: '200g chicken + 180g rice',
        calories: 820,
        protein: 56,
        carbs: 92,
        fats: 23,
        time: '01:30 PM',
      },
      {
        category: 'snack',
        name: 'Greek Yogurt Parfait, Mixed Nuts & Protein Shake',
        serving: '200g yogurt + 1 scoop',
        calories: 450,
        protein: 38,
        carbs: 38,
        fats: 16,
        time: '05:00 PM',
      },
      {
        category: 'dinner',
        name: 'Grilled Salmon / Paneer Steak, Sweet Potato & Greens',
        serving: '200g protein + 200g potato',
        calories: 680,
        protein: 44,
        carbs: 62,
        fats: 24,
        time: '09:00 PM',
      },
    ],
  },
];

export const WORKOUT_PRESETS: WorkoutPreset[] = [
  {
    id: 'push_day',
    name: 'Push & Shoulders',
    subtitle: '55 min · 4 exercises · Chest, Shoulders, Triceps',
    totalMinutes: 55,
    items: [
      {
        name: 'Barbell Bench Press',
        category: 'strength',
        sets: 4,
        reps: '8-10',
        weightKg: 65,
        durationMin: 18,
        caloriesBurned: 145,
        notes: 'Controlled eccentric, 90s rest',
      },
      {
        name: 'Seated Dumbbell Overhead Press',
        category: 'strength',
        sets: 3,
        reps: '10-12',
        weightKg: 20,
        durationMin: 14,
        caloriesBurned: 110,
      },
      {
        name: 'Incline Dumbbell Fly + Tricep Pushdowns',
        category: 'strength',
        sets: 3,
        reps: '12',
        weightKg: 16,
        durationMin: 13,
        caloriesBurned: 95,
      },
      {
        name: 'Incline Treadmill Walk',
        category: 'cardio',
        durationMin: 10,
        caloriesBurned: 85,
        notes: '8% incline at 5.5 km/h',
      },
    ],
  },
  {
    id: 'pull_core',
    name: 'Pull & Core',
    subtitle: '52 min · 4 exercises · Back, Biceps, Core',
    totalMinutes: 52,
    items: [
      {
        name: 'Lat Pulldown / Pull-Ups',
        category: 'strength',
        sets: 4,
        reps: '8-12',
        weightKg: 55,
        durationMin: 16,
        caloriesBurned: 130,
      },
      {
        name: 'Chest-Supported Dumbbell Row',
        category: 'strength',
        sets: 4,
        reps: '10',
        weightKg: 24,
        durationMin: 15,
        caloriesBurned: 120,
      },
      {
        name: 'Face Pulls & Hammer Curls',
        category: 'strength',
        sets: 3,
        reps: '12-15',
        weightKg: 14,
        durationMin: 12,
        caloriesBurned: 85,
      },
      {
        name: 'Hanging Leg Raises & Plank Circuit',
        category: 'mobility',
        sets: 3,
        reps: '15 / 60s',
        durationMin: 9,
        caloriesBurned: 65,
      },
    ],
  },
  {
    id: 'hiit_cardio',
    name: 'HIIT & Conditioning',
    subtitle: '40 min · 3 exercises · Metabolic Burn',
    totalMinutes: 40,
    items: [
      {
        name: 'Dynamic Joint Mobility Warm-up',
        category: 'mobility',
        durationMin: 8,
        caloriesBurned: 40,
      },
      {
        name: 'Tempo Outdoor / Treadmill Run',
        category: 'cardio',
        durationMin: 22,
        caloriesBurned: 265,
        notes: 'Zone 3-4 steady intervals',
      },
      {
        name: 'Kettlebell Swings & Mountain Climbers',
        category: 'cardio',
        sets: 4,
        reps: '40s work / 20s rest',
        weightKg: 16,
        durationMin: 10,
        caloriesBurned: 115,
      },
    ],
  },
  {
    id: 'legs_strength',
    name: 'Legs & Posterior Chain',
    subtitle: '56 min · 4 exercises · Quads, Glutes, Hamstrings',
    totalMinutes: 56,
    items: [
      {
        name: 'Barbell Back Squats',
        category: 'strength',
        sets: 4,
        reps: '6-8',
        weightKg: 85,
        durationMin: 20,
        caloriesBurned: 175,
      },
      {
        name: 'Romanian Deadlifts',
        category: 'strength',
        sets: 3,
        reps: '10',
        weightKg: 70,
        durationMin: 15,
        caloriesBurned: 130,
      },
      {
        name: 'Walking Lunges & Calf Raises',
        category: 'strength',
        sets: 3,
        reps: '12 each',
        weightKg: 15,
        durationMin: 13,
        caloriesBurned: 110,
      },
      {
        name: 'Hip Flexor & Hamstring Stretch Flow',
        category: 'mobility',
        durationMin: 8,
        caloriesBurned: 35,
      },
    ],
  },
];

export const QUICK_FOOD_CATALOG: QuickFoodOption[] = [
  { name: 'Rolled Oats + Chia + Skim Milk', category: 'breakfast', serving: '1 bowl (60g)', calories: 310, protein: 14, carbs: 46, fats: 7 },
  { name: '3 Boiled Egg Whites + 2 Whole Eggs', category: 'breakfast', serving: '5 eggs', calories: 210, protein: 24, carbs: 2, fats: 11 },
  { name: 'Paneer Bhurji + 2 Phulkas', category: 'lunch', serving: '150g paneer', calories: 520, protein: 28, carbs: 48, fats: 22 },
  { name: 'Grilled Chicken + Brown Rice Bowl', category: 'lunch', serving: '180g + 150g', calories: 560, protein: 46, carbs: 58, fats: 14 },
  { name: 'Whey Protein Isolate Shake', category: 'snack', serving: '1 scoop (32g)', calories: 130, protein: 27, carbs: 2, fats: 1 },
  { name: 'Sprouts Salad with Lemon & Peanuts', category: 'snack', serving: '150g bowl', calories: 220, protein: 14, carbs: 26, fats: 7 },
  { name: 'Dal Tadka + Jeera Rice + Salad', category: 'dinner', serving: '1 bowl + 150g', calories: 480, protein: 18, carbs: 74, fats: 11 },
  { name: 'Grilled Fish / Tofu + Roasted Veggies', category: 'dinner', serving: '200g + veggies', calories: 390, protein: 36, carbs: 22, fats: 16 },
];

export const QUICK_EXERCISE_CATALOG: QuickExerciseOption[] = [
  { name: 'Barbell Squat', category: 'strength', defaultSets: 4, defaultReps: '8', defaultWeightKg: 80, defaultDurationMin: 18, kcalPerMin: 8.5 },
  { name: 'Bench Press', category: 'strength', defaultSets: 4, defaultReps: '8-10', defaultWeightKg: 65, defaultDurationMin: 16, kcalPerMin: 7.5 },
  { name: 'Dumbbell Row', category: 'strength', defaultSets: 3, defaultReps: '10-12', defaultWeightKg: 22, defaultDurationMin: 14, kcalPerMin: 7 },
  { name: 'Running / Jogging', category: 'cardio', defaultDurationMin: 30, kcalPerMin: 11 },
  { name: 'Cycling (Moderate-Vigorous)', category: 'cardio', defaultDurationMin: 30, kcalPerMin: 9 },
  { name: 'Jump Rope Intervals', category: 'cardio', defaultDurationMin: 15, kcalPerMin: 12 },
  { name: 'Brisk Walking', category: 'cardio', defaultDurationMin: 35, kcalPerMin: 5 },
  { name: 'Yoga & Mobility Flow', category: 'mobility', defaultDurationMin: 20, kcalPerMin: 4 },
];

export function createInitialSeedState(): FitnessState {
  const today = getTodayISO();
  const goals: UserGoals = {
    name: 'Aarav Verma',
    goalMode: 'fat_loss',
    dailyCalorieTarget: 2100,
    proteinTarget: 140,
    carbsTarget: 215,
    fatsTarget: 65,
    dailyWaterMl: 3000,
    targetWeightKg: 71.0,
    weeklyWorkoutTarget: 5,
  };

  const meals: MealEntry[] = [];
  const exercises: ExerciseEntry[] = [];
  const weights: WeightLog[] = [];
  const waterLogs: WaterLog[] = [];

  // Seed past 20 days + today so 7D, 14D, and 30D progress graphs are immediately informative
  for (let offset = 20; offset >= 0; offset--) {
    const date = shiftISODate(today, -offset);
    const isToday = offset === 0;
    const dietPreset = DIET_PRESETS[offset % 2 === 0 ? 0 : 1];

    dietPreset.items.forEach((item, idx) => {
      // Slight realistic day-to-day variance
      const calVariance = isToday ? 0 : ((offset * 17 + idx * 13) % 70) - 35;
      const completed = isToday ? idx < 2 : !(offset === 4 && idx === 3);
      meals.push({
        id: generateId('meal'),
        date,
        category: item.category,
        name: item.name,
        serving: item.serving,
        calories: Math.max(80, item.calories + calVariance),
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        completed,
        time: item.time,
      });
    });

    // Rest days on offset 5, 12, 19
    if (offset % 7 !== 5) {
      const workoutPreset = WORKOUT_PRESETS[offset % WORKOUT_PRESETS.length];
      workoutPreset.items.forEach((ex, idx) => {
        const completed = isToday ? idx === 0 : true;
        exercises.push({
          id: generateId('ex'),
          date,
          name: ex.name,
          category: ex.category,
          sets: ex.sets,
          reps: ex.reps,
          weightKg: ex.weightKg,
          durationMin: ex.durationMin,
          caloriesBurned: ex.caloriesBurned,
          completed,
          notes: ex.notes,
        });
      });
    }

    // Weight logs every 2 days + today (gentle downward trajectory toward 71 kg)
    if (offset % 2 === 0 || offset === 0) {
      const progress = (20 - offset) / 20;
      const fluctuation = Math.sin(offset * 1.1) * 0.18;
      const w = Number((74.6 - progress * 2.1 + fluctuation).toFixed(1));
      weights.push({
        date,
        weightKg: w,
        note: offset === 0 ? 'Morning fasted check-in' : undefined,
      });
    }

    waterLogs.push({
      date,
      ml: isToday ? 1750 : 2250 + ((offset * 250) % 1000),
    });
  }

  return {
    meals,
    exercises,
    weights,
    waterLogs,
    goals,
    theme: 'light',
  };
}
