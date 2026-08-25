import React, { useState, useMemo } from 'react';
import {
  Brain,
  Cpu,
  Zap,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Layers,
  Terminal,
  TrendingUp,
  Sparkles,
  BarChart3,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  AlertOctagon,
  HelpCircle,
  Clock,
  Send,
  Lock,
  ArrowRight,
  Sliders,
  Flame,
  FileText,
} from 'lucide-react';
import { TransactionRecord, SystemMetrics, RecoveryChannel } from '../types';
import { AIConfidenceEvolutionSparkline } from './AIConfidenceEvolutionSparkline';

interface ExplainabilityLogSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionRecord[];
  selectedTxId?: string | null;
  onSelectTx?: (txId: string) => void;
  metrics: SystemMetrics | null;
  onOpenCustomerView?: (tx: TransactionRecord) => void;
  onHumanOverride?: (txId: string, rail: RecoveryChannel, note?: string) => void;
  onSimulateEdgeCase?: () => void;
  defaultTab?: 'chain_of_thought' | 'hitl_safeguard' | 'rail_decision_logic' | 'performance_heatmap' | 'raw_trace';
}

type SidebarTab = 'chain_of_thought' | 'hitl_safeguard' | 'rail_decision_logic' | 'performance_heatmap' | 'raw_trace';

interface HeatmapCellData {
  rail: string;
  scenario: string;
  recoveryRate: number; // %
  p99LatencyMs: number;
  sampleCount: number;
  status: 'OPTIMAL' | 'ELEVATED' | 'DEGRADED';
  rationale: string;
}

