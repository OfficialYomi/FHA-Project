import React, { useState } from 'react';
import { RiskAlert } from '../types';
import { 
  AlertTriangle, 
  Clock, 
  Mail, 
  Calendar, 
  ShieldAlert, 
  CheckCircle, 
  ChevronRight, 
  FileSpreadsheet, 
  ShieldAlert as ShieldIcon,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Ban
} from 'lucide-react';

interface RiskAlertsViewProps {
  alerts: RiskAlert[];
  onTriggerAlertAction: (alertId: string, actionType: 'query' | 'meeting' | 'withhold' | 'directive', details: string) => Promise<void>;
  onResolveAlert: (alertId: string) => Promise<void>;
}

export default function RiskAlertsView({
  alerts,
  onTriggerAlertAction,
  onResolveAlert
}: RiskAlertsViewProps) {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [executiveDraft, setExecutiveDraft] = useState<string | null>(null);
  const [draftType, setDraftType] = useState<string>('');

  const currentAlert = alerts.find(a => a.id === selectedAlertId) || null;

  const handleActionClick = async (type: 'query' | 'meeting' | 'withhold' | 'directive') => {
    if (!currentAlert) return;

    let draftContent = "";
    let alertLabel = "";

    switch (type) {
      case 'query':
        alertLabel = "Official Executive Query Letter";
        draftContent = `FEDERAL HOUSING AUTHORITY (FHA) NIGERIA
OFFICE OF THE MANAGING DIRECTOR / CEO
Date: ${new Date().toLocaleDateString()}
Ref: FHA/CEO/QUERY/${currentAlert.id.toUpperCase()}

TO: Managing Director, ${currentAlert.contractorName}
SUBJECT: FORMAL QUERY FOR CONTRACT COMPLIANCE DEFICIENCIES

You are hereby queried regarding structural underperformance and exceptions identified at ${currentAlert.projectName}:
EXCEPTION: "${currentAlert.title}"
DETAILS: "${currentAlert.details}"

This agency demands a formal, comprehensive written response delivered to the CEO's registry within forty-eight (48) hours of receipt, detailing your recovery strategy, failure risk mitigants, and timeline catch-up program. Failure to respond adequately will result in severe liquidated damages and possible contract termination.

Endorsed:
Managing Director / CEO, FHA`;
        break;

      case 'meeting':
        alertLabel = "Board Mitigation Hearing Agenda Draft";
        draftContent = `FHA EXECUTIVE HEARING AGENDA
COMMITTEE: Housing Delivery Board Subcommittee
HEARING DATE: Next Thursday, 10:00 AM UTC
LOCATION: Boardroom 1, FHA Headquarters, Abuja

SUBJECT: MITIGATION HEARING REGARDING ${currentAlert.projectName.toUpperCase()}

INVITED PARTIES:
1. Managing Director & Site Team of ${currentAlert.contractorName}
2. Resident Project Engineer / PM for ${currentAlert.projectName}
3. Lead Quantity Surveyor & Finance Representative

OBJECTIVES:
- Audit and identify bottleneck causes regarding: "${currentAlert.title}"
- Define immediate weekly catch-up targets
- Review potential structural penalties or funding withholding mechanisms.

FHA Secretariat & Registry`;
        break;

      case 'withhold':
        alertLabel = "Treasury Payment Hold Order";
        draftContent = `FHA DISBURSEMENT SUSPENSION DIRECTIVE
FROM: Office of the Managing Director / CEO
TO: Central Treasury Division, FHA Finance Directorate
Date: ${new Date().toLocaleDateString()}

SUBJECT: IMMEDIATE RETENTION & PAYMENT WITHHOLD ORDER

EFFECTIVE IMMEDIATELY, you are directed to freeze all further progress valuations, certificate releases, and capital payments to ${currentAlert.contractorName} associated with the following contract:
PROJECT SCHEME: "${currentAlert.projectName}"
AUDIT EXCEPTION: "${currentAlert.title}"

This payment block is non-reversible until the contractor submits structural evidence of remediation, certified in writing by the Resident Project Manager and validated by the Director of Housing Delivery.

Authorized signature:
Managing Director / CEO, FHA`;
        break;

      case 'directive':
        alertLabel = "Executive Remediation Order";
        draftContent = `FHA DIRECT EXECUTIVE MANDATE
OFFICE OF THE MANAGING DIRECTOR / CEO
ORDER NO: FHA-CEO-DIR-2026-${currentAlert.id.split('-')[0].toUpperCase()}

PROJECT JURISDICTION: ${currentAlert.projectName}
CONTRACTOR RESPONSIBLE: ${currentAlert.contractorName}

MANDATE DETAILS:
The contractor is ordered to immediately deploy additional labor crafts, secure materials onsite, and run double shifts (day and night) to resolve: "${currentAlert.title}".
A penalty of NGN 500,000 per delayed day will commence if milestones are missed.

By Command of the MD/CEO`;
        break;
    }

    setDraftType(alertLabel);
    setExecutiveDraft(draftContent);

    // Save action history in backend
    await onTriggerAlertAction(currentAlert.id, type, `MD/CEO generated: ${alertLabel}`);
  };

  const handleResolve = async () => {
    if (!currentAlert) return;
    if (window.confirm("Mark this exceptional risk alert as resolved? All on-site corrections must be certified.")) {
      await onResolveAlert(currentAlert.id);
      setExecutiveDraft(null);
      alert("Alert marked as Resolved in the FHA Cockpit.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-medium text-white tracking-tight font-serif" style={{ fontFamily: 'Georgia, serif' }}>
          Executive Exception Cockpit <span className="text-amber-500">/</span> Risk Alerts
        </h2>
        <p className="text-slate-400 text-sm">Real-time alerts regarding timeline delays, missing updates, structural defects, or cost overruns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Risks List (5 cols) */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Active Exception Flags ({alerts.filter(a => !a.resolved).length})</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Real-time telemetry</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {alerts.map((a) => (
              <div 
                key={a.id}
                onClick={() => {
                  setSelectedAlertId(a.id);
                  setExecutiveDraft(null);
                }}
                className={`p-4 border rounded-xl cursor-pointer transition relative flex flex-col justify-between gap-3 ${
                  selectedAlertId === a.id 
                    ? 'bg-black/80 border-amber-500/50' 
                    : a.resolved 
                    ? 'bg-[#050505]/40 border-white/5 opacity-60 hover:opacity-100' 
                    : 'bg-black/50 border-white/10 hover:border-amber-500/30'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border ${
                      a.resolved
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : a.severity === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {a.resolved ? 'RESOLVED' : `${a.severity} Risk`}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{a.dateRaised || a.dateCreated}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-2 group-hover:text-amber-500 transition-colors font-serif" style={{ fontFamily: 'Georgia, serif' }}>{a.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{a.details}</p>
                </div>

                <div className="flex justify-between items-center text-[9px] border-t border-white/5 pt-2 text-slate-500">
                  <span>Estate: <strong className="text-slate-300">{a.projectName}</strong></span>
                  <span className="flex items-center gap-0.5 font-bold text-slate-400 hover:text-white transition">Review <ChevronRight className="w-3 h-3" /></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Deep Audit & Executive Sign-off Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {currentAlert ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-6">
              
              {/* Alert Header details */}
              <div className="pb-4 border-b border-white/10 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>{currentAlert.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Project Scheme: <strong className="text-white">{currentAlert.projectName}</strong></p>
                  <p className="text-xs text-slate-400 mt-0.5">Responsible Contractor: <strong className="text-amber-500">{currentAlert.contractorName}</strong></p>
                </div>

                {!currentAlert.resolved && (
                  <button 
                    onClick={handleResolve}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition"
                  >
                    <CheckCircle className="w-4 h-4 text-black" />
                    <span>Resolve Alert</span>
                  </button>
                )}
              </div>

              {/* Action Buttons list (The 4 exact requested MD commands) */}
              {!currentAlert.resolved && (
                <div className="space-y-3">
                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Execute MD/CEO Remedial Mandate Actions</div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button 
                      onClick={() => handleActionClick('query')}
                      className="bg-black/50 hover:bg-white/5 text-slate-300 border border-white/10 hover:border-amber-500/30 font-bold p-3 rounded-lg text-[10px] flex flex-col items-center text-center justify-center gap-1.5 transition group"
                    >
                      <Mail className="w-5 h-5 text-amber-500 group-hover:scale-110 transition" />
                      <span>Query Contractor</span>
                    </button>

                    <button 
                      onClick={() => handleActionClick('meeting')}
                      className="bg-black/50 hover:bg-white/5 text-slate-300 border border-white/10 hover:border-amber-500/30 font-bold p-3 rounded-lg text-[10px] flex flex-col items-center text-center justify-center gap-1.5 transition group"
                    >
                      <Calendar className="w-5 h-5 text-amber-500/80 group-hover:scale-110 transition" />
                      <span>Schedule Meeting</span>
                    </button>

                    <button 
                      onClick={() => handleActionClick('withhold')}
                      className="bg-black/50 hover:bg-white/5 text-slate-300 border border-white/10 hover:border-amber-500/30 font-bold p-3 rounded-lg text-[10px] flex flex-col items-center text-center justify-center gap-1.5 transition group"
                    >
                      <Ban className="w-5 h-5 text-rose-500 group-hover:scale-110 transition" />
                      <span>Withhold Funding</span>
                    </button>

                    <button 
                      onClick={() => handleActionClick('directive')}
                      className="bg-black/50 hover:bg-white/5 text-slate-300 border border-white/10 hover:border-amber-500/30 font-bold p-3 rounded-lg text-[10px] flex flex-col items-center text-center justify-center gap-1.5 transition group"
                    >
                      <Sparkles className="w-5 h-5 text-amber-500/60 group-hover:scale-110 transition" />
                      <span>Issue Directive</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Executive Draft Document Display */}
              {executiveDraft && (
                <div className="bg-black/60 p-5 rounded-xl border border-white/10 space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{draftType}</span>
                    </span>
                    <button 
                      onClick={() => setExecutiveDraft(null)}
                      className="text-slate-500 hover:text-amber-500 transition-colors text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                  
                  <pre className="text-[11px] font-mono leading-relaxed text-slate-300 whitespace-pre-wrap max-h-[220px] overflow-y-auto bg-[#050505]/50 p-3 rounded border border-white/5">
                    {executiveDraft}
                  </pre>
                  
                  <div className="text-[10px] text-slate-500 italic">
                    * The draft above is instantly queued in the contractor's briefing tray and copied to legal officers.
                  </div>
                </div>
              )}

              {/* Log / Audit Timeline history of actions taken */}
              <div className="space-y-3.5 pt-4 border-t border-white/10">
                <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Mitigation Audit Log History</div>
                
                <div className="space-y-2.5">
                  {(currentAlert.logs || []).map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-400 bg-black/50 p-2.5 rounded-lg border border-white/5">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-[10px] font-mono text-slate-500">{log.date}</div>
                        <p className="text-slate-300 mt-0.5">{log.action}</p>
                      </div>
                    </div>
                  ))}
                  {(!currentAlert.logs || currentAlert.logs.length === 0) && (
                    <div className="text-xs text-slate-500 italic py-2">No executive actions logged yet. Select an action button above to prompt.</div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 h-80">
              <ShieldIcon className="w-12 h-12 text-white/10 animate-pulse" />
              <div>
                <h4 className="text-white font-bold text-sm font-serif" style={{ fontFamily: 'Georgia, serif' }}>No Exception Selected</h4>
                <p className="text-slate-500 text-xs mt-1 max-w-sm">Select an active exception flag on the left menu to audit detailed logs and issue executive directives.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
