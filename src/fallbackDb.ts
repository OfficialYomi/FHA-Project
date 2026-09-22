import { 
  User, 
  Contractor, 
  Project, 
  ValuationRequest, 
  ContractorScorecard, 
  RiskAlert 
} from './types';

// Check if we are running in a browser environment
const isBrowser = typeof window !== 'undefined';

const INITIAL_USERS: User[] = [
  { name: "Hon. Oyetunde Oladimeji Ojo (MD)", username: "MD", role: "MD", email: "O.Ojo@fha.gov.ng" },
  { name: "Ahmed Abdul (PM)", username: "PM", role: "PM", email: "a.abdul@fha.gov.ng" },
  { name: "Surv. Chukwuemeka Okafor (QS)", username: "QS", role: "QS", email: "c.okafor@fha.gov.ng" },
  { name: "Adebisi Olamide (RE)", username: "RE", role: "RE", email: "a.olamide@fha.gov.ng" },
  { name: "Mr. Aliyu Ibrahim (Finance Dir)", username: "FD", role: "FD", email: "aliyu.ibrahim@fha.gov.ng" },
  { name: "Mrs. Ngozi Ezenwa (Treasury Head)", username: "CT", role: "CT", email: "ngozi.ezenwa@fha.gov.ng" },
  { name: "ABC Contractor Representative", username: "CONTRACTOR", role: "CONTRACTOR", contractorId: "c-1", email: "contact@abcconstruction.ng" }
];

