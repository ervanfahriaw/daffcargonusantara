import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { SuratJalanPDF } from "@/lib/documents/SuratJalan";
import { InvoicePDF } from "@/lib/documents/Invoice";
import { CostSheetPDF } from "@/lib/documents/CostSheet";
import { PODPDF } from "@/lib/documents/POD";
import { manualDocumentSchema } from "@/lib/validations/dokumen";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json({ error: "Nama file tidak diberikan" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from("documents")
      .download(`documents/manual/${fileName}`);

    if (error || !data) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
    }

    const buffer = await data.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err: any) {
    console.error("Error download manual doc:", err);
    return NextResponse.json({ error: "Gagal memproses file" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseRes = manualDocumentSchema.safeParse(body);

    if (!parseRes.success) {
      return NextResponse.json(
        { error: "Data dokumen tidak valid", details: parseRes.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseRes.data;
    const supabase = await createClient();

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

    let pdfElement: React.ReactElement<any>;
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

    const buffer = await renderToBuffer(pdfElement as any);

    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err: any) {
    console.error("Error streaming manual PDF:", err);
    return NextResponse.json({ error: "Gagal membuat PDF: " + err?.message }, { status: 500 });
  }
}
