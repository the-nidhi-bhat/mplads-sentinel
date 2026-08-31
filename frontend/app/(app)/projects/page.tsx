"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Eye, Search } from "lucide-react";
import { Project, RiskLevel, projectsData } from "@/lib/mock-data";

const riskClasses: Record<RiskLevel, string> = {
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
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Projects</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {agency ? `Filtered to ${agency}` : "Browse MPLADS projects and open records for review."}
          </p>
        </div>
        <label className="relative block w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
          <span className="sr-only">Search projects</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ID, title, district, agency"
            className="h-11 w-full rounded-md border border-gov-border bg-[var(--bg-card)] pl-10 pr-3 text-sm text-[var(--text-primary)] shadow-sm"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-gov-border bg-[var(--bg-card)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gov-border text-left text-sm">
            <thead className="bg-[var(--bg-secondary)] text-xs uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-bold">Project</th>
                <th className="px-4 py-3 font-bold">Location</th>
                <th className="px-4 py-3 font-bold">Agency</th>
                <th className="px-4 py-3 font-bold">Risk</th>
                <th className="px-4 py-3 font-bold">Finding</th>
                <th className="px-4 py-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gov-border">
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--text-muted)]">
                    No projects match the current search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <tr className="transition hover:bg-[var(--bg-card-hover)]">
      <td className="max-w-xs px-4 py-3">
        <p className="font-bold text-[var(--text-primary)]">{project.id}</p>
        <p className="mt-1 truncate text-sm text-[var(--text-secondary)]" title={project.title}>
          {project.title}
        </p>
      </td>
      <td className="px-4 py-3 text-[var(--text-secondary)]">
        {project.district || project.state || "Not provided"}
      </td>
      <td className="px-4 py-3 text-[var(--text-secondary)]">{project.agency || "Not assigned"}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${riskClasses[project.riskLevel]}`}>
          {project.riskLevel}
        </span>
      </td>
      <td className="max-w-sm px-4 py-3 text-[var(--text-secondary)]">{project.primaryFinding}</td>
      <td className="px-4 py-3">
        <Link
          href={`/projects/${encodeURIComponent(project.id)}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gov-border px-3 text-sm font-bold text-[var(--text-primary)] transition hover:bg-[var(--bg-secondary)]"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View
        </Link>
      </td>
    </tr>
  );
}
