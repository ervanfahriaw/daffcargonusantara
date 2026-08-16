/**
 * GeoTracking Utility & Coordinate Database
 * PT Daff Cargo Nusantara — Domestic Freight Operations
 */

export interface GeoCoordinate {
  lat: number;
  lng: number;
  name: string;
}

export interface TrackingWaypoint {
  lat: number;
  lng: number;
  title: string;
}

export interface LiveTrackingState {
  origin: GeoCoordinate;
  destination: GeoCoordinate;
  waypoints: TrackingWaypoint[];
  currentPosition: {
    lat: number;
    lng: number;
    heading: number; // degrees 0-360
  };
  progressPercent: number;
  vehicleType: "truk" | "kapal" | "pesawat";
  vehicleName: string;
  speedText: string;
  altitudeText?: string;
  etaText: string;
  totalDistanceKm: number;
  remainingDistanceKm: number;
  statusLabel: string;
}

// ── 1. Database Koordinat Pelabuhan Utama Indonesia ──
export const PELABUHAN_COORDINATES: Record<string, GeoCoordinate> = {
  tanjung_priok: { lat: -6.1018, lng: 106.8833, name: "Pelabuhan Tanjung Priok (Jakarta)" },
  tanjung_perak: { lat: -7.2023, lng: 112.7317, name: "Pelabuhan Tanjung Perak (Surabaya)" },
  belawan: { lat: 3.7842, lng: 98.6853, name: "Pelabuhan Belawan (Medan)" },
  makassar: { lat: -5.1189, lng: 119.4147, name: "Pelabuhan Soekarno-Hatta (Makassar)" },
  banjarmasin: { lat: -3.3421, lng: 114.5719, name: "Pelabuhan Trisakti (Banjarmasin)" },
  pontianak: { lat: -0.0247, lng: 109.3364, name: "Pelabuhan Dwikora (Pontianak)" },
  balikpapan: { lat: -1.2725, lng: 116.8153, name: "Pelabuhan Semayang (Balikpapan)" },
  manado: { lat: 1.4422, lng: 125.1928, name: "Pelabuhan Bitung (Manado)" },
  ambon: { lat: -3.6933, lng: 128.1814, name: "Pelabuhan Yos Sudarso (Ambon)" },
  jayapura: { lat: -2.5337, lng: 140.7181, name: "Pelabuhan Jayapura (Papua)" },
  padang: { lat: -0.9989, lng: 100.3708, name: "Pelabuhan Teluk Bayur (Padang)" },
  lampung: { lat: -5.4744, lng: 105.3142, name: "Pelabuhan Panjang (Lampung)" },
  bali: { lat: -8.7497, lng: 115.2153, name: "Pelabuhan Benoa (Bali)" },
  kupang: { lat: -10.1878, lng: 123.5414, name: "Pelabuhan Tenau (Kupang)" },
};

// ── 2. Database Koordinat Bandara Kargo Utama Indonesia ──
export const BANDARA_COORDINATES: Record<string, GeoCoordinate> = {
  cgk: { lat: -6.1256, lng: 106.6558, name: "Bandara Soekarno-Hatta (CGK - Jakarta)" },
  hlp: { lat: -6.2655, lng: 106.8906, name: "Bandara Halim Perdanakusuma (HLP - Jakarta)" },
  sub: { lat: -7.3798, lng: 112.7874, name: "Bandara Juanda (SUB - Surabaya)" },
  kno: { lat: 3.6422, lng: 98.8853, name: "Bandara Kualanamu (KNO - Medan)" },
  upg: { lat: -5.0617, lng: 119.554, name: "Bandara Sultan Hasanuddin (UPG - Makassar)" },
  bpn: { lat: -1.2683, lng: 116.8944, name: "Bandara Sepinggan (BPN - Balikpapan)" },
  pnk: { lat: -0.1506, lng: 109.4039, name: "Bandara Supadio (PNK - Pontianak)" },
  bdj: { lat: -3.4475, lng: 114.7619, name: "Bandara Syamsudin Noor (BDJ - Banjarmasin)" },
  mdc: { lat: 1.5497, lng: 124.9264, name: "Bandara Sam Ratulangi (MDC - Manado)" },
  amq: { lat: -3.7099, lng: 128.0894, name: "Bandara Pattimura (AMQ - Ambon)" },
  djj: { lat: -2.5769, lng: 140.5161, name: "Bandara Sentani (DJJ - Jayapura)" },
  dps: { lat: -8.7482, lng: 115.1672, name: "Bandara I Gusti Ngurah Rai (DPS - Denpasar Bali)" },
  bth: { lat: 1.1211, lng: 104.1189, name: "Bandara Hang Nadim (BTH - Batam)" },
  pdg: { lat: -0.7875, lng: 100.2808, name: "Bandara Minangkabau (PDG - Padang)" },
  plm: { lat: -2.8986, lng: 104.7003, name: "Bandara Sultan Mahmud Badaruddin II (PLM - Palembang)" },
  tkg: { lat: -5.2425, lng: 105.1789, name: "Bandara Radin Inten II (TKG - Lampung)" },
  koe: { lat: -10.1714, lng: 123.6708, name: "Bandara El Tari (KOE - Kupang)" },
  lop: { lat: -8.7606, lng: 116.2764, name: "Bandara Lombok Zainuddin Abdul Madjid (LOP - Mataram)" },
};

