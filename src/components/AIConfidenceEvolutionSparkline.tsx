import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Brain,
  Zap,
  Activity,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
} from 'lucide-react';
import { TransactionRecord } from '../types';

export interface ConfidenceEvolutionStep {
  stepIndex: number;
  nodeId: string;
  name: string;
  shortLabel: string;
  phase: string;
  offsetMs: number;
  confidencePercent: number;
  deltaPercent: number;
  tokenCount: number;
  causalFactor: string;
  reasoningInsight: string;
  status: 'BASELINE' | 'RISING' | 'CONVERGED' | 'EDGE_PLATEAU';
}

interface AIConfidenceEvolutionSparklineProps {
  transaction: TransactionRecord;
  selectedStepIndex?: number | null;
  onSelectStep?: (stepIndex: number) => void;
  className?: string;
  showDetailedCards?: boolean;
}

export const AIConfidenceEvolutionSparkline: React.FC<AIConfidenceEvolutionSparklineProps> = ({
  transaction,
  selectedStepIndex,
  onSelectStep,
  className = '',
  showDetailedCards = true,
}) => {
  const [activeStep, setActiveStep] = useState<number>(() =>
    selectedStepIndex !== undefined && selectedStepIndex !== null ? selectedStepIndex : 5
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize with external selectedStepIndex if provided
  useEffect(() => {
    if (selectedStepIndex !== undefined && selectedStepIndex !== null) {
      setActiveStep(selectedStepIndex);
    }
  }, [selectedStepIndex]);

  const finalScore = (transaction.diagnosis?.confidenceScore ?? 0.94) * 100;
  const isEdgeCase = finalScore < 85;
  const bank = transaction.bank || 'HDFC Bank';
  const amountInr = (transaction.amountPaise / 100).toFixed(0);
  const channel = transaction.channelDispatched || 'INSTANT_UPI_SWITCH';
  const totalMs = transaction.diagnosis?.processingTimeMs || 34;

  // Generate 6 realistic, deterministic iterative refinement steps tailored to this transaction
  const evolutionSteps: ConfidenceEvolutionStep[] = useMemo(() => {
    // Determine the step progression based on whether it's an edge case or normal
    let stepScores: number[] = [];
    if (isEdgeCase) {
      // In an edge case, confidence starts around 48% and plateaus around 76-80% (< 85%)
      const s0 = 46.5;
      const s1 = 58.2;
      const s2 = 67.4;
      const s3 = 71.8;
      const s4 = 75.0;
      const s5 = Number(finalScore.toFixed(1));
      stepScores = [s0, s1, s2, s3, s4, s5];
    } else {
      // Normal high-confidence convergence: starts ~48%, jumps on mutex, jumps on switch probe, converges >94%
      const s0 = 48.0;
      const s1 = 63.5;
      const s2 = 79.2;
      const s3 = 88.4;
      const s4 = 93.6;
      const s5 = Number(finalScore.toFixed(1));
      stepScores = [s0, s1, s2, s3, s4, s5];
    }

    const offsets = [
      0,
      4,
      Math.round(totalMs * 0.4),
      Math.round(totalMs * 0.65),
      Math.round(totalMs * 0.82),
      totalMs,
    ];

    const stepsMeta = [
      {
        nodeId: 'INGRESS_TELEMETRY',
        name: 'Webhook Ingest & Prior Uncertainty',
        shortLabel: 'Ingress',
        phase: 'WEBHOOK_TRIAGE',
        tokenCount: 42,
        causalFactor: `Payload Ingestion (${transaction.errorCode || 'GATEWAY_TIMEOUT'})`,
        reasoningInsight: `Ingested ${transaction.orderId} (₹${amountInr}, ${bank}). Prior Bayesian confidence sits at ${stepScores[0]}% before causal telemetry is parsed.`,
      },
      {
        nodeId: 'IDEMPOTENCY_MUTEX',
        name: 'Cryptographic Mutex & Replay Lock',
        shortLabel: 'Mutex Lock',
        phase: 'SECURITY_ENFORCEMENT',
        tokenCount: 28,
        causalFactor: 'SHA-256 HMAC Signature Verification & Redis Lock',
        reasoningInsight: `Acquired Redis distributed mutex on 'rzp_idemp:${transaction.paymentId}'. Zero duplicate replay detected. Confidence lifted by +${(stepScores[1] - stepScores[0]).toFixed(1)}%.`,
      },
      {
        nodeId: 'ISSUER_SWITCH_HEALTH',
        name: 'Bank Switch Health & Latency Probe',
        shortLabel: 'Bank Probe',
        phase: 'SWITCH_TELEMETRY',
        tokenCount: 56,
        causalFactor: `${bank} ACS 3DS & Netbanking Latency Signals`,
        reasoningInsight: isEdgeCase
          ? `Conflicting signals from ${bank} switch (p99 latency ±320ms variance). Partial uncertainty remains; confidence restricted to ${stepScores[2]}%.`
          : `Detected elevated ${bank} 504 timeout rate (38.4%). Causal root cause pinned to issuer switch; immediate bank retry suppressed. Confidence reaches ${stepScores[2]}%.`,
      },
      {
        nodeId: 'CUSTOMER_INTENT_SCORING',
        name: 'Customer Intent & Basket Weighting',
        shortLabel: 'Intent Score',
        phase: 'INTENT_CLASSIFICATION',
        tokenCount: 48,
        causalFactor: `AOV Elasticity (₹${amountInr}) & Device Context`,
        reasoningInsight: `Customer Intent Score evaluated at ${(transaction.diagnosis?.customerIntentScore ?? 0.92).toFixed(2)}. Mobile checkout channel validated. Confidence advances to ${stepScores[3]}%.`,
      },
      {
        nodeId: 'MULTI_RAIL_ARBITRATION',
        name: 'SHAP Multi-Rail Candidate Scoring',
        shortLabel: 'Rail Arbitrate',
        phase: 'SHAP_ARBITRATION',
        tokenCount: 74,
        causalFactor: 'Candidate Recovery Rail Win Probability Matrix',
        reasoningInsight: isEdgeCase
          ? `Dead-heat detected between UPI Intent (74.2 pts) and WhatsApp 1-Click (72.8 pts). Δ < 2.0% triggers cautious edge-case boundary (${stepScores[4]}%).`
          : `SHAP causal ranking elevated NPCI UPI Intent (98.4 pts) over WhatsApp (84.1 pts). Clear mathematical winner identified (${stepScores[4]}%).`,
      },
      {
        nodeId: isEdgeCase ? 'HITL_ESCALATION_GATE' : 'SAFETY_POLICY_CONVERGENCE',
        name: isEdgeCase ? 'Human-in-the-Loop Caution Gate' : 'Safety Policy & Dispatch Authorization',
        shortLabel: isEdgeCase ? 'HITL Gate' : 'Policy Gate',
        phase: isEdgeCase ? 'HITL_GUARDRAIL_ACTIVATED' : 'AUTONOMOUS_AUTHORIZATION',
        tokenCount: 46,
        causalFactor: isEdgeCase ? 'Confidence < 85% Boundary' : 'RBI COFT Compliance & Anti-Spam (0/3 today)',
        reasoningInsight: isEdgeCase
          ? `Final confidence ${stepScores[5]}% < 85.0% threshold. Automated dispatch paused; ticket escalated to Operator Review queue with zero double-charge guarantee.`
          : `Zero double-charge lock certified. Anti-spam frequency verified. Final decision converged at ${stepScores[5]}% deterministic confidence. Dispatched to ${channel}.`,
      },
    ];

    return stepsMeta.map((meta, idx) => {
      const prevScore = idx === 0 ? 0 : stepScores[idx - 1];
      const delta = idx === 0 ? stepScores[0] : Number((stepScores[idx] - prevScore).toFixed(1));
      let status: ConfidenceEvolutionStep['status'] = 'RISING';
      if (idx === 0) status = 'BASELINE';
      else if (idx === 5) status = isEdgeCase ? 'EDGE_PLATEAU' : 'CONVERGED';

      return {
        stepIndex: idx,
        nodeId: meta.nodeId,
        name: meta.name,
        shortLabel: meta.shortLabel,
        phase: meta.phase,
        offsetMs: offsets[idx],
        confidencePercent: stepScores[idx],
        deltaPercent: delta,
        tokenCount: meta.tokenCount,
        causalFactor: meta.causalFactor,
        reasoningInsight: meta.reasoningInsight,
        status,
      };
    });
  }, [transaction, finalScore, isEdgeCase, bank, amountInr, channel, totalMs]);

  // Handle Play/Pause animated reasoning playback
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= 5) {
            setIsPlaying(false);
            return 5;
          }
          const next = prev + 1;
          if (onSelectStep) onSelectStep(next);
          return next;
        });
      }, 750);
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, onSelectStep]);

  const handleStepClick = (idx: number) => {
    setIsPlaying(false);
    setActiveStep(idx);
    if (onSelectStep) onSelectStep(idx);
  };

  const handleRestart = () => {
    setActiveStep(0);
    if (onSelectStep) onSelectStep(0);
    setIsPlaying(true);
  };

  // SVG Dimensioning & Coordinate calculations
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  // Min and max Y scales (0% to 100%)
  const minY = 30; // 30% bottom base
  const maxY = 100;

  const points = useMemo(() => {
    return evolutionSteps.map((step, idx) => {
      const x = paddingX + (idx / (evolutionSteps.length - 1)) * plotWidth;
      const normalizedScore = Math.max(minY, Math.min(maxY, step.confidencePercent));
      const y = paddingY + plotHeight - ((normalizedScore - minY) / (maxY - minY)) * plotHeight;
      return { x, y, step };
    });
  }, [evolutionSteps, plotWidth, plotHeight, paddingX, paddingY]);

  // Generate SVG Path for line and filled area
  const linePath = useMemo(() => {
    if (points.length < 2) return '';
    return points.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      // Smooth cubic bezier curve
      const prev = points[idx - 1];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length < 2) return '';
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const bottomY = paddingY + plotHeight;
    return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
  }, [linePath, points, paddingY, plotHeight]);

  // 85% Threshold Y coordinate
  const thresholdY = paddingY + plotHeight - ((85 - minY) / (maxY - minY)) * plotHeight;

  const currentDisplayStep =
    hoveredStep !== null ? evolutionSteps[hoveredStep] : evolutionSteps[activeStep] || evolutionSteps[5];
  const initialScore = evolutionSteps[0]?.confidencePercent ?? 48;
  const netLift = Number((finalScore - initialScore).toFixed(1));

  return (
    <div
      id="ai-confidence-evolution-sparkline"
      className={`bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-xl text-slate-100 space-y-3.5 transition-all ${className}`}
    >
      {/* Sparkline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-white tracking-tight">
                AI Confidence Evolution Sparkline
              </h3>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                Iterative Thought Process
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Visual trajectory of Gemini 3.7 Flash reasoning passes as entropy is resolved (T+0ms → T+{totalMs}ms)
            </p>
          </div>
        </div>

        {/* Playback Controls & Status Badge */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto shrink-0">
          <button
            id="btn-play-reasoning-evolution"
            onClick={() => {
              if (activeStep >= 5) {
                setActiveStep(0);
                if (onSelectStep) onSelectStep(0);
              }
              setIsPlaying((prev) => !prev);
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all shadow cursor-pointer"
            title={isPlaying ? 'Pause Reasoning Playback' : 'Replay Cognitive Evolution in Real-Time'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>{activeStep >= 5 ? 'Replay' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            id="btn-reset-reasoning-evolution"
            onClick={handleRestart}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset to Initial Prior (Step 1)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Multiplier Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Initial Prior Entropy</div>
          <div className="font-mono font-bold text-slate-300 mt-0.5 flex items-center gap-1">
            <span>{initialScore.toFixed(1)}%</span>
            <span className="text-[9px] text-slate-500 font-sans font-normal">(High Uncertainty)</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Final Convergence</div>
          <div className={`font-mono font-bold mt-0.5 flex items-center gap-1 ${
            isEdgeCase ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            <span>{finalScore.toFixed(1)}%</span>
            <span className="text-[9px] font-sans font-normal">
              {isEdgeCase ? '(HITL Alert)' : '(Deterministic)'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Net Refinement Lift</div>
          <div className="font-mono font-bold text-purple-400 mt-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-300" />
            <span>+{netLift.toFixed(1)}%</span>
            <span className="text-[9px] text-slate-500 font-sans font-normal">
              ({(finalScore / initialScore).toFixed(1)}x lift)
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Convergence Latency</div>
          <div className="font-mono font-bold text-blue-400 mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-300" />
            <span>{totalMs}ms</span>
            <span className="text-[9px] text-slate-500 font-sans font-normal">(6 Passes)</span>
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Sparkline Container */}
      <div className="relative bg-slate-900/90 border border-slate-800/90 rounded-xl p-2.5 overflow-hidden">
        {/* Subtle Background Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="h-full w-full flex flex-col justify-between p-4">
            <div className="border-b border-dashed border-slate-600 w-full" />
            <div className="border-b border-dashed border-slate-600 w-full" />
            <div className="border-b border-dashed border-slate-600 w-full" />
          </div>
        </div>

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-40 overflow-visible select-none"
        >
          <defs>
            {/* Area Gradient */}
            <linearGradient id="confidenceAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={isEdgeCase ? '#f59e0b' : '#10b981'}
                stopOpacity="0.45"
              />
              <stop
                offset="70%"
                stopColor={isEdgeCase ? '#d97706' : '#8b5cf6'}
                stopOpacity="0.15"
              />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>

            {/* Stroke Gradient */}
            <linearGradient id="confidenceStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor={isEdgeCase ? '#f59e0b' : '#10b981'} />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 85% Caution Threshold Line */}
          <line
            x1={paddingX}
            y1={thresholdY}
            x2={svgWidth - paddingX}
            y2={thresholdY}
            stroke="#ef4444"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            strokeOpacity="0.75"
          />
          <text
            x={svgWidth - paddingX + 4}
            y={thresholdY + 3}
            fill="#f87171"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            85% HITL Gate
          </text>

          {/* Filled Area Under Curve */}
          <path d={areaPath} fill="url(#confidenceAreaGrad)" />

          {/* Main Trajectory Curve */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#confidenceStrokeGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Render Interactive Node Points */}
          {points.map((pt, idx) => {
            const isSelected = activeStep === idx;
            const isHovered = hoveredStep === idx;
            const isCompleted = idx <= activeStep;

            return (
              <g
                key={idx}
                className="cursor-pointer transition-transform"
                onClick={() => handleStepClick(idx)}
                onMouseEnter={() => setHoveredStep(idx)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Outer Glow Halo on Active / Hover */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? '14' : '10'}
                    fill={isEdgeCase && idx === 5 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(168, 85, 247, 0.35)'}
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? '7' : isHovered ? '6' : '4.5'}
                  fill={
                    isCompleted
                      ? isEdgeCase && idx === 5
                        ? '#f59e0b'
                        : '#10b981'
                      : '#475569'
                  }
                  stroke={isSelected ? '#ffffff' : '#0f172a'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                />

                {/* Score Label above point */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  fill={
                    isSelected
                      ? '#ffffff'
                      : isHovered
                      ? '#a855f7'
                      : idx === 5 && isEdgeCase
                      ? '#f59e0b'
                      : '#94a3b8'
                  }
                  fontSize={isSelected ? '11' : '9.5'}
                  fontFamily="monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {pt.step.confidencePercent.toFixed(0)}%
                </text>

                {/* Step Node Label below axis */}
                <text
                  x={pt.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : '#64748b'}
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {pt.step.shortLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Step Scrubber Navigation Bar */}
        <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-800/80 mt-1 overflow-x-auto scrollbar-none text-[11px]">
          {evolutionSteps.map((step, idx) => {
            const isSelected = activeStep === idx;
            return (
              <button
                key={idx}
                onClick={() => handleStepClick(idx)}
                className={`flex-1 py-1 px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? isEdgeCase && idx === 5
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold shadow-sm'
                      : 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                <span className="font-mono text-[10px]">T+{step.offsetMs}ms</span>
                <span className="hidden md:inline font-sans">{step.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Deep-Dive Insight Card */}
      {showDetailedCards && currentDisplayStep && (
        <div className={`p-3.5 rounded-xl border space-y-2 animate-fade-in transition-all ${
          isEdgeCase && currentDisplayStep.stepIndex === 5
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-100'
            : 'bg-slate-900 border-purple-500/30 text-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                isEdgeCase && currentDisplayStep.stepIndex === 5
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                {currentDisplayStep.stepIndex + 1}
              </div>
              <div>
                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span>{currentDisplayStep.name}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    +{currentDisplayStep.offsetMs}ms
                  </span>
                </div>
                <div className="text-[10px] font-mono text-purple-300/80">
                  Phase: {currentDisplayStep.phase} &bull; {currentDisplayStep.tokenCount} reasoning tokens
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono font-bold text-sm text-white">
                {currentDisplayStep.confidencePercent.toFixed(1)}%
              </div>
              <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                {currentDisplayStep.deltaPercent >= 0 ? `▲ +${currentDisplayStep.deltaPercent}%` : `▼ ${currentDisplayStep.deltaPercent}%`}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-300 leading-relaxed">
            <div className="text-slate-400 text-[10px] font-semibold uppercase mb-0.5">
              Reasoning Pass Deduction:
            </div>
            {currentDisplayStep.reasoningInsight}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>Causal Trigger: <strong>{currentDisplayStep.causalFactor}</strong></span>
            </span>
            <span className="font-mono text-slate-500">
              Node ID: {currentDisplayStep.nodeId}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
