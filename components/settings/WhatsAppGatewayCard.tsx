"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Power,
  ExternalLink,
  Send,
  Loader2,
  Terminal,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { buildWhatsAppSendUrl } from "@/lib/services/waNotificationService";

interface WhatsAppGatewayCardProps {
  ownerPhone?: string | null;
  ownerName?: string | null;
}

export function WhatsAppGatewayCard({
  ownerPhone = "081282200880",
  ownerName = "Pemilik DCN",
}: WhatsAppGatewayCardProps) {
  const [gatewayOnline, setGatewayOnline] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);
  const [pushname, setPushname] = useState<string | null>(null);
  const [realQrDataUrl, setRealQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sendingTest, setSendingTest] = useState<boolean>(false);

  // Polling status gateway
  async function fetchGatewayStatus() {
    try {
      const res = await fetch("/api/wa", { cache: "no-store" });
      const data = await res.json();

      if (data.online) {
        setGatewayOnline(true);
        const connected = !!data.isConnected || data.state === "CONNECTED";
        setIsConnected(connected);
        setConnectedPhone(data.phoneNumber || null);
        setPushname(data.pushname || null);
        setRealQrDataUrl(connected ? null : (data.qrCodeDataUrl || null));
      } else {
        setGatewayOnline(false);
        setIsConnected(false);
        setRealQrDataUrl(null);
      }
    } catch {
      setGatewayOnline(false);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGatewayStatus();
    const interval = setInterval(fetchGatewayStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    if (!confirm("Apakah Anda yakin ingin memutuskan sesi WhatsApp Gateway?")) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/wa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Sesi WhatsApp berhasil diputuskan.");
        setIsConnected(false);
        setRealQrDataUrl(null);
      } else {
        toast.error(data.error || "Gagal logout");
      }
    } catch {
      toast.error("Gagal terhubung ke gateway");
    } finally {
      setLoading(false);
      fetchGatewayStatus();
    }
  }

  async function handleSendTestMessage() {
    setSendingTest(true);
    const testMsg = `*TES KONEKSI WHATSAPP GATEWAY (REAL) — DCN OPSHUB*\n\nHalo ${ownerName}!\nSistem WhatsApp Gateway PT Daff Cargo Nusantara aktif dan berhasil mengirimkan pesan ini secara otomatis.\n\n_Waktu: ${new Date().toLocaleString("id-ID")}_`;

    try {
      // Coba kirim via real WA Gateway API jika online
      if (gatewayOnline && isConnected) {
        const res = await fetch("/api/wa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: ownerPhone || "081282200880",
            message: testMsg,
          }),
        });
        const data = await res.json();

        if (data.success) {
          toast.success(`Pesan berhasil dikirim via WhatsApp Gateway ke ${data.recipient}!`);
          setSendingTest(false);
          return;
        }
      }

      // Fallback direct wa.me
      const sendUrl = buildWhatsAppSendUrl(ownerPhone || "081282200880", testMsg);
      window.open(sendUrl, "_blank");
      toast.success("Membuka chat WhatsApp langsung!");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setSendingTest(false);
    }
  }

  return (
    <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-sm space-y-5">
      {/* ── Header Card ── */}
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-xs">
            <MessageSquare className="h-6 w-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-bold text-[var(--color-navy-900)]">
                WhatsApp Web Gateway (Real Daemon)
              </h2>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Layanan otomatisasi pengiriman pesan pembaruan harian dan dokumen PDF ke customer
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shrink-0 ${
            isConnected
              ? "bg-emerald-100 text-emerald-700 border border-emerald-300/60"
              : gatewayOnline
              ? "bg-amber-100 text-amber-800 border border-amber-300/60"
              : "bg-slate-100 text-slate-700 border border-slate-300/60"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected
                ? "bg-emerald-500 animate-pulse"
                : gatewayOnline
                ? "bg-amber-500 animate-ping"
                : "bg-slate-400"
            }`}
          />
          <span>
            {isConnected
              ? "Terhubung (Aktif)"
              : gatewayOnline
              ? "Menunggu Scan QR"
              : "Gateway Standby / Offline"}
          </span>
        </span>
      </div>

      {/* ── Status Banner Jika Gateway Daemon Belum Dinyalakan ── */}
      {!gatewayOnline && (
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2.5 text-xs text-slate-800">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Terminal className="h-4 w-4 text-[var(--color-primary)]" />
            <span>Cara Menjalankan Real WhatsApp Daemon Server:</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Untuk mengaktifkan koneksi WhatsApp Web background otomatis secara nyata, jalankan perintah berikut di terminal:
          </p>
          <div className="rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-emerald-400 select-all">
            npm run wa:server
          </div>
          <p className="text-[10px] text-slate-500">
            💡 <em>Catatan: Pengiriman pesan langsung 1-klik via WhatsApp tetap berfungsi normal kapan saja tanpa perlu daemon.</em>
          </p>
        </div>
      )}

      {/* ── Kondisi 1: TERHUBUNG SUKSES ── */}
      {isConnected ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Akun WhatsApp Anda Berhasil Terhubung!</span>
              </div>
              <p className="text-xs text-emerald-800">
                Nomor: <strong className="font-mono">+{connectedPhone || ownerPhone}</strong> {pushname ? `(${pushname})` : ""}
              </p>
              <p className="text-[11px] text-emerald-700">
                Sesi login tersimpan di server (`.wwebjs_auth`). Pesan pembaruan harian akan otomatis terkirim melalui nomor ini.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={sendingTest}
                onClick={handleSendTestMessage}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.99] transition-all touch-target"
              >
                {sendingTest ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>Kirim Pesan Tes</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors touch-target"
                title="Putuskan Koneksi"
              >
                <Power className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Putuskan</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Kondisi 2: PERLU SCAN QR ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Kolom Kiri: Tampilan QR Code Real dari whatsapp-web.js */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900 text-white shadow-inner space-y-3">
            <div className="relative p-3 bg-white rounded-2xl shadow-md min-w-[210px] min-h-[210px] flex items-center justify-center">
              {realQrDataUrl ? (
                /* Real QR Code Image dari Gateway */
                <img
                  src={realQrDataUrl}
                  alt="Scan QR WhatsApp Gateway"
                  className="w-48 h-48 md:w-52 md:h-52 object-contain"
                />
              ) : (
                /* Fallback Matrix QR Placeholder */
                <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <QrCode className="h-16 w-16 text-slate-400 animate-pulse" />
                  <p className="text-[11px] text-slate-500 font-medium max-w-[170px]">
                    {gatewayOnline
                      ? "Menyiapkan QR Code sesi baru..."
                      : "Jalankan 'npm run wa:server' untuk memuat QR Code real"}
                  </p>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center rounded-2xl">
                  <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchGatewayStatus}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Cek Status</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestMessage}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Kirim Tes WA</span>
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Panduan 3 Langkah Scan QR */}
          <div className="space-y-4 text-xs text-[var(--color-navy-900)]">
            <h3 className="text-sm font-bold text-[var(--color-navy-900)] flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-[var(--color-primary)]" />
              <span>Cara Scan & Tautkan WhatsApp:</span>
            </h3>

            <ol className="space-y-3 pl-1">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-tint)] text-[var(--color-primary)] font-bold text-[11px]">
                  1
                </span>
                <span>
                  Buka aplikasi <strong>WhatsApp</strong> di HP Anda.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-tint)] text-[var(--color-primary)] font-bold text-[11px]">
                  2
                </span>
                <span>
                  Ketuk <strong>Menu (Titik Tiga di pojok kanan atas)</strong> atau <strong>Pengaturan</strong> lalu pilih <strong>Perangkat Tertaut (Linked Devices)</strong>.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-tint)] text-[var(--color-primary)] font-bold text-[11px]">
                  3
                </span>
                <span>
                  Pilih <strong>Tautkan Perangkat</strong> dan arahkan kamera HP Anda ke <strong>QR Code</strong> di samping.
                </span>
              </li>
            </ol>

            <div className="rounded-2xl bg-emerald-50/80 p-3.5 border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Sesi Otomatis Tersimpan (LocalAuth)</span>
              </p>
              <p>
                Cukup scan QR satu kali. Sesi WhatsApp Anda akan tersimpan di server sehingga pengiriman otomatis harian dapat berjalan terus menerus.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
