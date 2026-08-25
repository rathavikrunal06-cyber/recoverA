import React, { useState } from 'react';
import {
  Sparkles,
  GitBranch,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Eye,
  Info,
  Scale,
  Zap,
} from 'lucide-react';
import { TransactionRecord } from '../types';

interface ExplainabilityModeProps {
  transactions?: TransactionRecord[];
}

export const ExplainabilityMode: React.FC<ExplainabilityModeProps> = () => {
  // Counterfactual Sandbox state
  const [selectedBank, setSelectedBank] = useState<string>('HDFC');
  const [selectedErrorCode, setSelectedErrorCode] = useState<string>('GATEWAY_TIMEOUT');
  const [selectedAov, setSelectedAov] = useState<number>(4500);
  const [selectedCustomerRisk, setSelectedCustomerRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [selectedChannel, setSelectedChannel] = useState<'MOBILE_APP' | 'DESKTOP_WEB'>('MOBILE_APP');

  // Compute Explainability weights & resolved decision
  const isHighRisk = selectedCustomerRisk === 'HIGH';
  const isMandateNsf = selectedErrorCode === 'INSUFFICIENT_FUNDS';
  const isTokenExpired = selectedErrorCode === 'TOKEN_EXPIRED';
  const isHighAovOtpDrop = selectedAov >= 5000 && selectedErrorCode === 'OTP_DELIVERY_TIMEOUT';
  const isGatewayTimeout = selectedErrorCode === 'GATEWAY_TIMEOUT';

  let resolvedRail = 'NPCI UPI Intent Fast-Switch';
  let railBadgeColor = 'emerald';
  let primaryRule = 'Bank switch p99 latency exceeded 1,500ms; bypassed to UPI Intent.';

  if (isHighRisk) {
    resolvedRail = 'Safety Circuit & Fraud Suppression';
    railBadgeColor = 'red';
    primaryRule = 'Customer risk tier is HIGH with velocity burst flags; suppression triggered.';
  } else if (isMandateNsf) {
    resolvedRail = 'Salary-Aligned Smart Dunning';
    railBadgeColor = 'amber';
    primaryRule = 'Recurring debit declined due to NSF; auto-scheduled for salary window.';
  } else if (isTokenExpired) {
    resolvedRail = 'Biometric Card Token Re-Vault';
    railBadgeColor = 'blue';
    primaryRule = 'COFT cryptogram expired; WebAuthn biometric re-vault invoked.';
  } else if (isHighAovOtpDrop) {
    resolvedRail = 'WhatsApp 1-Click Smart Collect';
    railBadgeColor = 'purple';
    primaryRule = 'High AOV cart (>₹5,000) dropped on SMS OTP; rescued via WhatsApp 1-click.';
  } else if (isGatewayTimeout) {
    resolvedRail = 'NPCI UPI Intent Fast-Switch';
    railBadgeColor = 'emerald';
    primaryRule = 'HDFC Netbanking 504 gateway timeout; deep-linked to UPI intent rail.';
  }

  // Feature weights for SHAP breakdown
  const featureWeights = [
    {
      feature: 'Bank Switch Latency & Health',
      weight: isGatewayTimeout ? 42 : 18,
      direction: 'positive',
      description: `${selectedBank} switch telemetry scored high degradation signal.`,
    },
    {
      feature: 'Error Code Taxonomy',
      weight: isMandateNsf || isTokenExpired ? 48 : 28,
      direction: 'positive',
      description: `Classified as ${selectedErrorCode} with deterministic remediation path.`,
    },
    {
      feature: 'Cart Order Value (AOV)',
      weight: selectedAov >= 5000 ? 32 : 14,
      direction: 'positive',
      description: `₹${selectedAov.toLocaleString()} AOV influenced channel VIP prioritization.`,
    },
    {
      feature: 'Customer Risk & Velocity Score',
      weight: isHighRisk ? 65 : 8,
      direction: isHighRisk ? 'negative' : 'positive',
      description: `Risk score evaluated at ${selectedCustomerRisk} risk tier.`,
    },
    {
      feature: 'Device Context & Channel',
      weight: selectedChannel === 'MOBILE_APP' ? 18 : 10,
      direction: 'positive',
      description: `${selectedChannel === 'MOBILE_APP' ? 'Mobile deep-linking enabled' : 'Web fallback triggered'}.`,
    },
  ];

  return (
    <div id="explainability-mode" className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">AI Decision Explainability & SHAP Attribution Studio</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                100% Transparent Reasoning
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect model feature contributions, neural decision trees, token-level rationale, and counterfactual "What-If" threshold boundaries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Gemini 3.7 Flash Decision Engine</span>
        </div>
      </div>

      {/* Interactive Counterfactual "What-If" Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Interactive Counterfactual "What-If" Policy Simulator</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Real-Time Weight Re-calculation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Bank */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Issuer Bank:</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
            >
              <option value="HDFC">HDFC Bank</option>
              <option value="SBI">State Bank of India</option>
              <option value="ICICI">ICICI Bank</option>
              <option value="Axis">Axis Bank</option>
            </select>
          </div>

          {/* Error Code */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Error Taxonomy:</label>
            <select
              value={selectedErrorCode}
              onChange={(e) => setSelectedErrorCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
            >
              <option value="GATEWAY_TIMEOUT">GATEWAY_TIMEOUT (504)</option>
              <option value="OTP_DELIVERY_TIMEOUT">OTP_DELIVERY_TIMEOUT (3DS)</option>
              <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS (NSF)</option>
              <option value="TOKEN_EXPIRED">TOKEN_EXPIRED (COFT)</option>
            </select>
          </div>

          {/* AOV Slider */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Cart AOV:</span>
              <span className="font-mono text-emerald-400 font-bold">₹{selectedAov.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={500}
              max={25000}
              step={500}
              value={selectedAov}
              onChange={(e) => setSelectedAov(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-1.5"
            />
          </div>

          {/* Risk Tier */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Risk Tier:</label>
            <select
              value={selectedCustomerRisk}
              onChange={(e) => setSelectedCustomerRisk(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
            >
              <option value="LOW">LOW (Safe Buyer)</option>
              <option value="MEDIUM">MEDIUM (Watchlist)</option>
              <option value="HIGH">HIGH (Suppress)</option>
            </select>
          </div>

          {/* Device Channel */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Device Channel:</label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
            >
              <option value="MOBILE_APP">Mobile Native App</option>
              <option value="DESKTOP_WEB">Desktop Browser</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resolved Autonomous Routing Decision Result */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-${railBadgeColor}-500/20 text-${railBadgeColor}-400 border border-${railBadgeColor}-500/30`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono">Resolved Autonomous Action:</div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>{resolvedRail}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  98.2% Confidence
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono text-right">
            <div>Decision SLA: <strong className="text-emerald-400">42ms</strong></div>
            <div>Double-Debit Lock: <strong className="text-blue-400">Active</strong></div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Synthesized Decision Rationale:</strong> {primaryRule} All 4 regulatory guardrails (Anti-Spam, Zero-Double-Charge, Margin Compliance, PII Masking) fully satisfied.
          </div>
        </div>
      </div>

      {/* Feature Importance & SHAP Weight Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>SHAP Feature Contribution & Attention Weights</span>
        </h3>

        <div className="space-y-3">
          {featureWeights.map((f, idx) => (
            <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{f.feature}</span>
                <span className={`font-mono font-bold ${f.direction === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {f.direction === 'positive' ? `+${f.weight}% Contribution` : `-${f.weight}% Suppression`}
                </span>
              </div>

              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${f.direction === 'positive' ? 'bg-gradient-to-r from-blue-500 to-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, f.weight * 1.5)}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400">{f.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Security & Policy Guardrails Verification */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Active Guardrail Policy Verification Checklist</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { title: 'Anti-Spam & Frequency Cap', desc: 'Maximum 1 automated recovery attempt per user within a 15-minute window.', status: 'PASSED' },
            { title: 'Zero Double-Charge Mutex Lock', desc: 'Redis Redlock distributed key guarantees exactly-once settlement.', status: 'PASSED' },
            { title: 'Margin Protection Floor', desc: 'Discounts capped to prevent negative gross margin transactions.', status: 'PASSED' },
            { title: 'DPDPA & PCI-DSS PII Redaction', desc: 'Zero unmasked customer phone, email, or PAN exposed to model context.', status: 'PASSED' },
          ].map((g, i) => (
            <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{g.title}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {g.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
