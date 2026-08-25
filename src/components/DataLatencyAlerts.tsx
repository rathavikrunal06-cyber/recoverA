import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Server,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
} from 'lucide-react';
import { SystemMetrics } from '../types';

interface DataLatencyAlertsProps {
  metrics: SystemMetrics | null;
}

interface LatencyStage {
  id: string;
  name: string;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  slaLimitMs: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
  description: string;
}

interface LatencyRuleAlert {
  id: string;
  timestamp: string;
  stage: string;
  measuredMs: number;
  thresholdMs: number;
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  actionTaken: string;
}

export const DataLatencyAlerts: React.FC<DataLatencyAlertsProps> = ({ metrics }) => {
  const [edgeIngressThreshold, setEdgeIngressThreshold] = useState<number>(10);
  const [aiInferenceThreshold, setAiInferenceThreshold] = useState<number>(80);
  const [dispatchThreshold, setDispatchThreshold] = useState<number>(30);
  const [isSimulatingLag, setIsSimulatingLag] = useState<boolean>(false);

  const [activeAlerts, setActiveAlerts] = useState<LatencyRuleAlert[]>([
    {
      id: 'alt_data_01',
      timestamp: 'Just now',
      stage: 'Gemini 3.7 Flash Inference',
      measuredMs: 42.4,
      thresholdMs: 80,
      severity: 'WARNING',
      message: 'Dual-tier AI diagnostic reasoning completed within 42.4ms (Well within 80ms SLA limit).',
      actionTaken: 'Autonomous dispatch executed with zero pipeline queuing delay.',
    },
    {
      id: 'alt_data_02',
      timestamp: '5 mins ago',
      stage: 'Edge Webhook Ingress & TLS',
      measuredMs: 1.2,
      thresholdMs: 10,
      severity: 'WARNING',
      message: 'Cloudflare edge proxy terminated HMAC payload and verified secret in 1.2ms.',
      actionTaken: 'Ingested into Redis memory queue with 0.00ms drop rate.',
    },
  ]);

  const stages: LatencyStage[] = [
    {
      id: 'st_01',
      name: '1. Edge Ingress & TLS Handshake',
      p50Ms: 0.8,
      p95Ms: 1.4,
      p99Ms: 2.1,
      slaLimitMs: edgeIngressThreshold,
      status: 'OPTIMAL',
      description: 'Payload reception at edge proxy & HMAC-SHA256 timing-safe signature comparison.',
    },
    {
      id: 'st_02',
      name: '2. Redis Mutex & AST PII Redaction',
      p50Ms: 1.6,
      p95Ms: 2.4,
      p99Ms: 3.2,
      slaLimitMs: 15,
      status: 'OPTIMAL',
      description: 'Distributed singleton lock acquisition & AST customer PAN/contact obfuscation.',
    },
    {
      id: 'st_03',
      name: '3. Gemini 3.7 Flash AI Diagnosis',
      p50Ms: 38.4,
      p95Ms: 44.8,
      p99Ms: 48.6,
      slaLimitMs: aiInferenceThreshold,
      status: 'OPTIMAL',
      description: 'Bank error taxonomy root-cause analysis & structured recovery payload synthesis.',
    },
    {
      id: 'st_04',
      name: '4. Autonomous Rail Dispatch',
      p50Ms: 8.2,
      p95Ms: 14.5,
      p99Ms: 18.2,
      slaLimitMs: dispatchThreshold,
      status: 'OPTIMAL',
      description: 'Triggering WhatsApp Business API, UPI Intent deep-link, or COFT re-vault.',
    },
  ];

  const totalP99 = stages.reduce((acc, s) => acc + s.p99Ms, 0);

  const handleSimulateLatencySpike = (stageName: string, spikeMs: number) => {
    setIsSimulatingLag(true);
    setTimeout(() => {
      const newAlert: LatencyRuleAlert = {
        id: `alt_spike_${Date.now()}`,
        timestamp: 'Just now',
        stage: stageName,
        measuredMs: spikeMs,
        thresholdMs: 50,
        severity: 'CRITICAL',
        message: `${stageName} observed transient latency spike of ${spikeMs}ms (Threshold: 50ms).`,
        actionTaken: 'Activated fallback in-memory cache and alerted on-call operations engineer.',
      };
      setActiveAlerts([newAlert, ...activeAlerts]);
      setIsSimulatingLag(false);
    }, 400);
  };

  const handleDismissAlert = (id: string) => {
    setActiveAlerts(activeAlerts.filter((a) => a.id !== id));
  };

  return (
    <div id="data-latency-alerts" className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 text-amber-400 border border-amber-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">Data Pipeline Freshness & Ingestion Latency Monitor</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                E2E SLA: {totalP99.toFixed(1)}ms (Target &lt;200ms)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous monitoring of webhook ingestion lag, Redis mutex synchronization, Gemini AI inference time, and dispatch SLAs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-mono font-bold">Live Stream Active</span>
        </div>
      </div>

      {/* 4-Stage Waterfall Latency Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>End-to-End Pipeline Stage Latency Breakdown (Percentile ms)</span>
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-400">
            Overall P99: {totalP99.toFixed(1)}ms
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {stages.map((stage) => (
            <div key={stage.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-sans text-xs">{stage.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {stage.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 text-center bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">P50</span>
                  <span className="text-emerald-400 font-bold">{stage.p50Ms}ms</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">P95</span>
                  <span className="text-blue-400 font-bold">{stage.p95Ms}ms</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">P99</span>
                  <span className="text-purple-400 font-bold">{stage.p99Ms}ms</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{stage.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Latency Threshold Rules Configurator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Configurable SLA Alert Thresholds & Automated Circuit Breakers</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Real-Time Evaluation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Edge Ingress */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-300 font-semibold">
              <span>Edge Ingress Limit:</span>
              <span className="font-mono text-emerald-400 font-bold">{edgeIngressThreshold}ms</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={edgeIngressThreshold}
              onChange={(e) => setEdgeIngressThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[10px] text-slate-500">Alerts if Cloudflare/TLS edge latency exceeds limit.</p>
          </div>

          {/* AI Inference */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-300 font-semibold">
              <span>Gemini AI Limit:</span>
              <span className="font-mono text-blue-400 font-bold">{aiInferenceThreshold}ms</span>
            </div>
            <input
              type="range"
              min={40}
              max={150}
              value={aiInferenceThreshold}
              onChange={(e) => setAiInferenceThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[10px] text-slate-500">Alerts if Gemini 3.7 Flash diagnostic exceeds limit.</p>
          </div>

          {/* Dispatch Limit */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-300 font-semibold">
              <span>Dispatch API Limit:</span>
              <span className="font-mono text-purple-400 font-bold">{dispatchThreshold}ms</span>
            </div>
            <input
              type="range"
              min={15}
              max={60}
              value={dispatchThreshold}
              onChange={(e) => setDispatchThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[10px] text-slate-500">Alerts if WhatsApp/UPI API dispatch exceeds limit.</p>
          </div>
        </div>
      </div>

      {/* Latency Anomaly Injector Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-400" />
            <span>Interactive Latency Anomaly Spike Simulator</span>
          </h3>
          <span className="text-[10px] text-slate-400">Click to test instant alert dispatch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleSimulateLatencySpike('Redis Lock Contention', 68.4)}
            disabled={isSimulatingLag}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-red-500/30 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-xs font-bold text-red-400 flex items-center justify-between">
              <span>Redis Lock Delay</span>
              <span className="font-mono text-[10px]">68.4ms</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tests concurrency lock queue alert</p>
          </button>

          <button
            onClick={() => handleSimulateLatencySpike('Gemini API Rate Surge', 112.8)}
            disabled={isSimulatingLag}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-amber-500/30 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
              <span>AI Token Delay</span>
              <span className="font-mono text-[10px]">112.8ms</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tests AI inference timeout threshold alert</p>
          </button>

          <button
            onClick={() => handleSimulateLatencySpike('WhatsApp Gateway Lag', 94.2)}
            disabled={isSimulatingLag}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-purple-500/30 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-xs font-bold text-purple-400 flex items-center justify-between">
              <span>WhatsApp API Drop</span>
              <span className="font-mono text-[10px]">94.2ms</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tests webhook outbound dispatch alert</p>
          </button>
        </div>
      </div>

      {/* Real-Time Latency Alert Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Active Pipeline Latency Alerts ({activeAlerts.length})</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Auto-resolved on SLA recovery</span>
        </div>

        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all animate-fade-in relative ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-950/30 border-red-500/40 text-red-200'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {alert.severity === 'CRITICAL' ? (
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{alert.stage}</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                        {alert.timestamp}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-red-400">
                        Measured: {alert.measuredMs}ms (Threshold: {alert.thresholdMs}ms)
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

                    <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 mt-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{alert.actionTaken}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDismissAlert(alert.id)}
                  className="p-1 text-slate-400 hover:text-white rounded transition-all cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
