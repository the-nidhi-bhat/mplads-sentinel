"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Eye, Search, MapPinned } from "lucide-react";
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

  return (
    <section className="space-y-6">
      <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">Project Evidence</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Browse tracked MPLADS projects and their audit priority scores.</p></div>
      <label className="flex max-w-xl items-center gap-2 rounded-lg border border-gov-border bg-[var(--bg-card)] px-3 py-2 text-[var(--text-muted)]"><Search className="h-4 w-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects, districts, or agencies" className="w-full bg-transparent text-sm outline-none" /></label>
      <div className="overflow-hidden rounded-xl border border-gov-border bg-[var(--bg-card)]"><table className="w-full text-left text-sm"><thead className="border-b border-gov-border text-xs text-[var(--text-muted)]"><tr><th className="p-4">Project</th><th className="p-4">Agency</th><th className="p-4">Risk</th><th className="p-4">Actions</th></tr></thead><tbody>{projects.map((project) => <tr key={project.id} className="border-b border-gov-border last:border-0"><td className="p-4"><p className="font-medium text-[var(--text-primary)]">{project.title}</p><p className="text-xs text-[var(--text-muted)]">{project.id} · {project.district || project.state}</p></td><td className="p-4 text-[var(--text-muted)]">{project.agency}</td><td className="p-4"><span className={`rounded border px-2 py-1 text-xs font-medium ${riskClasses[project.riskLevel]}`}>{project.riskLevel} · {project.riskScore}</span></td><td className="p-4 flex items-center gap-4"><Link href={`/projects/${encodeURIComponent(project.id)}`} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary-blue)] hover:underline"><Eye className="h-4 w-4" />View</Link><Link href={`/map?projectId=${encodeURIComponent(project.id)}`} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary-blue)] hover:underline"><MapPinned className="h-4 w-4" />Map</Link></td></tr>)}</tbody></table>{projects.length === 0 && <p className="p-6 text-center text-sm text-[var(--text-muted)]">No matching projects found.</p>}</div>
    </section>
  );
}
