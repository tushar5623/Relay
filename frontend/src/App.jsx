import React, { useState, useEffect, useRef } from 'react';
import { 
  getEvent, 
  getEvents, 
  updateEventBudget, 
  updateVendor, 
  cancelVendor, 
  generateRecoveryPlan, 
  getDecisions, 
  executeDecision, 
  incrementHeadcount, 
  reportDisruption, 
  getDisruptions, 
  importData, 
  getGlobalVendors, 
  createGlobalVendor, 
  updateGlobalVendor, 
  associateGlobalVendor, 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from './api/eventApi';

// Subcomponents
import { Navbar } from './components/Navbar';
import { HeroBand } from './components/HeroBand';
import { PortfolioView } from './components/PortfolioView';
import { EventOverview } from './components/EventOverview';
import { VendorTable } from './components/VendorTable';
import { AgentTelemetry } from './components/AgentTelemetry';
import { GlobalVendorsView } from './components/GlobalVendorsView';
import { ClientStatusView } from './components/ClientStatusView';
import { 
  ReportDisruptionModal, 
  ImportDataModal, 
  CreateGlobalVendorModal, 
  AssignGlobalVendorModal 
} from './components/Modals';
import { Toast } from './components/Toast';
import { LandingPage } from './components/LandingPage';

const USERS = [
  { id: 'usr_1', name: 'Alice Planner', role: 'planner' },
  { id: 'usr_2', name: 'Bob Approver', role: 'approver' },
  { id: 'usr_3', name: 'Charlie Admin', role: 'admin' },
];

export function App() {
  const defaultUserId = localStorage.getItem('relay_active_user') || 'usr_1';
  const [currentUser, setCurrentUser] = useState(USERS.find(u => u.id === defaultUserId) || USERS[0]);
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'portfolio', 'event', 'global_vendors', 'client_status'
  const [activeEventId, setActiveEventId] = useState(null);

  // Global toast state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info', title = '') => {
    setToast({ message, type, title });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Event Data State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // Budget & Vendor Edit States
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ budget_total: 0, budget_spent: 0 });
  const [budgetError, setBudgetError] = useState(null);

  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorForm, setVendorForm] = useState({ status: '', quote: 0 });
  const [vendorError, setVendorError] = useState(null);

  // AI & Recovery Plan States
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

  // Active Disruptions
  const [activeDisruptions, setActiveDisruptions] = useState([]);

  // Modals
  const [showDisruptionModal, setShowDisruptionModal] = useState(false);
  const [disruptionForm, setDisruptionForm] = useState({ type: 'vendor_cancellation', severity: 'high', description: '' });

  const [showImportModal, setShowImportModal] = useState(false);
  const [importForm, setImportForm] = useState({ domain: 'budget', csv_data: '' });
  const [importResult, setImportResult] = useState(null);

  // Global Vendors State
  const [gVendors, setGVendors] = useState([]);
  const [loadingGVendors, setLoadingGVendors] = useState(false);
  const [gVendorFormOpen, setGVendorFormOpen] = useState(false);
  const [gVendorForm, setGVendorForm] = useState({ name: '', category: 'catering', base_quote: 0 });

  // Assignment Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [vendorToAssign, setVendorToAssign] = useState(null);
  const [accountEvents, setAccountEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [assignError, setAssignError] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Portfolio list State
  const [portfolioEvents, setPortfolioEvents] = useState([]);
  const [portfolioSort, setPortfolioSort] = useState('date');
  const [portfolioFilter, setPortfolioFilter] = useState('all');

  // URL routing sync
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      if (path.startsWith('/event/')) {
        const parts = path.split('/');
        const id = parts[2];
        setActiveEventId(id);
        if (parts[3] === 'client-status') {
          setCurrentView('client_status');
        } else {
          setCurrentView('event');
        }
      } else if (path === '/global_vendors') {
        const params = new URLSearchParams(search);
        const eventId = params.get('eventId');
        setCurrentView('global_vendors');
        setActiveEventId(eventId || null);
      } else if (path === '/portfolio') {
        setCurrentView('portfolio');
        setActiveEventId(null);
      } else {
        setCurrentView('landing');
        setActiveEventId(null);
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view, eventId = null) => {
    setCurrentView(view);
    setActiveEventId(eventId);
    if (view === 'event') {
      window.history.pushState({}, '', `/event/${eventId}`);
    } else if (view === 'client_status') {
      window.history.pushState({}, '', `/event/${eventId}/client-status`);
    } else if (view === 'global_vendors') {
      if (eventId) {
        window.history.pushState({}, '', `/global_vendors?eventId=${eventId}`);
      } else {
        window.history.pushState({}, '', `/global_vendors`);
      }
    } else if (view === 'portfolio') {
      window.history.pushState({}, '', `/portfolio`);
    } else {
      window.history.pushState({}, '', `/`);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationAsRead(notif._id);
        setNotifications(notifications.map(n => n._id === notif._id ? { ...n, read: true } : n));
      } catch (err) {
        console.error(err);
      }
    }
    setNotificationsOpen(false);
    if (notif.event_id) {
      navigateTo('event', notif.event_id);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Load portfolio events
  const loadPortfolio = async () => {
    try {
      const evts = await getEvents();
      setPortfolioEvents(evts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (currentView === 'portfolio') {
      loadPortfolio();
    }
  }, [currentView, currentUser]);

  // Load global vendors
  const loadGlobalVendors = async () => {
    try {
      setLoadingGVendors(true);
      const res = await getGlobalVendors();
      setGVendors(res);
    } catch (err) {
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

  // Load active event data
  const loadData = async () => {
    if (!activeEventId) return;
    try {
      setLoading(true);
      setError(null);

      const result = await getEvent(activeEventId);
      const decisionsResult = await getDecisions(activeEventId).catch(() => []);
      const disruptionsResult = await getDisruptions(activeEventId).catch(() => []);
      
      setData(result);
      setDecisions(decisionsResult);
      setActiveDisruptions(disruptionsResult);
      if (result.event) {
        setBudgetForm({
          budget_total: result.event.budget_total || 0,
          budget_spent: result.event.budget_spent || 0
        });
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to load event data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'event' && activeEventId) {
      loadData();
    }
  }, [activeEventId, currentView, currentUser]);

  // WebSocket for AI telemetry
  useEffect(() => {
    if (!activeEventId || currentView !== 'event') return;

    let ws = null;
    try {
      ws = new WebSocket(`ws://localhost:8000/ws/${activeEventId}`);
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
            showToast('AI Recovery Plan generated and ready for review', 'success', 'Recommendation Matrix');
          }
        } catch (e) {
          console.error('WS parse error', e);
        }
      };
    } catch (err) {
      console.error('WebSocket connection failed:', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [activeEventId, currentView]);

  // Guest count animation detection
  useEffect(() => {
    if (data?.event) {
      if (prevGuestCountRef.current !== null && prevGuestCountRef.current !== data.event.guest_count) {
        setGuestCountAnimating(true);
        setTimeout(() => setGuestCountAnimating(false), 2000);
      }
      prevGuestCountRef.current = data.event.guest_count;
    }
  }, [data]);

  // User Switcher
  const handleUserChange = (e) => {
    const userId = e.target.value;
    const user = USERS.find(u => u.id === userId);
    setCurrentUser(user);
    localStorage.setItem('relay_active_user', userId);
    setTraceEvents([]);
    setRecoveryPlan(null);
    setDecisions([]);
    setExecutingOptionId(null);
    setExecutionMessage(null);
    setNegotiationActive(false);
    showToast(`Switched active profile to ${user.name} (${user.role})`, 'info');
    setTimeout(loadData, 0);
  };

  // Reset Demo
  const handleResetDemo = async () => {
    if (isResetting) return;
    try {
      setIsResetting(true);
      const targetId = activeEventId || 'evt_1';
      await fetch(`http://localhost:3001/event/${targetId}/reset`, { 
        method: 'POST',
        headers: {
          'X-User-Id': currentUser.id
        }
      });
      setTraceEvents([]);
      setRecoveryPlan(null);
      setDecisions([]);
      setExecutingOptionId(null);
      setExecutionMessage(null);
      setNegotiationActive(false);
      showToast('Demo environment restored to baseline state', 'success');
      await loadData();
      if (currentView === 'portfolio') await loadPortfolio();
    } catch (err) {
      console.error(err);
      showToast('Failed to reset demo: ' + err.message, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Budget submit
  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    setBudgetError(null);
    try {
      await updateEventBudget(activeEventId, {
        budget_total: Number(budgetForm.budget_total),
        budget_spent: Number(budgetForm.budget_spent)
      });
      setEditingBudget(false);
      showToast('Event budget successfully updated', 'success');
      loadData();
    } catch (err) {
      setBudgetError(err.message || 'Unable to update budget.');
    }
  };

  // Vendor actions
  const handleStartEditVendor = (v) => {
    setEditingVendor(v._id);
    setVendorForm({ status: v.status, quote: v.quote });
    setVendorError(null);
  };

  const handleCancelEditVendor = () => {
    setEditingVendor(null);
    setVendorError(null);
  };

  const handleSaveVendor = async (e, vendorId) => {
    e.preventDefault();
    setVendorError(null);
    try {
      await updateVendor(activeEventId, vendorId, {
        status: vendorForm.status,
        quote: Number(vendorForm.quote)
      });
      setEditingVendor(null);
      showToast('Vendor quote and status updated', 'success');
      loadData();
    } catch (err) {
      setVendorError(err.message || 'Unable to update vendor.');
    }
  };

  const handleCancelVendorDirect = async (vendorId) => {
    try {
      await cancelVendor(activeEventId, vendorId);
      showToast(`Vendor ${vendorId} cancelled. Disruption triggered.`, 'warning');
      loadData();
    } catch (err) {
      showToast('Failed to cancel vendor: ' + err.message, 'error');
    }
  };

  // Simulate Disruption
  const handleSimulateDisruption = async () => {
    try {
      setLoading(true);
      await cancelVendor(activeEventId, 'ven_catering_1');
      showToast('Simulated vendor cancellation for Saffron Table Catering', 'warning', 'Incident Injected');
      await loadData();
    } catch (err) {
      showToast('Unable to simulate disruption: ' + err.message, 'error');
      setLoading(false);
    }
  };

  // Generate Recovery Plan
  const handleGeneratePlan = async () => {
    try {
      setGeneratingPlan(true);
      setNegotiationActive(true);
      setTraceEvents([]);
      setRecoveryPlan(null);
      await generateRecoveryPlan(activeEventId, {
        type: 'vendor_cancellation',
        vendor_id: 'ven_catering_1'
      });
      showToast('Agent dispatch: Initiated constraint satisfaction solver', 'info');
    } catch (err) {
      console.error(err);
      setGeneratingPlan(false);
      setNegotiationActive(false);
      showToast('Failed to generate recovery plan: ' + err.message, 'error');
    }
  };

  // Add Guests (+12)
  const handleAddGuests = async () => {
    try {
      await incrementHeadcount(activeEventId, 12);
      showToast('Added +12 guests. Rescoping parameters in flight...', 'info');
      await loadData();
    } catch (err) {
      showToast('Failed to add guests: ' + err.message, 'error');
    }
  };

  // Report Disruption modal submit
  const handleReportDisruptionSubmit = async (e) => {
    e.preventDefault();
    try {
      setGeneratingPlan(true);
      const disruption = await reportDisruption(activeEventId, disruptionForm);
      setShowDisruptionModal(false);
      setDisruptionForm({ type: 'vendor_cancellation', severity: 'high', description: '', vendor_id: '' });
      showToast('Incident logged. Initiating autonomous recovery search...', 'warning');
      await loadData();

      setNegotiationActive(true);
      setTraceEvents([]);
      setRecoveryPlan(null);
      await generateRecoveryPlan(activeEventId, disruption);
    } catch (err) {
      console.error(err);
      setGeneratingPlan(false);
      setNegotiationActive(false);
      showToast('Failed to report disruption: ' + err.message, 'error');
    }
  };

  // Import CSV modal submit
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await importData(activeEventId, importForm);
      setImportResult(res.message || 'Data imported successfully.');
      showToast('CSV payload imported successfully', 'success');
      loadData();
    } catch (err) {
      setImportResult(err.message || 'Import failed.');
      showToast('Import error: ' + err.message, 'error');
    }
  };

  // Approve and Execute recovery option
  const handleApproveAndExecute = async (opt) => {
    try {
      setExecutingOptionId(opt.option_id);
      setExecutionMessage({ text: 'Executing recovery action and updating vendor ledger...', type: 'loading' });
      await executeDecision(activeEventId, opt.option_id, {
        type: 'vendor_cancellation',
        vendor_id: 'ven_catering_1'
      }, opt);
      
      setExecutionMessage({ text: '✓ Recovery plan committed and executed successfully', type: 'success' });
      showToast(`Executed plan: ${opt.title}`, 'success', 'Contingency Resolved');
      
      setTimeout(() => {
        setExecutionMessage(null);
        setRecoveryPlan(null);
        loadData();
        setExecutingOptionId(null);
      }, 1800);
    } catch (err) {
      setExecutionMessage({ text: `Execution failed: ${err.message}`, type: 'error' });
      showToast(`Execution failed: ${err.message}`, 'error');
      setExecutingOptionId(null);
    }
  };

  // Global vendor modal open
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
      setAssignError('Failed to load event list.');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignError(null);
    if (!selectedEventId) return setAssignError('Please select a target event.');
    try {
      await associateGlobalVendor(vendorToAssign._id, selectedEventId, vendorToAssign.base_quote);
      showToast(`${vendorToAssign.name} assigned to event successfully`, 'success');
      setAssignModalOpen(false);
      setVendorToAssign(null);
      loadGlobalVendors();
    } catch (err) {
      setAssignError(err.message || 'Assignment failed.');
    }
  };

  const handleCreateGlobalVendorSubmit = async (e) => {
    e.preventDefault();
    try {
      await createGlobalVendor(gVendorForm);
      setGVendorFormOpen(false);
      setGVendorForm({ name: '', category: 'catering', base_quote: 0 });
      showToast('Created new global vendor', 'success');
      loadGlobalVendors();
    } catch (err) {
      alert(err.message);
    }
  };

  // Landing page route
  if (currentView === 'landing') {
    return (
      <LandingPage 
        onLaunchApp={() => navigateTo('portfolio')} 
        onOpenEvent={(id) => navigateTo('event', id || 'evt_1')} 
      />
    );
  }

  // Client status view route
  if (currentView === 'client_status') {
    return (
      <ClientStatusView 
        eventId={activeEventId || 'evt_1'} 
        onBack={() => navigateTo('event', activeEventId || 'evt_1')} 
      />
    );
  }

  const { event, vendors = [], guests = [] } = data || { event: null, vendors: [], guests: [] };

  return (
    <div className="min-h-screen bg-canvas-soft text-ink font-sans antialiased flex flex-col selection:bg-primary/15 selection:text-ink">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        users={USERS}
        onUserChange={handleUserChange}
        currentView={currentView}
        activeEventId={activeEventId}
        activeEvent={event}
        onNavigate={navigateTo}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={() => setNotificationsOpen(!notificationsOpen)}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={handleMarkAllRead}
        onOpenDisruptionModal={() => setShowDisruptionModal(true)}
        onOpenImportModal={() => { setImportResult(null); setShowImportModal(true); }}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* 2. Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW A: PORTFOLIO DASHBOARD */}
        {currentView === 'portfolio' && (
          <PortfolioView
            events={portfolioEvents}
            onSelectEvent={id => navigateTo('event', id)}
            portfolioSort={portfolioSort}
            onSortChange={setPortfolioSort}
            portfolioFilter={portfolioFilter}
            onFilterChange={setPortfolioFilter}
          />
        )}

        {/* VIEW B: CENTRAL VENDOR REPOSITORY */}
        {currentView === 'global_vendors' && (
          <GlobalVendorsView
            gVendors={gVendors}
            loadingGVendors={loadingGVendors}
            currentUser={currentUser}
            onOpenCreateVendorModal={() => setGVendorFormOpen(true)}
            onOpenAssignModal={handleOpenAssignModal}
          />
        )}

        {/* VIEW C: EVENT OPERATIONS WORKSPACE */}
        {currentView === 'event' && (
          <>
            {loading && !data ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Loading Event Operations Workspace...
                </p>
              </div>
            ) : error ? (
              <div className="bg-white border border-sticker-red/30 rounded-2xl p-8 max-w-lg mx-auto text-center shadow-card my-12">
                <p className="text-sm font-bold text-sticker-red mb-2">Access Error</p>
                <p className="text-xs text-ink-muted mb-4">{error}</p>
                <button
                  onClick={() => navigateTo('portfolio')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-active rounded-lg transition-colors shadow-micro"
                >
                  Return to Portfolio
                </button>
              </div>
            ) : event ? (
              <div className="space-y-6">
                
                {/* Hero Night Band per DESIGN.md */}
                <HeroBand
                  event={event}
                  guests={guests}
                  activeDisruptions={activeDisruptions}
                  onAddGuests={handleAddGuests}
                  onSimulateDisruption={handleSimulateDisruption}
                  onOpenDisruptionModal={() => setShowDisruptionModal(true)}
                  onOpenClientView={() => navigateTo('client_status', activeEventId)}
                  isNegotiating={negotiationActive}
                  guestCountAnimating={guestCountAnimating}
                />

                {/* KPI Metrics & Run of Show */}
                <EventOverview
                  event={event}
                  guests={guests}
                  editingBudget={editingBudget}
                  setEditingBudget={setEditingBudget}
                  budgetForm={budgetForm}
                  setBudgetForm={setBudgetForm}
                  onBudgetSubmit={handleBudgetSubmit}
                  budgetError={budgetError}
                  guestCountAnimating={guestCountAnimating}
                  currentUser={currentUser}
                />

                {/* 2-Column Grid: Vendors & AI Telemetry Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Engaged Vendor Ledger (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <VendorTable
                      vendors={vendors}
                      editingVendor={editingVendor}
                      vendorForm={vendorForm}
                      setVendorForm={setVendorForm}
                      onStartEditVendor={handleStartEditVendor}
                      onCancelEditVendor={handleCancelEditVendor}
                      onSaveVendor={handleSaveVendor}
                      vendorError={vendorError}
                      onCancelVendorDirect={handleCancelVendorDirect}
                    />
                  </div>

                  {/* Right Column: AI Contingency Hub & Telemetry (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    <AgentTelemetry
                      activeDisruptions={activeDisruptions}
                      vendors={vendors}
                      decisions={decisions}
                      onGeneratePlan={handleGeneratePlan}
                      generatingPlan={generatingPlan}
                      recoveryPlan={recoveryPlan}
                      traceEvents={traceEvents}
                      negotiationActive={negotiationActive}
                      traceEndRef={traceEndRef}
                      onApproveAndExecute={handleApproveAndExecute}
                      executingOptionId={executingOptionId}
                      executionMessage={executionMessage}
                      currentUser={currentUser}
                    />
                  </div>

                </div>

              </div>
            ) : null}
          </>
        )}

      </main>

      {/* 3. Global Modals */}
      <ReportDisruptionModal
        isOpen={showDisruptionModal}
        onClose={() => setShowDisruptionModal(false)}
        onSubmit={handleReportDisruptionSubmit}
        form={disruptionForm}
        setForm={setDisruptionForm}
        vendors={vendors}
      />

      <ImportDataModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSubmit={handleImportSubmit}
        form={importForm}
        setForm={setImportForm}
        result={importResult}
      />

      <CreateGlobalVendorModal
        isOpen={gVendorFormOpen}
        onClose={() => setGVendorFormOpen(false)}
        onSubmit={handleCreateGlobalVendorSubmit}
        form={gVendorForm}
        setForm={setGVendorForm}
      />

      <AssignGlobalVendorModal
        isOpen={assignModalOpen}
        onClose={() => { setAssignModalOpen(false); setVendorToAssign(null); }}
        onSubmit={handleAssignSubmit}
        vendor={vendorToAssign}
        events={accountEvents}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        error={assignError}
      />

      {/* 4. Global Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}

export default App;
