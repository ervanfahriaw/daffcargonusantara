import { z } from "zod";

export const modaPengirimanEnum = z.enum(["darat", "laut", "udara"]);
export type ModaPengiriman = z.infer<typeof modaPengirimanEnum>;

export const modaPengirimanLabels: Record<ModaPengiriman, string> = {
  darat: "🚚 Darat (Trucking Domestik)",
  laut: "🚢 Laut (Sea Freight Antarpulau)",
  udara: "✈️ Udara (Air Freight Express)",
};

// ── Lingkup Layanan Serah Terima (Service Scope) ──
export const jenisPengirimanEnum = z.enum(["d2d", "d2p", "p2d", "p2p"]);
export type JenisPengiriman = z.infer<typeof jenisPengirimanEnum>;

export const jenisPengirimanLabels: Record<JenisPengiriman, { title: string; subtitle: string; icon: string }> = {
  d2d: {
    title: "Door to Door (D2D)",
    subtitle: "Jemput di alamat pengirim & antar sampai alamat penerima",
    icon: "🚪➡️🚪",
  },
  d2p: {
    title: "Door to Port / Hub (D2P)",
    subtitle: "Jemput di alamat pengirim & penerima ambil di Pelabuhan/Bandara tujuan",
    icon: "🚪➡️⚓",
  },
  p2d: {
    title: "Port to Door (P2D)",
    subtitle: "Pengirim serah barang di Pelabuhan/Bandara asal & kami antar ke alamat penerima",
    icon: "⚓➡️🚪",
  },
  p2p: {
    title: "Port to Port (P2P)",
    subtitle: "Serah barang di Pelabuhan/Bandara asal & ambil di Pelabuhan/Bandara tujuan",
    icon: "⚓➡️⚓",
  },
};

// ── 1. Moda Darat (Armada Truk) ──
export const jenisArmadaEnum = z.enum([
  "cdd",
  "fuso",
  "wingbox",
  "trailer",
  "lowbed",
  "lainnya",
]);
export type JenisArmada = z.infer<typeof jenisArmadaEnum>;

export const jenisArmadaLabels: Record<JenisArmada, string> = {
  cdd: "CDD (Colt Diesel Double)",
  fuso: "Fuso",
  wingbox: "Wingbox",
  trailer: "Trailer",
  lowbed: "Lowbed",
  lainnya: "Armada Lainnya",
};

// ── 2. Moda Laut (Tipe Layanan Kontainer & Kapal) ──
export const tipeLayananLautEnum = z.enum([
  "fcl_20ft",
  "fcl_40ft",
  "lcl",
  "roro",
  "breakbulk",
]);
export type TipeLayananLaut = z.infer<typeof tipeLayananLautEnum>;

export const tipeLayananLautLabels: Record<TipeLayananLaut, string> = {
  fcl_20ft: "FCL Kontainer 20 Feet",
  fcl_40ft: "FCL Kontainer 40 Feet",
  lcl: "LCL (Cargo Campuran)",
  roro: "Kapal Ro-Ro (Truk / Kendaraan)",
  breakbulk: "Breakbulk / Project Cargo",
};

// ── 3. Moda Udara (Tipe Layanan Air Freight) ──
export const tipeLayananUdaraEnum = z.enum([
  "general_cargo",
  "express_urgent",
  "heavy_cargo",
  "special_cargo",
]);
export type TipeLayananUdara = z.infer<typeof tipeLayananUdaraEnum>;

export const tipeLayananUdaraLabels: Record<TipeLayananUdara, string> = {
  general_cargo: "General Cargo (Kargo Umum)",
  express_urgent: "Express / Urgent Cargo (Same Day / Next Day)",
  heavy_cargo: "Heavy Cargo (Muatan Berat)",
  special_cargo: "Special / Dangerous Goods (DGR/Perishable)",
};

// Daftar Pelabuhan Utama di Indonesia untuk Auto-Suggestion
export const pelabuhanUtamaIndonesia = [
  "Pelabuhan Tanjung Priok (Jakarta)",
  "Pelabuhan Tanjung Perak (Surabaya)",
  "Pelabuhan Belawan (Medan)",
  "Pelabuhan Soekarno-Hatta (Makassar)",
  "Pelabuhan Trisakti (Banjarmasin)",
  "Pelabuhan Dwikora (Pontianak)",
  "Pelabuhan Semayang (Balikpapan)",
  "Pelabuhan Bitung (Manado)",
  "Pelabuhan Yos Sudarso (Ambon)",
  "Pelabuhan Jayapura (Papua)",
  "Pelabuhan Teluk Bayur (Padang)",
  "Pelabuhan Panjang (Lampung)",
  "Pelabuhan Tenau (Kupang)",
  "Pelabuhan Benoa (Bali)",
];

