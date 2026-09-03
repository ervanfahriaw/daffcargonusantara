"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Package,
  Edit3,
  User,
  MapPin,
  Truck,
  Calendar,
  Eye,
  Download,
  Share2,
  Loader2,
  DollarSign,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import {
  type JenisDokumen,
  jenisDokumenLabels,
} from "@/lib/types/dokumen";
import { generateManualDokumenAction } from "@/lib/actions/dokumen";
import {
  generateDocumentShareMessage,
  buildWhatsAppSendUrl,
  type DocumentTypeKey,
} from "@/lib/services/waNotificationService";

export interface PesananOption {
  id: string;
  nomor_pesanan: string;
  nama_customer: string;
  alamat_asal: string;
  alamat_tujuan: string;
  jenis_barang?: string | null;
  berat?: number | null;
  volume?: number | null;
  jumlah_koli?: number | null;
  catatan_muatan?: string | null;
  jenis_armada?: string | null;
  plat_nomor?: string | null;
  tarif_customer?: number | null;
  biaya_vendor?: number | null;
  biaya_lainnya?: number | null;
  status: string;
  supir?: { nama?: string } | null;
  vendor_trucking?: { nama?: string } | null;
  kontak_customer?: { nomor_telepon?: string } | null;
}

interface DokumenGeneratorFormProps {
  initialPesananList?: PesananOption[];
  companyProfile?: {
    nama_perusahaan?: string | null;
    alamat?: string | null;
    npwp?: string | null;
    nama_owner?: string | null;
  } | null;
}

