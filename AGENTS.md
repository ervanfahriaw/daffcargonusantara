# AGENTS.md — DCN OpsHub

## Apa ini

**DCN OpsHub** adalah web app operasional untuk **PT Daff Cargo Nusantara**,
perusahaan freight forwarding & customs broker domestik yang saat ini
dijalankan sendiri oleh satu pemilik (~60 tahun, gaptech — hanya terbiasa
WhatsApp dan Excel).

Semua proses saat ini manual: dokumen keberangkatan, surat jalan, invoice,
tracking pesanan, sampai kontak vendor/supir — semua dikerjakan lewat Excel
dan chat WA. Tujuan project ini: memindahkan pekerjaan-pekerjaan berulang itu
ke satu aplikasi web yang **sederhana, jelas, dan bisa di-install ke home
screen HP** (tanpa perlu ke Play Store/App Store), sehingga owner bisa buka
seperti aplikasi biasa dari HP-nya.

## Siapa yang pakai

Satu user utama: pemilik perusahaan. Non-teknis, mudah bingung dengan banyak
tombol/menu. Setiap desain dan alur kerja **harus diuji dari sudut pandang
orang ini** — bukan dari sudut pandang developer. Kalau ragu, pilih opsi
yang lebih sedikit klik, lebih sedikit teks, lebih besar tombolnya.

## Stack singkat

Next.js (App Router) + TypeScript + Tailwind CSS, Supabase (Postgres, Auth,
Storage), PWA installable via Serwist. Detail lengkap dan aturan wajib ada
di `.agents/rules/tech-stack.md` — **baca file itu sebelum menulis kode
apapun**.

## Urutan baca wajib sebelum mulai kerja

Sebelum implementasi fitur apapun, agent WAJIB baca urutan berikut:

1. `docs/brief.md` — kenapa produk ini dibuat, siapa penggunanya, apa yang
   dianggap sukses.
2. `docs/sitemap.md` — halaman apa saja yang ada dan alurnya.
3. `docs/content.md` — semua teks/copy yang dipakai di UI. **Jangan
   mengarang teks sendiri** kalau sudah ada di file ini.
4. `.agents/rules/design-system.md` — warna, tipografi, spacing, gaya
   komponen. **Always on**, berlaku di semua layar tanpa perlu diulang di
   prompt.
5. `.agents/rules/tech-stack.md` — stack, struktur folder, dan deny rules.
6. `docs/references.md` — referensi visual dan sumber inspirasi.

## Cara kerja yang diharapkan

- **Kerjakan per bagian**, bukan generate seluruh aplikasi sekaligus.
  Urutan yang disarankan: (1) Dashboard/Beranda → (2) Daftar Pesanan → (3)
  Detail Pesanan (tracking, status, dokumen, keuangan, kontak) → (4) Buat
  Pesanan Baru → (5) Generate Dokumen → (6) Kontak → (7) Pengaturan.
- Setiap selesai satu bagian, **berhenti dan tunggu review** sebelum lanjut
  ke bagian berikutnya.
- Kalau ada kebutuhan yang tidak dijelaskan di `docs/brief.md` atau
  `docs/content.md`, **tanyakan dulu**, jangan mengasumsikan/mengarang.
- Jangan pernah pakai teks placeholder ("Lorem ipsum", "Product Name",
  foto stok generik). Semua teks harus dari `docs/content.md` atau
  disesuaikan dengan konteks bisnis riil di `docs/brief.md`.
- Ikuti deny rules di `.agents/rules/tech-stack.md` secara ketat —
  terutama soal instalasi library baru.

## Sumber data bisnis

Struktur status pengiriman, dokumen, dan daftar pihak/kontak di seluruh
project ini merujuk pada dokumen resmi perusahaan: *Profil Usaha, Proses
Bisnis, dan Flowchart Operasional — PT Daff Cargo Nusantara (Juli 2026)*,
yang sudah disederhanakan khusus untuk fokus operasional domestik.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
