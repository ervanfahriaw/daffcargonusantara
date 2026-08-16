# Content — DCN OpsHub

Ini adalah aplikasi internal (bukan landing page marketing), jadi isi
file ini adalah **copy UI**: label, judul layar, status, teks tombol,
pesan sistem, dan teks template dokumen. Agent **wajib pakai teks di sini
apa adanya**, jangan mengarang variasi sendiri kecuali diminta.

## Nama aplikasi & tagline internal

- Nama app: **DCN OpsHub**
- Sub-judul di layar login/splash: **"Kelola pengiriman PT Daff Cargo
  Nusantara, dari satu tempat."**

## Navigasi utama (bottom nav — 4 item)

1. **Beranda** (ikon: home)
2. **Pesanan** (ikon: package/box)
3. **Kontak** (ikon: user/contact card)
4. **Lainnya** (ikon: menu titik tiga → berisi Pengaturan, Bantuan, Keluar)

## Layar Beranda (Dashboard)

- Judul: **"Beranda"**
- Sapaan atas: **"Selamat pagi/siang/sore, [Nama Owner]"** (dinamis sesuai
  jam)
- Kartu ringkasan (2 kolom):
  - **"Sedang Berjalan"** — jumlah pesanan aktif, ikon truck
  - **"Perlu Perhatian"** — jumlah pesanan tertunda/butuh tindakan, ikon
    jam dengan tanda seru
- Judul section: **"Perlu Tindakan Hari Ini"** — daftar pesanan yang
  butuh aksi, tiap item tampil: nomor pesanan, customer, status badge,
  dan tombol aksi utama.
- Judul section: **"Pesanan Terbaru"** — 3–5 pesanan terakhir dengan
  status.
- Tombol melayang (FAB) atau tombol besar: **"+ Buat Pesanan Baru"**

## Layar Daftar Pesanan

- Judul: **"Pesanan"**
- Tab/filter status (chip horizontal): **Semua, Sedang Berjalan,
  Tertunda, Selesai**
- Kolom pencarian: placeholder **"Cari nomor pesanan atau nama
  customer..."**
- Tiap kartu pesanan menampilkan: nomor pesanan, nama customer, rute
  (asal → tujuan), badge status, dan tombol aksi utama singkat.
- Empty state (belum ada pesanan): ilustrasi line-art truk kosong +
  teks **"Belum ada pesanan. Yuk buat pesanan pertama."** + tombol
  **"Buat Pesanan Baru"**

## Layar Buat Pesanan Baru

- Judul: **"Pesanan Baru"**
- Section **"Data Pengirim & Penerima"**: Nama customer, alamat asal,
  alamat tujuan, kontak customer.
- Section **"Data Muatan"**: Jenis barang, berat/volume, jumlah koli,
  catatan khusus (mis. barang pecah belah, perlu alat berat).
- Section **"Transportasi"**: Jenis armada (CDD/Fuso/Wingbox/Trailer/
  Lowbed/Lainnya), nama vendor trucking (opsional, bisa pilih dari
  Kontak), estimasi tanggal berangkat.
- Section **"Biaya Awal"**: Tarif ke customer, estimasi biaya vendor
  (boleh diisi belakangan).
- Tombol submit: **"Simpan Pesanan"**

## Status pengiriman (baku — jangan diubah urutannya)

Diturunkan dari standar milestone resmi perusahaan, disederhanakan untuk
konteks domestik:

| Kode internal | Label di UI | Warna badge |
|---|---|---|
| `booking` | **Booking** | neutral (abu) |
| `pickup` | **Pickup** | primary (biru) |
| `berangkat` | **Berangkat** | primary (biru) |
| `dalam_perjalanan` | **Dalam Perjalanan** | teal |
| `tiba` | **Tiba di Tujuan** | teal |
| `terkirim` | **Terkirim** | success (hijau) |
| `tertunda` | **Tertunda** | warning (oranye) |
| `selesai` | **Selesai** | success (hijau), sedikit lebih gelap/badge "final" |

Label tambahan non-milestone (dipakai bersamaan dengan status di atas
untuk urusan pembayaran): **"Belum Ditagih" / "Sudah Ditagih, Belum
Lunas" / "Lunas"**.

