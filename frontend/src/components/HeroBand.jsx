import React from 'react';
import { 
  Calendar, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  Play, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  ArrowUpRight
} from 'lucide-react';

export const HeroBand = ({
  event,
  guests = [],
  activeDisruptions = [],
  onAddGuests,
  onSimulateDisruption,
  onOpenDisruptionModal,
  onOpenClientView,
  isNegotiating,
  guestCountAnimating
}) => {
  if (!event) return null;

  const budgetTotal = event.budget_total || 0;
  const budgetSpent = event.budget_spent || 0;
  const budgetRemaining = budgetTotal - budgetSpent;
  const percentSpent = budgetTotal > 0 ? Math.min(Math.round((budgetSpent / budgetTotal) * 100), 100) : 0;
  const isOverBudget = budgetRemaining < 0;

  const dateString = event.date 
    ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date not set';

  const status = (event.status || 'on_track').toLowerCase();
  let statusBadgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  let statusLabel = 'On Track';
  let StatusIcon = CheckCircle2;

  if (status === 'at_risk' || status === 'pending') {
    statusBadgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    statusLabel = 'At Risk';
    StatusIcon = AlertTriangle;
  } else if (status === 'critical' || status === 'cancelled' || status === 'rejected') {
    statusBadgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    statusLabel = 'Critical';
    StatusIcon = XCircle;
  }

  return (
    <section className="relative overflow-hidden bg-[#0c1435] bg-gradient-to-br from-[#0a112e] via-[#121c4b] to-[#1a2868] text-white rounded-3xl shadow-[0_20px_50px_rgba(10,17,46,0.35)] border border-[#26377e]/60 p-6 sm:p-8 lg:p-10 my-6 transition-all">
      
      {/* 1. Ambient Lighting & Mesh Glow Behind Content */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#2546a3]/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#0075de]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#7c3aed]/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* 2. Geometric Dot Grid Texture */}
      <div className="absolute inset-0 opacity-[0.14] pointer-events-none bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:24px_24px]"></div>

      {/* 3. Floating Holographic Brand Constellation */}
      <div className="absolute top-6 right-8 opacity-25 pointer-events-none animate-float hidden lg:block">
        <Sparkles className="w-20 h-20 text-[#62aef0]" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        
        {/* Left Column: Event Context & Action Triggers */}
        <div className="space-y-4 max-w-2xl">
          
          {/* Top Pill Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Date Pill */}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-md text-white/90 border border-white/15 shadow-sm transition-colors">
              <Calendar className="w-3.5 h-3.5 text-[#62aef0]" />
              <span>{dateString}</span>
            </span>

            {/* Glowing Status Pill */}
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border backdrop-blur-md shadow-sm ${statusBadgeBg}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
              </span>
              <span>{statusLabel}</span>
            </span>

            {/* Disruptions Alert Pill */}
            {activeDisruptions.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md shadow-[0_0_12px_rgba(244,63,94,0.2)]">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>{activeDisruptions.length} Disruption{activeDisruptions.length > 1 ? 's' : ''} Active</span>
              </span>
            )}

          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-sm">
            {event.name}
          </h1>
          
          {/* Narrative description */}
          <p className="text-sm sm:text-base text-white/75 leading-relaxed font-normal max-w-xl">
            Autonomous operations console actively monitoring multi-vendor commitments, budget safety thresholds, and real-time contingency execution.
          </p>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            
            {/* Primary Action Button: Simulate Disruption */}
            <button
              onClick={onSimulateDisruption}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0075de] to-[#005bab] hover:from-[#0085fc] hover:to-[#006bd1] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(0,117,222,0.4)] hover:shadow-[0_6px_24px_rgba(0,117,222,0.6)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Disruption</span>
            </button>

            {/* +12 Guests Rescope simulation */}
            <button
              onClick={onAddGuests}
              disabled={!isNegotiating}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all ${
                isNegotiating 
                  ? 'bg-white/[0.12] hover:bg-white/[0.22] text-white border-white/30 backdrop-blur-md shadow-sm hover:scale-[1.02] active:scale-[0.98]' 
                  : 'bg-white/[0.04] text-white/35 border-white/10 cursor-not-allowed'
              }`}
              title={isNegotiating ? "Inject +12 RSVPs into active negotiation" : "Activate during AI recovery planning to test live rescope"}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+12 Guests (Rescope)</span>
            </button>

            {/* Report Issue */}
            <button
              onClick={onOpenDisruptionModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-white/90 hover:text-white border border-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#fb923c]" />
              <span>Report Issue</span>
            </button>

          </div>
        </div>

        {/* Right Column: Glassmorphic KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3.5 lg:w-92 shrink-0">
          
          {/* 1. Guest Count Card */}
          <div className={`p-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.10] backdrop-blur-xl border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300 ${
            guestCountAnimating ? 'ring-2 ring-[#62aef0] bg-white/20 scale-105 shadow-[0_0_24px_rgba(98,174,240,0.4)]' : ''
          }`}>
            <div className="flex items-center justify-between text-white/70 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Guests</span>
              <div className="p-1 rounded-md bg-[#62aef0]/20 text-[#62aef0]">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {event.guest_count}
              <span className="text-xs font-medium text-white/60 font-sans ml-1.5">
                ({guests.length} RSVPs)
              </span>
            </div>
            <p className="text-[11px] text-white/50 mt-1">Confirmed RSVP allocation</p>
          </div>

          {/* 2. Budget Health Card */}
          <div className="p-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.10] backdrop-blur-xl border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all">
            <div className="flex items-center justify-between text-white/70 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Remaining</span>
              <div className={`p-1 rounded-md ${isOverBudget ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className={`text-2xl font-extrabold font-mono tracking-tight ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isOverBudget ? `- ₹${Math.abs(budgetRemaining).toLocaleString()}` : `₹${budgetRemaining.toLocaleString()}`}
            </div>
            <p className={`text-[11px] font-semibold mt-1 ${isOverBudget ? 'text-rose-400/90' : 'text-emerald-400/90'}`}>
              {isOverBudget ? 'Budget Overrun Detected' : 'Under Safety Ceiling'}
            </p>
          </div>

          {/* 3. Budget Progress Bar Card */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 p-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.10] backdrop-blur-xl border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Budget Utilization</span>
              <span className="font-mono text-xs font-bold text-white/90">
                {percentSpent}% of ₹{budgetTotal.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-white/15 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                  isOverBudget 
                    ? 'bg-gradient-to-r from-[#fb923c] to-[#ef4444]' 
                    : percentSpent > 85 
                    ? 'bg-gradient-to-r from-[#0075de] to-[#f59e0b]' 
                    : 'bg-gradient-to-r from-[#0075de] to-[#22c55e]'
                }`}
                style={{ width: `${Math.min(percentSpent, 100)}%` }}
              ></div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default HeroBand;
