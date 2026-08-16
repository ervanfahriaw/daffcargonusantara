"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    }

    function handleOffline() {
      setIsOffline(true);
      setShowReconnected(false);
    }

    // Cek status koneksi awal
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2.5 text-center text-xs md:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top ${
        isOffline
          ? "bg-[var(--color-warning-600)] text-white"
          : "bg-[var(--color-success-600)] text-white"
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
          <span>
            Kamu sedang offline. Data akan disinkronkan saat terhubung kembali.
          </span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4 shrink-0" />
          <span>Koneksi internet terhubung kembali.</span>
        </>
      )}
    </div>
  );
}