export function DokumenGeneratorForm({
  initialPesananList = [],
  companyProfile,
}: DokumenGeneratorFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryPesananId = searchParams.get("pesananId") || "";
  const queryJenis = (searchParams.get("jenis") as JenisDokumen) || "surat_jalan";

  // 1. Mode Sumber Data: "pesanan" (dari transaksi berjalan) vs "manual" (ad-hoc bebas)
  const [sourceMode, setSourceMode] = useState<"pesanan" | "manual">(
    queryPesananId ? "pesanan" : "pesanan"
  );
  const [selectedPesananId, setSelectedPesananId] = useState<string>(queryPesananId);

  // 2. Jenis Dokumen yang dipilih
  const [jenisDokumen, setJenisDokumen] = useState<JenisDokumen>(
    ["surat_jalan", "invoice", "cost_sheet", "pod"].includes(queryJenis)
      ? queryJenis
      : "surat_jalan"
  );

  // 3. Form States
  const [nomorDokumen, setNomorDokumen] = useState("");
  const [namaCustomer, setNamaCustomer] = useState("");
  const [nomorTeleponCustomer, setNomorTeleponCustomer] = useState("");
  const [alamatAsal, setAlamatAsal] = useState("");
  const [alamatTujuan, setAlamatTujuan] = useState("");
  const [tanggalDokumen, setTanggalDokumen] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Muatan & Armada
  const [jenisBarang, setJenisBarang] = useState("");
  const [berat, setBerat] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [jumlahKoli, setJumlahKoli] = useState<string>("");
  const [catatanMuatan, setCatatanMuatan] = useState("");
  const [jenisArmada, setJenisArmada] = useState("CDD");
  const [platNomor, setPlatNomor] = useState("");
  const [supirNama, setSupirNama] = useState("");
  const [vendorNama, setVendorNama] = useState("");

  // Finansial
  const [tarifCustomer, setTarifCustomer] = useState<string>("");
  const [biayaVendor, setBiayaVendor] = useState<string>("");
  const [biayaLainnya, setBiayaLainnya] = useState<string>("");

  // Loading & Hasil Generate
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    pdfBase64: string;
    fileName: string;
    pdfUrl?: string;
    pesananId?: string;
  } | null>(null);

  // Auto-fill form saat memilih pesanan dari database
  useEffect(() => {
    if (sourceMode === "pesanan" && selectedPesananId) {
      const p = initialPesananList.find((item) => item.id === selectedPesananId);
      if (p) {
        setNamaCustomer(p.nama_customer || "");
        setAlamatAsal(p.alamat_asal || "");
        setAlamatTujuan(p.alamat_tujuan || "");
        setNomorTeleponCustomer(p.kontak_customer?.nomor_telepon || "");
        setJenisBarang(p.jenis_barang || "");
        setBerat(p.berat ? String(p.berat) : "");
        setVolume(p.volume ? String(p.volume) : "");
        setJumlahKoli(p.jumlah_koli ? String(p.jumlah_koli) : "");
        setCatatanMuatan(p.catatan_muatan || "");
        setJenisArmada(p.jenis_armada ? p.jenis_armada.toUpperCase() : "CDD");
        setPlatNomor(p.plat_nomor || "");
        setSupirNama(p.supir?.nama || "");
        setVendorNama(p.vendor_trucking?.nama || "");
        setTarifCustomer(p.tarif_customer ? String(p.tarif_customer) : "0");
        setBiayaVendor(p.biaya_vendor ? String(p.biaya_vendor) : "0");
        setBiayaLainnya(p.biaya_lainnya ? String(p.biaya_lainnya) : "0");

        // Format nomor dokumen sesuai jenis & nomor pesanan
        generatePrefixNumber(jenisDokumen, p.nomor_pesanan);
      }
    } else if (sourceMode === "manual") {
      generatePrefixNumber(jenisDokumen);
    }
  }, [selectedPesananId, sourceMode, jenisDokumen]);

  function generatePrefixNumber(jenis: JenisDokumen, basePesananNum?: string) {
    if (basePesananNum) {
      setNomorDokumen(basePesananNum);
      return;
    }

    const now = new Date();
    const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const randomCode = Math.floor(1000 + Math.random() * 9000);

    switch (jenis) {
      case "surat_jalan":
        setNomorDokumen(`SJ-${dateCode}-${randomCode}`);
        break;
      case "invoice":
        setNomorDokumen(`INV-${dateCode}-${randomCode}`);
        break;
      case "cost_sheet":
        setNomorDokumen(`CS-${dateCode}-${randomCode}`);
        break;
      case "pod":
        setNomorDokumen(`POD-${dateCode}-${randomCode}`);
        break;
    }
  }

  // Kalkulasi Margin Realtime untuk Cost Sheet
  const tarifNum = Number(tarifCustomer) || 0;
  const vendorNum = Number(biayaVendor) || 0;
  const lainnyaNum = Number(biayaLainnya) || 0;
  const marginNum = tarifNum - vendorNum - lainnyaNum;
  const marginPercentage = tarifNum > 0 ? ((marginNum / tarifNum) * 100).toFixed(1) : "0";

  // Total Tagihan Realtime untuk Invoice
  const totalInvoice = tarifNum + lainnyaNum;

  function formatIDR(val: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!namaCustomer.trim()) {
      toast.error("Nama customer/klien wajib diisi.");
      return;
    }
    if (!nomorDokumen.trim()) {
      toast.error("Nomor dokumen wajib diisi.");
      return;
    }

    setLoading(true);
    setGeneratedResult(null);

    const payload = {
      jenis: jenisDokumen,
      pesanan_id: sourceMode === "pesanan" ? selectedPesananId : undefined,
      nomor_dokumen: nomorDokumen.trim(),
      nama_customer: namaCustomer.trim(),
      nomor_telepon_customer: nomorTeleponCustomer.trim() || undefined,
      alamat_asal: alamatAsal.trim() || undefined,
      alamat_tujuan: alamatTujuan.trim() || undefined,
      tanggal_dokumen: tanggalDokumen,
      jenis_barang: jenisBarang.trim() || undefined,
      berat: berat ? Number(berat) : undefined,
      volume: volume ? Number(volume) : undefined,
      jumlah_koli: jumlahKoli ? Number(jumlahKoli) : undefined,
      catatan_muatan: catatanMuatan.trim() || undefined,
      jenis_armada: jenisArmada.trim() || undefined,
      plat_nomor: platNomor.trim() || undefined,
      supir_nama: supirNama.trim() || undefined,
      vendor_nama: vendorNama.trim() || undefined,
      tarif_customer: tarifNum,
      biaya_vendor: vendorNum,
      biaya_lainnya: lainnyaNum,
    };

    const res = await generateManualDokumenAction(payload);
    setLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal membuat dokumen PDF.");
      return;
    }

    toast.success(res.message);
    setGeneratedResult({
      pdfBase64: res.pdfBase64,
      fileName: res.fileName,
      pdfUrl: res.pdfUrl,
      pesananId: res.pesananId,
    });
  }

  function handleShareWhatsApp() {
    const docLabel = jenisDokumenLabels[jenisDokumen];
    let shareLink = "";

    if (generatedResult?.pdfUrl && typeof window !== "undefined") {
      shareLink = `${window.location.origin}${generatedResult.pdfUrl}`;
    } else if (typeof window !== "undefined") {
      shareLink = `${window.location.origin}/api/documents/manual?file=${encodeURIComponent(
        generatedResult?.fileName || ""
      )}`;
    }

    const message = generateDocumentShareMessage(
      {
        id: selectedPesananId || "manual",
        nomor_pesanan: nomorDokumen,
        nama_customer: namaCustomer,
        alamat_asal: alamatAsal || "Lokasi Asal",
        alamat_tujuan: alamatTujuan || "Lokasi Tujuan",
        status: "selesai",
      },
      jenisDokumen as DocumentTypeKey,
      shareLink
    );

    const sendUrl = buildWhatsAppSendUrl(nomorTeleponCustomer || "", message);
    window.open(sendUrl, "_blank");
    toast.success(`Membuka WhatsApp untuk mengirim ${docLabel}`);
  }

  function handleDownloadDirect() {
    if (!generatedResult) return;
    const link = document.createElement("a");
    link.href = generatedResult.pdfBase64;
    link.download = generatedResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File PDF berhasil diunduh.");
  }

  function handleOpenDirect() {
    if (!generatedResult) return;
    if (generatedResult.pdfUrl) {
      window.open(generatedResult.pdfUrl, "_blank");
      return;
    }
    const win = window.open();
    if (win) {
      win.document.write(
        `<iframe src="${generatedResult.pdfBase64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    }
  }

  function handleResetForm() {
    setGeneratedResult(null);
    generatePrefixNumber(jenisDokumen);
    if (sourceMode === "manual") {
      setNamaCustomer("");
      setNomorTeleponCustomer("");
      setAlamatAsal("");
      setAlamatTujuan("");
      setJenisBarang("");
      setBerat("");
      setJumlahKoli("");
      setPlatNomor("");
      setSupirNama("");
      setTarifCustomer("");
      setBiayaVendor("");
    }
  }

  return (
    <div className="space-y-6 pb-28">
      {/* ── 1. Pilih Mode Sumber Data ── */}
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-xs space-y-4">
        <div>
          <h2 className="text-sm md:text-base font-bold text-[var(--color-navy-900)]">
            1. Tentukan Sumber Data Dokumen
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Gunakan data dari pesanan yang sedang digarap atau isi mandiri
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setSourceMode("pesanan");
              setGeneratedResult(null);
            }}
            className={`flex flex-col items-start gap-2 rounded-2xl p-4 text-left border-2 transition-all touch-target ${
              sourceMode === "pesanan"
                ? "border-[var(--color-primary)] bg-[var(--color-surface-tint)] text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-slate-300"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                sourceMode === "pesanan"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-[var(--color-navy-900)]">
                Pesanan Berjalan
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                Otomatis ambil data dari pesanan aktif
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSourceMode("manual");
              setSelectedPesananId("");
              setGeneratedResult(null);
            }}
            className={`flex flex-col items-start gap-2 rounded-2xl p-4 text-left border-2 transition-all touch-target ${
              sourceMode === "manual"
                ? "border-[var(--color-primary)] bg-[var(--color-surface-tint)] text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-slate-300"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                sourceMode === "manual"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-[var(--color-navy-900)]">
                Input Bebas / Manual
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                Untuk klien luar / dokumen ad-hoc
              </p>
            </div>
          </button>
        </div>

        {/* Dropdown Pesanan Berjalan (Jika mode Pesanan) */}
        {sourceMode === "pesanan" && (
          <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
            <label className="block text-xs font-bold text-[var(--color-navy-900)]">
              Pilih Pesanan Klien yang Sedang Digarap:
            </label>
            {initialPesananList.length === 0 ? (
              <p className="text-xs text-[var(--color-text-secondary)] italic">
                Belum ada pesanan yang tercatat. Silakan beralih ke &quot;Input Bebas / Manual&quot;.
              </p>
            ) : (
              <select
                value={selectedPesananId}
                onChange={(e) => setSelectedPesananId(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-3 text-xs md:text-sm font-medium text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              >
                <option value="">-- Pilih Pesanan --</option>
                {initialPesananList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nomor_pesanan} — {p.nama_customer} ({p.alamat_asal.slice(0, 15)} ➔ {p.alamat_tujuan.slice(0, 15)})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* ── 2. Pilih Jenis Dokumen ── */}
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-xs space-y-4">
        <div>
          <h2 className="text-sm md:text-base font-bold text-[var(--color-navy-900)]">
            2. Pilih Jenis Dokumen yang Akan Dibuat
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Format resmi kop PT Daff Cargo Nusantara
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Surat Jalan */}
          <button
            type="button"
            onClick={() => {
              setJenisDokumen("surat_jalan");
              setGeneratedResult(null);
            }}
            className={`flex flex-col items-start gap-2 rounded-2xl p-4 text-left border-2 transition-all touch-target ${
              jenisDokumen === "surat_jalan"
                ? "border-[var(--color-primary)] bg-[var(--color-surface-tint)] text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-slate-300"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                jenisDokumen === "surat_jalan"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-[var(--color-navy-900)]">
                Surat Jalan
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-tight">
                Bukti muatan & rute armada
              </p>
            </div>
          </button>

          {/* Invoice */}
          <button
            type="button"
            onClick={() => {
              setJenisDokumen("invoice");
              setGeneratedResult(null);
            }}
            className={`flex flex-col items-start gap-2 rounded-2xl p-4 text-left border-2 transition-all touch-target ${
              jenisDokumen === "invoice"
                ? "border-[var(--color-primary)] bg-[var(--color-surface-tint)] text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-slate-300"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                jenisDokumen === "invoice"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-[var(--color-navy-900)]">
                Invoice
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-tight">
                Tagihan resmi & rekening DCN
              </p>
            </div>
          </button>

          {/* Cost Sheet */}
          <button
            type="button"
            onClick={() => {
              setJenisDokumen("cost_sheet");
              setGeneratedResult(null);
            }}
            className={`flex flex-col items-start gap-2 rounded-2xl p-4 text-left border-2 transition-all touch-target ${
              jenisDokumen === "cost_sheet"
                ? "border-[var(--color-primary)] bg-[var(--color-surface-tint)] text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-slate-300"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                jenisDokumen === "cost_sheet"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-[var(--color-navy-900)]">
                Rincian Biaya
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-tight">
                Cost sheet & margin internal
              </p>
            </div>
          </button>

          {/* POD */}
          <button
            type="button"
            onClick={() => {
              setJenisDokumen("pod");
              setGeneratedResult(null);
            }}
            className={`flex flex-col items-start gap-2 rounded-2xl p-4 text-left border-2 transition-all touch-target ${
              jenisDokumen === "pod"
                ? "border-[var(--color-primary)] bg-[var(--color-surface-tint)] text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-slate-300"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                jenisDokumen === "pod"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-[var(--color-navy-900)]">
                Bukti Terima (POD)
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-tight">
                Serah terima & tanda tangan
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── 3. Formulir Isian Dokumen ── */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div>
              <h2 className="text-sm md:text-base font-bold text-[var(--color-navy-900)]">
                3. Data Isian {jenisDokumenLabels[jenisDokumen]}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Pastikan data yang dimasukkan sudah benar
              </p>
            </div>
            <span className="rounded-full bg-[var(--color-surface-tint)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
              {sourceMode === "pesanan" ? "Terhubung Pesanan" : "Dokumen Bebas"}
            </span>
          </div>

          {/* Nomor Dokumen & Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-navy-900)] mb-1">
                Nomor Dokumen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nomorDokumen}
                onChange={(e) => setNomorDokumen(e.target.value.toUpperCase())}
                placeholder="Contoh: DCN-202609-0001"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-xs md:text-sm font-medium text-[var(--color-text-primary)] uppercase focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-navy-900)] mb-1">
                Tanggal Terbit Dokumen
              </label>
              <input
                type="date"
                value={tanggalDokumen}
                onChange={(e) => setTanggalDokumen(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-xs md:text-sm font-medium text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* Customer & Telepon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-navy-900)] mb-1">
                Nama Customer / Klien <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={namaCustomer}
                onChange={(e) => setNamaCustomer(e.target.value)}
                placeholder="Nama perusahaan atau perorangan"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-xs md:text-sm font-medium text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-navy-900)] mb-1">
                Nomor WhatsApp Customer (Opsional)
              </label>
              <input
                type="tel"
                value={nomorTeleponCustomer}
                onChange={(e) => setNomorTeleponCustomer(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-xs md:text-sm font-medium text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* Rute Asal & Tujuan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-navy-900)] mb-1">
                Alamat Asal / Lokasi Muat
              </label>
              <input
                type="text"
                value={alamatAsal}
                onChange={(e) => setAlamatAsal(e.target.value)}
                placeholder="Kota asal / alamat gudang muat"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-xs md:text-sm font-medium text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-navy-900)] mb-1">
                Alamat Tujuan / Lokasi Bongkar
              </label>
              <input
                type="text"
                value={alamatTujuan}
                onChange={(e) => setAlamatTujuan(e.target.value)}
                placeholder="Kota tujuan / alamat penerima"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-xs md:text-sm font-medium text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          {/* ── Field Spesifik: Surat Jalan & POD ── */}
          {(jenisDokumen === "surat_jalan" || jenisDokumen === "pod") && (
            <div className="pt-3 border-t border-[var(--color-border)] space-y-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Rincian Muatan & Armada
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1">
                    Jenis Barang
                  </label>
                  <input
                    type="text"
                    value={jenisBarang}
                    onChange={(e) => setJenisBarang(e.target.value)}
                    placeholder="Contoh: Sparepart, Besi"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2 text-xs md:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1">
                    Berat Muatan (Kg)
                  </label>
                  <input
                    type="number"
                    value={berat}
                    onChange={(e) => setBerat(e.target.value)}
                    placeholder="Contoh: 1500"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2 text-xs md:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1">
                    Jumlah Koli / Colly
                  </label>
                  <input
                    type="number"
                    value={jumlahKoli}
                    onChange={(e) => setJumlahKoli(e.target.value)}
                    placeholder="Contoh: 25"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2 text-xs md:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1">
                    Tipe Armada
                  </label>
                  <input
                    type="text"
                    value={jenisArmada}
                    onChange={(e) => setJenisArmada(e.target.value)}
                    placeholder="Contoh: CDD / Fuso / Wingbox"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2 text-xs md:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1">
                    Plat Nomor Kendaraan
                  </label>
                  <input
                    type="text"
                    value={platNomor}
                    onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
                    placeholder="Contoh: B 1234 XYZ"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2 text-xs md:text-sm uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1">
                    Nama Supir
                  </label>
                  <input
                    type="text"
                    value={supirNama}
                    onChange={(e) => setSupirNama(e.target.value)}
                    placeholder="Nama supir armada"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2 text-xs md:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1">
                  Catatan Tambahan Muatan
                </label>
                <textarea
                  rows={2}
                  value={catatanMuatan}
                  onChange={(e) => setCatatanMuatan(e.target.value)}
                  placeholder="Catatan penanganan, instruksi supir, atau catatan serah terima"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2 text-xs md:text-sm"
                />
              </div>
            </div>
          )}

          {/* ── Field Spesifik: Invoice ── */}
          {jenisDokumen === "invoice" && (
            <div className="pt-3 border-t border-[var(--color-border)] space-y-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Rincian Tagihan Invoice
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1">
                    Tarif Jasa Pengiriman (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={tarifCustomer}
                    onChange={(e) => setTarifCustomer(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-xs md:text-sm font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1">
                    Biaya Tambahan Lainnya (Rp)
                  </label>
                  <input
                    type="number"
                    value={biayaLainnya}
                    onChange={(e) => setBiayaLainnya(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-xs md:text-sm font-bold tabular-nums"
                  />
                </div>
              </div>

              {/* Total Tagihan Banner */}
              <div className="rounded-2xl bg-[var(--color-surface-tint)] p-4 border border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    Total Nilai Tagihan Invoice
                  </p>
                  <p className="text-lg md:text-xl font-bold text-[var(--color-primary)] tabular-nums mt-0.5">
                    {formatIDR(totalInvoice)}
                  </p>
                </div>
                <div className="text-right text-[11px] text-[var(--color-text-secondary)]">
                  Rekening: <strong className="text-[var(--color-navy-900)]">BCA / Bank DCN</strong>
                </div>
              </div>
            </div>
          )}

          {/* ── Field Spesifik: Cost Sheet ── */}
          {jenisDokumen === "cost_sheet" && (
            <div className="pt-3 border-t border-[var(--color-border)] space-y-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Kalkulasi Biaya Vendor & Margin Laba
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1">
                    Tarif ke Customer (Rp)
                  </label>
                  <input
                    type="number"
                    value={tarifCustomer}
                    onChange={(e) => setTarifCustomer(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-xs md:text-sm font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1">
                    Biaya Vendor / Trucking (Rp)
                  </label>
                  <input
                    type="number"
                    value={biayaVendor}
                    onChange={(e) => setBiayaVendor(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-xs md:text-sm font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-navy-900)] mb-1">
                    Biaya Lainnya (Rp)
                  </label>
                  <input
                    type="number"
                    value={biayaLainnya}
                    onChange={(e) => setBiayaLainnya(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-xs md:text-sm font-bold tabular-nums"
                  />
                </div>
              </div>

              {/* Margin Card Highlight */}
              <div
                className={`rounded-2xl p-4 border flex items-center justify-between ${
                  marginNum >= 0
                    ? "bg-[var(--color-success-100)] border-[var(--color-success-600)]/30 text-[var(--color-success-600)]"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold">Estimasi Margin Laba Bersih</p>
                  <p className="text-lg md:text-xl font-bold tabular-nums mt-0.5">
                    {formatIDR(marginNum)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold">
                    {marginPercentage}% Margin
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tombol Submit Generate */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] py-3.5 px-6 text-sm font-bold text-white shadow-md hover:bg-[var(--color-primary-dark)] active:scale-[0.99] disabled:opacity-50 transition-all touch-target"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Sedang Membuat Dokumen PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  <span>Generate {jenisDokumenLabels[jenisDokumen]} (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ── 4. Banner Hasil Pembuatan Dokumen ── */}
      {generatedResult && (
        <div className="rounded-3xl bg-[var(--color-navy-900)] p-6 text-white shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold">
                  {jenisDokumenLabels[jenisDokumen]} Berhasil Dibuat!
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  File: {generatedResult.fileName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetForm}
              className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/25 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Buat Baru</span>
            </button>
          </div>

          <div className="h-px bg-white/15" />

          {/* Tombol Aksi Langsung */}
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleOpenDirect}
              className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-xs md:text-sm font-bold text-white shadow-sm hover:bg-[var(--color-primary-dark)] active:scale-[0.99] transition-all touch-target"
            >
              <Eye className="h-4 w-4" />
              <span>Lihat PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDirect}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 px-4 py-3 text-xs md:text-sm font-semibold text-white hover:bg-white/25 transition-colors touch-target"
            >
              <Download className="h-4 w-4" />
              <span>Unduh File</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white px-5 py-3 text-xs md:text-sm font-bold hover:bg-[#20ba59] active:scale-[0.99] transition-all touch-target"
            >
              <Share2 className="h-4 w-4" />
              <span>Kirim ke WhatsApp</span>
            </button>
          </div>

          {generatedResult.pesananId && (
            <p className="text-[11px] text-white/70 text-center pt-1">
              Dokumen ini otomatis tersimpan di arsip pesanan. Anda juga dapat melihatnya di tab Dokumen pada Detail Pesanan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
