import React, { useState } from 'react';
import { Project } from '../types';
import { MapPin, Info, Sparkles } from 'lucide-react';

interface NigeriaMapProps {
  projects: Project[];
  selectedState: string | null;
  onSelectState: (state: string | null) => void;
  getStateColor: (state: string) => string;
}

interface StateNode {
  id: string;
  name: string;
  code: string;
  zone: string;
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
  align: 'middle' | 'start' | 'end';
}

// Geographically calibrated coordinates for Nigerian States with housing delivery assets
const HOUSING_STATES: StateNode[] = [
  { id: 'kano', name: 'Kano', code: 'KN', zone: 'North-West', cx: 275, cy: 105, labelX: 275, labelY: 88, align: 'middle' },
  { id: 'kaduna', name: 'Kaduna', code: 'KD', zone: 'North-West', cx: 240, cy: 165, labelX: 240, labelY: 148, align: 'middle' },
  { id: 'abuja', name: 'Abuja', code: 'FCT', zone: 'North-Central', cx: 232, cy: 225, labelX: 275, labelY: 228, align: 'start' },
  { id: 'lagos', name: 'Lagos', code: 'LA', zone: 'South-West', cx: 85, cy: 320, labelX: 85, labelY: 340, align: 'middle' },
  { id: 'rivers', name: 'Rivers', code: 'RV', zone: 'South-South', cx: 250, cy: 355, labelX: 250, labelY: 375, align: 'middle' },
  // Secondary strategic hub nodes
  { id: 'enugu', name: 'Enugu', code: 'EN', zone: 'South-East', cx: 275, cy: 285, labelX: 305, labelY: 288, align: 'start' },
  { id: 'edo', name: 'Edo', code: 'ED', zone: 'South-South', cx: 185, cy: 285, labelX: 185, labelY: 270, align: 'middle' },
  { id: 'borno', name: 'Borno', code: 'BO', zone: 'North-East', cx: 450, cy: 105, labelX: 450, labelY: 88, align: 'middle' },
];

