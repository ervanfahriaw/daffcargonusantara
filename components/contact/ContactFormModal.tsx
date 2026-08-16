"use client";

import { useState } from "react";
import { X, Loader2, User, Building, Phone, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  type KategoriKontak,
  kategoriKontakLabels,
  type KontakFormInput,
} from "@/lib/validations/kontak";
import {
  createKontakAction,
  updateKontakAction,
} from "@/lib/actions/kontak-crud";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id: string;
    nama: string;
    kategori: KategoriKontak;
    perusahaan?: string | null;
    nomor_telepon: string;
    catatan?: string | null;
  } | null;
  onSuccess?: (contactId?: string) => void;
}

export function ContactFormModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: ContactFormModalProps) {
  const isEditing = !!initialData?.id;

  const [nama, setNama] = useState(initialData?.nama || "");
  const [kategori, setKategori] = useState<KategoriKontak>(
    initialData?.kategori || "customer"
  );
  const [perusahaan, setPerusahaan] = useState(initialData?.perusahaan || "");
  const [nomorTelepon, setNomorTelepon] = useState(
    initialData?.nomor_telepon || ""
  );
  const [catatan, setCatatan] = useState(initialData?.catatan || "");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload: KontakFormInput = {
      nama,
      kategori,
      perusahaan: perusahaan || undefined,
      nomor_telepon: nomorTelepon,
      catatan: catatan || undefined,
    };

    const res = isEditing
      ? await updateKontakAction(initialData.id, payload)
      : await createKontakAction(payload);

    setLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan kontak.");
      return;
    }

    toast.success(res.message);
    onClose();
    if (onSuccess) onSuccess(res.contactId);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-4 pb-6 sm:pb-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[var(--color-surface)] p-6 shadow-xl border border-[var(--color-border)] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <h3 className="text-base md:text-lg font-bold text-[var(--color-navy-900)]">
            {isEditing ? "Edit Kontak" : "Tambah Kontak Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-100)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pilihan Kategori */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
              Kategori Kontak <span className="text-[var(--color-danger-600)]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  "customer",
                  "vendor_trucking",
                  "supir",
                  "pelayaran",
                  "maskapai",
                  "depo_port",
                ] as KategoriKontak[]
              ).map((kat) => (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setKategori(kat)}
                  className={`rounded-2xl p-2.5 text-center text-xs font-bold transition-all border ${
                    kategori === kat
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs"
                      : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  {kategoriKontakLabels[kat]}
                </button>
              ))}
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
              Nama Lengkap <span className="text-[var(--color-danger-600)]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Bpk. Joko Santoso"
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* Nomor Telepon / WA */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
              Nomor Telepon / WhatsApp <span className="text-[var(--color-danger-600)]">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
              <input
                type="tel"
                required
                value={nomorTelepon}
                onChange={(e) => setNomorTelepon(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--color-text-primary)] tabular-nums focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* Nama Perusahaan (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
              Nama Perusahaan (Opsional)
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                value={perusahaan}
                onChange={(e) => setPerusahaan(e.target.value)}
                placeholder="Contoh: PT Sinar Logistik Abadi"
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* Catatan (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 h-4 w-4 text-[var(--color-text-secondary)]" />
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Supir rute Jawa Tengah & Jawa Timur"
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* Tombol Form */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[var(--color-border)] py-3 text-xs md:text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] touch-target"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-[var(--color-primary)] py-3 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-dark)] touch-target"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                </span>
              ) : isEditing ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Kontak"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
