export default function DashboardLoading() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-28 animate-pulse">
      {/* Skeleton Greeting Banner */}
      <div className="rounded-3xl bg-[var(--color-surface-tint)] p-6 border border-[var(--color-border)] space-y-2">
        <div className="h-4 w-32 rounded bg-[var(--color-neutral-200)]" />
        <div className="h-7 w-56 rounded-xl bg-[var(--color-neutral-200)]" />
        <div className="h-4 w-72 rounded-lg bg-[var(--color-neutral-200)]/70" />
      </div>

      {/* Skeleton 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-[var(--color-neutral-200)]" />
              <div className="h-4 w-20 rounded bg-[var(--color-neutral-200)]" />
            </div>
            <div className="h-8 w-12 rounded-lg bg-[var(--color-neutral-200)]" />
          </div>
        ))}
      </div>

      {/* Skeleton Quick Action Panel */}
      <div className="h-20 rounded-3xl bg-[var(--color-neutral-200)]" />
      <div className="h-28 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5" />

      {/* Skeleton Chart */}
      <div className="h-64 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6" />
    </div>
  );
}
