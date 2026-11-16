import React, { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Droplets, Plus, Search, Trash2, Utensils } from 'lucide-react';
import { DIET_PRESETS, DietPlanPreset } from '../data/presets';
import { MealCategory, MealEntry, UserGoals } from '../types/fitness';
import { formatDisplayDate, getTodayISO, shiftISODate } from '../utils/dateUtils';
import { MacroAdherenceBars } from './Charts';

interface DietPlanViewProps {
  meals: MealEntry[];
  waterMl: number;
  goals: UserGoals;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleMeal: (id: string) => void;
  onDeleteMeal: (id: string) => void;
  onApplyDietPreset: (date: string, preset: DietPlanPreset) => void;
  onAdjustWater: (date: string, deltaMl: number) => void;
  onOpenAddMeal: (category?: MealCategory) => void;
}

const CATEGORIES: { key: MealCategory; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'snack', label: 'Evening Snack' },
  { key: 'dinner', label: 'Dinner' },
];

export const DietPlanView: React.FC<DietPlanViewProps> = ({
  meals,
  waterMl,
  goals,
  selectedDate,
  onSelectDate,
  onToggleMeal,
  onDeleteMeal,
  onApplyDietPreset,
  onAdjustWater,
  onOpenAddMeal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | MealCategory>('all');
  const [showPresets, setShowPresets] = useState(false);

  const dayMeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return meals.filter((m) => {
      if (m.date !== selectedDate) return false;
      if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
      if (q && !m.name.toLowerCase().includes(q) && !m.serving.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [meals, selectedDate, searchQuery, categoryFilter]);

  const allDayMeals = useMemo(
    () => meals.filter((m) => m.date === selectedDate),
    [meals, selectedDate]
  );

  const totals = useMemo(() => {
    const completed = allDayMeals.filter((m) => m.completed);
    return {
      plannedCalories: allDayMeals.reduce((s, m) => s + m.calories, 0),
      consumedCalories: completed.reduce((s, m) => s + m.calories, 0),
      protein: completed.reduce((s, m) => s + m.protein, 0),
      carbs: completed.reduce((s, m) => s + m.carbs, 0),
      fats: completed.reduce((s, m) => s + m.fats, 0),
      completedCount: completed.length,
    };
  }, [allDayMeals]);

  const caloriePct = goals.dailyCalorieTarget
    ? Math.min(100, Math.round((totals.consumedCalories / goals.dailyCalorieTarget) * 100))
    : 0;
  const waterPct = goals.dailyWaterMl
    ? Math.min(100, Math.round((waterMl / goals.dailyWaterMl) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Date Navigation & Primary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectDate(shiftISODate(selectedDate, -1))}
            aria-label="Previous day"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-[140px] px-2 text-center">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {formatDisplayDate(selectedDate)}
            </p>
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {selectedDate}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectDate(shiftISODate(selectedDate, 1))}
            aria-label="Next day"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {selectedDate !== getTodayISO() && (
            <button
              type="button"
              onClick={() => onSelectDate(getTodayISO())}
              className="ml-1 rounded-lg px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 whitespace-nowrap shrink-0"
            >
              Jump to Today
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPresets((v) => !v)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            {showPresets ? 'Hide Diet Templates' : 'Load Diet Template'}
          </button>
          <button
            type="button"
            onClick={() => onOpenAddMeal()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add Meal
          </button>
        </div>
      </div>

      {/* Expandable Diet Templates Strip */}
      {showPresets && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Curated Diet Plan Templates
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Applying a template replaces scheduled meals for {formatDisplayDate(selectedDate)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {DIET_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="flex flex-col justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800"
              >
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {preset.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {preset.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onApplyDietPreset(selectedDate, preset);
                    setShowPresets(false);
                  }}
                  className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white whitespace-nowrap"
                >
                  Apply to {formatDisplayDate(selectedDate)}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily Budget & Macro Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Calorie & Hydration Budget
            </h2>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {totals.completedCount}/{allDayMeals.length} meals eaten
            </span>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Consumed Calories
                </span>
                <span className="font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                  {totals.consumedCalories.toLocaleString()} / {goals.dailyCalorieTarget.toLocaleString()} kcal ({caloriePct}%)
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    totals.consumedCalories > goals.dailyCalorieTarget
                      ? 'bg-rose-600 dark:bg-rose-500'
                      : 'bg-emerald-600 dark:bg-emerald-500'
                  }`}
                  style={{ width: `${caloriePct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Planned total for day: {totals.plannedCalories.toLocaleString()} kcal
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Water Intake
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                  {waterMl.toLocaleString()} / {goals.dailyWaterMl.toLocaleString()} ml ({waterPct}%)
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-sky-600 transition-all duration-300 dark:bg-sky-400"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAdjustWater(selectedDate, -250)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  -250 ml
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustWater(selectedDate, 250)}
                  className="rounded-lg bg-sky-600 px-3 py-1.5 font-mono text-xs font-medium text-white hover:bg-sky-700"
                >
                  +250 ml
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustWater(selectedDate, 500)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  +500 ml
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Macronutrient Progress
          </h2>
          <MacroAdherenceBars
            protein={totals.protein}
            carbs={totals.carbs}
            fats={totals.fats}
            proteinTarget={goals.proteinTarget}
            carbsTarget={goals.carbsTarget}
            fatsTarget={goals.fatsTarget}
          />
        </section>
      </div>

      {/* Filter Toolbar & Meal Schedule */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All Meals
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategoryFilter(cat.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === cat.key
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter meals..."
              aria-label="Filter meals"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {dayMeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Utensils className="h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              No meals logged for {formatDisplayDate(selectedDate)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Add a custom meal or load one of the structured diet plan templates above.
            </p>
            <button
              type="button"
              onClick={() => onOpenAddMeal(categoryFilter === 'all' ? 'breakfast' : categoryFilter)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add First Meal
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2.5 pr-3">Status</th>
                  <th className="py-2.5 pr-4">Meal & Portion</th>
                  <th className="py-2.5 pr-4">Slot</th>
                  <th className="py-2.5 pr-4 text-right">Protein</th>
                  <th className="py-2.5 pr-4 text-right">Carbs</th>
                  <th className="py-2.5 pr-4 text-right">Fats</th>
                  <th className="py-2.5 pr-4 text-right">Calories</th>
                  <th className="py-2.5 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dayMeals.map((meal) => (
                  <tr
                    key={meal.id}
                    className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3 pr-3 align-middle">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={meal.completed}
                        aria-label={`Mark ${meal.name} as ${meal.completed ? 'not eaten' : 'eaten'}`}
                        onClick={() => onToggleMeal(meal.id)}
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          meal.completed
                            ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
                            : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'
                        }`}
                      >
                        {meal.completed && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      </button>
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      <p
                        className={`text-sm font-medium ${
                          meal.completed
                            ? 'text-slate-400 line-through dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {meal.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {meal.serving} · {meal.time}
                      </p>
                    </td>
                    <td className="py-3 pr-4 align-middle text-xs capitalize text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {meal.category}
                    </td>
                    <td className="py-3 pr-4 align-middle text-right font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                      {meal.protein}g
                    </td>
                    <td className="py-3 pr-4 align-middle text-right font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                      {meal.carbs}g
                    </td>
                    <td className="py-3 pr-4 align-middle text-right font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                      {meal.fats}g
                    </td>
                    <td className="py-3 pr-4 align-middle text-right font-mono text-sm font-semibold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                      {meal.calories} kcal
                    </td>
                    <td className="py-3 text-right align-middle">
                      <button
                        type="button"
                        onClick={() => onDeleteMeal(meal.id)}
                        aria-label={`Delete ${meal.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
