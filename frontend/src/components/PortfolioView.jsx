import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  ArrowRight, 
  Search, 
  Filter, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Activity,
  Users
} from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';

export const PortfolioView = ({
  events = [],
  onSelectEvent,
  portfolioSort,
  onSortChange,
  portfolioFilter,
  onFilterChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fleet Overview Stats
  const totalEvents = events.length;
  const criticalCount = events.filter(e => e.health === 'critical').length;
  const atRiskCount = events.filter(e => e.health === 'at_risk').length;
  const onTrackCount = events.filter(e => !e.health || e.health === 'on_track').length;
  const totalValue = events.reduce((sum, e) => sum + (e.budget_total || 0), 0);
  const totalDisruptions = events.reduce((sum, e) => sum + (e.unresolved_disruptions || 0), 0);

  const filteredEvents = events
    .filter(evt => {
      const matchesFilter = portfolioFilter === 'all' || (evt.health || 'on_track') === portfolioFilter;
      const matchesSearch = evt.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            evt._id?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (portfolioSort === 'risk') {
        const hMap = { critical: 3, at_risk: 2, on_track: 1 };
        return (hMap[b.health || 'on_track'] || 0) - (hMap[a.health || 'on_track'] || 0);
      }
      if (portfolioSort === 'budget') return (b.budget_total || 0) - (a.budget_total || 0);
      if (portfolioSort === 'disruptions') return (b.unresolved_disruptions || 0) - (a.unresolved_disruptions || 0);
      if (portfolioSort === 'date') return new Date(a.date || 0) - new Date(b.date || 0);
      return 0;
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Overview Metric Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-hairline rounded-xl p-5 shadow-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Total Events</span>
            <div className="p-2 rounded-lg bg-primary-light text-primary">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-ink">{totalEvents}</div>
          <div className="text-xs text-ink-muted mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-sticker-green"></span>
            <span>{onTrackCount} on track</span>
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-xl p-5 shadow-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Value at Stake</span>
            <div className="p-2 rounded-lg bg-sticker-purple-bg text-[#7c3aed]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-ink">₹{totalValue.toLocaleString()}</div>
          <div className="text-xs text-ink-muted mt-1">Across all managed portfolios</div>
        </div>

        <div className="bg-white border border-hairline rounded-xl p-5 shadow-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Disruptions</span>
            <div className="p-2 rounded-lg bg-sticker-red-bg text-sticker-red">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-sticker-red">{totalDisruptions}</div>
          <div className="text-xs text-ink-muted mt-1">
            {totalDisruptions > 0 ? 'Requires immediate action' : 'All operations steady'}
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-xl p-5 shadow-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Fleet Health</span>
            <div className="p-2 rounded-lg bg-sticker-teal-bg text-sticker-teal">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${(onTrackCount / Math.max(totalEvents, 1)) * 100}%` }} 
                className="bg-sticker-green h-full"
                title={`${onTrackCount} On Track`}
              ></div>
              <div 
                style={{ width: `${(atRiskCount / Math.max(totalEvents, 1)) * 100}%` }} 
                className="bg-sticker-orange h-full"
                title={`${atRiskCount} At Risk`}
              ></div>
              <div 
                style={{ width: `${(criticalCount / Math.max(totalEvents, 1)) * 100}%` }} 
                className="bg-sticker-red h-full"
                title={`${criticalCount} Critical`}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-ink-muted mt-2 font-mono">
            <span className="text-sticker-green font-medium">{onTrackCount} OK</span>
            <span className="text-sticker-orange font-medium">{atRiskCount} Risk</span>
            <span className="text-sticker-red font-medium">{criticalCount} Crit</span>
          </div>
        </div>

      </div>

      {/* Filter, Search & Sort Control Bar */}
      <div className="bg-white border border-hairline rounded-xl p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by name or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs text-ink bg-canvas-soft border border-hairline rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-ink-faint"
          />
        </div>

        {/* Filter Pills and Sort Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          
          <div className="flex items-center gap-1 bg-canvas-soft p-1 rounded-lg border border-hairline">
            {[
              { id: 'all', label: 'All' },
              { id: 'on_track', label: 'Healthy' },
              { id: 'at_risk', label: 'At Risk' },
              { id: 'critical', label: 'Critical' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  portfolioFilter === tab.id
                    ? 'bg-white text-ink shadow-micro font-semibold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-ink-muted hidden md:inline">Sort:</span>
            <select
              value={portfolioSort}
              onChange={e => onSortChange(e.target.value)}
              className="bg-canvas-soft text-ink font-medium text-xs border border-hairline rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="date">Event Date</option>
              <option value="risk">Risk Exposure</option>
              <option value="budget">Value at Stake</option>
              <option value="disruptions">Unresolved Disruptions</option>
            </select>
          </div>

        </div>

      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(evt => {
          const isCritical = evt.health === 'critical';
          const isAtRisk = evt.health === 'at_risk';
          const healthStatus = evt.health || 'on_track';
          const dateStr = evt.date ? new Date(evt.date).toISOString().split('T')[0] : 'TBD';

          return (
            <div
              key={evt._id}
              onClick={() => onSelectEvent(evt._id)}
              className="group bg-white border border-hairline hover:border-primary/40 rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                isCritical ? 'bg-sticker-red' : isAtRisk ? 'bg-sticker-orange' : 'bg-sticker-green'
              }`}></div>

              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider block mb-1">
                      {evt._id}
                    </span>
                    <h3 className="text-lg font-bold text-ink group-hover:text-primary transition-colors line-clamp-1">
                      {evt.name}
                    </h3>
                  </div>
                  <StatusIndicator status={healthStatus} size="sm" />
                </div>

                <div className="space-y-2.5 my-5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-hairline">
                    <span className="text-ink-muted flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Date
                    </span>
                    <span className="font-mono font-medium text-ink">{dateStr}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-hairline">
                    <span className="text-ink-muted flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> Value at Stake
                    </span>
                    <span className="font-mono font-semibold text-ink">₹{(evt.budget_total || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-hairline">
                    <span className="text-ink-muted flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Guests
                    </span>
                    <span className="font-mono font-medium text-ink">{evt.guest_count || 0}</span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-ink-muted flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Disruptions
                    </span>
                    <span className={`font-mono font-bold ${
                      (evt.unresolved_disruptions || 0) > 0 ? 'text-sticker-red' : 'text-sticker-green'
                    }`}>
                      {evt.unresolved_disruptions || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Jump-in Link */}
              <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary-active">
                <span>Open Operations Workspace</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>

            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="bg-white border border-hairline rounded-xl p-12 text-center max-w-lg mx-auto shadow-card">
          <Sparkles className="w-10 h-10 text-ink-faint mx-auto mb-3" />
          <h4 className="text-base font-semibold text-ink mb-1">No events found</h4>
          <p className="text-xs text-ink-muted mb-4">No events matched your current search and filter settings.</p>
          <button
            onClick={() => { onFilterChange('all'); setSearchQuery(''); }}
            className="px-4 py-2 text-xs font-medium text-primary bg-primary-light hover:bg-primary/20 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
};

export default PortfolioView;
