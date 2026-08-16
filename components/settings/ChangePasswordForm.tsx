"use client";

import { useState } from "react";
import { KeyRound, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changePasswordAction } from "@/lib/actions/pengaturan";

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const res = await changePasswordAction({
      newPassword,
      confirmPassword,
    });
    setLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal mengubah kata sandi.");
      return;
    }

    toast.success(res.message);
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-surface-tint)] text-[var(--color-primary)]">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-navy-900)]">
            Keamanan Akun
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Perbarui kata sandi login untuk keamanan akun Anda.
          </p>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
            Kata Sandi Baru
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
            Ulangi Kata Sandi Baru
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang kata sandi baru"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-xs md:text-sm font-bold text-[var(--color-navy-900)] hover:bg-[var(--color-bg)] disabled:opacity-50 transition-colors touch-target"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memperbarui Sandi...</span>
            </>
          ) : (
            <span>Perbarui Kata Sandi</span>
          )}
        </button>
      </form>
    </div>
  );
}