## Timeline / stepper (di Detail Pesanan tab Tracking)

Urutan titik: **Booking → Pickup → Berangkat → Dalam Perjalanan → Tiba →
Terkirim**. Tiap titik menampilkan tanggal & waktu saat dicapai (mis.
"Pickup — 12 Agu 2026, 08.30" dan catatan singkat kalau ada, mis. "Muat
di gudang customer, kendaraan Fuso B 1234 XYZ").

## Detail Pesanan — nama tab

1. **Tracking** — timeline status + tombol aksi dinamis
2. **Dokumen** — daftar dokumen yang bisa/sudah di-generate
3. **Keuangan** — rincian biaya, tarif, margin, status pembayaran
4. **Kontak** — kontak relevan sesuai status pesanan saat ini

## Layar Dokumen (per pesanan)

- Judul section: **"Dokumen Pesanan"**
- Tiap jenis dokumen tampil sebagai kartu dengan status: **"Belum
  Dibuat"** / **"Sudah Dibuat — lihat/unduh/bagikan"**
- Jenis dokumen & deskripsi singkat:
  - **Surat Jalan** — "Bukti resmi barang dalam perjalanan, dibawa
    supir."
  - **Invoice** — "Tagihan resmi ke customer."
  - **Rincian Biaya (Cost Sheet)** — "Catatan biaya vendor & margin,
    untuk arsip internal."
  - **Bukti Serah Terima (POD)** — "Bukti barang sudah diterima
    customer, dilengkapi foto & tanda tangan."
- Tombol tiap kartu: **"Buat Dokumen"** / **"Lihat"** / **"Bagikan ke
  WhatsApp"**

## Layar Keuangan (per pesanan)

- Judul section: **"Keuangan Pesanan"**
- Baris rincian: **Tarif ke Customer**, **Biaya Vendor/Trucking**,
  **Biaya Lain-lain**, garis pemisah, **Margin (Keuntungan)** ditebalkan.
- Status pembayaran: badge **"Belum Ditagih" / "Menunggu Pembayaran" /
  "Lunas"**
- Tombol: **"Buat Invoice"** (jika belum) / **"Tandai Lunas"** (jika
  sudah ditagih)

## Layar Kontak

- Judul: **"Kontak"**
- Kategori (tab/filter): **Customer, Vendor Trucking, Supir, Internal
  Lain**
- Tiap kartu kontak: nama, peran, nomor telepon dengan **tombol
  langsung "Telepon" dan "Chat WA"** (bukan cuma teks nomor).
- Di dalam Detail Pesanan tab Kontak, tampilkan otomatis kontak relevan
  sesuai status:
  - Status Booking/Pickup → kontak **Vendor Trucking & Supir**
  - Status Dalam Perjalanan/Tiba → kontak **Supir & Customer (tujuan)**
  - Status Terkirim/Belum Lunas → kontak **Customer (PIC pembayaran) &
    Finance internal**

## Pesan sistem (toast/notifikasi)

- Sukses simpan pesanan: **"Pesanan berhasil disimpan."**
- Sukses update status: **"Status pesanan diperbarui ke [Status]."**
- Sukses generate dokumen: **"[Nama Dokumen] berhasil dibuat."**
- Gagal/isian kurang: **"Ada data yang belum lengkap. Cek kembali,
  ya."**
- Konfirmasi sebelum aksi penting (mis. tutup pesanan): **"Yakin ingin
  menutup pesanan ini? Pastikan pembayaran sudah lunas."** dengan tombol
  **"Ya, Tutup Pesanan"** / **"Batal"**

## FAQ singkat / tooltip bantuan (untuk user gaptech)

- Di sebelah "Buat Pesanan Baru": ikon info kecil dengan teks singkat
  **"Isi data pengiriman di sini. Bisa diedit lagi nanti."**
- Di layar Dokumen: **"Dokumen otomatis terisi dari data pesanan — kamu
  tidak perlu ketik ulang."**
- Di layar Kontak (dalam Detail Pesanan): **"Kontak di sini otomatis
  berubah sesuai tahap pengiriman saat ini."**
