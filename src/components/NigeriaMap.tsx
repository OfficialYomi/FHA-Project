import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { MapPin, Search, Compass, Layers, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { 
  ALL_NIGERIAN_STATES, 
  ALL_STATES_COMBINED_PATH, 
  NIGERIA_VIEWBOX,
  NigerianStateData 
} from '../data/nigeriaMapData';

interface NigeriaMapProps {
  projects: Project[];
  selectedState: string | null;
  onSelectState: (state: string | null) => void;
  getStateColor?: (state: string) => string;
}

export default function NigeriaMap({
  projects,
  selectedState,
  onSelectState,
}: NigeriaMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('All');

  // Compute stats for any given state
  const getStateStats = (stateName: string, stateAliases?: string[]) => {
    const checkNames = [
      stateName.toLowerCase(), 
      ...(stateAliases || []).map(a => a.toLowerCase())
    ];

    const stateProjs = projects.filter(p => {
      const pState = (p.state || '').toLowerCase().trim();
      return checkNames.includes(pState) || 
        (stateName === 'FCT' && (pState === 'abuja' || pState === 'fct')) ||
        (stateName === 'Abuja' && (pState === 'abuja' || pState === 'fct'));
    });

    const totalHouses = stateProjs.reduce((sum, p) => sum + (p.houseCount || 0), 0);
    const avgProgress = stateProjs.length > 0 
      ? Math.round(stateProjs.reduce((sum, p) => sum + p.progress, 0) / stateProjs.length) 
      : 0;
    const totalBudget = stateProjs.reduce((sum, p) => sum + p.budget, 0);
    
    let status: 'On Schedule' | 'Needs Attention' | 'Delayed' | 'Completed' | 'Inactive' = 'Inactive';
    if (stateProjs.length > 0) {
      if (stateProjs.some(p => p.status === 'Delayed')) status = 'Delayed';
      else if (stateProjs.some(p => p.status === 'Needs Attention')) status = 'Needs Attention';
      else if (stateProjs.every(p => p.status === 'Completed')) status = 'Completed';
      else status = 'On Schedule';
    }

    return {
      count: stateProjs.length,
      houses: totalHouses,
      progress: avgProgress,
      budget: totalBudget,
      status,
      projects: stateProjs
    };
  };

  // Currently hovered node and stats
  const activeHoverNode = useMemo(() => {
    if (!hoveredState) return null;
    return ALL_NIGERIAN_STATES.find(
      s => s.name.toLowerCase() === hoveredState.toLowerCase() || 
           s.id === hoveredState.toLowerCase() ||
           (hoveredState.toLowerCase() === 'abuja' && s.id === 'fct')
    ) || null;
  }, [hoveredState]);

  const activeHoverStats = useMemo(() => {
    if (!activeHoverNode) return null;
    return getStateStats(activeHoverNode.name, activeHoverNode.alias);
  }, [activeHoverNode, projects]);

  // Active states with projects
  const activeStatesWithProjects = useMemo(() => {
    return ALL_NIGERIAN_STATES.filter(s => getStateStats(s.name, s.alias).count > 0);
  }, [projects]);

  // Filtered states list for quick selector
  const filteredStatesList = useMemo(() => {
    return ALL_NIGERIAN_STATES.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (s.alias && s.alias.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesZone = selectedZone === 'All' || s.zone === selectedZone;
      return matchesSearch && matchesZone;
    });
  }, [searchQuery, selectedZone]);

  const zones = ['All', 'North-West', 'North-East', 'North-Central', 'South-West', 'South-East', 'South-South'];

  return (
    <div className="relative w-full bg-slate-50 dark:bg-[#070b14] rounded-2xl border-2 border-emerald-900/30 dark:border-emerald-500/40 overflow-hidden flex flex-col items-center justify-center select-none shadow-md transition-all">
      
      {/* Top Header Bar inside Map */}
      <div className="w-full flex flex-wrap items-center justify-between px-3 sm:px-4 py-2.5 bg-white dark:bg-black/50 border-b border-slate-300 dark:border-white/10 z-20 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
            Federal Republic of Nigeria — 36 States + FCT
          </span>
          <span className="hidden sm:inline text-[10px] text-slate-600 dark:text-slate-400 font-mono">
            (Official Survey Grid)
          </span>
        </div>

        {/* State Quick Search & Zone Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find state..."
              className="w-28 sm:w-36 text-[11px] bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-md px-2 py-1 pl-6 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-3 h-3 text-slate-400 absolute left-1.5 top-2 pointer-events-none" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          <span className="text-[10px] text-emerald-800 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded font-mono font-bold whitespace-nowrap">
            {activeStatesWithProjects.length} Active States
          </span>

          {selectedState && (
            <button
              onClick={() => onSelectState(null)}
              className="text-[10px] bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50 px-2 py-1 rounded font-bold cursor-pointer transition flex items-center gap-1"
            >
              Clear Filter ({selectedState})
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Geopolitical Zone Quick Tabs */}
      <div className="w-full flex items-center gap-1 px-3 py-1.5 bg-slate-100/70 dark:bg-black/30 border-b border-slate-200 dark:border-white/5 overflow-x-auto text-[10px] scrollbar-none z-10">
        <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Layers className="w-3 h-3 text-emerald-600" /> Zones:
        </span>
        {zones.map(z => (
          <button
            key={z}
            onClick={() => setSelectedZone(z)}
            className={`px-2 py-0.5 rounded-full transition whitespace-nowrap font-medium cursor-pointer ${
              selectedZone === z 
                ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            {z}
          </button>
        ))}
      </div>

      {/* Map Display Frame with Official Cartographic Border */}
      <div className="relative w-full h-[430px] sm:h-[490px] md:h-[530px] flex items-center justify-center overflow-hidden p-2 sm:p-4">
        {/* Subtle grid lines background (Graticule) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Cartographic Coordinate Border Line around the map canvas */}
        <div className="absolute inset-2 sm:inset-3 border border-slate-300 dark:border-white/15 rounded-xl pointer-events-none z-10">
          {/* Inner hairline neatline */}
          <div className="absolute inset-1 border border-slate-300/70 dark:border-white/10 rounded-lg pointer-events-none" />
          
          {/* Coordinate Marks */}
          <span className="absolute top-1 left-2 text-[9px] font-mono font-semibold text-slate-600 dark:text-slate-400 select-none">14°N / 3°E</span>
          <span className="absolute top-1 right-2 text-[9px] font-mono font-semibold text-slate-600 dark:text-slate-400 select-none">14°N / 15°E</span>
          <span className="absolute bottom-1 left-2 text-[9px] font-mono font-semibold text-slate-600 dark:text-slate-400 select-none">4°N / 3°E (Gulf of Guinea)</span>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-semibold text-slate-600 dark:text-slate-400 select-none">4°N / 15°E</span>
        </div>

        {/* Compass Rose (North Arrow) in Top Right */}
        <div className="absolute top-5 right-5 sm:top-6 sm:right-6 flex flex-col items-center pointer-events-none z-20 opacity-80 dark:opacity-90">
          <div className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/80 border border-slate-300 dark:border-white/20 shadow-md flex items-center justify-center">
            <Compass className="w-5 h-5 text-emerald-700 dark:text-emerald-400 animate-[spin_60s_linear_infinite]" />
          </div>
          <span className="text-[9px] font-mono font-black text-slate-700 dark:text-slate-300 mt-0.5 tracking-widest">N</span>
        </div>

        {/* Map Scale Indicator in Bottom Left */}
        <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 hidden sm:flex flex-col gap-0.5 bg-white/90 dark:bg-black/80 px-2 py-1 rounded border border-slate-300 dark:border-white/20 shadow-xs pointer-events-none z-20">
          <div className="flex justify-between text-[8px] font-mono text-slate-700 dark:text-slate-300">
            <span>0</span>
            <span>150</span>
            <span>300 km</span>
          </div>
          <div className="w-24 h-1.5 flex border border-slate-600 dark:border-white/40">
            <div className="w-1/2 h-full bg-slate-800 dark:bg-white" />
            <div className="w-1/2 h-full bg-white dark:bg-slate-700" />
          </div>
          <span className="text-[7.5px] font-mono text-slate-600 dark:text-slate-400 text-center">Scale 1 : 4,000,000</span>
        </div>

        {/* SVG Map of Nigeria (36 States + FCT) with Distinct National Border and Internal State Borders */}
        <svg 
          viewBox={NIGERIA_VIEWBOX}
          className="w-full h-full max-w-[850px] z-10 transition-transform duration-300"
          style={{ maxHeight: '100%' }}
        >
          <defs>
            {/* Delivery Status Gradients */}
            <linearGradient id="onScheduleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#258f41" />
              <stop offset="100%" stopColor="#1D7033" />
            </linearGradient>
            <linearGradient id="needsAttentionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="delayedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="completedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Inactive Neutral Landmass Gradients (Matching Official Atlas Topography) */}
            <linearGradient id="inactiveStateGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="inactiveStateGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#151e2d" />
            </linearGradient>

            {/* Dimmed State Gradient for zone or search filters */}
            <linearGradient id="dimmedStateGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="dimmedStateGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#0b1120" />
            </linearGradient>

            {/* National Border Glow and Drop Shadow */}
            <filter id="nationalBorderShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#042f1a" floodOpacity="0.35" />
            </filter>

            <filter id="stateSelectedGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* ========================================================================= */}
          {/* LAYER 1: NATIONAL BORDER UNDERLAY LINE (THE CONTINUOUS EXTERIOR BORDER)   */}
          {/* ========================================================================= */}
          {/* Outer perimeter glow/shadow */}
          <path
            d={ALL_STATES_COMBINED_PATH}
            fill="none"
            stroke="#042f1a"
            strokeWidth="8"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#nationalBorderShadow)"
            className="opacity-40 dark:opacity-80 dark:stroke-emerald-950"
          />

          {/* Official National Boundary Primary Line (Distinct Line Around the Border of Nigeria) */}
          <path
            d={ALL_STATES_COMBINED_PATH}
            fill="none"
            stroke="#064e3b"
            strokeWidth="5.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="dark:stroke-emerald-400 dark:opacity-90"
          />

          {/* Fine Outer Boundary Line (Accents the exterior perimeter) */}
          <path
            d={ALL_STATES_COMBINED_PATH}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="dark:stroke-white"
          />

          {/* ========================================================================= */}
          {/* LAYER 2: ALL 36 STATES + FCT (INDIVIDUAL POLYGONS & INTERNAL BORDERS)     */}
          {/* ========================================================================= */}
          {ALL_NIGERIAN_STATES.map((state) => {
            const stats = getStateStats(state.name, state.alias);
            const isSelected = selectedState?.toLowerCase() === state.name.toLowerCase() ||
              (selectedState?.toLowerCase() === 'abuja' && state.id === 'fct') ||
              (selectedState?.toLowerCase() === 'fct' && state.id === 'fct');
            const isHovered = hoveredState?.toLowerCase() === state.name.toLowerCase() || 
                              hoveredState === state.id ||
                              (hoveredState?.toLowerCase() === 'abuja' && state.id === 'fct');
            const hasProjects = stats.count > 0;

            // Check if matches active zone or search filter
            const matchesSearch = !searchQuery || 
              state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (state.alias && state.alias.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())));
            const matchesZone = selectedZone === 'All' || state.zone === selectedZone;
            const isDimmed = !matchesSearch || !matchesZone;

            // Determine Fill Style
            let fillClass = isDimmed
              ? 'fill-[url(#dimmedStateGradLight)] dark:fill-[url(#dimmedStateGradDark)] opacity-40'
              : 'fill-[url(#inactiveStateGradLight)] dark:fill-[url(#inactiveStateGradDark)]';
            
            // State Internal Border Styling (All borders showing cleanly)
            let strokeColor = isDimmed ? '#94a3b8' : '#475569';
            let strokeWidth = '1.2';
            let strokeOpacity = isDimmed ? '0.3' : '0.9';

            if (hasProjects) {
              if (stats.status === 'Delayed') {
                fillClass = 'fill-[url(#delayedGrad)]';
                strokeColor = '#9f1239';
                strokeWidth = '1.8';
                strokeOpacity = '1';
              } else if (stats.status === 'Needs Attention') {
                fillClass = 'fill-[url(#needsAttentionGrad)]';
                strokeColor = '#b45309';
                strokeWidth = '1.8';
                strokeOpacity = '1';
              } else if (stats.status === 'Completed') {
                fillClass = 'fill-[url(#completedGrad)]';
                strokeColor = '#0369a1';
                strokeWidth = '1.8';
                strokeOpacity = '1';
              } else {
                // On Schedule -> FHA Emerald Green
                fillClass = 'fill-[url(#onScheduleGrad)]';
                strokeColor = '#064e3b';
                strokeWidth = '1.8';
                strokeOpacity = '1';
              }
            }

            if (isSelected) {
              strokeColor = '#ffffff';
              strokeWidth = '3';
              strokeOpacity = '1';
            } else if (isHovered) {
              strokeColor = hasProjects ? '#ffffff' : '#0f172a';
              strokeWidth = '2.2';
              strokeOpacity = '1';
            }

            return (
              <g
                key={state.id}
                id={`state-${state.id}`}
                className="cursor-pointer group transition-all duration-200"
                onClick={() => onSelectState(isSelected ? null : state.name)}
                onMouseEnter={() => setHoveredState(state.name)}
                onMouseLeave={() => setHoveredState(null)}
              >
                {/* State Boundary Polygon */}
                <path
                  d={state.path}
                  className={`${fillClass} transition-all duration-200 group-hover:brightness-110`}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  strokeLinejoin="round"
                  filter={isSelected ? 'url(#stateSelectedGlow)' : undefined}
                />

                {/* Active Projects Indicator Rings & Halo Badges */}
                {hasProjects && (
                  <g>
                    {/* Pulsing Target Halo */}
                    <circle
                      cx={state.x}
                      cy={state.y}
                      r={isSelected ? 18 : 13}
                      className={`fill-none stroke-2 ${
                        stats.status === 'Delayed' ? 'stroke-rose-400/80 animate-ping' :
                        stats.status === 'Needs Attention' ? 'stroke-amber-400/80 animate-ping' :
                        'stroke-emerald-300/80 animate-ping'
                      }`}
                      style={{ animationDuration: '3s' }}
                    />

                    {/* Outer Badge Ring */}
                    <circle
                      cx={state.x}
                      cy={state.y}
                      r={state.id === 'fct' ? 10 : 9}
                      className="fill-white dark:fill-black stroke-slate-900 dark:stroke-white stroke-1.5 drop-shadow-md"
                    />

                    {/* Inner Metric Number (Number of schemes) */}
                    <text
                      x={state.x}
                      y={state.y + 3}
                      textAnchor="middle"
                      className="fill-slate-900 dark:fill-white font-black text-[9px] font-mono pointer-events-none"
                    >
                      {stats.count}
                    </text>
                  </g>
                )}

                {/* State Name / Abbreviation Label */}
                <text
                  x={state.x}
                  y={hasProjects ? state.y - 12 : state.y + 3}
                  textAnchor="middle"
                  className={`pointer-events-none tracking-tight font-sans transition-all duration-200 select-none ${
                    hasProjects
                      ? 'fill-white font-black text-[11px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]'
                      : isHovered
                      ? 'fill-slate-950 dark:fill-white font-extrabold text-[10px] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]'
                      : isDimmed
                      ? 'fill-slate-400 dark:fill-slate-600 font-medium text-[8px]'
                      : 'fill-[#1e293b] dark:fill-[#e2e8f0] font-semibold text-[8.5px]'
                  }`}
                >
                  {state.name}
                </text>
              </g>
            );
          })}

          {/* Anambra Leader Line Callout (standard in official maps due to compact size) */}
          <line
            x1="268"
            y1="478"
            x2="310"
            y2="465"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="2 2"
            className="pointer-events-none opacity-60 dark:opacity-80"
          />

          {/* Lagos Coastline Indicator */}
          <line
            x1="54"
            y1="465"
            x2="54"
            y2="480"
            stroke="#0284c7"
            strokeWidth="1"
            strokeDasharray="2 1"
            className="pointer-events-none opacity-60"
          />
          <text
            x="54"
            y="492"
            textAnchor="middle"
            className="fill-sky-800 dark:fill-sky-400 text-[8px] font-sans font-bold pointer-events-none"
          >
            Bight of Benin
          </text>
        </svg>

        {/* Floating Telemetry Tooltip when hovering over any state */}
        {activeHoverNode && activeHoverStats && (
          <div className="absolute top-4 left-4 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-md border border-slate-300 dark:border-white/15 p-3 rounded-xl shadow-2xl z-30 pointer-events-none text-xs space-y-2 min-w-[210px] max-w-[270px] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <strong className="text-slate-900 dark:text-white text-xs font-serif">
                  {activeHoverNode.name} {activeHoverNode.id === 'fct' ? '(Federal Capital Territory)' : 'State'}
                </strong>
              </div>
              <span className="text-[8.5px] bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
                {activeHoverNode.zone}
              </span>
            </div>

            {activeHoverStats.count > 0 ? (
              <div className="space-y-1 text-[10.5px]">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Active FHA Schemes:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{activeHoverStats.count} Estates</strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Total Housing Units:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{activeHoverStats.houses} Units</strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Physical Completion:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{activeHoverStats.progress}%</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Delivery Status:</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[8.5px] uppercase ${
                    activeHoverStats.status === 'Completed' ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30' :
                    activeHoverStats.status === 'Delayed' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30' :
                    activeHoverStats.status === 'Needs Attention' ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {activeHoverStats.status}
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-200 dark:border-white/10 text-[9.5px] text-emerald-700 dark:text-emerald-400 font-medium">
                  👉 Click to filter schemes below
                </div>
              </div>
            ) : (
              <div className="text-[9.5px] text-slate-500 dark:text-slate-400 py-0.5 leading-relaxed">
                No active FHA schemes currently allocated in this state node. All administrative borders active.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend & National Delivery Telemetry Bar */}
      <div className="w-full bg-slate-100/90 dark:bg-black/50 border-t border-slate-200 dark:border-white/10 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Color Indicators */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-xs bg-[#1D7033] border border-emerald-700 shadow-xs" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300">On Schedule</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-xs bg-[#d97706] border border-amber-600 shadow-xs" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300">Needs Attention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-xs bg-[#e11d48] border border-rose-600 shadow-xs" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300">Delayed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-xs bg-[#0284c7] border border-sky-600 shadow-xs" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-xs bg-[#cbd5e1] dark:bg-[#1e293b] border border-[#475569] shadow-xs" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">All 36 States + FCT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-1 rounded-full bg-[#064e3b] dark:bg-emerald-400 border border-slate-900 dark:border-white shadow-xs" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">National Border</span>
          </div>
        </div>

        {/* Quick Instructions */}
        <div className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          Click any state to filter estate cards &bull; Official National Boundary
        </div>
      </div>
    </div>
  );
}
