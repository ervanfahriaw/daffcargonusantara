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
    color: "#2FAFA0",
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
    marginBottom: 14,
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
  conditionBox: {
    borderWidth: 1,
    borderColor: "#2FAFA0",
    borderRadius: 6,
    backgroundColor: "#E3F7F3",
    padding: 10,
    marginBottom: 20,
  },
  conditionTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0B2545",
    marginBottom: 3,
  },
  conditionText: {
    fontSize: 8,
    color: "#0F1B2D",
  },
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 10,
  },
  signatureBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  sigRole: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0B2545",
    marginBottom: 50,
    textAlign: "center",
  },
  sigLine: {
    width: "85%",
    borderBottomWidth: 1,
    borderBottomColor: "#0F1B2D",
    marginBottom: 4,
  },
  sigName: {
    fontSize: 8,
    color: "#5B6B82",
    textAlign: "center",
  },
});

export interface PODData {
  nomor_pesanan: string;
  created_at: string;
  nama_customer: string;
  alamat_asal: string;
  alamat_tujuan: string;
  jenis_barang?: string | null;
  berat?: number | null;
  volume?: number | null;
  jumlah_koli?: number | null;
  plat_nomor?: string | null;
  supir_nama?: string | null;
  company_name?: string;
}

export function PODPDF({ data }: { data: PODData }) {
  const tanggalFormat = new Date(Date.now()).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document title={`POD - ${data.nomor_pesanan}`}>
      <Page size="A4" style={styles.page}>
        {/* Kop Surat */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.companyName}>
              {data.company_name || "PT DAFF CARGO NUSANTARA"}
            </Text>
            <Text style={styles.companySub}>
              Proof of Delivery (POD) — Bukti Serah Terima Barang
            </Text>
          </View>
          <View style={styles.docTitleContainer}>
            <Text style={styles.docTitle}>BUKTI SERAH TERIMA (POD)</Text>
            <Text style={styles.docNumber}>Ref: POD/{data.nomor_pesanan}</Text>
            <Text style={{ fontSize: 8, color: "#5B6B82", marginTop: 2 }}>
              Tanggal Tiba: {tanggalFormat}
            </Text>
          </View>
        </View>

        {/* Informasi Pengirim & Penerima */}
        <View style={styles.gridTwoCol}>
          <View style={styles.cardBox}>
            <Text style={styles.boxTitle}>PENGIRIM</Text>
            <View style={styles.labelValRow}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{data.nama_customer}</Text>
            </View>
            <View style={styles.labelValRow}>
              <Text style={styles.label}>Lokasi Asal:</Text>
              <Text style={styles.value}>{data.alamat_asal}</Text>
            </View>
          </View>

          <View style={styles.cardBox}>
            <Text style={styles.boxTitle}>PENERIMA (LOKASI BONGKAR)</Text>
            <View style={styles.labelValRow}>
              <Text style={styles.label}>Tujuan:</Text>
              <Text style={styles.value}>{data.nama_customer}</Text>
            </View>
            <View style={styles.labelValRow}>
              <Text style={styles.label}>Alamat Bongkar:</Text>
              <Text style={styles.value}>{data.alamat_tujuan}</Text>
            </View>
          </View>
        </View>

        {/* Tabel Muatan yang Diterima */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "8%", textAlign: "center" }]}>
              No
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "42%" }]}>
              Jenis / Nama Barang
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "16%", textAlign: "right" }]}>
              Jumlah Koli
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "17%", textAlign: "right" }]}>
              Berat (Kg)
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "17%", textAlign: "center" }]}>
              Kondisi
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: "8%", textAlign: "center" }]}>
              1
            </Text>
            <Text style={[styles.tableCell, { width: "42%", fontWeight: "bold" }]}>
              {data.jenis_barang || "Barang Muatan Kargo"}
            </Text>
            <Text style={[styles.tableCell, { width: "16%", textAlign: "right" }]}>
              {data.jumlah_koli ? `${data.jumlah_koli} Koli` : "-"}
            </Text>
            <Text style={[styles.tableCell, { width: "17%", textAlign: "right" }]}>
              {data.berat ? `${data.berat.toLocaleString("id-ID")} kg` : "-"}
            </Text>
            <Text style={[styles.tableCell, { width: "17%", textAlign: "center", color: "#2E9E52", fontWeight: "bold" }]}>
              BAIK & LENGKAP
            </Text>
          </View>
        </View>

        {/* Pernyataan Penerimaan */}
        <View style={styles.conditionBox}>
          <Text style={styles.conditionTitle}>PERNYATAAN SERAH TERIMA:</Text>
          <Text style={styles.conditionText}>
            Barang-barang yang tercantum di atas telah diterima dalam keadaan baik, cukup, utuh, dan sesuai dengan Surat Jalan yang menyertai pengiriman ini.
          </Text>
        </View>

        {/* Tanda Tangan Serah Terima */}
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.sigRole}>Yang Menyerahkan (Pengemudi / Supir)</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>
              {data.supir_nama || "Nama Supir"} ({data.plat_nomor || "Plat Kendaraan"})
            </Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.sigRole}>Yang Menerima (Pihak Gudang / Customer)</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>Nama Terang, Tanda Tangan & Cap</Text>
            <Text style={{ fontSize: 7, color: "#5B6B82", marginTop: 2 }}>
              Tgl & Jam: ________________________
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
