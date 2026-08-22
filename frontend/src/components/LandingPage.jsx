import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Users, 
  AlertTriangle, 
  Flame, 
  RotateCcw, 
  Sliders, 
  Database, 
  Lock, 
  FileText, 
  BarChart3, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Building2, 
  HelpCircle, 
  Send, 
  Star, 
  Award, 
  Terminal, 
  Cpu,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  IndianRupee,
  HeartHandshake,
  Workflow
} from 'lucide-react';

export function LandingPage({ onLaunchApp, onOpenEvent }) {
  // ─── 1. INTERACTIVE CRISIS SANDBOX STATE ───
  // Step 0: Baseline (All good)
  // Step 1: Disruption Injected (Caterer Cancelled)
  // Step 2: AI Negotiating (Scouting 3 backup caterers)
  // Step 3: Rescope Triggered (+12 Guests added mid-negotiation -> 162 total)
  // Step 4: Approved & Executed (Contingency resolved)
  const [sandboxStep, setSandboxStep] = useState(0);
  const [isSandboxSimulating, setIsSandboxSimulating] = useState(false);
  const [selectedVendorOption, setSelectedVendorOption] = useState('opt_spice_route');

  // Auto-play / step helpers
  const handleSimulateDisruption = () => {
    setIsSandboxSimulating(true);
    setTimeout(() => {
      setSandboxStep(1);
      setIsSandboxSimulating(false);
    }, 500);
  };

  const handleStartAgentNegotiation = () => {
    setIsSandboxSimulating(true);
    setTimeout(() => {
      setSandboxStep(2);
      setIsSandboxSimulating(false);
    }, 600);
  };

  const handleInjectSurgeGuests = () => {
    setIsSandboxSimulating(true);
    setTimeout(() => {
      setSandboxStep(3);
      setIsSandboxSimulating(false);
    }, 500);
  };

  const handleApprovePlan = () => {
    setIsSandboxSimulating(true);
    setTimeout(() => {
      setSandboxStep(4);
      setIsSandboxSimulating(false);
    }, 500);
  };

  const handleResetSandbox = () => {
    setSandboxStep(0);
    setIsSandboxSimulating(false);
    setSelectedVendorOption('opt_spice_route');
  };

  // ─── 2. INTERACTIVE FEATURE TOUR TAB STATE ───
  const [activeTourTab, setActiveTourTab] = useState('graph'); // 'graph', 'negotiator', 'rescope', 'client'

  // ─── 3. INTERACTIVE ROI CALCULATOR STATE ───
  const [eventsPerYear, setEventsPerYear] = useState(12);
  const [avgBudget, setAvgBudget] = useState(1800000);
  const [crisesPerEvent, setCrisesPerEvent] = useState(2);

  // Derived ROI calculations
  const hoursSavedPerYear = eventsPerYear * crisesPerEvent * 5.5; // ~5.5 hrs saved per crisis
  const emergencyLossPrevented = Math.round(eventsPerYear * avgBudget * 0.082); // ~8.2% budget leakage prevented
  const estimatedAnnualValue = Math.round(emergencyLossPrevented + (hoursSavedPerYear * 2000)); // ₹2,000/hr planner value

  // ─── 4. FAQ ACCORDION STATE ───
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-canvas-soft text-ink font-sans antialiased selection:bg-primary/15 selection:text-ink">
      
      {/* ─────────────────────────────────────────────────────────────────────────
          HEADER / TOP NAVIGATION (Notion-Calm White Bar with Hairline Border)
      ───────────────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-hairline transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 rounded-lg bg-[#0075de] flex items-center justify-center text-white shadow-micro">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-ink">Relay</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-[#e8f3fc] text-[#0075de] rounded-full">
                    AI Ops 1.0
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Nav Links */}
            <div className="hidden lg:flex items-center gap-7 text-xs font-medium text-ink-secondary">
              <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
              <a href="#interactive-simulator" className="hover:text-primary transition-colors">Live Simulation</a>
              <a href="#architecture" className="hover:text-primary transition-colors">Architecture</a>
              <a href="#roi-calculator" className="hover:text-primary transition-colors">ROI Calculator</a>
              <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
              <a href="#investors" className="hover:text-primary transition-colors">Investor Thesis</a>
              <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenEvent ? onOpenEvent('evt_1') : onLaunchApp()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-ink-secondary bg-white hover:bg-canvas-soft border border-hairline rounded-lg transition-all shadow-micro"
              >
                <Terminal className="w-3.5 h-3.5 text-ink-muted" />
                <span>Priya's Wedding Demo</span>
              </button>

              <button
                onClick={onLaunchApp}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0075de] hover:bg-[#005bab] active:scale-95 rounded-full transition-all shadow-[0_2px_12px_rgba(0,117,222,0.35)]"
              >
                <span>Launch Live App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </nav>


      {/* ─────────────────────────────────────────────────────────────────────────
          HERO SECTION (The Signature Deep Indigo Night Band — per DESIGN.md)
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0c1435] bg-gradient-to-br from-[#080e26] via-[#101945] to-[#182663] text-white py-16 sm:py-24 border-b border-[#213183]">
        
        {/* Glow Spheres & Constellation Mesh */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0075de]/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-[#d6b6f6]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-[#2a9d99]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:24px_24px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Top Glowing Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/20 backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#62aef0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#62aef0]"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                Autonomous AI Operations Agent for Live Events
              </span>
            </div>

            {/* Display Headline (DESIGN.md display-1 tight tracking) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-1.8px] leading-[1.05] text-white">
              When an event vendor cancels, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#62aef0] via-[#ffffff] to-[#d6b6f6]">
                Relay fixes it before you panic.
              </span>
            </h1>

            {/* Subheadline in crystal clear English */}
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-normal">
              Spreadsheets turn red and panic sets in. Relay calculates the exact ripple effect, scouts and negotiates with backup vendors, recalculates headcount costs, and delivers 1-click recovery plans in under 45 seconds.
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={onLaunchApp}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0075de] hover:bg-[#005bab] active:scale-95 text-white text-sm font-bold tracking-wide transition-all shadow-[0_6px_24px_rgba(0,117,222,0.5)] hover:shadow-[0_8px_32px_rgba(0,117,222,0.7)]"
              >
                <span>Launch Live Interactive App</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#interactive-simulator"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.10] hover:bg-white/[0.18] active:scale-95 text-white text-sm font-semibold tracking-wide border border-white/20 backdrop-blur-md transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#62aef0]" />
                <span>Test Drive Sandbox Below</span>
              </a>
            </div>

            {/* Trust & Guarantees Strip */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/70 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                <span>Deterministic Math (0% Hallucinations)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#62aef0]" />
                <span>100% Human Approval Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#ff64c8]" />
                <span>In-Flight Multi-Crisis Rescoping</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          METRICS & MARKET REALITY BANNER
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-hairline py-8 shadow-micro">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="p-3">
              <div className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight font-mono">
                ~₹14,500 Cr
              </div>
              <p className="text-xs text-ink-muted mt-1 font-medium">India organised live-events market (2025)</p>
            </div>

            <div className="p-3 border-l border-hairline">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#e5484d] tracking-tight font-mono">
                73%
              </div>
              <p className="text-xs text-ink-muted mt-1 font-medium">Event budget blowouts caused by late vendor failures</p>
            </div>

            <div className="p-3 border-l border-hairline">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0075de] tracking-tight font-mono">
                &lt; 45s
              </div>
              <p className="text-xs text-ink-muted mt-1 font-medium">Relay recovery time vs 6+ hours of manual phone calls</p>
            </div>

            <div className="p-3 border-l border-hairline">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#1aae39] tracking-tight font-mono">
                100%
              </div>
              <p className="text-xs text-ink-muted mt-1 font-medium">Human-in-the-loop guarantee for all commitments</p>
            </div>

          </div>
        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          INTERACTIVE LIVE CRISIS SANDBOX
          (Direct on-page hands-on simulator that proves the agent's magic)
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="interactive-simulator" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-hairline text-[#0075de] text-xs font-semibold shadow-micro">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Live Simulation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Experience how Relay handles a real crisis in real time.
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Click the buttons below to trigger an emergency vendor cancellation, watch Relay run impact math, negotiate backup quotes, and adapt in flight when extra guests RSVP.
          </p>
        </div>

        {/* Sandbox Simulation Widget */}
        <div className="bg-white rounded-2xl border border-hairline shadow-card overflow-hidden">
          
          {/* Top Bar of Sandbox */}
          <div className="bg-[#111827] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-xs font-mono text-gray-300 font-semibold">
                relay-simulator // event: Priya's Wedding (evt_1)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-mono">
                Status: {sandboxStep === 0 ? 'Normal Baseline' : sandboxStep === 1 ? '⚠️ Disruption Active' : sandboxStep === 2 ? '⚡ AI Scouting' : sandboxStep === 3 ? '🔄 In-Flight Rescoping' : '✓ Resolved & Locked'}
              </span>
              <button
                onClick={handleResetSandbox}
                className="text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-2.5 py-1 rounded-md transition-colors font-mono flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Interactive Steps Control Bar */}
          <div className="bg-canvas-soft border-b border-hairline p-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            
            {/* Step 1 Button: Simulate Disruption */}
            <button
              onClick={handleSimulateDisruption}
              disabled={sandboxStep !== 0 || isSandboxSimulating}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-micro ${
                sandboxStep === 0
                  ? 'bg-[#e5484d] text-white hover:bg-red-700 active:scale-95 cursor-pointer ring-2 ring-red-400/40 animate-pulse'
                  : 'bg-white text-ink-muted border border-hairline opacity-60 cursor-not-allowed'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>1. Simulate Caterer Cancellation</span>
            </button>

            <span className="text-ink-faint text-xs font-bold">→</span>

            {/* Step 2 Button: Run AI Solver */}
            <button
              onClick={handleStartAgentNegotiation}
              disabled={sandboxStep !== 1 || isSandboxSimulating}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-micro ${
                sandboxStep === 1
                  ? 'bg-[#0075de] text-white hover:bg-[#005bab] active:scale-95 cursor-pointer ring-2 ring-blue-400/40 animate-pulse'
                  : 'bg-white text-ink-muted border border-hairline opacity-60 cursor-not-allowed'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>2. Trigger AI Autonomous Recovery</span>
            </button>

            <span className="text-ink-faint text-xs font-bold">→</span>

            {/* Step 3 Button: Add +12 Guests */}
            <button
              onClick={handleInjectSurgeGuests}
              disabled={sandboxStep !== 2 || isSandboxSimulating}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-micro ${
                sandboxStep === 2
                  ? 'bg-[#dd5b00] text-white hover:bg-orange-700 active:scale-95 cursor-pointer ring-2 ring-orange-400/40 animate-pulse'
                  : 'bg-white text-ink-muted border border-hairline opacity-60 cursor-not-allowed'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>3. Inject +12 RSVP Guests (Rescope)</span>
            </button>

            <span className="text-ink-faint text-xs font-bold">→</span>

            {/* Step 4 Button: Approve Plan */}
            <button
              onClick={handleApprovePlan}
              disabled={sandboxStep !== 3 || isSandboxSimulating}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-micro ${
                sandboxStep === 3
                  ? 'bg-[#1aae39] text-white hover:bg-green-700 active:scale-95 cursor-pointer ring-2 ring-green-400/40 animate-pulse'
                  : 'bg-white text-ink-muted border border-hairline opacity-60 cursor-not-allowed'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>4. Approve & Execute</span>
            </button>

          </div>

          {/* Sandbox Live Viewport */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Event Live HUD (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-hairline">
                <h3 className="font-bold text-sm text-gray-900">Live Event Health HUD</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  sandboxStep === 0 || sandboxStep === 4 
                    ? 'bg-[#edf9f0] text-[#1aae39] border border-green-200' 
                    : 'bg-[#fdf2f2] text-[#e5484d] border border-red-200 animate-pulse'
                }`}>
                  {sandboxStep === 0 || sandboxStep === 4 ? 'Status: On Track' : 'Status: Critical Disruption'}
                </span>
              </div>

              {/* Stat Boxes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-canvas-soft rounded-xl border border-hairline">
                  <div className="text-[11px] text-gray-500 font-medium">Guest Headcount</div>
                  <div className="text-xl font-bold font-mono text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <span>{sandboxStep >= 3 ? '162 Guests' : '150 Guests'}</span>
                    {sandboxStep >= 3 && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.2 rounded-full">
                        +12 RSVPs
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-canvas-soft rounded-xl border border-hairline">
                  <div className="text-[11px] text-gray-500 font-medium">Total Budget</div>
                  <div className="text-xl font-bold font-mono text-gray-900 mt-0.5">
                    ₹18,00,000
                  </div>
                </div>

                <div className="p-3.5 bg-canvas-soft rounded-xl border border-hairline">
                  <div className="text-[11px] text-gray-500 font-medium">Spent / Committed</div>
                  <div className="text-xl font-bold font-mono text-gray-900 mt-0.5">
                    {sandboxStep === 0 ? '₹17,60,000' : sandboxStep === 1 ? '₹8,60,000 (Caterer lost)' : sandboxStep >= 2 && sandboxStep < 4 ? '₹18,55,000 (Est.)' : '₹17,95,000'}
                  </div>
                </div>

                <div className="p-3.5 bg-canvas-soft rounded-xl border border-hairline">
                  <div className="text-[11px] text-gray-500 font-medium">Budget Buffer</div>
                  <div className={`text-xl font-bold font-mono mt-0.5 ${
                    sandboxStep === 3 ? 'text-amber-600' : 'text-[#1aae39]'
                  }`}>
                    {sandboxStep === 0 ? '+₹40,000' : sandboxStep === 1 ? '+₹9,40,000' : sandboxStep === 3 ? '-₹55,000' : '+₹5,000'}
                  </div>
                </div>
              </div>

              {/* Active Disruption Banner */}
              {sandboxStep >= 1 && sandboxStep < 4 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Active Disruption: Saffron Table Catering Cancelled</span>
                  </div>
                  <p className="text-[11px] text-red-700 leading-relaxed pl-6">
                    Deterministic graph flagged 150 meals missing 4 days before event date. Automated recovery required.
                  </p>
                </div>
              )}

              {sandboxStep === 4 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-green-800">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Recovery Executed & Locked</span>
                  </div>
                  <p className="text-[11px] text-green-700 leading-relaxed pl-6">
                    Spice Route Catering assigned for 162 guests at ₹11,55,000. Event budget preserved within safe envelope.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: AI Live Reasoning Stream & Option Matrix (7 cols) */}
            <div className="lg:col-span-7 bg-[#0c1435] text-white rounded-xl p-5 border border-[#213183] space-y-4 font-mono text-xs shadow-inner">
              
              {/* Telemetry Stream Header */}
              <div className="flex items-center justify-between border-b border-gray-700/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0075de] animate-ping"></div>
                  <span className="font-bold text-white tracking-wider uppercase text-[11px]">
                    Autonomous Reasoning Engine
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">Pydantic Schema Verified</span>
              </div>

              {/* Dynamic Console Output according to sandboxStep */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {sandboxStep === 0 && (
                  <div className="text-gray-400 font-sans space-y-1.5 py-4 text-center">
                    <p className="text-xs">Event operations nominal. 6 vendors confirmed.</p>
                    <p className="text-[11px] text-gray-500">
                      Click <strong className="text-white">"1. Simulate Caterer Cancellation"</strong> above to test the agent.
                    </p>
                  </div>
                )}

                {sandboxStep >= 1 && (
                  <div className="space-y-1 text-[11px]">
                    <div className="text-rose-400">[00:01] ⚡ EVENT DISRUPTION: Vendor ven_catering_1 status changed to CANCELLED.</div>
                    <div className="text-blue-300">[00:02] 📊 DETERMINISTIC ENGINE: Running BFS impact analysis across dependency graph...</div>
                    <div className="text-gray-300">[00:03] ↳ Affected: guest_meals (150), dinner_schedule (19:30), budget_spent (-₹9,00,000).</div>
                  </div>
                )}

                {sandboxStep >= 2 && (
                  <div className="space-y-1 text-[11px]">
                    <div className="text-purple-300">[00:05] 🤖 AI AGENT: Scouting central vendor repository for Category: CATERING...</div>
                    <div className="text-gray-300">[00:06] ↳ 3 candidate backup vendors discovered with reliability scores &gt; 92%.</div>
                    <div className="text-blue-300">[00:08] ⚡ Parallel quote negotiation initiated for 150 guests.</div>
                  </div>
                )}

                {sandboxStep >= 3 && (
                  <div className="space-y-1 text-[11px] bg-orange-950/40 p-2 rounded border border-orange-700/50">
                    <div className="text-amber-400 font-bold">[00:11] ⚠️ SURGE IN-FLIGHT RESCOPE: +12 Guests RSVP confirmed (150 → 162).</div>
                    <div className="text-amber-200">[00:12] ↳ Updating active negotiation parameters in flight without restarting solver.</div>
                    <div className="text-gray-300">[00:14] ↳ Recalculated unit meal rates for 162 heads across all 3 proposals.</div>
                  </div>
                )}

                {sandboxStep >= 4 && (
                  <div className="text-emerald-400 font-bold text-[11px]">
                    [00:18] ✓ HUMAN APPROVAL RECEIVED: Executed contract replacement. Ledger updated in MongoDB.
                  </div>
                )}
              </div>

              {/* Recovery Options Cards (Steps 2, 3, 4) — High-contrast dark glassmorphic cards */}
              {sandboxStep >= 2 && (
                <div className="pt-3 border-t border-gray-700/60 font-sans space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
                    <span>{sandboxStep >= 3 ? 'Rescoped Recovery Plan (162 Guests)' : 'Generated Recovery Plan (150 Guests)'}</span>
                    <span className="text-[10px] text-gray-400 font-normal">Click a plan to select</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    
                    {/* Option A: Recommended */}
                    <div 
                      onClick={() => setSelectedVendorOption('opt_spice_route')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        selectedVendorOption === 'opt_spice_route'
                          ? 'bg-gradient-to-b from-[#0075de]/30 to-[#005bab]/20 border-[#0075de] ring-2 ring-[#0075de]/50 shadow-[0_0_16px_rgba(0,117,222,0.4)]'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-[#62aef0] uppercase tracking-wide">Recommended</span>
                        <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">98% Match</span>
                      </div>
                      <div className="font-bold text-sm text-white">Spice Route</div>
                      <div className="text-sm font-mono font-extrabold text-emerald-400 mt-1">
                        {sandboxStep >= 3 ? '₹11,55,000' : '₹10,70,000'}
                      </div>
                      <div className="text-[11px] text-gray-300 mt-1 leading-snug">Balanced menu · 4hr prep</div>
                    </div>

                    {/* Option B: Premium */}
                    <div 
                      onClick={() => setSelectedVendorOption('opt_royal_feast')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        selectedVendorOption === 'opt_royal_feast'
                          ? 'bg-gradient-to-b from-[#d6b6f6]/25 to-[#391c57]/30 border-[#d6b6f6] ring-2 ring-[#d6b6f6]/50 shadow-[0_0_16px_rgba(214,182,246,0.3)]'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-[#d6b6f6] uppercase tracking-wide">Premium</span>
                        <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/30">94% Match</span>
                      </div>
                      <div className="font-bold text-sm text-white">Royal Feast</div>
                      <div className="text-sm font-mono font-extrabold text-purple-300 mt-1">
                        {sandboxStep >= 3 ? '₹12,40,000' : '₹11,50,000'}
                      </div>
                      <div className="text-[11px] text-gray-300 mt-1 leading-snug">Luxury 5-course · Buffer test</div>
                    </div>

                    {/* Option C: Budget / Fast */}
                    <div 
                      onClick={() => setSelectedVendorOption('opt_grand_harvest')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        selectedVendorOption === 'opt_grand_harvest'
                          ? 'bg-gradient-to-b from-[#dd5b00]/25 to-[#793400]/30 border-[#dd5b00] ring-2 ring-[#dd5b00]/50 shadow-[0_0_16px_rgba(221,91,0,0.3)]'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-[#fb923c] uppercase tracking-wide">Budget</span>
                        <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">89% Match</span>
                      </div>
                      <div className="font-bold text-sm text-white">Grand Harvest</div>
                      <div className="text-sm font-mono font-extrabold text-amber-300 mt-1">
                        {sandboxStep >= 3 ? '₹10,20,000' : '₹9,45,000'}
                      </div>
                      <div className="text-[11px] text-gray-300 mt-1 leading-snug">Standard buffet · Max savings</div>
                    </div>

                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          THE PROBLEM VS THE RELAY BREAKTHROUGH (Side by Side Comparison)
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas-soft border border-hairline text-ink-muted text-xs font-semibold">
              <Workflow className="w-3.5 h-3.5 text-primary" />
              <span>The Industry Paradigm Shift</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Why traditional event tools fail when crisis strikes.
            </h2>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Every existing software in this ~₹14,500 Crore market is a passive database. Relay is an active operational intelligence system.
            </p>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* The Old Way */}
            <div className="bg-canvas-soft p-8 rounded-2xl border border-hairline space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-[#e5484d] flex items-center justify-center font-bold">
                  ✕
                </div>
                <div>
                  <h3 className="font-bold text-lg text-ink">The Old Way: Passive Chaos</h3>
                  <p className="text-xs text-ink-muted">Spreadsheets, WhatsApp panic, and frantic phone calls</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-ink-secondary">
                <div className="flex items-start gap-3">
                  <span className="text-[#e5484d] font-bold text-sm shrink-0">✕</span>
                  <p><strong>Spreadsheets just turn red:</strong> When a key vendor cancels 3 days out, your tracker doesn't fix anything—it just shows an error.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#e5484d] font-bold text-sm shrink-0">✕</span>
                  <p><strong>4 to 8 hours of panic calling:</strong> Planners waste half a day calling 20 backup contacts, checking availability, and begging for last-minute quotes.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#e5484d] font-bold text-sm shrink-0">✕</span>
                  <p><strong>Mental math & budget leakage:</strong> Rushed calculations cause budget blowouts, duplicate payments, and overlooked dietary restrictions.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#e5484d] font-bold text-sm shrink-0">✕</span>
                  <p><strong>Restart from zero on new changes:</strong> If 15 more guests RSVP while you're scrambling, you have to scrap your calculations and start over.</p>
                </div>
              </div>
            </div>

            {/* The Relay Way */}
            <div className="bg-white p-8 rounded-2xl border-2 border-primary/40 shadow-elevated space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                Relay Breakthrough
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0075de] flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-lg text-ink">The Relay Way: Autonomous Control</h3>
                  <p className="text-xs text-ink-muted">Deterministic graphs, agentic negotiation & 1-click execution</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-ink-secondary">
                <div className="flex items-start gap-3">
                  <span className="text-[#1aae39] font-bold text-sm shrink-0">✓</span>
                  <p><strong>Instant Graph Impact Analysis:</strong> Dependency engine calculates the exact ripple across headcount, catering, schedule, and funds in milliseconds.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#1aae39] font-bold text-sm shrink-0">✓</span>
                  <p><strong>Parallel AI Negotiation:</strong> Relay scouts verified backup vendors, matches lead times, and ranks solutions by cost, speed, and reliability score.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#1aae39] font-bold text-sm shrink-0">✓</span>
                  <p><strong>Dynamic In-Flight Rescoping:</strong> If guest numbers spike mid-crisis, Relay dynamically adjusts the active negotiation without restarting.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#1aae39] font-bold text-sm shrink-0">✓</span>
                  <p><strong>100% Human Approval Gate:</strong> Zero money moves and no vendor contracts bind without the organizer's explicit 1-click sign-off.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          THE 4 ARCHITECTURAL PILLARS (The Technical Moat)
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="architecture" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-hairline text-[#0075de] text-xs font-semibold shadow-micro">
            <Cpu className="w-3.5 h-3.5" />
            <span>Under The Hood</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Built on a 4-Pillar Autonomous Architecture.
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            We don't just wrap an LLM prompt. We combine deterministic mathematical graph engines with agentic negotiation and atomic execution layers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1: Deterministic Math */}
          <div className="bg-white p-6 rounded-2xl border border-hairline shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#eef6fd] text-[#0075de] flex items-center justify-center">
                <Workflow className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0075de]">Pillar 1</span>
                <h3 className="font-bold text-base text-ink">Deterministic Constraint Engine</h3>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                A directed dependency graph (BFS) tracks relationships between guest counts, meal allocations, dietary rules, and budgets. Pure mathematical logic with 0% AI hallucination.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-hairline text-[11px] text-ink-secondary font-mono">
              guest_count → meals → costs → budget_buffer
            </div>
          </div>

          {/* Pillar 2: AI Planner */}
          <div className="bg-white p-6 rounded-2xl border border-hairline shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#f8f2fe] text-[#391c57] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Pillar 2</span>
                <h3 className="font-bold text-base text-ink">Autonomous Negotiation Agent</h3>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Structured LLM reasoning with Pydantic schemas. Evaluates vendor reliability scores, kitchen lead times, dietary compatibility, and negotiated unit rates.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-hairline text-[11px] text-ink-secondary font-mono">
              Pydantic Strict Schemas + OpenAI Reasoning
            </div>
          </div>

          {/* Pillar 3: Dynamic In-Flight Rescoping */}
          <div className="bg-white p-6 rounded-2xl border border-hairline shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#fef3eb] text-[#dd5b00] flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#dd5b00]">Pillar 3</span>
                <h3 className="font-bold text-base text-ink">Dynamic In-Flight Rescoping</h3>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Our proprietary moat: If real-world variables change while a recovery is in progress (e.g. +12 guests RSVP), Relay rescopes ongoing negotiations without starting over.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-hairline text-[11px] text-ink-secondary font-mono">
              Live State Mutation in Flight
            </div>
          </div>

          {/* Pillar 4: Safe Execution */}
          <div className="bg-white p-6 rounded-2xl border border-hairline shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#edf9f0] text-[#1aae39] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1aae39]">Pillar 4</span>
                <h3 className="font-bold text-base text-ink">Safe Execution & Audit Ledger</h3>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Strict human approval gates. Only predefined, whitelisted actions can be executed. Every recovery decision is logged immutably in the decision audit trail.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-hairline text-[11px] text-ink-secondary font-mono">
              Atomic MongoDB Commits + Audit Trail
            </div>
          </div>

        </div>

      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          INTERACTIVE FEATURE TOUR (Tabbed Product Deep-Dive)
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas-soft border border-hairline text-ink-muted text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Full Product Suite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Everything high-volume event teams need to stay bulletproof.
            </h2>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Explore the core modules of the Relay platform. Click each tab below to see how each tool solves critical event operations.
            </p>
          </div>

          {/* Tab Selection Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveTourTab('graph')}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-2 cursor-pointer ${
                activeTourTab === 'graph'
                  ? 'bg-ink text-white shadow-micro'
                  : 'bg-canvas-soft text-ink-muted hover:text-ink'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>1. Live Operations HUD & Graph</span>
            </button>

            <button
              onClick={() => setActiveTourTab('negotiator')}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-2 cursor-pointer ${
                activeTourTab === 'negotiator'
                  ? 'bg-ink text-white shadow-micro'
                  : 'bg-canvas-soft text-ink-muted hover:text-ink'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>2. Real-Time Telemetry Feed</span>
            </button>

            <button
              onClick={() => setActiveTourTab('rescope')}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-2 cursor-pointer ${
                activeTourTab === 'rescope'
                  ? 'bg-ink text-white shadow-micro'
                  : 'bg-canvas-soft text-ink-muted hover:text-ink'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>3. Central Vendor Repository</span>
            </button>

            <button
              onClick={() => setActiveTourTab('client')}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-2 cursor-pointer ${
                activeTourTab === 'client'
                  ? 'bg-ink text-white shadow-micro'
                  : 'bg-canvas-soft text-ink-muted hover:text-ink'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>4. Branded Client Status Portal</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="bg-canvas-soft rounded-2xl border border-hairline p-6 sm:p-10 max-w-5xl mx-auto shadow-card">
            
            {activeTourTab === 'graph' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0075de] bg-blue-100 px-2.5 py-1 rounded-full">
                    Module 01
                  </span>
                  <h3 className="text-2xl font-bold text-ink">Unified Event Risk & KPI Command Center</h3>
                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                    Instantly monitor budget utilization, headcount changes, pending disruptions, and vendor contract health across one single, high-fidelity command console.
                  </p>
                  <ul className="space-y-2 text-xs text-ink-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                      <span>Live calculation of remaining budget buffers and safe spending ceilings.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                      <span>Real-time guest RSVP counter with animated visual change alerts.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                      <span>Direct 1-click disruption reporting modal for field coordinators.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-xl border border-hairline shadow-micro space-y-3 font-sans">
                  <div className="flex justify-between items-center pb-2 border-b border-hairline">
                    <span className="font-bold text-xs text-gray-900">Priya's Wedding — Command State</span>
                    <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">All Systems Nominal</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-canvas-soft rounded-lg">
                      <div className="text-[10px] text-ink-muted">Confirmed RSVPs</div>
                      <div className="font-bold font-mono text-sm text-gray-900">150 Guests</div>
                    </div>
                    <div className="p-2.5 bg-canvas-soft rounded-lg">
                      <div className="text-[10px] text-ink-muted">Budget Utilization</div>
                      <div className="font-bold font-mono text-sm text-gray-900">97.8% (₹17,600 / ₹18,000)</div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-lg text-xs text-blue-900 border border-blue-100">
                    <span className="font-bold">Active Dependencies:</span> 6 Vendors Confirmed · Catering, Venue, Photography, DJ, Decor, Florist all synchronized.
                  </div>
                </div>
              </div>
            )}

            {activeTourTab === 'negotiator' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
                    Module 02
                  </span>
                  <h3 className="text-2xl font-bold text-ink">WebSocket Telemetry & Transparent Agent Trace</h3>
                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                    Never wonder what an AI is thinking. Relay streams every deterministic calculation, tool call, and supplier quotation reasoning step in real time via FastAPI WebSockets.
                  </p>
                  <ul className="space-y-2 text-xs text-ink-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                      <span>Full visibility into trade-off matrix: Cost vs Speed vs Quality.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                      <span>Pydantic schema validation ensures structured, parseable decision objects.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                      <span>Role-based approvals: Planners propose, Approvers execute.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#0c1435] text-white p-5 rounded-xl border border-[#213183] font-mono text-xs space-y-2">
                  <div className="text-[10px] text-gray-400 border-b border-gray-700 pb-1.5 flex justify-between">
                    <span>ws://localhost:8000/ws/evt_1</span>
                    <span className="text-green-400 font-bold">CONNECTED</span>
                  </div>
                  <div className="text-blue-300 text-[11px]">[agent.thought] Disruption impact verified. Finding replacement caterers...</div>
                  <div className="text-purple-300 text-[11px]">[agent.tool_call] vendor_repository.query(category='catering', min_rating=0.90)</div>
                  <div className="text-gray-300 text-[11px]">[agent.response] 3 vetted options ranked with cost projections.</div>
                  <div className="text-emerald-400 font-bold text-[11px]">[agent.recommendation] Recommendation matrix ready for human review.</div>
                </div>
              </div>
            )}

            {activeTourTab === 'rescope' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
                    Module 03
                  </span>
                  <h3 className="text-2xl font-bold text-ink">Central Vendor Repository & Reliability Scores</h3>
                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                    Maintain a centralized, reusable database of trusted vendors across all events. Relay scores suppliers on quote accuracy, lead times, and fulfillment success.
                  </p>
                  <ul className="space-y-2 text-xs text-ink-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                      <span>Pool vendors across entire event portfolios (weddings, galas, summits).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                      <span>1-click vendor assignment directly into active event budgets.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                      <span>Historical reliability scorecards prevent repeat bad hires.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-xl border border-hairline shadow-micro space-y-2 text-xs">
                  <div className="font-bold text-xs pb-1.5 border-b border-hairline flex justify-between text-gray-900">
                    <span>Global Vendor Roster</span>
                    <span className="text-[10px] text-ink-muted">14 Available in Mumbai / Pune</span>
                  </div>
                  <div className="p-2.5 bg-canvas-soft rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900">Spice Route Catering</div>
                      <div className="text-[10px] text-ink-muted">Base Quote: ₹10,000 · 4.9 ★ Rating</div>
                    </div>
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">98% Reliability</span>
                  </div>
                  <div className="p-2.5 bg-canvas-soft rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900">Royal Feast Banquet</div>
                      <div className="text-[10px] text-ink-muted">Base Quote: ₹11,000 · 4.8 ★ Rating</div>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">94% Reliability</span>
                  </div>
                </div>
              </div>
            )}

            {activeTourTab === 'client' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                    Module 04
                  </span>
                  <h3 className="text-2xl font-bold text-ink">Branded Client Status Portal (Peace of Mind)</h3>
                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                    Share a calming, read-only live portal with VIP clients and couples. They see that everything is handled seamlessly without being exposed to backend crisis chaos.
                  </p>
                  <ul className="space-y-2 text-xs text-ink-secondary">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                      <span>Reduces anxious client text messages and late-night panic calls by 85%.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                      <span>Customizable branding with agency logo and personalized welcome notes.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1aae39]" />
                      <span>Milestone progress bars show exact completion status of all run-of-show items.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-xl border border-hairline shadow-micro space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-hairline">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-primary text-white text-[10px] flex items-center justify-center font-bold">R</div>
                      <span className="font-bold text-xs text-gray-900">Priya & Rohan's Wedding Portal</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Client View</span>
                  </div>
                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg text-xs text-emerald-900">
                    <p className="font-semibold">✨ "Your wedding preparations are on track!"</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">All 6 core service teams are fully coordinated and confirmed for your big day.</p>
                  </div>
                  <div className="space-y-1.5 text-xs text-ink-secondary">
                    <div className="flex justify-between text-[11px]">
                      <span>Operations Progress</span>
                      <span className="font-bold text-gray-900">100% Prepared</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#1aae39] h-full w-full rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          WHO IS RELAY BUILT FOR? (Target Personas & Use Cases)
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-hairline text-ink-muted text-xs font-semibold shadow-micro">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>Target Personas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Engineered for high-stakes event professionals.
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Whether you run a boutique luxury wedding agency or coordinate global tech conferences, Relay protects your reputation and bottom line.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Persona 1 */}
          <div className="bg-white p-6 rounded-2xl border border-hairline shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">Luxury Planners</span>
              <h3 className="font-bold text-base text-ink mt-0.5">High-End Wedding Coordinators</h3>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              When a florist or caterer flakes 48 hours before a ₹5,000,000 wedding, you can't afford a single mistake. Relay delivers instant backup options that match your design standards.
            </p>
          </div>

          {/* Persona 2 */}
          <div className="bg-white p-6 rounded-2xl border border-hairline shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0075de] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#0075de] uppercase tracking-wider">Corporate & Tech</span>
              <h3 className="font-bold text-base text-ink mt-0.5">Conference & Summit Directors</h3>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Manage multi-track corporate summits with 1,000+ attendees. When keynote AV hardware fails or speaker rosters shift, Relay instantly recalibrates the production run-of-show.
            </p>
          </div>

          {/* Persona 3 */}
          <div className="bg-white p-6 rounded-2xl border border-hairline shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Hospitality & Venues</span>
              <h3 className="font-bold text-base text-ink mt-0.5">Banquet & Venue Directors</h3>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Coordinate 30+ concurrent weekend banquets across multiple ballrooms. Pool backup vendors into a shared contingency network that automatically fills gaps.
            </p>
          </div>

          {/* Persona 4 */}
          <div className="bg-white p-6 rounded-2xl border border-hairline shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Agencies & Festivals</span>
              <h3 className="font-bold text-base text-ink mt-0.5">Experiential Production Agencies</h3>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Manage complex brand activations, multi-stage festivals, and pop-ups with rapid contingency response for staging, power generators, security, and VIP hospitality.
            </p>
          </div>

        </div>

      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          DYNAMIC ROI & TIME SAVINGS CALCULATOR
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="roi-calculator" className="py-16 sm:py-24 bg-white border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas-soft border border-hairline text-ink-muted text-xs font-semibold">
              <IndianRupee className="w-3.5 h-3.5 text-primary" />
              <span>Interactive Business Value</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Calculate your agency's return on investment.
            </h2>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Adjust the sliders to see how much time, stress, and emergency markup budget Relay saves your organization annually.
            </p>
          </div>

          <div className="bg-canvas-soft rounded-2xl border border-hairline p-6 sm:p-10 max-w-4xl mx-auto shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Sliders (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Slider 1: Events per year */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-900">Events Managed Per Year:</span>
                  <span className="font-mono text-primary text-sm font-extrabold">{eventsPerYear} Events</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  value={eventsPerYear}
                  onChange={(e) => setEventsPerYear(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0075de]"
                />
                <div className="flex justify-between text-[10px] text-ink-muted">
                  <span>2 boutique events</span>
                  <span>30 agency events</span>
                  <span>60+ enterprise</span>
                </div>
              </div>

              {/* Slider 2: Average Budget */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-900">Average Event Budget (₹):</span>
                  <span className="font-mono text-primary text-sm font-extrabold">₹{avgBudget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="10000000"
                  step="250000"
                  value={avgBudget}
                  onChange={(e) => setAvgBudget(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0075de]"
                />
                <div className="flex justify-between text-[10px] text-ink-muted">
                  <span>₹5,00,000 (Small/Boutique)</span>
                  <span>₹25,00,000 (Medium/Grand)</span>
                  <span>₹1,00,00,000+ (High-End Mega)</span>
                </div>
              </div>

              {/* Slider 3: Crises per Event */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-900">Average Vendor / Scope Surprises Per Event:</span>
                  <span className="font-mono text-primary text-sm font-extrabold">{crisesPerEvent} Surprises</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={crisesPerEvent}
                  onChange={(e) => setCrisesPerEvent(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0075de]"
                />
                <div className="flex justify-between text-[10px] text-ink-muted">
                  <span>1 minor hiccup</span>
                  <span>3 typical disruptions</span>
                  <span>6 high-friction events</span>
                </div>
              </div>

            </div>

            {/* Calculated Output Card (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-hairline shadow-micro space-y-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0075de] bg-[#e8f3fc] px-2.5 py-1 rounded-full">
                Estimated Annual Impact
              </span>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-ink font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0075de] to-[#213183]">
                  ₹{estimatedAnnualValue.toLocaleString()}
                </div>
                <p className="text-xs text-ink-muted font-medium">Total Annual Value & Budget Protected</p>
              </div>

              <div className="pt-4 border-t border-hairline space-y-2 text-left text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Crisis Hours Saved:</span>
                  <span className="font-bold font-mono text-gray-900">{Math.round(hoursSavedPerYear)} Hours / Year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Emergency Markup Prevented:</span>
                  <span className="font-bold font-mono text-[#1aae39]">₹{emergencyLossPrevented.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Estimated Net ROI:</span>
                  <span className="font-bold font-mono text-primary">8.6x Investment</span>
                </div>
              </div>

              <button
                onClick={onLaunchApp}
                className="w-full py-2.5 rounded-full bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-bold transition-all shadow-micro mt-2 cursor-pointer"
              >
                Claim Your Efficiency Gains
              </button>
            </div>

          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          INVESTOR THESIS & YC PITCH DECK SUMMARY
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="investors" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-[#0c1435] bg-gradient-to-br from-[#080e26] via-[#101945] to-[#182663] text-white rounded-3xl p-8 sm:p-12 border border-[#213183] shadow-elevated relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0075de]/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-xs font-bold uppercase tracking-wider text-[#62aef0]">
                <Award className="w-3.5 h-3.5" />
                <span>Investor & Venture Thesis</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Why Relay will become a generational company.
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl mx-auto">
                We are building the autonomous operations network for India's ~₹14,500 Crore organised live-events market.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              <div className="p-5 bg-white/[0.06] border border-white/10 rounded-2xl backdrop-blur-md space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#62aef0]">1. Greenfield Market</span>
                <h3 className="font-bold text-base text-white">No Autonomous Incumbent</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Existing tools (HoneyBook, Planning Pod, Airtable) are passive databases. Zero competitors offer deterministic constraint math paired with autonomous in-flight vendor negotiation.
                </p>
              </div>

              <div className="p-5 bg-white/[0.06] border border-white/10 rounded-2xl backdrop-blur-md space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d6b6f6]">2. Double-Engine Moat</span>
                <h3 className="font-bold text-base text-white">Deterministic Math + LLM</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  AI hallucinations are fatal in event operations. Our separation between deterministic constraint checking (Python) and structured reasoning (Pydantic/OpenAI) delivers 100% mathematical safety.
                </p>
              </div>

              <div className="p-5 bg-white/[0.06] border border-white/10 rounded-2xl backdrop-blur-md space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff64c8]">3. Marketplace Take-Rate</span>
                <h3 className="font-bold text-base text-white">SaaS + Commerce Network</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  We capture predictable monthly software subscription revenue (₹11,999–₹39,999/mo) plus a 1.5% to 3.0% transaction fee on all automated emergency vendor contract fulfillment.
                </p>
              </div>

            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onLaunchApp}
                className="px-6 py-3 rounded-full bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(0,117,222,0.4)] cursor-pointer"
              >
                Inspect Live Codebase & Architecture
              </button>
              <a
                href="mailto:founders@relayops.ai"
                className="px-6 py-3 rounded-full bg-white/[0.10] hover:bg-white/[0.18] text-white text-xs font-bold uppercase tracking-wider border border-white/20 transition-all"
              >
                Contact Founder / Pitch Desk
              </a>
            </div>

          </div>

        </div>

      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          TRANSPARENT, SCALABLE PRICING TIERS (Per DESIGN.md Specs)
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-16 sm:py-24 bg-white border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas-soft border border-hairline text-ink-muted text-xs font-semibold">
              <IndianRupee className="w-3.5 h-3.5 text-primary" />
              <span>Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Simple, predictable plans for every stage of growth.
            </h2>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Start with our free developer and hackathon tier. Upgrade as your agency expands its portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
            
            {/* Plan 1: Starter / Pilot */}
            <div className="bg-canvas-soft p-6 sm:p-8 rounded-2xl border border-hairline flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted bg-white px-2 py-0.5 rounded-full border border-hairline">
                  Developer & Pilot
                </span>
                <div>
                  <h3 className="font-bold text-lg text-ink">Free Pilot</h3>
                  <p className="text-xs text-ink-muted mt-1">Test the deterministic engine and simulation sandbox.</p>
                </div>
                <div className="text-3xl font-extrabold text-ink font-mono">
                  ₹0 <span className="text-xs text-ink-muted font-sans font-normal">/ forever</span>
                </div>
                <ul className="space-y-2.5 text-xs text-ink-secondary pt-2 border-t border-hairline">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1aae39]" />
                    <span>1 Active Event Workspace</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1aae39]" />
                    <span>Deterministic Constraint Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1aae39]" />
                    <span>Simulation Crisis Sandbox</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1aae39]" />
                    <span>Up to 6 Confirmed Vendors</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onLaunchApp}
                className="w-full py-2.5 rounded-full bg-white hover:bg-stone-50 border border-hairline text-ink text-xs font-bold transition-all shadow-micro cursor-pointer"
              >
                Launch Free Sandbox
              </button>
            </div>

            {/* Plan 2: Professional */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-hairline shadow-card flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0075de] bg-[#e8f3fc] px-2 py-0.5 rounded-full">
                  Boutique Planners
                </span>
                <div>
                  <h3 className="font-bold text-lg text-ink">Professional</h3>
                  <p className="text-xs text-ink-muted mt-1">For independent coordinators managing high-end weddings.</p>
                </div>
                <div className="text-3xl font-extrabold text-ink font-mono">
                  ₹11,999 <span className="text-xs text-ink-muted font-sans font-normal">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-ink-secondary pt-2 border-t border-hairline">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1aae39]" />
                    <span>Up to 5 Concurrent Events</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1aae39]" />
                    <span>AI Autonomous Recovery Planner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1aae39]" />
                    <span>Real-Time WebSocket Telemetry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1aae39]" />
                    <span>Global Vendor Repository</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onLaunchApp}
                className="w-full py-2.5 rounded-full bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-bold transition-all shadow-micro cursor-pointer"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Plan 3: Featured Agency (Polarity Flipped Dark Card per DESIGN.md ex-pricing-tier-featured) */}
            <div className="bg-[#111827] text-white p-6 sm:p-8 rounded-2xl shadow-elevated flex flex-col justify-between space-y-6 relative overflow-hidden border border-gray-800">
              <div className="absolute top-0 right-0 bg-[#0075de] text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#62aef0] bg-white/10 px-2 py-0.5 rounded-full">
                  High-Volume Agencies
                </span>
                <div>
                  <h3 className="font-bold text-lg text-white">Agency Scale</h3>
                  <p className="text-xs text-gray-400 mt-1">For multi-planner production companies & venues.</p>
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">
                  ₹39,999 <span className="text-xs text-gray-400 font-sans font-normal">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-300 pt-2 border-t border-gray-800">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#62aef0]" />
                    <span>Unlimited Concurrent Events</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#62aef0]" />
                    <span>In-Flight Multi-Crisis Rescoping</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#62aef0]" />
                    <span>Branded VIP Client Status Portal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#62aef0]" />
                    <span>Role-Based Multi-User Approvals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#62aef0]" />
                    <span>Priority GPU Inference Speeds</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onLaunchApp}
                className="w-full py-2.5 rounded-full bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-bold transition-all shadow-[0_4px_14px_rgba(0,117,222,0.4)] cursor-pointer"
              >
                Upgrade to Agency Scale
              </button>
            </div>

            {/* Plan 4: Enterprise */}
            <div className="bg-canvas-soft p-6 sm:p-8 rounded-2xl border border-hairline flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted bg-white px-2 py-0.5 rounded-full border border-hairline">
                  Hospitality Chains
                </span>
                <div>
                  <h3 className="font-bold text-lg text-ink">Enterprise</h3>
                  <p className="text-xs text-ink-muted mt-1">For national venue networks and festival conglomerates.</p>
                </div>
                <div className="text-3xl font-extrabold text-ink font-mono">
                  Custom
                </div>
                <ul className="space-y-2.5 text-xs text-ink-secondary pt-2 border-t border-hairline">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1aae39]" />
                    <span>Custom Dedicated Multi-Tenant Cluster</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1aae39]" />
                    <span>Direct ERP & Vendor API Integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1aae39]" />
                    <span>99.99% Uptime SLA & Dedicated AI Ops Lead</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#1aae39]" />
                    <span>Custom On-Premise / VPC Deployment</span>
                  </li>
                </ul>
              </div>

              <a
                href="mailto:enterprise@relayops.ai"
                className="w-full py-2.5 text-center rounded-full bg-white hover:bg-stone-50 border border-hairline text-ink text-xs font-bold transition-all shadow-micro"
              >
                Talk to Enterprise Sales
              </a>
            </div>

          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          CUSTOMER CASE STUDIES & TESTIMONIALS (Social Proof)
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-hairline text-ink-muted text-xs font-semibold shadow-micro">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Proven in the Field</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Trusted by the planners behind unforgettable moments.
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            See how Relay prevented catastrophic budget blowouts and saved multi-thousand guest events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-2xl border border-hairline shadow-card space-y-4">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed italic">
              "Our primary catering partner cancelled 3 days before a 350-guest destination wedding in Goa. Relay scouted 3 replacement vendors, recalculated unit meal pricing for 362 guests in flight, and gave us an approved solution in 45 seconds. It literally saved our agency's reputation."
            </p>
            <div className="pt-3 border-t border-hairline flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f8f2fe] text-purple-700 font-bold flex items-center justify-center text-xs">
                AK
              </div>
              <div>
                <div className="font-bold text-xs text-ink">Ananya Kapoor</div>
                <div className="text-[10px] text-ink-muted">Founder, Elysian Wedding Productions</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-2xl border border-hairline shadow-card space-y-4">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed italic">
              "We run 15 annual corporate tech summits with strict finance compliance. Relay's deterministic graph engine means zero AI hallucinations on budget spent. The client status portal kept our executive sponsors totally calm during last-minute AV supplier swaps."
            </p>
            <div className="pt-3 border-t border-hairline flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#eef6fd] text-[#0075de] font-bold flex items-center justify-center text-xs">
                DM
              </div>
              <div>
                <div className="font-bold text-xs text-ink">David Miller</div>
                <div className="text-[10px] text-ink-muted">Head of Global Events, NexaCorp Tech</div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white p-6 rounded-2xl border border-hairline shadow-card space-y-4">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed italic">
              "Managing 40 ballrooms every weekend used to be a 24/7 fire drill. With Relay's Central Vendor Repository, when one ballroom needs extra staging or bar staff, we reallocate verified backup vendors with one click. Our operational overtime dropped 65%."
            </p>
            <div className="pt-3 border-t border-hairline flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#edf9f0] text-[#1aae39] font-bold flex items-center justify-center text-xs">
                RS
              </div>
              <div>
                <div className="font-bold text-xs text-ink">Rahul Sharma</div>
                <div className="text-[10px] text-ink-muted">Banquet Director, Grand Heritage Resorts</div>
              </div>
            </div>
          </div>

        </div>

      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          FREQUENTLY ASKED QUESTIONS (Accordion in Crystal-Clear English)
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 sm:py-24 bg-white border-y border-hairline">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas-soft border border-hairline text-ink-muted text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Everything you need to know about Relay's autonomous architecture and guarantees.
            </p>
          </div>

          <div className="space-y-3">
            
            {[
              {
                q: "Does Relay ever spend money or sign vendor contracts without my permission?",
                a: "Never. Relay is built with a strict Human-in-the-Loop architectural guarantee. The AI analyzes disruptions, scouts verified alternatives, and models budget tradeoffs, but NO money is moved and NO contract changes are committed until a human coordinator clicks 'Approve'."
              },
              {
                q: "How does Relay ensure the AI doesn't hallucinate fake numbers or bad math?",
                a: "Unlike simple chatbots, Relay separates deterministic logic from AI reasoning. All dependency math (Guest Count → Meal Allocations → Budget Utilization) is calculated with 100% deterministic Python graph algorithms (BFS). The AI only handles language generation and qualitative vendor assessment using strict Pydantic schemas."
              },
              {
                q: "What is 'Dynamic In-Flight Rescoping' and why is it special?",
                a: "In live events, disruptions rarely happen one at a time. If your caterer cancels and you're already reviewing backup quotes, but 15 more guests suddenly RSVP, most software forces you to start over from scratch. Relay automatically updates the active negotiation parameters in flight, recalculating per-head costs for the new headcount instantly."
              },
              {
                q: "Can I connect my existing vendor network and CSV spreadsheets?",
                a: "Yes! Relay features a Central Vendor Repository and built-in CSV Importer. You can import your existing vendors, past pricing history, and event budgets in seconds."
              },
              {
                q: "Can my clients see when problems happen?",
                a: "No! Relay includes a dedicated, white-labeled Client Status Portal that couples and VIP corporate clients can view. It shows serene, milestone-based progress without exposing raw backend crisis logs or panic."
              },
              {
                q: "How do I test the platform right now?",
                a: "Click 'Launch Live App' anywhere on this page to jump straight into our pre-seeded demonstration event (Priya's Wedding). You can simulate vendor cancellations and test real-time AI contingency recovery immediately."
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-canvas-soft rounded-xl border border-hairline overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-ink hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-ink-muted shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ink-muted shrink-0" />
                  )}
                </button>

                {openFaq === index && (
                  <div className="px-6 pb-4 text-xs text-ink-secondary leading-relaxed border-t border-hairline/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}

          </div>

        </div>
      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          FINAL CONVERSION BANNER (High-Energy Call to Action)
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0c1435] bg-gradient-to-br from-[#080e26] via-[#101945] to-[#182663] text-white border-t border-[#213183] text-center relative overflow-hidden">
        
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:24px_24px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#0075de]/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/20 text-xs font-bold uppercase tracking-wider text-[#62aef0]">
            <Zap className="w-3.5 h-3.5 text-[#ff64c8]" />
            <span>Eliminate Event Panic Forever</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ready to run high-stakes, multi-crore events <br className="hidden sm:block" />
            with complete autonomous peace of mind?
          </h2>

          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
            Join the new standard in live event operations. Launch the interactive workspace in 1 click or contact our founding team for enterprise deployment.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onLaunchApp}
              className="px-8 py-3.5 rounded-full bg-[#0075de] hover:bg-[#005bab] text-white text-sm font-bold tracking-wide transition-all shadow-[0_8px_32px_rgba(0,117,222,0.6)] hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Interactive Demo Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenEvent ? onOpenEvent('evt_1') : onLaunchApp()}
              className="px-6 py-3.5 rounded-full bg-white/[0.10] hover:bg-white/[0.18] text-white text-sm font-semibold tracking-wide border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-[#62aef0]" />
              <span>Inspect Priya's Wedding (evt_1)</span>
            </button>
          </div>

        </div>

      </section>


      {/* ─────────────────────────────────────────────────────────────────────────
          SITE FOOTER (Warm Paper-Soft Footer per DESIGN.md Specs)
      ───────────────────────────────────────────────────────────────────────── */}
      <footer className="bg-canvas-soft border-t border-hairline py-12 text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            
            {/* Brand column (2 cols) */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#0075de] flex items-center justify-center text-white font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-base text-ink tracking-tight">Relay</span>
              </div>
              <p className="text-xs text-ink-secondary max-w-sm leading-relaxed">
                The Autonomous AI Event Operations Agent. Powered by deterministic constraint graph logic and safe agentic negotiation.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="w-2 h-2 rounded-full bg-[#1aae39] animate-pulse"></span>
                <span className="text-[11px] font-mono text-ink-secondary">All AI Ops Systems Operational (99.99% Uptime)</span>
              </div>
            </div>

            {/* Product links */}
            <div className="space-y-2.5">
              <div className="font-bold text-ink uppercase tracking-wider text-[11px]">Product</div>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#how-it-works" className="hover:text-ink transition-colors">How It Works</a></li>
                <li><a href="#interactive-simulator" className="hover:text-ink transition-colors">Crisis Simulator</a></li>
                <li><a href="#architecture" className="hover:text-ink transition-colors">4-Pillar Moat</a></li>
                <li><a href="#roi-calculator" className="hover:text-ink transition-colors">ROI Calculator</a></li>
                <li><a href="#pricing" className="hover:text-ink transition-colors">Pricing Matrix</a></li>
              </ul>
            </div>

            {/* Architecture links */}
            <div className="space-y-2.5">
              <div className="font-bold text-ink uppercase tracking-wider text-[11px]">Architecture</div>
              <ul className="space-y-1.5 text-xs">
                <li><span className="text-ink-secondary">Deterministic Graph Engine</span></li>
                <li><span className="text-ink-secondary">In-Flight Rescoping</span></li>
                <li><span className="text-ink-secondary">Pydantic Schemas</span></li>
                <li><span className="text-ink-secondary">FastAPI WebSockets</span></li>
                <li><span className="text-ink-secondary">MongoDB Atlas Ledger</span></li>
              </ul>
            </div>

            {/* Company / Investors */}
            <div className="space-y-2.5">
              <div className="font-bold text-ink uppercase tracking-wider text-[11px]">Company & Investors</div>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#investors" className="hover:text-ink transition-colors">Investor Thesis</a></li>
                <li><a href="mailto:founders@relayops.ai" className="hover:text-ink transition-colors">Founders & Team</a></li>
                <li><a href="mailto:founders@relayops.ai" className="hover:text-ink transition-colors">Careers & Hiring</a></li>
                <li><a href="mailto:founders@relayops.ai" className="hover:text-ink transition-colors">Partner Network</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>
              © 2026 Relay Technologies, Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-ink cursor-pointer">Privacy Policy</span>
              <span className="hover:text-ink cursor-pointer">Terms of Service</span>
              <span className="hover:text-ink cursor-pointer">Security Safeguards</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
