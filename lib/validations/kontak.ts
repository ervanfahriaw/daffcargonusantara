import { z } from "zod";

export const kategoriKontakValues = [
  "customer",
  "vendor_trucking",
  "supir",
  "pelayaran",
  "maskapai",
  "depo_port",
] as const;

export type KategoriKontak = (typeof kategoriKontakValues)[number];

export const kategoriKontakLabels: Record<KategoriKontak, string> = {
  customer: "Customer",
  vendor_trucking: "Vendor Trucking",
  supir: "Supir / Driver / Kurir",
  pelayaran: "Pelayaran (Carrier Laut)",
  maskapai: "Maskapai / Cargo Agent (Udara)",
  depo_port: "Depo / Port / Terminal Kargo",
};

export const kategoriKontakStyles: Record<
  KategoriKontak,
  { bg: string; text: string; border: string }
> = {
  customer: {
    bg: "bg-[var(--color-surface-tint)]",
    text: "text-[var(--color-primary)]",
    border: "border-[var(--color-primary)]/20",
  },
  vendor_trucking: {
    bg: "bg-[#F3F4F6]",
    text: "text-[var(--color-navy-900)]",
    border: "border-[var(--color-border)]",
  },
  supir: {
    bg: "bg-[var(--color-teal-100)]",
    text: "text-[var(--color-teal-500)]",
    border: "border-[var(--color-teal-500)]/20",
  },
  pelayaran: {
    bg: "bg-[#E0F2FE]",
    text: "text-[#0369A1]",
    border: "border-[#BAE6FD]",
  },
  maskapai: {
    bg: "bg-[#F3E8FF]",
    text: "text-[#7E22CE]",
    border: "border-[#E9D5FF]",
  },
  depo_port: {
    bg: "bg-[#FEF3C7]",
    text: "text-[#D97706]",
    border: "border-[#FDE68A]",
  },
};

export const kontakSchema = z.object({
  nama: z
    .string()
    .min(2, "Nama kontak minimal 2 karakter.")
    .max(100, "Nama kontak maksimal 100 karakter."),
  kategori: z.enum(kategoriKontakValues, {
    error: "Pilih salah satu kategori kontak.",
  }),
  perusahaan: z.string().max(100, "Nama perusahaan terlalu panjang.").optional(),
  nomor_telepon: z
    .string()
    .min(6, "Nomor telepon/WA minimal 6 angka.")
    .max(25, "Nomor telepon terlalu panjang.")
    .regex(/^[0-9+\s\-()]+$/, "Format nomor telepon tidak valid."),
  catatan: z.string().max(500, "Catatan maksimal 500 karakter.").optional(),
});

export type KontakFormInput = z.infer<typeof kontakSchema>;
