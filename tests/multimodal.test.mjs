import test from "node:test";
import assert from "node:assert";
import { z } from "zod";

// Schema for Multimodal Domestic Freight (Darat, Laut, Udara)
export const modaPengirimanEnum = z.enum(["darat", "laut", "udara"]);

export const pesananMultimodalSchema = z.object({
  moda_pengiriman: z.enum(["darat", "laut", "udara"]).default("darat"),
  nama_customer: z.string().min(1, { message: "Nama customer wajib diisi" }).trim(),
  kontak_customer_id: z.string().uuid().optional().nullable().or(z.literal("")),
  nomor_telepon_customer: z.string().optional().nullable().or(z.literal("")),
  alamat_asal: z.string().min(1, { message: "Alamat asal wajib diisi" }).trim(),
  alamat_tujuan: z.string().min(1, { message: "Alamat tujuan wajib diisi" }).trim(),

  // Data Muatan
  jenis_barang: z.string().optional().nullable().or(z.literal("")),
  berat: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().min(0).nullable().optional()
  ),
  volume: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().min(0).nullable().optional()
  ),
  jumlah_koli: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().int().min(0).nullable().optional()
  ),
  catatan_muatan: z.string().optional().nullable().or(z.literal("")),

  // Spesifik Darat
  jenis_armada_darat: z
    .enum(["cdd", "fuso", "wingbox", "trailer", "lowbed", "lainnya"])
    .optional()
    .nullable()
    .or(z.literal("")),
  plat_nomor: z.string().optional().nullable().or(z.literal("")),
  supir_id: z.string().uuid().optional().nullable().or(z.literal("")),
  vendor_trucking_id: z.string().uuid().optional().nullable().or(z.literal("")),

  // Spesifik Laut (Antarpulau)
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

  // Spesifik Udara (Air Freight)
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

  // Keuangan
  tarif_customer: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0).default(0)
  ),
  biaya_vendor: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0).default(0)
  ),
  biaya_lainnya: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0).default(0)
  ),
});

// State Transition for Air Freight
export function getNextStatusAir(currentStatus) {
  switch (currentStatus) {
    case "booking":
      return { nextStatus: "acceptance_bandara", label: "Acceptance & Timbang di Bandara", actionType: "progress" };
    case "acceptance_bandara":
      return { nextStatus: "masuk_terminal_kargo", label: "Terbit SMU / Masuk Terminal Kargo", actionType: "progress" };
    case "masuk_terminal_kargo":
      return { nextStatus: "terbang", label: "Pesawat Lepas Landas (ETD)", actionType: "progress" };
    case "terbang":
      return { nextStatus: "dalam_penerbangan", label: "Update Dalam Penerbangan", actionType: "progress" };
    case "dalam_penerbangan":
      return { nextStatus: "mendarat", label: "Pesawat Mendarat & Unloading (ETA)", actionType: "progress" };
    case "mendarat":
      return { nextStatus: "delivery_udara", label: "Pengantaran Kurir / Dooring Bandara", actionType: "progress" };
    case "delivery_udara":
      return { nextStatus: "terkirim", label: "Upload Bukti Serah Terima (POD)", actionType: "progress" };
    case "terkirim":
      return { nextStatus: null, label: "Buat Invoice Tagihan", actionType: "navigate_dokumen" };
    case "tertunda":
      return { nextStatus: "dalam_penerbangan", label: "Lanjutkan Pengiriman Udara", actionType: "progress" };
    case "selesai":
      return { nextStatus: null, label: "Pesanan Selesai", actionType: "finished" };
    default:
      return { nextStatus: null, label: "Update Status", actionType: "update" };
  }
}

// State Transition for Sea Freight
export function getNextStatusSea(currentStatus) {
  switch (currentStatus) {
    case "booking":
      return { nextStatus: "stuffing", label: "Stuffing / Muat Kontainer", actionType: "progress" };
    case "stuffing":
      return { nextStatus: "gate_in_pelabuhan", label: "Masuk Pelabuhan Asal (Gate In)", actionType: "progress" };
    case "gate_in_pelabuhan":
      return { nextStatus: "kapal_berangkat", label: "Kapal Berangkat (ETD)", actionType: "progress" };
    case "kapal_berangkat":
      return { nextStatus: "pelayaran", label: "Update Posisi Pelayaran", actionType: "progress" };
    case "pelayaran":
      return { nextStatus: "kapal_tiba", label: "Kapal Sandar / Tiba Pelabuhan", actionType: "progress" };
    case "kapal_tiba":
      return { nextStatus: "dooring", label: "Pengantaran Darat (Dooring)", actionType: "progress" };
    case "dooring":
      return { nextStatus: "terkirim", label: "Upload Bukti Serah Terima (POD)", actionType: "progress" };
    case "terkirim":
      return { nextStatus: null, label: "Buat Invoice Tagihan", actionType: "navigate_dokumen" };
    case "tertunda":
      return { nextStatus: "pelayaran", label: "Lanjutkan Pelayaran / Dooring", actionType: "progress" };
    case "selesai":
      return { nextStatus: null, label: "Pesanan Selesai", actionType: "finished" };
    default:
      return { nextStatus: null, label: "Update Status", actionType: "update" };
  }
}

