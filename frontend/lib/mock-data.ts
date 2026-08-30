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

const STATE_COORDINATES: Record<string, [number, number]> = {
  "Andaman and Nicobar Islands": [11.7401, 92.6586],
  "Andhra Pradesh": [15.9129, 79.7400],
  "Arunachal Pradesh": [28.2180, 94.7278],
  "Assam": [26.2006, 92.9376],
  "Bihar": [25.0961, 85.3131],
  "Chandigarh": [30.7333, 76.7794],
  "Chhattisgarh": [21.2787, 81.8661],
  "Dadra and Nagar Haveli and Daman and Diu": [20.1809, 73.0169],
  "Delhi": [28.7041, 77.1025],
  "Goa": [15.2993, 74.1240],
  "Gujarat": [22.2587, 71.1924],
  "Haryana": [29.0588, 76.0856],
  "Himachal Pradesh": [31.1048, 77.1665],
  "Jammu and Kashmir": [33.7782, 76.5762],
  "Jharkhand": [23.6102, 85.2799],
  "Karnataka": [15.3173, 75.7139],
  "Kerala": [10.8505, 76.2711],
  "Ladakh": [34.1526, 77.5770],
  "Lakshadweep": [10.5667, 72.6417],
  "Madhya Pradesh": [22.9734, 78.6569],
  "Maharashtra": [19.7515, 75.7139],
  "Manipur": [24.6637, 93.9063],
  "Meghalaya": [25.4670, 91.3662],
  "Mizoram": [23.1645, 92.9376],
  "Nagaland": [26.1584, 94.5624],
  "Odisha": [20.9517, 85.0985],
  "Puducherry": [11.9416, 79.8083],
  "Punjab": [31.1471, 75.3412],
  "Rajasthan": [27.0238, 74.2179],
  "Sikkim": [27.5330, 88.5122],
  "Tamil Nadu": [11.1271, 78.6569],
  "Telangana": [18.1124, 79.0193],
  "Tripura": [23.9408, 91.9882],
  "Uttar Pradesh": [26.8467, 80.9462],
  "Uttarakhand": [30.0668, 79.0193],
  "West Bengal": [22.9868, 87.8550],
};

// Add a simple deterministic hash to generate small offset jitters for coordinates
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return hash;
}

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
      isPlaceholder: true,
    },
  ];

  let baseCoords = STATE_COORDINATES[row.state] || [20.5937, 78.9629];
  const hash = Math.abs(hashString(row.id));
  const offsetLat = ((hash % 100) - 50) / 40; // jitter up to +/- 1.25 degrees
  const offsetLng = (((Math.floor(hash / 100)) % 100) - 50) / 40;

  const coordinates: [number, number] = [
    baseCoords[0] + offsetLat,
    baseCoords[1] + offsetLng
  ];

  return {
    id: row.id,
    title: row.title,
    state: row.state,
    district: "",
    constituency: "",
    riskLevel,
    riskScore: row.riskScore,
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
    coordinates,
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
