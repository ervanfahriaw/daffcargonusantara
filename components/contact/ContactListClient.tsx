"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Users, UserPlus } from "lucide-react";
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
  const countSemua = initialContacts.length;
  const countCustomer = initialContacts.filter((c) => c.kategori === "customer").length;
  const countVendor = initialContacts.filter((c) => c.kategori === "vendor_trucking").length;
  const countSupir = initialContacts.filter((c) => c.kategori === "supir").length;
  const countPelayaran = initialContacts.filter((c) => c.kategori === "pelayaran").length;
  const countMaskapai = initialContacts.filter((c) => c.kategori === "maskapai").length;
  const countDepo = initialContacts.filter((c) => c.kategori === "depo_port").length;

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
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("semua")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-bold transition-all touch-target ${
            activeTab === "semua"
              ? "bg-[var(--color-primary)] text-white shadow-xs"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg)]"
          }`}
        >
          <span>Semua</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              activeTab === "semua"
                ? "bg-white/20 text-white"
                : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]"
            }`}
          >
            {countSemua}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("customer")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-bold transition-all touch-target ${
            activeTab === "customer"
              ? "bg-[var(--color-primary)] text-white shadow-xs"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg)]"
          }`}
        >
          <span>Customer</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              activeTab === "customer"
                ? "bg-white/20 text-white"
                : "bg-[var(--color-surface-tint)] text-[var(--color-primary)]"
            }`}
          >
            {countCustomer}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("maskapai")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-bold transition-all touch-target ${
            activeTab === "maskapai"
              ? "bg-[#9333EA] text-white shadow-xs"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg)]"
          }`}
        >
          <span>✈️ Maskapai</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              activeTab === "maskapai"
                ? "bg-white/20 text-white"
                : "bg-[#F3E8FF] text-[#7E22CE]"
            }`}
          >
            {countMaskapai}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pelayaran")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-bold transition-all touch-target ${
            activeTab === "pelayaran"
              ? "bg-[#0284C7] text-white shadow-xs"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg)]"
          }`}
        >
          <span>🚢 Pelayaran</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              activeTab === "pelayaran"
                ? "bg-white/20 text-white"
                : "bg-[#E0F2FE] text-[#0369A1]"
            }`}
          >
            {countPelayaran}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vendor_trucking")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-bold transition-all touch-target ${
            activeTab === "vendor_trucking"
              ? "bg-[var(--color-navy-900)] text-white shadow-xs"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg)]"
          }`}
        >
          <span>🚚 Vendor Trucking</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              activeTab === "vendor_trucking"
                ? "bg-white/20 text-white"
                : "bg-[#F3F4F6] text-[var(--color-navy-900)]"
            }`}
          >
            {countVendor}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("supir")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-bold transition-all touch-target ${
            activeTab === "supir"
              ? "bg-[var(--color-teal-500)] text-white shadow-xs"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg)]"
          }`}
        >
          <span>Supir</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              activeTab === "supir"
                ? "bg-white/20 text-white"
                : "bg-[var(--color-teal-100)] text-[var(--color-teal-500)]"
            }`}
          >
            {countSupir}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("depo_port")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-bold transition-all touch-target ${
            activeTab === "depo_port"
              ? "bg-[#D97706] text-white shadow-xs"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg)]"
          }`}
        >
          <span>⚓ Depo / Port</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              activeTab === "depo_port"
                ? "bg-white/20 text-white"
                : "bg-[#FEF3C7] text-[#D97706]"
            }`}
          >
            {countDepo}
          </span>
        </button>
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