// ── 3. Database Koordinat Kota Domestik (Truk Darat) ──
export const KOTA_COORDINATES: Record<string, GeoCoordinate> = {
  jakarta: { lat: -6.1754, lng: 106.8272, name: "Jakarta" },
  surabaya: { lat: -7.2575, lng: 112.7521, name: "Surabaya" },
  semarang: { lat: -6.9667, lng: 110.4167, name: "Semarang" },
  bandung: { lat: -6.9175, lng: 107.6191, name: "Bandung" },
  medan: { lat: 3.5952, lng: 98.6722, name: "Medan" },
  palembang: { lat: -2.9761, lng: 104.7754, name: "Palembang" },
  lampung: { lat: -5.45, lng: 105.2667, name: "Bandar Lampung" },
  denpasar: { lat: -8.6705, lng: 115.2126, name: "Denpasar, Bali" },
  yogyakarta: { lat: -7.7956, lng: 110.3695, name: "Yogyakarta" },
  solo: { lat: -7.5755, lng: 110.8243, name: "Surakarta (Solo)" },
  malang: { lat: -7.9666, lng: 112.6326, name: "Malang" },
  makassar: { lat: -5.1477, lng: 119.4327, name: "Makassar" },
  balikpapan: { lat: -1.2379, lng: 116.8529, name: "Balikpapan" },
  banjarmasin: { lat: -3.3194, lng: 114.5908, name: "Banjarmasin" },
  pontianak: { lat: -0.0263, lng: 109.3425, name: "Pontianak" },
  cirebon: { lat: -6.732, lng: 108.5523, name: "Cirebon" },
  bekasi: { lat: -6.2383, lng: 106.9756, name: "Bekasi" },
  tangerang: { lat: -6.1783, lng: 106.6319, name: "Tangerang" },
  depok: { lat: -6.4025, lng: 106.7942, name: "Depok" },
  bogor: { lat: -6.5971, lng: 106.806, name: "Bogor" },
};

/**
 * Resolusi string lokasi ke koordinat geografis
 */
