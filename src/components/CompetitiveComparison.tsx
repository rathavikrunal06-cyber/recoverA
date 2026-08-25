import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  DollarSign,
  HelpCircle,
} from 'lucide-react';

export const CompetitiveComparison: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'latency' | 'intelligence' | 'rails' | 'safety' | 'pricing'>('all');

  const comparisonRows = [
    {
      category: 'latency',
      feature: 'Real-Time In-Checkout Rail Switching',
      description: 'Switches customer to working rail (UPI / WhatsApp) while customer is still in checkout session',
      recoverAI: { status: 'full', text: 'Yes (<200ms sub-second SLA)' },
      razorpayBasic: { status: 'none', text: 'No (User sees failure error)' },
      chargebee: { status: 'none', text: 'No (Hours/days later via email)' },
      inHouseCron: { status: 'none', text: 'No (Batch nocturnal job)' },
    },
    {
      category: 'intelligence',
      feature: 'Dual-Tier AI Root Cause Diagnosis',
      description: 'Differentiates transient 504 gateway spikes from card expiry vs limit exhaustion with Gemini 3.7 Flash',
      recoverAI: { status: 'full', text: 'Gemini 3.7 Flash + In-Memory Rules' },
      razorpayBasic: { status: 'partial', text: 'Basic static error codes' },
      chargebee: { status: 'partial', text: 'Fixed rule builders' },
      inHouseCron: { status: 'none', text: 'Hardcoded if-else scripts' },
    },
    {
      category: 'rails',
      feature: 'Dynamic Multi-Rail Failover',
      description: 'Reroutes failed Netbanking/Card to NPCI UPI Intent, Tokenized Vault, or WhatsApp 1-Click Pay',
      recoverAI: { status: 'full', text: 'Dynamic Auto-Switch (UPI, WA, Card)' },
      razorpayBasic: { status: 'partial', text: 'Re-attempts same failed card/bank' },
      chargebee: { status: 'partial', text: 'Email with generic payment portal link' },
      inHouseCron: { status: 'none', text: 'Same rail retry only' },
    },
    {
      category: 'intelligence',
      feature: 'Salary & Liquidity-Aware Dunning',
      description: 'Schedules recurring sub retries around 1st-5th of month salary cycles to avoid NSF bank penalty fees',
      recoverAI: { status: 'full', text: 'Autonomous Liquidity Predictor' },
      razorpayBasic: { status: 'none', text: 'Blind fixed interval (e.g. +24hrs)' },
      chargebee: { status: 'partial', text: 'Manual scheduled intervals' },
      inHouseCron: { status: 'none', text: 'Daily midnight cron retry' },
    },
    {
      category: 'rails',
      feature: 'Interactive 1-Click WhatsApp Pay',
      description: 'Native WhatsApp interactive checkout with pre-signed intent links and 1-tap OTPless completion',
      recoverAI: { status: 'full', text: 'Native Meta Cloud API Integration' },
      razorpayBasic: { status: 'none', text: 'Generic SMS text alert' },
      chargebee: { status: 'none', text: 'Email notification' },
      inHouseCron: { status: 'none', text: 'Third-party SMS gateway' },
    },
    {
      category: 'safety',
      feature: 'Zero-Double-Charge Guarantee',
      description: 'Distributed Redis Mutex locks prevent concurrent debits when customer retries across multiple tabs',
      recoverAI: { status: 'full', text: '100% Guaranteed (Redis Mutex)' },
      razorpayBasic: { status: 'partial', text: 'Standard gateway locks' },
      chargebee: { status: 'partial', text: 'Eventual consistency' },
      inHouseCron: { status: 'none', text: 'High race condition risk' },
    },
    {
      category: 'pricing',
      feature: 'Integration & Maintenance Overhead',
      description: 'Developer effort required to deploy and maintain production resilience',
      recoverAI: { status: 'full', text: '1 Webhook URL (Zero Code Changes)' },
      razorpayBasic: { status: 'full', text: 'Standard Dashboard Toggle' },
      chargebee: { status: 'partial', text: 'Heavy SDK + Billing Migration' },
      inHouseCron: { status: 'none', text: 'Ongoing dev engineering debt' },
    },
    {
      category: 'pricing',
      feature: 'Observed Recovery Win Rate',
      description: 'Percentage of dropped or failed transaction volume successfully rescued',
      recoverAI: { status: 'full', text: '40% - 55% Win Rate' },
      razorpayBasic: { status: 'partial', text: '8% - 12% Win Rate' },
      chargebee: { status: 'partial', text: '14% - 18% Win Rate' },
      inHouseCron: { status: 'none', text: '5% - 9% Win Rate' },
    },
  ];

  const filteredRows =
    activeCategory === 'all'
      ? comparisonRows
      : comparisonRows.filter((r) => r.category === activeCategory);

  return (
    <div id="competitive-comparison-view" className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-500 dark:text-blue-400 border border-blue-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">RecoverAI vs. Market Alternatives</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                Competitive Benchmark
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive architectural & feature comparison across recovery mechanisms, latency, and ROI.
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Pillars' },
            { id: 'latency', label: 'Real-Time' },
            { id: 'intelligence', label: 'AI Intelligence' },
            { id: 'rails', label: 'Multi-Rail' },
            { id: 'safety', label: 'Safety' },
            { id: 'pricing', label: 'Win Rate & ROI' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/80">
                <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300 w-2/6">Capability & Feature</th>
                <th className="py-4 px-4 font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border-x border-blue-500/30 w-1/6 text-center">
                  <div className="flex items-center justify-center gap-1.5 font-extrabold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    RecoverAI (Ours)
                  </div>
                  <div className="text-[10px] text-blue-500 dark:text-blue-300 font-normal mt-0.5">Autonomous Dual-Tier AI</div>
                </th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-400 w-1/6 text-center">
                  Standard PG Retries
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">Razorpay / Stripe Native</div>
                </th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-400 w-1/6 text-center">
                  Dunning SaaS
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">Chargebee / ChurnZero</div>
                </th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-400 w-1/6 text-center">
                  In-House Cron
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">Custom Merchant Scripts</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {filteredRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Feature & Description */}
                  <td className="py-3.5 px-4 space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white">{row.feature}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{row.description}</div>
                  </td>

                  {/* RecoverAI Column */}
                  <td className="py-3.5 px-4 bg-blue-500/5 border-x border-blue-500/20 text-center font-medium">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-300 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{row.recoverAI.text}</span>
                    </div>
                  </td>

                  {/* Standard PG Retries Column */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300">
                      {row.razorpayBasic.status === 'full' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : row.razorpayBasic.status === 'partial' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span>{row.razorpayBasic.text}</span>
                    </div>
                  </td>

                  {/* Dunning SaaS Column */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300">
                      {row.chargebee.status === 'full' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : row.chargebee.status === 'partial' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span>{row.chargebee.text}</span>
                    </div>
                  </td>

                  {/* In-House Cron Column */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300">
                      {row.inHouseCron.status === 'full' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : row.inHouseCron.status === 'partial' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span>{row.inHouseCron.text}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Takeaway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 font-bold text-xs">
            <Zap className="w-4 h-4" />
            <span>Why Same-Rail Retries Fail (91.6% Drop)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            When HDFC bank switch is timing out (504), retrying the same HDFC Netbanking card will repeatedly fail. RecoverAI converts 54% of these instantly by flipping the transaction to NPCI UPI Intent before the customer closes the browser tab.
          </p>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 font-bold text-xs">
            <TrendingUp className="w-4 h-4" />
            <span>Salary Cycle Alignment Advantage</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            For subscriptions and recurring mandate dropoffs (insufficient funds), RecoverAI pauses automated billing until the 1st or 30th of the month, avoiding the ₹300-₹500 bank penalty bounce fees that anger consumers and trigger chargebacks.
          </p>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400 font-bold text-xs">
            <Cpu className="w-4 h-4" />
            <span>Zero Integration Code Footprint</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Unlike legacy dunning platforms that require complete billing schema refactoring and multi-week SDK upgrades, RecoverAI operates 100% autonomously by listening to standard Razorpay webhook payloads.
          </p>
        </div>
      </div>
    </div>
  );
};
