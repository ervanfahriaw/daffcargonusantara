/**
 * WhatsApp Notification Service & Anti-Ban Safe Dispatcher
 * PT Daff Cargo Nusantara — Domestic Logistics Operations
 */

import { formatPhoneForWhatsApp } from "@/lib/utils/whatsapp";
import { getShipmentTrackingState, generatePublicTrackingUrl } from "@/lib/utils/geoTracking";

export type DocumentTypeKey = "surat_jalan" | "invoice" | "pod" | "cost_sheet";

export interface BatchNotificationItem {
  pesananId: string;
  nomorPesanan: string;
  customerName: string;
  phone: string;
  status: string;
  statusLabel: string;
  message: string;
  waUrl: string;
  delayMs: number;
}

// ── Variasi Salam & Pembuka untuk Mencegah Deteksi Spam (Anti-Ban) ──
export const GREETING_TEMPLATES = [
  "Selamat pagi Bapak/Ibu {customer}, kami informasikan pembaruan status pengiriman muatan Anda:",
  "Halo Bapak/Ibu {customer}, berikut laporan perkembangan posisi muatan terkini dari tim kami:",
  "Salam hangat Bapak/Ibu {customer}, berikut update berkala operasional untuk pengiriman Anda:",
  "Yth. Bapak/Ibu {customer}, update progres perjalanan muatan Anda hari ini adalah sebagai berikut:",
  "Selamat pagi/siang Bapak/Ibu {customer}, kami sampaikan info terkini status pengiriman muatan:",
];

// ── Variasi Penutup Pesan ──
export const CLOSING_TEMPLATES = [
  "Terima kasih atas kepercayaan Anda bersama PT Daff Cargo Nusantara.\n_Informasi lebih lanjut dapat membalas pesan ini._",
  "Semoga pengiriman berjalan lancar dan tiba tepat waktu. Terima kasih.\n_PT Daff Cargo Nusantara — Layanan Logistik Domestik_",
  "Tim operasional kami terus memantau muatan Anda hingga tiba di tujuan. Terima kasih.\n_PT Daff Cargo Nusantara_",
];

/**
 * Menghasilkan pesan pembaruan harian yang bervariasi secara alami
 */
export function generateDailyProgressUpdate(
  pesanan: {
    id: string;
    nomor_pesanan: string;
    nama_customer: string;
    alamat_asal: string;
    alamat_tujuan: string;
    status: string;
    moda_pengiriman?: string;
    catatan_muatan?: string | null;
    plat_nomor?: string | null;
  },
  options: {
    greetingIndex?: number;
    closingIndex?: number;
    originUrl?: string;
    customNote?: string;
  } = {}
): string {
  const tracking = getShipmentTrackingState(pesanan);
  const trackingUrl = generatePublicTrackingUrl(pesanan.id, options.originUrl);

  const gIdx =
    options.greetingIndex !== undefined
      ? options.greetingIndex % GREETING_TEMPLATES.length
      : Math.floor(Math.random() * GREETING_TEMPLATES.length);

  const cIdx =
    options.closingIndex !== undefined
      ? options.closingIndex % CLOSING_TEMPLATES.length
      : Math.floor(Math.random() * CLOSING_TEMPLATES.length);

  const greeting = GREETING_TEMPLATES[gIdx].replace("{customer}", pesanan.nama_customer);
  const closing = CLOSING_TEMPLATES[cIdx];

  const vehicleIcon =
    tracking.vehicleType === "kapal" ? "🚢" : tracking.vehicleType === "pesawat" ? "✈️" : "🚚";

  return `*UPDATE HARIAN LOGISTIK — PT DAFF CARGO NUSANTARA*

${greeting}

📦 *No. Pesanan:* ${pesanan.nomor_pesanan}
📍 *Rute:* ${tracking.origin.name} ➔ ${tracking.destination.name}
${vehicleIcon} *Armada/Kapal:* ${tracking.vehicleName}
📊 *Status Progres:* ${tracking.statusLabel} (${tracking.progressPercent}%)
⏱️ *Estimasi Tiba (ETA):* ${tracking.etaText}
📌 *Posisi Terkini:* ${tracking.currentPosition.lat}, ${tracking.currentPosition.lng} (${tracking.speedText})${options.customNote ? `\n📝 *Catatan:* ${options.customNote}` : ""}

🔗 *Pantau Peta Live Tracking:*
${trackingUrl}

${closing}`;
}

/**
 * Menghasilkan pesan pengiriman dokumen resmi (Surat Jalan, Invoice, POD)
 */
