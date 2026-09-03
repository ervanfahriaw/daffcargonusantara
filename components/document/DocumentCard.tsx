"use client";

import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  Share2,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
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
  customerPhone,
  alamatAsal = "Asal",
  alamatTujuan = "Tujuan",
  status = "proses",
}: DocumentCardProps) {
  const label = jenisDokumenLabels[jenis];
  const pdfUrl = `/api/documents/${pesananId}/${jenis}`;

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

  // Format tanggal terbit dokumen
  let formattedDate: string | null = null;
  if (createdDate) {
    try {
      formattedDate = new Date(createdDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      formattedDate = null;
    }
  }

  return (
    <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-xs space-y-4 transition-all hover:border-[var(--color-primary)]">
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

      {/* Informasi Tanggal Terbit jika sudah ada */}
      {isCreated && formattedDate && (
        <p className="text-[11px] text-[var(--color-text-secondary)]">
          Diterbitkan pada: <span className="font-semibold text-[var(--color-navy-900)]">{formattedDate}</span>
        </p>
      )}

      {/* Tombol Aksi Dokumen (Lihat, Unduh, Bagikan) */}
      <div className="border-t border-[var(--color-border)] pt-3 flex flex-wrap items-center gap-2">
        {isCreated ? (
          <>
            {/* Tombol Lihat PDF */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--color-primary-dark)] transition-colors touch-target"
            >
              <Eye className="h-4 w-4" />
              <span>Lihat PDF</span>
            </a>

            {/* Tombol Unduh PDF */}
            <a
              href={pdfUrl}
              download={`${jenis}_${nomorPesanan}.pdf`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2.5 text-xs font-semibold text-[var(--color-navy-900)] hover:bg-[var(--color-bg)] transition-colors touch-target"
              title="Unduh File PDF"
            >
              <Download className="h-4 w-4" />
              <span>Unduh PDF</span>
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
          </>
        ) : (
          <div className="w-full flex items-center justify-between gap-2 py-1">
            <span className="text-xs text-[var(--color-text-secondary)]">
              Dokumen ini belum diterbitkan.
            </span>
            <Link
              href={`/dokumen?pesananId=${pesananId}&jenis=${jenis}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
            >
              <span>Buat di Menu Dokumen</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
