"use client";

import { RotateCcw } from "lucide-react";

export type DashboardFilters = {
  state: string;
  district: string;
  constituency: string;
  dateFrom: string;
  dateTo: string;
  workType: string;
  riskLevel: string;
  agency: string;
};

export const DEFAULT_FILTERS: DashboardFilters = {
  state: "All",
  district: "All",
  constituency: "All",
  dateFrom: "",
  dateTo: "",
  workType: "All",
  riskLevel: "All",
  agency: "All",
};

type FilterBarProps = {
  filters: DashboardFilters;
  options: {
    states: string[];
    districts: string[];
    constituencies: string[];
    workTypes: string[];
    agencies: string[];
  };
  onChange: (filters: DashboardFilters) => void;
};

const SELECT_CLASS =
  "w-full rounded-lg border border-gov-border bg-white px-3 py-2 text-sm font-medium text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-glow)]";

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-[var(--text-muted)]">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT_CLASS}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar({ filters, options, onChange }: FilterBarProps) {
  const update = (patch: Partial<DashboardFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="rounded-xl border border-gov-border bg-[var(--bg-card)] p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="State"
          value={filters.state}
          options={options.states}
          onChange={(state) => update({ state })}
        />
        <SelectField
          label="District"
          value={filters.district}
          options={options.districts}
          onChange={(district) => update({ district })}
        />
        <SelectField
          label="Constituency"
          value={filters.constituency}
          options={options.constituencies}
          onChange={(constituency) => update({ constituency })}
        />
        <SelectField
          label="Work Type / Category"
          value={filters.workType}
          options={options.workTypes}
          onChange={(workType) => update({ workType })}
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Risk Level</span>
          <select
            value={filters.riskLevel}
            onChange={(e) => update({ riskLevel: e.target.value })}
            className={SELECT_CLASS}
          >
            <option value="All">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
        <SelectField
          label="Agency"
          value={filters.agency}
          options={options.agencies}
          onChange={(agency) => update({ agency })}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Date range</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => update({ dateFrom: e.target.value })}
              aria-label="Date range from"
              className={SELECT_CLASS}
            />
            <span className="text-[var(--text-muted)]">–</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => update({ dateTo: e.target.value })}
              aria-label="Date range to"
              className={SELECT_CLASS}
            />
          </div>
        </div>
        <div className="flex items-end justify-end sm:justify-start lg:justify-end">
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_FILTERS })}
            className="inline-flex h-9 w-auto items-center justify-center gap-2 rounded-lg border border-gov-border px-5 py-0 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
