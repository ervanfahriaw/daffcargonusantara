import { Header } from "@/components/layout/Header";
import { PesananBaruForm } from "@/components/shipment/PesananBaruForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Buat Pesanan Baru — DCN OpsHub",
  description: "Form pendaftaran pengiriman baru PT Daff Cargo Nusantara",
};

export default async function BuatPesananBaruPage() {
  let contacts: Array<{
    id: string;
    nama: string;
    kategori: string;
    nomor_telepon: string;
    perusahaan?: string | null;
  }> = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("kontak")
      .select("id, nama, kategori, nomor_telepon, perusahaan")
      .order("nama", { ascending: true });

    if (data) {
      contacts = data;
    }
  } catch (err) {
    console.error("Gagal mengambil data kontak:", err);
  }

  return (
    <>
      <Header title="Pesanan Baru" showBack />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">
            Buat Pesanan Baru
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Input data pengiriman muatan dan rute perjalanan
          </p>
        </div>

        <PesananBaruForm initialContacts={contacts} />
      </div>
    </>
  );
}
