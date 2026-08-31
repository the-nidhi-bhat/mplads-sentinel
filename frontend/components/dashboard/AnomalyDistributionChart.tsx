"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import type { Project } from "@/lib/mock-data";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ANOMALY_CATEGORIES = ["Cost", "Timeline", "Duplicate", "Agency", "Progress-Expenditure"] as const;
type AnomalyCategory = (typeof ANOMALY_CATEGORIES)[number];

// Maps the raw evidence factor (project's primary finding) onto the 5 reporting buckets.
// Keyed on the actual values present in the audit dataset so the donut shows real,
// proportional slices instead of everything collapsing into a single category.
const FACTOR_TO_CATEGORY: Record<string, AnomalyCategory> = {
  "Component cost anomaly": "Cost",
  "Cost deviation (+22%)": "Cost",
  "Cost anomaly (+31.2%)": "Cost",
  "Material cost spike (+28%)": "Cost",
  "Delayed by 180 days": "Timeline",
  "Minor delay in execution": "Timeline",
  "Slight milestone lag": "Timeline",
  "Delayed milestones": "Timeline",
  "Out-of-constituency funding deviation": "Duplicate",
  "Payment pattern anomaly": "Agency",
  "Suspicious rapid advance withdrawal": "Agency",
  "Low utilization (18%)": "Agency",
  "Low utilization (15%)": "Agency",
  "Low asset utilization": "Agency",
  "Zero photo compliance on 100% drawdown": "Agency",
  "Severe delay & payment mismatch": "Progress-Expenditure",
  "Milestone lag & cost overrun (+15%)": "Progress-Expenditure",
};

// Non-anomaly rows (e.g. "Normal progression") are excluded from the anomaly-type
// distribution so they don't skew the chart as a fake anomaly category.
const NON_ANOMALY_FACTORS: Set<string> = new Set(["Normal progression"]);

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
      if (NON_ANOMALY_FACTORS.has(evidence.factor)) return;
      const category = FACTOR_TO_CATEGORY[evidence.factor];
      if (!category) return;
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
      colors: ["#6366f1", "#06b6d4", "#8b5cf6", "#3b82f6", "#14b8a6"],
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
