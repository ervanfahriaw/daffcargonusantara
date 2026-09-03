import { z } from "zod";

export const jenisDokumenEnum = z.enum([
  "surat_jalan",
  "invoice",
  "cost_sheet",
  "pod",
]);

export type JenisDokumen = z.infer<typeof jenisDokumenEnum>;

export const manualDocumentSchema = z.object({
  jenis: jenisDokumenEnum,
  pesanan_id: z.string().optional().nullable().or(z.literal("")),
  nomor_dokumen: z.string().min(1, "Nomor dokumen wajib diisi").trim(),
  nama_customer: z.string().min(1, "Nama customer/klien wajib diisi").trim(),
  nomor_telepon_customer: z.string().optional().nullable().or(z.literal("")),
  alamat_asal: z.string().optional().nullable().or(z.literal("")),
  alamat_tujuan: z.string().optional().nullable().or(z.literal("")),
  tanggal_dokumen: z.string().optional().nullable().or(z.literal("")),

  // Spesifikasi barang / muatan
  jenis_barang: z.string().optional().nullable().or(z.literal("")),
  berat: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().min(0).nullable().optional()
  ),
  volume: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().min(0).nullable().optional()
  ),
  jumlah_koli: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().int().min(0).nullable().optional()
  ),
  catatan_muatan: z.string().optional().nullable().or(z.literal("")),

  // Armada & Supir
  jenis_armada: z.string().optional().nullable().or(z.literal("")),
  plat_nomor: z.string().optional().nullable().or(z.literal("")),
  supir_nama: z.string().optional().nullable().or(z.literal("")),
  vendor_nama: z.string().optional().nullable().or(z.literal("")),

  // Finansial
  tarif_customer: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().min(0).default(0)
  ),
  biaya_vendor: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().min(0).default(0)
  ),
  biaya_lainnya: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().min(0).default(0)
  ),

  // POD Khusus
  penerima_nama: z.string().optional().nullable().or(z.literal("")),
  catatan_kondisi: z.string().optional().nullable().or(z.literal("")),

  // Invoice Khusus
  nomor_rekening: z.string().optional().nullable().or(z.literal("")),
});

export type ManualDocumentInput = z.infer<typeof manualDocumentSchema>;
