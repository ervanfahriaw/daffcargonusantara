---
activation: always_on
---

# Design System — DCN OpsHub

Gaya visual: **friendly, modern, lapang (bukan padat), rounded.** Target
pemakai adalah orang gaptech usia lanjut — desain harus terasa "tenang",
bukan ramai. Satu layar = satu fokus utama. Kalau sebuah elemen tidak
membantu keputusan/aksi user saat itu, jangan ditampilkan.

Referensi vibe: pola dashboard shipment mobile modern (stat card lembut,
ilustrasi line-art simpel, stepper vertikal untuk status, peta dengan rute
berwarna teal) dikombinasikan dengan identitas brand perusahaan (navy +
oranye dari company profile PT Daff Cargo Nusantara).

## 1. Warna (pakai hex, jangan nama warna di kode)

### Brand core
| Token | Hex | Pemakaian |
|---|---|---|
| `--color-navy-900` | `#0B2545` | Warna utama brand, heading besar, teks penting, background header/nav gelap |
| `--color-navy-700` | `#13345C` | Varian sedikit lebih terang untuk elemen sekunder navy |
| `--color-orange-500` | `#F2994A` | Warna aksen brand, CTA sekunder, badge "perlu perhatian" |
| `--color-orange-600` | `#E07B24` | Hover/active state dari orange-500 |

### Aksi & status utama
| Token | Hex | Pemakaian |
|---|---|---|
| `--color-primary` | `#2E6FF2` | Tombol aksi utama (CTA dinamis per pesanan), link aktif, ikon primer |
| `--color-primary-dark` | `#1E54C4` | Hover/pressed state tombol primer |
| `--color-teal-500` | `#2FAFA0` | Status "Dalam Perjalanan", elemen tracking/rute, ilustrasi |
| `--color-teal-100` | `#E3F7F3` | Background badge/kartu untuk status teal |
| `--color-success-600` | `#2E9E52` | Status "Terkirim/Selesai" |
| `--color-success-100` | `#E6F6EA` | Background badge status selesai |
| `--color-warning-600` | `#F2994A` | Status "Tertunda" (Delayed) |
| `--color-warning-100` | `#FFF1E0` | Background badge status tertunda |
| `--color-danger-600` | `#E5484D` | Status "Perlu Tindakan Segera" / error |
| `--color-danger-100` | `#FDEAEA` | Background badge status urgent |
| `--color-neutral-600` | `#64748B` | Status "Menunggu/Draft", teks sekunder |
| `--color-neutral-100` | `#F1F5F9` | Background badge status netral |

### Netral & permukaan
| Token | Hex | Pemakaian |
|---|---|---|
| `--color-bg` | `#F7FAFD` | Background utama app (bukan putih polos — sedikit biru muda) |
| `--color-surface` | `#FFFFFF` | Background card/panel |
| `--color-surface-tint` | `#EAF3FC` | Background stat card di dashboard (light blue tint) |
| `--color-border` | `#E2E8F0` | Border tipis antar elemen |
| `--color-text-primary` | `#0F1B2D` | Teks utama |
| `--color-text-secondary` | `#5B6B82` | Teks sekunder/caption |

**Aturan:** semua warna didefinisikan sebagai CSS variable / Tailwind
token di satu tempat (`tailwind.config` atau `globals.css`). **Dilarang
hardcode hex langsung di komponen.**

## 2. Tipografi

- Font utama: **Plus Jakarta Sans** (Google Fonts) — terasa modern, ramah,
  rounded, dan dukungan karakter Bahasa Indonesia baik.
- Fallback: `-apple-system, "Segoe UI", Roboto, sans-serif` (`font-sans`
  di Tailwind, override default stack-nya).
- Angka (harga, berat, jumlah) selalu pakai `font-variant-numeric:
  tabular-nums` supaya rapi sejajar di tabel/kartu.

| Peran | Ukuran | Weight |
|---|---|---|
| Judul halaman (H1) | 24–28px | 700 |
| Judul section (H2) | 18–20px | 700 |
| Judul kartu (H3) | 16px | 600 |
| Body | 14–15px | 400–500 |
| Caption / label kecil | 12–13px | 500 |
| Angka besar di stat card | 28–32px | 700 |

