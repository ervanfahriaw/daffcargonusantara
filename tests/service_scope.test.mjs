import test from "node:test";
import assert from "node:assert";
import { z } from "zod";

// Enum Jenis Pengiriman (Lingkup Serah Terima)
export const jenisPengirimanEnum = z.enum(["d2d", "d2p", "p2d", "p2p"]);

export const jenisPengirimanLabels = {
  d2d: "Door to Door (D2D) — Jemput di Pengirim, Antar ke Penerima",
  d2p: "Door to Port / Airport (D2P) — Jemput di Pengirim, Ambil di Pelabuhan/Bandara",
  p2d: "Port / Airport to Door (P2D) — Antar ke Pelabuhan/Bandara, Kirim ke Penerima",
  p2p: "Port to Port / Airport to Airport (P2P) — Antar & Ambil Sendiri di Pelabuhan/Bandara",
};

// Resolver for dynamic milestone progression based on Moda + Jenis Pengiriman
export function getMilestonesForOrder(moda, jenisPengiriman = "d2d") {
  if (moda === "laut") {
    switch (jenisPengiriman) {
      case "d2d":
        return [
          "booking",
          "pickup", // Jemput & muat barang di gudang pengirim
          "gate_in_pelabuhan", // Masuk terminal pelabuhan muat (POL)
          "kapal_berangkat", // Kapal lepas jangkar (ETD)
          "pelayaran", // Pelayaran laut antarpulau
          "kapal_tiba", // Kapal sandar di pelabuhan tujuan (POD)
          "dooring", // Truk lokal mengantar kontainer ke gudang penerima
          "terkirim", // Selesai serah terima di pintu penerima & POD
        ];
      case "d2p":
        return [
          "booking",
          "pickup", // Jemput di gudang pengirim
          "gate_in_pelabuhan",
          "kapal_berangkat",
          "pelayaran",
          "kapal_tiba", // Tiba di pelabuhan tujuan
          "terkirim", // Serah terima di pelabuhan tujuan ke pihak consignee (POD)
        ];
      case "p2d":
        return [
          "booking",
          "gate_in_pelabuhan", // Pengirim antar kontainer langsung ke pelabuhan
          "kapal_berangkat",
          "pelayaran",
          "kapal_tiba",
          "dooring", // Truk lokal mengantar ke gudang penerima
          "terkirim", // POD di pintu penerima
        ];
      case "p2p":
        return [
          "booking",
          "gate_in_pelabuhan", // Terima di pelabuhan muat POL
          "kapal_berangkat",
          "pelayaran",
          "kapal_tiba", // Sandar di pelabuhan tujuan POD
          "terkirim", // Serah terima kargo di pelabuhan tujuan (POD)
        ];
      default:
        return ["booking", "pickup", "gate_in_pelabuhan", "kapal_berangkat", "pelayaran", "kapal_tiba", "dooring", "terkirim"];
    }
  }

  if (moda === "udara") {
    switch (jenisPengiriman) {
      case "d2d":
        return [
          "booking",
          "pickup", // Kurir/truk jemput di alamat pengirim
          "acceptance_bandara", // Timbang & X-Ray di Regulated Agent Bandara
          "terbang", // Pesawat lepas landas (ETD)
          "dalam_penerbangan", // In-flight antarpulau
          "mendarat", // Pesawat mendarat di bandara tujuan (ETA)
          "delivery_udara", // Pengantaran kurir bandara ke alamat penerima (Dooring)
          "terkirim", // Serah terima di pintu penerima (POD)
        ];
      case "d2p":
        return [
          "booking",
          "pickup",
          "acceptance_bandara",
          "terbang",
          "dalam_penerbangan",
          "mendarat",
          "terkirim", // Serah terima di terminal kargo bandara tujuan (POD)
        ];
      case "p2d":
        return [
          "booking",
          "acceptance_bandara", // Pengirim antar langsung ke terminal kargo bandara
          "terbang",
          "dalam_penerbangan",
          "mendarat",
          "delivery_udara", // Kurir bandara antar ke alamat penerima
          "terkirim",
        ];
      case "p2p":
        return [
          "booking",
          "acceptance_bandara",
          "terbang",
          "dalam_penerbangan",
          "mendarat",
          "terkirim", // Ambil di terminal kargo bandara tujuan (POD)
        ];
      default:
        return ["booking", "pickup", "acceptance_bandara", "terbang", "dalam_penerbangan", "mendarat", "delivery_udara", "terkirim"];
    }
  }

  // Moda Darat
  switch (jenisPengiriman) {
    case "d2d":
      return [
        "booking",
        "pickup", // Jemput di gudang pengirim
        "berangkat",
        "dalam_perjalanan",
        "tiba",
        "terkirim", // Serah terima di gudang penerima (POD)
      ];
    case "p2p": // Pool to Pool / Hub to Hub
      return [
        "booking",
        "berangkat", // Berangkat dari Pool/Hub asal
        "dalam_perjalanan",
        "tiba", // Tiba di Pool/Hub tujuan
        "terkirim", // Serah terima di pool tujuan (POD)
      ];
    case "d2p": // Door to Pool
      return [
        "booking",
        "pickup",
        "berangkat",
        "dalam_perjalanan",
        "tiba",
        "terkirim",
      ];
    case "p2d": // Pool to Door
      return [
        "booking",
        "berangkat",
        "dalam_perjalanan",
        "tiba",
        "terkirim",
      ];
    default:
      return ["booking", "pickup", "berangkat", "dalam_perjalanan", "tiba", "terkirim"];
  }
}

