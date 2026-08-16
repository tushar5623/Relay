import React, { useState, useEffect, useRef } from 'react';
import { getEvent, updateEventBudget, updateVendor, cancelVendor, generateRecoveryPlan, getDecisions, executeDecision, incrementHeadcount } from './api/eventApi';

const EVENT_ID = 'evt_1';

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

  const getStatusColor = (status) => {
    switch(status) {
      case 'on_track': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'at_risk': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'resolved': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'cancelled': return 'bg-rose-500/20 text-rose-400 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse';
      case 'backup_candidate': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]';
      case 'rejected': return 'bg-slate-700/50 text-slate-400 border-slate-600';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-1">Relay — Event Operations Agent</h2>
          <h1 className="text-2xl font-semibold text-white">{event.name}</h1>
          <p className="text-sm text-slate-500">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)} uppercase tracking-wider`}>
            {event.status.replace('_', ' ')}
          </span>
          <button 
            onClick={handleResetDemo}
            disabled={isResetting}
            className="ml-4 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition-colors border border-slate-700 disabled:opacity-50 flex-inline items-center"
          >
            {isResetting ? (
              <><span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin mr-2 align-middle"></span> Resetting...</>
            ) : (
              '↻ Reset Demo'
            )}
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-500 mb-1">Guests</p>
            <p className="text-3xl font-light text-white">{event.guest_count}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-500 mb-1">Budget</p>
            <p className="text-3xl font-light text-white">₹{event.budget_total.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-500 mb-1">Spent</p>
            <p className="text-3xl font-light text-white">₹{event.budget_spent.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-sm text-slate-500 mb-1">Remaining</p>
            <p className={`text-3xl font-light ${remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              ₹{remainingBudget.toLocaleString()}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area: Vendors */}
          <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-medium text-white">Vendors</h3>
            </div>
            
            {vendors.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No vendors found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/50 bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-medium">Vendor Name</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Quote</th>
                      <th className="p-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {vendors.map(v => (
                      <tr key={v._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 text-slate-300 font-medium">{v.name}</td>
                        <td className="p-4 text-slate-400 text-sm capitalize">{v.category}</td>
                        <td className="p-4">
                          {editingVendor === v._id ? (
                            <select 
                              className="bg-slate-950 border border-slate-700 text-xs rounded p-1 text-slate-300 focus:outline-none focus:border-indigo-500"
                              value={vendorForm.status}
                              onChange={e => setVendorForm({...vendorForm, status: e.target.value})}
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="backup_candidate">Backup</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 rounded text-[10px] font-semibold border uppercase tracking-wider ${getStatusColor(v.status)}`}>
                              {v.status.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right text-slate-300 font-mono text-sm">
                          {editingVendor === v._id ? (
                            <input 
                              type="number"
                              className="w-20 bg-slate-950 border border-slate-700 text-xs rounded p-1 text-right focus:outline-none focus:border-indigo-500"
                              value={vendorForm.quote}
                              onChange={e => setVendorForm({...vendorForm, quote: e.target.value})}
                            />
                          ) : (
                            `₹${v.quote.toLocaleString()}`
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {editingVendor === v._id ? (
                            <div className="flex justify-end space-x-2">
                              <button onClick={(e) => handleVendorSubmit(e, v._id)} className="text-xs text-emerald-400 hover:text-emerald-300">Save</button>
                              <button onClick={() => setEditingVendor(null)} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setEditingVendor(v._id);
                                setVendorForm({ status: v.status, quote: v.quote });
                              }}
                              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {vendorError && <div className="p-4 text-xs text-rose-400 bg-rose-500/10 border-t border-rose-500/20">{vendorError}</div>}
              </div>
            )}
          </section>

          {/* Secondary Area: Event Overview */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-white">Event Overview</h3>
              {!editingBudget && (
                <button 
                  onClick={() => setEditingBudget(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Edit Budget
                </button>
              )}
            </div>

            <div className="space-y-4 flex-grow">
              {editingBudget ? (
                <form onSubmit={handleBudgetSubmit} className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Total Budget</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={budgetForm.budget_total}
                      onChange={e => setBudgetForm({...budgetForm, budget_total: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Budget Spent</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      value={budgetForm.budget_spent}
                      onChange={e => setBudgetForm({...budgetForm, budget_spent: e.target.value})}
                    />
                  </div>
                  {budgetError && <p className="text-xs text-rose-400">{budgetError}</p>}
                  <div className="flex space-x-2 pt-2">
                    <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-2 rounded transition-colors">
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setEditingBudget(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-2 rounded transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500 text-sm">Guest Count</span>
                    <span className={`text-sm transition-colors duration-300 ${guestCountAnimating ? 'text-indigo-400 font-bold drop-shadow-[0_0_5px_rgba(99,102,241,0.8)]' : 'text-slate-300'}`}>
                      {event.guest_count} / {guests.length} RSVP
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500 text-sm">Total Budget</span>
                    <span className="text-slate-300 text-sm font-mono">₹{event.budget_total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500 text-sm">Spent</span>
                    <span className="text-slate-300 text-sm font-mono">₹{event.budget_spent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500 text-sm">Remaining</span>
                    <span className={`text-sm font-mono ${remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      ₹{remainingBudget.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Activity Stream</h4>
                <div className="space-x-2">
                  <button 
                    onClick={handleAddGuests}
                    disabled={!negotiationActive}
                    className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-500/30 px-2 py-1 rounded tracking-wider uppercase font-medium disabled:opacity-50"
                  >
                    +12 Guests
                  </button>
                  <button 
                    onClick={handleSimulateDisruption}
                    className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30 px-2 py-1 rounded tracking-wider uppercase font-medium"
                  >
                    Simulate Disruption
                  </button>
                </div>
              </div>
              <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded p-4 text-center">
                {vendors.some(v => v.status === 'cancelled') ? (
                  <div className="text-sm text-rose-400 text-left space-y-2">
                    {vendors.filter(v => v.status === 'cancelled').map(v => {
                      const isResolved = decisions.some(d => d.status === 'executed' && d.disruption?.vendor_id === v._id);
                      return (
                        <div key={v._id} className="bg-rose-500/10 p-3 rounded border border-rose-500/20">
                          <span className="font-semibold block mb-2">{v.category} vendor cancelled: {v.name}</span>
                          {!recoveryPlan && !negotiationActive && !isResolved && (
                            <button 
                              onClick={handleGeneratePlan}
                              disabled={generatingPlan}
                              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                            >
                              {generatingPlan ? 'Generating Plan...' : 'Generate Recovery Plan'}
                            </button>
                          )}
                          {isResolved && (
                            <span className="text-xs text-emerald-400 font-medium">✓ Disruption resolved</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No active disruptions</p>
                )}
                
                {(traceEvents.length > 0 || (negotiationActive && !recoveryPlan)) && (
                  <div className="mt-4 text-left border border-slate-700 bg-slate-900 rounded-lg p-3 shadow-inner">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reasoning Trace</h5>
                    <div className="space-y-2 overflow-y-auto max-h-48 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                      {traceEvents.map((evt, idx) => (
                        <div key={idx} className="text-xs font-mono bg-slate-950/50 p-2 rounded border border-slate-800/50">
                          {evt.type === 'agent.tool_call' ? (
                            <span className="text-indigo-400">⚡ <strong>Tool Call:</strong> {evt.data}</span>
                          ) : (
                            <span className="text-slate-300">🤔 <strong>Agent:</strong> {evt.data}</span>
                          )}
                        </div>
                      ))}
                      {negotiationActive && !recoveryPlan && (
                        <div className="text-xs font-mono text-indigo-400 animate-pulse p-2 flex items-center">
                           <span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></span> <em>Agent is reasoning...</em>
                        </div>
                      )}
                      <div ref={traceEndRef} />
                    </div>
                  </div>
                )}
                
                {recoveryPlan && (
                  <div className={`mt-4 text-left border border-indigo-500/30 bg-indigo-500/5 rounded-lg p-4 transition-opacity duration-300 ${executingOptionId !== null ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">AI Recovery Plan</h5>
                    <p className="text-sm text-slate-300 mb-4">{recoveryPlan.summary}</p>
                    
                    <div className="space-y-3">
                      {recoveryPlan.options.map((opt, i) => (
                        <div key={i} className={`p-4 rounded border shadow-lg ${opt.recommended ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-600 bg-slate-800/80'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h6 className="font-bold text-white text-base">{opt.title} {opt.recommended && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded ml-2 uppercase shadow-sm">Recommended</span>}</h6>
                            <span className="text-sm font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-1 rounded">Est. Cost: ₹{opt.estimated_cost_change.toLocaleString()}</span>
                          </div>
                          <p className="text-base text-white font-medium my-3 leading-relaxed border-l-2 border-indigo-500 pl-3">{opt.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/50 p-3 rounded mt-2 border border-slate-700/50">
                            <div>
                              <strong className="text-emerald-400 block mb-1 uppercase tracking-wider text-[10px]">Pros</strong>
                              <ul className="list-disc pl-3 text-slate-300 space-y-1">
                                {opt.pros.map((p, j) => <li key={j}>{p}</li>)}
                              </ul>
                            </div>
                            <div>
                              <strong className="text-rose-400 block mb-1 uppercase tracking-wider text-[10px]">Cons</strong>
                              <ul className="list-disc pl-3 text-slate-300 space-y-1">
                                {opt.cons.map((c, j) => <li key={j}>{c}</li>)}
                              </ul>
                            </div>
                          </div>
                          
                          <div className="mt-4 text-right">
                            <button 
                              onClick={() => handleApproveAndExecute(opt)}
                              disabled={executingOptionId !== null}
                              className={`text-sm px-6 py-2 rounded shadow-md transition-all font-bold ${opt.recommended ? 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-500/20' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'} disabled:opacity-50`}
                            >
                              {executingOptionId === opt.option_id ? 'Executing...' : 'Approve & Execute'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {executionMessage && (
                  <div className={`mt-4 p-3 rounded text-sm text-left border ${executionMessage.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : executionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                    {executionMessage.text}
                  </div>
                )}
                
                {decisions.length > 0 && (
                  <div className="mt-4 text-left border-t border-slate-800 pt-4">
                    <h5 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Activity Stream / Decisions</h5>
                    <div className="space-y-2">
                      {decisions.map(d => (
                        <div key={d._id} className="text-xs bg-slate-900 border border-slate-800 p-2 rounded flex justify-between items-center">
                          <span className="text-slate-300">Human approved: {d.option_id.replace(/_/g, ' ')}</span>
                          <span className={`px-2 py-0.5 rounded uppercase tracking-wider font-semibold text-[9px] ${d.status === 'executed' ? 'bg-emerald-500/20 text-emerald-400' : d.status === 'failed' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'}`}>{d.status}</span>
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