const INITIAL_CONTRACTORS: Contractor[] = [
  {
    id: "c-1",
    companyName: "ABC Construction Ltd",
    email: "contact@abcconstruction.ng",
    phone: "+234 803 111 2222",
    address: "12 Yakubu Gowon Way, Kaduna",
    registrationNo: "RC-847291",
    taxId: "TIN-9938271",
    status: "approved",
    onboardedDate: "2026-01-15",
    documents: {
      registration: "registration_abc.pdf",
      taxCertificate: "tax_cert_abc.pdf",
      awardLetter: "award_letter_abc.pdf",
      drawings: "drawings_abc.dwg",
      performanceBond: "perf_bond_abc.pdf"
    },
    contractAmount: 750000000,
    durationMonths: 12,
    bankName: "Access Bank",
    accountNumber: "0012345678",
    insuranceExpiry: "2027-01-14",
    performanceBondExpiry: "2026-12-31",
    assignedProjectsCount: 1
  },
  {
    id: "c-2",
    companyName: "Dantata & Sawoe",
    email: "projects@dantata-sawoe.com",
    phone: "+234 805 333 4444",
    address: "7 Alfred Rewane Road, Ikoyi, Lagos",
    registrationNo: "RC-003849",
    taxId: "TIN-4482910",
    status: "approved",
    onboardedDate: "2025-10-10",
    documents: {
      registration: "reg_dantata.pdf",
      taxCertificate: "tax_dantata.pdf",
      awardLetter: "award_dantata.pdf",
      drawings: "drawings_dantata.pdf",
      performanceBond: "bond_dantata.pdf"
    },
    contractAmount: 1800000000,
    durationMonths: 18,
    bankName: "Zenith Bank",
    accountNumber: "1012345678",
    insuranceExpiry: "2027-04-30",
    performanceBondExpiry: "2027-06-30",
    assignedProjectsCount: 1
  },
  {
    id: "c-3",
    companyName: "Cappa & D'Alberto PLC",
    email: "info@cappadalberto.com",
    phone: "+234 812 555 6666",
    address: "72 Campbell Street, Lagos Island",
    registrationNo: "RC-000142",
    taxId: "TIN-1122334",
    status: "approved",
    onboardedDate: "2025-05-12",
    documents: {
      registration: "reg_cappa.pdf",
      taxCertificate: "tax_cappa.pdf",
      awardLetter: "award_cappa.pdf",
      drawings: "drawings_cappa.pdf",
      performanceBond: "bond_cappa.pdf"
    },
    contractAmount: 1200000000,
    durationMonths: 10,
    bankName: "Guaranty Trust Bank (GTB)",
    accountNumber: "0119876543",
    insuranceExpiry: "2026-05-11",
    performanceBondExpiry: "2026-06-30",
    assignedProjectsCount: 1
  },
  {
    id: "c-4",
    companyName: "Nze Construction Ltd",
    email: "info@nzeconstruction.com",
    phone: "+234 809 777 8888",
    address: "44 Aba Road, Port Harcourt",
    registrationNo: "RC-552918",
    taxId: "TIN-7749201",
    status: "approved",
    onboardedDate: "2025-11-20",
    documents: {
      registration: "reg_nze.pdf",
      taxCertificate: "tax_nze.pdf",
      awardLetter: "award_nze.pdf",
      drawings: "drawings_nze.pdf",
      performanceBond: "bond_nze.pdf"
    },
    contractAmount: 900000000,
    durationMonths: 14,
    bankName: "United Bank for Africa (UBA)",
    accountNumber: "2001122334",
    insuranceExpiry: "2026-11-19",
    performanceBondExpiry: "2027-01-15",
    assignedProjectsCount: 1
  },
  {
    id: "c-5",
    companyName: "Kano Builders Trust",
    email: "contact@kanobuilders.ng",
    phone: "+234 806 888 9999",
    address: "18 Zoo Road, Kano",
    registrationNo: "RC-384910",
    taxId: "TIN-5566778",
    status: "approved",
    onboardedDate: "2026-02-01",
    documents: {
      registration: "reg_kbt.pdf",
      taxCertificate: "tax_kbt.pdf",
      awardLetter: "award_kbt.pdf",
      drawings: "drawings_kbt.pdf",
      performanceBond: "bond_kbt.pdf"
    },
    contractAmount: 500000000,
    durationMonths: 8,
    bankName: "Fidelity Bank",
    accountNumber: "4012345678",
    insuranceExpiry: "2026-10-01",
    performanceBondExpiry: "2026-11-30",
    assignedProjectsCount: 1
  },
  {
    id: "c-6",
    companyName: "Amina Infrastructure Corp",
    email: "tender@aminainfra.ng",
    phone: "+234 703 444 5555",
    address: "24 Shehu Shagari Way, Maitama, Abuja",
    registrationNo: "RC-998877",
    taxId: "TIN-2233445",
    status: "pending",
    onboardedDate: "2026-07-10",
    documents: {
      registration: "reg_amina.pdf",
      taxCertificate: "tax_amina.pdf",
      awardLetter: "award_amina.pdf",
      drawings: "drawings_amina.pdf",
      performanceBond: "bond_amina.pdf"
    },
    contractAmount: 850000000,
    durationMonths: 12,
    bankName: "First Bank of Nigeria",
    accountNumber: "3012345678",
    insuranceExpiry: "2027-07-09",
    performanceBondExpiry: "2027-07-31",
    assignedProjectsCount: 0
  }
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: "p-1",
    state: "Kaduna",
    estateName: "Kada Hill Estate Phase 1",
    houseType: "3 Bedroom Bungalow",
    typologies: [
      { type: "3 Bedroom Bungalow", count: 100 },
      { type: "2 Bedroom Semi-Detached", count: 50 }
    ],
    contractorId: "c-1",
    contractorName: "ABC Construction Ltd",
    projectManager: "Engineer Musa",
    stages: {
      "Site clearing": true,
      "Setting out": true,
      "Excavation": true,
      "Foundation": true,
      "Ground beam": true,
      "Block work": false,
      "Lintel": false,
      "Roofing": false,
      "Electrical": false,
      "Plumbing": false,
      "Finishes": false,
      "External works": false,
      "Completed": false
    },
    progress: 38,
    status: "Needs Attention",
    startDate: "2026-02-01",
    targetCompletionDate: "2027-02-01",
    budget: 250000000,
    spent: 100000000,
    timelineExceededDays: 0,
    lastUpdated: "2026-07-05T14:30:00Z",
    houseCount: 150,
    assignmentStatus: "Accepted",
    photoUpdates: [
      {
        stage: "Foundation",
        beforePhoto: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=500&q=80",
        afterPhoto: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80",
        gps: { lat: 10.5105, lng: 7.4165, accuracy: 12, locationName: "Rigasa Sector B, Kaduna" },
        timestamp: "2026-04-10T11:00:00Z",
        uploadedBy: "Engineer Musa"
      },
      {
        stage: "Ground beam",
        beforePhoto: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80",
        afterPhoto: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=500&q=80",
        gps: { lat: 10.5106, lng: 7.4168, accuracy: 8, locationName: "Rigasa Sector B, Kaduna" },
        timestamp: "2026-07-05T14:20:00Z",
        uploadedBy: "Engineer Musa"
      }
    ]
  },
  {
    id: "p-2",
    state: "Abuja",
    estateName: "Gwarinpa Vista Heights",
    houseType: "4 Bedroom Detached Duplex",
    typologies: [
      { type: "4 Bedroom Detached Duplex", count: 50 },
      { type: "3 Bedroom Bungalow", count: 30 }
    ],
    contractorId: "c-2",
    contractorName: "Dantata & Sawoe",
    projectManager: "Engineer Bello",
    stages: {
      "Site clearing": true,
      "Setting out": true,
      "Excavation": true,
      "Foundation": true,
      "Ground beam": true,
      "Block work": true,
      "Lintel": true,
      "Roofing": true,
      "Electrical": false,
      "Plumbing": false,
      "Finishes": false,
      "External works": false,
      "Completed": false
    },
    progress: 62,
    status: "On Schedule",
    startDate: "2025-11-01",
    targetCompletionDate: "2027-05-01",
    budget: 600000000,
    spent: 380000000,
    timelineExceededDays: 0,
    lastUpdated: "2026-07-13T10:15:00Z",
    houseCount: 80,
    assignmentStatus: "Accepted",
    photoUpdates: [
      {
        stage: "Foundation",
        beforePhoto: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=500&q=80",
        afterPhoto: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80",
        gps: { lat: 9.0984, lng: 7.4116, accuracy: 5, locationName: "Gwarinpa Phase II, Abuja" },
        timestamp: "2025-12-15T09:30:00Z",
        uploadedBy: "Engineer Bello"
      },
      {
        stage: "Block work",
        beforePhoto: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=500&q=80",
        afterPhoto: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80",
        gps: { lat: 9.0985, lng: 7.4118, accuracy: 6, locationName: "Gwarinpa Phase II, Abuja" },
        timestamp: "2026-03-22T15:45:00Z",
        uploadedBy: "Engineer Bello"
      },
      {
        stage: "Roofing",
        beforePhoto: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80",
        afterPhoto: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=500&q=80",
        gps: { lat: 9.0983, lng: 7.4114, accuracy: 4, locationName: "Gwarinpa Phase II, Abuja" },
        timestamp: "2026-07-13T10:00:00Z",
        uploadedBy: "Engineer Bello"
      }
    ]
  },
  {
    id: "p-3",
    state: "Lagos",
    estateName: "Isheri Olofin Court",
    houseType: "2 Bedroom Semi-Detached",
    typologies: [
      { type: "2 Bedroom Semi-Detached", count: 80 },
      { type: "2 Bedroom Terrace Flat", count: 40 }
    ],
    contractorId: "c-3",
    contractorName: "Cappa & D'Alberto PLC",
    projectManager: "Engineer Adebayo",
    stages: {
      "Site clearing": true,
      "Setting out": true,
      "Excavation": true,
      "Foundation": true,
      "Ground beam": true,
      "Block work": true,
      "Lintel": true,
      "Roofing": true,
      "Electrical": true,
      "Plumbing": true,
      "Finishes": true,
      "External works": true,
      "Completed": true
    },
    progress: 100,
    status: "Completed",
    startDate: "2025-06-01",
    targetCompletionDate: "2026-04-01",
    actualCompletionDate: "2026-03-25",
    budget: 400000000,
    spent: 400000000,
    timelineExceededDays: 0,
    lastUpdated: "2026-03-25T11:00:00Z",
    houseCount: 120,
    assignmentStatus: "Accepted",
    photoUpdates: [
      {
        stage: "Roofing",
        beforePhoto: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80",
        afterPhoto: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=500&q=80",
        gps: { lat: 6.6112, lng: 3.3289, accuracy: 10, locationName: "Isheri Olofin, Lagos" },
        timestamp: "2025-11-20T10:00:00Z",
        uploadedBy: "Engineer Adebayo"
      },
      {
        stage: "Completed",
        beforePhoto: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=500&q=80",
        afterPhoto: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=500&q=80",
        gps: { lat: 6.6111, lng: 3.3288, accuracy: 5, locationName: "Isheri Olofin, Lagos" },
        timestamp: "2026-03-25T10:30:00Z",
        uploadedBy: "Engineer Adebayo"
      }
    ]
  },
  {
    id: "p-4",
    state: "Rivers",
    estateName: "Rumuokoro Royal Garden",
    houseType: "3 Bedroom Bungalow",
    typologies: [
      { type: "3 Bedroom Bungalow", count: 70 },
      { type: "2 Bedroom Semi-Detached", count: 30 }
    ],
    contractorId: "c-4",
    contractorName: "Nze Construction Ltd",
    projectManager: "Engineer Amaechi",
    stages: {
      "Site clearing": true,
      "Setting out": true,
      "Excavation": true,
      "Foundation": false,
      "Ground beam": false,
      "Block work": false,
      "Lintel": false,
      "Roofing": false,
      "Electrical": false,
      "Plumbing": false,
      "Finishes": false,
      "External works": false,
      "Completed": false
    },
    progress: 23,
    status: "Delayed",
    startDate: "2025-12-01",
    targetCompletionDate: "2026-06-01",
    budget: 300000000,
    spent: 135000000,
    timelineExceededDays: 43,
    lastUpdated: "2026-06-02T16:00:00Z",
    houseCount: 100,
    assignmentStatus: "Accepted",
    photoUpdates: [
      {
        stage: "Excavation",
        beforePhoto: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=500&q=80",
        afterPhoto: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80",
        gps: { lat: 4.8697, lng: 6.9935, accuracy: 15, locationName: "Rumuokoro Bypass, Port Harcourt" },
        timestamp: "2026-01-20T14:00:00Z",
        uploadedBy: "Engineer Amaechi"
      }
    ]
  },
  {
    id: "p-5",
    state: "Kano",
    estateName: "Dala Hill Court",
    houseType: "3 Bedroom Bungalow",
    typologies: [
      { type: "3 Bedroom Bungalow", count: 40 },
      { type: "2 Bedroom Terrace Flat", count: 20 }
    ],
    contractorId: "c-5",
    contractorName: "Kano Builders Trust",
    projectManager: "Engineer Ibrahim",
    stages: {
      "Site clearing": true,
      "Setting out": true,
      "Excavation": true,
      "Foundation": true,
      "Ground beam": false,
      "Block work": false,
      "Lintel": false,
      "Roofing": false,
      "Electrical": false,
      "Plumbing": false,
      "Finishes": false,
      "External works": false,
      "Completed": false
    },
    progress: 31,
    status: "On Schedule",
    startDate: "2026-03-01",
    targetCompletionDate: "2026-11-01",
    budget: 200000000,
    spent: 65000000,
    timelineExceededDays: 0,
    lastUpdated: "2026-07-11T09:00:00Z",
    houseCount: 60,
    assignmentStatus: "Accepted",
    photoUpdates: [
      {
        stage: "Foundation",
        beforePhoto: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=500&q=80",
        afterPhoto: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80",
        gps: { lat: 11.9964, lng: 8.5167, accuracy: 9, locationName: "Dala Sector C, Kano State" },
        timestamp: "2026-05-18T08:30:00Z",
        uploadedBy: "Engineer Ibrahim"
      }
    ]
  }
];

