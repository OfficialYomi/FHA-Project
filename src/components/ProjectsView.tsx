import React, { useState } from 'react';
import { 
  Project, 
  Contractor, 
  CONSTRUCTION_STAGES, 
  PhotoUpdate 
} from '../types';
import { 
  Plus, 
  Check, 
  Clock, 
  MapPin, 
  User, 
  Camera, 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  AlertCircle,
  Building,
  UploadCloud,
  FileText,
  ThumbsUp,
  ThumbsDown,
  X
} from 'lucide-react';

const AVAILABLE_TYPOLOGIES = [
  "2 Bedroom Semi-Detached Bungalow",
  "3 Bedroom Bungalow (Standard)",
  "4 Bedroom Detached Duplex (Premium)",
  "2 Bedroom Terrace Flat"
];

interface ProjectsViewProps {
  projects: Project[];
  contractors: Contractor[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onSetupProject: (projectData: any) => Promise<void>;
  onUpdateProject: (projectId: string, updateData: any) => Promise<void>;
  currentUser?: any;
  onAcceptProject?: (projectId: string) => Promise<void>;
  onRejectProject?: (projectId: string) => Promise<void>;
}

export default function ProjectsView({
  projects,
  contractors,
  selectedProjectId,
  onSelectProject,
  onSetupProject,
  onUpdateProject,
  currentUser,
  onAcceptProject,
  onRejectProject
}: ProjectsViewProps) {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Form states for new project
  const [state, setState] = useState('Abuja');
  const [estateName, setEstateName] = useState('');
  const [enabledTypologies, setEnabledTypologies] = useState<{ [key: string]: boolean }>({
    '3 Bedroom Bungalow (Standard)': true
  });
  const [typologyCounts, setTypologyCounts] = useState<{ [key: string]: number }>({
    '2 Bedroom Semi-Detached Bungalow': 50,
    '3 Bedroom Bungalow (Standard)': 100,
    '4 Bedroom Detached Duplex (Premium)': 50,
    '2 Bedroom Terrace Flat': 40
  });
  const [contractorId, setContractorId] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [targetCompletionDate, setTargetCompletionDate] = useState('');

  // Form states for progress update & photo evidence
  const [updatingStages, setUpdatingStages] = useState<{ [key: string]: boolean }>({});
  const [photoStage, setPhotoStage] = useState('Foundation');
  const [beforePhoto, setBeforePhoto] = useState('https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=500&q=80');
  const [afterPhoto, setAfterPhoto] = useState('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80');
  const [gpsName, setGpsName] = useState('FHA Site Sector A, Abuja');
  const [uploader, setUploader] = useState('');
  const [simulatedGps, setSimulatedGps] = useState<any>(null);
  const [isSimulatingCapture, setIsSimulatingCapture] = useState(false);

  const isContractor = currentUser?.role === 'CONTRACTOR';
  const displayedProjects = isContractor
    ? projects.filter(p => p.contractorId === currentUser?.contractorId)
    : projects;

  // Find the selected project object
  const currentProject = projects.find(p => p.id === selectedProjectId) || null;

  const totalHouseUnits = Object.entries(enabledTypologies)
    .filter(([_, enabled]) => enabled)
    .reduce((sum, [type, _]) => sum + (typologyCounts[type] || 0), 0);

  // Initialize updating stages when selecting a project
  React.useEffect(() => {
    if (currentProject) {
      setUpdatingStages({ ...currentProject.stages });
      setUploader(currentProject.projectManager);
      // Auto pre-fill photo stage to the next uncompleted stage
      const nextUncompleted = CONSTRUCTION_STAGES.find(stage => !currentProject.stages[stage]);
      if (nextUncompleted) {
        setPhotoStage(nextUncompleted);
      }
    }
  }, [selectedProjectId, currentProject]);

  // Handle Project Creation Setup
  const handleSubmitSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estateName || !contractorId || !budget || !targetCompletionDate) {
      alert("Please fill in all required fields.");
      return;
    }

