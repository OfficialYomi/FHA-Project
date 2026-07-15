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
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "20mb" }));

// IN-MEMORY DATABASE SEED DATA
let users: User[] = [
  { name: "Hon. Oyetunde Oladimeji Ojo (MD)", username: "MD", role: "MD", email: "O.Ojo@fha.gov.ng" },
  { name: "Sikemi Yomi-Adeyanju (PM)", username: "PM", role: "PM", email: "s.yomi@fha.gov.ng" },
  { name: "Surv. Chukwuemeka Okafor (QS)", username: "QS", role: "QS", email: "c.okafor@fha.gov.ng" },
  { name: "Zainab Zubairu (RE)", username: "RE", role: "RE", email: "z.zubairu@fha.gov.ng" },
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
      { stage: "resident_engineer_verify", date: "2026-07-03", actor: "Resident Engineer Bello", status: "approved", comments: "Verified on-site completion of roof trussing and sheeting. Works are structurally sound." },
      { stage: "project_manager_approve", date: "2026-07-05", actor: "PM Bello", status: "approved", comments: "Project schedule matches and milestones have been checked." }
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
  const { id } = req.params;
  const contractor = contractors.find(c => c.id === id);
  if (!contractor) {
    return res.status(404).json({ error: "Contractor not found" });
  }
  contractor.status = "approved";
  res.json(contractor);
});

app.post("/api/contractors/:id/approve", (req, res) => {
  const { id } = req.params;
  const contractor = contractors.find(c => c.id === id);
  if (!contractor) {
    return res.status(404).json({ error: "Contractor not found" });
  }
  contractor.status = "approved";
  res.json(contractor);
});

app.get("/api/projects", (req, res) => {
  res.json(projects);
});

app.post("/api/projects/setup", (req, res) => {
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
  res.json(valuations);
});

app.post("/api/valuations", (req, res) => {
  const data = req.body;
  const project = projects.find(p => p.id === data.projectId);
  
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
        actor: project?.contractorName || "Contractor Representative",
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
        actor: project?.contractorName || "Contractor Representative",
        status: "approved",
        comments: data.comments || "Submitted formal progress valuation request."
      }
    ]
  };

  valuations.push(newValuation);
  res.status(201).json(newValuation);
});

app.post("/api/valuations/approve/:id", (req, res) => {
  const { id } = req.params;
  const { stage, actor, comments, status, amountCertified } = req.body;
  const val = valuations.find(v => v.id === id);
  if (!val) {
    return res.status(404).json({ error: "Valuation request not found" });
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
    return res.status(400).json({ error: "Cannot approve request in its current stage." });
  }

  const nextStage = STAGES_WORKFLOW[currentIdx + 1];
  
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
    actor: actor || "FHA Official",
    status: status || 'approved',
    comments: comments || `Approved at ${nextStage} stage.`
  });

  // If fully released, add budget spend to project
  if (val.currentStage === 'payment_released' && status === 'approved') {
    const project = projects.find(p => p.id === val.projectId);
    if (project) {
      project.spent += val.amountCertified || val.amountRequested;
    }
  }

  res.json(val);
});

app.post("/api/valuations/:id/approve", (req, res) => {
  const { id } = req.params;
  const { stage, actor, comments, status, amountCertified } = req.body;
  const val = valuations.find(v => v.id === id);
  if (!val) {
    return res.status(404).json({ error: "Valuation request not found" });
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
    return res.status(400).json({ error: "Cannot approve request in its current stage." });
  }

  const nextStage = STAGES_WORKFLOW[currentIdx + 1];
  
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
    actor: actor || "FHA Official",
    status: status || 'approved',
    comments: comments || `Approved at ${nextStage} stage.`
  });

  // If fully released, add budget spend to project
  if (val.currentStage === 'payment_released' && status === 'approved') {
    const project = projects.find(p => p.id === val.projectId);
    if (project) {
      project.spent += val.amountCertified || val.amountRequested;
    }
  }

  res.json(val);
});

app.get("/api/scorecards", (req, res) => {
  res.json(scorecards);
});

