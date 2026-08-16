/**
 * WhatsApp formatting helper (JS Runtime / Node Test Runner version)
 */

export function formatPhoneForWhatsApp(phone) {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }

  if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

export function generateContextualWAMessage({
  role,
  contactName,
  orderNumber,
  customerName,
  status,
  origin,
  destination,
  containerNo,
  shipName,
  awbNo,
  flightNo,
}) {
  const statusLabel = status || "booking";

  if (role === "maskapai") {
    return (
      `Halo Tim ${contactName},\n\n` +
      `Kami dari PT Daff Cargo Nusantara ingin konfirmasi update kargo penerbangan untuk pesanan *${orderNumber}* ` +
      `${awbNo ? `(No. SMU/AWB: *${awbNo}*)` : ""} ` +
      `${flightNo ? `(Flight: *${flightNo}*)` : ""} ` +
      `${origin && destination ? `(Rute: ${origin} → ${destination})` : ""}.\n\n` +
      `Apakah jadwal keberangkatan dan estimasi mendarat (ETA) on-schedule? Terima kasih.`
    );
  }

  if (role === "pelayaran") {
    return (
      `Halo Tim ${contactName},\n\n` +
      `Kami dari PT Daff Cargo Nusantara ingin konfirmasi update jadwal & posisi kapal *${shipName || "kargo"}* ` +
      `untuk pengiriman *${orderNumber}* ${containerNo ? `(No. Kontainer: *${containerNo}*)` : ""} ` +
      `${origin && destination ? `(Rute: ${origin} → ${destination})` : ""}.\n\n` +
      `Apakah keberangkatan dan estimasi sandar (ETA) on-schedule? Terima kasih.`
    );
  }

  if (role === "depo_port") {
    return (
      `Halo Tim ${contactName},\n\n` +
      `Kami dari PT Daff Cargo Nusantara ingin menanyakan status penanganan muatan pengiriman *${orderNumber}* ` +
      `${containerNo ? `(No. Kontainer: *${containerNo}*)` : ""}` +
      `${awbNo ? `(No. SMU/AWB: *${awbNo}*)` : ""}.\n\n` +
      `Apakah proses gate-in / stuffing / X-Ray sudah selesai? Terima kasih.`
    );
  }

  if (role === "supir") {
    return (
      `Halo Pak ${contactName},\n\n` +
      `Update posisi pengiriman *${orderNumber}* (kargo *${customerName}*) sudah sampai mana ya? ` +
      `Mohon kabari jika ada kendala di perjalanan. Terima kasih.`
    );
  }

  if (role === "vendor_trucking") {
    return (
      `Halo ${contactName},\n\n` +
      `Mengenai armada pengiriman *${orderNumber}* untuk customer *${customerName}* ` +
      `${origin && destination ? `(Rute: ${origin} → ${destination})` : ""}, ` +
      `apakah perjalanan lancar dan aman? Terima kasih.`
    );
  }

  // Role: Customer
  if (status === "tiba" || status === "kapal_tiba" || status === "mendarat" || status === "terkirim") {
    return (
      `Halo Bapak/Ibu ${contactName},\n\n` +
      `Kami informasikan bahwa pengiriman *${orderNumber}* dari PT Daff Cargo Nusantara ` +
      `saat ini berstatus: *${statusLabel}* di lokasi tujuan. Dokumen serah terima (POD) telah diproses.\n\n` +
      `Terima kasih atas kepercayaannya.`
    );
  }

  return (
    `Halo Bapak/Ibu ${contactName},\n\n` +
    `Update status pengiriman *${orderNumber}* dari PT Daff Cargo Nusantara saat ini: *${statusLabel}*.\n\n` +
    `Jika ada pertanyaan, silakan hubungi kami kapan saja. Terima kasih.`
  );
}

export const normalizeWhatsAppNumber = formatPhoneForWhatsApp;

export function getWhatsAppUrl(phone, message) {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(message);
  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
}
