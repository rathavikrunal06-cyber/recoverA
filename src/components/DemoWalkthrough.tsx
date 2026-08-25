import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Play,
  Layers,
  Activity,
  Smartphone,
  Gauge,
  FileText,
  DollarSign,
  Shield,
  HelpCircle,
  Clock,
} from 'lucide-react';

interface DemoWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
  onTriggerSimulation: (preset: 'hdfc_timeout' | 'otp_drop' | 'insufficient_funds' | 'upi_timeout') => Promise<void>;
  onTriggerSpike: () => Promise<void>;
}

export const DemoWalkthrough: React.FC<DemoWalkthroughProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onTriggerSimulation,
  onTriggerSpike,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const steps = [
    {
      id: 'step_ingress',
      title: '1. Ingress & Dual-Tier AI Root Cause Analysis',
      subtitle: 'Webhook Ingestion & Gemini 3.7 Flash Sub-Second Diagnosis',
      badge: 'Core Intelligence',
      badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30',
      description:
        'When an HDFC, SBI, or ICICI transaction fails, RecoverAI ingests the Razorpay webhook payload, verifies HMAC signatures, and runs Gemini 3.7 Flash diagnosis in <100ms to categorize whether the failure is a transient bank timeout, card limit hit, or SMS OTP drop.',
      actionLabel: 'Simulate HDFC 504 Failure & View AI Output',
      targetTab: 'simulator',
      execute: async () => {
        onNavigateTab('simulator');
        await onTriggerSimulation('hdfc_timeout');
      },
      technicalHighlights: [
        'Sub-second Gemini 3.7 Flash taxonomy classification (<100ms)',
        'Root cause extraction differentiating transient 504 timeouts from permanent declines',
        'Automated fallback strategy decision (NPCI UPI Intent switch)',
      ],
    },
    {
      id: 'step_customer_experience',
      title: '2. 1-Click Customer Payment Rail Switching',
      subtitle: 'Seamless WhatsApp 1-Click & UPI Intent Modal',
      badge: 'Zero Friction',
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
      description:
        'Instead of showing customers a cold "Payment Failed" dead-end error, RecoverAI presents an interactive 1-click payment screen with pre-filled PhonePe/GPay intent deep-links and WhatsApp payment actions.',
      actionLabel: 'Open 1-Click Customer Payment View',
      targetTab: 'customer_experience',
      execute: async () => {
        onNavigateTab('customer_experience');
      },
      technicalHighlights: [
        'Native pre-signed UPI Intent links (GPay, PhonePe, Paytm)',
        'WhatsApp interactive notification with pre-loaded discount incentives',
        'Instant recovery state confirmation upon completion',
      ],
    },
    {
      id: 'step_rate_limit_mutex',
      title: '3. API Rate Limit Defense & Zero-Double-Charge Guarantee',
      subtitle: 'Token Bucket Rate Limiter + Redis Distributed Mutex',
      badge: 'Enterprise Reliability',
      badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30',
      description:
        'Tested against high-volume flash sales. When webhook traffic exceeds the 120 RPM Razorpay API quota, the Adaptive Token Bucket engages Full-Jitter Exponential Backoff to prevent 429 errors, while distributed Redis Mutex locks prevent concurrent double charges.',
      actionLabel: 'Test 429 Burst Spike & Rate Limit Monitor',
      targetTab: 'dashboard',
      execute: async () => {
        onNavigateTab('dashboard');
        await onTriggerSpike();
      },
      technicalHighlights: [
        'Real-time Token Bucket monitor (120 RPM) with countdown to reset',
        'Adaptive Circuit Breaker (CLOSED -> HALF_OPEN -> OPEN) with Full Jitter',
        '100% Zero-Double-Charge protection via idempotent transaction leases',
      ],
    },
    {
      id: 'step_benchmarks',
      title: '4. Competitive Architecture Benchmark',
      subtitle: 'RecoverAI vs. Standard PG Retries & Legacy Dunning',
      badge: 'Strategic Advantage',
      badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30',
      description:
        'Compare why same-rail retries fail (91.6% drop rate) and how RecoverAI achieves a 40-55% recovery win rate compared to legacy dunning platforms by acting in-checkout and aligning with 1st-5th month salary cycles.',
      actionLabel: 'View Competitive Benchmark Matrix',
      targetTab: 'competitive_comparison',
      execute: async () => {
        onNavigateTab('competitive_comparison');
      },
      technicalHighlights: [
        'Sub-200ms in-checkout rail switching SLA vs nocturnal batch cron jobs',
        'Salary and liquidity-aware smart dunning for recurring subscriptions',
        'Zero-code webhook drop-in integration without billing schema migrations',
      ],
    },
    {
      id: 'step_roi_report',
      title: '5. Executive ROI & Financial Impact Report',
      subtitle: 'Interactive Volume Sliders & Audit-Ready Insights',
      badge: 'Merchant Economics',
      badgeColor: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
      description:
        'Explore the mathematical financial projection engine with custom GMV sliders and exportable recovery audit reports, demonstrating ~₹93.9 Lakhs annual recovered GMV for a ₹2 Crore/month merchant.',
      actionLabel: 'Explore Executive Insight Report',
      targetTab: 'insight_report',
      execute: async () => {
        onNavigateTab('insight_report');
      },
      technicalHighlights: [
        'Real-time TSR Conversion Lift modeling (+4.2% overall)',
        'Bank issuer friction breakdown (HDFC, SBI, ICICI timeouts)',
        '1-click exportable PDF / CSV reports for financial auditing',
      ],
    },
    {
      id: 'step_dynamic_rails',
      title: '6. Dynamic Autonomous Rail Logic & Signal Routing',
      subtitle: 'Multi-Signal Synthesis Across 5 Autonomous Recovery Rails',
      badge: 'Autonomous Routing',
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
      description:
        'Visualize how RecoverAI uses Gemini 3.7 Flash to diagnose bank switch error taxonomies and route transactions to UPI Intent, WhatsApp 1-Click Pay, Biometric Token Vaults, or Salary-Aligned Dunning in <50ms.',
      actionLabel: 'Open Dynamic Rail Decision Flowchart',
      targetTab: 'dynamic_rails',
      execute: async () => {
        onNavigateTab('dynamic_rails');
      },
      technicalHighlights: [
        'Live signal routing across 5 autonomous payment rails',
        'Interactive signal configurator (Bank switch, error code, AOV)',
        'Real-time confidence scoring and turnaround SLA validation',
      ],
    },
    {
      id: 'step_replay_compliance',
      title: '7. Webhook Replay Analysis & Automated Compliance',
      subtitle: 'Redis Mutex Concurrency, Idempotency & PCI/DPDPA Governance',
      badge: 'Security & Integrity',
      badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30',
      description:
        'Audit HMAC-SHA256 signature verification, Redis mutex key acquisition, duplicate replay attack suppression, and 100% certified PCI-DSS v4.0 & DPDPA data privacy compliance with cryptographic SHA-256 hash digests.',
      actionLabel: 'Open Replay & Concurrency Audit Studio',
      targetTab: 'webhook_replay',
      execute: async () => {
        onNavigateTab('webhook_replay');
      },
      technicalHighlights: [
        'Step-by-step pipeline audit trace (HMAC, Redis Mutex, Gemini AI, Dispatch)',
        'Replay attack simulation with zero duplicate charge guarantee',
        'Automated recurring compliance reporting with tamper-proof SHA-256 hashes',
      ],
    },
    {
      id: 'step_stakeholders_explainability',
      title: '8. Executive Stakeholder Hub & Explainability Mode',
      subtitle: 'Persona-Tailored Financial Impact & SHAP AI Attribution Trees',
      badge: 'Executive & AI Governance',
      badgeColor: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
      description:
        'Switch between CFO (ARR & 32.4x ROI), CTO (p99 SLA & zero drops), Growth (+14.2% TSR), and CRO (PCI/DPDPA zero-PII) dashboards. Inspect SHAP feature importance weights and run counterfactual "What-If" policy simulations.',
      actionLabel: 'Open Stakeholder Hub & Explainability',
      targetTab: 'stakeholder_dashboard',
      execute: async () => {
        onNavigateTab('stakeholder_dashboard');
      },
      technicalHighlights: [
        'Multi-persona executive view (CFO, CTO, VP Product, CRO)',
        'Interactive SHAP feature importance & attention weights',
        'Counterfactual "What-If" decision boundary sandbox',
      ],
    },
    {
      id: 'step_csv_drift_latency',
      title: '9. Enterprise Offline CSV Deep-Dive, Data Latency & Drift Studio',
      subtitle: 'Raw Transaction Exports, Pipeline SLA Alerts & PSI Telemetry',
      badge: 'Deep-Dive Analytics',
      badgeColor: 'bg-teal-500/20 text-teal-600 dark:text-teal-300 border-teal-500/30',
      description:
        'Export raw transaction logs, immutable audit trails, and success KPI benchmarks into structured RFC 4180 CSV files with UTF-8 BOM. Monitor pipeline stage ingestion latency SLAs and track Population Stability Index (PSI) drift.',
      actionLabel: 'Open CSV Export & Drift Studio',
      targetTab: 'csv_export',
      execute: async () => {
        onNavigateTab('csv_export');
      },
      technicalHighlights: [
        'Instant CSV download of raw transactions and immutable audit trails',
        'Real-time data pipeline freshness and latency threshold alerts',
        'Population Stability Index (PSI) distribution drift detection & auto-calibration',
      ],
    },
  ];

  const step = steps[currentStep];

  const handleExecuteAction = async () => {
    setIsExecutingAction(true);
    try {
      await step.execute();
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
    } catch (e) {
      console.error('Walkthrough action execution error:', e);
    } finally {
      setIsExecutingAction(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div
      id="demo-walkthrough-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">RecoverAI Interactive System Tour</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Interactive demonstration of core autonomous payment recovery and self-healing resilience.
              </p>
            </div>
          </div>

          <button
            id="btn-close-walkthrough"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Pills */}
        <div className="px-5 py-2.5 bg-slate-100/50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentStep === idx
                  ? 'bg-blue-600 text-white shadow-sm'
                  : completedSteps.has(idx)
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {completedSteps.has(idx) ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] font-mono">
                  {idx + 1}
                </span>
              )}
              <span>{s.title.split('.')[1]?.trim() || s.title}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${step.badgeColor}`}>
                {step.badge}
              </span>
              <span className="text-xs text-slate-400">{step.subtitle}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h2>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            {step.description}
          </p>

          {/* Interactive Trigger Button */}
          <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Live Interactive Action</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Executes the scenario and navigates directly to the target view.
              </div>
            </div>

            <button
              id={`btn-walkthrough-execute-${step.id}`}
              onClick={handleExecuteAction}
              disabled={isExecutingAction}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Play className={`w-3.5 h-3.5 ${isExecutingAction ? 'animate-spin' : ''}`} />
              <span>{isExecutingAction ? 'Running Scenario...' : step.actionLabel}</span>
            </button>
          </div>

          {/* Technical Architecture Highlights */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Key Technical & Architecture Highlights</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {step.technicalHighlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between">
          <button
            id="btn-walkthrough-prev"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentStep === idx ? 'w-5 bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              id="btn-walkthrough-next"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-walkthrough-finish"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Tour</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
