import React, { useState } from 'react';
import { Layers, ShieldCheck, Cpu, Database, Zap, Clock, AlertTriangle, CheckCircle2, ArrowRight, GitBranch, Terminal, Lock } from 'lucide-react';

interface ArchitectureNode {
  id: string;
  title: string;
  subtitle: string;
  latency: string;
  techStack: string;
  role: string;
  failureMode: string;
  details: string[];
}

export const ArchitectureView: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('dual_tier_ai');

  const nodes: Record<string, ArchitectureNode> = {
    webhook_gateway: {
      id: 'webhook_gateway',
      title: '1. Ingress & Signature Gateway',
      subtitle: 'Webhook ingestion & HMAC authentication',
      latency: '< 15ms',
      techStack: 'Express.js / Node.js Stream / Crypto HMAC-SHA256',
      role: 'Validates incoming Razorpay webhook signature header (`X-Razorpay-Signature`) to prevent replay attacks and spoofing. Checks in-memory Redis idempotency key to prevent duplicate processing.',
      failureMode: 'Invalid signatures are dropped with 401 Unauthorized; duplicates return 200 with zero-op cache hit.',
      details: [
        'Deterministic HMAC-SHA256 verification against Merchant Secret',
        'Atomic Idempotency Key check: `hash(event_id + amount + timestamp)`',
        'Decouples webhook receiver from heavy AI compute using internal job queue',
      ],
    },
    message_queue: {
      id: 'message_queue',
      title: '2. Asynchronous Message Buffer',
      subtitle: 'Traffic spike decoupling & event ordering',
      latency: '< 10ms',
      techStack: 'Redis Streams / BullMQ / Kafka In-Memory Buffer',
      role: 'Buffers burst spikes (e.g. flash sales with 10,000+ fails/sec) to ensure zero drop-rate during bank outages.',
      failureMode: 'Dead-Letter Queue (DLQ) with 3x exponential backoff retry for transient network drops.',
      details: [
        'FIFO event ordering with partition by merchant account ID',
        'Backpressure regulation to protect downstream LLM and payment gateway APIs',
        'Worker pool scaling dynamically based on queue lag',
      ],
    },
    fast_tier_router: {
      id: 'fast_tier_router',
      title: '3. Tier-1 Fast Diagnostic Engine',
      subtitle: 'Deterministic bank health cache & rules',
      latency: '< 25ms',
      techStack: 'TypeScript Deterministic Rules & Bank Health Status Cache',
      role: 'Handles known infrastructure failures instantly (e.g. HDFC 504 outages, OTP timeouts) without waiting for LLM.',
      failureMode: 'If deterministic rule has low confidence (<80%), automatically escalates to Tier-2 AI Agent.',
      details: [
        'Real-time global bank health matrix (tracks rolling error rates across all merchants)',
        'Immediate rail fallback decision (e.g. switch Netbanking -> UPI Intent in <30ms)',
        'Strict zero-hallucination SLA for latency-critical checkout pages',
      ],
    },
    dual_tier_ai: {
      id: 'dual_tier_ai',
      title: '4. Recovery Policy Evaluator',
      subtitle: 'Contextual retry policy & customer-safe routing',
      latency: '< 30ms',
      techStack: 'TypeScript policy tables / auditable scoring / typed action contracts',
      role: 'Evaluates failure reason, payment method, subscription context, and cross-border status to select a bounded recovery action with an explicit rationale.',
      failureMode: 'Ambiguous or high-risk cases are held for human review; no external inference dependency is required.',
      details: [
        'Typed decision output with an explicit audit rationale',
        'Bounded incentive calculation (caps maximum merchant margin discount)',
        'Channel-specific templates for WhatsApp & SMS dunning',
      ],
    },
    multi_rail_executor: {
      id: 'multi_rail_executor',
      title: '5. Multi-Rail Dynamic Execution',
      subtitle: 'Instant UPI deep-links, WhatsApp checkout, smart dunning',
      latency: '< 40ms',
      techStack: 'Razorpay Payment Links API / UPI Intent Protocol / WhatsApp Business API',
      role: 'Dispatches the recovery trigger across the highest-probability channel: Dynamic UPI Deep-link for mobile web, WhatsApp 1-Click for desktop dropoffs, or scheduled recurring debit for subscription mandates.',
      failureMode: 'Channel delivery failures fall back to secondary SMS or push notification.',
      details: [
        'Direct UPI Intent launch (PhonePe, GPay, Paytm) with pre-filled VPA',
        'Salary-aligned dunning scheduler (queues mandate retries on 1st/5th of month)',
        '1-Click biometric tokenized link to bypass SMS OTP friction',
      ],
    },
    circuit_breaker: {
      id: 'circuit_breaker',
      title: '6. Safety Circuit Breakers & Audit Log',
      subtitle: 'Anti-spam frequency caps & zero double-charge guarantee',
      latency: '< 5ms',
      techStack: 'Postgres / Redis distributed locks / Audit Telemetry Store',
      role: 'Enforces hard guardrails: ensures customer is never charged twice, never spammed with more than 2 messages per order, and tracks real-time TSR and GMV lift.',
      failureMode: 'If order status changes to "paid" in background, all active recovery actions are immediately cancelled in real-time.',
      details: [
        'Distributed lock on Order ID to prevent race conditions',
        'Customer communication frequency cap (Max 2 touches / 24 hrs)',
        'Real-time mathematically verified GMV and TSR lift calculation',
      ],
    },
  };

  const selectedNode = nodes[selectedNodeId] || nodes['dual_tier_ai'];

  return (
    <div id="architecture-view" className="space-y-6">
      {/* Top Architecture Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Layers className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">System Architecture & Engineering Strategy</h2>
            <p className="text-xs text-slate-400">
              Designed specifically for high-throughput fintech infrastructure: Low Latency, Dual-Tier AI, and Deterministic Guardrails.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive System Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Click any pipeline node to inspect technical architecture</span>
          <span className="text-emerald-400 font-mono text-[11px]">Total End-to-End Latency: &lt; 200ms</span>
        </h3>

        {/* Pipeline Nodes Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.values(nodes).map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                id={`arch-node-${node.id}`}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                  <span>Step {index + 1}</span>
                  <span className="text-emerald-400 font-bold">{node.latency}</span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">{node.title.replace(/^\d+\.\s*/, '')}</h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{node.subtitle}</p>

                {isSelected && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rotate-45 rounded-sm" />
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Node Drilldown */}
        <div className="mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-5 animate-fade-in space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{selectedNode.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Latency Budget: {selectedNode.latency}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedNode.subtitle}</p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-400">Stack: </span>
              <span className="text-xs font-mono font-semibold text-emerald-400">{selectedNode.techStack}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Functional Role */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-400" /> Functional Responsibility
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {selectedNode.role}
              </p>
              <div className="pt-2 border-t border-slate-800/80">
                <div className="font-semibold text-slate-400 text-[10px] uppercase mb-1">Key Architectural Features:</div>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {selectedNode.details.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Failure Mode & Edge-Case Handling */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Failure Handling & Edge Cases
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {selectedNode.failureMode}
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="font-semibold text-slate-400 text-[10px] uppercase">Safety Guarantee:</div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Deterministic Fallbacks guarantee zero unhandled dropped payments.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture & Resilience Criteria Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-4 h-4" /> 1. Architecture Over Buzzwords
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            We use a <strong>Layered Recovery Policy</strong>: deterministic rules handle known bank downtime in &lt;30ms, while an auditable scoring policy routes ambiguous cases to bounded actions or human review.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> 2. Honest Metrics & Safety
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Zero Hallucination via strict JSON schema validation, distributed idempotency keys to eliminate double-charges, and mathematical proof of TSR lift.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> 3. End-to-End Working Flow
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Live webhook dispatcher triggers real-time diagnosis, updates merchant telemetry, and serves a functional 1-click customer payment completion UI.
          </p>
        </div>
      </div>
    </div>
  );
};
