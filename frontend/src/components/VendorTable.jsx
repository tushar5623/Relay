import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Edit3, 
  Check, 
  X, 
  Plus, 
  Filter, 
  SlidersHorizontal,
  Ban
} from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { StatusIndicator } from './StatusIndicator';

export const VendorTable = ({
  vendors = [],
  editingVendor,
  vendorForm,
  setVendorForm,
  onStartEditVendor,
  onCancelEditVendor,
  onSaveVendor,
  vendorError,
  onCancelVendorDirect
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(vendors.map(v => v.category).filter(Boolean))];

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name?.toLowerCase().includes(search.toLowerCase()) || 
                          v.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || v.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-white border border-hairline rounded-xl shadow-card overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="p-5 border-b border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas-soft/50">
        <div>
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Engaged Vendors</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 bg-stone-200/70 text-ink-secondary rounded-full">
              {vendors.length}
            </span>
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">Assigned suppliers, commitments, quotes and fulfillment statuses</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter vendors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs text-ink bg-white border border-hairline rounded-lg focus:outline-none focus:border-primary w-40 sm:w-48 placeholder:text-ink-faint shadow-micro"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Chips Bar */}
      {categories.length > 2 && (
        <div className="px-5 py-2.5 border-b border-hairline bg-canvas-soft/30 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] text-ink-muted uppercase font-semibold mr-1 shrink-0">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-ink text-white font-medium shadow-micro'
                  : 'bg-white text-ink-muted hover:text-ink border border-hairline'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Table Body */}
      {vendors.length === 0 ? (
        <div className="p-12 text-center text-ink-muted text-xs">
          No vendors currently assigned to this event.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-canvas-soft/60 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quote</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-xs">
              {filteredVendors.map(v => {
                const isEditing = editingVendor === v._id;

                return (
                  <tr key={v._id} className="hover:bg-canvas-soft/50 transition-colors">
                    
                    {/* Vendor Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-ink text-sm">{v.name}</div>
                      <div className="text-[10px] font-mono text-ink-faint">{v._id}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <CategoryBadge category={v.category} />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <select
                          value={vendorForm.status}
                          onChange={e => setVendorForm({ ...vendorForm, status: e.target.value })}
                          className="bg-white border border-hairline rounded-lg text-xs p-1.5 text-ink focus:outline-none focus:border-primary shadow-micro font-medium"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="backup_candidate">Backup Candidate</option>
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      ) : (
                        <StatusIndicator status={v.status} size="sm" />
                      )}
                    </td>

                    {/* Quote */}
                    <td className="py-3.5 px-4 text-right font-mono text-sm font-medium text-ink">
                      {isEditing ? (
                        <div className="flex justify-end items-center gap-1">
                          <span className="text-xs text-ink-muted">₹</span>
                          <input
                            type="number"
                            value={vendorForm.quote}
                            onChange={e => setVendorForm({ ...vendorForm, quote: e.target.value })}
                            className="w-24 bg-white border border-hairline rounded-lg text-xs p-1.5 text-right font-mono text-ink focus:outline-none focus:border-primary shadow-micro"
                          />
                        </div>
                      ) : (
                        `₹${(v.quote || 0).toLocaleString()}`
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={e => onSaveVendor(e, v._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-active transition-colors shadow-micro"
                          >
                            <Check className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={onCancelEditVendor}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-canvas-soft text-ink-muted hover:text-ink rounded-lg text-xs font-medium transition-colors"
                          >
                            <X className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => onStartEditVendor(v)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-ink-muted hover:text-ink bg-canvas-soft hover:bg-stone-200/70 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {v.status !== 'cancelled' && onCancelVendorDirect && (
                            <button
                              onClick={() => onCancelVendorDirect(v._id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-sticker-red/80 hover:text-sticker-red hover:bg-sticker-red-bg rounded-lg text-xs font-medium transition-colors"
                              title="Simulate Disruption on this vendor"
                            >
                              <Ban className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

          {vendorError && (
            <div className="p-3 text-xs text-sticker-red bg-sticker-red-bg border-t border-sticker-red/20 font-medium">
              {vendorError}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default VendorTable;
