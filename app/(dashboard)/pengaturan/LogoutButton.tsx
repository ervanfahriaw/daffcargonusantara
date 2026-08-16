"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-4 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] px-5 py-4 text-left hover:bg-[var(--color-danger-100)] transition-colors touch-target"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-danger-100)]">
        <LogOut className="h-5 w-5 text-[var(--color-danger-600)]" />
      </div>
      <p className="text-sm font-semibold text-[var(--color-danger-600)]">
        Keluar
      </p>
    </button>
  );
}
