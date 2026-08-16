"use client";

import { useState } from "react";
import { Clock, FileText, CreditCard, Users, Package, Truck, Ship, Anchor, MapPin, Plane, ShieldCheck } from "lucide-react";
import { StatusStepper, type RiwayatStatusItem } from "@/components/shipment/StatusStepper";
import { DynamicActionButton } from "@/components/shipment/DynamicActionButton";
import { DocumentList, type DokumenRecord } from "@/components/document/DocumentList";
import { FinanceTab } from "@/components/finance/FinanceTab";
import {
  ContextualContactList,
  type ContactInfo,
} from "@/components/contact/ContextualContactList";
import { LiveTrackingMap } from "@/components/tracking/LiveTrackingMap";
import { ShareTrackingModal } from "@/components/tracking/ShareTrackingModal";
import { type StatusPesanan } from "@/components/shipment/StatusBadge";
import { jenisArmadaLabels, type JenisArmada, type ModaPengiriman, type JenisPengiriman } from "@/lib/validations/pesanan";

export type TabType = "tracking" | "dokumen" | "keuangan" | "kontak";

interface DetailPesananTabsProps {
  pesanan: {
    id: string;
    nomor_pesanan: string;
    nama_customer: string;
    alamat_asal: string;
    alamat_tujuan: string;
    status: StatusPesanan;
    status_pembayaran: string;
    jenis_armada?: string | null;
    jenis_barang?: string | null;
    berat?: number | null;
    volume?: number | null;
    jumlah_koli?: number | null;
    catatan_muatan?: string | null;
    plat_nomor?: string | null;
    estimasi_berangkat?: string | null;
    tarif_customer?: number | null;
    biaya_vendor?: number | null;
    biaya_lainnya?: number | null;
    kontak_customer?: {
      id: string;
      nama: string;
      nomor_telepon: string;
      perusahaan?: string | null;
    } | null;
    vendor_trucking?: {
      id: string;
      nama: string;
      nomor_telepon: string;
      perusahaan?: string | null;
    } | null;
    supir?: {
      id: string;
      nama: string;
      nomor_telepon: string;
    } | null;
  };
  riwayat: RiwayatStatusItem[];
  dokumen?: DokumenRecord[];
  allContacts?: ContactInfo[];
}

