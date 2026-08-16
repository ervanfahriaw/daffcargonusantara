"use client";

import { useState, useEffect } from "react";
import {
  X,
  Send,
  MessageCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  createBatchNotificationQueue,
  type BatchNotificationItem,
} from "@/lib/services/waNotificationService";
import { toast } from "sonner";

interface DailyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeShipments: Array<{
    id: string;
    nomor_pesanan: string;
    nama_customer: string;
    alamat_asal: string;
    alamat_tujuan: string;
    status: string;
    moda_pengiriman?: string;
    catatan_muatan?: string | null;
    plat_nomor?: string | null;
    kontak_customer?: {
      nomor_telepon?: string | null;
    } | null;
  }>;
}

export function DailyBroadcastModal({
  isOpen,
  onClose,
  activeShipments = [],
}: DailyBroadcastModalProps) {
  const [queue, setQueue] = useState<BatchNotificationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && activeShipments.length > 0) {
      const q = createBatchNotificationQueue(activeShipments);
      setQueue(q);
      setCurrentIndex(-1);
    }
  }, [isOpen, activeShipments]);

  if (!isOpen) return null;

  function handleSendSingle(item: BatchNotificationItem, index: number) {
    window.open(item.waUrl, "_blank");
    setSentMap((prev) => ({ ...prev, [item.pesananId]: true }));
    toast.success(`Membuka WhatsApp untuk ${item.customerName}`);
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in pb-6 sm:pb-4">
      <div className="w-full max-w-2xl rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 shadow-2xl border border-[var(--color-border)] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* ── Modal Header ── */}
        <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-xs">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-bold text-[var(--color-navy-900)]">
                  Pembaruan Harian ke Client (WhatsApp)
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Anti-Ban Jeda Aman
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Kirimkan progres terkini dan link live tracking ke {queue.length} pelanggan aktif
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tint)] touch-target"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Info Box Anti-Ban & Keamanan Pengiriman ── */}
        <div className="rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200/80 space-y-2 text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-bold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Sistem Proteksi Anti-Blokir WhatsApp Aktif</span>
          </div>
          <ul className="space-y-1 text-[11px] text-emerald-800 list-disc list-inside">
            <li>Teks pembuka dan salam divariasikan secara otomatis agar tidak identik.</li>
            <li>Jeda waktu acak (3.5 – 6.5 detik) diterapkan saat membuka antrean pesan.</li>
            <li>Link live tracking publik terenkripsi otomatis disertakan untuk kemudahan klien.</li>
          </ul>
        </div>

        {/* ── Daftar Antrean Pesanan Aktif ── */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Daftar Penerima ({queue.length} Muatan Aktif):
          </h4>

          {queue.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-center text-xs text-slate-500">
              Tidak ada pengiriman aktif yang memerlukan update saat ini.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {queue.map((item, idx) => {
                const isSent = !!sentMap[item.pesananId];
                return (
                  <div
                    key={item.pesananId}
                    className={`rounded-2xl p-3.5 border transition-all flex flex-wrap items-center justify-between gap-3 ${
                      isSent
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--color-navy-900)] truncate">
                          {item.customerName}
                        </span>
                        <span className="rounded-md bg-slate-200 px-1.5 py-0.2 text-[10px] font-mono text-slate-700">
                          {item.nomorPesanan}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate">
                        {item.statusLabel} • {item.phone || "No. WA Belum Ada"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                        Jeda: {idx === 0 ? "Langsung" : `+${Math.round(item.delayMs / 1000)}s`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSendSingle(item, idx)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all touch-target ${
                          isSent
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                        }`}
                      >
                        {isSent ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Terkirim</span>
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-3.5 w-3.5 fill-current" />
                            <span>Kirim WA</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="pt-2 flex items-center justify-between border-t border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-secondary)]">
            Terkirim: {Object.keys(sentMap).length} dari {queue.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[var(--color-border)] px-5 py-2.5 text-xs font-bold text-[var(--color-navy-900)] hover:bg-[var(--color-surface-tint)] touch-target"
          >
            Selesai / Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
