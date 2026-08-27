"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import type { Project } from "@/lib/mock-data";

type PriorityQueueTableProps = {
  projects: Project[];
};

const RISK_BADGE_CLASSES: Record<string, string> = {
  critical: "bg-[var(--color-critical-bg)] text-[var(--color-critical)] border-[var(--color-critical-border)]",
  high: "bg-[var(--color-high-bg)] text-[var(--color-high)] border-[var(--color-high-border)]",
  medium:
    "bg-[var(--color-medium-bg)] text-[var(--color-medium)] border-[var(--color-medium-border)]",
  low: "bg-[var(--color-low-bg)] text-[var(--color-low)] border-[var(--color-low-border)]",
};

export default function PriorityQueueTable({ projects }: PriorityQueueTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gov-border bg-[var(--bg-card)]">
      <div className="border-b border-gov-border px-5 py-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">Priority Queue</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Prioritized for human review — identifies unusual patterns, does not establish
          wrongdoing
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-gov-border bg-[var(--bg-card-hover)]">
              {["Project", "District", "Agency", "Risk Score", "Risk Level", "Main Reason", "Action"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-[var(--text-muted)]"
                >
                  No projects match the selected filters.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-gov-border last:border-b-0 hover:bg-[var(--bg-card-hover)]"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--text-primary)]">{project.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{project.id}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{project.district}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    {project.agency}
                  </td>
                  <td className="px-4 py-3 font-bold text-[var(--text-primary)]">
                    {project.riskScore}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide border ${
                        RISK_BADGE_CLASSES[project.riskLevel]
                      }`}
                    >
                      {project.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {project.primaryFinding}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center gap-1.5 rounded border border-[var(--primary-blue)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-blue)] transition-colors hover:bg-[var(--primary-blue)] hover:text-white"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Evidence
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
