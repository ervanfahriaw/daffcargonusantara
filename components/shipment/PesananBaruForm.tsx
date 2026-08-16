"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  MapPin,
  Package,
  Truck,
  DollarSign,
  Info,
  Calendar,
  AlertCircle,
  TrendingUp,
  Ship,
  Anchor,
  Navigation,
  Plane,
  PlaneTakeoff,
  ShieldCheck,
} from "lucide-react";
import { createPesananAction } from "@/lib/actions/pesanan";
import {
  jenisArmadaLabels,
  tipeLayananLautLabels,
  tipeLayananUdaraLabels,
  pelabuhanUtamaIndonesia,
  bandaraUtamaIndonesia,
  jenisPengirimanLabels,
  type JenisArmada,
  type TipeLayananLaut,
  type TipeLayananUdara,
  type ModaPengiriman,
  type JenisPengiriman,
  type PesananInput,
} from "@/lib/validations/pesanan";

interface ContactOption {
  id: string;
  nama: string;
  kategori: string;
  nomor_telepon: string;
  perusahaan?: string | null;
}

interface PesananBaruFormProps {
  initialContacts?: ContactOption[];
}

export function PesananBaruForm({ initialContacts = [] }: PesananBaruFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // ── 1. Moda Pengiriman & Lingkup Layanan (D2D, D2P, P2D, P2P) ──
  const [modaPengiriman, setModaPengiriman] = useState<ModaPengiriman>("darat");
  const [jenisPengiriman, setJenisPengiriman] = useState<JenisPengiriman>("d2d");

  // ── 2. Data Customer & Rute ──
  const [namaCustomer, setNamaCustomer] = useState("");
  const [kontakCustomerId, setKontakCustomerId] = useState("");
  const [nomorTeleponCustomer, setNomorTeleponCustomer] = useState("");
  const [alamatAsal, setAlamatAsal] = useState("");
  const [alamatTujuan, setAlamatTujuan] = useState("");

  // ── 3. Data Muatan ──
  const [jenisBarang, setJenisBarang] = useState("");
  const [berat, setBerat] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [jumlahKoli, setJumlahKoli] = useState<string>("");
  const [catatanMuatan, setCatatanMuatan] = useState("");

  // ── 4. Spesifik Darat ──
  const [jenisArmada, setJenisArmada] = useState<JenisArmada | "">("cdd");
  const [vendorTruckingId, setVendorTruckingId] = useState("");
  const [supirId, setSupirId] = useState("");
  const [platNomor, setPlatNomor] = useState("");

  // ── 5. Spesifik Laut (Antarpulau) ──
  const [tipeLayananLaut, setTipeLayananLaut] = useState<TipeLayananLaut | "">("fcl_20ft");
  const [pelabuhanAsal, setPelabuhanAsal] = useState("Pelabuhan Tanjung Priok (Jakarta)");
  const [pelabuhanTujuan, setPelabuhanTujuan] = useState("Pelabuhan Soekarno-Hatta (Makassar)");
  const [namaKapal, setNamaKapal] = useState("");
  const [nomorKontainer, setNomorKontainer] = useState("");
  const [nomorSeal, setNomorSeal] = useState("");
  const [pelayaranId, setPelayaranId] = useState("");

  // ── 6. Spesifik Udara (Air Freight) ──
  const [tipeLayananUdara, setTipeLayananUdara] = useState<TipeLayananUdara | "">("general_cargo");
  const [bandaraAsal, setBandaraAsal] = useState("Bandara Soekarno-Hatta (CGK - Jakarta)");
  const [bandaraTujuan, setBandaraTujuan] = useState("Bandara Sultan Hasanuddin (UPG - Makassar)");
  const [namaMaskapai, setNamaMaskapai] = useState("");
  const [nomorPenerbangan, setNomorPenerbangan] = useState("");
  const [nomorAwb, setNomorAwb] = useState("");
  const [maskapaiId, setMaskapaiId] = useState("");

  // ── 7. Jadwal & Estimasi ──
  const [estimasiBerangkat, setEstimasiBerangkat] = useState("");
  const [estimasiTiba, setEstimasiTiba] = useState("");

  // ── 8. Keuangan ──
  const [tarifCustomer, setTarifCustomer] = useState<string>("");
  const [biayaVendor, setBiayaVendor] = useState<string>("");
  const [biayaLainnya, setBiayaLainnya] = useState<string>("");

  // Filter contacts by role
  const customerContacts = initialContacts.filter((c) => c.kategori === "customer");
  const vendorContacts = initialContacts.filter((c) => c.kategori === "vendor_trucking");
  const supirContacts = initialContacts.filter((c) => c.kategori === "supir");
  const pelayaranContacts = initialContacts.filter((c) => c.kategori === "pelayaran" || c.kategori === "vendor_trucking");
  const maskapaiContacts = initialContacts.filter((c) => c.kategori === "maskapai" || c.kategori === "vendor_trucking");

  // Format currency helper
  function formatRupiah(val: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  }

  // Margin calculation
  const tarifNum = Number(tarifCustomer) || 0;
  const vendorNum = Number(biayaVendor) || 0;
  const lainnyaNum = Number(biayaLainnya) || 0;
  const estimasiMargin = tarifNum - vendorNum - lainnyaNum;
  const marginPercentage = tarifNum > 0 ? (estimasiMargin / tarifNum) * 100 : 0;

  // Handle auto-fill when selecting existing customer
  function handleSelectCustomer(contactId: string) {
    setKontakCustomerId(contactId);
    if (!contactId) return;
    const found = customerContacts.find((c) => c.id === contactId);
    if (found) {
      setNamaCustomer(found.nama);
      setNomorTeleponCustomer(found.nomor_telepon || "");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const payload: PesananInput = {
      moda_pengiriman: modaPengiriman,
      jenis_pengiriman: jenisPengiriman,
      nama_customer: namaCustomer,
      kontak_customer_id: kontakCustomerId || undefined,
      nomor_telepon_customer: nomorTeleponCustomer || undefined,
      alamat_asal: alamatAsal,
      alamat_tujuan: alamatTujuan,
      jenis_barang: jenisBarang || undefined,
      berat: berat ? Number(berat) : undefined,
      volume: volume ? Number(volume) : undefined,
      jumlah_koli: jumlahKoli ? Number(jumlahKoli) : undefined,
      catatan_muatan: catatanMuatan || undefined,

      // Darat
      jenis_armada: modaPengiriman === "darat" ? (jenisArmada || undefined) : undefined,
      vendor_trucking_id: vendorTruckingId || undefined,
      supir_id: supirId || undefined,
      plat_nomor: platNomor || undefined,

      // Laut
      tipe_layanan_laut: modaPengiriman === "laut" ? (tipeLayananLaut || undefined) : undefined,
      pelabuhan_asal: modaPengiriman === "laut" ? (pelabuhanAsal || undefined) : undefined,
      pelabuhan_tujuan: modaPengiriman === "laut" ? (pelabuhanTujuan || undefined) : undefined,
      nama_kapal: modaPengiriman === "laut" ? (namaKapal || undefined) : undefined,
      nomor_kontainer: modaPengiriman === "laut" ? (nomorKontainer || undefined) : undefined,
      nomor_seal: modaPengiriman === "laut" ? (nomorSeal || undefined) : undefined,
      pelayaran_id: pelayaranId || undefined,

      // Udara
      tipe_layanan_udara: modaPengiriman === "udara" ? (tipeLayananUdara || undefined) : undefined,
      bandara_asal: modaPengiriman === "udara" ? (bandaraAsal || undefined) : undefined,
      bandara_tujuan: modaPengiriman === "udara" ? (bandaraTujuan || undefined) : undefined,
      nama_maskapai: modaPengiriman === "udara" ? (namaMaskapai || undefined) : undefined,
      nomor_penerbangan: modaPengiriman === "udara" ? (nomorPenerbangan || undefined) : undefined,
      nomor_awb: modaPengiriman === "udara" ? (nomorAwb || undefined) : undefined,
      maskapai_id: maskapaiId || undefined,

      // Jadwal
      estimasi_berangkat: estimasiBerangkat || undefined,
      estimasi_tiba: estimasiTiba || undefined,

      // Keuangan
      tarif_customer: tarifNum,
      biaya_vendor: vendorNum,
      biaya_lainnya: lainnyaNum,
    };

    const result = await createPesananAction(payload);
    setLoading(false);

    if (result.success) {
      toast.success(`Pesanan ${result.data.nomor_pesanan} berhasil dibuat!`);
      router.push(`/pesanan/${result.data.id}`);
    } else {
      toast.error(result.error);
      if (result.errors) {
        setFieldErrors(result.errors);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-48">
      {/* ── PILIHAN MODA PENGIRIMAN (3 MODA) ── */}
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 border border-[var(--color-border)] shadow-xs space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-navy-900)]">
          Pilih Moda Pengiriman Domestik
        </label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Darat */}
          <button
            type="button"
            onClick={() => setModaPengiriman("darat")}
            className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border-2 transition-all text-center sm:text-left touch-target ${
              modaPengiriman === "darat"
                ? "border-[var(--color-primary)] bg-[var(--color-surface-tint)] text-[var(--color-primary)] shadow-xs ring-2 ring-[var(--color-primary)]/20"
                : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-neutral-300)]"
            }`}
          >
            <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0 ${
              modaPengiriman === "darat" ? "bg-[var(--color-primary)] text-white" : "bg-neutral-100 text-neutral-600"
            }`}>
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[var(--color-navy-900)]">🚚 Darat</p>
              <p className="text-[10px] text-[var(--color-text-secondary)] hidden sm:block">Trucking</p>
            </div>
          </button>

          {/* Laut */}
          <button
            type="button"
            onClick={() => setModaPengiriman("laut")}
            className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border-2 transition-all text-center sm:text-left touch-target ${
              modaPengiriman === "laut"
                ? "border-[#0284C7] bg-[#E0F2FE] text-[#0369A1] shadow-xs ring-2 ring-[#0284C7]/20"
                : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-neutral-300)]"
            }`}
          >
            <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0 ${
              modaPengiriman === "laut" ? "bg-[#0284C7] text-white" : "bg-neutral-100 text-neutral-600"
            }`}>
              <Ship className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[var(--color-navy-900)]">🚢 Laut</p>
              <p className="text-[10px] text-[var(--color-text-secondary)] hidden sm:block">Antarpulau</p>
            </div>
          </button>

          {/* Udara */}
          <button
            type="button"
            onClick={() => setModaPengiriman("udara")}
            className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border-2 transition-all text-center sm:text-left touch-target ${
              modaPengiriman === "udara"
                ? "border-[#9333EA] bg-[#F3E8FF] text-[#7E22CE] shadow-xs ring-2 ring-[#9333EA]/20"
                : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-neutral-300)]"
            }`}
          >
            <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0 ${
              modaPengiriman === "udara" ? "bg-[#9333EA] text-white" : "bg-neutral-100 text-neutral-600"
            }`}>
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[var(--color-navy-900)]">✈️ Udara</p>
              <p className="text-[10px] text-[var(--color-text-secondary)] hidden sm:block">Air Freight</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── PILIHAN LINGKUP LAYANAN (D2D / D2P / P2D / P2P) ── */}
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 border border-[var(--color-border)] shadow-xs space-y-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-navy-900)]">
            Lingkup Layanan (Service Scope)
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Pilih titik awal serah terima muatan dan titik tujuan akhir pengiriman
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(["d2d", "d2p", "p2d", "p2p"] as const).map((scopeKey) => {
            const scope = jenisPengirimanLabels[scopeKey];
            const isSelected = jenisPengiriman === scopeKey;
            return (
              <button
                key={scopeKey}
                type="button"
                onClick={() => setJenisPengiriman(scopeKey)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all text-left touch-target ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-surface-tint)] shadow-xs ring-2 ring-[var(--color-primary)]/20"
                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-neutral-300)]"
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{scope.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs sm:text-sm font-bold ${
                    isSelected ? "text-[var(--color-primary)]" : "text-[var(--color-navy-900)]"
                  }`}>
                    {scope.title}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">
                    {scope.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── BAGIAN 1: DATA CUSTOMER & RUTE ── */}
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-surface-tint)] text-[var(--color-primary)]">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--color-navy-900)]">
              1. Data Customer & Rute
            </h2>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Pengirim, penerima, dan alamat lokasi
            </p>
          </div>
        </div>

        {/* Pilih dari Buku Kontak */}
        {customerContacts.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
              Pilih dari Buku Kontak (Opsional)
            </label>
            <select
              value={kontakCustomerId}
              onChange={(e) => handleSelectCustomer(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
            >
              <option value="">-- Ketik Nama Baru / Pilih Kontak --</option>
              {customerContacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama} {c.perusahaan ? `(${c.perusahaan})` : ""} - {c.nomor_telepon}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Nama Customer */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
            Nama Customer / Perusahaan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: PT Surya Kencana / Bpk. Hendra"
            value={namaCustomer}
            onChange={(e) => setNamaCustomer(e.target.value)}
            className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:outline-none touch-target ${
              fieldErrors.nama_customer
                ? "border-red-500 focus:border-red-500"
                : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
            }`}
          />
          {fieldErrors.nama_customer && (
            <p className="text-xs text-red-500 font-medium">
              {fieldErrors.nama_customer[0]}
            </p>
          )}
        </div>

        {/* Nomor Telepon / WhatsApp */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
            Nomor Telepon / WhatsApp Customer
          </label>
          <input
            type="tel"
            placeholder="Contoh: 081234567890"
            value={nomorTeleponCustomer}
            onChange={(e) => setNomorTeleponCustomer(e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
          />
        </div>

        {/* Alamat Asal & Tujuan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
              Alamat Asal (Titik Muat) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Contoh: Gudang DCN Cakung, Jakarta Timur"
              value={alamatAsal}
              onChange={(e) => setAlamatAsal(e.target.value)}
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:outline-none ${
                fieldErrors.alamat_asal
                  ? "border-red-500 focus:border-red-500"
                  : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
              Alamat Tujuan (Titik Bongkar) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Contoh: Kawasan Industri KIMA, Makassar"
              value={alamatTujuan}
              onChange={(e) => setAlamatTujuan(e.target.value)}
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:outline-none ${
                fieldErrors.alamat_tujuan
                  ? "border-red-500 focus:border-red-500"
                  : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
              }`}
            />
          </div>
        </div>
      </div>

      {/* ── BAGIAN 2: DATA MUATAN BARANG ── */}
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-teal-100)] text-[var(--color-teal-500)]">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--color-navy-900)]">
              2. Data Muatan Barang
            </h2>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Jenis kargo, tonase, volume, dan jumlah koli
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
            Jenis Barang / Deskripsi Kargo
          </label>
          <input
            type="text"
            placeholder="Contoh: Mesin Pabrik, Sparepart, Vaksin Medis, Pipa Baja"
            value={jenisBarang}
            onChange={(e) => setJenisBarang(e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
              Berat (Kg)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={berat}
              onChange={(e) => setBerat(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-3 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
              Volume (m³)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-3 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
              Jumlah Koli
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={jumlahKoli}
              onChange={(e) => setJumlahKoli(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-3 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
            Catatan Khusus Muatan
          </label>
          <input
            type="text"
            placeholder="Contoh: Fragile / Urgent Same Day / Butuh tali pengikat"
            value={catatanMuatan}
            onChange={(e) => setCatatanMuatan(e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
          />
        </div>
      </div>

      {/* ── BAGIAN 3: SPESIFIKASI ARMADA & MODA TRANSPORTASI ── */}
      {modaPengiriman === "darat" ? (
        /* ── SUB-BAGIAN: TRUCKING DARAT ── */
        <div className="rounded-3xl bg-[var(--color-surface)] p-5 border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-surface-tint)] text-[var(--color-primary)]">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-navy-900)]">
                3. Spesifikasi Armada Truk Darat
              </h2>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Tipe armada, supir, plat nomor, dan jadwal berangkat
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
              Jenis Armada Truk
            </label>
            <select
              value={jenisArmada}
              onChange={(e) => setJenisArmada(e.target.value as JenisArmada)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
            >
              {Object.entries(jenisArmadaLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Pilih Supir / Driver
              </label>
              <select
                value={supirId}
                onChange={(e) => setSupirId(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              >
                <option value="">-- Belum Ditentukan / Pilih Supir --</option>
                {supirContacts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.nomor_telepon})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Plat Nomor Kendaraan
              </label>
              <input
                type="text"
                placeholder="Contoh: B 9123 DCN"
                value={platNomor}
                onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Vendor Trucking (Opsional)
              </label>
              <select
                value={vendorTruckingId}
                onChange={(e) => setVendorTruckingId(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              >
                <option value="">-- DCN Internal / Armada Sendiri --</option>
                {vendorContacts.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nama} {v.perusahaan ? `(${v.perusahaan})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Estimasi Tanggal Berangkat
              </label>
              <input
                type="date"
                value={estimasiBerangkat}
                onChange={(e) => setEstimasiBerangkat(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>
          </div>
        </div>
      ) : modaPengiriman === "laut" ? (
        /* ── SUB-BAGIAN: SEA FREIGHT LAUT ANTARPULAU ── */
        <div className="rounded-3xl bg-[var(--color-surface)] p-5 border border-[#BAE6FD] bg-[#F0F9FF]/40 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#BAE6FD] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#0369A1]">
              <Ship className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-navy-900)]">
                3. Spesifikasi Sea Freight (Laut Antarpulau)
              </h2>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Pelabuhan muat/bongkar, nama kapal, nomor kontainer & seal
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
              Tipe Layanan Laut
            </label>
            <select
              value={tipeLayananLaut}
              onChange={(e) => setTipeLayananLaut(e.target.value as TipeLayananLaut)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
            >
              {Object.entries(tipeLayananLautLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
                Pelabuhan Asal / Muat (POL)
              </label>
              <input
                type="text"
                list="pelabuhan-list"
                placeholder="Pilih atau ketik pelabuhan muat..."
                value={pelabuhanAsal}
                onChange={(e) => setPelabuhanAsal(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
                Pelabuhan Tujuan / Bongkar (POD)
              </label>
              <input
                type="text"
                list="pelabuhan-list"
                placeholder="Pilih atau ketik pelabuhan bongkar..."
                value={pelabuhanTujuan}
                onChange={(e) => setPelabuhanTujuan(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>

            <datalist id="pelabuhan-list">
              {pelabuhanUtamaIndonesia.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Nama Kapal / Pelayaran (Carrier)
              </label>
              <input
                type="text"
                placeholder="Contoh: KM Meratus Makassar / SPIL / Tanto"
                value={namaKapal}
                onChange={(e) => setNamaKapal(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Vendor Pelayaran / EMKL
              </label>
              <select
                value={pelayaranId}
                onChange={(e) => setPelayaranId(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              >
                <option value="">-- Pilih Pelayaran Terdaftar (Opsional) --</option>
                {pelayaranContacts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} {p.perusahaan ? `(${p.perusahaan})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Nomor Kontainer (Container No.)
              </label>
              <input
                type="text"
                placeholder="Contoh: MRTU-123456-7"
                value={nomorKontainer}
                onChange={(e) => setNomorKontainer(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Nomor Segel (Seal No.)
              </label>
              <input
                type="text"
                placeholder="Contoh: SEAL-987654"
                value={nomorSeal}
                onChange={(e) => setNomorSeal(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Estimasi Kapal Berangkat (ETD)
              </label>
              <input
                type="date"
                value={estimasiBerangkat}
                onChange={(e) => setEstimasiBerangkat(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Estimasi Kapal Sandar / Tiba (ETA)
              </label>
              <input
                type="date"
                value={estimasiTiba}
                onChange={(e) => setEstimasiTiba(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ── SUB-BAGIAN: AIR FREIGHT UDARA EXPRESS ── */
        <div className="rounded-3xl bg-[var(--color-surface)] p-5 border border-[#E9D5FF] bg-[#FAF5FF]/50 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E9D5FF] pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#7E22CE]">
              <Plane className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-navy-900)]">
                3. Spesifikasi Air Freight (Udara Express)
              </h2>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Bandara origin/destination, maskapai, nomor penerbangan & SMU/AWB
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
              Tipe Layanan Udara
            </label>
            <select
              value={tipeLayananUdara}
              onChange={(e) => setTipeLayananUdara(e.target.value as TipeLayananUdara)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
            >
              {Object.entries(tipeLayananUdaraLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
                Bandara Asal / Origin (Airport)
              </label>
              <input
                type="text"
                list="bandara-list"
                placeholder="Pilih atau ketik bandara asal..."
                value={bandaraAsal}
                onChange={(e) => setBandaraAsal(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
                Bandara Tujuan / Destination (Airport)
              </label>
              <input
                type="text"
                list="bandara-list"
                placeholder="Pilih atau ketik bandara tujuan..."
                value={bandaraTujuan}
                onChange={(e) => setBandaraTujuan(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>

            <datalist id="bandara-list">
              {bandaraUtamaIndonesia.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Nama Maskapai / Airlines
              </label>
              <input
                type="text"
                placeholder="Contoh: Garuda Indonesia Cargo / Lion Cargo / Citilink"
                value={namaMaskapai}
                onChange={(e) => setNamaMaskapai(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Nomor Penerbangan (Flight No.)
              </label>
              <input
                type="text"
                placeholder="Contoh: GA-608 / JT-780 / QG-420"
                value={nomorPenerbangan}
                onChange={(e) => setNomorPenerbangan(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
                Nomor SMU / Air Waybill (AWB No.)
              </label>
              <input
                type="text"
                placeholder="Contoh: 126-98765432 / 990-12345678"
                value={nomorAwb}
                onChange={(e) => setNomorAwb(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] font-semibold focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Mitra Maskapai / Regulated Agent (RA)
              </label>
              <select
                value={maskapaiId}
                onChange={(e) => setMaskapaiId(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              >
                <option value="">-- Pilih Maskapai / RA Terdaftar (Opsional) --</option>
                {maskapaiContacts.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} {m.perusahaan ? `(${m.perusahaan})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Estimasi Pesawat Berangkat (ETD)
              </label>
              <input
                type="date"
                value={estimasiBerangkat}
                onChange={(e) => setEstimasiBerangkat(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Estimasi Pesawat Mendarat (ETA)
              </label>
              <input
                type="date"
                value={estimasiTiba}
                onChange={(e) => setEstimasiTiba(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── BAGIAN 4: KEUANGAN & LIVE KALKULASI MARGIN ── */}
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-warning-100)] text-[var(--color-warning-600)]">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--color-navy-900)]">
              4. Biaya & Estimasi Margin Keuntungan
            </h2>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Tarif customer, biaya vendor/pelayaran/maskapai, dan laba bersih
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--color-navy-900)]">
            Tarif ke Customer (Rp)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={tarifCustomer}
            onChange={(e) => setTarifCustomer(e.target.value)}
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] font-bold focus:border-[var(--color-primary)] focus:outline-none touch-target"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
              Biaya Vendor / Carrier (Pelayaran/Maskapai/Truk)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={biayaVendor}
              onChange={(e) => setBiayaVendor(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
              Biaya Lainnya (RA/X-Ray/Handling/Tol/Buruh)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={biayaLainnya}
              onChange={(e) => setBiayaLainnya(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] focus:border-[var(--color-primary)] focus:outline-none touch-target"
            />
          </div>
        </div>

        {/* Live Margin Calculation Card */}
        <div
          className={`rounded-2xl p-4 border transition-colors ${
            estimasiMargin < 0
              ? "bg-red-50 border-red-200"
              : estimasiMargin === 0
              ? "bg-[var(--color-surface-tint)] border-[var(--color-border)]"
              : "bg-[var(--color-teal-100)]/60 border-[var(--color-teal-500)]/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp
                className={`h-4 w-4 ${
                  estimasiMargin < 0
                    ? "text-red-500"
                    : "text-[var(--color-teal-500)]"
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy-900)]">
                Proyeksi Margin Bersih
              </span>
            </div>
            {tarifNum > 0 && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  marginPercentage >= 20
                    ? "bg-[var(--color-success-100)] text-[var(--color-success-600)]"
                    : marginPercentage > 0
                    ? "bg-[var(--color-warning-100)] text-[var(--color-warning-600)]"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {marginPercentage.toFixed(1)}% Laba
              </span>
            )}
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-xs text-[var(--color-text-secondary)]">
              Estimasi Keuntungan:
            </p>
            <p
              className={`text-xl font-bold tabular-nums ${
                estimasiMargin < 0
                  ? "text-red-600"
                  : "text-[var(--color-teal-500)]"
              }`}
            >
              {formatRupiah(estimasiMargin)}
            </p>
          </div>
        </div>
      </div>

      {/* ── STICKY SUBMIT BUTTON BAR ── */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-30 p-4 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] shadow-lg max-w-2xl mx-auto">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[var(--color-primary)] py-4 text-center text-base font-bold text-white shadow-md hover:bg-[var(--color-primary-dark)] active:scale-[0.99] transition-all disabled:opacity-60 touch-target"
        >
          {loading ? "Menyimpan Pesanan..." : "💾 Simpan Pesanan Kargo"}
        </button>
      </div>
    </form>
  );
}