const INITIAL_VALUATIONS: ValuationRequest[] = [
  {
    id: "val-1",
    projectId: "p-2",
    estateName: "Gwarinpa Vista Heights",
    houseType: "4 Bedroom Detached Duplex",
    contractorName: "Dantata & Sawoe",
    amountRequested: 120000000,
    amountCertified: 120000000,
    currentStage: "quantity_surveyor_certify",
    dateCreated: "2026-07-01",
    invoiceNumber: "INV/DS/2026/045",
    certificateNumber: "VAL/CERT/GWAR/002",
    history: [
      { stage: "request_valuation", date: "2026-07-01", actor: "Dantata & Sawoe", status: "approved", comments: "Submitted progress evaluation request up to Roofing stage." },
      { stage: "resident_engineer_verify", date: "2026-07-03", actor: "Resident Engineer Adebisi", status: "approved", comments: "Verified on-site completion of roof trussing and sheeting. Works are structurally sound." },
      { stage: "project_manager_approve", date: "2026-07-05", actor: "PM Ahmed Abdul", status: "approved", comments: "Project schedule matches and milestones have been checked." }
    ]
  },
  {
    id: "val-2",
    projectId: "p-3",
    estateName: "Isheri Olofin Court",
    houseType: "2 Bedroom Semi-Detached",
    contractorName: "Cappa & D'Alberto PLC",
    amountRequested: 80000000,
    amountCertified: 80000000,
    currentStage: "payment_released",
    dateCreated: "2026-03-26",
    invoiceNumber: "INV/CD/LGS/110",
    certificateNumber: "VAL/CERT/ISH/005",
    history: [
      { stage: "request_valuation", date: "2026-03-26", actor: "Cappa & D'Alberto PLC", status: "approved", comments: "Final retention and completed project valuation claim." },
      { stage: "resident_engineer_verify", date: "2026-03-27", actor: "Resident Engineer Adebayo", status: "approved", comments: "Highly satisfied. Keys and punch-list items resolved." },
      { stage: "project_manager_approve", date: "2026-03-27", actor: "PM Adebayo", status: "approved" },
      { stage: "quantity_surveyor_certify", date: "2026-03-28", actor: "Lead QS Ibrahim", status: "approved", comments: "Certified final payment certificate." },
      { stage: "finance_review", date: "2026-03-29", actor: "Finance Dir Alao", status: "approved", comments: "Invoices verified and approved for payment processing." },
      { stage: "executive_approve", date: "2026-03-30", actor: "MD/CEO FHA", status: "approved", comments: "Approved for immediate release. Outstanding workmanship." },
      { stage: "payment_released", date: "2026-03-31", actor: "Treasury Desk", status: "approved", comments: "Payment remitted via CBN RTGS. Reference: RTGS-003849201." }
    ]
  },
  {
    id: "val-3",
    projectId: "p-1",
    estateName: "Kada Hill Estate Phase 1",
    houseType: "3 Bedroom Bungalow",
    contractorName: "ABC Construction Ltd",
    amountRequested: 45000000,
    currentStage: "request_valuation",
    dateCreated: "2026-07-10",
    invoiceNumber: "INV/ABC/KAD/009",
    history: [
      { stage: "request_valuation", date: "2026-07-10", actor: "ABC Construction Ltd", status: "pending", comments: "Request for foundation and ground beam completed valuation." }
    ]
  }
];

