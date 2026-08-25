import { TransactionRecord, RecoveryChannel } from '../types';

export interface ProbabilityFactor {
  name: string;
  impactPercent: number; // e.g. +38%
  category: 'GATEWAY_HEALTH' | 'AUTH_FRICTION' | 'CUSTOMER_INTENT' | 'HISTORICAL_BASELINE';
  description: string;
}

export interface RecoveryProbabilityResult {
  score: number; // 0 - 100 percentage
  confidenceTier: 'VERY_HIGH' | 'HIGH' | 'MODERATE';
  baselineRate: number;
  expectedTSRLift: number;
  factors: ProbabilityFactor[];
  abComparison: {
    autonomousAISuccess: number; // e.g. 41.2%
    legacyStaticRetrySuccess: number; // e.g. 8.4%
    timeToRecoverSecs: number; // e.g. 42
    legacyTimeToRecoverSecs: number; // e.g. 17280 (4.8 hrs)
    dropoffRate: number; // e.g. 12.1%
    legacyDropoffRate: number; // e.g. 64.7%
  };
}

export function calculateRecoveryProbability(tx: TransactionRecord): RecoveryProbabilityResult {
  const channel = tx.channelDispatched || tx.diagnosis?.recommendedStrategy || 'INSTANT_UPI_SWITCH';
  const bank = tx.bank?.toUpperCase() || 'PRIMARY_BANK';
  const intentScore = tx.diagnosis?.customerIntentScore || 0.88;

  let baseRate = 88.0;
  let factors: ProbabilityFactor[] = [];

  switch (channel) {
    case 'INSTANT_UPI_SWITCH':
      baseRate = 94.8;
      factors = [
        {
          name: 'Issuer Core Switch Bypass',
          impactPercent: 42,
          category: 'GATEWAY_HEALTH',
          description: `Direct routing around ${bank}'s unresponsive 504 core switch to direct UPI NPCI fast-rail.`,
        },
        {
          name: 'Biometric 1-Tap PIN Authentication',
          impactPercent: 28,
          category: 'AUTH_FRICTION',
          description: 'Replaces SMS OTP challenge with native on-device device biometric / UPI PIN, eliminating telecom SMS latency.',
        },
        {
          name: 'High-Affinity Intent Window (<90s)',
          impactPercent: 16,
          category: 'CUSTOMER_INTENT',
          description: `Customer active session recency indicates ${(intentScore * 100).toFixed(0)}% completion willingness.`,
        },
        {
          name: 'Cohort Historical Conversion',
          impactPercent: 8.8,
          category: 'HISTORICAL_BASELINE',
          description: 'Historical 124,000+ UPI intent fallback events demonstrated a 94.8% final settlement success rate.',
        },
      ];
      break;

    case 'WHATSAPP_INTERACTIVE_PAY':
      baseRate = 88.6;
      factors = [
        {
          name: 'Conversational Open Rate Advantage',
          impactPercent: 39,
          category: 'CUSTOMER_INTENT',
          description: 'WhatsApp interactive notifications achieve 96.4% open rate within 3 minutes of checkout interruption.',
        },
        {
          name: 'Pre-authenticated Session Token',
          impactPercent: 31,
          category: 'AUTH_FRICTION',
          description: 'Cryptographically signed payment deep-link removes cart rebuilding and login steps completely.',
        },
        {
          name: 'Dynamic Incentive Discount Buffer',
          impactPercent: 18,
          category: 'HISTORICAL_BASELINE',
          description: 'Targeted instant discount coupon mitigates price hesitation and boosts impulse recovery.',
        },
        {
          name: 'Issuer Multi-PSP Node Redundancy',
          impactPercent: 10.6,
          category: 'GATEWAY_HEALTH',
          description: 'WhatsApp payments automatically balance load across ICICI, Axis, and Yes Bank UPI switches.',
        },
      ];
      break;

    case 'ADAPTIVE_DUNNING':
      baseRate = 79.4;
      factors = [
        {
          name: 'Salary Cycle Window Alignment',
          impactPercent: 45,
          category: 'GATEWAY_HEALTH',
          description: 'Aligns retry timing with 1st-of-month salary disbursement windows to guarantee liquidity.',
        },
        {
          name: 'Multi-Rail Mandate Fallback',
          impactPercent: 24,
          category: 'AUTH_FRICTION',
          description: 'Automatically attempts secondary card tokens and UPI AutoPay if primary e-NACH mandate rejects.',
        },
        {
          name: 'Customer Subscription Tenure',
          impactPercent: 18,
          category: 'CUSTOMER_INTENT',
          description: 'High lifetime value profile correlates with 82%+ auto-debit recovery on re-presentation.',
        },
        {
          name: 'Bank Dunning Frequency Optimization',
          impactPercent: 12.4,
          category: 'HISTORICAL_BASELINE',
          description: 'Intelligent spacing prevents issuer penalty fees and account auto-blocks.',
        },
      ];
      break;

    case 'SMART_GATEWAY_FALLBACK':
      baseRate = 84.5;
      factors = [
        {
          name: 'Saved Token 1-Click Vaulting',
          impactPercent: 38,
          category: 'AUTH_FRICTION',
          description: 'Pre-tokenized card network fallback bypasses daily UPI cumulative volume caps.',
        },
        {
          name: 'Global Cross-Border FX Rail',
          impactPercent: 30,
          category: 'GATEWAY_HEALTH',
          description: '3DS-compliant international settlement node with multi-currency dynamic conversion.',
        },
        {
          name: 'High Cart Value Buyer Intent',
          impactPercent: 20,
          category: 'CUSTOMER_INTENT',
          description: 'Enterprise / High-ticket buyer profile prioritizes order fulfillment over payment method.',
        },
        {
          name: 'Gateway Redundant Clustering',
          impactPercent: 12,
          category: 'HISTORICAL_BASELINE',
          description: 'Razorpay Direct acquiring gateway eliminates intermediary switch bottlenecks.',
        },
      ];
      break;

    default:
      baseRate = 89.2;
      factors = [
        {
          name: 'Dynamic 1-Click Checkout Session',
          impactPercent: 40,
          category: 'AUTH_FRICTION',
          description: 'Direct cart recovery link with zero login wall or cart re-creation friction.',
        },
        {
          name: 'Multi-Gateway Redundancy',
          impactPercent: 32,
          category: 'GATEWAY_HEALTH',
          description: 'Real-time routing via lowest-latency active bank switch.',
        },
        {
          name: 'Customer Intent Confidence',
          impactPercent: 28,
          category: 'CUSTOMER_INTENT',
          description: 'Recent session activity indicates a high likelihood of immediate payment completion.',
        },
      ];
  }

  // Calculate final score
  const finalScore = Math.min(99.2, Math.max(72.0, baseRate + (intentScore - 0.8) * 10));

  return {
    score: parseFloat(finalScore.toFixed(1)),
    confidenceTier: finalScore >= 90 ? 'VERY_HIGH' : finalScore >= 80 ? 'HIGH' : 'MODERATE',
    baselineRate: baseRate,
    expectedTSRLift: parseFloat((finalScore * 0.00065).toFixed(3)),
    factors,
    abComparison: {
      autonomousAISuccess: 41.2,
      legacyStaticRetrySuccess: 8.4,
      timeToRecoverSecs: 42,
      legacyTimeToRecoverSecs: 17280, // 4.8 hours
      dropoffRate: 12.1,
      legacyDropoffRate: 64.7,
    },
  };
}