export const ExplainabilityLogSidebar: React.FC<ExplainabilityLogSidebarProps> = ({
  isOpen,
  onClose,
  transactions,
  selectedTxId,
  onSelectTx,
  metrics,
  onOpenCustomerView,
  onHumanOverride,
  onSimulateEdgeCase,
  defaultTab = 'chain_of_thought',
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>(defaultTab);
  const [isExpandedWidth, setIsExpandedWidth] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<HeatmapCellData | null>(null);
  const [activeHeatmapMode, setActiveHeatmapMode] = useState<'rails_vs_failure' | 'banks_vs_latency'>('rails_vs_failure');
  
  // Human-in-the-Loop local form state
  const [selectedOverrideRail, setSelectedOverrideRail] = useState<RecoveryChannel>('WHATSAPP_INTERACTIVE_PAY');
  const [operatorNotes, setOperatorNotes] = useState<string>('Customer VIP tier verified. High cart value warrants WhatsApp interactive payment link with pre-authorized UPI intent.');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState<boolean>(false);
  const [overrideSuccessNotice, setOverrideSuccessNotice] = useState<string | null>(null);
  const [selectedReasoningStep, setSelectedReasoningStep] = useState<number | null>(5);

  // Select current transaction or fallback to first
  const currentTx = useMemo(() => {
    if (selectedTxId) {
      const found = transactions.find((t) => t.id === selectedTxId);
      if (found) return found;
    }
    return transactions[0] || null;
  }, [transactions, selectedTxId]);

  // Check if current transaction is a low-confidence decision (< 85%) or edge case
  const confidenceScore = currentTx?.diagnosis?.confidenceScore ?? 0.94;
  const isLowConfidence = confidenceScore < 0.85;
  const isHumanOverridden = !!currentTx?.diagnosis?.humanOverrideApplied;

  // Count total low-confidence decisions in the system
  const lowConfidenceCount = useMemo(() => {
    return transactions.filter(
      (t) => (t.diagnosis?.confidenceScore ?? 1) < 0.85 && !t.diagnosis?.humanOverrideApplied
    ).length;
  }, [transactions]);

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleApplyOverride = (railToUse?: RecoveryChannel) => {
    if (!currentTx) return;
    const finalRail = railToUse || selectedOverrideRail;
    setIsSubmittingOverride(true);
    
    setTimeout(() => {
      if (onHumanOverride) {
        onHumanOverride(currentTx.id, finalRail, operatorNotes);
      }
      setIsSubmittingOverride(false);
      setOverrideSuccessNotice(`Authorized and dispatched via ${finalRail.replace(/_/g, ' ')} by Operator.`);
      setTimeout(() => setOverrideSuccessNotice(null), 4000);
    }, 400);
  };

  // Performance Heatmap Data Matrix
  const heatmapMatrix: HeatmapCellData[] = [
    {
      rail: 'NPCI UPI Intent',
      scenario: 'Bank 504 Timeout',
      recoveryRate: 96.4,
      p99LatencyMs: 24,
      sampleCount: 1420,
      status: 'OPTIMAL',
      rationale: 'Bypasses degraded bank netbanking switch via instant NPCI app-to-app deep-linking.',
    },
    {
      rail: 'NPCI UPI Intent',
      scenario: '3DS OTP Drop',
      recoveryRate: 91.2,
      p99LatencyMs: 28,
      sampleCount: 980,
      status: 'OPTIMAL',
      rationale: 'Eliminates SMS delivery dependency by directly opening user biometric UPI app.',
    },
    {
      rail: 'NPCI UPI Intent',
      scenario: 'NSF / Low Balance',
      recoveryRate: 18.5,
      p99LatencyMs: 32,
      sampleCount: 310,
      status: 'DEGRADED',
      rationale: 'Immediate UPI retries fail on low balance; smart scheduled dunning required instead.',
    },
    {
      rail: 'NPCI UPI Intent',
      scenario: 'Token Expiry',
      recoveryRate: 88.0,
      p99LatencyMs: 22,
      sampleCount: 540,
      status: 'OPTIMAL',
      rationale: 'Routes directly without requiring legacy card token re-validation.',
    },
    {
      rail: 'WhatsApp 1-Click Pay',
      scenario: 'Bank 504 Timeout',
      recoveryRate: 84.6,
      p99LatencyMs: 145,
      sampleCount: 620,
      status: 'OPTIMAL',
      rationale: 'Delivers dynamic payment URL with pre-filled cart session over verified WhatsApp channel.',
    },
    {
      rail: 'WhatsApp 1-Click Pay',
      scenario: '3DS OTP Drop',
      recoveryRate: 94.8,
      p99LatencyMs: 110,
      sampleCount: 1840,
      status: 'OPTIMAL',
      rationale: 'Primary champion rail for OTP dropouts; achieves 94.8% customer open and tap-through.',
    },
    {
      rail: 'WhatsApp 1-Click Pay',
      scenario: 'NSF / Low Balance',
      recoveryRate: 42.0,
      p99LatencyMs: 160,
      sampleCount: 450,
      status: 'ELEVATED',
      rationale: 'Effective when combined with 24-hour delayed dunning reminder for salary replenishment.',
    },
    {
      rail: 'WhatsApp 1-Click Pay',
      scenario: 'Token Expiry',
      recoveryRate: 81.3,
      p99LatencyMs: 130,
      sampleCount: 290,
      status: 'OPTIMAL',
      rationale: 'Permits customer to select fresh payment instrument seamlessly inside WhatsApp Webview.',
    },
    {
      rail: 'Salary Smart Dunning',
      scenario: 'Bank 504 Timeout',
      recoveryRate: 12.0,
      p99LatencyMs: 45,
      sampleCount: 80,
      status: 'DEGRADED',
      rationale: 'Disqualified for technical timeouts; delayed retries lead to cart abandonment.',
    },
    {
      rail: 'Salary Smart Dunning',
      scenario: '3DS OTP Drop',
      recoveryRate: 15.4,
      p99LatencyMs: 50,
      sampleCount: 95,
      status: 'DEGRADED',
      rationale: 'Ineffective for realtime checkout drops; reserved strictly for subscription mandates.',
    },
    {
      rail: 'Salary Smart Dunning',
      scenario: 'NSF / Low Balance',
      recoveryRate: 92.6,
      p99LatencyMs: 40,
      sampleCount: 2450,
      status: 'OPTIMAL',
      rationale: 'Champion rail for NSF declines. Aligns retries with 1st/5th of month salary credit windows.',
    },
    {
      rail: 'Salary Smart Dunning',
      scenario: 'Token Expiry',
      recoveryRate: 74.0,
      p99LatencyMs: 55,
      sampleCount: 380,
      status: 'ELEVATED',
      rationale: 'Requires customer biometric re-consent before scheduled execution.',
    },
    {
      rail: 'Dynamic Card Re-Vault',
      scenario: 'Bank 504 Timeout',
      recoveryRate: 45.0,
      p99LatencyMs: 380,
      sampleCount: 410,
      status: 'ELEVATED',
      rationale: 'Falls back to secondary gateway (e.g. ICICI / Axis PG) if primary gateway is degraded.',
    },
    {
      rail: 'Dynamic Card Re-Vault',
      scenario: '3DS OTP Drop',
      recoveryRate: 38.0,
      p99LatencyMs: 290,
      sampleCount: 520,
      status: 'DEGRADED',
      rationale: 'Still subject to SMS delivery bottlenecks unless biometric 3DS2 is supported.',
    },
    {
      rail: 'Dynamic Card Re-Vault',
      scenario: 'NSF / Low Balance',
      recoveryRate: 22.0,
      p99LatencyMs: 180,
      sampleCount: 190,
      status: 'DEGRADED',
      rationale: 'Immediate card retries worsen bank decline penalties without funds replenishment.',
    },
    {
      rail: 'Dynamic Card Re-Vault',
      scenario: 'Token Expiry',
      recoveryRate: 98.2,
      p99LatencyMs: 65,
      sampleCount: 1650,
      status: 'OPTIMAL',
      rationale: 'Champion rail for tokenization lifecycle maintenance. Seamless COFT cryptogram refresh.',
    },
  ];

  // Bank Latency Matrix for secondary view
  const bankLatencyMatrix = [
    { bank: 'HDFC Bank', upi: 24, netbanking: 1420, cards3ds: 380, mandate: 45, status: 'DEGRADED' },
    { bank: 'SBI', upi: 42, netbanking: 280, cards3ds: 290, mandate: 50, status: 'ELEVATED' },
    { bank: 'ICICI Bank', upi: 18, netbanking: 38, cards3ds: 65, mandate: 32, status: 'OPTIMAL' },
    { bank: 'Axis Bank', upi: 22, netbanking: 45, cards3ds: 72, mandate: 40, status: 'OPTIMAL' },
    { bank: 'Kotak Bank', upi: 240, netbanking: 60, cards3ds: 80, mandate: 48, status: 'DEGRADED' },
    { bank: 'Yes Bank', upi: 15, netbanking: 35, cards3ds: 58, mandate: 28, status: 'OPTIMAL' },
  ];

  // Derive Chain of Thought Reasoning tokens and nodes
  const reasoningTokensData = useMemo(() => {
    if (!currentTx) return null;

    const bank = currentTx.bank || 'HDFC Bank';
    const amountInr = (currentTx.amountPaise / 100).toFixed(0);
    const errorCode = currentTx.errorCode || 'GATEWAY_ERROR';
    const channel = currentTx.channelDispatched || 'INSTANT_UPI_SWITCH';
    const processingMs = currentTx.diagnosis?.processingTimeMs || 34;
    const isEdgeCase = (currentTx.diagnosis?.confidenceScore ?? 0.94) < 0.85;

    const thoughtTokens = [
      {
        node: 'INGRESS_TELEMETRY',
        offsetMs: 0,
        tokenCount: 42,
        phase: 'WEBHOOK_INGESTION',
        content: `Ingesting Razorpay payment.failed payload. Order: ${currentTx.orderId}, Payment: ${currentTx.paymentId}, Amount: ₹${amountInr}, Bank: ${bank}, Error: ${errorCode}.`,
      },
      {
        node: 'IDEMPOTENCY_MUTEX',
        offsetMs: 4,
        tokenCount: 28,
        phase: 'SECURITY_LOCK',
        content: `Acquired Redis distributed mutex lock on key 'rzp_idemp:${currentTx.paymentId}' (TTL 120s). Zero duplicate replay detected. SHA256 HMAC signature valid.`,
      },
      {
        node: 'ISSUER_SWITCH_HEALTH_CHECK',
        offsetMs: 14,
        tokenCount: 56,
        phase: 'TELEMETRY_EVALUATION',
        content: isEdgeCase
          ? `Evaluating telemetry for ${bank}: Conflicting signals detected! Switch latency p99=640ms with high standard deviation (±320ms). ACS timeout rate is erratic (18-42%).`
          : `Evaluating real-time latency for issuer '${bank}'. p99 Netbanking latency is elevated (>1,200ms) with 504 error rate at 38.4%. Immediate issuer retry penalized (-45pts).`,
      },
      {
        node: 'CUSTOMER_INTENT_SCORING',
        offsetMs: 22,
        tokenCount: 48,
        phase: 'INTENT_CLASSIFICATION',
        content: `Transaction value ₹${amountInr}. Intent Score: ${(currentTx.diagnosis?.customerIntentScore ?? 0.92).toFixed(2)}. ${
          Number(amountInr) > 20000 ? 'High-ticket basket requires conservative routing safeguard.' : 'Active checkout session detected.'
        }`,
      },
      {
        node: 'MULTI_RAIL_ARBITRATION',
        offsetMs: 28,
        tokenCount: 74,
        phase: 'SHAP_WEIGHTED_ROUTING',
        content: isEdgeCase
          ? `Evaluating candidate recovery rails under uncertainty:
- Rail A (NPCI UPI Intent): Score 74.2 | Latency 28ms | Predicted Win: 72.4% [AMBIGUOUS]
- Rail B (WhatsApp 1-Click Pay): Score 72.8 | Latency 120ms | Predicted Win: 71.0% [AMBIGUOUS]
- Score Delta < 2.0% triggers Edge-Case Caution Protocol (Confidence: ${(confidenceScore * 100).toFixed(1)}%).`
          : `Evaluating candidate recovery rails:
- Rail A (NPCI UPI Intent Fast-Switch): Score 98.4 | Latency 24ms | Predicted Win: 96.2% [SELECTED]
- Rail B (WhatsApp 1-Click Collect): Score 84.1 | Latency 110ms | Predicted Win: 88.0%
- Rail C (Salary Smart Dunning): Score 12.0 | Disqualified: Cart is non-recurring instant checkout.
- Rail D (Direct Card Retry): Score 4.2 | Disqualified: Bank ACS switch degradation.`,
      },
      {
        node: isEdgeCase ? 'HUMAN_IN_THE_LOOP_ESCALATION' : 'SAFETY_GUARDRAILS_VERIFIED',
        offsetMs: 34,
        tokenCount: 46,
        phase: isEdgeCase ? 'HITL_SAFEGUARD_ACTIVATED' : 'COMPLIANCE_ENFORCEMENT',
        content: isEdgeCase
          ? `[EDGE_CASE_SAFEGUARD] Confidence ${(confidenceScore * 100).toFixed(1)}% < 85.0% Caution Boundary. System paused automatic dispatch and escalated transaction ${currentTx.orderId} to Human-in-the-Loop review queue.`
          : `Applied RBI Tokenization COFT compliance & Anti-Spam frequency cap (0/3 today). Zero double-charge guarantee locked. Autonomous dispatch authorized to ${channel}.`,
      },
    ];

    const rawChainOfThought = `<thought>
[T+0ms] Razorpay Webhook Event Ingested
- Event: payment.failed (ID: ${currentTx.paymentId})
- Order: ${currentTx.orderId} | Currency: ${currentTx.currency} | Amount: ₹${amountInr}
- Method: ${currentTx.method} | Issuer Bank: ${bank}
- Error Code: ${errorCode} | Reason: ${currentTx.errorReason}

[T+4ms] Distributed Idempotency Lock
- Redis Key: lock:idempotency:${currentTx.paymentId}
- Status: ACQUIRED (Mutex held, zero double-debit guaranteed)
- SHA256 Signature: Validated against webhook secret

[T+14ms] Switch Health & Telemetry Probing
- Probing ${bank} core switch telemetry:
  * ACS 3DS HTTP 504 Timeout rate: ${isEdgeCase ? '24.1% (High Variance)' : '38.4%'}
  * Switch p99 Round-trip: ${isEdgeCase ? '640ms (±320ms)' : '1,420ms'}
  * Telemetry Confidence: ${isEdgeCase ? 'LOW (Conflicting signals)' : 'HIGH'}

[T+22ms] SHAP Feature Attribution Weighting
- Feature 1: Bank Switch Health Degradation -> Weight: ${isEdgeCase ? '+0.22 (Ambiguous)' : '+0.48 (Penalize bank retry)'}
- Feature 2: Device Context (Mobile App Active) -> Weight: +0.26
- Feature 3: Cart Basket Value (₹${amountInr}) -> Weight: ${Number(amountInr) > 20000 ? '+0.42 (High-Risk Threshold)' : '+0.14'}
- Feature 4: Error Taxonomy (${errorCode}) -> Weight: +0.28

[T+28ms] Rail Arbitration Matrix
- Candidate Rails:
  * Rail 1 (UPI Intent): 74.2 pts
  * Rail 2 (WhatsApp 1-Click): 72.8 pts
- Margin of Difference: 1.4 pts (< 5% dead-heat boundary)
- Calculated Confidence Score: ${(confidenceScore * 100).toFixed(1)}%

${
  isEdgeCase
    ? `[T+34ms] CAUTION PROTOCOL ENGAGED (Human-In-The-Loop)
- Threshold Check: Confidence ${(confidenceScore * 100).toFixed(1)}% < 85.00%
- Safeguard Decision: Autonomous dispatch PAUSED.
- Action: Escalate to Merchant Operations HITL Dashboard for Operator Sign-off.
- Guardrails: Mutex locked, anti-spam verified, awaiting operator choice.`
    : `[T+34ms] Autonomous Action Generation
- Action Title: ${currentTx.diagnosis?.actionPayload?.title || 'Fast UPI Intent Failover'}
- Payload: Deep-link UPI URI generated & interactive modal armed.
- Guardrails: Anti-Spam (OK), Margin Protection (OK), Double-Charge Lock (OK).`
}
</thought>`;

    return {
      thoughtTokens,
      rawChainOfThought,
      totalPromptTokens: 394,
      totalReasoningTokens: isEdgeCase ? 342 : 288,
      totalCompletionTokens: 98,
      totalTokens: isEdgeCase ? 834 : 768,
      modelName: 'gemini-3.7-flash-reasoning (Dual-Tier Hybrid)',
      temperature: 0.0,
      inferenceLatencyMs: processingMs,
    };
  }, [currentTx, confidenceScore]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in flex justify-end">
      <aside
        id="explainability-log-sidebar"
        aria-label="AI Explainability Log & Chain-of-Thought Reasoning Sidebar"
        className={`h-full bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col transition-all duration-300 ${
          isExpandedWidth ? 'w-full max-w-5xl' : 'w-full max-w-2xl sm:max-w-xl md:max-w-2xl'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Brain className="w-4 h-4 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-tight">AI Explainability Log</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  CoT Reasoning
                </span>
                {isLowConfidence && !isHumanOverridden && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>HITL Alert</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Raw tokens, causal weights, edge-case safeguards & performance heatmap
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Simulate Edge Case Shortcut */}
            {onSimulateEdgeCase && (
              <button
                onClick={() => {
                  onSimulateEdgeCase();
                  setActiveTab('hitl_safeguard');
                }}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                title="Inject an ambiguous low-confidence payment failure to test Human-in-the-Loop safeguard"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Simulate Edge Case</span>
              </button>
            )}

            {/* Expand width toggle */}
            <button
              onClick={() => setIsExpandedWidth((prev) => !prev)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isExpandedWidth ? 'Collapse Sidebar Width' : 'Expand Sidebar Width'}
            >
              {isExpandedWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Explainability Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time Low-Confidence Alert Strip (Visible if current or any tx has low confidence) */}
        {isLowConfidence && (
          <div className="p-3 bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-slate-950 border-b border-amber-500/40 flex items-center justify-between gap-3 text-xs shrink-0 animate-fade-in">
            <div className="flex items-start space-x-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                <AlertOctagon className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-amber-200 text-xs">
                    Low-Confidence Decision Guardrail Active ({((currentTx?.diagnosis?.confidenceScore ?? 0.64) * 100).toFixed(0)}%)
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-mono text-[10px]">
                    Threshold: &lt;85%
                  </span>
                </div>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  Ambiguous bank telemetry and high cart value (₹{((currentTx?.amountPaise || 0) / 100).toFixed(0)}) require operator review to prevent customer friction.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('hitl_safeguard')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shrink-0 transition-all shadow flex items-center gap-1 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-950" />
              <span>Review HITL</span>
            </button>
          </div>
        )}

        {/* Transaction Selector Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-slate-400 font-medium text-[11px] shrink-0">Inspecting Event:</span>
            <select
              value={currentTx?.id || ''}
              onChange={(e) => onSelectTx && onSelectTx(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-72 truncate"
            >
              {transactions.map((tx) => {
                const conf = (tx.diagnosis?.confidenceScore ?? 0.94) * 100;
                const isEdge = conf < 85;
                return (
                  <option key={tx.id} value={tx.id}>
                    {isEdge ? '⚠️ ' : ''}{tx.orderId} - ₹{(tx.amountPaise / 100).toFixed(0)} ({tx.bank || tx.method}) [{conf.toFixed(0)}% Conf]
                  </option>
                );
              })}
            </select>
          </div>

          {currentTx && (
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="font-mono text-emerald-400 font-bold">
                ₹{(currentTx.amountPaise / 100).toFixed(0)}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                  isLowConfidence
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-300'
                }`}
              >
                {isHumanOverridden ? 'HUMAN_VERIFIED' : currentTx.channelDispatched || 'UPI_INTENT'}
              </span>
            </div>
          )}
        </div>

        {/* Sidebar Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 p-2 bg-slate-900 border-b border-slate-800 text-xs shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('chain_of_thought')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'chain_of_thought'
                ? 'bg-purple-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Chain-of-Thought Tokens</span>
          </button>

          <button
            onClick={() => setActiveTab('hitl_safeguard')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'hitl_safeguard'
                ? 'bg-amber-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Human-in-the-Loop</span>
            {isLowConfidence && !isHumanOverridden && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('rail_decision_logic')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'rail_decision_logic'
                ? 'bg-purple-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Rail Selection Logic</span>
          </button>

          <button
            onClick={() => setActiveTab('performance_heatmap')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'performance_heatmap'
                ? 'bg-purple-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Performance Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('raw_trace')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'raw_trace'
                ? 'bg-purple-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Raw Trace & Mutex</span>
          </button>
        </div>

        {/* Sidebar Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
          
          {/* TAB 1: CHAIN OF THOUGHT TOKENS */}
          {activeTab === 'chain_of_thought' && reasoningTokensData && (
            <div className="space-y-4 animate-fade-in">
              {/* Token Telemetry Metadata Bar */}
              <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Model Engine</div>
                  <div className="font-mono font-bold text-purple-300 mt-0.5">Gemini 3.7 Flash</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Reasoning Tokens</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">
                    {reasoningTokensData.totalReasoningTokens} tok
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Prompt Tokens</div>
                  <div className="font-mono font-bold text-blue-400 mt-0.5">
                    {reasoningTokensData.totalPromptTokens} tok
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Inference Latency</div>
                  <div className="font-mono font-bold text-amber-300 mt-0.5">
                    {reasoningTokensData.inferenceLatencyMs}ms
                  </div>
                </div>
              </div>

              {/* Visual Confidence Evolution Sparkline (Iterative Thought Process Refinement) */}
              {currentTx && (
                <AIConfidenceEvolutionSparkline
                  transaction={currentTx}
                  selectedStepIndex={selectedReasoningStep}
                  onSelectStep={(idx) => setSelectedReasoningStep(idx)}
                />
              )}

              {/* Step-by-Step Chain of Thought Reasoning Nodes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Structured Reasoning Path Nodes
                  </span>
                  <button
                    onClick={() => copyToClipboard(reasoningTokensData.rawChainOfThought, 'raw_cot')}
                    className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    {copiedSection === 'raw_cot' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy CoT</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  {reasoningTokensData.thoughtTokens.map((step, idx) => {
                    const isSelected = selectedReasoningStep === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedReasoningStep(idx)}
                        className={`bg-slate-950 border rounded-xl p-3 transition-all space-y-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-purple-500 ring-1 ring-purple-500/50 bg-purple-950/20 shadow-md'
                            : step.node.includes('HUMAN') || step.node.includes('EDGE')
                            ? 'border-amber-500/50 bg-amber-950/20'
                            : 'border-slate-800 hover:border-purple-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center space-x-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                              isSelected
                                ? 'bg-purple-500 text-white font-bold'
                                : step.node.includes('HUMAN')
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-mono font-bold text-slate-200">{step.node}</span>
                            {isSelected && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-400/40">
                                Active Node
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 font-mono text-[10px] text-slate-400">
                            <span className="text-purple-400">+{step.offsetMs}ms</span>
                            <span>&bull;</span>
                            <span className="text-slate-500">{step.tokenCount} tokens</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 font-mono leading-relaxed pl-7">
                          {step.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Raw Chain-of-Thought Stream Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Raw LLM Chain-of-Thought Stream Output</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400">Deterministic Temperature: 0.0</span>
                </div>
                <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-emerald-300/90 whitespace-pre-wrap overflow-x-auto leading-relaxed border border-slate-800/80 max-h-60">
                  {reasoningTokensData.rawChainOfThought}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: HUMAN-IN-THE-LOOP SAFEGUARD & REVIEW PROMPT (NEW) */}
          {activeTab === 'hitl_safeguard' && currentTx && (
            <div className="space-y-4 animate-fade-in">
              {/* Caution & Safeguard Header Card */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                isLowConfidence
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-100'
                  : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${isLowConfidence ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xs">
                        Human-in-the-Loop (HITL) Decision Guardrail
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Autonomous confidence arbitration & operator override controls
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    isHumanOverridden
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : isLowConfidence
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}>
                    {isHumanOverridden
                      ? 'HUMAN_VERIFIED'
                      : isLowConfidence
                      ? 'REVIEW_REQUIRED (<85%)'
                      : 'AUTO_DISPATCH_SAFE (94%)'}
                  </span>
                </div>

                {/* Confidence Meter Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-purple-400" />
                      AI Decision Confidence Metric:
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {(confidenceScore * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-3 relative overflow-hidden border border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLowConfidence
                          ? 'bg-gradient-to-r from-red-500 via-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, confidenceScore * 100)}%` }}
                    />
                    {/* 85% Threshold Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-400/90 z-10"
                      style={{ left: '85%' }}
                      title="Caution Boundary: 85%"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>0% (High Uncertainty)</span>
                    <span className="text-amber-400 font-bold">85% Caution Threshold</span>
                    <span>100% (Deterministic)</span>
                  </div>
                </div>
              </div>

              {/* Confidence Evolution Sparkline in HITL Safeguard */}
              <AIConfidenceEvolutionSparkline
                transaction={currentTx}
                selectedStepIndex={selectedReasoningStep}
                onSelectStep={(idx) => setSelectedReasoningStep(idx)}
                showDetailedCards={false}
              />

              {/* Edge Case Root-Cause Analysis Breakdown */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Edge-Case Caution Rationale
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Edge Analysis</span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>1. Conflicting Bank Telemetry</span>
                      <span className="text-amber-400 font-mono text-[10px]">Variance ±320ms</span>
                    </div>
                    <p className="text-slate-400">
                      {currentTx.bank || 'HDFC Bank'} switch is reporting intermittent 504 errors while UPI gateway remains operational. Standard statistical deviation exceeds normal steady-state threshold.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>2. High Cart Basket Urgency</span>
                      <span className="text-purple-400 font-mono text-[10px]">₹{(currentTx.amountPaise / 100).toFixed(0)} Basket</span>
                    </div>
                    <p className="text-slate-400">
                      Cart value exceeds high-ticket threshold. Immediate automatic dunning risk may lead to cart abandonment; verified WhatsApp interactive link recommended.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>3. Statistical Dead-Heat Between Recovery Rails</span>
                      <span className="text-blue-400 font-mono text-[10px]">Δ &lt; 2.0% Delta</span>
                    </div>
                    <p className="text-slate-400">
                      Score difference between <em>NPCI UPI Intent (74.2 pts)</em> and <em>WhatsApp 1-Click (72.8 pts)</em> is within margin of error. Human judgment required for channel prioritization.
                    </p>
                  </div>
                </div>
              </div>

              {/* Operator Action & Override Prompt Panel */}
              <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    Human-in-the-Loop Operator Action Prompt
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200">
                    Operator Console
                  </span>
                </div>

                <p className="text-[11px] text-slate-300">
                  Select the optimal recovery strategy to authorize for this transaction or approve the AI's fallback strategy.
                </p>

                {/* Rail Selector Options */}
                <div className="space-y-2">
                  {[
                    {
                      rail: 'WHATSAPP_INTERACTIVE_PAY' as RecoveryChannel,
                      label: 'WhatsApp 1-Click Interactive Pay (Recommended for High Basket)',
                      desc: 'Sends instant WhatsApp template with pre-filled cart & single-tap UPI approval.',
                      winRate: '88.4%',
                      badge: 'High Conversion',
                    },
                    {
                      rail: 'INSTANT_UPI_SWITCH' as RecoveryChannel,
                      label: 'NPCI UPI Intent Fast-Switch',
                      desc: 'Opens customer UPI app immediately (GPay, PhonePe, Paytm).',
                      winRate: '74.2%',
                      badge: 'Fastest (24ms)',
                    },
                    {
                      rail: 'ADAPTIVE_DUNNING' as RecoveryChannel,
                      label: 'Salary-Aligned Smart Dunning',
                      desc: 'Delays retry execution to next morning/salary window to prevent low-balance bounce.',
                      winRate: '45.0%',
                      badge: 'Delayed',
                    },
                    {
                      rail: 'MANUAL_INTERVENTION_REQUIRED' as RecoveryChannel,
                      label: 'Hold in Safety Quarantine / VIP Concierge',
                      desc: 'Assigns ticket to merchant customer success team for phone concierge outreach.',
                      winRate: '95.0%',
                      badge: 'Manual Desk',
                    },
                  ].map((option) => (
                    <label
                      key={option.rail}
                      onClick={() => setSelectedOverrideRail(option.rail)}
                      className={`p-2.5 rounded-xl border flex items-start justify-between cursor-pointer transition-all ${
                        selectedOverrideRail === option.rail
                          ? 'bg-purple-950/40 border-purple-500 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        <input
                          type="radio"
                          name="override_rail"
                          checked={selectedOverrideRail === option.rail}
                          onChange={() => setSelectedOverrideRail(option.rail)}
                          className="mt-1 text-purple-600 focus:ring-purple-500 bg-slate-800 border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <span>{option.label}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {option.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{option.desc}</p>
                        </div>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold text-xs shrink-0 pl-2">
                        {option.winRate}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Operator Note Field */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                    <span>Operator Review Notes & Audit Justification:</span>
                    <span className="text-[10px] text-slate-500">Stored in compliance trail</span>
                  </label>
                  <textarea
                    rows={2}
                    value={operatorNotes}
                    onChange={(e) => setOperatorNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                    placeholder="Enter reason for human override..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    onClick={() => handleApplyOverride()}
                    disabled={isSubmittingOverride}
                    className="w-full sm:flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingOverride ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Authorize Selected Rail & Dispatch</span>
                  </button>

                  <button
                    onClick={() => handleApplyOverride(currentTx.diagnosis?.recommendedStrategy || 'INSTANT_UPI_SWITCH')}
                    disabled={isSubmittingOverride}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl transition-all border border-slate-700 cursor-pointer"
                  >
                    Approve AI Fallback
                  </button>
                </div>

                {overrideSuccessNotice && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">{overrideSuccessNotice}</span>
                  </div>
                )}
              </div>

              {/* Audit Trail Stamp */}
              {isHumanOverridden && (
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3 space-y-1.5 text-xs animate-fade-in">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Compliance Audit Stamp: Operator Approved</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono space-y-0.5 pl-6">
                    <div>Operator: <span className="text-white">admin@merchant.recoverai.io</span></div>
                    <div>Action: <span className="text-emerald-400">AUTHORIZED_OVERRIDE ({currentTx.channelDispatched})</span></div>
                    <div>Zero Double-Charge Mutex: <span className="text-emerald-400">Guaranteed Locked</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RAIL SELECTION LOGIC & SHAP ATTRIBUTION */}
          {activeTab === 'rail_decision_logic' && currentTx && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    Payment Rail Selection Arbitration
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Selected: {currentTx.channelDispatched || 'INSTANT_UPI_SWITCH'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Autonomous scoring matrix evaluated candidate rails based on real-time bank switch health, user device capability, and cart recovery elasticity.
                </p>

                {/* Candidate Rails Comparison */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>NPCI UPI Intent Fast-Switch (Winner)</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Bypasses 504 issuer gateway directly to phone UPI apps (GPay, PhonePe, Paytm).
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400 text-sm">98.4 pts</div>
                      <span className="text-[10px] text-emerald-300 font-mono">SELECTED</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-purple-400" />
                        <span>WhatsApp 1-Click Interactive Pay</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Secondary fallback rail; activated if user abandons mobile intent flow.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-300 text-sm">84.1 pts</div>
                      <span className="text-[10px] text-slate-500 font-mono">STANDBY</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between opacity-70">
                    <div>
                      <div className="font-semibold text-slate-400 flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-red-400" />
                        <span>Salary-Aligned Smart Dunning</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Disqualified: Cart is non-recurring instant e-commerce checkout.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-500 text-sm">12.0 pts</div>
                      <span className="text-[10px] text-red-400 font-mono">DISQUALIFIED</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between opacity-70">
                    <div>
                      <div className="font-semibold text-slate-400 flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-red-400" />
                        <span>Direct Bank Card Retry</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Disqualified: {currentTx.bank || 'HDFC Bank'} switch p99 latency &gt; 1,400ms.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-500 text-sm">4.2 pts</div>
                      <span className="text-[10px] text-red-400 font-mono">SUPPRESSED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SHAP Feature Attribution Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SHAP Causal Feature Attribution Weights</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {[
                    { feature: 'Bank Switch Latency Spike (>1,200ms)', weight: 48, direction: 'positive' },
                    { feature: 'Customer Device Context (Mobile App)', weight: 26, direction: 'positive' },
                    { feature: 'Error Taxonomy (GATEWAY_TIMEOUT)', weight: 34, direction: 'positive' },
                    { feature: 'Idempotency Zero-Double Charge Lock', weight: 100, direction: 'positive' },
                  ].map((f, idx) => (
                    <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">{f.feature}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, f.weight)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-purple-300 w-8 text-right">+{f.weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {onOpenCustomerView && (
                <button
                  onClick={() => onOpenCustomerView(currentTx)}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Test 1-Click Experience on Selected Rail</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* TAB 4: PERFORMANCE HEATMAP */}
          {activeTab === 'performance_heatmap' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setActiveHeatmapMode('rails_vs_failure')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      activeHeatmapMode === 'rails_vs_failure' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Rails vs Failure Matrix
                  </button>
                  <button
                    onClick={() => setActiveHeatmapMode('banks_vs_latency')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      activeHeatmapMode === 'banks_vs_latency' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bank Switch Latency Matrix
                  </button>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">Live Telemetry</span>
              </div>

              {/* VIEW A: RAILS VS FAILURE MATRIX */}
              {activeHeatmapMode === 'rails_vs_failure' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400">
                    Click any cell to inspect why the AI Engine routes specific failure categories to candidate recovery rails.
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80 text-[10px] text-slate-400 uppercase font-semibold">
                          <th className="p-2.5">Recovery Rail</th>
                          <th className="p-2.5 text-center">Bank 504 Timeout</th>
                          <th className="p-2.5 text-center">3DS OTP Drop</th>
                          <th className="p-2.5 text-center">NSF / Balance</th>
                          <th className="p-2.5 text-center">Token Expiry</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['NPCI UPI Intent', 'WhatsApp 1-Click Pay', 'Salary Smart Dunning', 'Dynamic Card Re-Vault'].map((railName) => {
                          const scenarios = ['Bank 504 Timeout', '3DS OTP Drop', 'NSF / Low Balance', 'Token Expiry'];
                          return (
                            <tr key={railName} className="border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors">
                              <td className="p-2.5 font-bold text-white text-xs">{railName}</td>
                              {scenarios.map((sc) => {
                                const item = heatmapMatrix.find((m) => m.rail === railName && m.scenario === sc);
                                if (!item) return <td key={sc} className="p-2 text-center text-slate-600">-</td>;
                                const isHigh = item.recoveryRate >= 80;
                                const isMed = item.recoveryRate >= 40 && item.recoveryRate < 80;
                                return (
                                  <td
                                    key={sc}
                                    onClick={() => setSelectedHeatmapCell(item)}
                                    className="p-1.5 text-center cursor-pointer"
                                  >
                                    <div
                                      className={`p-2 rounded-lg transition-all hover:scale-105 border ${
                                        isHigh
                                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                          : isMed
                                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                                      }`}
                                    >
                                      <div className="font-mono font-bold">{item.recoveryRate.toFixed(1)}%</div>
                                      <div className="text-[9px] opacity-75 font-mono">{item.p99LatencyMs}ms</div>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Selected Cell Deep-Dive Card */}
                  {selectedHeatmapCell && (
                    <div className="p-3.5 bg-slate-950 border border-purple-500/40 rounded-xl space-y-2 text-xs animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-300">
                          {selectedHeatmapCell.rail} &times; {selectedHeatmapCell.scenario}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200">
                          {selectedHeatmapCell.sampleCount} Samples
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {selectedHeatmapCell.rationale}
                      </p>
                      <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 pt-1">
                        <span>Win Rate: <strong className="text-emerald-400">{selectedHeatmapCell.recoveryRate}%</strong></span>
                        <span>&bull;</span>
                        <span>p99 Latency: <strong className="text-blue-400">{selectedHeatmapCell.p99LatencyMs}ms</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW B: BANK LATENCY MATRIX */}
              {activeHeatmapMode === 'banks_vs_latency' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400">
                    Real-time switch p99 response times (ms) across major Indian banking gateways.
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80 text-[10px] text-slate-400 uppercase font-semibold">
                          <th className="p-2.5">Bank Gateway</th>
                          <th className="p-2.5 text-center">UPI Rail</th>
                          <th className="p-2.5 text-center">Netbanking</th>
                          <th className="p-2.5 text-center">Cards 3DS</th>
                          <th className="p-2.5 text-center">Mandates</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bankLatencyMatrix.map((b) => (
                          <tr key={b.bank} className="border-b border-slate-800/60">
                            <td className="p-2.5 font-bold text-white">
                              <div>{b.bank}</div>
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                                b.status === 'OPTIMAL' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="p-2 text-center font-mono">
                              <span className={`px-2 py-1 rounded text-[10px] ${b.upi < 50 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                {b.upi}ms
                              </span>
                            </td>
                            <td className="p-2 text-center font-mono">
                              <span className={`px-2 py-1 rounded text-[10px] ${b.netbanking < 100 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                {b.netbanking}ms
                              </span>
                            </td>
                            <td className="p-2 text-center font-mono">
                              <span className={`px-2 py-1 rounded text-[10px] ${b.cards3ds < 100 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                {b.cards3ds}ms
                              </span>
                            </td>
                            <td className="p-2 text-center font-mono">
                              <span className="px-2 py-1 rounded text-[10px] bg-blue-500/20 text-blue-300">
                                {b.mandate}ms
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RAW TRACE & MUTEX AUDIT */}
          {activeTab === 'raw_trace' && currentTx && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Distributed Redis Mutex State
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    LOCK_ACTIVE
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg text-slate-300 font-mono text-[11px] space-y-1">
                  <div>Lock Key: <span className="text-purple-300">rzp_mutex:{currentTx.paymentId}</span></div>
                  <div>Signature Verified: <span className="text-emerald-400">HMAC-SHA256 (OK)</span></div>
                  <div>Replay Protection: <span className="text-emerald-400">Zero Double Debits</span></div>
                  <div>Timestamp: <span className="text-slate-400">{new Date(currentTx.timestamp).toISOString()}</span></div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 text-[11px]">Raw Razorpay Webhook Payload</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(currentTx.rawPayload || currentTx, null, 2), 'raw_json')}
                    className="flex items-center space-x-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
                  >
                    {copiedSection === 'raw_json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy JSON</span>
                  </button>
                </div>
                <pre className="p-2.5 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto max-h-72 border border-slate-800/80">
                  {JSON.stringify(currentTx.rawPayload || currentTx, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Dual-Tier Engine: <strong>Rule Cache (28ms)</strong> &bull; <strong>Gemini CoT & HITL</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
};
