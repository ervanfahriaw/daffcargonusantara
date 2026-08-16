"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  FileText,
  Ship,
  Truck,
  Plane,
} from "lucide-react";
import { updateStatusPesananAction } from "@/lib/actions/pesanan";
import { type StatusPesanan } from "@/components/shipment/StatusBadge";
import { getMilestoneOrder } from "@/components/shipment/StatusStepper";
import { type JenisPengiriman } from "@/lib/validations/pesanan";

interface DynamicActionButtonProps {
  pesananId: string;
  currentStatus: StatusPesanan;
  moda?: "darat" | "laut" | "udara";
  jenisPengiriman?: JenisPengiriman;
  onNavigateTab?: (tab: "tracking" | "dokumen" | "keuangan" | "kontak") => void;
}

const ACTION_LABELS: Partial<Record<StatusPesanan, string>> = {
  pickup: "Catat Pickup / Muat Barang",
  berangkat: "Tandai Berangkat",
  dalam_perjalanan: "Update Dalam Perjalanan",
  tiba: "Tandai Tiba di Lokasi Tujuan",
  stuffing: "Catat Stuffing / Muat Kontainer",
  gate_in_pelabuhan: "Tandai Masuk Pelabuhan (Gate-In POL)",
  kapal_berangkat: "Tandai Kapal Berangkat (ETD)",
  pelayaran: "Update Posisi Pelayaran Laut",
  kapal_tiba: "Tandai Kapal Sandar / Tiba (POD)",
  dooring: "Mulai Pengantaran Darat (Dooring)",
  acceptance_bandara: "Catat Acceptance & Timbang Bandara",
  masuk_terminal_kargo: "Tandai Terbit SMU / Terminal Kargo",
  terbang: "Tandai Pesawat Lepas Landas (ETD)",
  dalam_penerbangan: "Update Dalam Penerbangan",
  mendarat: "Tandai Pesawat Mendarat (ETA)",
  delivery_udara: "Mulai Pengantaran Kurir Bandara",
  terkirim: "Buat Bukti Serah Terima (POD)",
};

export function getNextStatusInfo(
  currentStatus: StatusPesanan,
  moda: "darat" | "laut" | "udara" = "darat",
  scope: JenisPengiriman = "d2d"
): {
  nextStatus: StatusPesanan | null;
  label: string;
  actionType: "update" | "navigate_dokumen" | "finished";
} {
  if (currentStatus === "terkirim") {
    return {
      nextStatus: null,
      label: "Buat Invoice Tagihan",
      actionType: "navigate_dokumen",
    };
  }

  if (currentStatus === "selesai") {
    return {
      nextStatus: null,
      label: "Pesanan Telah Selesai",
      actionType: "finished",
    };
  }

  if (currentStatus === "tertunda") {
    const resumeStatus: StatusPesanan =
      moda === "udara"
        ? "dalam_penerbangan"
        : moda === "laut"
        ? "pelayaran"
        : "dalam_perjalanan";
    return {
      nextStatus: resumeStatus,
      label: `Lanjutkan Pengiriman (${moda === "udara" ? "Air Freight" : moda === "laut" ? "Sea Freight" : "Darat"})`,
      actionType: "update",
    };
  }

  const milestones = getMilestoneOrder(moda, scope);
  const currentIndex = milestones.indexOf(currentStatus);

  if (currentIndex !== -1 && currentIndex < milestones.length - 1) {
    const next = milestones[currentIndex + 1];
    return {
      nextStatus: next,
      label: ACTION_LABELS[next] || `Update ke ${next}`,
      actionType: "update",
    };
  }

  return {
    nextStatus: null,
    label: "Update Status",
    actionType: "update",
  };
}

