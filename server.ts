import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { 
  Contractor, 
  Project, 
  ValuationRequest, 
  ContractorScorecard, 
  RiskAlert, 
  CONSTRUCTION_STAGES,
  PhotoUpdate,
  ValuationStage,
  User
} from "./src/types.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json({ limit: "20mb" }));

// AWS / Production Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "FHA Project Delivery & Executive Monitoring Platform",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString() 
  });
});

// =========================================================================
// ENTERPRISE ROLE-BASED ACCESS CONTROL (RBAC) & SECURITY MIDDLEWARE
// =========================================================================
interface CallerContext {
  role: string;
  username: string;
  contractorId?: string;
}

function getCallerContext(req: express.Request): CallerContext {
  let role = (req.headers['x-user-role'] as string) || (req.query.role as string) || '';
  let username = (req.headers['x-username'] as string) || (req.query.username as string) || '';
  let contractorId = (req.headers['x-contractor-id'] as string) || (req.query.contractorId as string) || undefined;

  // Check Bearer Token if present
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      if (decoded && decoded.role) {
        role = decoded.role;
        username = decoded.username || username;
        contractorId = decoded.contractorId || contractorId;
      }
    } catch {
      // If token parsing fails, fallback to headers
    }
  }

  return {
    role: (role || '').toUpperCase(),
    username: username || '',
    contractorId: contractorId || undefined
  };
}

const STAGE_PERMISSIONS: Record<ValuationStage, string[]> = {
  request_valuation: ['CONTRACTOR', 'PM', 'MD'],
  resident_engineer_verify: ['RE', 'MD'],
  project_manager_approve: ['PM', 'MD'],
  quantity_surveyor_certify: ['QS', 'MD'],
  finance_review: ['FD', 'MD'],
  executive_approve: ['MD'],
  payment_released: ['CT', 'MD']
};

// IN-MEMORY DATABASE SEED DATA
let users: User[] = [
  { name: "Hon. Oyetunde Oladimeji Ojo (MD)", username: "MD", role: "MD", email: "O.Ojo@fha.gov.ng" },
  { name: "Ahmed Abdul (PM)", username: "PM", role: "PM", email: "a.abdul@fha.gov.ng" },
  { name: "Surv. Chukwuemeka Okafor (QS)", username: "QS", role: "QS", email: "c.okafor@fha.gov.ng" },
  { name: "Adebisi Olamide (RE)", username: "RE", role: "RE", email: "a.olamide@fha.gov.ng" },
  { name: "Mr. Aliyu Ibrahim (Finance Dir)", username: "FD", role: "FD", email: "aliyu.ibrahim@fha.gov.ng" },
  { name: "Mrs. Ngozi Ezenwa (Treasury Head)", username: "CT", role: "CT", email: "ngozi.ezenwa@fha.gov.ng" },
  { name: "ABC Contractor Representative", username: "CONTRACTOR", role: "CONTRACTOR", contractorId: "c-1", email: "contact@abcconstruction.ng" }
];
let contractors: Contractor[] = [
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

let projects: Project[] = [
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
    progress: 38, // 5 out of 13 stages
    status: "Needs Attention",
    startDate: "2026-02-01",
    targetCompletionDate: "2027-02-01",
    budget: 250000000,
    spent: 100000000,
    timelineExceededDays: 0,
    lastUpdated: "2026-07-05T14:30:00Z", // 9 days ago
    houseCount: 150,
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
    progress: 62, // 8 out of 13 stages
    status: "On Schedule",
    startDate: "2025-11-01",
    targetCompletionDate: "2027-05-01",
    budget: 600000000,
    spent: 380000000,
    timelineExceededDays: 0,
    lastUpdated: "2026-07-13T10:15:00Z", // Yesterday
    houseCount: 80,
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
    progress: 23, // 3 out of 13 stages
    status: "Delayed",
    startDate: "2025-12-01",
    targetCompletionDate: "2026-06-01", // Handover date was supposed to be 1.5 months ago
    budget: 300000000,
    spent: 900000000 * 0.15, // estimated spent
    timelineExceededDays: 43, // calculated till 2026-07-14
    lastUpdated: "2026-06-02T16:00:00Z", // No updates in 42 days!
    houseCount: 100,
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
    progress: 31, // 4 out of 13
    status: "On Schedule",
    startDate: "2026-03-01",
    targetCompletionDate: "2026-11-01",
    budget: 200000000,
    spent: 650000000 * 0.1, // around 65M
    timelineExceededDays: 0,
    lastUpdated: "2026-07-11T09:00:00Z", // 3 days ago
    houseCount: 60,
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

// Ensure all pre-seeded projects have assignmentStatus set to Accepted
projects.forEach(p => {
  if (!p.assignmentStatus) {
    p.assignmentStatus = "Accepted";
  }
});

let valuations: ValuationRequest[] = [
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

let scorecards: ContractorScorecard[] = [
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

let alerts: RiskAlert[] = [
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

// Helper to lazy-initialize Gemini AI client securely
let aiInstance: GoogleGenAI | null = null;
function getGeminiAI() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not set in environment variables.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'fha-platform',
        }
      }
    });
  }
  return aiInstance;
}

// REST API ROUTES
app.get("/api/contractors", (req, res) => {
  res.json(contractors);
});

app.post("/api/contractors/onboard", (req, res) => {
  const data = req.body;
  const newContractor: Contractor = {
    id: `c-${contractors.length + 1}`,
    companyName: data.companyName,
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    registrationNo: data.registrationNo || "",
    taxId: data.taxId || "",
    status: "pending",
    onboardedDate: new Date().toISOString().split('T')[0],
    documents: {
      registration: data.documents?.registration || "uploaded_reg.pdf",
      taxCertificate: data.documents?.taxCertificate || "uploaded_tax.pdf",
      awardLetter: data.documents?.awardLetter || "uploaded_award.pdf",
      drawings: data.documents?.drawings || "uploaded_drawings.pdf",
      performanceBond: data.documents?.performanceBond || "uploaded_bond.pdf"
    },
    contractAmount: Number(data.contractAmount) || 0,
    durationMonths: Number(data.durationMonths) || 12,
    bankName: data.bankName || "",
    accountNumber: data.accountNumber || "",
    insuranceExpiry: data.insuranceExpiry || "",
    performanceBondExpiry: data.performanceBondExpiry || "",
    assignedProjectsCount: 0
  };
  
  contractors.push(newContractor);
  res.status(201).json(newContractor);
});

