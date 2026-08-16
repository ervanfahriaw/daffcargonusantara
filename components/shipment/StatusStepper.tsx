import { Check, Clock, AlertTriangle, Circle, Plane, Ship, Truck } from "lucide-react";
import { type StatusPesanan, statusPesananConfig } from "@/components/shipment/StatusBadge";
import { type JenisPengiriman, jenisPengirimanLabels } from "@/lib/validations/pesanan";

export interface RiwayatStatusItem {
  id: string;
  pesanan_id: string;
  status: StatusPesanan;
  catatan?: string | null;
  created_at: string;
}

export function getMilestoneOrder(
  moda: "darat" | "laut" | "udara" = "darat",
  scope: JenisPengiriman = "d2d"
): StatusPesanan[] {
  if (moda === "udara") {
    if (scope === "d2d") {
      return [
        "booking",
        "pickup",
        "acceptance_bandara",
        "masuk_terminal_kargo",
        "terbang",
        "dalam_penerbangan",
        "mendarat",
        "delivery_udara",
        "terkirim",
      ];
    } else if (scope === "d2p") {
      return [
        "booking",
        "pickup",
        "acceptance_bandara",
        "masuk_terminal_kargo",
        "terbang",
        "dalam_penerbangan",
        "mendarat",
        "terkirim",
      ];
    } else if (scope === "p2d") {
      return [
        "booking",
        "acceptance_bandara",
        "masuk_terminal_kargo",
        "terbang",
        "dalam_penerbangan",
        "mendarat",
        "delivery_udara",
        "terkirim",
      ];
    } else {
      // p2p
      return [
        "booking",
        "acceptance_bandara",
        "masuk_terminal_kargo",
        "terbang",
        "dalam_penerbangan",
        "mendarat",
        "terkirim",
      ];
    }
  }

  if (moda === "laut") {
    if (scope === "d2d") {
      return [
        "booking",
        "pickup",
        "stuffing",
        "gate_in_pelabuhan",
        "kapal_berangkat",
        "pelayaran",
        "kapal_tiba",
        "dooring",
        "terkirim",
      ];
    } else if (scope === "d2p") {
      return [
        "booking",
        "pickup",
        "stuffing",
        "gate_in_pelabuhan",
        "kapal_berangkat",
        "pelayaran",
        "kapal_tiba",
        "terkirim",
      ];
    } else if (scope === "p2d") {
      return [
        "booking",
        "stuffing",
        "gate_in_pelabuhan",
        "kapal_berangkat",
        "pelayaran",
        "kapal_tiba",
        "dooring",
        "terkirim",
      ];
    } else {
      // p2p
      return [
        "booking",
        "stuffing",
        "gate_in_pelabuhan",
        "kapal_berangkat",
        "pelayaran",
        "kapal_tiba",
        "terkirim",
      ];
    }
  }

  // Darat
  if (scope === "p2d" || scope === "p2p") {
    return ["booking", "berangkat", "dalam_perjalanan", "tiba", "terkirim"];
  }
  return ["booking", "pickup", "berangkat", "dalam_perjalanan", "tiba", "terkirim"];
}

const MILESTONE_DESCRIPTIONS: Record<StatusPesanan, string> = {
  // Darat & Umum
  booking: "Pesanan terdaftar dalam sistem DCN OpsHub",
  pickup: "Muat & jemput barang di gudang / lokasi pengirim",
  berangkat: "Armada truk mulai bergerak menuju tujuan",
  dalam_perjalanan: "Pengiriman sedang dalam rute perjalanan darat",
  tiba: "Armada telah tiba di lokasi bongkar tujuan",

  // Laut Antarpulau
  stuffing: "Pemuatan barang ke kontainer (FCL/LCL) di depo/gudang",
  gate_in_pelabuhan: "Kontainer masuk terminal pelabuhan muat (POL)",
  kapal_berangkat: "Kapal kargo lepas jangkar dari pelabuhan asal",
  pelayaran: "Kapal dalam pelayaran rute antarpulau",
  kapal_tiba: "Kapal sandar & bongkar di pelabuhan tujuan (POD)",
  dooring: "Truk lokal mengantar kontainer ke gudang/alamat penerima",

  // Udara Air Freight
  acceptance_bandara: "Serah terima kargo & timbang di Regulated Agent / Bandara",
  masuk_terminal_kargo: "Pemeriksaan X-Ray & Terbit Surat Muatan Udara (SMU/AWB)",
  terbang: "Pesawat kargo lepas landas (ETD)",
  dalam_penerbangan: "Kargo dalam rute penerbangan udara",
  mendarat: "Pesawat mendarat & kargo dibongkar di bandara tujuan (ETA)",
  delivery_udara: "Pengantaran kurir/truk kargo ke alamat penerima",

  // Final
  terkirim: "Barang telah diserahterimakan & POD selesai",
  tertunda: "Pengiriman mengalami kendala operasional sementara",
  selesai: "Pesanan selesai dan seluruh tagihan invoice tuntas",
};

// Format timestamp ke WIB
function formatWIB(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return (
      new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d) + " WIB"
    );
  } catch {
    return dateStr;
  }
}

