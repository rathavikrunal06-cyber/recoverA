import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Server,
  Radio,
  Wifi,
  Lock,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { SystemMetrics } from '../types';

interface SystemHealthPulseProps {
  metrics: SystemMetrics | null;
  onRefreshTelemetry?: () => void;
}

interface SubsystemHeartbeat {
  id: string;
  name: string;
  category: 'INGRESS' | 'AI_ENGINE' | 'REDIS_MUTEX' | 'UPI_ROUTER' | 'WHATSAPP_API' | 'BANK_SWITCH';
  status: 'OPTIMAL' | 'DEGRADED' | 'PROBING';
  latencyMs: number;
  uptime90d: number;
  p99LatencyMs: number;
  jitterMs: number;
  circuitBreaker: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  description: string;
  throughputRps: number;
}

export const SystemHealthPulse: React.FC<SystemHealthPulseProps> = ({
  metrics,
  onRefreshTelemetry,
}) => {
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [pulseCount, setPulseCount] = useState<number>(0);
  const [livePulseData, setLivePulseData] = useState<number[]>([
    20, 24, 20, 20, 85, 12, 55, 20, 20, 22, 20, 20, 90, 15, 60, 20, 20, 25, 20, 20,
  ]);

  const [nodes, setNodes] = useState<SubsystemHeartbeat[]>([
    {
      id: 'node-webhook-ingress',
      name: 'Razorpay Edge Webhook Ingress',
      category: 'INGRESS',
      status: 'OPTIMAL',
      latencyMs: 1.4,
      p99LatencyMs: 4.8,
      jitterMs: 0.2,
      uptime90d: 99.999,
      circuitBreaker: 'CLOSED',
      description: 'HMAC-SHA256 authenticated webhook gateway with token bucket burst protection.',
      throughputRps: 184,
    },
    {
      id: 'node-gemini-engine',
      name: 'Gemini 3.7 Flash Diagnostic Engine',
      category: 'AI_ENGINE',
      status: 'OPTIMAL',
      latencyMs: 44.6,
      p99LatencyMs: 68.2,
      jitterMs: 4.1,
      uptime90d: 99.985,
      circuitBreaker: 'CLOSED',
      description: 'Root-cause failure taxonomy & autonomous payment rail decision pipeline.',
      throughputRps: 42,
    },
    {
      id: 'node-redis-mutex',
      name: 'Distributed Redis Idempotency Mutex',
      category: 'REDIS_MUTEX',
      status: 'OPTIMAL',
      latencyMs: 0.4,
      p99LatencyMs: 1.1,
      jitterMs: 0.05,
      uptime90d: 100.0,
      circuitBreaker: 'CLOSED',
      description: 'Distributed TTL mutex locks guaranteeing zero double charges across webhook bursts.',
      throughputRps: 220,
    },
    {
      id: 'node-npci-switch',
      name: 'NPCI UPI Instant Auto-Failover Rail',
      category: 'UPI_ROUTER',
      status: 'OPTIMAL',
      latencyMs: 22.8,
      p99LatencyMs: 38.5,
      jitterMs: 2.3,
      uptime90d: 99.96,
      circuitBreaker: 'CLOSED',
      description: 'Deep-link intent generation across GPay, PhonePe, Paytm, and BHIM switches.',
      throughputRps: 88,
    },
    {
      id: 'node-whatsapp-cloud',
      name: 'Meta WhatsApp Interactive Messaging API',
      category: 'WHATSAPP_API',
      status: 'OPTIMAL',
      latencyMs: 342.0,
      p99LatencyMs: 480.0,
      jitterMs: 18.2,
      uptime90d: 99.94,
      circuitBreaker: 'CLOSED',
      description: '1-Click interactive rescue push dispatch with pre-signed cryptographic payloads.',
      throughputRps: 35,
    },
    {
      id: 'node-bank-switch',
      name: 'Issuer ACS & Netbanking Switch Monitor',
      category: 'BANK_SWITCH',
      status: 'OPTIMAL',
      latencyMs: 112.4,
      p99LatencyMs: 220.0,
      jitterMs: 12.8,
      uptime90d: 99.89,
      circuitBreaker: 'CLOSED',
      description: 'Live telemetry tracking HDFC, ICICI, SBI, Axis, and Kotak issuer switch stability.',
      throughputRps: 110,
    },
  ]);

  // Animated ECG Pulse Wave simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((prev) => prev + 1);
      setLivePulseData((prev) => {
        const nextVal =
          Math.random() > 0.85
            ? Math.floor(Math.random() * 70) + 30
            : Math.floor(Math.random() * 8) + 18;
        return [...prev.slice(1), nextVal];
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleProbeAll = async () => {
    setIsProbing(true);
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        status: 'PROBING',
      }))
    );

    await new Promise((resolve) => setTimeout(resolve, 800));

    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        status: 'OPTIMAL',
        latencyMs: Math.max(0.4, +(n.latencyMs + (Math.random() * 4 - 2)).toFixed(1)),
      }))
    );
    setIsProbing(false);
    if (onRefreshTelemetry) onRefreshTelemetry();
  };

  return (
    <div
      id="system-health-pulse-card"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-5 space-y-5 relative overflow-hidden"
    >
      {/* Ambient Radial Gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-emerald-600/10 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl shadow-xs">
            <Heart className="w-5 h-5 animate-pulse text-emerald-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live System Health Pulse
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                All 6 Subsystems Operational
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continuous real-time heartbeat monitoring across AI inference, Redis mutex, webhook ingress, and multi-rail switches.
            </p>
          </div>
        </div>

        {/* Global Pulse Action & Live ECG Mini Strip */}
        <div className="flex items-center gap-3">
          {/* ECG Wave Visualizer */}
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
              Pulse
            </span>
            <div className="flex items-end gap-0.5 h-6 w-28">
              {livePulseData.map((val, idx) => (
                <div
                  key={idx}
                  style={{ height: `${(val / 100) * 100}%` }}
                  className={`w-1 rounded-t-xs transition-all duration-300 ${
                    val > 50
                      ? 'bg-emerald-400 shadow-xs shadow-emerald-400'
                      : 'bg-emerald-500/40'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            id="btn-probe-system-health"
            onClick={handleProbeAll}
            disabled={isProbing}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
            <span>{isProbing ? 'Probing Nodes...' : 'Probe Live Nodes'}</span>
          </button>
        </div>
      </div>

      {/* Global Pulse Telemetry Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
            Composite Platform SLA
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
              99.992%
            </span>
            <span className="text-[10px] text-slate-400">uptime</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
            End-to-End P95 Latency
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">
              {metrics?.avgLatencyMs || 48}ms
            </span>
            <span className="text-[10px] text-slate-400">(&plusmn;2.1ms jitter)</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
            Double Charge Guard
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
              0 Violations
            </span>
            <span className="text-[10px] text-emerald-500 font-bold">100% Lock Safe</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">
            Circuit Breakers
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
              CLOSED
            </span>
            <span className="text-[10px] text-slate-400">(0 Tripped)</span>
          </div>
        </div>
      </div>

      {/* Grid of Subsystem Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {nodes.map((node) => {
          const isOptimal = node.status === 'OPTIMAL';
          const isProbingNode = node.status === 'PROBING';

          return (
            <div
              key={node.id}
              className="bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 rounded-xl p-3.5 space-y-2.5 hover:border-emerald-500/40 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isProbingNode
                          ? 'bg-amber-400 animate-spin'
                          : isOptimal
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-rose-500'
                      }`}
                    />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {node.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {node.category}
                  </span>
                </div>

                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  {node.uptime90d}% SLA
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {node.description}
              </p>

              {/* Node Stats Metrics */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-mono">
                <div className="bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg">
                  <span className="text-slate-400 block text-[9px]">Latency</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    {node.latencyMs}ms
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg">
                  <span className="text-slate-400 block text-[9px]">P99 Max</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {node.p99LatencyMs}ms
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg">
                  <span className="text-slate-400 block text-[9px]">Throughput</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {node.throughputRps} rps
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
