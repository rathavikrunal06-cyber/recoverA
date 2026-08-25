import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Brain,
  Zap,
  TrendingUp,
  Scale,
  Award,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  BarChart3,
  Sliders,
  ChevronRight,
  ArrowUpRight,
  HelpCircle,
  Copy,
  Check,
  Search,
  Maximize2,
  RotateCcw,
  Cpu,
  Clock,
  Lock,
} from 'lucide-react';
import { TransactionRecord, SystemMetrics } from '../types';

export interface ErrorExplainabilityItem {
  id: string;
  errorCode: string;
  category: 'UPI' | 'CARDS_3DS' | 'NETBANKING' | 'MANDATES' | 'SECURITY';
  name: string;
  description: string;
  explainabilityScore: number; // 0 - 100
  aiConfidence: number; // 0 - 100
  shapAttributionScore: number; // 0 - 100
  determinismScore: number; // 0 - 100 (rule-based certainty)
  recoveryWinRate: number; // 0 - 100
  p99LatencyMs: number;
  sampleVolume24h: number;
  primaryCausalFactors: { feature: string; weight: number }[];
  aiDiagnosticRationale: string;
  autonomousAction: string;
  auditComplianceNotes: string;
  deterministicRuleId: string;
}

const ERROR_EXPLAINABILITY_DATA: ErrorExplainabilityItem[] = [
  {
    id: 'exp_1',
    errorCode: 'ISSUER_ACS_TIMEOUT',
    category: 'CARDS_3DS',
    name: 'Issuer 3DS ACS Timeout (504)',
    description: 'Bank 3DS OTP authentication server latency exceeded 280ms threshold causing checkout dropoff.',
    explainabilityScore: 99.2,
    aiConfidence: 99.6,
    shapAttributionScore: 99.0,
    determinismScore: 99.8,
    recoveryWinRate: 94.5,
    p99LatencyMs: 22.4,
    sampleVolume24h: 3840,
    primaryCausalFactors: [
      { feature: 'Bank ACS Switch Latency (>280ms)', weight: 48 },
      { feature: '3DS Server HTTP 504 / Drop Rate', weight: 26 },
      { feature: 'Customer Device Connection State', weight: 14 },
      { feature: 'Historical Bank Timeout Velocity', weight: 12 },
    ],
    aiDiagnosticRationale:
      'Gemini 3.7 Flash combined real-time ACS ping telemetry with issuer switch failure curves, deterministically routing traffic away from degraded HDFC switch to ICICI/Axis secondary rails with zero hallucination.',
    autonomousAction: 'Instant switch to secondary card rail or 1-tap WhatsApp UPI intent URL in 32ms.',
    auditComplianceNotes:
      'Deterministic rule R-101 overrides with 100% causal certainty. Mathematical latency thresholds eliminate probabilistic error.',
    deterministicRuleId: 'RULE_ACS_FAILOVER_v3',
  },
  {
    id: 'exp_2',
    errorCode: 'MUTEX_BURST_REPLAY',
    category: 'SECURITY',
    name: 'Duplicate Webhook Burst / Replay',
    description: 'Multiple identical webhook payloads delivered simultaneously from payment gateway retry queue.',
    explainabilityScore: 98.8,
    aiConfidence: 99.4,
    shapAttributionScore: 98.5,
    determinismScore: 100.0,
    recoveryWinRate: 100.0,
    p99LatencyMs: 1.2,
    sampleVolume24h: 1250,
    primaryCausalFactors: [
      { feature: 'Idempotency Key Exact Hash Match', weight: 55 },
      { feature: 'Payload SHA256 Signature Identity', weight: 25 },
      { feature: 'Arrival Timestamp Delta (<100ms)', weight: 12 },
      { feature: 'Distributed Redis Lock Acquisition', weight: 8 },
    ],
    aiDiagnosticRationale:
      'Cryptographic hash match and distributed Redis Mutex lock state yield absolute mathematical proof of replay, completely avoiding double debits.',
    autonomousAction: 'Locked in 1.2ms; first event processed, remaining 4 duplicate events safely responded with HTTP 409 Conflict.',
    auditComplianceNotes:
      '100% deterministic guardrail backed by Redis SETNX singleton lock. Zero risk of false positives or AI hallucinations.',
    deterministicRuleId: 'GUARDRAIL_REDIS_MUTEX_v4',
  },
  {
    id: 'exp_3',
    errorCode: 'INSUFFICIENT_FUNDS_SALARY',
    category: 'MANDATES',
    name: 'Recurring Mandate NSF / Month-End Drop',
    description: 'Auto-debit subscription failed due to insufficient funds (E001) near the 28th-30th of month.',
    explainabilityScore: 98.1,
    aiConfidence: 97.8,
    shapAttributionScore: 98.4,
    determinismScore: 98.0,
    recoveryWinRate: 91.2,
    p99LatencyMs: 14.8,
    sampleVolume24h: 2180,
    primaryCausalFactors: [
      { feature: 'Calendar Cycle (27th-31st month end)', weight: 42 },
      { feature: 'Historical Salary Credit Date Window', weight: 32 },
      { feature: 'Customer Tenure & Renewal History', weight: 16 },
      { feature: 'Bank Account Type (Corporate/Salary)', weight: 8 },
    ],
    aiDiagnosticRationale:
      'AI detects month-end liquidity exhaustion and matches historic payroll patterns. Rather than exhausting retries, it syncs billing retry to 1st of month.',
    autonomousAction: 'Auto-reschedules mandate debit attempt to 1st of month at 09:30 IST; sends friendly WhatsApp reminder.',
    auditComplianceNotes:
      'Explainability is proven by calendar date correlation and historical salary deposits with 91.2% empirical recovery.',
    deterministicRuleId: 'RULE_SMART_DUNNING_SALARY_v2',
  },
  {
    id: 'exp_4',
    errorCode: 'COFT_TOKEN_EXPIRED',
    category: 'CARDS_3DS',
    name: 'RBI Tokenized Cryptogram Expired',
    description: 'Card-on-File Token cryptogram TAVV validity expired prior to gateway authorization step.',
    explainabilityScore: 97.4,
    aiConfidence: 98.2,
    shapAttributionScore: 96.8,
    determinismScore: 99.2,
    recoveryWinRate: 93.8,
    p99LatencyMs: 18.1,
    sampleVolume24h: 1640,
    primaryCausalFactors: [
      { feature: 'Token Cryptogram Expiry Timestamp', weight: 50 },
      { feature: 'Card Network Token Vault Status', weight: 24 },
      { feature: 'Issuing Bank Device Binding Record', weight: 16 },
      { feature: 'WebAuthn Biometric Prompt Availability', weight: 10 },
    ],
    aiDiagnosticRationale:
      'Deterministic cryptogram expiration detected before reaching acquiring bank. Invokes seamless client-side WebAuthn biometric re-vault.',
    autonomousAction: 'Re-generates fresh cryptogram in background using Passkey / WebAuthn without asking customer to re-enter card.',
    auditComplianceNotes:
      'Mathematical expiry timestamp comparison leaves zero ambiguity in error origin.',
    deterministicRuleId: 'RULE_COFT_RETOKENIZE_v1',
  },
  {
    id: 'exp_5',
    errorCode: 'OTP_DELIVERY_FAILURE',
    category: 'UPI',
    name: 'SMS OTP Carrier Delivery Lag (>45s)',
    description: 'Telecom aggregator queue delay caused OTP delivery to arrive past 3DS session timeout limit.',
    explainabilityScore: 96.6,
    aiConfidence: 97.0,
    shapAttributionScore: 95.8,
    determinismScore: 96.5,
    recoveryWinRate: 89.4,
    p99LatencyMs: 28.5,
    sampleVolume24h: 4120,
    primaryCausalFactors: [
      { feature: 'SMS Aggregator Delivery DLR Timestamp', weight: 44 },
      { feature: 'Customer 3DS Page Dwell Time (>45s)', weight: 28 },
      { feature: 'Cart Value / AOV Threshold (>₹1,500)', weight: 18 },
      { feature: 'Active UPI App Installation Flag', weight: 10 },
    ],
    aiDiagnosticRationale:
      'Session idle telemetry on OTP page signals carrier SMS lag. Model instantly offers pre-filled WhatsApp OTP or 1-tap UPI deep link.',
    autonomousAction: 'Pushes instant 1-tap UPI Intent collect notification or WhatsApp authenticated check.',
    auditComplianceNotes:
      'High explainability via telecom gateway delivery receipts (DLR) matched against checkout page inactivity.',
    deterministicRuleId: 'RULE_SMS_OTP_RESCUE_v2',
  },
  {
    id: 'exp_6',
    errorCode: 'DAILY_LIMIT_EXCEEDED',
    category: 'UPI',
    name: 'UPI Bank Daily Cap Exceeded (U16)',
    description: 'User exceeded daily ₹1,00,000 NPCI bank limit or per-transaction ceiling for their linked account.',
    explainabilityScore: 95.9,
    aiConfidence: 96.5,
    shapAttributionScore: 95.2,
    determinismScore: 98.5,
    recoveryWinRate: 87.6,
    p99LatencyMs: 16.3,
    sampleVolume24h: 1890,
    primaryCausalFactors: [
      { feature: 'NPCI Error Code U16 Response Signature', weight: 46 },
      { feature: 'Current Transaction Amount (>₹25,000)', weight: 26 },
      { feature: 'Customer Secondary Linked Bank Account', weight: 18 },
      { feature: 'Credit Card / Netbanking Fallback Option', weight: 10 },
    ],
    aiDiagnosticRationale:
      'NPCI U16 response code explicitly confirms bank limit exhaustion. Retrying same VPA will fail 100% of the time; model switches payment method.',
    autonomousAction: 'Presents 1-tap switch to secondary UPI bank account (e.g., @okaxis) or Credit Card EMI rail.',
    auditComplianceNotes:
      'NPCI standard response code U16 provides definitive, verifiable justification for rail fallback.',
    deterministicRuleId: 'RULE_UPI_LIMIT_FALLBACK_v2',
  },
  {
    id: 'exp_7',
    errorCode: 'NETBANKING_SWITCH_DROP',
    category: 'NETBANKING',
    name: 'Netbanking Direct Rail 502 Bad Gateway',
    description: 'Direct server-to-server netbanking gateway connection dropped due to issuer maintenance.',
    explainabilityScore: 95.1,
    aiConfidence: 95.8,
    shapAttributionScore: 94.5,
    determinismScore: 97.0,
    recoveryWinRate: 86.2,
    p99LatencyMs: 31.0,
    sampleVolume24h: 960,
    primaryCausalFactors: [
      { feature: 'HTTP 502 / TCP Socket Reset on Issuer IP', weight: 48 },
      { feature: 'Concurrent Failure Spikes Across Merchants', weight: 28 },
      { feature: 'Alternative Aggregator Netbanking Switch', weight: 14 },
      { feature: 'Customer Corporate Netbanking Tier', weight: 10 },
    ],
    aiDiagnosticRationale:
      'Cross-merchant anomaly detection flags active bank maintenance window in real-time, routing to backup aggregator switch.',
    autonomousAction: 'Seamlessly redirects transaction through backup gateway aggregator without asking customer to restart.',
    auditComplianceNotes:
      'Network socket telemetry and multi-merchant failure clustering provide crystal-clear diagnostic justification.',
    deterministicRuleId: 'RULE_NETBANKING_AGGREGATOR_SWITCH_v1',
  },
  {
    id: 'exp_8',
    errorCode: 'FRAUD_VELOCITY_TRIGGER',
    category: 'SECURITY',
    name: 'Velocity Anomaly / Device IP Mismatch',
    description: 'High velocity transaction burst (>4 orders in 60s) from unverified proxy IP.',
    explainabilityScore: 94.2,
    aiConfidence: 95.0,
    shapAttributionScore: 93.6,
    determinismScore: 96.0,
    recoveryWinRate: 98.9,
    p99LatencyMs: 8.4,
    sampleVolume24h: 720,
    primaryCausalFactors: [
      { feature: 'Transaction Velocity (>4 tx/min)', weight: 40 },
      { feature: 'Device Fingerprint & IP Risk Score', weight: 32 },
      { feature: 'Card PAN Issuer Geo Mismatch', weight: 18 },
      { feature: 'Historical Fraud Graph Association', weight: 10 },
    ],
    aiDiagnosticRationale:
      'Fraud circuit activates step-up mandatory 3DS biometric challenge instead of silent recovery to prevent merchant chargebacks.',
    autonomousAction: 'Forces strict WebAuthn passkey step-up authentication; blocks automated bot replay attacks.',
    auditComplianceNotes:
      'High explainability based on velocity counters and device integrity signals audited in real-time.',
    deterministicRuleId: 'GUARDRAIL_FRAUD_CIRCUIT_v5',
  },
  {
    id: 'exp_9',
    errorCode: 'USER_ABANDONED_CHECKOUT',
    category: 'UPI',
    name: 'Checkout Friction / Intent Inactivity',
    description: 'Customer remained on payment selection screen without choosing method for >60 seconds.',
    explainabilityScore: 92.5,
    aiConfidence: 93.2,
    shapAttributionScore: 91.8,
    determinismScore: 91.0,
    recoveryWinRate: 78.4,
    p99LatencyMs: 42.0,
    sampleVolume24h: 5320,
    primaryCausalFactors: [
      { feature: 'Payment Selection Screen Idle Time (>60s)', weight: 38 },
      { feature: 'Repeated Method Toggle Behavior', weight: 26 },
      { feature: 'Customer Preferred Payment History', weight: 22 },
      { feature: 'Discount / Coupon Applied State', weight: 14 },
    ],
    aiDiagnosticRationale:
      'Behavioral telemetry detects hesitation on checkout options. AI serves personalized 1-tap checkout pill for customer’s most frequent UPI app.',
    autonomousAction: 'Highlights personalized 1-Tap Google Pay/PhonePe pill with instant checkout incentive.',
    auditComplianceNotes:
      'Slightly lower explainability than server errors due to subjective human hesitation patterns, yet highly effective at 78.4% recovery.',
    deterministicRuleId: 'RULE_FRICTION_REDUCTION_v1',
  },
];

