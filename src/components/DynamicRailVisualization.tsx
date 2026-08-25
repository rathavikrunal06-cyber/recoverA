import React, { useState } from 'react';
import {
  GitBranch,
  Zap,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  Smartphone,
  CreditCard,
  Building,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { TransactionRecord } from '../types';

interface DynamicRailVisualizationProps {
  transactions?: TransactionRecord[];
}

interface Scenario {
  id: string;
  name: string;
  bank: string;
  errorCode: string;
  errorReason: string;
  aov: number;
  customerRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  method: string;
  targetRail: 'UPI_INTENT' | 'WHATSAPP_COLLECT' | 'BIOMETRIC_TOKEN' | 'SALARY_DUNNING' | 'SAFETY_CIRCUIT';
  decisionRationale: string;
  confidenceScore: number;
  expectedTSR: number;
  turnaroundLatencyMs: number;
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'scen_01',
    name: 'HDFC Netbanking Gateway 504 Timeout',
    bank: 'HDFC',
    errorCode: 'GATEWAY_TIMEOUT',
    errorReason: 'bank_switch_504_unreachable',
    aov: 4200,
    customerRisk: 'LOW',
    method: 'netbanking',
    targetRail: 'UPI_INTENT',
    decisionRationale: 'HDFC core banking gateway experiencing transient p99 latency spike (2,100ms). Bypassing core switch directly to NPCI UPI Intent rail with instant deep-link app switch.',
    confidenceScore: 98.4,
    expectedTSR: 94.2,
    turnaroundLatencyMs: 42,
  },
  {
    id: 'scen_02',
    name: 'SBI 3DS SMS OTP Delivery Drop (High AOV)',
    bank: 'SBI',
    errorCode: 'OTP_DELIVERY_TIMEOUT',
    errorReason: 'telecom_3ds_otp_undelivered_60s',
    aov: 8500,
    customerRisk: 'LOW',
    method: 'card',
    targetRail: 'WHATSAPP_COLLECT',
    decisionRationale: 'High AOV cart (>₹5,000) dropped at telecom SMS OTP stage. Customer is active on WhatsApp. Triggered verified Razorpay Smart Collect card with 1-click UPI intent rescue.',
    confidenceScore: 96.1,
    expectedTSR: 88.6,
    turnaroundLatencyMs: 58,
  },
  {
    id: 'scen_03',
    name: 'ICICI Recurring Mandate Insufficient Funds (NSF)',
    bank: 'ICICI',
    errorCode: 'INSUFFICIENT_FUNDS',
    errorReason: 'mandate_debit_declined_nsf',
    aov: 1499,
    customerRisk: 'LOW',
    method: 'mandate',
    targetRail: 'SALARY_DUNNING',
    decisionRationale: 'Month-end salary dry-run decline (27th of month). Immediate retries cause friction and fees. Scheduled smart auto-retry on 1st of month (salary credit cycle window).',
    confidenceScore: 95.8,
    expectedTSR: 79.4,
    turnaroundLatencyMs: 36,
  },
  {
    id: 'scen_04',
    name: 'Axis Bank Expired Network Card Token',
    bank: 'Axis',
    errorCode: 'TOKEN_EXPIRED',
    errorReason: 'coft_cryptogram_validation_failed',
    aov: 2999,
    customerRisk: 'LOW',
    method: 'card',
    targetRail: 'BIOMETRIC_TOKEN',
    decisionRationale: 'RBI COFT network cryptogram expired. Triggered seamless WebAuthn device passkey renewal and re-tokenized in-flight without asking for full 16-digit card number.',
    confidenceScore: 97.2,
    expectedTSR: 91.8,
    turnaroundLatencyMs: 49,
  },
  {
    id: 'scen_05',
    name: 'High Risk / Velocity Spike Anomaly',
    bank: 'Multiple',
    errorCode: 'VELOCITY_LIMIT_EXCEEDED',
    errorReason: 'suspicious_high_frequency_ip_burst',
    aov: 45000,
    customerRisk: 'HIGH',
    method: 'card',
    targetRail: 'SAFETY_CIRCUIT',
    decisionRationale: 'Risk engine flagged rapid IP velocity burst with mismatched geo-location. Autonomous recovery suppressed to protect merchant from chargeback disputes.',
    confidenceScore: 99.8,
    expectedTSR: 0,
    turnaroundLatencyMs: 18,
  },
];

