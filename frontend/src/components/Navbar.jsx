import React from 'react';
import { 
  Layers, 
  Bell, 
  RotateCcw, 
  ExternalLink, 
  UploadCloud, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  Sparkles, 
  Database,
  Calendar,
  UserCheck
} from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';

export const Navbar = ({
  currentUser,
  users,
  onUserChange,
  currentView,
  activeEventId,
  activeEvent,
  onNavigate,
  notifications,
  notificationsOpen,
  onToggleNotifications,
  onNotificationClick,
  onMarkAllRead,
  onOpenDisruptionModal,
  onOpenImportModal,
  onResetDemo,
  isResetting
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-hairline transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Brand & View Navigation */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => onNavigate('portfolio')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-micro group-hover:bg-primary-active transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-ink">Relay</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.2 bg-primary-light text-primary rounded-full">
                    AI Ops
                  </span>
                </div>
                <span className="text-[11px] text-ink-muted leading-none">Event Operations Agent</span>
              </div>
            </div>

            {/* View Switcher Pills */}
            <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-hairline">
              <button
                onClick={() => onNavigate('portfolio')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  currentView === 'portfolio'
                    ? 'bg-canvas-soft text-ink font-semibold shadow-micro'
                    : 'text-ink-muted hover:text-ink hover:bg-stone-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Portfolio</span>
              </button>

              {activeEventId && (
                <button
                  onClick={() => onNavigate('event', activeEventId)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    currentView === 'event'
                      ? 'bg-canvas-soft text-ink font-semibold shadow-micro'
                      : 'text-ink-muted hover:text-ink hover:bg-stone-50'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Event Workspace</span>
                  {activeEvent && (
                    <span className="text-[10px] bg-stone-200 text-ink-secondary px-1.5 py-0.5 rounded-md font-mono max-w-[120px] truncate">
                      {activeEvent.name}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => onNavigate('global_vendors', activeEventId)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  currentView === 'global_vendors'
                    ? 'bg-canvas-soft text-ink font-semibold shadow-micro'
                    : 'text-ink-muted hover:text-ink hover:bg-stone-50'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Central Vendors</span>
              </button>
            </nav>
          </div>

          {/* Right Controls & User Info */}
          <div className="flex items-center gap-3">
            
            {/* Event Specific Actions (if in event view) */}
            {currentView === 'event' && activeEventId && (
              <div className="hidden lg:flex items-center gap-2 mr-2">
                <button
                  onClick={onOpenDisruptionModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-sticker-red bg-sticker-red-bg border border-sticker-red/20 hover:bg-sticker-red/10 transition-colors shadow-micro"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Report Disruption</span>
                </button>

                <button
                  onClick={() => window.open(`/event/${activeEventId}/client-status`, '_blank')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-ink-secondary bg-white border border-hairline hover:bg-canvas-soft transition-colors shadow-micro"
                  title="Open Client Status Portal"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Client View</span>
                </button>

                <button
                  onClick={onOpenImportModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-ink-secondary bg-white border border-hairline hover:bg-canvas-soft transition-colors shadow-micro"
                  title="Import CSV Data"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Import</span>
                </button>
              </div>
            )}

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={onToggleNotifications}
                className="relative p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas-soft border border-transparent hover:border-hairline transition-all"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white border border-hairline shadow-modal rounded-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-hairline bg-canvas-soft">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink uppercase tracking-wider">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[11px] font-semibold bg-primary text-white px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllRead}
                        className="text-xs text-primary hover:text-primary-active font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-hairline">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-ink-muted">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif._id}
                          onClick={() => onNotificationClick(notif)}
                          className={`p-3.5 cursor-pointer transition-colors hover:bg-canvas-soft ${
                            notif.read ? 'bg-white opacity-70' : 'bg-primary-light/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className={`text-xs font-semibold ${
                              notif.severity === 'critical' || notif.severity === 'high'
                                ? 'text-sticker-red'
                                : 'text-primary'
                            }`}>
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-ink-faint shrink-0 font-mono">
                              {new Date(notif.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-ink-secondary leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role / User Selector */}
            <div className="flex items-center gap-1.5 bg-canvas-soft p-1 rounded-lg border border-hairline">
              <UserCheck className="w-3.5 h-3.5 text-ink-muted ml-1.5 hidden sm:block" />
              <select
                value={currentUser.id}
                onChange={onUserChange}
                className="bg-transparent text-xs text-ink font-medium focus:outline-none cursor-pointer pr-2 py-0.5"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Demo Button */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-ink-muted hover:text-ink bg-white border border-hairline hover:bg-canvas-soft transition-all shadow-micro disabled:opacity-50"
              title="Reset Demo Data"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-primary' : ''}`} />
              <span className="hidden sm:inline">{isResetting ? 'Resetting...' : 'Reset'}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
