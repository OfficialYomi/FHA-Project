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
  ShieldAlert as ShieldIcon,
  MessageSquare,
  Sparkles,
  Ban,
  Send,
  User,
  Users,
  Check,
  Building,
  FileText,
  X,
  Bell,
  Lock,
  ArrowRight
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
  
  // Action form state
  const [activeActionType, setActiveActionType] = useState<'query' | 'meeting' | 'withhold' | 'directive' | null>(null);
  const [actionTitle, setActionTitle] = useState('');
  const [actionBody, setActionBody] = useState('');
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  
  // Query specific
  const [queryUrgency, setQueryUrgency] = useState('48 Hours (High Priority)');
  
  // Meeting specific
  const [meetingDate, setMeetingDate] = useState('2026-07-23');
  const [meetingTime, setMeetingTime] = useState('10:00 AM');
  const [meetingVenue, setMeetingVenue] = useState('Boardroom 1, FHA Headquarters, Abuja & Zoom Video Link');
  const [invitedContractor, setInvitedContractor] = useState(true);
  const [invitedPM, setInvitedPM] = useState(true);
  const [invitedQS, setInvitedQS] = useState(true);
  const [invitedFinance, setInvitedFinance] = useState(true);
  const [notifyViaEmail, setNotifyViaEmail] = useState(true);
  const [notifyViaProfile, setNotifyViaProfile] = useState(true);

  // Withhold specific
  const [withholdNotice, setWithholdNotice] = useState('All progress valuation releases & bank disbursements frozen');

  // Directive specific
  const [directiveRecipient, setDirectiveRecipient] = useState('Contractor');
  const [directiveCC, setDirectiveCC] = useState<string[]>([
    'Legal & Contracts Directorate',
    'Finance Directorate & Central Treasury'
  ]);

  const currentAlert = alerts.find(a => a.id === selectedAlertId) || null;

  const openActionForm = (type: 'query' | 'meeting' | 'withhold' | 'directive') => {
    if (!currentAlert) return;
    setActiveActionType(type);
    setSendSuccessMessage(null);

    const contractor = currentAlert.contractorName || "Assigned Contractor";
    const project = currentAlert.projectName;

    switch (type) {
      case 'query':
        setActionTitle(`Official Query: Contract Compliance Deficiencies at ${project}`);
        setActionBody(`FEDERAL HOUSING AUTHORITY (FHA) NIGERIA\nOFFICE OF THE MANAGING DIRECTOR / CEO\nRef: FHA/CEO/QUERY/${currentAlert.id.toUpperCase()}\n\nTO: Managing Director, ${contractor}\nSUBJECT: FORMAL QUERY FOR PERFORMANCE DEFICIENCIES\n\nYou are hereby queried regarding structural underperformance and exceptions identified at ${project}:\nEXCEPTION: "${currentAlert.title}"\nDETAILS: "${currentAlert.details}"\n\nThis agency demands a formal written explanation delivered within 48 hours detailing your recovery strategy, failure risk mitigants, and milestone catch-up schedule. Failure to respond adequately will result in severe liquidated damages and possible contract termination.\n\nBy Order of:\nManaging Director / CEO, FHA`);
        break;

      case 'meeting':
        setActionTitle(`Mitigation Hearing Agenda: Remediation for ${project}`);
        setActionBody(`FHA EXECUTIVE MITIGATION HEARING AGENDA\nPROJECT: ${project.toUpperCase()}\nCONTRACTOR: ${contractor}\n\nAGENDA ITEMS:\n1. Audit bottleneck causes regarding: "${currentAlert.title}".\n2. Address specific on-site details: "${currentAlert.details}".\n3. Review revised WBS catch-up schedule and labor deployment plan.\n4. Formulate binding commitments and milestones penalty milestones.\n\nAll designated representatives must attend with complete site documentation.`);
        break;

      case 'withhold':
        setActionTitle(`Disbursement Suspension & Payment Withhold Order: ${project}`);
        setActionBody(`FHA PAYMENT WITHHOLD DIRECTIVE\nFROM: Office of the Managing Director / CEO\nTO: Finance Directorate & Central Treasury Division\n\nSUBJECT: IMMEDIATE DISBURSEMENT WITHHOLD ORDER\n\nEFFECTIVE IMMEDIATELY, you are instructed to freeze all further progress valuations, certificate releases, and payment disbursements to ${contractor} for ${project}.\n\nEXCEPTION FLAGGED: "${currentAlert.title}"\nAUDIT PARTICULARS: "${currentAlert.details}"\n\nThis payment block is non-reversible until the contractor submits structural evidence of remediation, certified in writing by the Resident Project Manager and approved by the Managing Director.`);
        break;

      case 'directive':
        setActionTitle(`Executive Remediation Directive: Mandate for ${project}`);
        setActionBody(`FHA EXECUTIVE MANDATE ORDER\nOFFICE OF THE MANAGING DIRECTOR / CEO\nORDER NO: FHA-CEO-DIR-2026-${currentAlert.id.split('-')[0].toUpperCase()}\n\nPROJECT: ${project}\nPRIMARY ASSIGNEE: ${contractor}\n\nMANDATE INSTRUCTIONS:\nThe responsible party is ordered to immediately deploy additional labor crews, secure necessary structural materials, and enforce double shifts (day and night) to resolve: "${currentAlert.title}".\n\nA penalty of NGN 500,000 per delayed day will commence if recovery milestones are missed.`);
        break;
    }
  };

  const handleSendAction = async () => {
    if (!currentAlert || !activeActionType) return;

    let detailsSummary = "";
    let successToast = "";

    switch (activeActionType) {
      case 'query':
        detailsSummary = `Dispatched official query directly to Contractor (${currentAlert.contractorName}) via Portal Inbox & registered email. Deadline: ${queryUrgency}`;
        successToast = `Formal Query successfully transmitted to Contractor (${currentAlert.contractorName}) via Portal & Email.`;
        break;

      case 'meeting': {
        const inviteeList = [];
        if (invitedContractor) inviteeList.push(`Contractor (${currentAlert.contractorName})`);
        if (invitedPM) inviteeList.push('Resident Project Manager');
        if (invitedQS) inviteeList.push('Lead Quantity Surveyor');
        if (invitedFinance) inviteeList.push('Finance Representative');

        const channels = [];
        if (notifyViaEmail) channels.push('Email');
        if (notifyViaProfile) channels.push('Profile Notification');

        detailsSummary = `Scheduled Mitigation Hearing for ${meetingDate} at ${meetingTime}. Sent notices to: ${inviteeList.join(', ')} via ${channels.join(' & ')}.`;
        successToast = `Meeting scheduled. Summons sent to all ${inviteeList.length} invitees on their profile notifications and email.`;
        break;
      }

      case 'withhold':
        detailsSummary = `Disbursement Hold Order issued to Finance Directorate & Central Treasury. All certificate releases for ${currentAlert.contractorName} suspended.`;
        successToast = `Funding Withhold Order transmitted to the Finance Team & Central Treasury. Payments are now locked.`;
        break;

      case 'directive': {
        const ccs = directiveCC.length > 0 ? ` (CC: ${directiveCC.join(', ')})` : '';
        detailsSummary = `Issued Executive Directive to ${directiveRecipient}${ccs}. Mandate recorded in official gazette.`;
        successToast = `Executive Directive successfully dispatched to ${directiveRecipient} and CC stakeholders.`;
        break;
      }
    }

    await onTriggerAlertAction(currentAlert.id, activeActionType, detailsSummary);
    setSendSuccessMessage(successToast);
    
    // Clear form after a short delay
    setTimeout(() => {
      setActiveActionType(null);
    }, 2500);
  };

  const handleToggleCC = (dept: string) => {
    setDirectiveCC(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const handleResolve = async () => {
    if (!currentAlert) return;
    if (window.confirm("Mark this exceptional risk alert as resolved? All on-site corrections must be certified.")) {
      await onResolveAlert(currentAlert.id);
      setActiveActionType(null);
      alert("Alert marked as Resolved in the FHA Cockpit.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-300 dark:border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-serif" style={{ fontFamily: 'Georgia, serif' }}>
          Executive Exception Cockpit <span className="text-amber-500">/</span> Risk Alerts
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Real-time alerts regarding timeline delays, missing updates, structural defects, or cost overruns across all national housing schemes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Risks List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Active Exception Flags ({alerts.filter(a => !a.resolved).length})</span>
            </h3>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
              Live Feed
            </span>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {alerts.map((a) => {
              const isSelected = selectedAlertId === a.id;
              return (
                <div 
                  key={a.id}
                  onClick={() => {
                    setSelectedAlertId(a.id);
                    setActiveActionType(null);
                    setSendSuccessMessage(null);
                  }}
                  className={`p-4 border rounded-xl cursor-pointer transition relative flex flex-col justify-between gap-3 shadow-xs ${
                    isSelected 
                      ? 'bg-amber-50/80 dark:bg-black/90 border-amber-500 ring-2 ring-amber-500/20 shadow-md' 
                      : a.resolved 
                      ? 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/5 opacity-70 hover:opacity-100 hover:border-slate-300' 
                      : 'bg-white dark:bg-black/50 border-slate-300 dark:border-white/10 hover:border-amber-500/60 hover:bg-slate-50/50 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${
                        a.resolved
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                          : a.severity === 'high'
                          ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-black'
                          : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                      }`}>
                        {a.resolved ? 'RESOLVED' : `${a.severity} Severity`}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">{a.dateRaised || a.dateCreated}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 group-hover:text-amber-600 transition-colors font-serif leading-snug" style={{ fontFamily: 'Georgia, serif' }}>
                      {a.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {a.details}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-slate-200 dark:border-white/10 pt-2.5 text-slate-600 dark:text-slate-400">
                    <span className="truncate max-w-[200px]">Estate: <strong className="text-slate-900 dark:text-slate-200">{a.projectName}</strong></span>
                    <span className={`flex items-center gap-0.5 font-bold transition text-[11px] ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                      Select <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Audit & Executive Remedial Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {currentAlert ? (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-2xl p-5 space-y-6 shadow-sm">
              
              {/* Alert Header details */}
              <div className="pb-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      currentAlert.resolved 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    }`}>
                      {currentAlert.resolved ? 'EXCEPTION RESOLVED' : 'ACTIVE EXCEPTION'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Ref: {currentAlert.id.toUpperCase()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                    {currentAlert.title}
                  </h3>
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                    <span>Project: <strong className="text-slate-900 dark:text-slate-200">{currentAlert.projectName}</strong></span>
                    <span>&bull;</span>
                    <span>Contractor: <strong className="text-amber-600 dark:text-amber-500 font-bold">{currentAlert.contractorName || 'Assigned Contractor'}</strong></span>
                  </div>
                </div>

                {!currentAlert.resolved && (
                  <button 
                    onClick={handleResolve}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm shrink-0 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Mark Resolved</span>
                  </button>
                )}
              </div>

              {/* Exception Narrative Details Box */}
              <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">
                  Audit Findings & Exception Particulars
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {currentAlert.details}
                </p>
              </div>

              {/* Action Buttons list (The 4 exact requested MD commands) */}
              {!currentAlert.resolved && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Executive Remedial Actions
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Click to compose writeup & dispatch</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button 
                      onClick={() => openActionForm('query')}
                      className={`font-bold p-3 rounded-xl text-xs flex flex-col items-center text-center justify-center gap-2 transition cursor-pointer border ${
                        activeActionType === 'query'
                          ? 'bg-amber-500 text-black border-amber-600 shadow-md ring-2 ring-amber-500/30'
                          : 'bg-white dark:bg-black/40 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-white/15 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-white/5'
                      }`}
                    >
                      <Mail className={`w-5 h-5 ${activeActionType === 'query' ? 'text-black' : 'text-amber-500'}`} />
                      <span>Send Query</span>
                    </button>

                    <button 
                      onClick={() => openActionForm('meeting')}
                      className={`font-bold p-3 rounded-xl text-xs flex flex-col items-center text-center justify-center gap-2 transition cursor-pointer border ${
                        activeActionType === 'meeting'
                          ? 'bg-amber-500 text-black border-amber-600 shadow-md ring-2 ring-amber-500/30'
                          : 'bg-white dark:bg-black/40 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-white/15 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-white/5'
                      }`}
                    >
                      <Calendar className={`w-5 h-5 ${activeActionType === 'meeting' ? 'text-black' : 'text-amber-500'}`} />
                      <span>Schedule Meeting</span>
                    </button>

                    <button 
                      onClick={() => openActionForm('withhold')}
                      className={`font-bold p-3 rounded-xl text-xs flex flex-col items-center text-center justify-center gap-2 transition cursor-pointer border ${
                        activeActionType === 'withhold'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-500/30'
                          : 'bg-white dark:bg-black/40 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-white/15 hover:border-rose-500 hover:bg-rose-50/50 dark:hover:bg-white/5'
                      }`}
                    >
                      <Ban className={`w-5 h-5 ${activeActionType === 'withhold' ? 'text-white' : 'text-rose-500'}`} />
                      <span>Withhold Funding</span>
                    </button>

                    <button 
                      onClick={() => openActionForm('directive')}
                      className={`font-bold p-3 rounded-xl text-xs flex flex-col items-center text-center justify-center gap-2 transition cursor-pointer border ${
                        activeActionType === 'directive'
                          ? 'bg-amber-500 text-black border-amber-600 shadow-md ring-2 ring-amber-500/30'
                          : 'bg-white dark:bg-black/40 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-white/15 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-white/5'
                      }`}
                    >
                      <Sparkles className={`w-5 h-5 ${activeActionType === 'directive' ? 'text-black' : 'text-amber-500'}`} />
                      <span>Issue Directive</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUCCESS NOTIFICATION BANNER */}
              {sendSuccessMessage && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-4 rounded-xl text-xs flex items-center gap-3 animate-fade-in shadow-xs">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="font-semibold">{sendSuccessMessage}</div>
                </div>
              )}

              {/* ACTION WRITEUP COMPOSER & SEND FORM */}
              {activeActionType && !sendSuccessMessage && (
                <div className="bg-slate-50 dark:bg-black/70 border-2 border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-md transition-all">
                  
                  {/* Top Bar of Form */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-black font-bold">
                        {activeActionType === 'query' ? <Mail className="w-4 h-4" /> :
                         activeActionType === 'meeting' ? <Calendar className="w-4 h-4" /> :
                         activeActionType === 'withhold' ? <Ban className="w-4 h-4" /> :
                         <Sparkles className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                          {activeActionType === 'query' && 'Send Query to Contractor'}
                          {activeActionType === 'meeting' && 'Schedule Meeting & Send Invite Summons'}
                          {activeActionType === 'withhold' && 'Transmit Withhold Order to Finance Team'}
                          {activeActionType === 'directive' && 'Issue Executive Directive'}
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          Review writeup details, configure recipient routing, and confirm transmission.
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveActionType(null)}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition"
                      title="Close writeup"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. QUERY SPECIFIC CONFIGURATION */}
                  {activeActionType === 'query' && (
                    <div className="space-y-3 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Primary Recipient (Contractor)
                          </label>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 font-medium text-slate-800 dark:text-slate-200">
                            <Building className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="font-bold">{currentAlert.contractorName || 'Assigned Contractor'}</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-auto bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                              Verified Vendor
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Response Turnaround Urgency
                          </label>
                          <select 
                            value={queryUrgency}
                            onChange={(e) => setQueryUrgency(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 p-2 rounded-lg text-xs outline-none focus:border-amber-500 font-medium"
                          >
                            <option value="24 Hours (Critical Emergency)">24 Hours (Critical Emergency)</option>
                            <option value="48 Hours (High Priority)">48 Hours (Standard Query Protocol)</option>
                            <option value="72 Hours (Routine Compliance)">72 Hours (Routine Compliance)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                        <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>The query will be dispatched directly to the contractor's official email address and pinned to their portal inbox with mandatory acknowledgement.</span>
                      </div>
                    </div>
                  )}

                  {/* 2. MEETING SPECIFIC CONFIGURATION */}
                  {activeActionType === 'meeting' && (
                    <div className="space-y-3 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Hearing Date</label>
                          <input 
                            type="date"
                            value={meetingDate}
                            onChange={(e) => setMeetingDate(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 p-2 rounded-lg text-xs outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Convening Time</label>
                          <input 
                            type="text"
                            value={meetingTime}
                            onChange={(e) => setMeetingTime(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 p-2 rounded-lg text-xs outline-none focus:border-amber-500"
                            placeholder="e.g. 10:00 AM UTC"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Venue / Mode</label>
                          <input 
                            type="text"
                            value={meetingVenue}
                            onChange={(e) => setMeetingVenue(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 p-2 rounded-lg text-xs outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Invitees Checklist */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                          Invited Stakeholders (Will Receive Summons & Calendar Invite)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={invitedContractor} 
                              onChange={(e) => setInvitedContractor(e.target.checked)}
                              className="accent-amber-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Contractor Managing Director & Site Lead</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={invitedPM} 
                              onChange={(e) => setInvitedPM(e.target.checked)}
                              className="accent-amber-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Resident Project Manager / Site Engineer</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={invitedQS} 
                              onChange={(e) => setInvitedQS(e.target.checked)}
                              className="accent-amber-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Quantity Surveyor & Quality Auditor</span>
                          </label>

                          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={invitedFinance} 
                              onChange={(e) => setInvitedFinance(e.target.checked)}
                              className="accent-amber-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Finance Directorate & Treasury Representative</span>
                          </label>
                        </div>
                      </div>

                      {/* Delivery channels */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-white/10">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Dispatch Channels:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={notifyViaEmail} 
                            onChange={(e) => setNotifyViaEmail(e.target.checked)}
                            className="accent-amber-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Official Email Notification</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={notifyViaProfile} 
                            onChange={(e) => setNotifyViaProfile(e.target.checked)}
                            className="accent-amber-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>In-App Profile Alert Notification</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 3. WITHHOLD SPECIFIC CONFIGURATION */}
                  {activeActionType === 'withhold' && (
                    <div className="space-y-3 bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider mb-1">
                            Target Recipient Division
                          </label>
                          <div className="p-2.5 rounded-lg bg-white dark:bg-black/50 border border-rose-300 dark:border-rose-800 font-bold text-rose-950 dark:text-rose-200 flex items-center gap-2">
                            <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Finance Directorate & Central Treasury</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider mb-1">
                            Enforcement Level
                          </label>
                          <div className="p-2.5 rounded-lg bg-white dark:bg-black/50 border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-950 dark:text-rose-200">
                            Complete Valuation Freeze (No Certificate Sign-offs)
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-rose-800 dark:text-rose-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Sending this withhold order immediately issues a critical notification to the Finance Team to halt all payments for <strong>{currentAlert.projectName}</strong>.</span>
                      </div>
                    </div>
                  )}

                  {/* 4. DIRECTIVE SPECIFIC CONFIGURATION */}
                  {activeActionType === 'directive' && (
                    <div className="space-y-3 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Send Directive To (Primary Responsible Party) *
                          </label>
                          <select 
                            value={directiveRecipient}
                            onChange={(e) => setDirectiveRecipient(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 p-2.5 rounded-lg text-xs outline-none focus:border-amber-500 font-bold"
                          >
                            <option value={`Contractor: ${currentAlert.contractorName || 'Building Partner'}`}>
                              Contractor: {currentAlert.contractorName || 'Building Partner'}
                            </option>
                            <option value="Resident Project Manager & Site Engineers">
                              Resident Project Manager & Site Engineers
                            </option>
                            <option value="Lead Quantity Surveyor & Field Auditors">
                              Lead Quantity Surveyor & Field Auditors
                            </option>
                            <option value="All Site Supervision Staff & Contractors">
                              All Site Supervision Staff & Contractors
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            Copy To (CC Stakeholders) - Click to toggle
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Legal & Contracts Directorate',
                              'Finance Directorate & Central Treasury',
                              'Executive Management Committee',
                              'Technical Audit & QA Unit'
                            ].map((dept) => {
                              const isCC = directiveCC.includes(dept);
                              return (
                                <button
                                  type="button"
                                  key={dept}
                                  onClick={() => handleToggleCC(dept)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded-md border transition cursor-pointer ${
                                    isCC
                                      ? 'bg-amber-500 text-black border-amber-600'
                                      : 'bg-slate-100 dark:bg-black/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300'
                                  }`}
                                >
                                  {isCC ? `✓ ${dept}` : `+ ${dept}`}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDITABLE WRITEUP TEXTAREA */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                      <span>Official Writeup Document Content</span>
                      <span className="text-[10px] text-slate-500 font-mono">Editable draft</span>
                    </label>
                    <textarea 
                      rows={7}
                      value={actionBody}
                      onChange={(e) => setActionBody(e.target.value)}
                      className="w-full bg-white dark:bg-black/80 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/20 p-3.5 rounded-xl text-xs font-mono leading-relaxed outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner"
                    />
                  </div>

                  {/* FORM ACTION FOOTER BUTTONS */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
                    <button 
                      type="button"
                      onClick={() => setActiveActionType(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
                    >
                      Cancel
                    </button>

                    <button 
                      type="button"
                      onClick={handleSendAction}
                      className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-md cursor-pointer ${
                        activeActionType === 'withhold'
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                          : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {activeActionType === 'query' && 'Send Query to Contractor'}
                        {activeActionType === 'meeting' && 'Send Meeting Invites to All'}
                        {activeActionType === 'withhold' && 'Send Withhold Order to Finance Team'}
                        {activeActionType === 'directive' && `Send Directive to ${directiveRecipient.split(':')[0]}`}
                      </span>
                    </button>
                  </div>

                </div>
              )}

              {/* Log / Audit Timeline history of actions taken */}
              <div className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Mitigation Audit History & Dispatched Orders
                  </span>
                  <span className="text-[10px] text-slate-500">{(currentAlert.logs || []).length} Recorded Actions</span>
                </div>
                
                <div className="space-y-2.5">
                  {(currentAlert.logs || []).map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs bg-slate-50 dark:bg-black/50 p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{log.date}</div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 leading-relaxed">{log.action}</p>
                      </div>
                    </div>
                  ))}
                  {(!currentAlert.logs || currentAlert.logs.length === 0) && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic py-3 text-center bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5">
                      No executive actions logged yet. Select one of the buttons above to compose and send.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 h-80 shadow-sm">
              <ShieldIcon className="w-12 h-12 text-slate-300 dark:text-white/15 animate-pulse" />
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold text-sm font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                  No Exception Flag Selected
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 max-w-sm">
                  Select an active exception flag from the left panel to audit findings and issue executive remedial queries, meeting summons, or withhold orders.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
