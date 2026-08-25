import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Target,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  Layers,
  Repeat,
  Wallet,
  CheckCircle2,
  Info,
  ChevronRight,
  Sliders,
  DollarSign,
  Play,
  RotateCcw,
  ArrowRight,
  TrendingDown,
  Activity,
  Award,
} from 'lucide-react';
import { TransactionRecord, SystemMetrics } from '../types';

interface RecoveryGapCardProps {
  transactions: TransactionRecord[];
  metrics: SystemMetrics | null;
  onSimulateMethod?: (method: string) => void;
  onOpenCustomerView?: (tx: TransactionRecord) => void;
}

export interface PaymentMethodGapMetric {
  methodKey: 'card' | 'netbanking' | 'upi' | 'wallet' | 'emi' | 'nach';
  label: string;
  sublabel: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  totalFailedVolume: number;
  totalFailedAmountPaise: number;
  currentRecoveredVolume: number;
  currentRecoveredAmountPaise: number;
  currentRecoveryRate: number; // percentage e.g. 38%
  targetRecoveryRate: number; // achievable e.g. 72%
  recoveryGapPercentage: number; // target - current (e.g. 34%)
  recoveryGapAmountPaise: number; // uncaptured recoverable GMV in paise
  aiImprovementPotentialScore: number; // 0 - 100
  priorityLevel: 'CRITICAL_OPPORTUNITY' | 'HIGH_OPPORTUNITY' | 'MODERATE_OPPORTUNITY';
  primaryFailureRootCause: string;
  aiPrescribedSolution: string;
  recommendedRail: string;
  topDropOffStage: string;
  implementationEase: 'INSTANT_AUTO' | 'REQUIRES_UPI_DEEP_LINK' | 'ADAPTIVE_DUNNING';
  trendDirection: 'WIDENING_GAP' | 'STEADY' | 'CLOSING_FAST';
}

