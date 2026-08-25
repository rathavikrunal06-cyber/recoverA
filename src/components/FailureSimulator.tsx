import React, { useState } from 'react';
import {
  ShieldAlert,
  Play,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Smartphone,
  Server,
  RefreshCw,
  Clock,
  Layers,
  Lock,
} from 'lucide-react';
import { RazorpayWebhookPayload, TransactionRecord } from '../types';

interface FailureSimulatorProps {
  onSimulate: (payload: RazorpayWebhookPayload) => Promise<TransactionRecord | null>;
  onOpenCustomerView?: (tx: TransactionRecord) => void;
  isSimulating: boolean;
}

interface ChaosScenario {
  id: string;
  title: string;
  category: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  description: string;
  errorReason: string;
  errorCode: string;
  bank: string;
  method: 'netbanking' | 'card' | 'upi' | 'wallet';
  amountPaise: number;
  customerName: string;
  recommendedFix: string;
  projectedWinRate: string;
}

const CHAOS_SCENARIOS: ChaosScenario[] = [
  {
    id: 'hdfc_504_switch',
    title: 'HDFC Core Bank Gateway 504 Timeout',
    category: 'BANK_SWITCH_OUTAGE',
    severity: 'CRITICAL',
    description: 'HDFC core netbanking switch fails to respond during evening peak window; transaction aborts after 60s.',
    errorReason: 'bank_system_unreachable',
    errorCode: 'GATEWAY_TIMEOUT_504',
    bank: 'HDFC',
    method: 'netbanking',
    amountPaise: 499900,
    customerName: 'Priya Sharma',
    recommendedFix: 'NPCI UPI Fast-Rail Auto-Switch (PhonePe / GPay QR & Intent)',
    projectedWinRate: '94.2%',
  },
  {
    id: 'sbi_otp_sms_drop',
    title: 'SBI 3DS SMS OTP Delivery Timeout',
    category: 'AUTH_SMS_DROP',
    severity: 'HIGH',
    description: 'Telecom SMS gateway drops the 6-digit OTP; customer waits 180s on 3DS screen before abandoning cart.',
    errorReason: 'otp_delivery_failed',
    errorCode: 'AUTH_TIMEOUT',
    bank: 'SBIN',
    method: 'card',
    amountPaise: 219900,
    customerName: 'Rohan Gupta',
    recommendedFix: 'WhatsApp 1-Click Interactive Pay with Biometric UPI authentication',
    projectedWinRate: '88.6%',
  },
  {
    id: 'upi_vpa_abandonment',
    title: 'NPCI UPI Intent Screen Abandonment',
    category: 'INTENT_ABANDONMENT',
    severity: 'MEDIUM',
    description: 'Customer opens UPI intent app but switches away due to app lag or notification distraction.',
    errorReason: 'upi_intent_timeout',
    errorCode: 'USER_DROPPED_INTENT',
    bank: 'ICICI',
    method: 'upi',
    amountPaise: 189900,
    customerName: 'Rohit Kumar',
    recommendedFix: 'Instant Dynamic SMS & WhatsApp Deep-Link with 15-min Cart Reservation',
    projectedWinRate: '91.0%',
  },
  {
    id: 'subscription_mandate_nsf',
    title: 'Recurring Subscription NSF (Liquidity Drop)',
    category: 'MANDATE_LIQUIDITY',
    severity: 'MEDIUM',
    description: 'Monthly SaaS recurring mandate fails on the 26th of month due to temporary pre-salary liquidity dip.',
    errorReason: 'insufficient_funds_mandate',
    errorCode: 'ISSUER_DECLINED_NSF',
    bank: 'KKBK',
    method: 'card',
    amountPaise: 799900,
    customerName: 'Ananya Verma',
    recommendedFix: 'Salary-Aligned Smart Dunning Retry scheduled for 1st of month',
    projectedWinRate: '78.5%',
  },
  {
    id: 'card_vault_token_expired',
    title: 'Tokenized Network Card Expiry Decline',
    category: 'TOKEN_EXPIRY',
    severity: 'HIGH',
    description: 'CoF (Card-on-File) token cryptogram expired at network vault level; payment declined silently.',
    errorReason: 'token_cryptogram_invalid',
    errorCode: 'CARD_TOKEN_EXPIRED',
    bank: 'UTIB',
    method: 'card',
    amountPaise: 1250000,
    customerName: 'Vikram Patel',
    recommendedFix: 'Pre-filled 1-Click Card Update link with zero-re-entry tokenization',
    projectedWinRate: '84.0%',
  },
  {
    id: 'flash_sale_concurrency_429',
    title: 'Midnight Flash Sale 429 Concurrency Surge',
    category: 'RATE_LIMIT_BURST',
    severity: 'CRITICAL',
    description: '1,000+ simultaneous checkout requests overwhelm payment ingress gateway during midnight flash drop.',
    errorReason: 'rate_limit_exceeded',
    errorCode: 'THROTTLED_429',
    bank: 'HDFC',
    method: 'upi',
    amountPaise: 349900,
    customerName: 'Kunal Rathi',
    recommendedFix: 'Token Bucket Queueing with Full Jitter Exponential Backoff and Async Webhook Buffer',
    projectedWinRate: '96.8%',
  },
];

