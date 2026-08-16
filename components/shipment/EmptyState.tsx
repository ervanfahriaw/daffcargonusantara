import Link from "next/link";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function EmptyState({
  title = "Belum ada pesanan.",
  description = "Yuk buat pesanan pertama.",
  actionText = "Buat Pesanan Baru",
  actionHref = "/pesanan/baru",
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Ilustrasi Line-art Truk Kargo (Navy + Teal) */}
      <div className="relative mb-6 flex h-32 w-32 items-center justify-center rounded-3xl bg-[var(--color-surface-tint)] border border-[var(--color-border)] p-4 shadow-sm">
        <svg
          viewBox="0 0 100 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20"
        >
          {/* Ground line */}
          <path
            d="M 5 70 L 95 70"
            stroke="var(--color-border)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Truck Body (Navy) */}
          <rect
            x="12"
            y="22"
            width="48"
            height="36"
            rx="4"
            fill="var(--color-surface)"
            stroke="var(--color-navy-900)"
            strokeWidth="2.5"
          />

          {/* Cargo line art inside container */}
          <line
            x1="28"
            y1="22"
            x2="28"
            y2="58"
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />
          <line
            x1="44"
            y1="22"
            x2="44"
            y2="58"
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />

          {/* Truck Cabin (Teal accent) */}
          <path
            d="M 60 34 L 75 34 C 78 34 81 37 83 41 L 86 48 C 87 50 87 52 87 54 L 87 58 L 60 58 Z"
            fill="var(--color-teal-100)"
            stroke="var(--color-navy-900)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Cabin Window */}
          <path
            d="M 65 39 L 75 39 C 77 39 79 41 80 44 L 82 48 L 65 48 Z"
            fill="var(--color-surface)"
            stroke="var(--color-teal-500)"
            strokeWidth="2"
          />

          {/* Wheels */}
          {/* Front Wheel */}
          <circle
            cx="75"
            cy="58"
            r="8"
            fill="var(--color-navy-900)"
            stroke="var(--color-surface)"
            strokeWidth="2"
          />
          <circle cx="75" cy="58" r="3" fill="var(--color-surface)" />

          {/* Rear Wheel 1 */}
          <circle
            cx="25"
            cy="58"
            r="8"
            fill="var(--color-navy-900)"
            stroke="var(--color-surface)"
            strokeWidth="2"
          />
          <circle cx="25" cy="58" r="3" fill="var(--color-surface)" />

          {/* Rear Wheel 2 */}
          <circle
            cx="43"
            cy="58"
            r="8"
            fill="var(--color-navy-900)"
            stroke="var(--color-surface)"
            strokeWidth="2"
          />
          <circle cx="43" cy="58" r="3" fill="var(--color-surface)" />

          {/* Speed / motion lines (Teal) */}
          <path
            d="M 4 28 L 8 28"
            stroke="var(--color-teal-500)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 2 36 L 8 36"
            stroke="var(--color-teal-500)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 4 44 L 8 44"
            stroke="var(--color-teal-500)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Teks */}
      <h3 className="text-lg font-bold text-[var(--color-navy-900)] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-xs mb-6">
        {description}
      </p>

      {/* Tombol Aksi */}
      {onActionClick ? (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all touch-target"
        >
          {actionText}
        </button>
      ) : actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all touch-target"
        >
          <Plus className="h-4 w-4" />
          {actionText}
        </Link>
      ) : null}
    </div>
  );
}
