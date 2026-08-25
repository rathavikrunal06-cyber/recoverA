import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sliders,
  Terminal,
  Cpu,
  Server,
  Play,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface FailoverPathway {
  id: string;
  name: string;
  primaryRail: string;
  fallbackRail: string;
  triggerCondition: string;
  circuitState: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  successRate: number;
  switchLatencyMs: number;
  activeFailoverCount: number;
}

export const FailoverDashboard: React.FC = () => {
  const [isDrillRunning, setIsDrillRunning] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [drillLogs, setDrillLogs] = useState<Array<{ timestamp: string; level: 'INFO' | 'WARN' | 'SUCCESS'; message: string }>>([
    { timestamp: '12:28:10.420', level: 'INFO', message: 'Failover Orchestrator initialized. 5 circuit breakers in CLOSED state.' },
    { timestamp: '12:28:10.425', level: 'INFO', message: 'Redis Distributed Mutex heartbeat active. Cluster quorum: 3/3 nodes synced.' },
    { timestamp: '12:28:12.110', level: 'SUCCESS', message: 'Razorpay Direct acquiring gateway health probe returned 200 OK (14ms).' },
  ]);

  const [pathways, setPathways] = useState<FailoverPathway[]>([
    {
      id: 'rail_netbanking_upi',
      name: 'Netbanking 504 Gateway Timeout -> Instant UPI Intent',
      primaryRail: 'HDFC / SBI Netbanking Gateway',
      fallbackRail: 'NPCI UPI Fast-Rail (GPay / PhonePe / Paytm)',
      triggerCondition: 'Bank 504 Timeout or HTTP status >= 500',
      circuitState: 'CLOSED',
      successRate: 94.8,
      switchLatencyMs: 24,
      activeFailoverCount: 42,
    },
    {
      id: 'rail_otp_whatsapp',
      name: 'Card 3DS SMS OTP Delivery Drop -> WhatsApp Interactive Deep-Link',
      primaryRail: 'Telecom SMS OTP Delivery (3DS)',
      fallbackRail: 'Encrypted WhatsApp Interactive Notification',
      triggerCondition: 'OTP expiration (>60s) or carrier SMS failure',
      circuitState: 'CLOSED',
      successRate: 88.6,
      switchLatencyMs: 38,
      activeFailoverCount: 28,
    },
    {
      id: 'rail_upi_limit_card',
      name: 'Daily UPI Transaction Limit Cap -> Tokenized Vaulted Card',
      primaryRail: 'UPI PSP Account (₹1L Daily Limit)',
      fallbackRail: 'Pre-Tokenized Card Network Vault (Razorpay TokenHQ)',
      triggerCondition: 'PSP limit rejection code U30 / ZA',
      circuitState: 'CLOSED',
      successRate: 84.5,
      switchLatencyMs: 31,
      activeFailoverCount: 16,
    },
    {
      id: 'rail_mandate_dunning',
      name: 'Auto-Debit Mandate Liquidity Failure -> Smart Salary Dunning',
      primaryRail: 'e-NACH / UPI AutoPay Mandate',
      fallbackRail: 'Predictive 1st-of-month Dunning Schedule',
      triggerCondition: 'Insufficient balance on recurring debit',
      circuitState: 'CLOSED',
      successRate: 79.4,
      switchLatencyMs: 18,
      activeFailoverCount: 19,
    },
    {
      id: 'rail_psp_acquirer_switch',
      name: 'Acquiring Node 503 Congestion -> Multi-Acquirer Load Switch',
      primaryRail: 'Primary PSP Settlement Node',
      fallbackRail: 'Razorpay Direct Multi-Node Failover Cluster',
      triggerCondition: 'Error rate > 5% over 60s sliding window',
      circuitState: 'CLOSED',
      successRate: 98.2,
      switchLatencyMs: 12,
      activeFailoverCount: 8,
    },
  ]);

  const runChaosDrill = (scenarioName: string, pathwayId: string) => {
    setIsDrillRunning(true);
    setActiveScenario(scenarioName);

    const now = () => new Date().toISOString().substring(11, 23);

    // Step 1: Trigger fault
    setDrillLogs((prev) => [
      { timestamp: now(), level: 'WARN', message: `CHAOS DRILL INITIATED: Injecting synthetic fault [${scenarioName}]` },
      ...prev,
    ]);

    // Step 2: Trip Circuit Breaker
    setTimeout(() => {
      setPathways((prev) =>
        prev.map((p) => (p.id === pathwayId ? { ...p, circuitState: 'OPEN' } : p))
      );
      setDrillLogs((prev) => [
        { timestamp: now(), level: 'WARN', message: `Circuit Breaker TRIPPED to OPEN for ${pathwayId}. 5xx spike threshold breached.` },
        ...prev,
      ]);
    }, 600);

    // Step 3: Engage Failover Rail
    setTimeout(() => {
      setDrillLogs((prev) => [
        { timestamp: now(), level: 'INFO', message: `RecoverAI Autonomous Orchestrator engaged fallback rail. Zero customer checkout drops.` },
        ...prev,
      ]);
    }, 1200);

    // Step 4: Probing & Half-Open
    setTimeout(() => {
      setPathways((prev) =>
        prev.map((p) => (p.id === pathwayId ? { ...p, circuitState: 'HALF_OPEN' } : p))
      );
      setDrillLogs((prev) => [
        { timestamp: now(), level: 'INFO', message: `Probing primary node. State transitioned to HALF_OPEN. Canaries passed.` },
        ...prev,
      ]);
    }, 2000);

    // Step 5: Complete Drill & Reset to Closed
    setTimeout(() => {
      setPathways((prev) =>
        prev.map((p) => (p.id === pathwayId ? { ...p, circuitState: 'CLOSED' } : p))
      );
      setDrillLogs((prev) => [
        { timestamp: now(), level: 'SUCCESS', message: `Chaos drill completed successfully. Primary recovered, circuit restored to CLOSED. 100% traffic protected.` },
        ...prev,
      ]);
      setIsDrillRunning(false);
      setActiveScenario(null);
    }, 3000);
  };

  return (
    <div id="failover-dashboard" className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Failover Orchestration & Circuit Breakers</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                100% High Availability
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous multi-rail rerouting guarantees sub-50ms payment continuity across bank downtimes.
            </p>
          </div>
        </div>

        {/* Global Cluster Status Indicators */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Redis Mutex Lock</span>
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> ACTIVE (3 Nodes)
              </span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Failover SLA</span>
              <span className="font-mono font-bold text-blue-400">&lt; 50ms Switch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pathways Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            Configured Failover Pathways & Circuit Health
          </h3>
          <span className="text-[11px] text-slate-400">5 of 5 Pathways Active</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {pathways.map((pathway) => {
            const isCircuitOpen = pathway.circuitState === 'OPEN';
            const isHalfOpen = pathway.circuitState === 'HALF_OPEN';

            return (
              <div
                key={pathway.id}
                className={`bg-slate-900 border rounded-2xl p-4 transition-all ${
                  isCircuitOpen
                    ? 'border-red-500/60 bg-red-950/20'
                    : isHalfOpen
                    ? 'border-amber-500/60 bg-amber-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left: Pathway Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{pathway.name}</span>
                      {/* State Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isCircuitOpen
                            ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                            : isHalfOpen
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        CIRCUIT: {pathway.circuitState}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-mono text-[11px]">
                        Primary: {pathway.primaryRail}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-200 border border-blue-800/60 font-mono text-[11px] font-semibold">
                        Fallback: {pathway.fallbackRail}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Trigger: <strong className="text-slate-300 font-mono">{pathway.triggerCondition}</strong></span>
                    </div>
                  </div>

                  {/* Right: Metrics & Live Counters */}
                  <div className="flex items-center gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800 justify-between lg:justify-end">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Success Rate</div>
                      <div className="text-sm font-bold font-mono text-emerald-400">{pathway.successRate}%</div>
                    </div>

                    <div className="text-right border-l border-slate-800 pl-4">
                      <div className="text-xs text-slate-400">Switch Latency</div>
                      <div className="text-sm font-bold font-mono text-blue-400">{pathway.switchLatencyMs}ms</div>
                    </div>

                    <div className="text-right border-l border-slate-800 pl-4">
                      <div className="text-xs text-slate-400">Rescued Today</div>
                      <div className="text-sm font-bold font-mono text-white">{pathway.activeFailoverCount} txns</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chaos Testing & Live Drill Harness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Chaos Drills */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Chaos Testing & Failover Drills</span>
          </div>
          <p className="text-xs text-slate-400">
            Inject synthetic banking outages to verify failover routing, circuit breakers, and zero checkout dropoffs.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => runChaosDrill('HDFC Core Switch 504 Spike', 'rail_netbanking_upi')}
              disabled={isDrillRunning}
              className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <div>
                <div className="text-xs font-semibold text-white">Drill 1: HDFC Core Banking Switch 504 Outage</div>
                <div className="text-[11px] text-slate-400">Tests instant 1-tap UPI Intent fallback routing</div>
              </div>
              <Play className="w-4 h-4 text-blue-400 shrink-0" />
            </button>

            <button
              onClick={() => runChaosDrill('Telecom OTP Network Blackout', 'rail_otp_whatsapp')}
              disabled={isDrillRunning}
              className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <div>
                <div className="text-xs font-semibold text-white">Drill 2: Telecom Carrier SMS OTP Blackout</div>
                <div className="text-[11px] text-slate-400">Tests WhatsApp biometric interactive payment fallback</div>
              </div>
              <Play className="w-4 h-4 text-emerald-400 shrink-0" />
            </button>

            <button
              onClick={() => runChaosDrill('Daily UPI Limit Rejection Burst', 'rail_upi_limit_card')}
              disabled={isDrillRunning}
              className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <div>
                <div className="text-xs font-semibold text-white">Drill 3: UPI Account Limit Rejection Burst</div>
                <div className="text-[11px] text-slate-400">Tests 1-click vaulted card token auto-selection</div>
              </div>
              <Play className="w-4 h-4 text-indigo-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Right: Live Chaos Event Trace Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-white font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>Failover Orchestration Event Stream</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Live Quorum Synced</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs space-y-2 h-52 overflow-y-auto">
              {drillLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`font-bold shrink-0 ${
                      log.level === 'WARN'
                        ? 'text-amber-400'
                        : log.level === 'SUCCESS'
                        ? 'text-emerald-400'
                        : 'text-blue-400'
                    }`}
                  >
                    [{log.level}]
                  </span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between border-t border-slate-800">
            <span>Failover Engine: RecoverAI Adaptive Core</span>
            <span>Circuit Breaker Spec: Netflix Hystrix + Redis Token Bucket</span>
          </div>
        </div>
      </div>
    </div>
  );
};
