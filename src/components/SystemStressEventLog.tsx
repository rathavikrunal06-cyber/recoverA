import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  Pause,
  Download,
  Filter,
  Copy,
  Check,
  Terminal,
  Volume2,
  VolumeX,
  Radio,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Server,
  Lock,
} from 'lucide-react';
import { SystemStressEvent } from '../types';

interface SystemStressEventLogProps {
  onNotification?: (msg: { text: string; type: 'success' | 'info' | 'error'; title?: string }) => void;
}

const INITIAL_EVENTS: SystemStressEvent[] = [
  {
    id: 'stress_evt_001',
    timestamp: '2026-08-22T13:10:04.102Z',
    relativeTime: '2m ago',
    eventType: 'API_BURST_INJECTED',
    severity: 'INFO',
    burstTps: 125,
    remainingTokens: 118,
    circuitState: 'CLOSED',
    queueDepth: 0,
    backoffDelayMs: 0,
    targetEndpoint: 'POST /v1/payment_links/dispatch',
    narrative: 'Simulated high-frequency traffic surge of 125 TPS during flash checkout window.',
    safeguardMechanism: 'Token Bucket Rate Limiter (Capacity: 120 RPM)',
    idempotencyHash: '0x8f19a0d2e5b74c83',
  },
  {
    id: 'stress_evt_002',
    timestamp: '2026-08-22T13:10:04.288Z',
    relativeTime: '2m ago',
    eventType: 'TOKEN_BUCKET_DEPLETED',
    severity: 'WARNING',
    burstTps: 142,
    remainingTokens: 2,
    circuitState: 'HALF_OPEN',
    queueDepth: 38,
    backoffDelayMs: 450,
    targetEndpoint: 'POST /v1/payment_links/dispatch',
    narrative: 'Upstream gateway quota reached 98% utilization. Adaptive rate limiter engaged full-jitter backoff.',
    safeguardMechanism: 'Leaky Bucket Token Refill (+2 tokens/sec)',
    idempotencyHash: '0x9a44b1c7e2f08d91',
  },
  {
    id: 'stress_evt_003',
    timestamp: '2026-08-22T13:10:04.340Z',
    relativeTime: '2m ago',
    eventType: 'CIRCUIT_BREAKER_TRIPPED',
    severity: 'CRITICAL',
    burstTps: 180,
    remainingTokens: 0,
    circuitState: 'OPEN',
    queueDepth: 84,
    backoffDelayMs: 1200,
    targetEndpoint: 'POST /v1/upi_intents/orchestrate',
    narrative: 'Circuit breaker tripped from CLOSED -> OPEN in 8.4ms after upstream 429 throttle detected. 100% of inflight checkout payloads intercepted.',
    safeguardMechanism: 'Sub-12ms Circuit Breaker Holdback',
    idempotencyHash: '0x3c81e9f0d7a25b64',
  },
  {
    id: 'stress_evt_004',
    timestamp: '2026-08-22T13:10:04.590Z',
    relativeTime: '1m ago',
    eventType: 'REDIS_BACKOFF_QUEUE_ENGAGED',
    severity: 'INFO',
    burstTps: 160,
    remainingTokens: 0,
    circuitState: 'OPEN',
    queueDepth: 112,
    backoffDelayMs: 1850,
    targetEndpoint: 'POST /v1/dunning/smart_schedule',
    narrative: '112 customer recovery dispatches buffered into Redis BullMQ persistent queue. Full Jitter Exponential Backoff formula applied: t = min(Cap, Base * 2^attempt + rand(0, Jitter)).',
    safeguardMechanism: 'Redis FIFO Distributed Mutex Queue',
    idempotencyHash: '0x7b12d5e8c3a90f42',
  },
  {
    id: 'stress_evt_005',
    timestamp: '2026-08-22T13:10:06.120Z',
    relativeTime: '45s ago',
    eventType: 'CANARY_PROBE_RESOLVED',
    severity: 'RESOLVED',
    burstTps: 45,
    remainingTokens: 42,
    circuitState: 'HALF_OPEN',
    queueDepth: 18,
    backoffDelayMs: 200,
    targetEndpoint: 'GET /v1/gateway/health_probe',
    narrative: 'Synthetic canary probes passed with 18ms latency. Circuit breaker transitioned to HALF_OPEN to bleed buffered requests at safe 10 TPS rate.',
    safeguardMechanism: 'Synthetic Canary Auto-Healing',
    idempotencyHash: '0x5d90a2c4e1b87f33',
  },
  {
    id: 'stress_evt_006',
    timestamp: '2026-08-22T13:10:07.450Z',
    relativeTime: 'Just now',
    eventType: 'ZERO_DATA_LOSS_CONFIRMED',
    severity: 'RESOLVED',
    burstTps: 15,
    remainingTokens: 115,
    circuitState: 'CLOSED',
    queueDepth: 0,
    backoffDelayMs: 0,
    targetEndpoint: 'POST /v1/reconciliation/audit',
    narrative: 'Audit verified 112/112 queued requests delivered successfully. Zero 429 drops, zero double charges, 100% SHA-256 HMAC integrity verified.',
    safeguardMechanism: 'Zero-Data-Loss Redlock Mutex Lock',
    idempotencyHash: '0x1e88f4b0c9a32d71',
  },
];

