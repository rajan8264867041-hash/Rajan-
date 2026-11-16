import React, { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Dumbbell,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  Target,
  Utensils,
  X,
} from 'lucide-react';
import { DietPlanPreset, WorkoutPreset, createInitialSeedState } from './data/presets';
import {
  ExerciseCategory,
  ExerciseEntry,
  FitnessState,
  MealCategory,
  MealEntry,
  NavSection,
  UserGoals,
} from './types/fitness';
import { generateId, getTodayISO } from './utils/dateUtils';
import { clearFitnessState, loadFitnessState, saveFitnessState } from './utils/storage';
import { DietPlanView } from './components/DietPlanView';
import { ExerciseView } from './components/ExerciseView';
import { GoalsView } from './components/GoalsView';
import { OverviewView } from './components/OverviewView';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { ProgressView } from './components/ProgressView';
import { QuickLogModal } from './components/QuickLogModal';
import { SearchAnswerView } from './components/SearchAnswerView';

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'diet', label: 'Diet Plan', icon: Utensils },
  { id: 'exercise', label: 'Daily Exercise', icon: Dumbbell },
  { id: 'progress', label: 'Progress Graphs', icon: BarChart3 },
  { id: 'search', label: 'Ask & Search', icon: Search },
  { id: 'goals', label: 'Goals & Profile', icon: Target },
];

const AVATAR_URL = '/src/assets/images/avatar_athlete_profile_1794846245482.jpg';

