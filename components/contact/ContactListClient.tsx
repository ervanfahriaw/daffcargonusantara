"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Users,
  Building2,
  Plane,
  Ship,
  Truck,
  User,
  Anchor,
  UserPlus,
} from "lucide-react";
import { ContactCard, type ContactData } from "@/components/contact/ContactCard";
import { ContactFormModal } from "@/components/contact/ContactFormModal";
import { type KategoriKontak } from "@/lib/validations/kontak";

type FilterTab = "semua" | KategoriKontak;

interface ContactListClientProps {
  initialContacts: ContactData[];
}

export function ContactListClient({ initialContacts }: ContactListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactData | null>(null);

  // Filtered contacts calculation
  const filteredContacts = useMemo(() => {
    return initialContacts.filter((item) => {
      // 1. Filter by category tab
      if (activeTab !== "semua" && item.kategori !== activeTab) {
        return false;
      }

      // 2. Filter by search query
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchName = item.nama.toLowerCase().includes(q);
      const matchCompany = item.perusahaan?.toLowerCase().includes(q) || false;
      const matchPhone = item.nomor_telepon.includes(q);

      return matchName || matchCompany || matchPhone;
    });
  }, [initialContacts, activeTab, searchQuery]);

  // Count calculations
  const counts = useMemo(() => ({
    semua: initialContacts.length,
    customer: initialContacts.filter((c) => c.kategori === "customer").length,
    maskapai: initialContacts.filter((c) => c.kategori === "maskapai").length,
    pelayaran: initialContacts.filter((c) => c.kategori === "pelayaran").length,
    vendor_trucking: initialContacts.filter((c) => c.kategori === "vendor_trucking").length,
    supir: initialContacts.filter((c) => c.kategori === "supir").length,
    depo_port: initialContacts.filter((c) => c.kategori === "depo_port").length,
  }), [initialContacts]);

  const categories = [
    {
      id: "semua" as FilterTab,
      label: "Semua",
      count: counts.semua,
      icon: Users,
      activeClass: "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm",
    },
    {
      id: "customer" as FilterTab,
      label: "Customer",
      count: counts.customer,
      icon: Building2,
      activeClass: "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm",
    },
    {
      id: "maskapai" as FilterTab,
      label: "Maskapai",
      count: counts.maskapai,
      icon: Plane,
      activeClass: "bg-purple-600 text-white border-purple-600 shadow-sm",
    },
    {
      id: "pelayaran" as FilterTab,
      label: "Pelayaran",
      count: counts.pelayaran,
      icon: Ship,
      activeClass: "bg-sky-600 text-white border-sky-600 shadow-sm",
    },
    {
      id: "vendor_trucking" as FilterTab,
      label: "Vendor Trucking",
      count: counts.vendor_trucking,
      icon: Truck,
      activeClass: "bg-slate-800 text-white border-slate-800 shadow-sm",
    },
    {
      id: "supir" as FilterTab,
      label: "Supir",
      count: counts.supir,
      icon: User,
      activeClass: "bg-teal-600 text-white border-teal-600 shadow-sm",
    },
    {
      id: "depo_port" as FilterTab,
      label: "Depo / Port",
      count: counts.depo_port,
      icon: Anchor,
      activeClass: "bg-amber-600 text-white border-amber-600 shadow-sm",
    },
  ];

  return (
    <div className="space-y-5 pb-28">
      {/* ── Search Bar & Tambah Kontak Button ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, perusahaan, maskapai, supir..."
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] pl-11 pr-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none shadow-xs"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingContact(null);
            setIsModalOpen(true);
          }}
          className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)] shadow-sm transition-all touch-target"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kontak</span>
        </button>
      </div>

      {/* ── Filter Tabs / Chips ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
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
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Contact Cards Grid / List ── */}
      {filteredContacts.length === 0 ? (
        <div className="rounded-3xl bg-[var(--color-surface)] p-8 text-center border border-[var(--color-border)] shadow-xs space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-tint)] mx-auto">
            <Users className="h-6 w-6 text-[var(--color-primary)]" />
          </div>
          <p className="text-sm font-semibold text-[var(--color-navy-900)]">
            Tidak ada kontak ditemukan
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-xs mx-auto">
            {searchQuery
              ? `Tidak ada hasil yang cocok dengan kata kunci "${searchQuery}".`
              : "Belum ada kontak terdaftar pada kategori ini."}
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingContact(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--color-primary-dark)] transition-all touch-target"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tambah Kontak Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={(c) => {
                setEditingContact(c);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* ── Modal Tambah / Edit Kontak ── */}
      <ContactFormModal
        isOpen={isModalOpen}
        initialData={editingContact}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
      />

      {/* ── Floating Action Button (FAB) "+ Tambah Kontak" di Layar Mobile ── */}
      <button
        type="button"
        onClick={() => {
          setEditingContact(null);
          setIsModalOpen(true);
        }}
        className="sm:hidden fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-transform active:scale-95 touch-target hover:bg-[var(--color-primary-dark)]"
        aria-label="Tambah Kontak"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
