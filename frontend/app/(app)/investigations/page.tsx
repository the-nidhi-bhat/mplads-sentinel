"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
  Search,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { INVESTIGATIONS as INITIAL_DATA } from "./investigation-data";
import type {
  Investigation,
  InvestigationStatus,
  RiskLevel,
} from "./types";

import { InvestigationCard } from "./components/investigation-card";
import { InvestigationFilters } from "./components/investigation-filters";
import { InvestigationDetail } from "./components/investigation-detail";

type ViewMode = "active" | "history";
type SortOption = "risk" | "recent";
type FilterValue<T> = T | "All";

type StatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "blue" | "red" | "orange" | "slate";
};

type TabButtonProps = {
  active: boolean;
  onClick: () => void;
  label: string;
};

export default function InvestigationsPage() {
  const [investigations, setInvestigations] =
    useState<Investigation[]>(INITIAL_DATA);

  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<FilterValue<InvestigationStatus>>("All");
  const [riskFilter, setRiskFilter] =
    useState<FilterValue<RiskLevel>>("All");
  const [sortBy, setSortBy] = useState<SortOption>("risk");
  const [openId, setOpenId] = useState<string | null>(null);

  /* -------------------- Filter & Sort -------------------- */

  const filteredInvestigations = useMemo(() => {
    let result = investigations.filter((investigation) => {
      const isClosed = ["Closed", "Escalated"].includes(
        investigation.status
      );

      return view === "active" ? !isClosed : isClosed;
    });

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (investigation) =>
          investigation.projectName.toLowerCase().includes(query) ||
          investigation.mpName.toLowerCase().includes(query) ||
          investigation.constituency.toLowerCase().includes(query) ||
          investigation.district.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (investigation) => investigation.status === statusFilter
      );
    }

    if (riskFilter !== "All") {
      result = result.filter(
        (investigation) => investigation.riskLevel === riskFilter
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === "risk") {
        return b.riskScore - a.riskScore;
      }

      return b.lastUpdated.localeCompare(a.lastUpdated);
    });
  }, [
    investigations,
    view,
    search,
    statusFilter,
    riskFilter,
    sortBy,
  ]);

  /* -------------------- Statistics -------------------- */

  const stats = useMemo(() => {
    const activeInvestigations = investigations.filter(
      (investigation) =>
        !["Closed", "Escalated"].includes(investigation.status)
    );

    return {
      total: activeInvestigations.length,

      critical: activeInvestigations.filter(
        (investigation) => investigation.riskLevel === "Critical"
      ).length,

      highRisk: activeInvestigations.filter(
        (investigation) => investigation.riskLevel === "High"
      ).length,

      escalated: investigations.filter(
        (investigation) => investigation.status === "Escalated"
      ).length,
    };
  }, [investigations]);

  /* -------------------- Selected Investigation -------------------- */

  const openInvestigation = investigations.find(
    (investigation) => investigation.id === openId
  );

  /* -------------------- Handlers -------------------- */

  const handleUpdateStatus = (
    id: string,
    status: InvestigationStatus
  ) => {
    const now = new Date();

    setInvestigations((currentInvestigations) =>
      currentInvestigations.map((investigation) => {
        if (investigation.id !== id) {
          return investigation;
        }

        return {
          ...investigation,
          status,
          lastUpdated: now.toISOString().slice(0, 10),
          timeline: [
            ...investigation.timeline,
            {
              id: `t-${Date.now()}`,
              timestamp: now
                .toISOString()
                .slice(0, 16)
                .replace("T", " "),
              actor: "You",
              action: `moved the case to "${status}"`,
            },
          ],
        };
      })
    );
  };

  const handleAddFinding = (
    id: string,
    note: string,
    actionTaken: string
  ) => {
    const now = new Date();

    setInvestigations((currentInvestigations) =>
      currentInvestigations.map((investigation) => {
        if (investigation.id !== id) {
          return investigation;
        }

        return {
          ...investigation,
          findings: [
            ...investigation.findings,
            {
              id: `f-${Date.now()}`,
              author: "You",
              timestamp: now
                .toISOString()
                .slice(0, 16)
                .replace("T", " "),
              note,
              actionTaken: actionTaken || undefined,
            },
          ],
        };
      })
    );
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-blue)] transition-colors hover:text-[var(--primary-blue-hover)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>

        <h1 className="mt-1 text-xl font-bold text-slate-900">
          Investigation
        </h1>

        <p className="mt-0.5 text-sm text-slate-500">
          Review projects flagged by the anomaly detection engine
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Active cases"
          value={stats.total}
          icon={ClipboardList}
          tone="blue"
        />

        <StatCard
          label="Critical"
          value={stats.critical}
          icon={ShieldAlert}
          tone="red"
        />

        <StatCard
          label="High risk"
          value={stats.highRisk}
          icon={AlertTriangle}
          tone="orange"
        />

        <StatCard
          label="Escalated"
          value={stats.escalated}
          icon={ShieldAlert}
          tone="slate"
        />
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        <TabButton
          active={view === "active"}
          onClick={() => setView("active")}
          label="Active Investigations"
        />

        <TabButton
          active={view === "history"}
          onClick={() => setView("history")}
          label="Investigation History"
        />
      </div>

      {/* Filters */}
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

      {/* Investigation List */}
      {filteredInvestigations.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredInvestigations.map((investigation) => (
            <InvestigationCard
              key={investigation.id}
              investigation={investigation}
              onOpen={setOpenId}
            />
          ))}
        </div>
      )}

      {/* Investigation Detail */}
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

/* ============================================================
   Tab Button
   ============================================================ */

function TabButton({
  active,
  onClick,
  label,
}: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${
        active
          ? "border-blue-600 text-blue-700"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

/* ============================================================
   Statistics Card
   ============================================================ */

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: StatCardProps) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-slate-900">
          {value}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-500">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   Empty State
   ============================================================ */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Search className="mb-2 h-8 w-8 text-slate-300" />

      <p className="text-sm font-medium text-slate-600">
        No cases match these filters
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Try clearing search or filters
      </p>
    </div>
  );
}