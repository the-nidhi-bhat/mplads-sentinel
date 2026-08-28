"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Eye, Search } from "lucide-react";
import { projectsData } from "@/lib/mock-data";

const riskClasses = {
  critical: "text-[var(--color-critical)] border-[var(--color-critical-border)] bg-[var(--color-critical-bg)]",
  high: "text-[var(--color-high)] border-[var(--color-high-border)] bg-[var(--color-high-bg)]",
  medium: "text-[var(--color-medium)] border-[var(--color-medium-border)] bg-[var(--color-medium-bg)]",
  low: "text-[var(--color-low)] border-[var(--color-low-border)] bg-[var(--color-low-bg)]",
};

export default function ProjectsPage() {
  return <Suspense fallback={<p className="text-sm text-[var(--text-muted)]">Loading projects...</p>}><ProjectsDirectory /></Suspense>;
}

function ProjectsDirectory() {
  const agency = useSearchParams().get("agency");
  const [search, setSearch] = useState("");
  const projects = projectsData.filter((project) => {
    const query = search.toLowerCase().trim();
    return (!agency || project.agency === agency) && (!query || `${project.id} ${project.title} ${project.district} ${project.agency}`.toLowerCase().includes(query));
  });

  return <div className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary-blue)]">Evidence workspace</p><h1 className="mt-1 text-xl font-extrabold text-[var(--text-primary)]">Project Evidence</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Browse tracked projects, risk scores, and the evidence behind each priority.</p></div><label className="flex max-w-xl items-center gap-2 rounded-lg border border-gov-border bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-muted)]"><Search className="h-4 w-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects, districts, or agencies" className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]" /></label><div className="overflow-hidden rounded-xl border border-gov-border bg-[var(--bg-card)]"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-gov-border bg-[var(--bg-card-hover)]">{["Project", "Location", "Agency", "Risk", "Finding", "Action"].map((header) => <th key={header} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">{header}</th>)}</tr></thead><tbody>{projects.map((project) => <tr key={project.id} className="border-b border-gov-border last:border-0 hover:bg-[var(--bg-card-hover)]"><td className="px-4 py-3"><p className="font-bold text-[var(--text-primary)]">{project.title}</p><p className="text-xs text-[var(--text-muted)]">{project.id}</p></td><td className="px-4 py-3 text-[var(--text-secondary)]">{project.district}, {project.state}</td><td className="px-4 py-3 text-[var(--text-secondary)]">{project.agency}</td><td className="px-4 py-3"><span className={`rounded border px-2 py-1 text-[11px] font-bold uppercase ${riskClasses[project.riskLevel]}`}>{project.riskScore} · {project.riskLevel}</span></td><td className="px-4 py-3 text-[var(--text-secondary)]">{project.primaryFinding}</td><td className="px-4 py-3"><Link href={`/projects/${encodeURIComponent(project.id)}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary-blue)] hover:underline"><Eye className="h-3.5 w-3.5" />Review</Link></td></tr>)}</tbody></table></div>{projects.length === 0 && <p className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">No projects match this search.</p>}</div></div>;
}
