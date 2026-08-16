import { Header } from "@/components/layout/Header";
import { ContactListClient } from "@/components/contact/ContactListClient";
import { createClient } from "@/lib/supabase/server";
import { type ContactData } from "@/components/contact/ContactCard";

export const metadata = {
  title: "Kontak — DCN OpsHub",
  description: "Buku kontak terpadu untuk customer, vendor trucking, dan supir armada.",
};

export default async function KontakPage() {
  const supabase = await createClient();

  let contacts: ContactData[] = [];
  try {
    const { data, error } = await supabase
      .from("kontak")
      .select("id, nama, kategori, perusahaan, nomor_telepon, catatan")
      .order("nama", { ascending: true });

    if (!error && data) {
      contacts = data as ContactData[];
    }
  } catch (err) {
    console.error("Gagal mengambil data kontak:", err);
  }

  return (
    <>
      <Header title="Kontak" />
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-4">
        <ContactListClient initialContacts={contacts} />
      </div>
    </>
  );
}
