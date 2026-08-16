import React, { useState, useEffect, useRef } from 'react';
import { getEvent, updateEventBudget, updateVendor, cancelVendor, generateRecoveryPlan, getDecisions, executeDecision, incrementHeadcount } from './api/eventApi';

const EVENT_ID = 'evt_1';

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
      const result = await getEvent(EVENT_ID);
      const decisionsResult = await getDecisions(EVENT_ID).catch(() => []);
      setData(result);
      setDecisions(decisionsResult);
      setBudgetForm({
        budget_total: result.event.budget_total,
        budget_spent: result.event.budget_spent
      });
      setError(null);
    } catch (err) {
      setError("Unable to load event data.");
    } finally {
      setLoading(false);
    }
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
  if (error) return <div className="min-h-screen bg-slate-950 text-red-500 p-8 flex items-center justify-center">{error}</div>;
  if (!data || !data.event) return null;

  const { event, vendors, guests } = data;
  const remainingBudget = event.budget_total - event.budget_spent;

  return (
    <div className="min-h-screen bg-ops-base text-ops-text font-sans">
      {/* Header */}
      <header className="border-b border-ops-border bg-ops-panel p-6 flex justify-between items-center">
        <div>
          <h2 className="text-[10px] font-medium tracking-widest text-ops-muted uppercase mb-1">Relay / Event Operations Terminal</h2>
          <h1 className="text-2xl font-semibold text-ops-text">{event.name}</h1>
          <p className="text-sm text-ops-muted font-mono">{new Date(event.date).toISOString().split('T')[0]}</p>
        </div>
        <div className="flex items-center">
          <StatusIndicator status={event.status} />
          <button 
            onClick={handleResetDemo}
            disabled={isResetting}
            className="ml-6 text-xs border border-ops-border bg-ops-base hover:bg-ops-border text-ops-text px-3 py-1.5 transition-colors disabled:opacity-50 flex items-center rounded-sm"
          >
            {isResetting ? (
              <><span className="inline-block w-3 h-3 border border-ops-text border-t-transparent animate-spin mr-2 align-middle"></span> Resetting</>
            ) : (
              'Reset Demo'
            )}
          </button>
        </div>
      </header>

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
                              disabled={executingOptionId !== null}
                              className={`text-xs px-4 py-1.5 rounded-sm uppercase tracking-wider font-medium transition-colors ${opt.recommended ? 'bg-ops-teal text-ops-base hover:bg-ops-teal/80' : 'bg-ops-border text-ops-text hover:bg-ops-muted'} disabled:opacity-50`}
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
    </div>
  );
}

export default App;
