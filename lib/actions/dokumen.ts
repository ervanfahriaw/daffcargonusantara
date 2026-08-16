"use server";

import React from "react";
import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { SuratJalanPDF } from "@/lib/documents/SuratJalan";
import { InvoicePDF } from "@/lib/documents/Invoice";
import { CostSheetPDF } from "@/lib/documents/CostSheet";
import { PODPDF } from "@/lib/documents/POD";
import {
  type JenisDokumen,
  jenisDokumenLabels,
} from "@/lib/types/dokumen";

export type { JenisDokumen };

interface ExtraDocumentData {
  plat_nomor?: string;
  supir_nama?: string;
}

export type GenerateDokumenResult =
  | { success: true; message: string; pdfUrl: string }
  | { success: false; error: string };

export async function generateDokumenAction(
  pesananId: string,
  jenis: JenisDokumen,
  extraData?: ExtraDocumentData
): Promise<GenerateDokumenResult> {
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

    // 2. Jika ada update plat nomor / supir, update pesanan terlebih dahulu
    if (extraData?.plat_nomor) {
      await supabase
        .from("pesanan")
        .update({ plat_nomor: extraData.plat_nomor.toUpperCase() })
        .eq("id", pesananId);
    }

    // 3. Ambil data pesanan lengkap
    const { data: pesanan, error: pesananError } = await supabase
      .from("pesanan")
      .select(`
        *,
        kontak_customer:kontak_customer_id(nama, nomor_telepon, perusahaan),
        vendor_trucking:vendor_trucking_id(nama, nomor_telepon, perusahaan),
        supir:supir_id(nama, nomor_telepon)
      `)
      .eq("id", pesananId)
      .single();

    if (pesananError || !pesanan) {
      return {
        success: false,
        error: "Data pesanan tidak ditemukan.",
      };
    }

    // 4. Ambil data profil perusahaan
    const { data: pengaturan } = await supabase
      .from("pengaturan")
      .select("nama_perusahaan, alamat, npwp")
      .single();

    const companyName = pengaturan?.nama_perusahaan || "PT DAFF CARGO NUSANTARA";
    const companyAddress = pengaturan?.alamat || "Jakarta, Indonesia";
    const companyNpwp = pengaturan?.npwp || "";

    const fileName = `${jenis}_${pesanan.nomor_pesanan}.pdf`;
    const storagePath = `documents/${pesananId}/${fileName}`;
    const pdfRouteUrl = `/api/documents/${pesananId}/${jenis}`;

    // 5. Render PDF ke buffer via React.createElement
    let pdfElement: React.ReactElement<any>;
    switch (jenis) {
      case "surat_jalan":
        pdfElement = React.createElement(SuratJalanPDF, {
          data: {
            nomor_pesanan: pesanan.nomor_pesanan,
            created_at: pesanan.created_at,
            nama_customer: pesanan.nama_customer,
            alamat_asal: pesanan.alamat_asal,
            alamat_tujuan: pesanan.alamat_tujuan,
            jenis_barang: pesanan.jenis_barang,
            berat: pesanan.berat,
            volume: pesanan.volume,
            jumlah_koli: pesanan.jumlah_koli,
            catatan_muatan: pesanan.catatan_muatan,
            jenis_armada: pesanan.jenis_armada,
            plat_nomor: pesanan.plat_nomor || extraData?.plat_nomor,
            supir_nama: pesanan.supir?.nama || extraData?.supir_nama,
            vendor_nama: pesanan.vendor_trucking?.nama,
            company_name: companyName,
            company_address: companyAddress,
          },
        });
        break;

      case "invoice":
        pdfElement = React.createElement(InvoicePDF, {
          data: {
            nomor_pesanan: pesanan.nomor_pesanan,
            created_at: pesanan.created_at,
            nama_customer: pesanan.nama_customer,
            alamat_asal: pesanan.alamat_asal,
            alamat_tujuan: pesanan.alamat_tujuan,
            jenis_barang: pesanan.jenis_barang,
            jenis_armada: pesanan.jenis_armada,
            plat_nomor: pesanan.plat_nomor,
            tarif_customer: pesanan.tarif_customer,
            biaya_lainnya: pesanan.biaya_lainnya,
            company_name: companyName,
            company_address: companyAddress,
            company_npwp: companyNpwp,
          },
        });
        break;

      case "cost_sheet":
        pdfElement = React.createElement(CostSheetPDF, {
          data: {
            nomor_pesanan: pesanan.nomor_pesanan,
            created_at: pesanan.created_at,
            nama_customer: pesanan.nama_customer,
            alamat_asal: pesanan.alamat_asal,
            alamat_tujuan: pesanan.alamat_tujuan,
            jenis_armada: pesanan.jenis_armada,
            plat_nomor: pesanan.plat_nomor,
            supir_nama: pesanan.supir?.nama,
            vendor_nama: pesanan.vendor_trucking?.nama,
            tarif_customer: pesanan.tarif_customer,
            biaya_vendor: pesanan.biaya_vendor,
            biaya_lainnya: pesanan.biaya_lainnya,
            company_name: companyName,
          },
        });
        break;

      case "pod":
        pdfElement = React.createElement(PODPDF, {
          data: {
            nomor_pesanan: pesanan.nomor_pesanan,
            created_at: pesanan.created_at,
            nama_customer: pesanan.nama_customer,
            alamat_asal: pesanan.alamat_asal,
            alamat_tujuan: pesanan.alamat_tujuan,
            jenis_barang: pesanan.jenis_barang,
            berat: pesanan.berat,
            volume: pesanan.volume,
            jumlah_koli: pesanan.jumlah_koli,
            plat_nomor: pesanan.plat_nomor,
            supir_nama: pesanan.supir?.nama,
            company_name: companyName,
          },
        });
        break;
    }

    const buffer = await renderToBuffer(pdfElement as any);

    // 6. Upload file PDF ke Supabase Storage (opsional/best-effort)
    try {
      await supabase.storage
        .from("documents")
        .upload(storagePath, buffer, {
          contentType: "application/pdf",
          upsert: true,
        });
    } catch (storageErr) {
      console.warn("Storage upload notice:", storageErr);
    }

    // 7. Simpan/Upsert record ke tabel dokumen
    await supabase.from("dokumen").upsert(
      {
        pesanan_id: pesananId,
        jenis: jenis,
        nama_file: fileName,
        storage_path: storagePath,
      },
      { onConflict: "pesanan_id,jenis" }
    );

    // 8. Revalidasi cache
    revalidatePath(`/pesanan/${pesananId}`);

    const label = jenisDokumenLabels[jenis];
    return {
      success: true,
      message: `${label} berhasil dibuat.`,
      pdfUrl: pdfRouteUrl,
    };
  } catch (err) {
    console.error("Error generateDokumenAction:", err);
    return {
      success: false,
      error: "Gagal membuat dokumen PDF. Silakan coba lagi.",
    };
  }
}
