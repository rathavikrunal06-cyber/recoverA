/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { RecoveryTrendGraph } from './components/RecoveryTrendGraph';
import { MonitoringPanel } from './components/MonitoringPanel';
import { WebhookSimulator } from './components/WebhookSimulator';
import { FailoverDashboard } from './components/FailoverDashboard';
import { WebhookDebugger } from './components/WebhookDebugger';
import { AILatencyStats } from './components/AILatencyStats';
import { ArchitectureView } from './components/ArchitectureView';
import { PitchStrategyView } from './components/PitchStrategyView';
import { LatencyHeatmap } from './components/LatencyHeatmap';
import { CustomerRecoveryModal } from './components/CustomerRecoveryModal';
import { CompetitiveComparison } from './components/CompetitiveComparison';
import { ApiHealthMonitor } from './components/ApiHealthMonitor';
import { RecoveryInsightReport } from './components/RecoveryInsightReport';
import { RoiCalculator } from './components/RoiCalculator';
import { LiveLogsViewer } from './components/LiveLogsViewer';
import { ModelComparison } from './components/ModelComparison';
import { FailureSimulator } from './components/FailureSimulator';
import { DynamicRailVisualization } from './components/DynamicRailVisualization';
import { WebhookReplayAnalysis } from './components/WebhookReplayAnalysis';
import { AutomatedComplianceReports } from './components/AutomatedComplianceReports';
import { LatencyTrendNotifications } from './components/LatencyTrendNotifications';
import { StakeholderDashboard } from './components/StakeholderDashboard';
import { ExplainabilityMode } from './components/ExplainabilityMode';
import { DataLatencyAlerts } from './components/DataLatencyAlerts';
import { DriftAnalysis } from './components/DriftAnalysis';
import { FutureScenarioSimulator } from './components/FutureScenarioSimulator';
import { CsvExportManager } from './components/CsvExportManager';
import { PerformanceBudget } from './components/PerformanceBudget';
import { ApiSecurityScan } from './components/ApiSecurityScan';
import { ScheduledReplay } from './components/ScheduledReplay';
import { RecoveryCostAnalysis } from './components/RecoveryCostAnalysis';
import { UnitEconomicImpactCard } from './components/UnitEconomicImpactCard';
import { NeuralRailDecisionPath } from './components/NeuralRailDecisionPath';
import { RevenueImpactGauge } from './components/RevenueImpactGauge';
import { AutonomousGatewayMesh } from './components/AutonomousGatewayMesh';
import { RecoveryGapCard } from './components/RecoveryGapCard';
import { WebhookReplayStats } from './components/WebhookReplayStats';
import { SystemHealthPulse } from './components/SystemHealthPulse';
import { StateSnapshotCompare } from './components/StateSnapshotCompare';
import { LiveStatusAlerts } from './components/LiveStatusAlerts';
import { AIExplainabilityHeatmap } from './components/AIExplainabilityHeatmap';
import { ExplainabilityLogSidebar } from './components/ExplainabilityLogSidebar';
import { SuccessStoryModal } from './components/SuccessStoryModal';
import { DeterministicTimeTravelReplay } from './components/DeterministicTimeTravelReplay';
import { DataPrivacySettingsModal } from './components/DataPrivacySettingsModal';
import { downloadSessionState } from './services/sessionExport';
import { DemoWalkthrough } from './components/DemoWalkthrough';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StorageManager } from './services/storage';
import {
  fetchMetrics,
  fetchTransactions,
  simulateWebhook,
  markAsRecovered,
  triggerBatchSimulation,
  resetDemoData,
  simulateRateLimitSpike,
} from './services/api';
import { SystemMetrics, TransactionRecord, RazorpayWebhookPayload, RecoveryChannel, AIDiagnosisResult } from './types';
import { AlertCircle, CheckCircle2, Zap, Sparkles, X, ArrowRight, BellRing } from 'lucide-react';