// Next Status Transition Engine based on (Moda, JenisPengiriman, CurrentStatus)
export function resolveNextMilestone(currentStatus, moda, jenisPengiriman = "d2d") {
  const milestones = getMilestonesForOrder(moda, jenisPengiriman);
  const currentIndex = milestones.indexOf(currentStatus);

  if (currentStatus === "terkirim") {
    return { nextStatus: null, label: "Buat Invoice Tagihan", actionType: "navigate_dokumen" };
  }
  if (currentStatus === "selesai") {
    return { nextStatus: null, label: "Pesanan Telah Selesai", actionType: "finished" };
  }
  if (currentStatus === "tertunda") {
    // Resume to the middle transit stage
    const transitStatus = moda === "udara" ? "dalam_penerbangan" : moda === "laut" ? "pelayaran" : "dalam_perjalanan";
    return { nextStatus: transitStatus, label: "Lanjutkan Pengiriman (Selesai Kendala)", actionType: "update" };
  }

  if (currentIndex === -1) {
    return { nextStatus: milestones[1] || "terkirim", label: "Perbarui Status", actionType: "update" };
  }

  if (currentIndex < milestones.length - 1) {
    const next = milestones[currentIndex + 1];
    return { nextStatus: next, label: `Lanjut ke ${next}`, actionType: "update" };
  }

  return { nextStatus: null, label: "Selesai", actionType: "finished" };
}

// ── TEST CASES ──

test("Sea Freight D2D vs P2P: Verifies full dooring steps in D2D and port pickup in P2P", () => {
  const seaD2D = getMilestonesForOrder("laut", "d2d");
  assert.ok(seaD2D.includes("pickup"), "Sea D2D must have pickup stage");
  assert.ok(seaD2D.includes("dooring"), "Sea D2D must have destination dooring stage");
  assert.strictEqual(seaD2D.length, 8);

  const seaP2P = getMilestonesForOrder("laut", "p2p");
  assert.strictEqual(seaP2P.includes("pickup"), false, "Sea P2P must NOT have initial pickup stage");
  assert.strictEqual(seaP2P.includes("dooring"), false, "Sea P2P must NOT have destination dooring stage");
  assert.strictEqual(seaP2P.length, 6);
  assert.strictEqual(seaP2P[0], "booking");
  assert.strictEqual(seaP2P[1], "gate_in_pelabuhan");
  assert.strictEqual(seaP2P[2], "kapal_berangkat");
  assert.strictEqual(seaP2P[3], "pelayaran");
  assert.strictEqual(seaP2P[4], "kapal_tiba");
  assert.strictEqual(seaP2P[5], "terkirim");
});

test("Air Freight D2D vs P2P: Verifies delivery to door in D2D and cargo terminal in P2P", () => {
  const airD2D = getMilestonesForOrder("udara", "d2d");
  assert.ok(airD2D.includes("pickup"));
  assert.ok(airD2D.includes("delivery_udara"));
  assert.strictEqual(airD2D.length, 8);

  const airP2P = getMilestonesForOrder("udara", "p2p");
  assert.strictEqual(airP2P.includes("pickup"), false);
  assert.strictEqual(airP2P.includes("delivery_udara"), false);
  assert.strictEqual(airP2P.length, 6);
  assert.strictEqual(airP2P[1], "acceptance_bandara");
  assert.strictEqual(airP2P[5], "terkirim");
});

test("Sea Freight Door to Port (D2P) and Port to Door (P2D)", () => {
  const seaD2P = getMilestonesForOrder("laut", "d2p");
  assert.ok(seaD2P.includes("pickup"), "D2P has pickup");
  assert.strictEqual(seaD2P.includes("dooring"), false, "D2P has no destination dooring");

  const seaP2D = getMilestonesForOrder("laut", "p2d");
  assert.strictEqual(seaP2D.includes("pickup"), false, "P2D has no origin pickup");
  assert.ok(seaP2D.includes("dooring"), "P2D has destination dooring");
});

test("Dynamic State Resolver: Correctly steps through P2P lifecycle", () => {
  // Booking -> Gate In Pelabuhan
  let next = resolveNextMilestone("booking", "laut", "p2p");
  assert.strictEqual(next.nextStatus, "gate_in_pelabuhan");

  // Gate In -> Kapal Berangkat
  next = resolveNextMilestone("gate_in_pelabuhan", "laut", "p2p");
  assert.strictEqual(next.nextStatus, "kapal_berangkat");

  // Kapal Tiba -> Terkirim (di pelabuhan)
  next = resolveNextMilestone("kapal_tiba", "laut", "p2p");
  assert.strictEqual(next.nextStatus, "terkirim");

  // Terkirim -> Buat Invoice
  next = resolveNextMilestone("terkirim", "laut", "p2p");
  assert.strictEqual(next.actionType, "navigate_dokumen");
});
