"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Layers3, MapPinned, SlidersHorizontal } from "lucide-react";
import { projectsData, type RiskLevel } from "@/lib/mock-data";

const riskColors: Record<RiskLevel, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#059669",
};

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const visibleProjects = useMemo(
    () => riskFilter === "all" ? projectsData : projectsData.filter((project) => project.riskLevel === riskFilter),
    [riskFilter],
  );

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;
      map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(map);
      visibleProjects.forEach((project) => { const color = riskColors[project.riskLevel]; L.circleMarker(project.coordinates, { radius: Math.max(7, project.riskScore / 8), color, fillColor: color, fillOpacity: 0.8, weight: 2 }).bindPopup(`<strong>${project.title}</strong><br>${project.district}, ${project.state}<br>Risk score: ${project.riskScore}/100`).addTo(map!); });
    });
    return () => { cancelled = true; map?.remove(); };
  }, [visibleProjects]);
  return <div className="space-y-4"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary-blue)] hover:underline"><ArrowLeft className="h-3.5 w-3.5" />Dashboard</Link><h1 className="mt-1 text-xl font-extrabold text-[var(--text-primary)]">GIS Risk Map</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Explore tracked projects by location and risk score.</p></div><label className="flex w-full items-center gap-2 rounded-lg border border-gov-border bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-secondary)] md:w-56"><SlidersHorizontal className="h-4 w-4 shrink-0 text-[var(--primary-blue)]" /><span className="sr-only">Risk index</span><select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as RiskLevel | "all")} className="w-full bg-transparent font-semibold outline-none"><option value="all">All risk levels</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><MapStat icon={MapPinned} label="Visible projects" value={visibleProjects.length} /><MapStat icon={Layers3} label="Risk index" value={riskFilter === "all" ? "All levels" : riskFilter} /><MapStat icon={SlidersHorizontal} label="Highest score" value={visibleProjects.length ? `${Math.max(...visibleProjects.map((project) => project.riskScore))}/100` : "-"} /></div><div ref={mapRef} className="h-[65vh] min-h-[420px] overflow-hidden rounded-xl border border-gov-border bg-slate-100" /></div>;
}

function MapStat({ icon: Icon, label, value }: { icon: typeof MapPinned; label: string; value: string | number }) {
  return <div className="flex items-center gap-3 rounded-xl border border-gov-border bg-[var(--bg-card)] p-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500"><Icon className="h-4 w-4" /></span><div className="min-w-0"><p className="text-base font-extrabold capitalize text-[var(--text-primary)]">{value}</p><p className="truncate text-[11px] font-semibold text-[var(--text-muted)]">{label}</p></div></div>;
}