export function resolveCoordinatesForLocation(
  locationStr: string,
  moda: "darat" | "laut" | "udara" = "darat"
): GeoCoordinate {
  const norm = (locationStr || "").toLowerCase();

  if (moda === "laut") {
    for (const [key, coord] of Object.entries(PELABUHAN_COORDINATES)) {
      if (norm.includes(key) || norm.includes(coord.name.toLowerCase())) {
        return coord;
      }
    }
  } else if (moda === "udara") {
    for (const [key, coord] of Object.entries(BANDARA_COORDINATES)) {
      if (norm.includes(key) || norm.includes(coord.name.toLowerCase())) {
        return coord;
      }
    }
  }

  // Cek database kota
  for (const [key, coord] of Object.entries(KOTA_COORDINATES)) {
    if (norm.includes(key) || norm.includes(coord.name.toLowerCase())) {
      return coord;
    }
  }

  // Fallback heuristik berdasar kata kunci pulau/daerah
  if (norm.includes("surabaya") || norm.includes("jatim") || norm.includes("perak")) {
    return KOTA_COORDINATES.surabaya;
  }
  if (norm.includes("makassar") || norm.includes("sulsel") || norm.includes("ujung pandang")) {
    return KOTA_COORDINATES.makassar;
  }
  if (norm.includes("medan") || norm.includes("sumut") || norm.includes("belawan")) {
    return KOTA_COORDINATES.medan;
  }
  if (norm.includes("balikpapan") || norm.includes("kaltim")) {
    return KOTA_COORDINATES.balikpapan;
  }
  if (norm.includes("banjarmasin") || norm.includes("kalsel")) {
    return KOTA_COORDINATES.banjarmasin;
  }
  if (norm.includes("pontianak") || norm.includes("kalbar")) {
    return KOTA_COORDINATES.pontianak;
  }
  if (norm.includes("bali") || norm.includes("denpasar") || norm.includes("benoa")) {
    return KOTA_COORDINATES.denpasar;
  }
  if (norm.includes("semarang") || norm.includes("jateng")) {
    return KOTA_COORDINATES.semarang;
  }
  if (norm.includes("bandung") || norm.includes("jabar")) {
    return KOTA_COORDINATES.bandung;
  }
  if (norm.includes("lampung")) {
    return KOTA_COORDINATES.lampung;
  }
  if (norm.includes("palembang") || norm.includes("sumsel")) {
    return KOTA_COORDINATES.palembang;
  }

  // Default fallback ke Jakarta
  return { lat: -6.1754, lng: 106.8272, name: locationStr || "Jakarta" };
}

/**
 * Menghitung jarak Haversine (Km) antara dua titik koordinat
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius bumi dalam KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Menghitung Bearing / Arah Hadap (derajat 0-360) dari titik 1 ke titik 2
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const y =
    Math.sin(((lon2 - lon1) * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

/**
 * Interpolasi titik di sepanjang rute berdasarkan persentase kemajuan (0..1)
 */
export function interpolatePositionOnRoute(
  origin: GeoCoordinate,
  destination: GeoCoordinate,
  progress: number,
  isMaritimeCurve: boolean = false
): { lat: number; lng: number; heading: number } {
  const t = Math.max(0, Math.min(1, progress));

  let lat = origin.lat + (destination.lat - origin.lat) * t;
  let lng = origin.lng + (destination.lng - origin.lng) * t;

  // Jika rute laut antarpulau, tambahkan lengkungan alur laut realistis (ALKI)
  if (isMaritimeCurve && t > 0.05 && t < 0.95) {
    const curveOffset = Math.sin(t * Math.PI) * 0.35;
    // Lengkungkan ke arah laut terbuka
    lat += curveOffset * (destination.lng > origin.lng ? -0.5 : 0.5);
  }

  const heading = calculateBearing(origin.lat, origin.lng, destination.lat, destination.lng);

  return {
    lat: Number(lat.toFixed(5)),
    lng: Number(lng.toFixed(5)),
    heading,
  };
}

/**
 * Menghitung persentase progres dan status label berdasarkan status pesanan
 */
