import React, { useState, useMemo } from 'react';
import { Project, CONSTRUCTION_STAGES } from '../types';
import { 
  Calendar, 
  Clock, 
  Flag, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Layers,
  ArrowUpRight,
  TrendingDown,
  Info
} from 'lucide-react';

interface GanttTimelineViewProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  className?: string;
}

// Milestone stage groups mapped to construction stages
const MILESTONE_GROUPS = [
  { id: 'substructure', label: 'Substructure', stages: ['Site clearing', 'Setting out', 'Excavation', 'Foundation', 'Ground beam'] },
  { id: 'superstructure', label: 'Superstructure', stages: ['Block work', 'Lintel', 'Roofing'] },
  { id: 'services', label: 'Services & MEP', stages: ['Electrical', 'Plumbing'] },
  { id: 'finishes', label: 'Finishes & Handover', stages: ['Finishes', 'External works', 'Completed'] }
];

export default function GanttTimelineView({ projects, onSelectProject, className }: GanttTimelineViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [viewWindow, setViewWindow] = useState<'all' | '2026' | '2027'>('all');

  // Today reference date in context (Current platform operational year is 2026)
  const referenceToday = useMemo(() => new Date('2026-09-22'), []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchesSearch = 
        p.estateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.houseType.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [projects, filterStatus, searchTerm]);

  // Determine overall timeline bounds across all projects
  const { minDate, maxDate, totalDays, monthsList } = useMemo(() => {
    let earliest = new Date('2025-06-01');
    let latest = new Date('2027-08-01');

    projects.forEach(p => {
      if (p.startDate) {
        const s = new Date(p.startDate);
        if (!isNaN(s.getTime()) && s < earliest) earliest = s;
      }
      if (p.targetCompletionDate) {
        const t = new Date(p.targetCompletionDate);
        if (!isNaN(t.getTime()) && t > latest) latest = t;
      }
    });

    if (viewWindow === '2026') {
      earliest = new Date('2026-01-01');
      latest = new Date('2026-12-31');
    } else if (viewWindow === '2027') {
      earliest = new Date('2027-01-01');
      latest = new Date('2027-12-31');
    }

    const tDays = Math.max(1, Math.round((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)));

    // Generate monthly timeline markers
    const months: { label: string; year: string; percent: number; isQuarter: boolean }[] = [];
    const cur = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
    while (cur <= latest) {
      const monthOffset = Math.round((cur.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24));
      const pct = Math.max(0, Math.min(100, (monthOffset / tDays) * 100));
      const monthName = cur.toLocaleString('default', { month: 'short' });
      const yearName = cur.getFullYear().toString();
      const isQuarter = cur.getMonth() % 3 === 0;

      months.push({
        label: monthName,
        year: yearName,
        percent: pct,
        isQuarter
      });
      cur.setMonth(cur.getMonth() + 1);
    }

    return { minDate: earliest, maxDate: latest, totalDays: tDays, monthsList: months };
  }, [projects, viewWindow]);

  // Calculate position percentage for any date relative to bounds
  const getPositionPercent = (dateStr: string) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 0;
    const diff = d.getTime() - minDate.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    const pct = (days / totalDays) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  // Position of 'Today'
  const todayPercent = useMemo(() => {
    const diff = referenceToday.getTime() - minDate.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.min(100, (days / totalDays) * 100));
  }, [referenceToday, minDate, totalDays]);

  // Aggregate timeline statistics
  const stats = useMemo(() => {
    const delayedCount = projects.filter(p => p.status === 'Delayed').length;
    const attentionCount = projects.filter(p => p.status === 'Needs Attention').length;
    const onScheduleCount = projects.filter(p => p.status === 'On Schedule').length;
    const completedCount = projects.filter(p => p.status === 'Completed').length;
    const avgProgress = Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / (projects.length || 1));
    const totalSlippageDays = projects.reduce((acc, p) => acc + (p.timelineExceededDays || 0), 0);
    return { delayedCount, attentionCount, onScheduleCount, completedCount, avgProgress, totalSlippageDays };
  }, [projects]);

  const toggleExpand = (id: string) => {
    setExpandedProjectId(prev => prev === id ? null : id);
  };

  return (
    <div className={className || "bg-white dark:bg-[#090d16] border border-slate-300 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs dark:shadow-2xl transition-colors space-y-5"}>
      
      {/* 1. Header Bar: Title, Meta & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white font-serif tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
              Program Delivery Gantt & Milestone Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Tracking planned contractual milestones against physical stage completions across all nationwide estates.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search box */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search estate, state, contractor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            {(['all', 'On Schedule', 'Needs Attention', 'Delayed', 'Completed'] as const).map(statusKey => (
              <button
                key={statusKey}
                onClick={() => setFilterStatus(statusKey)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  filterStatus === statusKey
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {statusKey === 'all' ? 'All Status' : statusKey}
              </button>
            ))}
          </div>

          {/* Time window scale filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            {(['all', '2026', '2027'] as const).map(windowKey => (
              <button
                key={windowKey}
                onClick={() => setViewWindow(windowKey)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition cursor-pointer uppercase ${
                  viewWindow === windowKey
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {windowKey === 'all' ? 'Full Scope' : windowKey}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Executive Timeline Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Average Program Progress</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{stats.avgProgress}%</span>
            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${stats.avgProgress}%` }} />
            </div>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Milestone Adherence</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.onScheduleCount + stats.completedCount}
            </span>
            <span className="text-slate-500">/ {projects.length} on target</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Critical Slippages</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-lg font-bold font-mono ${stats.delayedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {stats.delayedCount}
            </span>
            <span className="text-slate-500">Estates past target</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Total Cumulative Delay</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-lg font-bold font-mono ${stats.totalSlippageDays > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
              +{stats.totalSlippageDays}
            </span>
            <span className="text-slate-500">Days reported</span>
          </div>
        </div>
      </div>

      {/* 3. Gantt Chart Body & Timeline Grid */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#070a10]">
        
        {/* Scrollable Container with sticky project column */}
        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            
            {/* Timeline Header Row (Months / Quarters) */}
            <div className="flex items-stretch border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/90 text-[10px] font-semibold text-slate-600 dark:text-slate-300 select-none">
              {/* Left Column Header (Estate / Project Info) */}
              <div className="w-[320px] shrink-0 p-3 border-r border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>ESTATE & CONTRACTOR</span>
                <span className="text-[9px] text-slate-500 font-mono">STATUS / %</span>
              </div>

              {/* Right Timeline Time Axis */}
              <div className="flex-1 relative h-10 flex items-center overflow-hidden">
                {monthsList.map((m, idx) => (
                  <div
                    key={idx}
                    className={`absolute top-0 bottom-0 flex flex-col justify-center border-l ${
                      m.isQuarter 
                        ? 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold' 
                        : 'border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 font-normal'
                    } pl-1.5`}
                    style={{ left: `${m.percent}%` }}
                  >
                    <span>{m.label}</span>
                    {m.isQuarter && <span className="text-[8px] text-slate-500 dark:text-slate-400 -mt-0.5">{m.year}</span>}
                  </div>
                ))}

                {/* Today Line Badge in Header */}
                <div 
                  className="absolute top-0 bottom-0 z-20 flex flex-col items-center pointer-events-none"
                  style={{ left: `${todayPercent}%` }}
                >
                  <span className="bg-amber-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow-xs -translate-x-1/2 uppercase tracking-wider">
                    Today
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Rows for Projects */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProjects.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No projects match the selected status filter or search keywords.
                </div>
              ) : (
                filteredProjects.map((p) => {
                  const startPct = getPositionPercent(p.startDate);
                  const targetPct = getPositionPercent(p.targetCompletionDate);
                  const barWidth = Math.max(2, targetPct - startPct);
                  const isExpanded = expandedProjectId === p.id;
                  const hasDelay = (p.timelineExceededDays && p.timelineExceededDays > 0) || p.status === 'Delayed';
                  const slippageWidth = hasDelay ? Math.min(15, (p.timelineExceededDays || 20) * 0.25) : 0;

                  // Compute completed stages count
                  const completedStagesCount = Object.values(p.stages || {}).filter(Boolean).length;
                  const totalStages = CONSTRUCTION_STAGES.length;

                  // Bar color styling based on project status
                  let barGradient = 'from-emerald-600 to-teal-500';
                  let barTrack = 'bg-emerald-500/20';
                  let statusBadgeStyle = 'text-emerald-700 dark:text-emerald-400';

                  if (p.status === 'Delayed') {
                    barGradient = 'from-rose-600 to-red-500';
                    barTrack = 'bg-rose-500/20';
                    statusBadgeStyle = 'text-rose-700 dark:text-rose-400';
                  } else if (p.status === 'Needs Attention') {
                    barGradient = 'from-amber-600 to-amber-500';
                    barTrack = 'bg-amber-500/20';
                    statusBadgeStyle = 'text-amber-800 dark:text-amber-400';
                  } else if (p.status === 'Completed') {
                    barGradient = 'from-sky-600 to-blue-500';
                    barTrack = 'bg-sky-500/20';
                    statusBadgeStyle = 'text-sky-700 dark:text-sky-400';
                  }

                  return (
                    <div key={p.id} className="group hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition">
                      {/* Main Project Row */}
                      <div className="flex items-stretch min-h-[58px]">
                        
                        {/* Left Info Column */}
                        <div className="w-[320px] shrink-0 p-3 border-r border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => toggleExpand(p.id)}
                                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition cursor-pointer"
                                title="Expand construction milestone stages"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <span 
                                onClick={() => onSelectProject(p.id)}
                                className="font-semibold text-xs text-slate-900 dark:text-white truncate hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer font-serif"
                                style={{ fontFamily: 'Georgia, serif' }}
                              >
                                {p.estateName}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-slate-500 ml-5 mt-0.5 truncate">
                              <span>{p.state}</span>
                              <span>&bull;</span>
                              <span className="truncate">{p.contractorName}</span>
                            </div>
                          </div>

                          {/* Progress & Quick Action */}
                          <div className="text-right shrink-0 flex flex-col items-end">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                                {p.progress}%
                              </span>
                              <button
                                onClick={() => onSelectProject(p.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-600 transition p-0.5 cursor-pointer"
                                title="Open full project profile"
                              >
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>
                            <span className={`text-[9px] font-semibold ${statusBadgeStyle}`}>
                              {p.status}
                            </span>
                          </div>
                        </div>

                        {/* Right Gantt Chart Bar Canvas */}
                        <div className="flex-1 relative flex items-center px-2">
                          
                          {/* Vertical Grid lines corresponding to months */}
                          {monthsList.map((m, idx) => (
                            <div
                              key={idx}
                              className={`absolute top-0 bottom-0 border-l pointer-events-none ${
                                m.isQuarter 
                                  ? 'border-slate-200 dark:border-slate-800/80' 
                                  : 'border-slate-100 dark:border-slate-900/60'
                              }`}
                              style={{ left: `${m.percent}%` }}
                            />
                          ))}

                          {/* Vertical Today line */}
                          <div
                            className="absolute top-0 bottom-0 w-px bg-amber-500/80 z-10 pointer-events-none"
                            style={{ left: `${todayPercent}%` }}
                          />

                          {/* Gantt Bar Component */}
                          <div 
                            className="relative h-7 rounded-md cursor-pointer transition-all duration-200 group-hover:brightness-105"
                            style={{
                              left: `${startPct}%`,
                              width: `${Math.max(barWidth, 3)}%`
                            }}
                            onClick={() => toggleExpand(p.id)}
                            title={`${p.estateName}: ${p.progress}% completed (Planned: ${p.startDate} to ${p.targetCompletionDate})`}
                          >
                            {/* Background Contractual Scheduled Track */}
                            <div className={`absolute inset-0 rounded-md ${barTrack} border border-slate-300/40 dark:border-white/10`} />

                            {/* Actual Work Completed Progress Fill */}
                            <div 
                              className={`h-full rounded-md bg-gradient-to-r ${barGradient} shadow-xs flex items-center justify-between px-2 text-[10px] text-white font-medium transition-all duration-300 overflow-hidden`}
                              style={{ width: `${Math.max(p.progress, 4)}%` }}
                            >
                              {barWidth > 12 && p.progress >= 20 && (
                                <span className="truncate font-mono drop-shadow-xs">
                                  {p.progress}%
                                </span>
                              )}
                            </div>

                            {/* Projected Slippage extension block for delayed projects */}
                            {hasDelay && slippageWidth > 0 && (
                              <div
                                className="absolute top-0 bottom-0 left-full bg-rose-500/30 border border-rose-500/60 border-dashed rounded-r-md flex items-center px-1.5 text-[9px] font-bold text-rose-700 dark:text-rose-300"
                                style={{ width: `${slippageWidth}%` }}
                                title={`Projected slippage: +${p.timelineExceededDays || 25} days`}
                              >
                                <span className="truncate">+{p.timelineExceededDays || 25}d</span>
                              </div>
                            )}

                            {/* Start Flag Marker */}
                            <div 
                              className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-700 dark:bg-slate-300 border-2 border-white dark:border-black shadow-xs"
                              title={`Project Start: ${p.startDate}`}
                            />

                            {/* Target Milestone Completion Flag */}
                            <div 
                              className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-black shadow-xs flex items-center justify-center text-[7px] text-white font-bold"
                              title={`Target Handover: ${p.targetCompletionDate}`}
                            >
                              <Flag className="w-1.5 h-1.5 text-white" />
                            </div>

                            {/* Mid-flight Milestone Dots (Foundation, Superstructure, Finishes) */}
                            {barWidth > 15 && (
                              <>
                                <div 
                                  className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white dark:border-black ${
                                    p.stages['Foundation'] ? 'bg-emerald-300' : 'bg-slate-400'
                                  }`}
                                  style={{ left: '30%' }}
                                  title="Milestone 1: Substructure & Foundation"
                                />
                                <div 
                                  className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white dark:border-black ${
                                    p.stages['Roofing'] ? 'bg-emerald-300' : 'bg-slate-400'
                                  }`}
                                  style={{ left: '60%' }}
                                  title="Milestone 2: Roofing & Shell"
                                />
                                <div 
                                  className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white dark:border-black ${
                                    p.stages['Finishes'] ? 'bg-emerald-300' : 'bg-slate-400'
                                  }`}
                                  style={{ left: '85%' }}
                                  title="Milestone 3: Finishes & Fittings"
                                />
                              </>
                            )}
                          </div>

                        </div>
                      </div>

                      {/* Expanded Sub-view: Sequential Construction Milestones breakdown */}
                      {isExpanded && (
                        <div className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80 p-4 pl-10 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Construction Milestones Audit ({completedStagesCount} of {totalStages} Stages Completed)
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>Start: <strong className="text-slate-800 dark:text-slate-200">{p.startDate}</strong></span>
                              <span>&bull;</span>
                              <span>Target: <strong className="text-slate-800 dark:text-slate-200">{p.targetCompletionDate}</strong></span>
                              {p.actualCompletionDate && (
                                <>
                                  <span>&bull;</span>
                                  <span>Handover: <strong className="text-emerald-600">{p.actualCompletionDate}</strong></span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Milestone Category Groups */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                            {MILESTONE_GROUPS.map(group => {
                              const completedInGroup = group.stages.filter(stg => !!p.stages[stg]).length;
                              const isAllDone = completedInGroup === group.stages.length;
                              const isPartial = completedInGroup > 0 && !isAllDone;

                              return (
                                <div 
                                  key={group.id}
                                  className="bg-white dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2 text-xs"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{group.label}</span>
                                    <span className={`text-[10px] font-mono font-bold ${
                                      isAllDone ? 'text-emerald-600 dark:text-emerald-400' : isPartial ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                                    }`}>
                                      {completedInGroup}/{group.stages.length}
                                    </span>
                                  </div>

                                  <div className="space-y-1">
                                    {group.stages.map(stageName => {
                                      const isDone = !!p.stages[stageName];
                                      return (
                                        <div key={stageName} className="flex items-center gap-1.5 text-[11px]">
                                          {isDone ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                          ) : (
                                            <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                                          )}
                                          <span className={isDone ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-400 dark:text-slate-600'}>
                                            {stageName}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Project Manager Remarks & Action button */}
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <div className="text-slate-600 dark:text-slate-400 text-[11px] flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Assigned PM: <strong className="text-slate-800 dark:text-slate-200">{p.projectManager}</strong> &bull; House Type: {p.houseType} ({p.houseCount} units)</span>
                            </div>
                            <button
                              onClick={() => onSelectProject(p.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                            >
                              <span>Inspect In Detail</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Legend Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-emerald-600 to-teal-500" />
              <span>On Schedule Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-amber-600 to-amber-500" />
              <span>Needs Attention</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-rose-600 to-red-500" />
              <span>Delayed Milestone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border border-rose-500 border-dashed bg-rose-500/20" />
              <span>Projected Slippage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Milestone Target Handover</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-3 bg-amber-500" />
              <span>Current Date (Today)</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500">
            Click any project row or arrow to inspect milestone details
          </div>
        </div>

      </div>

    </div>
  );
}
