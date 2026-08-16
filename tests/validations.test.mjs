import test from "node:test";
import assert from "node:assert";
import { z } from "zod";

// Replicate or import Zod schemas
const pesananSchema = z.object({
  nama_customer: z.string().min(1, { message: "Nama customer wajib diisi" }).trim(),
  kontak_customer_id: z.string().uuid().optional().nullable().or(z.literal("")),
  nomor_telepon_customer: z.string().optional().nullable().or(z.literal("")),
  alamat_asal: z.string().min(1, { message: "Alamat asal (pickup) wajib diisi" }).trim(),
  alamat_tujuan: z.string().min(1, { message: "Alamat tujuan pengiriman wajib diisi" }).trim(),
  jenis_barang: z.string().optional().nullable().or(z.literal("")),
  berat: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().min(0, "Berat tidak boleh negatif").nullable().optional()
  ),
  volume: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().min(0, "Volume tidak boleh negatif").nullable().optional()
  ),
  jumlah_koli: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().int().min(0, "Jumlah koli tidak boleh negatif").nullable().optional()
  ),
  catatan_muatan: z.string().optional().nullable().or(z.literal("")),
  jenis_armada: z.enum(["cdd", "fuso", "wingbox", "trailer", "lowbed", "lainnya"]).optional().nullable().or(z.literal("")),
  vendor_trucking_id: z.string().uuid().optional().nullable().or(z.literal("")),
  supir_id: z.string().uuid().optional().nullable().or(z.literal("")),
  plat_nomor: z.string().optional().nullable().or(z.literal("")),
  estimasi_berangkat: z.string().optional().nullable().or(z.literal("")),
  tarif_customer: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0, "Tarif customer tidak boleh negatif").default(0)
  ),
  biaya_vendor: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0, "Biaya vendor tidak boleh negatif").default(0)
  ),
  biaya_lainnya: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0, "Biaya lainnya tidak boleh negatif").default(0)
  ),
});

const kontakFormSchema = z.object({
  nama: z.string().min(1, { message: "Nama kontak wajib diisi" }).trim(),
  kategori: z.enum(["customer", "vendor_trucking", "supir", "internal"]),
  perusahaan: z.string().optional().nullable(),
  nomor_telepon: z
    .string()
    .min(6, { message: "Nomor telepon minimal 6 karakter" })
    .regex(/^[0-9+\-\s()]+$/, { message: "Nomor telepon hanya boleh berisi angka dan tanda +" })
    .trim(),
  catatan: z.string().optional().nullable(),
});

test("Pesanan schema: valid input passes validation", () => {
  const validData = {
    nama_customer: "PT Berkah Jaya",
    alamat_asal: "Jakarta Utara",
    alamat_tujuan: "Surabaya",
    jenis_barang: "Peralatan Mesin",
    berat: 500,
    tarif_customer: 15000000,
    biaya_vendor: 10000000,
  };

  const result = pesananSchema.safeParse(validData);
  assert.strictEqual(result.success, true);
});

test("Pesanan schema: missing required fields fails validation", () => {
  const invalidData = {
    nama_customer: "",
    alamat_asal: "",
    alamat_tujuan: "",
  };

  const result = pesananSchema.safeParse(invalidData);
  assert.strictEqual(result.success, false);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    assert.ok(errors.nama_customer);
    assert.ok(errors.alamat_asal);
    assert.ok(errors.alamat_tujuan);
  }
});

test("Pesanan schema: negative amounts fail validation", () => {
  const invalidData = {
    nama_customer: "PT Berkah Jaya",
    alamat_asal: "Jakarta",
    alamat_tujuan: "Bandung",
    tarif_customer: -5000,
  };

  const result = pesananSchema.safeParse(invalidData);
  assert.strictEqual(result.success, false);
});

test("Kontak schema: valid phone formats pass validation", () => {
  const validPhones = ["08123456789", "+6281234567890", "0812-3456-7890", "021 555 1234"];
  for (const phone of validPhones) {
    const result = kontakFormSchema.safeParse({
      nama: "Budi Santoso",
      kategori: "supir",
      nomor_telepon: phone,
    });
    assert.strictEqual(result.success, true, `Phone ${phone} should be valid`);
  }
});

test("Kontak schema: invalid phone formats fail validation", () => {
  const invalidPhones = ["abcde", "123", "0812@#$"];
  for (const phone of invalidPhones) {
    const result = kontakFormSchema.safeParse({
      nama: "Budi Santoso",
      kategori: "supir",
      nomor_telepon: phone,
    });
    assert.strictEqual(result.success, false, `Phone ${phone} should be invalid`);
  }
});
