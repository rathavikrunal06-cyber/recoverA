export type FailureCategory =
  | 'BANK_DOWNTIME'
  | 'AUTH_TIMEOUT'
  | 'INSUFFICIENT_FUNDS'
  | 'MANDATE_DECLINED'
  | 'GATEWAY_ERROR'
  | 'FRAUD_SUSPICION'
  | 'CROSS_BORDER_RESTRICTION'
  | 'USER_ABANDONED';

export type RecoveryChannel =
  | 'INSTANT_UPI_SWITCH'
  | 'WHATSAPP_INTERACTIVE_PAY'
  | 'ADAPTIVE_DUNNING'
  | 'DYNAMIC_DISCOUNT_LINK'
  | 'SMART_GATEWAY_FALLBACK'
  | 'MANUAL_INTERVENTION_REQUIRED';

export type RecoveryStatus =
  | 'INGESTED'
  | 'ANALYZING'
  | 'RECOVERY_DISPATCHED'
  | 'RECOVERED'
  | 'FAILED_PERMANENT'
  | 'SCHEDULED_DUNNING';

export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        entity: string;
        amount: number; // in paise
        currency: string;
        status: string;
        order_id: string;
        invoice_id: string | null;
        international: boolean;
        method: 'card' | 'netbanking' | 'upi' | 'wallet' | 'emi' | 'nach';
        amount_refunded: number;
        refund_status: string | null;
        captured: boolean;
        description: string;
        card_id: string | null;
        bank: string | null;
        wallet: string | null;
        vpa: string | null;
        email: string;
        contact: string;
        notes: Record<string, string>;
        fee: number | null;
        tax: number | null;
        error_code: string | null;
        error_description: string | null;
        error_source: string | null;
        error_step: string | null;
        error_reason: string | null;
        created_at: number;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        receipt: string;
        status: string;
        attempts: number;
        notes: Record<string, string>;
        created_at: number;
      };
    };
    subscription?: {
      entity: {
        id: string;
        plan_id: string;
        status: string;
        current_cycle: number;
        total_count: number;
        customer_id: string;
        auth_type: string;
        next_due_at: number;
      };
    };
  };
  created_at: number;
}

export interface AIDiagnosisResult {
  failureCategory: FailureCategory;
  rootCauseAnalysis: string;
  confidenceScore: number; // 0 to 1
  customerIntentScore: number; // 0 to 1
  recommendedStrategy: RecoveryChannel;
  urgencyLevel: 'IMMEDIATE_REALTIME' | 'WITHIN_15_MIN' | 'SCHEDULED_BATCH';
  reasoningSteps: string[];
  actionPayload: {
    title: string;
    description: string;
    targetMethod: string;
    recoveryUrl?: string;
    deepLinkUpi?: string;
    incentiveDiscountPaise?: number;
    scheduledRetryTimestamp?: number;
    personalizedMessage?: string;
  };
  guardrailsApplied: {
    antiSpamPassed: boolean;
    zeroDoubleChargeVerified: boolean;
    marginProtectionCompliant: boolean;
    rateLimitCheck: string;
  };
  processingTimeMs: number;
  isAnomaly?: boolean;
  anomalyCategory?: string;
  lowConfidenceReason?: string;
  edgeCaseHandling?: string;
  fallbackSafeguardTriggered?: string;
  humanOverrideApplied?: boolean;
  humanOverrideDetails?: {
    operator: string;
    selectedRail: RecoveryChannel;
    notes?: string;
    timestamp: number;
  };
}

export interface TransactionRecord {
  id: string;
  paymentId: string;
  orderId: string;
  amountPaise: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  method: string;
  bank?: string;
  errorReason: string;
  errorCode: string;
  timestamp: number;
  status: RecoveryStatus;
  rawPayload: RazorpayWebhookPayload;
  diagnosis?: AIDiagnosisResult;
  recoveredAt?: number;
  recoveredMethod?: string;
  recoveredAmountPaise?: number;
  channelDispatched?: RecoveryChannel;
}

export interface SystemMetrics {
  totalFailedGMV: number;
  totalRecoveredGMV: number;
  totalEventsProcessed: number;
  totalRecoveredCount: number;
  overallRecoveryRate: number;
  tsrLiftPercentage: number;
  avgLatencyMs: number;
  activeDunningSchedules: number;
  falsePositiveRate: number;
  protectedDoubleCharges: number;
}

export interface RateLimitTelemetry {
  limit: number;
  remaining: number;
  resetSeconds: number;
  refillRatePerSec: number;
  totalRequestsServed: number;
  totalThrottledRequests: number;
  circuitBreaker: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  status: 'HEALTHY' | 'WARNING' | 'THROTTLED';
  backoffStrategy: string;
  queueDepth: number;
  lastThrottledTime: number | null;
}

export interface StateSnapshot {
  id: string;
  name: string;
  timestamp: number;
  formattedTime: string;
  metrics: SystemMetrics;
  transactionsCount: number;
  tag: 'BASELINE' | 'AI_OPTIMIZED' | 'STRESS_TEST' | 'CUSTOM';
  notes?: string;
}

export interface LiveStatusAlert {
  id: string;
  timestamp: number;
  relativeTime: string;
  severity: 'SUCCESS' | 'INFO' | 'WARNING' | 'CRITICAL' | 'GUARDRAIL';
  category: 'RECOVERY' | 'MUTEX' | 'UPI_ROUTER' | 'AI_ENGINE' | 'DUNNING' | 'BANK_SWITCH' | 'DLQ';
  title: string;
  message: string;
  orderId?: string;
  amountPaise?: number;
  latencyMs?: number;
  actionTaken?: string;
  isRead?: boolean;
}

export interface SystemStressEvent {
  id: string;
  timestamp: string;
  relativeTime: string;
  eventType:
    | 'API_BURST_INJECTED'
    | 'TOKEN_BUCKET_DEPLETED'
    | 'CIRCUIT_BREAKER_TRIPPED'
    | 'REDIS_BACKOFF_QUEUE_ENGAGED'
    | 'CANARY_PROBE_RESOLVED'
    | 'CIRCUIT_BREAKER_RESET'
    | 'ZERO_DATA_LOSS_CONFIRMED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'RESOLVED';
  burstTps: number;
  remainingTokens: number;
  circuitState: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  queueDepth: number;
  backoffDelayMs: number;
  targetEndpoint: string;
  narrative: string;
  safeguardMechanism: string;
  idempotencyHash: string;
}

export interface TimeTravelFrame {
  offsetMs: number;
  stage: string;
  systemComponent:
    | 'ISSUER_SWITCH'
    | 'GEMINI_AI'
    | 'AUTONOMOUS_MESH'
    | 'REDIS_MUTEX'
    | 'WHATSAPP_DISPATCH'
    | 'BIOMETRIC_CHECKOUT'
    | 'LEDGER_SETTLED';
  description: string;
  status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'BLOCKED';
  payloadState: Record<string, any>;
  merkleProofHash: string;
  cpuOverheadMs: number;
}