// State Transition for Land Freight
export function getNextStatusLand(currentStatus) {
  switch (currentStatus) {
    case "booking":
      return { nextStatus: "pickup", label: "Catat Pickup Barang", actionType: "progress" };
    case "pickup":
      return { nextStatus: "berangkat", label: "Tandai Berangkat", actionType: "progress" };
    case "berangkat":
      return { nextStatus: "dalam_perjalanan", label: "Update Dalam Perjalanan", actionType: "progress" };
    case "dalam_perjalanan":
      return { nextStatus: "tiba", label: "Tandai Tiba di Tujuan", actionType: "progress" };
    case "tiba":
      return { nextStatus: "terkirim", label: "Upload Bukti Serah Terima (POD)", actionType: "progress" };
    case "terkirim":
      return { nextStatus: null, label: "Buat Invoice Tagihan", actionType: "navigate_dokumen" };
    case "tertunda":
      return { nextStatus: "dalam_perjalanan", label: "Lanjutkan Pengiriman", actionType: "progress" };
    case "selesai":
      return { nextStatus: null, label: "Pesanan Selesai", actionType: "finished" };
    default:
      return { nextStatus: null, label: "Update Status", actionType: "update" };
  }
}

test("Air Freight Schema: Validates express air freight data", () => {
  const airOrder = {
    moda_pengiriman: "udara",
    nama_customer: "PT Medika Farma",
    alamat_asal: "Jakarta (Soekarno-Hatta CGK)",
    alamat_tujuan: "Balikpapan (Sepinggan BPN)",
    jenis_barang: "Vaksin & Alat Medis",
    tipe_layanan_udara: "express_urgent",
    bandara_asal: "Bandara Soekarno-Hatta (CGK - Jakarta)",
    bandara_tujuan: "Bandara Sultan Aji Muhammad Sulaiman Sepinggan (BPN - Balikpapan)",
    nama_maskapai: "Garuda Indonesia Cargo",
    nomor_penerbangan: "GA-512",
    nomor_awb: "126-98765432",
    tarif_customer: 12500000,
    biaya_vendor: 9000000,
  };

  const parsed = pesananMultimodalSchema.safeParse(airOrder);
  assert.strictEqual(parsed.success, true);
  if (parsed.success) {
    assert.strictEqual(parsed.data.moda_pengiriman, "udara");
    assert.strictEqual(parsed.data.nomor_awb, "126-98765432");
    assert.strictEqual(parsed.data.nama_maskapai, "Garuda Indonesia Cargo");
  }
});

test("Air Freight State Machine: Full 8-stage air freight lifecycle", () => {
  let status = "booking";

  // booking -> acceptance
  let next = getNextStatusAir(status);
  assert.strictEqual(next.nextStatus, "acceptance_bandara");

  // acceptance -> masuk terminal kargo (SMU)
  status = next.nextStatus;
  next = getNextStatusAir(status);
  assert.strictEqual(next.nextStatus, "masuk_terminal_kargo");

  // terminal kargo -> terbang
  status = next.nextStatus;
  next = getNextStatusAir(status);
  assert.strictEqual(next.nextStatus, "terbang");

  // terbang -> dalam penerbangan
  status = next.nextStatus;
  next = getNextStatusAir(status);
  assert.strictEqual(next.nextStatus, "dalam_penerbangan");

  // dalam penerbangan -> mendarat
  status = next.nextStatus;
  next = getNextStatusAir(status);
  assert.strictEqual(next.nextStatus, "mendarat");

  // mendarat -> delivery udara
  status = next.nextStatus;
  next = getNextStatusAir(status);
  assert.strictEqual(next.nextStatus, "delivery_udara");

  // delivery udara -> terkirim
  status = next.nextStatus;
  next = getNextStatusAir(status);
  assert.strictEqual(next.nextStatus, "terkirim");
});

test("Sea Freight Schema: Validates inter-island sea freight data", () => {
  const seaOrder = {
    moda_pengiriman: "laut",
    nama_customer: "PT Bahari Makmur",
    alamat_asal: "Jakarta (Tanjung Priok)",
    alamat_tujuan: "Makassar (KIMA)",
    jenis_barang: "Pipa Baja & Semen",
    tipe_layanan_laut: "fcl_20ft",
    pelabuhan_asal: "Pelabuhan Tanjung Priok, Jakarta",
    pelabuhan_tujuan: "Pelabuhan Soekarno-Hatta, Makassar",
    nama_kapal: "KM Meratus Makassar V.2608",
    nomor_kontainer: "MRTU-123456-7",
    nomor_seal: "SEAL-998877",
    tarif_customer: 24000000,
    biaya_vendor: 18000000,
  };

  const parsed = pesananMultimodalSchema.safeParse(seaOrder);
  assert.strictEqual(parsed.success, true);
});

test("Land Freight Schema: Validates land trucking data", () => {
  const landOrder = {
    moda_pengiriman: "darat",
    nama_customer: "PT Sinar Harapan",
    alamat_asal: "Cikarang, Bekasi",
    alamat_tujuan: "Semarang, Jawa Tengah",
    jenis_armada_darat: "fuso",
    plat_nomor: "B 9876 DCN",
    tarif_customer: 8500000,
    biaya_vendor: 6000000,
  };

  const parsed = pesananMultimodalSchema.safeParse(landOrder);
  assert.strictEqual(parsed.success, true);
});
