"use client";

import { useEffect } from "react";

interface VideoModalProps {
  onClose: () => void;
}

export default function VideoModal({ onClose }: VideoModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()} role="presentation">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="videos-title">
        <h2 id="videos-title" className="sr-only">Project videos</h2>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="w-full shrink-0 bg-slate-100 p-4 md:w-64">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Videos</h3>
            <a href="#" onClick={(event) => event.preventDefault()} className="block border-l-2 border-teal px-3 py-2 text-sm font-medium text-teal underline underline-offset-2">Sentinel Demo Walkthrough.mp4</a>
          </aside>
          <div className="flex min-h-[280px] flex-1 items-center justify-center bg-slate-900 p-5">
            <div className="flex aspect-video w-full max-w-2xl flex-col items-center justify-center rounded-md bg-gradient-to-br from-red-500 to-red-700 text-white shadow-inner">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red-900/60 ring-4 ring-white/20">
                <svg className="ml-1 h-9 w-9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.25-6.86a1 1 0 0 0 0-1.7L9.53 4.29A1 1 0 0 0 8 5.14Z" /></svg>
              </span>
              <span className="mt-4 text-sm font-semibold text-white/80">Video preview unavailable</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Close</button>
        </div>
      </div>
    </div>
  );
}
