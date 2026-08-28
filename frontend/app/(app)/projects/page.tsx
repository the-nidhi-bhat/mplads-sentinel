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

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary-blue)]">Project directory</p>
        <h1 className="mt-1 text-xl font-extrabold text-[var(--text-primary)]">Tracked projects</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Review projects and open explainable risk evidence.</p>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-gov-border bg-[var(--bg-card)] p-4 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search projects</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by ID, title, district, or agency" className="w-full rounded-lg border border-gov-border bg-[var(--bg-page)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary-blue)]" />
        </label>
        <p className="text-xs text-[var(--text-muted)]">{projects.length} projects</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-gov-border bg-[var(--bg-card)]">
        <div className="divide-y divide-[var(--border-color)]">
          {projects.map((project) => (
            <div key={project.id} className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--primary-blue)]">{project.id}</p>
                <h2 className="mt-1 truncate font-bold text-[var(--text-primary)]">{project.title}</h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{project.district}, {project.state} · {project.agency}</p>
              </div>
              <div className="flex items-center gap-5 text-xs">
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{project.riskScore}/100</p>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">Risk score</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 font-bold capitalize ${riskClasses[project.riskLevel]}`}>{project.riskLevel}</span>
                <Link href={`/projects/${encodeURIComponent(project.id)}`} aria-label={`View ${project.title}`} className="inline-flex items-center gap-1.5 font-bold text-[var(--primary-blue)] hover:underline"><Eye className="h-4 w-4" />View</Link>
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">No projects match this search.</p>}
        </div>
      </div>
    </div>
  );
}