export default function App() {
  const [state, setState] = useState<FitnessState>(() => loadFitnessState(createInitialSeedState));
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  // Quick search bar state (lets user search anything from the workspace and jump to Ask & Search)
  const [globalQuery, setGlobalQuery] = useState('');
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | undefined>(undefined);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'meal' | 'exercise' | 'weight'>('meal');
  const [modalMealCategory, setModalMealCategory] = useState<MealCategory>('breakfast');
  const [modalExerciseCategory, setModalExerciseCategory] = useState<ExerciseCategory>('strength');

  useEffect(() => {
    saveFitnessState(state);
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  const toggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const openQuickLog = (
    tab: 'meal' | 'exercise' | 'weight',
    mealCat: MealCategory = 'breakfast',
    exCat: ExerciseCategory = 'strength'
  ) => {
    setModalTab(tab);
    setModalMealCategory(mealCat);
    setModalExerciseCategory(exCat);
    setModalOpen(true);
  };

  const handleToggleMeal = (id: string) => {
    setState((prev) => ({
      ...prev,
      meals: prev.meals.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)),
    }));
  };

  const handleDeleteMeal = (id: string) => {
    setState((prev) => ({
      ...prev,
      meals: prev.meals.filter((m) => m.id !== id),
    }));
  };

  const handleAddMeal = (meal: MealEntry) => {
    setState((prev) => ({
      ...prev,
      meals: [...prev.meals, meal],
    }));
  };

  const handleApplyDietPreset = (date: string, preset: DietPlanPreset) => {
    setState((prev) => {
      const remaining = prev.meals.filter((m) => m.date !== date);
      const added: MealEntry[] = preset.items.map((item) => ({
        id: generateId('meal'),
        date,
        category: item.category,
        name: item.name,
        serving: item.serving,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        completed: false,
        time: item.time,
      }));
      return { ...prev, meals: [...remaining, ...added] };
    });
  };

  const handleToggleExercise = (id: string) => {
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)),
    }));
  };

  const handleDeleteExercise = (id: string) => {
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((e) => e.id !== id),
    }));
  };

  const handleAddExercise = (exercise: ExerciseEntry) => {
    setState((prev) => ({
      ...prev,
      exercises: [...prev.exercises, exercise],
    }));
  };

  const handleApplyWorkoutPreset = (date: string, preset: WorkoutPreset) => {
    setState((prev) => {
      const remaining = prev.exercises.filter((e) => e.date !== date);
      const added: ExerciseEntry[] = preset.items.map((item) => ({
        id: generateId('ex'),
        date,
        name: item.name,
        category: item.category,
        sets: item.sets,
        reps: item.reps,
        weightKg: item.weightKg,
        durationMin: item.durationMin,
        caloriesBurned: item.caloriesBurned,
        completed: false,
        notes: item.notes,
      }));
      return { ...prev, exercises: [...remaining, ...added] };
    });
  };

  const handleAdjustWater = (date: string, deltaMl: number) => {
    setState((prev) => {
      const existing = prev.waterLogs.find((w) => w.date === date);
      const nextMl = Math.max(0, (existing?.ml ?? 0) + deltaMl);
      const others = prev.waterLogs.filter((w) => w.date !== date);
      return { ...prev, waterLogs: [...others, { date, ml: nextMl }] };
    });
  };

  const handleLogWeight = (date: string, weightKg: number, note?: string) => {
    setState((prev) => {
      const others = prev.weights.filter((w) => w.date !== date);
      return {
        ...prev,
        weights: [...others, { date, weightKg, note }],
      };
    });
  };

  const handleDeleteWeight = (date: string) => {
    setState((prev) => ({
      ...prev,
      weights: prev.weights.filter((w) => w.date !== date),
    }));
  };

  const handleSaveGoals = (nextGoals: UserGoals) => {
    setState((prev) => ({
      ...prev,
      goals: nextGoals,
    }));
  };

  const handleResetSampleData = () => {
    clearFitnessState();
    setState((prev) => ({
      ...createInitialSeedState(),
      theme: prev.theme,
    }));
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = globalQuery.trim();
    if (!cleaned) return;
    setPendingSearchQuery(cleaned);
    setGlobalQuery('');
    setActiveSection('search');
  };

  const selectedDayWater =
    state.waterLogs.find((w) => w.date === selectedDate)?.ml ?? 0;

  const activeNavMeta = NAV_ITEMS.find((n) => n.id === activeSection) ?? NAV_ITEMS[0];
  const initials = state.goals.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Sidebar (256px) */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div>
          <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
              KayaForge
            </span>
          </div>

          <nav className="space-y-1 p-4" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 border-t border-slate-200 p-4 dark:border-slate-800">
          <PWAInstallButton />
          <button
            type="button"
            onClick={() => setActiveSection('goals')}
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
          >
            {!avatarFailed ? (
              <img
                src={AVATAR_URL}
                alt={`${state.goals.name} profile photo`}
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                className="h-9 w-9 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 font-display text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {initials || 'VT'}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {state.goals.name}
              </p>
              <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {state.goals.dailyCalorieTarget.toLocaleString()} kcal · {state.goals.targetWeightKg} kg
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-slate-950/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="flex w-64 flex-col justify-between bg-white p-4 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  KayaForge
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="mt-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <PWAInstallButton />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar Contract: Breadcrumb on left, 1 primary action + theme toggle on right */}
        <header className="flex h-16 items-center justify-between gap-6 border-b border-slate-200 bg-white px-4 sm:px-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:text-slate-300"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="hidden font-medium text-slate-400 sm:inline">KayaForge</span>
              <span className="hidden text-slate-300 dark:text-slate-600 sm:inline" aria-hidden="true">/</span>
              <h1 className="truncate font-display text-base font-semibold text-slate-900 dark:text-white">
                {activeNavMeta.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {state.theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => openQuickLog(activeSection === 'exercise' ? 'exercise' : 'meal')}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Quick Log
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {/* Quick Universal Search Bar below header so users can ask anything from any workspace tab */}
          {activeSection !== 'search' && (
            <form
              onSubmit={handleGlobalSearchSubmit}
              className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={globalQuery}
                  onChange={(e) => setGlobalQuery(e.target.value)}
                  placeholder="Kuch bhi poochein / Search anything (e.g., 100g paneer protein, chest workout, or any question)..."
                  aria-label="Ask or search anything"
                  className="w-full rounded-lg bg-transparent py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white whitespace-nowrap shrink-0"
              >
                Get Answer
              </button>
            </form>
          )}

          {activeSection === 'overview' && (
            <OverviewView
              state={state}
              onToggleMeal={handleToggleMeal}
              onToggleExercise={handleToggleExercise}
              onAdjustWater={handleAdjustWater}
              onNavigate={setActiveSection}
              onOpenQuickLog={(tab) => openQuickLog(tab)}
            />
          )}

          {activeSection === 'diet' && (
            <DietPlanView
              meals={state.meals}
              waterMl={selectedDayWater}
              goals={state.goals}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onToggleMeal={handleToggleMeal}
              onDeleteMeal={handleDeleteMeal}
              onApplyDietPreset={handleApplyDietPreset}
              onAdjustWater={handleAdjustWater}
              onOpenAddMeal={(cat) => openQuickLog('meal', cat ?? 'breakfast')}
            />
          )}

          {activeSection === 'exercise' && (
            <ExerciseView
              exercises={state.exercises}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onToggleExercise={handleToggleExercise}
              onDeleteExercise={handleDeleteExercise}
              onApplyWorkoutPreset={handleApplyWorkoutPreset}
              onOpenAddExercise={(cat) => openQuickLog('exercise', 'breakfast', cat ?? 'strength')}
            />
          )}

          {activeSection === 'progress' && (
            <ProgressView
              state={state}
              onLogWeight={handleLogWeight}
              onDeleteWeight={handleDeleteWeight}
              onResetSampleData={handleResetSampleData}
            />
          )}

          {activeSection === 'search' && (
            <SearchAnswerView
              state={state}
              initialQuery={pendingSearchQuery}
              onClearInitialQuery={() => setPendingSearchQuery(undefined)}
            />
          )}

          {activeSection === 'goals' && (
            <GoalsView goals={state.goals} onSaveGoals={handleSaveGoals} />
          )}
        </main>
      </div>

      <QuickLogModal
        isOpen={modalOpen}
        initialTab={modalTab}
        defaultDate={selectedDate}
        initialMealCategory={modalMealCategory}
        initialExerciseCategory={modalExerciseCategory}
        onClose={() => setModalOpen(false)}
        onAddMeal={handleAddMeal}
        onAddExercise={handleAddExercise}
        onAddWeight={handleLogWeight}
      />
      <OfflineIndicator />
    </div>
  );
}