interface ToastData {
  id: string;
  title?: string;
  text: string;
  type: 'success' | 'info' | 'error';
  amount?: number;
  txId?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [metrics, setMetrics] = useState<SystemMetrics | null>(() => StorageManager.getMetrics());
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => StorageManager.getTransactions() || []);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedTxForCustomerFlow, setSelectedTxForCustomerFlow] = useState<TransactionRecord | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => StorageManager.getSettings().isDark);
  const [isPrivacyModeEnabled, setIsPrivacyModeEnabled] = useState<boolean>(
    () => StorageManager.getSettings().isPiiMaskingEnabled ?? true
  );
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);
  const [isSuccessStoryModalOpen, setIsSuccessStoryModalOpen] = useState<boolean>(false);
  const [isExplainabilitySidebarOpen, setIsExplainabilitySidebarOpen] = useState<boolean>(false);
  const [isTimeTravelModalOpen, setIsTimeTravelModalOpen] = useState<boolean>(false);
  const [selectedTxForExplainability, setSelectedTxForExplainability] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+Shift+R / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey && e.key.toLowerCase() === 'k') ||
        (e.ctrlKey && e.key.toLowerCase() === 'k') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r')
      ) {
        e.preventDefault();
        setIsTimeTravelModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time calculation of low-confidence (<85%) decisions requiring Human-in-the-Loop review
  const lowConfidenceAlertCount = useMemo(() => {
    return transactions.filter(
      (t) => (t.diagnosis?.confidenceScore ?? 1) < 0.85 && !t.diagnosis?.humanOverrideApplied
    ).length;
  }, [transactions]);

  // Open Explainability Log with first low-confidence transaction selected
  const handleOpenLowConfidenceReview = () => {
    const lowConfTx = transactions.find(
      (t) => (t.diagnosis?.confidenceScore ?? 1) < 0.85 && !t.diagnosis?.humanOverrideApplied
    );
    if (lowConfTx) {
      setSelectedTxForExplainability(lowConfTx.id);
    } else if (transactions.length > 0) {
      setSelectedTxForExplainability(transactions[0].id);
    }
    setIsExplainabilitySidebarOpen(true);
  };

  // Human-in-the-Loop Override Handler
  const handleHumanOverride = (txId: string, selectedRail: RecoveryChannel, operatorNotes?: string) => {
    setTransactions((prev) => {
      const updated: TransactionRecord[] = prev.map((tx) => {
        if (tx.id === txId) {
          const currentDiag: AIDiagnosisResult = tx.diagnosis || {
            failureCategory: 'GATEWAY_ERROR',
            rootCauseAnalysis: 'Operator reviewed transaction.',
            confidenceScore: 0.64,
            customerIntentScore: 0.95,
            recommendedStrategy: selectedRail,
            urgencyLevel: 'IMMEDIATE_REALTIME' as const,
            reasoningSteps: [],
            actionPayload: {
              title: `Operator Override: ${selectedRail}`,
              description: `Manual rail selection applied by Operator: ${operatorNotes || 'Approved'}`,
              targetMethod: selectedRail,
            },
            guardrailsApplied: {
              antiSpamPassed: true,
              zeroDoubleChargeVerified: true,
              marginProtectionCompliant: true,
              rateLimitCheck: 'PASSED',
            },
            processingTimeMs: 42,
          };

          const newDiag: AIDiagnosisResult = {
            ...currentDiag,
            confidenceScore: 1.0, // Marked 100% verified after human review
            humanOverrideApplied: true,
            humanOverrideDetails: {
              operator: 'admin@merchant.recoverai.io',
              selectedRail,
              notes: operatorNotes || 'Approved by merchant operator',
              timestamp: Date.now(),
            },
            recommendedStrategy: selectedRail,
            actionPayload: {
              ...currentDiag.actionPayload,
              title: `Human-in-the-Loop Verified: ${selectedRail.replace(/_/g, ' ')}`,
              description: operatorNotes || `Authorized and dispatched via ${selectedRail}`,
            },
            reasoningSteps: [
              ...currentDiag.reasoningSteps,
              `[HUMAN_OVERRIDE] Operator reviewed edge case and authorized dispatch via ${selectedRail}. Notes: ${operatorNotes || 'N/A'}`
            ],
          };

          return {
            ...tx,
            channelDispatched: selectedRail,
            diagnosis: newDiag,
          };
        }
        return tx;
      });

      StorageManager.saveTransactions(updated);
      return updated;
    });

    showToast(
      `Operator approved and dispatched recovery via ${selectedRail.replace(/_/g, ' ')}`,
      'success',
      'Human-in-the-Loop Override Applied'
    );
  };

  // Simulate Ambiguous Edge Case with low confidence (<85%) to test HITL prompt
  const handleSimulateEdgeCase = async () => {
    const now = Math.floor(Date.now() / 1000);
    const edgeCasePayload: RazorpayWebhookPayload = {
      entity: 'event',
      account_id: 'acc_RzpProdMerchant99',
      event: 'payment.failed',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: `pay_EdgeCase_${Date.now()}`,
            entity: 'payment',
            amount: 4500000, // ₹45,000 High-ticket VIP cart
            currency: 'INR',
            status: 'failed',
            order_id: `order_VipCart_${Date.now()}`,
            invoice_id: null,
            international: false,
            method: 'netbanking',
            amount_refunded: 0,
            refund_status: null,
            captured: false,
            description: 'High-Ticket Designer Workstation Bundle',
            card_id: null,
            bank: 'HDFC',
            wallet: null,
            vpa: null,
            email: 'vikram.singh@enterprise.in',
            contact: '+919876543210',
            notes: {
              cart_type: 'high_value_electronics',
              client_tier: 'VIP',
              customer_name: 'Vikram Singh (VIP)',
            },
            fee: null,
            tax: null,
            error_code: 'GATEWAY_TIMEOUT',
            error_description: 'Ambiguous bank switch timeout with conflicting debit signal.',
            error_source: 'gateway',
            error_step: 'payment_authentication',
            error_reason: 'Switch timeout; contradictory debit status reported by issuer ACS.',
            created_at: now,
          },
        },
      },
      created_at: now,
    };

    setIsSimulating(true);
    try {
      const newTx: TransactionRecord = {
        id: `tx_edge_${Date.now()}`,
        paymentId: edgeCasePayload.payload.payment.entity.id,
        orderId: edgeCasePayload.payload.payment.entity.order_id,
        amountPaise: 4500000,
        currency: 'INR',
        status: 'RECOVERY_DISPATCHED',
        method: 'netbanking',
        bank: 'HDFC Bank',
        errorCode: 'GATEWAY_TIMEOUT',
        errorReason: 'Ambiguous bank switch timeout; contradictory debit signal.',
        customerEmail: 'vikram.singh@enterprise.in',
        customerPhone: '+919876543210',
        customerName: 'Vikram Singh (VIP)',
        timestamp: Date.now(),
        rawPayload: edgeCasePayload,
        channelDispatched: 'WHATSAPP_INTERACTIVE_PAY',
        diagnosis: {
          failureCategory: 'GATEWAY_ERROR',
          rootCauseAnalysis: 'HDFC Bank switch latency spiked with conflicting 504 status. High cart value (₹45,000) triggered conservative routing guardrail.',
          confidenceScore: 0.64, // Trigger HITL caution boundary (< 85%)
          customerIntentScore: 0.96,
          recommendedStrategy: 'WHATSAPP_INTERACTIVE_PAY',
          urgencyLevel: 'IMMEDIATE_REALTIME',
          isAnomaly: true,
          anomalyCategory: 'AMBIGUOUS_TELEMETRY_HIGH_BASKET',
          lowConfidenceReason: 'Conflict between bank netbanking switch uptime and ACS 504 timeout return. Cart value exceeds unassisted limit.',
          edgeCaseHandling: 'Autonomous dispatch paused. Escalated to Merchant Operations Human-in-the-Loop review queue.',
          fallbackSafeguardTriggered: 'HITL_HOLD_CIRCUIT_BREAKER',
          humanOverrideApplied: false,
          reasoningSteps: [
            'Ingested payment.failed webhook for ₹45,000 VIP order.',
            'Acquired Redis idempotency lock (Zero double-charge guaranteed).',
            'Detected high telemetry variance in HDFC Bank switch (±320ms).',
            'Scored candidate rails: UPI Intent (74.2) vs WhatsApp 1-Click (72.8). Dead heat delta < 2%.',
            'Calculated confidence score: 64.2% < 85.0% Caution Boundary.',
            'Safety Circuit Breaker: Escalated to Human-in-the-Loop operator prompt.',
          ],
          actionPayload: {
            title: 'Guarded Failover Pending Operator Verification',
            description: 'High-ticket basket ₹45,000 with ambiguous gateway telemetry.',
            targetMethod: 'whatsapp_pay_link',
          },
          guardrailsApplied: {
            antiSpamPassed: true,
            zeroDoubleChargeVerified: true,
            marginProtectionCompliant: true,
            rateLimitCheck: 'PASSED',
          },
          processingTimeMs: 38,
        },
      };

      setTransactions((prev) => {
        const next = [newTx, ...prev];
        StorageManager.saveTransactions(next);
        return next;
      });

      setSelectedTxForExplainability(newTx.id);
      setIsExplainabilitySidebarOpen(true);

      showToast(
        'Simulated low-confidence edge case (64.2% confidence). HITL prompt activated in Explainability Log.',
        'error',
        'Low-Confidence Decision Alert'
      );
    } finally {
      setIsSimulating(false);
    }
  };

  // Sync dark mode class with root document & localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    StorageManager.saveSettings({ isDark });
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Play subtle synthesized audio chime on success
  const playSuccessChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio context may be restricted by autoplay policy, harmless fallback
    }
  };

  const showToast = (
    text: string,
    type: 'success' | 'info' | 'error' = 'success',
    title?: string,
    amount?: number,
    txId?: string
  ) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    if (type === 'success') {
      playSuccessChime();
    }

    setToast({
      id: `toast_${Date.now()}`,
      title: title || (type === 'success' ? 'Recovery Successful' : type === 'error' ? 'System Alert' : 'RecoverAI Telemetry'),
      text,
      type,
      amount,
      txId,
    });

    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 5500);
  };

  // Load initial data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [m, t] = await Promise.all([fetchMetrics(), fetchTransactions()]);
      setMetrics(m);
      setTransactions(t);
      StorageManager.saveMetrics(m);
      StorageManager.saveTransactions(t);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh metrics every 10 seconds
    const interval = setInterval(() => {
      fetchMetrics()
        .then((m) => {
          setMetrics(m);
          StorageManager.saveMetrics(m);
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle single webhook simulation
  const handleSimulateWebhook = async (payload: RazorpayWebhookPayload): Promise<TransactionRecord | null> => {
    setIsSimulating(true);
    try {
      const res = await simulateWebhook(payload);
      setMetrics(res.metrics);
      setTransactions((prev) => {
        const next = [res.transaction, ...prev];
        StorageManager.saveTransactions(next);
        return next;
      });
      StorageManager.saveMetrics(res.metrics);
      showToast(
        `Webhook analyzed in ${res.transaction.diagnosis?.processingTimeMs || 42}ms: ${res.transaction.diagnosis?.actionPayload.title || 'Dynamic Rail Selected'}`,
        'success',
        'Ingress & AI Diagnosis Complete'
      );
      return res.transaction;
    } catch (err: any) {
      showToast(err.message || 'Failed to simulate webhook', 'error', 'Simulation Error');
      return null;
    } finally {
      setIsSimulating(false);
    }
  };

  // Preset generator for Walkthrough Scenarios
  const handleTriggerPresetSimulation = async (
    preset: 'hdfc_timeout' | 'otp_drop' | 'insufficient_funds' | 'upi_timeout'
  ) => {
    const now = Math.floor(Date.now() / 1000);
    let mockPayload: RazorpayWebhookPayload;

    if (preset === 'hdfc_timeout') {
      mockPayload = {
        entity: 'event',
        account_id: 'acc_RzpProdMerchant99',
        event: 'payment.failed',
        contains: ['payment'],
        payload: {
          payment: {
            entity: {
              id: `pay_HdfcTimeout_${Date.now()}`,
              entity: 'payment',
              amount: 499900,
              currency: 'INR',
              status: 'failed',
              order_id: `order_Ecom_${Date.now()}`,
              invoice_id: null,
              international: false,
              method: 'netbanking',
              amount_refunded: 0,
              refund_status: null,
              captured: false,
              description: 'Noise Cancelling Headphones Pro',
              card_id: null,
              bank: 'HDFC',
              wallet: null,
              vpa: null,
              email: 'priya.sharma@example.com',
              contact: '+919876543210',
              notes: { customer_name: 'Priya Sharma' },
              fee: null,
              tax: null,
              error_code: 'BAD_REQUEST_ERROR',
              error_description: 'Bank servers timed out (504 Gateway Timeout)',
              error_source: 'bank',
              error_step: 'payment_authorization',
              error_reason: 'bank_system_unreachable',
              created_at: now,
            },
          },
        },
        created_at: now,
      };
    } else {
      mockPayload = {
        entity: 'event',
        account_id: 'acc_RzpProdMerchant99',
        event: 'payment.failed',
        contains: ['payment'],
        payload: {
          payment: {
            entity: {
              id: `pay_UpiDrop_${Date.now()}`,
              entity: 'payment',
              amount: 189900,
              currency: 'INR',
              status: 'failed',
              order_id: `order_Retail_${Date.now()}`,
              invoice_id: null,
              international: false,
              method: 'upi',
              amount_refunded: 0,
              refund_status: null,
              captured: false,
              description: 'Designer Leather Wallet',
              card_id: null,
              bank: 'SBIN',
              wallet: null,
              vpa: 'rohit@okhdfcbank',
              email: 'rohit.kumar@example.com',
              contact: '+919811223344',
              notes: { customer_name: 'Rohit Kumar' },
              fee: null,
              tax: null,
              error_code: 'BAD_REQUEST_ERROR',
              error_description: 'Customer abandoned NPCI intent screen',
              error_source: 'customer',
              error_step: 'payment_authorization',
              error_reason: 'upi_intent_timeout',
              created_at: now,
            },
          },
        },
        created_at: now,
      };
    }

    await handleSimulateWebhook(mockPayload);
  };

  // Trigger rate limit spike for demo
  const handleTriggerSpike = async () => {
    try {
      await simulateRateLimitSpike(105);
      showToast(
        'Simulated 105 concurrent webhook burst. Token bucket depleted. Circuit breaker tripped to OPEN with Full Jitter backoff.',
        'info',
        'Rate Limit Throttling Active'
      );
    } catch (e: any) {
      showToast(e.message || 'Spike failed', 'error');
    }
  };

  // Handle batch burst simulation
  const handleBatchSimulate = async () => {
    setIsSimulating(true);
    showToast('Dispatching 5 concurrent failed webhook events...', 'info', 'Batch Burst Dispatch');
    try {
      const res = await triggerBatchSimulation(5);
      setMetrics(res.metrics);
      const updatedTx = await fetchTransactions();
      setTransactions(updatedTx);
      showToast('Burst load complete: 5 transactions ingested, diagnosed, and queued with 0 drops!', 'success', 'Burst Recovery Ready');
    } catch (err: any) {
      showToast(err.message || 'Batch simulation failed', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Handle marking a transaction as recovered
  const handleConfirmRecovery = async (txId: string, method: string) => {
    try {
      const res = await markAsRecovered(txId, method);
      setMetrics(res.metrics);
      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? res.transaction : t))
      );
      if (selectedTxForCustomerFlow && selectedTxForCustomerFlow.id === txId) {
        setSelectedTxForCustomerFlow(res.transaction);
      }
      showToast(
        `Recovered ₹${(res.transaction.amountPaise / 100).toFixed(2)} via ${method}! Merchant TSR Lift increased.`,
        'success',
        'Payment Successfully Recovered',
        res.transaction.amountPaise,
        txId
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to complete recovery', 'error');
    }
  };

  // Handle demo data reset
  const handleReset = async () => {
    try {
      await resetDemoData();
      await loadData();
      showToast('Demo data reset to clean baseline state.', 'info', 'Environment Cleared');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset', 'error');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
        {/* High-Craft Enriched Success & Alert Notification Toast */}
        {toast && (
          <div
            id="toast-notification"
            className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-fade-in shadow-2xl rounded-2xl overflow-hidden border transition-all"
          >
            <div
              className={`p-4 flex items-start gap-3 backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-100'
                  : toast.type === 'error'
                  ? 'bg-red-950/95 border-red-500/40 text-red-100'
                  : 'bg-slate-900/95 border-blue-500/40 text-blue-100'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  toast.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : toast.type === 'error'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {toast.type === 'success' ? (
                  <Sparkles className="w-5 h-5 text-amber-300" />
                ) : toast.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <Zap className="w-5 h-5 text-blue-400" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-white">
                    {toast.title}
                  </span>
                  <button
                    onClick={() => setToast(null)}
                    className="text-slate-400 hover:text-white transition-colors p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{toast.text}</p>

                {toast.txId && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => {
                        const targetTx = transactions.find((t) => t.id === toast.txId);
                        if (targetTx) {
                          setSelectedTxForCustomerFlow(targetTx);
                        }
                        setActiveTab('dashboard');
                        setToast(null);
                      }}
                      className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Transaction Telemetry</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Auto-dismiss animated progress bar */}
            <div
              className={`h-1 w-full ${
                toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              } animate-[shrink_5.5s_linear]`}
            />
          </div>
        )}

        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          metrics={metrics}
          onBatchSimulate={handleBatchSimulate}
          onReset={handleReset}
          isSimulating={isSimulating}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
          onDownloadSessionState={() => {
            const res = downloadSessionState(metrics, transactions);
            showToast(`Downloaded session state: ${res.filename} (${res.blobSizeKb})`, 'success', 'Session State Exported');
          }}
          onOpenSuccessStory={() => setIsSuccessStoryModalOpen(true)}
          onOpenExplainabilityLog={() => setIsExplainabilitySidebarOpen(true)}
          lowConfidenceAlertCount={lowConfidenceAlertCount}
          onOpenLowConfidenceReview={handleOpenLowConfidenceReview}
          onTriggerSpike={handleTriggerSpike}
          onOpenTimeTravelReplay={() => setIsTimeTravelModalOpen(true)}
          isPiiMaskingEnabled={isPrivacyModeEnabled}
          onOpenPrivacySettings={() => setIsPrivacyModalOpen(true)}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* KPI Financial Overview Banner with Projected Impact */}
          <MetricsOverview
            metrics={metrics}
            transactions={transactions}
            onOpenCompareStates={() => setActiveTab('compare_states')}
            onTakeSnapshot={() => loadData()}
          />

          {/* View Routing */}
          {activeTab === 'unit_economics' && (
            <div className="space-y-6">
              <UnitEconomicImpactCard
                metrics={metrics}
                transactions={transactions}
                onNotification={({ text, type, title }) => showToast(text, type, title)}
              />
              <RecoveryCostAnalysis metrics={metrics} transactions={transactions} />
            </div>
          )}

          {activeTab === 'autonomous_mesh' && (
            <div className="space-y-6">
              <AutonomousGatewayMesh
                metrics={metrics}
                transactions={transactions}
              />
            </div>
          )}

          {activeTab === 'success_story' && (
            <div className="space-y-6">
              <SuccessStoryModal
                metrics={metrics}
                transactions={transactions}
                isFullScreenTab={true}
              />
            </div>
          )}

          {activeTab === 'compare_states' && (
            <div className="space-y-6">
              <StateSnapshotCompare
                currentMetrics={metrics}
                transactions={transactions}
                onTakeSnapshot={() => loadData()}
              />
            </div>
          )}

          {activeTab === 'live_status_alerts' && (
            <div className="space-y-6">
              <LiveStatusAlerts
                metrics={metrics}
                transactions={transactions}
                onOpenCustomerView={(id) => {
                  const tx = transactions.find((t) => t.id === id);
                  if (tx) setSelectedTxForCustomerFlow(tx);
                }}
              />
            </div>
          )}

          {activeTab === 'ai_explainability_heatmap' && (
            <div className="space-y-6">
              <AIExplainabilityHeatmap
                metrics={metrics}
                transactions={transactions}
              />
            </div>
          )}

          {activeTab === 'revenue_impact' && (
            <div className="space-y-6">
              <RevenueImpactGauge
                metrics={metrics}
                transactions={transactions}
                onDownloadSession={() => {
                  const res = downloadSessionState(metrics, transactions);
                  showToast(`Downloaded ${res.filename}`, 'success', 'Session State Saved');
                }}
              />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Live Status & Incident Resolution Telemetry Stream */}
              <LiveStatusAlerts
                metrics={metrics}
                transactions={transactions}
                onOpenCustomerView={(id) => {
                  const tx = transactions.find((t) => t.id === id);
                  if (tx) setSelectedTxForCustomerFlow(tx);
                }}
              />

              {/* State Snapshot & Pitch Compare Engine */}
              <StateSnapshotCompare
                currentMetrics={metrics}
                transactions={transactions}
                onTakeSnapshot={() => loadData()}
              />

              {/* Visual AI Explainability Score Heatmap */}
              <AIExplainabilityHeatmap
                metrics={metrics}
                transactions={transactions}
              />

              {/* System Health Pulse Telemetry Bar */}
              <SystemHealthPulse metrics={metrics} onRefreshTelemetry={loadData} />

              {/* Unit Economic Impact & Commercial Viability Card */}
              <UnitEconomicImpactCard
                metrics={metrics}
                transactions={transactions}
                onNotification={({ text, type, title }) => showToast(text, type, title)}
              />

              {/* Recovery Gap Analysis Card */}
              <RecoveryGapCard
                transactions={transactions}
                metrics={metrics}
                onOpenCustomerView={(tx) => setSelectedTxForCustomerFlow(tx)}
              />

              {/* Real-Time Recovery Dynamics & TSR Trajectory Graph */}
              <RecoveryTrendGraph
                metrics={metrics}
                onNavigateToFutureScenarios={() => setActiveTab('future_scenarios')}
              />

              {/* Live Transactions Monitoring & Diagnostics Feed */}
              <MonitoringPanel
                transactions={transactions}
                onRecover={async (id) => {
                  const tx = transactions.find((t) => t.id === id);
                  if (tx) setSelectedTxForCustomerFlow(tx);
                }}
                onOpenCustomerView={(tx) => setSelectedTxForCustomerFlow(tx)}
                onRefresh={loadData}
                isLoading={isLoading}
                onNotification={({ text, type }) => showToast(text, type)}
                onOpenExplainabilityLog={(tx) => {
                  setSelectedTxForExplainability(tx.id);
                  setIsExplainabilitySidebarOpen(true);
                }}
                isPiiMaskingEnabled={isPrivacyModeEnabled}
                onTogglePiiMasking={(enabled) => {
                  setIsPrivacyModeEnabled(enabled);
                  StorageManager.saveSettings({ isPiiMaskingEnabled: enabled });
                  showToast(
                    enabled
                      ? 'Data Privacy Mode Activated: Customer PII masked (DPDPA 2023 compliant)'
                      : 'Data Privacy Mode Disabled: Customer PII visible',
                    'info',
                    'Privacy Setting Updated'
                  );
                }}
                onOpenPrivacySettings={() => setIsPrivacyModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'recovery_gap' && (
            <div className="space-y-6">
              <RecoveryGapCard
                transactions={transactions}
                metrics={metrics}
                onOpenCustomerView={(tx) => setSelectedTxForCustomerFlow(tx)}
              />
            </div>
          )}

          {activeTab === 'system_pulse' && (
            <div className="space-y-6">
              <SystemHealthPulse metrics={metrics} onRefreshTelemetry={loadData} />
            </div>
          )}

          {activeTab === 'webhook_replay_stats' && (
            <div className="space-y-6">
              <WebhookReplayStats
                transactions={transactions}
                onTriggerReplay={async (tx) => {
                  if (tx.rawPayload) {
                    return handleSimulateWebhook(tx.rawPayload);
                  }
                  return handleSimulateWebhook({
                    entity: 'event',
                    account_id: 'acc_buildathon_2026',
                    event: 'payment.failed',
                    contains: ['payment'],
                    payload: {
                      payment: {
                        entity: {
                          id: tx.id,
                          entity: 'payment',
                          amount: tx.amountPaise,
                          currency: 'INR',
                          status: 'failed',
                          order_id: tx.orderId,
                          invoice_id: null,
                          international: false,
                          method: (['card', 'netbanking', 'upi', 'wallet', 'emi', 'nach'].includes(tx.method)
                            ? tx.method
                            : 'upi') as any,
                          amount_refunded: 0,
                          refund_status: null,
                          captured: false,
                          description: 'Buildathon Payment',
                          card_id: null,
                          bank: tx.bank || null,
                          wallet: null,
                          vpa: null,
                          email: tx.customerEmail,
                          contact: tx.customerPhone,
                          notes: {},
                          fee: null,
                          tax: null,
                          error_code: tx.errorCode,
                          error_description: tx.errorReason,
                          error_source: 'gateway',
                          error_step: 'payment_authentication',
                          error_reason: tx.errorReason,
                          created_at: Math.floor(Date.now() / 1000),
                        },
                      },
                    },
                    created_at: Math.floor(Date.now() / 1000),
                  });
                }}
              />
            </div>
          )}

          {activeTab === 'performance_budget' && (
            <PerformanceBudget
              metrics={metrics}
              transactions={transactions}
              onTriggerBurst={handleBatchSimulate}
            />
          )}

          {activeTab === 'api_security_scan' && (
            <ApiSecurityScan />
          )}

          {activeTab === 'simulator' && (
            <WebhookSimulator
              onSimulate={handleSimulateWebhook}
              onBatchSimulate={handleBatchSimulate}
              isSimulating={isSimulating}
              onOpenCustomerView={(tx) => setSelectedTxForCustomerFlow(tx)}
            />
          )}

          {activeTab === 'customer_experience' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Interactive Customer 1-Click Payment Experience
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Select any active unrecovered transaction below to test what the end-customer sees when RecoverAI triggers an alternative payment rail.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transactions
                  .filter((t) => t.status !== 'RECOVERED')
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 cursor-pointer transition-all space-y-3 shadow-sm"
                      onClick={() => setSelectedTxForCustomerFlow(tx)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{tx.orderId}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-300">
                          {tx.channelDispatched}
                        </span>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                          ₹{(tx.amountPaise / 100).toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {tx.customerName} &bull; {tx.bank || tx.method}
                        </div>
                      </div>

                      <div className="text-[11px] bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        {tx.diagnosis?.actionPayload.title || 'Dynamic Rail Switch'}
                      </div>

                      <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer">
                        Open 1-Click Pay Modal
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'stakeholder_dashboard' && (
            <StakeholderDashboard metrics={metrics} transactions={transactions} />
          )}

          {activeTab === 'explainability_mode' && (
            <ExplainabilityMode transactions={transactions} />
          )}

          {activeTab === 'data_latency_alert' && (
            <DataLatencyAlerts metrics={metrics} />
          )}

          {activeTab === 'drift_analysis' && (
            <DriftAnalysis
              metrics={metrics}
              transactions={transactions}
              onNavigateToFutureScenarios={() => setActiveTab('future_scenarios')}
            />
          )}

          {activeTab === 'future_scenarios' && (
            <FutureScenarioSimulator
              metrics={metrics}
              transactions={transactions}
              onNotification={({ text, type, title }) => showToast(text, type, title)}
            />
          )}

          {activeTab === 'csv_export' && (
            <CsvExportManager transactions={transactions} metrics={metrics} />
          )}

          {activeTab === 'dynamic_rails' && <DynamicRailVisualization transactions={transactions} />}

          {activeTab === 'neural_decision_path' && (
            <NeuralRailDecisionPath transactions={transactions} />
          )}

          {activeTab === 'webhook_replay' && (
            <WebhookReplayAnalysis
              transactions={transactions}
              onReplayWebhook={async (p) => {
                return handleSimulateWebhook(p);
              }}
            />
          )}

          {activeTab === 'scheduled_replay' && (
            <ScheduledReplay
              onSimulateWebhook={handleSimulateWebhook}
              metrics={metrics}
              transactions={transactions}
            />
          )}

          {activeTab === 'compliance_reports' && <AutomatedComplianceReports metrics={metrics} />}

          {activeTab === 'latency_notifications' && <LatencyTrendNotifications metrics={metrics} />}

          {activeTab === 'failover_dashboard' && <FailoverDashboard />}

          {activeTab === 'failure_simulation' && (
            <FailureSimulator
              onSimulate={handleSimulateWebhook}
              onOpenCustomerView={(tx) => setSelectedTxForCustomerFlow(tx)}
              isSimulating={isSimulating}
            />
          )}

          {activeTab === 'roi_calculator' && (
            <RoiCalculator metrics={metrics} onNavigateToSimulator={() => setActiveTab('simulator')} />
          )}

          {(activeTab === 'unit_economics' || activeTab === 'recovery_cost') && (
            <div className="space-y-6">
              <UnitEconomicImpactCard
                metrics={metrics}
                transactions={transactions}
                onNotification={({ text, type, title }) => showToast(text, type, title)}
              />
              <RecoveryCostAnalysis metrics={metrics} transactions={transactions} />
            </div>
          )}

          {activeTab === 'live_logs' && <LiveLogsViewer />}

          {activeTab === 'model_comparison' && <ModelComparison />}

          {activeTab === 'api_health' && <ApiHealthMonitor />}

          {activeTab === 'insight_report' && <RecoveryInsightReport metrics={metrics} transactions={transactions} />}

          {activeTab === 'competitive_comparison' && <CompetitiveComparison />}

          {activeTab === 'webhook_debugger' && (
            <WebhookDebugger
              transactions={transactions}
              onReplayWebhook={async (p) => {
                return handleSimulateWebhook(p);
              }}
            />
          )}

          {activeTab === 'ai_latency' && <AILatencyStats metrics={metrics} />}

          {activeTab === 'latency_heatmap' && <LatencyHeatmap />}

          {activeTab === 'architecture' && <ArchitectureView />}

          {activeTab === 'pitch_deck' && <PitchStrategyView />}
        </main>

        {/* Customer 1-Click Interactive Modal */}
        {selectedTxForCustomerFlow && (
          <CustomerRecoveryModal
            transaction={selectedTxForCustomerFlow}
            transactions={transactions}
            onClose={() => setSelectedTxForCustomerFlow(null)}
            onConfirmRecovery={handleConfirmRecovery}
            isPiiMaskingEnabled={isPrivacyModeEnabled}
          />
        )}

        {/* Data Privacy & DPDPA/PCI Compliance Settings Modal */}
        <DataPrivacySettingsModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
          isPiiMaskingEnabled={isPrivacyModeEnabled}
          onTogglePiiMasking={(enabled) => {
            setIsPrivacyModeEnabled(enabled);
            StorageManager.saveSettings({ isPiiMaskingEnabled: enabled });
          }}
          metrics={metrics}
          onNotification={(msg) => showToast(msg.text, msg.type, msg.title)}
        />

        {/* Guided Walkthrough Tour Modal */}
        <DemoWalkthrough
          isOpen={isWalkthroughOpen}
          onClose={() => setIsWalkthroughOpen(false)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onTriggerSimulation={handleTriggerPresetSimulation}
          onTriggerSpike={handleTriggerSpike}
        />

        {/* Success Story & Executive Dossier Modal Overlay */}
        <SuccessStoryModal
          isOpen={isSuccessStoryModalOpen}
          onClose={() => setIsSuccessStoryModalOpen(false)}
          metrics={metrics}
          transactions={transactions}
        />

        {/* Explainability Log & CoT Sidebar */}
        <ExplainabilityLogSidebar
          isOpen={isExplainabilitySidebarOpen}
          onClose={() => setIsExplainabilitySidebarOpen(false)}
          transactions={transactions}
          selectedTxId={selectedTxForExplainability}
          onSelectTx={(id) => setSelectedTxForExplainability(id)}
          metrics={metrics}
          onOpenCustomerView={(tx) => setSelectedTxForCustomerFlow(tx)}
          onHumanOverride={handleHumanOverride}
          onSimulateEdgeCase={handleSimulateEdgeCase}
        />

        {/* Deterministic Time-Travel & Merkle Proof Vault */}
        <DeterministicTimeTravelReplay
          isOpen={isTimeTravelModalOpen}
          onClose={() => setIsTimeTravelModalOpen(false)}
          onNotification={(msg) => showToast(msg.text, msg.type, msg.title)}
        />

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>RecoverAI Enterprise Resilience Platform &bull; Autonomous Payment Recovery</span>
            <span className="font-mono text-[11px]">Production High-Availability Architecture &bull; PCI-DSS v4.0 &amp; RBI COFT Compliant</span>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