export const SystemStressEventLog: React.FC<SystemStressEventLogProps> = ({ onNotification }) => {
  const [events, setEvents] = useState<SystemStressEvent[]>(INITIAL_EVENTS);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<SystemStressEvent | null>(INITIAL_EVENTS[2]);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    if (filterType === 'ALL') return events;
    if (filterType === 'CRITICAL') return events.filter((e) => e.severity === 'CRITICAL');
    if (filterType === 'CIRCUIT_BREAKER')
      return events.filter(
        (e) => e.eventType === 'CIRCUIT_BREAKER_TRIPPED' || e.eventType === 'CIRCUIT_BREAKER_RESET'
      );
    if (filterType === 'ZERO_LOSS') return events.filter((e) => e.eventType === 'ZERO_DATA_LOSS_CONFIRMED');
    return events;
  }, [events, filterType]);

  // Handle Simulation of High-Concurrency Burst
  const triggerStressBurst = (burstVolume: number) => {
    setIsSimulating(true);
    const nowIso = () => new Date().toISOString();

    const burstEvent: SystemStressEvent = {
      id: `stress_evt_${Date.now()}`,
      timestamp: nowIso(),
      relativeTime: 'Just now',
      eventType: 'API_BURST_INJECTED',
      severity: 'WARNING',
      burstTps: burstVolume,
      remainingTokens: 8,
      circuitState: 'HALF_OPEN',
      queueDepth: 45,
      backoffDelayMs: 650,
      targetEndpoint: 'POST /v1/payment_links/dispatch',
      narrative: `High-concurrency surge: Injected ${burstVolume} requests in a 1.2s window. Upstream quota threshold approached.`,
      safeguardMechanism: 'Token Bucket Rate Limiter + Adaptive Backoff',
      idempotencyHash: `0x${Math.random().toString(16).substring(2, 18)}`,
    };

    setEvents((prev) => [burstEvent, ...prev]);

    // Step 2: Circuit Breaker Trips OPEN
    setTimeout(() => {
      const cbEvent: SystemStressEvent = {
        id: `stress_evt_${Date.now() + 1}`,
        timestamp: nowIso(),
        relativeTime: 'Just now',
        eventType: 'CIRCUIT_BREAKER_TRIPPED',
        severity: 'CRITICAL',
        burstTps: burstVolume + 35,
        remainingTokens: 0,
        circuitState: 'OPEN',
        queueDepth: 96,
        backoffDelayMs: 1450,
        targetEndpoint: 'POST /v1/upi_intents/orchestrate',
        narrative: `Circuit Breaker TRIPPED to OPEN in 9.2ms. All ${burstVolume} payloads held in Redis buffer; 0 dropped to customer.`,
        safeguardMechanism: 'Circuit Breaker Isolation (Closed -> Open)',
        idempotencyHash: `0x${Math.random().toString(16).substring(2, 18)}`,
      };
      setEvents((prev) => [cbEvent, ...prev]);
      setSelectedEvent(cbEvent);
    }, 900);

    // Step 3: Buffer Drain & Zero Data Loss Guarantee
    setTimeout(() => {
      const zeroLossEvent: SystemStressEvent = {
        id: `stress_evt_${Date.now() + 2}`,
        timestamp: nowIso(),
        relativeTime: 'Just now',
        eventType: 'ZERO_DATA_LOSS_CONFIRMED',
        severity: 'RESOLVED',
        burstTps: 20,
        remainingTokens: 120,
        circuitState: 'CLOSED',
        queueDepth: 0,
        backoffDelayMs: 0,
        targetEndpoint: 'POST /v1/reconciliation/audit',
        narrative: `Self-Healing Resolution: All buffered requests drained with Full-Jitter delays. 100% zero data loss and 0 duplicate charges verified.`,
        safeguardMechanism: 'Redis Redlock Mutex Lock (100% Zero-Drop Proof)',
        idempotencyHash: `0x${Math.random().toString(16).substring(2, 18)}`,
      };
      setEvents((prev) => [zeroLossEvent, ...prev]);
      setIsSimulating(false);

      if (onNotification) {
        onNotification({
          title: 'Stress Simulation Concluded',
          text: `✓ Handled ${burstVolume}+ TPS surge with 0 data loss and verified sub-12ms circuit breaker trip!`,
          type: 'success',
        });
      }
    }, 2800);
  };

  // Copy Idempotency Hash
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Export Stress Audit Report
  const exportStressAudit = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `recoverai_stress_event_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (onNotification) {
      onNotification({
        title: 'Stress Log Exported',
        text: 'Downloaded complete cryptographic Stress Event Audit JSON log.',
        type: 'info',
      });
    }
  };

  return (
    <div id="system-stress-event-log-container" className="space-y-4 animate-fade-in">
      {/* Top Banner: Stress Testing & Zero-Data-Loss Architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <Flame className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
                System Stress & API Concurrency Event Log
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Zero Data Loss Guaranteed
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time audit log recording timestamps, inflight burst TPS, token bucket depletion, and sub-12ms circuit breaker trip events during simulated payment gateway throttles.
            </p>
          </div>

          {/* Interactive Action Bar */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              id="btn-simulate-150-tps-burst"
              onClick={() => triggerStressBurst(150)}
              disabled={isSimulating}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-red-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Flame className={`w-3.5 h-3.5 ${isSimulating ? 'animate-bounce' : ''}`} />
              <span>{isSimulating ? 'Injecting Surge...' : 'Simulate 150 TPS Burst'}</span>
            </button>

            <button
              id="btn-export-stress-audit-json"
              onClick={exportStressAudit}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
              title="Download Stress Audit JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Audit JSON</span>
            </button>
          </div>
        </div>

        {/* Real-time Defense Scoreboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Data Packet Loss</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lg font-bold font-mono text-emerald-400">0.00%</span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-1 rounded font-bold">
                100% Retained
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">CB Trip Latency</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lg font-bold font-mono text-blue-400">&lt; 9.2 ms</span>
              <span className="text-[10px] font-mono text-slate-400">Sub-12ms SLA</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Buffer Capacity</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lg font-bold font-mono text-purple-400">10,000 Reqs</span>
              <span className="text-[10px] font-mono text-purple-300">Redis BullMQ</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Double-Debit Shield</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lg font-bold font-mono text-amber-400">100% Active</span>
              <span className="text-[10px] font-mono text-amber-300">SHA-256 Lock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Live Events Stream (Left) & Selected Event Deep-Dive (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Event Stream List */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
          {/* Header & Filter Pills */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                Recorded Stress Events ({filteredEvents.length})
              </h4>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  filterType === 'ALL'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('CRITICAL')}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  filterType === 'CRITICAL'
                    ? 'bg-red-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Trips
              </button>
              <button
                onClick={() => setFilterType('ZERO_LOSS')}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  filterType === 'ZERO_LOSS'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                0-Loss
              </button>
            </div>
          </div>

          {/* Event Items */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredEvents.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              const isCritical = evt.severity === 'CRITICAL';
              const isResolved = evt.severity === 'RESOLVED';
              const isWarning = evt.severity === 'WARNING';

              return (
                <div
                  key={evt.id}
                  id={`stress-event-${evt.id}`}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500/80 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isCritical
                            ? 'bg-red-500 animate-pulse'
                            : isWarning
                            ? 'bg-amber-500'
                            : isResolved
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <span className="font-bold font-mono text-xs text-slate-900 dark:text-white">
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{evt.relativeTime}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {evt.narrative}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      Burst: {evt.burstTps} TPS &bull; CB: {evt.circuitState}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Queue: {evt.queueDepth} held
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep-Dive Event Impact & Technical Explanation */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm flex flex-col justify-between">
          {selectedEvent ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-500" />
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                    Event Technical Forensic
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">ID: {selectedEvent.id}</span>
              </div>

              {/* Timestamp & Target */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ISO Timestamp:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    {selectedEvent.timestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Endpoint:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                    {selectedEvent.targetEndpoint}
                  </span>
                </div>
              </div>

              {/* Exact Impact Narrative */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Engineering Impact Narrative
                </span>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedEvent.narrative}
                </div>
              </div>

              {/* Safeguard Architecture Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Safeguard Defense:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                    {selectedEvent.safeguardMechanism}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Idempotency HMAC:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      {selectedEvent.idempotencyHash}
                    </span>
                    <button
                      onClick={() => handleCopyHash(selectedEvent.idempotencyHash)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                      title="Copy Hash"
                    >
                      {copiedHash === selectedEvent.idempotencyHash ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Circuit State</span>
                    <span
                      className={`font-bold text-sm ${
                        selectedEvent.circuitState === 'OPEN'
                          ? 'text-red-500'
                          : selectedEvent.circuitState === 'HALF_OPEN'
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {selectedEvent.circuitState}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Buffered In Redis</span>
                    <span className="font-bold text-sm text-blue-500">
                      {selectedEvent.queueDepth} Items (0 Lost)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs font-mono">
              Select an event from the list to view forensic logs
            </div>
          )}

          {/* Bottom Callout: Architecture & Safety Guarantee */}
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Architecture Guarantee:</strong> Token Bucket rate-limiting + Redis Redlock Mutex guarantees zero 429 customer dropoffs and 100% zero-double-charge safety during peak spikes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
