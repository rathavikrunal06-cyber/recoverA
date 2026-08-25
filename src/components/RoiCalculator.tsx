import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  PieChart,
  BarChart2,
  Percent,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Briefcase,
  Layers,
} from 'lucide-react';
import { SystemMetrics } from '../types';

interface RoiCalculatorProps {
  metrics?: SystemMetrics | null;
  onNavigateToSimulator?: () => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ metrics, onNavigateToSimulator }) => {
  // Merchant Parameter State
  const [monthlyGmvLakhs, setMonthlyGmvLakhs] = useState<number>(200); // ₹2 Crore default
  const [aovRupees, setAovRupees] = useState<number>(2500); // ₹2,500 AOV
  const [failureRatePercent, setFailureRatePercent] = useState<number>(14); // 14% failure rate
  const [targetRecoveryPercent, setTargetRecoveryPercent] = useState<number>(85); // 85% recovered
  const [ltvMultiplier, setLtvMultiplier] = useState<number>(2.4); // 2.4x LTV multiplier
  const [recoverAiMonthlyCost, setRecoverAiMonthlyCost] = useState<number>(24999); // ₹24,999/mo plan
  const [showExecutiveSummary, setShowExecutiveSummary] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Calculations
  const monthlyGmvRupees = monthlyGmvLakhs * 100000;
  const estimatedOrdersCount = Math.round(monthlyGmvRupees / aovRupees);
  const failedOrdersCount = Math.round(estimatedOrdersCount * (failureRatePercent / 100));
  const failedGmvRupees = failedOrdersCount * aovRupees;

  const recoveredOrdersCount = Math.round(failedOrdersCount * (targetRecoveryPercent / 100));
  const directRecoveredMonthlyGmv = recoveredOrdersCount * aovRupees;
  const directRecoveredAnnualGmv = directRecoveredMonthlyGmv * 12;

  // LTV Retained Value (prevented customer churn)
  const totalLtvValueGeneratedMonthly = directRecoveredMonthlyGmv * ltvMultiplier;
  const totalLtvValueGeneratedAnnual = directRecoveredAnnualGmv * ltvMultiplier;

  // TSR calculations
  const baselineTsr = (100 - failureRatePercent);
  const newTsr = baselineTsr + (failureRatePercent * (targetRecoveryPercent / 100));
  const tsrLift = newTsr - baselineTsr;

  // ROI & Payback
  const netMonthlyProfit = directRecoveredMonthlyGmv - recoverAiMonthlyCost;
  const roiMultiplier = (directRecoveredMonthlyGmv / recoverAiMonthlyCost).toFixed(1);
  const paybackPeriodDays = Math.max(0.1, (recoverAiMonthlyCost / (directRecoveredMonthlyGmv / 30))).toFixed(1);

  // Formatted summary bullets for quick clipboard copying
  const handleCopySummary = () => {
    const formattedText = `RecoverAI Executive Summary (Simulation for ₹${monthlyGmvLakhs >= 100 ? `${(monthlyGmvLakhs / 100).toFixed(2)} Cr` : `${monthlyGmvLakhs}L`} GMV):
• Revenue Salvage: Recovers ₹${(directRecoveredAnnualGmv / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Lakhs in annualized GMV (+₹${(directRecoveredMonthlyGmv / 100000).toFixed(2)}L/mo direct cashflow) from failed checkouts, delivering an audited ${roiMultiplier}x ROI on operating software costs.
• Conversion Trajectory: Elevates Transaction Success Rate by +${tsrLift.toFixed(2)}% (shifting baseline from ${baselineTsr.toFixed(0)}% to ${newTsr.toFixed(1)}%), permanently retaining ${recoveredOrdersCount.toLocaleString('en-IN')} active buyers every month from payment abandonment.
• Lifetime Enterprise Value: Safeguards ₹${(totalLtvValueGeneratedAnnual / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Lakhs in cumulative annual repeat-purchase LTV while achieving full investment capital payback in just ${paybackPeriodDays} days.`;

    navigator.clipboard.writeText(formattedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Merchant Presets
  const applyPreset = (tier: 'd2c' | 'saas' | 'retail' | 'enterprise') => {
    if (tier === 'd2c') {
      setMonthlyGmvLakhs(75);
      setAovRupees(1800);
      setFailureRatePercent(16);
      setTargetRecoveryPercent(88);
      setLtvMultiplier(2.2);
    } else if (tier === 'saas') {
      setMonthlyGmvLakhs(120);
      setAovRupees(4500);
      setFailureRatePercent(12);
      setTargetRecoveryPercent(82);
      setLtvMultiplier(4.5);
    } else if (tier === 'retail') {
      setMonthlyGmvLakhs(350);
      setAovRupees(2200);
      setFailureRatePercent(15);
      setTargetRecoveryPercent(90);
      setLtvMultiplier(2.5);
    } else {
      setMonthlyGmvLakhs(1500);
      setAovRupees(8500);
      setFailureRatePercent(11);
      setTargetRecoveryPercent(92);
      setLtvMultiplier(3.8);
    }
  };

  return (
    <div id="roi-calculator-view" className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Merchant ROI & Revenue Recovery Calculator</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                Dynamic Sensitivity Model
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simulate exact bottom-line revenue lift, payback timeline, and churn prevention based on your checkout traffic volume.
            </p>
          </div>
        </div>

        {/* Top Controls: Preset Selector & Executive Summary Toggle */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            id="btn-toggle-roi-executive-summary"
            onClick={() => setShowExecutiveSummary((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-xl border transition-all font-semibold cursor-pointer ${
              showExecutiveSummary
                ? 'bg-blue-600/10 border-blue-500/40 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white'
            }`}
            title="Toggle Executive Summary Overlay"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
            <span>Executive Summary</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          </button>

          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Presets:</span>
            <button
              onClick={() => applyPreset('d2c')}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all font-medium cursor-pointer"
            >
              D2C
            </button>
            <button
              onClick={() => applyPreset('saas')}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all font-medium cursor-pointer"
            >
              SaaS
            </button>
            <button
              onClick={() => applyPreset('retail')}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all font-medium cursor-pointer"
            >
              Retail
            </button>
            <button
              onClick={() => applyPreset('enterprise')}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all font-medium cursor-pointer"
            >
              Enterprise
            </button>
          </div>
        </div>
      </div>

      {/* Executive Summary Overlay: 3 Most Significant Recovery Outcomes */}
      {showExecutiveSummary && (
        <div
          id="roi-executive-summary-overlay"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 border border-blue-500/40 shadow-xl shadow-blue-950/30 text-white p-5 sm:p-6 transition-all animate-fade-in"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row of Overlay */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-inner">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    Executive Summary: Top 3 Recovery Outcomes
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Live Simulation Analysis
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dynamically modeled from ₹{monthlyGmvLakhs >= 100 ? `${(monthlyGmvLakhs / 100).toFixed(2)} Cr` : `${monthlyGmvLakhs}L`} monthly GMV &bull; {failureRatePercent}% dropoff &bull; {targetRecoveryPercent}% recovery win rate
                </p>
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                id="btn-copy-roi-executive-summary"
                onClick={handleCopySummary}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer hover:border-slate-500"
                title="Copy 3-Bullet Summary to Clipboard"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Summary</span>
                  </>
                )}
              </button>
              <button
                id="btn-close-roi-executive-summary"
                onClick={() => setShowExecutiveSummary(false)}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
                title="Dismiss overlay (toggle back on above)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3 One-Sentence Bullet Points Highlight Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4 relative z-10">
            {/* Outcome 1: Revenue Salvage & ROI Multiple */}
            <div
              id="roi-outcome-bullet-1"
              className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-emerald-500/30 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  1. Annualized Cashflow
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {roiMultiplier}x ROI
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Recovers <strong className="text-emerald-400 font-mono font-semibold">₹{(directRecoveredAnnualGmv / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Lakhs</strong> in annualized GMV (<span className="text-emerald-300 font-mono">+₹{(directRecoveredMonthlyGmv / 100000).toFixed(2)}L/mo</span> direct cashflow) from failed checkouts, delivering an audited <strong className="text-emerald-400 font-mono">{roiMultiplier}x ROI</strong> on operating software costs.
              </p>
            </div>

            {/* Outcome 2: TSR Conversion Lift & Customer Retention */}
            <div
              id="roi-outcome-bullet-2"
              className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-blue-500/30 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  2. Conversion & Retention
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  +{tsrLift.toFixed(2)}% TSR
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Elevates Transaction Success Rate by <strong className="text-blue-400 font-mono font-semibold">+{tsrLift.toFixed(2)}%</strong> (shifting baseline from {baselineTsr.toFixed(0)}% to {newTsr.toFixed(1)}%), permanently retaining <strong className="text-blue-300 font-mono font-semibold">{recoveredOrdersCount.toLocaleString('en-IN')} active buyers</strong> every month from payment abandonment.
              </p>
            </div>

            {/* Outcome 3: Customer LTV & Payback Velocity */}
            <div
              id="roi-outcome-bullet-3"
              className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-purple-500/30 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  3. LTV Protection & Payback
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {paybackPeriodDays}d Payback
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Safeguards <strong className="text-purple-400 font-mono font-semibold">₹{(totalLtvValueGeneratedAnnual / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Lakhs</strong> in cumulative annual repeat-purchase LTV while achieving full investment capital payback in just <strong className="text-purple-300 font-mono font-semibold">{paybackPeriodDays} days</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Sliders & Live Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Sliders */}
        <div className="lg:col-span-7 space-y-5 bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Merchant Parameters & Volume Inputs
            </h3>
            <span className="text-[11px] text-slate-500">Live Interactive Sliders</span>
          </div>

          {/* Slider 1: Monthly GMV */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Monthly Processed GMV</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                ₹{monthlyGmvLakhs >= 100 ? `${(monthlyGmvLakhs / 100).toFixed(2)} Cr` : `${monthlyGmvLakhs} Lakhs`}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={2000}
              step={10}
              value={monthlyGmvLakhs}
              onChange={(e) => setMonthlyGmvLakhs(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>₹10 Lakhs/mo</span>
              <span>₹5 Crores/mo</span>
              <span>₹20 Crores/mo</span>
            </div>
          </div>

          {/* Slider 2: Average Order Value (AOV) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Average Order Value (AOV)</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                ₹{aovRupees.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={250}
              max={25000}
              step={250}
              value={aovRupees}
              onChange={(e) => setAovRupees(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>₹250</span>
              <span>₹10,000</span>
              <span>₹25,000</span>
            </div>
          </div>

          {/* Slider 3: Current Baseline Failure Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Current Payment Failure Rate</span>
              <span className="font-mono font-bold text-red-500 text-sm">{failureRatePercent}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={failureRatePercent}
              onChange={(e) => setFailureRatePercent(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>5% (Low drop)</span>
              <span>15% (Industry avg)</span>
              <span>30% (High drop)</span>
            </div>
          </div>

          {/* Slider 4: RecoverAI Win Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Target RecoverAI Win Rate</span>
              <span className="font-mono font-bold text-emerald-500 text-sm">{targetRecoveryPercent}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={95}
              step={1}
              value={targetRecoveryPercent}
              onChange={(e) => setTargetRecoveryPercent(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>50% (Conservative)</span>
              <span>85% (Standard)</span>
              <span>95% (Peak UPI Rails)</span>
            </div>
          </div>

          {/* Slider 5: Customer LTV Multiplier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Customer LTV Multiplier (Repeat Purchase)</span>
              <span className="font-mono font-bold text-purple-500 text-sm">{ltvMultiplier}x</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={5.0}
              step={0.1}
              value={ltvMultiplier}
              onChange={(e) => setLtvMultiplier(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>1.0x (Single order)</span>
              <span>2.5x (D2C standard)</span>
              <span>5.0x (High SaaS/Sub)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Returns Scoreboard */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Big Impact Card */}
          <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-6 text-white space-y-4 shadow-lg shadow-emerald-500/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Annual Bottom-Line GMV Lift
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                {roiMultiplier}x ROI
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tracking-tight">
                ₹{(directRecoveredAnnualGmv / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Lakhs
              </div>
              <p className="text-xs text-slate-300 mt-1">
                +₹{(directRecoveredMonthlyGmv / 100000).toFixed(2)} Lakhs direct cashflow captured every month.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">TSR Conversion Lift</span>
                <span className="text-base font-bold font-mono text-blue-400">+{tsrLift.toFixed(2)}%</span>
                <span className="text-[10px] text-slate-400 block">({baselineTsr.toFixed(0)}% &rarr; {newTsr.toFixed(1)}%)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Payback Period</span>
                <span className="text-base font-bold font-mono text-amber-400">{paybackPeriodDays} Days</span>
                <span className="text-[10px] text-slate-400 block">Fully self-funding</span>
              </div>
            </div>
          </div>

          {/* Customer Retention & LTV Card */}
          <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" />
              Customer Retention & Anti-Churn Value
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Saved Customers / Month:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {recoveredOrdersCount.toLocaleString('en-IN')} buyers
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-purple-700 dark:text-purple-300 font-semibold">Lifetime Retained Value (LTV):</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                  ₹{(totalLtvValueGeneratedAnnual / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Lakhs/yr
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Preventing customer checkout dropoffs eliminates expensive re-acquisition ad spend on Google/Meta ads.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
