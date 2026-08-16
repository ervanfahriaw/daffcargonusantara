import Link from "next/link";
import { Truck, AlertTriangle, CheckCircle2, Users, ChevronRight } from "lucide-react";

interface StatCardsProps {
  sedangBerjalan: number;
  perluPerhatian: number;
  selesai: number;
  totalKontak: number;
}

export function StatCards({
  sedangBerjalan,
  perluPerhatian,
  selesai,
  totalKontak,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {/* ── 1. Sedang Berjalan ── */}
      <Link
        href="/pesanan?tab=Sedang+Berjalan"
        className="block rounded-3xl bg-[var(--color-surface-tint)] p-5 border border-[var(--color-border)] shadow-xs hover:border-[var(--color-primary)] transition-all active:scale-[0.98] group"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[var(--color-primary)] shadow-2xs">
            <Truck className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-[var(--color-text-secondary)] truncate">
            Sedang Berjalan
          </span>
        </div>
        <p className="text-3xl md:text-4xl font-bold text-[var(--color-navy-900)] tabular-nums mt-1 group-hover:text-[var(--color-primary)] transition-colors">
          {sedangBerjalan}
        </p>
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--color-border)]/50 text-[11px] font-semibold text-[var(--color-primary)]">
          <span>Lihat Pengiriman</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      {/* ── 2. Perlu Perhatian / Tertunda ── */}
      <Link
        href="/pesanan?tab=Tertunda"
        className="block rounded-3xl bg-[var(--color-warning-100)] p-5 border border-[#FDE3C8] shadow-xs hover:border-[var(--color-warning-600)] transition-all active:scale-[0.98] group"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[var(--color-warning-600)] shadow-2xs">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-[var(--color-warning-600)] truncate">
            Perlu Perhatian
          </span>
        </div>
        <p className="text-3xl md:text-4xl font-bold text-[var(--color-navy-900)] tabular-nums mt-1 group-hover:text-[var(--color-warning-600)] transition-colors">
          {perluPerhatian}
        </p>
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#FDE3C8] text-[11px] font-semibold text-[var(--color-warning-600)]">
          <span>Cek Kendala</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      {/* ── 3. Pengiriman Selesai ── */}
      <Link
        href="/pesanan?tab=Selesai"
        className="block rounded-3xl bg-[var(--color-success-100)] p-5 border border-[#C6EFD9] shadow-xs hover:border-[var(--color-success-600)] transition-all active:scale-[0.98] group"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[var(--color-success-600)] shadow-2xs">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-[var(--color-success-600)] truncate">
            Selesai (POD)
          </span>
        </div>
        <p className="text-3xl md:text-4xl font-bold text-[var(--color-navy-900)] tabular-nums mt-1 group-hover:text-[var(--color-success-600)] transition-colors">
          {selesai}
        </p>
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#C6EFD9] text-[11px] font-semibold text-[var(--color-success-600)]">
          <span>Riwayat Selesai</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      {/* ── 4. Buku Kontak ── */}
      <Link
        href="/kontak"
        className="block rounded-3xl bg-[var(--color-surface)] p-5 border border-[var(--color-border)] shadow-xs hover:border-[var(--color-primary)] transition-all active:scale-[0.98] group"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-surface-tint)] text-[var(--color-navy-900)] shadow-2xs">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-[var(--color-text-secondary)] truncate">
            Buku Kontak
          </span>
        </div>
        <p className="text-3xl md:text-4xl font-bold text-[var(--color-navy-900)] tabular-nums mt-1 group-hover:text-[var(--color-primary)] transition-colors">
          {totalKontak}
        </p>
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--color-border)] text-[11px] font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]">
          <span>Customer & Supir</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </div>
  );
}