// Daftar Bandara Utama di Indonesia untuk Auto-Suggestion
export const bandaraUtamaIndonesia = [
  "Bandara Soekarno-Hatta (CGK - Jakarta)",
  "Bandara Halim Perdanakusuma (HLP - Jakarta)",
  "Bandara Juanda (SUB - Surabaya)",
  "Bandara Kualanamu (KNO - Medan)",
  "Bandara Sultan Hasanuddin (UPG - Makassar)",
  "Bandara Sepinggan (BPN - Balikpapan)",
  "Bandara Supadio (PNK - Pontianak)",
  "Bandara Syamsudin Noor (BDJ - Banjarmasin)",
  "Bandara Sam Ratulangi (MDC - Manado)",
  "Bandara Pattimura (AMQ - Ambon)",
  "Bandara Sentani (DJJ - Jayapura)",
  "Bandara I Gusti Ngurah Rai (DPS - Denpasar Bali)",
  "Bandara Hang Nadim (BTH - Batam)",
  "Bandara Minangkabau (PDG - Padang)",
  "Bandara Sultan Mahmud Badaruddin II (PLM - Palembang)",
  "Bandara Radin Inten II (TKG - Lampung)",
  "Bandara El Tari (KOE - Kupang)",
  "Bandara Lombok Zainuddin Abdul Madjid (LOP - Mataram)",
];

export const pesananSchema = z.object({
  // Pilihan Moda Pengiriman & Lingkup Layanan
  moda_pengiriman: z.enum(["darat", "laut", "udara"]).default("darat"),
  jenis_pengiriman: z.enum(["d2d", "d2p", "p2d", "p2p"]).default("d2d"),

  // Section: Data Customer & Rute
  nama_customer: z
    .string()
    .min(1, { message: "Nama customer wajib diisi" })
    .trim(),
  kontak_customer_id: z.string().uuid().optional().nullable().or(z.literal("")),
  nomor_telepon_customer: z.string().optional().nullable().or(z.literal("")),
  alamat_asal: z
    .string()
    .min(1, { message: "Alamat asal (muat) wajib diisi" })
    .trim(),
  alamat_tujuan: z
    .string()
    .min(1, { message: "Alamat tujuan (bongkar) wajib diisi" })
    .trim(),

  // Section: Data Muatan Barang
  jenis_barang: z.string().optional().nullable().or(z.literal("")),
  berat: z
    .preprocess(
      (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
      z.number().min(0, "Berat tidak boleh negatif").nullable().optional()
    ),
  volume: z
    .preprocess(
      (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
      z.number().min(0, "Volume tidak boleh negatif").nullable().optional()
    ),
  jumlah_koli: z
    .preprocess(
      (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
      z.number().int().min(0, "Jumlah koli tidak boleh negatif").nullable().optional()
    ),
  catatan_muatan: z.string().optional().nullable().or(z.literal("")),

  // Section: Transportasi Darat (Khusus Moda Darat)
  jenis_armada: z
    .enum(["cdd", "fuso", "wingbox", "trailer", "lowbed", "lainnya"])
    .optional()
    .nullable()
    .or(z.literal("")),
  vendor_trucking_id: z.string().uuid().optional().nullable().or(z.literal("")),
  supir_id: z.string().uuid().optional().nullable().or(z.literal("")),
  plat_nomor: z.string().optional().nullable().or(z.literal("")),

  // Section: Transportasi Laut (Khusus Moda Laut Antarpulau)
  tipe_layanan_laut: z
    .enum(["fcl_20ft", "fcl_40ft", "lcl", "roro", "breakbulk"])
    .optional()
    .nullable()
    .or(z.literal("")),
  pelabuhan_asal: z.string().optional().nullable().or(z.literal("")),
  pelabuhan_tujuan: z.string().optional().nullable().or(z.literal("")),
  nama_kapal: z.string().optional().nullable().or(z.literal("")),
  nomor_kontainer: z.string().optional().nullable().or(z.literal("")),
  nomor_seal: z.string().optional().nullable().or(z.literal("")),
  pelayaran_id: z.string().uuid().optional().nullable().or(z.literal("")),

  // Section: Transportasi Udara (Khusus Moda Udara Express)
  tipe_layanan_udara: z
    .enum(["general_cargo", "express_urgent", "heavy_cargo", "special_cargo"])
    .optional()
    .nullable()
    .or(z.literal("")),
  bandara_asal: z.string().optional().nullable().or(z.literal("")),
  bandara_tujuan: z.string().optional().nullable().or(z.literal("")),
  nama_maskapai: z.string().optional().nullable().or(z.literal("")),
  nomor_penerbangan: z.string().optional().nullable().or(z.literal("")),
  nomor_awb: z.string().optional().nullable().or(z.literal("")),
  maskapai_id: z.string().uuid().optional().nullable().or(z.literal("")),

  // Estimasi Jadwal
  estimasi_berangkat: z.string().optional().nullable().or(z.literal("")),
  estimasi_tiba: z.string().optional().nullable().or(z.literal("")),

  // Section: Biaya Awal
  tarif_customer: z
    .preprocess(
      (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
      z.number().min(0, "Tarif customer tidak boleh negatif").default(0)
    ),
  biaya_vendor: z
    .preprocess(
      (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
      z.number().min(0, "Biaya vendor tidak boleh negatif").default(0)
    ),
  biaya_lainnya: z
    .preprocess(
      (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
      z.number().min(0, "Biaya lainnya tidak boleh negatif").default(0)
    ),
});

export type PesananInput = z.infer<typeof pesananSchema>;
