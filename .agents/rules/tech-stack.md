---
activation: always_on
---

# Tech Stack & Constraints — DCN OpsHub

## Kenapa web app (bukan native app)

User tidak akan pernah membuka Play Store/App Store sendiri. Web app yang
bisa **"Add to Home Screen"** memberi pengalaman seperti aplikasi (ikon di
home screen, full screen, bisa dibuka offline sebagian) tanpa proses
install/update lewat store. Ini keputusan sadar untuk versi ini —
jangan diubah ke React Native/Expo tanpa persetujuan eksplisit.

## Stack

| Layer | Pilihan | Catatan |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Server Components untuk data-heavy pages, Server Actions untuk mutasi (buat pesanan, update status, generate dokumen) |
| Styling | **Tailwind CSS** | Token warna & spacing WAJIB ambil dari `design-system.md`, jangan bikin nilai baru di tempat |
| Komponen dasar | **shadcn/ui** | Dipakai sebagai basis (button, dialog, input, tabs), lalu di-restyle sesuai design-system — jangan pakai tampilan default shadcn mentah |
| Ikon | **lucide-react** | Konsisten dengan design-system.md |
| Backend/DB | **Supabase** (Postgres + Auth + Storage) | Auth cukup sederhana (email/password atau magic link) untuk 1 user utama; Storage untuk file dokumen (invoice/surat jalan hasil generate, foto POD) |
| Generate dokumen PDF | **@react-pdf/renderer** | Untuk Surat Jalan, Invoice, Cost Sheet, Bukti Serah Terima — semua template PDF dibuat sebagai komponen React terpisah di `/lib/documents/` |
| Validasi form | **Zod** | Semua input form divalidasi, terutama form pesanan baru |
| Grafik dashboard | **Recharts** | Dipakai secukupnya (mis. grafik performa pengiriman mingguan) — jangan berlebihan, ini bukan aplikasi analytics berat |
| PWA / installable | **Serwist (`@serwist/next`)** | Pengganti `next-pwa` yang sudah tidak maintained. Setup: `app/manifest.ts` untuk web app manifest + `app/sw.ts` untuk service worker. Precache app shell supaya buka aplikasi tetap cepat meski sinyal lemah. |
| Hosting | **Vercel** | Deploy langsung dari repo, cocok dengan Next.js |
| Notifikasi (opsional, fase lanjut) | WhatsApp Cloud API atau link `wa.me` | Owner sudah biasa WA — pertimbangkan tombol "kirim update ke WA customer" yang generate teks siap kirim, bukan sistem notifikasi baru yang harus dipelajari |

## Struktur folder yang disarankan

```
app/
  (dashboard)/
    page.tsx                 → Beranda
    pesanan/
      page.tsx                → Daftar Pesanan
      baru/page.tsx            → Buat Pesanan Baru
      [id]/
        page.tsx                → Detail Pesanan (tab: Tracking, Dokumen, Keuangan, Kontak)
    kontak/page.tsx           → Daftar Kontak
    pengaturan/page.tsx       → Pengaturan
  manifest.ts
  sw.ts
components/
  ui/                        → hasil restyle shadcn
  shipment/                  → StatusStepper, ShipmentCard, DynamicActionButton, dll
  layout/                    → BottomNav, Header
lib/
  documents/                 → template PDF (SuratJalan.tsx, Invoice.tsx, CostSheet.tsx, POD.tsx)
  supabase/                  → client & query helpers
  validations/               → skema Zod
docs/
.agents/
```

## Deny rules (larangan eksplisit)

- **Jangan install library baru** (termasuk versi berbeda dari yang
  tercantum di atas) **tanpa konfirmasi eksplisit dari user**, walau
  terlihat "lebih bagus" atau "lebih ringan".
- **Jangan hardcode warna/spacing** di luar token yang sudah didefinisikan
  di `design-system.md`.
- **Jangan pakai foto stok, avatar generik, atau teks placeholder**
  ("Lorem ipsum", "John Doe", "Company Name"). Pakai istilah dan contoh
  data dari `docs/content.md` / `docs/brief.md`.
- **Jangan bangun layout desktop-first.** Mobile-first wajib — asumsikan
  layar utama adalah HP owner. Desktop cukup layout yang "tidak rusak",
  bukan prioritas desain.
- **Jangan tambah role/permission baru** di luar yang diminta (mis.
  multi-user, admin panel kompleks) sebelum diminta — sistem ini untuk
  1 pemilik, sederhanakan.
- **Jangan generate seluruh aplikasi dalam satu sesi.** Kerjakan section
  per section sesuai urutan di `AGENTS.md`, berhenti untuk review di
  antaranya.
- **Jangan ubah nama/urutan status pengiriman** yang sudah didefinisikan
  di `docs/content.md` tanpa konfirmasi — status ini mengikuti standar
  operasional resmi perusahaan.
- **Jangan expose data Supabase (service role key, dsb.) di client
  component.** Semua akses sensitif lewat Server Action/Route Handler.

## Kebutuhan non-fungsional

- Wajib responsive, prioritas breakpoint mobile (< 640px).
- SEO meta tag dasar tetap disiapkan (title/description) meski ini app
  internal, bukan marketing site — untuk kerapian saja, bukan prioritas
  utama.
- Semua teks UI berbahasa Indonesia kecuali ada instruksi lain.
- Aplikasi harus tetap bisa dibuka (minimal baca data terakhir) saat
  sinyal lemah — manfaatkan precaching dari Serwist.
