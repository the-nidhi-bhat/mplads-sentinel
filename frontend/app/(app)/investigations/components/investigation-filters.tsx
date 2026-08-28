"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { InvestigationStatus, RiskLevel } from "../types";

const STATUSES: InvestigationStatus[] = [
  "New",
  "Under Review",
  "Field Verification",
  "Finding Recorded",
  "Closed",
  "Escalated",
];
const RISK_LEVELS: RiskLevel[] = ["Critical", "High", "Medium", "Low"];

export function InvestigationFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  riskFilter,
  onRiskChange,
  sortBy,
  onSortChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: InvestigationStatus | "All";
  onStatusChange: (v: InvestigationStatus | "All") => void;
  riskFilter: RiskLevel | "All";
  onRiskChange: (v: RiskLevel | "All") => void;
  sortBy: "risk" | "recent";
  onSortChange: (v: "risk" | "recent") => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by project, MP, constituency or district..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "risk" | "recent")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
        >
          <option value="risk">Sort: Risk score</option>
          <option value="recent">Sort: Most recent</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-xs font-medium text-slate-500 mr-1">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Risk:
        </span>
        <FilterPill active={riskFilter === "All"} onClick={() => onRiskChange("All")} label="All" />
        {RISK_LEVELS.map((r) => (
          <FilterPill key={r} active={riskFilter === r} onClick={() => onRiskChange(r)} label={r} />
        ))}

        <span className="text-xs font-medium text-slate-500 ml-3 mr-1">Status:</span>
        <FilterPill active={statusFilter === "All"} onClick={() => onStatusChange("All")} label="All" />
        {STATUSES.map((s) => (
          <FilterPill key={s} active={statusFilter === s} onClick={() => onStatusChange(s)} label={s} />
        ))}
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-medium border transition ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
      }`}
    >
      {label}
    </button>
  );
}