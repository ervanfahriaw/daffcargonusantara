import {
  Clock,
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  CheckCircle,
  Ship,
  Anchor,
  Navigation,
  Warehouse,
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  ShieldCheck,
} from "lucide-react";

export type StatusPesanan =
  | "booking"
  // Darat
  | "pickup"
  | "berangkat"
  | "dalam_perjalanan"
  | "tiba"
  // Laut (Antarpulau)
  | "stuffing"
  | "gate_in_pelabuhan"
  | "kapal_berangkat"
  | "pelayaran"
  | "kapal_tiba"
  | "dooring"
  // Udara (Air Freight)
  | "acceptance_bandara"
  | "masuk_terminal_kargo"
  | "terbang"
  | "dalam_penerbangan"
  | "mendarat"
  | "delivery_udara"
  // Common / Final
  | "terkirim"
  | "tertunda"
  | "selesai";

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const statusPesananConfig: Record<StatusPesanan, StatusConfig> = {
  booking: {
    label: "Booking",
    bgColor: "bg-[var(--color-neutral-100)]",
    textColor: "text-[var(--color-neutral-600)]",
    icon: Clock,
  },

  // ── 1. MODA DARAT (TRUCKING) ──
  pickup: {
    label: "Pickup Barang",
    bgColor: "bg-[var(--color-surface-tint)]",
    textColor: "text-[var(--color-primary)]",
    icon: Package,
  },
  berangkat: {
    label: "Berangkat",
    bgColor: "bg-[var(--color-surface-tint)]",
    textColor: "text-[var(--color-primary)]",
    icon: Truck,
  },
  dalam_perjalanan: {
    label: "Dalam Perjalanan",
    bgColor: "bg-[var(--color-teal-100)]",
    textColor: "text-[var(--color-teal-500)]",
    icon: Truck,
  },
  tiba: {
    label: "Tiba di Tujuan",
    bgColor: "bg-[var(--color-teal-100)]",
    textColor: "text-[var(--color-teal-500)]",
    icon: MapPin,
  },

  // ── 2. MODA LAUT (SEA FREIGHT) ──
  stuffing: {
    label: "Stuffing / Muat Kontainer",
    bgColor: "bg-[var(--color-surface-tint)]",
    textColor: "text-[var(--color-primary)]",
    icon: Warehouse,
  },
  gate_in_pelabuhan: {
    label: "Masuk Pelabuhan (Gate In)",
    bgColor: "bg-[#E0F2FE]",
    textColor: "text-[#0369A1]",
    icon: Anchor,
  },
  kapal_berangkat: {
    label: "Kapal Berangkat (ETD)",
    bgColor: "bg-[#E0F2FE]",
    textColor: "text-[#0369A1]",
    icon: Ship,
  },
  pelayaran: {
    label: "Pelayaran Laut",
    bgColor: "bg-[var(--color-teal-100)]",
    textColor: "text-[var(--color-teal-500)]",
    icon: Navigation,
  },
  kapal_tiba: {
    label: "Kapal Sandar / Tiba (ETA)",
    bgColor: "bg-[var(--color-teal-100)]",
    textColor: "text-[var(--color-teal-500)]",
    icon: Anchor,
  },
  dooring: {
    label: "Pengantaran Dooring",
    bgColor: "bg-[var(--color-surface-tint)]",
    textColor: "text-[var(--color-primary)]",
    icon: Truck,
  },

  // ── 3. MODA UDARA (AIR FREIGHT) ──
  acceptance_bandara: {
    label: "Acceptance Bandara / RA",
    bgColor: "bg-[#F3E8FF]",
    textColor: "#7E22CE",
    icon: ShieldCheck,
  },
  masuk_terminal_kargo: {
    label: "Terbit SMU / Terminal Kargo",
    bgColor: "bg-[#F3E8FF]",
    textColor: "#7E22CE",
    icon: Package,
  },
  terbang: {
    label: "Pesawat Lepas Landas (ETD)",
    bgColor: "bg-[#F3E8FF]",
    textColor: "#7E22CE",
    icon: PlaneTakeoff,
  },
  dalam_penerbangan: {
    label: "Dalam Penerbangan Udara",
    bgColor: "bg-[var(--color-teal-100)]",
    textColor: "text-[var(--color-teal-500)]",
    icon: Plane,
  },
  mendarat: {
    label: "Pesawat Mendarat (ETA)",
    bgColor: "bg-[var(--color-teal-100)]",
    textColor: "text-[var(--color-teal-500)]",
    icon: PlaneLanding,
  },
  delivery_udara: {
    label: "Pengantaran Kurir Bandara",
    bgColor: "bg-[var(--color-surface-tint)]",
    textColor: "text-[var(--color-primary)]",
    icon: Truck,
  },

  // ── 4. STATUS FINAL & KENDALA ──
  terkirim: {
    label: "Terkirim (POD)",
    bgColor: "bg-[var(--color-success-100)]",
    textColor: "text-[var(--color-success-600)]",
    icon: CheckCircle2,
  },
  tertunda: {
    label: "Tertunda / Kendala",
    bgColor: "bg-[var(--color-warning-100)]",
    textColor: "text-[var(--color-warning-600)]",
    icon: AlertTriangle,
  },
  selesai: {
    label: "Selesai",
    bgColor: "bg-[var(--color-success-100)]",
    textColor: "text-[var(--color-navy-900)]",
    icon: CheckCircle,
  },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config =
    statusPesananConfig[status as StatusPesanan] ||
    statusPesananConfig.booking;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${config.bgColor} ${config.textColor} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
