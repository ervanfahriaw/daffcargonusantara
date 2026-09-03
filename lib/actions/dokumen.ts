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
import {
  manualDocumentSchema,
  type ManualDocumentInput,
} from "@/lib/validations/dokumen";

export type { JenisDokumen };

interface ExtraDocumentData {
  plat_nomor?: string;
  supir_nama?: string;
}

export type GenerateDokumenResult =
  | { success: true; message: string; pdfUrl: string }
  | { success: false; error: string };

export type GenerateManualDokumenResult =
  | {
      success: true;
      message: string;
      pdfBase64: string;
      fileName: string;
      pdfUrl?: string;
      pesananId?: string;
    }
  | { success: false; error: string; errors?: Record<string, string[]> };

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
    let pdfElement!: React.ReactElement;
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

    const buffer = await renderToBuffer(
      pdfElement as unknown as Parameters<typeof renderToBuffer>[0]
    );

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

export async function generateManualDokumenAction(
  rawInput: ManualDocumentInput
): Promise<GenerateManualDokumenResult> {
  try {
    const parseRes = manualDocumentSchema.safeParse(rawInput);
    if (!parseRes.success) {
      const fieldErrors = parseRes.error.flatten().fieldErrors;
      return {
        success: false,
        error: "Ada data dokumen yang belum lengkap.",
        errors: fieldErrors as Record<string, string[]>,
      };
    }

    const data = parseRes.data;
    const supabase = await createClient();

    // Ambil data profil perusahaan
    const { data: pengaturan } = await supabase
      .from("pengaturan")
      .select("nama_perusahaan, alamat, npwp, nama_owner, telepon")
      .single();

    const companyName = pengaturan?.nama_perusahaan || "PT DAFF CARGO NUSANTARA";
    const companyAddress = pengaturan?.alamat || "Jakarta, Indonesia";
    const companyNpwp = pengaturan?.npwp || "";

    const docDate = data.tanggal_dokumen || new Date().toISOString();
    const cleanDocNum = data.nomor_dokumen.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `${data.jenis}_${cleanDocNum}.pdf`;

    let pdfElement!: React.ReactElement;
    switch (data.jenis) {
      case "surat_jalan":
        pdfElement = React.createElement(SuratJalanPDF, {
          data: {
            nomor_pesanan: data.nomor_dokumen,
            created_at: docDate,
            nama_customer: data.nama_customer,
            alamat_asal: data.alamat_asal || "Lokasi Muat",
            alamat_tujuan: data.alamat_tujuan || "Lokasi Bongkar",
            jenis_barang: data.jenis_barang || "General Cargo",
            berat: data.berat,
            volume: data.volume,
            jumlah_koli: data.jumlah_koli,
            catatan_muatan: data.catatan_muatan,
            jenis_armada: data.jenis_armada || "Armada Truk",
            plat_nomor: data.plat_nomor || "-",
            supir_nama: data.supir_nama || "-",
            vendor_nama: data.vendor_nama,
            company_name: companyName,
            company_address: companyAddress,
          },
        });
        break;

      case "invoice":
        pdfElement = React.createElement(InvoicePDF, {
          data: {
            nomor_pesanan: data.nomor_dokumen,
            created_at: docDate,
            nama_customer: data.nama_customer,
            alamat_asal: data.alamat_asal || "-",
            alamat_tujuan: data.alamat_tujuan || "-",
            jenis_barang: data.jenis_barang,
            jenis_armada: data.jenis_armada,
            plat_nomor: data.plat_nomor,
            tarif_customer: data.tarif_customer || 0,
            biaya_lainnya: data.biaya_lainnya || 0,
            company_name: companyName,
            company_address: companyAddress,
            company_npwp: companyNpwp,
          },
        });
        break;

      case "cost_sheet":
        pdfElement = React.createElement(CostSheetPDF, {
          data: {
            nomor_pesanan: data.nomor_dokumen,
            created_at: docDate,
            nama_customer: data.nama_customer,
            alamat_asal: data.alamat_asal || "-",
            alamat_tujuan: data.alamat_tujuan || "-",
            jenis_armada: data.jenis_armada,
            plat_nomor: data.plat_nomor,
            supir_nama: data.supir_nama,
            vendor_nama: data.vendor_nama,
            tarif_customer: data.tarif_customer || 0,
            biaya_vendor: data.biaya_vendor || 0,
            biaya_lainnya: data.biaya_lainnya || 0,
            company_name: companyName,
          },
        });
        break;

      case "pod":
        pdfElement = React.createElement(PODPDF, {
          data: {
            nomor_pesanan: data.nomor_dokumen,
            created_at: docDate,
            nama_customer: data.nama_customer,
            alamat_asal: data.alamat_asal || "-",
            alamat_tujuan: data.alamat_tujuan || "-",
            jenis_barang: data.jenis_barang,
            berat: data.berat,
            volume: data.volume,
            jumlah_koli: data.jumlah_koli,
            plat_nomor: data.plat_nomor,
            supir_nama: data.supir_nama,
            company_name: companyName,
          },
        });
        break;
    }

    const buffer = await renderToBuffer(
      pdfElement as unknown as Parameters<typeof renderToBuffer>[0]
    );
    const pdfBase64 = `data:application/pdf;base64,${buffer.toString("base64")}`;

    // Jika terkait dengan pesanan terdaftar di database, simpan ke tabel dokumen
    const pesananId = data.pesanan_id?.trim() || undefined;
    if (pesananId) {
      const storagePath = `documents/${pesananId}/${fileName}`;
      try {
        await supabase.storage
          .from("documents")
          .upload(storagePath, buffer, {
            contentType: "application/pdf",
            upsert: true,
          });
      } catch (e) {
        console.warn("Storage upload notice (linked pesanan):", e);
      }

      try {
        await supabase.from("dokumen").upsert(
          {
            pesanan_id: pesananId,
            jenis: data.jenis,
            nama_file: fileName,
            storage_path: storagePath,
          },
          { onConflict: "pesanan_id,jenis" }
        );

        if (data.plat_nomor) {
          await supabase
            .from("pesanan")
            .update({ plat_nomor: data.plat_nomor.toUpperCase() })
            .eq("id", pesananId);
        }

        revalidatePath(`/pesanan/${pesananId}`);
      } catch (upsertErr) {
        console.warn("Notice upserting to dokumen:", upsertErr);
      }
    } else {
      // Manual/Ad-hoc: coba upload ke folder documents/manual/
      try {
        await supabase.storage
          .from("documents")
          .upload(`documents/manual/${fileName}`, buffer, {
            contentType: "application/pdf",
            upsert: true,
          });
      } catch (storageErr) {
        console.warn("Manual storage upload notice:", storageErr);
      }
    }

    revalidatePath("/dokumen");

    const label = jenisDokumenLabels[data.jenis];
    return {
      success: true,
      message: `${label} berhasil dibuat.`,
      pdfBase64,
      fileName,
      pdfUrl: pesananId ? `/api/documents/${pesananId}/${data.jenis}` : undefined,
      pesananId,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan pada server.";
    console.error("Error generateManualDokumenAction:", err);
    return {
      success: false,
      error: errorMsg || "Gagal membuat dokumen PDF. Silakan periksa kembali isian.",
    };
  }
}

