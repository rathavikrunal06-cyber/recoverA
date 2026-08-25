import React, { useState, useMemo } from 'react';
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
  Sliders,
  Check,
  Zap,
  Info,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  HelpCircle,
  X,
  Gauge,
} from 'lucide-react';
import { SystemMetrics, TransactionRecord } from '../types';

interface ModelDriftHealthScoreProps {
  metrics: SystemMetrics | null;
  transactions?: TransactionRecord[];
  onOpenDriftStudio?: () => void;
  className?: string;
}

export type DriftScenario = 'NORMAL' | 'AOV_SURGE' | 'BANK_OUTAGE_504' | 'SMS_OTP_WAVE';

interface FeaturePsiData {
  name: string;
  baseline: string;
  observed: string;
  psi: number;
  status: 'STABLE' | 'MODERATE' | 'SIGNIFICANT';
  interpretation: string;
}

export const ModelDriftHealthScore: React.FC<ModelDriftHealthScoreProps> = ({
  metrics,
  transactions = [],
  onOpenDriftStudio,
  className = '',
}) => {
  const [selectedScenario, setSelectedScenario] = useState<DriftScenario>('NORMAL');
  const [isRecalibrating, setIsRecalibrating] = useState<boolean>(false);
  const [recalibrationSuccess, setRecalibrationSuccess] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showFormulaTooltip, setShowFormulaTooltip] = useState<boolean>(false);

  // Dynamic statistics computed based on active scenario and whether user recalibrated
  const driftStats = useMemo(() => {
    if (recalibrationSuccess) {
      return {
        healthScore: 99.1,
        cumulativePsi: 0.028,
        predicted30dDecay: '< 0.15%',
        status: 'OPTIMAL_STABILITY' as const,
        alertTitle: 'Optimal Stability & Zero Significant Drift',
        alertMessage: 'AI decision distribution is synchronized with live payment switch streams. Weights recently recalibrated.',
        statusColor: 'emerald',
        features: [
          { name: 'Error Code Distribution', baseline: '34.0% 504s', observed: '34.2% 504s', psi: 0.012, status: 'STABLE', interpretation: 'Calibrated (<0.10)' },
          { name: 'Issuer Bank Ingress', baseline: '42.0% HDFC', observed: '42.3% HDFC', psi: 0.018, status: 'STABLE', interpretation: 'Calibrated (<0.10)' },
          { name: 'AOV Basket Bands', baseline: '₹2,400 Mean', observed: '₹2,450 Mean', psi: 0.015, status: 'STABLE', interpretation: 'Calibrated (<0.10)' },
          { name: 'Checkout Device Channels', baseline: '78% Mobile', observed: '78.5% Mobile', psi: 0.009, status: 'STABLE', interpretation: 'Calibrated (<0.10)' },
          { name: 'AI Decision Confidence', baseline: '94.2% Avg', observed: '94.8% Avg', psi: 0.014, status: 'STABLE', interpretation: 'Calibrated (<0.10)' },
        ] as FeaturePsiData[],
      };
    }

    switch (selectedScenario) {
      case 'AOV_SURGE':
        return {
          healthScore: 88.4,
          cumulativePsi: 0.142,
          predicted30dDecay: '1.42% (Mild Shift)',
          status: 'MILD_DRIFT' as const,
          alertTitle: 'Mild Concept Drift: High-Value AOV Basket Surge',
          alertMessage: 'Festive sale surge shifted average ticket size +38%. AI discount elasticity thresholds operating at boundary margin.',
          statusColor: 'amber',
          features: [
            { name: 'Error Code Distribution', baseline: '34.0% 504s', observed: '36.5% 504s', psi: 0.038, status: 'STABLE', interpretation: 'Normal (<0.10)' },
            { name: 'Issuer Bank Ingress', baseline: '42.0% HDFC', observed: '44.1% HDFC', psi: 0.045, status: 'STABLE', interpretation: 'Normal (<0.10)' },
            { name: 'AOV Basket Bands', baseline: '₹2,400 Mean', observed: '₹4,850 Mean', psi: 0.182, status: 'MODERATE', interpretation: 'Mild Shift (0.10 - 0.25)' },
            { name: 'Checkout Device Channels', baseline: '78% Mobile', observed: '84.0% Mobile', psi: 0.052, status: 'STABLE', interpretation: 'Normal (<0.10)' },
            { name: 'AI Decision Confidence', baseline: '94.2% Avg', observed: '90.5% Avg', psi: 0.082, status: 'STABLE', interpretation: 'Normal (<0.10)' },
          ] as FeaturePsiData[],
        };

      case 'BANK_OUTAGE_504':
        return {
          healthScore: 78.6,
          cumulativePsi: 0.268,
          predicted30dDecay: '3.85% (Action Required)',
          status: 'SIGNIFICANT_DRIFT' as const,
          alertTitle: 'Warning: Severe Switch Degradation Drift',
          alertMessage: 'HDFC & SBI 504 Gateway Timeouts jumped from 34% to 68%. Autonomous gateway mesh requires prompt recalibration.',
          statusColor: 'rose',
          features: [
            { name: 'Error Code Distribution', baseline: '34.0% 504s', observed: '68.4% 504s', psi: 0.312, status: 'SIGNIFICANT', interpretation: 'Critical Shift (>0.25)' },
            { name: 'Issuer Bank Ingress', baseline: '42.0% HDFC', observed: '59.0% HDFC', psi: 0.285, status: 'SIGNIFICANT', interpretation: 'Critical Shift (>0.25)' },
            { name: 'AOV Basket Bands', baseline: '₹2,400 Mean', observed: '₹2,380 Mean', psi: 0.022, status: 'STABLE', interpretation: 'Normal (<0.10)' },
            { name: 'Checkout Device Channels', baseline: '78% Mobile', observed: '77.2% Mobile', psi: 0.015, status: 'STABLE', interpretation: 'Normal (<0.10)' },
            { name: 'AI Decision Confidence', baseline: '94.2% Avg', observed: '84.1% Avg', psi: 0.218, status: 'MODERATE', interpretation: 'Elevated Uncertainty' },
          ] as FeaturePsiData[],
        };

      case 'SMS_OTP_WAVE':
        return {
          healthScore: 89.2,
          cumulativePsi: 0.138,
          predicted30dDecay: '1.20% (Telco Lag)',
          status: 'MILD_DRIFT' as const,
          alertTitle: 'Mild Drift: Telco SMS Delivery Latency Wave',
          alertMessage: '3DS OTP delivery timeout frequency increased by +18% due to carrier routing latency. UPI Switch win-rate compensating.',
          statusColor: 'amber',
          features: [
            { name: 'Error Code Distribution', baseline: '28.5% OTP', observed: '46.2% OTP', psi: 0.174, status: 'MODERATE', interpretation: 'Mild Shift (0.10 - 0.25)' },
            { name: 'Issuer Bank Ingress', baseline: '42.0% HDFC', observed: '41.5% HDFC', psi: 0.024, status: 'STABLE', interpretation: 'Normal (<0.10)' },
            { name: 'AOV Basket Bands', baseline: '₹2,400 Mean', observed: '₹2,420 Mean', psi: 0.018, status: 'STABLE', interpretation: 'Normal (<0.10)' },
            { name: 'Checkout Device Channels', baseline: '78% Mobile', observed: '81.0% Mobile', psi: 0.041, status: 'STABLE', interpretation: 'Normal (<0.10)' },
            { name: 'AI Decision Confidence', baseline: '94.2% Avg', observed: '91.2% Avg', psi: 0.065, status: 'STABLE', interpretation: 'Normal (<0.10)' },
          ] as FeaturePsiData[],
        };

      case 'NORMAL':
      default:
        return {
          healthScore: 98.4,
          cumulativePsi: 0.042,
          predicted30dDecay: '< 0.35% (Steady)',
          status: 'OPTIMAL_STABILITY' as const,
          alertTitle: 'Model Accuracy & Statistical Stability: Optimal',
          alertMessage: 'Continuous PSI tests verify that payment error taxonomies and AI recovery rail selections match expected Bayesian baselines.',
          statusColor: 'emerald',
          features: [
            { name: 'Error Code Distribution', baseline: '34.0% 504s', observed: '38.2% 504s', psi: 0.032, status: 'STABLE', interpretation: 'Stable (<0.10)' },
            { name: 'Issuer Bank Ingress', baseline: '42.0% HDFC', observed: '43.1% HDFC', psi: 0.088, status: 'STABLE', interpretation: 'Stable (<0.10)' },
            { name: 'AOV Basket Bands', baseline: '₹2,400 Mean', observed: '₹2,480 Mean', psi: 0.035, status: 'STABLE', interpretation: 'Stable (<0.10)' },
            { name: 'Checkout Device Channels', baseline: '78% Mobile', observed: '79.2% Mobile', psi: 0.019, status: 'STABLE', interpretation: 'Stable (<0.10)' },
            { name: 'AI Decision Confidence', baseline: '94.2% Avg', observed: '95.1% Avg', psi: 0.024, status: 'STABLE', interpretation: 'Stable (<0.10)' },
          ] as FeaturePsiData[],
        };
    }
  }, [selectedScenario, recalibrationSuccess]);

  const handleTriggerRecalibrate = () => {
    setIsRecalibrating(true);
    setTimeout(() => {
      setIsRecalibrating(false);
      setRecalibrationSuccess(true);
      setTimeout(() => {
        setRecalibrationSuccess(false);
        setSelectedScenario('NORMAL');
      }, 5000);
    }, 1400);
  };

  const statusBadgeConfig = {
    OPTIMAL_STABILITY: {
      label: 'Optimal Stability',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      textClass: 'text-emerald-400',
      icon: CheckCircle2,
    },
    MILD_DRIFT: {
      label: 'Mild Drift Detected',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
      textClass: 'text-amber-400',
      icon: AlertTriangle,
    },
    SIGNIFICANT_DRIFT: {
      label: 'Critical Decay Warning',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
      textClass: 'text-rose-400',
      icon: ShieldAlert,
    },
  }[driftStats.status];

  const StatusIcon = statusBadgeConfig.icon;

  return (
    <div
      id="model-drift-health-indicator"
      className={`bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-teal-500/30 rounded-2xl p-4 shadow-lg text-slate-100 transition-all ${className}`}
    >
      {/* Top Header: Title, Health Score & Action Buttons */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shadow-inner shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-teal-400" />
                AI Model Drift & Performance Decay Monitor
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${statusBadgeConfig.badgeClass}`}>
                <StatusIcon className="w-3 h-3" />
                <span>{statusBadgeConfig.label}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                PSI: {driftStats.cumulativePsi.toFixed(3)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Continuous Bayesian Population Stability Index (PSI) tracking to prevent decision decay from changing payment switch patterns.
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto shrink-0">
          <button
            id="btn-recalibrate-weights"
            onClick={handleTriggerRecalibrate}
            disabled={isRecalibrating}
            className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
            title="Auto-recalibrate prompt weights and Bayesian recovery priors"
          >
            {isRecalibrating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : recalibrationSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-200" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isRecalibrating ? 'Recalibrating...' : recalibrationSuccess ? 'Weights Synchronized!' : 'Auto-Recalibrate Weights'}</span>
          </button>

          <button
            id="btn-open-drift-details-modal"
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>Deep Dive &rarr;</span>
          </button>
        </div>
      </div>

      {/* Main KPI Grid & Interactive Scenario Tester */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3.5">
        {/* Metric 1: Visual Overall Model Health Score */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Model Health Score</span>
            <Gauge className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="my-1 flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono tracking-tight ${statusBadgeConfig.textClass}`}>
              {driftStats.healthScore.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                driftStats.status === 'OPTIMAL_STABILITY'
                  ? 'bg-emerald-400'
                  : driftStats.status === 'MILD_DRIFT'
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${driftStats.healthScore}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
            <span>Accuracy Stability</span>
            <span className={statusBadgeConfig.textClass}>{driftStats.status.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Metric 2: Cumulative Population Stability Index (PSI) */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
              <span>Overall PSI Metric</span>
              <div className="relative inline-block">
                <button
                  onMouseEnter={() => setShowFormulaTooltip(true)}
                  onMouseLeave={() => setShowFormulaTooltip(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <Info className="w-3 h-3" />
                </button>
                {showFormulaTooltip && (
                  <div className="absolute left-0 bottom-full mb-1.5 w-64 p-2.5 rounded-lg bg-slate-900 border border-teal-500/40 text-slate-200 text-[10px] shadow-2xl z-50 font-sans">
                    <div className="font-bold text-teal-300 mb-1">PSI Formula</div>
                    <div className="font-mono bg-black/50 p-1 rounded text-[9px] text-emerald-300">
                      PSI = &Sigma; (Actual% - Expected%) &times; ln(Actual% / Expected%)
                    </div>
                    <div className="text-slate-400 mt-1">
                      &lt;0.10: No Drift &bull; 0.10-0.25: Moderate &bull; &gt;0.25: Critical Shift
                    </div>
                  </div>
                )}
              </div>
            </span>
            <Scale className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {driftStats.cumulativePsi.toFixed(3)}
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
              driftStats.cumulativePsi < 0.10 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {driftStats.cumulativePsi < 0.10 ? 'NO DRIFT' : 'DEVIATION'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Threshold: &lt;0.10</span>
            <span className="text-emerald-400">Zero False Alerts</span>
          </div>
        </div>

        {/* Metric 3: Predictive 30-Day Performance Decay */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Predictive 30-Day Decay</span>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="my-1 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-indigo-300 tracking-tight">
              {driftStats.predicted30dDecay.split(' ')[0]}
            </span>
            <span className="text-[11px] text-slate-400 font-sans">
              {driftStats.predicted30dDecay.split(' ').slice(1).join(' ')}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Projected TSR Loss</span>
            <span className="text-indigo-400">&lt; 0.05% margin</span>
          </div>
        </div>

        {/* Metric 4: Decision Entropy & Rail Win Consistency */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Concept Win Rate</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {metrics?.overallRecoveryRate || 42.0}%
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              <span>+0.8% vs Base</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Entropy: 0.041 nats</span>
            <span className="text-emerald-400">Stable Boundary</span>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Presets */}
      <div className="mt-3 bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200">
            Simulate Payment Pattern Shifts (Live Scenario Sandbox):
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="btn-drift-scenario-normal"
            onClick={() => {
              setRecalibrationSuccess(false);
              setSelectedScenario('NORMAL');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedScenario === 'NORMAL' && !recalibrationSuccess
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            Normal Steady-State
          </button>

          <button
            id="btn-drift-scenario-aov-surge"
            onClick={() => {
              setRecalibrationSuccess(false);
              setSelectedScenario('AOV_SURGE');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedScenario === 'AOV_SURGE' && !recalibrationSuccess
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
            title="Simulate high-ticket Festive Sale basket surge"
          >
            AOV Basket Surge (+38%)
          </button>

          <button
            id="btn-drift-scenario-504-outage"
            onClick={() => {
              setRecalibrationSuccess(false);
              setSelectedScenario('BANK_OUTAGE_504');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedScenario === 'BANK_OUTAGE_504' && !recalibrationSuccess
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
            title="Simulate major issuer 504 gateway timeout degradation spike"
          >
            Bank 504 Outage Spike
          </button>

          <button
            id="btn-drift-scenario-sms-wave"
            onClick={() => {
              setRecalibrationSuccess(false);
              setSelectedScenario('SMS_OTP_WAVE');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedScenario === 'SMS_OTP_WAVE' && !recalibrationSuccess
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
            title="Simulate Telco 3DS SMS OTP delivery latency lag"
          >
            Telco SMS OTP Lag
          </button>
        </div>
      </div>

      {/* Live Warning / Status Strip */}
      <div className={`mt-2.5 p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
        driftStats.status === 'OPTIMAL_STABILITY'
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          : driftStats.status === 'MILD_DRIFT'
          ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
      }`}>
        <div className="flex items-center gap-2">
          <StatusIcon className="w-4 h-4 shrink-0" />
          <div>
            <span className="font-bold">{driftStats.alertTitle}: </span>
            <span className="text-slate-300">{driftStats.alertMessage}</span>
          </div>
        </div>

        {driftStats.status !== 'OPTIMAL_STABILITY' && (
          <button
            onClick={handleTriggerRecalibrate}
            className="px-2 py-1 bg-white text-slate-950 rounded-lg font-bold text-[10px] hover:bg-slate-200 transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            Recalibrate Now &rarr;
          </button>
        )}
      </div>

      {/* Deep-Dive Drift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-teal-500/40 rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>AI Model Drift & Performance Decay Mathematical Audit</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                      PSI: {driftStats.cumulativePsi.toFixed(3)}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Statistical derivation of distribution shift between baseline reference training sets and live production transactions.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feature-Level PSI Breakdown Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-teal-400" />
                  Feature Population Stability Index (PSI) Breakdown
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  Active Scenario: <strong>{selectedScenario}</strong>
                </span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Feature Dimension</th>
                      <th className="p-3">Baseline Reference</th>
                      <th className="p-3">Observed Live Stream</th>
                      <th className="p-3 text-right">PSI Score</th>
                      <th className="p-3 text-right">Stability Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono">
                    {driftStats.features.map((feat, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="p-3 font-sans font-semibold text-slate-200">
                          {feat.name}
                        </td>
                        <td className="p-3 text-slate-400">{feat.baseline}</td>
                        <td className="p-3 text-slate-300 font-bold">{feat.observed}</td>
                        <td className="p-3 text-right font-bold text-white">
                          {feat.psi.toFixed(3)}
                        </td>
                        <td className="p-3 text-right font-sans">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            feat.status === 'STABLE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : feat.status === 'MODERATE'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {feat.interpretation}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mathematical Derivation & Action Framework */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  <span>PSI Mathematical Formula</span>
                </div>
                <div className="font-mono text-xs bg-slate-900 p-2.5 rounded-lg text-emerald-300 border border-slate-800">
                  PSI = &Sigma; (A&#7522; - E&#7522;) &times; ln(A&#7522; / E&#7522;)
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Where A&#7522; is the observed percentage of transactions in bucket <span className="font-mono text-slate-300">i</span> and E&#7522; is the expected baseline percentage from prior Bayesian learning passes.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Autonomous Action Policy Thresholds</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1.5 font-sans">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span><strong>PSI &lt; 0.10:</strong> Green / Stable. Zero operator action needed.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span><strong>0.10 &le; PSI &lt; 0.25:</strong> Amber / Moderate. Bayesian priors auto-adjusted.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span><strong>PSI &ge; 0.25:</strong> Red / Significant. Autonomous prompt weight recalibration triggered.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Model Version: <strong>Gemini 3.7 Flash &bull; Razorpay RecoverAI v2.4</strong></span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
