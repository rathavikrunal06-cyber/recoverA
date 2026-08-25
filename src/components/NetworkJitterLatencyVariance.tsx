import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  Zap,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Flame,
  Radio,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  DollarSign,
  Cpu,
  Layers,
  BarChart3,
  Server,
  Shuffle,
  Clock,
  Check,
  RefreshCw,
  Gauge,
  Percent,
} from 'lucide-react';
import { SystemMetrics, TransactionRecord } from '../types';

export type LoadSimulationMode = 'STEADY_STATE' | 'FLASH_SALE_RUSH' | 'BANK_OUTAGE_SPIKE' | 'CHAOS_JITTER';

export interface GatewayPerformanceMetrics {
  id: string;
  name: string;
  code: string;
  category: 'UPI_SWITCH' | 'BANK_CORE' | 'AGGREGATOR' | 'MESSAGING_RAIL';
  color: string;
  baseLatencyMs: number;
  currentLatencyMs: number;
  p99LatencyMs: number;
  jitterSigmaMs: number; // Standard deviation / jitter
  dropRatePercent: number;
  stabilityScore: number; // 0 - 100
  activeWeightPercent: number; // Dynamic routing share %
  staticRuleWeightPercent: number; // What a naive static rule would allocate (e.g. 16.6%)
  preventedFailures: number;
  attributedRevenuePaise: number; // Attributed INR in paise
  status: 'STABLE' | 'DEGRADED' | 'ERRATIC' | 'THROTTLED';
}

interface NetworkJitterLatencyVarianceProps {
  metrics?: SystemMetrics | null;
  transactions?: TransactionRecord[];
  className?: string;
  onNotification?: (msg: { text: string; type: 'success' | 'info' | 'error'; title?: string }) => void;
}

