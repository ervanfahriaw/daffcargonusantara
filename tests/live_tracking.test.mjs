import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveCoordinatesForLocation,
  calculateBearing,
  calculateDistanceKm,
  interpolatePositionOnRoute,
  getShipmentTrackingState,
  generatePublicTrackingUrl,
  generateCustomerTrackingMessage,
} from "../lib/utils/geoTracking.js";

test("GeoTracking: resolves known Indonesian ports, airports, and cities", () => {
  // Test Pelabuhan Tanjung Priok
  const priok = resolveCoordinatesForLocation("Pelabuhan Tanjung Priok (Jakarta)", "laut");
  assert.ok(priok);
  assert.equal(typeof priok.lat, "number");
  assert.equal(typeof priok.lng, "number");
  assert.ok(priok.lat < 0); // Southern hemisphere (Indonesia)
  assert.ok(priok.lng > 100);

  // Test Pelabuhan Soekarno Hatta Makassar
  const makassarPort = resolveCoordinatesForLocation("Pelabuhan Soekarno-Hatta (Makassar)", "laut");
  assert.ok(makassarPort);
  assert.ok(makassarPort.lng > 118);

  // Test Bandara CGK
  const cgk = resolveCoordinatesForLocation("Bandara Soekarno-Hatta (CGK - Jakarta)", "udara");
  assert.ok(cgk);

  // Test Bandara UPG
  const upg = resolveCoordinatesForLocation("Bandara Sultan Hasanuddin (UPG - Makassar)", "udara");
  assert.ok(upg);

  // Test Land City (Surabaya)
  const sby = resolveCoordinatesForLocation("Jl. Margomulyo Indah No. 12, Surabaya, Jawa Timur", "darat");
  assert.ok(sby);
  assert.ok(sby.name.includes("Surabaya") || sby.lat !== 0);
});

test("GeoTracking: calculates distance and bearing accurately", () => {
  const jakarta = { lat: -6.1754, lng: 106.8272 };
  const surabaya = { lat: -7.2575, lng: 112.7521 };

  const distanceKm = calculateDistanceKm(jakarta.lat, jakarta.lng, surabaya.lat, surabaya.lng);
  assert.ok(distanceKm > 600 && distanceKm < 800, `Expected ~650-750km, got ${distanceKm}`);

  const bearing = calculateBearing(jakarta.lat, jakarta.lng, surabaya.lat, surabaya.lng);
  assert.ok(bearing >= 0 && bearing <= 360);
  assert.ok(bearing > 80 && bearing < 120, `Expected East-Southeast bearing ~90-110, got ${bearing}`);
});

test("GeoTracking: interpolates position along maritime route based on status", () => {
  const pesananLaut = {
    id: "pesanan-sea-123",
    nomor_pesanan: "DCN-202608-0088",
    moda_pengiriman: "laut",
    status: "pelayaran",
    alamat_asal: "Pelabuhan Tanjung Priok (Jakarta)",
    alamat_tujuan: "Pelabuhan Soekarno-Hatta (Makassar)",
    catatan_muatan: "[MODA: LAUT ANTARPULAU] | Layanan: FCL_20FT | POL: Tanjung Priok | POD: Makassar | Kapal: KM Dharma Rencana IX",
  };

  const tracking = getShipmentTrackingState(pesananLaut);
  assert.ok(tracking);
  assert.ok(tracking.currentPosition);
  assert.equal(typeof tracking.currentPosition.lat, "number");
  assert.equal(typeof tracking.currentPosition.lng, "number");
  assert.ok(tracking.progressPercent >= 50 && tracking.progressPercent <= 75);
  assert.ok(tracking.speedText);
  assert.equal(tracking.vehicleType, "kapal");
  assert.ok(tracking.vehicleName.includes("KM Dharma Rencana IX") || tracking.vehicleName.includes("Kapal"));
});

test("GeoTracking: interpolates position for express air flight", () => {
  const pesananUdara = {
    id: "pesanan-air-456",
    nomor_pesanan: "DCN-202608-0099",
    moda_pengiriman: "udara",
    status: "dalam_penerbangan",
    alamat_asal: "Bandara Soekarno-Hatta (CGK - Jakarta)",
    alamat_tujuan: "Bandara Sultan Hasanuddin (UPG - Makassar)",
    catatan_muatan: "[MODA: UDARA AIR FREIGHT] | Layanan: EXPRESS | Airlines: Garuda Indonesia | Flight: GA-608",
  };

  const tracking = getShipmentTrackingState(pesananUdara);
  assert.ok(tracking);
  assert.equal(tracking.vehicleType, "pesawat");
  assert.ok(tracking.vehicleName.includes("GA-608") || tracking.vehicleName.includes("Garuda"));
  assert.ok(tracking.progressPercent > 40);
  assert.ok(tracking.altitudeText);
});

test("GeoTracking: generates public tracking link and customer WhatsApp message", () => {
  const pesanan = {
    id: "uuid-1234-abcd",
    nomor_pesanan: "DCN-202608-0042",
    nama_customer: "PT Berkah Nusantara",
    alamat_asal: "Jakarta Utara",
    alamat_tujuan: "Makassar",
    status: "dalam_perjalanan",
    catatan_muatan: "[MODA: DARAT TRUCKING]",
  };

  const trackingUrl = generatePublicTrackingUrl(pesanan.id, "https://opshub.daffcargo.com");
  assert.equal(trackingUrl, "https://opshub.daffcargo.com/lacak/uuid-1234-abcd");

  const message = generateCustomerTrackingMessage(pesanan, trackingUrl);
  assert.ok(message.includes("PT Berkah Nusantara"));
  assert.ok(message.includes("DCN-202608-0042"));
  assert.ok(message.includes(trackingUrl));
  assert.ok(message.includes("Dalam Perjalanan") || message.includes("dalam_perjalanan"));
});
