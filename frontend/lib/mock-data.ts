/**
 * Type definitions and utility functions for project data.
 * All actual data comes from the backend API — no static/mock data.
 */

export type RiskLevel = "critical" | "high" | "medium" | "low";

export type EvidenceFactor = {
  factor: string;
  icon: string;
  observed: string;
  benchmark: string;
  deviation: string;
  points: string;
  riskClass: RiskLevel;
  devClass: "bad" | "warning" | "good";
  isPlaceholder?: boolean;
};

export type Investigation = {
  caseId: string;
  currentStep: number;
  stepDates: string[];
  notes: string;
};

export type Project = {
  id: string;
  title: string;
  district: string;
  state: string;
  constituency: string;
  riskLevel: RiskLevel;
  riskScore: number;
  confidence?: number;
  primaryFinding: string;
  exposure: string;
  assignedTo: string;
  agency: string;
  workType: string;
  sanctionedAmount: string;
  expenditure: string;
  expenditurePercent: number;
  sanctionDate: string;
  expectedCompletion: string;
  actualStatus: string;
  physicalProgress?: number;
  financialProgress?: number;
  coordinates: [number, number];
  evidence: EvidenceFactor[];
  investigation: Investigation | null;
};

export function countByRiskLevel(projects: Project[]): {
  critical: number;
  high: number;
  medium: number;
  low: number;
} {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  projects.forEach((project) => {
    if (project.riskLevel in counts) counts[project.riskLevel] += 1;
  });
  return counts;
}

export function countTotalAnomalies(projects: Project[]): number {
  return projects.reduce((total, project) => total + project.evidence.length, 0);
}
