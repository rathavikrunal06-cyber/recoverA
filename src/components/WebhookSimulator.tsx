import React, { useState } from 'react';
import { Send, Code2, AlertTriangle, CheckCircle, Shield, Sparkles, RefreshCw, Layers, ArrowRight } from 'lucide-react';
import { PRESET_WEBHOOKS, WebhookPreset } from '../data/mockEvents';
import { RazorpayWebhookPayload, TransactionRecord } from '../types';

interface WebhookSimulatorProps {
  onSimulate: (payload: RazorpayWebhookPayload) => Promise<TransactionRecord | null>;
  onBatchSimulate: () => void;
  isSimulating: boolean;
  onOpenCustomerView: (tx: TransactionRecord) => void;
}

export const WebhookSimulator: React.FC<WebhookSimulatorProps> = ({
  onSimulate,
  onBatchSimulate,
  isSimulating,
  onOpenCustomerView,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<WebhookPreset>(PRESET_WEBHOOKS[0]);
  const [rawJson, setRawJson] = useState<string>(JSON.stringify(PRESET_WEBHOOKS[0].payload, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [lastDispatchedTx, setLastDispatchedTx] = useState<TransactionRecord | null>(null);
  const [pipelineStep, setPipelineStep] = useState<number>(0);

  const handleSelectPreset = (preset: WebhookPreset) => {
    setSelectedPreset(preset);
    setRawJson(JSON.stringify(preset.payload, null, 2));
    setJsonError(null);
    setLastDispatchedTx(null);
    setPipelineStep(0);
  };

  const handleJsonChange = (val: string) => {
    setRawJson(val);
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const handleDispatch = async () => {
    try {
      const parsed: RazorpayWebhookPayload = JSON.parse(rawJson);
      setPipelineStep(1); // Ingesting & Verifying Signature

      setTimeout(() => setPipelineStep(2), 200); // Diagnostic reasoning
      setTimeout(() => setPipelineStep(3), 500); // Recovery dispatched

      const tx = await onSimulate(parsed);
      if (tx) {
        setLastDispatchedTx(tx);
        setPipelineStep(4);
      }
    } catch (e: any) {
      setJsonError(`Invalid JSON: ${e.message}`);
      setPipelineStep(0);
    }
  };

  return (
    <div id="webhook-simulator-view" className="space-y-6">
      {/* Header section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Code2 className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white">Razorpay Webhook Event Ingestion Simulator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Trigger realistic production failure payloads as dispatched by the Razorpay Gateway (`payment.failed`, `order.abandoned`). 
              Watch RecoverAI intercept, classify the root cause, and dispatch the optimal recovery rail with zero human delay.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-trigger-batch-sim"
              onClick={onBatchSimulate}
              disabled={isSimulating}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Simulate Burst Load (5x)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Preset Selector + Payload Editor & Pipeline Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Presets Selection (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Real-World Razorpay Failure Scenarios
          </h3>

          <div className="space-y-2.5">
            {PRESET_WEBHOOKS.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <div
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">{preset.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {preset.categoryName}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                    {preset.description}
                  </p>

                  <div className="text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-emerald-400 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-300">Expected Tactic:</strong> {preset.expectedTactic}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Payload JSON Inspector & Live Action Trigger (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">Webhook JSON Payload</span>
                <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                  Event: payment.failed
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                X-Razorpay-Signature: <span className="text-emerald-400">0a7f9b2d8e4c...</span> (Auto-signed)
              </div>
            </div>

            {/* Code Editor Area */}
            <div className="relative">
              <textarea
                id="webhook-json-editor"
                value={rawJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                rows={13}
                className="w-full bg-slate-950 font-mono text-xs text-slate-200 p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                spellCheck={false}
              />
              {jsonError && (
                <div className="absolute bottom-3 left-3 right-3 bg-red-950/90 border border-red-800 text-red-300 text-xs p-2 rounded-lg flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Idempotent Guardrail Enabled</span>
              </div>

              <button
                id="btn-dispatch-webhook"
                onClick={handleDispatch}
                disabled={isSimulating || Boolean(jsonError)}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Processing Ingestion...' : 'Dispatch Webhook Event'}</span>
              </button>
            </div>
          </div>

          {/* Real-time Ingestion Pipeline Visualizer */}
          {pipelineStep > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-fade-in shadow-sm">
              <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" /> Real-time Execution Pipeline
              </h4>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className={`p-2.5 rounded-xl border ${pipelineStep >= 1 ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <div className="font-bold text-[11px]">1. Ingest & HMAC</div>
                  <div className="text-[9px] mt-0.5">Signature Verified</div>
                </div>

                <div className={`p-2.5 rounded-xl border ${pipelineStep >= 2 ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <div className="font-bold text-[11px]">2. Dual-Tier AI</div>
                  <div className="text-[9px] mt-0.5">Root Cause Diagnosed</div>
                </div>

                <div className={`p-2.5 rounded-xl border ${pipelineStep >= 3 ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <div className="font-bold text-[11px]">3. Rail Selected</div>
                  <div className="text-[9px] mt-0.5">UPI / WhatsApp / Dunning</div>
                </div>

                <div className={`p-2.5 rounded-xl border ${pipelineStep >= 4 ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <div className="font-bold text-[11px]">4. Dispatched</div>
                  <div className="text-[9px] mt-0.5">Ready for Recovery</div>
                </div>
              </div>

              {lastDispatchedTx && (
                <div className="mt-4 p-3.5 bg-blue-950/40 border border-blue-500/40 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Recovery Strategy Generated: {lastDispatchedTx.diagnosis?.recommendedStrategy}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {lastDispatchedTx.diagnosis?.actionPayload.title} &bull; Processed in {lastDispatchedTx.diagnosis?.processingTimeMs}ms
                    </p>
                  </div>

                  <button
                    id="btn-test-recovery-flow"
                    onClick={() => onOpenCustomerView(lastDispatchedTx)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg shadow transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Test Customer Recovery</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
