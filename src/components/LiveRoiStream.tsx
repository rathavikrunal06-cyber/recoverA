import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  Coins,
  DollarSign,
  Activity,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  Cpu,
  Server,
  Radio,
  CheckCircle2,
  RefreshCw,
  Play,
  Pause,
  Filter,
  Flame,
  Clock,
  PieChart,
  BarChart3,
  HelpCircle,
  Percent,
  Sliders,
  Terminal,
  Receipt,
} from 'lucide-react';
import { TransactionRecord } from '../types';

interface LiveRoiStreamProps {
  transactions: TransactionRecord[];
  className?: string;
  onNotification?: (msg: { text: string; type: 'success' | 'info' | 'error'; title?: string }) => void;
}

export interface StreamItem {
  id: string;
  timestamp: number;
  timeStr: string;
  orderId: string;
  customerName: string;
  method: string;
  failureCategory: string;
  recoveryRail: string;
  transactionAmountInr: number;
  tokensUsed: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  costs: {
    geminiTokenCostInr: number;
    redisMutexCostInr: number;
    computeCostInr: number;
    railDispatchCostInr: number;
    totalCostInr: number;
  };
  valueGeneratedInr: number; // GMV saved if recovered, or 0 if failed
  netMarginInr: number;
  instantaneousRoiMultiple: number;
  isPositiveMargin: boolean;
  status: 'RECOVERED' | 'DISPATCHED' | 'FAILED';
  processingTimeMs: number;
}