export function getProgressForStatus(
  status: string,
  moda: "darat" | "laut" | "udara"
): { percent: number; label: string } {
  switch (status) {
    case "booking":
      return { percent: 5, label: "Booking Terdaftar (Persiapan)" };
    case "pickup":
      return { percent: 15, label: "Muat / Penjemputan Muatan" };
    case "stuffing":
      return { percent: 20, label: "Stuffing Kontainer Depo" };
    case "gate_in_pelabuhan":
      return { percent: 30, label: "Gate-In Terminal Pelabuhan" };
    case "acceptance_bandara":
      return { percent: 20, label: "Acceptance & Timbang RA" };
    case "masuk_terminal_kargo":
      return { percent: 30, label: "Terbit SMU / Terminal Kargo" };
    case "berangkat":
      return { percent: 35, label: "Armada Mulai Bergerak" };
    case "kapal_berangkat":
      return { percent: 38, label: "Kapal Lepas Jangkar (ETD)" };
    case "terbang":
      return { percent: 38, label: "Pesawat Lepas Landas (ETD)" };
    case "dalam_perjalanan":
      return { percent: 62, label: "Sedang Dalam Perjalanan Darat" };
    case "pelayaran":
      return { percent: 65, label: "Kapal Dalam Pelayaran Laut" };
    case "dalam_penerbangan":
      return { percent: 68, label: "Pesawat Dalam Penerbangan Udara" };
    case "mendarat":
      return { percent: 85, label: "Pesawat Telah Mendarat (ETA)" };
    case "kapal_tiba":
      return { percent: 85, label: "Kapal Sandar & Bongkar (POD)" };
    case "tiba":
      return { percent: 92, label: "Tiba di Lokasi Tujuan" };
    case "delivery_udara":
      return { percent: 92, label: "Pengantaran Kurir Bandara (Dooring)" };
    case "dooring":
      return { percent: 92, label: "Pengantaran Darat (Dooring)" };
    case "terkirim":
    case "selesai":
      return { percent: 100, label: "Barang Diterima (POD Selesai)" };
    case "tertunda":
      return { percent: 50, label: "Pengiriman Mengalami Kendala (Tertunda)" };
    default:
      return { percent: 10, label: "Dalam Proses" };
  }
}

/**
 * Menyusun State Live Tracking lengkap dari objek pesanan
 */
export function getShipmentTrackingState(pesanan: {
  id: string;
  nomor_pesanan: string;
  alamat_asal: string;
  alamat_tujuan: string;
  status: string;
  moda_pengiriman?: string;
  catatan_muatan?: string | null;
  plat_nomor?: string | null;
}): LiveTrackingState {
  // Deteksi moda
  let moda: "darat" | "laut" | "udara" = "darat";
  if (
    pesanan.catatan_muatan?.includes("[MODA: UDARA") ||
    pesanan.moda_pengiriman === "udara" ||
    [
      "acceptance_bandara",
      "masuk_terminal_kargo",
      "terbang",
      "dalam_penerbangan",
      "mendarat",
      "delivery_udara",
    ].includes(pesanan.status)
  ) {
    moda = "udara";
  } else if (
    pesanan.catatan_muatan?.includes("[MODA: LAUT") ||
    pesanan.moda_pengiriman === "laut" ||
    [
      "stuffing",
      "gate_in_pelabuhan",
      "kapal_berangkat",
      "pelayaran",
      "kapal_tiba",
      "dooring",
    ].includes(pesanan.status)
  ) {
    moda = "laut";
  }

  // Parse POL/POD/Airlines dari catatan muatan
  const origin = resolveCoordinatesForLocation(pesanan.alamat_asal, moda);
  const destination = resolveCoordinatesForLocation(pesanan.alamat_tujuan, moda);

  const { percent, label: statusLabel } = getProgressForStatus(pesanan.status, moda);
  const totalDistance = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const remainingDistance = Math.round(totalDistance * (1 - percent / 100));

  const isMaritime = moda === "laut";
  const pos = interpolatePositionOnRoute(origin, destination, percent / 100, isMaritime);

  // Parse Vehicle Name
  let vehicleName = "";
  if (moda === "laut") {
    const matchKapal = pesanan.catatan_muatan?.match(/Kapal:\s*([^|\n]+)/i);
    vehicleName = matchKapal
      ? matchKapal[1].trim()
      : pesanan.plat_nomor
      ? pesanan.plat_nomor
      : "Kapal Kargo Kontainer";
  } else if (moda === "udara") {
    const matchFlight = pesanan.catatan_muatan?.match(/Flight:\s*([^|\n]+)/i);
    const matchAirlines = pesanan.catatan_muatan?.match(/Airlines:\s*([^|\n]+)/i);
    vehicleName =
      [matchAirlines ? matchAirlines[1].trim() : null, matchFlight ? matchFlight[1].trim() : null]
        .filter(Boolean)
        .join(" ") ||
      (pesanan.plat_nomor ? `Penerbangan ${pesanan.plat_nomor}` : "Pesawat Kargo Express");
  } else {
    vehicleName = pesanan.plat_nomor ? `Truk (${pesanan.plat_nomor})` : "Armada Truk Domestik";
  }

  // Speed and altitude simulation
  let speedText = "0 Km/jam";
  let altitudeText: string | undefined;

  if (["dalam_perjalanan", "berangkat", "dooring"].includes(pesanan.status)) {
    speedText = "62 Km/jam";
  } else if (["pelayaran", "kapal_berangkat"].includes(pesanan.status)) {
    speedText = "14.5 Knot (~27 Km/jam)";
  } else if (["dalam_penerbangan", "terbang"].includes(pesanan.status)) {
    speedText = "780 Km/jam (420 Knot)";
    altitudeText = "34.000 Kaki (FL340)";
  } else if (pesanan.status === "terkirim" || pesanan.status === "selesai") {
    speedText = "Telah Sandar / Tiba di Tujuan";
  }

  // ETA calculation
  let etaText = "Sesuai Jadwal";
  if (remainingDistance > 0) {
    if (moda === "udara") {
      const hoursLeft = Math.max(0.5, remainingDistance / 700);
      etaText = `~${hoursLeft.toFixed(1)} Jam lagi`;
    } else if (moda === "laut") {
      const daysLeft = Math.max(0.5, remainingDistance / 450);
      etaText = `~${daysLeft.toFixed(1)} Hari lagi`;
    } else {
      const hoursLeft = Math.max(1, remainingDistance / 50);
      etaText = `~${Math.round(hoursLeft)} Jam lagi`;
    }
  } else {
    etaText = "Telah Tiba";
  }

  return {
    origin,
    destination,
    waypoints: [
      { lat: origin.lat, lng: origin.lng, title: `Asal: ${origin.name}` },
      { lat: destination.lat, lng: destination.lng, title: `Tujuan: ${destination.name}` },
    ],
    currentPosition: pos,
    progressPercent: percent,
    vehicleType: moda === "laut" ? "kapal" : moda === "udara" ? "pesawat" : "truk",
    vehicleName,
    speedText,
    altitudeText,
    etaText,
    totalDistanceKm: totalDistance,
    remainingDistanceKm: remainingDistance,
    statusLabel,
  };
}

