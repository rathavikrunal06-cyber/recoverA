import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  Zap,
  CheckCircle2,
  DollarSign,
  Smartphone,
  MessageSquare,
  CreditCard,
  Clock,
} from 'lucide-react';
import { SystemMetrics } from '../types';

interface RecoveryTrendGraphProps {
  metrics: SystemMetrics | null;
  onNavigateToFutureScenarios?: () => void;
}

type TimeRange = '1h' | '24h' | '7d' | '30d';
type MetricView = 'gmv_volume' | 'tsr_trajectory' | 'channel_mix' | 'cumulative_growth';

export const RecoveryTrendGraph: React.FC<RecoveryTrendGraphProps> = ({ metrics, onNavigateToFutureScenarios }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [metricView, setMetricView] = useState<MetricView>('gmv_volume');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Hourly / daily trend data points
  const hourlyData = [
    { label: '00:00', failedGMV: 42000, recoveredGMV: 18500, baselineTSR: 88.1, recoveredTSR: 91.4, upi: 11000, wa: 4500, dunning: 2000, card: 1000 },
    { label: '04:00', failedGMV: 28000, recoveredGMV: 12200, baselineTSR: 88.4, recoveredTSR: 91.2, upi: 7200, wa: 3000, dunning: 1200, card: 800 },
    { label: '08:00', failedGMV: 68000, recoveredGMV: 31000, baselineTSR: 87.9, recoveredTSR: 91.8, upi: 18000, wa: 8000, dunning: 3200, card: 1800 },
    { label: '12:00', failedGMV: 145000, recoveredGMV: 64200, baselineTSR: 86.8, recoveredTSR: 90.9, upi: 38000, wa: 16000, dunning: 6200, card: 4000 },
    { label: '16:00', failedGMV: 198000, recoveredGMV: 89400, baselineTSR: 86.2, recoveredTSR: 90.5, upi: 54000, wa: 22000, dunning: 8400, card: 5000 },
    { label: '20:00', failedGMV: 240000, recoveredGMV: 108000, baselineTSR: 85.5, recoveredTSR: 90.1, upi: 66000, wa: 26000, dunning: 9800, card: 6200 },
    { label: 'Now', failedGMV: 185000, recoveredGMV: 82500, baselineTSR: 86.4, recoveredTSR: 90.8, upi: 49000, wa: 21000, dunning: 7500, card: 5000 },
  ];

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxGMV = Math.max(...hourlyData.map((d) => d.failedGMV)) * 1.15;

  return (
    <div id="recovery-trend-graph-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Recovery Dynamics & TSR Trajectory Trend</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Live Feed
              </span>
            </h3>
            <p className="text-xs text-slate-400">Real-time payment failure recovery volume vs baseline dropoffs</p>
          </div>
        </div>

        {/* View Mode Buttons & Time Range Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric View Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMetricView('gmv_volume')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                metricView === 'gmv_volume' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GMV Volume
            </button>
            <button
              onClick={() => setMetricView('tsr_trajectory')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                metricView === 'tsr_trajectory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TSR Curve
            </button>
            <button
              onClick={() => setMetricView('channel_mix')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                metricView === 'channel_mix' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Channel Mix
            </button>
          </div>

          {/* Time Range Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['1h', '24h', '7d', '30d'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-0.5 rounded-lg uppercase text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  timeRange === r ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {onNavigateToFutureScenarios && (
            <button
              onClick={onNavigateToFutureScenarios}
              className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Project 90-day resilience against bank & ISP outages"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>90d Future Shocks &rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Interactive Visual Chart Canvas */}
      <div className="relative h-64 w-full bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 pt-6 overflow-hidden">
        {metricView === 'gmv_volume' && (
          /* GMV Volume Dual Area / Bar Chart */
          <div className="h-full flex flex-col justify-between">
            <div className="h-44 flex items-end justify-between gap-3 px-2">
              {hourlyData.map((d, idx) => {
                const failedHeight = (d.failedGMV / maxGMV) * 100;
                const recoveredHeight = (d.recoveredGMV / maxGMV) * 100;
                const isHovered = hoveredPoint === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end cursor-pointer"
                  >
                    {/* Hover Tooltip Popover */}
                    {isHovered && (
                      <div className="absolute -top-16 z-20 bg-slate-900 border border-blue-500/40 rounded-xl p-2 shadow-2xl text-[11px] whitespace-nowrap pointer-events-none animate-fade-in font-mono">
                        <div className="text-slate-300 font-bold mb-0.5">{d.label} UTC</div>
                        <div className="flex items-center gap-2">
                          <span className="text-red-400">At-Risk: {formatINR(d.failedGMV)}</span>
                          <span className="text-emerald-400 font-bold">Rescued: {formatINR(d.recoveredGMV)}</span>
                        </div>
                        <div className="text-[10px] text-blue-300">
                          Recovery Rate: {((d.recoveredGMV / d.failedGMV) * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}

                    {/* Bars Container */}
                    <div className="w-full max-w-[36px] flex items-end justify-center gap-1.5 h-full">
                      {/* At-Risk GMV Bar (Red/Slate) */}
                      <div
                        className="w-1/2 bg-red-500/30 group-hover:bg-red-500/50 rounded-t-md transition-all duration-300 relative overflow-hidden"
                        style={{ height: `${failedHeight}%` }}
                      >
                        <div className="w-full h-1 bg-red-400" />
                      </div>

                      {/* Recovered GMV Bar (Emerald Gradient) */}
                      <div
                        className="w-1/2 bg-gradient-to-t from-emerald-600/80 to-teal-400 rounded-t-md group-hover:brightness-125 transition-all duration-300 shadow-md shadow-emerald-500/10 relative"
                        style={{ height: `${recoveredHeight}%` }}
                      >
                        <div className="w-full h-1 bg-white" />
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-white mt-1">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend & Summary Metrics */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-500/40 border border-red-500/60" />
                  <span className="text-slate-400">Failed at Gateway</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gradient-to-t from-emerald-500 to-teal-400" />
                  <span className="text-emerald-300 font-bold">RecoverAI Rescued GMV</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                Rescued GMV: <strong className="text-emerald-400 font-bold">{formatINR(405800)}</strong>
              </div>
            </div>
          </div>
        )}

        {metricView === 'tsr_trajectory' && (
          /* TSR Trajectory Line Visualizer */
          <div className="h-full flex flex-col justify-between">
            <div className="h-44 relative flex items-center justify-between px-4">
              {/* Baseline Horizontal Ref Line (86.5%) */}
              <div className="absolute left-4 right-4 top-1/2 border-b border-dashed border-red-500/30 pointer-events-none flex justify-between">
                <span className="text-[10px] font-mono text-red-400/80 -mt-4">Baseline Industry TSR (86.5%)</span>
                <span className="text-[10px] font-mono text-emerald-400 -mt-4">RecoverAI Target (&gt;90.5%)</span>
              </div>

              {hourlyData.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 text-center">
                  <div className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    {d.recoveredTSR}%
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50 my-2" />
                  <div className="text-[10px] font-mono text-red-400/80">
                    {d.baselineTSR}%
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-2">{d.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
              <span className="text-[11px] text-slate-400">Average Conversion Lift: <strong className="text-emerald-400 font-mono">+4.2% Absolute TSR</strong></span>
              <span className="text-[11px] text-blue-300 font-mono">Zero Double-Charges Guaranteed</span>
            </div>
          </div>
        )}

        {metricView === 'channel_mix' && (
          /* Channel Mix Breakdown */
          <div className="h-full flex flex-col justify-between space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-40 items-center">
              {/* UPI Switch */}
              <div className="bg-slate-900 border border-blue-500/40 p-3 rounded-xl flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" /> UPI Switch
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">54%</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">{formatINR(243200)}</div>
                <div className="text-[10px] text-slate-400">Median recovery: 22s</div>
              </div>

              {/* WhatsApp */}
              <div className="bg-slate-900 border border-emerald-500/40 p-3 rounded-xl flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Pay
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">26%</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">{formatINR(117100)}</div>
                <div className="text-[10px] text-slate-400">96.4% Open Rate</div>
              </div>

              {/* Smart Dunning */}
              <div className="bg-slate-900 border border-purple-500/40 p-3 rounded-xl flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Smart Dunning
                  </span>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">12%</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">{formatINR(54000)}</div>
                <div className="text-[10px] text-slate-400">Salary-aligned</div>
              </div>

              {/* Card Token Vault */}
              <div className="bg-slate-900 border border-amber-500/40 p-3 rounded-xl flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> Saved Vault
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">8%</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">{formatINR(36000)}</div>
                <div className="text-[10px] text-slate-400">1-Click Fallback</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-800/80 pt-2">
              <span>All 4 channels run autonomous failover switches dynamically based on bank telemetry.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
