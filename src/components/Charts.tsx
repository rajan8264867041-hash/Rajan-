import React, { useMemo, useState } from 'react';
import { DailyAggregate } from '../types/fitness';
import { formatShortDate } from '../utils/dateUtils';

interface CalorieBalanceChartProps {
  data: DailyAggregate[];
  calorieTarget: number;
  height?: number;
}

export const CalorieBalanceChart: React.FC<CalorieBalanceChartProps> = ({
  data,
  calorieTarget,
  height = 260,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chart = useMemo(() => {
    const maxVal = Math.max(
      calorieTarget * 1.15,
      ...data.map((d) => Math.max(d.caloriesIn, d.caloriesBurned)),
      1000
    );
    const yMax = Math.ceil(maxVal / 500) * 500;
    const width = 760;
    const padLeft = 48;
    const padRight = 16;
    const padTop = 18;
    const padBottom = 34;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    const step = data.length > 0 ? plotW / data.length : plotW;
    const barW = Math.max(4, Math.min(18, step * 0.34));
    const targetY = padTop + plotH - (calorieTarget / yMax) * plotH;

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
      value: Math.round(yMax * ratio),
      y: padTop + plotH - ratio * plotH,
    }));

    return { width, padLeft, padRight, padTop, padBottom, plotW, plotH, step, barW, yMax, targetY, yTicks };
  }, [data, calorieTarget, height]);

  const hovered = hoveredIdx !== null ? data[hoveredIdx] : null;
  const labelInterval = data.length > 20 ? 5 : data.length > 10 ? 2 : 1;

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        No calorie history available for this period.
      </div>
    );
  }

  return (
    <div className="relative w-full select-none">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
            <span>Consumed (kcal)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-amber-500 dark:bg-amber-400" />
            <span>Burned (kcal)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-4 border-t border-dashed border-slate-400 dark:border-slate-500" />
            <span>Target ({calorieTarget.toLocaleString()} kcal)</span>
          </span>
        </div>
        {hovered && (
          <div className="font-mono text-xs text-slate-700 dark:text-slate-200 tabular-nums">
            <span>{hovered.label}</span>
            <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
            <span>In: {hovered.caloriesIn.toLocaleString()}</span>
            <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
            <span>Burn: {hovered.caloriesBurned.toLocaleString()}</span>
            <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
            <span>Net: {hovered.netCalories.toLocaleString()} kcal</span>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${chart.width} ${height}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Daily calorie intake versus calories burned chart"
      >
        {chart.yTicks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={chart.padLeft}
              x2={chart.width - chart.padRight}
              y1={tick.y}
              y2={tick.y}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={1}
            />
            <text
              x={chart.padLeft - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="fill-slate-400 font-mono text-[10px] dark:fill-slate-500"
            >
              {tick.value}
            </text>
          </g>
        ))}

        {/* Target line */}
        <line
          x1={chart.padLeft}
          x2={chart.width - chart.padRight}
          y1={chart.targetY}
          y2={chart.targetY}
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth={1.25}
          strokeDasharray="4 4"
        />

        {data.map((d, i) => {
          const cx = chart.padLeft + i * chart.step + chart.step / 2;
          const inH = (d.caloriesIn / chart.yMax) * chart.plotH;
          const burnH = (d.caloriesBurned / chart.yMax) * chart.plotH;
          const inY = chart.padTop + chart.plotH - inH;
          const burnY = chart.padTop + chart.plotH - burnH;
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={d.date}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {isHovered && (
                <rect
                  x={cx - chart.step / 2}
                  y={chart.padTop}
                  width={chart.step}
                  height={chart.plotH}
                  className="fill-slate-100/80 dark:fill-slate-800/60"
                  rx={4}
                />
              )}

              <rect
                x={cx - chart.barW - 1}
                y={inY}
                width={chart.barW}
                height={Math.max(inH, 0)}
                rx={2}
                className={`transition-opacity duration-150 ${
                  isHovered
                    ? 'fill-emerald-500 dark:fill-emerald-400'
                    : 'fill-emerald-600/90 dark:fill-emerald-500/85'
                }`}
              />
              <rect
                x={cx + 1}
                y={burnY}
                width={chart.barW}
                height={Math.max(burnH, 0)}
                rx={2}
                className={`transition-opacity duration-150 ${
                  isHovered
                    ? 'fill-amber-400 dark:fill-amber-300'
                    : 'fill-amber-500/90 dark:fill-amber-400/85'
                }`}
              />

              {i % labelInterval === 0 && (
                <text
                  x={cx}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-slate-400 font-mono text-[10px] dark:fill-slate-500"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface WeightTrendChartProps {
  data: DailyAggregate[];
  targetWeightKg: number;
  height?: number;
}

export const WeightTrendChart: React.FC<WeightTrendChartProps> = ({
  data,
  targetWeightKg,
  height = 220,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const points = useMemo(() => {
    return data
      .filter((d): d is DailyAggregate & { weightKg: number } => d.weightKg !== null)
      .map((d) => ({ date: d.date, label: formatShortDate(d.date), weightKg: d.weightKg }));
  }, [data]);

  const chart = useMemo(() => {
    const vals = points.map((p) => p.weightKg).concat([targetWeightKg]);
    const rawMin = vals.length ? Math.min(...vals) : targetWeightKg - 2;
    const rawMax = vals.length ? Math.max(...vals) : targetWeightKg + 2;
    const pad = Math.max(1, (rawMax - rawMin) * 0.25);
    const yMin = Math.floor((rawMin - pad) * 2) / 2;
    const yMax = Math.ceil((rawMax + pad) * 2) / 2;
    const width = 560;
    const padLeft = 44;
    const padRight = 16;
    const padTop = 16;
    const padBottom = 30;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const toX = (idx: number) =>
      points.length <= 1 ? padLeft + plotW / 2 : padLeft + (idx / (points.length - 1)) * plotW;
    const toY = (w: number) => padTop + plotH - ((w - yMin) / Math.max(0.5, yMax - yMin)) * plotH;

    const coords = points.map((p, idx) => ({
      ...p,
      x: toX(idx),
      y: toY(p.weightKg),
    }));

    const linePath = coords
      .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');

    const areaPath =
      coords.length > 0
        ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
        : '';

    const yTicks = [0, 0.33, 0.66, 1].map((ratio) => {
      const v = yMin + (yMax - yMin) * ratio;
      return {
        label: v.toFixed(1),
        y: padTop + plotH - ratio * plotH,
      };
    });

    return {
      width,
      padLeft,
      padRight,
      padTop,
      padBottom,
      plotW,
      plotH,
      coords,
      linePath,
      areaPath,
      targetY: toY(targetWeightKg),
      yTicks,
    };
  }, [points, targetWeightKg, height]);

  if (points.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Log your first weight entry to visualize body weight trajectory.
      </div>
    );
  }

  const hovered = hoveredIdx !== null ? chart.coords[hoveredIdx] : null;
  const labelStride = chart.coords.length > 8 ? 2 : 1;

  return (
    <div className="relative w-full select-none">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <span>Logged Weight (kg)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-4 border-t border-dashed border-emerald-600 dark:border-emerald-400" />
            <span>Goal ({targetWeightKg.toFixed(1)} kg)</span>
          </span>
        </div>
        {hovered && (
          <span className="font-mono text-xs text-slate-700 dark:text-slate-200 tabular-nums">
            {hovered.label} · {hovered.weightKg.toFixed(1)} kg
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${chart.width} ${height}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Body weight progress over time"
      >
        <defs>
          <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {chart.yTicks.map((t) => (
          <g key={t.label}>
            <line
              x1={chart.padLeft}
              x2={chart.width - chart.padRight}
              y1={t.y}
              y2={t.y}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={1}
            />
            <text
              x={chart.padLeft - 8}
              y={t.y + 4}
              textAnchor="end"
              className="fill-slate-400 font-mono text-[10px] dark:fill-slate-500"
            >
              {t.label}
            </text>
          </g>
        ))}

        {/* Goal Weight Line */}
        <line
          x1={chart.padLeft}
          x2={chart.width - chart.padRight}
          y1={chart.targetY}
          y2={chart.targetY}
          className="stroke-emerald-600 dark:stroke-emerald-400"
          strokeWidth={1.25}
          strokeDasharray="4 4"
        />

        {chart.coords.length > 1 && <path d={chart.areaPath} fill="url(#weightAreaGrad)" />}
        {chart.coords.length > 1 && (
          <path
            d={chart.linePath}
            fill="none"
            className="stroke-indigo-600 dark:stroke-indigo-400"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {chart.coords.map((c, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g
              key={c.date}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle cx={c.x} cy={c.y} r={12} fill="transparent" />
              <circle
                cx={c.x}
                cy={c.y}
                r={isHovered ? 5 : 3.5}
                className="fill-white stroke-indigo-600 dark:fill-slate-900 dark:stroke-indigo-400"
                strokeWidth={2}
              />
              {i % labelStride === 0 && (
                <text
                  x={c.x}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-slate-400 font-mono text-[10px] dark:fill-slate-500"
                >
                  {c.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface WorkoutVolumeChartProps {
  data: DailyAggregate[];
  height?: number;
}

export const WorkoutVolumeChart: React.FC<WorkoutVolumeChartProps> = ({ data, height = 220 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chart = useMemo(() => {
    const maxMin = Math.max(60, ...data.map((d) => d.workoutMinutes));
    const yMax = Math.ceil(maxMin / 15) * 15;
    const width = 560;
    const padLeft = 40;
    const padRight = 14;
    const padTop = 16;
    const padBottom = 30;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    const step = data.length > 0 ? plotW / data.length : plotW;
    const barW = Math.max(6, Math.min(24, step * 0.52));

    const yTicks = [0, 0.5, 1].map((r) => ({
      value: Math.round(yMax * r),
      y: padTop + plotH - r * plotH,
    }));

    return { width, padLeft, padRight, padTop, padBottom, plotW, plotH, step, barW, yMax, yTicks };
  }, [data, height]);

  const hovered = hoveredIdx !== null ? data[hoveredIdx] : null;
  const labelInterval = data.length > 20 ? 5 : data.length > 10 ? 2 : 1;

  return (
    <div className="relative w-full select-none">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-sky-600 dark:bg-sky-400" />
            <span>Strength</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-amber-500 dark:bg-amber-400" />
            <span>Cardio</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-400" />
            <span>Mobility</span>
          </span>
        </div>
        {hovered && (
          <span className="font-mono text-xs text-slate-700 dark:text-slate-200 tabular-nums">
            {hovered.label} · {hovered.workoutMinutes} min ({hovered.caloriesBurned} kcal)
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${chart.width} ${height}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Daily workout duration by category"
      >
        {chart.yTicks.map((t) => (
          <g key={t.value}>
            <line
              x1={chart.padLeft}
              x2={chart.width - chart.padRight}
              y1={t.y}
              y2={t.y}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth={1}
            />
            <text
              x={chart.padLeft - 8}
              y={t.y + 4}
              textAnchor="end"
              className="fill-slate-400 font-mono text-[10px] dark:fill-slate-500"
            >
              {t.value}m
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const cx = chart.padLeft + i * chart.step + chart.step / 2;
          const x = cx - chart.barW / 2;
          const base = chart.padTop + chart.plotH;
          const sH = (d.strengthMinutes / chart.yMax) * chart.plotH;
          const cH = (d.cardioMinutes / chart.yMax) * chart.plotH;
          const mH = (d.mobilityMinutes / chart.yMax) * chart.plotH;
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={d.date}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {isHovered && (
                <rect
                  x={cx - chart.step / 2}
                  y={chart.padTop}
                  width={chart.step}
                  height={chart.plotH}
                  className="fill-slate-100/80 dark:fill-slate-800/60"
                  rx={4}
                />
              )}

              {/* Strength (bottom) */}
              {sH > 0 && (
                <rect
                  x={x}
                  y={base - sH}
                  width={chart.barW}
                  height={sH}
                  rx={1.5}
                  className="fill-sky-600/90 dark:fill-sky-400/90"
                />
              )}
              {/* Cardio (middle) */}
              {cH > 0 && (
                <rect
                  x={x}
                  y={base - sH - cH}
                  width={chart.barW}
                  height={cH}
                  rx={1.5}
                  className="fill-amber-500/90 dark:fill-amber-400/90"
                />
              )}
              {/* Mobility (top) */}
              {mH > 0 && (
                <rect
                  x={x}
                  y={base - sH - cH - mH}
                  width={chart.barW}
                  height={mH}
                  rx={1.5}
                  className="fill-emerald-600/90 dark:fill-emerald-400/90"
                />
              )}

              {i % labelInterval === 0 && (
                <text
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-slate-400 font-mono text-[10px] dark:fill-slate-500"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface MacroAdherenceProps {
  protein: number;
  carbs: number;
  fats: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
}

export const MacroAdherenceBars: React.FC<MacroAdherenceProps> = ({
  protein,
  carbs,
  fats,
  proteinTarget,
  carbsTarget,
  fatsTarget,
}) => {
  const rows = [
    {
      label: 'Protein',
      actual: protein,
      target: proteinTarget,
      barClass: 'bg-emerald-600 dark:bg-emerald-500',
      kcalPerGram: 4,
    },
    {
      label: 'Carbohydrates',
      actual: carbs,
      target: carbsTarget,
      barClass: 'bg-sky-600 dark:bg-sky-400',
      kcalPerGram: 4,
    },
    {
      label: 'Healthy Fats',
      actual: fats,
      target: fatsTarget,
      barClass: 'bg-amber-500 dark:bg-amber-400',
      kcalPerGram: 9,
    },
  ];

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const pct = row.target > 0 ? Math.min(100, Math.round((row.actual / row.target) * 100)) : 0;
        const over = row.actual > row.target * 1.1;
        return (
          <div key={row.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-200">{row.label}</span>
              <span className="font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                {row.actual}g / {row.target}g · {pct}%{over ? ' (Over)' : ''}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  over ? 'bg-rose-600 dark:bg-rose-500' : row.barClass
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
