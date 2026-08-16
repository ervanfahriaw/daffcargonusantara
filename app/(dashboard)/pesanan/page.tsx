import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ShipmentList } from "@/components/shipment/ShipmentList";
import { type ShipmentItem } from "@/components/shipment/ShipmentCard";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Daftar Pesanan — DCN OpsHub",
  description: "Kelola dan lacak seluruh pesanan pengiriman PT Daff Cargo Nusantara",
};

export default async function DaftarPesananPage() {
  let shipments: ShipmentItem[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pesanan")
      .select(`
        id,
        nomor_pesanan,
        nama_customer,
        alamat_asal,
        alamat_tujuan,
        status,
        status_pembayaran,
        jenis_armada,
        jenis_barang,
        berat,
        jumlah_koli,
        tarif_customer,
        estimasi_berangkat,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pesanan:", error);
    } else if (data) {
      shipments = data as ShipmentItem[];
    }
  } catch (err) {
    console.error("Gagal connect Supabase pesanan:", err);
  }

  return (
    <>
      <Header title="Pesanan" />

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
        {/* Header Title & Quick Action */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">
              Daftar Pesanan
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-0.5">
              Semua status pengiriman yang tercatat
            </p>
          </div>
          <Link
            href="/pesanan/baru"
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all touch-target"
          >
            <Plus className="h-4 w-4" />
            <span>Pesanan Baru</span>
          </Link>
        </div>

        {/* List Pesanan dengan Filter & Search */}
        <ShipmentList initialItems={shipments} />
      </div>
    </>
  );
}
