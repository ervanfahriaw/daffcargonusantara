"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

import {
  type StatusPembayaran,
  statusPembayaranConfig,
} from "@/lib/types/keuangan";

export type { StatusPembayaran };

export type UpdateKeuanganResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function updateKeuanganPesananAction(
  pesananId: string,
  data: {
    tarif_customer: number;
    biaya_vendor: number;
    biaya_lainnya: number;
  }
): Promise<UpdateKeuanganResult> {
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

    // 2. Update rincian biaya di tabel pesanan
    const { error: updateError } = await supabase
      .from("pesanan")
      .update({
        tarif_customer: Math.max(0, data.tarif_customer || 0),
        biaya_vendor: Math.max(0, data.biaya_vendor || 0),
        biaya_lainnya: Math.max(0, data.biaya_lainnya || 0),
        updated_at: new Date().toISOString(),
      })
      .eq("id", pesananId);

    if (updateError) {
      console.error("Gagal update biaya pesanan:", updateError);
      return {
        success: false,
        error: "Gagal memperbarui rincian biaya di database.",
      };
    }

    // 3. Revalidasi cache
    try {
      revalidatePath(`/pesanan/${pesananId}`);
      revalidatePath("/pesanan");
      revalidatePath("/");
    } catch (revErr) {
      console.warn("Notice: Revalidation notice:", revErr);
    }

    return {
      success: true,
      message: "Rincian biaya pesanan berhasil diperbarui.",
    };
  } catch (err: any) {
    console.error("Error updateKeuanganPesananAction:", err);
    return {
      success: false,
      error: err?.message || "Terjadi kesalahan server saat memperbarui biaya.",
    };
  }
}

export async function updateStatusPembayaranAction(
  pesananId: string,
  newStatus: StatusPembayaran,
  catatan?: string
): Promise<UpdateKeuanganResult> {
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

    // 2. Ambil data pesanan saat ini
    const { data: pesanan } = await supabase
      .from("pesanan")
      .select("status, status_pembayaran")
      .eq("id", pesananId)
      .single();

    // 3. Update status pembayaran
    const updatePayload: Record<string, any> = {
      status_pembayaran: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Jika ditandai lunas dan kargo sudah terkirim, selesaikan pesanan
    let autoFinished = false;
    if (newStatus === "lunas" && pesanan?.status === "terkirim") {
      updatePayload.status = "selesai";
      autoFinished = true;
    }

    const { error: updateError } = await supabase
      .from("pesanan")
      .update(updatePayload)
      .eq("id", pesananId);

    if (updateError) {
      console.error("Gagal update status pembayaran:", updateError);
      return {
        success: false,
        error: "Gagal memperbarui status pembayaran di database.",
      };
    }

    // 4. Jika auto-finished, log ke riwayat status
    if (autoFinished) {
      try {
        await supabase.from("riwayat_status").insert({
          pesanan_id: pesananId,
          status: "selesai",
          catatan: "Tagihan lunas diterima, seluruh operasional pesanan selesai.",
        });
      } catch (histErr) {
        console.warn("Notice: Gagal insert status selesai:", histErr);
      }
    }

    // 5. Revalidasi cache
    try {
      revalidatePath(`/pesanan/${pesananId}`);
      revalidatePath("/pesanan");
      revalidatePath("/");
    } catch (revErr) {
      console.warn("Notice: Revalidation notice:", revErr);
    }

    const label = statusPembayaranConfig[newStatus]?.label || newStatus;
    return {
      success: true,
      message: `Status pembayaran berhasil diperbarui ke ${label}.`,
    };
  } catch (err: any) {
    console.error("Error updateStatusPembayaranAction:", err);
    return {
      success: false,
      error: err?.message || "Terjadi kesalahan server saat memperbarui status pembayaran.",
    };
  }
}
