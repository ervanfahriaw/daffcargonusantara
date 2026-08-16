"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pesananSchema, type PesananInput } from "@/lib/validations/pesanan";
import { type StatusPesanan } from "@/components/shipment/StatusBadge";
import { generateDailyProgressUpdate } from "@/lib/services/waNotificationService";

const statusLabels: Record<StatusPesanan, string> = {
  booking: "Booking",
  // Darat
  pickup: "Pickup",
  berangkat: "Berangkat",
  dalam_perjalanan: "Dalam Perjalanan",
  tiba: "Tiba di Tujuan",
  // Laut
  stuffing: "Stuffing / Muat Kontainer",
  gate_in_pelabuhan: "Masuk Pelabuhan (Gate In)",
  kapal_berangkat: "Kapal Berangkat (ETD)",
  pelayaran: "Pelayaran Laut",
  kapal_tiba: "Kapal Sandar / Tiba (ETA)",
  dooring: "Pengantaran Dooring",
  // Udara
  acceptance_bandara: "Acceptance Bandara / RA",
  masuk_terminal_kargo: "Terbit SMU / Terminal Kargo",
  terbang: "Pesawat Lepas Landas (ETD)",
  dalam_penerbangan: "Dalam Penerbangan Udara",
  mendarat: "Pesawat Mendarat (ETA)",
  delivery_udara: "Pengantaran Kurir Bandara",
  // Final
  terkirim: "Terkirim",
  tertunda: "Tertunda",
  selesai: "Selesai",
};

export type CreatePesananResult =
  | { success: true; data: { id: string; nomor_pesanan: string } }
  | { success: false; error: string; errors?: Record<string, string[]> };

