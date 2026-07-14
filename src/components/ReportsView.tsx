import React, { useState } from 'react';
import { Project, RiskAlert, Contractor } from '../types';
import { 
  FileText, 
  Tv, 
  Printer, 
  ArrowLeft, 
  ArrowRight, 
  TrendingUp, 
  Building, 
  AlertTriangle, 
  Sparkles,
  Calendar,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

interface ReportsViewProps {
  projects: Project[];
  alerts: RiskAlert[];
  contractors: Contractor[];
}

export default function ReportsView({
  projects,
  alerts,
  contractors
}: ReportsViewProps) {
  const [reportFormat, setReportFormat] = useState<'pdf' | 'ppt'>('pdf');
  const [activeSlide, setActiveSlide] = useState(0);

  // Stats compile
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'Completed');
  const delayedProjects = projects.filter(p => p.status === 'Delayed');
  const attentionProjects = projects.filter(p => p.status === 'Needs Attention');
  const onScheduleProjects = projects.filter(p => p.status === 'On Schedule');

  const totalHouses = projects.reduce((acc, p) => acc + p.houseCount, 0);
  const completedHouses = completedProjects.reduce((acc, p) => acc + p.houseCount, 0);
  const inProgressHouses = projects.filter(p => p.status !== 'Completed').reduce((acc, p) => acc + p.houseCount, 0);

  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = projects.reduce((acc, p) => acc + p.spent, 0);
  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const activeRisks = alerts.filter(a => !a.resolved);

  const formatNaira = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
    }
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  };

  const handlePrint = () => {
    window.print();
  };

  // Custom Slides definitions
  const slides = [
    {
      title: "FHA Housing Delivery Programme",
      subtitle: "Weekly Program Delivery Briefing",
      type: "title"
    },
    {
      title: "Nationwide Status Briefing",
      subtitle: "Summary of Housing Outputs & Status Counts",
      type: "stats"
    },
    {
      title: "Commercial & Budget Disbursal",
      subtitle: "Consolidated Financial Budget vs spent",
      type: "financials"
    },
    {
      title: "Exception Report & Risk Matrix",
      subtitle: "Active Projects Under Management Review",
      type: "risks"
    }
  ];

  return (
    <div className="space-y-6 print:p-0">
      {/* Tab select bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4 print:hidden">
        <div>
          <h2 className="text-2xl font-medium text-white tracking-tight font-serif" style={{ fontFamily: 'Georgia, serif' }}>
            Weekly Progress Briefing Desk <span className="text-amber-500">/</span> Cockpit
          </h2>
          <p className="text-slate-400 text-sm">Review weekly FHA briefing packages automatically generated for the MD/CEO</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setReportFormat('pdf')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
              reportFormat === 'pdf' 
                ? 'bg-amber-500 text-black' 
                : 'bg-black/50 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Executive PDF Brief</span>
          </button>
          
          <button 
            onClick={() => setReportFormat('ppt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
              reportFormat === 'ppt' 
                ? 'bg-amber-500 text-black' 
                : 'bg-black/50 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>PPT Slide Deck</span>
          </button>
        </div>
      </div>

      {/* PDF HIGH FIDELITY REPORT PREVIEW */}
      {reportFormat === 'pdf' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white/5 border border-white/10 px-5 py-3 rounded-xl print:hidden">
            <span className="text-xs text-slate-400 font-medium">This is a pixel-perfect print simulation of the weekly executive PDF summary.</span>
            <button 
              onClick={handlePrint}
              className="bg-black/50 hover:bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4 text-amber-500" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          {/* Letter styled layout */}
          <div className="bg-[#050505] border border-white/10 text-slate-200 p-8 rounded-2xl max-w-4xl mx-auto shadow-2xl space-y-6 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
            
            {/* Report Header */}
            <div className="flex justify-between items-start border-b border-white/10 print:border-slate-300 pb-5">
              <div className="space-y-1.5">
                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest bg-amber-500/10 print:bg-amber-100 print:text-amber-800 px-2.5 py-0.5 rounded border border-amber-500/20 w-max">
                  FHA STRICTLY CONFIDENTIAL
                </div>
                <h1 className="text-xl font-medium text-white print:text-slate-900 font-serif" style={{ fontFamily: 'Georgia, serif' }}>FEDERAL HOUSING AUTHORITY OF NIGERIA</h1>
                <p className="text-xs text-slate-400 print:text-slate-600 font-medium">Office of the Managing Director / Chief Executive Officer</p>
              </div>

              <div className="text-right text-xs">
                <div className="font-bold text-white print:text-slate-900 uppercase tracking-wide">Weekly Delivery Summary</div>
                <div className="text-slate-400 print:text-slate-500 mt-1">Date: {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="text-[10px] text-amber-500 font-semibold mt-0.5">Report Reference: FHA-REP-W34</div>
              </div>
            </div>

            {/* Executive Memorandum Header */}
            <div className="grid grid-cols-2 gap-4 bg-black/40 print:bg-slate-100 p-4 rounded-xl border border-white/5 print:border-slate-200 text-xs text-slate-300 print:text-slate-800">
              <div className="space-y-1">
                <div>TO: <strong className="text-white print:text-slate-900">Managing Director & CEO, FHA</strong></div>
                <div>FROM: <strong className="text-white print:text-slate-900">Directorate of Housing Delivery & PM</strong></div>
              </div>
              <div className="space-y-1">
                <div>SUBJECT: <strong className="text-white print:text-slate-900">Weekly Housing Delivery Briefing</strong></div>
                <div>CLASSIFICATION: <strong className="text-amber-500 print:text-rose-700 font-bold uppercase tracking-wider">Priority Exec Action Needed</strong></div>
              </div>
            </div>

            {/* memorandum Body */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-300 print:text-slate-800">
              <h3 className="text-sm font-bold text-white print:text-slate-900 border-b border-white/5 print:border-slate-200 pb-1 flex items-center gap-1.5 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>1. Strategic Executive Summary</span>
              </h3>
              <p>
                As of the reporting week ending <strong>Friday, July 17, 2026</strong>, we are tracking <strong>{totalProjects}</strong> major residential estates under the National Housing Delivery Programme. Across these schemes, a cumulative <strong>{totalHouses}</strong> housing units are in various stages of construction, with <strong>{completedHouses} ({Math.round((completedHouses/totalHouses)*100)}%)</strong> fully completed and prepared for occupancy handover. 
              </p>
              <p>
                The program budget utilization is currently healthy at <strong>{budgetUtilization}%</strong>, with <strong>{formatNaira(totalSpent)}</strong> certified and released out of an allocated <strong>{formatNaira(totalBudget)}</strong>. One active project in Rivers State (Rumuokoro Royal Garden) is suffering contractor delays, and Kaduna State Phase 1 requires immediate prompting regarding site activity reporting. Detail breakdowns are outlined below.
              </p>
            </div>

            {/* KPIs Grid in PDF */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 print:border-slate-200 print:bg-slate-50">
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Total Housing Units</div>
                <div className="text-base font-extrabold text-white print:text-slate-900 mt-1">{totalHouses}</div>
              </div>
              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 print:border-slate-200 print:bg-slate-50">
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Units Completed</div>
                <div className="text-base font-extrabold text-amber-500 print:text-emerald-700 mt-1">{completedHouses}</div>
              </div>
              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 print:border-slate-200 print:bg-slate-50">
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Capital Spent</div>
                <div className="text-base font-extrabold text-white print:text-slate-900 mt-1">{formatNaira(totalSpent)}</div>
              </div>
              <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 print:border-slate-200 print:bg-slate-50">
                <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Under Construction</div>
                <div className="text-base font-extrabold text-amber-500/70 print:text-amber-700 mt-1">{inProgressHouses}</div>
              </div>
            </div>

            {/* Estates Inventory table */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-white print:text-slate-900 border-b border-white/5 print:border-slate-200 pb-1 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                2. Housing Estates Status Audit
              </h3>
              
              <table className="w-full text-left text-2xs border-collapse">
                <thead>
                  <tr className="bg-black/40 text-slate-400 font-bold border-b border-white/10 print:bg-slate-100 print:text-slate-700 print:border-slate-300 uppercase tracking-widest text-[9px]">
                    <th className="p-2">Estate Name</th>
                    <th className="p-2">State</th>
                    <th className="p-2">Typology</th>
                    <th className="p-2 text-right">Units</th>
                    <th className="p-2 text-right">Progress</th>
                    <th className="p-2">Contractor</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-slate-200">
                  {projects.map(p => (
                    <tr key={p.id} className="text-slate-300 print:text-slate-800 hover:bg-white/5 transition-colors">
                      <td className="p-2 font-bold text-white">{p.estateName}</td>
                      <td className="p-2">{p.state}</td>
                      <td className="p-2">{p.houseType}</td>
                      <td className="p-2 text-right font-medium">{p.houseCount}</td>
                      <td className="p-2 text-right font-bold text-amber-500 print:text-emerald-700">{p.progress}%</td>
                      <td className="p-2 truncate max-w-[120px]">{p.contractorName}</td>
                      <td className="p-2">
                        <span className="font-extrabold uppercase text-[10px] text-amber-500">{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Strategic Risks & Interventions Matrix */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white print:text-slate-900 border-b border-white/5 print:border-slate-200 pb-1 flex items-center gap-1.5 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>3. Critical Exception & Risk Matrix</span>
              </h3>

              <div className="space-y-2">
                {activeRisks.map(risk => (
                  <div key={risk.id} className="p-3 rounded-lg bg-black/40 border border-white/5 print:bg-slate-50 print:border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 text-2xs">
                    <div className="md:col-span-1 border-r border-white/10 print:border-slate-200 pr-2">
                      <div className="font-extrabold text-amber-500 print:text-rose-700 uppercase tracking-wider">{risk.severity} Severity</div>
                      <div className="text-[10px] text-slate-500 mt-1">Project: {risk.projectName}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="font-bold text-white print:text-slate-900">{risk.title}</div>
                      <p className="text-slate-400 print:text-slate-600 mt-1">{risk.details}</p>
                    </div>
                    <div className="md:col-span-1 flex flex-col justify-between">
                      <div className="text-[10px] text-slate-400">Target Mitigation:</div>
                      <div className="font-bold text-amber-500 print:text-emerald-700 mt-1">Executive Inquiry Formulated</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures Footer */}
            <div className="grid grid-cols-2 gap-12 pt-12 text-center text-2xs border-t border-white/10 print:border-slate-300">
              <div className="space-y-1 border-t border-white/5 print:border-slate-300 pt-2 max-w-[200px] mx-auto">
                <div className="font-bold text-slate-300 print:text-slate-800">Director of Project Delivery</div>
                <div className="text-[10px] text-slate-500">Federal Housing Authority, Abuja</div>
              </div>
              <div className="space-y-1 border-t border-white/5 print:border-slate-300 pt-2 max-w-[200px] mx-auto">
                <div className="font-bold text-slate-300 print:text-slate-800">Managing Director & CEO</div>
                <div className="text-[10px] text-slate-500">Executive Endorsement Seal</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* POWERPOINT 16:9 PRESENTATION BRIEF SLIDESHOW PREVIEW */}
      {reportFormat === 'ppt' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white/5 border border-white/10 px-5 py-3 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">PowerPoint Slide deck preview for board presentation briefings.</span>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
                disabled={activeSlide === 0}
                className="bg-black/50 hover:bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-xs font-bold text-white disabled:opacity-50 transition"
              >
                &larr; Prev
              </button>
              <span className="text-xs text-slate-300 font-bold px-2">{activeSlide + 1} / {slides.length}</span>
              <button 
                onClick={() => setActiveSlide(prev => Math.min(slides.length - 1, prev + 1))}
                disabled={activeSlide === slides.length - 1}
                className="bg-black/50 hover:bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-xs font-bold text-white disabled:opacity-50 transition"
              >
                Next &rarr;
              </button>
            </div>
          </div>

          {/* Slide Stage Screen (16:9 ratio box) */}
          <div className="relative w-full aspect-video bg-[#050505] border border-white/10 rounded-2xl flex flex-col justify-between p-10 overflow-hidden shadow-2xl select-none">
            
            {/* Corner Decorative Grid */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[linear-gradient(to_right,#f59e0b08_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b08_1px,transparent_1px)] bg-[size:10px_10px]" />
            <div className="absolute bottom-4 left-6 text-[10px] text-slate-600 font-bold tracking-widest uppercase">
              FHA NIGERIA BOARD OF DIRECTORS BRIEFING
            </div>

            {/* Slide Header */}
            {activeSlide > 0 && (
              <div className="border-b border-white/10 pb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-medium text-white tracking-tight uppercase font-serif" style={{ fontFamily: 'Georgia, serif' }}>{slides[activeSlide].title}</h3>
                  <p className="text-xs text-amber-500 font-bold mt-0.5">{slides[activeSlide].subtitle}</p>
                </div>
                <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-500 font-extrabold px-2.5 py-0.5 rounded tracking-wide">
                  SLIDE {activeSlide + 1} OF {slides.length}
                </span>
              </div>
            )}

            {/* Slide Content rendering by type */}
            <div className="flex-1 flex items-center justify-center my-6">
              
              {/* SLIDE 1: Title Slide */}
              {slides[activeSlide].type === 'title' && (
                <div className="text-center space-y-4">
                  <div className="bg-amber-500 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-max mx-auto">
                    NATIONAL HOUSING delivery PROGRAMME
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white leading-none font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                    FHA NATIONAL BRIEFING &<br/>EXECUTIVE COCKPIT SUMMARY
                  </h1>
                  <p className="text-slate-400 text-sm max-w-lg mx-auto font-medium">
                    Weekly strategic overview of construction progress, financial disbursals, contractor scores, and exceptional risks.
                  </p>
                  <div className="text-slate-500 text-xs font-semibold pt-4">
                    Office of the MD/CEO &bull; Abuja, Nigeria
                  </div>
                </div>
              )}

              {/* SLIDE 2: Stats Briefing */}
              {slides[activeSlide].type === 'stats' && (
                <div className="grid grid-cols-2 gap-8 w-full max-w-xl mx-auto text-center">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-1.5 flex flex-col justify-center items-center">
                    <Building className="w-8 h-8 text-amber-500" />
                    <div className="text-3xl font-bold text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>{totalHouses}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Housing Units Contracted</div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-1.5 flex flex-col justify-center items-center">
                    <CheckCircle2 className="w-8 h-8 text-amber-500/80" />
                    <div className="text-3xl font-bold text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>{completedHouses}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Units Completed 100%</div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-1.5 flex flex-col justify-center items-center">
                    <TrendingUp className="w-8 h-8 text-amber-500/60" />
                    <div className="text-3xl font-bold text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>{projects.filter(p => p.status === 'On Schedule').length}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Estates On Track</div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-1.5 flex flex-col justify-center items-center">
                    <ShieldAlert className="w-8 h-8 text-rose-400" />
                    <div className="text-3xl font-bold text-rose-400 font-serif" style={{ fontFamily: 'Georgia, serif' }}>{delayedProjects.length}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Delayed Interventions</div>
                  </div>
                </div>
              )}

              {/* SLIDE 3: Financials Chart */}
              {slides[activeSlide].type === 'financials' && (
                <div className="flex flex-col md:flex-row items-center gap-12 w-full max-w-2xl mx-auto">
                  {/* Custom SVG Budget Utilization Progress Circle */}
                  <div className="relative w-40 h-40 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="65" className="fill-none stroke-white/10 stroke-[12]" />
                      <circle cx="80" cy="80" r="65" className="fill-none stroke-amber-500 stroke-[12] transition-all" strokeDasharray={`${(budgetUtilization / 100) * 408} 408`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>{budgetUtilization}%</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spent Sum</span>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3.5 rounded-lg border border-white/10">
                        <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Consolidated Budget</div>
                        <div className="text-lg font-bold text-white mt-1">{formatNaira(totalBudget)}</div>
                      </div>
                      <div className="bg-white/5 p-3.5 rounded-lg border border-white/10">
                        <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Total spent outlay</div>
                        <div className="text-lg font-bold text-white mt-1">{formatNaira(totalSpent)}</div>
                      </div>
                    </div>
                    <p className="text-slate-400 italic">
                      "Financial disbursements are aligned with verified site milestone completions. General retention balances remain held in trust."
                    </p>
                  </div>
                </div>
              )}

              {/* SLIDE 4: Risks */}
              {slides[activeSlide].type === 'risks' && (
                <div className="w-full max-w-2xl mx-auto space-y-3 text-xs">
                  {activeRisks.slice(0, 2).map((risk) => (
                    <div key={risk.id} className="bg-white/5 p-4 border border-white/10 rounded-xl flex items-start gap-3.5">
                      <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-amber-500 uppercase tracking-widest text-[9px]">{risk.severity} Severity &bull; {risk.projectName}</span>
                        </div>
                        <div className="font-bold text-white text-sm mt-0.5 font-serif" style={{ fontFamily: 'Georgia, serif' }}>{risk.title}</div>
                        <p className="text-slate-400 mt-1">{risk.details}</p>
                      </div>
                    </div>
                  ))}
                  
                  {activeRisks.length === 0 && (
                    <div className="text-center text-slate-500 py-10 font-bold">
                      No active critical exception flags tracked this period.
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Slide Footer metadata */}
            <div className="flex justify-between items-center text-[10px] text-slate-600 border-t border-white/5 pt-4 px-2">
              <span>National Housing Programme Weekly Briefing</span>
              <span>Draft Seal V1.4 (Final Board Approved)</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
