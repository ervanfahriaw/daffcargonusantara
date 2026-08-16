"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  companyProfileSchema,
  changePasswordSchema,
  type CompanyProfileInput,
  type ChangePasswordInput,
} from "@/lib/validations/pengaturan";

export type PengaturanActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function updatePengaturanAction(
  data: CompanyProfileInput
): Promise<PengaturanActionResult> {
  try {
    const validated = companyProfileSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "Data profil tidak valid.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Sesi login berakhir. Silakan login kembali.",
      };
    }

    // Ambil data pengaturan yang ada (ambil record pertama jika ada)
    const { data: existing } = await supabase
      .from("pengaturan")
      .select("id")
      .limit(1)
      .single();

    const payload = {
      nama_perusahaan: validated.data.nama_perusahaan.trim(),
      alamat: validated.data.alamat.trim(),
      npwp: validated.data.npwp?.trim() || null,
      telepon: validated.data.telepon?.trim() || null,
      email: validated.data.email?.trim() || null,
      bank_name: validated.data.bank_name?.trim() || "Bank Central Asia (BCA)",
      bank_account: validated.data.bank_account?.trim() || null,
      bank_holder: validated.data.bank_holder?.trim() || validated.data.nama_perusahaan.trim(),
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("pengaturan")
        .update(payload)
        .eq("id", existing.id);

      if (updateError) {
        console.error("Gagal update pengaturan:", updateError);
        return {
          success: false,
          error: "Gagal memperbarui pengaturan di database.",
        };
      }
    } else {
      const { error: insertError } = await supabase
        .from("pengaturan")
        .insert(payload);

      if (insertError) {
        console.error("Gagal insert pengaturan:", insertError);
        return {
          success: false,
          error: "Gagal menyimpan pengaturan baru ke database.",
        };
      }
    }

    revalidatePath("/pengaturan");
    revalidatePath("/pesanan");
    revalidatePath("/");

    return {
      success: true,
      message: "Profil perusahaan & rekening invoice berhasil diperbarui.",
    };
  } catch (err) {
    console.error("Error updatePengaturanAction:", err);
    return {
      success: false,
      error: "Terjadi kesalahan server saat menyimpan pengaturan.",
    };
  }
}

export async function changePasswordAction(
  data: ChangePasswordInput
): Promise<PengaturanActionResult> {
  try {
    const validated = changePasswordSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error:
          validated.error.issues[0]?.message || "Konfirmasi sandi tidak valid.",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: validated.data.newPassword,
    });

    if (error) {
      console.error("Gagal update password:", error);
      return {
        success: false,
        error: error.message || "Gagal mengubah kata sandi.",
      };
    }

    return {
      success: true,
      message: "Kata sandi akun Anda berhasil diperbarui.",
    };
  } catch (err) {
    console.error("Error changePasswordAction:", err);
    return {
      success: false,
      error: "Terjadi kesalahan server saat memperbarui kata sandi.",
    };
  }
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
