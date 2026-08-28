"use client";

import Link from "next/link";
import { Activity, ArrowUpRight, Building2, FolderKanban, ShieldAlert, type LucideIcon } from "lucide-react";
import { projectsData } from "@/lib/mock-data";

export default function AgencyWatchPage() {
  const agencies = Array.from(projectsData.reduce((groups, project) => {
    const current = groups.get(project.agency) ?? { agency: project.agency, projects: 0, highRisk: 0, totalScore: 0 };
    current.projects += 1;
    current.highRisk += project.riskLevel === "high" || project.riskLevel === "critical" ? 1 : 0;
    current.totalScore += project.riskScore;
    groups.set(project.agency, current);
    return groups;
  }, new Map<string, { agency: string; projects: number; highRisk: number; totalScore: number }>() ).values());
  agencies.sort((a, b) => b.totalScore / b.projects - a.totalScore / a.projects);

const agencyIconClasses = {
  red: "bg-red-500/10 text-red-500",
  orange: "bg-orange-500/10 text-orange-500",
  green: "bg-emerald-500/10 text-emerald-500",
};

  return (
    <div className="space-y-5">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary-blue)]">Performance patterns</p><h1 className="mt-1 text-xl font-extrabold text-[var(--text-primary)]">Agency Watch</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Compare implementing agencies across tracked projects and explainable risk signals.</p></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Summary label="Agencies tracked" value={agencies.length} icon={Building2} variant="blue" /><Summary label="Projects in view" value={projectsData.length} icon={FolderKanban} variant="green" /><Summary label="High-risk signals" value={agencies.reduce((total, agency) => total + agency.highRisk, 0)} icon={ShieldAlert} variant="red" /></div>
      <div className="overflow-hidden rounded-xl border border-gov-border bg-[var(--bg-card)]"><div className="border-b border-gov-border px-5 py-4"><h2 className="text-sm font-bold text-[var(--text-primary)]">Agency risk profile</h2><p className="text-xs text-[var(--text-muted)]">Signals support human review and do not establish wrongdoing.</p></div><div className="divide-y divide-[var(--border-color)]">{agencies.map((agency) => { const averageScore = Math.round(agency.totalScore / agency.projects); const tone = averageScore >= 80 ? "red" : averageScore >= 60 ? "orange" : "green"; return <div key={agency.agency} className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"><div className="flex min-w-0 items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${agencyIconClasses[tone]}`}><Activity className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate font-bold text-[var(--text-primary)]">{agency.agency}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{agency.projects} projects monitored</p></div></div><div className="flex items-center gap-5 text-right text-xs"><Metric label="Avg. score" value={`${averageScore}/100`} /><Metric label="High risk" value={agency.highRisk} /><Link href={`/projects?agency=${encodeURIComponent(agency.agency)}`} className="font-bold text-[var(--primary-blue)] hover:underline">View projects</Link></div></div>; })}</div></div>
    </div>
  );
}

function Summary({ label, value, icon: Icon, variant }: { label: string; value: number; icon: LucideIcon; variant: "blue" | "green" | "red" }) {
  const iconClasses = { blue: "bg-blue-500/10 text-blue-500", green: "bg-emerald-500/10 text-emerald-500", red: "bg-red-500/10 text-red-500" };
  return <div className="flex items-center gap-3 rounded-xl border border-gov-border bg-[var(--bg-card)] p-4"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClasses[variant]}`}><Icon className="h-4 w-4" /></span><div><p className="text-2xl font-extrabold text-[var(--text-primary)]">{value}</p><p className="text-xs text-[var(--text-muted)]">{label}</p></div></div>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div><p className="font-bold text-[var(--text-primary)]">{value}</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">{label}</p></div>;
}
