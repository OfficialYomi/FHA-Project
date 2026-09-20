import React, { useState } from 'react';
import { Contractor, Project, ContractorScorecard } from '../types';
import { 
  Award, 
  Plus, 
  ArrowLeft, 
  Star, 
  CheckCircle, 
  ThumbsUp, 
  User, 
  FileText, 
  BarChart2, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ScorecardsViewProps {
  scorecards: ContractorScorecard[];
  contractors: Contractor[];
  projects: Project[];
  onCreateScorecard: (scorecardData: any) => Promise<void>;
}

export default function ScorecardsView({
  scorecards,
  contractors,
  projects,
  onCreateScorecard
}: ScorecardsViewProps) {
  const [isCreating, setIsCreating] = useState(false);

  // Form states for scorecard
  const [contractorId, setContractorId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [reviewedBy, setReviewedBy] = useState('Director of Quality Assurance, FHA');

  // Metrics (1 to 5 scores)
  const [quality, setQuality] = useState(4);
  const [timeliness, setTimeliness] = useState(4);
  const [safetyCompliance, setSafetyCompliance] = useState(4);
  const [documentationQuality, setDocumentationQuality] = useState(4);
  const [responsiveness, setResponsiveness] = useState(4);
  const [defectsManagement, setDefectsManagement] = useState(4);
  const [variationManagement, setVariationManagement] = useState(4);

  React.useEffect(() => {
    if (contractors.length > 0) {
      setContractorId(contractors[0].id);
    }
    if (projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [contractors, projects]);

  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorId) {
      alert("Please select a contractor.");
      return;
    }

    await onCreateScorecard({
      contractorId,
      projectId,
      feedback,
      reviewedBy,
      scores: {
        quality,
        timeliness,
        safetyCompliance,
        documentationQuality,
        responsiveness,
        defectsManagement,
        variationManagement
      }
    });

    setFeedback('');
    setIsCreating(false);
    alert("Performance scorecard registered. Ratings have been consolidated into the contractor index.");
  };

  // Star Rating Helper
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-1 text-amber-400">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="w-3.5 h-3.5 fill-current" />;
          }
          return <Star key={i} className="w-3.5 h-3.5 text-slate-700" />;
        })}
        <span className="text-xs font-bold text-white ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getMetricLabel = (key: string) => {
    switch (key) {
      case 'quality': return 'Workmanship & Quality';
      case 'timeliness': return 'Timeliness / Milestone Pace';
      case 'safetyCompliance': return 'HSE / Safety Compliance';
      case 'documentationQuality': return 'Drawings & Documentation';
      case 'responsiveness': return 'Responsiveness & Comm.';
      case 'defectsManagement': return 'Defect Punchlist Management';
      case 'variationManagement': return 'Variation & Budget Discipline';
      default: return key;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight font-serif" style={{ fontFamily: 'Georgia, serif' }}>
            Vendor Audit <span className="text-amber-500">/</span> Performance Scorecards
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Measure vendor delivery standards, safety records, and timeline compliance with metrics-driven tracking</p>
        </div>

        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Audit Past Project Delivery</span>
          </button>
        )}
      </div>

      {/* NEW SCORECARD FORM */}
      {isCreating && (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-white/10">
            <button 
              onClick={() => setIsCreating(false)}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>Create Performance Scorecard</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Evaluate and grade completed deliverables across 7 quality benchmarks</p>
            </div>
          </div>

          <form onSubmit={handleSubmitScorecard} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Select Contractor Profile</label>
                <select 
                  value={contractorId}
                  onChange={(e) => setContractorId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm outline-none focus:border-amber-500 transition"
                >
                  {contractors.map(c => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-[#050505] text-slate-900 dark:text-white">{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Completed Project Association</label>
                <select 
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm outline-none focus:border-amber-500 transition"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-[#050505] text-slate-900 dark:text-white">{p.estateName} ({p.state})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Audit Officer Identifier</label>
                <input 
                  type="text" required
                  value={reviewedBy} onChange={(e) => setReviewedBy(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Benchmark Scoring Grids */}
            <div className="bg-slate-50 dark:bg-black/20 p-5 rounded-xl border border-slate-200 dark:border-white/10">
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-5 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4" />
                <span>Audit Score Matrix (Grade from 1 to 5 Stars)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                {/* 1. Quality */}
                <div className="flex flex-col gap-1.5 bg-white dark:bg-black/50 p-3 rounded-lg border border-slate-200 dark:border-white/5 shadow-xs">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{getMetricLabel('quality')}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-500">{quality} / 5 Stars</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" step="1"
                    value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* 2. Timeliness */}
                <div className="flex flex-col gap-1.5 bg-white dark:bg-black/50 p-3 rounded-lg border border-slate-200 dark:border-white/5 shadow-xs">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{getMetricLabel('timeliness')}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-500">{timeliness} / 5 Stars</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" step="1"
                    value={timeliness} onChange={(e) => setTimeliness(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* 3. Safety */}
                <div className="flex flex-col gap-1.5 bg-white dark:bg-black/50 p-3 rounded-lg border border-slate-200 dark:border-white/5 shadow-xs">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{getMetricLabel('safetyCompliance')}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-500">{safetyCompliance} / 5 Stars</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" step="1"
                    value={safetyCompliance} onChange={(e) => setSafetyCompliance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* 4. Documentation */}
                <div className="flex flex-col gap-1.5 bg-white dark:bg-black/50 p-3 rounded-lg border border-slate-200 dark:border-white/5 shadow-xs">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{getMetricLabel('documentationQuality')}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-500">{documentationQuality} / 5 Stars</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" step="1"
                    value={documentationQuality} onChange={(e) => setDocumentationQuality(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* 5. Responsiveness */}
                <div className="flex flex-col gap-1.5 bg-white dark:bg-black/50 p-3 rounded-lg border border-slate-200 dark:border-white/5 shadow-xs">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{getMetricLabel('responsiveness')}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-500">{responsiveness} / 5 Stars</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" step="1"
                    value={responsiveness} onChange={(e) => setResponsiveness(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* 6. Defects */}
                <div className="flex flex-col gap-1.5 bg-white dark:bg-black/50 p-3 rounded-lg border border-slate-200 dark:border-white/5 shadow-xs">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{getMetricLabel('defectsManagement')}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-500">{defectsManagement} / 5 Stars</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" step="1"
                    value={defectsManagement} onChange={(e) => setDefectsManagement(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* 7. Variation */}
                <div className="flex flex-col gap-1.5 bg-white dark:bg-black/50 p-3 rounded-lg border border-slate-200 dark:border-white/5 shadow-xs md:col-span-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{getMetricLabel('variationManagement')}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-500">{variationManagement} / 5 Stars</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" step="1"
                    value={variationManagement} onChange={(e) => setVariationManagement(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Executive Review Remarks & Performance Feedback</label>
              <textarea 
                rows={3} required placeholder="State comprehensive qualitative audit performance regarding project delivery, structural strength, safety compliance, and commercial management..."
                value={feedback} onChange={(e) => setFeedback(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <button 
                type="button" onClick={() => setIsCreating(false)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded text-sm transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 rounded-lg text-sm transition shadow-sm"
              >
                Log Performance Audit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CORE SCORECARDS BENTO LISTING (Always High Contrast, Dark Aesthetics) */}
      {!isCreating && (
        <div className="space-y-6">
          
          {/* Contractors Summary Ratings Grid */}
          <div className="bg-[#090e1a] border border-slate-800 rounded-2xl p-5 shadow-xl text-white">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-1.5 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Consolidated Active Contractor Ratings Index</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contractors.filter(c => c.status === 'approved').map(c => {
                const cCards = scorecards.filter(sc => sc.contractorId === c.id);
                const avgRating = cCards.length > 0 
                  ? Number((cCards.reduce((acc, x) => acc + x.overallRating, 0) / cCards.length).toFixed(1))
                  : 4.2; // default high index if just onboarded

                return (
                  <div key={c.id} className="bg-[#0f172a] p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between gap-3 shadow-md hover:border-amber-500/40 transition">
                    <div>
                      <div className="text-xs font-bold text-white truncate font-serif">{c.companyName}</div>
                      <div className="text-[10px] text-slate-300 mt-0.5 font-medium">{c.assignedProjectsCount} assigned contracts</div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Tender Rating</span>
                      {renderStars(avgRating)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Scorecards Bento - Constant High-Contrast Dark Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scorecards.map((sc) => (
              <div 
                key={sc.id}
                className="bg-[#090e1a] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl hover:border-amber-500/50 transition text-white"
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>{sc.contractorName}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">Project: <strong className="text-white">{sc.projectName}</strong></p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Overall Audit Score</div>
                    <div className="flex items-center gap-1 text-amber-400 font-black text-base justify-end mt-0.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>{sc.overallRating.toFixed(1)} / 5.0</span>
                    </div>
                  </div>
                </div>

                {/* Individual Metric Bars with High-Contrast Numbers */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[11px] text-slate-300">
                  {Object.entries(sc.scores).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="truncate max-w-[120px] text-slate-300 font-medium">{getMetricLabel(key)}</span>
                        <span className="font-extrabold text-white bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">{value}/5</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(value / 5) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Qualitative Feedback */}
                <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-700/80 text-xs italic text-slate-100 flex items-start gap-2 shadow-inner">
                  <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">"{sc.feedback}"</p>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center text-[10px] text-slate-300 border-t border-slate-800 pt-2.5">
                  <span className="flex items-center gap-1 text-slate-300"><User className="w-3.5 h-3.5 text-amber-400" /> Auditor: <strong className="text-white">{sc.reviewedBy}</strong></span>
                  <span className="font-mono text-slate-400">Date: {sc.dateCreated}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
