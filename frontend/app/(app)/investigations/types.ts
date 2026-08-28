export type RiskLevel = "Critical" | "High" | "Medium" | "Low";

export type InvestigationStatus =
  | "New"
  | "Under Review"
  | "Field Verification"
  | "Finding Recorded"
  | "Closed"
  | "Escalated";

export interface AnomalyReason {
  id: string;
  label: string;
  detail: string;
  weight: number; // 0-100, contribution to overall risk score
}

export interface EvidenceItem {
  id: string;
  type: "document" | "image" | "data" | "satellite";
  title: string;
  description: string;
  source: string;
  addedOn: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
}

export interface Finding {
  id: string;
  author: string;
  timestamp: string;
  note: string;
  actionTaken?: string;
}

export interface Investigation {
  id: string;
  projectId: string;
  projectName: string;
  mpName: string;
  constituency: string;
  district: string;
  state: string;
  sector: string;
  sanctionedAmount: number; // in rupees
  utilizedAmount: number;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  status: InvestigationStatus;
  assignedTo: string;
  flaggedOn: string;
  lastUpdated: string;
  anomalyReasons: AnomalyReason[];
  evidence: EvidenceItem[];
  timeline: TimelineEvent[];
  findings: Finding[];
}

export const STATUS_FLOW: InvestigationStatus[] = [
  "New",
  "Under Review",
  "Field Verification",
  "Finding Recorded",
  "Closed",
];