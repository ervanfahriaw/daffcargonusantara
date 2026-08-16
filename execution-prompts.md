# Execution Prompts — DCN OpsHub

Panduan prompt siap-pakai untuk dieksekusi di Antigravity, dipecah per
fase. Taruh file ini di `docs/execution-prompts.md` supaya nempel di
project (dan bisa dibaca ulang tiap sesi kalau lupa sudah sampai mana).

**Urutan di sini beda sedikit dari urutan konseptual di `AGENTS.md`** —
di sana urutannya berdasarkan prioritas fitur buat user, di sini
berdasarkan **urutan build yang logis secara teknis** (data model & CRUD
dulu, baru tampilan yang menampilkan agregat datanya). Ini normal dan
tidak perlu ubah `AGENTS.md`.

## Aturan main tiap fase

1. **1 fase = 1 sesi prompt.** Jangan gabung beberapa fase dalam satu
   prompt, walau kelihatan sepele.
2. Selesai satu fase → **cek hasilnya jalan dulu** (buka di browser),
   baru copy-paste prompt fase berikutnya.
3. Kalau ada yang mau direvisi, **jangan bilang "perbaiki dong"** —
   sebutkan spesifik: layar mana, elemen mana, maunya seperti apa.
   Contoh: "Di kartu pesanan pada Daftar Pesanan, badge status
   kepotong di layar kecil, perbesar jarak paddingnya."
4. Kalau pakai git, **commit setiap fase selesai & sudah dicek** —
   supaya kalau fase berikutnya bikin agent "ngelantur", tinggal balik
   ke commit sebelumnya.
5. Jangan skip Fase 0 dan Fase 1 walau kelihatan tidak menarik (bukan
   UI) — semua fase sesudahnya bergantung ke situ.

---

## Fase 0 — Baca project & buat Technical Specification

Jalankan ini di awal sesi pertama, sebelum minta kode apapun.

```
Sebelum menulis kode apapun, baca dulu semua file berikut secara berurutan:
AGENTS.md, docs/brief.md, docs/sitemap.md, docs/content.md,
.agents/rules/design-system.md, .agents/rules/tech-stack.md,
docs/references.md.

Setelah itu, buatkan file docs/Technical_Specification.md yang berisi:
1. Ringkasan arsitektur aplikasi (halaman apa saja, komponen utama apa saja)
2. Skema database Supabase yang diusulkan (tabel: pesanan, kontak, dokumen,
   riwayat_status, dan tabel lain yang menurutmu perlu) — lengkap dengan
   kolom, tipe data, dan relasi antar tabel
3. Daftar Server Actions yang akan dibuat (nama fungsi + tujuannya, belum
   perlu implementasi)
4. Urutan implementasi yang kamu usulkan

Jangan mulai coding dulu. Tunggu saya review dan approve
Technical_Specification.md ini dulu.
```

Setelah dia bikin draft-nya, baca pelan-pelan, kasih catatan revisi kalau
ada (mis. nama tabel kurang pas, ada kolom yang kurang), suruh dia revisi
filenya, baru lanjut ke Fase 1 kalau sudah oke.

---

## Fase 1 — Setup project & fondasi

```
Sekarang eksekusi Technical_Specification.md bagian setup fondasi saja,
BELUM masuk ke halaman/fitur apapun:

1. Setup project Next.js (App Router + TypeScript) sesuai tech-stack.md
2. Konfigurasi Tailwind dengan semua token warna, font, dan radius dari
   design-system.md sebagai bagian dari tailwind.config
3. Setup koneksi Supabase (client & server helper di lib/supabase/)
4. Buat semua tabel database sesuai skema yang sudah disepakati di
   Technical_Specification.md
5. Setup autentikasi sederhana (email/password atau magic link) untuk
   1 user
6. Buat layout dasar: BottomNav (4 item sesuai content.md) dan Header,
   TAPI isi tiap halaman masih boleh kosong/dummy dulu

Jangan buat halaman Beranda/Pesanan/dsb secara detail dulu — itu fase
berikutnya. Fokus fase ini: project bisa jalan, bisa login, struktur
navigasi kelihatan.
```

---

## Fase 2 — Buat Pesanan Baru (form + data model)

```
Sekarang buat halaman "Buat Pesanan Baru" sesuai docs/sitemap.md bagian
"Pesanan → Buat Pesanan Baru" dan copy di docs/content.md bagian yang
sama.

Ketentuan:
- Form dibagi per section sesuai content.md: Data Pengirim & Penerima,
  Data Muatan, Transportasi, Biaya Awal
- Validasi pakai Zod sesuai tech-stack.md
- Simpan data lewat Server Action ke tabel pesanan di Supabase
- Setelah submit sukses, tampilkan toast sesuai teks di content.md
  ("Pesanan berhasil disimpan.") lalu redirect ke halaman Detail
  Pesanan yang baru dibuat (boleh halaman kosong dulu kalau Detail
  Pesanan belum ada — itu fase berikutnya)
- Style ikuti design-system.md sepenuhnya (spacing lapang, radius besar,
  tombol submit besar dan jelas)

Tunggu saya cek dulu sebelum lanjut ke fase berikutnya.
```

