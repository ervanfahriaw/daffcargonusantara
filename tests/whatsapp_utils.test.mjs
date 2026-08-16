import test from "node:test";
import assert from "node:assert";

function normalizePhoneNumber(phone) {
  if (!phone) return "";
  let clean = phone.replace(/[^0-9+]/g, "");
  if (clean.startsWith("+62")) {
    clean = "62" + clean.substring(3);
  } else if (clean.startsWith("62")) {
    // Already in international format
  } else if (clean.startsWith("0")) {
    clean = "62" + clean.substring(1);
  } else if (clean.startsWith("8")) {
    clean = "62" + clean;
  }
  return clean;
}

function getContextualWhatsAppMessage(role, context) {
  const {
    nomorPesanan,
    customer,
    ruteAsal,
    ruteTujuan,
    status,
    containerNo,
    shipName,
    awbNo,
    flightNo,
  } = context;

  switch (role) {
    case "maskapai":
      return `Halo Tim Maskapai, konfirmasi kargo ${nomorPesanan} (SMU/AWB: ${awbNo || "-"}, Flight: ${flightNo || "-"}) rute ${ruteAsal} ke ${ruteTujuan}.`;
    case "pelayaran":
      return `Halo Tim Pelayaran, konfirmasi jadwal & posisi kapal ${shipName || "kargo"} untuk pesanan ${nomorPesanan} (Kontainer: ${containerNo || "-"}) rute ${ruteAsal} ke ${ruteTujuan}.`;
    case "depo_port":
      return `Halo Tim Depo/Pelabuhan, mau cek status gate-in dan muat kontainer ${containerNo || "-"} pesanan ${nomorPesanan}.`;
    case "supir":
      return `Halo Pak, untuk pesanan ${nomorPesanan} (${ruteAsal} - ${ruteTujuan}), posisi sekarang ada di mana? Terima kasih.`;
    case "vendor":
      return `Halo, mau cek update armada untuk pesanan ${nomorPesanan} (${ruteAsal} - ${ruteTujuan}) atas nama ${customer}. Bagaimana progresnya?`;
    case "customer":
      if (status === "terkirim" || status === "selesai") {
        return `Halo ${customer}, pesanan ${nomorPesanan} tujuan ${ruteTujuan} telah selesai diantar. Terima kasih atas kepercayaannya pada PT Daff Cargo Nusantara.`;
      }
      return `Halo ${customer}, update untuk pengiriman ${nomorPesanan} (${ruteAsal} - ${ruteTujuan}): saat ini status ${status}.`;
    default:
      return `Halo, info terkait pesanan pengiriman ${nomorPesanan} PT Daff Cargo Nusantara.`;
  }
}

test("Normalize Indonesian phone numbers to WhatsApp format", () => {
  assert.strictEqual(normalizePhoneNumber("08123456789"), "628123456789");
  assert.strictEqual(normalizePhoneNumber("+628123456789"), "628123456789");
  assert.strictEqual(normalizePhoneNumber("0812-3456-7890"), "6281234567890");
  assert.strictEqual(normalizePhoneNumber("628123456789"), "628123456789");
  assert.strictEqual(normalizePhoneNumber(" 0852 9988 7766 "), "6285299887766");
});

test("Generate contextual WhatsApp messages for all operational roles", () => {
  const context = {
    nomorPesanan: "DCN-202608-0001",
    customer: "PT Sentosa",
    ruteAsal: "Jakarta (CGK)",
    ruteTujuan: "Balikpapan (BPN)",
    status: "dalam_penerbangan",
    containerNo: "MRTU-123456-7",
    shipName: "KM Meratus Makassar",
    awbNo: "126-99887766",
    flightNo: "GA-512",
  };

  const maskapaiMsg = getContextualWhatsAppMessage("maskapai", context);
  assert.ok(maskapaiMsg.includes("126-99887766"));
  assert.ok(maskapaiMsg.includes("GA-512"));

  const pelayaranMsg = getContextualWhatsAppMessage("pelayaran", context);
  assert.ok(pelayaranMsg.includes("KM Meratus Makassar"));
  assert.ok(pelayaranMsg.includes("MRTU-123456-7"));

  const supirMsg = getContextualWhatsAppMessage("supir", context);
  assert.ok(supirMsg.includes("DCN-202608-0001"));
  assert.ok(supirMsg.includes("posisi sekarang"));

  const depoMsg = getContextualWhatsAppMessage("depo_port", context);
  assert.ok(depoMsg.includes("gate-in"));

  const vendorMsg = getContextualWhatsAppMessage("vendor", context);
  assert.ok(vendorMsg.includes("PT Sentosa"));

  const custMsg = getContextualWhatsAppMessage("customer", context);
  assert.ok(custMsg.includes("PT Sentosa"));
  assert.ok(custMsg.includes("dalam_penerbangan"));
});