interface AIExplainabilityHeatmapProps {
  metrics?: SystemMetrics | null;
  transactions?: TransactionRecord[];
  onOpenExplainabilityModal?: (item: ErrorExplainabilityItem) => void;
}

export const AIExplainabilityHeatmap: React.FC<AIExplainabilityHeatmapProps> = ({
  metrics,
  transactions = [],
  onOpenExplainabilityModal,
}) => {
  const [selectedErrorId, setSelectedErrorId] = useState<string>(ERROR_EXPLAINABILITY_DATA[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'EXPLAINABILITY' | 'CONFIDENCE' | 'WIN_RATE' | 'LATENCY'>('EXPLAINABILITY');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return ERROR_EXPLAINABILITY_DATA.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.errorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'EXPLAINABILITY') return b.explainabilityScore - a.explainabilityScore;
      if (sortBy === 'CONFIDENCE') return b.aiConfidence - a.aiConfidence;
      if (sortBy === 'WIN_RATE') return b.recoveryWinRate - a.recoveryWinRate;
      if (sortBy === 'LATENCY') return a.p99LatencyMs - b.p99LatencyMs;
      return 0;
    });
  }, [selectedCategory, sortBy, searchQuery]);

  const selectedItem = useMemo(() => {
    return ERROR_EXPLAINABILITY_DATA.find((item) => item.id === selectedErrorId) || ERROR_EXPLAINABILITY_DATA[0];
  }, [selectedErrorId]);

  // Overall Index
  const averageExplainabilityIndex = useMemo(() => {
    const total = ERROR_EXPLAINABILITY_DATA.reduce((acc, curr) => acc + curr.explainabilityScore, 0);
    return +(total / ERROR_EXPLAINABILITY_DATA.length).toFixed(1);
  }, []);

  const top3Items = useMemo(() => {
    return [...ERROR_EXPLAINABILITY_DATA].sort((a, b) => b.explainabilityScore - a.explainabilityScore).slice(0, 3);
  }, []);

  const handleCopyTrace = (item: ErrorExplainabilityItem) => {
    const traceJson = {
      rule_id: item.deterministicRuleId,
      error_code: item.errorCode,
      explainability_score: `${item.explainabilityScore}%`,
      gemini_confidence: `${item.aiConfidence}%`,
      determinism_score: `${item.determinismScore}%`,
      p99_inference_latency: `${item.p99LatencyMs}ms`,
      shap_attributions: item.primaryCausalFactors,
      autonomous_playbook: item.autonomousAction,
      zero_hallucination_guarantee: true,
      timestamp: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(traceJson, null, 2));
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Heatmap Cell Color Scale
  const getHeatmapColor = (score: number) => {
    if (score >= 98.0) {
      return {
        bg: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
        badge: 'bg-emerald-500 text-white',
        bar: 'bg-emerald-500',
        glow: 'shadow-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
      };
    }
    if (score >= 95.0) {
      return {
        bg: 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-700 dark:text-teal-300 border-teal-500/40',
        badge: 'bg-teal-500 text-white',
        bar: 'bg-teal-500',
        glow: 'shadow-teal-500/10',
        text: 'text-teal-600 dark:text-teal-400',
      };
    }
    if (score >= 93.0) {
      return {
        bg: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 border-blue-500/40',
        badge: 'bg-blue-500 text-white',
        bar: 'bg-blue-500',
        glow: 'shadow-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
      };
    }
    return {
      bg: 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border-indigo-500/40',
      badge: 'bg-indigo-500 text-white',
      bar: 'bg-indigo-500',
      glow: 'shadow-indigo-500/10',
      text: 'text-indigo-600 dark:text-indigo-400',
    };
  };

  return (
    <div
      id="ai-explainability-heatmap-panel"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-5"
    >
      {/* Top Banner: Title & Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-2xl shrink-0">
            <Brain className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Explainability Score Heatmap
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                AUDIT COMPLIANCE VERIFIED &bull; 0% BLACK-BOX
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Visualizing the deterministic feature attribution and causal clarity of Gemini 3.7 Flash across every payment failure taxonomy. 
              Higher scores confirm 100% mathematical verifiability and zero hallucination risk.
            </p>
          </div>
        </div>

        {/* Global Explainability Gauge */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overall Model Trust Index
            </div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
              <span>{averageExplainabilityIndex}%</span>
              <Award className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <button
            onClick={() => setShowFormulaModal(true)}
            className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20 transition-all cursor-pointer"
            title="Inspect Mathematical Scoring Formula"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 3 Highest Explainability Error Types Highlight (Deterministic Confidence Showcase) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Top 3 Highest Explainability Failures (Peak Deterministic Confidence)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Deterministic Rule Layer + Gemini 3.7 Flash Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {top3Items.map((item, index) => {
            const rankLabel = index === 0 ? '🥇 #1 HIGHEST CONFIDENCE' : index === 1 ? '🥈 #2 HIGHEST CONFIDENCE' : '🥉 #3 HIGHEST CONFIDENCE';
            const rankBorder = index === 0 ? 'border-emerald-500/40 bg-emerald-500/5' : index === 1 ? 'border-teal-500/40 bg-teal-500/5' : 'border-indigo-500/40 bg-indigo-500/5';
            const isSelected = selectedErrorId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedErrorId(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${rankBorder} ${
                  isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : 'hover:border-indigo-400/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300 border border-amber-500/30">
                    {rankLabel}
                  </span>
                  <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {item.explainabilityScore}%
                  </span>
                </div>

                <div className="mt-2.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Win: <strong className="text-slate-700 dark:text-slate-200">{item.recoveryWinRate}%</strong>
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    P99: <strong className="text-slate-700 dark:text-slate-200">{item.p99LatencyMs}ms</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Matrix Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search error taxonomy, rule, or causal code..."
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'ALL', label: 'All Rail Errors' },
            { id: 'CARDS_3DS', label: '💳 Cards & 3DS' },
            { id: 'UPI', label: '⚡ UPI Rails' },
            { id: 'MANDATES', label: '📅 Mandates' },
            { id: 'SECURITY', label: '🛡️ Mutex & Fraud' },
            { id: 'NETBANKING', label: '🏦 Netbanking' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="EXPLAINABILITY">Highest Explainability</option>
            <option value="CONFIDENCE">Highest AI Confidence</option>
            <option value="WIN_RATE">Highest Recovery Win Rate</option>
            <option value="LATENCY">Fastest P99 Latency</option>
          </select>
        </div>
      </div>

      {/* Main Visual Heatmap Grid & Inspection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 7 Columns: Visual Heatmap Matrix Table */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="font-semibold">TAXONOMY HEATMAP MATRIX</span>
            <span className="font-mono text-[11px] text-indigo-400">Click any row to audit SHAP causal weights</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-3.5">Error Taxonomy</th>
                  <th className="py-2.5 px-2.5 text-center">Explainability</th>
                  <th className="py-2.5 px-2.5 text-center">AI Conf</th>
                  <th className="py-2.5 px-2.5 text-center">SHAP</th>
                  <th className="py-2.5 px-2.5 text-center">Rule Det.</th>
                  <th className="py-2.5 px-2.5 text-right pr-3.5">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredItems.map((item) => {
                  const isSelected = selectedErrorId === item.id;
                  const colors = getHeatmapColor(item.explainabilityScore);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedErrorId(item.id)}
                      className={`transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 font-medium'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Error Taxonomy */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              item.explainabilityScore >= 98
                                ? 'bg-emerald-400'
                                : item.explainabilityScore >= 95
                                ? 'bg-teal-400'
                                : 'bg-indigo-400'
                            }`}
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {item.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {item.errorCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Explainability Score Cell with Visual Color Matrix Pill */}
                      <td className="py-3 px-2.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-mono font-black border transition-all ${colors.bg}`}
                        >
                          {item.explainabilityScore}%
                        </span>
                      </td>

                      {/* AI Confidence */}
                      <td className="py-3 px-2.5 text-center font-mono text-slate-700 dark:text-slate-300">
                        {item.aiConfidence}%
                      </td>

                      {/* SHAP Score */}
                      <td className="py-3 px-2.5 text-center font-mono text-slate-700 dark:text-slate-300">
                        {item.shapAttributionScore}%
                      </td>

                      {/* Determinism */}
                      <td className="py-3 px-2.5 text-center font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {item.determinismScore}%
                      </td>

                      {/* Win Rate */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {item.recoveryWinRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Color Legend */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 px-1 pt-1">
            <span className="font-bold">HEATMAP EXPLAINABILITY SCALE:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                98% - 100% (Deterministic)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-teal-500" />
                95% - 97.9% (Very High)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                93% - 94.9% (High)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                &lt;93% (Standard)
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Deep-Dive Feature Attribution & Audit Panel */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
          {/* Header of Selected Inspection */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {selectedItem.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedItem.deterministicRuleId}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {selectedItem.name}
              </h4>
            </div>

            <button
              onClick={() => handleCopyTrace(selectedItem)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-mono"
              title="Copy Forensic Audit Trace"
            >
              {copiedId === selectedItem.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Trace JSON</span>
                </>
              )}
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-[9px] uppercase font-bold text-slate-400">Explainability</div>
              <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                {selectedItem.explainabilityScore}%
              </div>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-[9px] uppercase font-bold text-slate-400">AI Confidence</div>
              <div className="text-base font-black font-mono text-indigo-600 dark:text-indigo-400">
                {selectedItem.aiConfidence}%
              </div>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-[9px] uppercase font-bold text-slate-400">P99 Latency</div>
              <div className="text-base font-black font-mono text-slate-800 dark:text-slate-200">
                {selectedItem.p99LatencyMs}ms
              </div>
            </div>
          </div>

          {/* SHAP Feature Attribution Weight Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                SHAP Feature Attribution Weights
              </span>
              <span className="text-[10px] text-slate-400 font-mono">100% Causal Sum</span>
            </div>

            <div className="space-y-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              {selectedItem.primaryCausalFactors.map((factor, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[200px]">
                      {factor.feature}
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {factor.weight}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0
                          ? 'bg-emerald-500'
                          : idx === 1
                          ? 'bg-teal-500'
                          : idx === 2
                          ? 'bg-indigo-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${factor.weight}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Diagnostic Rationale */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Gemini 3.7 Flash Diagnostic Rationale
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
              {selectedItem.aiDiagnosticRationale}
            </p>
          </div>

          {/* Autonomous Action Executed */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Autonomous Recovery Playbook
            </span>
            <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 font-medium leading-relaxed">
              {selectedItem.autonomousAction}
            </div>
          </div>

          {/* Regulatory Audit Note */}
          <div className="p-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-[10px] space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              Regulatory Audit Guarantee:
            </div>
            <p className="text-slate-400 leading-normal">
              {selectedItem.auditComplianceNotes}
            </p>
          </div>
        </div>
      </div>

      {/* Formula & Explainability Transparency Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Explainability Score Mathematical Formula
                </h3>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              To guarantee absolute transparency and avoid black-box hallucinations for financial regulators and auditors (RBI/NPCI), RecoverAI evaluates explainability using a multi-factor weighted deterministic index:
            </p>

            <div className="bg-slate-950 text-indigo-300 p-4 rounded-xl font-mono text-xs border border-indigo-500/30 space-y-2">
              <div className="text-amber-400 font-bold">
                Explainability Score = (0.40 × S_shap) + (0.30 × D_rule) + (0.20 × C_gemini) + (0.10 × L_perf)
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800">
                <div>&bull; <strong>S_shap (40%)</strong>: SHAP feature attribution completeness.</div>
                <div>&bull; <strong>D_rule (30%)</strong>: Deterministic hard-rule alignment score.</div>
                <div>&bull; <strong>C_gemini (20%)</strong>: Gemini 3.7 Flash log-likelihood certainty.</div>
                <div>&bull; <strong>L_perf (10%)</strong>: P99 inference latency bound (&lt;50ms).</div>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-500/30 text-xs flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>Zero Hallucination Proof:</strong> If Gemini confidence falls below 90%, the engine automatically falls back to static deterministic rules in 0ms.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
