# Brief — DCN OpsHub

## Latar belakang

PT Daff Cargo Nusantara adalah perusahaan freight forwarding & customs
broker (PPJK) yang mengoordinasikan pengangkutan barang, trucking,
pergudangan, dan dokumen pabean. Secara resmi lingkup layanannya luas
(impor/ekspor, laut/udara/darat), tapi **fokus operasional harian saat
ini adalah pengiriman domestik untuk barang berat & bervolume besar**
(trucking antarkota/antarpulau, project cargo).

Perusahaan masih sangat baru dan **dijalankan sendirian oleh 1 orang
pemilik**, usia sekitar 60 tahun, belum punya tim. Semua pekerjaan —
input pesanan, buat surat jalan, hitung biaya, kirim invoice, komunikasi
ke supir/vendor/customer — masih manual lewat Excel dan WhatsApp.

## Masalah

- Tidak ada satu tempat untuk melihat semua pesanan yang sedang berjalan.
- Dokumen (surat jalan, invoice, dsb.) dibuat manual tiap kali dari nol —
  rawan salah ketik dan makan waktu.
- Status tiap pengiriman hanya ada di kepala owner atau chat WA yang
  tersebar — sulit dilacak, gampang lupa follow-up.
- Perhitungan biaya per pesanan (ongkos angkut, biaya vendor, margin)
  dilakukan manual di Excel, rawan salah rumus.
- Kontak pihak terkait (supir, vendor trucking, customer, dsb.) tidak
  terpusat — owner harus scroll WA/kontak HP satu-satu.
- Owner **gaptech** — solusi harus jauh lebih sederhana dari software
  logistik enterprise pada umumnya. HP-nya dipakai untuk WA, PC-nya
  dipakai untuk Excel. Itu batas kenyamanan teknologi saat ini.

## Target pengguna

Satu pengguna utama: **pemilik PT Daff Cargo Nusantara.** Non-teknis,
terbiasa dengan interaksi sangat sederhana (chat, spreadsheet). Tidak
terbiasa dengan istilah UI seperti "dashboard", "filter", "export" —
semua harus terasa seperti "urutan langkah yang jelas", bukan tools
bebas eksplorasi.

Kemungkinan di masa depan akan ada 1–2 staf tambahan (mis. admin/CS),
tapi **versi ini dirancang untuk single-user dulu** — jangan
over-engineer role/permission.

## Tujuan produk

Memindahkan pekerjaan berulang yang bisa diotomatisasi ke dalam satu web
app yang terintegrasi:

1. **Lihat semua pesanan yang sedang berjalan** dalam satu layar, jelas
   mana yang butuh tindakan sekarang.
2. **Tracking & status per pesanan** — mengikuti milestone standar
   operasional perusahaan (Booking → Pickup → Berangkat → Dalam
   Perjalanan → Tiba → Terkirim → Selesai).
3. **Generate dokumen otomatis** per pesanan (Surat Jalan, Invoice, Cost
   Sheet/rincian biaya, Bukti Serah Terima) dari data yang sudah diinput
   sekali — bukan diketik ulang tiap kali.
4. **Keuangan per pesanan** — biaya vendor, tarif ke customer, margin,
   status pembayaran (lunas/belum), agar owner tidak perlu Excel
   terpisah.
5. **Kontak yang relevan otomatis muncul sesuai status pesanan** — mis.
   saat status "Dalam Perjalanan", yang ditampilkan adalah kontak supir
   & customer tujuan; saat status "Perlu Billing", yang ditampilkan
   kontak finance/customer terkait pembayaran.
6. **Bisa di-install ke home screen HP** — dibuka seperti aplikasi biasa,
   tanpa harus buka browser dan ketik alamat web tiap kali.

## Yang **bukan** tujuan versi ini

- Bukan sistem multi-cabang/multi-user kompleks.
- Bukan sistem customs clearance penuh (PIB/PEB otomatis ke Bea Cukai) —
  itu tetap manual/di luar sistem untuk sekarang, fokus ke domestik.
- Bukan aplikasi tracking GPS real-time dari alat IoT (belum ada
  perangkat tracking di kendaraan) — status pengiriman diupdate manual
  oleh owner/supir, bukan otomatis dari GPS.
- Bukan marketplace atau app yang diakses customer — ini tools internal
  untuk owner.

## Dynamic action button

Setiap pesanan punya **satu tombol aksi utama yang berubah sesuai
status**, supaya owner tidak perlu berpikir "apa yang harus saya lakukan
sekarang" — sistem yang memberi tahu:

| Status pesanan | Tombol aksi utama |
|---|---|
| Pesanan baru dibuat | "Konfirmasi Booking" |
| Sudah booking | "Catat Pickup" |
| Sudah pickup | "Tandai Berangkat" |
| Sudah berangkat | "Update Perjalanan" |
| Sudah sampai tujuan | "Buat Bukti Serah Terima (POD)" |
| Sudah terkirim, belum ada invoice | "Buat Invoice" |
| Invoice terbit, belum lunas | "Tandai Lunas" |
| Lunas | "Tutup Pesanan" |

## Ukuran keberhasilan (kualitatif, karena user tunggal)

- Owner bisa membuat dokumen (surat jalan/invoice) dalam hitungan detik,
  bukan menyalin manual dari template Word/Excel.
- Owner bisa cek status semua pesanan aktif dari HP tanpa buka Excel.
- Berkurangnya pesanan yang "terlewat" follow-up karena tidak termonitor.
- Owner nyaman memakainya sendiri tanpa bantuan, dalam waktu singkat
  (target: bisa dipakai mandiri setelah demo < 15 menit).
