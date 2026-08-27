"use client";

import { RiskLevel, InvestigationStatus } from "../types";
import {
  AlertTriangle,
  Clock,
  Search,
  MapPin,
  FileCheck,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

const RISK_STYLES: Record<RiskLevel, string> = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${RISK_STYLES[level]}`}
    >
      {level === "Critical" && <AlertTriangle className="h-3 w-3" />}
      {level}
    </span>
  );
}

const STATUS_STYLES: Record<InvestigationStatus, string> = {
  New: "bg-slate-100 text-slate-700 border-slate-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  "Field Verification": "bg-purple-50 text-purple-700 border-purple-200",
  "Finding Recorded": "bg-teal-50 text-teal-700 border-teal-200",
  Closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Escalated: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_ICONS: Record<InvestigationStatus, any> = {
  New: Clock,
  "Under Review": Search,
  "Field Verification": MapPin,
  "Finding Recorded": FileCheck,
  Closed: CheckCircle2,
  Escalated: ShieldAlert,
};

export function StatusBadge({ status }: { status: InvestigationStatus }) {
  const Icon = STATUS_ICONS[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

export function RiskScoreGauge({
  score,
  level,
  size = 56,
}: {
  score: number;
  level: RiskLevel;
  size?: number;
}) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colors: Record<RiskLevel, string> = {
    Critical: "#dc2626",
    High: "#ea580c",
    Medium: "#d97706",
    Low: "#059669",
  };
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[level]}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-800">{score}</span>
      </div>
    </div>
  );
}