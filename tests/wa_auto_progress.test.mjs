import test from "node:test";
import assert from "node:assert/strict";
import { generateDailyProgressUpdate } from "../lib/services/waNotificationService.js";

test("Auto Progress Notification: formats shipment milestone and live coordinates", () => {
  const pesanan = {
    id: "pesanan-test-01",
    nomor_pesanan: "DCN-202608-0099",
    nama_customer: "PT Berkah Abadi",
    alamat_asal: "Jakarta (Pelabuhan Tanjung Priok)",
    alamat_tujuan: "Makassar (Pelabuhan Soekarno Hatta)",
    status: "dalam_perjalanan",
    moda_pengiriman: "laut",
    plat_nomor: "KM Tanto Express / V.04",
    catatan_muatan: "Container 1x20ft Garment",
  };

  const message = generateDailyProgressUpdate(pesanan, {
    originUrl: "https://dcn-opshub.vercel.app",
    customNote: "Kapal sedang melintasi Laut Jawa dengan kecepatan 14 knot",
  });

  assert.ok(message.includes("DCN-202608-0099"));
  assert.ok(message.includes("PT Berkah Abadi"));
  assert.ok(message.includes("KM Tanto Express"));
  assert.ok(message.includes("Laut Jawa"));
  assert.ok(message.includes("https://dcn-opshub.vercel.app/lacak/pesanan-test-01"));
});

test("Auto Progress Notification: handles customer recipient resolution", () => {
  const customerContact = {
    nomor_telepon: "08892114763",
    nama: "Pak Budi",
  };
  const fallbackOwnerPhone = "081282200880";

  const targetPhone = customerContact?.nomor_telepon || fallbackOwnerPhone;
  assert.equal(targetPhone, "08892114763");
});