---

## Fase 3 — Daftar Pesanan

```
Buat halaman Daftar Pesanan sesuai docs/sitemap.md dan docs/content.md
bagian "Layar Daftar Pesanan":

- Filter status (chip): Semua, Sedang Berjalan, Tertunda, Selesai
- Search bar dengan placeholder sesuai content.md
- Tiap kartu pesanan: nomor pesanan, nama customer, rute asal→tujuan,
  badge status (pakai warna & ikon sesuai tabel status di content.md),
  dan tombol aksi utama singkat
- Klik kartu langsung ke halaman Detail Pesanan (boleh masih halaman
  placeholder kalau Detail Pesanan lengkap belum dibuat)
- Buat juga empty state sesuai teks & ilustrasi line-art yang dijelaskan
  di content.md kalau belum ada pesanan sama sekali

Data diambil dari tabel pesanan yang sudah kita isi lewat form di Fase 2.
Tunggu saya cek dulu sebelum lanjut.
```

---

## Fase 4 — Beranda (Dashboard)

```
Buat halaman Beranda sesuai docs/content.md bagian "Layar Beranda
(Dashboard)":

- Sapaan dinamis sesuai jam (pagi/siang/sore) + nama owner (ambil dari
  Pengaturan/profil, kalau Pengaturan belum ada, hardcode dulu nama
  placeholder yang jelas ditandai TODO)
- 2 stat card: "Sedang Berjalan" dan "Perlu Perhatian", datanya dihitung
  otomatis dari tabel pesanan (jangan hardcode angka)
- Section "Perlu Tindakan Hari Ini": daftar pesanan yang butuh aksi,
  tiap item ada tombol aksi utama (untuk fase ini tombolnya boleh belum
  fungsional penuh — itu difinalkan di Fase 5)
- Section "Pesanan Terbaru": 3-5 pesanan terakhir
- Tombol besar "+ Buat Pesanan Baru" yang mengarah ke halaman di Fase 2

Style ikuti pola stat card biru muda + ilustrasi line-art sederhana
seperti dijelaskan di docs/references.md.
Tunggu saya cek dulu sebelum lanjut.
```

---

## Fase 5 — Detail Pesanan: Tab Tracking + tombol aksi dinamis

```
Buat halaman Detail Pesanan dengan struktur tab (Tracking, Dokumen,
Keuangan, Kontak) sesuai docs/sitemap.md, tapi ISI PENUH dulu HANYA tab
Tracking:

- Stepper vertikal dengan milestone sesuai tabel status di
  docs/content.md (Booking → Pickup → Berangkat → Dalam Perjalanan →
  Tiba → Terkirim), tiap titik tampilkan tanggal/waktu & catatan singkat
  kalau sudah tercapai
- Tombol aksi utama yang BERUBAH sesuai status pesanan saat ini, mengacu
  tabel "Dynamic action button" di docs/brief.md — klik tombol ini akan
  mengubah status pesanan ke tahap berikutnya (update ke Supabase +
  catat timestamp-nya)
- Tombol ini sticky di bagian bawah layar
- Tab Dokumen, Keuangan, Kontak boleh muncul sebagai tab tapi isinya
  placeholder "Segera hadir" dulu — itu fase-fase berikutnya

Tunggu saya cek dulu sebelum lanjut.
```

---

## Fase 6 — Detail Pesanan: Tab Dokumen (generate PDF)

```
Sekarang isi penuh tab Dokumen di halaman Detail Pesanan sesuai
docs/content.md bagian "Layar Dokumen (per pesanan)":

- Setup @react-pdf/renderer sesuai tech-stack.md, buat 4 template PDF
  terpisah di lib/documents/: SuratJalan.tsx, Invoice.tsx,
  CostSheet.tsx, POD.tsx — semua data terisi otomatis dari data pesanan
  yang sudah ada (jangan minta user input ulang data yang sudah ada)
- Kalau ada field yang memang belum ada datanya (mis. nama supir & plat
  nomor untuk Surat Jalan), munculkan form kecil khusus field itu saja
  saat pertama kali generate
- Tiap kartu dokumen di tab ini menampilkan status "Belum Dibuat" atau
  "Sudah Dibuat" sesuai content.md, dengan tombol Buat Dokumen / Lihat /
  Bagikan ke WhatsApp (untuk "Bagikan ke WhatsApp", cukup generate link
  wa.me dengan teks singkat + link/file PDF, belum perlu WhatsApp API)
- Simpan file PDF yang sudah dibuat ke Supabase Storage, kaitkan ke
  tabel dokumen/pesanan terkait

Tunggu saya cek dulu sebelum lanjut.
```

