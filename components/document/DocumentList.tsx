"use client";

import { Info } from "lucide-react";
import { DocumentCard } from "@/components/document/DocumentCard";
import { type JenisDokumen } from "@/lib/actions/dokumen";

export interface DokumenRecord {
  id: string;
  pesanan_id: string;
  jenis: JenisDokumen;
  nama_file: string;
  storage_path: string;
  created_at: string;
}

const DOCUMENT_ITEMS: Array<{
  jenis: JenisDokumen;
  description: string;
}> = [
  {
    jenis: "surat_jalan",
    description: "Bukti resmi barang dalam perjalanan, dibawa supir.",
  },
  {
    jenis: "invoice",
    description: "Tagihan resmi ke customer.",
  },
  {
    jenis: "cost_sheet",
    description: "Catatan biaya vendor & margin, untuk arsip internal.",
  },
  {
    jenis: "pod",
    description: "Bukti barang sudah diterima customer, dilengkapi foto & tanda tangan.",
  },
];

interface DocumentListProps {
  pesananId: string;
  nomorPesanan: string;
  namaCustomer: string;
  currentPlatNomor?: string | null;
  currentSupirNama?: string | null;
  customerPhone?: string | null;
  alamatAsal?: string;
  alamatTujuan?: string;
  status?: string;
  existingDokumen?: DokumenRecord[];
}

export function DocumentList({
  pesananId,
  nomorPesanan,
  namaCustomer,
  currentPlatNomor,
  currentSupirNama,
  customerPhone,
  alamatAsal,
  alamatTujuan,
  status,
  existingDokumen = [],
}: DocumentListProps) {
  // Map existing documents by jenis
  const docsMap = new Map<JenisDokumen, DokumenRecord>();
  existingDokumen.forEach((d) => {
    docsMap.set(d.jenis, d);
  });

  return (
    <div className="space-y-4">
      {/* Tooltip Petunjuk Arsip Dokumen */}
      <div className="flex items-start gap-3 rounded-2xl bg-[var(--color-surface-tint)] p-4 border border-[var(--color-border)]">
        <Info className="h-5 w-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm text-[var(--color-navy-900)] leading-relaxed">
          <p className="font-bold">Arsip Dokumen Pesanan:</p>
          <p className="text-[var(--color-text-secondary)] mt-0.5">
            Dokumen yang sudah diterbitkan dapat Anda lihat, unduh, dan bagikan ke WhatsApp langsung dari sini. Untuk membuat dokumen baru, silakan gunakan menu <strong>Buat Dokumen</strong> di Beranda.
          </p>
        </div>
      </div>

      {/* 4 Kartu Dokumen */}
      <div className="space-y-3">
        {DOCUMENT_ITEMS.map((item) => {
          const doc = docsMap.get(item.jenis);
          const isCreated = !!doc;

          return (
            <DocumentCard
              key={item.jenis}
              pesananId={pesananId}
              nomorPesanan={nomorPesanan}
              namaCustomer={namaCustomer}
              jenis={item.jenis}
              description={item.description}
              isCreated={isCreated}
              createdDate={doc?.created_at}
              customerPhone={customerPhone}
              alamatAsal={alamatAsal}
              alamatTujuan={alamatTujuan}
              status={status}
            />
          );
        })}
      </div>
    </div>
  );
}
