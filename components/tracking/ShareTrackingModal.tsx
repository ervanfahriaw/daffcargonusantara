"use client";

import { useState } from "react";
import { X, Copy, Check, Share2, MessageCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  generatePublicTrackingUrl,
  generateCustomerTrackingMessage,
} from "@/lib/utils/geoTracking";
import { normalizeWhatsAppNumber } from "@/lib/utils/whatsapp";

interface ShareTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pesanan: {
    id: string;
    nomor_pesanan: string;
    nama_customer: string;
    alamat_asal: string;
    alamat_tujuan: string;
    status: string;
    catatan_muatan?: string | null;
    plat_nomor?: string | null;
    kontak_customer?: {
      nomor_telepon?: string | null;
    } | null;
  };
}

export function ShareTrackingModal({
  isOpen,
  onClose,
  pesanan,
}: ShareTrackingModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!isOpen) return null;

  const trackingUrl = generatePublicTrackingUrl(pesanan.id);
  const waMessage = generateCustomerTrackingMessage(pesanan, trackingUrl);

  const rawPhone = pesanan.kontak_customer?.nomor_telepon || "";
  const normalizedPhone = rawPhone ? normalizeWhatsAppNumber(rawPhone) : "";
  const waDirectUrl = normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(waMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(trackingUrl);
    setCopiedLink(true);
    toast.success("Link live tracking berhasil disalin ke clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handleCopyMessage() {
    navigator.clipboard.writeText(waMessage);
    setCopiedMessage(true);
    toast.success("Pesan WhatsApp siap kirim berhasil disalin!");
    setTimeout(() => setCopiedMessage(false), 2000);
  }

  function handleOpenWhatsApp() {
    window.open(waDirectUrl, "_blank");
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 pb-6 sm:pb-4">
      <div className="w-full max-w-lg rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 shadow-2xl border border-[var(--color-border)] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-navy-900)]">
                Bagikan Live Tracking
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Kirim link peta pelacakan posisi ke customer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tint)] touch-target"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Button WhatsApp Utama */}
        <button
          type="button"
          onClick={handleOpenWhatsApp}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] transition-all touch-target"
        >
          <MessageCircle className="h-5 w-5 fill-current" />
          <span>Buka & Kirim Langsung ke WhatsApp</span>
          <ExternalLink className="h-4 w-4 opacity-80" />
        </button>

        {/* Link Publik */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
            Link Pelacakan Publik (Bisa Dibuka Tanpa Login)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={trackingUrl}
              className="flex-1 rounded-2xl border border-[var(--color-border)] bg-slate-50 px-3.5 py-2.5 text-xs text-[var(--color-navy-900)] font-mono focus:outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-2xl bg-[var(--color-primary)] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--color-primary-dark)] transition-all touch-target"
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedLink ? "Tersalin" : "Salin"}</span>
            </button>
          </div>
        </div>

        {/* Pratinjau Pesan WhatsApp */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Pratinjau Format Pesan WhatsApp:
            </label>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              {copiedMessage ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copiedMessage ? "Tersalin!" : "Salin Pesan"}</span>
            </button>
          </div>
          <div className="rounded-2xl bg-[#EFEAE2] p-4 border border-[#DAD2C7] text-xs text-slate-800 font-sans whitespace-pre-line leading-relaxed shadow-inner max-h-48 overflow-y-auto">
            {waMessage}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-[var(--color-border)] py-3 text-sm font-bold text-[var(--color-navy-900)] hover:bg-[var(--color-surface-tint)] touch-target"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
