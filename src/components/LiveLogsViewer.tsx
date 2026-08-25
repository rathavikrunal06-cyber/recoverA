import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Play,
  Pause,
  Trash2,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'DEBUG';
  service: 'INGRESS_GATEWAY' | 'GEMINI_AI' | 'DISTRIBUTED_LOCK' | 'DISPATCH_ENGINE' | 'SETTLEMENT';
  message: string;
  meta?: Record<string, any>;
}

const INITIAL_MOCK_LOGS: LogEntry[] = [
  {
    id: 'log_01',
    timestamp: '12:58:12.410',
    level: 'INFO',
    service: 'INGRESS_GATEWAY',
    message: 'Received Razorpay webhook payment.failed for order_Ecom_88912. Validating HMAC SHA256 signature.',
    meta: { account_id: 'acc_RzpProdMerchant99', payload_bytes: 1420, signature: 'verified_valid' },
  },
  {
    id: 'log_02',
    timestamp: '12:58:12.418',
    level: 'DEBUG',
    service: 'DISTRIBUTED_LOCK',
    message: 'Acquired Redis Redlock mutex for key: recovery:lock:order_Ecom_88912 (TTL: 30000ms).',
    meta: { lock_id: 'redlock_88a91b', idempotency_guaranteed: true },
  },
  {
    id: 'log_03',
    timestamp: '12:58:12.424',
    level: 'INFO',
    service: 'GEMINI_AI',
    message: 'Invoked Gemini 3.7 Flash sub-second reasoning prompt with error_reason="bank_system_unreachable".',
    meta: { model: 'gemini-3.7-flash', prompt_tokens: 312, temp: 0.1 },
  },
  {
    id: 'log_04',
    timestamp: '12:58:12.462',
    level: 'SUCCESS',
    service: 'GEMINI_AI',
    message: 'Gemini reasoning complete in 38ms. Action selected: NPCI_UPI_INTENT_SWITCH (Confidence: 96.4%).',
    meta: { latency_ms: 38, zero_double_charge_passed: true },
  },
  {
    id: 'log_05',
    timestamp: '12:58:12.490',
    level: 'INFO',
    service: 'DISPATCH_ENGINE',
    message: 'Generated pre-filled UPI Intent link & QR payload via NPCI fast-rail adapter.',
    meta: { rail: 'upi_intent', recovery_url: 'https://pay.rzp.io/rec/order_Ecom_88912' },
  },
  {
    id: 'log_06',
    timestamp: '12:58:12.512',
    level: 'SUCCESS',
    service: 'DISPATCH_ENGINE',
    message: 'Dispatched dynamic 1-click payment notification to buyer device via SMS/WhatsApp gateway.',
    meta: { status: 'DELIVERED', recipient: '+919876543210' },
  },
  {
    id: 'log_07',
    timestamp: '12:58:45.102',
    level: 'SUCCESS',
    service: 'SETTLEMENT',
    message: 'Received Razorpay payment.captured webhook for order_Ecom_88912. Payment recovered via PhonePe UPI!',
    meta: { amount_paise: 499900, recovered_in_seconds: 32.6 },
  },
];