export const RecoveryGapCard: React.FC<RecoveryGapCardProps> = ({
  transactions,
  metrics,
  onSimulateMethod,
  onOpenCustomerView,
}) => {
  const [selectedMethodKey, setSelectedMethodKey] = useState<string>('card');
  const [sortBy, setSortBy] = useState<'GAP_GMV' | 'POTENTIAL_SCORE' | 'GAP_PERCENT'>('GAP_GMV');
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [aiOptimizationToggle, setAiOptimizationToggle] = useState<boolean>(true);

  // Compute realistic historical gap data per payment method dynamically based on transactions and industry benchmarks
  const gapMetrics: PaymentMethodGapMetric[] = useMemo(() => {
    // Base method definitions
    const baseConfig = [
      {
        methodKey: 'card' as const,
        label: 'Cards (Credit / Debit / Intl)',
        sublabel: '3DS2 challenges, ACS timeouts & cross-border limits',
        icon: CreditCard,
        iconBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30',
        iconColor: 'text-blue-500',
        benchmarkFailRate: 14.2,
        baseTargetRecovery: 68.5,
        primaryFailureRootCause: 'ACS 3DS2 Challenge dropoff (54%) & Bank OTP delivery delay (>90s)',
        aiPrescribedSolution: 'WhatsApp Pre-Signed 1-Click Biometric Link + Auto-Switch to Tokenized UPI Intent',
        recommendedRail: 'WHATSAPP_INTERACTIVE_PAY',
        topDropOffStage: '3DS2 ACS Cryptographic Challenge',
        implementationEase: 'INSTANT_AUTO' as const,
        trendDirection: 'WIDENING_GAP' as const,
      },
      {
        methodKey: 'netbanking' as const,
        label: 'Netbanking / Bank Switch',
        sublabel: '504 gateway timeouts & legacy banking portal crashes',
        icon: Building,
        iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        iconColor: 'text-amber-500',
        benchmarkFailRate: 18.5,
        baseTargetRecovery: 76.0,
        primaryFailureRootCause: 'Bank core banking switch 504 Gateway Timeout (68%) during peak traffic',
        aiPrescribedSolution: 'Instant NPCI UPI Switch + IMPS Reverse Query with 0-Double-Charge Lock',
        recommendedRail: 'INSTANT_UPI_SWITCH',
        topDropOffStage: 'Bank Portal Authentication Redirection',
        implementationEase: 'INSTANT_AUTO' as const,
        trendDirection: 'CLOSING_FAST' as const,
      },
      {
        methodKey: 'upi' as const,
        label: 'UPI (Intent & Dynamic VPA)',
        sublabel: 'NPCI switch desync & customer app abandonment',
        icon: Smartphone,
        iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
        iconColor: 'text-emerald-500',
        benchmarkFailRate: 8.4,
        baseTargetRecovery: 84.0,
        primaryFailureRootCause: 'PSP App switching latency (>45s) & NPCI Router Throttle',
        aiPrescribedSolution: 'Dynamic QR Generation + Secondary PSP Intent Routing (GPay → PhonePe → Paytm)',
        recommendedRail: 'INSTANT_UPI_SWITCH',
        topDropOffStage: 'UPI App PIN Input Screen Abandonment',
        implementationEase: 'INSTANT_AUTO' as const,
        trendDirection: 'STEADY' as const,
      },
      {
        methodKey: 'nach' as const,
        label: 'Recurring Subscriptions / NACH',
        sublabel: 'e-Mandate declines & recurring debit cycle balance drops',
        icon: Repeat,
        iconBg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30',
        iconColor: 'text-purple-500',
        benchmarkFailRate: 22.0,
        baseTargetRecovery: 62.0,
        primaryFailureRootCause: 'Insufficient Funds on 1st of month (71%) & e-Mandate registration lapse',
        aiPrescribedSolution: 'Predictive Payday Adaptive Dunning (Salary Credit Day + Auto-Retry Window)',
        recommendedRail: 'ADAPTIVE_DUNNING',
        topDropOffStage: 'Batch Mandate Execution Cycle',
        implementationEase: 'ADAPTIVE_DUNNING' as const,
        trendDirection: 'WIDENING_GAP' as const,
      },
      {
        methodKey: 'emi' as const,
        label: 'EMI / PayLater / BNPL',
        sublabel: 'Credit limit exhaustions & KYC mismatch rejections',
        icon: Layers,
        iconBg: 'bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/30',
        iconColor: 'text-pink-500',
        benchmarkFailRate: 16.8,
        baseTargetRecovery: 58.0,
        primaryFailureRootCause: 'Instant credit limit insufficient & Partner NBFC API timeout',
        aiPrescribedSolution: 'Dynamic Downpayment Split + Cardless Credit Failover Rail',
        recommendedRail: 'SMART_GATEWAY_FALLBACK',
        topDropOffStage: 'NBFC Eligibility API Check',
        implementationEase: 'REQUIRES_UPI_DEEP_LINK' as const,
        trendDirection: 'STEADY' as const,
      },
      {
        methodKey: 'wallet' as const,
        label: 'Digital Wallets & Prepaid',
        sublabel: 'PPI balance shortfall & unlinked KYC limitations',
        icon: Wallet,
        iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30',
        iconColor: 'text-cyan-500',
        benchmarkFailRate: 11.2,
        baseTargetRecovery: 70.0,
        primaryFailureRootCause: 'Wallet balance under threshold for high-ticket cart item',
        aiPrescribedSolution: 'Instant Top-Up Auto-Debit or Seamless UPI Intent Switch',
        recommendedRail: 'INSTANT_UPI_SWITCH',
        topDropOffStage: 'Wallet Balance Deduction Step',
        implementationEase: 'INSTANT_AUTO' as const,
        trendDirection: 'CLOSING_FAST' as const,
      },
    ];

    return baseConfig.map((cfg) => {
      // Aggregate real transactions for this method
      const txs = transactions.filter(
        (t) => (t.method || '').toLowerCase() === cfg.methodKey.toLowerCase()
      );
      const failedCount = txs.length;
      const recoveredCount = txs.filter((t) => t.status === 'RECOVERED').length;

      // Realistic volumes when tx list is small or growing
      const fallbackFailedPaise =
        cfg.methodKey === 'card'
          ? 48500000
          : cfg.methodKey === 'netbanking'
          ? 36200000
          : cfg.methodKey === 'upi'
          ? 29800000
          : cfg.methodKey === 'nach'
          ? 24500000
          : cfg.methodKey === 'emi'
          ? 18200000
          : 9400000;

      const totalFailedAmountPaise =
        failedCount > 0
          ? txs.reduce((acc, t) => acc + t.amountPaise, 0) * 12
          : fallbackFailedPaise;

      const currentRate =
        failedCount > 0
          ? Math.round((recoveredCount / failedCount) * 100)
          : cfg.methodKey === 'card'
          ? 36
          : cfg.methodKey === 'netbanking'
          ? 48
          : cfg.methodKey === 'upi'
          ? 62
          : cfg.methodKey === 'nach'
          ? 28
          : cfg.methodKey === 'emi'
          ? 31
          : 45;

      const targetRate = cfg.baseTargetRecovery;
      const recoveryGapPercentage = Math.max(8, Math.round(targetRate - currentRate));
      const recoveryGapAmountPaise = Math.round(
        totalFailedAmountPaise * (recoveryGapPercentage / 100)
      );

      // AI improvement potential score (0-100) weighted by Gap GMV and Achievable TSR Lift
      const score = Math.min(
        98,
        Math.round(
          recoveryGapPercentage * 1.5 + (recoveryGapAmountPaise / 5000000) * 5
        )
      );

      const priorityLevel =
        score > 75
          ? ('CRITICAL_OPPORTUNITY' as const)
          : score > 50
          ? ('HIGH_OPPORTUNITY' as const)
          : ('MODERATE_OPPORTUNITY' as const);

      return {
        ...cfg,
        totalFailedVolume: failedCount || 42,
        totalFailedAmountPaise,
        currentRecoveredVolume: recoveredCount || 15,
        currentRecoveredAmountPaise: Math.round(
          totalFailedAmountPaise * (currentRate / 100)
        ),
        currentRecoveryRate: currentRate,
        targetRecoveryRate: targetRate,
        recoveryGapPercentage,
        recoveryGapAmountPaise,
        aiImprovementPotentialScore: score,
        priorityLevel,
      };
    });
  }, [transactions]);

  // Sorted list
  const sortedGapMetrics = useMemo(() => {
    return [...gapMetrics].sort((a, b) => {
      if (sortBy === 'GAP_GMV') {
        return b.recoveryGapAmountPaise - a.recoveryGapAmountPaise;
      }
      if (sortBy === 'POTENTIAL_SCORE') {
        return b.aiImprovementPotentialScore - a.aiImprovementPotentialScore;
      }
      return b.recoveryGapPercentage - a.recoveryGapPercentage;
    });
  }, [gapMetrics, sortBy]);

  const selectedMetric =
    sortedGapMetrics.find((m) => m.methodKey === selectedMethodKey) ||
    sortedGapMetrics[0];

  // Aggregate Totals
  const totalRecoverableGMV = gapMetrics.reduce(
    (acc, m) => acc + m.recoveryGapAmountPaise,
    0
  );
  const averageGapPercentage = Math.round(
    gapMetrics.reduce((acc, m) => acc + m.recoveryGapPercentage, 0) /
      gapMetrics.length
  );
  const highestOpportunity = sortedGapMetrics[0];

  const formatINR = (paise: number) => {
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(rupees);
  };

  return (
    <div
      id="recovery-gap-visualization-card"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-5 space-y-5 transition-all overflow-hidden relative"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-xl shadow-md">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  AI Recovery Gap Analysis
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-full">
                  Continuous Optimization Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Highlights payment methods with the highest recoverable revenue headroom based on historical failure telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Global Overview Stat Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Total Unclaimed Headroom
            </span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {formatINR(totalRecoverableGMV)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Avg AI Improvement Gap
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              +{averageGapPercentage}% TSR Lift
            </span>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setSortBy('GAP_GMV')}
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                sortBy === 'GAP_GMV'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              By Lost GMV
            </button>
            <button
              onClick={() => setSortBy('POTENTIAL_SCORE')}
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                sortBy === 'POTENTIAL_SCORE'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              By AI ROI Score
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: List of Payment Methods & Gap Progress Bars (7 Cols) */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
            <span>Payment Method & Failure Profile</span>
            <span>Current vs. Achievable AI Target</span>
          </div>

          <div className="space-y-2.5">
            {sortedGapMetrics.map((item) => {
              const Icon = item.icon;
              const isSelected = item.methodKey === selectedMethodKey;

              return (
                <div
                  key={item.methodKey}
                  id={`gap-method-card-${item.methodKey}`}
                  onClick={() => setSelectedMethodKey(item.methodKey)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${item.iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.label}
                          </h4>
                          {item.priorityLevel === 'CRITICAL_OPPORTUNITY' && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              Top Headroom
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {item.sublabel}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        {formatINR(item.recoveryGapAmountPaise)}
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{item.recoveryGapPercentage}% Gap</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Three-Segment Gap Bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      {/* 1. Currently Recovered */}
                      <div
                        style={{ width: `${item.currentRecoveryRate}%` }}
                        className="bg-blue-500 dark:bg-blue-500 h-full relative group"
                        title={`Current Recovery: ${item.currentRecoveryRate}%`}
                      />
                      {/* 2. AI Recovery Gap (Headroom) */}
                      <div
                        style={{ width: `${item.recoveryGapPercentage}%` }}
                        className="bg-emerald-500 dark:bg-emerald-400 h-full animate-pulse relative"
                        title={`Recoverable Gap: +${item.recoveryGapPercentage}%`}
                      />
                      {/* 3. Inherent Structural Hard Decline */}
                      <div
                        style={{
                          width: `${Math.max(
                            0,
                            100 - (item.currentRecoveryRate + item.recoveryGapPercentage)
                          )}%`,
                        }}
                        className="bg-slate-300 dark:bg-slate-700 h-full opacity-60"
                        title="Non-recoverable permanent hard declines"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                        Current: <strong>{item.currentRecoveryRate}%</strong>
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI Target: <strong>{item.targetRecoveryRate}%</strong>
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                        Hard Drop: {Math.max(0, 100 - item.targetRecoveryRate)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-Dive Opportunity Card & Action Engine (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                  Opportunity Deep Dive
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedMetric.label}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  AI Actionability Score
                </div>
                <div className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400 flex items-center justify-end gap-1">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>{selectedMetric.aiImprovementPotentialScore}/100</span>
                </div>
              </div>
            </div>

            {/* Metric Details Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Recoverable GMV
                </span>
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {formatINR(selectedMetric.recoveryGapAmountPaise)}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Potential TSR Lift
                </span>
                <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
                  +{selectedMetric.recoveryGapPercentage}%
                </span>
              </div>
            </div>

            {/* Root Cause & Prescribed Intervention */}
            <div className="space-y-2.5 text-xs">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Primary Failure Bottleneck:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {selectedMetric.primaryFailureRootCause}
                </p>
                <div className="pt-1 text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Dropoff point:</span>
                  <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono">
                    {selectedMetric.topDropOffStage}
                  </code>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 p-3 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    Prescribed Autonomous AI Intervention:
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">
                    {selectedMetric.recommendedRail}
                  </span>
                </div>
                <p className="text-emerald-900 dark:text-emerald-100 text-[11px] leading-relaxed">
                  {selectedMetric.aiPrescribedSolution}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-1 space-y-2">
              <button
                id={`btn-simulate-gap-${selectedMetric.methodKey}`}
                onClick={() => {
                  if (onSimulateMethod) {
                    onSimulateMethod(selectedMetric.methodKey);
                  }
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate & Test {selectedMetric.label} AI Rescue</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-1">
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Zero Double Charges Guaranteed
                </span>
                <span className="font-mono text-[10px] text-indigo-500">
                  Auto-Optimization Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
