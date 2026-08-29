"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, Sparkles } from "lucide-react";

export default function UploadDropzone({
  onFile,
  onLoadSample,
  disabled,
}: {
  onFile: (file: File) => void;
  onLoadSample: () => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setLocalError("Only .csv files are supported. Please export your data as CSV and try again.");
      setTimeout(() => setLocalError(null), 4000);
      return;
    }
    setLocalError(null);
    onFile(file);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          disabled
            ? "border-slate-200 bg-slate-50 cursor-not-allowed"
            : dragActive
            ? "border-[var(--primary-blue)] bg-blue-50/60"
            : "border-slate-300 bg-slate-50 hover:border-slate-400"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <UploadCloud className="h-6 w-6 text-[var(--primary-blue)]" />
        </div>
        <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
          Drag and drop your MPLADS data file here
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          or click below to browse — accepts <span className="font-medium">.csv</span> files only
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary-blue)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-blue-hover)] disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Browse files
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-400 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            Load sample dataset
          </button>
        </div>

        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {localError && <p className="text-xs font-medium text-red-600">{localError}</p>}
      <p className="text-[11px] text-[var(--text-muted)]">
        Expected columns: Project ID, Project Name, MP Name, State, District, Constituency, Work Type, Agency,
        Sanctioned Amount, Utilized Amount, Sanction Date, Expected Completion, Fund Utilization %
      </p>
    </div>
  );
}