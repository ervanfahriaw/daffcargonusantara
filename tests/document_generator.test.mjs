import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { jenisDokumenLabels } from "../lib/types/dokumen.ts";
import { manualDocumentSchema } from "../lib/validations/dokumen.ts";
import { generateDocumentShareMessage } from "../lib/services/waNotificationService.js";

test("Dokumen Types & Labels: Memastikan 4 dokumen resmi terdaftar", () => {
  assert.strictEqual(jenisDokumenLabels.surat_jalan, "Surat Jalan");
  assert.strictEqual(jenisDokumenLabels.invoice, "Invoice");
  assert.strictEqual(jenisDokumenLabels.cost_sheet, "Rincian Biaya (Cost Sheet)");
  assert.strictEqual(jenisDokumenLabels.pod, "Bukti Serah Terima (POD)");
});

test("Isolasi UI Detail Pesanan: Pastikan tombol generate dihilangkan dari DocumentCard", () => {
  const cardFilePath = path.resolve("./components/document/DocumentCard.tsx");
  const cardCode = fs.readFileSync(cardFilePath, "utf8");

  // Harus TIDAK ADA tombol "Buat Dokumen" atau "Generate Ulang"
  assert.strictEqual(
    cardCode.includes("handleStartGenerate"),
    false,
    "handleStartGenerate harus dihapus dari DocumentCard.tsx"
  );
  assert.strictEqual(
    cardCode.includes("Generate Ulang PDF"),
    false,
    "Tombol Generate Ulang PDF harus dihapus dari DocumentCard.tsx"
  );

  // Harus TETAP ADA tombol Lihat PDF dan Bagikan ke WhatsApp
  assert.strictEqual(
    cardCode.includes("Lihat PDF"),
    true,
    "Tombol Lihat PDF harus tetap ada"
  );
  assert.strictEqual(
    cardCode.includes("Bagikan ke WhatsApp"),
    true,
    "Tombol Bagikan ke WhatsApp harus tetap ada"
  );
  assert.strictEqual(
    cardCode.includes("Unduh PDF"),
    true,
    "Tombol Unduh PDF harus tersedia"
  );
});

test("Manual Document Schema: Validasi data Surat Jalan manual", () => {
  const validSJ = {
    jenis: "surat_jalan",
    nomor_dokumen: "SJ-2026-001",
    nama_customer: "PT Maju Logistik",
    alamat_asal: "Cakung, Jakarta Timur",
    alamat_tujuan: "Cikarang, Bekasi",
    jenis_barang: "Sparepart Mesin",
    berat: 2500,
    jumlah_koli: 10,
    plat_nomor: "B 9123 XYZ",
    supir_nama: "Bambang",
    tanggal_dokumen: "2026-09-04",
  };

  const parsed = manualDocumentSchema.safeParse(validSJ);
  assert.strictEqual(parsed.success, true);
});

test("Manual Document Schema: Validasi data Invoice manual & kalkulasi total", () => {
  const validInvoice = {
    jenis: "invoice",
    nomor_dokumen: "INV-2026-089",
    nama_customer: "CV Sentosa Cargo",
    alamat_asal: "Pelabuhan Tanjung Priok",
    alamat_tujuan: "Gudang Karawang",
    tarif_customer: 7500000,
    biaya_lainnya: 500000,
    tanggal_dokumen: "2026-09-04",
  };

  const parsed = manualDocumentSchema.safeParse(validInvoice);
  assert.strictEqual(parsed.success, true);
  if (parsed.success) {
    const total = (parsed.data.tarif_customer || 0) + (parsed.data.biaya_lainnya || 0);
    assert.strictEqual(total, 8000000);
  }
});

test("Manual Document Schema: Validasi data Cost Sheet & hitung margin", () => {
  const validCostSheet = {
    jenis: "cost_sheet",
    nomor_dokumen: "CS-2026-089",
    nama_customer: "PT Surya Abadi",
    alamat_asal: "Surabaya",
    alamat_tujuan: "Banjarmasin",
    tarif_customer: 15000000,
    biaya_vendor: 11000000,
    biaya_lainnya: 1000000,
    tanggal_dokumen: "2026-09-04",
  };

  const parsed = manualDocumentSchema.safeParse(validCostSheet);
  assert.strictEqual(parsed.success, true);
  if (parsed.success) {
    const margin = (parsed.data.tarif_customer || 0) - (parsed.data.biaya_vendor || 0) - (parsed.data.biaya_lainnya || 0);
    assert.strictEqual(margin, 3000000);
  }
});

test("Manual Document Schema: Menolak jika nama customer kosong", () => {
  const invalidDoc = {
    jenis: "surat_jalan",
    nama_customer: "",
  };

  const parsed = manualDocumentSchema.safeParse(invalidDoc);
  assert.strictEqual(parsed.success, false);
});

test("WhatsApp Share: Menghasilkan pesan share dokumen manual yang rapi", () => {
  const msg = generateDocumentShareMessage(
    {
      id: "manual-doc-123",
      nomor_pesanan: "SJ-MANUAL-001",
      nama_customer: "PT Berkah Jaya",
      alamat_asal: "Jakarta",
      alamat_tujuan: "Semarang",
    },
    "surat_jalan",
    "https://project-two-lovat-41.vercel.app/api/documents/manual/preview"
  );

  assert.match(msg, /SURAT JALAN/i);
  assert.match(msg, /PT Berkah Jaya/);
  assert.match(msg, /Jakarta/);
  assert.match(msg, /Semarang/);
});
