import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import {
  DokumenGeneratorForm,
  type PesananOption,
} from "@/components/document/DokumenGeneratorForm";
import { createClient } from "@/lib/supabase/server";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Buat Dokumen — DCN OpsHub",
  description:
    "Generator dokumen resmi PT Daff Cargo Nusantara: Surat Jalan, Invoice, Cost Sheet, dan Bukti Serah Terima (POD).",
};

export default async function DokumenPage() {
  let shipments: PesananOption[] = [];
  let companyProfile: any = null;

  try {
    const supabase = await createClient();

    // 1. Ambil semua pesanan aktif/tercatat
    const { data: pesananData } = await supabase
      .from("pesanan")
      .select(`
        id,
        nomor_pesanan,
        nama_customer,
        alamat_asal,
        alamat_tujuan,
        jenis_barang,
        berat,
        volume,
        jumlah_koli,
        catatan_muatan,
        jenis_armada,
        plat_nomor,
        tarif_customer,
        biaya_vendor,
        biaya_lainnya,
        status,
        supir:supir_id(nama),
        vendor_trucking:vendor_trucking_id(nama),
        kontak_customer:kontak_customer_id(nomor_telepon)
      `)
      .order("created_at", { ascending: false });

    if (pesananData) {
      shipments = pesananData as unknown as PesananOption[];
    }

    // 2. Ambil profil perusahaan
    const { data: pengaturanData } = await supabase
      .from("pengaturan")
      .select("nama_perusahaan, alamat, npwp, nama_owner")
      .limit(1)
      .single();

    if (pengaturanData) {
      companyProfile = pengaturanData;
    }
  } catch (err) {
    console.error("Gagal memuat data generator dokumen:", err);
  }

  return (
    <>
      <Header title="Buat Dokumen" showBack />

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Title Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">
              Buat Dokumen
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-0.5">
              Terbitkan Surat Jalan, Invoice, Cost Sheet, atau POD resmi
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-surface-tint)] text-[var(--color-primary)] shrink-0">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Form Generator wrapped in Suspense for useSearchParams */}
        <Suspense
          fallback={
            <div className="rounded-3xl bg-[var(--color-surface)] p-8 text-center border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Memuat generator dokumen...
              </p>
            </div>
          }
        >
          <DokumenGeneratorForm
            initialPesananList={shipments}
            companyProfile={companyProfile}
          />
        </Suspense>
      </div>
    </>
  );
}
