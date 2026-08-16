"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Phone,
  MessageSquare,
  User,
  Truck,
  Building,
  Edit2,
  X,
  Loader2,
  Info,
  ShieldCheck,
} from "lucide-react";
import { type StatusPesanan } from "@/components/shipment/StatusBadge";
import {
  generateContextualWAMessage,
  getWhatsAppUrl,
} from "@/lib/utils/whatsapp";
import { linkKontakPesananAction } from "@/lib/actions/kontak";

export interface ContactInfo {
  id: string;
  nama: string;
  nomor_telepon: string;
  perusahaan?: string | null;
  kategori?: string;
}

interface ContextualContactListProps {
  pesananId: string;
  nomorPesanan: string;
  namaCustomer: string;
  currentStatus: StatusPesanan;
  alamatAsal: string;
  alamatTujuan: string;
  kontakCustomer?: ContactInfo | null;
  vendorTrucking?: ContactInfo | null;
  supir?: ContactInfo | null;
  allAvailableContacts?: ContactInfo[];
}

export function ContextualContactList({
  pesananId,
  nomorPesanan,
  namaCustomer,
  currentStatus,
  alamatAsal,
  alamatTujuan,
  kontakCustomer,
  vendorTrucking,
  supir,
  allAvailableContacts = [],
}: ContextualContactListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // States untuk modal pilih kontak
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    kontakCustomer?.id || ""
  );
  const [selectedVendorId, setSelectedVendorId] = useState(
    vendorTrucking?.id || ""
  );
  const [selectedSupirId, setSelectedSupirId] = useState(supir?.id || "");

  // Tentukan urutan prioritas kontak berdasarkan status pengiriman saat ini
  const isEnRoute =
    currentStatus === "pickup" ||
    currentStatus === "berangkat" ||
    currentStatus === "dalam_perjalanan" ||
    currentStatus === "tertunda";

  const isArrival =
    currentStatus === "tiba" || currentStatus === "terkirim";

  // List kontak yang terstruktur
  const contacts = [
    {
      role: "supir" as const,
      roleLabel: "Supir / Pengemudi",
      data: supir,
      icon: Truck,
      color: "var(--color-teal-500)",
      bgColor: "var(--color-teal-100)",
      isPrimary: isEnRoute,
      primaryReason: "Sedang dalam perjalanan — hubungi untuk cek lokasi armada",
    },
    {
      role: "vendor_trucking" as const,
      roleLabel: "Vendor Trucking",
      data: vendorTrucking,
      icon: Building,
      color: "var(--color-navy-700)",
      bgColor: "var(--color-surface-tint)",
      isPrimary: false,
      primaryReason: "Penyedia unit armada & pengemudi",
    },
    {
      role: "customer" as const,
      roleLabel: "Customer / Pemesan",
      data: kontakCustomer || {
        id: "",
        nama: namaCustomer,
        nomor_telepon: "",
      },
      icon: User,
      color: "var(--color-primary)",
      bgColor: "var(--color-surface-tint)",
      isPrimary: !isEnRoute || isArrival,
      primaryReason: isArrival
        ? "Armada tiba — hubungi untuk konfirmasi serah terima & bongkar muatan"
        : "Pemesan kargo & penanggung jawab pembayaran",
    },
  ];

  // Urutkan kontak: yang isPrimary ditaruh paling atas
  const sortedContacts = [...contacts].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });

  // Filter pilihan kontak per kategori untuk modal
  const customerOptions = allAvailableContacts.filter(
    (c) => c.kategori === "customer"
  );
  const vendorOptions = allAvailableContacts.filter(
    (c) => c.kategori === "vendor_trucking"
  );
  const supirOptions = allAvailableContacts.filter(
    (c) => c.kategori === "supir"
  );

  async function handleSaveLinkedContacts(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await linkKontakPesananAction(pesananId, {
      kontak_customer_id: selectedCustomerId || null,
      vendor_trucking_id: selectedVendorId || null,
      supir_id: selectedSupirId || null,
    });

    setLoading(false);
    if (!res.success) {
      toast.error(res.error || "Gagal menghubungkan kontak.");
      return;
    }

    toast.success(res.message);
    setShowEditModal(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* ── Banner Penjelasan Kontekstual ── */}
      <div className="flex items-start gap-3 rounded-2xl bg-[var(--color-surface-tint)] p-4 border border-[var(--color-border)]">
        <Info className="h-5 w-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs md:text-sm text-[var(--color-navy-900)] leading-relaxed">
            <strong>Kontak Kontekstual:</strong> Daftar kontak otomatis
            mengutamakan pihak yang paling relevan dengan status pengiriman saat
            ini (
            {isEnRoute
              ? "Supir & Vendor diutamakan untuk koordinasi jalan"
              : isArrival
              ? "Customer diutamakan untuk konfirmasi penerimaan kargo"
              : "Customer diutamakan untuk pemesanan & billing"}
            ).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-white hover:bg-[var(--color-primary-dark)] transition-colors touch-target"
        >
          <Edit2 className="h-3 w-3" />
          <span>Ganti Kontak</span>
        </button>
      </div>

      {/* ── List Kartu Kontak ── */}
      <div className="space-y-3">
        {sortedContacts.map((item) => {
          const hasPhone = !!item.data?.nomor_telepon;
          const phone = item.data?.nomor_telepon || "";
          const name = item.data?.nama || item.data?.perusahaan || "-";

          // Generate pesan WA sesuai status & role
          const waMessage = generateContextualWAMessage({
            role: item.role,
            contactName: name,
            orderNumber: nomorPesanan,
            customerName: namaCustomer,
            status: currentStatus,
            origin: alamatAsal,
            destination: alamatTujuan,
          });

          const waUrl = getWhatsAppUrl(phone, waMessage);
          const Icon = item.icon;

          return (
            <div
              key={item.role}
              className={`rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border shadow-sm transition-all space-y-4 ${
                item.isPrimary
                  ? "border-[var(--color-primary)] ring-2 ring-[var(--color-surface-tint)]"
                  : "border-[var(--color-border)]"
              }`}
            >
              {/* Header Kartu */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    <Icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                        {item.roleLabel}
                      </span>
                      {item.isPrimary && (
                        <span className="rounded-full bg-[var(--color-surface-tint)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                          Prioritas
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-[var(--color-navy-900)] mt-0.5">
                      {name}
                    </h3>
                    {item.data?.perusahaan && (
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {item.data.perusahaan}
                      </p>
                    )}
                  </div>
                </div>

                {hasPhone ? (
                  <span className="text-xs font-bold text-[var(--color-text-primary)] tabular-nums">
                    {phone}
                  </span>
                ) : (
                  <span className="text-xs text-[var(--color-neutral-600)] italic">
                    Belum ada nomor
                  </span>
                )}
              </div>

              {/* Catatan Konteks */}
              <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg)] rounded-xl p-2.5 border border-[var(--color-border)]">
                {item.primaryReason}
              </p>

              {/* Tombol Aksi Cepat 1-Klik: WhatsApp & Telepon */}
              <div className="border-t border-[var(--color-border)] pt-3 flex gap-2">
                {hasPhone ? (
                  <>
                    {/* Tombol WhatsApp */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-xs md:text-sm font-bold text-white shadow-xs hover:bg-[#1EBE5D] active:scale-[0.99] transition-all touch-target"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat WhatsApp</span>
                    </a>

                    {/* Tombol Telepon */}
                    <a
                      href={`tel:${phone}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-xs md:text-sm font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors touch-target"
                    >
                      <Phone className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>Telepon</span>
                    </a>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="w-full rounded-full border border-dashed border-[var(--color-border)] py-2.5 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-tint)] transition-colors touch-target"
                  >
                    + Hubungkan Kontak {item.roleLabel}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal Pilih / Ganti Kontak Terkait ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-4 pb-6 sm:pb-4 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleSaveLinkedContacts}
            className="w-full max-w-md rounded-3xl bg-[var(--color-surface)] p-6 shadow-xl border border-[var(--color-border)] space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--color-navy-900)]">
                Atur Kontak Terkait Pesanan
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
              {/* Pilih Customer */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Kontak Customer / Pemesan
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                >
                  <option value="">-- Tetapkan dari data pesanan --</option>
                  {customerOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama} {c.perusahaan ? `(${c.perusahaan})` : ""} -{" "}
                      {c.nomor_telepon}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Vendor Trucking */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Vendor Trucking
                </label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                >
                  <option value="">-- Tidak ada / Vendor langsung --</option>
                  {vendorOptions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nama} {v.perusahaan ? `(${v.perusahaan})` : ""} -{" "}
                      {v.nomor_telepon}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Supir */}
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Supir / Pengemudi
                </label>
                <select
                  value={selectedSupirId}
                  onChange={(e) => setSelectedSupirId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                >
                  <option value="">-- Belum ditentukan --</option>
                  {supirOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} - {s.nomor_telepon}
                    </option>
                  ))}
                </select>
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
                {loading ? "Menyimpan..." : "Simpan Kontak"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
