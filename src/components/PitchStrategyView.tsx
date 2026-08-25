import React from 'react';
import { Presentation, Target, Award, CheckCircle2, TrendingUp, Zap, HelpCircle, Layers, ShieldCheck, DollarSign } from 'lucide-react';

export const PitchStrategyView: React.FC = () => {
  return (
    <div id="pitch-strategy-view" className="space-y-6">
      {/* Hero Pitch Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30 mb-2">
              <Presentation className="w-3.5 h-3.5" /> Razorpay AI Buildathon 2026 Pitch Deck
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              RecoverAI: Autonomous Revenue Recovery & Smart Dunning Engine
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Recovering lost GMV and elevating Transaction Success Rates (TSR) by transforming payment failure webhooks into instant, intelligent multi-rail recovery actions.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 text-center shrink-0">
            <div className="text-[10px] uppercase font-bold text-slate-400">Target Track</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">AI Revenue Recovery</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">Internship & Production Ready</div>
          </div>
        </div>
      </div>

      {/* 5-Minute Pitch Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Slide 1: The Problem */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
              <Target className="w-4 h-4" /> 1. The $10B Problem
            </span>
            <span className="text-[10px] font-mono text-slate-400">Minute 0:00 - 1:00</span>
          </div>
          <h3 className="text-sm font-bold text-white">Payment Failures Kill 30% of Digital Commerce</h3>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">&bull;</span>
              <span><strong>Bank Switch Outages:</strong> Core banking downtime (e.g. HDFC 504s) causes sudden failure spikes with zero merchant recourse.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">&bull;</span>
              <span><strong>SMS OTP Latency:</strong> 3DS verification timeouts cause impatient users to abandon full carts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">&bull;</span>
              <span><strong>Dumb Dunning:</strong> Retrying recurring SaaS mandates daily causes bank bounce penalties and increases involuntary customer churn.</span>
            </li>
          </ul>
        </div>

        {/* Slide 2: The Solution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-4 h-4" /> 2. The Solution (RecoverAI)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Minute 1:00 - 2:00</span>
          </div>
          <h3 className="text-sm font-bold text-white">Autonomous Event-Driven Recovery Engine</h3>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">&bull;</span>
              <span><strong>Instant Webhook Interception:</strong> Ingests `payment.failed` within &lt;15ms with HMAC signature verification.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">&bull;</span>
              <span><strong>Dual-Tier AI Diagnosis:</strong> Deterministic cache for known bank downtime + Gemini 3.7 Flash for deep customer intent & copy generation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">&bull;</span>
              <span><strong>Multi-Rail Fallback:</strong> Instant UPI Intent (PhonePe/GPay), WhatsApp 1-Click biometric checkout, and salary-cycle mandate dunning.</span>
            </li>
          </ul>
        </div>

        {/* Slide 3: Technical Architecture & Moat */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-4 h-4" /> 3. Architecture & Low Latency Moat
            </span>
            <span className="text-[10px] font-mono text-slate-400">Minute 2:00 - 3:30</span>
          </div>
          <h3 className="text-sm font-bold text-white">High-Throughput Fintech System Design</h3>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">&bull;</span>
              <span><strong>&lt;200ms Latency SLA:</strong> Fast-tier rule engine triggers immediately while the asynchronous queue processes downstream intelligence.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">&bull;</span>
              <span><strong>Zero Hallucination Guard:</strong> Gemini outputs strict JSON responseSchema, wrapped with deterministic margin and rate-limit guardrails.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">&bull;</span>
              <span><strong>Idempotency Engine:</strong> Atomic Redis locks prevent double charges and duplicate customer notifications.</span>
            </li>
          </ul>
        </div>

        {/* Slide 4: Business Impact for Razorpay */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> 4. Direct ROI for Razorpay
            </span>
            <span className="text-[10px] font-mono text-slate-400">Minute 3:30 - 5:00</span>
          </div>
          <h3 className="text-sm font-bold text-white">Direct Lift on Razorpay's Core North-Star Metrics</h3>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">&bull;</span>
              <span><strong>+4.8% TSR Lift:</strong> Directly increases Razorpay’s Transaction Success Rate, creating a massive competitive moat over Stripe/PayU.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">&bull;</span>
              <span><strong>Immediate GMV Monetization:</strong> If Razorpay processes $100B annually, recovering just 2% of failed GMV unlocks $2 Billion in recovered transactions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">&bull;</span>
              <span><strong>Merchant Retention:</strong> Merchants stay with Razorpay because no other gateway offers automated AI-driven cart and mandate rescue.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Anticipated Executive Q&A */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" /> Anticipated Panel Q&A & Defenses
        </h3>

        <div className="space-y-3">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-amber-300">
              Q: "What if the LLM hallucinates a 90% discount or takes 3 seconds to respond?"
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Answer:</strong> We enforce a strict dual-tier architecture. A 250ms circuit breaker automatically defaults to the deterministic rule engine if the LLM lags. All financial parameters (discounts, retry counts) are hard-capped by mathematical guardrail assertions before execution.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-amber-300">
              Q: "How do you avoid double-charging the customer if the bank later clears the original failed payment?"
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Answer:</strong> Our state machine implements distributed locks with active status polling. When an alternative recovery rail is clicked, we verify the primary order state with Razorpay’s Core API. If the original payment transitions to `captured`, the recovery link is invalidated instantly.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-amber-300">
              Q: "Why is smart dunning better than standard cron retries every 24 hours?"
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Answer:</strong> Dumb 24-hour retries trigger bank anti-fraud blocks and penalize customer debit accounts with auto-debit failure charges (₹250-500). RecoverAI models the Indian salary cycle (predicting 1st/5th liquidity) and sends a pre-debit WhatsApp alert so the user funds their account beforehand.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
