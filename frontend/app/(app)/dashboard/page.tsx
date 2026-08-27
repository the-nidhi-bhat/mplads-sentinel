"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Database,
  Cpu,
  AlertTriangle,
  ShieldAlert,
  Eye,
  Activity,
  ArrowLeft,
} from "lucide-react";
import {
  projectsData,
  countTotalAnomalies,
  type Project,
} from "@/lib/mock-data";
import KpiCard from "@/components/dashboard/KpiCard";
import FilterBar, { DEFAULT_FILTERS, type DashboardFilters } from "@/components/dashboard/FilterBar";
import RiskDistributionChart from "@/components/dashboard/RiskDistributionChart";
import AnomalyDistributionChart from "@/components/dashboard/AnomalyDistributionChart";
import PriorityQueueTable from "@/components/dashboard/PriorityQueueTable";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDate(value: string): Date | null {
  const match = /^(\d{1,2})\s+(\w{3})\s+(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const month = MONTHS.indexOf(match[2]);
  if (month === -1) return null;
  return new Date(Number(match[3]), month, Number(match[1]));
}

function uniqueSorted(values: string[]): string[] {
  return ["All", ...Array.from(new Set(values)).sort()];
}

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const filterOptions = useMemo(() => {
    const projects = projectsData;
    const byKey = (key: keyof Project) => projects.map((p) => String(p[key]));
    return {
      states: uniqueSorted(byKey("state")),
      districts: uniqueSorted(byKey("district")),
      constituencies: uniqueSorted(byKey("constituency")),
      workTypes: uniqueSorted(byKey("workType")),
      agencies: uniqueSorted(byKey("agency")),
    };
  }, []);

  const filteredProjects = useMemo<Project[]>(() => {
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to = filters.dateTo ? new Date(filters.dateTo) : null;

    return projectsData.filter((project) => {
      if (filters.state !== "All" && project.state !== filters.state) return false;
      if (filters.district !== "All" && project.district !== filters.district) return false;
      if (filters.constituency !== "All" && project.constituency !== filters.constituency)
        return false;
      if (filters.workType !== "All" && project.workType !== filters.workType) return false;
      if (filters.riskLevel !== "All" && project.riskLevel !== filters.riskLevel) return false;
      if (filters.agency !== "All" && project.agency !== filters.agency) return false;

      if (from || to) {
        const projectDate = parseDate(project.expectedCompletion);
        if (projectDate) {
          if (from && projectDate < from) return false;
          if (to && projectDate > to) return false;
        }
      }

      return true;
    });
  }, [filters]);

  const highRiskCount = useMemo(
    () => filteredProjects.filter((p) => p.riskLevel === "high").length,
    [filteredProjects]
  );
  const criticalCount = useMemo(
    () => filteredProjects.filter((p) => p.riskLevel === "critical").length,
    [filteredProjects]
  );
  const openInvestigations = useMemo(
    () => filteredProjects.filter((p) => p.investigation !== null).length,
    [filteredProjects]
  );
  const anomaliesFound = useMemo(
    () => countTotalAnomalies(filteredProjects),
    [filteredProjects]
  );

  const kpis = [
    { title: "Total Projects", value: filteredProjects.length, icon: Database, variant: "blue", trend: "neutral", trendLabel: "Projects in view" },
    { title: "Projects Analyzed", value: filteredProjects.length, icon: Cpu, variant: "blue", trend: "neutral", trendLabel: "AI-scored projects" },
    { title: "High-Risk Projects", value: highRiskCount, icon: AlertTriangle, variant: "orange", trend: "up", trendLabel: "Require review" },
    { title: "Critical Projects", value: criticalCount, icon: ShieldAlert, variant: "red", trend: "up", trendLabel: "Highest priority" },
    { title: "Open Investigations", value: openInvestigations, icon: Eye, variant: "green", trend: "neutral", trendLabel: "Active cases" },
    { title: "Anomalies Found", value: anomaliesFound, icon: Activity, variant: "red", trend: "up", trendLabel: "Evidence items" },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-blue)] transition-colors hover:text-[var(--primary-blue-hover)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Audit Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Explainable AI that identifies unusual patterns in project data — it does not
            establish wrongdoing.
          </p>
        </div>
      </div>

      <FilterBar filters={filters} options={filterOptions} onChange={setFilters} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            iconVariant={kpi.variant}
            trend={kpi.trend}
            trendLabel={kpi.trendLabel}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RiskDistributionChart projects={filteredProjects} />
        <AnomalyDistributionChart projects={filteredProjects} />
      </div>

      <PriorityQueueTable projects={filteredProjects} />
    </div>
  );
}
