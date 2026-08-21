import React, { useState, useEffect, useRef } from 'react';
import { getEvent, getEvents, updateEventBudget, updateVendor, cancelVendor, generateRecoveryPlan, getDecisions, executeDecision, incrementHeadcount, reportDisruption, getDisruptions, importData, getGlobalVendors, createGlobalVendor, updateGlobalVendor, associateGlobalVendor } from './api/eventApi';

const EVENT_ID = 'evt_1';

const USERS = [
  { id: 'usr_1', name: 'Alice Planner', role: 'planner' },
  { id: 'usr_2', name: 'Bob Approver', role: 'approver' },
  { id: 'usr_3', name: 'Charlie Admin', role: 'admin' },
];

const StatusIndicator = ({ status }) => {
  let color = 'text-ops-muted';
  let icon = '■';
  switch(status) {
    case 'on_track':
    case 'resolved':
    case 'confirmed':
      color = 'text-ops-teal';
      icon = '◆';
      break;
    case 'at_risk':
    case 'pending':
    case 'backup_candidate':
      color = 'text-ops-amber';
      icon = '■';
      break;
    case 'cancelled':
    case 'rejected':
    case 'failed':
      color = 'text-ops-red';
      icon = '■';
      break;
  }
  return (
    <span className={`inline-flex items-center space-x-1.5 ${color} uppercase tracking-wider text-[11px] font-medium`}>
      <span className="text-[9px] leading-none">{icon}</span>
      <span>{status.replace('_', ' ')}</span>
    </span>
  );
};

