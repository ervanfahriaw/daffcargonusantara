"use client";

import { useState, useMemo } from "react";
import { Search, X, Filter, Layers, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ShipmentCard, type ShipmentItem } from "@/components/shipment/ShipmentCard";
import { EmptyState } from "@/components/shipment/EmptyState";

type FilterTab = "Semua" | "Sedang Berjalan" | "Tertunda" | "Selesai";

const FILTER_TABS: { id: FilterTab; label: string; icon: typeof Layers; activeClass: string }[] = [
  {
    id: "Semua",
    label: "Semua",
    icon: Layers,
    activeClass: "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm",
  },
  {
    id: "Sedang Berjalan",
    label: "Sedang Berjalan",
    icon: Clock,
    activeClass: "bg-blue-600 text-white border-blue-600 shadow-sm",
  },
  {
    id: "Tertunda",
    label: "Tertunda",
    icon: AlertTriangle,
    activeClass: "bg-amber-600 text-white border-amber-600 shadow-sm",
  },
  {
    id: "Selesai",
    label: "Selesai",
    icon: CheckCircle2,
    activeClass: "bg-teal-600 text-white border-teal-600 shadow-sm",
  },
];

interface ShipmentListProps {
  initialItems: ShipmentItem[];
}

export function ShipmentList({ initialItems = [] }: ShipmentListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter items based on activeTab and searchQuery
  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      // 1. Tab Status Filter
      if (activeTab === "Sedang Berjalan") {
        const activeStatuses = [
          "booking",
          "pickup",
          "berangkat",
          "dalam_perjalanan",
          "tiba",
          "terkirim",
        ];
        if (!activeStatuses.includes(item.status)) return false;
      } else if (activeTab === "Tertunda") {
        if (item.status !== "tertunda") return false;
      } else if (activeTab === "Selesai") {
        if (item.status !== "selesai") return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNomor = item.nomor_pesanan.toLowerCase().includes(q);
        const matchesCustomer = item.nama_customer.toLowerCase().includes(q);
        const matchesAsal = item.alamat_asal.toLowerCase().includes(q);
        const matchesTujuan = item.alamat_tujuan.toLowerCase().includes(q);
        const matchesBarang = item.jenis_barang
          ? item.jenis_barang.toLowerCase().includes(q)
          : false;

        return (
          matchesNomor ||
          matchesCustomer ||
          matchesAsal ||
          matchesTujuan ||
          matchesBarang
        );
      }

      return true;
    });
  }, [initialItems, activeTab, searchQuery]);

  // Counts for tabs badge
  const counts = useMemo(() => {
    const total = initialItems.length;
    const sedangBerjalan = initialItems.filter((i) =>
      [
        "booking",
        "pickup",
        "berangkat",
        "dalam_perjalanan",
        "tiba",
        "terkirim",
      ].includes(i.status)
    ).length;
    const tertunda = initialItems.filter((i) => i.status === "tertunda").length;
    const selesai = initialItems.filter((i) => i.status === "selesai").length;

    return {
      Semua: total,
      "Sedang Berjalan": sedangBerjalan,
      Tertunda: tertunda,
      Selesai: selesai,
    };
  }, [initialItems]);

  return (
    <div className="space-y-4">
      {/* ── Filter Status (Horizontal Chips) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id];
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 whitespace-nowrap inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-semibold transition-all border touch-target ${
                isActive
                  ? tab.activeClass
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{tab.label}</span>
              <span
                className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search Bar ── */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-4 w-4 text-[var(--color-text-secondary)]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nomor pesanan atau nama customer..."
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] pl-11 pr-10 py-3.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-neutral-600)] shadow-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] touch-target"
            aria-label="Bersihkan pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Daftar Kartu Pesanan atau Empty State ── */}
      {initialItems.length === 0 ? (
        // Belum ada pesanan sama sekali
        <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-sm">
          <EmptyState
            title="Belum ada pesanan."
            description="Yuk buat pesanan pertama."
            actionText="Buat Pesanan Baru"
            actionHref="/pesanan/baru"
          />
        </div>
      ) : filteredItems.length === 0 ? (
        // Hasil filter/pencarian tidak ditemukan
        <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8 text-center shadow-sm space-y-3">
          <p className="text-base font-bold text-[var(--color-navy-900)]">
            Tidak ada pesanan ditemukan
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-xs mx-auto">
            Tidak ada pesanan yang sesuai dengan filter &quot;{activeTab}&quot;
            {searchQuery ? ` atau kata kunci "${searchQuery}"` : ""}.
          </p>
          <button
            onClick={() => {
              setActiveTab("Semua");
              setSearchQuery("");
            }}
            className="inline-flex rounded-full bg-[var(--color-surface-tint)] px-5 py-2.5 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors touch-target"
          >
            Reset Filter & Pencarian
          </button>
        </div>
      ) : (
        // List Kartu Pesanan
        <div className="space-y-3 pb-24">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Menampilkan {filteredItems.length} pesanan
            </p>
          </div>
          {filteredItems.map((pesanan) => (
            <ShipmentCard key={pesanan.id} pesanan={pesanan} />
          ))}
        </div>
      )}
    </div>
  );
}
