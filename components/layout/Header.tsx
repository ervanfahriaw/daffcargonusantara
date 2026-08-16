"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export function Header({ title, showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 bg-[var(--color-surface)] px-4 py-3 border-b border-[var(--color-border)]">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)] transition-colors touch-target"
          aria-label="Kembali"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      <h1 className="text-xl font-bold text-[var(--color-navy-900)] truncate">
        {title}
      </h1>
    </header>
  );
}
