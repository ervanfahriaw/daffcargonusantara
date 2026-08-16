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

export const normalizeWhatsAppNumber = formatPhoneForWhatsApp;

export function getWhatsAppUrl(phone, message) {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(message);
  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
}
