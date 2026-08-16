"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

export function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
      // Cek apakah user pernah dismiss sebelumnya
      const dismissed = localStorage.getItem("dcn_pwa_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowPrompt(false);
    localStorage.setItem("dcn_pwa_dismissed", "true");
  }

  if (!showPrompt) return null;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-[var(--color-navy-900)] to-[#134074] p-4 text-white shadow-md border border-[var(--color-teal-500)]/30 flex items-center justify-between gap-3 animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-teal-500)] text-white shadow-xs">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-xs md:text-sm font-bold leading-tight">
            Pasang Aplikasi ke Layar Utama
          </h4>
          <p className="text-[11px] text-[var(--color-teal-100)] mt-0.5">
            Buka DCN OpsHub seperti aplikasi biasa dari HP Anda.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-teal-500)] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#228B7E] active:scale-95 transition-all touch-target"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Pasang</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full p-2 text-white/70 hover:bg-white/10 touch-target"
          title="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