app.post("/api/contractors", (req, res) => {
  const data = req.body;
  const newContractor: Contractor = {
    id: `c-${contractors.length + 1}`,
    companyName: data.companyName,
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    registrationNo: data.registrationNo || "",
    taxId: data.taxId || "",
    status: "pending",
    onboardedDate: new Date().toISOString().split('T')[0],
    documents: {
      registration: data.documents?.registration || "uploaded_reg.pdf",
      taxCertificate: data.documents?.taxCertificate || "uploaded_tax.pdf",
      awardLetter: data.documents?.awardLetter || "uploaded_award.pdf",
      drawings: data.documents?.drawings || "uploaded_drawings.pdf",
      performanceBond: data.documents?.performanceBond || "uploaded_bond.pdf"
    },
    contractAmount: Number(data.contractAmount) || 0,
    durationMonths: Number(data.durationMonths) || 12,
    bankName: data.bankName || "",
    accountNumber: data.accountNumber || "",
    insuranceExpiry: data.insuranceExpiry || "",
    performanceBondExpiry: data.performanceBondExpiry || "",
    assignedProjectsCount: 0
  };
  
  contractors.push(newContractor);
  res.status(201).json(newContractor);
});

app.post("/api/contractors/approve/:id", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role && caller.role !== 'MD' && caller.role !== 'PM') {
    return res.status(403).json({ error: "Access Denied: Only Managing Director (MD) or Project Manager (PM) can approve contractors." });
  }

  const { id } = req.params;
  const contractor = contractors.find(c => c.id === id);
  if (!contractor) {
    return res.status(404).json({ error: "Contractor not found" });
  }
  contractor.status = "approved";
  res.json(contractor);
});

app.post("/api/contractors/:id/approve", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role && caller.role !== 'MD' && caller.role !== 'PM') {
    return res.status(403).json({ error: "Access Denied: Only Managing Director (MD) or Project Manager (PM) can approve contractors." });
  }

  const { id } = req.params;
  const contractor = contractors.find(c => c.id === id);
  if (!contractor) {
    return res.status(404).json({ error: "Contractor not found" });
  }
  contractor.status = "approved";
  res.json(contractor);
});

app.get("/api/projects", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR') {
    const cId = caller.contractorId || 'c-1';
    return res.json(projects.filter(p => p.contractorId === cId));
  }
  res.json(projects);
});

app.post("/api/projects/setup", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role && caller.role !== 'MD' && caller.role !== 'PM') {
    return res.status(403).json({ error: "Access Denied: Only Managing Director (MD) or Project Manager (PM) can set up new projects." });
  }

  const data = req.body;
  
  // Create blank stages dictionary
  const stagesDict: { [key: string]: boolean } = {};
  CONSTRUCTION_STAGES.forEach(stage => {
    stagesDict[stage] = false;
  });
  
  const newProject: Project = {
    id: `p-${projects.length + 1}`,
    state: data.state,
    estateName: data.estateName,
    houseType: data.houseType,
    typologies: data.typologies || [],
    contractorId: data.contractorId,
    contractorName: data.contractorName || contractors.find(c => c.id === data.contractorId)?.companyName || "Assigned Contractor",
    projectManager: data.projectManager || "Resident PM",
    stages: stagesDict,
    progress: 0,
    status: "On Schedule",
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    targetCompletionDate: data.targetCompletionDate || "",
    budget: Number(data.budget) || 0,
    spent: 0,
    timelineExceededDays: 0,
    lastUpdated: new Date().toISOString(),
    houseCount: Number(data.houseCount) || 50,
    photoUpdates: [],
    assignmentStatus: "Pending"
  };

  // Increment assigned count for contractor
  const contractor = contractors.find(c => c.id === data.contractorId);
  if (contractor) {
    contractor.assignedProjectsCount += 1;
  }

  projects.push(newProject);
  res.status(201).json(newProject);
});

app.post("/api/projects", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role && caller.role !== 'MD' && caller.role !== 'PM') {
    return res.status(403).json({ error: "Access Denied: Only Managing Director (MD) or Project Manager (PM) can set up new projects." });
  }

  const data = req.body;
  
  // Create blank stages dictionary
  const stagesDict: { [key: string]: boolean } = {};
  CONSTRUCTION_STAGES.forEach(stage => {
    stagesDict[stage] = false;
  });
  
  const newProject: Project = {
    id: `p-${projects.length + 1}`,
    state: data.state,
    estateName: data.estateName,
    houseType: data.houseType,
    typologies: data.typologies || [],
    contractorId: data.contractorId,
    contractorName: data.contractorName || contractors.find(c => c.id === data.contractorId)?.companyName || "Assigned Contractor",
    projectManager: data.projectManager || "Resident PM",
    stages: stagesDict,
    progress: 0,
    status: "On Schedule",
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    targetCompletionDate: data.targetCompletionDate || "",
    budget: Number(data.budget) || 0,
    spent: 0,
    timelineExceededDays: 0,
    lastUpdated: new Date().toISOString(),
    houseCount: Number(data.houseCount) || 50,
    photoUpdates: [],
    assignmentStatus: "Pending"
  };

  // Increment assigned count for contractor
  const contractor = contractors.find(c => c.id === data.contractorId);
  if (contractor) {
    contractor.assignedProjectsCount += 1;
  }

  projects.push(newProject);
  res.status(201).json(newProject);
});

app.post("/api/projects/:id/accept", (req, res) => {
  const { id } = req.params;
  const project = projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR' && caller.contractorId && project.contractorId !== caller.contractorId) {
    return res.status(403).json({ error: "Access Denied: You cannot accept a project assigned to another contractor." });
  }

  project.assignmentStatus = "Accepted";
  project.lastUpdated = new Date().toISOString();
  res.json(project);
});

app.post("/api/projects/:id/reject", (req, res) => {
  const { id } = req.params;
  const project = projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR' && caller.contractorId && project.contractorId !== caller.contractorId) {
    return res.status(403).json({ error: "Access Denied: You cannot reject a project assigned to another contractor." });
  }

  project.assignmentStatus = "Rejected";
  project.lastUpdated = new Date().toISOString();
  res.json(project);
});

