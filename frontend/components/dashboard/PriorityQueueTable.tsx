"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Eye,
  Search,
} from "lucide-react";
import type { Project } from "@/lib/mock-data";

type PriorityQueueTableProps = {
  projects: Project[];
};

const PAGE_SIZE = 20;

type SortKey = "riskScore" | "title";

type SortState = {
  key: SortKey;
  direction: "asc" | "desc";
};

const DEFAULT_SORT: SortState = { key: "riskScore", direction: "desc" };

const RISK_BADGE_CLASSES: Record<string, string> = {
  critical: "bg-[var(--color-critical-bg)] text-[var(--color-critical)] border-[var(--color-critical-border)]",
  high: "bg-[var(--color-high-bg)] text-[var(--color-high)] border-[var(--color-high-border)]",
  medium:
    "bg-[var(--color-medium-bg)] text-[var(--color-medium)] border-[var(--color-medium-border)]",
  low: "bg-[var(--color-low-bg)] text-[var(--color-low)] border-[var(--color-low-border)]",
};

export default function PriorityQueueTable({ projects }: PriorityQueueTableProps) {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

  useEffect(() => {
    setPage(0);
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) => {
      return (
        project.title.toLowerCase().includes(q) || project.id.toLowerCase().includes(q)
      );
    });
  }, [projects, query]);

  const sorted = useMemo(() => {
    const multiplier = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === "riskScore") {
        return (a.riskScore - b.riskScore) * multiplier;
      }
      return a.title.localeCompare(b.title) * multiplier;
    });
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);

  const visibleProjects = useMemo(
    () => sorted.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE),
    [sorted, clampedPage]
  );

  const from = sorted.length === 0 ? 0 : clampedPage * PAGE_SIZE + 1;
  const to = Math.min(sorted.length, (clampedPage + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    setSort((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: key === "riskScore" ? "desc" : "asc" };
    });
    setPage(0);
  };

  const renderSortIndicator = (key: SortKey) => {
    if (sort.key !== key) return null;
    return sort.direction === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5" />
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gov-border bg-[var(--bg-card)]">
      <div className="flex flex-col gap-3 border-b border-gov-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Priority Queue</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Prioritized for human review — identifies unusual patterns, does not establish
            wrongdoing
          </p>
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search project ID or name"
            className="w-full rounded-lg border border-gov-border bg-white py-2 pl-9 pr-3 text-sm font-medium text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-glow)]"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-gov-border bg-[var(--bg-card-hover)]">
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => toggleSort("title")}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                >
                  Project
                  {renderSortIndicator("title")}
                </button>
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                District
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Agency
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => toggleSort("riskScore")}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                >
                  Risk Score
                  {renderSortIndicator("riskScore")}
                </button>
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Risk Level
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Main Reason
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-[var(--text-muted)]"
                >
                  No projects match the selected filters.
                </td>
              </tr>
            ) : (
              visibleProjects.map((project) => (
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
                      href={`/projects/${encodeURIComponent(project.id)}`}
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
      {sorted.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-gov-border px-5 py-3">
          <p className="text-xs text-[var(--text-muted)]">
            Showing {from}–{to} of {sorted.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={clampedPage === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-gov-border px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Page {clampedPage + 1} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={clampedPage === pageCount - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gov-border px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
