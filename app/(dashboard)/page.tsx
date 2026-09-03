import { Header } from "@/components/layout/Header";
import { StatCards } from "@/components/dashboard/StatCards";
import { QuickActionPanel } from "@/components/dashboard/QuickActionPanel";
import { WeeklyPerformanceChart } from "@/components/dashboard/WeeklyPerformanceChart";
import { InstallPromptBanner } from "@/components/pwa/InstallPromptBanner";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Beranda — DCN OpsHub",
  description: "Ringkasan operasional kargo dan pengiriman PT Daff Cargo Nusantara",
};

export default async function BerandaPage() {
  // Sapaan dinamis berdasarkan jam
  const hour = new Date().getHours();
  let greeting = "Selamat pagi";
  if (hour >= 11 && hour < 15) greeting = "Selamat siang";
  else if (hour >= 15 && hour < 18) greeting = "Selamat sore";
  else if (hour >= 18) greeting = "Selamat malam";

  let ownerName = "Pemilik DCN";
  let sedangBerjalanCount = 0;
  let perluPerhatianCount = 0;
  let selesaiCount = 0;
  let totalKontakCount = 0;
  let totalTarifCustomer = 0;
  let totalMarginEstimasi = 0;
  let rawAllPesanan: any[] = [];

  try {
    const supabase = await createClient();

    // 1. Ambil data profil owner
    const { data: profile } = await supabase
      .from("pengaturan")
      .select("nama_owner")
      .single();

    if (profile?.nama_owner) {
      ownerName = profile.nama_owner;
    }

    // 2. Ambil semua pesanan untuk hitung status agregat & antrean update harian
    const { data: allPesanan } = await supabase
      .from("pesanan")
      .select(`
        id,
        nomor_pesanan,
        nama_customer,
        alamat_asal,
        alamat_tujuan,
        status,
        moda_pengiriman,
        catatan_muatan,
        plat_nomor,
        tarif_customer,
        biaya_vendor,
        biaya_lainnya,
        kontak_customer:kontak_customer_id(nomor_telepon)
      `);

    if (allPesanan && allPesanan.length > 0) {
      rawAllPesanan = allPesanan;
      // Hitung status pengiriman
      sedangBerjalanCount = allPesanan.filter((i) => i.status !== "selesai").length;
      perluPerhatianCount = allPesanan.filter(
        (i) => i.status === "tertunda" || i.status === "booking"
      ).length;
      selesaiCount = allPesanan.filter((i) => i.status === "selesai").length;

      // Hitung agregat finansial
      totalTarifCustomer = allPesanan.reduce(
        (acc, curr) => acc + (Number(curr.tarif_customer) || 0),
        0
      );
      totalMarginEstimasi = allPesanan.reduce((acc, curr) => {
        const tarif = Number(curr.tarif_customer) || 0;
        const vendor = Number(curr.biaya_vendor) || 0;
        const lainnya = Number(curr.biaya_lainnya) || 0;
        return acc + (tarif - vendor - lainnya);
      }, 0);
    }

    // 3. Ambil jumlah kontak terdaftar
    const { count } = await supabase
      .from("kontak")
      .select("*", { count: "exact", head: true });

    if (typeof count === "number") {
      totalKontakCount = count;
    }
  } catch (err) {
    console.error("Gagal memuat data dashboard:", err);
  }

  const activeShipments = rawAllPesanan.filter(
    (i) => i.status !== "selesai"
  );

  return (
    <>
      <Header title="Beranda" />

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-28">
        {/* ── Banner Sapaan & Line-Art Visual ── */}
        <div className="relative overflow-hidden rounded-3xl bg-[var(--color-navy-900)] p-6 text-white shadow-sm">
          <div className="relative z-10 max-w-[300px]">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
              PT DAFF CARGO NUSANTARA
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {greeting}, {ownerName}
            </h1>
            <p className="text-xs md:text-sm text-white/80 mt-1.5 leading-relaxed">
              Ringkasan operasional armada dan seluruh aktivitas pengiriman kargo.
            </p>
          </div>

          {/* Line-art illustration watermark di background kanan */}
          <div className="absolute -bottom-2 -right-4 opacity-15 pointer-events-none">
            <svg
              width="140"
              height="100"
              viewBox="0 0 100 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="10" y="20" width="50" height="40" rx="4" stroke="white" strokeWidth="3" />
              <path d="M60 35 L75 35 C78 35 82 38 84 42 L88 50 L88 60 L60 60 Z" stroke="white" strokeWidth="3" />
              <circle cx="28" cy="60" r="8" stroke="white" strokeWidth="3" />
              <circle cx="75" cy="60" r="8" stroke="white" strokeWidth="3" />
            </svg>
          </div>
        </div>

        {/* ── Banner Pasang PWA ke Home Screen (Jika didukung browser) ── */}
        <InstallPromptBanner />

        {/* ── Tombol Aksi Utama & Ringkasan Nilai Operasional ── */}
        <QuickActionPanel
          totalTarif={totalTarifCustomer}
          totalMargin={totalMarginEstimasi}
          activeShipments={activeShipments}
        />

        {/* ── 4 Stat Cards Ringkasan Eksekutif ── */}
        <StatCards
          sedangBerjalan={sedangBerjalanCount}
          perluPerhatian={perluPerhatianCount}
          selesai={selesaiCount}
          totalKontak={totalKontakCount}
        />

        {/* ── Grafik Aktivitas Mingguan ── */}
        <WeeklyPerformanceChart />
      </div>
    </>
  );
}
