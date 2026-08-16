"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type LinkKontakResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function linkKontakPesananAction(
  pesananId: string,
  payload: {
    kontak_customer_id?: string | null;
    vendor_trucking_id?: string | null;
    supir_id?: string | null;
  }
): Promise<LinkKontakResult> {
  try {
    const supabase = await createClient();

    // 1. Cek otentikasi user
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

    // 2. Update foreign key kontak di tabel pesanan
    const { error: updateError } = await supabase
      .from("pesanan")
      .update({
        kontak_customer_id: payload.kontak_customer_id || null,
        vendor_trucking_id: payload.vendor_trucking_id || null,
        supir_id: payload.supir_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pesananId);

    if (updateError) {
      console.error("Gagal link kontak pesanan:", updateError);
      return {
        success: false,
        error: "Gagal menghubungkan kontak di database.",
      };
    }

    // 3. Revalidasi cache
    revalidatePath(`/pesanan/${pesananId}`);
    revalidatePath("/pesanan");

    return {
      success: true,
      message: "Kontak terkait pesanan berhasil diperbarui.",
    };
  } catch (err) {
    console.error("Error linkKontakPesananAction:", err);
    return {
      success: false,
      error: "Terjadi kesalahan server saat memperbarui kontak.",
    };
  }
}
