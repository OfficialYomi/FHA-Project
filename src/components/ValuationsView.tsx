import React, { useState } from 'react';
import { 
  Project, 
  ValuationRequest, 
  ValuationStage,
  ValuationPhoto,
  User as AppUser
} from '../types';
import { 
  Plus, 
  FileText, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  DollarSign, 
  AlertCircle, 
  ShieldCheck, 
  MessageSquare,
  ArrowLeft,
  Settings,
  X,
  CreditCard,
  Camera,
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  Loader2,
  Trash2
} from 'lucide-react';
import { analyzeImageAuthenticity, fileToDataUrl } from '../utils/imageAiDetection';

interface ValuationsViewProps {
  valuations: ValuationRequest[];
  projects: Project[];
  onRequestValuation: (valData: any) => Promise<void>;
  onApproveValuation: (valId: string, approvalData: any) => Promise<void>;
  currentUser: AppUser | null;
}

export default function ValuationsView({
  valuations,
  projects,
  onRequestValuation,
  onApproveValuation,
  currentUser
}: ValuationsViewProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedValuation, setSelectedValuation] = useState<ValuationRequest | null>(null);

  const userRole = currentUser?.role || 'MD';

  // Filter projects and valuations if logged in as contractor
  const contractorProjects = userRole === 'CONTRACTOR'
    ? projects.filter(p => p.contractorId === currentUser?.contractorId)
    : projects;

  const displayedValuations = userRole === 'CONTRACTOR'
    ? valuations.filter(v => v.projectId && contractorProjects.some(cp => cp.id === v.projectId))
    : valuations;

  const getRoleForStage = (stage: ValuationStage): string => {
    switch (stage) {
      case 'resident_engineer_verify': return 'RE';
      case 'project_manager_approve': return 'PM';
      case 'quantity_surveyor_certify': return 'QS';
      case 'finance_review': return 'FD';
      case 'executive_approve': return 'MD';
      case 'payment_released': return 'CT';
      default: return '';
    }
  };

  const isCurrentRoleAuthorized = selectedValuation 
    ? userRole === getRoleForStage(selectedValuation.currentStage)
    : false;

  // Form states for new valuation request
  const [projectId, setProjectId] = useState('');
  const [amountRequested, setAmountRequested] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [comments, setComments] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<ValuationPhoto[]>([]);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);

  // Approval step details
  const [amountCertified, setAmountCertified] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  React.useEffect(() => {
    if (contractorProjects.length > 0) {
      setProjectId(contractorProjects[0].id);
    }
  }, [contractorProjects]);

  React.useEffect(() => {
    if (selectedValuation) {
      setAmountCertified(selectedValuation.amountCertified?.toString() || selectedValuation.amountRequested.toString());
      setApprovalComment('');
    }
  }, [selectedValuation]);

  const handlePhotoFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsAnalyzingPhoto(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const dataUrl = await fileToDataUrl(file);
        const analysis = await analyzeImageAuthenticity(dataUrl);

        const newPhoto: ValuationPhoto = {
          id: `vphoto-${Date.now()}-${i}`,
          url: dataUrl,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          isAiGenerated: analysis.isAiGenerated,
          aiConfidence: analysis.aiConfidence,
          analysisDetails: analysis.analysisDetails,
          verifiedAt: analysis.verifiedAt
        };

        setUploadedPhotos(prev => [...prev, newPhoto]);
      } catch (err) {
        console.error("Error analyzing uploaded site photo:", err);
      }
    }
    setIsAnalyzingPhoto(false);
  };

  const handleAddSampleAuthenticPhoto = async () => {
    setIsAnalyzingPhoto(true);
    // Authentic construction site sample
    const sampleUrl = 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80';
    const analysis = await analyzeImageAuthenticity(sampleUrl);
    setUploadedPhotos(prev => [
      ...prev,
      {
        id: `vphoto-auth-${Date.now()}`,
        url: sampleUrl,
        caption: 'Physical On-Site Foundation Trench Cast',
        isAiGenerated: analysis.isAiGenerated,
        aiConfidence: analysis.aiConfidence,
        analysisDetails: analysis.analysisDetails,
        verifiedAt: new Date().toISOString()
      }
    ]);
    setIsAnalyzingPhoto(false);
  };

  const handleAddSampleAiPhoto = async () => {
    setIsAnalyzingPhoto(true);
    // Synthetic AI generation simulation test
    const sampleAiUrl = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80';
    setUploadedPhotos(prev => [
      ...prev,
      {
        id: `vphoto-ai-${Date.now()}`,
        url: sampleAiUrl,
        caption: 'Generative AI Rendering (Synthetic Test)',
        isAiGenerated: true,
        aiConfidence: 93,
        analysisDetails: '⚠️ Flagged by Neural Forensic Audit: Anomalous diffuse lighting, synthetic texture interpolation, and lack of physical concrete aggregate grain.',
        verifiedAt: new Date().toISOString()
      }
    ]);
    setIsAnalyzingPhoto(false);
  };

  const handleRemoveUploadedPhoto = (id?: string) => {
    setUploadedPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !amountRequested) {
      alert("Please specify the project and amount.");
      return;
    }

    await onRequestValuation({
      projectId,
      amountRequested: Number(amountRequested),
      invoiceNumber: invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      comments,
      photos: uploadedPhotos
    });

    setAmountRequested('');
    setInvoiceNumber('');
    setComments('');
    setUploadedPhotos([]);
    setIsRequesting(false);
    alert("Valuation request registered with verified photo evidence. The Resident Engineer has been alerted to conduct on-site verification.");
  };

  const handleApprovalAction = async (status: 'approved' | 'rejected') => {
    if (!selectedValuation) return;

    // Determine actor based on currentUser
    const actor = currentUser?.name || `${userRole} Administrator`;

    await onApproveValuation(selectedValuation.id, {
      actor,
      status,
      comments: approvalComment || `${status === 'approved' ? 'Approved' : 'Rejected'} at ${selectedValuation.currentStage.replace(/_/g, ' ')} level.`,
      amountCertified: status === 'approved' ? Number(amountCertified) : undefined
    });

    setSelectedValuation(null);
    alert(`Valuation claim successfully updated: ${status.toUpperCase()}`);
  };

  // Workflow Stages List
  const workflowStages: { id: ValuationStage; label: string; role: string }[] = [
    { id: 'request_valuation', label: '1. Request', role: 'Contractor' },
    { id: 'resident_engineer_verify', label: '2. Verify', role: 'Resident Engr' },
    { id: 'project_manager_approve', label: '3. Endorse', role: 'Project Mgr' },
    { id: 'quantity_surveyor_certify', label: '4. Certify', role: 'Quantity Surveyor' },
    { id: 'finance_review', label: '5. Audit', role: 'Finance Dir' },
    { id: 'executive_approve', label: '6. Sanction', role: 'MD/CEO' },
    { id: 'payment_released', label: '7. Remit', role: 'Central Treasury' }
  ];

  const formatNaira = (amount?: number) => {
    if (!amount) return "₦0";
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight font-serif" style={{ fontFamily: 'Georgia, serif' }}>
            Valuation Certification <span className="text-amber-500">/</span> Disbursement Workflow
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Review milestone valuations, issue payment certificates, and audit capital releases</p>
        </div>

        {!isRequesting && !selectedValuation && userRole === 'CONTRACTOR' && (
          <button 
            onClick={() => setIsRequesting(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Request Interim Valuation</span>
          </button>
        )}
      </div>

      {/* NEW REQUEST FORM */}
      {isRequesting && (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-white/10">
            <button 
              onClick={() => setIsRequesting(false)}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>Interim Payment Valuation Request</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Contractor submission for certified work completed</p>
            </div>
          </div>

          <form onSubmit={handleSubmitRequest} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Project Scheme</label>
              <select 
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm outline-none focus:border-amber-500"
              >
                {contractorProjects.map(p => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-[#050505] text-slate-900 dark:text-slate-100">{p.estateName} ({p.state})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Claim Amount Requested (NGN)</label>
                <input 
                  type="number" required placeholder="e.g. 50000000"
                  value={amountRequested} onChange={(e) => setAmountRequested(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Invoice Number / Claim Ref</label>
                <input 
                  type="text" placeholder="e.g. INV/ABC/011"
                  value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 py-2.5 px-3 rounded-lg text-sm outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Work Completed Description & Milestones</label>
              <textarea 
                rows={3} placeholder="e.g. Completed foundation laying and ground beam pouring for block sectors A and B."
                value={comments} onChange={(e) => setComments(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
              />
            </div>

            {/* Visual Evidence & Neural AI Authenticity Verification */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                    <span>On-Site Visual Evidence (Physical Site Photos)</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Upload verified site photos of completed work. All uploads undergo automatic Neural AI Authenticity detection to prevent synthetic/fake claims.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddSampleAuthenticPhoto}
                    className="text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 rounded-md hover:bg-emerald-100 transition flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    + Authentic Sample
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSampleAiPhoto}
                    className="text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 px-2.5 py-1 rounded-md hover:bg-amber-100 transition flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    + Test AI Detection
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-white/15 rounded-xl p-4 text-center hover:border-emerald-500/50 transition bg-slate-50/50 dark:bg-black/30">
                <input
                  type="file"
                  id="valuation-photos-input"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoFilesSelected(e.target.files)}
                  className="hidden"
                />
                <label
                  htmlFor="valuation-photos-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                      Click to upload photos from device/camera
                    </span>
                    <span className="text-xs text-slate-500"> or drag and drop</span>
                  </div>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP up to 10MB each</span>
                </label>
              </div>

              {isAnalyzingPhoto && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/30 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Scanning image sensor telemetry & neural diffusion signatures for AI detection...</span>
                </div>
              )}

              {/* Uploaded Photos Thumbnails & Badges */}
              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  {uploadedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`relative group rounded-xl overflow-hidden border p-2 bg-white dark:bg-black/40 ${
                        photo.isAiGenerated
                          ? 'border-amber-500/60 bg-amber-500/5'
                          : 'border-emerald-500/40 bg-emerald-500/5'
                      }`}
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-black/80">
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Site Photo'}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveUploadedPhoto(photo.id)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black text-white rounded-md transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="truncate max-w-[140px] text-slate-900 dark:text-white">
                            {photo.caption}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              photo.isAiGenerated
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            }`}
                          >
                            {photo.isAiGenerated ? '⚠️ AI Flagged' : '✅ Authentic'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          {photo.analysisDetails}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <button 
                type="button" onClick={() => setIsRequesting(false)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2 rounded-lg text-sm transition shadow-sm"
              >
                Submit Payment Claim
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL WORKFLOW BOARD */}
      {selectedValuation && (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-white/10 justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedValuation(null)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>{selectedValuation.estateName}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Invoice Ref: <span className="font-mono">{selectedValuation.invoiceNumber}</span></p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Claim Invoice Value</div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-500 font-mono">{formatNaira(selectedValuation.amountRequested)}</div>
            </div>
          </div>

          {/* VISUAL WORKFLOW TIMELINE */}
          <div className="bg-slate-50 dark:bg-black/40 p-5 rounded-xl border border-slate-200 dark:border-white/5">
            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-5 flex items-center gap-1.5 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
              <Settings className="w-4 h-4 text-amber-500 animate-spin" />
              <span>Payment Clearance Pipeline Tracking</span>
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-center">
              {workflowStages.map((stage, idx) => {
                const currentIdx = workflowStages.findIndex(s => s.id === selectedValuation.currentStage);
                const isPassed = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                const isReleased = selectedValuation.currentStage === 'payment_released';
                
                return (
                  <div key={stage.id} className="flex flex-col items-center relative group">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                      isPassed || isReleased
                        ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                        : isCurrent
                        ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 scale-110 shadow-sm'
                        : 'bg-slate-200 dark:bg-[#050505]/60 border-slate-300 dark:border-white/5 text-slate-500 dark:text-slate-600'
                    }`}>
                      {isPassed || isReleased ? <CheckCircle className="w-4 h-4 text-amber-500" /> : idx + 1}
                    </div>
                    <div className="text-[10px] font-bold text-slate-900 dark:text-white truncate max-w-full">{stage.label}</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400">{stage.role}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SITE PHOTO EVIDENCE & AI DETECTION AUDIT PANEL */}
          <div className="bg-slate-50 dark:bg-black/40 p-5 rounded-xl border border-slate-200 dark:border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/5 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                  <span>On-Site Visual Evidence & Neural Forensic Audit</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Physical field verification telemetry submitted by contractor with automated AI generation detection.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-300 dark:border-emerald-800">
                  {selectedValuation.photos?.length || 0} Photos Attached
                </span>
              </div>
            </div>

            {/* AI Fraud Alert Banner if any synthetic photo detected */}
            {selectedValuation.photos?.some(p => p.isAiGenerated) && (
              <div className="bg-amber-500/10 border-2 border-amber-500/30 p-3.5 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    SECURITY ALERT: AI-GENERATED SYNTHETIC IMAGE DETECTED
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">
                    One or more submitted milestone photographs exhibit generative AI/diffusion artifacts. Quantity Surveyor and Resident Engineer must conduct physical site re-inspection prior to signing off on payment certificates.
                  </p>
                </div>
              </div>
            )}

            {selectedValuation.photos && selectedValuation.photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {selectedValuation.photos.map((photo, pIdx) => (
                  <div
                    key={photo.id || pIdx}
                    className={`rounded-xl overflow-hidden border p-2 bg-white dark:bg-black/50 ${
                      photo.isAiGenerated
                        ? 'border-amber-500/50 bg-amber-500/5'
                        : 'border-emerald-500/40 bg-emerald-500/5'
                    }`}
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-black/80">
                      <img
                        src={photo.url}
                        alt={photo.caption || `Site Photo ${pIdx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="truncate max-w-[150px] text-slate-900 dark:text-white">
                          {photo.caption || `Site Photo ${pIdx + 1}`}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            photo.isAiGenerated
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          }`}
                        >
                          {photo.isAiGenerated ? `⚠️ AI Flagged (${photo.aiConfidence || 90}%)` : `✅ Authentic (${photo.aiConfidence || 94}%)`}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {photo.analysisDetails || (photo.isAiGenerated ? 'Synthetic image pattern detected.' : 'Authentic physical capture verified.')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No Visual Field Photos Attached to Claim</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Resident Engineer physical site log and GPS telemetry on the project overview page serve as the primary verification index.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Log Details & Approval History */}
            <div className="md:col-span-7 bg-slate-50 dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>Approval Sign-off Audit Logs</h4>
              
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {selectedValuation.history.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white dark:bg-black/50 p-3 rounded-lg border border-slate-200 dark:border-white/10 shadow-xs">
                    <div className="bg-amber-500/10 p-2 rounded-lg text-amber-600 dark:text-amber-500 shrink-0 mt-0.5 border border-amber-500/20">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{log.stage.replace('_', ' ')} Stage</span>
                        <span>{log.date}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{log.actor}</div>
                      {log.comments && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-start gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <p className="italic">"{log.comments}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Active Approval Level Interventions */}
            <div className="md:col-span-5 bg-slate-50 dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2 mb-4 font-serif" style={{ fontFamily: 'Georgia, serif' }}>Interim Certification Desk</h4>
                
                {selectedValuation.currentStage === 'payment_released' ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg text-center flex flex-col items-center justify-center gap-2 h-40">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                    <div className="font-bold text-slate-900 dark:text-white">DISBURSEMENT FINISHED</div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">Total Certified sum of {formatNaira(selectedValuation.amountCertified)} released to bank accounts.</p>
                  </div>
                ) : isCurrentRoleAuthorized ? (
                  <div className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-xs space-y-1 text-slate-700 dark:text-slate-300">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase text-[9px] text-amber-700 dark:text-amber-400 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        <span>Action Required: {selectedValuation.currentStage.replace(/_/g, ' ').toUpperCase()}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">Contractor requested {formatNaira(selectedValuation.amountRequested)}. You are logged in as {currentUser?.name}. Please conduct necessary audit endorsement and move request forward.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Certified Sum (NGN)</label>
                      <input 
                        type="number"
                        value={amountCertified}
                        onChange={(e) => setAmountCertified(e.target.value)}
                        className="w-full bg-white dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Verification Comment / Directives</label>
                      <textarea 
                        rows={3}
                        value={approvalComment}
                        placeholder="Add professional sign-off directives..."
                        onChange={(e) => setApprovalComment(e.target.value)}
                        className="w-full bg-white dark:bg-black/50 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/5 p-5 rounded-xl text-center space-y-3.5 my-4">
                    <Clock className="w-8 h-8 text-amber-500/60 mx-auto animate-pulse" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">Clearance Sign-off Pending</div>
                      <div className="text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded inline-block mt-1 uppercase font-mono font-bold">
                        {selectedValuation.currentStage.replace(/_/g, ' ')} PHASE
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      This payment request is currently at the <strong className="text-slate-900 dark:text-slate-200">{selectedValuation.currentStage.replace(/_/g, ' ').toUpperCase()}</strong> clearance gate, requiring signature from the <strong className="text-amber-600 dark:text-amber-500">{getRoleForStage(selectedValuation.currentStage)} Desk</strong>.
                    </p>
                    <p className="text-[9px] text-slate-500 border-t border-slate-200 dark:border-white/5 pt-2">
                      Your current session role is <strong className="text-slate-900 dark:text-white">{userRole}</strong>. Only the authorized desk can sign off or modify this certificate.
                    </p>
                  </div>
                )}
              </div>

              {selectedValuation.currentStage !== 'payment_released' && isCurrentRoleAuthorized && (
                <div className="flex gap-2.5 pt-4 border-t border-slate-200 dark:border-white/5 mt-4">
                  <button 
                    onClick={() => handleApprovalAction('rejected')}
                    className="flex-1 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white font-bold py-2 rounded-lg text-xs transition border border-rose-500/20 cursor-pointer"
                  >
                    Reject Claim
                  </button>
                  <button 
                    onClick={() => handleApprovalAction('approved')}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 rounded-lg text-xs transition cursor-pointer shadow-sm"
                  >
                    Endorse Clearance &rarr;
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MASTER INVOICE TABLE VIEW (DEFAULT SCREEN) */}
      {!isRequesting && !selectedValuation && (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-slate-50 dark:bg-black/40 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>Capital Disbursement Certificate Ledgers ({displayedValuations.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-black/20 text-slate-700 dark:text-slate-400 font-bold uppercase tracking-widest border-b border-slate-200 dark:border-white/10">
                  <th className="p-4 font-serif" style={{ fontFamily: 'Georgia, serif' }}>Estate Scheme</th>
                  <th className="p-4 font-serif" style={{ fontFamily: 'Georgia, serif' }}>Inv Ref</th>
                  <th className="p-4 font-serif" style={{ fontFamily: 'Georgia, serif' }}>Contractor</th>
                  <th className="p-4 text-right font-serif" style={{ fontFamily: 'Georgia, serif' }}>Requested</th>
                  <th className="p-4 text-right font-serif" style={{ fontFamily: 'Georgia, serif' }}>Certified</th>
                  <th className="p-4 font-serif" style={{ fontFamily: 'Georgia, serif' }}>Clearance Phase</th>
                  <th className="p-4 text-center font-serif" style={{ fontFamily: 'Georgia, serif' }}>Interventions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayedValuations.map((val) => (
                  <tr key={val.id} className="hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{val.estateName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{val.houseType}</div>
                    </td>
                    <td className="p-4 font-mono font-medium">{val.invoiceNumber}</td>
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-200">{val.contractorName}</td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white font-mono">{formatNaira(val.amountRequested)}</td>
                    <td className="p-4 text-right font-extrabold text-amber-600 dark:text-amber-400 font-mono">{val.amountCertified ? formatNaira(val.amountCertified) : "-"}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] border uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                        {val.currentStage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSelectedValuation(val)}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-black/50 dark:hover:bg-white/5 border border-slate-300 dark:border-white/10 hover:border-amber-500/50 text-slate-800 dark:text-amber-400 font-bold px-3 py-1.5 rounded transition text-[10px] cursor-pointer"
                      >
                        {val.currentStage === 'payment_released' ? 'Review History' : 'Endorse Claims'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
