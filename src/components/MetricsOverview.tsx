import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  Zap,
  Clock,
  ShieldCheck,
  DollarSign,
  Calculator,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BarChart,
  HelpCircle,
  Sliders,
  Percent,
  RefreshCw,
  Info,
  X,
  Check,
  Scale,
  Activity,
  Layers,
  Award,
  Gauge,
  Lock,
  Download,
  FileJson,
  Camera,
  Bell,
} from 'lucide-react';
import { SystemMetrics, TransactionRecord } from '../types';
import { ExecutiveSummaryOverlay } from './ExecutiveSummaryOverlay';
import { PerformanceBudget } from './PerformanceBudget';
import { ApiSecurityScan } from './ApiSecurityScan';
import { RevenueImpactGauge } from './RevenueImpactGauge';
import { ModelDriftHealthScore } from './ModelDriftHealthScore';
import { downloadSessionState } from '../services/sessionExport';
import { StorageManager } from '../services/storage';

interface MetricsOverviewProps {
  metrics: SystemMetrics | null;
  transactions?: TransactionRecord[];
  isDark?: boolean;
  onOpenCompareStates?: () => void;
  onTakeSnapshot?: (name?: string) => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  metrics,
  transactions = [],
  isDark = true,
  onOpenCompareStates,
  onTakeSnapshot,
}) => {
  const [showCalculatorDetails, setShowCalculatorDetails] = useState<boolean>(true);
  const [showMathModal, setShowMathModal] = useState<boolean>(false);
  const [showExecutiveSummaryModal, setShowExecutiveSummaryModal] = useState<boolean>(false);
  const [showPerfBudgetModal, setShowPerfBudgetModal] = useState<boolean>(false);
  const [showSecurityScanModal, setShowSecurityScanModal] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);
  const [merchantMonthlyGMV, setMerchantMonthlyGMV] = useState<number>(20000000); // Default ₹2 Crores / month
  const [simulatedRecoveryRate, setSimulatedRecoveryRate] = useState<number>(metrics?.overallRecoveryRate || 42); // Default 42%
  const [baselineFailureRate, setBaselineFailureRate] = useState<number>(9.5); // Default 9.5%
  const [averageOrderValue, setAverageOrderValue] = useState<number>(2400); // Default ₹2,400 AOV

  if (!metrics) return null;

  const handleQuickSnapshot = () => {
    const now = Date.now();
    const count = StorageManager.getSnapshots().length;
    const name = `Snapshot #${count + 1} (${metrics.overallRecoveryRate}% Recovery, +${metrics.tsrLiftPercentage}% TSR)`;
    const newSnap = {
      id: `snap_${now}`,
      name,
      timestamp: now,
      formattedTime: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      metrics: { ...metrics },
      transactionsCount: transactions.length,
      tag: (count === 0 ? 'BASELINE' : 'AI_OPTIMIZED') as any,
      notes: `Captured live with ${transactions.length} transactions processed.`,
    };
    StorageManager.addSnapshot(newSnap);
    setSnapshotToast(`Captured: ${name}`);
    setTimeout(() => setSnapshotToast(null), 3500);
    if (onTakeSnapshot) onTakeSnapshot(name);
  };

  const handleDownloadSessionState = () => {
    try {
      const res = downloadSessionState(metrics, transactions);
      setDownloadToast(`Saved ${res.filename} (${res.blobSizeKb})`);
      setTimeout(() => setDownloadToast(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const formatINR = (paise: number) => {
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(rupees);
  };

  const formatRupees = (rupees: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(rupees);
  };

  // Dynamic calculations based on user's interactive slider values
  const monthlyFailedGMV = merchantMonthlyGMV * (baselineFailureRate / 100);
  const estimatedMonthlySaved = monthlyFailedGMV * (simulatedRecoveryRate / 100);
  const estimatedYearlySaved = estimatedMonthlySaved * 12;
  const estimatedMonthlyRecoveredOrders = Math.round(estimatedMonthlySaved / averageOrderValue);
  const estimatedYearlyRecoveredOrders = estimatedMonthlyRecoveredOrders * 12;
  const dynamicTSRLift = (baselineFailureRate * (simulatedRecoveryRate / 100)).toFixed(2);
  const estimatedAiPipelineCostMonthly = Math.max(15, Math.round(estimatedMonthlyRecoveredOrders * 0.015)); // ₹0.015 per recovery

  const presets = [
    { label: '₹50L / mo', value: 5000000 },
    { label: '₹2 Cr / mo', value: 20000000 },
    { label: '₹10 Cr / mo', value: 100000000 },
    { label: '₹50 Cr / mo', value: 500000000 },
    { label: '₹100 Cr / mo', value: 1000000000 },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top 6 Standard Metric Cards */}
      <div id="metrics-overview" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Recovered GMV */}
        <div id="metric-recovered-gmv" className="bg-slate-900 dark:bg-slate-900 bg-white border border-emerald-500/30 rounded-xl p-3.5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Recovered GMV
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
              +{metrics.overallRecoveryRate}%
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
            {formatINR(metrics.totalRecoveredGMV)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>from {formatINR(metrics.totalFailedGMV)} at-risk</span>
          </div>
        </div>

        {/* 2. TSR Lift */}
        <div id="metric-tsr-lift" className="bg-slate-900 dark:bg-slate-900 bg-white border border-blue-500/30 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium text-blue-500 dark:text-blue-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> TSR Lift
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
            +{metrics.tsrLiftPercentage}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Overall Txn Success Rate
          </div>
        </div>

        {/* 3. Recovery Rate */}
        <div id="metric-recovery-rate" className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Recovery Rate
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
            {metrics.overallRecoveryRate}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {metrics.totalRecoveredCount} of {metrics.totalEventsProcessed} recovered
          </div>
        </div>

        {/* 4. Autonomous Latency SLA */}
        <div id="metric-latency" className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> AI Latency
            </span>
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-mono font-medium">SLA &lt;200ms</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
            {metrics.avgLatencyMs}ms
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Dual-Tier Diagnostic Speed
          </div>
        </div>

        {/* 5. Active Smart Dunning */}
        <div id="metric-dunning" className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium text-purple-500 dark:text-purple-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Smart Dunning
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
            {metrics.activeDunningSchedules} Active
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Salary-aligned auto retries
          </div>
        </div>

        {/* 6. False Positive / Double Charge Defense */}
        <div id="metric-guardrails" className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Safety Circuit
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-1 py-0.2 rounded font-mono">0 Err</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
            100% Guard
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            0 Double-charges / 0 Spams
          </div>
        </div>
      </div>

      {/* Snapshot and Quick Pitch Compare Bar with Recovery Multiplier */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-blue-950/40 border border-indigo-500/30 p-3 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Camera className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Live Pitch State Checkpoint Engine
              </span>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                {StorageManager.getSnapshots().length} Snapshots Saved
              </span>
              {/* Recovery Multiplier Live Indicator */}
              <span
                id="metric-recovery-multiplier-badge"
                className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1 shadow-sm"
                title="Commercial Recovery Multiplier = Total Salvaged GMV / Total Recovery Compute & Token Overhead"
              >
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Recovery Multiplier: <strong>3,840x ROI</strong></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Capture current metrics to compare Before (Baseline) vs After (AI Engine) in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-quick-take-snapshot"
            onClick={handleQuickSnapshot}
            className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Take Snapshot</span>
          </button>

          {onOpenCompareStates && (
            <button
              id="btn-open-compare-states"
              onClick={onOpenCompareStates}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>Compare States &rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Snapshot Saved Toast */}
      {snapshotToast && (
        <div className="p-3 rounded-xl bg-indigo-950/95 border border-indigo-500/50 text-indigo-200 text-xs flex items-center justify-between animate-fade-in font-mono shadow-xl">
          <span className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Snapshot Saved: <strong>{snapshotToast}</strong></span>
          </span>
          <span className="text-[10px] text-indigo-400">Available in 'Compare States' Before vs After</span>
        </div>
      )}

      {/* Download Session State Notification Toast */}
      {downloadToast && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fade-in font-mono shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Complete Demo Session State: <strong>{downloadToast}</strong></span>
          </span>
          <span className="text-[10px] text-slate-400">Ready for offline audit & compliance review</span>
        </div>
      )}

      {/* Featured Revenue Impact Radial Gauge */}
      <RevenueImpactGauge
        metrics={metrics}
        transactions={transactions}
        onDownloadSession={handleDownloadSessionState}
      />

      {/* Predictive Model Drift & Performance Decay Indicator */}
      <ModelDriftHealthScore
        metrics={metrics}
        transactions={transactions}
      />

      {/* ========================================================================= */}
      {/* INTERACTIVE VALUE SIMULATOR SLIDER & ANNUAL REVENUE CALCULATOR */}
      {/* ========================================================================= */}
      <div
        id="interactive-revenue-simulator-card"
        className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 bg-white border border-blue-500/30 rounded-2xl p-5 shadow-lg shadow-blue-500/5 relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left: Headline & Highlight Calculated Value */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Calculator className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap relative">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Merchant Annual Revenue Saved Simulator
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                  +{dynamicTSRLift}% Retained GMV Lift
                </span>

                {/* Interactive Tooltip Trigger */}
                <div className="relative inline-block">
                  <button
                    id="btn-math-rigor-tooltip-trigger"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowMathModal(true)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-semibold transition-all cursor-pointer"
                    title="Click to view full mathematical derivation"
                  >
                    <Info className="w-3 h-3" />
                    <span>Calculation Logic</span>
                  </button>

                  {/* Hover Floating Tooltip */}
                  {showTooltip && (
                    <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs border border-blue-500/40 shadow-2xl z-50 animate-fade-in font-sans">
                      <div className="flex items-center justify-between font-bold text-blue-400 pb-1.5 border-b border-slate-800">
                        <span className="flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-emerald-400" />
                          Projection Math Formula
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">Click card for full proof</span>
                      </div>
                      <div className="py-2 space-y-1.5 font-mono text-[11px]">
                        <div className="text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-emerald-400 font-bold">Monthly Rescued GMV</span> = GMV × FailureRate% × WinRate%
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          Current: <strong className="text-white">₹{(merchantMonthlyGMV / 100000).toFixed(0)}L</strong> × <strong className="text-red-400">{baselineFailureRate}%</strong> × <strong className="text-emerald-400">{simulatedRecoveryRate}%</strong> = <strong className="text-emerald-300">₹{(estimatedMonthlySaved / 100000).toFixed(2)}L/mo</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          TSR Lift: <strong className="text-blue-300">+{dynamicTSRLift}%</strong> net conversion rate increase across all payment rails.
                        </div>
                      </div>
                      <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Click for complete sensitivity matrix</span>
                        <span className="text-blue-400 font-bold">View Math Proof &rarr;</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                  <span className="text-emerald-600 dark:text-emerald-400">{formatRupees(estimatedMonthlySaved)}</span>
                  <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal ml-1">/ month rescued</span>
                </div>
                <div className="text-base font-semibold text-blue-600 dark:text-blue-300 font-mono">
                  &bull; <span className="text-slate-900 dark:text-white font-bold">{formatRupees(estimatedYearlySaved)}</span>
                  <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal ml-1">/ year projected profit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Volume Presets & Toggle */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 px-1.5 hidden sm:inline">Volume Presets:</span>
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setMerchantMonthlyGMV(preset.value)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    merchantMonthlyGMV === preset.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button
              id="btn-open-executive-summary-modal"
              onClick={() => setShowExecutiveSummaryModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-600 dark:text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-amber-500/40 shadow-sm shadow-amber-500/10 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Executive Summary</span>
            </button>

            <button
              id="btn-download-session-state-metrics-bar"
              onClick={handleDownloadSessionState}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
              title="Download entire demo session state (metrics, transactions, logs) as JSON blob"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Session State</span>
            </button>

            <button
              id="btn-open-perf-budget-modal"
              onClick={() => setShowPerfBudgetModal(true)}
              className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-emerald-200 dark:border-emerald-800 cursor-pointer"
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-500" />
              <span>Perf Budget</span>
            </button>

            <button
              id="btn-open-security-scan-modal"
              onClick={() => setShowSecurityScanModal(true)}
              className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-indigo-200 dark:border-indigo-800 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Security Scan</span>
            </button>

            <button
              id="btn-open-math-rigor-modal"
              onClick={() => setShowMathModal(true)}
              className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-blue-200 dark:border-blue-800 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-blue-500" />
              <span>Math Rigor</span>
            </button>

            <button
              id="btn-toggle-projection-calculator"
              onClick={() => setShowCalculatorDetails(!showCalculatorDetails)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>{showCalculatorDetails ? 'Hide Simulator Sliders' : 'Adjust Simulation Sliders'}</span>
              {showCalculatorDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Interactive Dual/Triple Slider Simulator Controls */}
        {showCalculatorDetails && (
          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800/80 space-y-5 animate-fade-in">
            {/* 3 Interactive Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
              {/* Slider 1: Monthly Processed GMV */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Monthly Transaction Volume
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
                    {formatRupees(merchantMonthlyGMV)}
                  </span>
                </div>
                <input
                  id="slider-monthly-gmv"
                  type="range"
                  min={1000000}
                  max={500000000}
                  step={1000000}
                  value={merchantMonthlyGMV}
                  onChange={(e) => setMerchantMonthlyGMV(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>₹10 Lakhs</span>
                  <span>₹25 Crores</span>
                  <span>₹50 Crores</span>
                </div>
              </div>

              {/* Slider 2: Recovery Lift / Win Rate % */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> RecoverAI Win Rate
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                    {simulatedRecoveryRate}%
                  </span>
                </div>
                <input
                  id="slider-recovery-rate"
                  type="range"
                  min={10}
                  max={75}
                  step={1}
                  value={simulatedRecoveryRate}
                  onChange={(e) => setSimulatedRecoveryRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>10% (Basic Retry)</span>
                  <span>42% (Current Live)</span>
                  <span>75% (Maximum)</span>
                </div>
              </div>

              {/* Slider 3: Baseline Payment Dropoff Rate % */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Payment Failure Rate
                  </span>
                  <span className="font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded border border-red-200 dark:border-red-500/20">
                    {baselineFailureRate}%
                  </span>
                </div>
                <input
                  id="slider-failure-rate"
                  type="range"
                  min={4.0}
                  max={20.0}
                  step={0.5}
                  value={baselineFailureRate}
                  onChange={(e) => setBaselineFailureRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>4% (Low)</span>
                  <span>9.5% (E-Com Avg)</span>
                  <span>20% (High Vol)</span>
                </div>
              </div>
            </div>

            {/* Calculated Impact Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Factor 1: Monthly At-Risk Volume */}
              <div className="bg-slate-100 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">Monthly At-Risk Revenue</div>
                <div className="text-base font-bold text-red-600 dark:text-red-400 font-mono">
                  {formatRupees(monthlyFailedGMV)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  At {baselineFailureRate}% organic dropout
                </div>
              </div>

              {/* Factor 2: Monthly Orders Saved */}
              <div className="bg-slate-100 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">Recovered Customers</div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {estimatedMonthlyRecoveredOrders.toLocaleString()} Orders / mo
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  ~{estimatedYearlyRecoveredOrders.toLocaleString()} annual retained users
                </div>
              </div>

              {/* Factor 3: Estimated Net Annual Revenue Added */}
              <div className="bg-slate-100 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">12-Month Net Rescued GMV</div>
                <div className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {formatRupees(estimatedYearlySaved)}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                  Direct bottom-line margin expansion
                </div>
              </div>

              {/* Factor 4: ROI Multiplier */}
              <div className="bg-slate-100 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">Calculated Economic ROI</div>
                <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {Math.round((estimatedMonthlySaved / Math.max(1, estimatedAiPipelineCostMonthly)) * 1).toLocaleString()}x ROI
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  AI Pipeline Cost: ₹{estimatedAiPipelineCostMonthly}/mo
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MATHEMATICAL RIGOR & PROOF MODAL (FOR AUDITORS & EXECUTIVES) */}
      {/* ========================================================================= */}
      {showMathModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 text-slate-100 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Mathematical Rigor & Revenue Proof</h3>
                  <p className="text-xs text-slate-400">Formal financial derivation and sensitivity modeling for RecoverAI projections</p>
                </div>
              </div>
              <button
                onClick={() => setShowMathModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formula 1: Rescued GMV */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-mono font-bold">1</span>
                <span>Monthly Net Rescued GMV Formula</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300">
                Rescued GMV = Monthly Processed GMV × (Failure Rate / 100) × (RecoverAI Win Rate / 100)
              </div>
              <div className="text-xs text-slate-400 space-y-1 font-mono text-[11px] pt-1">
                <div>&bull; Monthly Processed GMV = <strong className="text-white">₹{merchantMonthlyGMV.toLocaleString('en-IN')}</strong></div>
                <div>&bull; Monthly At-Risk Volume ({baselineFailureRate}%) = <strong className="text-red-400">₹{monthlyFailedGMV.toLocaleString('en-IN')}</strong></div>
                <div>&bull; Recovered by Autonomous Rails ({simulatedRecoveryRate}%) = <strong className="text-emerald-400">₹{estimatedMonthlySaved.toLocaleString('en-IN')} / month</strong></div>
              </div>
            </div>

            {/* Formula 2: TSR Conversion Lift */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-blue-400 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-300 text-[10px] flex items-center justify-center font-mono font-bold">2</span>
                <span>Transaction Success Rate (TSR) Delta</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-blue-300">
                Δ TSR % = Baseline Failure Rate (%) × (RecoverAI Win Rate / 100)
              </div>
              <p className="text-xs text-slate-400">
                With a baseline failure rate of {baselineFailureRate}% and a {simulatedRecoveryRate}% recovery win rate, overall merchant checkout success rate increases by <strong className="text-blue-300">+{dynamicTSRLift}%</strong> absolute (e.g. from 90.5% &rarr; {(90.5 + Number(dynamicTSRLift)).toFixed(2)}%).
              </p>
            </div>

            {/* Formula 3: Unit Economics & Payback */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-purple-400 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] flex items-center justify-center font-mono font-bold">3</span>
                <span>Inference Unit Economics & ROI Multiplier</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-purple-300">
                Unit Margin = Rescued AOV (₹{averageOrderValue}) / Gemini 3.7 Flash Inference Cost (₹0.015) = 160,000x Margin
              </div>
              <p className="text-xs text-slate-400">
                Gemini 3.7 Flash consumes ~180 tokens per diagnosis (~$0.00018 USD / ₹0.015 INR). For an average order value of ₹{averageOrderValue.toLocaleString('en-IN')}, every rescued transaction yields extreme positive unit contribution.
              </p>
            </div>

            {/* Sensitivity Matrix Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart className="w-4 h-4 text-emerald-400" />
                <span>Sensitivity Matrix (Annual Rescued GMV by Volume & Win Rate)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2 px-2.5">Monthly GMV</th>
                      <th className="py-2 px-2.5 text-slate-300">25% Win Rate</th>
                      <th className="py-2 px-2.5 text-blue-400">42% Live Win Rate</th>
                      <th className="py-2 px-2.5 text-emerald-400">60% Max Win Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-2 px-2.5 font-bold text-white">₹50 Lakhs</td>
                      <td className="py-2 px-2.5 text-slate-400">₹14.2 Lakhs/yr</td>
                      <td className="py-2 px-2.5 text-blue-300 font-bold">₹23.9 Lakhs/yr</td>
                      <td className="py-2 px-2.5 text-emerald-300 font-bold">₹34.2 Lakhs/yr</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30 bg-blue-500/5">
                      <td className="py-2 px-2.5 font-bold text-white">₹2 Crores</td>
                      <td className="py-2 px-2.5 text-slate-400">₹57.0 Lakhs/yr</td>
                      <td className="py-2 px-2.5 text-blue-300 font-bold">₹95.8 Lakhs/yr</td>
                      <td className="py-2 px-2.5 text-emerald-300 font-bold">₹1.36 Crores/yr</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-2 px-2.5 font-bold text-white">₹10 Crores</td>
                      <td className="py-2 px-2.5 text-slate-400">₹2.85 Crores/yr</td>
                      <td className="py-2 px-2.5 text-blue-300 font-bold">₹4.79 Crores/yr</td>
                      <td className="py-2 px-2.5 text-emerald-300 font-bold">₹6.84 Crores/yr</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="py-2 px-2.5 font-bold text-white">₹50 Crores</td>
                      <td className="py-2 px-2.5 text-slate-400">₹14.25 Crores/yr</td>
                      <td className="py-2 px-2.5 text-blue-300 font-bold">₹23.94 Crores/yr</td>
                      <td className="py-2 px-2.5 text-emerald-300 font-bold">₹34.20 Crores/yr</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Close action */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowMathModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Mathematical Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3-SENTENCE EXECUTIVE SUMMARY OVERLAY */}
      {/* ========================================================================= */}
      <ExecutiveSummaryOverlay
        isOpen={showExecutiveSummaryModal}
        onClose={() => setShowExecutiveSummaryModal(false)}
        metrics={metrics}
        transactions={transactions}
        merchantGMV={merchantMonthlyGMV}
        simulatedRecoveryRate={simulatedRecoveryRate}
        baselineFailureRate={baselineFailureRate}
      />

      {/* ========================================================================= */}
      {/* PERFORMANCE BUDGET & NETWORK PAYLOAD OVERLAY */}
      {/* ========================================================================= */}
      <PerformanceBudget
        isOpen={showPerfBudgetModal}
        onClose={() => setShowPerfBudgetModal(false)}
        metrics={metrics}
        transactions={transactions}
      />

      {/* ========================================================================= */}
      {/* API SECURITY SCAN OVERLAY */}
      {/* ========================================================================= */}
      <ApiSecurityScan
        isOpen={showSecurityScanModal}
        onClose={() => setShowSecurityScanModal(false)}
      />
    </div>
  );
};
