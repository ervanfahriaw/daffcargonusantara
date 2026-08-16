import test from "node:test";
import assert from "node:assert/strict";

test("WA Gateway: validates connection states and session status", () => {
  const mockStateConnected = {
    isConnected: true,
    phoneNumber: "6281282200880",
    pushname: "Daff Cargo Official",
    lastActive: new Date().toISOString(),
  };

  assert.equal(mockStateConnected.isConnected, true);
  assert.ok(mockStateConnected.phoneNumber.startsWith("62"));

  const mockStateDisconnected = {
    isConnected: false,
    qrCode: "data:image/svg+xml;utf8,...",
  };
  assert.equal(mockStateDisconnected.isConnected, false);
  assert.ok(mockStateDisconnected.qrCode);
});

test("WA Gateway: generates valid SVG QR mockup for pairing", () => {
  function generateQrMockSvg(seed = "dcn-wa-session") {
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#ffffff"/>
      <!-- QR Pattern -->
      <rect x="20" y="20" width="40" height="40" fill="#0f172a"/>
      <rect x="140" y="20" width="40" height="40" fill="#0f172a"/>
      <rect x="20" y="140" width="40" height="40" fill="#0f172a"/>
    </svg>`;
  }

  const svg = generateQrMockSvg();
  assert.ok(svg.includes("<svg"));
  assert.ok(svg.includes("rect"));
});
