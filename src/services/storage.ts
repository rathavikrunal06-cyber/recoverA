import { SystemMetrics, TransactionRecord, StateSnapshot, LiveStatusAlert } from '../types';

export interface AppSettings {
  isDark: boolean;
  merchantMonthlyGMV: number;
  simulatedRecoveryRate: number;
  baselineFailureRate: number;
  autoRefreshIntervalSec: number;
  soundEnabled: boolean;
  activeTab?: string;
  isPiiMaskingEnabled?: boolean;
}

export interface PerformanceTelemetry {
  totalPayloadBytesReceived: number;
  totalPayloadBytesSent: number;
  totalWebhooksHandled: number;
  avgRenderLatencyMs: number;
  peakRenderLatencyMs: number;
  currentFps: number;
  heapUsageMb: number;
  domNodesCount: number;
  burstHistory: Array<{
    timestamp: number;
    count: number;
    payloadKb: number;
    renderDurationMs: number;
    fps: number;
    memoryMb: number;
  }>;
  lastUpdated: number;
}

export interface SecurityAuditResult {
  scanTimestamp: number;
  securityScore: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  testsPassed: number;
  totalTests: number;
  tests: Array<{
    id: string;
    category: 'AUTHENTICATION' | 'PII_PROTECTION' | 'IDEMPOTENCY' | 'RATE_LIMIT' | 'TRANSPORT' | 'PROMPT_INJECTION';
    name: string;
    description: string;
    status: 'PASSED' | 'WARNING' | 'FAILED';
    latencyMs: number;
    evidence: string;
    remediation?: string;
  }>;
  complianceCert: {
    hash: string;
    pciDssCompliant: boolean;
    rbiCoftCompliant: boolean;
    dpdpaCompliant: boolean;
    owaspCompliant: boolean;
  };
}

const STORAGE_KEYS = {
  TRANSACTIONS: 'recoverai_transactions_v1',
  METRICS: 'recoverai_metrics_v1',
  SETTINGS: 'recoverai_settings_v1',
  PERF_TELEMETRY: 'recoverai_perf_telemetry_v1',
  SECURITY_AUDIT: 'recoverai_security_audit_v1',
  IDEMPOTENCY_KEYS: 'recoverai_idempotency_keys_v1',
  SNAPSHOTS: 'recoverai_snapshots_v1',
  LIVE_ALERTS: 'recoverai_live_alerts_v1',
};

