import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Zap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sliders,
  Filter,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  X,
  Search,
  Radio,
  Server,
  Calendar,
} from 'lucide-react';
import { LiveStatusAlert, SystemMetrics, TransactionRecord } from '../types';
import { StorageManager } from '../services/storage';

interface LiveStatusAlertsProps {
  metrics: SystemMetrics | null;
  transactions?: TransactionRecord[];
  onTriggerSimulatedAlert?: (preset: string) => void;
  onOpenCustomerView?: (txId: string) => void;
}

export const LiveStatusAlerts: React.FC<LiveStatusAlertsProps> = ({
  metrics,
  transactions = [],
  onTriggerSimulatedAlert,
  onOpenCustomerView,
}) => {
  const [alerts, setAlerts] = useState<LiveStatusAlert[]>(() => StorageManager.getAlerts());
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [showIncidentModal, setShowIncidentModal] = useState<boolean>(false);
  const tickerIntervalRef = useRef<any>(null);

  const formatINR = (paise?: number) => {
    if (!paise) return '₹0';
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(rupees);
  };

  // Play audio sound for alerts
  const playAlertChime = (severity: string) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = severity === 'CRITICAL' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(severity === 'CRITICAL' ? 330 : 659.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Simulated live event feed every 20-30s if live streaming is ON
  useEffect(() => {
    if (!isLiveStreaming) return;

    const streamTemplates = [
      {
        severity: 'SUCCESS' as const,
        category: 'UPI_ROUTER' as const,
        title: 'UPI Deep-Link Intent Converted',
        message: 'Customer tapped WhatsApp instant intent link; payment captured on backup PhonePe switch rail.',
        orderId: `order_Cart_${Math.floor(1000 + Math.random() * 9000)}`,
        amountPaise: Math.floor(1200 + Math.random() * 8000) * 100,
        latencyMs: +(28 + Math.random() * 20).toFixed(1),
        actionTaken: 'Zero checkout abandonment; instant order confirmation delivered.',
      },
      {
        severity: 'GUARDRAIL' as const,
        category: 'MUTEX' as const,
        title: 'Concurrent Replay Prevented (409 Safe)',
        message: 'Redis Mutex locked in 1.1ms; duplicate webhook delivery ignored without debit.',
        orderId: `order_Sub_${Math.floor(1000 + Math.random() * 9000)}`,
        amountPaise: 199900,
        latencyMs: 1.1,
        actionTaken: 'Double charge prevented across distributed container nodes.',
      },
      {
        severity: 'INFO' as const,
        category: 'DUNNING' as const,
        title: 'Recurring Invoice Synced to Salary Window',
        message: 'Debit rescheduled for 1st of month based on historic banking credit patterns.',
        orderId: `order_Rec_${Math.floor(1000 + Math.random() * 9000)}`,
        amountPaise: 249900,
        latencyMs: 14.5,
        actionTaken: 'Autonomous smart schedule enrolled in zero-touch queue.',
      },
      {
        severity: 'SUCCESS' as const,
        category: 'AI_ENGINE' as const,
        title: 'Gemini 3.7 Flash Diagnostic Validated',
        message: 'Correctly classified issuer 3DS ACS timeout and triggered secondary payment link in 36ms.',
        orderId: `order_Pro_${Math.floor(1000 + Math.random() * 9000)}`,
        amountPaise: 450000,
        latencyMs: 36.2,
        actionTaken: 'Autonomous multi-rail routing triggered.',
      },
    ];

    tickerIntervalRef.current = setInterval(() => {
      const template = streamTemplates[Math.floor(Math.random() * streamTemplates.length)];
      const now = Date.now();
      const newAlert: LiveStatusAlert = {
        id: `alt_live_${now}`,
        timestamp: now,
        relativeTime: 'Just now',
        severity: template.severity,
        category: template.category,
        title: template.title,
        message: template.message,
        orderId: template.orderId,
        amountPaise: template.amountPaise,
        latencyMs: template.latencyMs,
        actionTaken: template.actionTaken,
        isRead: false,
      };

      setAlerts((prev) => {
        const updated = [newAlert, ...prev.slice(0, 49)];
        StorageManager.saveAlerts(updated);
        return updated;
      });

      playAlertChime(template.severity);
    }, 24000);

    return () => {
      if (tickerIntervalRef.current) clearInterval(tickerIntervalRef.current);
    };
  }, [isLiveStreaming, soundEnabled]);

  // Trigger manual simulated incident
  const handleSimulateCustomAlert = (type: 'HDFC_OUTAGE' | 'BURST_REPLAY' | 'OTP_RESCUE' | 'SALARY_DUNNING') => {
    const now = Date.now();
    let newAlert: LiveStatusAlert;

    if (type === 'HDFC_OUTAGE') {
      newAlert = {
        id: `alt_hdfc_${now}`,
        timestamp: now,
        relativeTime: 'Just now',
        severity: 'WARNING',
        category: 'BANK_SWITCH',
        title: '⚡ HDFC Netbanking ACS Switch Degraded',
        message: 'Issuer ACS response time exceeded 280ms threshold (65% drop rate). Rerouting active traffic to Axis & ICICI backup switches.',
        latencyMs: 280.4,
        actionTaken: 'Failover circuit dynamically shifted traffic within 18ms.',
        isRead: false,
      };
    } else if (type === 'BURST_REPLAY') {
      newAlert = {
        id: `alt_burst_${now}`,
        timestamp: now,
        relativeTime: 'Just now',
        severity: 'GUARDRAIL',
        category: 'MUTEX',
        title: '🛡️ Redis Mutex Lock Blocked 5x Burst Replay',
        message: 'Multiple identical webhook payloads arrived simultaneously for order_Retail_9921. Idempotency lock safely processed 1 and deduplicated 4.',
        orderId: 'order_Retail_9921',
        amountPaise: 499900,
        latencyMs: 1.4,
        actionTaken: '100% false positive & double charge protection confirmed.',
        isRead: false,
      };
    } else if (type === 'OTP_RESCUE') {
      newAlert = {
        id: `alt_otp_${now}`,
        timestamp: now,
        relativeTime: 'Just now',
        severity: 'SUCCESS',
        category: 'UPI_ROUTER',
        title: '🎉 OTP Abandonment Rescued (₹3,499 Captured)',
        message: 'Customer dropped off at card 3DS screen. Intelligent WhatsApp bot sent 1-tap UPI deep-link; payment captured in 28 seconds.',
        orderId: `order_Rescue_${Math.floor(1000 + Math.random() * 9000)}`,
        amountPaise: 349900,
        latencyMs: 32.1,
        actionTaken: 'Delivered pre-authenticated instant checkout URL.',
        isRead: false,
      };
    } else {
      newAlert = {
        id: `alt_dunning_${now}`,
        timestamp: now,
        relativeTime: 'Just now',
        severity: 'INFO',
        category: 'DUNNING',
        title: '📅 Smart Dunning Salary Schedule Enrolled',
        message: 'Subscription payment of ₹1,499 failed due to month-end balance. AI predicted salary credit on 1st and queued auto-debit.',
        orderId: 'order_Sub_4412',
        amountPaise: 149900,
        latencyMs: 8.5,
        actionTaken: 'Customer notified with transparent notification schedule.',
        isRead: false,
      };
    }

    setAlerts((prev) => {
      const updated = [newAlert, ...prev];
      StorageManager.saveAlerts(updated);
      return updated;
    });

    playAlertChime(newAlert.severity);
    setShowIncidentModal(false);
  };

  const handleClearAlerts = () => {
    setAlerts([]);
    StorageManager.saveAlerts([]);
  };

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      StorageManager.saveAlerts(updated);
      return updated;
    });
  };

  // Filtered Alerts
  const filteredAlerts = alerts.filter((alert) => {
    const matchesCategory = selectedCategory === 'ALL' || alert.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'ALL' || alert.severity === selectedSeverity;
    const matchesSearch =
      !searchQuery.trim() ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.orderId && alert.orderId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'SUCCESS':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'GUARDRAIL':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'INFO':
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'UPI_ROUTER':
        return <Zap className="w-4 h-4 text-emerald-500" />;
      case 'MUTEX':
        return <ShieldCheck className="w-4 h-4 text-purple-500" />;
      case 'BANK_SWITCH':
        return <Server className="w-4 h-4 text-amber-500" />;
      case 'DUNNING':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'AI_ENGINE':
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
      default:
        return <Radio className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      id="live-status-alerts-panel"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-5"
    >
      {/* Top Streaming Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-2xl">
              <Bell className="w-6 h-6" />
            </div>
            {isLiveStreaming && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Status & Incident Resolution Feed
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                {isLiveStreaming ? 'LIVE TELEMETRY STREAM' : 'STREAM PAUSED'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Proactive real-time telemetry tracking autonomous rail switching, Redis mutex locks, ACS failovers, and smart dunning executions.
            </p>
          </div>
        </div>

        {/* Live Controls & Incident Simulator Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pause / Play Live Stream */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isLiveStreaming
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                : 'bg-emerald-600 text-white border-emerald-500'
            }`}
            title={isLiveStreaming ? 'Pause live stream' : 'Resume live stream'}
          >
            {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLiveStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title={soundEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Trigger Incident Simulator */}
          <button
            id="btn-trigger-incident-simulator"
            onClick={() => setShowIncidentModal(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Simulate Incident</span>
          </button>

          {/* Clear Alerts */}
          {alerts.length > 0 && (
            <button
              onClick={handleClearAlerts}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Clear all alerts"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Incident Simulation Modal / Quick Action Tray */}
      {showIncidentModal && (
        <div className="bg-slate-950 text-white p-4 rounded-2xl border border-indigo-500/40 space-y-3 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Instant Pitch Demonstration Incidents
            </span>
            <button
              onClick={() => setShowIncidentModal(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300">
            Click any scenario to inject a real-time gateway incident and demonstrate RecoverAI's sub-50ms autonomous recovery:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
            <button
              onClick={() => handleSimulateCustomAlert('HDFC_OUTAGE')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">1. Issuer ACS Outage</span>
                <Server className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Simulates HDFC 280ms timeout &rarr; auto-reroutes to Axis backup rail.
              </p>
            </button>

            <button
              onClick={() => handleSimulateCustomAlert('BURST_REPLAY')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400">2. 5x Burst Duplicate</span>
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Fires 5 simultaneous webhooks &rarr; Redis singleton mutex guards 409 safe.
              </p>
            </button>

            <button
              onClick={() => handleSimulateCustomAlert('OTP_RESCUE')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">3. OTP Dropoff Rescue</span>
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Triggers 1-tap WhatsApp deep-link payment capture in 28s.
              </p>
            </button>

            <button
              onClick={() => handleSimulateCustomAlert('SALARY_DUNNING')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-blue-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400">4. Salary Dunning Sync</span>
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Month-end debit failure &rarr; scheduled for 1st-of-month payroll cycle.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Search */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, bank, or action..."
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'ALL', label: 'All Alerts' },
            { id: 'UPI_ROUTER', label: '⚡ UPI Failover' },
            { id: 'MUTEX', label: '🛡️ Mutex Locks' },
            { id: 'BANK_SWITCH', label: '🏦 ACS Switches' },
            { id: 'DUNNING', label: '📅 Smart Dunning' },
            { id: 'AI_ENGINE', label: '✨ Gemini AI' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Stream List */}
      <div className="space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60" />
            <p className="text-xs font-medium">All systems nominal &bull; Zero unresolved gateway incidents.</p>
            <button
              onClick={() => setShowIncidentModal(true)}
              className="text-xs text-blue-500 font-bold hover:underline cursor-pointer"
            >
              Click here to simulate an incident &rarr;
            </button>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isExpanded = expandedAlertId === alert.id;

            return (
              <div
                key={alert.id}
                className={`bg-white dark:bg-slate-900 border rounded-xl p-3.5 transition-all duration-200 hover:shadow-md ${
                  alert.severity === 'CRITICAL'
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : alert.severity === 'WARNING'
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : alert.severity === 'GUARDRAIL'
                    ? 'border-purple-500/40 bg-purple-500/5'
                    : alert.severity === 'SUCCESS'
                    ? 'border-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                      {getCategoryIcon(alert.category)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {alert.title}
                        </span>

                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                            alert.severity
                          )}`}
                        >
                          {alert.severity}
                        </span>

                        {alert.latencyMs && (
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-semibold">
                            {alert.latencyMs}ms
                          </span>
                        )}

                        {alert.amountPaise && (
                          <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                            {formatINR(alert.amountPaise)}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {alert.message}
                      </p>

                      {/* Action Taken Note */}
                      {alert.actionTaken && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 pt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Action Taken: {alert.actionTaken}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {alert.relativeTime}
                    </span>

                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                      title="Dismiss alert"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
