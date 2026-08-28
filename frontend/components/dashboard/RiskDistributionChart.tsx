"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import { countByRiskLevel, type Project } from "@/lib/mock-data";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type RiskDistributionChartProps = {
  projects: Project[];
};

export default function RiskDistributionChart({ projects }: RiskDistributionChartProps) {
  const counts = useMemo(() => countByRiskLevel(projects), [projects]);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        fontFamily: "inherit",
        foreColor: "#64748b",
        background: "transparent",
      },
      colors: ["#059669", "#ca8a04", "#ea580c", "#dc2626"],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "50%",
          distributed: true,
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: {
        borderColor: "rgba(0,0,0,0.06)",
        yaxis: { lines: { show: true } },
      },
      xaxis: {
        categories: ["Low", "Medium", "High", "Critical"],
        labels: { style: { colors: "#64748b", fontSize: "11px", fontWeight: 600 } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: "#64748b" } },
        min: 0,
        forceNiceScale: true,
      },
      tooltip: {
        theme: "light",
        y: { formatter: (value: number) => `${value} Projects` },
      },
    }),
    []
  );

  const series = [
    {
      name: "Projects Count",
      data: [counts.low, counts.medium, counts.high, counts.critical],
    },
  ];

  return (
    <div className="rounded-xl border border-gov-border bg-[var(--bg-card)] p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">Risk Distribution</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Number of projects by AI risk level
        </p>
      </div>
      <Chart options={options} series={series} type="bar" height={260} />
    </div>
  );
}