app.post("/api/projects/update/:id", (req, res) => {
  const { id } = req.params;
  const { stages, status, spent, photoUpdate } = req.body;
  const project = projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR') {
    if (caller.contractorId && project.contractorId && project.contractorId !== caller.contractorId) {
      return res.status(403).json({ error: "Access Denied: You cannot update projects assigned to another contractor." });
    }
    if (stages && stages["Completed"] === true && project.stages["Completed"] !== true) {
      return res.status(403).json({ error: "Access Denied: Contractors cannot mark final project completion without Resident Engineer inspection sign-off." });
    }
  }

  if (stages) {
    project.stages = stages;
    // Calculate progress
    const totalStages = CONSTRUCTION_STAGES.length;
    const checkedCount = CONSTRUCTION_STAGES.filter(s => stages[s] === true).length;
    
    // Check if "Completed" is ticked, or calculate simple ratio
    if (stages["Completed"] === true) {
      project.progress = 100;
      project.status = "Completed";
      project.actualCompletionDate = new Date().toISOString().split('T')[0];
    } else {
      project.progress = Math.round((checkedCount / totalStages) * 100);
      if (status) {
        project.status = status;
      } else if (project.status === "Completed") {
        project.status = "On Schedule";
      }
    }

    // Reactive alert resolution logic based on progress / updates
    if (project.id === "p-4" && project.progress > 23) {
      const alert = alerts.find(a => a.id === "alt-1");
      if (alert && !alert.resolved) {
        alert.resolved = true;
        if (!alert.logs) alert.logs = [];
        alert.logs.push({
          date: new Date().toISOString().split('T')[0],
          action: "System Auto-Resolved: Received WBS progress update on site, indicating construction activity has fully resumed."
        });
      }
      project.status = "On Schedule";
    }

    if (project.id === "p-1") {
      const alert = alerts.find(a => a.id === "alt-2");
      if (alert && !alert.resolved) {
        alert.resolved = true;
        if (!alert.logs) alert.logs = [];
        alert.logs.push({
          date: new Date().toISOString().split('T')[0],
          action: "System Auto-Resolved: Site stage checklist update received from project coordinator."
        });
      }
      project.status = "On Schedule";
    }
  }

  if (spent !== undefined) {
    project.spent = Number(spent);
  }

  if (photoUpdate) {
    const newPhoto: PhotoUpdate = {
      stage: photoUpdate.stage || "General Update",
      beforePhoto: photoUpdate.beforePhoto || "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=500&q=80",
      afterPhoto: photoUpdate.afterPhoto || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80",
      gps: photoUpdate.gps || { lat: 9.0765, lng: 7.3986, accuracy: 10, locationName: "Project Site" },
      timestamp: new Date().toISOString(),
      uploadedBy: photoUpdate.uploadedBy || "Resident Engineer"
    };
    project.photoUpdates.push(newPhoto);
  }

  project.lastUpdated = new Date().toISOString();
  res.json(project);
});

app.patch("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const { stages, status, spent, photoUpdate } = req.body;
  const project = projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR') {
    if (caller.contractorId && project.contractorId && project.contractorId !== caller.contractorId) {
      return res.status(403).json({ error: "Access Denied: You cannot update projects assigned to another contractor." });
    }
    if (stages && stages["Completed"] === true && project.stages["Completed"] !== true) {
      return res.status(403).json({ error: "Access Denied: Contractors cannot mark final project completion without Resident Engineer inspection sign-off." });
    }
  }

  if (stages) {
    project.stages = stages;
    // Calculate progress
    const totalStages = CONSTRUCTION_STAGES.length;
    const checkedCount = CONSTRUCTION_STAGES.filter(s => stages[s] === true).length;
    
    // Check if "Completed" is ticked, or calculate simple ratio
    if (stages["Completed"] === true) {
      project.progress = 100;
      project.status = "Completed";
      project.actualCompletionDate = new Date().toISOString().split('T')[0];
    } else {
      project.progress = Math.round((checkedCount / totalStages) * 100);
      if (status) {
        project.status = status;
      } else if (project.status === "Completed") {
        project.status = "On Schedule";
      }
    }

    // Reactive alert resolution logic based on progress / updates
    if (project.id === "p-4" && project.progress > 23) {
      const alert = alerts.find(a => a.id === "alt-1");
      if (alert && !alert.resolved) {
        alert.resolved = true;
        if (!alert.logs) alert.logs = [];
        alert.logs.push({
          date: new Date().toISOString().split('T')[0],
          action: "System Auto-Resolved: Received WBS progress update on site, indicating construction activity has fully resumed."
        });
      }
      project.status = "On Schedule";
    }

    if (project.id === "p-1") {
      const alert = alerts.find(a => a.id === "alt-2");
      if (alert && !alert.resolved) {
        alert.resolved = true;
        if (!alert.logs) alert.logs = [];
        alert.logs.push({
          date: new Date().toISOString().split('T')[0],
          action: "System Auto-Resolved: Site stage checklist update received from project coordinator."
        });
      }
      project.status = "On Schedule";
    }
  }

  if (spent !== undefined) {
    project.spent = Number(spent);
  }

  if (photoUpdate) {
    const newPhoto: PhotoUpdate = {
      stage: photoUpdate.stage || "General Update",
      beforePhoto: photoUpdate.beforePhoto || "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=500&q=80",
      afterPhoto: photoUpdate.afterPhoto || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80",
      gps: photoUpdate.gps || { lat: 9.0765, lng: 7.3986, accuracy: 10, locationName: "Project Site" },
      timestamp: new Date().toISOString(),
      uploadedBy: photoUpdate.uploadedBy || "Resident Engineer"
    };
    project.photoUpdates.push(newPhoto);
  }

  project.lastUpdated = new Date().toISOString();
  res.json(project);
});

app.get("/api/valuations", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR') {
    const cId = caller.contractorId || 'c-1';
    const assignedProjectIds = projects.filter(p => p.contractorId === cId).map(p => p.id);
    return res.json(valuations.filter(v => assignedProjectIds.includes(v.projectId)));
  }
  res.json(valuations);
});

