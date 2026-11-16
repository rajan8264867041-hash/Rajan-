import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Timer,
  Trash2,
} from 'lucide-react';
import { WORKOUT_PRESETS, WorkoutPreset } from '../data/presets';
import { ExerciseCategory, ExerciseEntry } from '../types/fitness';
import { formatDisplayDate, getTodayISO, shiftISODate } from '../utils/dateUtils';

interface ExerciseViewProps {
  exercises: ExerciseEntry[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleExercise: (id: string) => void;
  onDeleteExercise: (id: string) => void;
  onApplyWorkoutPreset: (date: string, preset: WorkoutPreset) => void;
  onOpenAddExercise: (category?: ExerciseCategory) => void;
}

export const ExerciseView: React.FC<ExerciseViewProps> = ({
  exercises,
  selectedDate,
  onSelectDate,
  onToggleExercise,
  onDeleteExercise,
  onApplyWorkoutPreset,
  onOpenAddExercise,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ExerciseCategory>('all');
  const [showPresets, setShowPresets] = useState(false);

  // Built-in Rest / Interval Timer
  const [timerPresetSec, setTimerPresetSec] = useState(60);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const setTimerDuration = (sec: number) => {
    setTimerRunning(false);
    setTimerPresetSec(sec);
    setSecondsLeft(sec);
  };

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const dayExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (ex.date !== selectedDate) return false;
      if (categoryFilter !== 'all' && ex.category !== categoryFilter) return false;
      if (q && !ex.name.toLowerCase().includes(q) && !(ex.notes ?? '').toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [exercises, selectedDate, searchQuery, categoryFilter]);

  const allDayExercises = useMemo(
    () => exercises.filter((ex) => ex.date === selectedDate),
    [exercises, selectedDate]
  );

  const summary = useMemo(() => {
    const completed = allDayExercises.filter((e) => e.completed);
    return {
      completedCount: completed.length,
      totalCount: allDayExercises.length,
      durationMin: completed.reduce((s, e) => s + e.durationMin, 0),
      caloriesBurned: completed.reduce((s, e) => s + e.caloriesBurned, 0),
      plannedCalories: allDayExercises.reduce((s, e) => s + e.caloriesBurned, 0),
    };
  }, [allDayExercises]);

  return (
    <div className="space-y-6">
      {/* Date Navigation & Actions */}
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
            {showPresets ? 'Hide Workout Splits' : 'Load Workout Split'}
          </button>
          <button
            type="button"
            onClick={() => onOpenAddExercise()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Log Exercise
          </button>
        </div>
      </div>

      {/* Expandable Workout Splits */}
      {showPresets && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Structured Workout Splits
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Applying a split replaces planned exercises for {formatDisplayDate(selectedDate)}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {WORKOUT_PRESETS.map((preset) => (
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
                    onApplyWorkoutPreset(selectedDate, preset);
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

      {/* Session Metrics + Interval Timer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="grid grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {summary.completedCount} / {summary.totalCount}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">exercises done</p>
          </div>
          <div className="border-l border-slate-100 pl-4 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Time</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {summary.durationMin}
              <span className="ml-1 text-sm font-normal text-slate-500">min</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">logged session</p>
          </div>
          <div className="border-l border-slate-100 pl-4 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Calories Burned</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
              {summary.caloriesBurned}
              <span className="ml-1 text-sm font-normal text-slate-500">kcal</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              of {summary.plannedCalories} planned
            </p>
          </div>
        </section>

        {/* Built-in Rest & Set Timer */}
        <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Rest & Interval Timer
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[45, 60, 90, 180].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setTimerDuration(sec)}
                  className={`rounded px-2 py-1 font-mono text-xs transition-colors ${
                    timerPresetSec === sec
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span
              className={`font-mono text-3xl font-semibold tabular-nums ${
                secondsLeft === 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {formatClock(secondsLeft)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (secondsLeft === 0) setSecondsLeft(timerPresetSec);
                  setTimerRunning((r) => !r);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap"
              >
                {timerRunning ? (
                  <>
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    {secondsLeft === 0 ? 'Restart' : 'Start'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setTimerDuration(timerPresetSec)}
                aria-label="Reset timer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Exercise Log Table */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(
              [
                { key: 'all', label: 'All Exercises' },
                { key: 'strength', label: 'Strength' },
                { key: 'cardio', label: 'Cardio' },
                { key: 'mobility', label: 'Mobility' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCategoryFilter(tab.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === tab.key
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tab.label}
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
              placeholder="Search exercises..."
              aria-label="Search exercises"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {dayExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Dumbbell className="h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              No exercises scheduled for {formatDisplayDate(selectedDate)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Log an individual workout or apply a split template above.
            </p>
            <button
              type="button"
              onClick={() =>
                onOpenAddExercise(categoryFilter === 'all' ? 'strength' : categoryFilter)
              }
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Log First Exercise
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2.5 pr-3">Done</th>
                  <th className="py-2.5 pr-4">Exercise</th>
                  <th className="py-2.5 pr-4">Category</th>
                  <th className="py-2.5 pr-4 text-right">Volume / Load</th>
                  <th className="py-2.5 pr-4 text-right">Duration</th>
                  <th className="py-2.5 pr-4 text-right">Burned</th>
                  <th className="py-2.5 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dayExercises.map((ex) => (
                  <tr
                    key={ex.id}
                    className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3 pr-3 align-middle">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={ex.completed}
                        aria-label={`Mark ${ex.name} as ${ex.completed ? 'incomplete' : 'complete'}`}
                        onClick={() => onToggleExercise(ex.id)}
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          ex.completed
                            ? 'border-amber-600 bg-amber-600 text-white dark:border-amber-500 dark:bg-amber-500'
                            : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'
                        }`}
                      >
                        {ex.completed && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      </button>
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      <p
                        className={`text-sm font-medium ${
                          ex.completed
                            ? 'text-slate-400 line-through dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {ex.name}
                      </p>
                      {ex.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{ex.notes}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 align-middle text-xs capitalize text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {ex.category}
                    </td>
                    <td className="py-3 pr-4 align-middle text-right font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                      {ex.sets && ex.reps
                        ? `${ex.sets} × ${ex.reps}${ex.weightKg ? ` @ ${ex.weightKg}kg` : ''}`
                        : '--'}
                    </td>
                    <td className="py-3 pr-4 align-middle text-right font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                      {ex.durationMin} min
                    </td>
                    <td className="py-3 pr-4 align-middle text-right font-mono text-sm font-semibold text-amber-700 dark:text-amber-400 tabular-nums whitespace-nowrap">
                      {ex.caloriesBurned} kcal
                    </td>
                    <td className="py-3 text-right align-middle">
                      <button
                        type="button"
                        onClick={() => onDeleteExercise(ex.id)}
                        aria-label={`Delete ${ex.name}`}
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
