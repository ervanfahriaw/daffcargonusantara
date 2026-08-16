# Sitemap — DCN OpsHub

Ini bukan sitemap landing page satu halaman — ini peta layar aplikasi dan
alur navigasinya. Urutan implementasi mengikuti urutan di `AGENTS.md`.

## Struktur navigasi

```
Login (magic link / email+password sederhana)
 └─ Beranda (Home)                         ← default screen setelah login
     ├─ Bottom Nav: Beranda | Pesanan | Kontak | Lainnya
     │
     ├─ Pesanan (Daftar)
     │    ├─ Filter status: Semua / Sedang Berjalan / Tertunda / Selesai
     │    ├─ Cari pesanan
     │    ├─ → Buat Pesanan Baru
     │    └─ → Detail Pesanan [id]
     │           ├─ Tab: Tracking
     │           ├─ Tab: Dokumen
     │           │    └─ → Preview/Generate Dokumen (Surat Jalan / Invoice
     │           │        / Cost Sheet / POD)
     │           ├─ Tab: Keuangan
     │           │    └─ → Buat Invoice
     │           └─ Tab: Kontak (kontak relevan otomatis)
     │
     ├─ Kontak (Daftar semua kontak)
     │    ├─ Filter kategori: Customer / Vendor Trucking / Supir / Internal
     │    ├─ → Tambah Kontak Baru
     │    └─ → Detail Kontak (telepon / chat WA / riwayat pesanan terkait)
     │
     └─ Lainnya
          ├─ Pengaturan (profil perusahaan, data untuk kop dokumen)
          ├─ Bantuan (FAQ singkat, cara pakai)
          └─ Keluar
```

## Detail alur per layar

### 1. Login
Sangat sederhana — 1 field email/nomor + password atau magic link. Tidak
ada proses registrasi rumit (akun dibuatkan langsung, owner tinggal
pakai). Tidak perlu halaman "lupa password" yang rumit — cukup link
"kirim ulang" simpel.

### 2. Beranda
Landing pertama setelah login. Prioritas info: **apa yang perlu
dilakukan hari ini** (bukan semua data). Lihat detail copy di
`docs/content.md`. Dari sini bisa langsung ke Buat Pesanan Baru tanpa
lewat Daftar Pesanan dulu.

### 3. Pesanan → Daftar
List semua pesanan, bisa difilter. Setiap kartu klik langsung ke Detail
Pesanan — **tidak ada langkah antara** (tidak perlu "pilih aksi" dulu).

### 4. Pesanan → Buat Pesanan Baru
Form satu alur (bukan multi-step wizard yang membingungkan) tapi dibagi
per section dengan heading jelas: Data Pengirim & Penerima → Data Muatan
→ Transportasi → Biaya Awal. Bisa scroll, submit di paling bawah.
Alternatif untuk versi lanjut (fase 2, bukan wajib fase 1): opsi input
lebih cepat lewat isi minimal dulu (nama customer + rute) lalu lengkapi
detail lain belakangan — supaya owner tidak berhenti mengisi karena
kelamaan.

### 5. Pesanan → Detail Pesanan
Halaman paling sering dibuka. 4 tab: Tracking (default terbuka),
Dokumen, Keuangan, Kontak. Tombol aksi utama dinamis **selalu terlihat**
(sticky di bawah), berubah sesuai tab Tracking.

### 6. Dokumen → Generate/Preview
Dari tab Dokumen, klik "Buat Dokumen" → preview PDF dengan data yang
sudah terisi otomatis dari pesanan → tombol "Simpan" dan "Bagikan ke
WhatsApp". Tidak ada form input ulang di sini kecuali field yang memang
belum ada datanya (mis. nama supir & plat nomor untuk Surat Jalan, kalau
belum diisi saat buat pesanan).

### 7. Keuangan → Buat Invoice
Dari tab Keuangan, kalau status sudah "Terkirim" dan belum ada invoice →
tombol "Buat Invoice" muncul menonjol. Setelah invoice dibuat, tombol
berubah jadi "Tandai Lunas".

### 8. Kontak
Daftar semua kontak (independen dari pesanan) + kontak baru bisa
ditambah dari sini atau langsung dari form Buat Pesanan Baru (quick-add).

### 9. Lainnya → Pengaturan
Data perusahaan yang dipakai otomatis di kop dokumen (nama, alamat, NPWP
kalau ada, logo). Diisi sekali di awal, jarang diubah.

## Prinsip alur (berlaku di semua halaman)

- Maksimal **2 tap dari Beranda** untuk sampai ke aksi paling sering
  dilakukan (lihat status pesanan, buat dokumen).
- Tidak ada halaman "buntu" tanpa tombol lanjut yang jelas — selalu ada
  1 aksi utama yang jelas harus diapain berikutnya.
- Navigasi balik selalu konsisten (tombol back di kiri atas + bottom
  nav tetap terlihat kecuali saat mengisi form/preview dokumen).