interface StatusStepperProps {
  currentStatus: StatusPesanan;
  riwayat: RiwayatStatusItem[];
  moda?: "darat" | "laut" | "udara";
  jenisPengiriman?: JenisPengiriman;
}

export function StatusStepper({
  currentStatus,
  riwayat = [],
  moda = "darat",
  jenisPengiriman = "d2d",
}: StatusStepperProps) {
  // Map riwayat by status for fast lookup
  const historyMap = new Map<StatusPesanan, RiwayatStatusItem>();
  riwayat.forEach((r) => {
    historyMap.set(r.status, r);
  });

  const milestoneOrder = getMilestoneOrder(moda, jenisPengiriman);

  const isDelayed = currentStatus === "tertunda";
  const isFinished = currentStatus === "selesai";

  const activeMilestoneIndex = isFinished
    ? milestoneOrder.length
    : milestoneOrder.indexOf(currentStatus);

  const scopeConfig = jenisPengirimanLabels[jenisPengiriman] || jenisPengirimanLabels.d2d;

  return (
    <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 shadow-sm border border-[var(--color-border)] space-y-5">
      {/* Header Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-[var(--color-navy-900)]">
              Tracking Progres Pengiriman
            </h2>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${
                moda === "udara"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : moda === "laut"
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {moda === "udara" ? (
                <Plane className="h-3 w-3 shrink-0" />
              ) : moda === "laut" ? (
                <Ship className="h-3 w-3 shrink-0" />
              ) : (
                <Truck className="h-3 w-3 shrink-0" />
              )}
              <span>
                {moda === "udara"
                  ? "Air Freight"
                  : moda === "laut"
                  ? "Sea Freight"
                  : "Trucking Darat"}
              </span>
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
              {scopeConfig.title}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {scopeConfig.subtitle}
          </p>
        </div>
      </div>

      {/* Banner Peringatan jika Status Tertunda */}
      {isDelayed && (
        <div className="flex items-start gap-3 rounded-2xl bg-[var(--color-warning-100)] p-4 border border-[var(--color-warning-600)]/30">
          <AlertTriangle className="h-5 w-5 text-[var(--color-warning-600)] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs md:text-sm font-bold text-[var(--color-warning-600)]">
              Status Pengiriman: Tertunda (Delayed)
            </p>
            <p className="text-xs text-[var(--color-navy-900)] mt-0.5">
              {historyMap.get("tertunda")?.catatan ||
                "Pengiriman sedang mengalami penundaan/kendala operasional sementara."}
            </p>
          </div>
        </div>
      )}

      {/* Stepper Vertikal */}
      <div className="relative pl-3 space-y-6">
        {milestoneOrder.map((milestone, idx) => {
          const config = statusPesananConfig[milestone] || statusPesananConfig.booking;
          const historyEntry = historyMap.get(milestone);

          const isPassed =
            isFinished ||
            (activeMilestoneIndex !== -1 && idx < activeMilestoneIndex);
          const isActive = !isFinished && !isDelayed && idx === activeMilestoneIndex;

          const isLast = idx === milestoneOrder.length - 1;

          return (
            <div key={milestone} className="relative flex items-start gap-4 group">
              {/* Garis Vertikal Penghubung */}
              {!isLast && (
                <div
                  className={`absolute left-[15px] top-[30px] bottom-[-24px] w-[2.5px] transition-colors ${
                    isPassed
                      ? "bg-[var(--color-teal-500)]"
                      : "bg-[var(--color-border)]"
                  }`}
                />
              )}

              {/* Titik Lingkaran / Node Ikon */}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                  isPassed
                    ? "bg-[var(--color-teal-500)] text-white shadow-xs"
                    : isActive
                    ? "bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-surface-tint)] shadow-sm animate-pulse"
                    : "bg-[var(--color-surface)] border-2 border-[var(--color-neutral-600)]/40 text-[var(--color-neutral-600)]"
                }`}
              >
                {isPassed ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : isActive ? (
                  <Clock className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <Circle className="h-2 w-2 fill-current" />
                )}
              </div>

              {/* Informasi Milestone */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <p
                    className={`text-sm font-bold tracking-tight ${
                      isActive
                        ? "text-[var(--color-primary)] text-base"
                        : isPassed
                        ? "text-[var(--color-navy-900)]"
                        : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {config.label}
                  </p>

                  {/* Timestamp jika ada riwayat */}
                  {historyEntry && (
                    <span className="text-[11px] font-semibold text-[var(--color-teal-500)] tabular-nums">
                      {formatWIB(historyEntry.created_at)}
                    </span>
                  )}
                </div>

                {/* Deskripsi standar */}
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {MILESTONE_DESCRIPTIONS[milestone]}
                </p>

                {/* Catatan khusus jika ada pada riwayat status */}
                {historyEntry?.catatan && (
                  <div className="mt-2 rounded-xl bg-[var(--color-bg)] px-3 py-2 border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]">
                    <span className="font-semibold text-[var(--color-text-secondary)]">
                      Catatan:{" "}
                    </span>
                    {historyEntry.catatan}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
