"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { ValidatedRow } from "@/lib/mock-ingestion";

const STATUS_CONFIG = {
  valid: { label: "Valid", icon: CheckCircle2, className: "text-emerald-600" },
  warning: { label: "Warning", icon: AlertTriangle, className: "text-amber-600" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-red-600" },
} as const;

function formatINR(value: string) {
  const n = Number(value);
  if (Number.isNaN(n)) return value || "—";
  return `₹${(n / 100000).toFixed(1)}L`;
}

export default function DataPreviewTable({ rows }: { rows: ValidatedRow[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? rows : rows.slice(0, 12);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Project ID</th>
              <th className="px-3 py-2.5">Project Name</th>
              <th className="px-3 py-2.5">MP</th>
              <th className="px-3 py-2.5">District</th>
              <th className="px-3 py-2.5">Work Type</th>
              <th className="px-3 py-2.5 text-right">Sanctioned</th>
              <th className="px-3 py-2.5 text-right">Utilization %</th>
              <th className="px-3 py-2.5">Completion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((row) => {
              const cfg = STATUS_CONFIG[row.status];
              const Icon = cfg.icon;
              return (
                <tr
                  key={row._rowNumber}
                  className={row.status === "rejected" ? "bg-red-50/50" : row.status === "warning" ? "bg-amber-50/40" : ""}
                  title={row.issues.length ? row.issues.join(" · ") : undefined}
                >
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${cfg.className}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">{row.projectId || "—"}</td>
                  <td className="px-3 py-2 text-slate-700 max-w-[220px] truncate">{row.projectName || "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{row.mpName || "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{row.district || "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{row.workType || "—"}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{formatINR(row.sanctionedAmount)}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{row.fundUtilizationPercent || "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{row.expectedCompletion || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length > 12 && (
        <div className="border-t border-slate-100 px-3 py-2">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-xs font-semibold text-[var(--primary-blue)] hover:text-[var(--primary-blue-hover)]"
          >
            {showAll ? "Show fewer rows" : `Show all ${rows.length} rows`}
          </button>
        </div>
      )}
    </div>
  );
}