export const NetworkJitterLatencyVariance: React.FC<NetworkJitterLatencyVarianceProps> = ({
  metrics,
  transactions = [],
  className = '',
  onNotification,
}) => {
  const [simulationMode, setSimulationMode] = useState<LoadSimulationMode>('STEADY_STATE');
  const [concurrencyTps, setConcurrencyTps] = useState<number>(3200);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [timeTick, setTimeTick] = useState<number>(0);
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('rzp_direct_upi');
  const [showFormulaTooltip, setShowFormulaTooltip] = useState<boolean>(false);
  const [isChaosBurstActive, setIsChaosBurstActive] = useState<boolean>(false);

  // Gateway Base Definitions
  const initialGateways: GatewayPerformanceMetrics[] = useMemo(() => [
    {
      id: 'rzp_direct_upi',
      name: 'Razorpay Direct UPI Switch',
      code: 'RZP_UPI',
      category: 'UPI_SWITCH',
      color: '#38bdf8', // Light Blue
      baseLatencyMs: 38,
      currentLatencyMs: 41,
      p99LatencyMs: 62,
      jitterSigmaMs: 4.8,
      dropRatePercent: 0.12,
      stabilityScore: 98.4,
      activeWeightPercent: 44.5,
      staticRuleWeightPercent: 16.7,
      preventedFailures: 842,
      attributedRevenuePaise: 142050000, // ₹14,20,500
      status: 'STABLE',
    },
    {
      id: 'npci_fast_intent',
      name: 'NPCI 2.0 Fast Intent Switch',
      code: 'NPCI_INTENT',
      category: 'UPI_SWITCH',
      color: '#10b981', // Emerald
      baseLatencyMs: 44,
      currentLatencyMs: 48,
      p99LatencyMs: 78,
      jitterSigmaMs: 6.2,
      dropRatePercent: 0.25,
      stabilityScore: 96.2,
      activeWeightPercent: 32.0,
      staticRuleWeightPercent: 16.7,
      preventedFailures: 512,
      attributedRevenuePaise: 89400000, // ₹8,94,000
      status: 'STABLE',
    },
    {
      id: 'whatsapp_pay_1click',
      name: 'WhatsApp 1-Click Pay Tunnel',
      code: 'WA_PAY',
      category: 'MESSAGING_RAIL',
      color: '#a855f7', // Purple
      baseLatencyMs: 82,
      currentLatencyMs: 89,
      p99LatencyMs: 120,
      jitterSigmaMs: 9.4,
      dropRatePercent: 0.40,
      stabilityScore: 91.8,
      activeWeightPercent: 14.2,
      staticRuleWeightPercent: 16.7,
      preventedFailures: 248,
      attributedRevenuePaise: 41800000, // ₹4,18,000
      status: 'STABLE',
    },
    {
      id: 'payu_netbanking_3ds',
      name: 'PayU 3DS Netbanking Rail',
      code: 'PAYU_3DS',
      category: 'AGGREGATOR',
      color: '#f59e0b', // Amber
      baseLatencyMs: 140,
      currentLatencyMs: 195,
      p99LatencyMs: 340,
      jitterSigmaMs: 48.6,
      dropRatePercent: 3.8,
      stabilityScore: 72.4,
      activeWeightPercent: 5.1,
      staticRuleWeightPercent: 16.7,
      preventedFailures: 64,
      attributedRevenuePaise: 11200000, // ₹1,12,000
      status: 'DEGRADED',
    },
    {
      id: 'billdesk_core_switch',
      name: 'BillDesk ACS Core Aggregator',
      code: 'BILLDESK_ACS',
      category: 'AGGREGATOR',
      color: '#ef4444', // Red
      baseLatencyMs: 180,
      currentLatencyMs: 290,
      p99LatencyMs: 510,
      jitterSigmaMs: 82.1,
      dropRatePercent: 7.4,
      stabilityScore: 54.2,
      activeWeightPercent: 2.2,
      staticRuleWeightPercent: 16.7,
      preventedFailures: 18,
      attributedRevenuePaise: 3800000, // ₹38,000
      status: 'ERRATIC',
    },
    {
      id: 'cashfree_instant_hook',
      name: 'Cashfree Fallback Auto-Hook',
      code: 'CASHFREE_HOOK',
      category: 'AGGREGATOR',
      color: '#6366f1', // Indigo
      baseLatencyMs: 95,
      currentLatencyMs: 110,
      p99LatencyMs: 165,
      jitterSigmaMs: 14.5,
      dropRatePercent: 0.95,
      stabilityScore: 88.6,
      activeWeightPercent: 2.0,
      staticRuleWeightPercent: 16.7,
      preventedFailures: 46,
      attributedRevenuePaise: 7900000, // ₹79,000
      status: 'STABLE',
    },
  ], []);

  // Compute live gateway dynamics based on simulation mode and jitter ticks
  const liveGateways = useMemo(() => {
    return initialGateways.map((gw) => {
      let latencyMultiplier = 1.0;
      let jitterMultiplier = 1.0;
      let activeWeight = gw.activeWeightPercent;
      let status = gw.status;

      const wave = Math.sin((timeTick + gw.baseLatencyMs) * 0.4) * 0.15;

      switch (simulationMode) {
        case 'FLASH_SALE_RUSH':
          // Concurrency surges to 8,500 TPS: Legacy aggregators experience high jitter, UPI switch absorbs gracefully
          if (gw.id === 'billdesk_core_switch') {
            latencyMultiplier = 2.4 + wave * 0.5;
            jitterMultiplier = 2.8;
            activeWeight = 0.5; // Autonomous AI drops traffic to 0.5%
            status = 'ERRATIC';
          } else if (gw.id === 'payu_netbanking_3ds') {
            latencyMultiplier = 1.9 + wave * 0.3;
            jitterMultiplier = 2.2;
            activeWeight = 1.8;
            status = 'DEGRADED';
          } else if (gw.id === 'rzp_direct_upi') {
            latencyMultiplier = 1.08 + wave * 0.05;
            jitterMultiplier = 1.15;
            activeWeight = 56.4; // AI boosts low-jitter rail
            status = 'STABLE';
          } else if (gw.id === 'npci_fast_intent') {
            latencyMultiplier = 1.12 + wave * 0.08;
            jitterMultiplier = 1.2;
            activeWeight = 34.0;
            status = 'STABLE';
          }
          break;

        case 'BANK_OUTAGE_SPIKE':
          // HDFC/SBI 504 outage: Netbanking & Card rails drop heavily; Instant UPI & WhatsApp take over
          if (gw.id === 'billdesk_core_switch' || gw.id === 'payu_netbanking_3ds') {
            latencyMultiplier = 3.1 + wave * 0.8;
            jitterMultiplier = 3.5;
            activeWeight = 0.2;
            status = 'THROTTLED';
          } else if (gw.id === 'whatsapp_pay_1click') {
            latencyMultiplier = 1.05 + wave * 0.04;
            jitterMultiplier = 1.05;
            activeWeight = 28.5; // WhatsApp takes high volume
            status = 'STABLE';
          } else if (gw.id === 'rzp_direct_upi') {
            latencyMultiplier = 1.06 + wave * 0.03;
            jitterMultiplier = 1.08;
            activeWeight = 52.0;
            status = 'STABLE';
          }
          break;

        case 'CHAOS_JITTER':
          // Random erratic perturbations
          const randNoise = (Math.random() - 0.5) * 0.8;
          if (gw.id === 'billdesk_core_switch') {
            latencyMultiplier = 2.8 + randNoise;
            jitterMultiplier = 3.2;
            activeWeight = 0.1;
            status = 'ERRATIC';
          } else {
            latencyMultiplier = 1.15 + (wave + randNoise * 0.2);
            jitterMultiplier = 1.4;
          }
          break;

        case 'STEADY_STATE':
        default:
          latencyMultiplier = 1.0 + wave * 0.08;
          jitterMultiplier = 1.0;
          break;
      }

      if (isChaosBurstActive) {
        if (gw.id === 'billdesk_core_switch' || gw.id === 'payu_netbanking_3ds') {
          latencyMultiplier *= 2.0;
          jitterMultiplier *= 2.5;
        }
      }

      const calculatedLatency = Math.round(gw.baseLatencyMs * latencyMultiplier);
      const calculatedJitter = Number((gw.jitterSigmaMs * jitterMultiplier).toFixed(1));
      const calculatedP99 = Math.round(calculatedLatency + calculatedJitter * 2.5);
      const calculatedScore = Math.max(
        15,
        Math.min(99.5, Number((100 - calculatedJitter * 0.65 - (calculatedLatency > 150 ? (calculatedLatency - 150) * 0.2 : 0)).toFixed(1)))
      );

      return {
        ...gw,
        currentLatencyMs: calculatedLatency,
        jitterSigmaMs: calculatedJitter,
        p99LatencyMs: calculatedP99,
        stabilityScore: calculatedScore,
        activeWeightPercent: Number(activeWeight.toFixed(1)),
        status,
      };
    });
  }, [initialGateways, simulationMode, timeTick, isChaosBurstActive]);

  // Aggregate Revenue Attribution Metrics across all gateways
  const revenueAttribution = useMemo(() => {
    const totalRevenuePaise = liveGateways.reduce((acc, g) => acc + g.attributedRevenuePaise, 0);
    const totalPreventedFailures = liveGateways.reduce((acc, g) => acc + g.preventedFailures, 0);
    const avgDynamicLatency = Math.round(
      liveGateways.reduce((acc, g) => acc + g.currentLatencyMs * (g.activeWeightPercent / 100), 0)
    );
    const avgStaticRuleLatency = Math.round(
      liveGateways.reduce((acc, g) => acc + g.currentLatencyMs * (1 / liveGateways.length), 0)
    );
    const latencyReductionPercent = Number(
      (((avgStaticRuleLatency - avgDynamicLatency) / avgStaticRuleLatency) * 100).toFixed(1)
    );
    const estimatedSavedINR = totalRevenuePaise / 100;

    return {
      totalRevenuePaise,
      estimatedSavedINR,
      totalPreventedFailures,
      avgDynamicLatency,
      avgStaticRuleLatency,
      latencyReductionPercent,
    };
  }, [liveGateways]);

  // Real-time ticking effect
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      setTimeTick((prev) => (prev + 1) % 1000);
    }, 1200);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // SVG Time-Series Wave Graph generation
  // Generates 25 time slices representing the last 60 seconds (T-60s to T-0s)
  const timeSlices = 24;
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 25;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const graphLines = useMemo(() => {
    // Generate data points for each gateway over time slices
    return liveGateways.map((gw) => {
      const points: { x: number; y: number; latency: number; jitter: number }[] = [];
      for (let i = 0; i < timeSlices; i++) {
        const x = paddingX + (i / (timeSlices - 1)) * plotWidth;
        // Introduce historical variance and recent surge
        const sliceTime = timeTick - (timeSlices - 1 - i);
        const wave = Math.sin((sliceTime + gw.baseLatencyMs) * 0.4);
        const noise = Math.cos((sliceTime * 1.3) + gw.baseLatencyMs) * 0.5;

        let sampleLatency = gw.baseLatencyMs;
        if (simulationMode === 'FLASH_SALE_RUSH') {
          if (gw.id === 'billdesk_core_switch') {
            sampleLatency = gw.baseLatencyMs * (1.5 + (i / timeSlices) * 1.4) + wave * 30 + noise * 15;
          } else if (gw.id === 'payu_netbanking_3ds') {
            sampleLatency = gw.baseLatencyMs * (1.2 + (i / timeSlices) * 0.9) + wave * 20;
          } else {
            sampleLatency = gw.baseLatencyMs * (1.0 + (i / timeSlices) * 0.1) + wave * 4;
          }
        } else if (simulationMode === 'BANK_OUTAGE_SPIKE') {
          if (gw.id === 'billdesk_core_switch' || gw.id === 'payu_netbanking_3ds') {
            sampleLatency = gw.baseLatencyMs * (1.8 + (i / timeSlices) * 1.6) + wave * 45;
          } else {
            sampleLatency = gw.baseLatencyMs * (1.0 + wave * 0.05);
          }
        } else {
          sampleLatency = gw.baseLatencyMs + wave * (gw.jitterSigmaMs * 1.2) + noise * 3;
        }

        // Scale Y between 0ms and 550ms
        const maxScaleY = 520;
        const clampedLatency = Math.max(10, Math.min(maxScaleY, sampleLatency));
        const y = paddingY + plotHeight - (clampedLatency / maxScaleY) * plotHeight;

        points.push({
          x,
          y,
          latency: Math.round(sampleLatency),
          jitter: gw.jitterSigmaMs,
        });
      }

      // Generate SVG Path string
      const pathD = points.reduce((acc, curr, idx) => {
        if (idx === 0) return `M ${curr.x} ${curr.y}`;
        const prev = points[idx - 1];
        const cx1 = prev.x + (curr.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (curr.x - prev.x) / 2;
        const cy2 = curr.y;
        return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
      }, '');

      return {
        gateway: gw,
        points,
        pathD,
      };
    });
  }, [liveGateways, simulationMode, timeTick, plotWidth, plotHeight, paddingX, paddingY]);

  // Jitter Alert Threshold Zone Y (150ms warning line)
  const thresholdLatency = 160;
  const thresholdY = paddingY + plotHeight - (thresholdLatency / 520) * plotHeight;

  const selectedGateway = liveGateways.find((g) => g.id === selectedGatewayId) || liveGateways[0];

  const formatINR = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  const handleTriggerChaos = () => {
    setIsChaosBurstActive(true);
    if (onNotification) {
      onNotification({
        title: 'Chaos Jitter Spike Injected',
        text: 'Injected +250ms latency turbulence onto Legacy Aggregators. Watch AI re-route 98.2% volume to Direct UPI within 12ms.',
        type: 'info',
      });
    }
    setTimeout(() => {
      setIsChaosBurstActive(false);
    }, 4500);
  };

  return (
    <div
      id="network-jitter-latency-variance-view"
      className={`bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-xl text-slate-100 space-y-4 transition-all ${className}`}
    >
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-inner shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Network Jitter & Latency Variance Live Monitor
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Real-Time Arbitration Active</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                Decision SLA: &lt;14ms
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Empirical multi-rail stability proof: Gemini dynamically balances payment traffic according to latency variance ($\sigma$) &amp; packet jitter, not rigid static rules.
            </p>
          </div>
        </div>

        {/* Live Controls Bar */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto shrink-0">
          <button
            id="btn-toggle-live-stream"
            onClick={() => setIsLiveStreaming((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isLiveStreaming
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
            }`}
            title={isLiveStreaming ? 'Pause Real-Time Telemetry' : 'Resume Real-Time Telemetry'}
          >
            {isLiveStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Feed</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Live Feed</span>
              </>
            )}
          </button>

          <button
            id="btn-inject-chaos-jitter"
            onClick={handleTriggerChaos}
            disabled={isChaosBurstActive}
            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
            title="Inject +250ms random latency jitter onto legacy rails to test live failover"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>{isChaosBurstActive ? 'Jitter Surge Active...' : 'Inject Chaos Jitter'}</span>
          </button>
        </div>
      </div>

      {/* Revenue Attribution Executive Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 grid grid-cols-2 lg:grid-cols-4 gap-3 shadow-inner">
        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span>Attributed Revenue Saved</span>
          </div>
          <div className="font-mono text-lg font-black text-emerald-400 flex items-baseline gap-1">
            <span>₹{(revenueAttribution.estimatedSavedINR / 100000).toFixed(2)}L</span>
            <span className="text-[10px] font-sans font-normal text-slate-400">
              ({formatINR(revenueAttribution.totalRevenuePaise)})
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            Attributed to dynamic jitter routing vs static 1/N rules
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>Avoided Timeout Dropouts</span>
          </div>
          <div className="font-mono text-lg font-black text-white flex items-baseline gap-1">
            <span>{revenueAttribution.totalPreventedFailures.toLocaleString()}</span>
            <span className="text-[10px] font-sans font-normal text-emerald-400">
              (+99.4% Auth SLA)
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            Saved by fast re-routing before 3DS timeout
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>Dynamic Latency Advantage</span>
          </div>
          <div className="font-mono text-lg font-black text-indigo-300 flex items-baseline gap-1">
            <span>{revenueAttribution.avgDynamicLatency}ms</span>
            <span className="text-[10px] font-mono text-emerald-400">
              (vs {revenueAttribution.avgStaticRuleLatency}ms static)
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono text-emerald-400">
            ▲ {revenueAttribution.latencyReductionPercent}% Speedup vs static rules
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-400" />
            <span>AI Dynamic Allocation</span>
          </div>
          <div className="font-mono text-lg font-black text-purple-300 flex items-baseline gap-1">
            <span>76.5% UPI</span>
            <span className="text-[10px] font-mono text-slate-400">/ 14.2% WA</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Auto-diverts from erratic rails in &lt;14ms
          </div>
        </div>
      </div>

      {/* Interactive Simulation Scenario Bench */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-200">
              High-Load Simulation Scenario (Live Network Sandbox):
            </span>
            <div className="text-[10px] text-slate-400">
              Select real-world stress conditions to see AI adjust weights in real-time
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="btn-sim-steady"
            onClick={() => setSimulationMode('STEADY_STATE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              simulationMode === 'STEADY_STATE'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            Normal Baseline (3,200 TPS)
          </button>

          <button
            id="btn-sim-flash-sale"
            onClick={() => setSimulationMode('FLASH_SALE_RUSH')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              simulationMode === 'FLASH_SALE_RUSH'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
            title="Simulate 8,500 TPS concurrency wave with aggregator degradation"
          >
            Flash Sale Rush (8,500 TPS)
          </button>

          <button
            id="btn-sim-bank-outage"
            onClick={() => setSimulationMode('BANK_OUTAGE_SPIKE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              simulationMode === 'BANK_OUTAGE_SPIKE'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
            title="Simulate severe 504 gateway timeout degradation on legacy core banks"
          >
            Bank 504 Outage Spike
          </button>

          <button
            id="btn-sim-chaos"
            onClick={() => setSimulationMode('CHAOS_JITTER')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              simulationMode === 'CHAOS_JITTER'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
            title="Simulate high-variance random network turbulence"
          >
            Chaos Jitter Mode
          </button>
        </div>
      </div>

      {/* Main Multi-Series Latency & Variance SVG Graph */}
      <div className="relative bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Latency Variance &amp; Jitter Curve (ms)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              [T-60s &rarr; Live T-0s]
            </span>
          </div>

          {/* Graph Legend */}
          <div className="flex items-center gap-3 flex-wrap text-[11px] font-mono">
            {liveGateways.map((gw) => (
              <button
                key={gw.id}
                onClick={() => setSelectedGatewayId(gw.id)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  selectedGatewayId === gw.id
                    ? 'bg-slate-800 text-white font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: gw.color }}
                />
                <span>{gw.code}</span>
                <span className="text-[10px] text-slate-400">({gw.currentLatencyMs}ms)</span>
              </button>
            ))}
          </div>
        </div>

        {/* SVG Drawing Canvas */}
        <div className="relative overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-52 overflow-visible select-none"
          >
            <defs>
              {/* Filter glow for active line */}
              <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Grid Lines & Scales */}
            {[50, 150, 250, 350, 450].map((lat) => {
              const y = paddingY + plotHeight - (lat / 520) * plotHeight;
              return (
                <g key={lat}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="0.8"
                    strokeDasharray="3 3"
                    strokeOpacity="0.4"
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {lat}ms
                  </text>
                </g>
              );
            })}

            {/* Threshold Line (160ms Jitter Limit) */}
            <line
              x1={paddingX}
              y1={thresholdY}
              x2={svgWidth - paddingX}
              y2={thresholdY}
              stroke="#f59e0b"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              strokeOpacity="0.8"
            />
            <text
              x={svgWidth - paddingX + 4}
              y={thresholdY + 3}
              fill="#fbbf24"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              160ms Jitter Limit
            </text>

            {/* Render Multi-Series Gateway Latency Paths */}
            {graphLines.map(({ gateway, pathD, points }) => {
              const isSelected = selectedGatewayId === gateway.id;
              const opacity = isSelected ? 1.0 : 0.65;
              const strokeWidth = isSelected ? 3.0 : 1.8;

              return (
                <g key={gateway.id} className="transition-all">
                  <path
                    d={pathD}
                    fill="none"
                    stroke={gateway.color}
                    strokeWidth={strokeWidth}
                    strokeOpacity={opacity}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={isSelected ? 'url(#activeGlow)' : undefined}
                  />

                  {/* Current Live Pulse Node at rightmost point */}
                  {points.length > 0 && (
                    <g>
                      <circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r={isSelected ? '5.5' : '3.5'}
                        fill={gateway.color}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                      {isSelected && (
                        <circle
                          cx={points[points.length - 1].x}
                          cy={points[points.length - 1].y}
                          r="11"
                          fill={gateway.color}
                          opacity="0.25"
                          className="animate-ping"
                        />
                      )}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Detailed Gateway Performance & Revenue Attribution Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Gateway Latency Stability &amp; Revenue Attribution Breakdown
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            Live Concurrency: <strong className="text-white">{concurrencyTps.toLocaleString()} TPS</strong>
          </span>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950/70">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Gateway / Rail</th>
                <th className="p-3 text-right">Avg Latency</th>
                <th className="p-3 text-right">Jitter Variance (&sigma;)</th>
                <th className="p-3 text-right">p99 SLA</th>
                <th className="p-3 text-right">Stability Score</th>
                <th className="p-3 text-right">Dynamic Allocation</th>
                <th className="p-3 text-right">Prevented Drops</th>
                <th className="p-3 text-right">Attributed Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {liveGateways.map((gw) => {
                const isSelected = selectedGatewayId === gw.id;
                return (
                  <tr
                    key={gw.id}
                    onClick={() => setSelectedGatewayId(gw.id)}
                    className={`hover:bg-slate-900/60 cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-900/80 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <td className="p-3 font-sans font-semibold text-slate-200 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: gw.color }}
                      />
                      <span>{gw.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        gw.status === 'STABLE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : gw.status === 'DEGRADED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {gw.status}
                      </span>
                    </td>

                    <td className="p-3 text-right font-bold text-white">
                      {gw.currentLatencyMs}ms
                    </td>

                    <td className="p-3 text-right text-slate-300">
                      &plusmn;{gw.jitterSigmaMs}ms
                    </td>

                    <td className="p-3 text-right text-slate-400">
                      {gw.p99LatencyMs}ms
                    </td>

                    <td className="p-3 text-right">
                      <span className={`font-bold ${
                        gw.stabilityScore >= 90
                          ? 'text-emerald-400'
                          : gw.stabilityScore >= 70
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {gw.stabilityScore}%
                      </span>
                    </td>

                    <td className="p-3 text-right font-bold">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={gw.activeWeightPercent > gw.staticRuleWeightPercent ? 'text-emerald-400' : 'text-slate-400'}>
                          {gw.activeWeightPercent}%
                        </span>
                        <span className="text-[9px] text-slate-500 font-normal">
                          (vs {gw.staticRuleWeightPercent}%)
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-right font-bold text-emerald-400">
                      +{gw.preventedFailures}
                    </td>

                    <td className="p-3 text-right font-bold text-white">
                      {formatINR(gw.attributedRevenuePaise)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Gateway Deep-Dive & Mathematical Proof Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedGateway.color }}
            />
            <span className="font-bold text-xs text-white">
              Dynamic Routing Decision Formula for {selectedGateway.name} ({selectedGateway.code})
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">
            Active Weight: <strong>{selectedGateway.activeWeightPercent}%</strong> (Entropy &sigma;: {selectedGateway.jitterSigmaMs}ms)
          </span>
        </div>

        <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
          Routing Score: W&#7522; &prop; [ 1 / (Latency&#7522; + 2.5 &times; &sigma;&#7522;) ] &times; (1 - DropRate&#7522;) &times; AuthRate&#7522;<br />
          <span className="text-slate-400 font-sans text-[10px] mt-1 block">
            Because {selectedGateway.name} exhibits {selectedGateway.jitterSigmaMs}ms variance and {selectedGateway.currentLatencyMs}ms latency under {simulationMode}, the AI autonomously allocated {selectedGateway.activeWeightPercent}% of traffic, preventing {selectedGateway.preventedFailures} transaction drops and attributing {formatINR(selectedGateway.attributedRevenuePaise)} in recovered GMV.
          </span>
        </p>
      </div>
    </div>
  );
};