export const DynamicRailVisualization: React.FC<DynamicRailVisualizationProps> = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scen_01');
  const [customBank, setCustomBank] = useState<string>('HDFC');
  const [customErrorCode, setCustomErrorCode] = useState<string>('GATEWAY_TIMEOUT');
  const [customAov, setCustomAov] = useState<number>(3500);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const activeScenario = PRESET_SCENARIOS.find((s) => s.id === selectedScenarioId) || PRESET_SCENARIOS[0];

  // Dynamic rail calculation in custom mode
  const resolvedTargetRail = isCustomMode
    ? customErrorCode === 'INSUFFICIENT_FUNDS'
      ? 'SALARY_DUNNING'
      : customErrorCode === 'TOKEN_EXPIRED'
      ? 'BIOMETRIC_TOKEN'
      : customAov > 5000 && customErrorCode === 'OTP_DELIVERY_TIMEOUT'
      ? 'WHATSAPP_COLLECT'
      : customErrorCode === 'VELOCITY_LIMIT_EXCEEDED'
      ? 'SAFETY_CIRCUIT'
      : 'UPI_INTENT'
    : activeScenario.targetRail;

  const resolvedRationale = isCustomMode
    ? `Gemini 3.7 Flash diagnosed ${customBank} with ${customErrorCode} at ₹${customAov} AOV. Dynamic rail selected based on optimal bank switch availability and conversion probability.`
    : activeScenario.decisionRationale;

  const resolvedConfidence = isCustomMode ? 96.5 : activeScenario.confidenceScore;
  const resolvedTSR = isCustomMode ? 91.2 : activeScenario.expectedTSR;
  const resolvedLatency = isCustomMode ? 45 : activeScenario.turnaroundLatencyMs;

  const rails = [
    {
      key: 'UPI_INTENT',
      name: 'NPCI UPI Intent Fast-Switch',
      icon: Zap,
      color: 'emerald',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/30',
      description: 'Instant zero-credential fallback to GPay/PhonePe/Paytm intent deep-link.',
      winRate: '94.2% Success',
      sla: '38ms SLA',
      bestFor: 'Netbanking / Card 504 Gateway Timeouts',
    },
    {
      key: 'WHATSAPP_COLLECT',
      name: 'WhatsApp 1-Click Smart Collect',
      icon: MessageSquare,
      color: 'purple',
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-600 dark:text-purple-400',
      activeBorder: 'border-purple-500 ring-2 ring-purple-500/30',
      description: 'Interactive verified WhatsApp payment card with 1-click UPI checkout.',
      winRate: '88.6% Success',
      sla: '54ms SLA',
      bestFor: 'High AOV Cart Drops (>₹5,000) & 3DS OTP Failures',
    },
    {
      key: 'BIOMETRIC_TOKEN',
      name: 'Biometric Passkey & Token Re-Vault',
      icon: ShieldCheck,
      color: 'blue',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-600 dark:text-blue-400',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/30',
      description: 'RBI COFT dynamic cryptogram refresh with biometric FaceID/Touch unlock.',
      winRate: '91.8% Success',
      sla: '46ms SLA',
      bestFor: 'Expired Tokens & 3DS Cryptogram Desync',
    },
    {
      key: 'SALARY_DUNNING',
      name: 'Salary-Aligned Smart Dunning',
      icon: Calendar,
      color: 'amber',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-600 dark:text-amber-400',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/30',
      description: 'Auto-schedules retries on 1st/5th of month to capture fresh payroll liquidity.',
      winRate: '79.4% Success',
      sla: '32ms SLA',
      bestFor: 'Subscription Recurring Mandates with NSF',
    },
    {
      key: 'SAFETY_CIRCUIT',
      name: 'Safety Circuit & Fraud Suppression',
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-500/10 dark:bg-red-500/20',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-600 dark:text-red-400',
      activeBorder: 'border-red-500 ring-2 ring-red-500/30',
      description: 'Suppresses retry to prevent double charges, bot spams, and chargeback disputes.',
      winRate: '100% Guard',
      sla: '18ms SLA',
      bestFor: 'High-risk velocity bursts & Hard Issuer Declines',
    },
  ];

  return (
    <div id="dynamic-rail-visualization" className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">Dynamic Autonomous Rail Logic Visualization</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Gemini 3.7 Flash Decision Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing how RecoverAI synthesizes bank telemetry, error taxonomy, and customer context to route to the optimal recovery rail.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setIsCustomMode(false)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              !isCustomMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Presets
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              isCustomMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Signal Simulator
          </button>
        </div>
      </div>

      {/* Scenario Presets Selector */}
      {!isCustomMode ? (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Select Failure Scenario to Trace Decision Path:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {PRESET_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                onClick={() => setSelectedScenarioId(scen.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedScenarioId === scen.id
                    ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 text-white shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                  <span className="font-bold text-blue-400">{scen.bank}</span>
                  <span className="text-slate-500">₹{scen.aov.toLocaleString()}</span>
                </div>
                <div className="text-xs font-semibold text-white line-clamp-1">{scen.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                  <span>{scen.errorCode}</span>
                  <span className="text-emerald-400 font-bold">{scen.expectedTSR > 0 ? `${scen.expectedTSR}%` : 'Guard'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Custom Signal Configurator */
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-400" />
              Configure Custom Ingress Signals
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Real-time Path Evaluation Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Issuer Bank Switch:</label>
              <select
                value={customBank}
                onChange={(e) => setCustomBank(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
              >
                <option value="HDFC">HDFC Bank (Switch p99: 2,100ms)</option>
                <option value="SBI">SBI Bank (Switch p99: 1,850ms)</option>
                <option value="ICICI">ICICI Bank (Switch p99: 450ms)</option>
                <option value="Axis">Axis Bank (Switch p99: 620ms)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Error Taxonomy:</label>
              <select
                value={customErrorCode}
                onChange={(e) => setCustomErrorCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
              >
                <option value="GATEWAY_TIMEOUT">GATEWAY_TIMEOUT (Bank 504)</option>
                <option value="OTP_DELIVERY_TIMEOUT">OTP_DELIVERY_TIMEOUT (3DS Drop)</option>
                <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS (NSF Mandate)</option>
                <option value="TOKEN_EXPIRED">TOKEN_EXPIRED (COFT Cryptogram)</option>
                <option value="VELOCITY_LIMIT_EXCEEDED">VELOCITY_LIMIT_EXCEEDED (Fraud Check)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Order Value (AOV):</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={500}
                  max={25000}
                  step={500}
                  value={customAov}
                  onChange={(e) => setCustomAov(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="font-mono font-bold text-white shrink-0">₹{customAov.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3-STAGE INTERACTIVE DECISION FLOWCHART */}
      {/* ========================================================================= */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* STAGE 1: INGRESS SIGNAL COLLECTOR (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-mono font-bold">1</span>
              <span>Ingress Failure Signals</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-800">
                <span>Bank Switch:</span>
                <span className="text-white font-bold">{isCustomMode ? customBank : activeScenario.bank}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-800">
                <span>Error Code:</span>
                <span className="text-red-400 font-bold">{isCustomMode ? customErrorCode : activeScenario.errorCode}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-800">
                <span>Transaction AOV:</span>
                <span className="text-emerald-400 font-bold">₹{(isCustomMode ? customAov : activeScenario.aov).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Customer Risk Tier:</span>
                <span className="text-blue-400 font-bold">{activeScenario.customerRisk}</span>
              </div>
            </div>
          </div>

          {/* CONNECTOR ARROW 1 */}
          <div className="hidden lg:flex lg:col-span-1 justify-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-slate-500 mb-1">0.8ms</span>
              <ArrowRight className="w-6 h-6 text-blue-500 animate-pulse" />
            </div>
          </div>

          {/* STAGE 2: GEMINI 3.7 FLASH DIAGNOSTIC ENGINE (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] flex items-center justify-center font-mono font-bold">2</span>
              <span>Gemini 3.7 Flash Diagnostic</span>
            </div>

            <div className="bg-slate-900 border border-purple-500/40 rounded-xl p-4 space-y-3 shadow-lg shadow-purple-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Synthesized Rationale</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {resolvedConfidence}% Match
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {resolvedRationale}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                <div>
                  <span>Inference Latency:</span>
                  <span className="text-emerald-400 font-bold block">{resolvedLatency}ms</span>
                </div>
                <div>
                  <span>Projected TSR:</span>
                  <span className="text-blue-400 font-bold block">{resolvedTSR > 0 ? `+${resolvedTSR}%` : 'Safety Block'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CONNECTOR ARROW 2 */}
          <div className="hidden lg:flex lg:col-span-1 justify-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-slate-500 mb-1">Dispatch</span>
              <ArrowRight className="w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* STAGE 3: RESOLVED TARGET RAIL (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-mono font-bold">3</span>
              <span>Activated Recovery Rail</span>
            </div>

            {rails
              .filter((r) => r.key === resolvedTargetRail)
              .map((r) => {
                const IconComponent = r.icon;
                return (
                  <div
                    key={r.key}
                    className={`bg-slate-900 border-2 ${r.activeBorder} rounded-xl p-4 space-y-2.5 shadow-xl transition-all animate-fade-in`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${r.bgColor} ${r.textColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{r.name}</div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">{r.winRate}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-snug">{r.description}</p>

                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span>{r.sla}</span>
                      <span className="text-blue-400 font-bold">Autonomous Dispatch &rarr;</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Complete Rail Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>All 5 Autonomous Recovery Rails & Decision Boundaries</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rails.map((r) => {
            const IconComp = r.icon;
            const isSelected = r.key === resolvedTargetRail;
            return (
              <div
                key={r.key}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-950 border-emerald-500 ring-1 ring-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${r.bgColor} ${r.textColor}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{r.name}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-2.5 leading-relaxed">{r.description}</p>
                <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="flex justify-between">
                    <span>Target Trigger:</span>
                    <span className="text-slate-300 font-semibold">{r.bestFor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Benchmark:</span>
                    <span className="text-emerald-400 font-bold">{r.winRate} ({r.sla})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