---

## Fase 7 — Detail Pesanan: Tab Keuangan

```
Isi penuh tab Keuangan sesuai docs/content.md bagian "Layar Keuangan
(per pesanan)":

- Tampilkan rincian: Tarif ke Customer, Biaya Vendor/Trucking, Biaya
  Lain-lain, dan Margin (dihitung otomatis, bukan input manual)
- Badge status pembayaran: Belum Ditagih / Menunggu Pembayaran / Lunas
- Tombol "Buat Invoice" (memicu generate dokumen Invoice dari Fase 6
  kalau belum ada) dan "Tandai Lunas" (update status pembayaran)

Tunggu saya cek dulu sebelum lanjut.
```

---

## Fase 8 — Detail Pesanan: Tab Kontak (kontekstual)

```
Isi penuh tab Kontak di Detail Pesanan sesuai docs/content.md — kontak
yang ditampilkan HARUS berubah otomatis sesuai status pesanan saat ini:

- Status Booking/Pickup → tampilkan kontak Vendor Trucking & Supir
- Status Dalam Perjalanan/Tiba → tampilkan kontak Supir & Customer
- Status Terkirim/Belum Lunas → tampilkan kontak Customer (PIC
  pembayaran) & Finance internal

Tiap kontak ada tombol langsung "Telepon" (tel:) dan "Chat WA" (wa.me),
bukan cuma teks nomor.

Kontak diambil dari tabel kontak — kalau tabel kontak globalnya belum
ada, buat dulu skema sederhana untuk itu (nama, peran/kategori, nomor
telepon), nanti dilengkapi UI-nya di Fase 9.

Tunggu saya cek dulu sebelum lanjut.
```

---

## Fase 9 — Kontak (halaman global)

```
Buat halaman Kontak (independen dari pesanan) sesuai docs/sitemap.md dan
docs/content.md bagian "Layar Kontak":

- Filter kategori: Customer, Vendor Trucking, Supir, Internal Lain
- Tiap kartu kontak: nama, peran, tombol Telepon & Chat WA
- Tombol Tambah Kontak Baru
- Quick-add kontak baru juga bisa dipanggil dari form Buat Pesanan Baru
  (Fase 2) — tambahkan opsi itu sekarang kalau belum ada

Tunggu saya cek dulu sebelum lanjut.
```

---

## Fase 10 — Pengaturan

```
Buat halaman Pengaturan sesuai docs/sitemap.md bagian "Lainnya →
Pengaturan":

- Data profil perusahaan: nama, alamat, NPWP (opsional), logo — data ini
  dipakai otomatis di kop semua dokumen PDF dari Fase 6 (update template
  dokumen supaya ambil data dari sini, bukan hardcode)
- Nama owner di sini juga dipakai untuk sapaan dinamis di Beranda
  (hubungkan balik ke Fase 4, ganti placeholder TODO-nya)
- Halaman Bantuan sederhana (FAQ singkat sesuai content.md) dan tombol
  Keluar

Tunggu saya cek dulu sebelum lanjut.
```

---

## Fase 11 — PWA / installable + polish akhir

```
Fase terakhir, jadikan aplikasi ini installable ke home screen sesuai
tech-stack.md:

1. Setup Serwist (@serwist/next) — buat app/manifest.ts dan app/sw.ts
   sesuai dokumentasi resminya (https://serwist.pages.dev/docs/next)
2. Manifest pakai nama "DCN OpsHub", ikon dari logo di assets/, warna
   tema sesuai navy di design-system.md
3. Precache app shell (layout, halaman Beranda & Daftar Pesanan) supaya
   tetap bisa dibuka saat sinyal lemah
4. Cek ulang SEMUA halaman di layar HP (mobile viewport), pastikan tidak
   ada elemen kepotong, tombol terlalu kecil, atau teks kepanjangan
5. Terakhir, coba alur penuh dari awal sebagai user baru: buka app →
   login → buat pesanan → jalankan sampai status Terkirim → buat invoice
   → tandai lunas → tutup pesanan. Catat kalau ada langkah yang terasa
   membingungkan.

Setelah ini selesai dan saya sudah tes langsung di HP, kita masuk ke
tahap deploy ke Vercel.
```

---

## Kalau agent mulai "ngelantur"

Kalau di tengah fase agent mulai mengedit file yang tidak diminta atau
menambah fitur di luar scope fase itu, stop dan kirim:

```
Stop dulu. Kamu keluar dari scope fase ini. Fase ini HANYA untuk [sebutkan
scope fase]. Balikin perubahan di luar itu, lalu lanjutkan cuma yang
diminta.
```

Kalau sudah terlalu berantakan, lebih aman revert ke commit terakhir
(kalau pakai git) daripada minta dia "membereskan" — koreksi di atas
kekacauan biasanya bikin lebih kacau lagi.
