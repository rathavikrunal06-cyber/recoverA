import React, { useState } from 'react';
import { Activity, Clock, ShieldCheck, Zap, AlertTriangle, CheckCircle2, ArrowUpRight, Cpu, BarChart3, RefreshCw, Layers } from 'lucide-react';

interface BankRailLatency {
  bank: string;
  bankCode: string;
  upiIntentMs: number;
  whatsAppPayMs: number;
  cards3dsMs: number;
  mandateDunningMs: number;
  globalFxMs: number;
  status: 'OPTIMAL' | 'ELEVATED' | 'DEGRADED';
  activeIssues?: string;
}

export const LatencyHeatmap: React.FC = () => {
  const [isSimulatingTraffic, setIsSimulatingTraffic] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{ bank: string; rail: string; latency: number; status: string; note: string } | null>(null);

  // Real-time matrix of banks vs rails
  const latencyMatrix: BankRailLatency[] = [
    {
      bank: 'HDFC Bank',
      bankCode: 'HDFC',
      upiIntentMs: 24,
      whatsAppPayMs: 38,
      cards3dsMs: 380, // Outage/elevated
      mandateDunningMs: 45,
      globalFxMs: 110,
      status: 'DEGRADED',
      activeIssues: 'Core Netbanking Switch 504 Timeout & 3DS SMS Latency Spike',
    },
    {
      bank: 'State Bank of India',
      bankCode: 'SBIN',
      upiIntentMs: 42,
      whatsAppPayMs: 35,
      cards3dsMs: 290, // Slow OTP
      mandateDunningMs: 50,
      globalFxMs: 135,
      status: 'ELEVATED',
      activeIssues: 'SMS OTP verification delivery delayed by telecom aggregator',
    },
    {
      bank: 'ICICI Bank',
      bankCode: 'ICIC',
      upiIntentMs: 18,
      whatsAppPayMs: 28,
      cards3dsMs: 65,
      mandateDunningMs: 32,
      globalFxMs: 85,
      status: 'OPTIMAL',
    },
    {
      bank: 'Axis Bank',
      bankCode: 'AXIS',
      upiIntentMs: 22,
      whatsAppPayMs: 30,
      cards3dsMs: 72,
      mandateDunningMs: 40,
      globalFxMs: 95,
      status: 'OPTIMAL',
    },
    {
      bank: 'Kotak Mahindra',
      bankCode: 'KKBK',
      upiIntentMs: 240, // PSP Congestion
      whatsAppPayMs: 44,
      cards3dsMs: 80,
      mandateDunningMs: 48,
      globalFxMs: 120,
      status: 'DEGRADED',
      activeIssues: 'Kotak UPI PSP Gateway experiencing 503 load spike',
    },
    {
      bank: 'Yes Bank / Razorpay Direct',
      bankCode: 'YESB',
      upiIntentMs: 15,
      whatsAppPayMs: 22,
      cards3dsMs: 58,
      mandateDunningMs: 28,
      globalFxMs: 75,
      status: 'OPTIMAL',
    },
  ];

  // Pipeline latency stages breakdown
  const pipelineStages = [
    { name: '1. Ingress & HMAC Auth', latency: 12, budget: 20, desc: 'Crypto SHA-256 Signature verification' },
    { name: '2. Idempotency Lock', latency: 4, budget: 10, desc: 'Redis atomic key duplicate filter' },
    { name: '3. Tier-1 Fast Rule Cache', latency: 22, budget: 35, desc: 'Known bank health matrix lookup' },
    { name: '4. Gemini 3.7 Flash Reasoning', latency: 128, budget: 180, desc: 'Structured JSON churn & intent diagnosis' },
    { name: '5. Multi-Rail Dispatch & Webhook Ack', latency: 26, budget: 40, desc: 'UPI intent deep-link & WhatsApp trigger' },
  ];

  const totalEndToEndLatency = pipelineStages.reduce((acc, s) => acc + s.latency, 0);

  const getCellColor = (ms: number) => {
    if (ms < 40) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30';
    if (ms < 100) return 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30';
    if (ms < 200) return 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30 animate-pulse';
  };

  const getCellStatusText = (ms: number) => {
    if (ms < 40) return 'Ultra-Fast (<40ms)';
    if (ms < 100) return 'Normal (40-100ms)';
    if (ms < 200) return 'Elevated (100-200ms)';
    return 'Degraded / Circuit Break (>200ms)';
  };

  const handleSimulateRefresh = () => {
    setIsSimulatingTraffic(true);
    setTimeout(() => {
      setIsSimulatingTraffic(false);
    }, 600);
  };

  return (
    <div id="latency-heatmap-view" className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Activity className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Real-Time Latency Heatmap & Gateway Health Telemetry</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live telemetry monitoring response times across major Indian issuer banks and payment rails. RecoverAI uses this matrix to route around high-latency nodes autonomously.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 font-mono">End-to-End SLA</div>
            <div className="text-xs font-bold font-mono text-emerald-400">{totalEndToEndLatency}ms / 250ms Cap</div>
          </div>

          <button
            id="btn-refresh-heatmap"
            onClick={handleSimulateRefresh}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Poll fresh gateway telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingTraffic ? 'animate-spin text-blue-400' : ''}`} />
            <span>Poll Live Nodes</span>
          </button>
        </div>
      </div>

      {/* Latency Matrix Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Issuer Bank vs Recovery Rail Latency Matrix (ms)
          </h3>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> &lt;40ms (Optimal)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" /> 40-100ms</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> 100-200ms</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" /> &gt;200ms (Degraded)</span>
          </div>
        </div>

        {/* Responsive Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 font-mono">
                <th className="pb-3 pr-4">Issuer Bank / PSP</th>
                <th className="pb-3 px-2 text-center">UPI Intent Rail</th>
                <th className="pb-3 px-2 text-center">WhatsApp 1-Click</th>
                <th className="pb-3 px-2 text-center">Cards 3DS v2</th>
                <th className="pb-3 px-2 text-center">Smart Mandate</th>
                <th className="pb-3 px-2 text-center">Global FX Rail</th>
                <th className="pb-3 pl-4 text-right">Node Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {latencyMatrix.map((row) => (
                <tr key={row.bankCode} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-4 font-medium text-white flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[10px] w-10">{row.bankCode}</span>
                    <span>{row.bank}</span>
                  </td>

                  {/* UPI Intent */}
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() =>
                        setSelectedCell({
                          bank: row.bank,
                          rail: 'UPI Intent Rail',
                          latency: row.upiIntentMs,
                          status: getCellStatusText(row.upiIntentMs),
                          note: row.upiIntentMs > 200 ? 'High PSP congestion detected; automatically routed via backup PSP' : 'Healthy low-latency direct VPA intent',
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer ${getCellColor(row.upiIntentMs)}`}
                    >
                      {row.upiIntentMs}ms
                    </button>
                  </td>

                  {/* WhatsApp Pay */}
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() =>
                        setSelectedCell({
                          bank: row.bank,
                          rail: 'WhatsApp 1-Click Rail',
                          latency: row.whatsAppPayMs,
                          status: getCellStatusText(row.whatsAppPayMs),
                          note: 'Pre-authenticated conversational payment link with zero OTP friction',
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer ${getCellColor(row.whatsAppPayMs)}`}
                    >
                      {row.whatsAppPayMs}ms
                    </button>
                  </td>

                  {/* Cards 3DS */}
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() =>
                        setSelectedCell({
                          bank: row.bank,
                          rail: 'Cards 3DS Verification Rail',
                          latency: row.cards3dsMs,
                          status: getCellStatusText(row.cards3dsMs),
                          note: row.cards3dsMs > 200 ? 'SMS OTP delivery latency spike on issuer side. RecoverAI triggers dynamic UPI switch.' : '3DS auth challenge completed normally',
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer ${getCellColor(row.cards3dsMs)}`}
                    >
                      {row.cards3dsMs}ms
                    </button>
                  </td>

                  {/* Smart Mandate */}
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() =>
                        setSelectedCell({
                          bank: row.bank,
                          rail: 'Smart Mandate Dunning Rail',
                          latency: row.mandateDunningMs,
                          status: getCellStatusText(row.mandateDunningMs),
                          note: 'Salary-cycle optimized auto-debit retry queue',
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer ${getCellColor(row.mandateDunningMs)}`}
                    >
                      {row.mandateDunningMs}ms
                    </button>
                  </td>

                  {/* Global FX */}
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() =>
                        setSelectedCell({
                          bank: row.bank,
                          rail: 'Global Multi-Currency FX Rail',
                          latency: row.globalFxMs,
                          status: getCellStatusText(row.globalFxMs),
                          note: 'Cross-border 3DS-exempt compliant routing',
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs transition-all cursor-pointer ${getCellColor(row.globalFxMs)}`}
                    >
                      {row.globalFxMs}ms
                    </button>
                  </td>

                  {/* Node Health Status */}
                  <td className="py-3 pl-4 text-right">
                    {row.status === 'OPTIMAL' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> 99.9% Health
                      </span>
                    ) : row.status === 'ELEVATED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" /> Elevated Latency
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        <AlertTriangle className="w-3 h-3" /> Auto-Bypassed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Cell Drilldown */}
        {selectedCell && (
          <div className="mt-4 p-4 bg-slate-950 border border-blue-500/40 rounded-xl animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span className="text-blue-400">{selectedCell.bank}</span>
                <span>&bull;</span>
                <span>{selectedCell.rail}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Latency: <strong className="text-emerald-400">{selectedCell.latency}ms</strong> ({selectedCell.status})
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">{selectedCell.note}</p>
            </div>

            <button
              onClick={() => setSelectedCell(null)}
              className="text-[11px] text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Pipeline Stage Latency Waterfall */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Dual-Tier AI Engine Execution Latency Waterfall
          </h3>
          <span className="text-xs font-mono text-emerald-400">Total: {totalEndToEndLatency}ms (&lt;200ms SLA)</span>
        </div>

        <div className="space-y-3">
          {pipelineStages.map((stage, idx) => {
            const percentage = (stage.latency / stage.budget) * 100;
            return (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{stage.name}</span>
                    <span className="text-[10px] text-slate-400">({stage.desc})</span>
                  </div>
                  <div className="font-mono text-xs text-emerald-400">
                    <strong>{stage.latency}ms</strong> <span className="text-slate-500">/ max {stage.budget}ms budget</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Circuit Breaker Guarantee:</strong> If Gemini reasoning exceeds 250ms under extreme traffic, RecoverAI automatically trips to the &lt;25ms Deterministic Fast-Tier rule engine to guarantee zero customer checkout delay.
          </span>
        </div>
      </div>
    </div>
  );
};
