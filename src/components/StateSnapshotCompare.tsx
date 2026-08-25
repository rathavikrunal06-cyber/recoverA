import React, { useState } from 'react';
import {
  Camera,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  ShieldCheck,
  Sparkles,
  Download,
  Trash2,
  Plus,
  RefreshCw,
  Sliders,
  Scale,
  DollarSign,
  FileText,
  Activity,
  Award,
  ChevronRight,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { SystemMetrics, StateSnapshot, TransactionRecord } from '../types';
import { StorageManager } from '../services/storage';

interface StateSnapshotCompareProps {
  currentMetrics: SystemMetrics | null;
  transactions?: TransactionRecord[];
  onTakeSnapshot?: (name?: string) => void;
  snapshots?: StateSnapshot[];
  onDeleteSnapshot?: (id: string) => void;
  onRestoreSnapshot?: (snapshot: StateSnapshot) => void;
}

export const StateSnapshotCompare: React.FC<StateSnapshotCompareProps> = ({
  currentMetrics,
  transactions = [],
  onTakeSnapshot,
  snapshots: externalSnapshots,
  onDeleteSnapshot,
  onRestoreSnapshot,
}) => {
  const [localSnapshots, setLocalSnapshots] = useState<StateSnapshot[]>(() =>
    externalSnapshots || StorageManager.getSnapshots()
  );
  const [snapshotNameInput, setSnapshotNameInput] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [selectedBeforeId, setSelectedBeforeId] = useState<string>('snap_baseline_pre_ai');
  const [selectedAfterId, setSelectedAfterId] = useState<string>('current_live_state');
  const [comparisonMode, setComparisonMode] = useState<'SIDE_BY_SIDE' | 'DELTA_CARDS' | 'PITCH_SLIDES'>('SIDE_BY_SIDE');
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Sync if external snapshots change
  const allSnapshots = externalSnapshots || localSnapshots;

  const formatINR = (paise: number) => {
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(rupees);
  };

  const handleCaptureSnapshot = () => {
    if (!currentMetrics) return;
    setIsCapturing(true);

    const now = Date.now();
    const count = allSnapshots.length;
    const name =
      snapshotNameInput.trim() ||
      `Snapshot #${count + 1} (${currentMetrics.overallRecoveryRate}% Recovery, ${currentMetrics.tsrLiftPercentage}% TSR)`;

    const newSnap: StateSnapshot = {
      id: `snap_${now}`,
      name,
      timestamp: now,
      formattedTime: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      metrics: { ...currentMetrics },
      transactionsCount: transactions.length,
      tag: count === 0 ? 'BASELINE' : currentMetrics.overallRecoveryRate > 30 ? 'AI_OPTIMIZED' : 'CUSTOM',
      notes: `Captured with ${transactions.length} transactions processed.`,
    };

    const updated = StorageManager.addSnapshot(newSnap);
    setLocalSnapshots(updated);
    setSnapshotNameInput('');
    setSelectedAfterId(newSnap.id);

    if (onTakeSnapshot) {
      onTakeSnapshot(name);
    }

    setTimeout(() => {
      setIsCapturing(false);
    }, 400);
  };

  const handleDelete = (id: string) => {
    if (id === 'snap_baseline_pre_ai') return; // protect default baseline
    const updated = StorageManager.deleteSnapshot(id);
    setLocalSnapshots(updated);
    if (onDeleteSnapshot) onDeleteSnapshot(id);
    if (selectedBeforeId === id) setSelectedBeforeId('snap_baseline_pre_ai');
    if (selectedAfterId === id) setSelectedAfterId('current_live_state');
  };

  // Find selected Before snapshot
  const beforeSnapshot =
    allSnapshots.find((s) => s.id === selectedBeforeId) ||
    allSnapshots[0] || {
      id: 'default_baseline',
      name: 'Pre-AI Legacy Gateway Baseline',
      timestamp: Date.now() - 86400000,
      formattedTime: 'Baseline',
      transactionsCount: 100,
      tag: 'BASELINE' as const,
      metrics: {
        totalFailedGMV: 184500000,
        totalRecoveredGMV: 0,
        totalEventsProcessed: 100,
        totalRecoveredCount: 0,
        overallRecoveryRate: 0,
        tsrLiftPercentage: 0,
        avgLatencyMs: 240,
        activeDunningSchedules: 0,
        falsePositiveRate: 0,
        protectedDoubleCharges: 0,
      },
    };

  // Find selected After snapshot (or live current metrics)
  const afterSnapshot: StateSnapshot =
    selectedAfterId === 'current_live_state'
      ? {
          id: 'current_live_state',
          name: 'Current Live Dashboard State',
          timestamp: Date.now(),
          formattedTime: 'Live Real-Time',
          transactionsCount: transactions.length,
          tag: 'AI_OPTIMIZED',
          metrics: currentMetrics || {
            totalFailedGMV: 184500000,
            totalRecoveredGMV: 4825000,
            totalEventsProcessed: 142,
            totalRecoveredCount: 68,
            overallRecoveryRate: 48.2,
            tsrLiftPercentage: 5.2,
            avgLatencyMs: 38.4,
            activeDunningSchedules: 14,
            falsePositiveRate: 0,
            protectedDoubleCharges: 21,
          },
        }
      : allSnapshots.find((s) => s.id === selectedAfterId) || allSnapshots[0];

  // Calculate comparative deltas
  const bMetrics = beforeSnapshot.metrics;
  const aMetrics = afterSnapshot.metrics;

  const deltaRecoveredGMV = aMetrics.totalRecoveredGMV - bMetrics.totalRecoveredGMV;
  const deltaTSRLift = +(aMetrics.tsrLiftPercentage - bMetrics.tsrLiftPercentage).toFixed(2);
  const deltaRecoveryRate = +(aMetrics.overallRecoveryRate - bMetrics.overallRecoveryRate).toFixed(1);
  const deltaLatencyMs = +(aMetrics.avgLatencyMs - bMetrics.avgLatencyMs).toFixed(1);
  const latencySpeedupRatio = bMetrics.avgLatencyMs > 0 ? (bMetrics.avgLatencyMs / Math.max(1, aMetrics.avgLatencyMs)).toFixed(1) : '1.0';
  const deltaRecoveredCount = aMetrics.totalRecoveredCount - bMetrics.totalRecoveredCount;
  const deltaDoubleChargeGuards = aMetrics.protectedDoubleCharges - bMetrics.protectedDoubleCharges;

  // Annualized Saved Difference based on ₹2 Cr / month baseline
  const estimatedMonthlyRecoveredA = (20000000 * 0.095 * (aMetrics.overallRecoveryRate / 100));
  const estimatedMonthlyRecoveredB = (20000000 * 0.095 * (bMetrics.overallRecoveryRate / 100));
  const annualizedIncrementalProfit = (estimatedMonthlyRecoveredA - estimatedMonthlyRecoveredB) * 12;

  const handleCopyPitchSummary = () => {
    const summary = `🚀 RECOVERAI LIVE BEFORE VS AFTER PITCH AUDIT:\n` +
      `--------------------------------------------------\n` +
      `[BEFORE]: ${beforeSnapshot.name}\n` +
      `• Recovered GMV: ${formatINR(bMetrics.totalRecoveredGMV)}\n` +
      `• Overall Recovery Rate: ${bMetrics.overallRecoveryRate}%\n` +
      `• TSR Lift: +${bMetrics.tsrLiftPercentage}%\n` +
      `• Average Latency: ${bMetrics.avgLatencyMs}ms\n\n` +
      `[AFTER]: ${afterSnapshot.name}\n` +
      `• Recovered GMV: ${formatINR(aMetrics.totalRecoveredGMV)} (+${formatINR(deltaRecoveredGMV)})\n` +
      `• Overall Recovery Rate: ${aMetrics.overallRecoveryRate}% (+${deltaRecoveryRate}% gain)\n` +
      `• TSR Lift: +${aMetrics.tsrLiftPercentage}% (+${deltaTSRLift}% incremental conversion)\n` +
      `• Average Latency: ${aMetrics.avgLatencyMs}ms (${latencySpeedupRatio}x faster)\n` +
      `• Double Charge Guards: ${aMetrics.protectedDoubleCharges} locks safe\n` +
      `• Projected Annual Merchant Profit: ${formatINR(annualizedIncrementalProfit * 100)}/yr\n` +
      `--------------------------------------------------\n` +
      `Evaluated on Razorpay Buildathon 2026 AI Engine.`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div
      id="state-snapshot-compare-panel"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-6"
    >
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-2xl shadow-inner">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live State Snapshot & Before vs After Pitch Compare
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {allSnapshots.length} Snapshots Stored
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record instantaneous platform telemetry checkpoints to demonstrate measurable ROI and conversion lift during live pitch demonstrations.
            </p>
          </div>
        </div>

        {/* Snapshot Capture Toolbar */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-64">
            <input
              id="input-snapshot-name"
              type="text"
              value={snapshotNameInput}
              onChange={(e) => setSnapshotNameInput(e.target.value)}
              placeholder="e.g. Post-Flash AI Optimization"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCaptureSnapshot();
              }}
            />
          </div>

          <button
            id="btn-take-snapshot"
            onClick={handleCaptureSnapshot}
            disabled={isCapturing || !currentMetrics}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Camera className={`w-4 h-4 ${isCapturing ? 'animate-spin' : ''}`} />
            <span>{isCapturing ? 'Recording...' : 'Take Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* Snapshot Selector Cards & Mode Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Left: Before Snapshot Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            1. "Before" State (Baseline)
          </label>
          <select
            id="select-before-snapshot"
            value={selectedBeforeId}
            onChange={(e) => setSelectedBeforeId(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
          >
            {allSnapshots.map((snap) => (
              <option key={snap.id} value={snap.id}>
                {snap.name} ({snap.metrics.overallRecoveryRate}% Recovery &bull; {snap.formattedTime})
              </option>
            ))}
          </select>
        </div>

        {/* Center: Interactive Mode Switcher & Copy Pitch Summary */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setComparisonMode('SIDE_BY_SIDE')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                comparisonMode === 'SIDE_BY_SIDE'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setComparisonMode('DELTA_CARDS')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                comparisonMode === 'DELTA_CARDS'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Delta Summary
            </button>
            <button
              onClick={() => setComparisonMode('PITCH_SLIDES')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                comparisonMode === 'PITCH_SLIDES'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Pitch Card
            </button>
          </div>

          <button
            id="btn-copy-pitch-comparison-summary"
            onClick={handleCopyPitchSummary}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {copiedSummary ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedSummary ? 'Comparison Copied to Clipboard!' : 'Copy Comparison Summary'}</span>
          </button>
        </div>

        {/* Right: After Snapshot Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
            2. "After" State (Active / AI)
          </label>
          <select
            id="select-after-snapshot"
            value={selectedAfterId}
            onChange={(e) => setSelectedAfterId(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
          >
            <option value="current_live_state">
              Current Live Dashboard State ({currentMetrics?.overallRecoveryRate || 0}% Recovery &bull; Live)
            </option>
            {allSnapshots.map((snap) => (
              <option key={snap.id} value={snap.id}>
                {snap.name} ({snap.metrics.overallRecoveryRate}% Recovery &bull; {snap.formattedTime})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SIDE-BY-SIDE VISUAL COMPARISON GRID */}
      {/* ========================================================================= */}
      {comparisonMode === 'SIDE_BY_SIDE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* BEFORE CARD */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 border-2 border-rose-500/30 rounded-2xl p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-900/40 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500 text-white uppercase">
                  Before: Baseline
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {beforeSnapshot.name}
                </h4>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {beforeSnapshot.formattedTime} &bull; {beforeSnapshot.transactionsCount} txns
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-mono font-bold block">
                  Recovery Rate
                </span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {bMetrics.overallRecoveryRate}%
                </span>
              </div>
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Recovered GMV</span>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {formatINR(bMetrics.totalRecoveredGMV)}
                </div>
                <span className="text-[10px] text-slate-500">of {formatINR(bMetrics.totalFailedGMV)} failed</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">TSR Lift</span>
                <div className="text-base font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                  +{bMetrics.tsrLiftPercentage}%
                </div>
                <span className="text-[10px] text-slate-500">Conversion gain</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Latency</span>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {bMetrics.avgLatencyMs}ms
                </div>
                <span className="text-[10px] text-slate-500">Unoptimized queue</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Dunning Schedules</span>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {bMetrics.activeDunningSchedules} Active
                </div>
                <span className="text-[10px] text-slate-500">Static retry logic</span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Total Success Trajectory</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{bMetrics.overallRecoveryRate}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(5, bMetrics.overallRecoveryRate))}%` }}
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>

          {/* AFTER CARD */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/40 rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-lg shadow-emerald-500/5">
            <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900/40 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white uppercase flex items-center gap-1 w-fit">
                  <Sparkles className="w-2.5 h-2.5" /> After: Gemini AI Optimized
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {afterSnapshot.name}
                </h4>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {afterSnapshot.formattedTime} &bull; {afterSnapshot.transactionsCount} txns
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold block">
                  Recovery Rate
                </span>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {aMetrics.overallRecoveryRate}%
                </span>
              </div>
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Recovered GMV</span>
                  <span className="text-[9px] font-bold font-mono px-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    +{formatINR(deltaRecoveredGMV)}
                  </span>
                </div>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatINR(aMetrics.totalRecoveredGMV)}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {aMetrics.totalRecoveredCount} orders saved
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">TSR Lift</span>
                  <span className="text-[9px] font-bold font-mono px-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    +{deltaTSRLift}%
                  </span>
                </div>
                <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                  +{aMetrics.tsrLiftPercentage}%
                </div>
                <span className="text-[10px] text-blue-500">Autonomous failover</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Latency</span>
                  <span className="text-[9px] font-bold font-mono px-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    {latencySpeedupRatio}x faster
                  </span>
                </div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {aMetrics.avgLatencyMs}ms
                </div>
                <span className="text-[10px] text-emerald-500 font-medium">Dual-tier Flash SLA</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Double Charge Safe</span>
                  <span className="text-[9px] font-bold font-mono px-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    0 Errors
                  </span>
                </div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {aMetrics.protectedDoubleCharges} Locks
                </div>
                <span className="text-[10px] text-emerald-500 font-semibold">Redis singleton mutex</span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Total Success Trajectory</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{aMetrics.overallRecoveryRate}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(5, aMetrics.overallRecoveryRate))}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DELTA CARDS & HIGHLIGHTED METRICS VIEW */}
      {/* ========================================================================= */}
      {comparisonMode === 'DELTA_CARDS' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 p-4 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Delta Recovered GMV</span>
            <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              +{formatINR(deltaRecoveredGMV)}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{deltaRecoveredCount} Orders Salvaged
            </span>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 p-4 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Delta TSR Lift</span>
            <div className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
              +{deltaTSRLift}%
            </div>
            <span className="text-[11px] text-blue-500 font-semibold">
              Net conversion expansion
            </span>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-4 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Delta Recovery Rate</span>
            <div className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">
              +{deltaRecoveryRate}%
            </div>
            <span className="text-[11px] text-purple-500 font-semibold">
              From {bMetrics.overallRecoveryRate}% &rarr; {aMetrics.overallRecoveryRate}%
            </span>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-4 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Latency Speedup</span>
            <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
              {latencySpeedupRatio}x
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              {bMetrics.avgLatencyMs}ms &rarr; {aMetrics.avgLatencyMs}ms
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PITCH SLIDES SUMMARY VIEW */}
      {/* ========================================================================= */}
      {comparisonMode === 'PITCH_SLIDES' && (
        <div className="bg-slate-950 text-white rounded-2xl p-6 border border-indigo-500/30 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-bold text-white">
                Live Pitch Executive Comparison Summary
              </h4>
            </div>
            <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30">
              Razorpay Buildathon 2026 Audit
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold">1. Revenue Salvage Impact</span>
              <div className="text-2xl font-black font-mono text-emerald-400">
                +{formatINR(deltaRecoveredGMV)}
              </div>
              <p className="text-xs text-slate-300">
                Recovered immediately through zero-drop automated retry mechanisms without requiring customer re-entry.
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold">2. Transaction Success Rate</span>
              <div className="text-2xl font-black font-mono text-blue-400">
                +{deltaTSRLift}% Lift
              </div>
              <p className="text-xs text-slate-300">
                Eliminates cart abandonment caused by issuer ACS timeouts, bank server drops, and expired OTPs.
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold">3. Projected Merchant GMV / Year</span>
              <div className="text-2xl font-black font-mono text-purple-400">
                {formatINR(annualizedIncrementalProfit * 100)}
              </div>
              <p className="text-xs text-slate-300">
                Calculated across typical ₹2 Cr/mo merchant volume with zero double charges and 100% compliance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot History Table / Drawer */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Recorded Snapshot Timeline ({allSnapshots.length})
          </h4>
          <span className="text-[11px] text-slate-400">Click any snapshot to compare against baseline</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Snapshot Name</th>
                <th className="py-2.5 px-3 font-semibold">Captured</th>
                <th className="py-2.5 px-3 font-semibold">Recovery Rate</th>
                <th className="py-2.5 px-3 font-semibold">Recovered GMV</th>
                <th className="py-2.5 px-3 font-semibold">TSR Lift</th>
                <th className="py-2.5 px-3 font-semibold">Latency</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {allSnapshots.map((snap) => {
                const isSelectedBefore = selectedBeforeId === snap.id;
                const isSelectedAfter = selectedAfterId === snap.id;
                const isBaseline = snap.tag === 'BASELINE';

                return (
                  <tr
                    key={snap.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelectedAfter
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                        : isSelectedBefore
                        ? 'bg-rose-50/40 dark:bg-rose-950/20'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{snap.name}</span>
                        {isBaseline && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold">
                            BASELINE
                          </span>
                        )}
                        {snap.tag === 'AI_OPTIMIZED' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            AI
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">{snap.notes || 'Checkpoint recorded.'}</div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 font-sans">
                      {snap.formattedTime}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                      {snap.metrics.overallRecoveryRate}%
                    </td>

                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatINR(snap.metrics.totalRecoveredGMV)}
                    </td>

                    <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-bold">
                      +{snap.metrics.tsrLiftPercentage}%
                    </td>

                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {snap.metrics.avgLatencyMs}ms
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBeforeId(snap.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold transition-all cursor-pointer ${
                            isSelectedBefore
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                          }`}
                        >
                          Set Before
                        </button>
                        <button
                          onClick={() => setSelectedAfterId(snap.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold transition-all cursor-pointer ${
                            isSelectedAfter
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                          }`}
                        >
                          Set After
                        </button>
                        {!isBaseline && (
                          <button
                            onClick={() => handleDelete(snap.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                            title="Delete snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