function App() {
  const defaultUserId = localStorage.getItem('relay_active_user') || 'usr_1';
  const [currentUser, setCurrentUser] = useState(USERS.find(u => u.id === defaultUserId) || USERS[0]);
  const [currentView, setCurrentView] = useState('event'); // 'event' or 'global_vendors'
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // Edit States
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ budget_total: 0, budget_spent: 0 });
  const [budgetError, setBudgetError] = useState(null);

  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState({ status: '', quote: 0 });
  const [vendorError, setVendorError] = useState(null);

  // Recovery Plan States
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [recoveryPlan, setRecoveryPlan] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [executingOptionId, setExecutingOptionId] = useState(null);
  const [executionMessage, setExecutionMessage] = useState(null);
  const [traceEvents, setTraceEvents] = useState([]);
  const [negotiationActive, setNegotiationActive] = useState(false);
  const traceEndRef = useRef(null);
  const prevGuestCountRef = useRef(null);
  const [guestCountAnimating, setGuestCountAnimating] = useState(false);

  // Modal States
  const [showDisruptionModal, setShowDisruptionModal] = useState(false);
  const [disruptionForm, setDisruptionForm] = useState({ type: 'vendor_cancellation', severity: 'high', description: '' });
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [importForm, setImportForm] = useState({ domain: 'budget', csv_data: '' });
  const [importResult, setImportResult] = useState(null);

  const [activeDisruptions, setActiveDisruptions] = useState([]);

  // Global Vendors State
  const [gVendors, setGVendors] = useState([]);
  const [loadingGVendors, setLoadingGVendors] = useState(false);
  const [gVendorSearch, setGVendorSearch] = useState('');
  const [gVendorFormOpen, setGVendorFormOpen] = useState(false);
  const [gVendorForm, setGVendorForm] = useState({ name: '', category: 'catering', base_quote: 0 });

  // Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [vendorToAssign, setVendorToAssign] = useState(null);
  const [accountEvents, setAccountEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [assignError, setAssignError] = useState(null);

  const loadGlobalVendors = async () => {
    try {
      setLoadingGVendors(true);
      const res = await getGlobalVendors();
      setGVendors(res);
    } catch(err) {
      console.error(err);
    } finally {
      setLoadingGVendors(false);
    }
  };

  useEffect(() => {
    if (currentView === 'global_vendors') {
      loadGlobalVendors();
    }
  }, [currentView, currentUser]);

  const handleOpenAssignModal = async (vendor) => {
    setVendorToAssign(vendor);
    setAssignError(null);
    setAssignModalOpen(true);
    try {
      const events = await getEvents();
      setAccountEvents(events);
      if (events.length > 0) {
        setSelectedEventId(events[0]._id);
      }
    } catch (err) {
      setAssignError("Failed to load events.");
    }
  };

  useEffect(() => {
    if (traceEndRef.current) {
      traceEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [traceEvents, negotiationActive]);

  useEffect(() => {
    if (data && data.event) {
      if (prevGuestCountRef.current !== null && prevGuestCountRef.current !== data.event.guest_count) {
        setGuestCountAnimating(true);
        setTimeout(() => setGuestCountAnimating(false), 2000);
      }
      prevGuestCountRef.current = data.event.guest_count;
    }
  }, [data]);

  const handleResetDemo = async () => {
    if (isResetting) return;
    try {
      setIsResetting(true);
      await fetch(`http://localhost:3001/event/${EVENT_ID}/reset`, { method: 'POST' });
      setTraceEvents([]);
      setRecoveryPlan(null);
      setDecisions([]);
      setExecutingOptionId(null);
      setExecutionMessage(null);
      setNegotiationActive(false);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getEvent(EVENT_ID);
      const decisionsResult = await getDecisions(EVENT_ID).catch(() => []);
      const disruptionsResult = await getDisruptions(EVENT_ID).catch(() => []);
      setData(result);
      setDecisions(decisionsResult);
      setActiveDisruptions(disruptionsResult);
      setBudgetForm({
        budget_total: result.event.budget_total,
        budget_spent: result.event.budget_spent
      });
      setError(null);
    } catch (err) {
      setError(err.message || "Unable to load event data.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    const user = USERS.find(u => u.id === userId);
    setCurrentUser(user);
    localStorage.setItem('relay_active_user', userId);
    // Reload data with new user context
    setTraceEvents([]);
    setRecoveryPlan(null);
    setDecisions([]);
    setExecutingOptionId(null);
    setExecutionMessage(null);
    setNegotiationActive(false);
    setTimeout(loadData, 0); // Need to wait for localStorage to settle if we did state stuff, though it's sync.
  };

  useEffect(() => {
    loadData();
    
    const ws = new WebSocket(`ws://localhost:8000/ws/${EVENT_ID}`);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        msg.timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        if (msg.type === 'agent.thought' || msg.type === 'agent.tool_call') {
          setTraceEvents(prev => [...prev, msg]);
        } else if (msg.type === 'agent.recommendation') {
          setRecoveryPlan(msg.data);
          setNegotiationActive(false);
          setGeneratingPlan(false);
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };
    return () => ws.close();
  }, []);

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    setBudgetError(null);
    try {
      await updateEventBudget(EVENT_ID, {
        budget_total: Number(budgetForm.budget_total),
        budget_spent: Number(budgetForm.budget_spent)
      });
      setEditingBudget(false);
      loadData();
    } catch (err) {
      setBudgetError("Unable to update budget.");
    }
  };

  const handleVendorSubmit = async (e, vendorId) => {
    e.preventDefault();
    setVendorError(null);
    try {
      await updateVendor(EVENT_ID, vendorId, {
        status: vendorForm.status,
        quote: Number(vendorForm.quote)
      });
      setEditingVendor(null);
      loadData();
    } catch (err) {
      setVendorError("Unable to update vendor.");
    }
  };

  const handleSimulateDisruption = async () => {
    try {
      setLoading(true);
      await cancelVendor(EVENT_ID, 'ven_catering_1');
      await loadData();
    } catch (err) {
      setError("Unable to simulate disruption.");
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setGeneratingPlan(true);
      setNegotiationActive(true);
      setTraceEvents([]);
      setRecoveryPlan(null);
      await generateRecoveryPlan(EVENT_ID, {
        type: 'vendor_cancellation',
        vendor_id: 'ven_catering_1'
      });
      // State reset happens in WS handler
    } catch (err) {
      console.error(err);
      setGeneratingPlan(false);
      setNegotiationActive(false);
    }
  };

  const handleAddGuests = async () => {
    try {
      await incrementHeadcount(EVENT_ID, 12);
      await loadData();
    } catch (err) {
      console.error("Failed to add guests:", err);
    }
  };

  const handleReportDisruptionSubmit = async (e) => {
    e.preventDefault();
    try {
      setGeneratingPlan(true); // Treat as generating plan right away to reflect UI state
      const disruption = await reportDisruption(EVENT_ID, disruptionForm);
      setShowDisruptionModal(false);
      setDisruptionForm({ type: 'vendor_cancellation', severity: 'high', description: '' });
      await loadData();
      
      setNegotiationActive(true);
      setTraceEvents([]);
      setRecoveryPlan(null);
      await generateRecoveryPlan(EVENT_ID, disruption);
    } catch (err) {
      console.error(err);
      setGeneratingPlan(false);
      setNegotiationActive(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await importData(EVENT_ID, importForm);
      setImportResult(res.message);
      setImportForm({ domain: 'budget', csv_data: '' });
      await loadData();
    } catch (err) {
      setImportResult(err.message);
    }
  };

  const handleApproveAndExecute = async (opt) => {
    try {
      setExecutingOptionId(opt.option_id);
      setExecutionMessage({ text: 'Executing recovery action...', type: 'loading' });
      await executeDecision(EVENT_ID, opt.option_id, {
        type: 'vendor_cancellation',
        vendor_id: 'ven_catering_1'
      }, opt);
      setExecutionMessage({ text: '✓ Recovery action executed', type: 'success' });
      setTimeout(() => {
        setExecutionMessage(null);
        setRecoveryPlan(null);
        loadData();
        setExecutingOptionId(null);
      }, 1500);
    } catch (err) {
      setExecutionMessage({ text: `Recovery action failed: ${err.message}`, type: 'error' });
      setExecutingOptionId(null);
    }
  };

  if (loading && !data) return <div className="min-h-screen bg-slate-950 text-slate-300 p-8 flex items-center justify-center">Loading event...</div>;
  if (error && currentView === 'event') return <div className="min-h-screen bg-slate-950 text-red-500 p-8 flex items-center justify-center">{error}</div>;
  if (!data || !data.event) return null;

  const { event, vendors, guests } = data;
  const remainingBudget = event.budget_total - event.budget_spent;

  return (
    <div className="min-h-screen bg-ops-base text-ops-text font-sans">
      {/* Header */}
      <header className="border-b border-ops-border bg-ops-panel p-6 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div>
            <h2 className="text-[10px] font-medium tracking-widest text-ops-muted uppercase mb-1">Relay / Event Operations Terminal</h2>
            <h1 className="text-2xl font-semibold text-ops-text">{event.name}</h1>
            <p className="text-sm text-ops-muted font-mono">{new Date(event.date).toISOString().split('T')[0]}</p>
          </div>
          <div className="flex space-x-2 border-l border-ops-border pl-6">
            <button 
              onClick={() => setCurrentView('event')}
              className={`text-xs uppercase tracking-wider font-medium px-4 py-2 rounded-sm transition-colors ${currentView === 'event' ? 'bg-ops-border text-ops-text' : 'text-ops-muted hover:text-ops-text'}`}
            >
              Event Dashboard
            </button>
            <button 
              onClick={() => setCurrentView('global_vendors')}
              className={`text-xs uppercase tracking-wider font-medium px-4 py-2 rounded-sm transition-colors ${currentView === 'global_vendors' ? 'bg-ops-border text-ops-text' : 'text-ops-muted hover:text-ops-text'}`}
            >
              Central Vendors
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <StatusIndicator status={event.status} />
          
          <select 
            value={currentUser.id} 
            onChange={handleUserChange}
            className="text-xs bg-ops-base border border-ops-border text-ops-text p-1.5 focus:outline-none focus:border-ops-muted rounded-sm font-medium uppercase tracking-wider"
          >
            {USERS.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>

          <button 
            onClick={() => setShowDisruptionModal(true)}
            className="text-xs bg-ops-red text-ops-base hover:bg-ops-red/80 px-3 py-1.5 transition-colors font-medium rounded-sm uppercase tracking-wider"
          >
            Report Disruption
          </button>

          <button 
            onClick={() => setShowImportModal(true)}
            className="text-xs border border-ops-border bg-ops-base hover:bg-ops-panel text-ops-text px-3 py-1.5 transition-colors font-medium rounded-sm uppercase tracking-wider"
          >
            Import Data
          </button>

          <button 
            onClick={handleResetDemo}
            disabled={isResetting}
            className="text-xs border border-ops-border bg-ops-base hover:bg-ops-border text-ops-text px-3 py-1.5 transition-colors disabled:opacity-50 flex items-center rounded-sm"
          >
            {isResetting ? (
              <><span className="inline-block w-3 h-3 border border-ops-text border-t-transparent animate-spin mr-2 align-middle"></span> Resetting</>
            ) : (
              'Reset Demo'
            )}
          </button>
        </div>
      </header>

      {currentView === 'global_vendors' ? (
        <main className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-ops-text uppercase tracking-wider">Central Vendor Database</h2>
            {currentUser.role === 'admin' && (
              <button 
                onClick={() => setGVendorFormOpen(true)}
                className="text-xs bg-ops-teal text-ops-base px-4 py-2 rounded-sm uppercase tracking-wider font-medium hover:bg-ops-teal/80 transition-colors"
              >
                Add Vendor
              </button>
            )}
          </div>
          <div className="bg-ops-panel border border-ops-border rounded-sm p-4">
            <input 
              type="text" 
              placeholder="Search vendors..."
              className="w-full bg-ops-base border border-ops-border rounded-sm p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted mb-4"
              value={gVendorSearch}
              onChange={e => setGVendorSearch(e.target.value)}
            />
            {loadingGVendors ? (
              <div className="text-center p-8 text-ops-muted text-sm">Loading vendors...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ops-border text-[10px] uppercase tracking-wider text-ops-muted">
                    <th className="p-3 font-medium">Vendor</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium text-right">Base Quote</th>
                    <th className="p-3 font-medium text-center">Assigned Events</th>
                    <th className="p-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ops-border/50 text-sm">
                  {gVendors.filter(v => v.name.toLowerCase().includes(gVendorSearch.toLowerCase())).map(v => (
                    <tr key={v._id} className="hover:bg-ops-border/30 transition-colors">
                      <td className="p-3">
                        <div className="font-medium text-ops-text">{v.name}</div>
                        <div className="text-[10px] text-ops-muted font-mono">{v._id}</div>
                      </td>
                      <td className="p-3 text-ops-muted capitalize">{v.category}</td>
                      <td className="p-3 text-right font-mono text-ops-text">₹{v.base_quote.toLocaleString()}</td>
                      <td className="p-3 text-center text-ops-muted">{v.cost_history?.length || 0}</td>
                      <td className="p-3 text-right space-x-2">
                        {currentUser.role !== 'planner' && (
                          <button 
                            onClick={() => handleOpenAssignModal(v)}
                            className="text-[10px] uppercase tracking-wider border border-ops-teal text-ops-teal px-2 py-1 rounded-sm hover:bg-ops-teal hover:text-ops-base transition-colors"
                          >
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {gVendors.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-ops-muted text-sm">No vendors found in central database.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      ) : (
        <main className="p-6 max-w-7xl mx-auto space-y-6">
          {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-ops-panel border border-ops-border rounded-sm p-4">
            <p className="text-xs uppercase tracking-wider text-ops-muted mb-2">Guests</p>
            <p className="text-2xl font-mono text-ops-text">{event.guest_count}</p>
          </div>
          <div className="bg-ops-panel border border-ops-border rounded-sm p-4">
            <p className="text-xs uppercase tracking-wider text-ops-muted mb-2">Budget</p>
            <p className="text-2xl font-mono text-ops-text text-right">₹{event.budget_total.toLocaleString()}</p>
          </div>
          <div className="bg-ops-panel border border-ops-border rounded-sm p-4">
            <p className="text-xs uppercase tracking-wider text-ops-muted mb-2">Spent</p>
            <p className="text-2xl font-mono text-ops-text text-right">₹{event.budget_spent.toLocaleString()}</p>
          </div>
          <div className="bg-ops-panel border border-ops-border rounded-sm p-4">
            <p className="text-xs uppercase tracking-wider text-ops-muted mb-2">Remaining</p>
            <p className={`text-2xl font-mono text-right ${remainingBudget < 0 ? 'text-ops-red' : 'text-ops-teal'}`}>
              ₹{remainingBudget.toLocaleString()}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area: Vendors */}
          <section className="lg:col-span-2 bg-ops-panel border border-ops-border rounded-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-ops-border flex justify-between items-center bg-ops-panel/50">
              <h3 className="text-sm uppercase tracking-wider text-ops-text font-medium">Vendors</h3>
            </div>
            
            {vendors.length === 0 ? (
              <div className="p-8 text-center text-ops-muted">No vendors found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-ops-border bg-ops-base/50 text-[10px] uppercase tracking-wider text-ops-muted">
                      <th className="p-3 font-medium">Vendor Name</th>
                      <th className="p-3 font-medium">Category</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium text-right">Quote</th>
                      <th className="p-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ops-border/50 text-sm">
                    {vendors.map(v => (
                      <tr key={v._id} className="hover:bg-ops-border/30 transition-colors">
                        <td className="p-3 text-ops-text font-medium">{v.name}</td>
                        <td className="p-3 text-ops-muted capitalize">{v.category}</td>
                        <td className="p-3">
                          {editingVendor === v._id ? (
                            <select 
                              className="bg-ops-base border border-ops-border text-xs rounded-sm p-1 text-ops-text focus:outline-none focus:border-ops-muted"
                              value={vendorForm.status}
                              onChange={e => setVendorForm({...vendorForm, status: e.target.value})}
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="backup_candidate">Backup</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          ) : (
                            <StatusIndicator status={v.status} />
                          )}
                        </td>
                        <td className="p-3 text-right text-ops-text font-mono">
                          {editingVendor === v._id ? (
                            <input 
                              type="number"
                              className="w-20 bg-ops-base border border-ops-border text-xs rounded-sm p-1 text-right focus:outline-none focus:border-ops-muted"
                              value={vendorForm.quote}
                              onChange={e => setVendorForm({...vendorForm, quote: e.target.value})}
                            />
                          ) : (
                            `₹${v.quote.toLocaleString()}`
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {editingVendor === v._id ? (
                            <div className="flex justify-end space-x-3">
                              <button onClick={(e) => handleVendorSubmit(e, v._id)} className="text-[10px] uppercase tracking-wider text-ops-teal hover:text-white">Save</button>
                              <button onClick={() => setEditingVendor(null)} className="text-[10px] uppercase tracking-wider text-ops-muted hover:text-white">Cancel</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setEditingVendor(v._id);
                                setVendorForm({ status: v.status, quote: v.quote });
                              }}
                              className="text-[10px] uppercase tracking-wider text-ops-muted hover:text-white font-medium"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {vendorError && <div className="p-3 text-xs text-ops-red bg-ops-red/10 border-t border-ops-red/20">{vendorError}</div>}
              </div>
            )}
          </section>

          {/* Secondary Area: Event Overview */}
          <section className="bg-ops-panel border border-ops-border rounded-sm p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm uppercase tracking-wider text-ops-text font-medium">Event Overview</h3>
              {!editingBudget && (
                <button 
                  onClick={() => setEditingBudget(true)}
                  className="text-[10px] uppercase tracking-wider text-ops-muted hover:text-white font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="space-y-4 flex-grow">
              {editingBudget ? (
                <form onSubmit={handleBudgetSubmit} className="space-y-3 bg-ops-base p-4 rounded-sm border border-ops-border">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">Total Budget</label>
                    <input 
                      type="number" 
                      className="w-full bg-ops-panel border border-ops-border rounded-sm p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted font-mono"
                      value={budgetForm.budget_total}
                      onChange={e => setBudgetForm({...budgetForm, budget_total: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">Budget Spent</label>
                    <input 
                      type="number" 
                      className="w-full bg-ops-panel border border-ops-border rounded-sm p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted font-mono"
                      value={budgetForm.budget_spent}
                      onChange={e => setBudgetForm({...budgetForm, budget_spent: e.target.value})}
                    />
                  </div>
                  {budgetError && <p className="text-xs text-ops-red">{budgetError}</p>}
                  <div className="flex space-x-2 pt-2">
                    <button type="submit" className="flex-1 bg-ops-border hover:bg-ops-muted text-ops-text text-xs uppercase tracking-wider font-medium py-2 rounded-sm transition-colors">
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setEditingBudget(false)} className="flex-1 bg-ops-base border border-ops-border hover:bg-ops-panel text-ops-muted text-xs uppercase tracking-wider font-medium py-2 rounded-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-ops-border/50 pb-2">
                    <span className="text-ops-muted text-sm">Guest Count</span>
                    <span className={`text-sm font-mono transition-colors duration-300 ${guestCountAnimating ? 'text-ops-teal font-bold' : 'text-ops-text'}`}>
                      {event.guest_count} <span className="text-ops-muted text-xs">/ {guests.length} RSVP</span>
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-ops-border/50 pb-2">
                    <span className="text-ops-muted text-sm">Total Budget</span>
                    <span className="text-ops-text text-sm font-mono">₹{event.budget_total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-ops-border/50 pb-2">
                    <span className="text-ops-muted text-sm">Spent</span>
                    <span className="text-ops-text text-sm font-mono">₹{event.budget_spent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-ops-border/50 pb-2">
                    <span className="text-ops-muted text-sm">Remaining</span>
                    <span className={`text-sm font-mono ${remainingBudget < 0 ? 'text-ops-red' : 'text-ops-teal'}`}>
                      ₹{remainingBudget.toLocaleString()}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-ops-base h-1.5 mt-2 overflow-hidden">
                    <div 
                      className={`h-full ${remainingBudget < 0 ? 'bg-ops-red' : 'bg-ops-teal'}`} 
                      style={{ width: `${Math.min((event.budget_spent / event.budget_total) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-ops-border">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[10px] uppercase tracking-wider text-ops-muted font-medium">Activity Stream</h4>
                <div className="space-x-2">
                  <button 
                    onClick={handleAddGuests}
                    disabled={!negotiationActive}
                    className="text-[10px] border border-ops-border bg-ops-base hover:bg-ops-border text-ops-text px-2 py-1 tracking-wider uppercase font-medium disabled:opacity-50 transition-colors"
                  >
                    +12 Guests
                  </button>
                  <button 
                    onClick={handleSimulateDisruption}
                    className="text-[10px] border border-ops-border bg-ops-base hover:bg-ops-border text-ops-text px-2 py-1 tracking-wider uppercase font-medium transition-colors"
                  >
                    Simulate Disruption
                  </button>
                </div>
              </div>
              <div className="bg-ops-base border border-ops-border rounded-sm p-4 text-center">
                {vendors.some(v => v.status === 'cancelled') ? (
                  <div className="text-sm text-ops-amber text-left space-y-2">
                    {vendors.filter(v => v.status === 'cancelled').map(v => {
                      const isResolved = decisions.some(d => d.status === 'executed' && d.disruption?.vendor_id === v._id);
                      return (
                        <div key={v._id} className="bg-ops-panel border-l-2 border-ops-amber p-3 flex flex-col items-start space-y-2">
                          <span className="font-mono text-xs uppercase text-ops-text">Disruption: {v.category} cancelled ({v.name})</span>
                          {!recoveryPlan && !negotiationActive && !isResolved && (
                            <button 
                              onClick={handleGeneratePlan}
                              disabled={generatingPlan}
                              className="text-[10px] border border-ops-border bg-ops-base hover:bg-ops-border text-ops-text px-3 py-1 uppercase tracking-wider font-medium transition-colors disabled:opacity-50"
                            >
                              {generatingPlan ? 'Generating Plan...' : 'Generate Recovery Plan'}
                            </button>
                          )}
                          {isResolved && (
                            <span className="text-[10px] uppercase text-ops-teal tracking-wider font-medium">■ Disruption Resolved</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-ops-muted uppercase tracking-wider">No active disruptions</p>
                )}
                
                {(traceEvents.length > 0 || (negotiationActive && !recoveryPlan)) && (
                  <div className="mt-4 text-left border border-ops-border bg-ops-panel p-3">
                    <h5 className="text-[10px] text-ops-muted uppercase tracking-widest mb-2 font-medium border-b border-ops-border pb-1">Agent Telemetry</h5>
                    <div className="space-y-1 overflow-y-auto max-h-48 pr-2 scrollbar-thin scrollbar-thumb-ops-border">
                      {traceEvents.map((evt, idx) => (
                        <div key={idx} className="text-xs font-mono text-ops-text flex space-x-2">
                          <span className="text-ops-muted">[{evt.timestamp || '00:00:00'}]</span>
                          {evt.type === 'agent.tool_call' ? (
                            <span className="text-ops-amber">{'[TOOL]'}</span>
                          ) : (
                            <span className="text-ops-teal">{'[AGENT]'}</span>
                          )}
                          <span className="text-ops-text">{evt.data}</span>
                        </div>
                      ))}
                      {negotiationActive && !recoveryPlan && (
                        <div className="text-xs font-mono text-ops-muted flex space-x-2 mt-1">
                          <span>[--:--:--]</span>
                          <span className="text-ops-text">{'[SYSTEM]'}</span>
                          <span className="animate-pulse flex items-center">Awaiting response<span className="animate-pulse ml-1 opacity-70">_</span></span>
                        </div>
                      )}
                      <div ref={traceEndRef} />
                    </div>
                  </div>
                )}
                
                {recoveryPlan && (
                  <div className={`mt-4 text-left border border-ops-border bg-ops-panel p-4 transition-opacity duration-300 ${executingOptionId !== null ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h5 className="text-[10px] font-medium text-ops-teal uppercase tracking-widest mb-3 border-b border-ops-border pb-1">AI Recovery Plan</h5>
                    <p className="text-sm text-ops-text mb-4">{recoveryPlan.summary}</p>
                    
                    <div className="space-y-3">
                      {recoveryPlan.options.map((opt, i) => (
                        <div key={i} className={`p-4 rounded-sm border ${opt.recommended ? 'border-ops-teal bg-ops-base' : 'border-ops-border bg-ops-base/50'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h6 className="font-semibold text-ops-text text-sm">
                              {opt.title} 
                              {opt.recommended && <span className="text-[10px] bg-ops-teal text-ops-base px-1.5 py-0.5 rounded-sm ml-2 uppercase tracking-wider">Recommended</span>}
                            </h6>
                            <span className="text-xs font-mono text-ops-text">Est: ₹{opt.estimated_cost_change.toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-ops-muted mb-4">{opt.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="border-t border-ops-border pt-2">
                              <strong className="text-ops-teal block mb-1 uppercase tracking-widest text-[9px]">Pros</strong>
                              <ul className="list-disc pl-3 text-ops-text space-y-1">
                                {opt.pros.map((p, j) => <li key={j}>{p}</li>)}
                              </ul>
                            </div>
                            <div className="border-t border-ops-border pt-2">
                              <strong className="text-ops-red block mb-1 uppercase tracking-widest text-[9px]">Cons</strong>
                              <ul className="list-disc pl-3 text-ops-text space-y-1">
                                {opt.cons.map((c, j) => <li key={j}>{c}</li>)}
                              </ul>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-ops-border text-right">
                            <button 
                              onClick={() => handleApproveAndExecute(opt)}
                              disabled={executingOptionId !== null || currentUser.role === 'planner'}
                              title={currentUser.role === 'planner' ? 'Planners cannot approve recovery actions' : ''}
                              className={`text-xs px-4 py-1.5 rounded-sm uppercase tracking-wider font-medium transition-colors ${opt.recommended ? 'bg-ops-teal text-ops-base hover:bg-ops-teal/80' : 'bg-ops-border text-ops-text hover:bg-ops-muted'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {executingOptionId === opt.option_id ? 'Executing' : 'Execute'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {executionMessage && (
                  <div className={`mt-4 p-3 rounded-sm text-sm text-left border font-mono ${executionMessage.type === 'error' ? 'bg-ops-red/10 border-ops-red text-ops-red' : executionMessage.type === 'success' ? 'bg-ops-teal/10 border-ops-teal text-ops-teal' : 'bg-ops-amber/10 border-ops-amber text-ops-amber'}`}>
                    {executionMessage.text}
                  </div>
                )}
                
                {decisions.length > 0 && (
                  <div className="mt-4 text-left border-t border-ops-border pt-4">
                    <h5 className="text-[10px] font-medium text-ops-muted uppercase tracking-wider mb-2">Decisions Log</h5>
                    <div className="space-y-2">
                      {decisions.map(d => (
                        <div key={d._id} className="text-xs font-mono bg-ops-base border border-ops-border p-2 rounded-sm flex justify-between items-center">
                          <span className="text-ops-text">Human approved: {d.option_id.replace(/_/g, ' ')}</span>
                          <span className={`px-2 py-0.5 rounded-sm uppercase tracking-wider text-[9px] ${d.status === 'executed' ? 'bg-ops-teal text-ops-base' : d.status === 'failed' ? 'bg-ops-red text-ops-base' : 'bg-ops-panel text-ops-muted'}`}>{d.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      )}

      {/* Modals */}
      {showDisruptionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-ops-panel border border-ops-border p-6 rounded-sm w-[400px]">
            <h3 className="text-lg font-medium text-ops-text uppercase tracking-wider mb-4 border-b border-ops-border pb-2">Report Disruption</h3>
            <form onSubmit={handleReportDisruptionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">Type</label>
                <select 
                  className="w-full bg-ops-base border border-ops-border p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted rounded-sm"
                  value={disruptionForm.type}
                  onChange={e => setDisruptionForm({...disruptionForm, type: e.target.value})}
                >
                  <option value="vendor_cancellation">Vendor Cancellation</option>
                  <option value="budget_change">Budget Change</option>
                  <option value="headcount_change">Headcount Change</option>
                  <option value="timeline_conflict">Timeline Conflict</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">Severity</label>
                <select 
                  className="w-full bg-ops-base border border-ops-border p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted rounded-sm"
                  value={disruptionForm.severity}
                  onChange={e => setDisruptionForm({...disruptionForm, severity: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">Description</label>
                <textarea 
                  className="w-full bg-ops-base border border-ops-border p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted rounded-sm min-h-[80px]"
                  value={disruptionForm.description}
                  onChange={e => setDisruptionForm({...disruptionForm, description: e.target.value})}
                  placeholder="Describe the disruption..."
                  required
                />
              </div>
              {disruptionForm.type === 'vendor_cancellation' && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">Vendor ID</label>
                  <input 
                    type="text"
                    className="w-full bg-ops-base border border-ops-border p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted rounded-sm font-mono"
                    value={disruptionForm.vendor_id || ''}
                    onChange={e => setDisruptionForm({...disruptionForm, vendor_id: e.target.value})}
                    placeholder="ven_catering_1"
                  />
                </div>
              )}
              <div className="flex space-x-3 pt-4 border-t border-ops-border">
                <button type="submit" className="flex-1 bg-ops-red hover:bg-ops-red/80 text-ops-base text-xs uppercase tracking-wider font-medium py-2 rounded-sm transition-colors">
                  Report
                </button>
                <button type="button" onClick={() => setShowDisruptionModal(false)} className="flex-1 bg-ops-base border border-ops-border hover:bg-ops-panel text-ops-muted text-xs uppercase tracking-wider font-medium py-2 rounded-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-ops-panel border border-ops-border p-6 rounded-sm w-[500px]">
            <h3 className="text-lg font-medium text-ops-text uppercase tracking-wider mb-4 border-b border-ops-border pb-2">Import Data</h3>
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">Domain</label>
                <select 
                  className="w-full bg-ops-base border border-ops-border p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted rounded-sm"
                  value={importForm.domain}
                  onChange={e => setImportForm({...importForm, domain: e.target.value})}
                >
                  <option value="budget">Budget</option>
                  <option value="vendors">Vendors</option>
                  <option value="timeline">Timeline</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">CSV Data Payload</label>
                <textarea 
                  className="w-full bg-ops-base border border-ops-border p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted rounded-sm min-h-[150px] font-mono text-xs whitespace-pre"
                  value={importForm.csv_data}
                  onChange={e => setImportForm({...importForm, csv_data: e.target.value})}
                  placeholder="Paste CSV text here..."
                  required
                />
              </div>
              {importResult && <div className="text-xs text-ops-teal font-mono bg-ops-teal/10 p-2 border border-ops-teal/20 rounded-sm">{importResult}</div>}
              <div className="flex space-x-3 pt-4 border-t border-ops-border">
                <button type="submit" className="flex-1 bg-ops-teal hover:bg-ops-teal/80 text-ops-base text-xs uppercase tracking-wider font-medium py-2 rounded-sm transition-colors">
                  Import
                </button>
                <button type="button" onClick={() => { setShowImportModal(false); setImportResult(null); }} className="flex-1 bg-ops-base border border-ops-border hover:bg-ops-panel text-ops-muted text-xs uppercase tracking-wider font-medium py-2 rounded-sm transition-colors">
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {gVendorFormOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-ops-panel border border-ops-border p-6 rounded-sm w-[400px]">
            <h3 className="text-lg font-medium text-ops-text uppercase tracking-wider mb-4 border-b border-ops-border pb-2">Create Global Vendor</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await createGlobalVendor(gVendorForm);
                setGVendorFormOpen(false);
                setGVendorForm({ name: '', category: 'catering', base_quote: 0 });
                loadGlobalVendors();
              } catch(err) {
                alert(err.message);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">Name</label>
                <input 
                  type="text"
                  className="w-full bg-ops-base border border-ops-border p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted rounded-sm"
                  value={gVendorForm.name}
                  onChange={e => setGVendorForm({...gVendorForm, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">Category</label>
                <input 
                  type="text"
                  className="w-full bg-ops-base border border-ops-border p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted rounded-sm"
                  value={gVendorForm.category}
                  onChange={e => setGVendorForm({...gVendorForm, category: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">Base Quote</label>
                <input 
                  type="number"
                  className="w-full bg-ops-base border border-ops-border p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted rounded-sm"
                  value={gVendorForm.base_quote}
                  onChange={e => setGVendorForm({...gVendorForm, base_quote: e.target.value})}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4 border-t border-ops-border">
                <button type="submit" className="flex-1 bg-ops-teal hover:bg-ops-teal/80 text-ops-base text-xs uppercase tracking-wider font-medium py-2 rounded-sm transition-colors">
                  Create
                </button>
                <button type="button" onClick={() => setGVendorFormOpen(false)} className="flex-1 bg-ops-base border border-ops-border hover:bg-ops-panel text-ops-muted text-xs uppercase tracking-wider font-medium py-2 rounded-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignModalOpen && vendorToAssign && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-ops-panel border border-ops-border p-6 rounded-sm w-[400px]">
            <h3 className="text-lg font-medium text-ops-text uppercase tracking-wider mb-4 border-b border-ops-border pb-2">Assign Vendor</h3>
            
            <div className="mb-4 text-sm text-ops-text">
              <span className="text-ops-muted">Vendor:</span> <span className="font-medium">{vendorToAssign.name}</span>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setAssignError(null);
              if (!selectedEventId) return setAssignError("Please select an event.");
              try {
                await associateGlobalVendor(vendorToAssign._id, selectedEventId, vendorToAssign.base_quote);
                alert(`${vendorToAssign.name} associated with event successfully.`);
                setAssignModalOpen(false);
                setVendorToAssign(null);
                loadGlobalVendors();
              } catch(err) {
                setAssignError(err.message);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">Event</label>
                <select 
                  className="w-full bg-ops-base border border-ops-border p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted rounded-sm"
                  value={selectedEventId}
                  onChange={e => setSelectedEventId(e.target.value)}
                  required
                >
                  {accountEvents.map(evt => (
                    <option key={evt._id} value={evt._id}>{evt.name} ({evt._id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-ops-muted mb-1">Quote</label>
                <input 
                  type="number"
                  className="w-full bg-ops-base border border-ops-border p-2 text-sm text-ops-text focus:outline-none focus:border-ops-muted rounded-sm bg-opacity-50 cursor-not-allowed"
                  value={vendorToAssign.base_quote}
                  disabled
                />
              </div>
              
              {assignError && <div className="text-xs text-ops-red bg-ops-red/10 p-2 border border-ops-red/20 rounded-sm">{assignError}</div>}
              
              <div className="flex space-x-3 pt-4 border-t border-ops-border">
                <button type="submit" className="flex-1 bg-ops-teal hover:bg-ops-teal/80 text-ops-base text-xs uppercase tracking-wider font-medium py-2 rounded-sm transition-colors">
                  Assign
                </button>
                <button type="button" onClick={() => { setAssignModalOpen(false); setVendorToAssign(null); }} className="flex-1 bg-ops-base border border-ops-border hover:bg-ops-panel text-ops-muted text-xs uppercase tracking-wider font-medium py-2 rounded-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
