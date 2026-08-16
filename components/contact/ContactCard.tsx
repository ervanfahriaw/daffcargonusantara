"use client";

import { useState } from "react";
import {
  User,
  Truck,
  Building2,
  Ship,
  Plane,
  Anchor,
  MessageSquare,
  Phone,
  MoreVertical,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  type KategoriKontak,
  kategoriKontakLabels,
  kategoriKontakStyles,
} from "@/lib/validations/kontak";
import { formatPhoneForWhatsApp } from "@/lib/utils/whatsapp";
import { deleteKontakAction } from "@/lib/actions/kontak-crud";

export interface ContactData {
  id: string;
  nama: string;
  kategori: KategoriKontak;
  perusahaan?: string | null;
  nomor_telepon: string;
  catatan?: string | null;
}

interface ContactCardProps {
  contact: ContactData;
  onEdit: (contact: ContactData) => void;
}

export function ContactCard({ contact, onEdit }: ContactCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const style =
    kategoriKontakStyles[contact.kategori] ||
    kategoriKontakStyles.customer;
  const label =
    kategoriKontakLabels[contact.kategori] || contact.kategori;

  const cleanPhone = formatPhoneForWhatsApp(contact.nomor_telepon);
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Halo Bapak/Ibu ${contact.nama}, kami dari PT Daff Cargo Nusantara...`
      )}`
    : "#";

  const Icon =
    contact.kategori === "maskapai"
      ? Plane
      : contact.kategori === "pelayaran"
      ? Ship
      : contact.kategori === "vendor_trucking"
      ? Truck
      : contact.kategori === "depo_port"
      ? Anchor
      : contact.kategori === "customer"
      ? Building2
      : User;

  async function handleDelete() {
    if (
      !confirm(`Hapus kontak "${contact.nama}"? Tindakan ini tidak dapat dibatalkan.`)
    ) {
      return;
    }

    setDeleting(true);
    const res = await deleteKontakAction(contact.id);
    setDeleting(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menghapus kontak.");
      return;
    }

    toast.success(res.message);
  }

  return (
    <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-xs hover:border-[var(--color-primary)] transition-all space-y-4 relative">
      {/* Header Kartu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.bg} ${style.text}`}
          >
            <Icon className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${style.bg} ${style.text} border ${style.border}`}
              >
                {label}
              </span>
            </div>

            <h3 className="text-base font-bold text-[var(--color-navy-900)] mt-0.5">
              {contact.nama}
            </h3>

            {contact.perusahaan && (
              <p className="text-xs text-[var(--color-text-secondary)]">
                {contact.perusahaan}
              </p>
            )}
          </div>
        </div>

        {/* Action Menu (Edit / Delete) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-full p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-100)] touch-target"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 z-20 w-36 rounded-2xl bg-[var(--color-surface)] p-1.5 shadow-lg border border-[var(--color-border)] space-y-1 animate-in fade-in">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onEdit(contact);
                }}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg)]"
              >
                <Edit2 className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setShowMenu(false);
                  handleDelete();
                }}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100)]"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>Hapus</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nomor Telepon & Catatan */}
      <div className="space-y-1">
        <p className="text-xs text-[var(--color-text-secondary)] font-medium">
          Nomor Telepon:
        </p>
        <p className="text-sm font-bold text-[var(--color-navy-900)] tabular-nums">
          {contact.nomor_telepon}
        </p>

        {contact.catatan && (
          <p className="text-xs text-[var(--color-text-secondary)] italic pt-1 bg-[var(--color-bg)] rounded-xl p-2.5 border border-[var(--color-border)]">
            &ldquo;{contact.catatan}&rdquo;
          </p>
        )}
      </div>

      {/* Tombol Aksi 1-Sentuhan: WhatsApp & Telepon */}
      <div className="border-t border-[var(--color-border)] pt-3 flex gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-xs md:text-sm font-bold text-white shadow-xs hover:bg-[#1EBE5D] active:scale-[0.99] transition-all touch-target"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Chat WhatsApp</span>
        </a>

        <a
          href={`tel:${contact.nomor_telepon}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-xs md:text-sm font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors touch-target"
        >
          <Phone className="h-4 w-4 text-[var(--color-primary)]" />
          <span>Telepon</span>
        </a>
      </div>
    </div>
  );
}