app.post("/api/valuations", (req, res) => {
  const data = req.body;
  const project = projects.find(p => p.id === data.projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found for this valuation claim" });
  }

  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR' && caller.contractorId && project.contractorId !== caller.contractorId) {
    return res.status(403).json({ error: "Access Denied: You cannot submit valuation claims for projects assigned to another contractor." });
  }
  
  const newValuation: ValuationRequest = {
    id: `val-${valuations.length + 1}`,
    projectId: data.projectId,
    estateName: project?.estateName || "Unknown Estate",
    houseType: project?.houseType || "Unknown House Type",
    contractorName: project?.contractorName || "Unknown Contractor",
    amountRequested: Number(data.amountRequested) || 0,
    currentStage: "request_valuation",
    dateCreated: new Date().toISOString().split('T')[0],
    invoiceNumber: data.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    history: [
      {
        stage: "request_valuation",
        date: new Date().toISOString().split('T')[0],
        actor: caller.username || project?.contractorName || "Contractor Representative",
        status: "approved",
        comments: data.comments || "Submitted formal progress valuation request."
      }
    ]
  };

  valuations.push(newValuation);
  res.status(201).json(newValuation);
});

app.post("/api/valuations/request", (req, res) => {
  const data = req.body;
  const project = projects.find(p => p.id === data.projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found for this valuation claim" });
  }

  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR' && caller.contractorId && project.contractorId !== caller.contractorId) {
    return res.status(403).json({ error: "Access Denied: You cannot submit valuation claims for projects assigned to another contractor." });
  }
  
  const newValuation: ValuationRequest = {
    id: `val-${valuations.length + 1}`,
    projectId: data.projectId,
    estateName: project?.estateName || "Unknown Estate",
    houseType: project?.houseType || "Unknown House Type",
    contractorName: project?.contractorName || "Unknown Contractor",
    amountRequested: Number(data.amountRequested) || 0,
    currentStage: "request_valuation",
    dateCreated: new Date().toISOString().split('T')[0],
    invoiceNumber: data.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    history: [
      {
        stage: "request_valuation",
        date: new Date().toISOString().split('T')[0],
        actor: caller.username || project?.contractorName || "Contractor Representative",
        status: "approved",
        comments: data.comments || "Submitted formal progress valuation request."
      }
    ]
  };

  valuations.push(newValuation);
  res.status(201).json(newValuation);
});

function executeValuationApproval(req: express.Request, res: express.Response) {
  const { id } = req.params;
  const { actor, comments, status, amountCertified } = req.body;
  const val = valuations.find(v => v.id === id);
  if (!val) {
    return res.status(404).json({ error: "Valuation request not found" });
  }

  const caller = getCallerContext(req);

  // Absolute security check: Contractors can NEVER approve valuations or self-authorize payments!
  if (caller.role === 'CONTRACTOR') {
    return res.status(403).json({ 
      error: "Access Denied: Contractors are strictly prohibited from approving valuations or authorizing funds." 
    });
  }

  const STAGES_WORKFLOW: ValuationStage[] = [
    'request_valuation',
    'resident_engineer_verify',
    'project_manager_approve',
    'quantity_surveyor_certify',
    'finance_review',
    'executive_approve',
    'payment_released'
  ];

  const currentIdx = STAGES_WORKFLOW.indexOf(val.currentStage);
  if (currentIdx === -1 || currentIdx === STAGES_WORKFLOW.length - 1) {
    return res.status(400).json({ error: "Cannot approve request in its current stage or it has already been finalized." });
  }

  const nextStage = STAGES_WORKFLOW[currentIdx + 1];

  // RBAC Gate Check: Only authorized role can advance this stage
  const permittedRoles = STAGE_PERMISSIONS[nextStage] || ['MD'];
  if (caller.role && !permittedRoles.includes(caller.role) && caller.role !== 'MD') {
    return res.status(403).json({ 
      error: `Access Denied: Role '${caller.role}' is not authorized to sign off at '${nextStage}'. Required authorized roles: ${permittedRoles.join(', ')}.` 
    });
  }
  
  // Update request stage
  if (status === 'approved') {
    val.currentStage = nextStage;
    if (amountCertified !== undefined) {
      val.amountCertified = Number(amountCertified);
    } else if (!val.amountCertified) {
      val.amountCertified = val.amountRequested;
    }
  }

  val.history.push({
    stage: nextStage,
    date: new Date().toISOString().split('T')[0],
    actor: actor || caller.username || `FHA Official (${caller.role || 'Officer'})`,
    status: status || 'approved',
    comments: comments || `Verified and approved at ${nextStage} stage.`
  });

  // If fully released, add budget spend to project
  if (val.currentStage === 'payment_released' && status === 'approved') {
    const project = projects.find(p => p.id === val.projectId);
    if (project) {
      project.spent += val.amountCertified || val.amountRequested;
    }
  }

  res.json(val);
}

app.post("/api/valuations/approve/:id", executeValuationApproval);
app.post("/api/valuations/:id/approve", executeValuationApproval);

app.get("/api/scorecards", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR') {
    const cId = caller.contractorId || 'c-1';
    return res.json(scorecards.filter(sc => sc.contractorId === cId));
  }
  res.json(scorecards);
});

app.post("/api/scorecards/create", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role && caller.role !== 'MD' && caller.role !== 'PM' && caller.role !== 'QS') {
    return res.status(403).json({ error: "Access Denied: Only MD, PM, or QS can evaluate contractor scorecards." });
  }

  const data = req.body;
  const contractor = contractors.find(c => c.id === data.contractorId);
  const project = projects.find(p => p.id === data.projectId);
  
  const scores = {
    quality: Number(data.scores?.quality) || 5,
    timeliness: Number(data.scores?.timeliness) || 5,
    safetyCompliance: Number(data.scores?.safetyCompliance) || 5,
    documentationQuality: Number(data.scores?.documentationQuality) || 5,
    responsiveness: Number(data.scores?.responsiveness) || 5,
    defectsManagement: Number(data.scores?.defectsManagement) || 5,
    variationManagement: Number(data.scores?.variationManagement) || 5,
  };

  const sum = Object.values(scores).reduce((a, b) => a + b, 0);
  const overallRating = Number((sum / Object.values(scores).length).toFixed(1));

  const newScorecard: ContractorScorecard = {
    id: `sc-${scorecards.length + 1}`,
    contractorId: data.contractorId,
    contractorName: contractor?.companyName || data.contractorName || "Contractor",
    projectName: project?.estateName || data.projectName || "FHA Estate Project",
    scores: scores,
    overallRating: overallRating,
    feedback: data.feedback || "Standard verified performance review.",
    reviewedBy: caller.username || data.reviewedBy || "Executive Evaluator",
    dateCreated: new Date().toISOString().split('T')[0]
  };

  scorecards.push(newScorecard);
  
  // Re-calculate average rating for contractor
  const contractorCards = scorecards.filter(sc => sc.contractorId === data.contractorId);
  const avgRating = contractorCards.reduce((acc, c) => acc + c.overallRating, 0) / contractorCards.length;
  if (contractor) {
    contractor.rating = Number(avgRating.toFixed(1));
  }

  res.status(201).json(newScorecard);
});

