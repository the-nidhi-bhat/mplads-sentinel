"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileUp, Loader2, XCircle } from "lucide-react";
import { API_BASE_URL, apiUrl } from "@/lib/api";

type JobStatus = "idle" | "queued" | "running" | "done" | "failed";

type StatusResponse = {
  job_id: string;
  status: Exclude<JobStatus, "idle">;
  filename?: string;
  error?: string | null;
  traceback?: string;
};

type SourceStatus = {
  exists: boolean;
  size: number;
  empty: boolean;
};

type SourcesResponse = {
  works_sanctioned: SourceStatus;
  works_recommended: SourceStatus;
  works_completed: SourceStatus;
};

const SOURCE_FILE: Record<string, keyof SourcesResponse> = {
  sanctioned: "works_sanctioned",
  recommended: "works_recommended",
  completed: "works_completed",
};

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.clone().json();
    if (typeof payload?.detail === "string") return payload.detail;
  } catch {
    // Fall back to plain text below.
  }

  const text = await response.text();
  return text || `Request failed with ${response.status}`;
}

const SOURCE_OPTIONS = [
  { value: "sanctioned", label: "Sanctioned works" },
  { value: "recommended", label: "Recommended works" },
  { value: "completed", label: "Completed works" },
];

const EXPECTED_COLUMNS = [
  "project_id",
  "mp_name",
  "district",
  "work_type",
  "sanction_date",
  "sanction_amount",
  "expenditure_to_date",
  "start_date",
  "expected_end_date",
  "actual_end_date",
  "status",
];

export default function DataIngestionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState(SOURCE_OPTIONS[0].value);
  const [job, setJob] = useState<StatusResponse | null>(null);
  const [status, setStatus] = useState<JobStatus>("idle");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [sources, setSources] = useState<SourcesResponse | null>(null);

  const canSubmit = Boolean(file) && !isUploading && status !== "running" && status !== "queued";

  const selectedLabel = useMemo(
    () => SOURCE_OPTIONS.find((option) => option.value === source)?.label ?? source,
    [source]
  );

  const selectedSourceEmpty = sources?.[SOURCE_FILE[source]]?.empty === true;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(apiUrl("/sources"));
        if (!response.ok) return;
        const payload = (await response.json()) as SourcesResponse;
        if (!cancelled) setSources(payload);
      } catch {
        // Leave sources unknown; no warning can be shown.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!job?.job_id || (status !== "queued" && status !== "running")) return;

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(apiUrl(`/status/${job.job_id}`));
        if (!response.ok) throw new Error(`Status check failed with ${response.status}`);
        const payload = (await response.json()) as StatusResponse;
        setJob(payload);
        setStatus(payload.status);

        if (payload.status === "done") {
          setMessage("Pipeline completed. The cleaned model-ready CSV is ready to download.");
        } else if (payload.status === "failed") {
          setMessage(payload.error ?? "Pipeline failed. Check the backend console for details.");
        } else {
          setMessage(`Pipeline is ${payload.status}. This page will keep checking automatically.`);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to check job status.");
      }
    }, 2500);

    return () => window.clearInterval(timer);
  }, [job?.job_id, status]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setJob(null);
    setStatus("idle");
    setMessage(selected ? `${selected.name} selected for ${selectedLabel}.` : "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setMessage("Uploading CSV to the backend pipeline...");

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch(apiUrl(`/upload?source=${encodeURIComponent(source)}`), {
        method: "POST",
        body,
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const payload = (await response.json()) as StatusResponse;
      setJob(payload);
      setStatus(payload.status);
      setMessage("Upload accepted. The backend is normalizing and preparing the dataset.");
    } catch (error) {
      setStatus("failed");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="space-y-6">
      {selectedSourceEmpty && (
        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div className="text-sm text-amber-900">
            <p className="font-bold">No <span className="capitalize">{selectedLabel}</span> data has been uploaded yet.</p>
            <p className="mt-1">
              The source dataset for this type is still an empty placeholder. Fields that depend on this
              data (for example expenditure-based metrics like utilized amount, percent spent, or
              fund-utilization speed) will fall back to 0 in the output. Upload the corresponding MPLADS
              report (e.g. the completed/expenditure report) using this source type to populate real values.
            </p>
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary-blue)]">
          Pipeline intake
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
          Data Ingestion
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Upload a MPLADS source CSV to the workspace backend, run the normalizer
          and model preparation pipeline, then download the cleaned output.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-lg border border-gov-border bg-[var(--bg-card)] p-5 shadow-sm lg:grid-cols-[1fr_18rem]"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-[var(--text-secondary)]">
              Source type
            </span>
            <select
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-gov-border bg-[var(--bg-primary)] px-3 text-sm font-medium text-[var(--text-primary)]"
            >
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gov-border bg-[var(--bg-secondary)] px-4 py-6 text-center transition hover:border-[var(--primary-blue)]">
            <FileUp className="h-8 w-8 text-[var(--primary-blue)]" aria-hidden="true" />
            <span className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
              {file ? file.name : "Choose a CSV file"}
            </span>
            <span className="mt-1 text-xs text-[var(--text-muted)]">
              CSV uploads are sent to {API_BASE_URL}
            </span>
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={handleFileChange} />
          </label>

          <div className="rounded-md border border-gov-border bg-[var(--bg-secondary)] p-3">
            <p className="text-xs font-semibold text-[var(--text-primary)]">Expected CSV columns</p>
            <p className="mt-1 break-words font-mono text-[11px] leading-relaxed text-[var(--text-muted)]">
              {EXPECTED_COLUMNS.join(", ")}
            </p>
          </div>
        </div>

        <aside className="rounded-lg border border-gov-border bg-[var(--bg-secondary)] p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Job status</p>
          <div className="mt-4 flex items-center gap-3">
            <StatusIcon status={status} isUploading={isUploading} />
            <div>
              <p className="text-base font-bold capitalize text-[var(--text-primary)]">
                {isUploading ? "Uploading" : status}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {job?.job_id ? `Job ${job.job_id.slice(0, 8)}` : "No active job"}
              </p>
            </div>
          </div>
          <p className="mt-4 min-h-12 text-sm text-[var(--text-secondary)]">
            {message || "Select a source CSV to start the pipeline."}
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary-blue)] px-4 text-sm font-bold text-white transition hover:bg-[var(--primary-blue-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            Run Pipeline
          </button>
          
            href={job?.status === "done" ? apiUrl(`/download/${job.job_id}`) : undefined}
            aria-disabled={job?.status !== "done"}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-gov-border px-4 text-sm font-bold text-[var(--text-primary)] transition hover:bg-[var(--bg-card-hover)] aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download Output
          </a>
        </aside>
      </form>
    </section>
  );
}

function StatusIcon({ status, isUploading }: { status: JobStatus; isUploading: boolean }) {
  if (isUploading || status === "queued" || status === "running") {
    return <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-blue)]" aria-hidden="true" />;
  }
  if (status === "done") {
    return <CheckCircle2 className="h-8 w-8 text-[var(--color-low)]" aria-hidden="true" />;
  }
  if (status === "failed") {
    return <XCircle className="h-8 w-8 text-[var(--color-critical)]" aria-hidden="true" />;
  }
  return <FileUp className="h-8 w-8 text-[var(--text-muted)]" aria-hidden="true" />;
}