export function generateDocumentShareMessage(
  pesanan: {
    id: string;
    nomor_pesanan: string;
    nama_customer: string;
    alamat_asal: string;
    alamat_tujuan: string;
    status: string;
  },
  documentType: DocumentTypeKey,
  documentUrl: string
): string {
  let docTitle = "DOKUMEN PENGIRIMAN";
  let docIcon = "📄";

  switch (documentType) {
    case "surat_jalan":
      docTitle = "SURAT JALAN / DOKUMEN KEBERANGKATAN";
      docIcon = "📋";
      break;
    case "invoice":
      docTitle = "INVOICE / TAGIHAN PENGIRIMAN";
      docIcon = "🧾";
      break;
    case "pod":
      docTitle = "BUKTI SERAH TERIMA (POD)";
      docIcon = "📦";
      break;
    case "cost_sheet":
      docTitle = "COST SHEET OPERASIONAL";
      docIcon = "📊";
      break;
  }

  return `*${docIcon} ${docTitle} — PT DAFF CARGO NUSANTARA*

Yth. Bapak/Ibu *${pesanan.nama_customer}*,

Berikut kami lampirkan tautan resmi dokumen untuk pengiriman Anda:
📦 *No. Pesanan:* ${pesanan.nomor_pesanan}
📍 *Rute:* ${pesanan.alamat_asal} ➔ ${pesanan.alamat_tujuan}

📥 *Unduh / Buka Dokumen (PDF):*
${documentUrl}

Silakan diperiksa dan disimpan sebagai arsip resmi. Jika memerlukan bantuan atau dokumen tambahan, jangan ragu untuk menghubungi kami.

Terima kasih atas kerja samanya.
_PT Daff Cargo Nusantara_`;
}

/**
 * Menghitung antrean pengiriman dengan delay acak anti-spam / anti-ban
 * Default jeda: 4.000ms + Jitter acak 0-2.000ms per pesan
 */
export function calculateSafeDispatchSchedule<T extends { phone?: string; id?: string }>(
  items: T[],
  baseDelayMs: number = 4000,
  jitterMs: number = 2000
): Array<T & { delayMs: number; scheduledTime: string }> {
  let accumulatedDelay = 0;

  return items.map((item, index) => {
    if (index === 0) {
      return {
        ...item,
        delayMs: 0,
        scheduledTime: "Langsung",
      };
    }

    const randomJitter = Math.floor(Math.random() * jitterMs);
    const stepDelay = baseDelayMs + randomJitter;
    accumulatedDelay += stepDelay;

    const seconds = Math.round(accumulatedDelay / 1000);
    return {
      ...item,
      delayMs: accumulatedDelay,
      scheduledTime: `+${seconds} detik`,
    };
  });
}

/**
 * Format URL WhatsApp siap kirim
 */
export function buildWhatsAppSendUrl(phone: string, message: string): string {
  const clean = formatPhoneForWhatsApp(phone);
  const encoded = encodeURIComponent(message);
  return clean ? `https://wa.me/${clean}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

/**
 * Menyusun antrean batch notifikasi untuk semua pesanan yang sedang aktif
 */
export function createBatchNotificationQueue(
  shipments: Array<{
    id: string;
    nomor_pesanan: string;
    nama_customer: string;
    alamat_asal: string;
    alamat_tujuan: string;
    status: string;
    moda_pengiriman?: string;
    catatan_muatan?: string | null;
    plat_nomor?: string | null;
    kontak_customer?: {
      nomor_telepon?: string | null;
    } | null;
  }>,
  originUrl?: string
): BatchNotificationItem[] {
  // Hanya proses pesanan yang aktif / sedang berjalan (bukan yang sudah selesai/terkirim/batal)
  const activeShipments = shipments.filter(
    (s) => !["selesai", "batal"].includes(s.status)
  );

  const scheduled = calculateSafeDispatchSchedule(activeShipments, 4500, 2500);

  return scheduled.map((s, idx) => {
    const tracking = getShipmentTrackingState(s);
    const phone = s.kontak_customer?.nomor_telepon || "";
    const msg = generateDailyProgressUpdate(s, {
      greetingIndex: idx,
      closingIndex: idx,
      originUrl,
    });
    const waUrl = buildWhatsAppSendUrl(phone, msg);

    return {
      pesananId: s.id,
      nomorPesanan: s.nomor_pesanan,
      customerName: s.nama_customer,
      phone,
      status: s.status,
      statusLabel: tracking.statusLabel,
      message: msg,
      waUrl,
      delayMs: s.delayMs,
    };
  });
}
