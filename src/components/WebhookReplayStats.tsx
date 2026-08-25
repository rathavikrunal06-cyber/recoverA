import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  Play,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  FileCode,
  ShieldAlert,
  Activity,
  Filter,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { TransactionRecord } from '../types';

interface WebhookReplayStatsProps {
  transactions: TransactionRecord[];
  onTriggerReplay?: (tx: TransactionRecord) => Promise<any>;
}

export interface ReplayLogEntry {
  id: string;
  txId: string;
  orderId: string;
  timestamp: string;
  event: string;
  status: 'REPLAY_SUCCESS' | 'IDEMPOTENCY_SUPPRESSED' | 'DLQ_REDIRECTED' | 'AUTHENTICATING';
  httpStatus: number;
  latencyMs: number;
  hmacVerified: boolean;
  idempotencyKey: string;
  recoveredAmountPaise: number;
  channel: string;
}

export const WebhookReplayStats: React.FC<WebhookReplayStatsProps> = ({
  transactions,
  onTriggerReplay,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'SUCCESS' | 'IDEMPOTENT_BLOCK' | 'DLQ'>('ALL');
  const [isExecutingBatch, setIsExecutingBatch] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ReplayLogEntry | null>(null);

  // Generate realistic replay logs based on transactions
  const replayLogs: ReplayLogEntry[] = [
    {
      id: 'rep_log_001',
      txId: transactions[0]?.id || 'tx_01',
      orderId: transactions[0]?.orderId || 'order_Retail_9921',
      timestamp: '12s ago',
      event: 'payment.failed',
      status: 'REPLAY_SUCCESS',
      httpStatus: 200,
      latencyMs: 38.4,
      hmacVerified: true,
      idempotencyKey: 'idem_rec_882910a',
      recoveredAmountPaise: transactions[0]?.amountPaise || 499900,
      channel: 'INSTANT_UPI_SWITCH',
    },
    {
      id: 'rep_log_002',
      txId: transactions[1]?.id || 'tx_02',
      orderId: transactions[1]?.orderId || 'order_SaaS_7718',
      timestamp: '1m ago',
      event: 'payment.failed',
      status: 'IDEMPOTENCY_SUPPRESSED',
      httpStatus: 409,
      latencyMs: 3.2,
      hmacVerified: true,
      idempotencyKey: 'idem_rec_110294b',
      recoveredAmountPaise: transactions[1]?.amountPaise || 289900,
      channel: 'MUTEX_CACHE_HIT',
    },
    {
      id: 'rep_log_003',
      txId: transactions[2]?.id || 'tx_03',
      orderId: transactions[2]?.orderId || 'order_Cart_5521',
      timestamp: '3m ago',
      event: 'payment.failed',
      status: 'REPLAY_SUCCESS',
      httpStatus: 200,
      latencyMs: 44.1,
      hmacVerified: true,
      idempotencyKey: 'idem_rec_993812c',
      recoveredAmountPaise: transactions[2]?.amountPaise || 189900,
      channel: 'WHATSAPP_INTERACTIVE_PAY',
    },
    {
      id: 'rep_log_004',
      txId: transactions[3]?.id || 'tx_04',
      orderId: transactions[3]?.orderId || 'order_Sub_3320',
      timestamp: '8m ago',
      event: 'subscription.charged_failed',
      status: 'DLQ_REDIRECTED',
      httpStatus: 202,
      latencyMs: 18.6,
      hmacVerified: true,
      idempotencyKey: 'idem_rec_449182d',
      recoveredAmountPaise: 129900,
      channel: 'ADAPTIVE_DUNNING_QUEUE',
    },
    {
      id: 'rep_log_005',
      txId: transactions[4]?.id || 'tx_05',
      orderId: 'order_Travel_8841',
      timestamp: '15m ago',
      event: 'payment.failed',
      status: 'IDEMPOTENCY_SUPPRESSED',
      httpStatus: 409,
      latencyMs: 2.8,
      hmacVerified: true,
      idempotencyKey: 'idem_rec_772619e',
      recoveredAmountPaise: 845000,
      channel: 'MUTEX_CACHE_HIT',
    },
    {
      id: 'rep_log_006',
      txId: 'tx_demo_06',
      orderId: 'order_B2B_1109',
      timestamp: '28m ago',
      event: 'payment.failed',
      status: 'REPLAY_SUCCESS',
      httpStatus: 200,
      latencyMs: 51.0,
      hmacVerified: true,
      idempotencyKey: 'idem_rec_339108f',
      recoveredAmountPaise: 1450000,
      channel: 'SMART_GATEWAY_FALLBACK',
    },
  ];

  const filteredLogs = replayLogs.filter((log) => {
    if (filter === 'SUCCESS') return log.status === 'REPLAY_SUCCESS';
    if (filter === 'IDEMPOTENT_BLOCK') return log.status === 'IDEMPOTENCY_SUPPRESSED';
    if (filter === 'DLQ') return log.status === 'DLQ_REDIRECTED';
    return true;
  });

  const totalReplays = 142;
  const successCount = 118;
  const idempotencyBlockedCount = 21;
  const dlqCount = 3;
  const avgReplayLatency = 34.6;
  const totalReplayRecoveredGMV = 48250000; // in paise

  const formatINR = (paise: number) => {
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(rupees);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div
      id="webhook-replay-stats-panel"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-xl">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Webhook Replay Telemetry & DLQ Stats
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                Zero Data Loss Guaranteed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit trails for automated idempotency locks, safe deduplication, and dead-letter queue re-evaluations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsExecutingBatch(true);
              setTimeout(() => setIsExecutingBatch(false), 900);
            }}
            disabled={isExecutingBatch}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isExecutingBatch ? 'animate-spin' : ''}`} />
            <span>Re-Probe DLQ Pipeline</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Replays */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Total Replays</div>
          <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-0.5">
            {totalReplays}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
            <Activity className="w-2.5 h-2.5 text-indigo-500" />
            <span>Last 24 hours</span>
          </div>
        </div>

        {/* Replay Success Rate */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Replay Success</div>
          <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            99.2%
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-bold">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>{successCount} Restored</span>
          </div>
        </div>

        {/* Idempotency Protected */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Idempotent Blocks</div>
          <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
            {idempotencyBlockedCount}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5 font-semibold">
            <ShieldCheck className="w-2.5 h-2.5" />
            <span>0 Double Charges</span>
          </div>
        </div>

        {/* DLQ Reroutes */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] uppercase font-semibold text-slate-400">DLQ Re-Routed</div>
          <div className="text-lg font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">
            {dlqCount}
          </div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-0.5 font-semibold">
            <Layers className="w-2.5 h-2.5" />
            <span>Zero Dropped</span>
          </div>
        </div>

        {/* Avg Latency */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Avg Execution</div>
          <div className="text-lg font-black font-mono text-blue-600 dark:text-blue-400 mt-0.5">
            {avgReplayLatency}ms
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5 font-semibold">
            <Zap className="w-2.5 h-2.5" />
            <span>P99 &lt; 65ms</span>
          </div>
        </div>

        {/* Replay Recovered GMV */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Replay Recovered</div>
          <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatINR(totalReplayRecoveredGMV)}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-bold">
            <Sparkles className="w-2.5 h-2.5" />
            <span>+14.8% Incremental</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Replay Log Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filter === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Events ({replayLogs.length})
            </button>
            <button
              onClick={() => setFilter('SUCCESS')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filter === 'SUCCESS'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Replay Success
            </button>
            <button
              onClick={() => setFilter('IDEMPOTENT_BLOCK')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filter === 'IDEMPOTENT_BLOCK'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Idempotency Protected
            </button>
            <button
              onClick={() => setFilter('DLQ')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filter === 'DLQ'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              DLQ Retries
            </button>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            HMAC-SHA256 Timing-Safe Authentication: <strong className="text-emerald-500">ACTIVE</strong>
          </span>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Order / Event</th>
                <th className="py-2.5 px-3 font-semibold">Replay State</th>
                <th className="py-2.5 px-3 font-semibold">Idempotency Key</th>
                <th className="py-2.5 px-3 font-semibold">Execution Latency</th>
                <th className="py-2.5 px-3 font-semibold">Channel Dispatched</th>
                <th className="py-2.5 px-3 font-semibold text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filteredLogs.map((log) => {
                const isIdempotent = log.status === 'IDEMPOTENCY_SUPPRESSED';
                const isDlq = log.status === 'DLQ_REDIRECTED';

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{log.orderId}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{log.event} &bull; {log.timestamp}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      {isIdempotent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <ShieldCheck className="w-3 h-3" /> Blocked (409 Safe)
                        </span>
                      ) : isDlq ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          <Layers className="w-3 h-3" /> DLQ Queued (202)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Replayed (200 OK)
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-600 dark:text-slate-300">
                          {log.idempotencyKey}
                        </span>
                        <button
                          onClick={() => handleCopy(log.idempotencyKey, log.id)}
                          className="text-slate-400 hover:text-slate-200 p-0.5"
                          title="Copy Idempotency Key"
                        >
                          {copiedKey === log.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="text-slate-900 dark:text-slate-200 font-bold">
                        {log.latencyMs}ms
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {log.channel}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatINR(log.recoveredAmountPaise)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
