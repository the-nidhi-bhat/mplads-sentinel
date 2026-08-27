import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProjectDetailPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-[60vh] text-[var(--text-muted)]">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-blue)] transition-colors hover:text-[var(--primary-blue-hover)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Home
      </Link>
      <p>Project Details — Coming soon</p>
    </div>
  );
}
