import Link from "next/link";
import { StatusBadge } from "@/components/shipment/StatusBadge";
import {
  MapPin,
  ChevronRight,
  Package,
  Truck,
  Ship,
  Plane,
} from "lucide-react";
import { jenisArmadaLabels, type JenisArmada } from "@/lib/validations/pesanan";

export interface ShipmentItem {
  id: string;
  nomor_pesanan: string;
  nama_customer: string;
  alamat_asal: string;
  alamat_tujuan: string;
  status: string;
  status_pembayaran?: string;
  jenis_armada?: string | null;
  jenis_barang?: string | null;
  catatan_muatan?: string | null;
  berat?: number | null;
  jumlah_koli?: number | null;
  tarif_customer?: number | null;
  estimasi_berangkat?: string | null;
  created_at: string;
}

// Action button label based on status
function getActionLabel(status: string, isAir: boolean, isSea: boolean): string {
  switch (status) {
    case "booking":
      return isAir ? "Catat Acceptance Bandara" : isSea ? "Catat Stuffing" : "Catat Pickup";
    case "pickup":
    case "stuffing":
    case "acceptance_bandara":
      return isAir ? "Masuk Terminal Kargo" : isSea ? "Masuk Pelabuhan" : "Tandai Berangkat";
    case "masuk_terminal_kargo":
    case "gate_in_pelabuhan":
    case "berangkat":
      return isAir ? "Pesawat Lepas Landas" : isSea ? "Kapal Berangkat" : "Update Perjalanan";
    case "terbang":
    case "kapal_berangkat":
    case "dalam_perjalanan":
      return isAir ? "Update Penerbangan" : isSea ? "Update Pelayaran" : "Tiba di Tujuan";
    case "dalam_penerbangan":
    case "pelayaran":
      return isAir ? "Pesawat Mendarat" : isSea ? "Kapal Sandar" : "Tiba di Tujuan";
    case "mendarat":
    case "kapal_tiba":
    case "tiba":
      return isAir || isSea ? "Mulai Dooring" : "Buat POD";
    case "delivery_udara":
    case "dooring":
      return "Buat POD";
    case "terkirim":
      return "Buat Invoice";
    case "tertunda":
      return "Cek Kendala";
    case "selesai":
      return "Lihat Detail";
    default:
      return "Lihat Detail";
  }
}

// Helper to truncate address cleanly (showing city/area)
function formatShortAddress(addr: string): string {
  if (!addr) return "-";
  const parts = addr.split(",");
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return addr.length > 25 ? addr.substring(0, 22) + "..." : addr;
}

interface ShipmentCardProps {
  pesanan?: ShipmentItem;
  shipment?: ShipmentItem;
}

export function ShipmentCard({ pesanan, shipment }: ShipmentCardProps) {
  const item = (pesanan || shipment)!;

  const isAir =
    item.catatan_muatan?.includes("[MODA: UDARA") ||
    [
      "acceptance_bandara",
      "masuk_terminal_kargo",
      "terbang",
      "dalam_penerbangan",
      "mendarat",
      "delivery_udara",
    ].includes(item.status);

  const isSea =
    item.catatan_muatan?.includes("[MODA: LAUT") ||
    [
      "stuffing",
      "gate_in_pelabuhan",
      "kapal_berangkat",
      "pelayaran",
      "kapal_tiba",
      "dooring",
    ].includes(item.status);

  const actionText = getActionLabel(item.status, isAir, isSea);
  const shortAsal = formatShortAddress(item.alamat_asal);
  const shortTujuan = formatShortAddress(item.alamat_tujuan);
  const armadaLabel = item.jenis_armada
    ? jenisArmadaLabels[item.jenis_armada as JenisArmada] || item.jenis_armada
    : null;

  let scopeTag = "D2D";
  if (item.catatan_muatan?.includes("[SCOPE: D2P]")) scopeTag = "D2P";
  else if (item.catatan_muatan?.includes("[SCOPE: P2D]")) scopeTag = "P2D";
  else if (item.catatan_muatan?.includes("[SCOPE: P2P]")) scopeTag = "P2P";

  return (
    <Link
      href={`/pesanan/${item.id}`}
      className="block rounded-3xl bg-[var(--color-surface)] p-5 border border-[var(--color-border)] shadow-xs transition-all hover:border-[var(--color-primary)] active:scale-[0.99] touch-target group"
    >
      {/* ── Top Bar: Nomor Pesanan + Status Badge ── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Nomor Pesanan
            </span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                isAir
                  ? "bg-[#F3E8FF] text-[#7E22CE]"
                  : isSea
                  ? "bg-[#E0F2FE] text-[#0369A1]"
                  : "bg-[var(--color-surface-tint)] text-[var(--color-primary)]"
              }`}
            >
              {isAir ? "✈️ Udara" : isSea ? "🚢 Laut" : "🚚 Darat"}
            </span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 border border-slate-200">
              {scopeTag}
            </span>
          </div>
          <h3 className="text-base font-bold text-[var(--color-navy-900)] tracking-tight mt-0.5">
            {item.nomor_pesanan}
          </h3>
        </div>
        <StatusBadge status={item.status as any} />
      </div>

      {/* ── Customer Info ── */}
      <div className="mt-3">
        <p className="text-xs text-[var(--color-text-secondary)]">Customer</p>
        <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">
          {item.nama_customer}
        </p>
      </div>

      {/* ── Rute Visual (Asal ➔ Tujuan) ── */}
      <div className="mt-3.5 rounded-2xl bg-[var(--color-bg)] p-3 border border-[var(--color-border)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] shrink-0" />
          <span className="text-xs font-semibold text-[var(--color-navy-900)] truncate">
            {shortAsal}
          </span>
        </div>

        <div className="text-[var(--color-text-secondary)] text-xs font-bold shrink-0">
          ➔
        </div>

        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
          <MapPin className="h-3.5 w-3.5 text-[var(--color-teal-500)] shrink-0" />
          <span className="text-xs font-semibold text-[var(--color-navy-900)] truncate text-right">
            {shortTujuan}
          </span>
        </div>
      </div>

      {/* ── Metadata Tambahan: Moda & Muatan ── */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
        {isAir ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F3E8FF] px-2.5 py-0.5 font-semibold text-[#7E22CE]">
            <Plane className="h-3 w-3" />
            <span>Air Freight</span>
          </span>
        ) : isSea ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E0F2FE] px-2.5 py-0.5 font-semibold text-[#0369A1]">
            <Ship className="h-3 w-3" />
            <span>Sea Freight</span>
          </span>
        ) : armadaLabel ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-tint)] px-2.5 py-0.5 font-semibold text-[var(--color-primary)]">
            <Truck className="h-3 w-3" />
            <span>{armadaLabel}</span>
          </span>
        ) : null}

        {item.jenis_barang && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-neutral-100)] px-2.5 py-0.5 font-medium text-[var(--color-text-primary)] truncate max-w-[140px]">
            <Package className="h-3 w-3 text-[var(--color-neutral-600)]" />
            <span className="truncate">{item.jenis_barang}</span>
          </span>
        )}

        {item.jumlah_koli ? (
          <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">
            {item.jumlah_koli} Koli
          </span>
        ) : null}
      </div>

      {/* ── Footer: Action Prompt / Next Step ── */}
      <div className="mt-4 border-t border-[var(--color-border)] pt-3 flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--color-primary)] group-hover:underline">
          {actionText}
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface-tint)] text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
