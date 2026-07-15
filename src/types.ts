export interface Contractor {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  registrationNo: string;
  taxId: string;
  status: 'pending' | 'approved';
  onboardedDate: string;
  documents: {
    registration: string;
    taxCertificate: string;
    awardLetter: string;
    drawings: string;
    performanceBond: string;
  };
  contractAmount: number;
  durationMonths: number;
  bankName: string;
  accountNumber: string;
  insuranceExpiry: string;
  performanceBondExpiry: string;
  assignedProjectsCount: number;
  rating?: number;
}

export interface PhotoUpdate {
  stage: string;
  beforePhoto: string;
  afterPhoto: string;
  videoUrl?: string;
  gps: {
    lat: number;
    lng: number;
    accuracy: number;
    locationName: string;
  };
  timestamp: string;
  uploadedBy: string;
}

export interface Project {
  id: string;
  state: string; // e.g., "Kaduna", "Lagos", "Abuja"
  estateName: string;
  houseType: string;
  contractorId: string;
  contractorName: string;
  projectManager: string;
  stages: { [key: string]: boolean };
  progress: number; // 0 - 100
  status: 'On Schedule' | 'Needs Attention' | 'Delayed' | 'Completed';
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  budget: number;
  spent: number;
  timelineExceededDays: number;
  photoUpdates: PhotoUpdate[];
  lastUpdated: string;
  houseCount: number;
  assignmentStatus?: 'Pending' | 'Accepted' | 'Rejected';
  typologies?: { type: string; count: number }[];
}

export type ValuationStage =
  | 'request_valuation'
  | 'resident_engineer_verify'
  | 'project_manager_approve'
  | 'quantity_surveyor_certify'
  | 'finance_review'
  | 'executive_approve'
  | 'payment_released';

export interface ValuationHistory {
  stage: ValuationStage;
  date: string;
  actor: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

export interface ValuationRequest {
  id: string;
  projectId: string;
  estateName: string;
  houseType: string;
  contractorName: string;
  amountRequested: number;
  amountCertified?: number;
  currentStage: ValuationStage;
  dateCreated: string;
  history: ValuationHistory[];
  invoiceNumber: string;
  certificateNumber?: string;
}

export interface ContractorScorecard {
  id: string;
  contractorId: string;
  contractorName: string;
  projectName: string;
  scores: {
    quality: number; // 1-5
    timeliness: number; // 1-5
    safetyCompliance: number; // 1-5
    documentationQuality: number; // 1-5
    responsiveness: number; // 1-5
    defectsManagement: number; // 1-5
    variationManagement: number; // 1-5
  };
  overallRating: number; // average
  feedback: string;
  reviewedBy: string;
  dateCreated: string;
}

export interface RiskAlert {
  id: string;
  projectId?: string;
  projectName: string;
  contractorName?: string;
  state?: string;
  title: string;
  details: string;
  severity: 'high' | 'medium' | 'low';
  dateCreated: string;
  dateRaised?: string;
  category: 'timeline' | 'quality' | 'budget' | 'compliance' | 'activity';
  resolved: boolean;
  logs?: { date: string; action: string }[];
  actionTaken?: {
    type: 'query' | 'meeting' | 'withhold' | 'directive';
    details: string;
    date: string;
  };
}

export type UserRole = 'MD' | 'PM' | 'QS' | 'RE' | 'FD' | 'CT' | 'CONTRACTOR';

export interface User {
  username: string;
  name: string;
  role: UserRole;
  contractorId?: string; // only if role === 'CONTRACTOR'
  email: string;
}

export const CONSTRUCTION_STAGES = [
  "Site clearing",
  "Setting out",
  "Excavation",
  "Foundation",
  "Ground beam",
  "Block work",
  "Lintel",
  "Roofing",
  "Electrical",
  "Plumbing",
  "Finishes",
  "External works",
  "Completed"
];
