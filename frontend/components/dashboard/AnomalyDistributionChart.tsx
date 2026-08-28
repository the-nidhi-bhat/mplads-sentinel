"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import type { Project } from "@/lib/mock-data";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ANOMALY_CATEGORIES = ["Cost", "Timeline", "Duplicate", "Agency", "Progress-Expenditure"] as const;
type AnomalyCategory = (typeof ANOMALY_CATEGORIES)[number];

// Maps raw evidence factors onto the 5 reporting buckets.
//  - "Cost Anomaly"                                   -> Cost
//  - "Project Delay"                                  -> Timeline
//  - "Duplicate / Similar Work"                       -> Duplicate
//  - "Progress-Payment Mismatch"                      -> Progress-Expenditure
//  - "Payment Pattern", "Fund Utilization Anomaly"    -> Agency (ambiguous: these describe
//    how an agency disburses / utilizes funds, so they are grouped under the Agency bucket)
const FACTOR_TO_CATEGORY: Record<string, AnomalyCategory> = {
  "Cost Anomaly": "Cost",
  "Project Delay": "Timeline",
  "Duplicate / Similar Work": "Duplicate",
  "Payment Pattern": "Agency",
  "Fund Utilization Anomaly": "Agency",
  "Progress-Payment Mismatch": "Progress-Expenditure",
};

function countAnomalies(projects: Project[]): Record<AnomalyCategory, number> {
  const counts: Record<AnomalyCategory, number> = {
    Cost: 0,
    Timeline: 0,
    Duplicate: 0,
    Agency: 0,
    "Progress-Expenditure": 0,
  };
  projects.forEach((project) => {
    project.evidence.forEach((evidence) => {
      const category = FACTOR_TO_CATEGORY[evidence.factor] ?? "Agency";
      counts[category] += 1;
    });
  });
  return counts;
}

type AnomalyDistributionChartProps = {
  projects: Project[];
};

export default function AnomalyDistributionChart({ projects }: AnomalyDistributionChartProps) {
  const counts = useMemo(() => countAnomalies(projects), [projects]);
  const series = ANOMALY_CATEGORIES.map((category) => counts[category]);
  const total = series.reduce((sum, value) => sum + value, 0);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        toolbar: { show: false },
        fontFamily: "inherit",
        foreColor: "#64748b",
        background: "transparent",
      },
      labels: [...ANOMALY_CATEGORIES],
      colors: ["#dc2626", "#f97316", "#3b82f6", "#ca8a04", "#8b5cf6"],
      stroke: { colors: ["#ffffff"], width: 2 },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              name: { show: true, fontSize: "12px", fontWeight: 600, color: "#334155" },
              value: {
                show: true,
                fontSize: "20px",
                fontWeight: 800,
                color: "#0f172a",
                formatter: (value: string) => value,
              },
              total: {
                show: true,
                label: "Anomalies",
                color: "#64748b",
                fontSize: "11px",
                formatter: () => `${total}`,
              },
            },
          },
        },
      },
      legend: {
        position: "bottom",
        fontSize: "11px",
        labels: { colors: "#475569" },
        markers: { size: 8 },
      },
      dataLabels: { enabled: false },
      tooltip: {
        theme: "light",
        y: { formatter: (value: number) => `${value} evidence` },
      },
    }),
    [total]
  );

  return (
    <div className="rounded-xl border border-gov-border bg-[var(--bg-card)] p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">Anomaly Distribution</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Evidence factors grouped by anomaly type
        </p>
      </div>
      <Chart options={options} series={series} type="donut" height={260} />
    </div>
  );
}
