import React, { useState } from 'react';
import {
  GitBranch,
  Zap,
  Cpu,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Lock,
  MessageSquare,
  Smartphone,
  CreditCard,
  Building,
  RotateCcw,
} from 'lucide-react';
import { TransactionRecord } from '../types';

interface NeuralRailDecisionPathProps {
  transactions?: TransactionRecord[];
}

interface NeuralNode {
  id: string;
  layer: number;
  layerName: string;
  name: string;
  shortDesc: string;
  activationFunction: 'Softmax' | 'Sigmoid' | 'ReLU' | 'Boolean Mutex';
  weightVector: string;
  latencyContributionMs: number;
  confidenceScore: number;
  status: 'ACTIVE' | 'EVALUATED' | 'PASSED' | 'BRANCH_SELECTED';
  inputSignals: string[];
  outputDecision: string;
  mathematicalRationale: string;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan' | 'indigo';
}

interface NeuralDecisionScenario {
  id: string;
  title: string;
  bank: string;
  method: string;
  errorCode: string;
  amountINR: number;
  selectedRail: string;
  expectedTSR: number;
  fastTierLatencyMs: number;
  scenarioDescription: string;
  activePathNodeIds: string[];
}

export const NeuralRailDecisionPath: React.FC<NeuralRailDecisionPathProps> = ({
  transactions = [],
}) => {
  const PRESET_NEURAL_SCENARIOS: NeuralDecisionScenario[] = [
    {
      id: 'scen_hdfc_504',
      title: 'HDFC Netbanking 504 Gateway Timeout',
      bank: 'HDFC Bank',
      method: 'netbanking',
      errorCode: 'GATEWAY_TIMEOUT',
      amountINR: 4200,
      selectedRail: 'Dynamic 1-Tap UPI Switch',
      expectedTSR: 94.2,
      fastTierLatencyMs: 38,
      scenarioDescription: 'HDFC Netbanking core switch is throwing 504s with p99 latency spiking to 2,400ms. Customer intent is high (cart active for <60s). Neural path routes directly to NPCI UPI Intent.',
      activePathNodeIds: ['node_l0_pii', 'node_l1_issuer', 'node_l2_intent', 'node_l3_guardrail', 'node_l4_fast_tier', 'node_l5_upi_rail'],
    },
    {
      id: 'scen_sbi_otp',
      title: 'SBI 3DS SMS OTP Delivery Timeout (High AOV)',
      bank: 'State Bank of India',
      method: 'card',
      errorCode: 'OTP_DELIVERY_TIMEOUT',
      amountINR: 8500,
      selectedRail: 'WhatsApp Interactive Pay',
      expectedTSR: 88.6,
      fastTierLatencyMs: 44,
      scenarioDescription: 'High AOV cart (>₹5,000) dropped due to telecom SMS OTP delivery blackout. Customer has verified WhatsApp presence. Neural path generates an interactive 1-click rescue template.',
      activePathNodeIds: ['node_l0_pii', 'node_l1_issuer', 'node_l2_intent', 'node_l3_guardrail', 'node_l4_bayesian_ai', 'node_l5_whatsapp_rail'],
    },
    {
      id: 'scen_icici_nsf',
      title: 'ICICI Recurring Mandate Insufficient Balance (NSF)',
      bank: 'ICICI Bank',
      method: 'nach/mandate',
      errorCode: 'INSUFFICIENT_FUNDS',
      amountINR: 1499,
      selectedRail: 'Adaptive Salary-Cycle Dunning',
      expectedTSR: 79.8,
      fastTierLatencyMs: 29,
      scenarioDescription: 'Month-end salary dry-run failure. Immediate repeated retries cause merchant bounce penalties. Neural path schedules smart dunning on the 1st of the upcoming month at 08:30 IST.',
      activePathNodeIds: ['node_l0_pii', 'node_l1_issuer', 'node_l2_intent', 'node_l3_guardrail', 'node_l4_fast_tier', 'node_l5_dunning_rail'],
    },
    {
      id: 'scen_axis_token',
      title: 'Axis Expired Card Token (COFT Cryptogram Error)',
      bank: 'Axis Bank',
      method: 'card',
      errorCode: 'TOKEN_EXPIRED',
      amountINR: 2999,
      selectedRail: 'Smart Multi-Acquirer Failover',
      expectedTSR: 84.1,
      fastTierLatencyMs: 41,
      scenarioDescription: 'Card token cryptogram validation failed on primary payment gateway switch. Secondary acquirer supports real-time token refresh with seamless 3DS re-authentication.',
      activePathNodeIds: ['node_l0_pii', 'node_l1_issuer', 'node_l2_intent', 'node_l3_guardrail', 'node_l4_fast_tier', 'node_l5_card_failover_rail'],
    },
  ];

  const [activeScenarioId, setActiveScenarioId] = useState<string>('scen_hdfc_504');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_l1_issuer');

  const activeScenario =
    PRESET_NEURAL_SCENARIOS.find((s) => s.id === activeScenarioId) || PRESET_NEURAL_SCENARIOS[0];

  // Neural DAG Layers and Nodes
  const NEURAL_DAG_LAYERS: { layer: number; title: string; nodes: NeuralNode[] }[] = [
    {
      layer: 0,
      title: 'Layer 0: Ingress & Tokenizer',
      nodes: [
        {
          id: 'node_l0_pii',
          layer: 0,
          layerName: 'Ingress & PII Masking',
          name: 'AST Regex Tokenizer',
          shortDesc: 'Strips PANs, CVVs, and masks PII with SHA-256 HMAC digest in sub-millisecond memory sandbox.',
          activationFunction: 'Boolean Mutex',
          weightVector: 'W₀ = [1.0 (Strict Security), 0.0 (Zero Exfiltration)]',
          latencyContributionMs: 0.8,
          confidenceScore: 100,
          status: 'ACTIVE',
          inputSignals: ['Raw Razorpay Webhook', 'HTTP Payload Signature', 'Idempotency Key'],
          outputDecision: 'Sanitized Telemetry Vector with Masked Metadata (PCI-DSS & RBI Zero-Storage Compliant)',
          mathematicalRationale: 'Deterministic AST pass with token-level entropy parsing ensures zero cardholder data leaves the ingress gateway.',
          color: 'blue',
        },
      ],
    },
    {
      layer: 1,
      title: 'Layer 1: Issuer Telemetry Vector',
      nodes: [
        {
          id: 'node_l1_issuer',
          layer: 1,
          layerName: 'Issuer Health Evaluation',
          name: 'Global Bank Outage Matrix',
          shortDesc: 'Queries real-time error vectors across 40+ Indian banks and NPCI PSP nodes.',
          activationFunction: 'Softmax',
          weightVector: 'W₁ = [0.42 (HDFC Downtime), 0.31 (p99 Latency Spike), 0.27 (Error Code 504)]',
          latencyContributionMs: 3.2,
          confidenceScore: 98.4,
          status: 'ACTIVE',
          inputSignals: ['Bank Code (HDFC/SBI/ICICI)', 'Error Step (Authentication)', 'Error Code (504/U19)'],
          outputDecision: 'Issuer Health Score: 12% (DEGRADED SWITCH). Bypassing core netbanking switch.',
          mathematicalRationale: 'Bayesian posterior probability P(Issuer_Outage | 504_Err, Latency > 2s) = 0.984.',
          color: 'purple',
        },
      ],
    },
    {
      layer: 2,
      title: 'Layer 2: Customer Intent Vector',
      nodes: [
        {
          id: 'node_l2_intent',
          layer: 2,
          layerName: 'Customer Intent Retention',
          name: 'Affinity & Dropout Tensor',
          shortDesc: 'Calculates customer purchase intent score from checkout dwell time, AOV, and app context.',
          activationFunction: 'Sigmoid',
          weightVector: 'W₂ = [0.55 (Cart Dwell Time < 60s), 0.25 (AOV Weight), 0.20 (Returning Customer)]',
          latencyContributionMs: 4.6,
          confidenceScore: 92.1,
          status: 'ACTIVE',
          inputSignals: ['Session Dwell Time', 'Order Amount (₹4,200)', 'Device User-Agent (Mobile Android)'],
          outputDecision: 'Intent Score: 0.92 (HIGH PURCHASE INTENT). Immediate real-time rescue recommended.',
          mathematicalRationale: 'Sigmoid activation σ(Σ wᵢ xᵢ + b) = 1 / (1 + e^-2.44) = 0.920.',
          color: 'indigo',
        },
      ],
    },
    {
      layer: 3,
      title: 'Layer 3: Policy & Redlock Guardrails',
      nodes: [
        {
          id: 'node_l3_guardrail',
          layer: 3,
          layerName: 'Policy & Mutex Guardrail',
          name: 'Redlock Mutex & Anti-Spam',
          shortDesc: 'Enforces distributed Redis lock, rate-limit check (120 RPM), and margin protection.',
          activationFunction: 'Boolean Mutex',
          weightVector: 'W₃ = [1.0 (Zero Double Charge), 1.0 (Anti-Spam Filter), 1.0 (Margin Compliant)]',
          latencyContributionMs: 1.4,
          confidenceScore: 100,
          status: 'ACTIVE',
          inputSignals: ['SHA-256 Mutex Key', 'Merchant Rate Limit Counter', 'Gross Margin Floor (>15%)'],
          outputDecision: 'Guardrail Passed: Zero Double Debit Lock Acquired (TTL 300s). Anti-Spam Cleared.',
          mathematicalRationale: 'Distributed lock acquired on quorum of Redis instances; guarantees at-most-once execution.',
          color: 'cyan',
        },
      ],
    },
    {
      layer: 4,
      title: 'Layer 4: Neural Inference Engine',
      nodes: [
        {
          id: 'node_l4_fast_tier',
          layer: 4,
          layerName: 'Inference Engine',
          name: 'Fast-Tier Rule Engine',
          shortDesc: 'Sub-50ms deterministic branch matching for known outages and instant UPI switches.',
          activationFunction: 'Softmax',
          weightVector: 'W₄a = [0.85 (Fast Branch UPI), 0.10 (Card Failover), 0.05 (Dunning)]',
          latencyContributionMs: 1.8,
          confidenceScore: 96.5,
          status: 'ACTIVE',
          inputSignals: ['Outage Score: 0.98', 'Intent Score: 0.92', 'Mobile User-Agent'],
          outputDecision: 'Fast-Tier Execution Triggered (Bypassed LLM cold-start, Latency: 38ms)',
          mathematicalRationale: 'High-confidence vector (confidence > 0.95) satisfies fast-tier SLA criteria.',
          color: 'emerald',
        },
        {
          id: 'node_l4_bayesian_ai',
          layer: 4,
          layerName: 'Inference Engine',
          name: 'Gemini 3.7 Flash Reasoner',
          shortDesc: 'Multi-modal root-cause synthesis for ambiguous edge cases and personalized copy generation.',
          activationFunction: 'Softmax',
          weightVector: 'W₄b = [0.70 (WhatsApp Personalized CTA), 0.20 (Discount Link), 0.10 (Manual)]',
          latencyContributionMs: 38.5,
          confidenceScore: 94.8,
          status: 'EVALUATED',
          inputSignals: ['Complex Telecom Error', 'High AOV (>₹5,000)', 'Multiple Failed Attempts'],
          outputDecision: 'Synthesized WhatsApp Interactive Card with Custom Incentive Paired with 1-Click Pay',
          mathematicalRationale: 'Generative reasoning selects personalized recovery channel with highest expected value.',
          color: 'purple',
        },
      ],
    },
    {
      layer: 5,
      title: 'Layer 5: Output Channel Dispatch',
      nodes: [
        {
          id: 'node_l5_upi_rail',
          layer: 5,
          layerName: 'Channel Execution',
          name: 'Dynamic 1-Tap UPI Intent',
          shortDesc: 'Generates direct NPCI deep-link opening GPay, PhonePe, or Paytm with zero friction.',
          activationFunction: 'Softmax',
          weightVector: 'Output Score: 0.942 (Selected Primary)',
          latencyContributionMs: 1.2,
          confidenceScore: 94.2,
          status: 'BRANCH_SELECTED',
          inputSignals: ['Fast-Tier UPI Rule', 'Customer Android Device', '₹0 MDR Margin'],
          outputDecision: 'DISPATCHED: upi://pay?pa=merchant@icici&am=4200&tr=order_stress_8109',
          mathematicalRationale: 'Maximizes TSR (94.2%) while minimizing transaction latency (1.2s settlement).',
          color: 'emerald',
        },
        {
          id: 'node_l5_whatsapp_rail',
          layer: 5,
          layerName: 'Channel Execution',
          name: 'WhatsApp Interactive Pay',
          shortDesc: 'Dispatches verified green-badge Meta WhatsApp business template with native Quick Pay button.',
          activationFunction: 'Softmax',
          weightVector: 'Output Score: 0.886',
          latencyContributionMs: 14.5,
          confidenceScore: 88.6,
          status: 'EVALUATED',
          inputSignals: ['High AOV Cart', 'WhatsApp Opt-In Verified', 'Telecom Drop'],
          outputDecision: 'DISPATCHED: WhatsApp Interactive Button Template to +919876543210',
          mathematicalRationale: 'High open rate (98%) and click-through on mobile devices for abandoned checkouts.',
          color: 'blue',
        },
        {
          id: 'node_l5_dunning_rail',
          layer: 5,
          layerName: 'Channel Execution',
          name: 'Adaptive Dunning Engine',
          shortDesc: 'Schedules auto-retries aligned with recurring salary credit schedules and card reset cycles.',
          activationFunction: 'Softmax',
          weightVector: 'Output Score: 0.798',
          latencyContributionMs: 2.1,
          confidenceScore: 79.8,
          status: 'EVALUATED',
          inputSignals: ['Mandate / NACH Decline', 'Insufficient Balance (NSF)', 'Month-End Timing'],
          outputDecision: 'SCHEDULED: Auto-Retry Queue for 1st of Month at 08:30 IST',
          mathematicalRationale: 'Prevents customer churn and merchant bounce penalty fees.',
          color: 'indigo',
        },
        {
          id: 'node_l5_card_failover_rail',
          layer: 5,
          layerName: 'Channel Execution',
          name: 'Smart Acquirer Failover',
          shortDesc: 'Switches secondary payment gateway and refreshes network token cryptogram seamlessly.',
          activationFunction: 'Softmax',
          weightVector: 'Output Score: 0.841',
          latencyContributionMs: 4.8,
          confidenceScore: 84.1,
          status: 'EVALUATED',
          inputSignals: ['Card Token Failure', 'Secondary Acquirer Healthy', 'Merchant Card Preference'],
          outputDecision: 'ROUTED: Secondary Acquirer Gateway with 3DSv2 Step-Up',
          mathematicalRationale: 'Reduces card abandonment by rerouting across alternative acquiring bank switches.',
          color: 'cyan',
        },
      ],
    },
  ];

  // Find all nodes in flat array
  const allNodes: NeuralNode[] = NEURAL_DAG_LAYERS.flatMap((l) => l.nodes);
  const selectedNode = allNodes.find((n) => n.id === selectedNodeId) || allNodes[1];

  return (
    <div id="neural-decision-path-view" className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Neural Rail Decision DAG &amp; Inference Inspector
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 font-bold">
                6-Layer Deep DAG
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualize how RecoverAI evaluates bank telemetry vectors, customer intent tensors, and Redlock safety rules to dispatch optimal recovery rails in &lt;50ms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400">Total Decision Latency</div>
            <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
              {activeScenario.fastTierLatencyMs}ms <span className="text-xs text-slate-400 font-normal">Fast-Tier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Scenario Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider font-mono">
          Select Failure Scenario to Propagate Neural Path:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_NEURAL_SCENARIOS.map((scen) => {
            const isSelected = scen.id === activeScenarioId;
            return (
              <button
                key={scen.id}
                onClick={() => setActiveScenarioId(scen.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{scen.bank}</span>
                  <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                    {scen.expectedTSR}% TSR
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 font-semibold truncate">
                  {scen.title}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ₹{scen.amountINR.toLocaleString('en-IN')} &bull; {scen.errorCode}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Scenario Overview Description */}
        <div className="mt-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl flex items-start gap-2.5 text-xs">
          <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
          <div className="text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">Active Neural Routing Rationale: </strong>
            {activeScenario.scenarioDescription}
          </div>
        </div>
      </div>

      {/* Main Multi-Layer Neural Graph Visualizer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Multi-Layer DAG Execution Pipeline</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any node below to inspect mathematical weights &amp; activation tensors
          </span>
        </div>

        {/* Horizontal Layered Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
          {NEURAL_DAG_LAYERS.map((layerObj) => (
            <div key={layerObj.layer} className="space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 text-center pb-1 border-b border-slate-100 dark:border-slate-800">
                {layerObj.title.split(':')[0]}
              </div>

              <div className="space-y-2">
                {layerObj.nodes.map((node) => {
                  const isNodeInActivePath = activeScenario.activePathNodeIds.includes(node.id);
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/60 border-purple-500 shadow-md'
                          : isNodeInActivePath
                          ? 'bg-slate-50 dark:bg-slate-950 border-emerald-500/60 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                            {node.activationFunction}
                          </span>
                          {isNodeInActivePath && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mt-1">
                          {node.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
                          {node.shortDesc}
                        </p>
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">{node.latencyContributionMs}ms</span>
                        <span
                          className={`font-bold ${
                            isNodeInActivePath ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {node.confidenceScore}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Node Deep Inspector Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Node Inspector: <span className="text-purple-600 dark:text-purple-400">{selectedNode.name}</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {selectedNode.layerName} &bull; Latency Footprint: {selectedNode.latencyContributionMs}ms
              </span>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
            Activation: {selectedNode.activationFunction}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card 1: Input Signals Vector */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
              Input Signals Vector (X)
            </span>
            <ul className="space-y-1.5">
              {selectedNode.inputSignals.map((sig, idx) => (
                <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span className="font-mono text-[11px]">{sig}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Mathematical Weights & Formula */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
              Mathematical Weight Tensor &amp; Formula
            </span>
            <div className="font-mono text-[11px] text-purple-600 dark:text-purple-300 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              {selectedNode.weightVector}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              {selectedNode.mathematicalRationale}
            </p>
          </div>

          {/* Card 3: Output State Decision */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
              Activated Output Decision (Y)
            </span>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 leading-snug">
              {selectedNode.outputDecision}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
              <span>Decision Confidence:</span>
              <strong className="font-mono text-emerald-500">{selectedNode.confidenceScore}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
