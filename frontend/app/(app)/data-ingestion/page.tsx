"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Database, CheckCircle2, AlertTriangle, XCircle, RotateCcw, ServerCog } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import UploadDropzone from "@/components/data-ingestion/UploadDropzone";
import IngestionProgress from "@/components/data-ingestion/IngestionProgress";
import DataPreviewTable from "@/components/data-ingestion/DataPreviewTable";
import ValidationIssuesPanel from "@/components/data-ingestion/ValidationIssuesPanel";
import { parseCSV, validateRows, generateSampleCsv, type ValidatedRow } from "@/lib/mock-ingestion";

type Stage = "idle" | "uploading" | "validating" | "done";

export default function DataIngestionPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [committed, setCommitted] = useState(false);

  const runPipeline = (name: string, size: number, csvText: string) => {
    setFileMeta({ name, size });
    setRows([]);
    setCommitted(false);
    setStage("uploading");
    setProgress(0);

    let p = 0;
    const uploadTimer = setInterval(() => {
      p += 18;
      if (p >= 100) {
        p = 100;
        clearInterval(uploadTimer);
        setProgress(100);
        setStage("validating");
        setProgress(0);

        let v = 0;
        const validateTimer = setInterval(() => {
          v += 22;
          if (v >= 100) {
            v = 100;
            clearInterval(validateTimer);
            const parsed = parseCSV(csvText);
            setRows(validateRows(parsed));
            setStage("done");
          }
          setProgress(v);
        }, 140);
      } else {
        setProgress(p);
      }
    }, 140);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => runPipeline(file.name, file.size, String(reader.result || ""));
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const csv = generateSampleCsv(45);
    const size = new Blob([csv]).size;
    runPipeline("sample_mplads_batch_45.csv", size, csv);
  };

  const handleReset = () => {
    setStage("idle");
    setFileMeta(null);
    setProgress(0);
    setRows([]);
    setCommitted(false);
  };

  const summary = useMemo(
    () => ({
      total: rows.length,
      valid: rows.filter((r) => r.status === "valid").length,
      warning: rows.filter((r) => r.status === "warning").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
    }),
    [rows]
  );

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-blue)] transition-colors hover:text-[var(--primary-blue-hover)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-[var(--text-primary)]">Data Ingestion</h1>
        <p className="text-sm text-[var(--text-muted)] max-w-2xl">
          Upload MPLADS project records for validation before they are queued for AI-based risk scoring. Records are
          checked for missing fields, invalid amounts and formatting issues before being accepted into the system.
        </p>
      </div>

      {stage === "idle" && <UploadDropzone onFile={handleFile} onLoadSample={handleLoadSample} />}

      {stage !== "idle" && fileMeta && (
        <div className="space-y-4">
          <IngestionProgress
            fileName={fileMeta.name}
            fileSize={fileMeta.size}
            stage={stage === "done" ? "done" : stage}
            progress={progress}
            onCancel={handleReset}
          />

          {stage === "done" && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <KpiCard title="Total Records" value={summary.total} icon={Database} iconVariant="blue" trend="neutral" trendLabel="Rows parsed" />
                <KpiCard title="Valid Records" value={summary.valid} icon={CheckCircle2} iconVariant="green" trend="neutral" trendLabel="Ready to ingest" />
                <KpiCard title="Warnings" value={summary.warning} icon={AlertTriangle} iconVariant="orange" trend="neutral" trendLabel="Needs review" />
                <KpiCard title="Rejected" value={summary.rejected} icon={XCircle} iconVariant="red" trend="neutral" trendLabel="Failed validation" />
              </div>

              <ValidationIssuesPanel rows={rows} />

              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Data preview</h2>
                <DataPreviewTable rows={rows} />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  disabled={summary.valid === 0 || committed}
                  onClick={() => setCommitted(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary-blue)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-blue-hover)] disabled:opacity-50"
                >
                  <ServerCog className="h-4 w-4" />
                  Ingest {summary.valid} valid record{summary.valid === 1 ? "" : "s"}
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400"
                >
                  <RotateCcw className="h-4 w-4" />
                  Upload another file
                </button>
              </div>

              {committed && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {summary.valid} record{summary.valid === 1 ? "" : "s"} queued for AI risk scoring.
                  {summary.rejected > 0 &&
                    ` ${summary.rejected} rejected record${summary.rejected === 1 ? "" : "s"} were not ingested — fix and re-upload separately.`}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}