import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { QUICK_EXERCISE_CATALOG, QUICK_FOOD_CATALOG } from '../data/presets';
import { ExerciseCategory, ExerciseEntry, MealCategory, MealEntry } from '../types/fitness';
import { generateId } from '../utils/dateUtils';

interface QuickLogModalProps {
  isOpen: boolean;
  initialTab: 'meal' | 'exercise' | 'weight';
  defaultDate: string;
  initialMealCategory?: MealCategory;
  initialExerciseCategory?: ExerciseCategory;
  onClose: () => void;
  onAddMeal: (meal: MealEntry) => void;
  onAddExercise: (exercise: ExerciseEntry) => void;
  onAddWeight: (date: string, weightKg: number, note?: string) => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  initialTab,
  defaultDate,
  initialMealCategory = 'breakfast',
  initialExerciseCategory = 'strength',
  onClose,
  onAddMeal,
  onAddExercise,
  onAddWeight,
}) => {
  const [tab, setTab] = useState<'meal' | 'exercise' | 'weight'>(initialTab);
  const [date, setDate] = useState(defaultDate);

  // Meal fields
  const [mealCategory, setMealCategory] = useState<MealCategory>(initialMealCategory);
  const [mealName, setMealName] = useState('');
  const [mealServing, setMealServing] = useState('1 serving');
  const [mealCalories, setMealCalories] = useState('350');
  const [mealProtein, setMealProtein] = useState('25');
  const [mealCarbs, setMealCarbs] = useState('35');
  const [mealFats, setMealFats] = useState('10');
  const [mealTime, setMealTime] = useState('12:30 PM');
  const [mealCompleted, setMealCompleted] = useState(true);

  // Exercise fields
  const [exCategory, setExCategory] = useState<ExerciseCategory>(initialExerciseCategory);
  const [exName, setExName] = useState('');
  const [exSets, setExSets] = useState('3');
  const [exReps, setExReps] = useState('10-12');
  const [exWeight, setExWeight] = useState('');
  const [exDuration, setExDuration] = useState('30');
  const [exCalories, setExCalories] = useState('220');
  const [exNotes, setExNotes] = useState('');
  const [exCompleted, setExCompleted] = useState(true);

  // Weight fields
  const [weightKg, setWeightKg] = useState('');
  const [weightNote, setWeightNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setDate(defaultDate);
      setMealCategory(initialMealCategory);
      setExCategory(initialExerciseCategory);
    }
  }, [isOpen, initialTab, defaultDate, initialMealCategory, initialExerciseCategory]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const applyFoodPreset = (idx: number) => {
    const item = QUICK_FOOD_CATALOG[idx];
    if (!item) return;
    setMealCategory(item.category);
    setMealName(item.name);
    setMealServing(item.serving);
    setMealCalories(String(item.calories));
    setMealProtein(String(item.protein));
    setMealCarbs(String(item.carbs));
    setMealFats(String(item.fats));
  };

  const applyExercisePreset = (idx: number) => {
    const item = QUICK_EXERCISE_CATALOG[idx];
    if (!item) return;
    setExCategory(item.category);
    setExName(item.name);
    setExSets(item.defaultSets ? String(item.defaultSets) : '');
    setExReps(item.defaultReps ?? '');
    setExWeight(item.defaultWeightKg ? String(item.defaultWeightKg) : '');
    setExDuration(String(item.defaultDurationMin));
    setExCalories(String(Math.round(item.defaultDurationMin * item.kcalPerMin)));
  };

  const handleMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;
    onAddMeal({
      id: generateId('meal'),
      date,
      category: mealCategory,
      name: mealName.trim(),
      serving: mealServing.trim() || '1 serving',
      calories: Math.max(0, Number(mealCalories) || 0),
      protein: Math.max(0, Number(mealProtein) || 0),
      carbs: Math.max(0, Number(mealCarbs) || 0),
      fats: Math.max(0, Number(mealFats) || 0),
      completed: mealCompleted,
      time: mealTime.trim() || '12:00 PM',
    });
    setMealName('');
    onClose();
  };

  const handleExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exName.trim()) return;
    onAddExercise({
      id: generateId('ex'),
      date,
      name: exName.trim(),
      category: exCategory,
      sets: exSets ? Number(exSets) : undefined,
      reps: exReps.trim() || undefined,
      weightKg: exWeight ? Number(exWeight) : undefined,
      durationMin: Math.max(1, Number(exDuration) || 15),
      caloriesBurned: Math.max(0, Number(exCalories) || 0),
      completed: exCompleted,
      notes: exNotes.trim() || undefined,
    });
    setExName('');
    setExNotes('');
    onClose();
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightKg);
    if (!Number.isFinite(w) || w < 25 || w > 300) return;
    onAddWeight(date, Number(w.toFixed(1)), weightNote.trim() || undefined);
    setWeightKg('');
    setWeightNote('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quick log entry"
    >
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(
              [
                { key: 'meal', label: 'Log Meal' },
                { key: 'exercise', label: 'Log Exercise' },
                { key: 'weight', label: 'Log Weight' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  tab === item.key
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {tab === 'meal' && (
          <form onSubmit={handleMealSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Quick-Fill from Common Meals
              </label>
              <select
                defaultValue=""
                onChange={(e) => applyFoodPreset(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="" disabled>
                  Select a preset meal or type custom below...
                </option>
                {QUICK_FOOD_CATALOG.map((item, idx) => (
                  <option key={item.name} value={idx}>
                    {item.name} ({item.calories} kcal · {item.protein}g P)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Meal Slot
                </label>
                <select
                  value={mealCategory}
                  onChange={(e) => setMealCategory(e.target.value as MealCategory)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snack">Evening Snack</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Meal Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Paneer Bhurji & 2 Multigrain Rotis"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Portion / Serving
                </label>
                <input
                  type="text"
                  value={mealServing}
                  onChange={(e) => setMealServing(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Time
                </label>
                <input
                  type="text"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Calories
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Protein (g)
                </label>
                <input
                  type="number"
                  min={0}
                  value={mealProtein}
                  onChange={(e) => setMealProtein(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  min={0}
                  value={mealCarbs}
                  onChange={(e) => setMealCarbs(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Fats (g)
                </label>
                <input
                  type="number"
                  min={0}
                  value={mealFats}
                  onChange={(e) => setMealFats(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={mealCompleted}
                onChange={(e) => setMealCompleted(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Mark as eaten immediately
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Save Meal
              </button>
            </div>
          </form>
        )}

        {tab === 'exercise' && (
          <form onSubmit={handleExerciseSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Quick-Fill from Exercise Catalog
              </label>
              <select
                defaultValue=""
                onChange={(e) => applyExercisePreset(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="" disabled>
                  Select an exercise preset or enter custom...
                </option>
                {QUICK_EXERCISE_CATALOG.map((item, idx) => (
                  <option key={item.name} value={idx}>
                    {item.name} ({item.category} · {item.defaultDurationMin} min)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={exCategory}
                  onChange={(e) => setExCategory(e.target.value as ExerciseCategory)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="mobility">Mobility</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Exercise Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Barbell Squat or 5km Tempo Run"
                value={exName}
                onChange={(e) => setExName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Sets (opt)
                </label>
                <input
                  type="number"
                  min={1}
                  value={exSets}
                  onChange={(e) => setExSets(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Reps (opt)
                </label>
                <input
                  type="text"
                  placeholder="8-12"
                  value={exReps}
                  onChange={(e) => setExReps(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Load kg (opt)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={exWeight}
                  onChange={(e) => setExWeight(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Duration (min)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={exDuration}
                  onChange={(e) => setExDuration(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Est. Calories Burned
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={exCalories}
                  onChange={(e) => setExCalories(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Session Notes (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Felt strong on final set"
                value={exNotes}
                onChange={(e) => setExNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={exCompleted}
                onChange={(e) => setExCompleted(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              Mark exercise as completed
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Save Exercise
              </button>
            </div>
          </form>
        )}

        {tab === 'weight' && (
          <form onSubmit={handleWeightSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Weigh-In Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Body Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min={25}
                max={300}
                required
                placeholder="e.g., 72.4"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Note (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Morning fasted weigh-in"
                value={weightNote}
                onChange={(e) => setWeightNote(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Save Weight
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
