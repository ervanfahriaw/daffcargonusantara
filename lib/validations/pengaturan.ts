import { z } from "zod";

export const companyProfileSchema = z.object({
  nama_perusahaan: z
    .string()
    .min(2, "Nama perusahaan minimal 2 karakter.")
    .max(100, "Nama perusahaan maksimal 100 karakter."),
  alamat: z
    .string()
    .min(5, "Alamat kantor minimal 5 karakter.")
    .max(255, "Alamat kantor maksimal 255 karakter."),
  npwp: z.string().max(30, "NPWP maksimal 30 karakter.").optional(),
  telepon: z.string().max(30, "Nomor telepon kantor maksimal 30 karakter.").optional(),
  email: z.string().email("Format email kantor tidak valid.").optional().or(z.literal("")),
  bank_name: z.string().max(100, "Nama bank maksimal 100 karakter.").optional(),
  bank_account: z.string().max(50, "Nomor rekening maksimal 50 karakter.").optional(),
  bank_holder: z.string().max(100, "Nama pemilik rekening maksimal 100 karakter.").optional(),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Kata sandi baru minimal 6 karakter."),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi kata sandi minimal 6 karakter."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok.",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
