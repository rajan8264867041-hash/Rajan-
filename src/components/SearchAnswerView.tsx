import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, Search, Trash2 } from 'lucide-react';
import { FitnessState } from '../types/fitness';
import { getTodayISO } from '../utils/dateUtils';

export interface SearchHistoryItem {
  id: string;
  query: string;
  answer: string;
  sources: { title: string; uri: string }[];
  timestamp: string;
}

interface SearchAnswerViewProps {
  state: FitnessState;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

const SUGGESTED_QUERIES = [
  '100g paneer mein kitni protein aur calories hoti hain?',
  'Best 30-minute fat loss workout routine at home',
  'High protein vegetarian Indian dinner ideas under 500 kcal',
  'How much water should I drink daily while exercising?',
  'Difference between whey concentrate and whey isolate',
];

const SEARCH_HISTORY_KEY = 'vitaltrack_search_history_v1';

export const SearchAnswerView: React.FC<SearchAnswerViewProps> = ({
  state,
  initialQuery,
  onClearInitialQuery,
}) => {
  const [query, setQuery] = useState(initialQuery ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<SearchHistoryItem | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
      return raw ? (JSON.parse(raw) as SearchHistoryItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 12)));
    } catch {
      // Ignore storage quota errors
    }
  }, [history]);

  const today = getTodayISO();
  const todayStats = useMemo(() => {
    const todayMeals = state.meals.filter((m) => m.date === today && m.completed);
    const todayExercises = state.exercises.filter((e) => e.date === today && e.completed);
    return {
      todayCaloriesIn: todayMeals.reduce((s, m) => s + m.calories, 0),
      todayCaloriesBurned: todayExercises.reduce((s, e) => s + e.caloriesBurned, 0),
    };
  }, [state.meals, state.exercises, today]);

  // Instant matching records from user's own diet and exercise logs
  const localMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { meals: [], exercises: [] };

    const mealMap = new Map<string, (typeof state.meals)[number]>();
    for (const m of state.meals) {
      if (m.name.toLowerCase().includes(q) && !mealMap.has(m.name)) {
        mealMap.set(m.name, m);
      }
    }

    const exMap = new Map<string, (typeof state.exercises)[number]>();
    for (const e of state.exercises) {
      if (e.name.toLowerCase().includes(q) && !exMap.has(e.name)) {
        exMap.set(e.name, e);
      }
    }

    return {
      meals: Array.from(mealMap.values()).slice(0, 4),
      exercises: Array.from(exMap.values()).slice(0, 4),
    };
  }, [query, state.meals, state.exercises]);

  const executeSearch = async (searchText: string) => {
    const cleaned = searchText.trim();
    if (!cleaned) return;

    setQuery(cleaned);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: cleaned,
          context: {
            goalMode: state.goals.goalMode,
            dailyCalorieTarget: state.goals.dailyCalorieTarget,
            todayCaloriesIn: todayStats.todayCaloriesIn,
            todayCaloriesBurned: todayStats.todayCaloriesBurned,
          },
        }),
      });

      const payload = (await res.json()) as {
        answer?: string;
        sources?: { title: string; uri: string }[];
        error?: string;
      };

      if (!res.ok) {
        throw new Error(payload.error || 'Could not retrieve an answer right now.');
      }

      const item: SearchHistoryItem = {
        id: `q_${Date.now().toString(36)}`,
        query: cleaned,
        answer: payload.answer || 'No answer found.',
        sources: Array.isArray(payload.sources) ? payload.sources : [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setActiveResult(item);
      setHistory((prev) => [item, ...prev.filter((h) => h.query !== cleaned)].slice(0, 12));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      const q = initialQuery.trim();
      onClearInitialQuery?.();
      void executeSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void executeSearch(query);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Search Box */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Search Anything for Instant Answers
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Ask any question about diet nutrition, Indian or global foods, workout routines, or any general topic in English, Hindi, or Hinglish.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything... e.g., 100g chicken breast protein, squats form, or any question"
              aria-label="Search any question"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {loading ? 'Searching...' : 'Get Answer'}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTED_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => void executeSearch(q)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-xs text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      {/* Instant Matching Records from User's Own Logs */}
      {(localMatches.meals.length > 0 || localMatches.exercises.length > 0) && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Matching Items in Your Tracker
          </h3>
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {localMatches.meals.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{m.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Meal · {m.serving} · {m.protein}g P · {m.carbs}g C · {m.fats}g F
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                  {m.calories} kcal
                </span>
              </div>
            ))}
            {localMatches.exercises.map((ex) => (
              <div key={ex.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{ex.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Exercise · <span className="capitalize">{ex.category}</span> · {ex.durationMin} min
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400 tabular-nums whitespace-nowrap">
                  {ex.caloriesBurned} kcal burned
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            <div className="h-4 w-2/5 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800/70" />
            <div className="h-3 w-11/12 rounded bg-slate-100 dark:bg-slate-800/70" />
            <div className="h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-800/70" />
          </div>
        </section>
      )}

      {/* Error State */}
      {error && !loading && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <div>
            <p className="font-medium">Unable to fetch answer</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
          {query.trim() && (
            <button
              type="button"
              onClick={() => void executeSearch(query)}
              className="rounded-lg border border-rose-300 bg-white px-3.5 py-2 text-xs font-medium text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/50 whitespace-nowrap"
            >
              Retry
            </button>
          )}
        </section>
      )}

      {/* Active Answer */}
      {activeResult && !loading && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {activeResult.query}
            </h3>
            <span className="font-mono text-xs text-slate-400 tabular-nums whitespace-nowrap">
              {activeResult.timestamp}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {activeResult.answer.split('\n').map((rawLine, idx) => {
              const trimmed = rawLine.trim();
              if (!trimmed) return <div key={idx} className="h-1" />;
              const isBullet = /^[-*•]\s+/.test(trimmed);
              const content = isBullet ? trimmed.replace(/^[-*•]\s+/, '') : trimmed;
              const parts = content.split(/(\*\*[^*]+\*\*)/g);
              const rendered = parts.map((part, pIdx) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  <React.Fragment key={pIdx}>{part}</React.Fragment>
                )
              );

              return isBullet ? (
                <div key={idx} className="pl-4 text-slate-700 dark:text-slate-200">
                  <span className="mr-2 text-slate-400" aria-hidden="true">–</span>
                  <span>{rendered}</span>
                </div>
              ) : (
                <p key={idx}>{rendered}</p>
              );
            })}
          </div>

          {activeResult.sources.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sources</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {activeResult.sources.map((src) => (
                  <a
                    key={src.uri}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    <span className="max-w-[240px] truncate">{src.title}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Recent Searches */}
      {history.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Searches
            </h3>
            <button
              type="button"
              onClick={() => {
                setHistory([]);
                setActiveResult(null);
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear History
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setQuery(item.query);
                  setActiveResult(item);
                }}
                className="flex w-full items-center justify-between gap-4 py-2.5 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
              >
                <span className="truncate text-sm text-slate-800 dark:text-slate-200">
                  {item.query}
                </span>
                <span className="font-mono text-xs text-slate-400 tabular-nums whitespace-nowrap">
                  {item.timestamp}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
