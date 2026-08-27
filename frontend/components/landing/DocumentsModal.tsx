"use client";

import { useEffect, useState } from "react";

interface DocumentsModalProps {
  onClose: () => void;
}

type DocumentTab = "English" | "Hindi" | "Onboarding Forms";

interface DocumentItem {
  name: string;
  href: string;
}

const documents: Record<DocumentTab, DocumentItem[]> = {
  English: [
    { name: "English Guidelines w.e.f. 1st Apr 2023.pdf", href: "/documents/english-guidelines.pdf" },
    { name: "MP User Manual April 2026 V 1.7 .pdf", href: "/documents/mp-user-manual.pdf" },
    { name: "Trust society working as Sub agency.pdf", href: "/documents/trust-society-sub-agency.pdf" },
    { name: "Modification in para 10.4.7 of MPLADS Guidelines.pdf", href: "/documents/mplads-guidelines-modification.pdf" },
    { name: "Steps for Holding account mapping and flagging of PFMS.pdf", href: "/documents/pfms-account-mapping.pdf" },
    { name: "CNA User Manual April 2026 V1.7 1.pdf", href: "/documents/cna-user-manual.pdf" },
    { name: "Suggestive guidelines for Hiring of manpower.pdf", href: "/documents/manpower-hiring-guidelines.pdf" },
  ],
  Hindi: [],
  "Onboarding Forms": [
    { name: "Lok Sabha User Form.pdf", href: "/documents/lok-sabha-user-form.pdf" },
    { name: "Rajya Sabha User Form.pdf", href: "/documents/rajya-sabha-user-form.pdf" },
  ],
};

documents.Hindi = documents.English;

export default function DocumentsModal({ onClose }: DocumentsModalProps) {
  const [activeTab, setActiveTab] = useState<DocumentTab>("English");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()} role="presentation">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="documents-title">
        <h2 id="documents-title" className="sr-only">Project documents</h2>
        <div className="flex flex-wrap gap-1 bg-navy px-4 pt-3 sm:px-6">
          {(Object.keys(documents) as DocumentTab[]).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-semibold transition-colors sm:text-base ${activeTab === tab ? "text-white" : "text-white/55 hover:text-white/85"}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="min-h-[260px] overflow-y-auto bg-slate-100 px-6 py-5 sm:px-8">
          <ul className="list-disc space-y-5 pl-5 text-sm sm:text-base">
            {documents[activeTab].map((document) => (
              <li key={document.name}>
                <a href={document.href} download={document.name} className="font-medium text-teal underline decoration-teal/60 underline-offset-2 hover:text-teal-dark">{document.name}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Close</button>
        </div>
      </div>
    </div>
  );
}
