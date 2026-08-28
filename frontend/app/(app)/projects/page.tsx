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