export const LiveLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_MOCK_LOGS);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-streaming simulated log generator
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const services: LogEntry['service'][] = [
        'INGRESS_GATEWAY',
        'GEMINI_AI',
        'DISTRIBUTED_LOCK',
        'DISPATCH_ENGINE',
        'SETTLEMENT',
      ];
      const levels: LogEntry['level'][] = ['INFO', 'SUCCESS', 'DEBUG', 'WARN'];
      const chosenService = services[Math.floor(Math.random() * services.length)];
      const chosenLevel = levels[Math.floor(Math.random() * levels.length)];

      const sampleOrderNum = Math.floor(10000 + Math.random() * 90000);
      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;

      let msg = '';
      if (chosenService === 'INGRESS_GATEWAY') {
        msg = `Ingested webhook payment.failed for order_Retail_${sampleOrderNum}. Token bucket remaining: ${115 + Math.floor(Math.random() * 5)}/120.`;
      } else if (chosenService === 'GEMINI_AI') {
        msg = `Gemini 3.7 Flash diagnosed failure taxonomy in ${28 + Math.floor(Math.random() * 30)}ms. Zero double-charge safety verified.`;
      } else if (chosenService === 'DISTRIBUTED_LOCK') {
        msg = `Mutex released for order_Retail_${sampleOrderNum}. Idempotency cache key preserved for 24h.`;
      } else if (chosenService === 'DISPATCH_ENGINE') {
        msg = `Dispatched WhatsApp 1-Click Pay template to +91981122${Math.floor(1000 + Math.random() * 9000)}.`;
      } else {
        msg = `Payment captured successfully! ₹${(1200 + Math.random() * 8000).toFixed(0)} added to merchant balance.`;
      }

      const newEntry: LogEntry = {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: timeStr,
        level: chosenLevel,
        service: chosenService,
        message: msg,
      };

      setLogs((prev) => [...prev.slice(-150), newEntry]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isLive]);

  // Scroll to bottom on new log
  useEffect(() => {
    if (isLive && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isLive]);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch =
      searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleDownloadLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.level}] [${l.service}] ${l.message} ${l.meta ? JSON.stringify(l.meta) : ''}`
      )
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recoverai_telemetry_logs_${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInjectSampleBurst = () => {
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const burstEntries: LogEntry[] = [
      {
        id: `burst_1_${Date.now()}`,
        timestamp: timeStr,
        level: 'INFO',
        service: 'INGRESS_GATEWAY',
        message: '⚡ High-concurrency webhook burst intercepted (order_Burst_99120). Rate limit verified.',
      },
      {
        id: `burst_2_${Date.now()}`,
        timestamp: timeStr,
        level: 'SUCCESS',
        service: 'GEMINI_AI',
        message: 'Gemini 3.7 Flash sub-second inference: Bank 504 switch timeout detected -> NPCI UPI fallback in 34ms.',
      },
      {
        id: `burst_3_${Date.now()}`,
        timestamp: timeStr,
        level: 'SUCCESS',
        service: 'SETTLEMENT',
        message: 'Auto-recovery successful: ₹3,499.00 recovered and credited.',
      },
    ];
    setLogs((prev) => [...prev, ...burstEntries]);
  };

  return (
    <div id="live-logs-view" className="space-y-4 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-500 dark:text-blue-400 border border-blue-500/30">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Real-Time System Telemetry & Ingress Logs</h2>
              <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isLive ? 'Live Stream Active' : 'Stream Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sub-second traces of Razorpay webhook ingestion, HMAC validation, Redis Redlock locks, and Gemini 3.7 AI routing.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isLive
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLive ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <button
            onClick={handleInjectSampleBurst}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Simulate Log Event</span>
          </button>

          <button
            onClick={handleDownloadLogs}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            title="Download Logs"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearLogs}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-500 transition-all cursor-pointer"
            title="Clear Logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Log Level:</span>
          {(['ALL', 'INFO', 'SUCCESS', 'WARN', 'ERROR', 'DEBUG'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                filterLevel === lvl
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search order ID, HMAC, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Terminal Logs Window */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs shadow-2xl overflow-hidden">
        {/* Terminal Header Dots */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-slate-500 ml-2">recoverai-production-telemetry.sock</span>
          </div>
          <span className="text-[11px] text-slate-500">{filteredLogs.length} events logged</span>
        </div>

        {/* Log Entries Stream */}
        <div className="h-[440px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500">
              No logs matching current filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="hover:bg-slate-900/60 p-1.5 rounded transition-colors flex flex-col sm:flex-row sm:items-start gap-2 leading-relaxed"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      log.level === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : log.level === 'ERROR'
                        ? 'bg-red-500/20 text-red-400'
                        : log.level === 'WARN'
                        ? 'bg-amber-500/20 text-amber-400'
                        : log.level === 'DEBUG'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-slate-400 text-[10px] bg-slate-800/80 px-1.5 py-0.2 rounded">
                    {log.service}
                  </span>
                </div>

                <div className="flex-1 text-slate-300 break-all text-[11px]">
                  <span>{log.message}</span>
                  {log.meta && (
                    <span className="text-slate-500 ml-2 block sm:inline font-mono text-[10px]">
                      {JSON.stringify(log.meta)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
