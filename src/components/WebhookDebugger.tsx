import React, { useState } from 'react';
import {
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Play,
  RotateCcw,
  Clock,
  Zap,
  Code,
  FileCode,
  Sparkles,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import { TransactionRecord } from '../types';

interface WebhookDebuggerProps {
  transactions: TransactionRecord[];
  onReplayWebhook: (payload: any) => Promise<any>;
}

export const WebhookDebugger: React.FC<WebhookDebuggerProps> = ({
  transactions,
  onReplayWebhook,
}) => {
  const [selectedTxId, setSelectedTxId] = useState<string>(transactions[0]?.id || 'sample_01');
  const [copied, setCopied] = useState<boolean>(false);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replaySuccess, setReplaySuccess] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'payload' | 'signature' | 'waterfall' | 'diff'>('payload');

  const selectedTx = transactions.find((t) => t.id === selectedTxId) || transactions[0];

  const payload = selectedTx?.rawPayload || {
    entity: 'event',
    account_id: 'acc_RzpProdMerchant99',
    event: 'payment.failed',
    contains: ['payment'],
    payload: {
      payment: {
        entity: {
          id: selectedTx?.paymentId || 'pay_DemoFail771',
          entity: 'payment',
          amount: selectedTx?.amountPaise || 349900,
          currency: 'INR',
          status: 'failed',
          order_id: selectedTx?.orderId || 'order_Demo882',
          method: selectedTx?.method || 'netbanking',
          bank: selectedTx?.bank || 'HDFC',
          email: selectedTx?.customerEmail || 'aarav.mehta@gmail.com',
          contact: selectedTx?.customerPhone || '+919876501234',
          error_code: selectedTx?.errorCode || 'BAD_REQUEST_ERROR',
          error_description: selectedTx?.errorReason || 'bank_system_unreachable',
          error_source: 'bank',
          error_step: 'payment_authorization',
          error_reason: selectedTx?.errorReason || 'bank_system_unreachable',
          created_at: Math.floor(Date.now() / 1000),
        },
      },
    },
    created_at: Math.floor(Date.now() / 1000),
  };

  const payloadString = JSON.stringify(payload, null, 2);

  const mockSecret = 'whsec_rzp_live_sec_prod_99x81';
  const mockSignature = '9d2f5a6b7e1c8d4f0a3e2b1c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e';

  const handleCopy = () => {
    navigator.clipboard.writeText(payloadString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplay = async () => {
    setIsReplaying(true);
    setReplaySuccess(null);
    try {
      await onReplayWebhook(payload);
      setReplaySuccess(true);
    } catch (e) {
      setReplaySuccess(false);
    } finally {
      setIsReplaying(false);
    }
  };

  return (
    <div id="webhook-debugger" className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Razorpay Webhook Inspector & Debugger</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                HMAC-SHA256 Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect raw payload ingress, verify cryptographic signatures, test replay attacks, and profile execution latency.
            </p>
          </div>
        </div>

        {/* Transaction Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Select Event:</span>
          <select
            value={selectedTxId}
            onChange={(e) => setSelectedTxId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
          >
            {transactions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.orderId} ({t.bank || t.method}) - ₹{(t.amountPaise / 100).toFixed(0)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('payload')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'payload' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Raw Payload Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('signature')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'signature' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>HMAC-SHA256 Signature</span>
        </button>

        <button
          onClick={() => setActiveTab('waterfall')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'waterfall' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Latency Waterfall (Trace)</span>
        </button>

        <button
          onClick={() => setActiveTab('diff')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'diff' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Failed vs Recovered Diff</span>
        </button>
      </div>

      {/* Tab 1: Raw JSON Payload Tree */}
      {activeTab === 'payload' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">Event: payment.failed</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Size: {payloadString.length} bytes
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={handleReplay}
                disabled={isReplaying}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isReplaying ? 'animate-spin' : ''}`} />
                <span>{isReplaying ? 'Replaying...' : 'Replay Webhook'}</span>
              </button>
            </div>
          </div>

          {replaySuccess !== null && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                replaySuccess
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/60 border-red-500/40 text-red-300'
              }`}
            >
              {replaySuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Replay Success! Webhook re-injected into processing queue with new idempotency key.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Replay Failed. Check server log for validation errors.</span>
                </>
              )}
            </div>
          )}

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
            <pre className="leading-relaxed">{payloadString}</pre>
          </div>
        </div>
      )}

      {/* Tab 2: HMAC-SHA256 Signature Verification */}
      {activeTab === 'signature' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Cryptographic Webhook Signature Verification</h3>
          </div>
          <p className="text-xs text-slate-400">
            Razorpay signs every outbound webhook using HMAC-SHA256. RecoverAI authenticates every payload prior to ingestion to prevent spoofing.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Received Header: X-Razorpay-Signature</div>
              <div className="text-emerald-400 font-bold break-all">{mockSignature}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Configured Secret (HMAC Key):</div>
              <div className="text-blue-400 font-bold">{mockSecret}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Calculated Digest: crypto.createHmac('sha256', secret).update(body).digest('hex')</div>
              <div className="text-emerald-400 font-bold break-all">{mockSignature}</div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>SIGNATURE MATCH: 100% Cryptographically Authentic</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">Timing-Safe Comparison: 0.42ms</span>
          </div>
        </div>
      )}

      {/* Tab 3: Execution Latency Waterfall Trace */}
      {activeTab === 'waterfall' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>End-to-End Processing Latency Waterfall</span>
              </h3>
              <p className="text-xs text-slate-400">Total pipeline turnaround time from webhook ingress to customer rail dispatch</p>
            </div>
            <div className="text-right">
              <span className="text-base font-bold font-mono text-emerald-400">102.8ms</span>
              <span className="text-[10px] text-slate-400 block">SLA: &lt;200ms (Passed)</span>
            </div>
          </div>

          {/* Waterfall Stages */}
          <div className="space-y-2.5 text-xs">
            {/* Stage 1 */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-[10px]">1</span>
                <div>
                  <div className="text-slate-200 font-semibold">Edge Ingress & TLS Termination</div>
                  <div className="text-[10px] text-slate-500">Cloudflare Edge -&gt; NGINX Reverse Proxy</div>
                </div>
              </div>
              <div className="text-right font-mono text-blue-400 font-bold">1.8ms</div>
            </div>

            {/* Stage 2 */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-[10px]">2</span>
                <div>
                  <div className="text-slate-200 font-semibold">HMAC-SHA256 Signature Verification</div>
                  <div className="text-[10px] text-slate-500">Timing-safe cryptographic auth</div>
                </div>
              </div>
              <div className="text-right font-mono text-blue-400 font-bold">0.4ms</div>
            </div>

            {/* Stage 3 */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-[10px]">3</span>
                <div>
                  <div className="text-slate-200 font-semibold">Redis Mutex & Idempotency Key Lock</div>
                  <div className="text-[10px] text-slate-500">Guarantees zero duplicate recovery triggers</div>
                </div>
              </div>
              <div className="text-right font-mono text-blue-400 font-bold">2.6ms</div>
            </div>

            {/* Stage 4 */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-[10px]">4</span>
                <div>
                  <div className="text-white font-semibold flex items-center gap-1.5">
                    <span>Gemini 3.7 Flash Root-Cause Classifier</span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="text-[10px] text-slate-500">Telemetry diagnosis & personalized payload synthesis</div>
                </div>
              </div>
              <div className="text-right font-mono text-emerald-400 font-bold">84.2ms</div>
            </div>

            {/* Stage 5 */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">5</span>
                <div>
                  <div className="text-slate-200 font-semibold">Multi-Channel Recovery Rail Dispatch</div>
                  <div className="text-[10px] text-slate-500">UPI Deep-Link / WhatsApp Interactive Session Ready</div>
                </div>
              </div>
              <div className="text-right font-mono text-emerald-400 font-bold">13.8ms</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Failed vs Recovered Diff */}
      {activeTab === 'diff' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Event Lifecycle State Diff</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Ingress State */}
            <div className="bg-slate-950 p-4 rounded-xl border border-red-500/30 space-y-2">
              <div className="text-red-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Initial Event: payment.failed
              </div>
              <div className="text-[11px] text-slate-300 space-y-1">
                <div>status: <span className="text-red-400 font-bold">"failed"</span></div>
                <div>error_reason: <span className="text-red-400">"{selectedTx?.errorReason}"</span></div>
                <div>captured: <span className="text-slate-400">false</span></div>
                <div>amount_refunded: <span className="text-slate-400">0</span></div>
              </div>
            </div>

            {/* Recovered Settlement State */}
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2">
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Final Event: payment.captured
              </div>
              <div className="text-[11px] text-slate-300 space-y-1">
                <div>status: <span className="text-emerald-400 font-bold">"captured"</span></div>
                <div>recovery_method: <span className="text-emerald-400 font-bold">"{selectedTx?.recoveredMethod || 'UPI_INTENT_FALLBACK'}"</span></div>
                <div>captured: <span className="text-emerald-400 font-bold">true</span></div>
                <div>recovered_amount: <span className="text-emerald-400 font-bold">₹{((selectedTx?.amountPaise || 0) / 100).toFixed(0)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
