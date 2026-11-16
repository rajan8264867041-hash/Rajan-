import React, { useMemo, useState } from 'react';
import { Download, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { FitnessState } from '../types/fitness';
import { formatShortDate, getTodayISO } from '../utils/dateUtils';
import { computeDailyAggregates, exportProgressCSV } from '../utils/storage';
import { CalorieBalanceChart, WeightTrendChart, WorkoutVolumeChart } from './Charts';

interface ProgressViewProps {
  state: FitnessState;
  onLogWeight: (date: string, weightKg: number, note?: string) => void;
  onDeleteWeight: (date: string) => void;
  onResetSampleData: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  state,
  onLogWeight,
  onDeleteWeight,
  onResetSampleData,
}) => {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(14);
  const [weightDate, setWeightDate] = useState(getTodayISO());
  const [weightVal, setWeightVal] = useState('');
  const [weightNote, setWeightNote] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const data = useMemo(() => computeDailyAggregates(state, rangeDays), [state, rangeDays]);

  const stats = useMemo(() => {
    const activeCalDays = data.filter((d) => d.caloriesIn > 0);
    const avgCaloriesIn = activeCalDays.length
      ? Math.round(activeCalDays.reduce((s, d) => s + d.caloriesIn, 0) / activeCalDays.length)
      : 0;
    const totalBurned = data.reduce((s, d) => s + d.caloriesBurned, 0);
    const totalWorkoutMin = data.reduce((s, d) => s + d.workoutMinutes, 0);
    const workoutDays = data.filter((d) => d.workoutMinutes > 0).length;

    const weightsInPeriod = data.filter((d) => d.weightKg !== null);
    const weightDelta =
      weightsInPeriod.length >= 2
        ? Number(
            (
              (weightsInPeriod[weightsInPeriod.length - 1].weightKg ?? 0) -
              (weightsInPeriod[0].weightKg ?? 0)
            ).toFixed(1)
          )
        : null;

    return { avgCaloriesIn, totalBurned, totalWorkoutMin, workoutDays, weightDelta };
  }, [data]);

  const sortedWeights = useMemo(
    () => [...state.weights].sort((a, b) => b.date.localeCompare(a.date)),
    [state.weights]
  );

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(weightVal);
    if (!Number.isFinite(parsed) || parsed < 25 || parsed > 300) return;
    onLogWeight(weightDate, Number(parsed.toFixed(1)), weightNote.trim() || undefined);
    setWeightVal('');
    setWeightNote('');
  };

  return (
    <div className="space-y-6">
      {/* Toolbar: Range Filter + Export / Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Time Horizon
          </span>
          <div
            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
            role="group"
            aria-label="Progress date range"
          >
            {([7, 14, 30] as const).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setRangeDays(days)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  rangeDays === days
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Last {days} Days
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportProgressCSV(state, rangeDays)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download CSV
          </button>

          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetSampleData();
                  setConfirmReset(false);
                }}
                className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white hover:bg-rose-700 whitespace-nowrap"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset Sample Data
            </button>
          )}
        </div>
      </div>

      {/* Period Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Daily Intake</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
            {stats.avgCaloriesIn.toLocaleString()}
            <span className="ml-1 text-xs font-normal text-slate-500">kcal</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Target {state.goals.dailyCalorieTarget.toLocaleString()} kcal / day
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Active Burn
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
            {stats.totalBurned.toLocaleString()}
            <span className="ml-1 text-xs font-normal text-slate-500">kcal</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Across {stats.workoutDays} active days
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Workout Volume
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
            {stats.totalWorkoutMin}
            <span className="ml-1 text-xs font-normal text-slate-500">min</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Avg {stats.workoutDays ? Math.round(stats.totalWorkoutMin / stats.workoutDays) : 0} min / session
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Period Weight Change
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
            {stats.weightDelta !== null
              ? `${stats.weightDelta > 0 ? `+${stats.weightDelta}` : stats.weightDelta} kg`
              : '--'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Goal weight {state.goals.targetWeightKg.toFixed(1)} kg
          </p>
        </div>
      </div>

      {/* Primary Chart: Calorie Intake vs Burn */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Calorie Intake vs. Exercise Expenditure
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Hover any day to inspect exact consumed, burned, and net calories
          </p>
        </div>
        <CalorieBalanceChart
          data={data}
          calorieTarget={state.goals.dailyCalorieTarget}
          height={280}
        />
      </section>

      {/* Secondary Charts: Weight Trajectory & Workout Minutes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Body Weight Trajectory
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Trend over the selected {rangeDays}-day window
            </p>
          </div>
          <WeightTrendChart
            data={data}
            targetWeightKg={state.goals.targetWeightKg}
            height={230}
          />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Training Duration by Category
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Daily balance of strength, cardio, and mobility minutes
            </p>
          </div>
          <WorkoutVolumeChart data={data} height={230} />
        </section>
      </div>

      {/* Weight Check-In & Log History */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Weight Check-Ins
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Record morning weigh-ins to refine your trend graph
            </p>
          </div>

          <form onSubmit={handleWeightSubmit} className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={weightDate}
              onChange={(e) => setWeightDate(e.target.value)}
              aria-label="Weigh-in date"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <input
              type="number"
              step="0.1"
              min="25"
              max="300"
              required
              placeholder="Weight (kg)"
              value={weightVal}
              onChange={(e) => setWeightVal(e.target.value)}
              aria-label="Weight in kilograms"
              className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <input
              type="text"
              placeholder="Optional note"
              value={weightNote}
              onChange={(e) => setWeightNote(e.target.value)}
              aria-label="Weigh-in note"
              className="w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Save Weight
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2.5 pr-4">Date</th>
                <th className="py-2.5 pr-4">Notes</th>
                <th className="py-2.5 pr-4 text-right">Weight</th>
                <th className="py-2.5 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedWeights.slice(0, 10).map((entry) => (
                <tr key={entry.date} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 pr-4 font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatShortDate(entry.date)} · {entry.date}
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-slate-500 dark:text-slate-400">
                    {entry.note ?? 'Check-in'}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                    {entry.weightKg.toFixed(1)} kg
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteWeight(entry.date)}
                      aria-label={`Remove weight entry for ${entry.date}`}
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
      </section>
    </div>
  );
};
