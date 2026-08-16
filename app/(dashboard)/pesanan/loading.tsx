export default function PesananLoading() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-4 pb-28 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-7 w-36 rounded-xl bg-[var(--color-neutral-200)]" />
          <div className="h-4 w-52 rounded-lg bg-[var(--color-neutral-200)]/70" />
        </div>
        <div className="h-10 w-32 rounded-full bg-[var(--color-neutral-200)]" />
      </div>

      {/* Filter chips skeleton */}
      <div className="flex gap-2 py-1">
        <div className="h-9 w-20 rounded-full bg-[var(--color-neutral-200)]" />
        <div className="h-9 w-28 rounded-full bg-[var(--color-neutral-200)]" />
        <div className="h-9 w-24 rounded-full bg-[var(--color-neutral-200)]" />
      </div>

      {/* Search bar skeleton */}
      <div className="h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]" />

      {/* Shipment cards skeleton */}
      <div className="space-y-3 pt-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-5 w-32 rounded bg-[var(--color-neutral-200)]" />
              <div className="h-6 w-20 rounded-full bg-[var(--color-neutral-200)]" />
            </div>
            <div className="h-4 w-44 rounded bg-[var(--color-neutral-200)]/70" />
            <div className="h-14 rounded-2xl bg-[var(--color-bg)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