export function DynamicActionButton({
  pesananId,
  currentStatus,
  moda = "darat",
  jenisPengiriman = "d2d",
  onNavigateTab,
}: DynamicActionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDelayedModal, setIsDelayedModal] = useState(false);
  const [catatan, setCatatan] = useState("");

  const { nextStatus, label, actionType } = getNextStatusInfo(
    currentStatus,
    moda,
    jenisPengiriman
  );

  async function handleExecuteAction(targetStatus: StatusPesanan, customNote?: string) {
    setLoading(true);
    try {
      const res = await updateStatusPesananAction(pesananId, targetStatus, customNote);
      if (res.success) {
        if (res.waSent) {
          toast.success(`${res.message} (Notifikasi WhatsApp terkirim ke +${res.waRecipient})`);
        } else {
          toast.success(res.message);
        }
        setShowModal(false);
        setIsDelayedModal(false);
        setCatatan("");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch (err: any) {
      toast.error(err?.message || "Gagal memperbarui status.");
    } finally {
      setLoading(false);
    }
  }

  function handlePrimaryClick() {
    if (actionType === "navigate_dokumen") {
      if (onNavigateTab) {
        onNavigateTab("dokumen");
      }
      return;
    }

    if (actionType === "finished") {
      toast.info("Pesanan ini sudah selesai.");
      return;
    }

    setShowModal(true);
  }

  return (
    <>
      {/* ── Sticky Bottom Action Bar ── */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-30 p-4 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] shadow-lg max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Tombol Utama Progres Milestone */}
          <button
            type="button"
            disabled={loading || actionType === "finished"}
            onClick={handlePrimaryClick}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white shadow-md active:scale-[0.99] transition-all disabled:opacity-50 touch-target ${
              currentStatus === "tertunda"
                ? "bg-[var(--color-warning-600)] hover:bg-[var(--color-warning-600)]/90"
                : actionType === "navigate_dokumen"
                ? "bg-[var(--color-teal-500)] hover:bg-[var(--color-teal-600)]"
                : moda === "udara"
                ? "bg-[#9333EA] hover:bg-[#7E22CE]"
                : moda === "laut"
                ? "bg-[#0284C7] hover:bg-[#0369A1]"
                : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : actionType === "navigate_dokumen" ? (
              <>
                <FileText className="h-5 w-5" />
                <span>{label}</span>
                <ArrowRight className="h-5 w-5" />
              </>
            ) : actionType === "finished" ? (
              <>
                <CheckCircle className="h-5 w-5 text-white" />
                <span>{label}</span>
              </>
            ) : (
              <>
                {moda === "udara" ? (
                  <Plane className="h-5 w-5" />
                ) : moda === "laut" ? (
                  <Ship className="h-5 w-5" />
                ) : (
                  <Truck className="h-5 w-5" />
                )}
                <span>{label}</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          {/* Tombol Laporkan Kendala / Tertunda */}
          {currentStatus !== "selesai" && currentStatus !== "tertunda" && (
            <button
              type="button"
              disabled={loading}
              onClick={() => setIsDelayedModal(true)}
              className="flex items-center justify-center h-14 w-14 rounded-2xl bg-[var(--color-warning-100)] text-[var(--color-warning-600)] border border-[var(--color-warning-600)]/30 hover:bg-[var(--color-warning-100)]/80 transition-all touch-target shrink-0"
              title="Tandai Pengiriman Tertunda / Kendala"
              aria-label="Tandai Kendala"
            >
              <AlertTriangle className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* ── Modal Konfirmasi Update Status Reguler ── */}
      {showModal && nextStatus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 pb-6 sm:pb-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--color-surface)] p-6 shadow-xl border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-navy-900)]">
                Konfirmasi Update Status
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tint)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-[var(--color-text-primary)]">
              Apakah Anda yakin ingin memperbarui status pengiriman ini ke:
            </p>

            <div className="rounded-2xl bg-[var(--color-surface-tint)] p-4 border border-[var(--color-primary)]/20 text-center">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Status Baru:
              </p>
              <p className="text-base font-bold text-[var(--color-primary)] mt-0.5">
                {label.replace(/^(Catat|Tandai|Update|Mulai|Buat)\s+/i, "")}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Catatan Milestone (Opsional)
              </label>
              <input
                type="text"
                placeholder={
                  moda === "udara"
                    ? "Contoh: SMU telah terbit di RA / Kargo telah dimuat di pesawat"
                    : moda === "laut"
                    ? "Contoh: Kontainer telah masuk gate pelabuhan / Kapal on schedule"
                    : "Contoh: Muatan telah selesai dimuat di lokasi pengirim"
                }
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-2xl border border-[var(--color-border)] py-3 text-sm font-bold text-[var(--color-navy-900)] hover:bg-[var(--color-surface-tint)] touch-target"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleExecuteAction(nextStatus, catatan)}
                className="flex-1 rounded-2xl bg-[var(--color-primary)] py-3 text-sm font-bold text-white shadow-md hover:bg-[var(--color-primary-dark)] touch-target"
              >
                {loading ? "Menyimpan..." : "Ya, Perbarui"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Laporkan Kendala / Tertunda ── */}
      {isDelayedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 pb-6 sm:pb-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--color-surface)] p-6 shadow-xl border border-red-200 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-base font-bold text-[var(--color-navy-900)]">
                  Tandai Pengiriman Tertunda
                </h3>
              </div>
              <button
                onClick={() => setIsDelayedModal(false)}
                className="rounded-full p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tint)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-[var(--color-text-primary)]">
              Status pengiriman akan diubah menjadi <strong className="text-red-600">Tertunda</strong>. Silakan tuliskan alasan atau kendala operasional yang terjadi.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Alasan / Kendala <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder={
                  moda === "udara"
                    ? "Contoh: Penerbangan ditunda karena cuaca buruk / SMU reschedule"
                    : moda === "laut"
                    ? "Contoh: Kapal mengalami keterlambatan sandar di pelabuhan tujuan"
                    : "Contoh: Armada mengalami kendala teknis / ban bocor di tol"
                }
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsDelayedModal(false)}
                className="flex-1 rounded-2xl border border-[var(--color-border)] py-3 text-sm font-bold text-[var(--color-navy-900)] hover:bg-[var(--color-surface-tint)] touch-target"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading || !catatan.trim()}
                onClick={() => handleExecuteAction("tertunda", catatan)}
                className="flex-1 rounded-2xl bg-[var(--color-warning-600)] py-3 text-sm font-bold text-white shadow-md hover:bg-[var(--color-warning-600)]/90 disabled:opacity-50 touch-target"
              >
                {loading ? "Menyimpan..." : "Simpan Kendala"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