/**
 * Generate public URL untuk live tracking yang bisa dibuka customer tanpa login
 */
export function generatePublicTrackingUrl(pesananId: string, originUrl?: string): string {
  const base = originUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/lacak/${pesananId}`;
}

/**
 * Format pesan WhatsApp siap kirim untuk update live tracking ke customer
 */
export function generateCustomerTrackingMessage(
  pesanan: {
    id: string;
    nomor_pesanan: string;
    nama_customer: string;
    alamat_asal: string;
    alamat_tujuan: string;
    status: string;
    catatan_muatan?: string | null;
    plat_nomor?: string | null;
  },
  trackingUrl: string
): string {
  const tracking = getShipmentTrackingState(pesanan);
  const vehicleEmoji = tracking.vehicleType === "kapal" ? "🚢" : tracking.vehicleType === "pesawat" ? "✈️" : "🚚";

  return `*UPDATE LIVE TRACKING — PT DAFF CARGO NUSANTARA*

Halo Bapak/Ibu *${pesanan.nama_customer}*,
Berikut informasi progres & posisi pengiriman muatan Anda:

📦 *No. Pesanan:* ${pesanan.nomor_pesanan}
📍 *Rute:* ${tracking.origin.name} ➔ ${tracking.destination.name}
${vehicleEmoji} *Armada:* ${tracking.vehicleName}
📊 *Status Terkini:* ${tracking.statusLabel} (${tracking.progressPercent}%)
⏱️ *Estimasi Tiba:* ${tracking.etaText}
📍 *Koordinat:* ${tracking.currentPosition.lat}, ${tracking.currentPosition.lng}

🔗 *Pantau Live Tracking & Peta di sini:*
${trackingUrl}

Terima kasih atas kepercayaan Anda bersama Daff Cargo Nusantara.
_Butuh bantuan? Silakan hubungi kami di nomor ini._`;
}
