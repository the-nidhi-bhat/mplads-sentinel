"use client";

import { useState } from "react";
import { ChevronDown, AlertTriangle, XCircle } from "lucide-react";
import { ValidatedRow } from "@/lib/mock-ingestion";

export default function ValidationIssuesPanel({ rows }: { rows: ValidatedRow[] }) {
  const flagged = rows.filter((r) => r.status !== "valid");
  const [open, setOpen] = useState(flagged.some((r) => r.status === "rejected"));

  if (flagged.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        All records passed validation — no issues found.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
        <span>Validation issues ({flagged.length} record{flagged.length === 1 ? "" : "s"})</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {flagged.map((row) => (
            <div key={row._rowNumber} className="px-4 py-2.5 flex items-start gap-2.5">
              {row.status === "rejected" ? (
                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700">
                  Row {row._rowNumber} · {row.projectId || "Unknown ID"}
                </p>
                <ul className="text-xs text-slate-500 mt-0.5 list-disc list-inside space-y-0.5">
                  {row.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}