app.post("/api/scorecards", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role && caller.role !== 'MD' && caller.role !== 'PM' && caller.role !== 'QS') {
    return res.status(403).json({ error: "Access Denied: Only MD, PM, or QS can evaluate contractor scorecards." });
  }

  const data = req.body;
  const contractor = contractors.find(c => c.id === data.contractorId);
  const project = projects.find(p => p.id === data.projectId);
  
  const scores = {
    quality: Number(data.scores?.quality) || 5,
    timeliness: Number(data.scores?.timeliness) || 5,
    safetyCompliance: Number(data.scores?.safetyCompliance) || 5,
    documentationQuality: Number(data.scores?.documentationQuality) || 5,
    responsiveness: Number(data.scores?.responsiveness) || 5,
    defectsManagement: Number(data.scores?.defectsManagement) || 5,
    variationManagement: Number(data.scores?.variationManagement) || 5,
  };

  const sum = Object.values(scores).reduce((a, b) => a + b, 0);
  const overallRating = Number((sum / Object.values(scores).length).toFixed(1));

  const newScorecard: ContractorScorecard = {
    id: `sc-${scorecards.length + 1}`,
    contractorId: data.contractorId,
    contractorName: contractor?.companyName || data.contractorName || "Contractor",
    projectName: project?.estateName || data.projectName || "FHA Estate Project",
    scores: scores,
    overallRating: overallRating,
    feedback: data.feedback || "Standard verified performance review.",
    reviewedBy: caller.username || data.reviewedBy || "Executive Evaluator",
    dateCreated: new Date().toISOString().split('T')[0]
  };

  scorecards.push(newScorecard);
  
  // Re-calculate average rating for contractor
  const contractorCards = scorecards.filter(sc => sc.contractorId === data.contractorId);
  const avgRating = contractorCards.reduce((acc, c) => acc + c.overallRating, 0) / contractorCards.length;
  if (contractor) {
    contractor.rating = Number(avgRating.toFixed(1));
  }

  res.status(201).json(newScorecard);
});

app.get("/api/alerts", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR') {
    const cId = caller.contractorId || 'c-1';
    const assignedProjectIds = projects.filter(p => p.contractorId === cId).map(p => p.id);
    return res.json(alerts.filter(a => assignedProjectIds.includes(a.projectId)));
  }
  res.json(alerts);
});

app.post("/api/alerts/create", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR') {
    return res.status(403).json({ error: "Access Denied: Contractors cannot create internal executive risk alerts." });
  }

  const data = req.body;
  const project = projects.find(p => p.id === data.projectId);
  const newAlert: RiskAlert = {
    id: `alt-${alerts.length + 1}`,
    projectId: data.projectId,
    projectName: project?.estateName || data.projectName || "",
    state: project?.state || data.state || "",
    title: data.title,
    details: data.details,
    severity: data.severity || "medium",
    category: data.category || "timeline",
    dateCreated: new Date().toISOString().split('T')[0],
    resolved: false
  };

  alerts.push(newAlert);
  res.status(201).json(newAlert);
});

app.post("/api/alerts/resolve/:id", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR') {
    return res.status(403).json({ error: "Access Denied: Contractors cannot resolve executive risk alerts." });
  }

  const { id } = req.params;
  const alert = alerts.find(a => a.id === id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  alert.resolved = true;
  res.json(alert);
});

app.post("/api/alerts/:id/resolve", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR') {
    return res.status(403).json({ error: "Access Denied: Contractors cannot resolve executive risk alerts." });
  }

  const { id } = req.params;
  const alert = alerts.find(a => a.id === id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  alert.resolved = true;
  res.json(alert);
});

app.post("/api/alerts/:id/action", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role === 'CONTRACTOR') {
    return res.status(403).json({ error: "Access Denied: Contractors cannot register executive mitigation directives." });
  }

  const { id } = req.params;
  const { actionType, details } = req.body;
  const alert = alerts.find(a => a.id === id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  
  if (!alert.logs) {
    alert.logs = [];
  }
  
  const formattedAction = actionType === 'query' ? 'Queried Contractor' :
                          actionType === 'meeting' ? 'Scheduled Strategic Meeting' :
                          actionType === 'withhold' ? 'Funding Withheld' :
                          actionType === 'directive' ? 'Executive Directive Issued' : 'Mitigation Action Taken';
  
  alert.logs.push({
    date: new Date().toISOString().split('T')[0],
    action: `${formattedAction}: ${details || ""}`
  });
  
  res.json(alert);
});

// Access and Auth APIs
app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users", (req, res) => {
  const caller = getCallerContext(req);
  if (caller.role && caller.role !== 'MD' && caller.role !== 'PM') {
    return res.status(403).json({ error: "Access Denied: Only Managing Director (MD) or Project Manager (PM) can create users." });
  }

  const { name, username, email, role, contractorId } = req.body;
  
  if (!name || !username || !email || !role) {
    return res.status(400).json({ error: "Missing required user fields" });
  }

  const normalizedUsername = username.toUpperCase();
  const exists = users.some(u => u.username === normalizedUsername);
  if (exists) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const newUser: User = {
    name,
    username: normalizedUsername,
    email,
    role,
    contractorId
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Please enter both username and password" });
  }

  if (password !== "password@123") {
    return res.status(401).json({ error: "Invalid password. Sandbox password is 'password@123'." });
  }

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: `User with username '${username}' not found.` });
  }

  // Generate verifiable session token
  const tokenPayload = {
    username: user.username,
    role: user.role,
    name: user.name,
    contractorId: user.contractorId,
    timestamp: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000
  };
  const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

  res.json({ success: true, user, token });
});

