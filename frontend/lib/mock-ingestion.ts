export interface IngestionRow {
  project_id: string;
  mp_name: string;
  district: string;
  work_type: string;
  sanction_date: string;
  sanction_amount: string;
  expenditure_to_date: string;
  start_date: string;
  expected_end_date: string;
  actual_end_date: string;
  status: string; // source status value, e.g. "Ongoing", "Completed"
}

export type RowStatus = "valid" | "warning" | "rejected";

export interface ValidatedRow extends IngestionRow {
  _rowNumber: number;
  _validationStatus: RowStatus;
  issues: string[];
}

const CSV_FIELDS: (keyof IngestionRow)[] = [
  "project_id",
  "mp_name",
  "district",
  "work_type",
  "sanction_date",
  "sanction_amount",
  "expenditure_to_date",
  "start_date",
  "expected_end_date",
  "actual_end_date",
  "status",
];

const REQUIRED_FIELDS: (keyof IngestionRow)[] = ["project_id", "mp_name", "district", "work_type"];
const REQUIRED_LABELS: Partial<Record<keyof IngestionRow, string>> = {
  project_id: "project_id",
  mp_name: "mp_name",
  district: "district",
  work_type: "work_type",
};

const DATE_FIELDS: (keyof IngestionRow)[] = ["sanction_date", "start_date", "expected_end_date", "actual_end_date"];
const DATE_PATTERN = /^\d{1,2}\s[A-Za-z]{3}\s\d{4}$/; // e.g. "1 Oct 2025"

// ---------- CSV parsing (maps by header name, not column order) ----------

export function parseCSV(text: string): IngestionRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [];

  const headerCells = lines[0].split(",").map((h) => h.trim());
  const dataLines = lines.slice(1);

  return dataLines.map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row = {} as IngestionRow;
    CSV_FIELDS.forEach((field) => {
      const idx = headerCells.indexOf(field);
      (row as any)[field] = idx !== -1 ? cells[idx] ?? "" : "";
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
        issues.push({ level: "reject", message: `Missing ${REQUIRED_LABELS[field]}` });
      }
    });

    const sanctioned = Number(row.sanction_amount);
    if (row.sanction_amount && (Number.isNaN(sanctioned) || sanctioned <= 0)) {
      issues.push({ level: "reject", message: "sanction_amount is not a valid positive number" });
    }

    const expenditure = Number(row.expenditure_to_date);
    if (row.expenditure_to_date && Number.isNaN(expenditure)) {
      issues.push({ level: "reject", message: "expenditure_to_date is not a valid number" });
    } else if (
      !Number.isNaN(expenditure) &&
      !Number.isNaN(sanctioned) &&
      sanctioned > 0 &&
      expenditure > sanctioned * 1.2
    ) {
      issues.push({ level: "warn", message: "expenditure_to_date exceeds sanction_amount by more than 20%" });
    }

    DATE_FIELDS.forEach((field) => {
      const value = row[field];
      if (value && !DATE_PATTERN.test(String(value).trim())) {
        issues.push({ level: "warn", message: `${field} is not a recognizable date` });
      }
    });

    if (row.project_id) {
      if (seenIds.has(row.project_id)) {
        issues.push({ level: "reject", message: "Duplicate project_id (already seen in this file)" });
      } else {
        seenIds.add(row.project_id);
      }
    }

    const validationStatus: RowStatus = issues.some((i) => i.level === "reject")
      ? "rejected"
      : issues.length > 0
      ? "warning"
      : "valid";

    return {
      ...row,
      _rowNumber: idx + 1,
      _validationStatus: validationStatus,
      issues: issues.map((i) => i.message),
    };
  });
}

// ---------- Sample data generator ----------

const DISTRICTS = ["Belagavi", "Bagalkot", "Vijayapura", "Dharwad", "Chikkodi"];
const MPS = ["Smt. R. Deshmukh", "Shri V. Patil", "Shri K. Rao", "Shri S. Jadhav", "Smt. M. Hegde"];
const WORK_TYPES = ["Health", "Education", "Water & Sanitation", "Infrastructure", "Sports & Recreation"];
const STATUSES = ["Ongoing", "Completed", "Delayed", "Not Started"];
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
    const district = DISTRICTS[i % DISTRICTS.length];
    const mp = MPS[i % MPS.length];
    const workType = WORK_TYPES[(i + 2) % WORK_TYPES.length];
    const status = STATUSES[i % STATUSES.length];
    const sanctioned = 500000 + (i % 9) * 350000;
    const expenditure = Math.round(sanctioned * (0.3 + (i % 6) * 0.12));

    const sanctionDate = addDays(baseDate, i * 11);
    const startDate = addDays(sanctionDate, 20);
    const expectedEnd = addDays(startDate, 240 + (i % 5) * 30);
    const actualEndDate = status === "Completed" ? addDays(expectedEnd, (i % 3) * 10 - 10) : null;

    rows.push({
      project_id: `MPLADS-KA-${2000 + i}`,
      mp_name: mp,
      district,
      work_type: workType,
      sanction_date: formatDMY(sanctionDate),
      sanction_amount: String(sanctioned),
      expenditure_to_date: String(expenditure),
      start_date: formatDMY(startDate),
      expected_end_date: formatDMY(expectedEnd),
      actual_end_date: actualEndDate ? formatDMY(actualEndDate) : "",
      status,
    });
  }

  // Deliberately inject a handful of bad records so validation has something to catch
  if (rows[5]) rows[5].mp_name = "";
  if (rows[12]) rows[12].sanction_amount = "N/A";
  if (rows[18] && rows[3]) rows[18].project_id = rows[3].project_id;
  if (rows[25]) rows[25].expected_end_date = "2026/13/40";
  if (rows[33]) rows[33].district = "";

  const header = CSV_FIELDS.join(",");
  const lines = rows.map((r) => CSV_FIELDS.map((f) => (r as any)[f]).join(","));
  return [header, ...lines].join("\n");
}