export function DetailPesananTabs({
  pesanan,
  riwayat,
  dokumen = [],
  allContacts = [],
}: DetailPesananTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tracking");
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Deteksi moda pengiriman (Darat, Laut, atau Udara)
  let moda: ModaPengiriman = "darat";
  if (
    pesanan.catatan_muatan?.includes("[MODA: UDARA") ||
    [
      "acceptance_bandara",
      "masuk_terminal_kargo",
      "terbang",
      "dalam_penerbangan",
      "mendarat",
      "delivery_udara",
    ].includes(pesanan.status)
  ) {
    moda = "udara";
  } else if (
    pesanan.catatan_muatan?.includes("[MODA: LAUT") ||
    [
      "stuffing",
      "gate_in_pelabuhan",
      "kapal_berangkat",
      "pelayaran",
      "kapal_tiba",
      "dooring",
    ].includes(pesanan.status)
  ) {
    moda = "laut";
  }

  // Deteksi jenis lingkup layanan (D2D, D2P, P2D, P2P)
  let jenisPengiriman: JenisPengiriman = "d2d";
  if (pesanan.catatan_muatan?.includes("[SCOPE: D2P]")) {
    jenisPengiriman = "d2p";
  } else if (pesanan.catatan_muatan?.includes("[SCOPE: P2D]")) {
    jenisPengiriman = "p2d";
  } else if (pesanan.catatan_muatan?.includes("[SCOPE: P2P]")) {
    jenisPengiriman = "p2p";
  }

  return (
    <div className="space-y-6 pb-48">
      {/* ── Tab Navigation Bar ── */}
      <div className="flex border-b border-[var(--color-border)] overflow-x-auto gap-2 pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab("tracking")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs md:text-sm font-bold transition-all touch-target border-b-2 ${
            activeTab === "tracking"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Tracking</span>
        </button>

        <button
          onClick={() => setActiveTab("dokumen")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs md:text-sm font-bold transition-all touch-target border-b-2 ${
            activeTab === "dokumen"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Dokumen</span>
          {dokumen.length > 0 && (
            <span className="rounded-full bg-[var(--color-surface-tint)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--color-primary)]">
              {dokumen.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("keuangan")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs md:text-sm font-bold transition-all touch-target border-b-2 ${
            activeTab === "keuangan"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Keuangan</span>
        </button>

        <button
          onClick={() => setActiveTab("kontak")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs md:text-sm font-bold transition-all touch-target border-b-2 ${
            activeTab === "kontak"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Kontak</span>
        </button>
      </div>

      {/* ── ISI TAB 1: TRACKING ── */}
      {activeTab === "tracking" && (
        <div className="space-y-6">
          {/* Live Tracking Map Koordinat & Rute */}
          <LiveTrackingMap
            pesanan={pesanan}
            onShareClick={() => setIsShareOpen(true)}
          />

          {/* Stepper Vertikal */}
          <StatusStepper
            currentStatus={pesanan.status}
            riwayat={riwayat}
            moda={moda}
            jenisPengiriman={jenisPengiriman}
          />

          {/* Spesifikasi Muatan */}
          <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 shadow-sm border border-[var(--color-border)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
              <Package className="h-5 w-5 text-[var(--color-teal-500)]" />
              <h2 className="text-base font-bold text-[var(--color-navy-900)]">
                Spesifikasi Muatan
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-[var(--color-bg)] p-3 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-secondary)]">Jenis Barang</p>
                <p className="text-sm font-bold text-[var(--color-navy-900)] mt-0.5 truncate">
                  {pesanan.jenis_barang || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--color-bg)] p-3 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-secondary)]">Berat</p>
                <p className="text-sm font-bold text-[var(--color-navy-900)] mt-0.5 tabular-nums">
                  {pesanan.berat ? `${pesanan.berat.toLocaleString("id-ID")} Kg` : "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--color-bg)] p-3 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-secondary)]">Volume</p>
                <p className="text-sm font-bold text-[var(--color-navy-900)] mt-0.5 tabular-nums">
                  {pesanan.volume ? `${pesanan.volume} m³` : "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--color-bg)] p-3 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-secondary)]">Jumlah Koli</p>
                <p className="text-sm font-bold text-[var(--color-navy-900)] mt-0.5 tabular-nums">
                  {pesanan.jumlah_koli ? `${pesanan.jumlah_koli} Koli` : "-"}
                </p>
              </div>
            </div>

            {pesanan.catatan_muatan && (
              <div className="rounded-2xl bg-[var(--color-surface-tint)] p-3.5 border border-[var(--color-border)]">
                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Catatan Muatan & Rute
                </p>
                <p className="text-sm text-[var(--color-navy-900)] mt-0.5 whitespace-pre-line leading-relaxed">
                  {pesanan.catatan_muatan}
                </p>
              </div>
            )}
          </div>

          {/* Transportasi & Moda Info */}
          {moda === "udara" ? (
            /* Card Transportasi Udara */
            <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 shadow-sm border border-[#E9D5FF] bg-[#FAF5FF]/50 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E9D5FF] pb-3">
                <Plane className="h-5 w-5 text-[#7E22CE]" />
                <h2 className="text-base font-bold text-[var(--color-navy-900)]">
                  Transportasi Udara (Air Freight Express)
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-3 border border-[#E9D5FF]">
                  <p className="text-xs text-[var(--color-text-secondary)]">Bandara Origin</p>
                  <p className="text-sm font-bold text-[var(--color-navy-900)] mt-0.5 truncate">
                    {pesanan.alamat_asal || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-3 border border-[#E9D5FF]">
                  <p className="text-xs text-[var(--color-text-secondary)]">Bandara Destination</p>
                  <p className="text-sm font-bold text-[var(--color-navy-900)] mt-0.5 truncate">
                    {pesanan.alamat_tujuan || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-3 border border-[#E9D5FF]">
                  <p className="text-xs text-[var(--color-text-secondary)]">No. SMU / Air Waybill</p>
                  <p className="text-sm font-bold text-[#7E22CE] mt-0.5">
                    {pesanan.plat_nomor || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-3 border border-[#E9D5FF]">
                  <p className="text-xs text-[var(--color-text-secondary)]">Estimasi Keberangkatan</p>
                  <p className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                    {pesanan.estimasi_berangkat || "-"}
                  </p>
                </div>
              </div>
            </div>
          ) : moda === "laut" ? (
            /* Card Transportasi Laut */
            <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 shadow-sm border border-[#BAE6FD] bg-[#F0F9FF]/40 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#BAE6FD] pb-3">
                <Ship className="h-5 w-5 text-[#0369A1]" />
                <h2 className="text-base font-bold text-[var(--color-navy-900)]">
                  Transportasi Laut (Sea Freight Antarpulau)
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-3 border border-[#BAE6FD]">
                  <p className="text-xs text-[var(--color-text-secondary)]">Rute Muat (POL)</p>
                  <p className="text-sm font-bold text-[var(--color-navy-900)] mt-0.5 truncate">
                    {pesanan.alamat_asal || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-3 border border-[#BAE6FD]">
                  <p className="text-xs text-[var(--color-text-secondary)]">Rute Bongkar (POD)</p>
                  <p className="text-sm font-bold text-[var(--color-navy-900)] mt-0.5 truncate">
                    {pesanan.alamat_tujuan || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-3 border border-[#BAE6FD]">
                  <p className="text-xs text-[var(--color-text-secondary)]">No. Kontainer / Plat</p>
                  <p className="text-sm font-bold text-[var(--color-primary)] mt-0.5">
                    {pesanan.plat_nomor || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-3 border border-[#BAE6FD]">
                  <p className="text-xs text-[var(--color-text-secondary)]">Estimasi Keberangkatan</p>
                  <p className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                    {pesanan.estimasi_berangkat || "-"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Card Transportasi Darat */
            <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 shadow-sm border border-[var(--color-border)] space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
                <Truck className="h-5 w-5 text-[var(--color-navy-700)]" />
                <h2 className="text-base font-bold text-[var(--color-navy-900)]">
                  Transportasi & Armada Truk Darat
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Jenis Armada</p>
                  <p className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                    {pesanan.jenis_armada
                      ? jenisArmadaLabels[pesanan.jenis_armada as JenisArmada] || pesanan.jenis_armada
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Plat Nomor Kendaraan</p>
                  <p className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                    {pesanan.plat_nomor || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Vendor Trucking</p>
                  <p className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                    {pesanan.vendor_trucking?.nama || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Supir / Driver</p>
                  <p className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                    {pesanan.supir?.nama || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ISI TAB 2: DOKUMEN ── */}
      {activeTab === "dokumen" && (
        <DocumentList
          pesananId={pesanan.id}
          nomorPesanan={pesanan.nomor_pesanan}
          namaCustomer={pesanan.nama_customer}
          currentPlatNomor={pesanan.plat_nomor}
          currentSupirNama={pesanan.supir?.nama}
          customerPhone={pesanan.kontak_customer?.nomor_telepon}
          alamatAsal={pesanan.alamat_asal}
          alamatTujuan={pesanan.alamat_tujuan}
          status={pesanan.status}
          existingDokumen={dokumen}
        />
      )}

      {/* ── ISI TAB 3: KEUANGAN ── */}
      {activeTab === "keuangan" && (
        <FinanceTab
          pesananId={pesanan.id}
          nomorPesanan={pesanan.nomor_pesanan}
          namaCustomer={pesanan.nama_customer}
          tarifCustomer={pesanan.tarif_customer || 0}
          biayaVendor={pesanan.biaya_vendor || 0}
          biayaLainnya={pesanan.biaya_lainnya || 0}
          statusPembayaran={pesanan.status_pembayaran}
        />
      )}

      {/* ── ISI TAB 4: KONTAK KONTEKSTUAL ── */}
      {activeTab === "kontak" && (
        <ContextualContactList
          pesananId={pesanan.id}
          nomorPesanan={pesanan.nomor_pesanan}
          namaCustomer={pesanan.nama_customer}
          currentStatus={pesanan.status}
          alamatAsal={pesanan.alamat_asal}
          alamatTujuan={pesanan.alamat_tujuan}
          kontakCustomer={pesanan.kontak_customer}
          vendorTrucking={pesanan.vendor_trucking}
          supir={pesanan.supir}
          allAvailableContacts={allContacts}
        />
      )}

      {/* ── Dynamic Action Button Sticky ── */}
      <DynamicActionButton
        pesananId={pesanan.id}
        currentStatus={pesanan.status}
        moda={moda}
        jenisPengiriman={jenisPengiriman}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* ── Modal Bagikan Live Tracking ── */}
      <ShareTrackingModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        pesanan={pesanan}
      />
    </div>
  );
}
