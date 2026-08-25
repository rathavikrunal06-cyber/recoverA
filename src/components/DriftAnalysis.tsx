import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Layers,
  Scale,
  ShieldAlert,
  BarChart2,
  PieChart,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';
import { SystemMetrics, TransactionRecord } from '../types';

interface DriftAnalysisProps {
  metrics: SystemMetrics | null;
  transactions?: TransactionRecord[];
  onNavigateToFutureScenarios?: () => void;
}

export const DriftAnalysis: React.FC<DriftAnalysisProps> = ({
  metrics,
  transactions = [],
  onNavigateToFutureScenarios,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [isRecalibrating, setIsRecalibrating] = useState<boolean>(false);
  const [recalibrationDone, setRecalibrationDone] = useState<boolean>(false);

  // Error Code Distribution Shift (Baseline vs Current)
  const errorDriftData = [
    { code: '504 Gateway Timeout', baselinePct: 34.0, currentPct: 38.2, shift: '+4.2%', psi: 0.032, status: 'STABLE' },
    { code: '3DS OTP SMS Timeout', baselinePct: 28.5, currentPct: 26.1, shift: '-2.4%', psi: 0.018, status: 'STABLE' },
    { code: 'Insufficient Funds (NSF)', baselinePct: 16.0, currentPct: 18.4, shift: '+2.4%', psi: 0.021, status: 'STABLE' },
    { code: 'Expired Card / COFT Token', baselinePct: 14.5, currentPct: 12.1, shift: '-2.4%', psi: 0.019, status: 'STABLE' },
    { code: 'Account Limit Exceeded', baselinePct: 7.0, currentPct: 5.2, shift: '-1.8%', psi: 0.012, status: 'STABLE' },
  ];

  // Bank Switch Degradation Drift
  const bankDriftData = [
    { bank: 'HDFC Bank', baselineFailureRate: '4.2%', currentFailureRate: '7.8%', driftTrend: 'SPIKE_DETECTED', alert: '504 Switch Degraded' },
    { bank: 'State Bank of India', baselineFailureRate: '6.8%', currentFailureRate: '6.4%', driftTrend: 'NORMAL', alert: 'Optimal Failover' },
    { bank: 'ICICI Bank', baselineFailureRate: '3.9%', currentFailureRate: '4.1%', driftTrend: 'NORMAL', alert: 'Optimal Failover' },
    { bank: 'Axis Bank', baselineFailureRate: '4.8%', currentFailureRate: '5.0%', driftTrend: 'NORMAL', alert: 'Optimal Failover' },
  ];

  // Population Stability Index (PSI) Summary
  const psiFeatures = [
    { feature: 'Error Code Distribution', psiScore: 0.042, interpretation: 'Stable (<0.10)', color: 'emerald' },
    { feature: 'Bank Ingress Distribution', psiScore: 0.088, interpretation: 'Stable (<0.10)', color: 'emerald' },
    { feature: 'AOV Bucket Distribution', psiScore: 0.035, interpretation: 'Stable (<0.10)', color: 'emerald' },
    { feature: 'Device Channel Ratio', psiScore: 0.019, interpretation: 'Stable (<0.10)', color: 'emerald' },
    { feature: 'AI Prediction Confidence', psiScore: 0.024, interpretation: 'Stable (<0.10)', color: 'emerald' },
  ];

  const handleTriggerRecalibration = () => {
    setIsRecalibrating(true);
    setTimeout(() => {
      setIsRecalibrating(false);
      setRecalibrationDone(true);
      setTimeout(() => setRecalibrationDone(false), 4000);
    }, 1200);
  };

  return (
    <div id="drift-analysis" className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-teal-400 border border-teal-500/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">Payment Telemetry & AI Model Drift Analysis Studio</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Overall PSI: 0.042 (Highly Stable)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuously measures distribution shifts in bank switch failures, payment taxonomies, and AI prediction confidence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigateToFutureScenarios && (
            <button
              onClick={onNavigateToFutureScenarios}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-indigo-500/30 transition-all cursor-pointer shadow-sm"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Simulate 90-Day Shocks &rarr;</span>
            </button>
          )}

          <button
            onClick={handleTriggerRecalibration}
            disabled={isRecalibrating}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-teal-500/20 disabled:opacity-50"
          >
            {isRecalibrating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : recalibrationDone ? (
              <Check className="w-4 h-4 text-emerald-200" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{recalibrationDone ? 'Weights Re-calibrated!' : 'Trigger 1-Click Prompt Calibration'}</span>
          </button>
        </div>
      </div>

      {/* PSI Stability Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {psiFeatures.map((p, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1.5 font-mono text-xs">
            <div className="text-[11px] text-slate-400 font-sans font-medium">{p.feature}</div>
            <div className="text-lg font-bold text-white flex items-center justify-between">
              <span>{p.psiScore.toFixed(3)}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                PSI
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-sans font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {p.interpretation}
            </div>
          </div>
        ))}
      </div>

      {/* Error Taxonomy Shift Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Error Code Distribution Drift (30-Day Baseline vs Current Live Ingress)</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Wasserstein Distance: 0.014</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-sans">
                <th className="pb-3 font-semibold">Error Taxonomy Code</th>
                <th className="pb-3 font-semibold">30-Day Baseline</th>
                <th className="pb-3 font-semibold">Current Live Window</th>
                <th className="pb-3 font-semibold">Distribution Shift</th>
                <th className="pb-3 font-semibold">PSI Stability</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {errorDriftData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3 font-sans font-bold text-white">{row.code}</td>
                  <td className="py-3 text-slate-300">{row.baselinePct}%</td>
                  <td className="py-3 text-emerald-400 font-bold">{row.currentPct}%</td>
                  <td className={`py-3 font-bold ${row.shift.startsWith('+') ? 'text-amber-400' : 'text-blue-400'}`}>
                    {row.shift}
                  </td>
                  <td className="py-3 text-slate-400">{row.psi}</td>
                  <td className="py-3">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Failure Rate Anomaly Detector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Issuer Bank Switch Outage & Drift Monitoring</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bankDriftData.map((b, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border space-y-2 text-xs font-mono ${
                b.driftTrend === 'SPIKE_DETECTED'
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex justify-between items-center font-sans font-bold">
                <span className="text-white text-sm">{b.bank}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    b.driftTrend === 'SPIKE_DETECTED'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {b.alert}
                </span>
              </div>

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Baseline Error Rate: <strong className="text-slate-300">{b.baselineFailureRate}</strong></span>
                <span>Current Failure Rate: <strong className={b.driftTrend === 'SPIKE_DETECTED' ? 'text-amber-400 font-bold' : 'text-slate-300'}>{b.currentFailureRate}</strong></span>
              </div>

              <div className="text-[11px] font-sans text-slate-400 pt-1">
                {b.driftTrend === 'SPIKE_DETECTED'
                  ? 'Autonomous traffic auto-rerouted to UPI Fast-Rail to prevent checkout drop-offs.'
                  : 'Traffic within expected variance thresholds. Standard routing active.'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