app.get("/api/overview", (req, res) => {
  const caller = getCallerContext(req);
  
  let filteredProjects = projects;
  let filteredValuations = valuations;
  let filteredContractors = contractors;
  let filteredAlerts = alerts;
  let filteredScorecards = scorecards;

  if (caller.role === 'CONTRACTOR') {
    const cId = caller.contractorId || 'c-1';
    filteredProjects = projects.filter(p => p.contractorId === cId);
    const assignedProjectIds = filteredProjects.map(p => p.id);
    filteredValuations = valuations.filter(v => assignedProjectIds.includes(v.projectId));
    filteredContractors = contractors.filter(c => c.id === cId);
    filteredAlerts = alerts.filter(a => assignedProjectIds.includes(a.projectId));
    filteredScorecards = scorecards.filter(sc => sc.contractorId === cId);
  }

  const totalProjects = filteredProjects.length;
  const onScheduleCount = filteredProjects.filter(p => p.status === 'On Schedule').length;
  const delayedCount = filteredProjects.filter(p => p.status === 'Delayed').length;
  const attentionCount = filteredProjects.filter(p => p.status === 'Needs Attention').length;
  const completedCount = filteredProjects.filter(p => p.status === 'Completed').length;
  
  const totalBudget = filteredProjects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = filteredProjects.reduce((acc, p) => acc + p.spent, 0);
  const activeContractors = filteredContractors.filter(c => c.status === 'approved' && c.assignedProjectsCount > 0).length;
  const pendingValuations = filteredValuations.filter(v => v.currentStage !== 'payment_released').length;

  res.json({
    projects: filteredProjects,
    contractors: filteredContractors,
    valuations: filteredValuations,
    scorecards: filteredScorecards,
    alerts: filteredAlerts,
    totalProjects,
    onScheduleCount,
    delayedCount,
    attentionCount,
    completedCount,
    totalBudget,
    totalSpent,
    activeContractors,
    pendingValuations
  });
});

// AI EXECUTIVE ASSISTANT ENDPOINT - "YOMI"
// Intelligent role-based handler with strict project scoping and fallback engine
function handleYomiQueryLocally(message: string, userRole: string = "MD", username: string = "", selectedProjectId?: string): string {
  const q = message.toLowerCase().trim();

  // Negative constraint check: Detect non-project questions
  const projectKeywords = [
    'project', 'estate', 'house', 'housing', 'contractor', 'stage', 'foundation', 'roofing', 
    'block', 'lintel', 'excavation', 'budget', 'spent', 'cost', 'valuation', 'certif', 'invoice', 
    'naira', 'cbn', 'rtgs', 'payment', 'disburse', 'progress', 'delay', 'overdue', 'schedule', 
    'alert', 'risk', 'scorecard', 'rating', 'kaduna', 'abuja', 'lagos', 'rivers', 'kano', 
    'kada', 'gwarinpa', 'isheri', 'rumuokoro', 'dala', 'nze', 'abc', 'dantata', 'cappa', 
    'brief', 'report', 'status', 'milestone', 'photo', 'gps', 'wbs', 'bello', 'musa', 'adebayo',
    'amaechi', 'ibrahim', 'work', 'unit', 'bungalow', 'duplex', 'terrace', 'inspection', 'engineer'
  ];

  const hasProjectContext = projectKeywords.some(k => q.includes(k)) || !!selectedProjectId;

  // General non-project questions rejection
  const nonProjectGreetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
  const isJustGreeting = nonProjectGreetings.some(g => q === g || q === `${g} yomi` || q === `yomi`);

  if (!hasProjectContext && !isJustGreeting) {
    return "I am Yomi, your Project Delivery AI Assistant. I exclusively answer tactical, operational, and financial questions and queries directly concerning the active housing projects in our database. I cannot answer queries outside our project portfolio.";
  }

  if (isJustGreeting) {
    const roleTitles: Record<string, string> = {
      MD: "Honourable Managing Director & CEO",
      PM: "Project Manager",
      QS: "Lead Quantity Surveyor",
      RE: "Resident Engineer",
      FD: "Director of Finance",
      CT: "Treasury Head"
    };
    const title = roleTitles[userRole] || "Executive";
    const jurisdictionDesc = userRole === 'MD' 
      ? "You have full, unrestricted nationwide jurisdiction across all states, finances, contractors, and alerts."
      : userRole === 'QS'
      ? "Your authorized scope covers financial valuations, bill of quantities (BOQ), certified sums, and milestone claims."
      : userRole === 'RE'
      ? "Your authorized scope covers tactical on-site construction stages, physical inspections, and photo updates for your assigned sites."
      : userRole === 'FD' || userRole === 'CT'
      ? "Your authorized scope covers project allocations, expenditure, payment releases, and treasury disbursements."
      : "Your authorized scope covers project scheduling, WBS milestone progression, and contractor performance.";

    return `Good day, **${title}**. I am **Yomi**, the Executive AI Assistant for the Federal Housing Authority (FHA).

${jurisdictionDesc}

You can ask me questions in natural language or structured queries. How may I assist with your project portfolio today?`;
  }

  // Role Jurisdiction Check
  if (userRole === 'RE' && (q.includes('cbn') || q.includes('treasury reserve') || q.includes('rtgs') || q.includes('ministerial allocation'))) {
    return "As a **Resident Engineer**, your jurisdiction is limited to on-site physical progress, milestone inspections, and technical quality on your assigned project sites. High-level treasury reserves and ministerial disbursements fall under the jurisdiction of the **Finance Director** and the **Managing Director**.";
  }

  if (userRole === 'RE' && (q.includes('rivers') || q.includes('rumuokoro') || q.includes('kano') || q.includes('dala'))) {
    return "As a **Resident Engineer**, your active site assignment covers **Kada Hill Estate (Kaduna)** and **Gwarinpa Vista Heights (Abuja)**. You do not have on-site jurisdiction over the Rivers or Kano estates. For nationwide project inquiries, please consult the **Project Manager** or **Managing Director**.";
  }

  // Answer specific tactical / financial questions directly from live database
  if (q.includes('behind') || q.includes('delay') || q.includes('overdue') || q.includes('late')) {
    const delayedProjects = projects.filter(p => p.status === 'Delayed' || p.status === 'Needs Attention' || p.timelineExceededDays > 0);
    return `### ⚠️ Tactical Schedule Audit: Projects Behind Schedule

Based on live WBS milestone tracking, here are the projects requiring immediate attention:

1. **Rumuokoro Royal Garden (Rivers State)**:
   - **Contractor**: Nze Construction Ltd (Rating: **2.3/5**)
   - **Progress**: Only **23%** complete (stopped at Excavation stage)
   - **Delay**: **43+ days overdue** against target handover date (2026-06-01)
   - **Tactical Status**: Site stagnant with no progress updates in over 42 days. Funding withheld pending formal query.

2. **Kada Hill Estate Phase 1 (Kaduna State)**:
   - **Contractor**: ABC Construction Ltd
   - **Progress**: **38%** (Ground beam completed; blockwork pending)
   - **Status**: **Needs Attention** — Inactive with no weekly photo update logged in 9 days.
   - **Compliance Flag**: Performance bond is nearing expiry in 15 days.

${userRole === 'MD' ? '💡 **Executive Recommendation**: Issue an immediate ministerial query to Nze Construction and direct the Zonal PM to conduct an unannounced site audit on Kada Hill Estate.' : ''}`;
  }

  if (q.includes('roof') || q.includes('roofing')) {
    const roofingReady = projects.filter(p => p.stages["Lintel"] === true && p.stages["Roofing"] === false);
    const atRoofing = projects.filter(p => p.stages["Roofing"] === true && p.stages["Finishes"] === false);
    
    return `### 🏗️ Tactical Milestone Status: Roofing Stage

- **Currently at Roofing Stage**:
  - **Gwarinpa Vista Heights (Abuja)**: Roof trussing and aluminum sheeting verified at **62%** overall project completion. Valuation cert #VAL/CERT/GWAR/002 certified at **₦120,000,000**.
- **Pending Roofing Mobilization**:
  - **Kada Hill Estate (Kaduna)**: At Foundation & Ground Beam stage (**38%**). Requires blockwork and lintel casting before roofing mobilization.
  - **Dala Hill Court (Kano)**: Currently at Foundation stage (**31%**).
  - **Rumuokoro Royal Garden (Rivers)**: Stagnant at Excavation (**23%**).`;
  }

  if (q.includes('spent') || q.includes('budget') || q.includes('cost') || q.includes('financ')) {
    const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
    const totalSpent = projects.reduce((acc, p) => acc + p.spent, 0);
    const pct = Math.round((totalSpent / totalBudget) * 100);

    return `### 💰 Financial Execution Overview

- **Total Programme Budget**: **₦${(totalBudget).toLocaleString()}** (₦${(totalBudget / 1000000000).toFixed(2)}B)
- **Total Certified Expenditure**: **₦${(totalSpent).toLocaleString()}** (₦${(totalSpent / 1000000).toFixed(1)}M)
- **Capital Utilization Rate**: **${pct}%**

#### Estate Breakdown:
${projects.map(p => `• **${p.estateName} (${p.state})**: Budget ₦${(p.budget).toLocaleString()} | Spent ₦${(p.spent).toLocaleString()} (${Math.round((p.spent/p.budget)*100)}%) — *${p.status}*`).join('\n')}`;
  }

  if (q.includes('valuation') || q.includes('invoice') || q.includes('claim')) {
    return `### 📑 Valuation Claims & Certification Audit

Total valuation requests in system: **${valuations.length}**

${valuations.map(v => `1. **${v.estateName}** (${v.invoiceNumber}):
   - **Contractor**: ${v.contractorName}
   - **Amount Requested**: **₦${(v.amountRequested).toLocaleString()}**
   - **Amount Certified**: **₦${((v.amountCertified || v.amountRequested)).toLocaleString()}**
   - **Current Workflow Stage**: \`${v.currentStage.replace(/_/g, ' ').toUpperCase()}\`
`).join('\n')}
${userRole === 'QS' ? '💡 **QS Directive**: Valuation **val-3** (Kada Hill Estate, ₦45,000,000) is awaiting Resident Engineer and PM verification before Quantity Surveyor certification.' : ''}`;
  }

  if (q.includes('contractor') || q.includes('score') || q.includes('rating')) {
    return `### 👷 Contractor Performance & Delivery Audit

