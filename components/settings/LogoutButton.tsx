"use client";

import { useState } from "react";
import { LogOut, X, Loader2, UserCheck } from "lucide-react";
import { logoutAction } from "@/lib/actions/pengaturan";

interface LogoutButtonProps {
  userEmail?: string;
}

export function LogoutButton({ userEmail }: LogoutButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirmLogout() {
    setLoading(true);
    await logoutAction();
  }

  return (
    <>
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-surface-tint)] text-[var(--color-primary)]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Akun Terhubung
              </p>
              <h4 className="text-sm md:text-base font-bold text-[var(--color-navy-900)]">
                {userEmail || "Pemilik Akun Operasional"}
              </h4>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-3">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-danger-100)] px-6 py-3 text-xs md:text-sm font-bold text-[var(--color-danger-600)] hover:bg-[var(--color-danger-600)] hover:text-white transition-colors touch-target"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar dari Aplikasi</span>
          </button>
        </div>
      </div>

      {/* ── Modal Konfirmasi Keluar ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-4 pb-6 sm:pb-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--color-surface)] p-6 shadow-xl border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--color-danger-600)]">
                <LogOut className="h-5 w-5" />
                <h3 className="text-base font-bold text-[var(--color-navy-900)]">
                  Konfirmasi Keluar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-100)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)]">
              Yakin ingin keluar dari akun DCN OpsHub? Anda harus memasukkan kata sandi saat membuka kembali aplikasi.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-full border border-[var(--color-border)] py-3 text-xs md:text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] touch-target"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmLogout}
                className="flex-1 rounded-full bg-[var(--color-danger-600)] py-3 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-danger-600)]/90 touch-target"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" /> Keluar...
                  </span>
                ) : (
                  "Ya, Keluar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
