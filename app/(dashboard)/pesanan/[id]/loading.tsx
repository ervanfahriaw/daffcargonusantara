export default function DetailPesananLoading() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-28 animate-pulse">
      {/* Header card skeleton */}
      <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <div className="h-4 w-24 rounded bg-[var(--color-neutral-200)]" />
            <div className="h-6 w-36 rounded-lg bg-[var(--color-neutral-200)]" />
          </div>
          <div className="h-7 w-24 rounded-full bg-[var(--color-neutral-200)]" />
        </div>
        <div className="h-16 rounded-2xl bg-[var(--color-bg)]" />
      </div>

      {/* Tabs bar skeleton */}
      <div className="flex border-b border-[var(--color-border)] gap-6 pb-2">
        <div className="h-8 w-20 rounded-lg bg-[var(--color-neutral-200)]" />
        <div className="h-8 w-20 rounded-lg bg-[var(--color-neutral-200)]/60" />
        <div className="h-8 w-20 rounded-lg bg-[var(--color-neutral-200)]/60" />
        <div className="h-8 w-20 rounded-lg bg-[var(--color-neutral-200)]/60" />
      </div>

      {/* Tab content skeleton */}
      <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-[var(--color-neutral-200)]" />
        <div className="space-y-4 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-8 w-8 rounded-full bg-[var(--color-neutral-200)] shrink-0" />
              <div className="h-4 w-48 rounded bg-[var(--color-neutral-200)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