// Safe localStorage wrapper
export class StorageManager {
  private static isAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 'localStorage' in window;
    } catch {
      return false;
    }
  }

  // --- Transactions ---
  static getTransactions(): TransactionRecord[] | null {
    if (!this.isAvailable()) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      console.warn('RecoverAI: Failed to load transactions from localStorage', e);
      return null;
    }
  }

  static saveTransactions(transactions: TransactionRecord[]): void {
    if (!this.isAvailable()) return;
    try {
      // Keep up to 200 most recent transactions to prevent localStorage quota overflow
      const trimmed = transactions.slice(0, 200);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('RecoverAI: Failed to save transactions to localStorage', e);
    }
  }

  // --- Metrics ---
  static getMetrics(): SystemMetrics | null {
    if (!this.isAvailable()) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.METRICS);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  static saveMetrics(metrics: SystemMetrics): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
    } catch (e) {
      console.warn('RecoverAI: Failed to save metrics to localStorage', e);
    }
  }

  // --- Settings ---
  static getSettings(): AppSettings {
    const defaultSettings: AppSettings = {
      isDark: true,
      merchantMonthlyGMV: 20000000,
      simulatedRecoveryRate: 42,
      baselineFailureRate: 9.5,
      autoRefreshIntervalSec: 5,
      soundEnabled: true,
    };

    if (!this.isAvailable()) return defaultSettings;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return defaultSettings;
      return { ...defaultSettings, ...JSON.parse(raw) };
    } catch (e) {
      return defaultSettings;
    }
  }

  static saveSettings(settings: Partial<AppSettings>): void {
    if (!this.isAvailable()) return;
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('RecoverAI: Failed to save settings to localStorage', e);
    }
  }

  // --- Performance Telemetry ---
  static getPerfTelemetry(): PerformanceTelemetry {
    const defaultTelemetry: PerformanceTelemetry = {
      totalPayloadBytesReceived: 184200, // ~184 KB baseline
      totalPayloadBytesSent: 42800,
      totalWebhooksHandled: 148,
      avgRenderLatencyMs: 2.4,
      peakRenderLatencyMs: 5.8,
      currentFps: 60,
      heapUsageMb: 19.4,
      domNodesCount: 384,
      burstHistory: [
        {
          timestamp: Date.now() - 300000,
          count: 10,
          payloadKb: 12.4,
          renderDurationMs: 2.1,
          fps: 60,
          memoryMb: 18.2,
        },
        {
          timestamp: Date.now() - 180000,
          count: 25,
          payloadKb: 31.8,
          renderDurationMs: 2.8,
          fps: 59.8,
          memoryMb: 19.1,
        },
        {
          timestamp: Date.now() - 60000,
          count: 50,
          payloadKb: 63.5,
          renderDurationMs: 3.4,
          fps: 59.5,
          memoryMb: 19.6,
        },
      ],
      lastUpdated: Date.now(),
    };

    if (!this.isAvailable()) return defaultTelemetry;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PERF_TELEMETRY);
      if (!raw) return defaultTelemetry;
      return { ...defaultTelemetry, ...JSON.parse(raw) };
    } catch (e) {
      return defaultTelemetry;
    }
  }

  static savePerfTelemetry(telemetry: PerformanceTelemetry): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PERF_TELEMETRY, JSON.stringify(telemetry));
    } catch (e) {
      console.warn('RecoverAI: Failed to save performance telemetry to localStorage', e);
    }
  }

  // --- Security Audit ---
  static getSecurityAudit(): SecurityAuditResult | null {
    if (!this.isAvailable()) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SECURITY_AUDIT);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  static saveSecurityAudit(audit: SecurityAuditResult): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SECURITY_AUDIT, JSON.stringify(audit));
    } catch (e) {
      console.warn('RecoverAI: Failed to save security audit to localStorage', e);
    }
  }

  // --- State Snapshots for Before vs After Comparison ---
  static getSnapshots(): StateSnapshot[] {
    const defaultBaseline: StateSnapshot = {
      id: 'snap_baseline_pre_ai',
      name: 'Pre-AI Legacy Gateway Baseline',
      timestamp: Date.now() - 3600000 * 24,
      formattedTime: 'Baseline (Day 0)',
      transactionsCount: 120,
      tag: 'BASELINE',
      notes: 'Unassisted payment processing with 0% dynamic failover recovery.',
      metrics: {
        totalFailedGMV: 184500000,
        totalRecoveredGMV: 0,
        totalEventsProcessed: 120,
        totalRecoveredCount: 0,
        overallRecoveryRate: 0,
        tsrLiftPercentage: 0,
        avgLatencyMs: 240,
        activeDunningSchedules: 0,
        falsePositiveRate: 0,
        protectedDoubleCharges: 0,
      },
    };

    if (!this.isAvailable()) return [defaultBaseline];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
      if (!raw) return [defaultBaseline];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [defaultBaseline];
    } catch (e) {
      return [defaultBaseline];
    }
  }

  static saveSnapshots(snapshots: StateSnapshot[]): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots.slice(0, 30)));
    } catch (e) {
      console.warn('RecoverAI: Failed to save snapshots to localStorage', e);
    }
  }

  static addSnapshot(snapshot: StateSnapshot): StateSnapshot[] {
    const current = this.getSnapshots();
    const updated = [snapshot, ...current.filter((s) => s.id !== snapshot.id)];
    this.saveSnapshots(updated);
    return updated;
  }

  static deleteSnapshot(id: string): StateSnapshot[] {
    const current = this.getSnapshots();
    const updated = current.filter((s) => s.id !== id);
    this.saveSnapshots(updated);
    return updated;
  }

  // --- Live Status Alerts ---
  static getAlerts(): LiveStatusAlert[] {
    const defaultAlerts: LiveStatusAlert[] = [
      {
        id: 'alt_live_01',
        timestamp: Date.now() - 15000,
        relativeTime: '15s ago',
        severity: 'SUCCESS',
        category: 'UPI_ROUTER',
        title: 'Instant UPI Switch Recovered ₹4,999',
        message: 'HDFC ACS timeout bypassed with pre-signed WhatsApp intent deep-link.',
        orderId: 'order_Retail_9921',
        amountPaise: 499900,
        latencyMs: 38.4,
        actionTaken: 'Payment captured on secondary PhonePe switch rail.',
        isRead: false,
      },
      {
        id: 'alt_live_02',
        timestamp: Date.now() - 65000,
        relativeTime: '1m ago',
        severity: 'GUARDRAIL',
        category: 'MUTEX',
        title: 'Duplicate Replay Blocked (409 Safe)',
        message: 'Distributed Redis Mutex lock suppressed simultaneous burst attempt for order_SaaS_7718.',
        orderId: 'order_SaaS_7718',
        amountPaise: 289900,
        latencyMs: 1.2,
        actionTaken: 'Zero double charges guaranteed by singleton lock.',
        isRead: false,
      },
      {
        id: 'alt_live_03',
        timestamp: Date.now() - 180000,
        relativeTime: '3m ago',
        severity: 'WARNING',
        category: 'BANK_SWITCH',
        title: 'SBI Netbanking ACS Latency Spike (240ms)',
        message: 'Elevated latency detected on SBI gateway switch. Traffic auto-diverted to ICICI & Axis backup rails.',
        latencyMs: 240.0,
        actionTaken: 'Dynamic failover circuit shifted 85% volume away from degraded issuer.',
        isRead: false,
      },
      {
        id: 'alt_live_04',
        timestamp: Date.now() - 420000,
        relativeTime: '7m ago',
        severity: 'INFO',
        category: 'DUNNING',
        title: 'Salary-Cycle Dunning Synced',
        message: 'Subscription renewal of ₹1,299 rescheduled for 1st of month based on recurring payroll cadence.',
        orderId: 'order_Sub_3320',
        amountPaise: 129900,
        latencyMs: 12.0,
        actionTaken: 'Scheduled zero-touch auto-debit retry queue.',
        isRead: true,
      },
      {
        id: 'alt_live_05',
        timestamp: Date.now() - 900000,
        relativeTime: '15m ago',
        severity: 'SUCCESS',
        category: 'AI_ENGINE',
        title: 'Gemini 3.7 Flash Diagnostic (34ms)',
        message: 'Dual-tier classifier correctly diagnosed OTP dropoff on ICICI Visa Credit with 98.4% confidence.',
        orderId: 'order_Cart_5521',
        amountPaise: 189900,
        latencyMs: 34.2,
        actionTaken: 'Rendered instant biometric 1-tap rescue widget.',
        isRead: true,
      },
    ];

    if (!this.isAvailable()) return defaultAlerts;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LIVE_ALERTS);
      if (!raw) return defaultAlerts;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultAlerts;
    } catch (e) {
      return defaultAlerts;
    }
  }

  static saveAlerts(alerts: LiveStatusAlert[]): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.LIVE_ALERTS, JSON.stringify(alerts.slice(0, 50)));
    } catch (e) {
      console.warn('RecoverAI: Failed to save alerts to localStorage', e);
    }
  }

  // --- Storage Capacity & Info ---
  static getStorageStats(): { usedBytes: number; usedKb: string; percentUsed: number; keysCount: number } {
    if (!this.isAvailable()) {
      return { usedBytes: 0, usedKb: '0 KB', percentUsed: 0, keysCount: 0 };
    }
    try {
      let totalBytes = 0;
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('recoverai_')) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2; // UTF-16 approximation
          count++;
        }
      }
      // Standard browser quota ~5MB (5,242,880 bytes)
      const percentUsed = Math.min(100, (totalBytes / 5242880) * 100);
      return {
        usedBytes: totalBytes,
        usedKb: (totalBytes / 1024).toFixed(1) + ' KB',
        percentUsed: Math.max(0.1, Number(percentUsed.toFixed(2))),
        keysCount: count,
      };
    } catch {
      return { usedBytes: 0, usedKb: '0 KB', percentUsed: 0, keysCount: 0 };
    }
  }

  // --- Clear all RecoverAI data ---
  static clearAll(): void {
    if (!this.isAvailable()) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('recoverai_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('RecoverAI: Error clearing storage', e);
    }
  }
}
