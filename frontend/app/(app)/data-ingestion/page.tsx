"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Database,
  RotateCcw,
  ServerCog,
  XCircle,
} from "lucide-react";

import KpiCard from "@/components/dashboard/KpiCard";

import UploadDropzone from "./UploadDropzone";
import IngestionProgress from "./IngestionProgress";
import DataPreviewTable from "./DataPreviewTable";
import ValidationIssuesPanel from "./ValidationIssuesPanel";

import {
  generateSampleCsv,
  parseCSV,
  validateRows,
  type ValidatedRow,
} from "@/lib/mock-ingestion";

type Stage = "idle" | "uploading" | "validating" | "done";

export default function DataIngestionPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileMeta, setFileMeta] = useState<{
    name: string;
    size: number;
  } | null>(null);

  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [committed, setCommitted] = useState(false);

  const runPipeline = (
    name: string,
    size: number,
    csvText: string
  ) => {
    setFileMeta({ name, size });
    setRows([]);
    setCommitted(false);
    setStage("uploading");
    setProgress(0);

    let uploadProgress = 0;

    const uploadTimer = setInterval(() => {
      uploadProgress += 18;

      if (uploadProgress >= 100) {
        uploadProgress = 100;
        clearInterval(uploadTimer);

        setProgress(100);
        setStage("validating");
        setProgress(0);

        let validationProgress = 0;

        const validationTimer = setInterval(() => {
          validationProgress += 22;

          if (validationProgress >= 100) {
            validationProgress = 100;
            clearInterval(validationTimer);

            const parsedRows = parseCSV(csvText);
            const validatedRows = validateRows(parsedRows);

            setRows(validatedRows);
            setStage("done");
          }

          setProgress(validationProgress);
        }, 140);

        return;
      }

      setProgress(uploadProgress);
    }, 140);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      runPipeline(
        file.name,
        file.size,
        String(reader.result || "")
      );
    };

    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const csv = generateSampleCsv(45);
    const size = new Blob([csv]).size;

    runPipeline(
      "sample_mplads_batch_45.csv",
      size,
      csv
    );
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
      valid: rows.filter((row) => row.status === "valid").length,
      warning: rows.filter((row) => row.status === "warning").length,
      rejected: rows.filter((row) => row.status === "rejected").length,
    }),
    [rows]
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-blue)] transition-colors hover:text-[var(--primary-blue-hover)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>

        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Data Ingestion
        </h1>

        <p className="max-w-2xl text-sm text-[var(--text-muted)]">
          Upload MPLADS project records for validation before they are
          queued for AI-based risk scoring. Records are checked for
          missing fields, invalid amounts and formatting issues before
          being accepted into the system.
        </p>
      </div>

      {/* Upload State */}
      {stage === "idle" && (
        <UploadDropzone
          onFile={handleFile}
          onLoadSample={handleLoadSample}
        />
      )}

      {/* Processing / Completed State */}
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
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <KpiCard
                  title="Total Records"
                  value={summary.total}
                  icon={Database}
                  iconVariant="blue"
                  trend="neutral"
                  trendLabel="Rows parsed"
                />

                <KpiCard
                  title="Valid Records"
                  value={summary.valid}
                  icon={CheckCircle2}
                  iconVariant="green"
                  trend="neutral"
                  trendLabel="Ready to ingest"
                />

                <KpiCard
                  title="Warnings"
                  value={summary.warning}
                  icon={AlertTriangle}
                  iconVariant="orange"
                  trend="neutral"
                  trendLabel="Needs review"
                />

                <KpiCard
                  title="Rejected"
                  value={summary.rejected}
                  icon={XCircle}
                  iconVariant="red"
                  trend="neutral"
                  trendLabel="Failed validation"
                />
              </div>

              {/* Validation Issues */}
              <ValidationIssuesPanel rows={rows} />

              {/* Data Preview */}
              <div>
                <h2 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                  Data preview
                </h2>

                <DataPreviewTable rows={rows} />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={summary.valid === 0 || committed}
                  onClick={() => setCommitted(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary-blue)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-blue-hover)] disabled:opacity-50"
                >
                  <ServerCog className="h-4 w-4" />

                  Ingest {summary.valid} valid record
                  {summary.valid === 1 ? "" : "s"}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400"
                >
                  <RotateCcw className="h-4 w-4" />
                  Upload another file
                </button>
              </div>

              {/* Success Message */}
              {committed && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {summary.valid} record
                  {summary.valid === 1 ? "" : "s"} queued for AI risk
                  scoring.

                  {summary.rejected > 0 &&
                    ` ${summary.rejected} rejected record${
                      summary.rejected === 1 ? "" : "s"
                    } were not ingested — fix and re-upload separately.`}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}