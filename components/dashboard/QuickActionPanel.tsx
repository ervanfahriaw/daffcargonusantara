"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Package, Send, TrendingUp, Sparkles, MessageCircle } from "lucide-react";
import { DailyBroadcastModal } from "@/components/notification/DailyBroadcastModal";

interface QuickActionPanelProps {
  totalTarif: number;
  totalMargin: number;
  activeShipments?: Array<{
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

function formatIDR(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function QuickActionPanel({
  totalTarif,
  totalMargin,
  activeShipments = [],
}: QuickActionPanelProps) {
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  return (
    <div className="space-y-3.5">
      {/* ── Tombol Utama 1: + Buat Pesanan Baru ── */}
      <Link
        href="/pesanan/baru"
        className="w-full flex items-center justify-between rounded-3xl bg-[var(--color-primary)] p-5 text-white shadow-md hover:bg-[var(--color-primary-dark)] active:scale-[0.99] transition-all touch-target group"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-xs">
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <h3 className="text-base md:text-lg font-bold leading-tight">
              Buat Pesanan Baru
            </h3>
            <p className="text-xs text-white/80 mt-0.5">
              Catat booking kargo, customer & armada
            </p>
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white group-hover:translate-x-1 transition-transform">
          ➔
        </div>
      </Link>

      {/* ── Tombol Utama 2: 📢 Kirim Pembaruan Harian ke Client (WhatsApp) ── */}
      <button
        type="button"
        onClick={() => setShowBroadcastModal(true)}
        className="w-full flex items-center justify-between rounded-3xl bg-emerald-600 p-4 md:p-5 text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] transition-all touch-target group"
      >
        <div className="flex items-center gap-3.5 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-xs">
            <MessageCircle className="h-6 w-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-bold leading-tight">
                Kirim Update Harian ke Client
              </h3>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                {activeShipments.length} Muatan
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              Progres terkini, live tracking & proteksi anti-blokir
            </p>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white group-hover:translate-x-1 transition-transform">
          ➔
        </div>
      </button>

      {/* ── Ringkasan Nilai Transaksi & Margin Bersih ── */}
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 border border-[var(--color-border)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--color-teal-500)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Ringkasan Nilai Operasional
            </span>
          </div>
          <span className="rounded-full bg-[var(--color-surface-tint)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
            Agregat
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1 border-t border-[var(--color-border)]">
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium">
              Total Tarif Customer
            </p>
            <p className="text-base md:text-lg font-bold text-[var(--color-navy-900)] tabular-nums mt-0.5">
              {formatIDR(totalTarif)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium">
              Total Estimasi Margin
            </p>
            <p className="text-base md:text-lg font-bold text-[var(--color-success-600)] tabular-nums mt-0.5">
              {formatIDR(totalMargin)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Modal Broadcast ── */}
      <DailyBroadcastModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        activeShipments={activeShipments}
      />
    </div>
  );
}