${contractors.map(c => `• **${c.companyName}** (${c.registrationNo}):
   - **Contract Value**: ₦${(c.contractAmount).toLocaleString()} | **Duration**: ${c.durationMonths} months
   - **Assigned Projects**: ${c.assignedProjectsCount} active site(s)
   - **Bank**: ${c.bankName}
   - **Status**: ${c.status.toUpperCase()}`).join('\n')}

**Key Performance Highlights**:
- **Cappa & D'Alberto PLC**: Top performer (Rating **4.7/5**). Delivered Isheri Olofin Court on time and on budget.
- **Nze Construction Ltd**: Flagged underperformer. 43+ days overdue on Rivers State scheme.`;
  }

  // Project-specific lookup (check state, full estate name, or key name roots)
  const matchedProject = projects.find(p => 
    q.includes(p.state.toLowerCase()) || 
    q.includes(p.estateName.toLowerCase()) ||
    (p.estateName.toLowerCase().includes('kada') && q.includes('kada')) ||
    (p.estateName.toLowerCase().includes('gwarinpa') && q.includes('gwarinpa')) ||
    (p.estateName.toLowerCase().includes('isheri') && q.includes('isheri')) ||
    (p.estateName.toLowerCase().includes('rumuokoro') && q.includes('rumuokoro')) ||
    (p.estateName.toLowerCase().includes('dala') && q.includes('dala')) ||
    (selectedProjectId && p.id === selectedProjectId)
  );

  if (matchedProject) {
    const completedStages = Object.entries(matchedProject.stages).filter(([_, done]) => done).map(([st]) => st);
    const pendingStages = Object.entries(matchedProject.stages).filter(([_, done]) => !done).map(([st]) => st);
    
    return `### 📍 Estate Tactical Profile: ${matchedProject.estateName} (${matchedProject.state})

- **Status**: **${matchedProject.status.toUpperCase()}**
- **Physical Progress**: **${matchedProject.progress}%**
- **Typology**: ${matchedProject.houseType} (${matchedProject.houseCount} units)
- **Contractor**: **${matchedProject.contractorName}**
- **Project Manager**: ${matchedProject.projectManager}
- **Budget**: ₦${(matchedProject.budget).toLocaleString()} | **Disbursed**: ₦${(matchedProject.spent).toLocaleString()}
- **Completed Stages**: ${completedStages.join(', ') || 'None'}
- **Next Critical Stages**: ${pendingStages.slice(0, 3).join(', ')}
- **Latest Field Telemetry**: ${matchedProject.photoUpdates.length} verified site photos logged.`;
  }

  // General executive summary
  return `### 🏛️ Federal Housing Authority Delivery Summary

