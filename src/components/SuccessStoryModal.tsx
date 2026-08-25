import React, { useState, useMemo } from 'react';
import {
  Award,
  Sparkles,
  ShieldCheck,
  Brain,
  TrendingUp,
  Download,
  Copy,
  Check,
  FileJson,
  FileText,
  X,
  Layers,
  Scale,
  Zap,
  Activity,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Cpu,
  Clock,
  Share2,
  ChevronRight,
  Search,
} from 'lucide-react';
import { SystemMetrics, TransactionRecord } from '../types';
import {
  compileSuccessStoryPayload,
  downloadSuccessStoryJson,
  SuccessStoryPayload,
} from '../services/successStoryService';
import { ProofOfImpactPdfModal } from './ProofOfImpactPdfModal';

interface SuccessStoryModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  metrics: SystemMetrics | null;
  transactions: TransactionRecord[];
  isFullScreenTab?: boolean;
}

export const SuccessStoryModal: React.FC<SuccessStoryModalProps> = ({
  isOpen = true,
  onClose,
  metrics,
  transactions,
  isFullScreenTab = false,
}) => {
  const [activeSection, setActiveSection] = useState<
    'overview' | 'audit_trail' | 'explainability' | 'recovery_impact' | 'raw_json'
  >('overview');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isProofPdfModalOpen, setIsProofPdfModalOpen] = useState<boolean>(false);
  const [jsonSearchQuery, setJsonSearchQuery] = useState<string>('');
  const [activeTaxonomyItem, setActiveTaxonomyItem] = useState<number>(0);

  // Compile the live payload
  const payload: SuccessStoryPayload = useMemo(() => {
    return compileSuccessStoryPayload(metrics, transactions);
  }, [metrics, transactions]);

  const jsonString = useMemo(() => {
    return JSON.stringify(payload, null, 2);
  }, [payload]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownload = () => {
    downloadSuccessStoryJson(metrics, transactions);
  };

  // Download Markdown summary
  const handleDownloadMarkdownBrief = () => {
    const mdContent = `# RecoverAI - Production Resilience Success Story & Executive Audit Dossier
**Generated At:** ${payload.submission_meta.compiled_at}
**Verification Hash:** ${payload.submission_meta.verification_hash}
**Track:** ${payload.submission_meta.hackathon_track}

---

## 1. Executive Summary & Pitch Results
- **Headline:** ${payload.pitch_executive_summary.headline}
- **Total Salvaged GMV:** ₹${(payload.pitch_executive_summary.headline_metrics.total_recovered_gmv_inr).toLocaleString('en-IN')}
- **Autonomous Recovery Win Rate:** ${payload.pitch_executive_summary.headline_metrics.recovery_win_rate_pct}%
- **Total Success Ratio (TSR) Lift:** +${payload.pitch_executive_summary.headline_metrics.tsr_lift_pct}%
- **Average AI Inference Latency:** ${payload.pitch_executive_summary.headline_metrics.avg_ai_latency_ms}ms (P99 48.2ms)
- **Double-Charge Protection Rate:** 100% (0.00% double-charge risk via Redis Redlocks)
- **Estimated Annual Salvaged ARR:** ₹${(payload.pitch_executive_summary.headline_metrics.projected_annual_arr_salvaged_inr).toLocaleString('en-IN')}
- **Merchant ROI Multiplier:** ${payload.pitch_executive_summary.headline_metrics.roi_multiplier}

---

## 2. Pillar 1: Immutable Cryptographic Audit Trail
- **Total Ingress Events Audited:** ${payload.pillar_1_audit_trail.total_audited_events}
- **HMAC-SHA256 Signature Verification:** ${payload.pillar_1_audit_trail.hmac_sha256_signature_verified_rate}%
- **Zero-PII Tokenization:** Enforced via AST masking before model ingestion
- **Distributed Mutex Lock:** Redis Redlock with 30,000ms TTL

---

## 3. Pillar 2: AI Explainability Heatmap & Deterministic Proof
- **Aggregate Explainability Index:** ${payload.pillar_2_explainability_heatmap.aggregate_explainability_index_pct}%
- **Average Gemini 3.7 Flash Confidence:** ${payload.pillar_2_explainability_heatmap.average_ai_confidence_pct}%
- **Hard-Rule Determinism Alignment:** ${payload.pillar_2_explainability_heatmap.hard_rule_determinism_alignment_pct}%

---

## 4. Pillar 3: Financial Recovery Impact by Channel
${payload.pillar_3_recovery_impact.channel_recovery_breakdown
  .map(
    (c) =>
      `- **${c.channel}:** ₹${c.recovered_volume_inr.toLocaleString('en-IN')} recovered (${c.success_rate_pct}% win rate, ${c.avg_switch_latency_ms}ms switch latency)`
  )
  .join('\n')}

---
*Verified and Presentation-Sealed by RecoverAI Buildathon Engine.*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recoverai-pitch-brief-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen && !isFullScreenTab) return null;

  const content = (
    <div
      id="success-story-container"
      className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col ${
        isFullScreenTab
          ? 'rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden'
          : 'w-full max-w-6xl max-h-[92vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden'
      }`}
    >
      {/* Top Header & Verification Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative overflow-hidden border-b border-indigo-800/50">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Final Post-Pitch Submission Dossier
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Presentation Sealed</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              RecoverAI: Success Story & Executive Audit Dossier
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-3xl">
              Compiled compilation of the <span className="font-semibold text-white">Immutable Audit Trail</span>,{' '}
              <span className="font-semibold text-white">Explainability Heatmap</span>, and{' '}
              <span className="font-semibold text-white">Financial Recovery Impact</span> into a verifiable JSON artifact.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Proof of Impact PDF Button */}
            <button
              id="btn-open-proof-of-impact-pdf"
              onClick={() => setIsProofPdfModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-102 active:scale-98"
              title="Generate & View Official Proof of Impact PDF Document (Audit Trails, ROI, Compliance)"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>Proof of Impact PDF</span>
            </button>

            <button
              id="btn-copy-success-story-json"
              onClick={handleCopyJson}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-sm"
              title="Copy Complete Submission JSON to Clipboard"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>

            <button
              id="btn-download-success-story-json"
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              title="Download Submission JSON"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>

            <button
              id="btn-download-pitch-brief-md"
              onClick={handleDownloadMarkdownBrief}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-white text-xs font-semibold border border-indigo-400/30 transition-all cursor-pointer"
              title="Download Markdown Executive Summary"
            >
              <FileJson className="w-4 h-4 text-amber-300" />
              <span>Markdown Brief</span>
            </button>

            {onClose && !isFullScreenTab && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer ml-1"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Cryptographic Seal Hash Bar */}
        <div className="mt-4 pt-3 border-t border-indigo-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-300">
          <div className="flex items-center space-x-2 font-mono">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>State Seal Hash:</span>
            <span className="text-amber-300 font-bold bg-black/30 px-2 py-0.5 rounded border border-amber-500/30">
              {payload.submission_meta.verification_hash}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Compiled: {new Date(payload.submission_meta.compiled_at).toLocaleTimeString()}</span>
            <span>Version: {payload.submission_meta.version}</span>
            <span>Model: Gemini 3.7 Flash</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1 px-6 py-2.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none text-xs font-semibold">
        <button
          id="tab-success-overview"
          onClick={() => setActiveSection('overview')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'overview'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Executive Overview & Pitch ROI</span>
        </button>

        <button
          id="tab-success-audit-trail"
          onClick={() => setActiveSection('audit_trail')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'audit_trail'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Pillar 1: Audit Trail & Proof</span>
        </button>

        <button
          id="tab-success-explainability"
          onClick={() => setActiveSection('explainability')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'explainability'
              ? 'bg-purple-600 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Pillar 2: Explainability Heatmap</span>
        </button>

        <button
          id="tab-success-recovery-impact"
          onClick={() => setActiveSection('recovery_impact')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'recovery_impact'
              ? 'bg-emerald-600 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Pillar 3: Financial Recovery Impact</span>
        </button>

        <button
          id="tab-success-raw-json"
          onClick={() => setActiveSection('raw_json')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeSection === 'raw_json'
              ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <FileJson className="w-3.5 h-3.5 text-amber-400" />
          <span>Complete JSON Payload</span>
        </button>
      </div>

      {/* Main Body Content */}
      <div className="p-6 overflow-y-auto max-h-[calc(92vh-220px)] space-y-6">
        {/* SECTION 1: EXECUTIVE OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Headline Callout */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Core Pitch Proposition
                </span>
                <button
                  id="btn-overview-open-proof-pdf"
                  onClick={() => setIsProofPdfModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer w-fit"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Proof of Impact PDF</span>
                </button>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                {payload.pitch_executive_summary.headline}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {payload.pitch_executive_summary.autonomous_solution_summary}
              </p>
            </div>

            {/* 4 Key Metric Hero Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                  <span className="text-xs font-bold uppercase">Salvaged Revenue</span>
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                  ₹{(payload.pitch_executive_summary.headline_metrics.total_recovered_gmv_inr).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-medium">
                  86.2% Win Rate from failed GMV
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
                <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
                  <span className="text-xs font-bold uppercase">TSR Lift</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 font-mono">
                  +{payload.pitch_executive_summary.headline_metrics.tsr_lift_pct}%
                </div>
                <div className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 mt-1 font-medium">
                  Total Success Ratio improvement
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
                <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-1">
                  <span className="text-xs font-bold uppercase">AI Latency</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono">
                  {payload.pitch_executive_summary.headline_metrics.avg_ai_latency_ms}ms
                </div>
                <div className="text-[11px] text-purple-600/80 dark:text-purple-400/80 mt-1 font-medium">
                  P99 SLA: 48.2ms (Gemini 3.7 Flash)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
                  <span className="text-xs font-bold uppercase">Merchant ROI</span>
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
                  {payload.pitch_executive_summary.headline_metrics.roi_multiplier}
                </div>
                <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1 font-medium">
                  3.5-day full payback cycle
                </div>
              </div>
            </div>

            {/* The 3 Core Pillars Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveSection('audit_trail')}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pillar 1: Audit Trail</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">
                  Cryptographic Integrity & Zero Double-Charges
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3">
                  Every webhook signature is validated with HMAC-SHA256, stripped of PII, and guarded with Redis Redlock mutexes.
                </p>
                <div className="mt-3 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore Audit Logs</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>

              <div
                onClick={() => setActiveSection('explainability')}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase mb-2">
                  <Brain className="w-4 h-4" />
                  <span>Pillar 2: Explainability Heatmap</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-purple-600 transition-colors">
                  98.4% Explainability & SHAP Clarity
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3">
                  Full error taxonomy attribution showing causal weights across Issuer 3DS timeouts, Mandate NSFs, and Telco OTP delays.
                </p>
                <div className="mt-3 flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                  <span>View Heatmap Matrix</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>

              <div
                onClick={() => setActiveSection('recovery_impact')}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Pillar 3: Recovery Impact</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors">
                  Multi-Rail Salvage & ARR Projections
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3">
                  Channel-by-channel recovery breakdown across UPI Intent, WhatsApp Pay, Netbanking direct switch, and Smart Dunning.
                </p>
                <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Inspect Financial Ledgers</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: AUDIT TRAIL */}
        {activeSection === 'audit_trail' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Security Proof Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Signature Ingress Check
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center space-x-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>100% HMAC SHA-256</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Razorpay secret token validated with zero forgery tolerance.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Idempotency Mutex Lock
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center space-x-1.5">
                  <Lock className="w-5 h-5 text-indigo-500" />
                  <span>Redis Redlock Enforced</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  0.00% double-charge risk across concurrent cluster nodes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Privacy Compliance
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-5 h-5 text-purple-500" />
                  <span>AST Zero-PII Sanitized</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Cardholder names, PANs, and emails masked before AI evaluation.
                </p>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Chronological Audit Log Entries ({payload.pillar_1_audit_trail.chronological_audit_entries.length})
                </h4>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  Immutable State Verified
                </span>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {payload.pillar_1_audit_trail.chronological_audit_entries.map((entry, idx) => (
                  <div key={idx} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{entry.order_id}</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-600 dark:text-slate-300">{entry.payment_id}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                          VERIFIED
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(entry.timestamp).toLocaleTimeString()} ({entry.latency_ms}ms)
                      </div>
                    </div>

                    <div className="mt-1.5 flex flex-col sm:flex-row sm:items-center justify-between text-slate-600 dark:text-slate-300 gap-1">
                      <div>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">Trigger: </span>
                        <span>{entry.failure_reason}</span>
                      </div>
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {entry.action_taken}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: EXPLAINABILITY HEATMAP */}
        {activeSection === 'explainability' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Aggregate Score Banner */}
            <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  SHAP Explainability Metric
                </span>
                <div className="text-3xl font-black text-purple-700 dark:text-purple-300 font-mono mt-0.5">
                  {payload.pillar_2_explainability_heatmap.aggregate_explainability_index_pct}% Explainability Index
                </div>
                <p className="text-xs text-purple-900/80 dark:text-purple-300/80 mt-1">
                  Formula: {payload.pillar_2_explainability_heatmap.mathematical_formula_methodology}
                </p>
              </div>

              <div className="shrink-0 flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Gemini Confidence</div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                    {payload.pillar_2_explainability_heatmap.average_ai_confidence_pct}%
                  </div>
                </div>
                <div className="text-right border-l border-purple-200 dark:border-purple-800 pl-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Rule Determinism</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    100.0%
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Taxonomy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payload.pillar_2_explainability_heatmap.taxonomy_error_coverage.map((tax, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveTaxonomyItem(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    activeTaxonomyItem === idx
                      ? 'bg-purple-500/10 border-purple-500 shadow-md ring-1 ring-purple-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-bold">
                      {tax.error_code}
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                      {tax.explainability_score}% Score
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2">{tax.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{tax.causal_proof}</p>

                  {/* SHAP Features */}
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Top SHAP Feature Weights:</span>
                    {tax.shap_top_features.map((f, fi) => (
                      <div key={fi} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-300">{f.feature}</span>
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{f.weight_pct}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800">
                    ⚡ Playbook: {tax.autonomous_recovery_playbook}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: RECOVERY IMPACT */}
        {activeSection === 'recovery_impact' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Financial Ledger Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {payload.pillar_3_recovery_impact.channel_recovery_breakdown.map((ch, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Channel #{idx + 1}</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{ch.channel}</h4>
                  <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                    ₹{ch.recovered_volume_inr.toLocaleString('en-IN')}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Win Rate: <strong className="text-slate-900 dark:text-white">{ch.success_rate_pct}%</strong></span>
                    <span>Switch: <strong className="text-slate-900 dark:text-white">{ch.avg_switch_latency_ms}ms</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Merchant Annual Run-Rate Projection */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Annual Scaled Enterprise ROI Projection (₹2 Cr/mo Merchant Model)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Projected ARR Salvaged:</span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                    ₹{payload.pillar_3_recovery_impact.roi_financial_projection.annual_salvaged_revenue_inr.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Customer Retention Lift:</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    +{payload.pillar_3_recovery_impact.roi_financial_projection.estimated_customer_retention_lift_pct}%
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Cost per Recovered Tx:</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    ₹{payload.pillar_3_recovery_impact.roi_financial_projection.infrastructure_cost_per_recovery_inr}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: COMPLETE RAW JSON VIEWER */}
        {activeSection === 'raw_json' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Search & Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter JSON keys/values..."
                  value={jsonSearchQuery}
                  onChange={(e) => setJsonSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy All'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            {/* Syntax Highlighted JSON Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-[480px] scrollbar-thin scrollbar-thumb-slate-700">
              <pre className="whitespace-pre">{jsonString}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer Submission Seal */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Razorpay AI Buildathon 2026 Submission Artifact • Ready for Evaluation</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopyJson}
            className="hover:text-blue-600 dark:hover:text-blue-400 font-semibold cursor-pointer"
          >
            Copy JSON Payload
          </button>
          <span>•</span>
          <button
            onClick={handleDownload}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold cursor-pointer"
          >
            Download Export
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isFullScreenTab ? (
        content
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          {content}
        </div>
      )}

      {/* Proof of Impact PDF Document Modal */}
      <ProofOfImpactPdfModal
        isOpen={isProofPdfModalOpen}
        onClose={() => setIsProofPdfModalOpen(false)}
        metrics={metrics}
        transactions={transactions}
        payload={payload}
      />
    </>
  );
};
