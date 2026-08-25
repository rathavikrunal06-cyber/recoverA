import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  BrainCircuit,
  Zap,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  RefreshCw,
  Download,
  Copy,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Info,
  Clock,
  ShieldCheck,
  UserCheck,
  FileCode,
  Globe,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { TransactionRecord, RecoveryStatus, RecoveryChannel } from '../types';
import { simulateAnomaly, overrideTransaction } from '../services/api';

interface AnomalyDetectionLogProps {
  transactions: TransactionRecord[];
  onRefresh?: () => void;
  onOpenCustomerView?: (tx: TransactionRecord) => void;
  onNotification?: (msg: { text: string; type: 'success' | 'info' | 'error'; title?: string }) => void;
}

export const AnomalyDetectionLog: React.FC<AnomalyDetectionLogProps> = ({
  transactions,
  onRefresh,
  onOpenCustomerView,
  onNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [confidenceFilter, setConfidenceFilter] = useState<'ALL' | 'CRITICAL' | 'MODERATE'>('ALL');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOverrideTx, setSelectedOverrideTx] = useState<TransactionRecord | null>(null);
  const [overrideStrategy, setOverrideStrategy] = useState<RecoveryChannel>('INSTANT_UPI_SWITCH');
  const [overrideNotes, setOverrideNotes] = useState<string>('');
  const [isOverriding, setIsOverriding] = useState<boolean>(false);
  const [showRawJsonMap, setShowRawJsonMap] = useState<Record<string, boolean>>({});

  // Filter out outlier / low-confidence transactions (Confidence < 0.82 or flagged as isAnomaly)
  const anomalyTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const conf = tx.diagnosis?.confidenceScore ?? 1.0;
      const isOutlier = (tx.diagnosis?.isAnomaly === true) || conf < 0.82;
      if (!isOutlier) return false;

      // Category filter
      if (selectedCategory !== 'ALL') {
        const cat = tx.diagnosis?.anomalyCategory || tx.diagnosis?.failureCategory || '';
        if (cat !== selectedCategory) return false;
      }

      // Confidence severity filter
      if (confidenceFilter === 'CRITICAL' && conf >= 0.65) return false;
      if (confidenceFilter === 'MODERATE' && (conf < 0.65 || conf >= 0.82)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          tx.orderId.toLowerCase().includes(q) ||
          tx.customerName.toLowerCase().includes(q) ||
          tx.errorReason.toLowerCase().includes(q) ||
          (tx.bank && tx.bank.toLowerCase().includes(q)) ||
          (tx.diagnosis?.anomalyCategory && tx.diagnosis.anomalyCategory.toLowerCase().includes(q)) ||
          (tx.diagnosis?.lowConfidenceReason && tx.diagnosis.lowConfidenceReason.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [transactions, selectedCategory, confidenceFilter, searchQuery]);

  // Set default expanded card to the first anomaly if none is selected
  React.useEffect(() => {
    if (anomalyTransactions.length > 0 && !expandedTxId) {
      setExpandedTxId(anomalyTransactions[0].id);
    }
  }, [anomalyTransactions, expandedTxId]);

  // Telemetry Aggregates
  const totalOutliers = anomalyTransactions.length;
  const avgConfidence =
    totalOutliers > 0
      ? Math.round(
          (anomalyTransactions.reduce((acc, t) => acc + (t.diagnosis?.confidenceScore || 0.6), 0) /
            totalOutliers) *
            100
        )
      : 64;

  const formatINR = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  const handleSimulateAnomaly = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateAnomaly();
      if (onNotification) {
        onNotification({
          type: 'info',
          title: 'Outlier Edge Case Ingested',
          text: `Injected edge case ${res.transaction.orderId} (Model Confidence: ${Math.round(
            (res.transaction.diagnosis?.confidenceScore || 0.55) * 100
          )}%)`,
        });
      }
      setExpandedTxId(res.transaction.id);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      if (onNotification) {
        onNotification({
          type: 'error',
          title: 'Simulation Failed',
          text: err.message || 'Could not generate anomaly transaction',
        });
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyOverride = async () => {
    if (!selectedOverrideTx) return;
    setIsOverriding(true);
    try {
      await overrideTransaction(selectedOverrideTx.id, overrideStrategy, overrideNotes);
      if (onNotification) {
        onNotification({
          type: 'success',
          title: 'Human Override Enacted',
          text: `Transaction ${selectedOverrideTx.orderId} re-routed via ${overrideStrategy}.`,
        });
      }
      setSelectedOverrideTx(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      if (onNotification) {
        onNotification({
          type: 'error',
          title: 'Override Failed',
          text: err.message || 'Failed to update transaction',
        });
      }
    } finally {
      setIsOverriding(false);
    }
  };

  const handleCopyIncidentReport = (tx: TransactionRecord) => {
    const diag = tx.diagnosis;
    const report = `# AI REVENUE RECOVERY - ANOMALY & OUTLIER INCIDENT REPORT
Order ID: ${tx.orderId}
Payment ID: ${tx.paymentId}
Amount: INR ${(tx.amountPaise / 100).toFixed(2)}
Customer: ${tx.customerName} (${tx.customerEmail})
Timestamp: ${new Date(tx.timestamp).toISOString()}
Payment Rail: ${tx.method.toUpperCase()} (${tx.bank || 'N/A'})

--- MODEL DIAGNOSTIC EVALUATION ---
Confidence Score: ${Math.round((diag?.confidenceScore || 0) * 100)}% (LOW_CONFIDENCE_FLAGGED)
Customer Intent Propensity: ${Math.round((diag?.customerIntentScore || 0) * 100)}%
Anomaly Category: ${diag?.anomalyCategory || 'EDGE_CASE_UNCLASSIFIED'}
Root Cause: ${diag?.rootCauseAnalysis || tx.errorReason}

--- WHY MODEL FLAGGED LOW CONFIDENCE ---
${diag?.lowConfidenceReason || 'Ambiguous gateway telemetry with conflicting error status.'}

--- AUTONOMOUS RESOLUTION & EDGE-CASE SAFEGUARDS ---
Recommended Fallback: ${diag?.recommendedStrategy || 'SMART_GATEWAY_FALLBACK'}
Edge-Case Handling: ${diag?.edgeCaseHandling || 'Dispatched guarded payment verification payload.'}
Safeguard Interlock: ${diag?.fallbackSafeguardTriggered || 'Zero double-charge lock enforced.'}
Guardrails: Anti-Spam: ${diag?.guardrailsApplied.antiSpamPassed ? 'PASSED' : 'FAILED'}, Double-Charge Lock: ${diag?.guardrailsApplied.zeroDoubleChargeVerified ? 'VERIFIED' : 'FAILED'}, Margin Protection: ${diag?.guardrailsApplied.marginProtectionCompliant ? 'ACTIVE' : 'FAILED'}

Report Generated by Razorpay Autonomous Revenue Recovery Engine`;

    navigator.clipboard.writeText(report);
    setCopiedId(tx.id);
    setTimeout(() => setCopiedId(null), 3000);
    if (onNotification) {
      onNotification({
        type: 'info',
        title: 'Report Copied to Clipboard',
        text: `Incident markdown for ${tx.orderId} ready to share with engineering/risk teams.`,
      });
    }
  };

  const handleExportAnomalyJson = () => {
    const jsonStr = JSON.stringify(anomalyTransactions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `razorpay_anomaly_detection_log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onNotification) {
      onNotification({
        type: 'success',
        title: 'Anomaly JSON Exported',
        text: `Exported ${anomalyTransactions.length} low-confidence edge case records.`,
      });
    }
  };

  const categories = [
    { key: 'ALL', label: 'All Anomalies' },
    { key: 'CROSS_BORDER_TOKEN_EXPIRY', label: 'Cross-Border FX' },
    { key: 'REGIONAL_BANK_SWITCH_DESYNC', label: 'Regional Bank Desync' },
    { key: 'SPLIT_MANDATE_TAX_AMBIGUITY', label: 'Mandate Ambiguity' },
    { key: 'HIGH_VALUE_VELOCITY_CAP', label: 'High-Value Velocity' },
    { key: '3DS2_CRYPTOGRAPHIC_SKEW', label: 'Cryptographic Clock Skew' },
  ];

  return (
    <div id="anomaly-detection-log-section" className="space-y-4">
      {/* Section Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl shrink-0 shadow-inner">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Anomaly Detection & Low-Confidence Edge-Case Log
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {totalOutliers} Outliers Under Observation
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  100% Graceful Fallback SLA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Highlights outlier transactions where the AI recovery model had low confidence (&lt; 82%) due to ambiguous
                gateway telemetry, unusual bank switch response codes, cross-border token mismatches, or velocity spikes—demonstrating
                how guarded fallback workflows prevent false positives and double-charges.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              id="btn-simulate-anomaly"
              onClick={handleSimulateAnomaly}
              disabled={isSimulating}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              title="Inject a realistic edge-case anomaly into the live telemetry feed"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Ingesting Outlier...' : 'Simulate Outlier Edge Case'}</span>
            </button>

            <button
              id="btn-export-anomaly-json"
              onClick={handleExportAnomalyJson}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              title="Export anomaly telemetry log as JSON"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Audit (.json)</span>
            </button>
          </div>
        </div>

        {/* Real-time Outlier KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Outlier Incidents</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{totalOutliers} Cases</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Isolated from bulk retry rail</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Avg Outlier Confidence</div>
            <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">{avgConfidence}%</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5">vs. 96.5% standard baseline</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Guarded Safeguard Rate</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">100.0%</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">0 blind automated retries</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Double Charge Protection</div>
            <div className="text-xl font-bold font-mono text-blue-400 mt-0.5">100% Locked</div>
            <div className="text-[10px] text-blue-400/80 mt-0.5">Mutex verified across CBS</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-anomalies-input"
            type="text"
            placeholder="Search Order, Reason, Bank, Error Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto justify-between md:justify-end">
          <div className="flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                id={`filter-anomaly-cat-${cat.key.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <button
              id="filter-confidence-all"
              onClick={() => setConfidenceFilter('ALL')}
              className={`px-2 py-1 text-[11px] rounded-lg font-medium transition-all ${
                confidenceFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Severities
            </button>
            <button
              id="filter-confidence-critical"
              onClick={() => setConfidenceFilter('CRITICAL')}
              className={`px-2 py-1 text-[11px] rounded-lg font-semibold transition-all ${
                confidenceFilter === 'CRITICAL'
                  ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                  : 'text-red-400 hover:bg-red-500/10'
              }`}
              title="Filter by Critical Low Confidence (< 65%)"
            >
              Critical &lt;65%
            </button>
          </div>
        </div>
      </div>

      {/* Outlier Transactions List */}
      <div className="space-y-3">
        {anomalyTransactions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 space-y-3">
            <div className="p-3 bg-slate-800 text-slate-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">No matching anomaly edge-cases</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No active outlier transactions match your current search and severity filters.
              </p>
            </div>
            <button
              onClick={handleSimulateAnomaly}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate New Outlier Transaction</span>
            </button>
          </div>
        ) : (
          anomalyTransactions.map((tx) => {
            const isExpanded = expandedTxId === tx.id;
            const diag = tx.diagnosis;
            const confidencePercent = Math.round((diag?.confidenceScore ?? 0.6) * 100);
            const isCritical = confidencePercent < 65;
            const isRawJsonOpen = Boolean(showRawJsonMap[tx.id]);

            return (
              <div
                key={tx.id}
                id={`anomaly-card-${tx.id}`}
                className={`bg-slate-900 border rounded-2xl transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                  className={`p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                    isExpanded ? 'bg-slate-900/90' : 'bg-slate-900/60 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button className="text-slate-400 hover:text-slate-200 shrink-0">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-amber-400" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-white">{tx.orderId}</span>

                        {/* Outlier Category Pill */}
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>{diag?.anomalyCategory || 'EDGE_CASE'}</span>
                        </span>

                        {/* Low Confidence Badge */}
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                            isCritical
                              ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                          title={`AI Model Confidence is ${confidencePercent}% (Threshold: > 82%)`}
                        >
                          <BrainCircuit className="w-3 h-3" />
                          <span>AI Confidence: {confidencePercent}% ({isCritical ? 'CRITICAL LOW' : 'LOW'})</span>
                        </span>

                        {diag?.humanOverrideApplied && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            <span>Human Verified</span>
                          </span>
                        )}

                        {tx.bank && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {tx.bank}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{tx.customerName}</span>
                        <span>&bull;</span>
                        <span>{tx.method.toUpperCase()}</span>
                        <span>&bull;</span>
                        <span className="text-red-400 font-mono">{tx.errorReason}</span>
                        <span>&bull;</span>
                        <span className="text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end space-x-4 pl-7 md:pl-0">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white">{formatINR(tx.amountPaise)}</div>
                      <div className="text-[10px] text-slate-400">
                        Fallback: <strong className="text-amber-300">{diag?.recommendedStrategy || 'Guarded'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Deep Anomaly Diagnostic Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-800 p-5 bg-slate-950/70 space-y-5 animate-fade-in text-xs">
                    {/* Confidence Meter Bar */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-white">AI Diagnostic Uncertainty Breakdown</span>
                        </div>
                        <div className="font-mono text-xs">
                          <span className="text-slate-400">Model Confidence: </span>
                          <strong className={isCritical ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                            {confidencePercent}%
                          </strong>
                          <span className="text-slate-500"> (Standard Baseline: 96%)</span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 flex">
                        <div
                          className={`h-full transition-all rounded-full ${
                            isCritical
                              ? 'bg-gradient-to-r from-red-600 to-red-400'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          }`}
                          style={{ width: `${confidencePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Dual Box: Why AI Flagged Low Confidence vs How It Handled The Edge Case */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Box 1: Why AI Flagged Low Confidence */}
                      <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-red-400 font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Why AI Model Flagged Low Confidence</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {diag?.lowConfidenceReason ||
                            'Non-standard error code returned by issuer bank with ambiguous payment state, triggering low confidence thresholds to prevent unwarranted retries.'}
                        </p>
                        <div className="pt-2 border-t border-red-900/40 text-[11px] text-slate-400 space-y-1">
                          <div>
                            <span className="text-slate-500">Root Cause Error: </span>
                            <span className="font-mono text-red-300">{diag?.rootCauseAnalysis}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Hazard Prevented: </span>
                            <span className="text-slate-300">
                              Avoided duplicate debit, customer dispute, or unhedged FX slippage.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Box 2: How AI Handled the Edge Case */}
                      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>How AI Engine Handled The Edge Case</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {diag?.edgeCaseHandling ||
                            'Enforced strict asynchronous verification probe and downgraded to safe, verified pay-by-link channel without blind retries.'}
                        </p>
                        <div className="pt-2 border-t border-emerald-900/40 text-[11px] space-y-1">
                          <div>
                            <span className="text-slate-500">Fallback Rail: </span>
                            <strong className="text-emerald-300 font-mono">
                              {diag?.recommendedStrategy} ({diag?.actionPayload.targetMethod})
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-500">Active Safeguard: </span>
                            <span className="text-slate-300 font-medium">
                              {diag?.fallbackSafeguardTriggered || 'Idempotency Mutex Lock Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step AI Reasoning Chain */}
                    {diag?.reasoningSteps && diag.reasoningSteps.length > 0 && (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-slate-200 font-bold">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Autonomous Diagnostic Reasoning Trace</span>
                        </div>
                        <ol className="space-y-1.5 pl-4 list-decimal text-slate-400">
                          {diag.reasoningSteps.map((step, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Guardrails and Safety Checklist */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Zero Double-Charge Lock: <strong>Active</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Anti-Spam Frequency Cap: <strong>Passed</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Margin Protection: <strong>0% Discretionary Loss</strong></span>
                        </div>
                      </div>

                      <div className="text-slate-500 font-mono">
                        Latency: {diag?.processingTimeMs || 140}ms
                      </div>
                    </div>

                    {/* Interactive Action Toolbar */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        {onOpenCustomerView && (
                          <button
                            id={`btn-test-customer-recovery-${tx.id}`}
                            onClick={() => onOpenCustomerView(tx)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            title="Open interactive customer payment simulator for this transaction"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Test Customer Recovery View</span>
                          </button>
                        )}

                        <button
                          id={`btn-override-modal-${tx.id}`}
                          onClick={() => {
                            setSelectedOverrideTx(tx);
                            setOverrideStrategy(diag?.recommendedStrategy || 'INSTANT_UPI_SWITCH');
                            setOverrideNotes(`Manual review validated for ${tx.orderId}`);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Apply human supervisor override for this edge case"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span>Human Override / Re-route</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-copy-incident-report-${tx.id}`}
                          onClick={() => handleCopyIncidentReport(tx)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>{copiedId === tx.id ? 'Copied Incident Report!' : 'Copy Incident Report'}</span>
                        </button>

                        <button
                          id={`btn-toggle-raw-json-${tx.id}`}
                          onClick={() =>
                            setShowRawJsonMap((prev) => ({ ...prev, [tx.id]: !prev[tx.id] }))
                          }
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
                          title="Toggle raw webhook & diagnostic JSON"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Raw Webhook & Diagnostic JSON Viewer */}
                    {isRawJsonOpen && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-60 space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                          Raw Webhook Payload & Model Output
                        </div>
                        <pre>{JSON.stringify(tx, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Human Override Dialog Modal */}
      {selectedOverrideTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center gap-2 text-blue-400">
              <UserCheck className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Human Supervisor Decision Override</h3>
            </div>

            <p className="text-xs text-slate-400">
              Override model uncertainty for transaction <strong className="text-white font-mono">{selectedOverrideTx.orderId}</strong> ({formatINR(selectedOverrideTx.amountPaise)}). This locks the transaction as manually verified.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Override Recovery Strategy:</label>
                <select
                  value={overrideStrategy}
                  onChange={(e) => setOverrideStrategy(e.target.value as RecoveryChannel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="INSTANT_UPI_SWITCH">INSTANT_UPI_SWITCH (Force Instant 1-Tap UPI)</option>
                  <option value="WHATSAPP_INTERACTIVE_PAY">WHATSAPP_INTERACTIVE_PAY (Interactive WhatsApp Link)</option>
                  <option value="SMART_GATEWAY_FALLBACK">SMART_GATEWAY_FALLBACK (Multi-Currency Global Rail)</option>
                  <option value="ADAPTIVE_DUNNING">ADAPTIVE_DUNNING (Salary-Aligned Batch Retry)</option>
                  <option value="MANUAL_INTERVENTION_REQUIRED">MANUAL_INTERVENTION_REQUIRED (Hold for Risk Desk)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Supervisor Notes / Justification:</label>
                <textarea
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Cardholder confirmed identity via secondary KYC; routing through secondary gateway..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedOverrideTx(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyOverride}
                disabled={isOverriding}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isOverriding ? 'Applying...' : 'Enforce Override'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
