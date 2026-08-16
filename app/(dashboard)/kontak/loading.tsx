export default function KontakLoading() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-4 pb-28 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-7 w-36 rounded-xl bg-[var(--color-neutral-200)]" />
          <div className="h-4 w-48 rounded-lg bg-[var(--color-neutral-200)]/70" />
        </div>
        <div className="h-10 w-32 rounded-full bg-[var(--color-neutral-200)]" />
      </div>

      {/* Category tabs skeleton */}
      <div className="flex gap-2 py-1">
        <div className="h-9 w-20 rounded-full bg-[var(--color-neutral-200)]" />
        <div className="h-9 w-24 rounded-full bg-[var(--color-neutral-200)]" />
        <div className="h-9 w-28 rounded-full bg-[var(--color-neutral-200)]" />
      </div>

      {/* Search bar skeleton */}
      <div className="h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]" />

      {/* Contact cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[var(--color-neutral-200)] shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-28 rounded bg-[var(--color-neutral-200)]" />
                <div className="h-3 w-36 rounded bg-[var(--color-neutral-200)]/70" />
              </div>
            </div>
            <div className="h-9 rounded-full bg-[var(--color-bg)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
