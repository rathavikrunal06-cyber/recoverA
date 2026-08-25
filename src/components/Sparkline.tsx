import React, { useId } from 'react';

export interface SparklineProps {
  data: number[];
  color?: 'emerald' | 'blue' | 'purple' | 'teal' | 'amber' | 'indigo' | 'rose' | 'slate';
  width?: number;
  height?: number;
  showArea?: boolean;
  showDot?: boolean;
  className?: string;
  strokeWidth?: number;
  trendPercentage?: string | number;
  trendLabel?: string;
  isPositive?: boolean;
}

const colorMap = {
  emerald: {
    stroke: '#10b981',
    fillStart: 'rgba(16, 185, 129, 0.35)',
    fillEnd: 'rgba(16, 185, 129, 0.0)',
    dot: '#34d399',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  },
  blue: {
    stroke: '#3b82f6',
    fillStart: 'rgba(59, 130, 246, 0.35)',
    fillEnd: 'rgba(59, 130, 246, 0.0)',
    dot: '#60a5fa',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  },
  purple: {
    stroke: '#a855f7',
    fillStart: 'rgba(168, 85, 247, 0.35)',
    fillEnd: 'rgba(168, 85, 247, 0.0)',
    dot: '#c084fc',
    text: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
  },
  teal: {
    stroke: '#14b8a6',
    fillStart: 'rgba(20, 184, 166, 0.35)',
    fillEnd: 'rgba(20, 184, 166, 0.0)',
    dot: '#2dd4bf',
    text: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20 text-teal-300',
  },
  amber: {
    stroke: '#f59e0b',
    fillStart: 'rgba(245, 158, 11, 0.35)',
    fillEnd: 'rgba(245, 158, 11, 0.0)',
    dot: '#fbbf24',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  },
  indigo: {
    stroke: '#6366f1',
    fillStart: 'rgba(99, 102, 241, 0.35)',
    fillEnd: 'rgba(99, 102, 241, 0.0)',
    dot: '#818cf8',
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
  },
  rose: {
    stroke: '#f43f5e',
    fillStart: 'rgba(244, 63, 94, 0.35)',
    fillEnd: 'rgba(244, 63, 94, 0.0)',
    dot: '#fb7185',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
  },
  slate: {
    stroke: '#94a3b8',
    fillStart: 'rgba(148, 163, 184, 0.3)',
    fillEnd: 'rgba(148, 163, 184, 0.0)',
    dot: '#cbd5e1',
    text: 'text-slate-400',
    bg: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
  },
};

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = 'emerald',
  width = 96,
  height = 32,
  showArea = true,
  showDot = true,
  className = '',
  strokeWidth = 1.8,
  trendPercentage,
  trendLabel = '30d',
  isPositive = true,
}) => {
  const gradientId = useId();
  const theme = colorMap[color] || colorMap.emerald;

  if (!data || data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const paddingY = 4;
  const usableHeight = height - paddingY * 2;

  // Generate SVG coordinates
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  // Build smooth bezier curve path
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, '');

  // Area path closing at bottom
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="relative" style={{ width, height }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.fillStart} />
              <stop offset="100%" stopColor={theme.fillEnd} />
            </linearGradient>
          </defs>

          {showArea && (
            <path
              d={areaD}
              fill={`url(#${gradientId})`}
              className="transition-all duration-300"
            />
          )}

          <path
            d={pathD}
            fill="none"
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {showDot && lastPoint && (
            <>
              <circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={2.5}
                fill={theme.dot}
                className="animate-pulse"
              />
              <circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={5}
                fill={theme.dot}
                opacity={0.3}
              />
            </>
          )}
        </svg>
      </div>

      {trendPercentage !== undefined && (
        <span
          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
            isPositive
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 print:text-emerald-700 print:bg-emerald-50'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400 print:text-rose-700 print:bg-rose-50'
          }`}
          title={`30-day trajectory: ${trendPercentage} over ${trendLabel}`}
        >
          {typeof trendPercentage === 'number'
            ? `${trendPercentage > 0 ? '+' : ''}${trendPercentage}%`
            : trendPercentage}
        </span>
      )}
    </div>
  );
};
