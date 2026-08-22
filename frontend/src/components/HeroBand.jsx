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
  Clock
} from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';

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

  return (
    <section className="relative overflow-hidden bg-secondary text-white rounded-2xl shadow-elevated border border-secondary-dark p-6 sm:p-8 my-6">
      
      {/* Decorative Night Starfield & Constellation Effect */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      
      {/* Floating subtle glowing stickers */}
      <div className="absolute top-4 right-12 opacity-20 pointer-events-none animate-float hidden lg:block">
        <Sparkles className="w-16 h-16 text-sticker-sky" />
      </div>
      <div className="absolute bottom-3 right-48 opacity-15 pointer-events-none animate-float [animation-delay:2s] hidden lg:block">
        <div className="w-8 h-8 rounded-full bg-sticker-pink blur-md"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Event Title & Metadata */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15">
              <Calendar className="w-3 h-3 text-sticker-sky" />
              {dateString}
            </span>
            <StatusIndicator status={event.status || 'on_track'} size="sm" />
            {activeDisruptions.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-sticker-red/20 text-sticker-red border border-sticker-red/30">
                <AlertTriangle className="w-3 h-3" />
                {activeDisruptions.length} Disruption{activeDisruptions.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            {event.name}
          </h1>
          
          <p className="text-sm text-white/80 leading-relaxed font-normal">
            Autonomous operations console actively monitoring multi-vendor commitments, budget safety thresholds, and real-time contingency execution.
          </p>

          {/* Quick Simulation & Live Action Triggers */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={onSimulateDisruption}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-primary-active text-white text-xs font-semibold tracking-wide transition-all shadow-micro hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Disruption</span>
            </button>

            <button
              onClick={onAddGuests}
              disabled={!isNegotiating}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                isNegotiating 
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/25 active:scale-[0.98]' 
                  : 'bg-white/5 text-white/40 border-white/10 cursor-not-allowed'
              }`}
              title={isNegotiating ? "Inject +12 RSVPs into active negotiation" : "Activate during AI recovery planning to test live rescope"}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+12 Guests (Rescope)</span>
            </button>

            <button
              onClick={onOpenDisruptionModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-all active:scale-[0.98]"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-sticker-orange" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Pill Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 lg:w-80 shrink-0">
          
          {/* Guest Count Card */}
          <div className={`p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 transition-all duration-300 ${
            guestCountAnimating ? 'ring-2 ring-sticker-sky bg-white/20 scale-105' : ''
          }`}>
            <div className="flex items-center justify-between text-white/70 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Guests</span>
              <Users className="w-3.5 h-3.5 text-sticker-sky" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {event.guest_count}
              <span className="text-xs font-normal text-white/60 font-sans ml-1.5">
                ({guests.length} RSVPs)
              </span>
            </div>
          </div>

          {/* Budget Health Card */}
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="flex items-center justify-between text-white/70 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Remaining</span>
              <TrendingUp className={`w-3.5 h-3.5 ${isOverBudget ? 'text-sticker-red' : 'text-sticker-green'}`} />
            </div>
            <div className={`text-xl font-bold font-mono ${isOverBudget ? 'text-sticker-red' : 'text-sticker-green'}`}>
              ₹{budgetRemaining.toLocaleString()}
            </div>
          </div>

          {/* Budget Progress Meter */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="flex justify-between items-center text-xs text-white/80 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Budget Spent</span>
              <span className="font-mono text-xs font-semibold">{percentSpent}% of ₹{budgetTotal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget ? 'bg-sticker-red' : percentSpent > 85 ? 'bg-sticker-amber' : 'bg-primary'
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
