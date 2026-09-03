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
  },
  docBadge: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#E07B24",
    backgroundColor: "#FFF1E0",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 3,
  },
  cardBox: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#F7FAFD",
    marginBottom: 14,
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
    width: "30%",
    color: "#5B6B82",
    fontSize: 8,
  },
  value: {
    width: "70%",
    color: "#0F1B2D",
    fontSize: 8.5,
    fontWeight: "medium",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0B2545",
    marginTop: 8,
    marginBottom: 6,
  },
  table: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
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
  marginCard: {
    borderWidth: 1.5,
    borderColor: "#2E9E52",
    borderRadius: 6,
    backgroundColor: "#E6F6EA",
    padding: 12,
    marginBottom: 20,
  },
  marginRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  signatureBox: {
    width: "35%",
    alignItems: "center",
  },
  sigRole: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0B2545",
    marginBottom: 45,
    textAlign: "center",
  },
  sigLine: {
    width: "90%",
    borderBottomWidth: 1,
    borderBottomColor: "#0F1B2D",
    marginBottom: 4,
  },
  sigName: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0B2545",
  },
});

export interface CostSheetData {
  nomor_pesanan: string;
  created_at: string;
  nama_customer: string;
  alamat_asal: string;
  alamat_tujuan: string;
  jenis_armada?: string | null;
  plat_nomor?: string | null;
  supir_nama?: string | null;
  vendor_nama?: string | null;
  tarif_customer?: number | null;
  biaya_vendor?: number | null;
  biaya_lainnya?: number | null;
  company_name?: string;
}

export function CostSheetPDF({ data }: { data: CostSheetData }) {
  const tanggalFormat = new Date(data.created_at || "2026-01-01").toLocaleDateString(
    "id-ID",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const tarif = Number(data.tarif_customer) || 0;
  const vendor = Number(data.biaya_vendor) || 0;
  const lainnya = Number(data.biaya_lainnya) || 0;
  const totalBiaya = vendor + lainnya;
  const margin = tarif - totalBiaya;
  const marginPercent = tarif > 0 ? ((margin / tarif) * 100).toFixed(1) : "0";

  function formatIDR(val: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  }

  return (
    <Document title={`Cost Sheet - ${data.nomor_pesanan}`}>
      <Page size="A4" style={styles.page}>
        {/* Kop Surat */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.companyName}>
              {data.company_name || "PT DAFF CARGO NUSANTARA"}
            </Text>
            <Text style={styles.companySub}>
              Internal Financial & Operational Cost Sheet
            </Text>
          </View>
          <View style={styles.docTitleContainer}>
            <Text style={styles.docTitle}>COST SHEET PESANAN</Text>
            <Text style={styles.docBadge}>ARSIP INTERNAL</Text>
            <Text style={{ fontSize: 8, color: "#5B6B82", marginTop: 4 }}>
              Ref: {data.nomor_pesanan} | Tanggal: {tanggalFormat}
            </Text>
          </View>
        </View>

        {/* Informasi Ringkas Pengiriman */}
        <View style={styles.cardBox}>
          <Text style={styles.boxTitle}>INFORMASI PENGIRIMAN</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ width: "48%" }}>
              <View style={styles.labelValRow}>
                <Text style={styles.label}>Customer:</Text>
                <Text style={styles.value}>{data.nama_customer}</Text>
              </View>
              <View style={styles.labelValRow}>
                <Text style={styles.label}>Rute:</Text>
                <Text style={styles.value}>
                  {data.alamat_asal} → {data.alamat_tujuan}
                </Text>
              </View>
            </View>
            <View style={{ width: "48%" }}>
              <View style={styles.labelValRow}>
                <Text style={styles.label}>Armada / Plat:</Text>
                <Text style={styles.value}>
                  {data.jenis_armada || "Trucking"} ({data.plat_nomor || "-"})
                </Text>
              </View>
              <View style={styles.labelValRow}>
                <Text style={styles.label}>Vendor / Supir:</Text>
                <Text style={styles.value}>
                  {data.vendor_nama || data.supir_nama || "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabel Pendapatan & Pengeluaran */}
        <Text style={styles.sectionTitle}>1. PENDAPATAN (REVENUE)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "70%" }]}>Deskripsi</Text>
            <Text style={[styles.tableHeaderCell, { width: "30%", textAlign: "right" }]}>Jumlah</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: "70%" }]}>Tarif Jasa Angkut ke Customer</Text>
            <Text style={[styles.tableCell, { width: "30%", textAlign: "right", fontWeight: "bold" }]}>
              {formatIDR(tarif)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>2. PENGELUARAN OPERASIONAL (COSTS)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "70%" }]}>Pos Biaya</Text>
            <Text style={[styles.tableHeaderCell, { width: "30%", textAlign: "right" }]}>Jumlah</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: "70%" }]}>Biaya Vendor / Sewa Trucking</Text>
            <Text style={[styles.tableCell, { width: "30%", textAlign: "right" }]}>
              {formatIDR(vendor)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: "70%" }]}>Biaya Lain-lain (Tol, Buruh, Kawal)</Text>
            <Text style={[styles.tableCell, { width: "30%", textAlign: "right" }]}>
              {formatIDR(lainnya)}
            </Text>
          </View>
          <View style={[styles.tableRow, { backgroundColor: "#F7FAFD" }]}>
            <Text style={[styles.tableCell, { width: "70%", fontWeight: "bold" }]}>Total Biaya Operasional</Text>
            <Text style={[styles.tableCell, { width: "30%", textAlign: "right", fontWeight: "bold", color: "#E5484D" }]}>
              {formatIDR(totalBiaya)}
            </Text>
          </View>
        </View>

        {/* Ringkasan Margin Keuntungan */}
        <View style={styles.marginCard}>
          <View style={styles.marginRow}>
            <View>
              <Text style={{ fontSize: 10, fontWeight: "bold", color: "#2E9E52" }}>
                ESTIMASI MARGIN KEUNTUNGAN (PROFIT):
              </Text>
              <Text style={{ fontSize: 8, color: "#5B6B82", marginTop: 2 }}>
                Margin Persentase: {marginPercent}% dari Tarif Customer
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: "bold", color: margin >= 0 ? "#2E9E52" : "#E5484D" }}>
              {formatIDR(margin)}
            </Text>
          </View>
        </View>

        {/* Tanda Tangan Persetujuan */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.sigRole}>Disetujui Oleh,</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>Owner / Direktur Operasional</Text>
            <Text style={{ fontSize: 7.5, color: "#5B6B82" }}>PT DAFF CARGO NUSANTARA</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