const INITIAL_SCORECARDS: ContractorScorecard[] = [
  {
    id: "sc-1",
    contractorId: "c-3",
    contractorName: "Cappa & D'Alberto PLC",
    projectName: "Isheri Olofin Court",
    scores: {
      quality: 5,
      timeliness: 5,
      safetyCompliance: 4,
      documentationQuality: 5,
      responsiveness: 5,
      defectsManagement: 5,
      variationManagement: 4
    },
    overallRating: 4.7,
    feedback: "Exceptional contractor performance. Delivered the 120-housing scheme within budget and ahead of the schedule by almost a week. Attention to finishing details is highly commendable.",
    reviewedBy: "Director Project Delivery, FHA",
    dateCreated: "2026-04-05"
  },
  {
    id: "sc-2",
    contractorId: "c-1",
    contractorName: "ABC Construction Ltd",
    projectName: "Rigasa Estate Past Phase",
    scores: {
      quality: 4,
      timeliness: 3,
      safetyCompliance: 4,
      documentationQuality: 3,
      responsiveness: 4,
      defectsManagement: 3,
      variationManagement: 3
    },
    overallRating: 3.4,
    feedback: "Decent workmanship but prone to administrative delays and sluggish documentation submission. Required continuous prompting during material schedules review.",
    reviewedBy: "Project Coordinator (Northern Zone)",
    dateCreated: "2025-11-12"
  }
];