export const FailureSimulator: React.FC<FailureSimulatorProps> = ({
  onSimulate,
  onOpenCustomerView,
  isSimulating,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<ChaosScenario>(CHAOS_SCENARIOS[0]);
  const [lastSimulatedTx, setLastSimulatedTx] = useState<TransactionRecord | null>(null);
  const [simulationSteps, setSimulationSteps] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  const handleExecuteScenario = async (scenario: ChaosScenario) => {
    setSelectedScenario(scenario);
    setLastSimulatedTx(null);
    setActiveStepIndex(0);

    const steps = [
      `1. Ingesting payment.failed webhook for ${scenario.customerName} (₹${(scenario.amountPaise / 100).toFixed(2)})`,
      `2. Verifying HMAC SHA-256 webhook signature & idempotency key`,
      `3. Gemini 3.7 Flash sub-second taxonomy diagnosis & root cause extraction`,
      `4. Checking Zero Double-Charge & Margin Protection safety guardrails`,
      `5. Generating dynamic failover payment rail (${scenario.recommendedFix})`,
      `6. Recovery link generated & dispatched via SMS / WhatsApp`,
    ];
    setSimulationSteps(steps);

    // Step by step animation
    for (let i = 0; i < steps.length - 1; i++) {
      await new Promise((resolve) => setTimeout(resolve, 180));
      setActiveStepIndex(i + 1);
    }

    const now = Math.floor(Date.now() / 1000);
    const mockPayload: RazorpayWebhookPayload = {
      entity: 'event',
      account_id: 'acc_RzpProdMerchant99',
      event: 'payment.failed',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: `pay_Chaos_${Date.now()}`,
            entity: 'payment',
            amount: scenario.amountPaise,
            currency: 'INR',
            status: 'failed',
            order_id: `order_Chaos_${Date.now()}`,
            invoice_id: null,
            international: false,
            method: scenario.method,
            amount_refunded: 0,
            refund_status: null,
            captured: false,
            description: `Order for ${scenario.customerName}`,
            card_id: scenario.method === 'card' ? 'card_vault_992' : null,
            bank: scenario.bank,
            wallet: null,
            vpa: scenario.method === 'upi' ? `${scenario.customerName.toLowerCase().replace(' ', '')}@okhdfcbank` : null,
            email: `${scenario.customerName.toLowerCase().replace(' ', '.')}@example.com`,
            contact: '+919876543210',
            notes: { customer_name: scenario.customerName },
            fee: null,
            tax: null,
            error_code: scenario.errorCode,
            error_description: scenario.description,
            error_source: scenario.category.includes('BANK') ? 'bank' : 'customer',
            error_step: 'payment_authorization',
            error_reason: scenario.errorReason,
            created_at: now,
          },
        },
      },
      created_at: now,
    };

    const result = await onSimulate(mockPayload);
    if (result) {
      setLastSimulatedTx(result);
    }
  };

  return (
    <div id="failure-simulation-view" className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Payment Failure Chaos & Simulation Lab</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 font-bold">
                6 Production Scenarios
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inject deterministic payment failure events to test Gemini 3.7 autonomous diagnostics, dynamic rail switching, and 1-click customer recovery.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Scenario Selector & Live Pipeline Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scenarios List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Failure Chaos Scenario
          </h3>

          <div className="space-y-2.5">
            {CHAOS_SCENARIOS.map((scenario) => {
              const isSelected = selectedScenario.id === scenario.id;
              return (
                <div
                  key={scenario.id}
                  onClick={() => handleExecuteScenario(scenario)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-slate-900 bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : 'bg-slate-900 dark:bg-slate-900 bg-white border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        scenario.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {scenario.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      ₹{(scenario.amountPaise / 100).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{scenario.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-500">{scenario.bank} &bull; {scenario.method}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span>Win Rate: {scenario.projectedWinRate}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Real-Time Execution Trace & Action */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Pipeline Card */}
          <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Autonomous Ingress & Recovery Trace</h3>
              </div>
              <button
                onClick={() => handleExecuteScenario(selectedScenario)}
                disabled={isSimulating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>Re-Inject Chaos</span>
              </button>
            </div>

            {/* Step-by-Step Live Telemetry */}
            <div className="space-y-2.5 font-mono text-xs">
              {simulationSteps.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Play className="w-8 h-8 mx-auto opacity-30 text-blue-500" />
                  <p>Click any failure chaos scenario on the left to watch the end-to-end recovery trace.</p>
                </div>
              ) : (
                simulationSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      idx <= activeStepIndex
                        ? 'bg-slate-50 dark:bg-slate-950 border-blue-500/40 text-slate-900 dark:text-slate-100'
                        : 'bg-slate-100/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="shrink-0">
                      {idx <= activeStepIndex ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600" />
                      )}
                    </div>
                    <span className="leading-snug">{step}</span>
                  </div>
                ))
              )}
            </div>

            {/* Generated Recovery Resolution (if completed) */}
            {lastSimulatedTx && (
              <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/50 rounded-xl p-4 text-white space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-bold font-mono text-emerald-300">
                      Autonomous Recovery Resolution Ready
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    Confidence: {((lastSimulatedTx.diagnosis?.confidenceScore || 0.95) * 100).toFixed(0)}%
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">
                    {lastSimulatedTx.diagnosis?.actionPayload.title || 'Dynamic Alternate Rail Active'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {lastSimulatedTx.diagnosis?.actionPayload.description || 'Pre-filled 1-click biometric link dispatched to buyer.'}
                  </p>
                </div>

                {onOpenCustomerView && (
                  <button
                    onClick={() => onOpenCustomerView(lastSimulatedTx)}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Launch Customer 1-Click Pay Experience Modal</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
