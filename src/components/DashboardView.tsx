import React, { useState } from 'react';
import { 
  Project, 
  Contractor, 
  RiskAlert, 
  ValuationRequest,
  CONSTRUCTION_STAGES,
  User as AppUser
} from '../types';
import { 
  Building, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  MapPin, 
  ChevronRight, 
  DollarSign,
  ShieldCheck,
  Clock,
  ExternalLink,
  Camera,
  Check,
  X,
  FileText
} from 'lucide-react';
import NigeriaMap from './NigeriaMap';
import GanttTimelineView from './GanttTimelineView';

interface DashboardViewProps {
  projects: Project[];
  contractors: Contractor[];
  alerts: RiskAlert[];
  valuations: ValuationRequest[];
  onSelectProject: (projectId: string) => void;
  onNavigateToTab: (tab: string) => void;
  onUpdateProject: (projectId: string, updateData: any) => Promise<void>;
  currentUser: AppUser | null;
  onApproveValuation?: (valId: string, approvalData: any) => Promise<void>;
}

export default function DashboardView({
  projects,
  contractors,
  alerts,
  valuations,
  onSelectProject,
  onNavigateToTab,
  onUpdateProject,
  currentUser,
  onApproveValuation
}: DashboardViewProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [approvalComments, setApprovalComments] = useState<{ [key: string]: string }>({});
  const [certifiedAmounts, setCertifiedAmounts] = useState<{ [key: string]: string }>({});

  const userRole = currentUser?.role || 'MD';

  // Compute pending queue for currently logged-in role
  const pendingQueue = valuations.filter(v => {
    if (userRole === 'MD') return v.currentStage === 'executive_approve';
    if (userRole === 'PM') return v.currentStage === 'project_manager_approve';
    if (userRole === 'QS') return v.currentStage === 'quantity_surveyor_certify';
    if (userRole === 'RE') return v.currentStage === 'resident_engineer_verify';
    if (userRole === 'FD') return v.currentStage === 'finance_review';
    if (userRole === 'CT') return v.currentStage === 'payment_released' && !v.history.some(h => h.stage === 'payment_released' && h.status === 'approved');
    return false;
  });

  const handleQuickApprove = async (valId: string, status: 'approved' | 'rejected') => {
    if (!onApproveValuation) return;
    const comments = approvalComments[valId] || `Quick approved in executive cockpit.`;
    const amtCert = certifiedAmounts[valId] ? Number(certifiedAmounts[valId]) : undefined;
    
    await onApproveValuation(valId, {
      status,
      comments,
      actor: currentUser?.name || `${userRole} Administrator`,
      amountCertified: amtCert
    });

    // Clear local states for this valuation
    setApprovalComments(prev => {
      const copy = { ...prev };
      delete copy[valId];
      return copy;
    });
    setCertifiedAmounts(prev => {
      const copy = { ...prev };
      delete copy[valId];
      return copy;
    });
  };

  const handleToggleStage = async (p: Project, stage: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const targetIndex = CONSTRUCTION_STAGES.indexOf(stage);
    if (targetIndex === -1) return;
    
    const currentChecked = !!p.stages[stage];
    const nextChecked = !currentChecked;
    
    const updatedStages = { ...p.stages };
    if (nextChecked) {
      // Mark this stage and all preceding stages as true
      for (let i = 0; i <= targetIndex; i++) {
        updatedStages[CONSTRUCTION_STAGES[i]] = true;
      }
    } else {
      // Unmark this stage and all succeeding stages as false
      for (let i = targetIndex; i < CONSTRUCTION_STAGES.length; i++) {
        updatedStages[CONSTRUCTION_STAGES[i]] = false;
      }
    }
    
    const checkedCount = CONSTRUCTION_STAGES.filter(s => updatedStages[s] === true).length;
    const newProgress = Math.round((checkedCount / CONSTRUCTION_STAGES.length) * 100);
    
    let newStatus = p.status;
    if (updatedStages["Completed"] === true) {
      newStatus = "Completed";
    } else if (newProgress > 0 && p.status === "Completed") {
      newStatus = "On Schedule";
    }

    await onUpdateProject(p.id, {
      stages: updatedStages,
      status: newStatus
    });
  };

  // Statistics
  const displayedProjects = userRole === 'CONTRACTOR'
    ? projects.filter(p => p.contractorId === currentUser?.contractorId)
    : projects;

  // Group projects into estates for dashboard directory widget
  const estatesMap: { [key: string]: Project[] } = {};
  displayedProjects.forEach(p => {
    let baseName = p.estateName;
    if (p.estateName.includes('Phase')) {
      baseName = p.estateName.split('Phase')[0].trim();
    } else if (p.estateName.includes('Heights')) {
      baseName = p.estateName.split('Heights')[0].trim() + ' Heights';
    }
    
    if (!estatesMap[baseName]) {
      estatesMap[baseName] = [];
    }
    estatesMap[baseName].push(p);
  });

  const dashboardEstates = Object.keys(estatesMap).map(name => {
    const groupProjects = estatesMap[name];
    const totalHouses = groupProjects.reduce((acc, p) => acc + (p.houseCount || 80), 0);
    const avgProgress = Math.round(groupProjects.reduce((acc, p) => acc + p.progress, 0) / groupProjects.length);
    const totalBudget = groupProjects.reduce((acc, p) => acc + p.budget, 0);
    const totalSpent = groupProjects.reduce((acc, p) => acc + p.spent, 0);
    
    let status: 'On Schedule' | 'Needs Attention' | 'Delayed' | 'Completed' = 'On Schedule';
    if (groupProjects.some(p => p.status === 'Delayed')) {
      status = 'Delayed';
    } else if (groupProjects.some(p => p.status === 'Needs Attention')) {
      status = 'Needs Attention';
    } else if (groupProjects.every(p => p.status === 'Completed')) {
      status = 'Completed';
    }

    return {
      name,
      state: groupProjects[0].state,
      projectsCount: groupProjects.length,
      totalHouses,
      avgProgress,
      totalBudget,
      totalSpent,
      status
    };
  });

  const totalProjects = displayedProjects.length;
  const onSchedule = displayedProjects.filter(p => p.status === 'On Schedule').length;
  const delayed = displayedProjects.filter(p => p.status === 'Delayed').length;
  const needsAttention = displayedProjects.filter(p => p.status === 'Needs Attention').length;
  const completed = displayedProjects.filter(p => p.status === 'Completed').length;

  const totalBudget = displayedProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = displayedProjects.reduce((sum, p) => sum + p.spent, 0);
  const activeContractors = userRole === 'CONTRACTOR' ? 1 : contractors.filter(c => c.status === 'approved' && c.assignedProjectsCount > 0).length;
  const pendingValuations = userRole === 'CONTRACTOR' 
    ? valuations.filter(v => v.projectId && displayedProjects.some(dp => dp.id === v.projectId) && v.currentStage !== 'payment_released').length
    : valuations.filter(v => v.currentStage !== 'payment_released').length;

  const activeAlerts = userRole === 'CONTRACTOR'
    ? alerts.filter(a => !a.resolved && a.projectId && displayedProjects.some(dp => dp.id === a.projectId))
    : alerts.filter(a => !a.resolved);
  const highSeverityAlerts = activeAlerts.filter(a => a.severity === 'high').length;

  // Formatter for Naira
  const formatNaira = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
    }
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  };

  // State-specific projects filter with FCT/Abuja alias support
  const stateProjects = selectedState 
    ? displayedProjects.filter(p => {
        const pState = p.state.toLowerCase();
        const sel = selectedState.toLowerCase();
        return pState === sel || 
          (sel === 'fct' && (pState === 'abuja' || pState === 'fct')) || 
          (sel === 'abuja' && (pState === 'abuja' || pState === 'fct'));
      })
    : displayedProjects;

  // Active status color helpers
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'On Schedule': return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30';
      case 'Needs Attention': return 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30';
      case 'Delayed': return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30';
      case 'Completed': return 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30';
    }
  };

  const getStateColor = (state: string) => {
    const stateProjs = displayedProjects.filter(p => p.state.toLowerCase() === state.toLowerCase());
    if (stateProjs.length === 0) return 'fill-slate-800 hover:fill-slate-700';
    
    const hasDelayed = stateProjs.some(p => p.status === 'Delayed');
    const hasAttention = stateProjs.some(p => p.status === 'Needs Attention');
    const allCompleted = stateProjs.every(p => p.status === 'Completed');

    if (hasDelayed) return 'fill-rose-500 hover:fill-rose-400 stroke-rose-300';
    if (hasAttention) return 'fill-amber-500 hover:fill-amber-400 stroke-amber-300';
    if (allCompleted) return 'fill-sky-500 hover:fill-sky-400 stroke-sky-300';
    return 'fill-emerald-500 hover:fill-emerald-400 stroke-emerald-300';
  };

  // Extract all photo updates from projects
  const recentPhotos = displayedProjects
    .flatMap(p => p.photoUpdates.map(pu => ({ ...pu, project: p })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Title & Alerts Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight font-serif" style={{ fontFamily: 'Georgia, serif' }}>
            Executive Monitor <span className="text-amber-500">/</span> Program Dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Real-time Nationwide Delivery & Strategic Monitoring Cockpit</p>
        </div>
        
        {highSeverityAlerts > 0 && (
          <div 
            onClick={() => onNavigateToTab('alerts')}
            className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg cursor-pointer hover:bg-rose-500/15 transition-all"
          >
            <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400">{highSeverityAlerts} CRITICAL SYSTEM ALERTS</div>
              <div className="text-[10px] text-rose-700 dark:text-rose-300">Requires Executive Intervention &bull; Click to view</div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
        )}
      </div>

      {/* PENDING APPROVALS TASK QUEUE (Interactive) */}
      {pendingQueue.length > 0 && (
        <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-500/20 dark:border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h3 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest">
                Action Required: Pending Approvals Queue ({pendingQueue.length})
              </h3>
            </div>
            <button 
              onClick={() => onNavigateToTab('valuations')}
              className="text-[10px] text-slate-700 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Open Full Valuations Workspace &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingQueue.map(v => {
              const showAmountInput = ['QS', 'PM'].includes(userRole);
              return (
                <div 
                  key={v.id} 
                  className="bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 hover:border-amber-500/60 rounded-xl p-4 transition space-y-3 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{v.estateName}</h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400">{v.houseType}</p>
                      </div>
                      <span className="text-[9px] bg-amber-500/15 text-amber-800 dark:text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase border border-amber-500/30">
                        {v.invoiceNumber}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <div>Contractor: <strong className="text-slate-900 dark:text-slate-100">{v.contractorName}</strong></div>
                      <div>Requested Sum: <strong className="text-amber-700 dark:text-amber-400">{formatNaira(v.amountRequested)}</strong></div>
                      {v.amountCertified && v.amountCertified !== v.amountRequested && (
                        <div>Certified Amount: <strong className="text-emerald-700 dark:text-emerald-400">{formatNaira(v.amountCertified)}</strong></div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                    {/* Optional certification amount input for QS/PM */}
                    {showAmountInput && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Certify Amount (₦)</label>
                        <input 
                          type="number"
                          placeholder={`Default: ${v.amountRequested}`}
                          value={certifiedAmounts[v.id] || ''}
                          onChange={(e) => setCertifiedAmounts(prev => ({ ...prev, [v.id]: e.target.value }))}
                          className="w-full bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition font-mono"
                        />
                      </div>
                    )}

                    {/* Comments */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Approval Audit Remarks</label>
                      <input 
                        type="text"
                        placeholder="e.g., Works inspected and certified in order."
                        value={approvalComments[v.id] || ''}
                        onChange={(e) => setApprovalComments(prev => ({ ...prev, [v.id]: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1.5">
                      <button
                        onClick={() => handleQuickApprove(v.id, 'rejected')}
                        className="flex-1 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-700 dark:text-rose-400 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline & Query
                      </button>
                      <button
                        onClick={() => handleQuickApprove(v.id, 'approved')}
                        className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Authorize Approval
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-300 dark:border-white/10 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-widest">Total Deliveries</span>
            <div className="text-3xl font-light text-slate-900 dark:text-white mt-1">
              {displayedProjects.reduce((s, p) => s + p.houseCount, 0)} <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Houses</span>
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">{totalProjects} Estates Nationwide</div>
          </div>
          <div className="bg-amber-500/10 dark:bg-white/5 border border-amber-500/30 dark:border-white/10 p-2.5 rounded-lg text-amber-700 dark:text-amber-500">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-300 dark:border-white/10 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-widest">Budget Spent</span>
            <div className="text-3xl font-light text-amber-700 dark:text-amber-400 mt-1">{formatNaira(totalSpent)}</div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">Allocated: {formatNaira(totalBudget)} ({Math.round((totalSpent / totalBudget) * 100)}%)</div>
          </div>
          <div className="bg-amber-500/10 dark:bg-white/5 border border-amber-500/30 dark:border-white/10 p-2.5 rounded-lg text-amber-700 dark:text-amber-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-300 dark:border-white/10 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-widest">Delivery Status</span>
            <div className="text-3xl font-light text-slate-900 dark:text-white mt-1 flex items-baseline gap-1.5">
              <span>{onSchedule + completed}</span>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">On Track</span>
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">
              <span className="text-rose-700 dark:text-rose-400 font-semibold">{delayed} Delayed</span> &bull; <span className="text-amber-700 dark:text-amber-400 font-semibold">{needsAttention} Attention</span>
            </div>
          </div>
          <div className="bg-amber-500/10 dark:bg-white/5 border border-amber-500/30 dark:border-white/10 p-2.5 rounded-lg text-amber-700 dark:text-amber-500">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-300 dark:border-white/10 shadow-xs flex items-center justify-between border-l-4 border-l-amber-500 transition-colors">
          <div>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-widest font-sans">Payments & Audits</span>
            <div className="text-3xl font-light text-slate-900 dark:text-white mt-1">
              {pendingValuations} <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Pending</span>
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">{activeContractors} Contractors Engaged</div>
          </div>
          <div className="bg-amber-500/10 dark:bg-white/5 border border-amber-500/30 dark:border-white/10 p-2.5 rounded-lg text-amber-700 dark:text-amber-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Core Dashboard Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Map & State Drilldown Card - Clean White Mode with Dark Mode Support */}
        <div className="xl:col-span-2 bg-white dark:bg-[#090d16] border border-slate-300 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[550px] shadow-xs dark:shadow-2xl text-slate-900 dark:text-white transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-medium text-slate-900 dark:text-white flex items-center gap-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                  <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>National Delivery Map</span>
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs">Geographically authentic map of Nigeria. Click any highlighted state to filter estates.</p>
              </div>
              
              {selectedState && (
                <button 
                  onClick={() => setSelectedState(null)}
                  className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                >
                  Clear Filter ({selectedState})
                </button>
              )}
            </div>

            {/* Actual Geographically Authentic Map of Nigeria */}
            <NigeriaMap 
              projects={displayedProjects}
              selectedState={selectedState}
              onSelectState={setSelectedState}
              getStateColor={getStateColor}
            />
          </div>

          {/* Drilldown Section - Estates Scorecard */}
          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-slate-900 dark:text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                {selectedState ? `${selectedState} State Estates Scorecard` : "All Estates Scorecard (Nationwide)"}
              </h4>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
                {stateProjects.length} Active Schemes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stateProjects.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="bg-slate-50 dark:bg-[#0d1322] p-4 rounded-xl border border-slate-300 dark:border-slate-700/80 hover:border-amber-500/60 hover:bg-slate-100 dark:hover:bg-[#11192d] cursor-pointer transition-all flex flex-col justify-between gap-3 group text-slate-900 dark:text-white shadow-xs dark:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors font-serif">{p.estateName}</div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        <span>{p.state} &bull; <strong className="text-slate-900 dark:text-white">{p.houseCount} Houses</strong></span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300 mb-1">
                      <span>Delivery Completion</span>
                      <span className="font-bold text-slate-900 dark:text-white">{p.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700/50">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          p.status === 'Delayed' ? 'bg-rose-500' : p.status === 'Needs Attention' ? 'bg-amber-500' : p.status === 'Completed' ? 'bg-sky-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${p.progress}%` }} 
                      />
                    </div>
                  </div>

                  {/* Interactive Milestones */}
                  <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-2" onClick={(e) => e.stopPropagation()}>
                    <div className="text-[9px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>WBS Click-to-Update (Live)</span>
                      <span className="text-amber-600 dark:text-amber-400 text-[8px] animate-pulse">● Interactive</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {["Excavation", "Foundation", "Roofing", "Finishes", "Completed"].map((stage) => {
                        const isChecked = !!p.stages[stage];
                        return (
                          <button
                            key={`${p.id}-${stage}`}
                            onClick={(e) => handleToggleStage(p, stage, e)}
                            className={`px-1.5 py-0.5 text-[8px] font-bold rounded border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-amber-500/20 border-amber-500/60 text-amber-800 dark:text-amber-300 hover:bg-amber-500/30'
                                : 'bg-white dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title={`Mark up to ${stage} completed`}
                          >
                            {stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2.5 text-[10px] text-slate-600 dark:text-slate-400">
                    <div className="truncate max-w-[140px]">Contr: <span className="font-semibold text-slate-800 dark:text-slate-200">{p.contractorName}</span></div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 font-medium">
                      <span>Update PM</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estates Directory Portfolio Overview Widget (Available on All Dashboards) */}
          <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                  <Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Estate Portfolio Directory Overview</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-[10px] mt-0.5">National portfolio grouped by estate developments and consolidated key performance metrics</p>
              </div>
              <button
                onClick={() => onNavigateToTab('estates')}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Open Directory Tab</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white dark:bg-[#0c121e] border border-slate-300 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-xs dark:shadow-xl text-slate-800 dark:text-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060911] text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      <th className="py-2.5 px-4">Estate Name</th>
                      <th className="py-2.5 px-4">State</th>
                      <th className="py-2.5 px-4 text-center">Contracts</th>
                      <th className="py-2.5 px-4 text-center">Houses</th>
                      <th className="py-2.5 px-4">Avg Progress</th>
                      <th className="py-2.5 px-4 text-right">Total Budget</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-200">
                    {dashboardEstates.map((est) => (
                      <tr 
                        key={est.name} 
                        onClick={() => onNavigateToTab('estates')}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                      >
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-serif">{est.name}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{est.state}</td>
                        <td className="py-3 px-4 text-center text-slate-900 dark:text-white font-bold">{est.projectsCount}</td>
                        <td className="py-3 px-4 text-center text-slate-900 dark:text-white font-semibold">{est.totalHouses} Units</td>
                        <td className="py-3 px-4 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-[10px] w-8">{est.avgProgress}%</span>
                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden max-w-[80px]">
                              <div 
                                className={`h-full ${
                                  est.status === 'Delayed' ? 'bg-rose-500' : est.status === 'Needs Attention' ? 'bg-amber-500' : est.status === 'Completed' ? 'bg-sky-500' : 'bg-emerald-500'
                                }`} 
                                style={{ width: `${est.avgProgress}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-700 dark:text-amber-400 text-[11px] font-mono">{formatNaira(est.totalBudget)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                            est.status === 'Completed' ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40' :
                            est.status === 'Delayed' ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40' :
                            est.status === 'Needs Attention' ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40' :
                            'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {est.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Program Delivery Gantt & Projected Milestones Visual Timeline (Directly below Estate Portfolio Directory Overview) */}
            <div className="pt-2">
              <GanttTimelineView 
                projects={displayedProjects} 
                onSelectProject={onSelectProject} 
                className="bg-slate-50/60 dark:bg-black/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 md:p-5 space-y-5 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Widgets (Photos & Realtime Incidents) */}
        <div className="space-y-6">
          
          {/* Recent Site Evidence Stream */}
          <div className="bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl p-5 flex flex-col h-[280px] shadow-xs transition-colors">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2 mb-3 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
              <Camera className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              <span>Real-Time Site Photo Stream</span>
            </h3>
            
            {recentPhotos.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-slate-500">
                <Camera className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-1.5" />
                No photos uploaded this period.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {recentPhotos.map((photo, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 bg-slate-50 dark:bg-black/45 p-2 rounded-lg border border-slate-300 dark:border-white/10 cursor-pointer hover:border-slate-400 dark:hover:border-white/20 transition"
                    onClick={() => onSelectProject(photo.project.id)}
                  >
                    <img 
                      src={photo.afterPhoto} 
                      alt={photo.stage} 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded object-cover border border-slate-300 dark:border-white/10 shrink-0" 
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{photo.project.estateName}</div>
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">{photo.stage} Completed</div>
                      <div className="text-[9px] text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5 text-slate-500" />
                        <span>{new Date(photo.timestamp).toLocaleDateString()} &bull; {photo.uploadedBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core Risk & Alerts Sidebar Widget */}
          <div className="bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl p-5 flex flex-col h-[246px] shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>Strategic Risk Track</span>
              </h3>
              <span className="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 font-bold px-2 py-0.5 rounded text-[10px]">
                {activeAlerts.length} Active
              </span>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-slate-500">
                <ShieldCheck className="w-8 h-8 text-emerald-500/25 mb-1.5" />
                No pending or unmitigated risks.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {activeAlerts.slice(0, 3).map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                      alert.severity === 'high' 
                        ? 'bg-rose-500/5 border-rose-500/30 hover:bg-rose-500/10' 
                        : 'bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10'
                    }`}
                    onClick={() => onNavigateToTab('alerts')}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold uppercase text-[9px] ${alert.severity === 'high' ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {alert.severity} Priority &bull; {alert.category}
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400">{alert.dateCreated}</span>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-white truncate">{alert.title}</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate mt-0.5">{alert.details}</div>
                  </div>
                ))}
                
                {activeAlerts.length > 3 && (
                  <button 
                    onClick={() => onNavigateToTab('alerts')}
                    className="w-full text-center py-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-black rounded-md border border-slate-300 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/5 transition cursor-pointer"
                  >
                    View All Exception Alerts (+{activeAlerts.length - 3} more)
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
