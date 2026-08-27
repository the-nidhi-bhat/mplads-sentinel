import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideProps } from "lucide-react";

export type KpiTrend = "up" | "down" | "neutral";

type KpiCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconVariant?: "blue" | "green" | "red" | "orange";
  trend?: KpiTrend;
  trendLabel?: string;
  iconProps?: LucideProps;
};

const ICON_VARIANTS: Record<NonNullable<KpiCardProps["iconVariant"]>, string> = {
  blue: "bg-blue-500/10 text-blue-500",
  green: "bg-emerald-500/10 text-emerald-500",
  red: "bg-red-500/10 text-red-500",
  orange: "bg-orange-500/10 text-orange-500",
};

const TREND_ICONS: Record<KpiTrend, LucideIcon> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
};

const TREND_COLORS: Record<KpiTrend, string> = {
  up: "text-[var(--color-critical)]",
  down: "text-[var(--color-low)]",
  neutral: "text-[var(--text-secondary)]",
};

export default function KpiCard({
  title,
  value,
  icon: Icon,
  iconVariant = "blue",
  trend = "neutral",
  trendLabel,
  iconProps,
}: KpiCardProps) {
  const TrendIcon = TREND_ICONS[trend];

  return (
    <div className="flex flex-col rounded-xl border border-gov-border bg-[var(--bg-card)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[0.8rem] font-semibold text-[var(--text-secondary)]">
          {title}
        </span>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            ICON_VARIANTS[iconVariant]
          }`}
        >
          <Icon className="h-4 w-4" {...iconProps} />
        </span>
      </div>
      <div className="text-2xl font-extrabold leading-tight text-[var(--text-primary)]">
        {value}
      </div>
      {trendLabel && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${TREND_COLORS[trend]}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