Baris teks jangan terlalu panjang; body max ~60 karakter per baris di
layar sempit. Line-height lapang: 1.5 untuk body, 1.2–1.3 untuk heading.

## 3. Spacing & radius

- Skala spacing (px): `4, 8, 12, 16, 24, 32, 48` — pakai skala Tailwind
  default (`p-1, p-2, p-3, p-4, p-6, p-8`), jangan bikin angka custom baru.
- Radius card besar: `rounded-3xl` (24px). Radius komponen kecil (input,
  chip): `rounded-xl` (12px). Tombol CTA utama: `rounded-full` (pill).
- Padding dalam card minimal `p-5`/`p-6` — jangan mepet.
- Jarak antar section minimal `gap-6`/`gap-8` agar layar tidak terasa
  sesak.

## 4. Komponen

### Kartu (Card)
Background `--color-surface` atau `--color-surface-tint`, shadow lembut
(`shadow-sm`, JANGAN shadow tebal/gelap), radius besar, tanpa border tebal
— cukup `--color-border` tipis 1px kalau perlu.

### Tombol
- **Primary (CTA dinamis per pesanan):** background `--color-primary`,
  teks putih, `rounded-full`, padding besar (`px-6 py-3`), selalu **satu
  saja yang paling menonjol per layar** — ini tombol yang berubah sesuai
  status pesanan (mis. "Konfirmasi Muat", "Buat Surat Jalan", "Tandai
  Terkirim").
- **Secondary:** outline atau background `--color-surface-tint`, teks
  `--color-navy-900`.
- **Destructive/urgent:** `--color-danger-600`, dipakai sangat jarang
  (mis. batalkan pesanan).
- Ukuran target sentuh minimal **48×48px** — user lansia, jangan bikin
  tombol kecil.

### Badge status
Pill kecil, background warna `-100`, teks warna `-600`/`-700` yang
sepasang (lihat tabel status di atas). Selalu disertai **ikon SVG kecil**
di sisi kiri teks, jangan hanya warna (aksesibilitas — ada user yang buta
warna parsial).

### Stepper/Timeline status pengiriman
Garis vertikal dengan titik/lingkaran di tiap milestone (Booking → Pickup
→ Berangkat → Dalam Perjalanan → Tiba → Terkirim). Titik yang sudah lewat:
solid `--color-teal-500` dengan ikon centang. Titik aktif saat ini:
solid dengan ring/glow tipis. Titik yang belum tercapai: outline abu-abu
`--color-neutral-600`.

### Bottom navigation (mobile)
4 item maksimal, ikon SVG + label singkat di bawahnya, item aktif diberi
warna `--color-primary`, sisanya `--color-text-secondary`. Struktur:
Beranda, Pesanan, Kontak, Lainnya.

## 5. Ikon

**Wajib pakai icon set SVG line-style yang konsisten — gunakan
[Lucide Icons](https://lucide.dev).** Stroke width konsisten (1.5–2px),
rounded line-cap. **Dilarang keras pakai emoji** di UI mana pun (termasuk
notifikasi, badge, tombol). Ilustrasi besar (mis. di layar kosong/empty
state) boleh pakai gaya line-art sederhana dua-warna (navy + teal/orange),
bukan foto stok.

## 6. Prinsip UX (karena user gaptech)

1. **Satu aksi utama per layar** — satu tombol besar yang jelas apa yang
   harus dilakukan berikutnya, bukan banyak tombol sejajar dengan bobot
   visual sama.
2. **Bahasa manusia, bukan istilah sistem** — hindari singkatan/istilah
   teknis logistik di UI (PIB/PEB/dsb) kecuali memang perlu dan sudah
   dijelaskan; pakai istilah yang sudah dipakai owner sehari-hari.
3. **Jangan sembunyikan status penting di balik banyak tap.** Status
   pesanan dan aksi berikutnya harus terlihat dari list, tanpa harus
   masuk ke detail dulu.
4. **Konsisten posisi tombol utama** — selalu di area yang sama (mis.
   sticky di bawah layar) supaya jadi kebiasaan.
5. **Feedback jelas** — setiap aksi (submit, generate dokumen, kirim)
   diberi konfirmasi visual jelas (toast/banner), bukan diam saja.
