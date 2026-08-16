import test from "node:test";
import assert from "node:assert";

// State transition logic
function getNextStatus(currentStatus) {
  switch (currentStatus) {
    case "booking":
      return {
        nextStatus: "pickup",
        label: "Catat Pickup",
        actionType: "progress",
      };
    case "pickup":
      return {
        nextStatus: "berangkat",
        label: "Tandai Berangkat",
        actionType: "progress",
      };
    case "berangkat":
      return {
        nextStatus: "dalam_perjalanan",
        label: "Update Dalam Perjalanan",
        actionType: "progress",
      };
    case "dalam_perjalanan":
      return {
        nextStatus: "tiba",
        label: "Konfirmasi Tiba di Tujuan",
        actionType: "progress",
      };
    case "tiba":
      return {
        nextStatus: "terkirim",
        label: "Upload Bukti Serah Terima (POD)",
        actionType: "progress",
      };
    case "terkirim":
      return {
        nextStatus: null,
        label: "Buat & Kirim Invoice",
        actionType: "navigate_dokumen",
      };
    case "tertunda":
      return {
        nextStatus: "dalam_perjalanan",
        label: "Lanjutkan Perjalanan",
        actionType: "progress",
      };
    case "selesai":
      return {
        nextStatus: null,
        label: "Pesanan Selesai",
        actionType: "finished",
      };
    default:
      return {
        nextStatus: null,
        label: "Update Status",
        actionType: "update",
      };
  }
}

test("Status transitions: full linear milestone progression", () => {
  let status = "booking";
  
  // 1. booking -> pickup
  let next = getNextStatus(status);
  assert.strictEqual(next.nextStatus, "pickup");
  assert.strictEqual(next.actionType, "progress");

  // 2. pickup -> berangkat
  status = next.nextStatus;
  next = getNextStatus(status);
  assert.strictEqual(next.nextStatus, "berangkat");

  // 3. berangkat -> dalam_perjalanan
  status = next.nextStatus;
  next = getNextStatus(status);
  assert.strictEqual(next.nextStatus, "dalam_perjalanan");

  // 4. dalam_perjalanan -> tiba
  status = next.nextStatus;
  next = getNextStatus(status);
  assert.strictEqual(next.nextStatus, "tiba");

  // 5. tiba -> terkirim
  status = next.nextStatus;
  next = getNextStatus(status);
  assert.strictEqual(next.nextStatus, "terkirim");

  // 6. terkirim -> navigate to invoice
  status = next.nextStatus;
  next = getNextStatus(status);
  assert.strictEqual(next.nextStatus, null);
  assert.strictEqual(next.actionType, "navigate_dokumen");
});

test("Status transitions: tertunda recovery resumes to dalam_perjalanan", () => {
  const next = getNextStatus("tertunda");
  assert.strictEqual(next.nextStatus, "dalam_perjalanan");
  assert.strictEqual(next.actionType, "progress");
});

test("Status transitions: selesai shows finished status", () => {
  const next = getNextStatus("selesai");
  assert.strictEqual(next.nextStatus, null);
  assert.strictEqual(next.actionType, "finished");
});