app.post("/api/scorecards/create", (req, res) => {
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
    feedback: data.feedback || "Good standard performance.",
    reviewedBy: data.reviewedBy || "Executive Evaluator",
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
    feedback: data.feedback || "Good standard performance.",
    reviewedBy: data.reviewedBy || "Executive Evaluator",
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
  res.json(alerts);
});

app.post("/api/alerts/create", (req, res) => {
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
  const { id } = req.params;
  const alert = alerts.find(a => a.id === id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  alert.resolved = true;
  res.json(alert);
});

app.post("/api/alerts/:id/resolve", (req, res) => {
  const { id } = req.params;
  const alert = alerts.find(a => a.id === id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  alert.resolved = true;
  res.json(alert);
});

app.post("/api/alerts/:id/action", (req, res) => {
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

  res.json({ success: true, user });
});

app.get("/api/overview", (req, res) => {
  const totalProjects = projects.length;
  const onScheduleCount = projects.filter(p => p.status === 'On Schedule').length;
  const delayedCount = projects.filter(p => p.status === 'Delayed').length;
  const attentionCount = projects.filter(p => p.status === 'Needs Attention').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  
  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = projects.reduce((acc, p) => acc + p.spent, 0);
  const activeContractors = contractors.filter(c => c.status === 'approved' && c.assignedProjectsCount > 0).length;
  const pendingValuations = valuations.filter(v => v.currentStage !== 'payment_released').length;

  res.json({
    projects,
    contractors,
    valuations,
    scorecards,
    alerts,
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

// AI EXECUTIVE ASSISTANT ENDPOINT (Module 9)
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No user message provided." });
    }

    const ai = getGeminiAI();
    if (!ai) {
      return res.status(503).json({ 
        error: "Gemini AI client is not configured on the server. Please check your GEMINI_API_KEY environment variable configuration.",
        isConfigError: true
      });
    }

    // Capture precise, current DB state for in-context reasoning
    const dbContext = {
      projects,
      contractors,
      valuations,
      scorecards,
      alerts
    };

    const systemInstruction = `You are the Executive AI Assistant for the Managing Director & CEO (MD/CEO) of the Federal Housing Authority (FHA) of Nigeria. 
Your primary goal is to provide analytical, direct, and instantaneous insight into the FHA Housing Delivery Programme based on the live database.

Here is the exact live status of the FHA Construction Database:
${JSON.stringify(dbContext, null, 2)}

Strict Guidelines for responses:
1. Always base answers on the live database provided. Highlight key names, states, numbers, and stats in **bold**.
2. Represent currencies in Nigerian Naira (NGN), formatted neatly (e.g. ₦120,000,000 or ₦1.2B).
3. Do not formulate mock conclusions or speak of missing data if it is clearly in the database above.
4. When asked "Which states are behind schedule?", point out projects in states with status "Delayed" or "Needs Attention".
   - E.g. Rivers state (Rumuokoro Royal Garden, delayed by 43+ days by Nze Construction) and Kaduna state (Kada Hill Estate, Needs Attention due to 9 days inactivity).
5. When asked "Which projects are ready for roofing?", identify projects where structural/brickwork/lintel stages are checked/completed but 'Roofing' is not yet ticked. Or look at projects that are close to that milestone (such as Gwarinpa Vista Heights which is currently AT roofing, or Kaduna which is at Foundation, etc.).
6. When asked "Which contractors are underperforming?", reference Nze Construction Ltd (rating 2.3/5, project delayed by 43+ days) or ABC Construction Ltd ( Kaduna site inactive for 9 days).
7. Suggest direct executive recommendations (e.g., 'Issue final warning', 'Hold payment valuation', 'Send PM for site inspection').
8. Keep your response highly readable, scannable, and formatted as a professional executive memo. Avoid dry programmer jargon.`;

    // Instantiate chat via official @google/genai SDK
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.15,
      }
    });

    const response = await chat.sendMessage({ message: message });
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API Error in backend:", error);
    res.status(500).json({ error: error.message || "An error occurred in the server-side Gemini execution." });
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
