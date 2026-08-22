import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ArrowLeft,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';

export const ClientStatusView = ({ eventId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/event/${eventId}/client-status`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load client status');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-soft flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-ink-muted">Loading live event status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas-soft flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-sticker-red mb-3" />
        <h3 className="text-base font-bold text-ink mb-1">Unable to Load Client Status</h3>
        <p className="text-xs text-sticker-red mb-6 max-w-sm">{error}</p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0075de] hover:bg-[#005bab] rounded-lg transition-all shadow-micro hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    );
  }

  if (!data) return null;

  const dateFormatted = data.date 
    ? new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Date not set';

  const lastUpdated = data.last_updated 
    ? new Date(data.last_updated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div className="min-h-screen bg-canvas-soft text-ink font-sans antialiased">
      
      {/* Header */}
      <header className="bg-white border-b border-hairline sticky top-0 z-30 shadow-micro">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas-soft transition-colors -ml-2"
                title="Back to Operations Workspace"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white shadow-micro">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block">
                Relay / Client Status Portal
              </span>
              <h2 className="text-base font-bold text-ink leading-tight">{data.name}</h2>
            </div>
          </div>

          <StatusIndicator status={data.health || 'on_track'} size="md" />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        
        {/* Banner Card */}
        <div className="bg-white border border-hairline rounded-2xl p-8 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Live Event Brief</span>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink mt-1">{data.name}</h1>
            </div>
            <div className="text-right">
              <span className="text-xs text-ink-muted block">Overall Status</span>
              <span className="text-sm font-bold text-sticker-green uppercase tracking-wide">
                {data.health === 'on_track' ? 'Everything on Track' : data.health === 'at_risk' ? 'Mitigation in Progress' : 'Critical Review'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary-light text-primary mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-ink-muted uppercase font-semibold block">Scheduled Date</span>
                <span className="font-semibold text-ink text-base">{dateFormatted}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sticker-sky-bg text-[#0284c7] mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-ink-muted uppercase font-semibold block">Confirmed Headcount</span>
                <span className="font-semibold text-ink text-base font-mono">{data.guest_count} Guests</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="bg-white border border-hairline rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-2 text-ink-muted">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider">Vendor Confirmations</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-ink mt-1">
              {data.vendors_confirmed} <span className="text-lg font-normal text-ink-muted font-sans">/ {data.vendors_total}</span>
            </div>
            <p className="text-xs text-sticker-green font-medium mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All critical vendors aligned
            </p>
          </div>

          <div className="bg-white border border-hairline rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-2 text-ink-muted">
              <AlertTriangle className={`w-4 h-4 ${data.unresolved_disruptions > 0 ? 'text-sticker-red' : 'text-sticker-green'}`} />
              <span className="text-xs font-semibold uppercase tracking-wider">Operational Incidents</span>
            </div>
            <div className={`text-3xl font-extrabold font-mono mt-1 ${
              data.unresolved_disruptions > 0 ? 'text-sticker-red' : 'text-ink'
            }`}>
              {data.unresolved_disruptions}
            </div>
            <p className="text-xs text-ink-muted mt-1.5">
              {data.unresolved_disruptions === 0 ? 'Zero outstanding blockers' : 'Automated resolution active'}
            </p>
          </div>

          <div className="bg-white border border-hairline rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-2 text-ink-muted">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider">Timeline Schedule</span>
            </div>
            <div className="text-2xl font-bold text-ink mt-1 capitalize">
              {data.timeline_status || 'On Schedule'}
            </div>
            <p className="text-xs text-ink-muted mt-1.5">
              Load-in and cues synchronized
            </p>
          </div>

        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-ink-muted py-6 border-t border-hairline">
          <span>Last automated sync: {lastUpdated} • Powered by Relay Event Intelligence</span>
        </div>

      </main>

    </div>
  );
};

export default ClientStatusView;
