export default function DataIngestionPage() {
  return (
    <section className="flex h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-xl font-bold text-[var(--text-primary)]">Data Ingestion</h1>
      <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
        Data Ingestion: monitor data pipeline status and manually trigger re-sync from source records.
      </p>
    </section>
  );
}