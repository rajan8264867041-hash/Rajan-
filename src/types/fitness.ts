export type MealCategory = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  category: MealCategory;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed: boolean;
  time: string;
}

export type ExerciseCategory = 'strength' | 'cardio' | 'mobility';

export interface ExerciseEntry {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  category: ExerciseCategory;
  sets?: number;
  reps?: string;
  weightKg?: number;
  durationMin: number;
  caloriesBurned: number;
  completed: boolean;
  notes?: string;
}

export interface WeightLog {
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  ml: number;
}

export type GoalMode = 'fat_loss' | 'maintenance' | 'muscle_gain';

export interface UserGoals {
  name: string;
  goalMode: GoalMode;
  dailyCalorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  dailyWaterMl: number;
  targetWeightKg: number;
  weeklyWorkoutTarget: number;
}

export interface FitnessState {
  meals: MealEntry[];
  exercises: ExerciseEntry[];
  weights: WeightLog[];
  waterLogs: WaterLog[];
  goals: UserGoals;
  theme: 'light' | 'dark';
}

export interface DailyAggregate {
  date: string;
  label: string;
  caloriesIn: number;
  caloriesPlanned: number;
  caloriesBurned: number;
  netCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  workoutMinutes: number;
  strengthMinutes: number;
  cardioMinutes: number;
  mobilityMinutes: number;
  exercisesCompleted: number;
  mealsCompleted: number;
  waterMl: number;
  weightKg: number | null;
}

export type NavSection = 'overview' | 'diet' | 'exercise' | 'progress' | 'search' | 'goals';
