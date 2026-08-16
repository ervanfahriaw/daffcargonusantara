# References — DCN OpsHub

## Referensi visual (dari 3 screenshot yang diberikan)

Ketiga screenshot dipakai sebagai **DNA visual**, bukan untuk ditiru
persis — konteksnya disesuaikan ke domestic trucking, bukan e-commerce
parcel delivery. Yang diambil:

1. **Layar "Shipment Overview"** → pola untuk **Beranda**: heading besar
   di atas, ilustrasi line-art simpel (truk + gudang) di bawah heading,
   2 stat card berdampingan dengan background biru muda lembut dan angka
   besar, section list task dengan checkbox bulat + tanggal di kanan,
   mini grafik line chart performa mingguan, bottom nav 4 ikon dengan
   1 ikon aktif berwarna. → Ini jadi acuan langsung untuk struktur
   Beranda & bottom nav di `design-system.md` dan `sitemap.md`.

2. **Layar "Real-Time Tracking" (peta)** → pola untuk visual rute di tab
   Tracking: garis rute berwarna teal yang jelas di atas peta abu-abu
   muda, marker titik lokasi bulat dengan ikon kendaraan. Karena versi
   ini **belum punya GPS device di kendaraan** (lihat `docs/brief.md`),
   elemen peta live tidak dipakai di fase 1 — yang diambil hanya bahasa
   visualnya (warna teal untuk "sedang bergerak/in transit") diterapkan
   ke **stepper vertikal**, bukan peta.

3. **Layar "Shipment Details"** → pola untuk **tab Tracking di Detail
   Pesanan**: header info pesanan (nomor, status badge, estimasi),
   preview rute kecil, **stepper vertikal dengan titik solid/outline**
   untuk tiap milestone lengkap dengan timestamp & lokasi, card
   "Cargo Specifications" dengan 3 ikon berdampingan (berat, dimensi,
   jenis barang) → jadi acuan untuk card **Data Muatan**, dan section
   "Digital Proof of Delivery" (foto + tanda tangan + tombol) → jadi
   acuan langsung untuk dokumen **Bukti Serah Terima (POD)**.

## Identitas brand perusahaan

Palet navy + oranye mengikuti company profile resmi PT Daff Cargo
Nusantara yang sudah pernah dibuat sebelumnya — dipadukan dengan nuansa
teal/biru muda dari referensi UI di atas supaya tetap terasa modern dan
tidak kaku seperti dokumen korporat.

## Font

- [Plus Jakarta Sans — Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans)

## Ikon

- [Lucide Icons](https://lucide.dev) — icon set SVG line-style yang
  dipakai di seluruh aplikasi (lihat aturan di `design-system.md`).

## Dokumentasi teknis

- [Next.js Documentation](https://nextjs.org/docs)
- [Serwist — PWA untuk Next.js](https://serwist.pages.dev/docs/next) —
  pengganti `next-pwa` yang sudah tidak maintained; dipakai untuk
  fitur installable/home screen.
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [@react-pdf/renderer](https://react-pdf.org) — untuk generate dokumen
  PDF (Surat Jalan, Invoice, Cost Sheet, POD).

## Sumber konteks bisnis

- *Profil Usaha, Proses Bisnis, dan Flowchart Operasional — PT Daff
  Cargo Nusantara* (dokumen internal, Juli 2026) — sumber utama untuk
  daftar jenis dokumen, milestone status pengiriman (`docs/content.md`),
  dan daftar pihak/kontak per tahap pesanan.
