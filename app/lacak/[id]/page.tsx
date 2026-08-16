import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge, type StatusPesanan, getEffectiveStatus } from "@/components/shipment/StatusBadge";
import { StatusStepper, type RiwayatStatusItem } from "@/components/shipment/StatusStepper";
import { LiveTrackingMap } from "@/components/tracking/LiveTrackingMap";
import { type ModaPengiriman, type JenisPengiriman } from "@/lib/validations/pesanan";
import {
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  MessageCircle,
  Truck,
  Ship,
  Plane,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface PublicTrackingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PublicTrackingPageProps) {
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
        title: `Live Tracking ${data.nomor_pesanan} — PT Daff Cargo Nusantara`,
        description: `Lacak status dan posisi real-time pengiriman muatan ${data.nomor_pesanan}`,
      };
    }
  } catch {}

  return {
    title: "Pelacakan Muatan — PT Daff Cargo Nusantara",
  };
}

export default async function PublicTrackingPage({ params }: PublicTrackingPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch pesanan (Public accessible)
  const { data: pesanan, error } = await supabase
    .from("pesanan")
    .select(`
      *,
      kontak_customer:kontak_customer_id(nama, nomor_telepon, perusahaan)
    `)
    .eq("id", id)
    .single();

  if (error || !pesanan) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-white">Muatan Tidak Ditemukan</h1>
          <p className="text-xs text-slate-400">
            Nomor resi atau ID pelacakan ini tidak valid atau telah selesai diarsipkan.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/6281282200880?text=Halo%20Daff%20Cargo,%20saya%20ingin%20menanyakan%20status%20pengiriman%20saya"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4 fill-current" />
              <span>Hubungi CS Daff Cargo</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Fetch riwayat
  const { data: riwayatData } = await supabase
    .from("riwayat_status")
    .select("*")
    .eq("pesanan_id", id)
    .order("created_at", { ascending: true });

  const riwayat: RiwayatStatusItem[] = (riwayatData || []) as RiwayatStatusItem[];

  const effectiveStatus = getEffectiveStatus(pesanan);

  // Deteksi moda pengiriman
  let moda: ModaPengiriman = "darat";
  if (
    pesanan.catatan_muatan?.includes("[MODA: UDARA") ||
    pesanan.moda_pengiriman === "udara" ||
    [
      "acceptance_bandara",
      "masuk_terminal_kargo",
      "terbang",
      "dalam_penerbangan",
      "mendarat",
      "delivery_udara",
    ].includes(effectiveStatus)
  ) {
    moda = "udara";
  } else if (
    pesanan.catatan_muatan?.includes("[MODA: LAUT") ||
    pesanan.moda_pengiriman === "laut" ||
    [
      "stuffing",
      "gate_in_pelabuhan",
      "kapal_berangkat",
      "pelayaran",
      "kapal_tiba",
      "dooring",
    ].includes(effectiveStatus)
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
    <div className="min-h-screen bg-[#0B132B] text-slate-100 antialiased selection:bg-teal-500 selection:text-white">
      {/* ── Top Brand Bar ── */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0B132B]/90 backdrop-blur-md px-4 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white font-black text-sm shadow-md">
              DCN
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">
                PT Daff Cargo Nusantara
              </h1>
              <p className="text-[10px] text-teal-400 font-medium">
                Domestic Freight Forwarding & Logistics
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/6281282200880?text=Halo%20Daff%20Cargo,%20saya%20ingin%20cek%20pesanan%20${encodeURIComponent(pesanan.nomor_pesanan)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all"
          >
            <MessageCircle className="h-3.5 w-3.5 fill-current" />
            <span className="hidden sm:inline">Bantuan CS</span>
          </a>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Banner Nomor Pesanan & Status */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 p-5 md:p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Nomor Pelacakan Muatan
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mt-0.5">
                {pesanan.nomor_pesanan}
              </h2>
            </div>
            <StatusBadge status={effectiveStatus} />
          </div>

          <div className="h-px bg-slate-700/60" />

          {/* Rute Visual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-950/60 p-3.5 border border-slate-800">
              <p className="text-[11px] font-medium text-slate-400">Lokasi Asal (Origin)</p>
              <p className="text-sm font-bold text-white mt-0.5">{pesanan.alamat_asal}</p>
            </div>
            <div className="rounded-2xl bg-slate-950/60 p-3.5 border border-slate-800">
              <p className="text-[11px] font-medium text-slate-400">Lokasi Tujuan (Destination)</p>
              <p className="text-sm font-bold text-teal-400 mt-0.5">{pesanan.alamat_tujuan}</p>
            </div>
          </div>
        </div>

        {/* ── Live Map Interaktif ── */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-400" />
            <span>Peta Pelacakan Real-Time</span>
          </h3>
          <LiveTrackingMap
            pesanan={{
              ...pesanan,
              status: effectiveStatus,
            }}
          />
        </div>

        {/* ── Stepper Alur Pengiriman ── */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200">
            Riwayat & Milestone Perjalanan
          </h3>
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm text-slate-900">
            <StatusStepper
              currentStatus={effectiveStatus}
              riwayat={riwayat}
              moda={moda}
              jenisPengiriman={jenisPengiriman}
            />
          </div>
        </div>

        {/* ── Ringkasan Muatan ── */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Package className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Detail Muatan</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-2xl bg-slate-950/70 p-3 border border-slate-800/80">
              <p className="text-slate-400 text-[11px]">Jenis Muatan</p>
              <p className="font-bold text-white mt-0.5 truncate">{pesanan.jenis_barang || "-"}</p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 p-3 border border-slate-800/80">
              <p className="text-slate-400 text-[11px]">Berat</p>
              <p className="font-bold text-white mt-0.5">
                {pesanan.berat ? `${pesanan.berat.toLocaleString("id-ID")} Kg` : "-"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 p-3 border border-slate-800/80">
              <p className="text-slate-400 text-[11px]">Volume</p>
              <p className="font-bold text-white mt-0.5">
                {pesanan.volume ? `${pesanan.volume} m³` : "-"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 p-3 border border-slate-800/80">
              <p className="text-slate-400 text-[11px]">Jumlah Koli</p>
              <p className="font-bold text-white mt-0.5">
                {pesanan.jumlah_koli ? `${pesanan.jumlah_koli} Koli` : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="text-center pt-4 space-y-2 text-xs text-slate-500">
          <p>© 2026 PT Daff Cargo Nusantara. Hak cipta dilindungi undang-undang.</p>
          <p>Layanan Freight Forwarding, Trucking & Customs Clearance Domestik Indonesia.</p>
        </div>
      </main>
    </div>
  );
}
