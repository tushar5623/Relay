import React from 'react';
import { 
  X, 
  AlertTriangle, 
  UploadCloud, 
  Database, 
  Plus, 
  Check, 
  FileText,
  Building2,
  Sparkles
} from 'lucide-react';

const SAMPLE_CSV = {
  budget: `category,allocated_budget\ncatering,12000\nvenue,6000\nphotography,3000\nmusic/sound,1500`,
  vendors: `name,category,quote,status\nRoyal Feast Catering,catering,11500,confirmed\nApex Lighting & AV,music/sound,1400,confirmed\nStarlight Photos,photography,2800,backup_candidate`,
  timeline: `id,time,block,dependencies\nt1,13:00,Vendor Early Setup,\nt2,15:30,VIP Reception,t1\nt3,17:00,Main Keynote,t2\nt4,19:30,Gala Dinner,t3`
};

export const ReportDisruptionModal = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  vendors = []
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-hairline rounded-2xl shadow-modal w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-soft">
          <div className="flex items-center gap-2 text-sticker-red">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Report Operational Issue</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-stone-200/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Disruption Category
            </label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 text-xs text-ink bg-canvas-soft border border-hairline rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-all shadow-micro font-medium"
            >
              <option value="vendor_cancellation">Vendor Cancellation</option>
              <option value="budget_change">Budget Change</option>
              <option value="headcount_change">Headcount Change</option>
              <option value="timeline_conflict">Timeline Conflict</option>
              <option value="other">Other Operational Anomaly</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Severity Level
            </label>
            <select
              value={form.severity}
              onChange={e => setForm({ ...form, severity: e.target.value })}
              className="w-full px-3 py-2 text-xs text-ink bg-canvas-soft border border-hairline rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-all shadow-micro font-medium"
            >
              <option value="low">Low (Non-critical delay)</option>
              <option value="medium">Medium (Moderate operational friction)</option>
              <option value="high">High (Service disruption risk)</option>
              <option value="critical">Critical (Event-blocking blocker)</option>
            </select>
          </div>

          {form.type === 'vendor_cancellation' && (
            <div>
              <label className="block font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                Impacted Vendor
              </label>
              {vendors.length > 0 ? (
                <select
                  value={form.vendor_id || ''}
                  onChange={e => setForm({ ...form, vendor_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-ink bg-canvas-soft border border-hairline rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-all shadow-micro font-medium"
                >
                  <option value="">-- Select Event Vendor --</option>
                  {vendors.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.category} - {v._id})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. ven_catering_1"
                  value={form.vendor_id || ''}
                  onChange={e => setForm({ ...form, vendor_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-ink bg-canvas-soft border border-hairline rounded-lg font-mono focus:outline-none focus:border-primary focus:bg-white shadow-micro"
                />
              )}
            </div>
          )}

          <div>
            <label className="block font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Description & Context
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Provide specific operational details for the AI contingency planner..."
              className="w-full px-3 py-2 text-xs text-ink bg-canvas-soft border border-hairline rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-all shadow-micro"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink bg-canvas-soft rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-sticker-red hover:bg-sticker-red/90 rounded-lg transition-all shadow-micro"
            >
              Submit & Trigger AI Response
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export const ImportDataModal = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  result
}) => {
  if (!isOpen) return null;

  const handleApplySample = () => {
    const sample = SAMPLE_CSV[form.domain] || '';
    setForm({ ...form, csv_data: sample });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-hairline rounded-2xl shadow-modal w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-soft">
          <div className="flex items-center gap-2 text-primary">
            <UploadCloud className="w-4 h-4" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Import Operational Data</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-stone-200/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-semibold uppercase tracking-wider text-ink-muted">
              Target Domain
            </label>
            <button
              type="button"
              onClick={handleApplySample}
              className="text-[11px] font-semibold text-primary hover:text-primary-active underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Load Sample CSV
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['budget', 'vendors', 'timeline'].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setForm({ ...form, domain: d })}
                className={`py-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                  form.domain === d
                    ? 'bg-primary text-white border-primary shadow-micro'
                    : 'bg-canvas-soft text-ink-muted border-hairline hover:text-ink'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              CSV Payload Content
            </label>
            <textarea
              rows={6}
              value={form.csv_data}
              onChange={e => setForm({ ...form, csv_data: e.target.value })}
              placeholder="Paste comma-separated values (CSV) payload here..."
              className="w-full px-3 py-2 text-xs font-mono text-ink bg-canvas-soft border border-hairline rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-all shadow-micro"
              required
            />
          </div>

          {result && (
            <div className="p-3 rounded-lg bg-sticker-green-bg border border-sticker-green/20 text-sticker-green font-mono text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{result}</span>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink bg-canvas-soft rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-active rounded-lg transition-all shadow-micro"
            >
              Execute Import
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export const CreateGlobalVendorModal = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-hairline rounded-2xl shadow-modal w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-soft">
          <div className="flex items-center gap-2 text-primary">
            <Building2 className="w-4 h-4" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Register Central Vendor</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-stone-200/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Vendor Organization Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Saffron Table Catering"
              className="w-full px-3 py-2 text-xs text-ink bg-canvas-soft border border-hairline rounded-lg focus:outline-none focus:border-primary focus:bg-white shadow-micro"
              required
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Category
            </label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 text-xs text-ink bg-canvas-soft border border-hairline rounded-lg focus:outline-none focus:border-primary focus:bg-white shadow-micro font-medium capitalize"
              required
            >
              <option value="catering">Catering</option>
              <option value="venue">Venue / Space</option>
              <option value="photography">Photography & Video</option>
              <option value="music/sound">Music / AV / Sound</option>
              <option value="decoration">Decoration & Staging</option>
              <option value="transportation">Transportation</option>
              <option value="security">Security & Staff</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Base Benchmark Quote (₹)
            </label>
            <input
              type="number"
              value={form.base_quote}
              onChange={e => setForm({ ...form, base_quote: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono text-ink bg-canvas-soft border border-hairline rounded-lg focus:outline-none focus:border-primary focus:bg-white shadow-micro"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink bg-canvas-soft rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-active rounded-lg transition-all shadow-micro"
            >
              Create Vendor
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export const AssignGlobalVendorModal = ({
  isOpen,
  onClose,
  onSubmit,
  vendor,
  events = [],
  selectedEventId,
  setSelectedEventId,
  error
}) => {
  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-hairline rounded-2xl shadow-modal w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-soft">
          <div className="flex items-center gap-2 text-primary">
            <Building2 className="w-4 h-4" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Assign Vendor to Event</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-stone-200/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-canvas-soft border border-hairline flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">Selected Vendor</span>
              <span className="font-bold text-sm text-ink">{vendor.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">Base Rate</span>
              <span className="font-bold font-mono text-sm text-ink">₹{(vendor.base_quote || 0).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
              Select Target Event
            </label>
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 text-xs text-ink bg-canvas-soft border border-hairline rounded-lg focus:outline-none focus:border-primary focus:bg-white shadow-micro font-medium"
              required
            >
              {events.map(evt => (
                <option key={evt._id} value={evt._id}>
                  {evt.name} ({evt._id})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-sticker-red-bg border border-sticker-red/20 text-sticker-red font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink bg-canvas-soft rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-active rounded-lg transition-all shadow-micro"
            >
              Confirm Assignment
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