export default function NigeriaMap({
  projects,
  selectedState,
  onSelectState,
  getStateColor
}: NigeriaMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Calculate statistics per state
  const getStateStats = (stateName: string) => {
    const stateProjs = projects.filter(p => p.state.toLowerCase() === stateName.toLowerCase());
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
      status
    };
  };

  const activeHoverNode = hoveredState 
    ? HOUSING_STATES.find(s => s.name.toLowerCase() === hoveredState.toLowerCase())
    : null;
  const activeHoverStats = activeHoverNode ? getStateStats(activeHoverNode.name) : null;

  return (
    <div className="relative w-full h-[360px] bg-[#050811] rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center select-none shadow-inner">
      
      {/* Background Cartographic Coordinate Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Lat/Long Coordinate Reticles */}
      <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-600 tracking-wider pointer-events-none">
        NIGERIA // 09°04&apos;N 07°29&apos;E // WGS84
      </div>
      <div className="absolute top-2 right-3 text-[9px] font-mono text-amber-500/70 tracking-wider pointer-events-none flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        FEDERAL CARTOGRAPHIC TELEMETRY
      </div>

      {/* Main SVG Geographical Nigeria Map */}
      <svg 
        viewBox="0 0 520 410" 
        className="w-full max-w-[490px] h-full z-10 transition-transform duration-300"
      >
        <defs>
          {/* Subtle regional zone gradients */}
          <linearGradient id="nigeriaLandmassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0c1527" />
            <stop offset="50%" stopColor="#0a101f" />
            <stop offset="100%" stopColor="#060c18" />
          </linearGradient>

          <linearGradient id="riverGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
          </linearGradient>

          <filter id="mapGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#005082" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* 1. ACTUAL GEOGRAPHICAL NIGERIA BOUNDARY PATH */}
        {/* Calibrated from true boundary control points (Atlantic coast, Cameroon, Chad, Niger, Benin) */}
        <path
          d="
            M 65,320 
            C 72,320 85,321 95,322
            C 115,325 130,328 145,332
            C 160,342 175,350 190,360
            C 205,372 215,380 225,380
            C 235,378 245,370 255,366
            C 270,364 285,368 298,368
            C 312,365 325,355 330,345
            C 335,332 342,315 345,295
            C 350,280 365,268 385,260
            C 405,250 420,230 435,210
            C 450,190 465,165 470,145
            C 475,125 480,105 488,85
            C 470,82 445,80 425,78
            C 395,76 365,80 340,82
            C 315,80 285,76 260,74
            C 230,72 205,74 180,75
            C 155,76 135,70 120,72
            C 105,78 98,95 94,115
            C 90,135 84,155 80,175
            C 78,195 82,215 80,235
            C 75,255 65,275 58,290
            C 54,302 58,315 65,320
            Z
          "
          fill="url(#nigeriaLandmassGrad)"
          stroke="#1e293b"
          strokeWidth="2.5"
          filter="url(#mapGlow)"
          className="transition-colors duration-300"
        />

        {/* 2. SUBTLE GEOPOLITICAL ZONE INTERNAL BOUNDARIES */}
        {/* North-West / North-East separator */}
        <path d="M 340,82 C 330,130 320,165 310,195" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        {/* Northern / Middle-Belt separator */}
        <path d="M 80,175 C 150,180 230,185 310,195 C 370,198 420,210 435,210" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        {/* Middle-Belt / Southern separator */}
        <path d="M 80,235 C 140,245 190,260 270,270 C 330,275 365,268 385,260" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        {/* South-West / South-South separator */}
        <path d="M 145,332 C 160,300 175,275 190,260" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        {/* South-East / South-South separator */}
        <path d="M 270,270 C 265,300 258,335 255,366" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

        {/* 3. FAMOUS RIVERS NIGER & BENUE (Y-SHAPED CONFLUENCE AT LOKOJA) */}
        {/* River Niger entering from Kebbi/Niger state through Jebba to Lokoja */}
        <path 
          d="M 80,175 C 95,190 120,205 145,220 C 170,232 195,242 215,255" 
          fill="none" 
          stroke="url(#riverGlow)" 
          strokeWidth="2.2" 
          strokeLinecap="round"
        />
        {/* River Benue entering from Adamawa/Taraba to Lokoja */}
        <path 
          d="M 460,180 C 420,195 370,215 320,230 C 275,242 245,248 215,255" 
          fill="none" 
          stroke="url(#riverGlow)" 
          strokeWidth="2.2" 
          strokeLinecap="round"
        />
        {/* Lower Niger to Atlantic Delta */}
        <path 
          d="M 215,255 C 218,280 220,310 222,335 C 223,350 225,365 225,380" 
          fill="none" 
          stroke="url(#riverGlow)" 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />
        {/* Delta tributaries */}
        <path d="M 220,320 C 200,335 180,348 160,355" fill="none" stroke="#0284c7" strokeWidth="1.2" opacity="0.7" />
        <path d="M 222,335 C 235,350 245,360 255,366" fill="none" stroke="#0284c7" strokeWidth="1.2" opacity="0.7" />

        {/* Lokoja Confluence Marker */}
        <circle cx="215" cy="255" r="2.5" fill="#38bdf8" opacity="0.8" />
        <text x="215" y="247" textAnchor="middle" className="fill-sky-400/70 text-[7px] font-mono pointer-events-none uppercase">
          Lokoja Confluence
        </text>

        {/* 4. GEOPOLITICAL ZONE LABELS (Subtle Watermarks) */}
        <text x="220" y="115" textAnchor="middle" className="fill-slate-700/50 font-bold text-[9px] uppercase tracking-widest pointer-events-none font-mono">North-West</text>
        <text x="400" y="130" textAnchor="middle" className="fill-slate-700/50 font-bold text-[9px] uppercase tracking-widest pointer-events-none font-mono">North-East</text>
        <text x="240" y="200" textAnchor="middle" className="fill-slate-700/50 font-bold text-[9px] uppercase tracking-widest pointer-events-none font-mono">North-Central</text>
        <text x="115" y="275" textAnchor="middle" className="fill-slate-700/50 font-bold text-[8px] uppercase tracking-widest pointer-events-none font-mono">South-West</text>
        <text x="305" y="295" textAnchor="middle" className="fill-slate-700/50 font-bold text-[8px] uppercase tracking-widest pointer-events-none font-mono">South-East</text>
        <text x="205" y="325" textAnchor="middle" className="fill-slate-700/50 font-bold text-[8px] uppercase tracking-widest pointer-events-none font-mono">South-South</text>

        {/* 5. INTERACTIVE HOUSING STATE HUBS */}
        {HOUSING_STATES.map((node) => {
          const stats = getStateStats(node.name);
          const isSelected = selectedState?.toLowerCase() === node.name.toLowerCase();
          const isHovered = hoveredState?.toLowerCase() === node.name.toLowerCase();
          const hasProjects = stats.count > 0;

          // Determine status fill color
          let statusCircleColor = 'fill-slate-700 stroke-slate-500';
          let pulseColor = 'stroke-slate-500/20';

          if (hasProjects) {
            if (stats.status === 'Delayed') {
              statusCircleColor = 'fill-rose-500 stroke-rose-300';
              pulseColor = 'stroke-rose-500/40';
            } else if (stats.status === 'Needs Attention') {
              statusCircleColor = 'fill-amber-500 stroke-amber-300';
              pulseColor = 'stroke-amber-500/40';
            } else if (stats.status === 'Completed') {
              statusCircleColor = 'fill-sky-500 stroke-sky-300';
              pulseColor = 'stroke-sky-500/40';
            } else {
              statusCircleColor = 'fill-emerald-500 stroke-emerald-300';
              pulseColor = 'stroke-emerald-500/40';
            }
          }

          return (
            <g 
              key={node.id}
              className="cursor-pointer group"
              onClick={() => onSelectState(isSelected ? null : node.name)}
              onMouseEnter={() => setHoveredState(node.name)}
              onMouseLeave={() => setHoveredState(null)}
            >
              {/* State Selection Halo */}
              {isSelected && (
                <circle 
                  cx={node.cx} 
                  cy={node.cy} 
                  r="26" 
                  className="fill-amber-500/15 stroke-amber-400 stroke-2 animate-pulse" 
                />
              )}

              {/* Pulse Wave for Active Sites */}
              {hasProjects && (
                <circle 
                  cx={node.cx} 
                  cy={node.cy} 
                  r={isSelected ? 24 : 18} 
                  className={`fill-none stroke-2 ${pulseColor} animate-ping`} 
                  style={{ animationDuration: '3s' }}
                />
              )}

              {/* Interactive Target Circle */}
              <circle 
                cx={node.cx} 
                cy={node.cy} 
                r={node.id === 'abuja' ? 14 : 12} 
                className={`${statusCircleColor} stroke-2 transition-all duration-300 drop-shadow-md group-hover:scale-125 group-hover:brightness-125`}
                style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
              />

              {/* Center Core Dot */}
              <circle 
                cx={node.cx} 
                cy={node.cy} 
                r={node.id === 'abuja' ? 4.5 : 3.5} 
                className="fill-white pointer-events-none" 
              />

              {/* State Label */}
              <text 
                x={node.labelX} 
                y={node.labelY} 
                textAnchor={node.align} 
                className={`font-bold text-[10px] uppercase tracking-wider pointer-events-none transition-colors duration-200 ${
                  isSelected 
                    ? 'fill-amber-400 font-extrabold text-[11px]' 
                    : isHovered 
                    ? 'fill-white' 
                    : hasProjects 
                    ? 'fill-slate-200' 
                    : 'fill-slate-500'
                }`}
              >
                {node.name} {node.id === 'abuja' && '(FCT)'}
              </text>

              {/* Projects Badge Count */}
              {hasProjects && (
                <text
                  x={node.cx}
                  y={node.cy + 3}
                  textAnchor="middle"
                  className="fill-black font-extrabold text-[8px] pointer-events-none font-mono"
                >
                  {stats.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Telemetry Card */}
      {activeHoverNode && activeHoverStats && (
        <div className="absolute top-4 left-4 bg-[#0a0f1d]/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-2xl z-30 pointer-events-none text-xs space-y-1.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-1.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <strong className="text-white text-sm font-serif">{activeHoverNode.name} {activeHoverNode.id === 'abuja' ? '(FCT)' : 'State'}</strong>
            </div>
            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
              {activeHoverNode.zone}
            </span>
          </div>

          {activeHoverStats.count > 0 ? (
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>Active Schemes:</span>
                <strong className="text-white font-bold">{activeHoverStats.count} Estates</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Houses:</span>
                <strong className="text-white font-bold">{activeHoverStats.houses} Units</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Avg Delivery Pace:</span>
                <strong className="text-amber-400 font-bold">{activeHoverStats.progress}%</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Delivery Status:</span>
                <span className={`font-bold px-1.5 py-0.2 rounded text-[9px] uppercase ${
                  activeHoverStats.status === 'Completed' ? 'bg-sky-500/20 text-sky-300' :
                  activeHoverStats.status === 'Delayed' ? 'bg-rose-500/20 text-rose-300' :
                  activeHoverStats.status === 'Needs Attention' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {activeHoverStats.status}
                </span>
              </div>
              <div className="pt-1 border-t border-slate-800 text-[9px] text-slate-400 italic">
                Click state node to filter delivery schemes below
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 pt-1">
              No active FHA schemes currently allocated in this state node.
            </div>
          )}
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-[#080d1a]/95 border border-slate-800/80 p-2.5 rounded-lg text-xs space-y-1 z-20 shadow-xl backdrop-blur-sm pointer-events-auto">
        <div className="font-semibold text-[9px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Info className="w-3 h-3 text-amber-400" />
          <span>National Delivery Status</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500" /> <span className="text-slate-300 text-[10px]">Completed</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> <span className="text-slate-300 text-[10px]">On Schedule</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> <span className="text-slate-300 text-[10px]">Needs Attention</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /> <span className="text-slate-300 text-[10px]">Delayed / Behind</span></div>
        </div>
      </div>

      {/* Rivers & Confluence Tag Overlay */}
      <div className="absolute bottom-3 right-3 bg-[#080d1a]/90 border border-slate-800/80 px-2.5 py-1.5 rounded-lg text-[9px] text-slate-400 space-y-0.5 pointer-events-none hidden sm:block">
        <div className="flex items-center gap-1.5 text-sky-400 font-mono">
          <span className="w-2 h-0.5 bg-sky-400 inline-block"></span>
          <span>River Niger & River Benue</span>
        </div>
        <div className="text-[8px] text-slate-500">6 Geopolitical Zones Demarcation</div>
      </div>
    </div>
  );
}
