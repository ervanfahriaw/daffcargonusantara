"use client";

import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  Share2,
  Download,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { generateDokumenAction } from "@/lib/actions/dokumen";
import {
  type JenisDokumen,
  jenisDokumenLabels,
} from "@/lib/types/dokumen";
import {
  generateDocumentShareMessage,
  buildWhatsAppSendUrl,
  type DocumentTypeKey,
} from "@/lib/services/waNotificationService";

interface DocumentCardProps {
  pesananId: string;
  nomorPesanan: string;
  namaCustomer: string;
  jenis: JenisDokumen;
  description: string;
  isCreated: boolean;
  createdDate?: string | null;
  currentPlatNomor?: string | null;
  currentSupirNama?: string | null;
  customerPhone?: string | null;
  alamatAsal?: string;
  alamatTujuan?: string;
  status?: string;
}

export function DocumentCard({
  pesananId,
  nomorPesanan,
  namaCustomer,
  jenis,
  description,
  isCreated,
  createdDate,
  currentPlatNomor,
  currentSupirNama,
  customerPhone,
  alamatAsal = "Asal",
  alamatTujuan = "Tujuan",
  status = "proses",
}: DocumentCardProps) {
  const [loading, setLoading] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [platNomor, setPlatNomor] = useState(currentPlatNomor || "");
  const [supirNama, setSupirNama] = useState(currentSupirNama || "");

  const label = jenisDokumenLabels[jenis];
  const pdfUrl = `/api/documents/${pesananId}/${jenis}`;

  async function handleGenerate(extraData?: { plat_nomor?: string; supir_nama?: string }) {
    setLoading(true);
    const res = await generateDokumenAction(pesananId, jenis, extraData);
    setLoading(false);
    setShowPromptModal(false);

    if (!res.success) {
      toast.error(res.error || "Gagal membuat dokumen.");
      return;
    }

    toast.success(res.message);
  }

  function handleStartGenerate() {
    // Jika Surat Jalan dan belum ada plat nomor / supir, munculkan modal cepat
    if (jenis === "surat_jalan" && (!currentPlatNomor || !currentSupirNama)) {
      setShowPromptModal(true);
      return;
    }

    handleGenerate();
  }

  function handleShareWhatsApp() {
    const fullPdfUrl = `${typeof window !== "undefined" ? window.location.origin : ""}${pdfUrl}`;
    const message = generateDocumentShareMessage(
      {
        id: pesananId,
        nomor_pesanan: nomorPesanan,
        nama_customer: namaCustomer,
        alamat_asal: alamatAsal,
        alamat_tujuan: alamatTujuan,
        status: status,
      },
      jenis as DocumentTypeKey,
      fullPdfUrl
    );

    const sendUrl = buildWhatsAppSendUrl(customerPhone || "", message);
    window.open(sendUrl, "_blank");
    toast.success(`Membuka WhatsApp untuk mengirim ${label}`);
  }

  return (
    <>
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-sm space-y-4 transition-all hover:border-[var(--color-primary)]">
        {/* Header Kartu Dokumen */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                isCreated
                  ? "bg-[var(--color-teal-100)] text-[var(--color-teal-500)]"
                  : "bg-[var(--color-surface-tint)] text-[var(--color-primary)]"
              }`}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-navy-900)]">
                {label}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {description}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
              isCreated
                ? "bg-[var(--color-success-100)] text-[var(--color-success-600)]"
                : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]"
            }`}
          >
            {isCreated ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Sudah Dibuat</span>
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5" />
                <span>Belum Dibuat</span>
              </>
            )}
          </span>
        </div>

        {/* Tombol Aksi */}
        <div className="border-t border-[var(--color-border)] pt-3 flex flex-wrap items-center gap-2">
          {!isCreated ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleStartGenerate}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-xs md:text-sm font-bold text-white shadow-xs hover:bg-[var(--color-primary-dark)] active:scale-[0.99] disabled:opacity-50 transition-all touch-target"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span>{loading ? "Membuat PDF..." : "Buat Dokumen"}</span>
            </button>
          ) : (
            <>
              {/* Tombol Lihat PDF */}
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--color-primary-dark)] transition-colors touch-target"
              >
                <Eye className="h-4 w-4" />
                <span>Lihat PDF</span>
              </a>

              {/* Tombol Bagikan ke WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366]/15 text-[#128C7E] px-4 py-2.5 text-xs font-bold hover:bg-[#25D366]/25 transition-colors touch-target"
                title="Bagikan ke WhatsApp"
              >
                <Share2 className="h-4 w-4" />
                <span>Bagikan ke WhatsApp</span>
              </button>

              {/* Tombol Generate Ulang */}
              <button
                type="button"
                disabled={loading}
                onClick={handleStartGenerate}
                className="rounded-full p-2.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-100)] transition-colors touch-target"
                title="Generate Ulang PDF"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Modal Input Tambahan (Plat & Supir untuk Surat Jalan) ── */}
      {showPromptModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-4 pb-6 sm:pb-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[var(--color-surface)] p-6 shadow-xl border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--color-navy-900)]">
                Lengkapi Data Surat Jalan
              </h3>
              <button
                onClick={() => setShowPromptModal(false)}
                className="rounded-full p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-100)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)]">
              Masukkan plat nomor dan nama supir yang bertugas agar tercetak resmi di Surat Jalan.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Plat Nomor Kendaraan
                </label>
                <input
                  type="text"
                  value={platNomor}
                  onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
                  placeholder="Contoh: B 1234 XYZ"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] uppercase focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Nama Pengemudi / Supir
                </label>
                <input
                  type="text"
                  value={supirNama}
                  onChange={(e) => setSupirNama(e.target.value)}
                  placeholder="Contoh: Bpk. Joko Santoso"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPromptModal(false)}
                className="flex-1 rounded-full border border-[var(--color-border)] py-3 text-xs md:text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] touch-target"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleGenerate({
                    plat_nomor: platNomor,
                    supir_nama: supirNama,
                  })
                }
                className="flex-1 rounded-full bg-[var(--color-primary)] py-3 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-dark)] touch-target"
              >
                {loading ? "Menyimpan..." : "Buat Surat Jalan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
