import test from "node:test";
import assert from "node:assert/strict";
import {
  generateDailyProgressUpdate,
  generateDocumentShareMessage,
  calculateSafeDispatchSchedule,
  buildWhatsAppSendUrl,
  createBatchNotificationQueue,
  GREETING_TEMPLATES,
} from "../lib/services/waNotificationService.js";

test("WA Notification Service: generates varied, human-like daily progress updates", () => {
  const pesanan = {
    id: "pesanan-001",
    nomor_pesanan: "DCN-202608-0088",
    nama_customer: "PT Samudera Bahari",
    alamat_asal: "Pelabuhan Tanjung Priok (Jakarta)",
    alamat_tujuan: "Pelabuhan Soekarno-Hatta (Makassar)",
    status: "pelayaran",
    moda_pengiriman: "laut",
    catatan_muatan: "[MODA: LAUT ANTARPULAU] | Layanan: FCL_20FT | POL: Tanjung Priok | POD: Makassar | Kapal: KM Dharma Rencana IX",
    kontak_customer: {
      nomor_telepon: "081288990011",
    },
  };

  const update1 = generateDailyProgressUpdate(pesanan, { greetingIndex: 0 });
  const update2 = generateDailyProgressUpdate(pesanan, { greetingIndex: 1 });

  assert.ok(update1.includes("PT Samudera Bahari"));
  assert.ok(update1.includes("DCN-202608-0088"));
  assert.ok(update1.includes("KM Dharma Rencana IX") || update1.includes("Kapal"));
  assert.ok(update1.includes("lacak/pesanan-001") || update1.includes("Live Tracking"));

  // Check variation to avoid identical messages (anti-spam)
  assert.notEqual(update1, update2);
});

test("WA Notification Service: generates document delivery message with PDF link", () => {
  const pesanan = {
    id: "pesanan-002",
    nomor_pesanan: "DCN-202608-0099",
    nama_customer: "CV Berkah Abadi",
    alamat_asal: "Jakarta",
    alamat_tujuan: "Surabaya",
    status: "dalam_perjalanan",
  };

  // Surat Jalan
  const sjMsg = generateDocumentShareMessage(pesanan, "surat_jalan", "https://opshub.daffcargo.com/api/documents/pesanan-002/surat_jalan");
  assert.ok(sjMsg.includes("SURAT JALAN"));
  assert.ok(sjMsg.includes("DCN-202608-0099"));
  assert.ok(sjMsg.includes("https://opshub.daffcargo.com/api/documents/pesanan-002/surat_jalan"));

  // Invoice
  const invMsg = generateDocumentShareMessage(pesanan, "invoice", "https://opshub.daffcargo.com/api/documents/pesanan-002/invoice");
  assert.ok(invMsg.includes("INVOICE"));
  assert.ok(invMsg.includes("https://opshub.daffcargo.com/api/documents/pesanan-002/invoice"));

  // Bukti Serah Terima / POD
  const podMsg = generateDocumentShareMessage(pesanan, "pod", "https://opshub.daffcargo.com/api/documents/pesanan-002/pod");
  assert.ok(podMsg.includes("BUKTI SERAH TERIMA (POD)"));
});

test("WA Notification Service: anti-ban safe schedule calculates randomized delay intervals", () => {
  const items = [
    { id: "1", phone: "081234567890", text: "Msg 1" },
    { id: "2", phone: "081234567891", text: "Msg 2" },
    { id: "3", phone: "081234567892", text: "Msg 3" },
    { id: "4", phone: "081234567893", text: "Msg 4" },
  ];

  const schedule = calculateSafeDispatchSchedule(items, 4000, 2000);
  assert.equal(schedule.length, 4);
  assert.equal(schedule[0].delayMs, 0); // First message starts immediately

  // Subsequent messages have delays between 4000ms and 6000ms
  for (let i = 1; i < schedule.length; i++) {
    const gap = schedule[i].delayMs - schedule[i - 1].delayMs;
    assert.ok(gap >= 3500 && gap <= 7000, `Expected safe gap ~4000-6000ms, got ${gap}ms`);
  }
});

test("WA Notification Service: builds direct WhatsApp web link with valid formatting", () => {
  const url = buildWhatsAppSendUrl("081282200880", "Halo Daff Cargo!");
  assert.ok(url.startsWith("https://wa.me/6281282200880"));
  assert.ok(url.includes("text=Halo%20Daff%20Cargo!"));
});

test("WA Notification Service: compiles batch active shipments queue correctly", () => {
  const shipments = [
    { id: "p1", status: "dalam_perjalanan", nama_customer: "Cust A", nomor_pesanan: "DCN-1", kontak_customer: { nomor_telepon: "08111" } },
    { id: "p2", status: "pelayaran", nama_customer: "Cust B", nomor_pesanan: "DCN-2", kontak_customer: { nomor_telepon: "08222" } },
    { id: "p3", status: "selesai", nama_customer: "Cust C", nomor_pesanan: "DCN-3" }, // Should be excluded because it's completed
  ];

  const queue = createBatchNotificationQueue(shipments);
  assert.equal(queue.length, 2);
  assert.equal(queue[0].pesananId, "p1");
  assert.equal(queue[1].pesananId, "p2");
  assert.ok(queue[0].message);
  assert.ok(queue[0].waUrl);
});
