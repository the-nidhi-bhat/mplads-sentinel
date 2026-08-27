import rawRows from "./data/audit-dashboard.json";

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
  confidence: number;
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
  physicalProgress: number;
  financialProgress: number;
  coordinates: [number, number];
  evidence: EvidenceFactor[];
  investigation: Investigation | null;
};

// Raw rows parsed from frontend/lib/data/audit-dashboard.csv (example/placeholder data).
type CsvRow = {
  state: string;
  id: string;
  title: string;
  agency: string;
  riskScore: number;
  riskLevel: string;
  primaryFinding: string;
};

const RISK_LEVEL_ORDER: RiskLevel[] = ["critical", "high", "medium", "low"];

// Fields the CSV does not provide are filled with obvious placeholder values.
function rowToProject(row: CsvRow): Project {
  const riskLevel = (RISK_LEVEL_ORDER.includes(row.riskLevel as RiskLevel)
    ? row.riskLevel
    : "low") as RiskLevel;

  // One generic evidence entry per project so the dashboard has data to render.
  const evidence: EvidenceFactor[] = [
    {
      factor: row.primaryFinding,
      icon: "alert-triangle",
      observed: "",
      benchmark: "",
      deviation: "",
      points: "+0 Points",
      riskClass: riskLevel,
      devClass: riskLevel === "critical" || riskLevel === "high" ? "bad" : "warning",
    },
  ];

  return {
    id: row.id,
    title: row.title,
    state: row.state,
    district: "",
    constituency: "",
    riskLevel,
    riskScore: row.riskScore,
    confidence: 0,
    primaryFinding: row.primaryFinding,
    exposure: "",
    assignedTo: "",
    agency: row.agency,
    workType: "",
    sanctionedAmount: "",
    expenditure: "",
    expenditurePercent: 0,
    sanctionDate: "",
    expectedCompletion: "",
    actualStatus: "",
    physicalProgress: 0,
    financialProgress: 0,
    coordinates: [0, 0],
    evidence,
    investigation: null,
  };
}

// Example data loaded from the CSV (360 projects across all states/UTs).
// This is placeholder data — it will be replaced by the real backend.
export const projectsData: Project[] = (rawRows as unknown as CsvRow[]).map(rowToProject);

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