const INITIAL_ALERTS: RiskAlert[] = [
  {
    id: "alt-1",
    projectId: "p-4",
    projectName: "Rumuokoro Royal Garden",
    state: "Rivers",
    title: "Critical Project Delay (43+ Days Overdue)",
    details: "Nze Construction Ltd has completed only 23% (excavation) of the scheduled 3-Bedroom Bungalow scheme. Target completion was 2026-06-01. Site activity is currently stagnant with no reporting in 42 days.",
    severity: "high",
    category: "timeline",
    dateCreated: "2026-06-15",
    resolved: false
  },
  {
    id: "alt-2",
    projectId: "p-1",
    projectName: "Kada Hill Estate Phase 1",
    state: "Kaduna",
    title: "No Weekly Update Received",
    details: "Kaduna site has had no photo updates or stage status updates in the last 9 days. Project is currently at Foundation stage with an active timeline risk.",
    severity: "medium",
    category: "activity",
    dateCreated: "2026-07-12",
    resolved: false
  },
  {
    id: "alt-3",
    projectId: "p-1",
    projectName: "Kada Hill Estate Phase 1",
    state: "Kaduna",
    title: "Performance Bond Nearing Expiry",
    details: "The performance bond provided by ABC Construction Ltd is scheduled to expire in 15 days. Prompt contract management action is required to avoid indemnity gap.",
    severity: "medium",
    category: "compliance",
    dateCreated: "2026-07-14",
    resolved: false
  },
  {
    id: "alt-4",
    projectId: "p-5",
    projectName: "Dala Hill Court",
    state: "Kano",
    title: "Safety Compliance Warning (Resolved)",
    details: "Minor dust control non-compliance flagged by state environmental PM. Contractor implemented protective water spraying, which has been verified by the resident engineer.",
    severity: "low",
    category: "compliance",
    dateCreated: "2026-06-20",
    resolved: true
  }
];

