import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { projectsData } from "@/lib/mock-data";

const riskText = { critical: "text-[var(--color-critical)]", high: "text-[var(--color-high)]", medium: "text-[var(--color-medium)]", low: "text-[var(--color-low)]" };

function metricValue(value: number | null | undefined) {
  return value == null ? "Not available in current data source" : `${value}%`;
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projectsData.find((item) => item.id === decodeURIComponent(id));
  if (!project) return <p className="text-sm text-[var(--text-muted)]">Project not found.</p>;

  const evidence = project.evidence.filter((item) => !item.isPlaceholder);
  const metrics = [["Risk score", `${project.riskScore}/100`, true], ["Confidence", metricValue(project.confidence), project.confidence != null], ["Physical", metricValue(project.physicalProgress), project.physicalProgress != null], ["Financial", metricValue(project.financialProgress), project.financialProgress != null]] as const;

  return <div className="space-y-5"><Link href="/projects" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary-blue)] hover:underline"><ArrowLeft className="h-3.5 w-3.5" />Back to projects</Link><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary-blue)]">{project.id}</p><h1 className="mt-1 text-2xl font-extrabold text-[var(--text-primary)]">{project.title}</h1><p className="mt-1 text-sm text-[var(--text-muted)]">{project.district}, {project.state} · {project.agency}</p></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{metrics.map(([label, value, available]) => <div key={label} className="rounded-xl border border-gov-border bg-[var(--bg-card)] p-4"><p className="text-xs text-[var(--text-muted)]">{label}</p><p className={`mt-1 ${available ? "text-xl font-extrabold text-[var(--text-primary)]" : "text-sm font-medium leading-snug text-[var(--text-muted)]"}`}>{value}</p></div>)}</div><div className="rounded-xl border border-gov-border bg-[var(--bg-card)]"><div className="border-b border-gov-border px-5 py-4"><h2 className="text-sm font-bold text-[var(--text-primary)]">Evidence factors</h2></div><div className="divide-y divide-[var(--border-color)]">{evidence.length === 0 ? <p className="px-5 py-4 text-sm text-[var(--text-muted)]">Evidence details are not available in the current data source.</p> : evidence.map((item) => <div key={item.factor} className="flex gap-3 px-5 py-4"><div className="mt-0.5">{item.devClass === "good" ? <CheckCircle2 className="h-5 w-5 text-[var(--color-low)]" /> : <AlertCircle className={`h-5 w-5 ${riskText[item.riskClass]}`} />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><p className="font-bold text-[var(--text-primary)]">{item.factor}</p><span className="text-xs font-bold text-[var(--text-muted)]">{item.points}</span></div><p className="mt-1 text-sm text-[var(--text-secondary)]">{item.observed}</p><p className="mt-1 text-xs text-[var(--text-muted)]">Benchmark: {item.benchmark} · {item.deviation}</p></div></div>)}</div></div></div>;
}