export async function createPesananAction(
  rawInput: PesananInput
): Promise<CreatePesananResult> {
  try {
    // 1. Validasi input dengan Zod
    const validationResult = pesananSchema.safeParse(rawInput);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      return {
        success: false,
        error: "Ada data yang belum lengkap. Cek kembali, ya.",
        errors: fieldErrors as Record<string, string[]>,
      };
    }

    const data = validationResult.data;
    const supabase = await createClient();

    // 2. Ambil user yang sedang login
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

    // 3. Generate nomor pesanan unik: DCN-YYYYMM-XXXX
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prefix = `DCN-${yearMonth}-`;

    let nextNumber = 1;
    try {
      const { data: latestPesanan } = await supabase
        .from("pesanan")
        .select("nomor_pesanan")
        .ilike("nomor_pesanan", `${prefix}%`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (latestPesanan && latestPesanan.length > 0) {
        const lastCode = latestPesanan[0].nomor_pesanan;
        const parts = lastCode.split("-");
        if (parts.length === 3) {
          const parsed = parseInt(parts[2], 10);
          if (!isNaN(parsed)) {
            nextNumber = parsed + 1;
          }
        }
      }
    } catch {
      nextNumber = 1;
    }

    const nomorPesanan = `${prefix}${String(nextNumber).padStart(4, "0")}`;

    // 4. Sanitasi foreign keys & optional fields
    let kontakCustomerId = data.kontak_customer_id && data.kontak_customer_id.trim() !== ""
      ? data.kontak_customer_id
      : null;

    if (!kontakCustomerId && data.nomor_telepon_customer && data.nama_customer) {
      try {
        const { data: newContact } = await supabase
          .from("kontak")
          .insert({
            user_id: user.id,
            nama: data.nama_customer.trim(),
            kategori: "customer",
            nomor_telepon: data.nomor_telepon_customer.trim(),
          })
          .select("id")
          .single();

        if (newContact) {
          kontakCustomerId = newContact.id;
        }
      } catch (err) {
        console.warn("Notice: Gagal auto-create kontak customer:", err);
      }
    }

    const vendorTruckingId = data.vendor_trucking_id && data.vendor_trucking_id.trim() !== ""
      ? data.vendor_trucking_id
      : null;

    const supirId = data.supir_id && data.supir_id.trim() !== ""
      ? data.supir_id
      : null;

    const jenisArmadaVal = data.jenis_armada && data.jenis_armada.trim() !== ""
      ? data.jenis_armada
      : "lainnya";

    // Format tanggal berangkat
    let estimasiBerangkatVal: string | null = null;
    if (data.estimasi_berangkat && data.estimasi_berangkat.trim() !== "") {
      try {
        const d = new Date(data.estimasi_berangkat);
        if (!isNaN(d.getTime())) {
          estimasiBerangkatVal = d.toISOString().split("T")[0];
        }
      } catch {}
    }

    // Format metadata catatan muatan untuk scope (D2D/D2P/P2D/P2P) & moda laut / udara / darat
    let finalCatatan = data.catatan_muatan?.trim() || "";
    const scopeTag = `[SCOPE: ${(data.jenis_pengiriman || "d2d").toUpperCase()}]`;

    if (data.moda_pengiriman === "laut") {
      const seaParts = [
        `[MODA: LAUT ANTARPULAU]`,
        scopeTag,
        data.tipe_layanan_laut ? `Layanan: ${data.tipe_layanan_laut.toUpperCase()}` : null,
        data.pelabuhan_asal ? `POL: ${data.pelabuhan_asal}` : null,
        data.pelabuhan_tujuan ? `POD: ${data.pelabuhan_tujuan}` : null,
        data.nama_kapal ? `Kapal: ${data.nama_kapal}` : null,
        data.nomor_kontainer ? `Kontainer: ${data.nomor_kontainer}` : null,
        data.nomor_seal ? `Seal: ${data.nomor_seal}` : null,
        data.estimasi_tiba ? `ETA: ${data.estimasi_tiba}` : null,
      ].filter(Boolean);

      const seaHeader = seaParts.join(" | ");
      finalCatatan = finalCatatan ? `${seaHeader}\n${finalCatatan}` : seaHeader;
    } else if (data.moda_pengiriman === "udara") {
      const airParts = [
        `[MODA: UDARA AIR FREIGHT]`,
        scopeTag,
        data.tipe_layanan_udara ? `Layanan: ${data.tipe_layanan_udara.toUpperCase()}` : null,
        data.bandara_asal ? `Origin: ${data.bandara_asal}` : null,
        data.bandara_tujuan ? `Dest: ${data.bandara_tujuan}` : null,
        data.nama_maskapai ? `Airlines: ${data.nama_maskapai}` : null,
        data.nomor_penerbangan ? `Flight: ${data.nomor_penerbangan}` : null,
        data.nomor_awb ? `SMU/AWB: ${data.nomor_awb}` : null,
        data.estimasi_tiba ? `ETA: ${data.estimasi_tiba}` : null,
      ].filter(Boolean);

      const airHeader = airParts.join(" | ");
      finalCatatan = finalCatatan ? `${airHeader}\n${finalCatatan}` : airHeader;
    } else {
      // Darat
      const landParts = [`[MODA: DARAT TRUCKING]`, scopeTag];
      const landHeader = landParts.join(" | ");
      finalCatatan = finalCatatan ? `${landHeader}\n${finalCatatan}` : landHeader;
    }

    // 5. Simpan ke tabel pesanan
    const insertPayload: Record<string, any> = {
      nomor_pesanan: nomorPesanan,
      user_id: user.id,
      nama_customer: data.nama_customer.trim(),
      kontak_customer_id: kontakCustomerId,
      alamat_asal: data.alamat_asal.trim(),
      alamat_tujuan: data.alamat_tujuan.trim(),
      jenis_barang: data.jenis_barang?.trim() || null,
      berat: data.berat !== null && data.berat !== undefined ? Number(data.berat) : null,
      volume: data.volume !== null && data.volume !== undefined ? Number(data.volume) : null,
      jumlah_koli: data.jumlah_koli !== null && data.jumlah_koli !== undefined ? Math.round(Number(data.jumlah_koli)) : null,
      catatan_muatan: finalCatatan || null,
      jenis_armada: jenisArmadaVal,
      vendor_trucking_id: vendorTruckingId,
      supir_id: supirId,
      plat_nomor:
        data.plat_nomor?.trim() ||
        data.nomor_kontainer?.trim() ||
        data.nomor_awb?.trim() ||
        null,
      estimasi_berangkat: estimasiBerangkatVal,
      tarif_customer: Math.max(0, Number(data.tarif_customer) || 0),
      biaya_vendor: Math.max(0, Number(data.biaya_vendor) || 0),
      biaya_lainnya: Math.max(0, Number(data.biaya_lainnya) || 0),
      status: "booking" as const,
      status_pembayaran: "belum_ditagih" as const,
    };

    const { data: newPesanan, error: insertError } = await supabase
      .from("pesanan")
      .insert(insertPayload)
      .select("id, nomor_pesanan")
      .single();

    if (insertError || !newPesanan) {
      console.error("Gagal insert pesanan ke Supabase:", insertError);
      return {
        success: false,
        error: insertError?.message
          ? `Gagal menyimpan: ${insertError.message}`
          : "Gagal menyimpan pesanan ke database. Pastikan tabel database telah di-inisialisasi.",
      };
    }

    // 6. Catat milestone awal ke riwayat_status
    try {
      await supabase.from("riwayat_status").insert({
        pesanan_id: newPesanan.id,
        status: "booking",
        catatan:
          data.moda_pengiriman === "udara"
            ? "Booking Air Freight (SMU) dibuat"
            : data.moda_pengiriman === "laut"
            ? "Booking Sea Freight (Antarpulau) dibuat"
            : "Booking Trucking Darat dibuat",
      });
    } catch (histErr) {
      console.warn("Notice: Gagal insert riwayat status awal:", histErr);
    }

    // 7. Revalidasi halaman
    try {
      revalidatePath("/");
      revalidatePath("/pesanan");
    } catch (revErr) {
      console.warn("Notice: Revalidation notice:", revErr);
    }

    return {
      success: true,
      data: {
        id: newPesanan.id,
        nomor_pesanan: newPesanan.nomor_pesanan,
      },
    };
  } catch (err: any) {
    console.error("Error createPesananAction:", err);
    return {
      success: false,
      error: err?.message || "Terjadi kesalahan pada server. Silakan coba lagi.",
    };
  }
}