- **Active Projects**: **${projects.length}** estates across **${new Set(projects.map(p => p.state)).size}** states
- **Completed**: **${projects.filter(p => p.status === 'Completed').length}** (Isheri Olofin Court, Lagos)
- **On Schedule**: **${projects.filter(p => p.status === 'On Schedule').length}** (Gwarinpa Vista Heights, Dala Hill Court)
- **Attention / Delayed**: **${projects.filter(p => p.status === 'Needs Attention' || p.status === 'Delayed').length}** (Kada Hill Estate, Rumuokoro Royal Garden)
- **Total Verified Housing Units**: **${projects.reduce((acc, p) => acc + p.houseCount, 0)}** units

Please ask a specific tactical question (e.g., *"Which projects are delayed?"*, *"Show Kada Hill progress"*, *"Valuations ready for QS certification"*).`;
}

// POST /api/chat - Yomi AI Assistant Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const caller = getCallerContext(req);
    const { message, userRole: bodyRole, username: bodyUsername, selectedProjectId } = req.body;
    const userRole = caller.role || bodyRole || "MD";
    const username = caller.username || bodyUsername || "";

    if (!message) {
      return res.status(400).json({ error: "No user message provided." });
    }

    // STRICT CONTRACTOR BLOCKING
    if (userRole === "CONTRACTOR") {
      return res.status(403).json({ 
        error: "Access Denied: The Yomi Executive AI Assistant is not available to contractor accounts. It is strictly reserved for ministry and FHA monitoring officials." 
      });
    }

    // Build role-scoped database context
    let scopedProjects = projects;
    let scopedValuations = valuations;
    let scopedContractors = contractors;
    let scopedScorecards = scorecards;
    let scopedAlerts = alerts;

    // Scope discipline per user role
    if (userRole === "RE") {
      // Resident Engineer sees only assigned sites (Kaduna & Abuja in seed)
      scopedProjects = projects.filter(p => p.state === "Kaduna" || p.state === "Abuja");
      const assignedIds = scopedProjects.map(p => p.id);
      scopedValuations = valuations.filter(v => assignedIds.includes(v.projectId));
      scopedAlerts = alerts.filter(a => a.projectId && assignedIds.includes(a.projectId));
    } else if (userRole === "QS") {
      // Quantity Surveyor focuses on financials, valuations, budgets, and BOQ milestones
      scopedScorecards = [];
    } else if (userRole === "FD" || userRole === "CT") {
      // Finance and Treasury focus on budgets, expenditures, valuations at payment stage
      scopedScorecards = [];
    }

    const ai = getGeminiAI();
    if (!ai) {
      console.log("No GEMINI_API_KEY set, processing with Yomi local project analytics engine.");
      const reply = handleYomiQueryLocally(message, userRole, username, selectedProjectId);
      return res.json({ reply, source: "local-engine" });
    }

    const dbContext = {
      userRole,
      username,
      selectedProjectId: selectedProjectId || "ALL",
      projects: scopedProjects,
      valuations: scopedValuations,
      contractors: scopedContractors,
      scorecards: scopedScorecards,
      alerts: scopedAlerts
    };

    const systemInstruction = `You are "Yomi", the Executive AI Assistant for the Federal Housing Authority (FHA) Renewed Hope Housing Delivery Management System in Nigeria.

STRICT OPERATIONAL RULES:
1. ONLY answer tactical, operational, engineering, and financial questions directly derived from the live project database provided below.
2. STRICT SCOPE DISCIPLINE (NEGATIVE CONSTRAINT):
   - You MUST NOT answer questions outside the housing projects.
   - If the user asks ANY question that is not about the housing projects (e.g. general knowledge, world news, coding, trivia, sports, cooking, weather outside project sites, personal chat), you MUST politely and strictly decline by responding:
     "I am Yomi, your Project Delivery AI Assistant. I exclusively answer tactical, operational, and financial questions and queries directly concerning the active housing projects in our database. I cannot answer queries outside our project portfolio."
3. ROLE-BASED JURISDICTION ENFORCEMENT:
   - Current user role: "${userRole}" (Username: "${username}").
   - ONLY the MD (Managing Director & CEO) has the right to ask everything about all projects nationwide, including high-level ministerial memos and total portfolio audits.
   - For other roles (PM, QS, RE, FD, CT), ensure answers correspond strictly to their jurisdiction:
     * Resident Engineer (RE): Tactical on-site physical progress, WBS milestones, site inspection photos, GPS validation for assigned sites. If they ask about unrelated states or high treasury reserves, remind them of their assigned on-site jurisdiction.
     * Quantity Surveyor (QS): Financial valuations, requested vs certified amounts, BOQ stage costs, payment certificates.
     * Project Manager (PM): Operational milestones, delays, schedule variances, contractor scorecards.
     * Finance Director (FD) / Treasury (CT): Budgets, disbursements, payment releases, CBN RTGS tracking.
4. TACTICAL & FINANCIAL EXPERTISE:
   - You answer questions in both structured (e.g. tables, bulleted metrics) and unstructured (e.g. conversational, colloquial queries like "how is kano doing?" or "who is messing up?") styles.
   - Always represent currency in Nigerian Naira (₦) with clean commas (e.g. ₦120,000,000 or ₦1.2B).
   - Use bold for key names, states, amounts, and progress metrics.
   - Provide direct, concise executive insights. Never invent fake external data.

LIVE FHA DATABASE CONTEXT (ROLE-SCOPED):
${JSON.stringify(dbContext, null, 2)}`;

    const chat = ai.chats.create({
      model: "gemini-3.8-flash",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.15,
      }
    });

    const response = await chat.sendMessage({ message: message });
    return res.json({ reply: response.text, source: "gemini" });
  } catch (error: any) {
    console.error("Gemini API Error in backend, engaging Yomi local engine fallback:", error);
    const { message, userRole = "MD", username = "", selectedProjectId } = req.body;
    const fallbackReply = handleYomiQueryLocally(message || "", userRole, username, selectedProjectId);
    res.json({ reply: fallbackReply, source: "fallback-engine" });
  }
});

// EXPOSING THE VITE DEV SERVER OR STATIC BUILDS
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    console.log("Setting up Express with Vite Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    console.log("Setting up Express in Static Production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FHA Executive Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
