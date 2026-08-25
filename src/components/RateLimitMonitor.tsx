import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Zap,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldAlert,
  Flame,
  Activity,
  Layers,
  Info,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { fetchRateLimit, simulateRateLimitSpike, resetRateLimit } from '../services/api';
import { RateLimitTelemetry } from '../types';

interface RateLimitMonitorProps {
  onNotification?: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
}

export const RateLimitMonitor: React.FC<RateLimitMonitorProps> = ({ onNotification }) => {
  const [telemetry, setTelemetry] = useState<RateLimitTelemetry | null>(null);
  const [isSpiking, setIsSpiking] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Poll rate limit status every 2.5 seconds
  const loadTelemetry = async () => {
    try {
      const data = await fetchRateLimit();
      if (data) {
        setTelemetry(data);
      }
    } catch {
      // Quietly continue with existing/fallback telemetry
    }
  };

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateSpike = async () => {
    setIsSpiking(true);
    try {
      await simulateRateLimitSpike(105);
      await loadTelemetry();
      if (onNotification) {
        onNotification({
          text: '⚡ Simulated 105+ Webhook Burst: Token bucket drained to demonstrate Adaptive Jitter Backoff & Queueing!',
          type: 'info',
        });
      }
    } catch (err: any) {
      console.error('Error simulating rate limit spike:', err);
    } finally {
      setIsSpiking(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetRateLimit();
      await loadTelemetry();
      if (onNotification) {
        onNotification({
          text: '✓ Rate limit bucket replenished to full 120 RPM capacity.',
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error('Error resetting rate limit:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const remaining = telemetry?.remaining ?? 120;
  const limit = telemetry?.limit ?? 120;
  const percentage = Math.max(0, Math.min(100, Math.round((remaining / limit) * 100)));

  const getStatusColor = () => {
    if (percentage > 50) return 'text-emerald-500 dark:text-emerald-400';
    if (percentage > 20) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getProgressBarColor = () => {
    if (percentage > 50) return 'bg-emerald-500';
    if (percentage > 20) return 'bg-amber-500';
    return 'bg-red-500 animate-pulse';
  };

  return (
    <div
      id="rate-limit-monitor-card"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm space-y-3.5 transition-all"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Razorpay API Rate Limit & Throttling Defense
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold uppercase ${
                  percentage > 50
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                    : percentage > 20
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 animate-pulse'
                }`}
              >
                {telemetry?.status || 'HEALTHY'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Simulates live 120 RPM gateway quota with Token Bucket algorithm & Full-Jitter Exponential Backoff.
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            id="btn-simulate-rate-limit-spike"
            onClick={handleSimulateSpike}
            disabled={isSpiking}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Simulate high-concurrency burst to test adaptive throttling"
          >
            <Flame className={`w-3.5 h-3.5 ${isSpiking ? 'animate-bounce' : ''}`} />
            <span>{isSpiking ? 'Draining...' : 'Simulate 429 Spike'}</span>
          </button>

          <button
            id="btn-reset-rate-limit"
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 border border-slate-200 dark:border-slate-700"
            title="Replenish Token Bucket"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Replenish</span>
          </button>

          <button
            id="btn-toggle-rate-limit-details"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-mono"
            title="Toggle Details"
          >
            {isExpanded ? 'Collapse' : 'Details'}
          </button>
        </div>
      </div>

      {/* Primary Quota Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Remaining Quota:</span>
            <span className={`font-bold text-sm ${getStatusColor()}`}>
              {remaining} / {limit} RPM
            </span>
            <span className="text-[10px] text-slate-400">({percentage}% capacity)</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Full Reset in:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {telemetry?.resetSeconds ?? 0}s
            </span>
          </div>
        </div>

        {/* Bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 flex">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Expanded Metrics & Throttling Defense Pillars */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in text-xs">
          {/* Circuit Breaker */}
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Circuit Breaker</div>
            <div className="flex items-center gap-1.5 font-bold font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  telemetry?.circuitBreaker === 'CLOSED'
                    ? 'bg-emerald-500'
                    : telemetry?.circuitBreaker === 'HALF_OPEN'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-red-500 animate-ping'
                }`}
              />
              <span
                className={
                  telemetry?.circuitBreaker === 'CLOSED'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : telemetry?.circuitBreaker === 'HALF_OPEN'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-500'
                }
              >
                {telemetry?.circuitBreaker || 'CLOSED'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              {telemetry?.circuitBreaker === 'CLOSED'
                ? 'Direct execution mode'
                : telemetry?.circuitBreaker === 'HALF_OPEN'
                ? 'Gradual request bleed'
                : 'Full queue holdback'}
            </div>
          </div>

          {/* Refill Velocity */}
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Refill Velocity</div>
            <div className="font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>+{telemetry?.refillRatePerSec ?? 2} tokens/sec</span>
            </div>
            <div className="text-[10px] text-slate-500">Continuous Leaky Bucket</div>
          </div>

          {/* Throttled vs Queued */}
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Throttled Defenses</div>
            <div className="font-bold font-mono text-purple-600 dark:text-purple-400">
              {telemetry?.totalThrottledRequests ?? 0} Handled
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>0 Drops (Redis Queue)</span>
            </div>
          </div>

          {/* Backoff Strategy */}
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Backoff Algorithm</div>
            <div className="font-bold text-slate-900 dark:text-white font-mono truncate text-[11px]">
              Full Jitter Exponential
            </div>
            <div className="text-[10px] text-slate-500">t = min(Cap, Base * 2^attempt + Jitter)</div>
          </div>
        </div>
      )}

      {/* Active Throttling Banner when under load */}
      {percentage <= 20 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Adaptive Backoff Engaged:</span> Razorpay simulated API capacity is near 0. Incoming recovery dispatches are automatically held in Redis FIFO queues and retried with randomized jitter delays to ensure 100% message delivery without 429 gateway rejections.
          </div>
        </div>
      )}
    </div>
  );
};
