import React from 'react';
import { 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  X, 
  Bot, 
  Cpu, 
  DollarSign, 
  Clock,
  ThumbsUp,
  FileCheck
} from 'lucide-react';
import { StatusIndicator } from './StatusIndicator';

export const AgentTelemetry = ({
  activeDisruptions = [],
  vendors = [],
  decisions = [],
  onGeneratePlan,
  generatingPlan,
  recoveryPlan,
  traceEvents = [],
  negotiationActive,
  traceEndRef,
  onApproveAndExecute,
  executingOptionId,
  executionMessage,
  currentUser
}) => {
  const cancelledVendors = vendors.filter(v => v.status === 'cancelled');
  const hasDisruptions = cancelledVendors.length > 0 || activeDisruptions.length > 0;

  const isPlanner = currentUser?.role === 'planner';

  return (
    <div className="space-y-6">
      
      {/* 1. Disruptions Alert Center */}
      <div className="bg-white border border-hairline rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${hasDisruptions ? 'bg-sticker-red-bg text-sticker-red' : 'bg-sticker-green-bg text-sticker-green'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Disruption Monitoring</h3>
              <p className="text-xs text-ink-muted">Active anomalies and multi-agent incident response</p>
            </div>
          </div>
          
          {hasDisruptions && !recoveryPlan && !negotiationActive && (
            <button
              type="button"
              onClick={onGeneratePlan}
              disabled={generatingPlan}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#0075de] to-[#005bab] hover:from-[#0085fc] hover:to-[#006bd1] text-white text-xs font-bold tracking-wide transition-all shadow-[0_2px_12px_rgba(0,117,222,0.35)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${generatingPlan ? 'animate-spin' : ''}`} />
              <span>{generatingPlan ? 'Synthesizing Plan...' : 'Generate Recovery Plan'}</span>
            </button>
          )}
        </div>

        {/* Disruption list */}
        {hasDisruptions ? (
          <div className="space-y-3">
            {cancelledVendors.map(v => {
              const isResolved = decisions.some(d => d.status === 'executed' && d.disruption?.vendor_id === v._id);

              return (
                <div 
                  key={v._id} 
                  className={`p-4 rounded-xl border transition-all ${
                    isResolved 
                      ? 'bg-sticker-green-bg/50 border-sticker-green/20' 
                      : 'bg-[#fef3eb] border-[#dd5b00]/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 p-1 rounded-full ${isResolved ? 'bg-[#1aae39] text-white' : 'bg-[#dd5b00] text-white'}`}>
                        {isResolved ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-ink">
                            Vendor Disruption
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white text-[#dd5b00] border border-[#dd5b00]/30 font-mono">
                            {v.category}
                          </span>
                        </div>
                        <p className="text-xs text-ink-secondary mt-0.5">
                          <strong className="font-semibold text-ink">{v.name}</strong> was marked cancelled. Operational contingency triggered.
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1aae39] uppercase tracking-wider bg-white px-2.5 py-1 rounded-full border border-green-200 shadow-micro">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </span>
                      ) : !recoveryPlan && !negotiationActive ? (
                        <button
                          type="button"
                          onClick={onGeneratePlan}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white uppercase tracking-wider bg-gradient-to-r from-[#dd5b00] to-[#dd5b00]/90 hover:from-orange-600 hover:to-orange-700 px-3 py-1.5 rounded-full shadow-micro hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          title="Trigger AI Recovery Plan for this disruption"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Action Required
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#dd5b00] uppercase tracking-wider bg-white px-2.5 py-1 rounded-full border border-[#dd5b00]/30 shadow-micro">
                          <Clock className="w-3.5 h-3.5" /> Action Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {activeDisruptions.map((disp, i) => (
              <div key={i} className="p-4 rounded-xl bg-sticker-red-bg border border-sticker-red/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-sticker-red">{disp.type || 'Disruption'}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white text-sticker-red border border-sticker-red/30">
                      {disp.severity || 'high'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-ink-muted">
                    {disp.created_at ? new Date(disp.created_at).toLocaleTimeString() : ''}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary mt-1">{disp.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-canvas-soft border border-hairline">
            <CheckCircle2 className="w-4 h-4 text-sticker-green shrink-0" />
            <p className="text-xs text-ink-muted">
              All vendor agreements and supply chains are operating within normal tolerances.
            </p>
          </div>
        )}
      </div>

      {/* 2. AI Telemetry & Agent Reasoning Feed */}
      {(traceEvents.length > 0 || negotiationActive) && (
        <div className="bg-white border border-hairline rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-hairline bg-canvas-soft/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Agent Telemetry Feed</h4>
            </div>
            {negotiationActive && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Live Reasoning & Negotiation
                </span>
              </div>
            )}
          </div>

          <div className="p-4 bg-stone-900 text-stone-100 font-mono text-xs max-h-60 overflow-y-auto space-y-2 select-text">
            {traceEvents.map((evt, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-stone-500 shrink-0 text-[11px]">
                  [{evt.timestamp || '00:00:00'}]
                </span>
                {evt.type === 'agent.tool_call' ? (
                  <span className="text-sticker-orange font-bold shrink-0">[TOOL]</span>
                ) : (
                  <span className="text-sticker-sky font-bold shrink-0">[AGENT]</span>
                )}
                <span className="text-stone-200 break-words">{evt.data}</span>
              </div>
            ))}

            {negotiationActive && !recoveryPlan && (
              <div className="flex items-center gap-2 text-stone-400 animate-pulse pt-1">
                <span className="text-stone-500">[--:--:--]</span>
                <span className="text-sticker-purple font-bold">[SYSTEM]</span>
                <span>Synthesizing optimal constraints & multi-vendor solutions...</span>
              </div>
            )}
            <div ref={traceEndRef} />
          </div>
        </div>
      )}

      {/* 3. AI Generated Recovery Plan Card */}
      {recoveryPlan && (
        <div className={`bg-white border border-hairline rounded-xl p-6 shadow-card transition-all duration-300 ${
          executingOptionId !== null ? 'opacity-60 pointer-events-none' : ''
        }`}>
          <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-hairline">
            <div className="p-1.5 bg-primary-light text-primary rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink uppercase tracking-wider">AI Recommendation Matrix</h4>
              <p className="text-xs text-ink-muted">Ranked recovery strategies evaluated against cost, time, and quality</p>
            </div>
          </div>

          <p className="text-sm text-ink-secondary leading-relaxed mb-6 font-normal">
            {recoveryPlan.summary}
          </p>

          <div className="space-y-4">
            {recoveryPlan.options?.map((opt, idx) => {
              const isRecommended = opt.recommended;
              const isExecuting = executingOptionId === opt.option_id;

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border transition-all ${
                    isRecommended
                      ? 'bg-primary-light/20 border-primary/40 ring-1 ring-primary/20 shadow-micro'
                      : 'bg-white border-hairline hover:border-stone-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-bold text-sm text-ink">{opt.title}</h5>
                        {isRecommended && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-white shadow-micro">
                            <Sparkles className="w-3 h-3" /> Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted leading-relaxed">{opt.description}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block">
                        Estimated Cost Delta
                      </span>
                      <span className={`text-sm font-bold font-mono ${
                        (opt.estimated_cost_change || 0) <= 0 ? 'text-sticker-green' : 'text-sticker-orange'
                      }`}>
                        {(opt.estimated_cost_change || 0) <= 0 ? '−' : '+'}₹{Math.abs(opt.estimated_cost_change || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Pros & Cons Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-t border-hairline text-xs">
                    <div>
                      <strong className="text-[10px] font-bold uppercase tracking-wider text-sticker-green flex items-center gap-1 mb-1.5">
                        <Check className="w-3 h-3" /> Advantages
                      </strong>
                      <ul className="space-y-1 text-ink-secondary pl-1">
                        {opt.pros?.map((p, j) => (
                          <li key={j} className="flex items-start gap-1.5">
                            <span className="text-sticker-green font-bold leading-none">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <strong className="text-[10px] font-bold uppercase tracking-wider text-sticker-red flex items-center gap-1 mb-1.5">
                        <X className="w-3 h-3" /> Trade-offs & Risks
                      </strong>
                      <ul className="space-y-1 text-ink-secondary pl-1">
                        {opt.cons?.map((c, j) => (
                          <li key={j} className="flex items-start gap-1.5">
                            <span className="text-sticker-red font-bold leading-none">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Approve & Execute Action Button */}
                  <div className="pt-3.5 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-[11px] text-ink-muted">
                      {isPlanner ? (
                        <span className="text-sticker-orange font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Approver or Admin role required to execute
                        </span>
                      ) : (
                        <span className="text-ink-faint">Human-in-the-loop signoff required</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onApproveAndExecute(opt)}
                      disabled={executingOptionId !== null || isPlanner}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-micro ${
                        isRecommended
                          ? 'bg-gradient-to-r from-[#0075de] to-[#005bab] hover:from-[#0085fc] hover:to-[#006bd1] text-white shadow-[0_2px_12px_rgba(0,117,222,0.35)] active:scale-95'
                          : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95'
                      } disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
                    >
                      {isExecuting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Executing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Execute</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Execution Feedback Toast / Banner */}
      {executionMessage && (
        <div className={`p-4 rounded-xl text-xs font-mono border flex items-center gap-2 ${
          executionMessage.type === 'error'
            ? 'bg-sticker-red-bg border-sticker-red/30 text-sticker-red'
            : executionMessage.type === 'success'
            ? 'bg-sticker-green-bg border-sticker-green/30 text-sticker-green'
            : 'bg-sticker-orange-bg border-sticker-orange/30 text-sticker-orange'
        }`}>
          {executionMessage.type === 'loading' && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>}
          <span>{executionMessage.text}</span>
        </div>
      )}

      {/* 5. Decisions Audit Log */}
      {decisions.length > 0 && (
        <div className="bg-white border border-hairline rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <FileCheck className="w-4 h-4 text-ink-muted" />
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Executed Decisions Trail</h4>
          </div>

          <div className="space-y-2">
            {decisions.map(d => (
              <div 
                key={d._id} 
                className="p-3 rounded-lg bg-canvas-soft border border-hairline flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sticker-green shrink-0" />
                  <span className="font-semibold text-ink">
                    Action Approved: <span className="font-normal text-ink-secondary">{d.option_id?.replace(/_/g, ' ')}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-ink-faint">
                    {d.created_at ? new Date(d.created_at).toLocaleTimeString() : 'Recent'}
                  </span>
                  <StatusIndicator status={d.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AgentTelemetry;
