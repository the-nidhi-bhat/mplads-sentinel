"use client";

import { Investigation } from "../types";
import { RiskBadge, StatusBadge, RiskScoreGauge } from "./investigation-badges";
import { MapPin, User, ChevronRight, AlertTriangle } from "lucide-react";

function formatINR(amount: number) {
  if (!amount || amount <= 0) return "₹0";
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function InvestigationCard({
  investigation,
  onOpen,
}: {
  investigation: Investigation;
  onOpen: (id: string) => void;
}) {
  const topReasons = investigation.anomalyReasons.slice(0, 2);

  return (
    <button
      onClick={() => onOpen(investigation.id)}
      className={`group w-full text-left rounded-xl border bg-white p-4 transition hover:shadow-md hover:-translate-y-0.5 ${
        investigation.riskLevel === "Critical"
          ? "border-red-200 ring-1 ring-red-100"
          : investigation.riskLevel === "High"
          ? "border-orange-200"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <RiskScoreGauge score={investigation.riskScore} level={investigation.riskLevel} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 truncate">{investigation.projectName}</h3>
              {investigation.riskLevel === "Critical" && (
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1">
              <User className="h-3 w-3" /> {investigation.mpName}
              <span className="mx-1">·</span>
              <MapPin className="h-3 w-3" /> {investigation.constituency}, {investigation.district}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <RiskBadge level={investigation.riskLevel} />
              <StatusBadge status={investigation.status} />
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 shrink-0 mt-1" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {topReasons.map((r) => (
          <span
            key={r.id}
            className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] text-slate-600"
          >
            <AlertTriangle className="h-3 w-3 text-slate-400" />
            {r.label}
          </span>
        ))}
        {investigation.anomalyReasons.length > 2 && (
          <span className="text-[11px] text-slate-400 px-1 py-1">
            +{investigation.anomalyReasons.length - 2} more
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
        <span>Sanctioned: <b className="text-slate-700">{formatINR(investigation.sanctionedAmount)}</b></span>
        <span>Utilized: <b className="text-slate-700">{formatINR(investigation.utilizedAmount)}</b></span>
        <span>Flagged {investigation.flaggedOn}</span>
      </div>
    </button>
  );
}