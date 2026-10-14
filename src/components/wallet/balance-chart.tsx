"use client";

import { useId, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const WIDTH = 600;
const HEIGHT = 180;
const PAD_Y = 16;

/** Lightweight SVG area chart — no charting library needed. */
export function BalanceChart({
  points,
  currency = "USD",
}: {
  points: { date: string; value: number }[];
  currency?: string;
}) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);

  const { path, area, coords } = useMemo(() => {
    const values = points.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const step = points.length > 1 ? WIDTH / (points.length - 1) : WIDTH;

    const coords = points.map((p, i) => ({
      x: points.length > 1 ? i * step : WIDTH / 2,
      y: HEIGHT - PAD_Y - ((p.value - min) / range) * (HEIGHT - PAD_Y * 2),
    }));

    // Smooth the line with cubic segments between midpoints.
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const midX = (prev.x + curr.x) / 2;
      path += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    const area = `${path} L ${coords.at(-1)!.x} ${HEIGHT} L ${coords[0].x} ${HEIGHT} Z`;
    return { path, area, coords };
  }, [points]);

  if (points.length < 2) {
    return (
      <div className="grid h-[180px] place-items-center rounded-xl border border-dashed border-white/10 text-center">
        <div>
          <TrendingUp className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-2 text-xs text-muted-foreground">
            O gráfico aparece após suas primeiras movimentações.
          </p>
        </div>
      </div>
    );
  }

  const active = hover !== null ? { point: points[hover], coord: coords[hover] } : null;

  function onMove(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    for (let i = 1; i < coords.length; i++) {
      if (Math.abs(coords[i].x - x) < Math.abs(coords[nearest].x - x)) nearest = i;
    }
    setHover(nearest);
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-[180px] w-full touch-none overflow-visible"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Evolução do saldo"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.7 0.18 285)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="oklch(0.7 0.18 285)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={WIDTH}
            y1={HEIGHT * f}
            y2={HEIGHT * f}
            stroke="oklch(1 0 0 / 0.05)"
            strokeDasharray="4 6"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={path}
          fill="none"
          stroke="oklch(0.78 0.15 285)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {active && (
          <line
            x1={active.coord.x}
            x2={active.coord.x}
            y1="0"
            y2={HEIGHT}
            stroke="oklch(1 0 0 / 0.15)"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {active && (
        <>
          <span
            className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-[0_0_0_4px_oklch(0.7_0.18_285/0.25)]"
            style={{
              left: `${(active.coord.x / WIDTH) * 100}%`,
              top: `${(active.coord.y / HEIGHT) * 100}%`,
            }}
          />
          <div
            className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-popover/95 px-3 py-2 text-center shadow-xl backdrop-blur"
            style={{ left: `clamp(60px, ${(active.coord.x / WIDTH) * 100}%, calc(100% - 60px))` }}
          >
            <p className="tabular text-sm font-semibold">
              {formatCurrency(active.point.value, currency)}
            </p>
            <p className="text-[10px] text-muted-foreground">{formatDate(active.point.date)}</p>
          </div>
        </>
      )}
    </div>
  );
}
