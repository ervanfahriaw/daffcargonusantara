import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { SuratJalanPDF } from "@/lib/documents/SuratJalan";
import { InvoicePDF } from "@/lib/documents/Invoice";
import { CostSheetPDF } from "@/lib/documents/CostSheet";
import { PODPDF } from "@/lib/documents/POD";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; jenis: string }> }
) {
  try {
    const { id, jenis } = await params;
    const supabase = await createClient();

    // 1. Ambil data pesanan lengkap
    const { data: pesanan, error: pesananError } = await supabase
      .from("pesanan")
      .select(`
        *,
        kontak_customer:kontak_customer_id(nama, nomor_telepon, perusahaan),
        vendor_trucking:vendor_trucking_id(nama, nomor_telepon, perusahaan),
        supir:supir_id(nama, nomor_telepon)
      `)
      .eq("id", id)
      .single();

    if (pesananError || !pesanan) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Ambil data profil perusahaan
    const { data: pengaturan } = await supabase
      .from("pengaturan")
      .select("nama_perusahaan, alamat, npwp")
      .single();

    const companyName = pengaturan?.nama_perusahaan || "PT DAFF CARGO NUSANTARA";
    const companyAddress = pengaturan?.alamat || "Jakarta, Indonesia";
    const companyNpwp = pengaturan?.npwp || "";

    let pdfElement: React.ReactElement<any>;
    let fileName = `${jenis}_${pesanan.nomor_pesanan}.pdf`;

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
            plat_nomor: pesanan.plat_nomor,
            supir_nama: pesanan.supir?.nama,
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

      default:
        return NextResponse.json(
          { error: "Jenis dokumen tidak valid." },
          { status: 400 }
        );
    }

    // Render PDF ke binary buffer
    const buffer = await renderToBuffer(pdfElement as any);

    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  } catch (err) {
    console.error("Error generating PDF:", err);
    return NextResponse.json(
      { error: "Gagal membuat dokumen PDF." },
      { status: 500 }
    );
  }
}
