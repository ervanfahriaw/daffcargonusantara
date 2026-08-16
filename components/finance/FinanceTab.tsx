"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  X,
  Loader2,
  CreditCard,
} from "lucide-react";
import {
  updateKeuanganPesananAction,
  updateStatusPembayaranAction,
} from "@/lib/actions/keuangan";
import {
  statusPembayaranConfig,
  type StatusPembayaran,
} from "@/lib/types/keuangan";

interface FinanceTabProps {
  pesananId: string;
  nomorPesanan: string;
  namaCustomer: string;
  tarifCustomer: number;
  biayaVendor: number;
  biayaLainnya: number;
  statusPembayaran: string;
  onNavigateTab?: (tab: "tracking" | "dokumen" | "keuangan" | "kontak") => void;
}

export function FinanceTab({
  pesananId,
  nomorPesanan,
  namaCustomer,
  tarifCustomer,
  biayaVendor,
  biayaLainnya,
  statusPembayaran,
  onNavigateTab,
}: FinanceTabProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLunasModal, setShowLunasModal] = useState(false);

  // State untuk form edit biaya
  const [inputTarif, setInputTarif] = useState(String(tarifCustomer || ""));
  const [inputVendor, setInputVendor] = useState(String(biayaVendor || ""));
  const [inputLainnya, setInputLainnya] = useState(String(biayaLainnya || ""));

  // Format rupiah baku: "Rp 12.500.000"
  function formatIDR(val: number | null | undefined) {
    if (val === null || val === undefined) return "Rp 0";
    return (
      "Rp " +
      Math.round(val)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    );
  }

  const tarif = Number(tarifCustomer) || 0;
  const vendor = Number(biayaVendor) || 0;
  const lainnya = Number(biayaLainnya) || 0;
  const totalBiaya = vendor + lainnya;
  const margin = tarif - totalBiaya;
  const marginPercent = tarif > 0 ? ((margin / tarif) * 100).toFixed(1) : "0";

  // Kalkulasi margin modal edit
  const modalTarifNum = Number(inputTarif) || 0;
  const modalVendorNum = Number(inputVendor) || 0;
  const modalLainnyaNum = Number(inputLainnya) || 0;
  const modalMargin = modalTarifNum - modalVendorNum - modalLainnyaNum;

  const currentStatusBayar =
    (statusPembayaran as StatusPembayaran) || "belum_ditagih";
  const badgeConfig =
    statusPembayaranConfig[currentStatusBayar] ||
    statusPembayaranConfig.belum_ditagih;

  async function handleSaveBiaya(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await updateKeuanganPesananAction(pesananId, {
      tarif_customer: modalTarifNum,
      biaya_vendor: modalVendorNum,
      biaya_lainnya: modalLainnyaNum,
    });

    setLoading(false);
    if (!res.success) {
      toast.error(res.error || "Gagal memperbarui biaya.");
      return;
    }

    toast.success(res.message);
    setShowEditModal(false);
    router.refresh();
  }

  async function handleUpdateStatusBayar(targetStatus: StatusPembayaran) {
    setLoading(true);
    const res = await updateStatusPembayaranAction(pesananId, targetStatus);
    setLoading(false);
    setShowLunasModal(false);

    if (!res.success) {
      toast.error(res.error || "Gagal memperbarui status pembayaran.");
      return;
    }

    toast.success(res.message);
    router.refresh();
  }

  function handleTerbitkanInvoice() {
    // Ubah status pembayaran ke menunggu_pembayaran jika belum
    if (currentStatusBayar === "belum_ditagih") {
      updateStatusPembayaranAction(pesananId, "menunggu_pembayaran");
    }

    // Arahkan langsung ke tab Dokumen
    if (onNavigateTab) {
      onNavigateTab("dokumen");
    } else {
      toast.info("Buka tab Dokumen untuk mengunduh atau membagikan Invoice.");
    }
  }

  return (
    <div className="space-y-5">
      {/* ── Status Pembayaran Header Card ── */}
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-surface-tint)]">
              <CreditCard className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] font-semibold">
                Status Tagihan
              </p>
              <h3 className="text-sm md:text-base font-bold text-[var(--color-navy-900)]">
                Pembayaran Customer
              </h3>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold ${badgeConfig.bgColor} ${badgeConfig.textColor}`}
          >
            {currentStatusBayar === "lunas" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : currentStatusBayar === "menunggu_pembayaran" ? (
              <Clock className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            <span>{badgeConfig.label}</span>
          </span>
        </div>

        {/* Tombol Aksi Kontekstual Pembayaran */}
        <div className="border-t border-[var(--color-border)] pt-3 flex flex-wrap gap-2">
          {currentStatusBayar === "belum_ditagih" && (
            <button
              type="button"
              onClick={handleTerbitkanInvoice}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-xs md:text-sm font-bold text-white shadow-xs hover:bg-[var(--color-primary-dark)] active:scale-[0.99] transition-all touch-target"
            >
              <FileText className="h-4 w-4" />
              <span>Buat & Terbitkan Invoice</span>
            </button>
          )}

          {currentStatusBayar === "menunggu_pembayaran" && (
            <div className="w-full flex gap-2">
              <button
                type="button"
                onClick={() => setShowLunasModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-success-600)] px-5 py-3 text-xs md:text-sm font-bold text-white shadow-xs hover:bg-[var(--color-teal-500)] active:scale-[0.99] transition-all touch-target"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Tandai Lunas</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab("dokumen")}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-3 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors touch-target"
              >
                <FileText className="h-4 w-4" />
                <span>Lihat Invoice</span>
              </button>
            </div>
          )}

          {currentStatusBayar === "lunas" && (
            <div className="w-full rounded-2xl bg-[var(--color-success-100)] p-3.5 flex items-center gap-2 text-xs font-bold text-[var(--color-success-600)]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Seluruh tagihan sebesar {formatIDR(tarif)} telah lunas diterima.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Kartu Margin Keuntungan Menonjol ── */}
      <div
        className={`rounded-3xl p-5 md:p-6 border shadow-sm space-y-2 ${
          margin >= 0
            ? "bg-gradient-to-br from-[#E6F6EA] to-white border-[#B2E4C2]"
            : "bg-gradient-to-br from-[#FEECEB] to-white border-[#FCA5A5]"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                margin >= 0
                  ? "bg-[var(--color-success-600)] text-white"
                  : "bg-[var(--color-danger-600)] text-white"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy-900)]">
                ESTIMASI MARGIN KEUNTUNGAN
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Tarif Customer - Total Biaya Operasional
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              margin >= 0
                ? "bg-[var(--color-success-100)] text-[var(--color-success-600)]"
                : "bg-[var(--color-danger-100)] text-[var(--color-danger-600)]"
            }`}
          >
            {marginPercent}% Margin
          </span>
        </div>

        <p
          className={`text-2xl md:text-3xl font-bold tabular-nums pt-1 ${
            margin >= 0
              ? "text-[var(--color-success-600)]"
              : "text-[var(--color-danger-600)]"
          }`}
        >
          {formatIDR(margin)}
        </p>
      </div>

      {/* ── Kartu Rincian Pendapatan & Pengeluaran ── */}
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[var(--color-orange-500)]" />
            <h3 className="text-base font-bold text-[var(--color-navy-900)]">
              Rincian Pos Biaya
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              setInputTarif(String(tarifCustomer || ""));
              setInputVendor(String(biayaVendor || ""));
              setInputLainnya(String(biayaLainnya || ""));
              setShowEditModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-tint)] px-3.5 py-1.5 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors touch-target"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Biaya</span>
          </button>
        </div>

        <div className="space-y-3 text-sm">
          {/* Pendapatan */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="font-semibold text-[var(--color-navy-900)]">
                Tarif ke Customer
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Pendapatan kotor pengiriman
              </p>
            </div>
            <span className="text-base font-bold text-[var(--color-navy-900)] tabular-nums">
              {formatIDR(tarif)}
            </span>
          </div>

          <div className="h-px bg-[var(--color-border)]" />

          {/* Biaya Vendor */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">
                Biaya Sewa Vendor Trucking
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Biaya pokok armada & supir
              </p>
            </div>
            <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">
              {formatIDR(vendor)}
            </span>
          </div>

          {/* Biaya Lainnya */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">
                Biaya Lain-lain Operasional
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Tol, kuli bongkar, kawalan, dll
              </p>
            </div>
            <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">
              {formatIDR(lainnya)}
            </span>
          </div>

          {/* Total Biaya */}
          <div className="rounded-2xl bg-[var(--color-bg)] p-3 border border-[var(--color-border)] flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">
              Total Biaya Pengeluaran:
            </span>
            <span className="text-sm font-bold text-[var(--color-danger-600)] tabular-nums">
              {formatIDR(totalBiaya)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Modal Edit Rincian Biaya ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-4 pb-6 sm:pb-4 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleSaveBiaya}
            className="w-full max-w-md rounded-3xl bg-[var(--color-surface)] p-6 shadow-xl border border-[var(--color-border)] space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--color-navy-900)]">
                Edit Rincian Biaya Pengiriman
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-full p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-100)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Input Tarif Customer */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Tarif ke Customer (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputTarif}
                  onChange={(e) => setInputTarif(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm font-bold text-[var(--color-navy-900)] tabular-nums focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                />
              </div>

              {/* Input Biaya Vendor */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Biaya Sewa Vendor Trucking (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputVendor}
                  onChange={(e) => setInputVendor(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] tabular-nums focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                />
              </div>

              {/* Input Biaya Lainnya */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Biaya Lain-lain (Tol, Buruh, Kawal) (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={inputLainnya}
                  onChange={(e) => setInputLainnya(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] tabular-nums focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                />
              </div>

              {/* Live Calculated Margin */}
              <div className="rounded-2xl bg-[var(--color-surface-tint)] p-3 border border-[var(--color-border)] flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                  Estimasi Margin Baru:
                </span>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    modalMargin >= 0
                      ? "text-[var(--color-success-600)]"
                      : "text-[var(--color-danger-600)]"
                  }`}
                >
                  {formatIDR(modalMargin)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 rounded-full border border-[var(--color-border)] py-3 text-xs md:text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] touch-target"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-[var(--color-primary)] py-3 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-dark)] touch-target"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal Konfirmasi Pelunasan ── */}
      {showLunasModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-4 pb-6 sm:pb-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[var(--color-surface)] p-6 shadow-xl border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[var(--color-success-600)]" />
                <h3 className="text-base font-bold text-[var(--color-navy-900)]">
                  Konfirmasi Pelunasan Tagihan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLunasModal(false)}
                className="rounded-full p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-100)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)]">
              Tandai tagihan untuk pesanan <strong>{nomorPesanan}</strong> senilai{" "}
              <strong className="text-[var(--color-success-600)]">
                {formatIDR(tarif)}
              </strong>{" "}
              telah lunas dibayar oleh {namaCustomer}?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLunasModal(false)}
                className="flex-1 rounded-full border border-[var(--color-border)] py-3 text-xs md:text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] touch-target"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleUpdateStatusBayar("lunas")}
                className="flex-1 rounded-full bg-[var(--color-success-600)] py-3 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-teal-500)] touch-target"
              >
                {loading ? "Menyimpan..." : "Ya, Tandai Lunas"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
