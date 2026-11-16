import { DailyAggregate, ExerciseEntry, FitnessState, MealEntry, WeightLog } from '../types/fitness';
import { formatShortDate, getRecentDateRange, getTodayISO, shiftISODate } from './dateUtils';

const STORAGE_KEY = 'vitaltrack_fitness_state_v1';

export function loadFitnessState(fallbackFactory: () => FitnessState): FitnessState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallbackFactory();
    const parsed = JSON.parse(raw) as Partial<FitnessState>;
    if (!parsed || !Array.isArray(parsed.meals) || !Array.isArray(parsed.exercises) || !parsed.goals) {
      return fallbackFactory();
    }
    return {
      meals: parsed.meals,
      exercises: parsed.exercises,
      weights: Array.isArray(parsed.weights) ? parsed.weights : [],
      waterLogs: Array.isArray(parsed.waterLogs) ? parsed.waterLogs : [],
      goals: parsed.goals,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch {
    return fallbackFactory();
  }
}

export function saveFitnessState(state: FitnessState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors gracefully
  }
}

export function clearFitnessState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function computeDailyAggregates(state: FitnessState, days: number): DailyAggregate[] {
  const dates = getRecentDateRange(days, getTodayISO());
  const weightMap = new Map<string, number>();
  const sortedWeights = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
  for (const w of sortedWeights) {
    weightMap.set(w.date, w.weightKg);
  }

  return dates.map((date) => {
    const dayMeals = state.meals.filter((m) => m.date === date);
    const completedMeals = dayMeals.filter((m) => m.completed);
    const dayExercises = state.exercises.filter((e) => e.date === date);
    const completedExercises = dayExercises.filter((e) => e.completed);
    const waterEntry = state.waterLogs.find((w) => w.date === date);

    const caloriesIn = completedMeals.reduce((sum, m) => sum + m.calories, 0);
    const caloriesPlanned = dayMeals.reduce((sum, m) => sum + m.calories, 0);
    const caloriesBurned = completedExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

    const strengthMinutes = completedExercises
      .filter((e) => e.category === 'strength')
      .reduce((sum, e) => sum + e.durationMin, 0);
    const cardioMinutes = completedExercises
      .filter((e) => e.category === 'cardio')
      .reduce((sum, e) => sum + e.durationMin, 0);
    const mobilityMinutes = completedExercises
      .filter((e) => e.category === 'mobility')
      .reduce((sum, e) => sum + e.durationMin, 0);

    return {
      date,
      label: formatShortDate(date),
      caloriesIn,
      caloriesPlanned,
      caloriesBurned,
      netCalories: caloriesIn - caloriesBurned,
      protein: completedMeals.reduce((sum, m) => sum + m.protein, 0),
      carbs: completedMeals.reduce((sum, m) => sum + m.carbs, 0),
      fats: completedMeals.reduce((sum, m) => sum + m.fats, 0),
      workoutMinutes: strengthMinutes + cardioMinutes + mobilityMinutes,
      strengthMinutes,
      cardioMinutes,
      mobilityMinutes,
      exercisesCompleted: completedExercises.length,
      mealsCompleted: completedMeals.length,
      waterMl: waterEntry ? waterEntry.ml : 0,
      weightKg: weightMap.get(date) ?? null,
    };
  });
}

export function computeActiveStreak(meals: MealEntry[], exercises: ExerciseEntry[]): number {
  const today = getTodayISO();
  let streak = 0;

  for (let offset = 0; offset < 60; offset++) {
    const d = shiftISODate(today, -offset);
    const hasMeal = meals.some((m) => m.date === d && m.completed);
    const hasExercise = exercises.some((e) => e.date === d && e.completed);
    if (hasMeal || hasExercise) {
      streak++;
    } else if (offset === 0) {
      // Today not logged yet — check yesterday before breaking streak
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function getLatestWeight(weights: WeightLog[]): WeightLog | null {
  if (weights.length === 0) return null;
  return [...weights].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function exportProgressCSV(state: FitnessState, days: number = 30): void {
  const rows = computeDailyAggregates(state, days);
  const header = [
    'Date',
    'Calories Consumed (kcal)',
    'Calories Burned (kcal)',
    'Net Calories (kcal)',
    'Protein (g)',
    'Carbs (g)',
    'Fats (g)',
    'Workout Duration (min)',
    'Water Intake (ml)',
    'Weight (kg)',
  ];
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [
        r.date,
        r.caloriesIn,
        r.caloriesBurned,
        r.netCalories,
        r.protein,
        r.carbs,
        r.fats,
        r.workoutMinutes,
        r.waterMl,
        r.weightKg ?? '',
      ].join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `kayaforge-progress-${getTodayISO()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
