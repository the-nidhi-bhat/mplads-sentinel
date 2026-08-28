"use client";

import { useMemo, useState } from "react";
import { INVESTIGATIONS as INITIAL_DATA } from "./mock-data";
import { Investigation, InvestigationStatus, RiskLevel } from "./types";
import { InvestigationCard } from "./components/investigation-card";
import { InvestigationFilters } from "./components/investigation-filters";
import { InvestigationDetail } from "./components/investigation-detail";
import { ShieldAlert, Search as SearchIcon, ClipboardList } from "lucide-react";

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>(INITIAL_DATA);
  const [view, setView] = useState<"active" | "history">("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvestigationStatus | "All">("All");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [sortBy, setSortBy] = useState<"risk" | "recent">("risk");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = investigations.filter((inv) =>
      view === "active"
        ? !["Closed", "Escalated"].includes(inv.status)
        : ["Closed", "Escalated"].includes(inv.status)
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (inv) =>
          inv.projectName.toLowerCase().includes(q) ||
          inv.mpName.toLowerCase().includes(q) ||
          inv.constituency.toLowerCase().includes(q) ||
          inv.district.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") list = list.filter((inv) => inv.status === statusFilter);
    if (riskFilter !== "All") list = list.filter((inv) => inv.riskLevel === riskFilter);

    return [...list].sort((a, b) =>
      sortBy === "risk" ? b.riskScore - a.riskScore : b.lastUpdated > a.lastUpdated ? 1 : -1
    );
  }, [investigations, view, search, statusFilter, riskFilter, sortBy]);

  const stats = useMemo(() => {
    const active = investigations.filter((i) => !["Closed", "Escalated"].includes(i.status));
    return {
      total: active.length,
      critical: active.filter((i) => i.riskLevel === "Critical").length,
      highRisk: active.filter((i) => i.riskLevel === "High").length,
      escalated: investigations.filter((i) => i.status === "Escalated").length,
    };
  }, [investigations]);

  const openInvestigation = investigations.find((i) => i.id === openId) ?? null;

  const handleUpdateStatus = (id: string, status: InvestigationStatus) => {
    setInvestigations((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status,
              lastUpdated: new Date().toISOString().slice(0, 10),
              timeline: [
                ...inv.timeline,
                {
                  id: `t-${Date.now()}`,
                  timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
                  actor: "You",
                  action: `moved the case to "${status}"`,
                },
              ],
            }
          : inv
      )
    );
  };

  const handleAddFinding = (id: string, note: string, actionTaken: string) => {
    setInvestigations((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              findings: [
                ...inv.findings,
                {
                  id: `f-${Date.now()}`,
                  author: "You",
                  timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
                  note,
                  actionTaken: actionTaken || undefined,
                },
              ],
            }
          : inv
      )
    );
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Investigation</h1>
        <p className="text-sm text-slate-500 mt-0.5">Review projects flagged by the anomaly detection engine</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active cases" value={stats.total} icon={ClipboardList} tone="blue" />
        <StatCard label="Critical" value={stats.critical} icon={ShieldAlert} tone="red" />
        <StatCard label="High risk" value={stats.highRisk} icon={ShieldAlert} tone="orange" />
        <StatCard label="Escalated" value={stats.escalated} icon={ShieldAlert} tone="slate" />
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200">
        <TabButton active={view === "active"} onClick={() => setView("active")} label="Active Investigations" />
        <TabButton active={view === "history"} onClick={() => setView("history")} label="Investigation History" />
      </div>

      <InvestigationFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        riskFilter={riskFilter}
        onRiskChange={setRiskFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchIcon className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">No cases match these filters</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((inv) => (
            <InvestigationCard key={inv.id} investigation={inv} onOpen={setOpenId} />
          ))}
        </div>
      )}

      {openInvestigation && (
        <InvestigationDetail
          investigation={openInvestigation}
          onClose={() => setOpenId(null)}
          onUpdateStatus={handleUpdateStatus}
          onAddFinding={handleAddFinding}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
        active ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: any;
  tone: "blue" | "red" | "orange" | "slate";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}