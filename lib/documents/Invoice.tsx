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
    fontSize: 16,
    fontWeight: "bold",
    color: "#0B2545",
    letterSpacing: 1,
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
    marginBottom: 14,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0B2545",
    paddingVertical: 7,
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
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  tableCell: {
    fontSize: 8.5,
    color: "#0F1B2D",
  },
  totalSection: {
    alignItems: "flex-end",
    marginBottom: 16,
  },
  totalBox: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    backgroundColor: "#F7FAFD",
    padding: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1.5,
    borderTopColor: "#0B2545",
    paddingTop: 5,
    marginTop: 3,
  },
  paymentInfoBox: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#F7FAFD",
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0B2545",
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 8,
    color: "#0F1B2D",
    marginBottom: 2,
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

export interface InvoiceData {
  nomor_pesanan: string;
  created_at: string;
  nama_customer: string;
  alamat_asal: string;
  alamat_tujuan: string;
  jenis_barang?: string | null;
  jenis_armada?: string | null;
  plat_nomor?: string | null;
  tarif_customer?: number | null;
  biaya_lainnya?: number | null;
  company_name?: string;
  company_address?: string;
  company_npwp?: string;
}

export function InvoicePDF({ data }: { data: InvoiceData }) {
  const baseTime = new Date(data.created_at || "2026-01-01").getTime();
  const tanggalFormat = new Date(baseTime).toLocaleDateString(
    "id-ID",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const dueDateFormat = new Date(
    baseTime + 14 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const tarif = Number(data.tarif_customer) || 0;
  const biayaLain = Number(data.biaya_lainnya) || 0;
  const total = tarif + biayaLain;

  function formatIDR(val: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  }

  return (
    <Document title={`Invoice - ${data.nomor_pesanan}`}>
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
            {data.company_npwp && (
              <Text style={styles.companySub}>NPWP: {data.company_npwp}</Text>
            )}
          </View>
          <View style={styles.docTitleContainer}>
            <Text style={styles.docTitle}>INVOICE</Text>
            <Text style={styles.docNumber}>No: INV/{data.nomor_pesanan}</Text>
            <Text style={{ fontSize: 8, color: "#5B6B82", marginTop: 2 }}>
              Tanggal: {tanggalFormat}
            </Text>
            <Text style={{ fontSize: 8, color: "#E07B24", marginTop: 1, fontWeight: "bold" }}>
              Jatuh Tempo: {dueDateFormat}
            </Text>
          </View>
        </View>

        {/* Info Tagihan & Pengiriman */}
        <View style={styles.gridTwoCol}>
          <View style={styles.cardBox}>
            <Text style={styles.boxTitle}>TAGIHAN KEPADA (BILL TO)</Text>
            <View style={styles.labelValRow}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={[styles.value, { fontWeight: "bold" }]}>
                {data.nama_customer}
              </Text>
            </View>
            <View style={styles.labelValRow}>
              <Text style={styles.label}>Alamat:</Text>
              <Text style={styles.value}>{data.alamat_tujuan}</Text>
            </View>
          </View>

          <View style={styles.cardBox}>
            <Text style={styles.boxTitle}>RINCIAN PENGIRIMAN</Text>
            <View style={styles.labelValRow}>
              <Text style={styles.label}>Rute:</Text>
              <Text style={styles.value}>
                {data.alamat_asal} → {data.alamat_tujuan}
              </Text>
            </View>
            <View style={styles.labelValRow}>
              <Text style={styles.label}>Armada / Plat:</Text>
              <Text style={styles.value}>
                {data.jenis_armada || "Trucking"} ({data.plat_nomor || "-"})
              </Text>
            </View>
          </View>
        </View>

        {/* Tabel Biaya */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "8%", textAlign: "center" }]}>
              No
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "52%" }]}>
              Deskripsi Layanan
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "center" }]}>
              Qty
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "25%", textAlign: "right" }]}>
              Jumlah (IDR)
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: "8%", textAlign: "center" }]}>
              1
            </Text>
            <View style={{ width: "52%" }}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                Jasa Angkut & Pengiriman Kargo Domestik
              </Text>
              <Text style={{ fontSize: 7.5, color: "#5B6B82" }}>
                Muatan: {data.jenis_barang || "General Cargo"}
              </Text>
            </View>
            <Text style={[styles.tableCell, { width: "15%", textAlign: "center" }]}>
              1 Trip
            </Text>
            <Text style={[styles.tableCell, { width: "25%", textAlign: "right", fontWeight: "bold" }]}>
              {formatIDR(tarif)}
            </Text>
          </View>

          {biayaLain > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "8%", textAlign: "center" }]}>
                2
              </Text>
              <Text style={[styles.tableCell, { width: "52%" }]}>
                Biaya Tambahan Operasional (Tol/Bongkar/Kawal)
              </Text>
              <Text style={[styles.tableCell, { width: "15%", textAlign: "center" }]}>
                1 Paket
              </Text>
              <Text style={[styles.tableCell, { width: "25%", textAlign: "right" }]}>
                {formatIDR(biayaLain)}
              </Text>
            </View>
          )}
        </View>

        {/* Subtotal & Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 8, color: "#5B6B82" }}>Subtotal:</Text>
              <Text style={{ fontSize: 8.5, fontWeight: "bold" }}>
                {formatIDR(total)}
              </Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#0B2545" }}>
                TOTAL TAGIHAN:
              </Text>
              <Text style={{ fontSize: 10, fontWeight: "bold", color: "#2E6FF2" }}>
                {formatIDR(total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Informasi Pembayaran Rekening Bank */}
        <View style={styles.paymentInfoBox}>
          <Text style={styles.paymentTitle}>INFORMASI PEMBAYARAN TRANSFER BANK:</Text>
          <Text style={styles.paymentText}>
            • Bank: <strong>BCA (Bank Central Asia)</strong>
          </Text>
          <Text style={styles.paymentText}>
            • No. Rekening: <strong>123-456-7890</strong>
          </Text>
          <Text style={styles.paymentText}>
            • Atas Nama: <strong>PT DAFF CARGO NUSANTARA</strong>
          </Text>
          <Text style={{ fontSize: 7.5, color: "#5B6B82", marginTop: 4 }}>
            * Harap sertakan nomor invoice ({`INV/${data.nomor_pesanan}`}) pada berita transfer dan kirimkan bukti pembayaran ke WhatsApp kami.
          </Text>
        </View>

        {/* Tanda Tangan */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <Text style={styles.sigRole}>Hormat Kami,</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>
              {data.company_name || "PT DAFF CARGO NUSANTARA"}
            </Text>
            <Text style={{ fontSize: 7.5, color: "#5B6B82" }}>Finance & Billing</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