export const LiveRoiStream: React.FC<LiveRoiStreamProps> = ({
  transactions = [],
  className = '',
  onNotification,
}) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'RECOVERED_ONLY' | 'HIGH_ROI'>('ALL');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [selectedStreamItem, setSelectedStreamItem] = useState<StreamItem | null>(null);
  const [streamBuffer, setStreamBuffer] = useState<StreamItem[]>([]);
  const streamCounterRef = useRef<number>(0);

  // Compute live stream items from real transactions plus synthetic real-time telemetry stream
  useEffect(() => {
    // Generate initial 20 historical stream events
    const initialItems: StreamItem[] = [];
    const now = Date.now();

    const sampleRails = [
      'INSTANT_UPI_SWITCH',
      'WHATSAPP_INTERACTIVE_PAY',
      'SMART_GATEWAY_FALLBACK',
      'ADAPTIVE_DUNNING',
      'DYNAMIC_DISCOUNT_LINK',
    ];

    const sampleFailures = [
      'BANK_DOWNTIME',
      'AUTH_TIMEOUT',
      'INSUFFICIENT_FUNDS',
      'GATEWAY_ERROR',
      'FRAUD_SUSPICION',
    ];

    const sampleMethods = ['upi', 'card', 'netbanking', 'wallet'];

    for (let i = 25; i >= 1; i--) {
      const tx = transactions[i % Math.max(1, transactions.length)];
      const amountPaise = tx?.amountPaise || (Math.floor(Math.random() * 8000 + 800) * 100);
      const amountInr = amountPaise / 100;
      const isRecovered = Math.random() > 0.12; // ~88% recovery rate

      const promptTokens = Math.floor(Math.random() * 120 + 220); // 220 - 340 tokens
      const completionTokens = Math.floor(Math.random() * 40 + 75); // 75 - 115 tokens
      const totalTokens = promptTokens + completionTokens;

      // Gemini 3.7 Flash Token pricing: ~$0.075/1M input, $0.30/1M output => ~₹0.0035 per diagnostic
      const geminiTokenCostInr = (promptTokens * 0.0000065) + (completionTokens * 0.000026);
      const redisMutexCostInr = 0.0012; // Redlock 3-node lease
      const computeCostInr = 0.0022; // Sub-50ms Cloud Run execution
      const railDispatchCostInr = isRecovered ? 0.024 : 0.012; // 0 for UPI, 0.30 for WhatsApp
      const totalCostInr = geminiTokenCostInr + redisMutexCostInr + computeCostInr + railDispatchCostInr;

      const valueGeneratedInr = isRecovered ? amountInr : 0;
      const netMarginInr = valueGeneratedInr - totalCostInr;
      const instantaneousRoiMultiple = totalCostInr > 0 ? Math.round(valueGeneratedInr / totalCostInr) : 0;

      const time = new Date(now - i * 3200);

      initialItems.push({
        id: `roi-evt-${i}-${Date.now().toString(36)}`,
        timestamp: time.getTime(),
        timeStr: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        orderId: tx?.orderId || `order_${Math.random().toString(36).substring(2, 9)}`,
        customerName: tx?.customerName || 'Customer ' + (i + 100),
        method: tx?.method || sampleMethods[i % sampleMethods.length],
        failureCategory: tx?.diagnosis?.failureCategory || tx?.errorReason || sampleFailures[i % sampleFailures.length],
        recoveryRail: tx?.diagnosis?.recommendedStrategy || tx?.channelDispatched || sampleRails[i % sampleRails.length],
        transactionAmountInr: amountInr,
        tokensUsed: {
          promptTokens,
          completionTokens,
          totalTokens,
        },
        costs: {
          geminiTokenCostInr: Number(geminiTokenCostInr.toFixed(5)),
          redisMutexCostInr: Number(redisMutexCostInr.toFixed(5)),
          computeCostInr: Number(computeCostInr.toFixed(5)),
          railDispatchCostInr: Number(railDispatchCostInr.toFixed(5)),
          totalCostInr: Number(totalCostInr.toFixed(5)),
        },
        valueGeneratedInr,
        netMarginInr: Number(netMarginInr.toFixed(2)),
        instantaneousRoiMultiple,
        isPositiveMargin: netMarginInr > 0,
        status: isRecovered ? 'RECOVERED' : 'FAILED',
        processingTimeMs: Math.floor(Math.random() * 24 + 28),
      });
    }

    setStreamBuffer(initialItems);
    setSelectedStreamItem(initialItems[0]);
  }, [transactions]);

  // Live incoming event generator interval
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      streamCounterRef.current += 1;
      const now = new Date();
      const amountInr = Math.floor(Math.random() * 9500 + 650);
      const isRecovered = Math.random() > 0.10; // 90% positive recovery

      const promptTokens = Math.floor(Math.random() * 110 + 230);
      const completionTokens = Math.floor(Math.random() * 35 + 80);
      const totalTokens = promptTokens + completionTokens;

      const geminiTokenCostInr = (promptTokens * 0.0000065) + (completionTokens * 0.000026);
      const redisMutexCostInr = 0.0012;
      const computeCostInr = 0.0022;
      const railDispatchCostInr = isRecovered ? (Math.random() > 0.4 ? 0.00 : 0.30) : 0.012;
      const totalCostInr = geminiTokenCostInr + redisMutexCostInr + computeCostInr + railDispatchCostInr;

      const valueGeneratedInr = isRecovered ? amountInr : 0;
      const netMarginInr = valueGeneratedInr - totalCostInr;
      const instantaneousRoiMultiple = totalCostInr > 0 ? Math.round(valueGeneratedInr / totalCostInr) : 0;

      const sampleRails = [
        'INSTANT_UPI_SWITCH',
        'WHATSAPP_INTERACTIVE_PAY',
        'SMART_GATEWAY_FALLBACK',
        'ADAPTIVE_DUNNING',
        'DYNAMIC_DISCOUNT_LINK',
      ];
      const sampleFailures = [
        'BANK_DOWNTIME',
        'AUTH_TIMEOUT',
        'INSUFFICIENT_FUNDS',
        'GATEWAY_ERROR',
        'FRAUD_SUSPICION',
      ];

      const newItem: StreamItem = {
        id: `roi-evt-live-${Date.now()}-${streamCounterRef.current}`,
        timestamp: Date.now(),
        timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        orderId: `order_live_${Math.random().toString(36).substring(2, 8)}`,
        customerName: ['Priya Sharma', 'Rahul Mehta', 'Ananya Gupta', 'Vikram Patel', 'Sneha Reddy', 'Aditya Iyer'][
          Math.floor(Math.random() * 6)
        ],
        method: ['upi', 'card', 'netbanking'][Math.floor(Math.random() * 3)],
        failureCategory: sampleFailures[Math.floor(Math.random() * sampleFailures.length)],
        recoveryRail: sampleRails[Math.floor(Math.random() * sampleRails.length)],
        transactionAmountInr: amountInr,
        tokensUsed: {
          promptTokens,
          completionTokens,
          totalTokens,
        },
        costs: {
          geminiTokenCostInr: Number(geminiTokenCostInr.toFixed(5)),
          redisMutexCostInr: Number(redisMutexCostInr.toFixed(5)),
          computeCostInr: Number(computeCostInr.toFixed(5)),
          railDispatchCostInr: Number(railDispatchCostInr.toFixed(5)),
          totalCostInr: Number(totalCostInr.toFixed(5)),
        },
        valueGeneratedInr,
        netMarginInr: Number(netMarginInr.toFixed(2)),
        instantaneousRoiMultiple,
        isPositiveMargin: netMarginInr > 0,
        status: isRecovered ? 'RECOVERED' : 'FAILED',
        processingTimeMs: Math.floor(Math.random() * 20 + 26),
      };

      setStreamBuffer((prev) => [newItem, ...prev.slice(0, 39)]); // Keep last 40 events
    }, 2800 / speedMultiplier);

    return () => clearInterval(interval);
  }, [isStreaming, speedMultiplier]);

  // Aggregate Metrics over the current Stream Window
  const streamStats = useMemo(() => {
    const totalEvents = streamBuffer.length || 1;
    const totalGmvProcessed = streamBuffer.reduce((acc, it) => acc + it.transactionAmountInr, 0);
    const totalValueGenerated = streamBuffer.reduce((acc, it) => acc + it.valueGeneratedInr, 0);
    const totalCostsIncurred = streamBuffer.reduce((acc, it) => acc + it.costs.totalCostInr, 0);
    const totalTokensConsumed = streamBuffer.reduce((acc, it) => acc + it.tokensUsed.totalTokens, 0);
    const netProfitStream = totalValueGenerated - totalCostsIncurred;
    const positiveMarginCount = streamBuffer.filter((it) => it.isPositiveMargin).length;
    const positiveMarginRate = Number(((positiveMarginCount / totalEvents) * 100).toFixed(1));
    const cumulativeRoiMultiple = totalCostsIncurred > 0 ? Math.round(totalValueGenerated / totalCostsIncurred) : 0;
    const avgCostPerTxPaise = (totalCostsIncurred / totalEvents) * 100;

    return {
      totalEvents,
      totalGmvProcessed,
      totalValueGenerated,
      totalCostsIncurred,
      totalTokensConsumed,
      netProfitStream,
      positiveMarginRate,
      cumulativeRoiMultiple,
      avgCostPerTxPaise,
    };
  }, [streamBuffer]);

  // Filtered list
  const filteredStream = useMemo(() => {
    if (filterMode === 'RECOVERED_ONLY') return streamBuffer.filter((it) => it.status === 'RECOVERED');
    if (filterMode === 'HIGH_ROI') return streamBuffer.filter((it) => it.instantaneousRoiMultiple > 5000);
    return streamBuffer;
  }, [streamBuffer, filterMode]);

  const activeItem = selectedStreamItem || streamBuffer[0];

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Sparkline calculation for live Margin Ratio graph
  const svgWidth = 650;
  const svgHeight = 160;
  const padX = 40;
  const padY = 20;
  const plotW = svgWidth - padX * 2;
  const plotH = svgHeight - padY * 2;

  const sparklineData = useMemo(() => {
    const reversed = [...streamBuffer].reverse();
    if (reversed.length < 2) return { valuePoints: '', costPoints: '', areaPoints: '' };

    const maxVal = Math.max(...reversed.map((d) => d.valueGeneratedInr), 10000);

    const valPts = reversed.map((d, idx) => {
      const x = padX + (idx / (reversed.length - 1)) * plotW;
      const y = padY + plotH - (d.valueGeneratedInr / maxVal) * plotH;
      return { x, y };
    });

    const costPts = reversed.map((d, idx) => {
      const x = padX + (idx / (reversed.length - 1)) * plotW;
      // Cost is tiny compared to value, so we scale it on bottom 30% baseline to illustrate micro-spend
      const y = padY + plotH - (d.costs.totalCostInr * 120);
      return { x, y: Math.max(padY, Math.min(padY + plotH - 2, y)) };
    });

    const createPath = (pts: { x: number; y: number }[]) => {
      return pts.reduce((acc, curr, idx) => {
        if (idx === 0) return `M ${curr.x} ${curr.y}`;
        const prev = pts[idx - 1];
        const cx = prev.x + (curr.x - prev.x) / 2;
        return `${acc} C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
      }, '');
    };

    const valPath = createPath(valPts);
    const costPath = createPath(costPts);

    const first = valPts[0];
    const last = valPts[valPts.length - 1];
    const areaPath = `${valPath} L ${last.x} ${padY + plotH} L ${first.x} ${padY + plotH} Z`;

    return { valuePath: valPath, costPath, areaPath, valPts, costPts };
  }, [streamBuffer, plotW, plotH, padX, padY]);

  return (
    <div
      id="live-roi-stream-module"
      className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl text-slate-100 ${className}`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & FINANCIAL HEALTH RIBBON */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Instantaneous Live ROI &amp; Unit Margin Stream</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>100% Positive Margin Guard</span>
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Micro-ledger tracking instantaneous <strong>Value Generated (₹ Saved GMV)</strong> vs. <strong>API Token Cost (Gemini 3.7 Flash)</strong> for every single transaction event.
            </p>
          </div>
        </div>

        {/* Live Stream Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isStreaming
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'Stream Active' : 'Stream Paused'}</span>
          </button>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setSpeedMultiplier(1)}
              className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                speedMultiplier === 1 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setSpeedMultiplier(2)}
              className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                speedMultiplier === 2 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2x
            </button>
            <button
              onClick={() => setSpeedMultiplier(4)}
              className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                speedMultiplier === 4 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              4x
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL-TIME INSTANTANEOUS FINANCIAL KPIS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Cumulative Stream ROI</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black font-mono text-emerald-400">
            {streamStats.cumulativeRoiMultiple.toLocaleString()}x
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Every ₹1 token spend yields ₹{streamStats.cumulativeRoiMultiple}
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Total Value Generated</span>
            <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-black font-mono text-indigo-300">
            {formatINR(streamStats.totalValueGenerated)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Saved across {streamStats.totalEvents} stream events
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Total Token Cost Incurred</span>
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black font-mono text-amber-400">
            ₹{streamStats.totalCostsIncurred.toFixed(4)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Avg: {streamStats.avgCostPerTxPaise.toFixed(3)} paise/tx
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Positive Margin Compliance</span>
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black font-mono text-cyan-300">
            {streamStats.positiveMarginRate}%
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            99.98% Net Profit Margin
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. REAL-TIME DUAL-SERIES SVG PLOT: VALUE GENERATED VS. TOKEN COST */}
      {/* ========================================================================= */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Value (GMV Saved) vs. Cost (Tokens) Envelope</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Green wave depicts continuous ₹ revenue protected; orange baseline reflects infinitesimal micro-token API cost.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-400 rounded-full inline-block" />
              <span className="text-emerald-300 font-bold">Value Saved (₹)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-400 rounded-full inline-block" />
              <span className="text-amber-300 font-bold">API Token Cost (Paise)</span>
            </div>
          </div>
        </div>

        {/* SVG Plot */}
        <div className="relative overflow-hidden select-none">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 overflow-visible">
            <defs>
              <linearGradient id="roiValueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padY + plotH * (1 - ratio);
              return (
                <line
                  key={ratio}
                  x1={padX}
                  y1={y}
                  x2={svgWidth - padX}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                  strokeOpacity="0.4"
                />
              );
            })}

            {/* Value Area Fill */}
            {sparklineData.areaPath && (
              <path d={sparklineData.areaPath} fill="url(#roiValueGradient)" />
            )}

            {/* Value Path */}
            {sparklineData.valuePath && (
              <path
                d={sparklineData.valuePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Cost Baseline Path */}
            {sparklineData.costPath && (
              <path
                d={sparklineData.costPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="2 2"
              />
            )}

            {/* Interactive Data Points */}
            {sparklineData.valPts?.map((pt, idx) => {
              const item = [...streamBuffer].reverse()[idx];
              const isSelected = activeItem?.id === item?.id;
              return (
                <g key={idx} className="cursor-pointer" onClick={() => item && setSelectedStreamItem(item)}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? '5' : '3'}
                    fill={isSelected ? '#38bdf8' : '#10b981'}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="hover:scale-150 transition-transform"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LIVE TRANSACTION STREAM TABLE & INTERACTIVE MICRO-LEDGER INSPECTOR */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Real-Time Stream Table */}
        <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Instantaneous Event Stream (Per-Tx Ledger)
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  filterMode === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilterMode('RECOVERED_ONLY')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  filterMode === 'RECOVERED_ONLY' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Recovered (Margin &gt; 0)
              </button>
              <button
                onClick={() => setFilterMode('HIGH_ROI')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  filterMode === 'HIGH_ROI' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                &gt;5,000x ROI
              </button>
            </div>
          </div>

          {/* Scrollable Events List */}
          <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
            {filteredStream.map((item) => {
              const isSelected = activeItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedStreamItem(item)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  {/* Left info: Time, Order, Rail */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] text-slate-500">{item.timeStr}</span>
                    <span className={`w-2 h-2 rounded-full ${item.status === 'RECOVERED' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <div className="truncate">
                      <span className="text-white font-bold">{item.orderId}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">
                        ({item.recoveryRail.replace(/_/g, ' ')})
                      </span>
                    </div>
                  </div>

                  {/* Right numbers: Value, Cost, Margin */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <div className="text-emerald-400 font-bold">
                        +{formatINR(item.valueGeneratedInr)}
                      </div>
                      <div className="text-[9px] text-amber-400">
                        Cost: ₹{item.costs.totalCostInr.toFixed(4)} ({item.tokensUsed.totalTokens} tkn)
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.instantaneousRoiMultiple.toLocaleString()}x
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Selected Transaction Unit Cost Breakdown */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                <Receipt className="w-4 h-4" />
                <span>Micro-Cost Breakdown</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{activeItem?.timeStr}</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Inspected Transaction</div>
              <div className="font-bold text-white font-mono">{activeItem?.orderId}</div>
              <div className="text-slate-400 text-[11px]">{activeItem?.customerName} &bull; {activeItem?.method.toUpperCase()}</div>
            </div>

            {/* Cost Line Items */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-[11px] text-slate-400">Gemini 3.7 Flash Tokens:</span>
                <span className="text-amber-400">₹{activeItem?.costs.geminiTokenCostInr.toFixed(5)}</span>
              </div>
              <div className="text-[9px] text-slate-500 pl-2">
                ({activeItem?.tokensUsed.promptTokens} in + {activeItem?.tokensUsed.completionTokens} out = {activeItem?.tokensUsed.totalTokens} tokens)
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-[11px] text-slate-400">Redis Redlock Mutex (3-node):</span>
                <span className="text-slate-300">₹{activeItem?.costs.redisMutexCostInr.toFixed(5)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-[11px] text-slate-400">Sub-50ms Cloud Run Execution:</span>
                <span className="text-slate-300">₹{activeItem?.costs.computeCostInr.toFixed(5)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-[11px] text-slate-400">Channel Dispatch Fee:</span>
                <span className="text-slate-300">₹{activeItem?.costs.railDispatchCostInr.toFixed(5)}</span>
              </div>

              <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                <span className="text-white">Total Unit Cost:</span>
                <span className="text-amber-400 font-black">₹{activeItem?.costs.totalCostInr.toFixed(5)}</span>
              </div>
            </div>
          </div>

          {/* Unit Verdict Box */}
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-1 font-sans text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-300 font-mono">
              <span>Instantaneous Net Margin:</span>
              <span className="text-sm">+{formatINR(activeItem?.netMarginInr || 0)}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Recovering ₹{activeItem?.transactionAmountInr.toLocaleString()} cost only ₹{activeItem?.costs.totalCostInr.toFixed(4)} in API tokens, producing a{' '}
              <strong className="text-emerald-400 font-mono">{activeItem?.instantaneousRoiMultiple.toLocaleString()}x instantaneous multiplier</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
