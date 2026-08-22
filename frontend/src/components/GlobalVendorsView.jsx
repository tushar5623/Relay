import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Filter, 
  Building2, 
  Mail, 
  Layers, 
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';

export const GlobalVendorsView = ({
  gVendors = [],
  loadingGVendors,
  currentUser,
  onOpenCreateVendorModal,
  onOpenAssignModal
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(gVendors.map(v => v.category).filter(Boolean))];

  const filteredVendors = gVendors.filter(v => {
    const matchesSearch = v.name?.toLowerCase().includes(search.toLowerCase()) ||
                          v.category?.toLowerCase().includes(search.toLowerCase()) ||
                          v.contact_email?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || v.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const isAdmin = currentUser?.role === 'admin';
  const canAssign = currentUser?.role === 'admin' || currentUser?.role === 'approver';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white border border-hairline rounded-xl p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary-light text-primary mt-0.5">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Central Vendor Repository</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Enterprise vendor network, benchmark rates, pre-negotiated master services agreements, and cross-event allocations.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenCreateVendorModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0075de] hover:bg-[#005bab] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-micro hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Global Vendor</span>
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white border border-hairline rounded-xl shadow-card overflow-hidden">
        
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-hairline bg-canvas-soft/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendors by name, category, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs text-ink bg-white border border-hairline rounded-lg focus:outline-none focus:border-primary shadow-micro placeholder:text-ink-faint"
            />
          </div>

          {categories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[11px] text-ink-muted uppercase font-semibold mr-1 shrink-0">Filter:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs capitalize transition-all shrink-0 ${
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
        </div>

        {/* Table */}
        {loadingGVendors ? (
          <div className="p-12 text-center text-xs text-ink-muted">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading vendor repository...
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="p-12 text-center text-xs text-ink-muted">
            No central vendors matched the query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-canvas-soft/60 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Base Benchmark</th>
                  <th className="py-3.5 px-4 text-center">Assigned Deployments</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-xs">
                {filteredVendors.map(v => (
                  <tr key={v._id} className="hover:bg-canvas-soft/50 transition-colors">
                    
                    {/* Vendor Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-ink text-sm">{v.name}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-ink-faint">
                        <span className="font-mono text-[10px]">{v._id}</span>
                        {v.contact_email && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[11px]">
                              <Mail className="w-3 h-3" /> {v.contact_email}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <CategoryBadge category={v.category} />
                    </td>

                    {/* Base Quote */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-ink">
                      ₹{(v.base_quote || 0).toLocaleString()}
                    </td>

                    {/* Assigned Deployments */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-100 text-ink-secondary rounded-full font-mono text-xs font-medium">
                        {v.cost_history?.length || 0} events
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {canAssign ? (
                        <button
                          onClick={() => onOpenAssignModal(v)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-[#0075de] hover:bg-[#005bab] transition-all shadow-micro active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Assign to Event</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-ink-muted italic">View Only</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default GlobalVendorsView;
