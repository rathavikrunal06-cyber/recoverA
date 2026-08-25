import { RazorpayWebhookPayload, SystemMetrics, TransactionRecord, RateLimitTelemetry } from '../types';

export const DEFAULT_RATE_LIMIT_TELEMETRY: RateLimitTelemetry = {
  limit: 120,
  remaining: 120,
  resetSeconds: 0,
  refillRatePerSec: 2,
  totalRequestsServed: 482,
  totalThrottledRequests: 0,
  circuitBreaker: 'CLOSED',
  status: 'HEALTHY',
  backoffStrategy: 'Adaptive Token Bucket + Full Jitter Backoff',
  queueDepth: 0,
  lastThrottledTime: null,
};

export async function fetchMetrics(): Promise<SystemMetrics> {
  try {
    const res = await fetch('/api/metrics');
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return await res.json();
  } catch (err) {
    console.warn('API /api/metrics fetch error, using local fallback state', err);
    throw err;
  }
}

export async function fetchTransactions(): Promise<TransactionRecord[]> {
  try {
    const res = await fetch('/api/transactions');
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const data = await res.json();
    return data.transactions || [];
  } catch (err) {
    console.warn('API /api/transactions fetch error', err);
    return [];
  }
}

export async function fetchRateLimit(): Promise<RateLimitTelemetry> {
  try {
    const res = await fetch('/api/rate-limit');
    if (!res.ok) {
      return DEFAULT_RATE_LIMIT_TELEMETRY;
    }
    const data = await res.json();
    return data || DEFAULT_RATE_LIMIT_TELEMETRY;
  } catch {
    return DEFAULT_RATE_LIMIT_TELEMETRY;
  }
}

export async function simulateRateLimitSpike(drainAmount: number = 105): Promise<any> {
  try {
    const res = await fetch('/api/rate-limit/simulate-spike', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drainAmount }),
    });
    if (!res.ok) throw new Error('Failed to simulate rate limit spike');
    return await res.json();
  } catch (err) {
    return {
      success: true,
      message: 'Simulated 100+ concurrent webhook burst (client fallback). Token bucket depleted.',
      rateLimit: {
        limit: 120,
        remaining: Math.max(0, 120 - drainAmount),
        circuitBreaker: 'OPEN',
        retryAfter: Math.ceil(drainAmount / 2),
      },
    };
  }
}

export async function resetRateLimit(): Promise<any> {
  try {
    const res = await fetch('/api/rate-limit/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset rate limit');
    return await res.json();
  } catch (err) {
    return {
      success: true,
      message: 'Rate limit bucket replenished to full 120 RPM capacity (client fallback).',
      remaining: 120,
    };
  }
}

export async function simulateWebhook(payload: RazorpayWebhookPayload): Promise<{ transaction: TransactionRecord; metrics: SystemMetrics }> {
  const res = await fetch('/api/webhooks/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to simulate webhook');
  }
  return res.json();
}

export async function markAsRecovered(
  transactionId: string,
  recoveredMethod?: string
): Promise<{ transaction: TransactionRecord; metrics: SystemMetrics }> {
  const res = await fetch(`/api/transactions/${transactionId}/recover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recoveredMethod }),
  });
  if (!res.ok) throw new Error('Failed to mark transaction as recovered');
  return res.json();
}

export async function triggerBatchSimulation(count: number = 5): Promise<{ success: boolean; count: number; metrics: SystemMetrics }> {
  const res = await fetch('/api/batch-simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  });
  if (!res.ok) throw new Error('Failed to run batch simulation');
  return res.json();
}

export async function simulateAnomaly(): Promise<{ success: boolean; transaction: TransactionRecord; metrics: SystemMetrics }> {
  const res = await fetch('/api/simulate-anomaly', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to simulate anomaly edge case');
  return res.json();
}

export async function overrideTransaction(
  transactionId: string,
  action?: string,
  overrideNotes?: string
): Promise<{ success: boolean; transaction: TransactionRecord; metrics: SystemMetrics; message: string }> {
  const res = await fetch(`/api/transactions/${transactionId}/override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, overrideNotes }),
  });
  if (!res.ok) throw new Error('Failed to apply human override');
  return res.json();
}

export async function resetDemoData(): Promise<void> {
  await fetch('/api/reset-demo', { method: 'POST' });
}
