import React, { useState } from 'react';
import { Contractor } from '../types';
import { 
  Building, 
  FileText, 
  UserCheck, 
  Plus, 
  Briefcase, 
  FileCheck, 
  DollarSign, 
  AlertCircle, 
  FolderOpen,
  ArrowLeft,
  X,
  Phone,
  Mail,
  ShieldAlert
} from 'lucide-react';

interface OnboardingViewProps {
  contractors: Contractor[];
  onOnboardContractor: (contractorData: any) => Promise<void>;
  onApproveContractor: (contractorId: string) => Promise<void>;
}

export default function OnboardingView({
  contractors,
  onOnboardContractor,
  onApproveContractor
}: OnboardingViewProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);

  // Form states for new application
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [taxId, setTaxId] = useState('');
  const [contractAmount, setContractAmount] = useState('');
  const [durationMonths, setDurationMonths] = useState('12');
  const [bankName, setBankName] = useState('Zenith Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [performanceBondExpiry, setPerformanceBondExpiry] = useState('');

  // Pre-filled document upload names (simulation)
  const [registrationDoc, setRegistrationDoc] = useState('');
  const [taxDoc, setTaxDoc] = useState('');
  const [awardDoc, setAwardDoc] = useState('');
  const [drawingsDoc, setDrawingsDoc] = useState('');
  const [bondDoc, setBondDoc] = useState('');

  const handleSimulateAttach = (docType: string) => {
    const filename = `fha_onboard_doc_${Math.floor(1000 + Math.random() * 9000)}_${docType}.pdf`;
    switch (docType) {
      case 'reg': setRegistrationDoc(filename); break;
      case 'tax': setTaxDoc(filename); break;
      case 'award': setAwardDoc(filename); break;
      case 'drawings': setDrawingsDoc(filename); break;
      case 'bond': setBondDoc(filename); break;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !registrationNo || !taxId || !contractAmount || !accountNumber) {
      alert("Please fill in all mandatory profile, tax, and banking details.");
      return;
    }

    await onOnboardContractor({
      companyName,
      email,
      phone,
      address,
      registrationNo,
      taxId,
      contractAmount: Number(contractAmount),
      durationMonths: Number(durationMonths),
      bankName,
      accountNumber,
      insuranceExpiry,
      performanceBondExpiry,
      documents: {
        registration: registrationDoc || "onboard_registration_verified.pdf",
        taxCertificate: taxDoc || "tax_clearance_ceritificate.pdf",
        awardLetter: awardDoc || "official_fha_award_letter.pdf",
        drawings: drawingsDoc || "tender_boq_and_drawings.pdf",
        performanceBond: bondDoc || "performance_security_guarantee.pdf"
      }
    });

    // Reset Form
    setCompanyName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setRegistrationNo('');
    setTaxId('');
    setContractAmount('');
    setAccountNumber('');
    setRegistrationDoc('');
    setTaxDoc('');
    setAwardDoc('');
    setDrawingsDoc('');
    setBondDoc('');
    
    setIsApplying(false);
    alert("Contractor onboarding application submitted successfully and queued for executive review.");
  };

  const handleApprove = async (id: string) => {
    if (window.confirm("Approve this contractor onboarding profile? Once approved, they can be assigned projects, receive valuations, and submit site updates.")) {
      await onApproveContractor(id);
      setSelectedContractor(null);
      alert("Contractor onboarding fully approved and activated.");
    }
  };

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium text-white tracking-tight font-serif" style={{ fontFamily: 'Georgia, serif' }}>
            Contractor Onboarding <span className="text-amber-500">/</span> Verification Portal
          </h2>
          <p className="text-slate-400 text-sm">Register company profiles, audit compliance paperwork, and activate vendor accounts</p>
        </div>
        
        {!isApplying && !selectedContractor && (
          <button 
            onClick={() => setIsApplying(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Submit Onboarding Tender</span>
          </button>
        )}
      </div>

      {/* NEW REGISTRATION FORM (Module 1) */}
      {isApplying && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
            <button 
              onClick={() => setIsApplying(false)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-lg font-medium text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>Contractor Profile & Tender Registration</h3>
              <p className="text-slate-400 text-xs">Register firm particulars, financial details, bank accounts, and compliance bonds</p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Section 1: Company Profile */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>1. Company Profile Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Company Legal Name *</label>
                  <input 
                    type="text" required placeholder="e.g. Amina Infrastructure Corp"
                    value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-black/50 text-slate-100 border border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Corporate Email Address *</label>
                  <input 
                    type="email" required placeholder="e.g. contact@company.ng"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 text-slate-100 border border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Telephone Contact *</label>
                  <input 
                    type="text" required placeholder="e.g. +234 803 123 4567"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/50 text-slate-100 border border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registered Business Office Address *</label>
                  <input 
                    type="text" required placeholder="e.g. 24 Maitama Way, Abuja"
                    value={address} onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-black/50 text-slate-100 border border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Registration & Taxes */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>2. Legal Status & Taxation Compliance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Corporate Affairs Comm. Number (CAC RC) *</label>
                  <input 
                    type="text" required placeholder="e.g. RC-998877"
                    value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value)}
                    className="w-full bg-black/50 text-slate-100 border border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Federal Inland Revenue Tax ID (TIN) *</label>
                  <input 
                    type="text" required placeholder="e.g. TIN-2233445"
                    value={taxId} onChange={(e) => setTaxId(e.target.value)}
                    className="w-full bg-black/50 text-slate-100 border border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Financial & Bank Details */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>3. Contract Pricing & Bank Remittance</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Proposed Contract Award Sum (NGN) *</label>
                  <input 
                    type="number" required placeholder="e.g. 850000000"
                    value={contractAmount} onChange={(e) => setContractAmount(e.target.value)}
                    className="w-full bg-black/50 text-slate-100 border border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Project Standard Duration (Months)</label>
                  <input 
                    type="number" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)}
                    className="w-full bg-black/50 text-slate-100 border border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Remittance Bank Name *</label>
                  <select 
                    value={bankName} onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-black/50 text-slate-100 border border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  >
                    <option value="Zenith Bank" className="bg-[#050505]">Zenith Bank</option>
                    <option value="Access Bank" className="bg-[#050505]">Access Bank</option>
                    <option value="Guaranty Trust Bank (GTBank)" className="bg-[#050505]">Guaranty Trust Bank (GTBank)</option>
                    <option value="First Bank of Nigeria" className="bg-[#050505]">First Bank of Nigeria</option>
                    <option value="United Bank for Africa (UBA)" className="bg-[#050505]">United Bank for Africa (UBA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Remittance Account Number (10 digits) *</label>
                  <input 
                    type="text" required maxLength={10} placeholder="e.g. 1012345678"
                    value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-black/50 text-slate-100 border border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CAR Liability Insurance Expiry Date</label>
                  <input 
                    type="date" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)}
                    className="w-full bg-black/50 text-slate-100 border border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Performance Bond Expiry Date</label>
                  <input 
                    type="date" value={performanceBondExpiry} onChange={(e) => setPerformanceBondExpiry(e.target.value)}
                    className="w-full bg-black/50 text-slate-100 border border-white/10 py-2 px-3 rounded-lg text-xs outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Document Upload Simulations */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                <FileCheck className="w-4 h-4 text-amber-500" />
                <span>4. Mandatory Tender & Security Documents</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                {/* 1. CAC Cert */}
                <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-white/10">
                  <div>
                    <div className="font-bold text-slate-300">CAC Registration Certificate</div>
                    <div className="text-[10px] text-slate-500">{registrationDoc ? registrationDoc : "Not attached &bull; (Required)"}</div>
                  </div>
                  <button 
                    type="button" onClick={() => handleSimulateAttach('reg')}
                    className="bg-white/5 border border-white/10 hover:border-amber-500/30 hover:text-white text-amber-500 font-semibold px-2.5 py-1.5 rounded transition"
                  >
                    Simulate Attach
                  </button>
                </div>

                {/* 2. Tax Clearance */}
                <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-white/10">
                  <div>
                    <div className="font-bold text-slate-300">FIRS Tax Clearance Certificate</div>
                    <div className="text-[10px] text-slate-500">{taxDoc ? taxDoc : "Not attached &bull; (Required)"}</div>
                  </div>
                  <button 
                    type="button" onClick={() => handleSimulateAttach('tax')}
                    className="bg-white/5 border border-white/10 hover:border-amber-500/30 hover:text-white text-amber-500 font-semibold px-2.5 py-1.5 rounded transition"
                  >
                    Simulate Attach
                  </button>
                </div>

                {/* 3. Award Letter */}
                <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-white/10">
                  <div>
                    <div className="font-bold text-slate-300">FHA Award Letter of Contract</div>
                    <div className="text-[10px] text-slate-500">{awardDoc ? awardDoc : "Not attached &bull; (Required)"}</div>
                  </div>
                  <button 
                    type="button" onClick={() => handleSimulateAttach('award')}
                    className="bg-white/5 border border-white/10 hover:border-amber-500/30 hover:text-white text-amber-500 font-semibold px-2.5 py-1.5 rounded transition"
                  >
                    Simulate Attach
                  </button>
                </div>

                {/* 4. BOQ & Drawings */}
                <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-white/10">
                  <div>
                    <div className="font-bold text-slate-300">Approved Drawings & Priced BOQ</div>
                    <div className="text-[10px] text-slate-500">{drawingsDoc ? drawingsDoc : "Not attached &bull; (Required)"}</div>
                  </div>
                  <button 
                    type="button" onClick={() => handleSimulateAttach('drawings')}
                    className="bg-white/5 border border-white/10 hover:border-amber-500/30 hover:text-white text-amber-500 font-semibold px-2.5 py-1.5 rounded transition"
                  >
                    Simulate Attach
                  </button>
                </div>

                {/* 5. Performance Bond */}
                <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-white/10 md:col-span-2">
                  <div>
                    <div className="font-bold text-slate-300">Bank Performance Guarantee Security Bond</div>
                    <div className="text-[10px] text-slate-500">{bondDoc ? bondDoc : "Not attached &bull; (Highly Recommended)"}</div>
                  </div>
                  <button 
                    type="button" onClick={() => handleSimulateAttach('bond')}
                    className="bg-white/5 border border-white/10 hover:border-amber-500/30 hover:text-white text-amber-500 font-semibold px-2.5 py-1.5 rounded transition"
                  >
                    Simulate Attach
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button 
                type="button"
                onClick={() => setIsApplying(false)}
                className="text-slate-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2 rounded-lg text-sm transition"
              >
                Submit Onboarding Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL DRAWER SCREEN (FOR ADMIMS REVIEW) */}
      {selectedContractor && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedContractor(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-lg font-medium text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>{selectedContractor.companyName}</h3>
                <p className="text-slate-400 text-xs">CAC Verification: {selectedContractor.registrationNo}</p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-500/10 text-amber-500 border-amber-500/20">
              Onboarding Status: {selectedContractor.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            
            {/* Left Particulars Column */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-white/5 pb-1.5 mb-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>Corporate Particulars</h4>
              
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Phone Contact</div>
                  <div className="text-slate-300 font-medium">{selectedContractor.phone}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Corporate Email</div>
                  <div className="text-slate-300 font-medium">{selectedContractor.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Registered Address</div>
                  <div className="text-slate-300 font-medium">{selectedContractor.address}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tax ID (FIRS TIN)</div>
                  <div className="text-slate-300 font-semibold font-mono">{selectedContractor.taxId}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Onboarded Date</div>
                  <div className="text-slate-300 font-semibold">{selectedContractor.onboardedDate}</div>
                </div>
              </div>
            </div>

            {/* Right Financial & Documents Column */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest border-b border-white/5 pb-1.5 mb-2 font-serif" style={{ fontFamily: 'Georgia, serif' }}>Financials & Securities</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Contract Valuation Amount</div>
                  <div className="text-amber-500 font-bold text-base mt-0.5">{formatNaira(selectedContractor.contractAmount)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Delivery Timeline</div>
                  <div className="text-white font-bold text-base mt-0.5">{selectedContractor.durationMonths} Months</div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 space-y-2">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mandatory Credentials Verification</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 bg-black/50 p-2 rounded border border-white/10"><FileCheck className="w-4 h-4 text-amber-500 shrink-0" /><span className="truncate text-[11px] text-slate-300">{selectedContractor.documents.registration}</span></div>
                  <div className="flex items-center gap-2 bg-black/50 p-2 rounded border border-white/10"><FileCheck className="w-4 h-4 text-amber-500 shrink-0" /><span className="truncate text-[11px] text-slate-300">{selectedContractor.documents.taxCertificate}</span></div>
                  <div className="flex items-center gap-2 bg-black/50 p-2 rounded border border-white/10"><FileCheck className="w-4 h-4 text-amber-500 shrink-0" /><span className="truncate text-[11px] text-slate-300">{selectedContractor.documents.awardLetter}</span></div>
                  <div className="flex items-center gap-2 bg-black/50 p-2 rounded border border-white/10"><FileCheck className="w-4 h-4 text-amber-500 shrink-0" /><span className="truncate text-[11px] text-slate-300">{selectedContractor.documents.drawings}</span></div>
                  <div className="flex items-center gap-2 bg-black/50 p-2 rounded border border-white/10 md:col-span-2"><FileCheck className="w-4 h-4 text-amber-500 shrink-0" /><span className="truncate text-[11px] text-slate-300">{selectedContractor.documents.performanceBond}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button 
              onClick={() => setSelectedContractor(null)}
              className="text-slate-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg text-sm transition"
            >
              Close
            </button>
            {selectedContractor.status === 'pending' && (
              <button 
                onClick={() => handleApprove(selectedContractor.id)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-lg text-sm transition"
              >
                Approve Contractor Credentials
              </button>
            )}
          </div>
        </div>
      )}

      {/* CONTRACTOR LIST VIEW (DEFAULT SCREEN) */}
      {!isApplying && !selectedContractor && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white font-serif" style={{ fontFamily: 'Georgia, serif' }}>Registered Vendors Database ({contractors.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-black/20 text-slate-400 font-bold uppercase tracking-widest border-b border-white/10">
                  <th className="p-4 font-serif" style={{ fontFamily: 'Georgia, serif' }}>Firm / Company Particulars</th>
                  <th className="p-4 font-serif" style={{ fontFamily: 'Georgia, serif' }}>CAC RC No</th>
                  <th className="p-4 font-serif" style={{ fontFamily: 'Georgia, serif' }}>Tax ID TIN</th>
                  <th className="p-4 text-right font-serif" style={{ fontFamily: 'Georgia, serif' }}>Award Value</th>
                  <th className="p-4 font-serif" style={{ fontFamily: 'Georgia, serif' }}>Onboarding Status</th>
                  <th className="p-4 text-center font-serif" style={{ fontFamily: 'Georgia, serif' }}>Interventions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contractors.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 text-slate-300 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{c.companyName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{c.email} &bull; {c.phone}</div>
                    </td>
                    <td className="p-4 font-mono">{c.registrationNo}</td>
                    <td className="p-4 font-mono">{c.taxId}</td>
                    <td className="p-4 text-right font-bold text-white">{formatNaira(c.contractAmount)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] border bg-amber-500/10 text-amber-500 border-amber-500/20">
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSelectedContractor(c)}
                        className="bg-black/50 hover:bg-white/5 border border-white/10 hover:border-amber-500/30 text-amber-500 font-bold px-3 py-1.5 rounded transition text-[10px]"
                      >
                        {c.status === 'pending' ? 'Review & Approve' : 'Audit Credentials'}
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
