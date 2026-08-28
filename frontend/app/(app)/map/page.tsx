"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Layers3, MapPinned, SlidersHorizontal } from "lucide-react";
import { projectsData, type RiskLevel } from "@/lib/mock-data";

const riskColors: Record<RiskLevel, string> = {
  critical: "#ff2d55",
  high: "#ff7a00",
  medium: "#ffe600",
  low: "#00f5a0",
};

const indiaBounds: [[number, number], [number, number]] = [[6.5, 68], [35.7, 97.5]];

const stateCenters: Record<string, [number, number]> = {
  "Andhra Pradesh": [15.9129, 79.74],
  "Arunachal Pradesh": [28.218, 94.7278],
  Assam: [26.2006, 92.9376],
  Bihar: [25.0961, 85.3131],
  Chhattisgarh: [21.2787, 81.8661],
  Goa: [15.2993, 74.124],
  Gujarat: [22.2587, 71.1924],
  Haryana: [29.0588, 76.0856],
  "Himachal Pradesh": [31.1048, 77.1734],
  Jharkhand: [23.6102, 85.2799],
  Karnataka: [15.3173, 75.7139],
  Kerala: [10.8505, 76.2711],
  "Madhya Pradesh": [22.9734, 78.6569],
  Maharashtra: [19.7515, 75.7139],
  Manipur: [24.6637, 93.9063],
  Meghalaya: [25.467, 91.3662],
  Mizoram: [23.1645, 92.9376],
  Nagaland: [26.1584, 94.5624],
  Odisha: [20.9517, 85.0985],
  Punjab: [31.1471, 75.3412],
  Rajasthan: [27.0238, 74.2179],
  Sikkim: [27.533, 88.5122],
  "Tamil Nadu": [11.1271, 78.6569],
  Telangana: [18.1124, 79.0193],
  Tripura: [23.9408, 91.9882],
  "Uttar Pradesh": [26.8467, 80.9462],
  Uttarakhand: [30.0668, 79.0193],
  "West Bengal": [22.9868, 87.855],
  Delhi: [28.7041, 77.1025],
};

function getProjectCoordinates(project: (typeof projectsData)[number], index: number): [number, number] {
  const [latitude, longitude] = project.coordinates;
  if (latitude !== 0 || longitude !== 0) return project.coordinates;
  const center = stateCenters[project.state] ?? [22.5937, 78.9629];
  const offset = (index % 5) - 2;
  return [center[0] + offset * 0.025, center[1] + offset * 0.025];
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const focusedProjectId = searchParams.get("project");
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
      map = L.map(mapRef.current, { maxBounds: indiaBounds, maxBoundsViscosity: 0.85 }).fitBounds(indiaBounds, { padding: [12, 12] });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 19, keepBuffer: 2 }).addTo(map);
      const coordinates = visibleProjects.map((project, index) => getProjectCoordinates(project, index));
      visibleProjects.forEach((project, index) => {
        const color = riskColors[project.riskLevel];
        const heatRadius = 1800 + project.riskScore * 55;
        L.circle(coordinates[index], { radius: heatRadius, color, fillColor: color, fillOpacity: 0.12, opacity: 0.35, weight: 1, className: "risk-heat-zone" }).addTo(map!);
        const marker = L.circleMarker(coordinates[index], { radius: Math.max(7, project.riskScore / 8), color, fillColor: color, fillOpacity: 0.92, weight: 3, opacity: 1, className: `risk-marker risk-marker-${project.riskLevel}` });
        marker.bindPopup(`<div class="risk-popup"><p class="risk-popup__eyebrow">${project.id} · ${project.riskLevel}</p><strong class="risk-popup__title">${project.title}</strong><p class="risk-popup__location">${project.district || "District unavailable"}, ${project.state}</p><p class="risk-popup__score">Risk score: ${project.riskScore}/100</p><div class="risk-popup__evidence"><strong>Evidence</strong><span>${project.evidence[0]?.factor || project.primaryFinding}</span></div><div class="risk-popup__actions"><a href="/projects/${encodeURIComponent(project.id)}">Check project evidence</a></div></div>`, { closeButton: false, className: "risk-popup-container", offset: [0, -4] }).addTo(map!);
        marker.on("mouseover", () => marker.openPopup());
      });
      const focusedProject = visibleProjects.find((project) => project.id === focusedProjectId);
      if (focusedProject) map.setView(getProjectCoordinates(focusedProject, visibleProjects.indexOf(focusedProject)), 12);
      requestAnimationFrame(() => map?.invalidateSize());
    });
    return () => { cancelled = true; map?.remove(); };
  }, [focusedProjectId, visibleProjects]);
  return <div className="space-y-4"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><style jsx global>{`.risk-map .risk-marker { filter: none; }.risk-map .risk-heat-zone { filter: blur(5px); }.risk-popup-container .leaflet-popup-content-wrapper { border-radius: 10px; padding: 0; }.risk-popup-container .leaflet-popup-content { margin: 0; width: 248px !important; }.risk-popup { padding: 12px; color: #172033; font-size: 12px; }.risk-popup__eyebrow { margin: 0 0 5px; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; }.risk-popup__title { display: block; font-size: 14px; line-height: 1.25; }.risk-popup__location, .risk-popup__score { margin: 5px 0 0; color: #64748b; }.risk-popup__evidence { display: grid; gap: 2px; margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0; }.risk-popup__evidence span { color: #334155; line-height: 1.35; }.risk-popup__actions { display: flex; margin-top: 11px; }.risk-popup__actions a { flex: 1; border-radius: 5px; background: #0b4dcc !important; color: #ffffff !important; padding: 8px 6px; text-align: center; font-size: 10px; font-weight: 700; text-decoration: none; }`}</style><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary-blue)] hover:underline"><ArrowLeft className="h-3.5 w-3.5" />Dashboard</Link><h1 className="mt-1 text-xl font-extrabold text-[var(--text-primary)]">GIS Risk Map</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Explore tracked projects by location and risk score.</p></div><label className="flex w-full items-center gap-2 rounded-lg border border-gov-border bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-secondary)] md:w-56"><SlidersHorizontal className="h-4 w-4 shrink-0 text-[var(--primary-blue)]" /><span className="sr-only">Risk index</span><select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as RiskLevel | "all")} className="w-full bg-transparent font-semibold outline-none"><option value="all">All risk levels</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><MapStat icon={MapPinned} label="Visible projects" value={visibleProjects.length} /><MapStat icon={Layers3} label="Risk index" value={riskFilter === "all" ? "All levels" : riskFilter} /><MapStat icon={SlidersHorizontal} label="Highest score" value={visibleProjects.length ? `${Math.max(...visibleProjects.map((project) => project.riskScore))}/100` : "-"} /></div><div ref={mapRef} className="risk-map h-[65vh] min-h-[420px] overflow-hidden rounded-xl border border-gov-border bg-slate-100" /></div>;
}

function MapStat({ icon: Icon, label, value }: { icon: typeof MapPinned; label: string; value: string | number }) {
  return <div className="flex items-center gap-3 rounded-xl border border-gov-border bg-[var(--bg-card)] p-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500"><Icon className="h-4 w-4" /></span><div className="min-w-0"><p className="text-base font-extrabold capitalize text-[var(--text-primary)]">{value}</p><p className="truncate text-[11px] font-semibold text-[var(--text-muted)]">{label}</p></div></div>;
}