export interface StorageData {
  users: User[];
  contractors: Contractor[];
  projects: Project[];
  valuations: ValuationRequest[];
  scorecards: ContractorScorecard[];
  alerts: RiskAlert[];
}

function getStoredDb(): StorageData {
  if (!isBrowser) {
    return {
      users: INITIAL_USERS,
      contractors: INITIAL_CONTRACTORS,
      projects: INITIAL_PROJECTS,
      valuations: INITIAL_VALUATIONS,
      scorecards: INITIAL_SCORECARDS,
      alerts: INITIAL_ALERTS
    };
  }
  
  const saved = localStorage.getItem('nhdp_db');
  if (saved) {
    try {
      const parsed: StorageData = JSON.parse(saved);
      if (parsed.users && Array.isArray(parsed.users)) {
        let changed = false;
        parsed.users = parsed.users.map(u => {
          if (u.username === 'PM' && (!u.name.includes('Ahmed Abdul'))) {
            changed = true;
            return { ...u, name: "Ahmed Abdul (PM)", email: "a.abdul@fha.gov.ng" };
          }
          if (u.username === 'RE' && (!u.name.includes('Adebisi Olamide'))) {
            changed = true;
            return { ...u, name: "Adebisi Olamide (RE)", email: "a.olamide@fha.gov.ng" };
          }
          return u;
        });
        if (changed) {
          localStorage.setItem('nhdp_db', JSON.stringify(parsed));
        }
      }
      return parsed;
    } catch (e) {
      console.error("Error reading localized fallback DB, re-initializing", e);
    }
  }

  const defaultDb: StorageData = {
    users: INITIAL_USERS,
    contractors: INITIAL_CONTRACTORS,
    projects: INITIAL_PROJECTS,
    valuations: INITIAL_VALUATIONS,
    scorecards: INITIAL_SCORECARDS,
    alerts: INITIAL_ALERTS
  };
  localStorage.setItem('nhdp_db', JSON.stringify(defaultDb));
  return defaultDb;
}

function saveStoredDb(data: StorageData) {
  if (isBrowser) {
    localStorage.setItem('nhdp_db', JSON.stringify(data));
  }
}