export type UpdateStatusResult =
  | { success: true; newStatus: StatusPesanan; message: string; waSent?: boolean; waRecipient?: string }
  | { success: false; error: string };

export function mapToDatabaseStatus(status: StatusPesanan): string {
  switch (status) {
    case "stuffing":
    case "gate_in_pelabuhan":
    case "acceptance_bandara":
    case "masuk_terminal_kargo":
      return "pickup";
    case "kapal_berangkat":
    case "terbang":
      return "berangkat";
    case "pelayaran":
    case "dalam_penerbangan":
    case "dooring":
    case "delivery_udara":
      return "dalam_perjalanan";
    case "kapal_tiba":
    case "mendarat":
      return "tiba";
    default:
      return status;
  }
}

export async function updateStatusPesananAction(
  pesananId: string,
  newStatus: StatusPesanan,
  catatan?: string
): Promise<UpdateStatusResult> {
  try {
    const supabase = await createClient();

    // 1. Cek autentikasi user
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

    // 2. Update status di tabel pesanan dengan mekanisme fallback enum Supabase
    let updateError: any = null;
    let effectiveDbStatus = newStatus as string;

    const firstAttempt = await supabase
      .from("pesanan")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pesananId);

    if (firstAttempt.error) {
      if (firstAttempt.error.code === "22P02") {
        // Fallback untuk database yang memiliki enum base
        effectiveDbStatus = mapToDatabaseStatus(newStatus);

        const { data: currentP } = await supabase
          .from("pesanan")
          .select("catatan_muatan")
          .eq("id", pesananId)
          .single();

        const cleanCatatan = (currentP?.catatan_muatan || "")
          .replace(/\[MILESTONE:[^\]]+\]/g, "")
          .trim();
        const updatedCatatan = cleanCatatan
          ? `${cleanCatatan}\n[MILESTONE:${newStatus}]`
          : `[MILESTONE:${newStatus}]`;

        const fallbackAttempt = await supabase
          .from("pesanan")
          .update({
            status: effectiveDbStatus,
            catatan_muatan: updatedCatatan,
            updated_at: new Date().toISOString(),
          })
          .eq("id", pesananId);

        updateError = fallbackAttempt.error;
      } else {
        updateError = firstAttempt.error;
      }
    }

    if (updateError) {
      console.error("Gagal update status pesanan:", updateError);
      return {
        success: false,
        error: "Gagal memperbarui status di database: " + updateError.message,
      };
    }

    // 3. Catat milestone ke riwayat_status
    const statusLabel = statusLabels[newStatus] || newStatus;
    const defaultCatatan = catatan || `Status diperbarui ke ${statusLabel}`;

    try {
      const histFirst = await supabase.from("riwayat_status").insert({
        pesanan_id: pesananId,
        status: newStatus,
        catatan: defaultCatatan,
      });

      if (histFirst.error && histFirst.error.code === "22P02") {
        await supabase.from("riwayat_status").insert({
          pesanan_id: pesananId,
          status: effectiveDbStatus,
          catatan: defaultCatatan,
        });
      }
    } catch (histErr) {
      console.warn("Notice: Gagal insert riwayat status:", histErr);
    }

    // 4. Kirim notifikasi WhatsApp otomatis via WA Gateway
    let waSent = false;
    let waRecipient = "";

    try {
      const { data: shipmentData } = await supabase
        .from("pesanan")
        .select(`
          id,
          nomor_pesanan,
          nama_customer,
          alamat_asal,
          alamat_tujuan,
          status,
          moda_pengiriman,
          catatan_muatan,
          plat_nomor,
          kontak_customer:kontak_customer_id(nomor_telepon, nama)
        `)
        .eq("id", pesananId)
        .single();

      if (shipmentData) {
        // Tentukan penerima: nomor customer atau nomor owner
        let targetPhone = (shipmentData.kontak_customer as any)?.nomor_telepon;

        if (!targetPhone) {
          const { data: pengaturan } = await supabase
            .from("pengaturan")
            .select("telepon")
            .single();
          targetPhone = pengaturan?.telepon || "628892114763";
        }

        if (targetPhone) {
          const formattedMsg = generateDailyProgressUpdate(
            {
              ...shipmentData,
              status: newStatus,
            },
            {
              originUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              customNote: defaultCatatan,
            }
          );

        const recipientsToSend = new Set<string>();
        if (targetPhone) recipientsToSend.add(targetPhone);
        recipientsToSend.add("628892114763");

        for (const phone of recipientsToSend) {
          try {
            const gatewayRes = await fetch("http://127.0.0.1:3001/api/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                phone,
                message: formattedMsg,
              }),
            });

            if (gatewayRes.ok) {
              const gwData = await gatewayRes.json();
              if (gwData.success) {
                waSent = true;
                waRecipient = phone;
              }
            }
          } catch (sendErr) {
            console.warn(`[AUTO-WA] Gagal kirim ke ${phone}:`, sendErr);
          }
        }
        }
      }
    } catch (waErr: any) {
      console.warn("[AUTO-WA Notice] Tidak dapat mengirim WA otomatis:", waErr.message);
    }

    // 5. Revalidasi halaman
    try {
      revalidatePath("/");
      revalidatePath("/pesanan");
      revalidatePath(`/pesanan/${pesananId}`);
    } catch (revErr) {
      console.warn("Notice: Revalidation notice:", revErr);
    }

    return {
      success: true,
      newStatus,
      message: `Status pesanan diperbarui ke ${statusLabel}.`,
      waSent,
      waRecipient,
    };
  } catch (err: any) {
    console.error("Error updateStatusPesananAction:", err);
    return {
      success: false,
      error: err?.message || "Terjadi kesalahan pada server saat memperbarui status.",
    };
  }
}
