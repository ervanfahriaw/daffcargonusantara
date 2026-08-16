import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { StatusBadge, type StatusPesanan, getEffectiveStatus } from "@/components/shipment/StatusBadge";
import { DetailPesananTabs } from "@/components/shipment/DetailPesananTabs";
import { type RiwayatStatusItem } from "@/components/shipment/StatusStepper";
import { type DokumenRecord } from "@/components/document/DocumentList";
import { type ContactInfo } from "@/components/contact/ContextualContactList";
import { createClient } from "@/lib/supabase/server";
import { MapPin } from "lucide-react";

interface DetailPesananPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DetailPesananPageProps) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("pesanan")
      .select("nomor_pesanan, nama_customer")
      .eq("id", id)
      .single();

    if (data) {
      return {
        title: `${data.nomor_pesanan} — ${data.nama_customer} | DCN OpsHub`,
      };
    }
  } catch {}

  return {
    title: "Detail Pesanan — DCN OpsHub",
  };
}

export default async function DetailPesananPage({ params }: DetailPesananPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch pesanan details + kontak info
  const { data: pesanan, error: pesananError } = await supabase
    .from("pesanan")
    .select(`
      *,
      kontak_customer:kontak_customer_id(id, nama, nomor_telepon, perusahaan),
      vendor_trucking:vendor_trucking_id(id, nama, nomor_telepon, perusahaan),
      supir:supir_id(id, nama, nomor_telepon)
    `)
    .eq("id", id)
    .single();

  if (pesananError || !pesanan) {
    return (
      <>
        <Header title="Pesanan Tidak Ditemukan" showBack />
        <div className="px-4 py-16 text-center space-y-4 max-w-md mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-neutral-100)] mx-auto">
            <MapPin className="h-8 w-8 text-[var(--color-neutral-600)]" />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-navy-900)]">
            Pesanan tidak ditemukan
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Pesanan dengan ID ini tidak tersedia atau telah dihapus.
          </p>
          <Link
            href="/pesanan"
            className="inline-flex rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white touch-target shadow-sm"
          >
            Kembali ke Daftar Pesanan
          </Link>
        </div>
      </>
    );
  }

  // 2. Fetch riwayat status untuk stepper
  const { data: riwayatData } = await supabase
    .from("riwayat_status")
    .select("*")
    .eq("pesanan_id", id)
    .order("created_at", { ascending: true });

  const riwayat: RiwayatStatusItem[] = (riwayatData || []) as RiwayatStatusItem[];

  // 3. Fetch data dokumen yang sudah pernah dibuat
  const { data: dokumenData } = await supabase
    .from("dokumen")
    .select("*")
    .eq("pesanan_id", id)
    .order("created_at", { ascending: false });

  const dokumen: DokumenRecord[] = (dokumenData || []) as DokumenRecord[];

  // 4. Fetch semua kontak untuk opsi ganti/link kontak di modal
  const { data: allContactsData } = await supabase
    .from("kontak")
    .select("id, nama, kategori, nomor_telepon, perusahaan")
    .order("nama", { ascending: true });

  const allContacts: ContactInfo[] = (allContactsData || []) as ContactInfo[];

  return (
    <>
      <Header title={pesanan.nomor_pesanan} showBack />

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-5">
        {/* ── Ringkasan Header Pesanan ── */}
        <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 shadow-sm border border-[var(--color-border)] space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Nomor Pesanan
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-[var(--color-navy-900)] tracking-tight">
                {pesanan.nomor_pesanan}
              </h1>
            </div>
            <StatusBadge status={getEffectiveStatus(pesanan)} />
          </div>

          <div className="h-px bg-[var(--color-border)]" />

          {/* Customer */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Customer
            </p>
            <p className="text-base font-bold text-[var(--color-text-primary)] mt-0.5">
              {pesanan.nama_customer}
            </p>
          </div>

          {/* Rute Asal -> Tujuan */}
          <div className="rounded-2xl bg-[var(--color-bg)] p-4 border border-[var(--color-border)] space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-surface-tint)] shrink-0 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Lokasi Muat (Asal)
                </p>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {pesanan.alamat_asal}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-teal-100)] shrink-0 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-[var(--color-teal-500)]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Lokasi Bongkar (Tujuan)
                </p>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {pesanan.alamat_tujuan}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs Interaktif (Tracking, Dokumen, Keuangan, Kontak) ── */}
        <DetailPesananTabs
          pesanan={pesanan}
          riwayat={riwayat}
          dokumen={dokumen}
          allContacts={allContacts}
        />
      </div>
    </>
  );
}
