import Link from "next/link";
import { StatusBadge } from "@/components/shipment/StatusBadge";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { type ShipmentItem } from "@/components/shipment/ShipmentCard";

// Dynamic action button label according to brief.md
function getActionLabel(status: string): string {
  switch (status) {
    case "booking":
      return "Konfirmasi Booking";
    case "pickup":
      return "Catat Pickup";
    case "berangkat":
      return "Tandai Berangkat";
    case "dalam_perjalanan":
      return "Update Perjalanan";
    case "tiba":
      return "Buat Bukti Serah Terima (POD)";
    case "terkirim":
      return "Buat Invoice";
    case "tertunda":
      return "Cek Kendala Pengiriman";
    default:
      return "Lihat Detail";
  }
}

interface PerluTindakanListProps {
  items: ShipmentItem[];
}

export function PerluTindakanList({ items }: PerluTindakanListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-success-100)] mx-auto mb-3">
          <CheckCircle2 className="h-6 w-6 text-[var(--color-success-600)]" />
        </div>
        <p className="text-sm font-bold text-[var(--color-navy-900)] mb-0.5">
          Semua Berjalan Lancar
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Tidak ada pesanan yang memerlukan tindakan mendesak hari ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const actionLabel = getActionLabel(item.status);
        const isUrgent = item.status === "tertunda" || item.status === "booking";

        return (
          <div
            key={item.id}
            className={`rounded-3xl bg-[var(--color-surface)] p-5 border shadow-sm transition-all hover:shadow-md ${
              isUrgent
                ? "border-[var(--color-warning-600)]/40 bg-gradient-to-r from-white to-[var(--color-warning-100)]/30"
                : "border-[var(--color-border)]"
            }`}
          >
            {/* Header: Nomor + Badge */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-[var(--color-navy-900)]">
                {item.nomor_pesanan}
              </span>
              <StatusBadge status={item.status} />
            </div>

            {/* Customer */}
            <p className="text-sm font-bold text-[var(--color-text-primary)] mb-1 truncate">
              {item.nama_customer}
            </p>

            {/* Rute Singkat */}
            <p className="text-xs text-[var(--color-text-secondary)] mb-4 truncate">
              {item.alamat_asal} → {item.alamat_tujuan}
            </p>

            {/* Tombol Aksi Utama */}
            <Link
              href={`/pesanan/${item.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-3 text-xs md:text-sm font-bold text-white shadow-xs hover:bg-[var(--color-primary-dark)] active:scale-[0.99] transition-all touch-target"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
