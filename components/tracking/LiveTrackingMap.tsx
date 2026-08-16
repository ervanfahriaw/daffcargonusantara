"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Navigation,
  Ship,
  Plane,
  Truck,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  Compass,
  Gauge,
  Clock,
  Layers,
} from "lucide-react";
import {
  getShipmentTrackingState,
  type LiveTrackingState,
} from "@/lib/utils/geoTracking";
import { toast } from "sonner";

interface LiveTrackingMapProps {
  pesanan: {
    id: string;
    nomor_pesanan: string;
    alamat_asal: string;
    alamat_tujuan: string;
    status: string;
    moda_pengiriman?: string;
    catatan_muatan?: string | null;
    plat_nomor?: string | null;
  };
  onShareClick?: () => void;
}

export function LiveTrackingMap({ pesanan, onShareClick }: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(6);
  const [trackingState, setTrackingState] = useState<LiveTrackingState>(() =>
    getShipmentTrackingState(pesanan)
  );

  // Update tracking state when pesanan changes
  useEffect(() => {
    setTrackingState(getShipmentTrackingState(pesanan));
  }, [pesanan]);

  const {
    origin,
    destination,
    currentPosition,
    progressPercent,
    vehicleType,
    vehicleName,
    speedText,
    altitudeText,
    etaText,
    totalDistanceKm,
    remainingDistanceKm,
    statusLabel,
  } = trackingState;

  // Center coordinate between origin and destination or current pos
  const centerLat = (origin.lat + destination.lat) / 2;
  const centerLng = (origin.lng + destination.lng) / 2;

  // Convert GPS Coordinates to SVG viewbox percentages (Indonesia bounds approx lat -11 to 6, lng 95 to 141)
  function toSvgCoords(lat: number, lng: number): { x: number; y: number } {
    const minLng = 94.5;
    const maxLng = 141.5;
    const minLat = -11.5;
    const maxLat = 6.5;

    const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 500;
    return { x, y };
  }

  const origSvg = toSvgCoords(origin.lat, origin.lng);
  const destSvg = toSvgCoords(destination.lat, destination.lng);
  const currSvg = toSvgCoords(currentPosition.lat, currentPosition.lng);

  // Curved maritime or straight line SVG path
  const isCurved = vehicleType === "kapal";
  const midX = (origSvg.x + destSvg.x) / 2;
  const midY = (origSvg.y + destSvg.y) / 2 + (isCurved ? 30 : 0);
  const fullPathD = `M ${origSvg.x} ${origSvg.y} Q ${midX} ${midY} ${destSvg.x} ${destSvg.y}`;

  function handleCopyCoords() {
    const coords = `${currentPosition.lat}, ${currentPosition.lng}`;
    navigator.clipboard.writeText(coords);
    setCopied(true);
    toast.success(`Koordinat disalin: ${coords}`);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenGoogleMaps() {
    const url = `https://www.google.com/maps?q=${currentPosition.lat},${currentPosition.lng}`;
    window.open(url, "_blank");
  }

  return (
    <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm overflow-hidden space-y-0">
      {/* ── Header Peta Tracking ── */}
      <div className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl shrink-0 shadow-xs ${
              vehicleType === "pesawat"
                ? "bg-[#9333EA] text-white"
                : vehicleType === "kapal"
                ? "bg-[#0284C7] text-white"
                : "bg-[var(--color-primary)] text-white"
            }`}
          >
            {vehicleType === "pesawat" ? (
              <Plane className="h-5 w-5" />
            ) : vehicleType === "kapal" ? (
              <Ship className="h-5 w-5" />
            ) : (
              <Truck className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold text-[var(--color-navy-900)]">
                Live Tracking Posisi
              </h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live AIS / GPS
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {vehicleName} • {statusLabel}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {onShareClick && (
            <button
              type="button"
              onClick={onShareClick}
              className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all touch-target"
            >
              <span>📲 Bagikan ke Client</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopyCoords}
            className="flex items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-navy-900)] hover:bg-slate-100 transition-all touch-target"
            title="Salin Koordinat"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Salin GPS</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Map Canvas Container ── */}
      <div
        ref={mapContainerRef}
        className="relative w-full h-[280px] sm:h-[340px] md:h-[400px] bg-[#E2E8F0] overflow-hidden select-none"
      >
        {/* OpenStreetMap Real Tile Layer Background */}
        <div className="absolute inset-0 bg-[#0F172A] flex items-center justify-center overflow-hidden">
          {/* Static SVG Map Grid of Nusantara Waters & Islands */}
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-full object-cover opacity-90"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="oceanGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="1" />
              </pattern>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#14B8A6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>

            {/* Ocean background */}
            <rect width="1000" height="500" fill="#0B192C" />
            <rect width="1000" height="500" fill="url(#oceanGrid)" opacity="0.6" />

            {/* Simplified Silhouette of Indonesian Islands */}
            {/* Sumatra */}
            <path
              d="M 60 120 Q 120 180 200 280 L 220 310 Q 180 320 140 270 L 70 160 Z"
              fill="#1E293B"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Java */}
            <path
              d="M 230 330 L 450 345 Q 470 355 430 365 L 220 350 Z"
              fill="#1E293B"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Kalimantan */}
            <path
              d="M 280 140 Q 380 130 420 200 L 400 270 Q 300 280 270 210 Z"
              fill="#1E293B"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Sulawesi */}
            <path
              d="M 460 160 Q 520 150 530 200 L 490 260 L 510 300 L 470 320 L 460 250 Z"
              fill="#1E293B"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Maluku */}
            <path
              d="M 570 200 Q 620 220 600 280 L 560 260 Z"
              fill="#1E293B"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Papua */}
            <path
              d="M 680 180 Q 820 190 880 260 L 850 330 Q 750 340 690 260 Z"
              fill="#1E293B"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Maritime Route Line (Dashed Planned Route) */}
            <path
              d={fullPathD}
              fill="none"
              stroke="#475569"
              strokeWidth="3"
              strokeDasharray="6 6"
            />

            {/* Active Traveled Route */}
            <path
              d={`M ${origSvg.x} ${origSvg.y} Q ${(origSvg.x + currSvg.x) / 2} ${(origSvg.y + currSvg.y) / 2 + (isCurved ? 15 : 0)} ${currSvg.x} ${currSvg.y}`}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Origin Pin */}
            <g transform={`translate(${origSvg.x}, ${origSvg.y})`}>
              <circle r="8" fill="#10B981" opacity="0.3" className="animate-ping" />
              <circle r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              <text
                x="0"
                y="-10"
                textAnchor="middle"
                fill="#F1F5F9"
                fontSize="11"
                fontWeight="bold"
              >
                {origin.name.split(" ")[0]}
              </text>
            </g>

            {/* Destination Pin */}
            <g transform={`translate(${destSvg.x}, ${destSvg.y})`}>
              <circle r="8" fill="#EF4444" opacity="0.3" />
              <circle r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
              <text
                x="0"
                y="-10"
                textAnchor="middle"
                fill="#F1F5F9"
                fontSize="11"
                fontWeight="bold"
              >
                {destination.name.split(" ")[0]}
              </text>
            </g>

            {/* Current Position Pulsing Beacon */}
            <g transform={`translate(${currSvg.x}, ${currSvg.y})`}>
              <circle r="20" fill="#38BDF8" opacity="0.25" className="animate-ping" />
              <circle r="12" fill="#0284C7" opacity="0.6" />
              <circle r="6" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />
            </g>
          </svg>
        </div>

        {/* ── Overlay Vehicle Badge at Current Position ── */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-700"
          style={{
            left: `${(currSvg.x / 1000) * 100}%`,
            top: `${(currSvg.y / 500) * 100}%`,
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Vehicle Icon Pin */}
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg border-2 border-white transition-transform ${
                vehicleType === "pesawat"
                  ? "bg-purple-600"
                  : vehicleType === "kapal"
                  ? "bg-sky-600"
                  : "bg-blue-600"
              }`}
              style={{
                transform: `rotate(${currentPosition.heading - 45}deg)`,
              }}
            >
              {vehicleType === "pesawat" ? (
                <Plane className="h-5 w-5" />
              ) : vehicleType === "kapal" ? (
                <Ship className="h-5 w-5" />
              ) : (
                <Truck className="h-5 w-5" />
              )}
            </div>

            {/* Floating Label */}
            <div className="mt-1 whitespace-nowrap rounded-lg bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md border border-slate-700 backdrop-blur-xs">
              {vehicleName}
            </div>
          </div>
        </div>

        {/* ── Top Left Floating Status Tag ── */}
        <div className="absolute top-3 left-3 z-20 rounded-2xl bg-slate-900/85 px-3 py-2 text-white shadow-md border border-slate-700 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "12s" }} />
            <span>{currentPosition.heading}° • {speedText}</span>
          </div>
          {altitudeText && (
            <p className="text-[10px] text-slate-300 mt-0.5">Alt: {altitudeText}</p>
          )}
        </div>

        {/* ── Bottom Right Map Action Link ── */}
        <div className="absolute bottom-3 right-3 z-20 flex gap-2">
          <button
            type="button"
            onClick={handleOpenGoogleMaps}
            className="flex items-center gap-1 rounded-xl bg-slate-900/85 px-3 py-1.5 text-[11px] font-bold text-white shadow-md border border-slate-700 hover:bg-slate-800 transition-all touch-target"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Buka Google Maps</span>
          </button>
        </div>
      </div>

      {/* ── Bottom Metrics Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-[var(--color-surface)]">
        <div className="rounded-2xl bg-[var(--color-bg)] p-3 border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
            <Gauge className="h-3.5 w-3.5 text-[var(--color-teal-500)]" />
            <span>Progres Tempuh</span>
          </div>
          <p className="text-sm font-bold text-[var(--color-navy-900)] mt-0.5">
            {progressPercent}% <span className="text-xs font-normal text-slate-500">({totalDistanceKm - remainingDistanceKm}/{totalDistanceKm} Km)</span>
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--color-bg)] p-3 border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
            <Clock className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            <span>Estimasi Tiba (ETA)</span>
          </div>
          <p className="text-sm font-bold text-[var(--color-primary)] mt-0.5">
            {etaText}
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--color-bg)] p-3 border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span>Titik Asal</span>
          </div>
          <p className="text-xs font-bold text-[var(--color-navy-900)] mt-0.5 truncate">
            {origin.name}
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--color-bg)] p-3 border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
            <MapPin className="h-3.5 w-3.5 text-red-600" />
            <span>Titik Tujuan</span>
          </div>
          <p className="text-xs font-bold text-[var(--color-navy-900)] mt-0.5 truncate">
            {destination.name}
          </p>
        </div>
      </div>
    </div>
  );
}
