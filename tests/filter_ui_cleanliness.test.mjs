import test from "node:test";
import assert from "node:assert";
import {
  modaPengirimanLabels,
  jenisPengirimanLabels,
} from "../lib/validations/pesanan.ts";
import {
  kategoriKontakLabels,
  kategoriKontakStyles,
} from "../lib/validations/kontak.ts";

test("UI Labels and Enums: Zero emoji in validation dictionaries", () => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  // Verify modaPengirimanLabels contains NO emojis
  Object.entries(modaPengirimanLabels).forEach(([key, label]) => {
    assert.strictEqual(
      emojiRegex.test(label),
      false,
      `modaPengirimanLabels[${key}] should not contain emojis: "${label}"`
    );
  });

  // Verify jenisPengirimanLabels contains NO emojis
  Object.entries(jenisPengirimanLabels).forEach(([key, item]) => {
    assert.strictEqual(
      emojiRegex.test(item.title),
      false,
      `jenisPengirimanLabels[${key}].title should not contain emojis: "${item.title}"`
    );
    assert.strictEqual(
      emojiRegex.test(item.subtitle),
      false,
      `jenisPengirimanLabels[${key}].subtitle should not contain emojis: "${item.subtitle}"`
    );
    assert.strictEqual(
      emojiRegex.test(item.icon),
      false,
      `jenisPengirimanLabels[${key}].icon should not contain emojis: "${item.icon}"`
    );
  });

  // Verify kategoriKontakLabels contains NO emojis
  Object.entries(kategoriKontakLabels).forEach(([key, label]) => {
    assert.strictEqual(
      emojiRegex.test(label),
      false,
      `kategoriKontakLabels[${key}] should not contain emojis: "${label}"`
    );
  });
});

test("Contact Category styles and tabs: All 6 operational roles configured", () => {
  const expectedCategories = [
    "customer",
    "vendor_trucking",
    "supir",
    "pelayaran",
    "maskapai",
    "depo_port",
  ];

  expectedCategories.forEach((cat) => {
    assert.ok(kategoriKontakLabels[cat], `Label for category ${cat} must exist`);
    assert.ok(kategoriKontakStyles[cat], `Style for category ${cat} must exist`);
  });
});
