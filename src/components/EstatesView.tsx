import React, { useState } from 'react';
import { Project, Contractor } from '../types';
import { 
  Building, 
  MapPin, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Home,
  User,
  Activity
} from 'lucide-react';

interface EstatesViewProps {
  projects: Project[];
  contractors: Contractor[];
  onSelectProject: (projectId: string) => void;
}

interface EstateGroup {
  name: string;
  state: string;
  projects: Project[];
  totalHouses: number;
  avgProgress: number;
  totalBudget: number;
  totalSpent: number;
  status: 'On Schedule' | 'Needs Attention' | 'Delayed' | 'Completed';
}

export default function EstatesView({ projects, contractors, onSelectProject }: EstatesViewProps) {
  const [selectedState, setSelectedState] = useState<string>('All');
  const [expandedEstate, setExpandedEstate] = useState<string | null>(null);

  // Group projects into estates by splitting or matching prefix
  // Since the projects are like: "Kada Hill Estate Phase 1", "Gwarinpa Vista Heights", "Rumuokoro Royal Garden Phase 2"
  // Let's group them nicely.
  const estatesMap: { [key: string]: Project[] } = {};
  projects.forEach(p => {
    // Determine base estate name (e.g. "Kada Hill Estate", "Gwarinpa Vista", "Rumuokoro Royal Garden")
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

  const estateGroups: EstateGroup[] = Object.keys(estatesMap).map(name => {
    const groupProjects = estatesMap[name];
    const totalHouses = groupProjects.reduce((acc, p) => acc + (p.houseCount || 80), 0);
    const avgProgress = Math.round(groupProjects.reduce((acc, p) => acc + p.progress, 0) / groupProjects.length);
    const totalBudget = groupProjects.reduce((acc, p) => acc + p.budget, 0);
    const totalSpent = groupProjects.reduce((acc, p) => acc + p.spent, 0);
    
    // Determine overall status
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
      projects: groupProjects,
      totalHouses,
      avgProgress,
      totalBudget,
      totalSpent,
      status
    };
  });

  // Filter states
  const states = ['All', ...Array.from(new Set(projects.map(p => p.state)))];

  const filteredEstates = selectedState === 'All' 
    ? estateGroups 
    : estateGroups.filter(e => e.state === selectedState);

  // Helper for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">Completed</span>;
      case 'Delayed':
        return <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">Delayed</span>;
      case 'Needs Attention':
        return <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">Needs Attention</span>;
      default:
        return <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">On Schedule</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="text-amber-600 dark:text-amber-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Estate Schemes & Typologies</div>
          <h2 className="text-2xl font-serif text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            National Housing Estate Directory
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Comprehensive register of all FHA estates grouped by state, housing typology, and developer models.
          </p>
        </div>

        {/* State Quick Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {states.map(state => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                selectedState === state
                  ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/15'
                  : 'bg-slate-100 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* Estates List - Adaptive High-Contrast Cards with Razor-Sharp Borders */}
      <div className="space-y-4">
        {filteredEstates.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-black/20">
            <Building className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No estates found in {selectedState}</p>
          </div>
        ) : (
          filteredEstates.map(estate => {
            const isExpanded = expandedEstate === estate.name;
            return (
              <div 
                key={estate.name}
                className={`border rounded-2xl transition bg-white dark:bg-[#090e1a] text-slate-900 dark:text-white overflow-hidden shadow-sm ${
                  isExpanded ? 'border-amber-500 shadow-md ring-1 ring-amber-500/20' : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                {/* Header card summary click trigger */}
                <div 
                  onClick={() => setExpandedEstate(isExpanded ? null : estate.name)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                          {estate.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-medium">
                          <MapPin className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                          <span>{estate.state} State</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1">
                          <Home className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <strong className="text-slate-900 dark:text-white font-bold">{estate.totalHouses}</strong> Houses Planned
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 hidden sm:inline" />
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          <strong className="text-slate-900 dark:text-white font-bold">{estate.projects.length}</strong> Typology Schemes
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 hidden sm:inline" />
                        <span className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          Avg Progress: <strong className="text-slate-900 dark:text-white font-bold">{estate.avgProgress}%</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financials & Action status */}
                  <div className="flex items-center gap-6 justify-between md:justify-end">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">Financial outlay</div>
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">₦{(estate.totalBudget / 1e6).toFixed(1)}M Budget</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">₦{(estate.totalSpent / 1e6).toFixed(1)}M Spent</div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(estate.status)}
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-900 dark:text-white" /> : <ChevronRight className="w-4 h-4 text-slate-900 dark:text-white" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded typologies breakdown */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060a12] p-5 space-y-4">
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                      Housing Typology Allocation Groups
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {estate.projects.map(p => {
                        const contractor = contractors.find(c => c.id === p.contractorId);
                        return (
                          <div 
                            key={p.id}
                            className="bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700/80 rounded-xl p-4 hover:border-amber-500/50 transition group flex flex-col justify-between shadow-xs"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition font-serif">
                                    {p.houseType}
                                  </h4>
                                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-widest mt-0.5">
                                    {p.houseCount || 80} Units Subdivision
                                  </p>
                                  {p.typologies && p.typologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {p.typologies.map((t, idx) => (
                                        <span 
                                          key={idx} 
                                          className="bg-emerald-50 dark:bg-[#1D7033]/30 border border-emerald-300 dark:border-[#1D7033]/50 text-emerald-800 dark:text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
                                        >
                                          {t.count}x {t.type.split(' (')[0]}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                                    p.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300' :
                                    p.status === 'Delayed' ? 'bg-rose-100 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300' :
                                    'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300'
                                  }`}>
                                    {p.status}
                                  </span>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="space-y-1 mt-3">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-600 dark:text-slate-300">Construction Work Progress</span>
                                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{p.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700/50">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      p.status === 'Completed' ? 'bg-emerald-500' :
                                      p.status === 'Delayed' ? 'bg-rose-500' :
                                      'bg-amber-500'
                                    }`} 
                                    style={{ width: `${p.progress}%` }} 
                                    />
                                </div>
                              </div>

                              {/* Contractor Details */}
                              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span>Contr: <strong className="text-slate-900 dark:text-white">{p.contractorName}</strong></span>
                                </span>
                                {contractor && (
                                  <span className="text-[10px] bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                                    Rating: {contractor.rating || 'N/A'}★
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* View complete project workspace button */}
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                              <button
                                onClick={() => onSelectProject(p.id)}
                                className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
                              >
                                Enter Project Workspace
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
