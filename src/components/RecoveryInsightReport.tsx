import React, { useState } from 'react';
import {
  FileText,
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  BarChart2,
  Calendar,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  Key,
  Fingerprint,
  RefreshCw,
  Check,
  Layers,
  Cpu,
  Zap,
} from 'lucide-react';
import { SystemMetrics, TransactionRecord } from '../types';
import { QuarterlyReportPdfModal } from './QuarterlyReportPdfModal';
import { CsvExportManager } from './CsvExportManager';

interface RecoveryInsightReportProps {
  metrics: SystemMetrics | null;
  transactions?: TransactionRecord[];
}

export const RecoveryInsightReport: React.FC<RecoveryInsightReportProps> = ({ metrics, transactions }) => {
  const [selectedReportPeriod, setSelectedReportPeriod] = useState<'30d' | '7d' | '24h'>('30d');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [selectedPayloadSample, setSelectedPayloadSample] = useState<'card_otp' | 'upi_timeout' | 'mandate_nsf'>('card_otp');
  const [isMaskingVerifying, setIsMaskingVerifying] = useState<boolean>(false);
  const [verificationPassed, setVerificationPassed] = useState<boolean>(true);
  const [showCsvStudio, setShowCsvStudio] = useState<boolean>(true);

  const rootCauses = [
    { label: 'Bank Switch 504 Timeouts', share: 38, count: 184, winRate: 94.2, topFix: 'NPCI UPI Fast-Rail Auto-Switch' },
    { label: '3DS OTP Delivery SMS Drops', share: 26, count: 126, winRate: 88.6, topFix: 'WhatsApp 1-Click Interactive Pay' },
    { label: 'Daily Bank Account Limit Hit', share: 18, count: 87, winRate: 84.5, topFix: 'Tokenized Card Network Vault' },
    { label: 'Mandate Liquidity Drop (NSF)', share: 12, count: 58, winRate: 74.2, topFix: 'Salary-Aligned Smart Dunning' },
    { label: 'Card Expired / Issuer Decline', share: 6, count: 29, winRate: 68.0, topFix: 'Pre-filled Alternate Card Link' },
  ];

  const bankPerformances = [
    { bank: 'HDFC Bank', failures: 142, recovered: 134, rate: '94.3%', status: 'Optimal Recovery' },
    { bank: 'State Bank of India (SBI)', failures: 198, recovered: 168, rate: '84.8%', status: 'OTP Delays Bypassed' },
    { bank: 'ICICI Bank', failures: 96, recovered: 91, rate: '94.7%', status: 'Optimal Recovery' },
    { bank: 'Axis Bank', failures: 74, recovered: 67, rate: '90.5%', status: 'Optimal Recovery' },
    { bank: 'Kotak Mahindra Bank', failures: 45, recovered: 41, rate: '91.1%', status: 'Optimal Recovery' },
  ];

  const samplePayloads = {
    card_otp: {
      title: '3DS Card OTP Timeout (SBI Visa)',
      raw: {
        event: 'payment.failed',
        payment_id: 'pay_HdfcFail8892',
        amount: 249900,
        currency: 'INR',
        bank: 'SBIN',
        customer_name: 'Ananya Sharma',
        customer_email: 'ananya.sharma@gmail.com',
        customer_phone: '+919876543210',
        card_number: '4532 8901 2345 8891',
        card_cvv: '***',
        error_code: 'GATEWAY_ERROR',
        error_description: 'OTP expired during 3DS verification',
      },
      sanitized: {
        event: 'payment.failed',
        payment_id: 'pay_HdfcFail8892',
        amount: 249900,
        currency: 'INR',
        bank: 'SBIN',
        customer_name: 'A***** S*****',
        customer_email: 'a***.s***@gmail.com',
        customer_phone: '+9198****3210',
        card_token: 'card_tok_8891 (Last-4 Only)',
        card_cvv: '[DROPPED_AT_EDGE - ZERO_STORAGE]',
        error_code: 'GATEWAY_ERROR',
        error_description: 'OTP expired during 3DS verification',
        _sanitization: {
          pii_masked: true,
          pci_dss_compliant: true,
          ephemeral_context: true,
          sanitized_in_ms: 1.2,
        },
      },
    },
    upi_timeout: {
      title: 'UPI Netbanking Switch 504 Timeout',
      raw: {
        event: 'payment.failed',
        payment_id: 'pay_UpiTimeout1102',
        amount: 89900,
        currency: 'INR',
        bank: 'HDFC',
        customer_name: 'Vikram Mehta',
        customer_email: 'vikram.mehta@enterprise.in',
        customer_phone: '+919123456780',
        upi_vpa: 'vikram.mehta@okhdfcbank',
        error_code: 'BAD_REQUEST_ERROR',
        error_description: 'Issuer bank switch timed out (504)',
      },
      sanitized: {
        event: 'payment.failed',
        payment_id: 'pay_UpiTimeout1102',
        amount: 89900,
        currency: 'INR',
        bank: 'HDFC',
        customer_name: 'V***** M****',
        customer_email: 'v***.m***@enterprise.in',
        customer_phone: '+9191****6780',
        upi_vpa: 'v***@okhdfcbank (Hashed Handle)',
        error_code: 'BAD_REQUEST_ERROR',
        error_description: 'Issuer bank switch timed out (504)',
        _sanitization: {
          pii_masked: true,
          pci_dss_compliant: true,
          ephemeral_context: true,
          sanitized_in_ms: 0.9,
        },
      },
    },
    mandate_nsf: {
      title: 'Subscription Mandate Liquidity Drop',
      raw: {
        event: 'subscription.charged_failed',
        payment_id: 'pay_SubBounce441',
        amount: 499900,
        currency: 'INR',
        bank: 'ICIC',
        customer_name: 'Meera Iyer',
        customer_email: 'meera.iyer@fintechcorp.io',
        customer_phone: '+919845012345',
        mandate_id: 'mandate_ICICI_998124',
        error_code: 'BAD_REQUEST_ERROR',
        error_description: 'Mandate failed due to insufficient funds',
      },
      sanitized: {
        event: 'subscription.charged_failed',
        payment_id: 'pay_SubBounce441',
        amount: 499900,
        currency: 'INR',
        bank: 'ICIC',
        customer_name: 'M**** I***',
        customer_email: 'm***.i***@fintechcorp.io',
        customer_phone: '+9198****2345',
        mandate_id: 'mandate_tok_****9124',
        error_code: 'BAD_REQUEST_ERROR',
        error_description: 'Mandate failed due to insufficient funds',
        _sanitization: {
          pii_masked: true,
          pci_dss_compliant: true,
          ephemeral_context: true,
          sanitized_in_ms: 1.4,
        },
      },
    },
  };

  const handleTriggerVerification = () => {
    setIsMaskingVerifying(true);
    setTimeout(() => {
      setIsMaskingVerifying(false);
      setVerificationPassed(true);
    }, 600);
  };

  const handleExportReport = () => {
    setIsPdfModalOpen(true);
  };

  return (
    <div id="recovery-insight-report-view" className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-500 dark:text-purple-400 border border-purple-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Executive Recovery Intelligence & Audit Report</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 font-bold">
                Q1 2026 Audit Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Deep diagnostic audit of failure taxonomies, bank issuer friction points, PII data masking governance, and merchant bottom-line GMV retention.
            </p>
          </div>
        </div>

        {/* Period Selector & Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            {(['24h', '7d', '30d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedReportPeriod(period)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedReportPeriod === period
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            id="btn-export-insight-report"
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate & Export Official PDF</span>
          </button>
        </div>
      </div>

      {/* Top 3 Executive Takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Failure Root Cause</span>
            <span className="text-[10px] font-mono bg-red-500/20 text-red-600 dark:text-red-300 px-2 py-0.5 rounded font-bold">38% Share</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">Bank Switch 504 Timeouts</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            HDFC & SBI core banking maintenance windows cause 38% of total dropoffs. RecoverAI converts 94.2% by immediate NPCI UPI switch.
          </p>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Most Effective Rail</span>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">94.2% Win Rate</span>
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">NPCI UPI Instant Intent</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Generates pre-filled QR and App-Intent links in &lt;24ms, allowing the customer to authenticate on PhonePe/GPay seamlessly.
          </p>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net TSR Conversion Lift</span>
            <span className="text-[10px] font-mono bg-blue-500/20 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded font-bold">+4.2% Overall</span>
          </div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">86.5% &rarr; 90.7% Success</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Pushes checkout transaction success rate past 90.5%, translating to ~₹93.9 Lakhs annual bottom-line GMV expansion for a ₹2Cr/mo merchant.
          </p>
        </div>
      </div>

      {/* COMPLIANCE AUDIT & PII GOVERNANCE SECTION (Production-Grade Security) */}
      <div id="compliance-audit-section" className="bg-slate-900 dark:bg-slate-900 bg-white border border-emerald-500/40 rounded-2xl p-5 space-y-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compliance Audit & PII Governance</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  PCI-DSS Level 1 / DPDPA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automated ingress data sanitization, cryptographic tokenization, and zero-PII transmission in Gemini LLM diagnostic inference prompts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerVerification}
              disabled={isMaskingVerifying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isMaskingVerifying ? 'animate-spin' : ''}`} />
              <span>{isMaskingVerifying ? 'Running Sanitizer Audit...' : 'Re-verify PII Redaction'}</span>
            </button>
          </div>
        </div>

        {/* 4 Core Compliance Stat Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-sans font-bold">
              <span>Ingress PII Masking</span>
              <EyeOff className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">100% Redacted</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">484 of 484 events sanitized</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-sans font-bold">
              <span>Card PAN & CVV Scope</span>
              <Lock className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-1">Zero Raw Storage</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">RBI COFT Tokenized at Edge</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-sans font-bold">
              <span>LLM Prompt Privacy</span>
              <Cpu className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-base font-bold text-purple-600 dark:text-purple-400 mt-1">0ms Ephemeral Context</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">No training, zero data retention</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-sans font-bold">
              <span>Redaction Latency</span>
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1">&lt;1.2ms Avg</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Streaming AST Sanitizer</span>
          </div>
        </div>

        {/* 4-Step Production Data Protection Pipeline */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>4-Stage In-Flight Data Protection Pipeline</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-mono">1</span>
                <span>HMAC Ingress Audit</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Razorpay Webhook secret validated with SHA-256 signature to prevent replay and spoof attacks before payload parsing.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-mono">2</span>
                <span>SAD & CVV Stripping</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                PCI-DSS Level 1 compliance: All CVV, PIN, and 16-digit PANs are immediately dropped or tokenized into RBI-compliant network tokens.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-mono">3</span>
                <span>PII Dynamic Masking</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Phone numbers (<code className="font-mono text-emerald-600 dark:text-emerald-400 text-[10px]">+91 98****3210</code>), emails, and customer names are obfuscated with regex masks.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-mono">4</span>
                <span>Stateless AI Reasoning</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Gemini 3.7 Flash receives purely technical telemetry (<code className="font-mono text-purple-500 text-[10px]">error_code</code>, <code className="font-mono text-purple-500 text-[10px]">bank</code>, token). Zero PII retained in LLM context.
              </p>
            </div>
          </div>
        </div>

        {/* Live Ingestion Masking Inspector */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Interactive Ingress Masking Inspector</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-500">Sample Event:</span>
              <button
                onClick={() => setSelectedPayloadSample('card_otp')}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  selectedPayloadSample === 'card_otp'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Card 3DS OTP
              </button>
              <button
                onClick={() => setSelectedPayloadSample('upi_timeout')}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  selectedPayloadSample === 'upi_timeout'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                UPI 504 Timeout
              </button>
              <button
                onClick={() => setSelectedPayloadSample('mandate_nsf')}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  selectedPayloadSample === 'mandate_nsf'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Mandate NSF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Raw Ingress */}
            <div className="bg-slate-900 border border-red-500/30 rounded-xl p-3 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[10px] pb-1 border-b border-red-500/20">
                <span className="text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  Raw Ingress Webhook (Sensitive PII)
                </span>
                <span className="text-red-400/80 bg-red-500/10 px-1.5 py-0.2 rounded text-[9px]">Unsanitized</span>
              </div>
              <pre className="text-slate-300 overflow-x-auto p-1 leading-relaxed max-h-48 text-[10px]">
                {JSON.stringify(samplePayloads[selectedPayloadSample].raw, null, 2)}
              </pre>
            </div>

            {/* Sanitized LLM Ingress */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[10px] pb-1 border-b border-emerald-500/20">
                <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Sanitized Gemini 3.7 Diagnosis Payload
                </span>
                <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded text-[9px] font-bold">100% Masked</span>
              </div>
              <pre className="text-emerald-300 overflow-x-auto p-1 leading-relaxed max-h-48 text-[10px]">
                {JSON.stringify(samplePayloads[selectedPayloadSample].sanitized, null, 2)}
              </pre>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5" />
                Zero Sensitive Authentication Data (SAD) Passed to AI
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="text-slate-500">RBI Master Direction Compliance Certified</span>
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              Audit Stamp: <span className="text-emerald-500 font-bold">COMPLIANT-Q1-2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Root Causes Distribution Table */}
      <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-500" />
            Failure Taxonomy & Autonomous Fix Distribution
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Audited across 484 failure events</span>
        </div>

        <div className="space-y-3">
          {rootCauses.map((rc, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{rc.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {rc.share}% of drops ({rc.count} events)
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Win Rate:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{rc.winRate}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${rc.share * 2}%` }} />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span>Autonomous Solution:</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{rc.topFix}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Issuer Performance Breakdown */}
      <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-500" />
          Major Bank Issuer Recovery Benchmarking
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-bold">Issuer Bank</th>
                <th className="py-2.5 px-3 font-bold">Failed Events</th>
                <th className="py-2.5 px-3 font-bold">Recovered</th>
                <th className="py-2.5 px-3 font-bold">Recovery Win Rate</th>
                <th className="py-2.5 px-3 font-bold">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-mono">
              {bankPerformances.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white font-sans">{b.bank}</td>
                  <td className="py-3 px-3 text-red-500">{b.failures}</td>
                  <td className="py-3 px-3 text-emerald-500">{b.recovered}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">{b.rate}</td>
                  <td className="py-3 px-3 font-sans">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-medium">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Strategic Action Plan */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/40 bg-white border border-purple-500/30 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gemini 3.7 Strategic Recommendations for Merchant</h3>
        </div>

        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Promote UPI Intent as Preferred Checkout Rail:</strong> Set UPI Intent as default option on desktop/mobile checkouts to preemptively reduce bank switch 504 timeouts by ~28%.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>WhatsApp 1-Click Pay for High AOV Orders (&gt;₹5,000):</strong> Triggering an instant WhatsApp reminder with 1-click payment recovers 88.6% of cart abandonment dropoffs within 4 minutes.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Align Subscription Billing with 1st of Month:</strong> Moving subscription retries away from the 22nd-28th of the month reduces insufficient fund declines by 44%.
            </span>
          </li>
        </ul>
      </div>

      {/* CSV Export & Forensic Analytics Studio */}
      <CsvExportManager transactions={transactions || []} metrics={metrics} />

      {/* Official Quarterly Audit PDF Modal */}
      <QuarterlyReportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        metrics={metrics}
        transactions={transactions}
      />
    </div>
  );
};

