import React from 'react';
import { 
  Users, 
  IndianRupee, 
  TrendingUp, 
  Wallet, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  PieChart,
  CalendarDays
} from 'lucide-react';

export const EventOverview = ({
  event = {},
  guests = [],
  editingBudget,
  setEditingBudget,
  budgetForm,
  setBudgetForm,
  onBudgetSubmit,
  budgetError,
  guestCountAnimating,
  currentUser
}) => {
  const budgetTotal = event.budget_total || 0;
  const budgetSpent = event.budget_spent || 0;
  const budgetRemaining = budgetTotal - budgetSpent;
  const percentSpent = budgetTotal > 0 ? Math.min(Math.round((budgetSpent / budgetTotal) * 100), 100) : 0;
  const isOverBudget = budgetRemaining < 0;

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Guests */}
        <div className={`bg-white border border-hairline rounded-xl p-5 shadow-card transition-all duration-300 ${
          guestCountAnimating ? 'ring-2 ring-primary scale-[1.02] bg-primary-light/10' : ''
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Guest Count</span>
            <div className="p-2 rounded-lg bg-sticker-sky-bg text-[#0284c7]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-ink">
            {event.guest_count || 0}
          </div>
          <div className="text-xs text-ink-muted mt-1 flex items-center justify-between">
            <span>{guests.length} RSVP Records</span>
            {guestCountAnimating && (
              <span className="text-[10px] font-bold text-primary animate-pulse">+12 updated</span>
            )}
          </div>
        </div>

        {/* Card 2: Total Budget */}
        <div className="bg-white border border-hairline rounded-xl p-5 shadow-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Total Budget</span>
            <div className="p-2 rounded-lg bg-primary-light text-primary">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-ink">
            ₹{budgetTotal.toLocaleString()}
          </div>
          <div className="text-xs text-ink-muted mt-1 flex items-center justify-between">
            <span>Approved allocation</span>
            {isAdmin && !editingBudget && (
              <button
                type="button"
                onClick={() => setEditingBudget(true)}
                className="text-[11px] font-bold text-[#0075de] hover:text-[#005bab] underline cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Spent */}
        <div className="bg-white border border-hairline rounded-xl p-5 shadow-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Budget Spent</span>
            <div className="p-2 rounded-lg bg-sticker-purple-bg text-[#7c3aed]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-ink">
            ₹{budgetSpent.toLocaleString()}
          </div>
          <div className="text-xs text-ink-muted mt-1">
            <span className="font-mono font-medium">{percentSpent}%</span> of total budget
          </div>
        </div>

        {/* Card 4: Remaining */}
        <div className="bg-white border border-hairline rounded-xl p-5 shadow-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Remaining</span>
            <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-sticker-red-bg text-sticker-red' : 'bg-sticker-green-bg text-sticker-green'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-bold font-mono ${isOverBudget ? 'text-sticker-red' : 'text-sticker-green'}`}>
            ₹{budgetRemaining.toLocaleString()}
          </div>
          <div className="text-xs mt-1">
            {isOverBudget ? (
              <span className="text-sticker-red font-medium">Budget overrun detected</span>
            ) : (
              <span className="text-sticker-green font-medium">Within safe operational margin</span>
            )}
          </div>
        </div>

      </div>

      {/* Budget Edit Modal / In-line Form */}
      {editingBudget && (
        <div className="bg-white border border-[#0075de]/40 ring-2 ring-[#0075de]/15 rounded-xl p-5 shadow-card animate-in fade-in duration-150">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#0075de]" />
              <span>Modify Event Budget Allocation</span>
            </h4>
            <span className="text-xs text-ink-muted font-medium">Admin Role Active</span>
          </div>

          <form onSubmit={onBudgetSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Total Budget (₹)
                </label>
                <input
                  type="number"
                  value={budgetForm.budget_total}
                  onChange={e => setBudgetForm({ ...budgetForm, budget_total: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-ink bg-canvas-soft border border-hairline rounded-lg font-mono focus:outline-none focus:border-[#0075de] focus:bg-white transition-all shadow-micro"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Budget Spent (₹)
                </label>
                <input
                  type="number"
                  value={budgetForm.budget_spent}
                  onChange={e => setBudgetForm({ ...budgetForm, budget_spent: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-ink bg-canvas-soft border border-hairline rounded-lg font-mono focus:outline-none focus:border-[#0075de] focus:bg-white transition-all shadow-micro"
                  required
                />
              </div>
            </div>

            {budgetError && (
              <p className="text-xs text-sticker-red font-medium">{budgetError}</p>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingBudget(false)}
                className="px-4 py-2 text-xs font-semibold text-ink-secondary bg-white hover:bg-stone-100 border border-hairline rounded-lg transition-colors shadow-micro cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#0075de] hover:bg-[#005bab] rounded-lg transition-all shadow-micro hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Save Budget
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timeline Milestones (if available) */}
      {event.timeline && event.timeline.length > 0 && (
        <div className="bg-white border border-hairline rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold text-ink uppercase tracking-wider">Event Day Run of Show</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {event.timeline.map((item, idx) => (
              <div key={item.id || idx} className="p-3 rounded-lg bg-canvas-soft border border-hairline">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-primary">{item.time}</span>
                  <span className="text-[10px] uppercase font-semibold text-ink-muted">Phase {idx + 1}</span>
                </div>
                <div className="font-semibold text-ink text-sm">{item.block}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default EventOverview;
