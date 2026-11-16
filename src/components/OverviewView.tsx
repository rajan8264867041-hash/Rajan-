import React, { useMemo, useState } from 'react';
import { Check, Droplets, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { ExerciseEntry, FitnessState, MealEntry, NavSection } from '../types/fitness';
import { getTodayISO } from '../utils/dateUtils';
import { computeActiveStreak, computeDailyAggregates, getLatestWeight } from '../utils/storage';
import { CalorieBalanceChart, MacroAdherenceBars, WeightTrendChart } from './Charts';

interface OverviewViewProps {
  state: FitnessState;
  onToggleMeal: (id: string) => void;
  onToggleExercise: (id: string) => void;
  onAdjustWater: (date: string, deltaMl: number) => void;
  onNavigate: (section: NavSection) => void;
  onOpenQuickLog: (tab: 'meal' | 'exercise' | 'weight') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  state,
  onToggleMeal,
  onToggleExercise,
  onAdjustWater,
  onNavigate,
  onOpenQuickLog,
}) => {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(14);
  const today = getTodayISO();

  const dailyData = useMemo(() => computeDailyAggregates(state, rangeDays), [state, rangeDays]);
  const todayAgg = dailyData[dailyData.length - 1];

  const todayMeals = useMemo(
    () => state.meals.filter((m) => m.date === today),
    [state.meals, today]
  );
  const todayExercises = useMemo(
    () => state.exercises.filter((e) => e.date === today),
    [state.exercises, today]
  );

  const streak = useMemo(
    () => computeActiveStreak(state.meals, state.exercises),
    [state.meals, state.exercises]
  );
  const latestWeight = useMemo(() => getLatestWeight(state.weights), [state.weights]);

  const weightDelta = useMemo(() => {
    const sorted = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length < 2) return null;
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return Number((last.weightKg - first.weightKg).toFixed(1));
  }, [state.weights]);

  const caloriesRemaining = state.goals.dailyCalorieTarget - (todayAgg?.caloriesIn ?? 0);
  const proteinPct = state.goals.proteinTarget
    ? Math.round(((todayAgg?.protein ?? 0) / state.goals.proteinTarget) * 100)
    : 0;
  const completedMealsCount = todayMeals.filter((m) => m.completed).length;
  const completedExercisesCount = todayExercises.filter((e) => e.completed).length;

  return (
    <div className="space-y-6">
      {/* Top 4-Column KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Calories Consumed</span>
            <span className="font-mono tabular-nums">Target {state.goals.dailyCalorieTarget.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {(todayAgg?.caloriesIn ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">kcal</span>
          </div>
          <p
            className={`mt-2 text-xs font-medium tabular-nums ${
              caloriesRemaining >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {caloriesRemaining >= 0
              ? `${caloriesRemaining.toLocaleString()} kcal remaining today`
              : `${Math.abs(caloriesRemaining).toLocaleString()} kcal over daily target`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Active Burn</span>
            <span className="font-mono tabular-nums">{todayAgg?.workoutMinutes ?? 0} min</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {(todayAgg?.caloriesBurned ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">kcal</span>
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
            {completedExercisesCount} of {todayExercises.length} planned exercises done
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Protein Intake</span>
            <span className="font-mono tabular-nums">{proteinPct}% of goal</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {todayAgg?.protein ?? 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              / {state.goals.proteinTarget} g
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
            {completedMealsCount} of {todayMeals.length} diet meals logged
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Body Weight</span>
            <span className="font-mono tabular-nums">{streak}d active streak</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {latestWeight ? latestWeight.weightKg.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              kg · Goal {state.goals.targetWeightKg.toFixed(1)} kg
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {weightDelta !== null ? (
              <span
                className={`inline-flex items-center gap-1 font-medium tabular-nums ${
                  weightDelta <= 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {weightDelta <= 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg since start
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">Log weight to track trend</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Focal Section: Calorie Balance Graph + Today's Checklist */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Dominant Focal Anchor: Progress Graph */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Calorie Intake & Exercise Burn
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Daily nutrition vs. active workout expenditure over the last {rangeDays} days
              </p>
            </div>
            <div
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
              role="group"
              aria-label="Select date range"
            >
              {([7, 14, 30] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setRangeDays(days)}
                  className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    rangeDays === days
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>

          <CalorieBalanceChart
            data={dailyData}
            calorieTarget={state.goals.dailyCalorieTarget}
            height={270}
          />
        </section>

        {/* Today's Actionable Diet & Exercise Checklist */}
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Today's Plan
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Check off meals & exercises to update progress
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('diet')}
              className="whitespace-nowrap shrink-0 text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Open Full Plan
            </button>
          </div>

          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800">
            {todayMeals.length === 0 && todayExercises.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No meals or workouts scheduled for today yet.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenQuickLog('meal')}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Log First Entry
                </button>
              </div>
            ) : (
              <>
                {todayMeals.slice(0, 4).map((meal: MealEntry) => (
                  <label
                    key={meal.id}
                    className="flex cursor-pointer items-center justify-between gap-3 py-2.5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={meal.completed}
                        onClick={() => onToggleMeal(meal.id)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          meal.completed
                            ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
                            : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'
                        }`}
                      >
                        {meal.completed && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      </button>
                      <div className="min-w-0">
                        <p
                          className={`truncate text-sm font-medium ${
                            meal.completed
                              ? 'text-slate-400 line-through dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {meal.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <span className="capitalize">{meal.category}</span>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span>{meal.time}</span>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{meal.protein}g protein</span>
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap shrink-0">
                      {meal.calories} kcal
                    </span>
                  </label>
                ))}

                {todayExercises.slice(0, 3).map((ex: ExerciseEntry) => (
                  <label
                    key={ex.id}
                    className="flex cursor-pointer items-center justify-between gap-3 py-2.5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={ex.completed}
                        onClick={() => onToggleExercise(ex.id)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          ex.completed
                            ? 'border-amber-600 bg-amber-600 text-white dark:border-amber-500 dark:bg-amber-500'
                            : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'
                        }`}
                      >
                        {ex.completed && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      </button>
                      <div className="min-w-0">
                        <p
                          className={`truncate text-sm font-medium ${
                            ex.completed
                              ? 'text-slate-400 line-through dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {ex.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <span className="capitalize">{ex.category}</span>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {ex.sets && ex.reps ? `${ex.sets} × ${ex.reps}` : `${ex.durationMin} min`}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-medium text-amber-700 dark:text-amber-400 tabular-nums whitespace-nowrap shrink-0">
                      -{ex.caloriesBurned} kcal
                    </span>
                  </label>
                ))}
              </>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onNavigate('exercise')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white whitespace-nowrap shrink-0"
            >
              Manage Workouts
            </button>
            <button
              type="button"
              onClick={() => onOpenQuickLog('exercise')}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Exercise
            </button>
          </div>
        </section>
      </div>

      {/* Secondary Row: Weight Trajectory + Macros & Hydration */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Weight Progress
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Tracked body weight compared against your {state.goals.targetWeightKg.toFixed(1)} kg target
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenQuickLog('weight')}
              className="whitespace-nowrap shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Log Weight
            </button>
          </div>
          <WeightTrendChart
            data={dailyData}
            targetWeightKg={state.goals.targetWeightKg}
            height={210}
          />
        </section>

        <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Today's Macronutrients
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Completed meals vs. daily gram targets
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('progress')}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 whitespace-nowrap shrink-0"
              >
                All Graphs
              </button>
            </div>

            <MacroAdherenceBars
              protein={todayAgg?.protein ?? 0}
              carbs={todayAgg?.carbs ?? 0}
              fats={todayAgg?.fats ?? 0}
              proteinTarget={state.goals.proteinTarget}
              carbsTarget={state.goals.carbsTarget}
              fatsTarget={state.goals.fatsTarget}
            />
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Droplets className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Hydration
                  </p>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {(todayAgg?.waterMl ?? 0).toLocaleString()} / {state.goals.dailyWaterMl.toLocaleString()} ml
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAdjustWater(today, -250)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  -250ml
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustWater(today, 250)}
                  className="rounded-lg bg-sky-600 px-3 py-1.5 font-mono text-xs font-medium text-white hover:bg-sky-700 whitespace-nowrap shrink-0"
                >
                  +250ml
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