export const fallbackDb = {
  getOverview: (): StorageData => {
    return getStoredDb();
  },

  getProjects: (): Project[] => {
    return getStoredDb().projects;
  },

  getValuations: (): ValuationRequest[] => {
    return getStoredDb().valuations;
  },

  getContractors: (): Contractor[] => {
    return getStoredDb().contractors;
  },

  getAlerts: (): RiskAlert[] => {
    return getStoredDb().alerts;
  },

  getScorecards: (): ContractorScorecard[] => {
    return getStoredDb().scorecards;
  },
  
  getUsers: (): User[] => {
    return getStoredDb().users;
  },

  createUser: (userData: any): User[] => {
    const db = getStoredDb();
    const newUser: User = {
      name: userData.name,
      username: userData.username,
      role: userData.role,
      email: userData.email,
      contractorId: userData.contractorId
    };
    db.users.push(newUser);
    saveStoredDb(db);
    return db.users;
  },

  deleteUser: (username: string): User[] => {
    const db = getStoredDb();
    db.users = db.users.filter(u => u.username !== username);
    saveStoredDb(db);
    return db.users;
  },

  createProject: (projectData: any): StorageData => {
    const db = getStoredDb();
    const contractor = db.contractors.find(c => c.id === projectData.contractorId);
    
    const newProject: Project = {
      id: `p-${db.projects.length + 1}`,
      state: projectData.state,
      estateName: projectData.estateName,
      houseType: projectData.houseType,
      typologies: projectData.typologies || [{ type: projectData.houseType, count: Number(projectData.houseCount) || 50 }],
      contractorId: projectData.contractorId,
      contractorName: contractor ? contractor.companyName : "Assigned Contractor",
      projectManager: projectData.projectManager || "Resident Engineer",
      stages: {
        "Site clearing": false,
        "Setting out": false,
        "Excavation": false,
        "Foundation": false,
        "Ground beam": false,
        "Block work": false,
        "Lintel": false,
        "Roofing": false,
        "Electrical": false,
        "Plumbing": false,
        "Finishes": false,
        "External works": false,
        "Completed": false
      },
      progress: 0,
      status: "On Schedule",
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      targetCompletionDate: projectData.targetCompletionDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: Number(projectData.budget) || 100000000,
      spent: 0,
      timelineExceededDays: 0,
      lastUpdated: new Date().toISOString(),
      houseCount: Number(projectData.houseCount) || 50,
      assignmentStatus: "Accepted",
      photoUpdates: []
    };
    db.projects.push(newProject);
    saveStoredDb(db);
    return db;
  },

  updateProject: (projectId: string, updateData: any): StorageData => {
    const db = getStoredDb();
    const project = db.projects.find(p => p.id === projectId);
    if (project) {
      if (updateData.stages) {
        project.stages = updateData.stages;
        const total = Object.keys(project.stages).length;
        const completed = Object.values(project.stages).filter(Boolean).length;
        project.progress = Math.round((completed / total) * 100);
      }
      if (updateData.status) project.status = updateData.status;
      if (updateData.photoUpdate) {
        if (!project.photoUpdates) project.photoUpdates = [];
        project.photoUpdates.push(updateData.photoUpdate);
      }
      project.lastUpdated = new Date().toISOString();
      saveStoredDb(db);
    }
    return db;
  },

  acceptProject: (projectId: string): StorageData => {
    const db = getStoredDb();
    const project = db.projects.find(p => p.id === projectId);
    if (project) {
      project.assignmentStatus = "Accepted";
      project.lastUpdated = new Date().toISOString();
      saveStoredDb(db);
    }
    return db;
  },

  rejectProject: (projectId: string): StorageData => {
    const db = getStoredDb();
    const project = db.projects.find(p => p.id === projectId);
    if (project) {
      project.assignmentStatus = "Rejected";
      project.lastUpdated = new Date().toISOString();
      saveStoredDb(db);
    }
    return db;
  },

  onboardContractor: (contractorData: any): StorageData => {
    const db = getStoredDb();
    const newContractor: Contractor = {
      id: `c-${db.contractors.length + 1}`,
      companyName: contractorData.companyName,
      email: contractorData.email || "",
      phone: contractorData.phone || "",
      address: contractorData.address || "",
      registrationNo: contractorData.registrationNo || "",
      taxId: contractorData.taxId || "",
      status: "pending",
      onboardedDate: new Date().toISOString().split('T')[0],
      documents: contractorData.documents || {},
      contractAmount: Number(contractorData.contractAmount) || 0,
      durationMonths: Number(contractorData.durationMonths) || 12,
      bankName: contractorData.bankName || "Unspecified Bank",
      accountNumber: contractorData.accountNumber || "",
      insuranceExpiry: contractorData.insuranceExpiry || "",
      performanceBondExpiry: contractorData.performanceBondExpiry || "",
      assignedProjectsCount: 0
    };
    db.contractors.push(newContractor);
    saveStoredDb(db);
    return db;
  },

  approveContractor: (contractorId: string): StorageData => {
    const db = getStoredDb();
    const contractor = db.contractors.find(c => c.id === contractorId);
    if (contractor) {
      contractor.status = "approved";
      saveStoredDb(db);
    }
    return db;
  },

  requestValuation: (valData: any): StorageData => {
    const db = getStoredDb();
    const project = db.projects.find(p => p.id === valData.projectId);
    
    const newValuation: ValuationRequest = {
      id: `val-${db.valuations.length + 1}`,
      projectId: valData.projectId,
      estateName: project ? project.estateName : valData.estateName,
      houseType: project ? project.houseType : valData.houseType,
      contractorName: project ? project.contractorName : valData.contractorName,
      amountRequested: Number(valData.amountRequested) || 0,
      currentStage: "request_valuation",
      dateCreated: new Date().toISOString().split('T')[0],
      invoiceNumber: valData.invoiceNumber || `INV/GEN/${new Date().getFullYear()}/${100 + db.valuations.length}`,
      history: [
        {
          stage: "request_valuation",
          date: new Date().toISOString().split('T')[0],
          actor: valData.actor || "Contractor",
          status: "approved",
          comments: valData.comments || "Submitted new progress valuation claim."
        }
      ]
    };
    db.valuations.push(newValuation);
    saveStoredDb(db);
    return db;
  },

  approveValuation: (valId: string, approvalData: any): StorageData => {
    const db = getStoredDb();
    const valuation = db.valuations.find(v => v.id === valId);
    if (valuation) {
      if (approvalData.role === 'CONTRACTOR') {
        console.warn("Security Alert: Contractor cannot approve valuations.");
        return db;
      }

      const currentStage = valuation.currentStage;
      let nextStage: typeof valuation.currentStage = "request_valuation";
      
      switch (currentStage) {
        case "request_valuation":
          nextStage = "resident_engineer_verify";
          break;
        case "resident_engineer_verify":
          nextStage = "project_manager_approve";
          break;
        case "project_manager_approve":
          nextStage = "quantity_surveyor_certify";
          break;
        case "quantity_surveyor_certify":
          nextStage = "finance_review";
          break;
        case "finance_review":
          nextStage = "executive_approve";
          break;
        case "executive_approve":
          nextStage = "payment_released";
          break;
        default:
          nextStage = "payment_released";
          break;
      }
      
      valuation.currentStage = nextStage;
      if (approvalData.amountCertified) {
        valuation.amountCertified = Number(approvalData.amountCertified);
      }
      if (approvalData.certificateNumber) {
        valuation.certificateNumber = approvalData.certificateNumber;
      }
      
      if (!valuation.history) valuation.history = [];
      valuation.history.push({
        stage: nextStage,
        date: new Date().toISOString().split('T')[0],
        actor: approvalData.actor || "FHA Official",
        status: "approved",
        comments: approvalData.comments || `Approved and advanced to next verification gate: ${nextStage}.`
      });
      
      saveStoredDb(db);
    }
    return db;
  },

  createScorecard: (scorecardData: any): StorageData => {
    const db = getStoredDb();
    const contractor = db.contractors.find(c => c.id === scorecardData.contractorId);
    const project = db.projects.find(p => p.id === scorecardData.projectId);
    
    const scores: ContractorScorecard['scores'] = scorecardData.scores || {
      quality: 4,
      timeliness: 4,
      safetyCompliance: 4,
      documentationQuality: 4,
      responsiveness: 4,
      defectsManagement: 4,
      variationManagement: 4
    };
    
    const sum = Object.values(scores).reduce((a: number, b: number) => a + b, 0);
    const overallRating = Number((sum / Object.keys(scores).length).toFixed(1));

    const newScorecard: ContractorScorecard = {
      id: `sc-${db.scorecards.length + 1}`,
      contractorId: scorecardData.contractorId,
      contractorName: contractor ? contractor.companyName : "Contractor",
      projectName: project ? project.estateName : "Project",
      scores,
      overallRating,
      feedback: scorecardData.feedback || "Evaluated by FHA supervisory desk.",
      reviewedBy: scorecardData.reviewedBy || "FHA Desk Coordinator",
      dateCreated: new Date().toISOString().split('T')[0]
    };
    db.scorecards.push(newScorecard);
    saveStoredDb(db);
    return db;
  },

  triggerAlertAction: (alertId: string, actionType: 'query' | 'meeting' | 'withhold' | 'directive', details: string): StorageData => {
    const db = getStoredDb();
    const alert = db.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.actionTaken = {
        type: actionType,
        details,
        date: new Date().toISOString().split('T')[0]
      };
      saveStoredDb(db);
    }
    return db;
  },

  resolveAlert: (alertId: string): StorageData => {
    const db = getStoredDb();
    const alert = db.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      saveStoredDb(db);
    }
    return db;
  }
};
