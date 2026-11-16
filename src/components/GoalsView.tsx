import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { GoalMode, UserGoals } from '../types/fitness';

interface GoalsViewProps {
  goals: UserGoals;
  onSaveGoals: (nextGoals: UserGoals) => void;
}

const GOAL_MODE_PRESETS: Record<
  GoalMode,
  { label: string; calories: number; protein: number; carbs: number; fats: number }
> = {
  fat_loss: { label: 'Fat Loss Cut', calories: 1850, protein: 150, carbs: 180, fats: 58 },
  maintenance: { label: 'Balanced Maintenance', calories: 2150, protein: 140, carbs: 235, fats: 70 },
  muscle_gain: { label: 'Lean Muscle Gain', calories: 2600, protein: 175, carbs: 300, fats: 78 },
};

export const GoalsView: React.FC<GoalsViewProps> = ({ goals, onSaveGoals }) => {
  const [form, setForm] = useState<UserGoals>(goals);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleModeSelect = (mode: GoalMode) => {
    const preset = GOAL_MODE_PRESETS[mode];
    setForm((prev) => ({
      ...prev,
      goalMode: mode,
      dailyCalorieTarget: preset.calories,
      proteinTarget: preset.protein,
      carbsTarget: preset.carbs,
      fatsTarget: preset.fats,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGoals(form);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2500);
  };

  const macroCalories = form.proteinTarget * 4 + form.carbsTarget * 4 + form.fatsTarget * 9;

  return (
    <div className="mx-auto max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Personal Targets & Profile
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Adjusting your targets immediately updates progress bars and reference lines on all graphs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profile-name"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Display Name
            </label>
            <input
              id="profile-name"
              type="text"
              required
              maxLength={48}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Primary Goal Mode
            </span>
            <div className="mt-1.5 inline-flex w-full items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {(Object.keys(GOAL_MODE_PRESETS) as GoalMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleModeSelect(mode)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    form.goalMode === mode
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {mode === 'fat_loss' ? 'Cut' : mode === 'maintenance' ? 'Maintain' : 'Gain'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label
              htmlFor="calorie-target"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Daily Calorie Goal (kcal)
            </label>
            <input
              id="calorie-target"
              type="number"
              min={1000}
              max={6000}
              required
              value={form.dailyCalorieTarget}
              onChange={(e) =>
                setForm({ ...form, dailyCalorieTarget: Number(e.target.value) || 0 })
              }
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="weight-target"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Target Body Weight (kg)
            </label>
            <input
              id="weight-target"
              type="number"
              step="0.1"
              min={30}
              max={250}
              required
              value={form.targetWeightKg}
              onChange={(e) => setForm({ ...form, targetWeightKg: Number(e.target.value) || 0 })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="water-target"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Daily Hydration Goal (ml)
            </label>
            <input
              id="water-target"
              type="number"
              step={250}
              min={500}
              max={8000}
              required
              value={form.dailyWaterMl}
              onChange={(e) => setForm({ ...form, dailyWaterMl: Number(e.target.value) || 0 })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Daily Macronutrient Targets
            </h3>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Macro sum: {macroCalories.toLocaleString()} kcal
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="protein-target"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Protein (g)
              </label>
              <input
                id="protein-target"
                type="number"
                min={30}
                max={400}
                required
                value={form.proteinTarget}
                onChange={(e) => setForm({ ...form, proteinTarget: Number(e.target.value) || 0 })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="carbs-target"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Carbohydrates (g)
              </label>
              <input
                id="carbs-target"
                type="number"
                min={20}
                max={700}
                required
                value={form.carbsTarget}
                onChange={(e) => setForm({ ...form, carbsTarget: Number(e.target.value) || 0 })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="fats-target"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Healthy Fats (g)
              </label>
              <input
                id="fats-target"
                type="number"
                min={15}
                max={250}
                required
                value={form.fatsTarget}
                onChange={(e) => setForm({ ...form, fatsTarget: Number(e.target.value) || 0 })}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
          <div className="text-xs text-emerald-700 dark:text-emerald-400">
            {savedNotice && (
              <span className="inline-flex items-center gap-1 font-medium">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Targets saved and applied across charts
              </span>
            )}
          </div>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap"
          >
            Save Targets
          </button>
        </div>
      </form>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Mobile App & Google Play Store Packaging
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            KayaForge is configured as an offline-capable PWA with standalone display, service worker caching, and Android adaptive icons.
          </p>
        </div>

        <ol className="mt-4 space-y-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <li>
            <strong className="text-slate-900 dark:text-white">1. Deploy Public HTTPS URL:</strong> Publish your app using the Share/Deploy button so your live HTTPS URL is active.
          </li>
          <li>
            <strong className="text-slate-900 dark:text-white">2. Generate Play Store Bundle (.aab):</strong> Open PWABuilder (pwabuilder.com) or run Google Bubblewrap CLI (<span className="font-mono">npx @bubblewrap/cli init --manifest &lt;your-url&gt;/manifest.webmanifest</span>) to package the Trusted Web Activity Android App Bundle (<span className="font-mono">.aab</span>) and signing key.
          </li>
          <li>
            <strong className="text-slate-900 dark:text-white">3. Upload to Google Play Console:</strong> Upload the signed <span className="font-mono">.aab</span> file, add your Digital Asset Links (<span className="font-mono">assetlinks.json</span>) SHA-256 fingerprint, and submit for Play Store review.
          </li>
        </ol>
      </section>
    </div>
  );
};