    const activeTypologyList = Object.entries(enabledTypologies)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => ({
        type,
        count: typologyCounts[type] || 0
      }));

    if (activeTypologyList.length === 0) {
      alert("Please select at least one Housing Typology.");
      return;
    }

    // Compute houseCount and formatted houseType
    const totalHouseCount = activeTypologyList.reduce((sum, item) => sum + item.count, 0);
    const houseTypeSummary = activeTypologyList
      .map(item => `${item.count}x ${item.type.replace(/ \(.*?\)/g, '')}`)
      .join(', ');

    const contractor = contractors.find(c => c.id === contractorId);
    
    await onSetupProject({
      state,
      estateName,
      houseType: houseTypeSummary,
      houseCount: totalHouseCount,
      typologies: activeTypologyList,
      contractorId,
      contractorName: contractor?.companyName || "Assigned Contractor",
      projectManager: projectManager || "Resident Engineer",
      budget: Number(budget),
      startDate: startDate || new Date().toISOString().split('T')[0],
      targetCompletionDate
    });

    // Reset Form
    setEstateName('');
    setProjectManager('');
    setBudget('');
    setStartDate('');
    setTargetCompletionDate('');
    setEnabledTypologies({
      '3 Bedroom Bungalow (Standard)': true
    });
    setTypologyCounts({
      '2 Bedroom Semi-Detached Bungalow': 50,
      '3 Bedroom Bungalow (Standard)': 100,
      '4 Bedroom Detached Duplex (Premium)': 50,
      '2 Bedroom Terrace Flat': 40
    });
    setIsSettingUp(false);
  };

  // Simulate Photo & GPS capture
  const handleSimulateCapture = () => {
    setIsSimulatingCapture(true);
    
    // Choose high-quality construction images based on selected stage
    let beforeUrl = "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=500&q=80"; // ground/dig
    let afterUrl = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80"; // brick/concrete

    if (photoStage.toLowerCase().includes("roof")) {
      beforeUrl = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80";
      afterUrl = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=500&q=80";
    } else if (photoStage.toLowerCase().includes("finish") || photoStage.toLowerCase().includes("complete")) {
      beforeUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80";
      afterUrl = "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=500&q=80";
    } else if (photoStage.toLowerCase().includes("electrical") || photoStage.toLowerCase().includes("plumbing")) {
      beforeUrl = "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=500&q=80";
      afterUrl = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80";
    }

    setTimeout(() => {
      // Pick simulated GPS near the project state
      let lat = 9.0765;
      let lng = 7.3986;
      let locName = "FHA Gwarinpa Estate, Abuja";

      if (currentProject?.state.toLowerCase() === 'kaduna') {
        lat = 10.5105; lng = 7.4165; locName = "Kada Hill Estate Sector C, Kaduna";
      } else if (currentProject?.state.toLowerCase() === 'lagos') {
        lat = 6.6112; lng = 3.3289; locName = "Isheri Olofin FHA Sector, Lagos";
      } else if (currentProject?.state.toLowerCase() === 'rivers') {
        lat = 4.8697; lng = 6.9935; locName = "Rumuokoro Garden Estate, Port Harcourt";
      } else if (currentProject?.state.toLowerCase() === 'kano') {
        lat = 11.9964; lng = 8.5167; locName = "Dala Hill Court Sector A, Kano";
      }

      setBeforePhoto(beforeUrl);
      setAfterPhoto(afterUrl);
      setGpsName(locName);
      setSimulatedGps({
        lat,
        lng,
        accuracy: 3.5, // 3.5 meters
        locationName: locName
      });
      setIsSimulatingCapture(false);
    }, 800);
  };

  // Submit stage completion and photo evidence
  const handleSaveProgress = async () => {
    if (!currentProject) return;

    const photoUpdate: any = simulatedGps ? {
      stage: photoStage,
      beforePhoto,
      afterPhoto,
      gps: simulatedGps,
      uploadedBy: uploader || "Resident Engineer"
    } : null;

    // Check if stages have actually been checked
    await onUpdateProject(currentProject.id, {
      stages: updatingStages,
      photoUpdate: photoUpdate
    });

    setSimulatedGps(null);
    alert("Progress and photo evidence successfully synchronized with the central database!");
  };

  // Checkbox toggle
  const handleStageCheckboxToggle = async (stage: string) => {
    if (!currentProject) return;

    const targetIndex = CONSTRUCTION_STAGES.indexOf(stage);
    if (targetIndex === -1) return;

    const currentChecked = !!updatingStages[stage];
    const nextChecked = !currentChecked;

    // Create copy of updating stages and run cascading
    const updated = { ...updatingStages };
    if (nextChecked) {
      // Mark this stage and all preceding stages as true
      for (let i = 0; i <= targetIndex; i++) {
        updated[CONSTRUCTION_STAGES[i]] = true;
      }
    } else {
      // Unmark this stage and all succeeding stages as false
      for (let i = targetIndex; i < CONSTRUCTION_STAGES.length; i++) {
        updated[CONSTRUCTION_STAGES[i]] = false;
      }
    }

    setUpdatingStages(updated);

    // Recalculate progress
    const checkedCount = CONSTRUCTION_STAGES.filter(s => updated[s] === true).length;
    const newProgress = Math.round((checkedCount / CONSTRUCTION_STAGES.length) * 100);

    let newStatus = currentProject.status;
    if (updated["Completed"] === true) {
      newStatus = "Completed";
    } else if (newProgress > 0 && currentProject.status === "Completed") {
      newStatus = "On Schedule";
    }

    // Instantly save to backend
    await onUpdateProject(currentProject.id, {
      stages: updated,
      status: newStatus
    });
  };

  // Formatter for Currency
  const formatMoney = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-300 dark:border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-serif" style={{ fontFamily: 'Georgia, serif' }}>
            Projects <span className="text-amber-500">/</span> Administration & Progress
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Deploy new estates, adjust work breakdown structures, and record visual audit logs</p>
        </div>
        
        {!selectedProjectId && !isSettingUp && !isContractor && (
          <button 
            onClick={() => {
              setIsSettingUp(true);
              if (contractors.length > 0) {
                // Pre-fill first approved contractor
                const firstApp = contractors.find(c => c.status === 'approved');
                if (firstApp) setContractorId(firstApp.id);
              }
            }}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Setup New Project Estate</span>
          </button>
        )}
      </div>

      {/* CREATE NEW PROJECT SCREEN (Module 2) */}
      {isSettingUp && (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-white/10">
            <button 
              onClick={() => setIsSettingUp(false)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>Project Registration Scheme</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Establish the contract linkages: State &rarr; Estate &rarr; House Type &rarr; Contractor</p>
            </div>
          </div>

          <form onSubmit={handleSubmitSetup} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">State Jurisdiction</label>
              <select 
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-white dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 py-2.5 px-3 rounded-lg text-sm outline-none"
              >
                <option value="Abuja" className="bg-[#050505]">Abuja (FCT)</option>
                <option value="Kaduna" className="bg-[#050505]">Kaduna</option>
                <option value="Lagos" className="bg-[#050505]">Lagos</option>
                <option value="Rivers" className="bg-[#050505]">Rivers (Port Harcourt)</option>
                <option value="Kano" className="bg-[#050505]">Kano</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Estate Scheme Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Kada Hill Estate Phase 2" 
                value={estateName}
                onChange={(e) => setEstateName(e.target.value)}
                className="w-full bg-white dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 py-2.5 px-3 rounded-lg text-sm outline-none"
                required
              />
            </div>

            <div className="md:col-span-2 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">
                  Housing Typology & Units Selection
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  Total Units: {totalHouseUnits}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Select one or more housing typologies and enter the corresponding number of units for each.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {AVAILABLE_TYPOLOGIES.map((typology) => {
                  const isEnabled = enabledTypologies[typology] || false;
                  const countValue = typologyCounts[typology] || 0;
                  return (
                    <div 
                      key={typology}
                      className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                        isEnabled 
                          ? 'bg-emerald-50 dark:bg-[#1D7033]/15 border-emerald-300 dark:border-[#1D7033]/30 shadow-sm' 
                          : 'bg-white dark:bg-black/30 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                        <input 
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => {
                            setEnabledTypologies(prev => ({
                              ...prev,
                              [typology]: e.target.checked
                            }));
                          }}
                          className="rounded border-slate-300 dark:border-white/20 bg-white dark:bg-black text-emerald-600 focus:ring-0 focus:ring-offset-0 w-4.5 h-4.5 cursor-pointer accent-[#1D7033]"
                        />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{typology}</span>
                      </label>
                      
                      {isEnabled && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">Units:</span>
                          <input 
                            type="number"
                            min="1"
                            value={countValue}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 0);
                              setTypologyCounts(prev => ({
                                ...prev,
                                [typology]: val
                              }));
                            }}
                            className="w-16 bg-white dark:bg-black text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-[#1D7033]/40 focus:border-emerald-500 text-center py-1 px-1.5 rounded font-bold text-xs outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Assigned Onboarded Contractor *</label>
              <select 
                value={contractorId}
                onChange={(e) => setContractorId(e.target.value)}
                className="w-full bg-white dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 py-2.5 px-3 rounded-lg text-sm outline-none"
                required
              >
                {contractors.filter(c => c.status === 'approved').map(c => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
                {contractors.filter(c => c.status === 'approved').length === 0 && (
                  <option value="">No approved contractors available!</option>
                )}
              </select>
            </div>

             <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Resident Project Manager / Engr *</label>
              <input 
                type="text" 
                placeholder="e.g. Engr. Ahmed Abdul" 
                value={projectManager}
                onChange={(e) => setProjectManager(e.target.value)}
                className="w-full bg-white dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 py-2.5 px-3 rounded-lg text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Contract Budget Amount (NGN) *</label>
              <input 
                type="number" 
                placeholder="e.g. 350000000" 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-white dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 py-2.5 px-3 rounded-lg text-sm outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 py-2 px-3 rounded-lg text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Target Completion *</label>
                <input 
                  type="date" 
                  value={targetCompletionDate}
                  onChange={(e) => setTargetCompletionDate(e.target.value)}
                  className="w-full bg-white dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 py-2 px-3 rounded-lg text-xs outline-none"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <button 
                type="button"
                onClick={() => setIsSettingUp(false)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 px-4 py-2 rounded-lg text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2 rounded-xl text-sm transition shadow-sm cursor-pointer"
              >
                Deploy Project Setup
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PROJECT LIST SCREEN (DEFAULT) */}
      {!selectedProjectId && !isSettingUp && (
        <div className="grid grid-cols-1 gap-4">
          {displayedProjects.map((p) => (
            <div 
              key={p.id}
              onClick={() => {
                if (p.assignmentStatus === 'Pending') {
                  alert("Please accept this contract assignment first to open the project workspace.");
                  return;
                }
                if (p.assignmentStatus === 'Rejected') {
                  alert("This project assignment has been rejected.");
                  return;
                }
                onSelectProject(p.id);
              }}
              className="bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-2xl p-5 hover:border-amber-500/40 hover:bg-slate-50/70 dark:hover:bg-white/[0.04] cursor-pointer transition flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-xs"
            >
              {/* Left Details */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors font-serif" style={{ fontFamily: 'Georgia, serif' }}>{p.estateName}</h3>
                  
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.status === 'Completed' ? 'bg-sky-100 dark:bg-sky-500/15 text-sky-800 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30' :
                    p.status === 'Delayed' ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30' :
                    p.status === 'Needs Attention' ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30' :
                    'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                  }`}>
                    {p.status}
                  </span>

                  {p.assignmentStatus && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.assignmentStatus === 'Accepted' ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30' :
                      p.assignmentStatus === 'Rejected' ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30' :
                      'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 animate-pulse'
                    }`}>
                      {p.assignmentStatus === 'Accepted' ? 'Contract Accepted' :
                       p.assignmentStatus === 'Rejected' ? 'Assignment Rejected' :
                       'Pending Acceptance'}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {p.state}</span>
                  <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-slate-500" /> {p.houseType} ({p.houseCount} Units)</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-500" /> PM: {p.projectManager}</span>
                </div>

                {isContractor && p.assignmentStatus === 'Pending' && (
                  <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-amber-600 dark:text-amber-500 font-bold mr-2">Decision Required:</span>
                    <button 
                      onClick={() => onAcceptProject && onAcceptProject(p.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded text-[10px] flex items-center gap-1 transition shadow-sm cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Accept Assignment
                    </button>
                    <button 
                      onClick={() => onRejectProject && onRejectProject(p.id)}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-3 rounded text-[10px] flex items-center gap-1 transition shadow-sm cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Decline
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Slider */}
              <div className="w-full md:w-60 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>WBS Progress</span>
                  <span className="text-slate-900 dark:text-white font-bold">{p.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-black/50 rounded-full overflow-hidden border border-slate-300 dark:border-white/10">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      p.status === 'Delayed' ? 'bg-rose-500' : p.status === 'Needs Attention' ? 'bg-amber-500' : p.status === 'Completed' ? 'bg-sky-500' : 'bg-amber-500'
                    }`} 
                    style={{ width: `${p.progress}%` }} 
                  />
                </div>
              </div>

              {/* Financial Summary */}
              <div className="text-left md:text-right shrink-0">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Contract Budget</div>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-500">{formatMoney(p.budget)}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Disbursed: {formatMoney(p.spent)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED PROJECT WORKSPACE (Module 3 & 4) */}
      {selectedProjectId && currentProject && !isSettingUp && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-white/10 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onSelectProject(null)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>{currentProject.estateName}</h3>
                  <span className="text-xs text-slate-500">&bull; PM Workspace</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                  <span>Jurisdiction: <strong className="text-slate-900 dark:text-slate-200">{currentProject.state}</strong></span>
                  <span>&bull;</span>
                  <span>Typology: <strong className="text-slate-900 dark:text-slate-200">{currentProject.houseType}</strong></span>
                  <span>&bull;</span>
                  <span>Contractor: <strong className="text-amber-600 dark:text-amber-500">{currentProject.contractorName}</strong></span>
                </div>
                {currentProject.typologies && currentProject.typologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {currentProject.typologies.map((t, idx) => (
                      <span 
                        key={idx} 
                        className="bg-emerald-50 dark:bg-[#1D7033]/15 border border-emerald-300 dark:border-[#1D7033]/30 text-emerald-800 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                      >
                        {t.count} Units &bull; {t.type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest">WBS Progress:</span>
              <div className="bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 px-3 py-1.5 rounded-lg text-sm font-extrabold text-amber-600 dark:text-amber-500">
                {currentProject.progress}%
              </div>
            </div>
          </div>

          {/* Action Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. Discrete Stages Checkboxes (Module 3) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-white/10 p-5 flex flex-col justify-between shadow-sm">
              <div>
                <div className="pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                    <Check className="w-4 h-4 text-amber-500" />
                    <span>WBS Milestone Progress Checklist</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[10px] mt-0.5">Check completed segments to automatically calculate percentage.</p>
                </div>

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {CONSTRUCTION_STAGES.map((stage) => {
                    const isChecked = !!updatingStages[stage];
                    return (
                      <div 
                        key={stage}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition ${
                          isChecked 
                            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-slate-900 dark:text-white' 
                            : 'bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleStageCheckboxToggle(stage)}
                            className="accent-amber-500 w-4 h-4 cursor-pointer"
                          />
                          <span className="font-semibold">{stage}</span>
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setPhotoStage(stage);
                            // Set coordinates & generate picture simulation immediately
                            setIsSimulatingCapture(true);
                            let beforeUrl = "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=500&q=80";
                            let afterUrl = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80";

                            if (stage.toLowerCase().includes("roof")) {
                              beforeUrl = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80";
                              afterUrl = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=500&q=80";
                            } else if (stage.toLowerCase().includes("finish") || stage.toLowerCase().includes("complete")) {
                              beforeUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80";
                              afterUrl = "https://images.unsplash.com/photo-160058515526-990dced4db0d?auto=format&fit=crop&w=500&q=80";
                            } else if (stage.toLowerCase().includes("electrical") || stage.toLowerCase().includes("plumbing")) {
                              beforeUrl = "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=500&q=80";
                              afterUrl = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80";
                            }

                            setTimeout(() => {
                              let lat = 9.0765; let lng = 7.3986; let locName = "FHA Gwarinpa Estate, Abuja";
                              if (currentProject?.state.toLowerCase() === 'kaduna') {
                                lat = 10.5105; lng = 7.4165; locName = "Kada Hill Estate Sector C, Kaduna";
                              } else if (currentProject?.state.toLowerCase() === 'lagos') {
                                lat = 6.6112; lng = 3.3289; locName = "Isheri Olofin FHA Sector, Lagos";
                              } else if (currentProject?.state.toLowerCase() === 'rivers') {
                                lat = 4.8697; lng = 6.9935; locName = "Rumuokoro Garden Estate, Port Harcourt";
                              } else if (currentProject?.state.toLowerCase() === 'kano') {
                                lat = 11.9964; lng = 8.5167; locName = "Dala Hill Court Sector A, Kano";
                              }
                              setBeforePhoto(beforeUrl);
                              setAfterPhoto(afterUrl);
                              setGpsName(locName);
                              setSimulatedGps({ lat, lng, accuracy: 2.8, locationName: locName });
                              setIsSimulatingCapture(false);
                            }, 400);
                          }}
                          title={`Capture visual progress for ${stage}`}
                          className="p-1.5 bg-slate-100 hover:bg-amber-500 hover:text-black dark:bg-white/5 rounded text-slate-500 dark:text-slate-400 transition ml-2 flex items-center justify-center cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10">
                <button 
                  onClick={handleSaveProgress}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  Save WBS Milestone Changes
                </button>
              </div>
            </div>

            {/* 2. Photo & GPS Evidence Upload (Module 4) */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-white/10 p-5 flex flex-col justify-between shadow-sm">
              <div>
                <div className="pb-3 border-b border-slate-200 dark:border-white/10 mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                      <Camera className="w-4 h-4 text-amber-500" />
                      <span>On-Site Visual Audit Log (Photo Evidence)</span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-[10px] mt-0.5">Simulate actual site capture (with precise timestamp, GPS, and imagery)</p>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={handleSimulateCapture}
                    disabled={isSimulatingCapture}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-black/50 dark:hover:bg-white/5 text-amber-600 dark:text-amber-500 font-bold px-3 py-1.5 border border-slate-300 dark:border-white/10 hover:border-amber-500/30 rounded-xl text-[10px] flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                    <span>{isSimulatingCapture ? "Simulating..." : "Simulate Site Capture"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Target Construction Stage</label>
                    <select 
                      value={photoStage}
                      onChange={(e) => setPhotoStage(e.target.value)}
                      className="w-full bg-white dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
                    >
                      {CONSTRUCTION_STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Responsible Reporting Party</label>
                    <input 
                      type="text" 
                      value={uploader}
                      onChange={(e) => setUploader(e.target.value)}
                      className="w-full bg-white dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
                      placeholder="e.g. Resident Engineer"
                    />
                  </div>
                </div>

                {/* Imagery Preview Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-slate-500" />
                      <span>Before Photo</span>
                    </div>
                    {beforePhoto ? (
                      <img src={beforePhoto} alt="Before" referrerPolicy="no-referrer" className="w-full h-32 object-cover rounded border border-slate-200 dark:border-white/5" />
                    ) : (
                      <div className="w-full h-32 bg-slate-100 dark:bg-[#050505] flex items-center justify-center text-xs text-slate-500 rounded border border-slate-200 dark:border-white/5">Capture simulation needed</div>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-3 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-amber-500" />
                      <span>After Photo</span>
                    </div>
                    {afterPhoto ? (
                      <img src={afterPhoto} alt="After" referrerPolicy="no-referrer" className="w-full h-32 object-cover rounded border border-slate-200 dark:border-white/5" />
                    ) : (
                      <div className="w-full h-32 bg-slate-100 dark:bg-[#050505] flex items-center justify-center text-xs text-slate-500 rounded border border-slate-200 dark:border-white/5">Capture simulation needed</div>
                    )}
                  </div>
                </div>

                {/* GPS and Metadata Summary */}
                {simulatedGps && (
                  <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-300 dark:border-amber-500/10 rounded-xl p-3 mt-4 text-[11px] space-y-1 flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 w-full text-slate-700 dark:text-slate-300">
                      <div>Location Name: <strong className="text-slate-900 dark:text-white">{simulatedGps.locationName}</strong></div>
                      <div>Precise Coordinates: <strong className="text-slate-900 dark:text-white">{simulatedGps.lat.toFixed(5)}, {simulatedGps.lng.toFixed(5)}</strong></div>
                      <div>Receiver Accuracy: <strong className="text-amber-600 dark:text-amber-400">&plusmn; {simulatedGps.accuracy}m (GNSS RTK)</strong></div>
                      <div>Timestamp: <strong className="text-slate-900 dark:text-white">{new Date().toLocaleString()}</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {simulatedGps && (
                <div className="mt-5 pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-xs gap-3">
                  <span className="text-emerald-700 dark:text-emerald-500 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 animate-pulse" /> Capture verified with GPS signature
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const photoUpdate = {
                          stage: photoStage,
                          beforePhoto: beforePhoto,
                          afterPhoto: afterPhoto,
                          gps: simulatedGps,
                          uploadedBy: uploader || currentUser?.name || "Contractor"
                        };
                        try {
                          await onUpdateProject(currentProject.id, {
                            photoUpdate: photoUpdate
                          });
                          // Reset simulation state
                          setSimulatedGps(null);
                          alert("Photo evidence successfully logged to the project's site gallery!");
                        } catch (err) {
                          console.error("Error saving photo evidence:", err);
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Standalone Evidence to Gallery</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Photographic Audit History Trail */}
          <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-white/10 p-5 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-white/10 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Photographic Site Audit History Trail</span>
            </h4>

            {currentProject.photoUpdates.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No photo evidence uploaded yet for this estate. Select "Simulate Site Capture" above to add logs.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentProject.photoUpdates.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-black/40 p-4 border border-slate-200 dark:border-white/10 rounded-xl flex flex-col justify-between gap-3 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>{item.stage} Verification</div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.gps.locationName} &bull; Coordinates: {item.gps.lat.toFixed(4)}, {item.gps.lng.toFixed(4)}</span>
                        </div>
                      </div>
                      <span className="text-[9px] bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-500 border border-amber-300 dark:border-amber-500/20 font-bold px-2 py-0.5 rounded">
                        GPS Verified (&plusmn;{item.gps.accuracy}m)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[8px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest block mb-1">Stage Commencement</span>
                        <img src={item.beforePhoto} alt="Before" referrerPolicy="no-referrer" className="w-full h-24 object-cover rounded border border-slate-200 dark:border-white/5" />
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest block mb-1">Stage Delivery Verification</span>
                        <img src={item.afterPhoto} alt="After" referrerPolicy="no-referrer" className="w-full h-24 object-cover rounded border border-slate-200 dark:border-white/5" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-200 dark:border-white/5 pt-2.5">
                      <div>Reported by: <strong className="text-slate-800 dark:text-slate-300">{item.uploadedBy}</strong></div>
                      <div>Date: <strong className="text-slate-800 dark:text-slate-300">{new Date(item.timestamp).toLocaleDateString()}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
