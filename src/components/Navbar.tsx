import React, { useState } from 'react';
import {
  Activity,
  Zap,
  RefreshCw,
  Layers,
  Smartphone,
  BarChart3,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  Terminal,
  Shield,
  FileSpreadsheet,
  Brain,
  RotateCcw,
  Presentation,
  TrendingUp,
  Compass,
  FileText,
  Download,
  AlertTriangle,
  Briefcase,
  Radio,
  Coins,
} from 'lucide-react';
import { SystemMetrics } from '../types';
import { EngineThroughputMeter } from './EngineThroughputMeter';

export type ActiveTab =
  | 'dashboard'
  | 'future_scenarios'
  | 'unit_economics'
  | 'autonomous_mesh'
  | 'success_story'
  | 'compare_states'
  | 'live_status_alerts'
  | 'ai_explainability_heatmap'
  | 'recovery_gap'
  | 'system_pulse'
  | 'webhook_replay_stats'
  | 'revenue_impact'
  | 'stakeholder_dashboard'
  | 'explainability_mode'
  | 'data_latency_alert'
  | 'drift_analysis'
  | 'csv_export'
  | 'performance_budget'
  | 'api_security_scan'
  | 'scheduled_replay'
  | 'recovery_cost'
  | 'neural_decision_path'
  | 'simulator'
  | 'customer_experience'
  | 'dynamic_rails'
  | 'webhook_replay'
  | 'compliance_reports'
  | 'latency_notifications'
  | 'failover_dashboard'
  | 'failure_simulation'
  | 'roi_calculator'
  | 'live_logs'
  | 'model_comparison'
  | 'insight_report'
  | 'competitive_comparison'
  | 'api_health'
  | 'webhook_debugger'
  | 'ai_latency'
  | 'latency_heatmap'
  | 'architecture'
  | 'pitch_deck';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  metrics: SystemMetrics | null;
  onBatchSimulate: () => void;
  onReset: () => void;
  isSimulating: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenWalkthrough?: () => void;
  onDownloadSessionState?: () => void;
  onOpenSuccessStory?: () => void;
  onOpenExplainabilityLog?: () => void;
  lowConfidenceAlertCount?: number;
  onOpenLowConfidenceReview?: () => void;
  onTriggerSpike?: () => void;
  onOpenTimeTravelReplay?: () => void;
  isPiiMaskingEnabled?: boolean;
  onOpenPrivacySettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  onBatchSimulate,
  onReset,
  isSimulating,
  isDark,
  onToggleTheme,
  onOpenWalkthrough,
  onDownloadSessionState,
  onOpenSuccessStory,
  onOpenExplainabilityLog,
  lowConfidenceAlertCount = 0,
  onOpenLowConfidenceReview,
  onTriggerSpike,
  onOpenTimeTravelReplay,
  isPiiMaskingEnabled = false,
  onOpenPrivacySettings,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Live Monitoring', icon: Activity },
    { id: 'autonomous_mesh' as ActiveTab, label: 'Gateway Mesh & Radar', icon: Radio, highlight: true },
    { id: 'simulator' as ActiveTab, label: 'Failure Simulator', icon: Zap },
    { id: 'customer_experience' as ActiveTab, label: '1-Click Pay Flow', icon: Smartphone },
    { id: 'dynamic_rails' as ActiveTab, label: 'Dynamic Rails', icon: Brain },
    { id: 'roi_calculator' as ActiveTab, label: 'ROI & Impact', icon: TrendingUp },
    { id: 'architecture' as ActiveTab, label: 'Architecture', icon: Layers },
  ];

  const secondaryTabs = [
    { id: 'future_scenarios' as ActiveTab, label: 'Simulate Future Scenarios (90d Shock Lab)', icon: Sparkles },
    { id: 'unit_economics' as ActiveTab, label: 'Unit Economic Impact (Real-Time ROI)', icon: Coins },
    { id: 'autonomous_mesh' as ActiveTab, label: 'Gateway Mesh & Bank Radar (Chaos Lab)', icon: Radio },
    { id: 'stakeholder_dashboard' as ActiveTab, label: 'Stakeholder Executive Summary', icon: Briefcase },
    { id: 'ai_explainability_heatmap' as ActiveTab, label: 'AI Explainability & SHAP', icon: Brain },
    { id: 'webhook_debugger' as ActiveTab, label: 'Webhook Debugger & Replay', icon: RotateCcw },
    { id: 'compliance_reports' as ActiveTab, label: 'Automated Compliance (PCI/RBI)', icon: Shield },
    { id: 'live_logs' as ActiveTab, label: 'Real-Time System Logs', icon: Terminal },
    { id: 'compare_states' as ActiveTab, label: 'Compare Recovery States', icon: BarChart3 },
    { id: 'csv_export' as ActiveTab, label: 'CSV Data Export', icon: FileSpreadsheet },
    { id: 'pitch_deck' as ActiveTab, label: 'Pitch Strategy Deck', icon: Presentation },
  ];

  const isSecondaryActive = secondaryTabs.some((t) => t.id === activeTab);

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold shrink-0">
              <Zap className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg text-white tracking-tight">RecoverAI</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Razorpay Buildathon
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Autonomous Revenue Recovery & Smart Dunning Engine
              </p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            {mainTabs.map((tab: any) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMoreMenuOpen(false);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : tab.highlight
                      ? 'text-blue-400 hover:text-white hover:bg-slate-800/80 bg-blue-500/10 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.highlight && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
                  )}
                </button>
              );
            })}

            {/* More Views Dropdown */}
            <div className="relative">
              <button
                id="nav-tab-more-views"
                onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  isSecondaryActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="View additional diagnostics and compliance tools"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Extended Diagnostics
                  </div>
                  {secondaryTabs.map((subTab) => {
                    const SubIcon = subTab.icon;
                    const isSubActive = activeTab === subTab.id;
                    return (
                      <button
                        key={subTab.id}
                        onClick={() => {
                          setActiveTab(subTab.id);
                          setIsMoreMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-slate-800 transition-colors ${
                          isSubActive ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{subTab.label}</span>
                      </button>
                    );
                  })}

                  {onDownloadSessionState && (
                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          onDownloadSessionState();
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-slate-800 text-slate-300 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Download Audit Session State</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Tools: Interactive Tour & Dossier */}
          <div className="flex items-center space-x-2">
            {/* High-Frequency Engine Throughput Visual Meter */}
            <EngineThroughputMeter
              metrics={metrics}
              isSimulating={isSimulating}
              onTriggerBurst={onBatchSimulate}
              onTriggerSpike={onTriggerSpike}
            />

            {/* Low-Confidence Real-Time Alert Pill */}
            {lowConfidenceAlertCount > 0 && (
              <button
                id="btn-hitl-alert-pill"
                onClick={onOpenLowConfidenceReview || onOpenExplainabilityLog}
                className="flex items-center space-x-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer animate-pulse"
                title={`${lowConfidenceAlertCount} low-confidence AI rail decisions require Human-in-the-Loop review`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">HITL Alert:</span>
                <span className="font-mono text-amber-200 font-bold">{lowConfidenceAlertCount} Edge Cases</span>
              </button>
            )}

            {/* AI Explainability Log & CoT Sidebar Trigger */}
            {onOpenExplainabilityLog && (
              <button
                id="btn-open-explainability-sidebar"
                onClick={onOpenExplainabilityLog}
                className="flex items-center space-x-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer hover:scale-102"
                title="Open AI Explainability Log (Raw CoT Reasoning Tokens & Performance Heatmap)"
              >
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Explainability Log</span>
                <span className="text-[10px] font-mono px-1 rounded bg-purple-500/30 text-purple-200">CoT</span>
              </button>
            )}

            {/* Hidden Feature: Deterministic Time-Travel & Merkle Proof Vault */}
            {onOpenTimeTravelReplay && (
              <button
                id="btn-open-time-travel-vault"
                onClick={onOpenTimeTravelReplay}
                className="hidden lg:flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-400/50 shadow-md shadow-indigo-950/40 transition-all cursor-pointer hover:scale-102 animate-pulse"
                title="Open Forensic Deep-Inspection Vault: Deterministic Time-Travel & Merkle Proofs (Shortcut: ⌘K or Ctrl+Shift+R)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Time-Travel Vault</span>
                <span className="text-[9px] font-mono px-1 rounded bg-black/40 text-indigo-200 border border-indigo-300/30">⌘K</span>
              </button>
            )}

            {/* Guided System Tour */}
            {onOpenWalkthrough && (
              <button
                id="btn-system-tour"
                onClick={onOpenWalkthrough}
                className="hidden lg:flex items-center space-x-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-indigo-100 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-500/30 shadow-sm transition-all cursor-pointer hover:scale-102"
                title="Guided Step-by-Step Interactive System Tour"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-200" />
                <span>Interactive Tour</span>
              </button>
            )}

            {/* Executive Dossier */}
            {onOpenSuccessStory && (
              <button
                id="btn-executive-dossier"
                onClick={onOpenSuccessStory}
                className="hidden xl:flex items-center space-x-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer hover:scale-102"
                title="View Razorpay Executive Dossier & Business Impact"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>Executive Dossier</span>
              </button>
            )}

            {/* Quick Simulate Burst */}
            <button
              id="btn-quick-burst"
              onClick={onBatchSimulate}
              disabled={isSimulating}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Simulate a live webhook failure event"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isSimulating ? 'Testing...' : 'Test Failure'}</span>
            </button>

            {/* Data Privacy & PII Compliance Settings Trigger */}
            {onOpenPrivacySettings && (
              <button
                id="btn-nav-privacy-settings"
                onClick={onOpenPrivacySettings}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                  isPiiMaskingEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title={isPiiMaskingEnabled ? 'Data Privacy & Compliance: PII Masking ACTIVE' : 'Open Data Privacy & Compliance Settings'}
              >
                <Shield className={`w-4 h-4 ${isPiiMaskingEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="hidden xl:inline text-[11px]">
                  {isPiiMaskingEnabled ? 'PII Masked' : 'Privacy'}
                </span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              id="btn-toggle-theme"
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Reset Button */}
            <button
              id="btn-reset-demo"
              onClick={onReset}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all cursor-pointer"
              title="Reset test data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Responsive Mobile Tab Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800 text-xs scrollbar-none">
          {mainTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 whitespace-nowrap rounded-lg font-medium ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
