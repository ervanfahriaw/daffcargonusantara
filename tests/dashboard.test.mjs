import test from "node:test";
import assert from "node:assert";

function computeDashboardSummary(shipments, contacts = []) {
  const items = shipments || [];
  
  const sedangBerjalan = items.filter((i) => i.status !== "selesai").length;
  const perluPerhatian = items.filter(
    (i) => i.status === "tertunda" || i.status === "booking"
  ).length;
  const selesai = items.filter((i) => i.status === "selesai").length;
  const totalPesanan = items.length;
  
  const totalTarifCustomer = items.reduce((acc, curr) => acc + (Number(curr.tarif_customer) || 0), 0);
  const totalMarginEstimasi = items.reduce((acc, curr) => {
    const tarif = Number(curr.tarif_customer) || 0;
    const vendor = Number(curr.biaya_vendor) || 0;
    const lainnya = Number(curr.biaya_lainnya) || 0;
    return acc + (tarif - vendor - lainnya);
  }, 0);

  return {
    sedangBerjalan,
    perluPerhatian,
    selesai,
    totalPesanan,
    totalTarifCustomer,
    totalMarginEstimasi,
    totalKontak: contacts.length,
  };
}

test("Dashboard Summary: calculates operational metrics accurately", () => {
  const mockShipments = [
    { id: "1", status: "booking", tarif_customer: 5000000, biaya_vendor: 3000000, biaya_lainnya: 500000 },
    { id: "2", status: "dalam_perjalanan", tarif_customer: 10000000, biaya_vendor: 7000000, biaya_lainnya: 500000 },
    { id: "3", status: "tertunda", tarif_customer: 8000000, biaya_vendor: 5000000, biaya_lainnya: 500000 },
    { id: "4", status: "selesai", tarif_customer: 12000000, biaya_vendor: 8000000, biaya_lainnya: 1000000 },
  ];

  const mockContacts = [{ id: "c1" }, { id: "c2" }, { id: "c3" }];

  const summary = computeDashboardSummary(mockShipments, mockContacts);

  // 3 sedang berjalan (booking, dalam_perjalanan, tertunda)
  assert.strictEqual(summary.sedangBerjalan, 3);
  // 2 perlu perhatian (booking, tertunda)
  assert.strictEqual(summary.perluPerhatian, 2);
  // 1 selesai
  assert.strictEqual(summary.selesai, 1);
  // Total 4 pesanan
  assert.strictEqual(summary.totalPesanan, 4);
  // Total tarif = 35.000.000
  assert.strictEqual(summary.totalTarifCustomer, 35000000);
  // Total margin = (1.5M + 2.5M + 2.5M + 3M) = 9.5M
  assert.strictEqual(summary.totalMarginEstimasi, 9500000);
  // Total contacts = 3
  assert.strictEqual(summary.totalKontak, 3);
});

test("Dashboard Summary: handles empty datasets gracefully", () => {
  const summary = computeDashboardSummary([], []);
  assert.strictEqual(summary.sedangBerjalan, 0);
  assert.strictEqual(summary.perluPerhatian, 0);
  assert.strictEqual(summary.selesai, 0);
  assert.strictEqual(summary.totalPesanan, 0);
  assert.strictEqual(summary.totalTarifCustomer, 0);
  assert.strictEqual(summary.totalMarginEstimasi, 0);
  assert.strictEqual(summary.totalKontak, 0);
});
