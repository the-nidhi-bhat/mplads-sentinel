"use client";

import { useState } from "react";
import { Investigation, InvestigationStatus, STATUS_FLOW } from "../types";
import { RiskBadge, StatusBadge, RiskScoreGauge } from "./investigation-badges";
import {
  X,
  User,
  MapPin,
  Building2,
  FileText,
  Image as ImageIcon,
  Database,
  Satellite,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Send,
} from "lucide-react";

function formatINR(amount: number) {
  if (!amount || amount <= 0) return "₹0";
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

const EVIDENCE_ICONS: Record<string, any> = {
  document: FileText,
  image: ImageIcon,
  data: Database,
  satellite: Satellite,
};

export function InvestigationDetail({
  investigation,
  onClose,
  onUpdateStatus,
  onAddFinding,
}: {
  investigation: Investigation;
  onClose: () => void;
  onUpdateStatus: (id: string, status: InvestigationStatus) => void;
  onAddFinding: (id: string, note: string, actionTaken: string) => void;
}) {
  const [tab, setTab] = useState<"overview" | "evidence" | "timeline" | "findings">("overview");
  const [note, setNote] = useState("");
  const [action, setAction] = useState("");

  const currentIndex = STATUS_FLOW.indexOf(investigation.status);
  const utilizationPct = investigation.sanctionedAmount
    ? Math.round((investigation.utilizedAmount / investigation.sanctionedAmount) * 100)
    : 0;

  const submitFinding = () => {
    if (!note.trim()) return;
    onAddFinding(investigation.id, note.trim(), action.trim());
    setNote("");
    setAction("");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                {investigation.id} · {investigation.sector}
              </p>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5 truncate">{investigation.projectName}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {investigation.mpName}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {investigation.constituency}, {investigation.district}, {investigation.state}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {investigation.assignedTo}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100 shrink-0">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <RiskScoreGauge score={investigation.riskScore} level={investigation.riskLevel} size={64} />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <RiskBadge level={investigation.riskLevel} />
                <StatusBadge status={investigation.status} />
              </div>
              <p className="text-xs text-slate-500">
                Sanctioned {formatINR(investigation.sanctionedAmount)} · Utilized{" "}
                {formatINR(investigation.utilizedAmount)} ({utilizationPct}%)
              </p>
            </div>
          </div>

          {/* Workflow stepper */}
          <div className="mt-4">
            <div className="flex items-center">
              {STATUS_FLOW.map((step, i) => {
                const reachable = investigation.status !== "Escalated";
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <button
                      disabled={!reachable}
                      onClick={() => onUpdateStatus(investigation.id, step)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold border-2 transition ${
                        step === investigation.status
                          ? "bg-blue-600 border-blue-600 text-white"
                          : i < currentIndex
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-white border-slate-300 text-slate-400"
                      }`}
                      title={step}
                    >
                      {i < currentIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </button>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 ${i < currentIndex ? "bg-emerald-500" : "bg-slate-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-500">
              {STATUS_FLOW.map((step) => (
                <span key={step} className="w-16 text-center first:text-left last:text-right">
                  {step}
                </span>
              ))}
            </div>
            {investigation.status !== "Escalated" && investigation.status !== "Closed" && (
              <button
                onClick={() => onUpdateStatus(investigation.id, "Escalated")}
                className="mt-3 flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                <ShieldAlert className="h-3.5 w-3.5" /> Escalate for CBI/CVC referral
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-5">
          {(["overview", "evidence", "timeline", "findings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2.5 text-sm font-medium border-b-2 capitalize -mb-px ${
                tab === t ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
              {t === "evidence" && <span className="ml-1 text-xs text-slate-400">({investigation.evidence.length})</span>}
              {t === "findings" && <span className="ml-1 text-xs text-slate-400">({investigation.findings.length})</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "overview" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Why this project was flagged</h3>
              {investigation.anomalyReasons.map((r) => (
                <div key={r.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" /> {r.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 shrink-0">{r.weight}% weight</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{r.detail}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-orange-400" style={{ width: `${r.weight}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "evidence" && (
            <div className="space-y-3">
              {investigation.evidence.map((e) => {
                const Icon = EVIDENCE_ICONS[e.type] ?? FileText;
                return (
                  <div key={e.id} className="flex gap-3 rounded-lg border border-slate-200 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                      <Icon className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">{e.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{e.description}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {e.source} · added {e.addedOn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "timeline" && (
            <div className="space-y-0">
              {investigation.timeline.map((ev, i) => (
                <div key={ev.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-1.5" />
                    {i < investigation.timeline.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-slate-800">
                      <span className="font-medium">{ev.actor}</span> {ev.action}
                    </p>
                    {ev.note && <p className="text-xs text-slate-500 mt-0.5">{ev.note}</p>}
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {ev.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "findings" && (
            <div className="space-y-4">
              <div className="space-y-3">
                {investigation.findings.length === 0 && (
                  <p className="text-sm text-slate-400">No findings recorded yet.</p>
                )}
                {investigation.findings.map((f) => (
                  <div key={f.id} className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">{f.author}</span>
                      <span className="text-[11px] text-slate-400">{f.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1">{f.note}</p>
                    {f.actionTaken && (
                      <p className="text-xs text-blue-700 mt-1.5 font-medium">Action: {f.actionTaken}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-600 mb-2">Add finding / note</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Record what the auditor observed..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <input
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="Action taken (optional) — e.g. Recovery notice issued"
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <button
                  onClick={submitFinding}
                  className="mt-2 flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Send className="h-3.5 w-3.5" /> Save finding
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}