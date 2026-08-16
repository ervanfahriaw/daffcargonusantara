"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { kontakSchema, type KontakFormInput } from "@/lib/validations/kontak";

export type KontakActionResult =
  | { success: true; message: string; contactId?: string }
  | { success: false; error: string };

export async function createKontakAction(
  data: KontakFormInput
): Promise<KontakActionResult> {
  try {
    const validated = kontakSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Data kontak tidak valid.",
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

    const { data: inserted, error: insertError } = await supabase
      .from("kontak")
      .insert({
        user_id: user.id,
        nama: validated.data.nama.trim(),
        kategori: validated.data.kategori,
        perusahaan: validated.data.perusahaan?.trim() || null,
        nomor_telepon: validated.data.nomor_telepon.trim(),
        catatan: validated.data.catatan?.trim() || null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Gagal simpan kontak:", insertError);
      return {
        success: false,
        error: "Gagal menyimpan data kontak ke database.",
      };
    }

    try {
      revalidatePath("/kontak");
      revalidatePath("/pesanan/baru");
    } catch (revErr) {
      console.warn("Notice: Revalidation notice:", revErr);
    }

    return {
      success: true,
      message: `Kontak "${validated.data.nama}" berhasil disimpan.`,
      contactId: inserted?.id,
    };
  } catch (err: any) {
    console.error("Error createKontakAction:", err);
    return {
      success: false,
      error: err?.message || "Terjadi kesalahan server saat menyimpan kontak.",
    };
  }
}

export async function updateKontakAction(
  id: string,
  data: KontakFormInput
): Promise<KontakActionResult> {
  try {
    const validated = kontakSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Data kontak tidak valid.",
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

    const { error: updateError } = await supabase
      .from("kontak")
      .update({
        nama: validated.data.nama.trim(),
        kategori: validated.data.kategori,
        perusahaan: validated.data.perusahaan?.trim() || null,
        nomor_telepon: validated.data.nomor_telepon.trim(),
        catatan: validated.data.catatan?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Gagal update kontak:", updateError);
      return {
        success: false,
        error: "Gagal memperbarui data kontak.",
      };
    }

    try {
      revalidatePath("/kontak");
      revalidatePath("/pesanan/baru");
    } catch (revErr) {
      console.warn("Notice: Revalidation notice:", revErr);
    }

    return {
      success: true,
      message: `Kontak "${validated.data.nama}" berhasil diperbarui.`,
    };
  } catch (err: any) {
    console.error("Error updateKontakAction:", err);
    return {
      success: false,
      error: err?.message || "Terjadi kesalahan server saat memperbarui kontak.",
    };
  }
}

export async function deleteKontakAction(
  id: string
): Promise<KontakActionResult> {
  try {
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

    const { error: deleteError } = await supabase
      .from("kontak")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Gagal hapus kontak:", deleteError);
      return {
        success: false,
        error: "Gagal menghapus kontak.",
      };
    }

    try {
      revalidatePath("/kontak");
      revalidatePath("/pesanan/baru");
    } catch (revErr) {
      console.warn("Notice: Revalidation notice:", revErr);
    }

    return {
      success: true,
      message: "Kontak berhasil dihapus.",
    };
  } catch (err: any) {
    console.error("Error deleteKontakAction:", err);
    return {
      success: false,
      error: err?.message || "Terjadi kesalahan server saat menghapus kontak.",
    };
  }
}
