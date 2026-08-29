export interface IngestionRow {
  projectId: string;
  projectName: string;
  mpName: string;
  state: string;
  district: string;
  constituency: string;
  workType: string;
  agency: string;
  sanctionedAmount: string;
  utilizedAmount: string;
  sanctionDate: string;
  expectedCompletion: string;
  fundUtilizationPercent: string;
}

export type RowStatus = "valid" | "warning" | "rejected";

export interface ValidatedRow extends IngestionRow {
  _rowNumber: number;
  status: RowStatus;
  issues: string[];
}

const CSV_FIELDS: (keyof IngestionRow)[] = [
  "projectId",
  "projectName",
  "mpName",
  "state",
  "district",
  "constituency",
  "workType",
  "agency",
  "sanctionedAmount",
  "utilizedAmount",
  "sanctionDate",
  "expectedCompletion",
  "fundUtilizationPercent",
];

const FIELD_LABELS: Partial<Record<keyof IngestionRow, string>> = {
  projectId: "Project ID",
  projectName: "Project Name",
  mpName: "MP Name",
  state: "State",
  district: "District",
  constituency: "Constituency",
  sanctionedAmount: "Sanctioned Amount",
  expectedCompletion: "Expected Completion Date",
};

const REQUIRED_FIELDS = Object.keys(FIELD_LABELS) as (keyof IngestionRow)[];

const DATE_PATTERN = /^\d{1,2}\s[A-Za-z]{3}\s\d{4}$/;

// ---------- CSV parsing ----------

export function parseCSV(text: string): IngestionRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [];
  const dataLines = lines.slice(1); // first line is the header, skip it

  return dataLines.map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row = {} as IngestionRow;
    CSV_FIELDS.forEach((field, idx) => {
      (row as any)[field] = cells[idx] ?? "";
    });
    return row;
  });
}

// ---------- Validation ----------

export function validateRows(rows: IngestionRow[]): ValidatedRow[] {
  const seenIds = new Set<string>();

  return rows.map((row, idx) => {
    const issues: { level: "reject" | "warn"; message: string }[] = [];

    REQUIRED_FIELDS.forEach((field) => {
      if (!row[field] || !String(row[field]).trim()) {
        issues.push({ level: "reject", message: `Missing ${FIELD_LABELS[field]}` });
      }
    });

    const sanctioned = Number(row.sanctionedAmount);
    if (row.sanctionedAmount && (Number.isNaN(sanctioned) || sanctioned <= 0)) {
      issues.push({ level: "reject", message: "Sanctioned amount is not a valid positive number" });
    }

    const utilized = Number(row.utilizedAmount);
    if (row.utilizedAmount && Number.isNaN(utilized)) {
      issues.push({ level: "reject", message: "Utilized amount is not a valid number" });
    } else if (!Number.isNaN(utilized) && !Number.isNaN(sanctioned) && sanctioned > 0 && utilized > sanctioned * 1.2) {
      issues.push({ level: "warn", message: "Utilized amount exceeds sanctioned amount by more than 20%" });
    }

    const utilPct = Number(row.fundUtilizationPercent);
    if (row.fundUtilizationPercent && (Number.isNaN(utilPct) || utilPct < 0 || utilPct > 100)) {
      issues.push({ level: "warn", message: "Fund utilization percentage is out of the 0–100 range" });
    }

    if (row.expectedCompletion && !DATE_PATTERN.test(row.expectedCompletion.trim())) {
      issues.push({ level: "warn", message: "Expected completion date is not in DD Mon YYYY format" });
    }

    if (row.projectId) {
      if (seenIds.has(row.projectId)) {
        issues.push({ level: "reject", message: "Duplicate project ID (already seen in this file)" });
      } else {
        seenIds.add(row.projectId);
      }
    }

    const status: RowStatus = issues.some((i) => i.level === "reject")
      ? "rejected"
      : issues.length > 0
      ? "warning"
      : "valid";

    return { ...row, _rowNumber: idx + 1, status, issues: issues.map((i) => i.message) };
  });
}

// ---------- Sample data generator (for the "Load sample dataset" button) ----------

const CONSTITUENCIES = [
  { name: "Belagavi", district: "Belagavi", mp: "Smt. R. Deshmukh" },
  { name: "Chikkodi", district: "Belagavi", mp: "Shri V. Patil" },
  { name: "Bagalkot", district: "Bagalkot", mp: "Shri K. Rao" },
  { name: "Vijayapura", district: "Vijayapura", mp: "Shri S. Jadhav" },
  { name: "Dharwad", district: "Dharwad", mp: "Smt. M. Hegde" },
];
const WORK_TYPES = ["Health", "Education", "Water & Sanitation", "Infrastructure", "Sports & Recreation"];
const AGENCIES = ["Zilla Panchayat", "PWD", "Rural Development Dept", "Taluk Panchayat", "Municipal Corporation"];
const PROJECT_NOUNS = [
  "Community Health Sub-Centre",
  "Government Primary School Upgrade",
  "Drinking Water Supply Line",
  "Solar Street Lighting",
  "Community Hall Renovation",
  "Bore-well Installation",
  "Road Widening Works",
  "Anganwadi Building",
  "Sports Ground Development",
  "Public Library Construction",
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDMY(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function generateSampleCsv(rowCount = 45): string {
  const rows: IngestionRow[] = [];
  const baseDate = new Date(2025, 9, 1); // 1 Oct 2025

  for (let i = 0; i < rowCount; i++) {
    const c = CONSTITUENCIES[i % CONSTITUENCIES.length];
    const workType = WORK_TYPES[(i + 2) % WORK_TYPES.length];
    const agency = AGENCIES[(i + 1) % AGENCIES.length];
    const noun = PROJECT_NOUNS[i % PROJECT_NOUNS.length];
    const sanctioned = 500000 + (i % 9) * 350000;
    const utilized = Math.round(sanctioned * (0.4 + (i % 6) * 0.1));
    const utilPct = Math.round((utilized / sanctioned) * 100);

    rows.push({
      projectId: `MPLADS-KA-${2000 + i}`,
      projectName: `${noun} — Phase ${(i % 3) + 1}`,
      mpName: c.mp,
      state: "Karnataka",
      district: c.district,
      constituency: c.name,
      workType,
      agency,
      sanctionedAmount: String(sanctioned),
      utilizedAmount: String(utilized),
      sanctionDate: formatDMY(addDays(baseDate, i * 11)),
      expectedCompletion: formatDMY(addDays(baseDate, i * 11 + 240 + (i % 5) * 30)),
      fundUtilizationPercent: String(utilPct),
    });
  }

  // Deliberately inject a handful of bad records so validation has something to catch
  if (rows[5]) rows[5].projectName = "";
  if (rows[12]) rows[12].sanctionedAmount = "N/A";
  if (rows[18] && rows[3]) rows[18].projectId = rows[3].projectId;
  if (rows[25]) rows[25].fundUtilizationPercent = "142";
  if (rows[33]) rows[33].expectedCompletion = "2026/13/40";

  const header = CSV_FIELDS.join(",");
  const lines = rows.map((r) => CSV_FIELDS.map((f) => (r as any)[f]).join(","));
  return [header, ...lines].join("\n");
}