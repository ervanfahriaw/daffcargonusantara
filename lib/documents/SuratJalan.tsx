import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#0F1B2D",
    lineHeight: 1.4,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#0B2545",
    paddingBottom: 12,
    marginBottom: 16,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0B2545",
    letterSpacing: 0.5,
  },
  companySub: {
    fontSize: 8,
    color: "#5B6B82",
    marginTop: 2,
  },
  docTitleContainer: {
    alignItems: "flex-end",
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0B2545",
    textTransform: "uppercase",
  },
  docNumber: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#2E6FF2",
    marginTop: 3,
  },
  gridTwoCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 14,
  },
  cardBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#F7FAFD",
  },
  boxTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0B2545",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 4,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  labelValRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    width: "35%",
    color: "#5B6B82",
    fontSize: 8,
  },
  value: {
    width: "65%",
    color: "#0F1B2D",
    fontSize: 8.5,
    fontWeight: "medium",
  },
  table: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0B2545",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  tableCell: {
    fontSize: 8.5,
    color: "#0F1B2D",
  },
  noteBox: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#F7FAFD",
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0B2545",
    marginBottom: 2,
  },
  noteText: {
    fontSize: 8,
    color: "#5B6B82",
  },
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  signatureBox: {
    width: "30%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  sigRole: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0B2545",
    marginBottom: 40,
    textAlign: "center",
  },
  sigLine: {
    width: "80%",
    borderBottomWidth: 1,
    borderBottomColor: "#0F1B2D",
    marginBottom: 4,
  },
  sigName: {
    fontSize: 7.5,
    color: "#5B6B82",
    textAlign: "center",
  },
});

export interface SuratJalanData {
  nomor_pesanan: string;
  created_at: string;
  nama_customer: string;
  alamat_asal: string;
  alamat_tujuan: string;
  jenis_barang?: string | null;
  berat?: number | null;
  volume?: number | null;
  jumlah_koli?: number | null;
  catatan_muatan?: string | null;
  jenis_armada?: string | null;
  plat_nomor?: string | null;
  supir_nama?: string | null;
  vendor_nama?: string | null;
  company_name?: string;
  company_address?: string;
}

export function SuratJalanPDF({ data }: { data: SuratJalanData }) {
  const tanggalFormat = new Date(data.created_at || "2026-01-01").toLocaleDateString(
    "id-ID",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <Document title={`Surat Jalan - ${data.nomor_pesanan}`}>
      <Page size="A4" style={styles.page}>
        {/* Kop Surat */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.companyName}>
              {data.company_name || "PT DAFF CARGO NUSANTARA"}
            </Text>
            <Text style={styles.companySub}>
              Domestic Freight Forwarding & Logistics Services
            </Text>
            <Text style={styles.companySub}>
              {data.company_address || "Jakarta, Indonesia"}
            </Text>
          </View>
          <View style={styles.docTitleContainer}>
            <Text style={styles.docTitle}>SURAT JALAN</Text>
            <Text style={styles.docNumber}>No: SJ/{data.nomor_pesanan}</Text>
            <Text style={{ fontSize: 8, color: "#5B6B82", marginTop: 2 }}>
              Tanggal: {tanggalFormat}
            </Text>
          </View>
        </View>

        {/* 2 Kolom: Pengirim & Penerima */}
        <View style={styles.gridTwoCol}>
          <View style={styles.cardBox}>
            <Text style={styles.boxTitle}>PENGIRIM (ASAL / PICKUP)</Text>
            <View style={styles.labelValRow}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{data.nama_customer}</Text>
            </View>
            <View style={styles.labelValRow}>
              <Text style={styles.label}>Lokasi Muat:</Text>
              <Text style={styles.value}>{data.alamat_asal}</Text>
            </View>
          </View>

          <View style={styles.cardBox}>
            <Text style={styles.boxTitle}>PENERIMA (TUJUAN / BONGKAR)</Text>
            <View style={styles.labelValRow}>
              <Text style={styles.label}>Penerima:</Text>
              <Text style={styles.value}>{data.nama_customer}</Text>
            </View>
            <View style={styles.labelValRow}>
              <Text style={styles.label}>Lokasi Bongkar:</Text>
              <Text style={styles.value}>{data.alamat_tujuan}</Text>
            </View>
          </View>
        </View>

        {/* Informasi Transportasi & Armada */}
        <View style={[styles.cardBox, { marginBottom: 14 }]}>
          <Text style={styles.boxTitle}>INFORMASI KENDARAAN & PENGEMUDI</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ width: "32%" }}>
              <Text style={styles.label}>Jenis Armada:</Text>
              <Text style={styles.value}>{data.jenis_armada || "Trucking"}</Text>
            </View>
            <View style={{ width: "32%" }}>
              <Text style={styles.label}>Plat Nomor:</Text>
              <Text style={styles.value}>{data.plat_nomor || "-"}</Text>
            </View>
            <View style={{ width: "32%" }}>
              <Text style={styles.label}>Nama Supir / Vendor:</Text>
              <Text style={styles.value}>
                {data.supir_nama || data.vendor_nama || "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabel Muatan */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "8%", textAlign: "center" }]}>
              No
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "42%" }]}>
              Deskripsi Barang
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "16%", textAlign: "right" }]}>
              Jumlah Koli
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "17%", textAlign: "right" }]}>
              Berat (Kg)
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "17%", textAlign: "right" }]}>
              Volume (m³)
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: "8%", textAlign: "center" }]}>
              1
            </Text>
            <Text style={[styles.tableCell, { width: "42%", fontWeight: "bold" }]}>
              {data.jenis_barang || "Barang Muatan Proyek"}
            </Text>
            <Text style={[styles.tableCell, { width: "16%", textAlign: "right" }]}>
              {data.jumlah_koli ? `${data.jumlah_koli} Koli` : "-"}
            </Text>
            <Text style={[styles.tableCell, { width: "17%", textAlign: "right" }]}>
              {data.berat ? `${data.berat.toLocaleString("id-ID")} kg` : "-"}
            </Text>
            <Text style={[styles.tableCell, { width: "17%", textAlign: "right" }]}>
              {data.volume ? `${data.volume} m³` : "-"}
            </Text>
          </View>
        </View>

        {/* Catatan Instruksi Khusus */}
        {data.catatan_muatan && (
          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Instruksi Penanganan Khusus:</Text>
            <Text style={styles.noteText}>{data.catatan_muatan}</Text>
          </View>
        )}

        {/* Kolom Tanda Tangan 3 Pihak */}
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.sigRole}>Pengirim (Shipper)</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>Nama Terang & Cap</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.sigRole}>Pengemudi (Driver)</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>{data.supir_nama || "Nama Supir"}</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.sigRole}>Penerima (Consignee)</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>Nama Terang & Cap</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
