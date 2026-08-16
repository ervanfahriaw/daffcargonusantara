import test from "node:test";
import assert from "node:assert";

function calculateMargin(tarif, vendor, lainnya) {
  const t = Number(tarif) || 0;
  const v = Number(vendor) || 0;
  const l = Number(lainnya) || 0;
  const totalBiaya = v + l;
  const marginRp = t - totalBiaya;
  const marginPercent = t > 0 ? (marginRp / t) * 100 : 0;

  return {
    totalBiaya,
    marginRp,
    marginPercent: Math.round(marginPercent * 10) / 10,
  };
}

function formatIDR(val) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

test("Finance calculator: normal positive margin", () => {
  const result = calculateMargin(15000000, 10000000, 500000);
  assert.strictEqual(result.totalBiaya, 10500000);
  assert.strictEqual(result.marginRp, 4500000);
  assert.strictEqual(result.marginPercent, 30);
});

test("Finance calculator: zero revenue edge case", () => {
  const result = calculateMargin(0, 5000000, 500000);
  assert.strictEqual(result.totalBiaya, 5500000);
  assert.strictEqual(result.marginRp, -5500000);
  assert.strictEqual(result.marginPercent, 0);
});

test("Finance calculator: negative margin / deficit", () => {
  const result = calculateMargin(5000000, 6000000, 1000000);
  assert.strictEqual(result.totalBiaya, 7000000);
  assert.strictEqual(result.marginRp, -2000000);
  assert.strictEqual(result.marginPercent, -40);
});

test("Currency formatting: produces standard IDR strings", () => {
  const formatted = formatIDR(15000000);
  assert.ok(formatted.includes("15.000.000") || formatted.includes("Rp"));
});
