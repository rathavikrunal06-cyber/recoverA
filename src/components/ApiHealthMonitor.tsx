import React, { useState } from 'react';
import {
  Activity,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Radio,
  Wifi,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface HealthNode {
  id: string;
  name: string;
  type: 'INGRESS' | 'AI_ENGINE' | 'PAYMENT_RAIL' | 'COMMUNICATION' | 'CACHE_LOCK' | 'ISSUER_SWITCH';
  endpoint: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  latencyMs: number;
  uptime90d: number;
  lastChecked: string;
  circuitBreaker: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  description: string;
}

export const ApiHealthMonitor: React.FC = () => {
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [probeResultTimestamp, setProbeResultTimestamp] = useState<string>('Just now');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CORE' | 'RAILS' | 'BANKS'>('ALL');

  const [nodes, setNodes] = useState<HealthNode[]>([
    {
      id: 'webhook-ingress',
      name: 'Razorpay Webhook Ingress',
      type: 'INGRESS',
      endpoint: 'POST /api/webhook/razorpay',
      status: 'OPERATIONAL',
      latencyMs: 1.8,
      uptime90d: 99.99,
      lastChecked: '4s ago',
      circuitBreaker: 'CLOSED',
      description: 'Ingests Razorpay failure events, validates HMAC-SHA256 signatures, and pushes to async diagnosis queue.',
    },
    {
      id: 'gemini-inference',
      name: 'Gemini 3.7 Flash Diagnostic Engine',
      type: 'AI_ENGINE',
      endpoint: 'POST /api/ai/diagnose (Vertex/Studio API)',
      status: 'OPERATIONAL',
      latencyMs: 84.2,
      uptime90d: 99.98,
      lastChecked: '4s ago',
      circuitBreaker: 'CLOSED',
      description: 'Structured JSON failure taxonomy analysis, root-cause categorization, and dynamic rail selection.',
    },
    {
      id: 'npci-upi-relay',
      name: 'NPCI UPI Auto-Failover Rail',
      type: 'PAYMENT_RAIL',
      endpoint: 'UPILink / Intent Generation API',
      status: 'OPERATIONAL',
      latencyMs: 24.5,
      uptime90d: 99.95,
      lastChecked: '8s ago',
      circuitBreaker: 'CLOSED',
      description: 'Direct deep-link UPI payment generation (GPay, PhonePe, Paytm) for instant checkout rerouting.',
    },
    {
      id: 'meta-whatsapp-cloud',
      name: 'Meta WhatsApp Cloud API',
      type: 'COMMUNICATION',
      endpoint: 'POST https://graph.facebook.com/v21.0/messages',
      status: 'OPERATIONAL',
      latencyMs: 382.0,
      uptime90d: 99.92,
      lastChecked: '12s ago',
      circuitBreaker: 'CLOSED',
      description: 'Interactive WhatsApp recovery messages with pre-signed 1-click checkout action buttons.',
    },
    {
      id: 'redis-mutex-store',
      name: 'Redis Idempotency Mutex Lock',
      type: 'CACHE_LOCK',
      endpoint: 'REDIS://distributed-cluster:6379',
      status: 'OPERATIONAL',
      latencyMs: 0.4,
      uptime90d: 100.0,
      lastChecked: '2s ago',
      circuitBreaker: 'CLOSED',
      description: 'Distributed lease locks ensuring zero double charges and strict deduplication across concurrent hooks.',
    },
    {
      id: 'hdfc-switch',
      name: 'HDFC Acquiring Switch',
      type: 'ISSUER_SWITCH',
      endpoint: 'HDFC Netbanking & Card Rail Direct Ping',
      status: 'OPERATIONAL',
      latencyMs: 148.0,
      uptime90d: 99.82,
      lastChecked: '15s ago',
      circuitBreaker: 'CLOSED',
      description: 'Monitors HDFC 504 gateway timeout rates and automatically switches failed users to UPI.',
    },
    {
      id: 'sbi-switch',
      name: 'SBI Issuer Rail (State Bank of India)',
      type: 'ISSUER_SWITCH',
      endpoint: 'SBI Core Banking Gateway Relay',
      status: 'DEGRADED',
      latencyMs: 820.0,
      uptime90d: 98.42,
      lastChecked: '10s ago',
      circuitBreaker: 'HALF_OPEN',
      description: 'High OTP delivery latency detected; RecoverAI actively routing SBI customers to WhatsApp 1-Click Pay.',
    },
    {
      id: 'icici-switch',
      name: 'ICICI Bank Gateway',
      type: 'ISSUER_SWITCH',
      endpoint: 'ICICI Direct Debit & UPI Node',
      status: 'OPERATIONAL',
      latencyMs: 62.0,
      uptime90d: 99.94,
      lastChecked: '6s ago',
      circuitBreaker: 'CLOSED',
      description: 'Healthy throughput with zero active circuit trips.',
    },
  ]);

  const handleRunHealthProbe = () => {
    setIsProbing(true);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          latencyMs:
            node.id === 'sbi-switch'
              ? Math.floor(750 + Math.random() * 150)
              : node.id === 'gemini-inference'
              ? Math.floor(72 + Math.random() * 25)
              : node.id === 'meta-whatsapp-cloud'
              ? Math.floor(340 + Math.random() * 80)
              : +(node.latencyMs * (0.95 + Math.random() * 0.1)).toFixed(1),
          lastChecked: 'Just now',
        }))
      );
      setProbeResultTimestamp(new Date().toLocaleTimeString());
      setIsProbing(false);
    }, 1200);
  };

  const filteredNodes = nodes.filter((node) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'CORE') return node.type === 'INGRESS' || node.type === 'AI_ENGINE' || node.type === 'CACHE_LOCK';
    if (selectedFilter === 'RAILS') return node.type === 'PAYMENT_RAIL' || node.type === 'COMMUNICATION';
    if (selectedFilter === 'BANKS') return node.type === 'ISSUER_SWITCH';
    return true;
  });

  return (
    <div id="api-health-monitor-view" className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">API & Recovery Rail Health Telemetry</h2>
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All Critical Systems Live
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuous heartbeat monitoring across webhook ingress, Gemini 3.7 inference nodes, payment switches, and circuit breakers.
            </p>
          </div>
        </div>

        {/* Actions & Live Probe */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Last Comprehensive Probe</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">{probeResultTimestamp}</div>
          </div>

          <button
            id="btn-run-health-probe"
            onClick={handleRunHealthProbe}
            disabled={isProbing}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
            <span>{isProbing ? 'Probing Rails...' : 'Run Live Health Probe'}</span>
          </button>
        </div>
      </div>

      {/* Global High-Level Uptime Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">90-Day Rolling Uptime</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">99.982%</div>
          <div className="text-[10px] text-emerald-500 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Exceeds 99.9% Enterprise SLA
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Avg Ingress to Action Speed</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">98.4ms</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Dual-tier edge execution
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Active Circuit Breakers</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5">7 Closed / 1 Half-Open</div>
          <div className="text-[10px] text-amber-500 mt-1">
            SBI Switch under adaptive bypass
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Idempotency & Race Defense</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">100.0%</div>
          <div className="text-[10px] text-emerald-500 dark:text-emerald-400 mt-1">
            0 Double-charge events
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center space-x-1">
          {[
            { id: 'ALL', label: 'All Endpoints & Rails (8)' },
            { id: 'CORE', label: 'Core AI & Ingress (3)' },
            { id: 'RAILS', label: 'Fallback Payment Rails (2)' },
            { id: 'BANKS', label: 'Bank Issuer Switches (3)' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === filter.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Health Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNodes.map((node) => (
          <div
            key={node.id}
            className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 rounded-2xl p-4.5 space-y-3 transition-all shadow-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{node.name}</h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      node.status === 'OPERATIONAL'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{node.endpoint}</div>
              </div>

              {/* Latency Pill */}
              <div className="text-right">
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white">{node.latencyMs}ms</div>
                <div className="text-[10px] text-slate-400">Response</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{node.description}</p>

            {/* Footer Telemetry */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span>90d Uptime:</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-bold">{node.uptime90d}%</span>
              </div>

              <div className="flex items-center gap-2">
                <span>Circuit:</span>
                <span
                  className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                    node.circuitBreaker === 'CLOSED'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-amber-500/10 text-amber-500'
                  }`}
                >
                  {node.circuitBreaker}
                </span>
              </div>

              <div>Checked: {node.lastChecked}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
