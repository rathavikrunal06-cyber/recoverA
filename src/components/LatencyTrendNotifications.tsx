import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Layers,
  Activity,
  ShieldCheck,
  RotateCcw,
  Volume2,
  X,
} from 'lucide-react';
import { SystemMetrics } from '../types';

interface LatencyTrendNotificationsProps {
  metrics: SystemMetrics | null;
}

interface LatencyAlert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  title: string;
  message: string;
  bank: string;
  observedLatencyMs: number;
  thresholdMs: number;
  autonomousActionTaken: string;
}

export const LatencyTrendNotifications: React.FC<LatencyTrendNotificationsProps> = ({ metrics }) => {
  const [alertThresholdMs, setAlertThresholdMs] = useState<number>(1500);
  const [alerts, setAlerts] = useState<LatencyAlert[]>([
    {
      id: 'alt_01',
      type: 'CRITICAL',
      timestamp: '2 mins ago',
      title: 'HDFC Core Banking Switch Latency Surge',
      message: 'HDFC netbanking p99 latency surged to 2,120ms (Threshold: 1,500ms). Failure rate increased to 24.8%.',
      bank: 'HDFC',
      observedLatencyMs: 2120,
      thresholdMs: 1500,
      autonomousActionTaken: 'Autonomous Failover: Routed 100% of at-risk checkouts to NPCI UPI Intent Fast-Switch. Recovered 94.2% GMV.',
    },
    {
      id: 'alt_02',
      type: 'WARNING',
      timestamp: '14 mins ago',
      title: 'SBI 3DS SMS Delivery Latency Degraded',
      message: 'SBI telecom SMS OTP delivery delay reached 4,800ms. High cart abandonment risk detected.',
      bank: 'SBI',
      observedLatencyMs: 4800,
      thresholdMs: 3000,
      autonomousActionTaken: 'Pre-Warmed WhatsApp 1-Click Collect rail for orders >₹5,000. Rescued 88.6% of carts.',
    },
    {
      id: 'alt_03',
      type: 'INFO',
      timestamp: '32 mins ago',
      title: 'Gemini 3.7 Flash Sub-40ms Inference Baseline',
      message: 'Dual-tier intelligence pipeline maintained p50 latency of 38.4ms across 484 failure telemetry evaluations.',
      bank: 'All Banks',
      observedLatencyMs: 38.4,
      thresholdMs: 200,
      autonomousActionTaken: 'SLA <200ms fully satisfied with 0.00% dropped webhooks.',
    },
  ]);

  const [isSimulatingSpike, setIsSimulatingSpike] = useState<boolean>(false);

  const handleSimulateLatencySpike = (bankName: string, spikeMs: number) => {
    setIsSimulatingSpike(true);
    setTimeout(() => {
      const newAlert: LatencyAlert = {
        id: `alt_${Date.now()}`,
        type: 'CRITICAL',
        timestamp: 'Just now',
        title: `${bankName} Gateway Timeout Spike Injected (${spikeMs}ms)`,
        message: `Simulated latency spike of ${spikeMs}ms on ${bankName} switch detected by real-time health probe.`,
        bank: bankName,
        observedLatencyMs: spikeMs,
        thresholdMs: alertThresholdMs,
        autonomousActionTaken: `Autonomous circuit breaker triggered: Rerouted traffic to UPI Intent & WhatsApp rails immediately.`,
      };
      setAlerts([newAlert, ...alerts]);
      setIsSimulatingSpike(false);
    }, 500);
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const latencyTrends = [
    { time: '12:00', hdfc: 420, sbi: 380, icici: 210, geminiAi: 38 },
    { time: '12:15', hdfc: 480, sbi: 410, icici: 230, geminiAi: 41 },
    { time: '12:30', hdfc: 1250, sbi: 450, icici: 220, geminiAi: 39 },
    { time: '12:45', hdfc: 2120, sbi: 980, icici: 240, geminiAi: 42 },
    { time: '13:00', hdfc: 1850, sbi: 1450, icici: 250, geminiAi: 38 },
    { time: '13:15', hdfc: 650, sbi: 620, icici: 215, geminiAi: 40 },
  ];

  return (
    <div id="latency-trend-notifications" className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">Real-Time Latency Trend Notifications & SLA Monitor</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Live Alert Webhooks Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Proactive bank switch degradation alarms, SLA threshold alerts, and instant autonomous failover triggers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">Alert Trigger Threshold:</span>
          <select
            value={alertThresholdMs}
            onChange={(e) => setAlertThresholdMs(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono font-bold"
          >
            <option value={800}>800ms (Aggressive)</option>
            <option value={1500}>1,500ms (Standard E-Com)</option>
            <option value={2500}>2,500ms (High Tolerance)</option>
          </select>
        </div>
      </div>

      {/* Latency Spike Simulator Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400" />
            <span>Interactive Latency Spike & Alert Simulator</span>
          </h3>
          <span className="text-[10px] text-slate-400">Click a button to test autonomous alert trigger</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleSimulateLatencySpike('HDFC Netbanking', 2450)}
            disabled={isSimulatingSpike}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-red-500/30 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-xs font-bold text-red-400 flex items-center justify-between">
              <span>HDFC 504 Timeout Spike</span>
              <span className="font-mono text-[10px]">2,450ms</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Triggers immediate failover to UPI Intent rail</p>
          </button>

          <button
            onClick={() => handleSimulateLatencySpike('SBI Card 3DS', 3800)}
            disabled={isSimulatingSpike}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-amber-500/30 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
              <span>SBI 3DS OTP Delay</span>
              <span className="font-mono text-[10px]">3,800ms</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Triggers WhatsApp 1-Click Pay pre-warming</p>
          </button>

          <button
            onClick={() => handleSimulateLatencySpike('Axis Core Switch', 1900)}
            disabled={isSimulatingSpike}
            className="p-3 bg-slate-950 hover:bg-slate-800 border border-blue-500/30 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-xs font-bold text-blue-400 flex items-center justify-between">
              <span>Axis Switch Degradation</span>
              <span className="font-mono text-[10px]">1,900ms</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Triggers Biometric Token Vault re-verification</p>
          </button>
        </div>
      </div>

      {/* Latency Trend Historical Timeline Visual */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Rolling Gateway vs AI Inference Latency Timeline (ms)</span>
          </h3>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500" /> HDFC</span>
            <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500" /> SBI</span>
            <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Gemini 3.7 Flash AI</span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2 text-center text-xs font-mono">
          {latencyTrends.map((t, idx) => (
            <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="text-[10px] text-slate-500 font-bold">{t.time}</div>
              <div className="text-red-400 text-[11px] font-bold">{t.hdfc}ms</div>
              <div className="text-amber-400 text-[10px]">{t.sbi}ms</div>
              <div className="text-emerald-400 text-[10px] font-bold">{t.geminiAi}ms</div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Notifications Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Active Latency Trend Notifications Feed ({alerts.length})</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Auto-Refreshes on Threshold Breach</span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all animate-fade-in relative ${
                alert.type === 'CRITICAL'
                  ? 'bg-red-950/30 border-red-500/40 text-red-200'
                  : alert.type === 'WARNING'
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {alert.type === 'CRITICAL' ? (
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  ) : alert.type === 'WARNING' ? (
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{alert.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                        {alert.timestamp}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-red-400">
                        {alert.observedLatencyMs}ms (Threshold: {alert.thresholdMs}ms)
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

                    <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 mt-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{alert.autonomousActionTaken}</span>
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
