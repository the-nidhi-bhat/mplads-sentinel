"use client";

import { FileSpreadsheet, X, Loader2, CheckCircle2 } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function IngestionProgress({
  fileName,
  fileSize,
  stage,
  progress,
  onCancel,
}: {
  fileName: string;
  fileSize: number;
  stage: "uploading" | "validating" | "done";
  progress: number;
  onCancel: () => void;
}) {
  const stageLabel =
    stage === "uploading" ? "Uploading file..." : stage === "validating" ? "Validating records..." : "Ingestion complete";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <FileSpreadsheet className="h-5 w-5 text-[var(--primary-blue)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{fileName}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatBytes(fileSize)}</p>
          </div>
        </div>
        <button onClick={onCancel} className="rounded-full p-1 hover:bg-slate-100 shrink-0">
          <X className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            {stage === "done" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--primary-blue)]" />
            )}
            {stageLabel}
          </span>
          <span className="text-slate-400">{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-200 ${stage === "done" ? "bg-emerald-500" : "bg-[var(--primary-blue)]"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}