-- ============================================================
-- DCN OpsHub — Database Schema
-- PT Daff Cargo Nusantara (Customs Broker & Domestic Freight Forwarding)
-- Jalankan SQL ini di Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Enum Types ──

-- Status Pesanan (Mendukung Moda Darat & Laut Antarpulau)
CREATE TYPE status_pesanan AS ENUM (
  'booking',
  'pickup',
  'stuffing',
  'gate_in_pelabuhan',
  'berangkat',
  'kapal_berangkat',
  'dalam_perjalanan',
  'pelayaran',
  'tiba',
  'kapal_tiba',
  'dooring',
  'terkirim',
  'tertunda',
  'selesai'
);

CREATE TYPE status_pembayaran AS ENUM (
  'belum_ditagih',
  'menunggu_pembayaran',
  'lunas'
);

CREATE TYPE jenis_armada AS ENUM (
  'cdd',
  'fuso',
  'wingbox',
  'trailer',
  'lowbed',
  'lainnya'
);

CREATE TYPE kategori_kontak AS ENUM (
  'customer',
  'vendor_trucking',
  'supir',
  'pelayaran',
  'depo_port',
  'internal'
);

CREATE TYPE jenis_dokumen AS ENUM (
  'surat_jalan',
  'invoice',
  'cost_sheet',
  'pod'
);

-- ── Tabel: kontak ──

CREATE TABLE IF NOT EXISTS kontak (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL,
  nomor_telepon TEXT NOT NULL,
  perusahaan TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kontak_kategori ON kontak(kategori);
CREATE INDEX IF NOT EXISTS idx_kontak_user_id ON kontak(user_id);

-- ── Tabel: pesanan (Multimodal Domestic Freight) ──

CREATE TABLE IF NOT EXISTS pesanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_pesanan TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Moda & Layanan
  moda_pengiriman TEXT NOT NULL DEFAULT 'darat',
  tipe_layanan_laut TEXT,

  -- Customer & Rute
  nama_customer TEXT NOT NULL,
  kontak_customer_id UUID REFERENCES kontak(id) ON DELETE SET NULL,
  alamat_asal TEXT NOT NULL,
  alamat_tujuan TEXT NOT NULL,

  -- Laut Spesifik (Pelabuhan, Kapal, Kontainer)
  pelabuhan_asal TEXT,
  pelabuhan_tujuan TEXT,
  nama_kapal TEXT,
  nomor_kontainer TEXT,
  nomor_seal TEXT,
  pelayaran_id UUID REFERENCES kontak(id) ON DELETE SET NULL,

  -- Muatan
  jenis_barang TEXT,
  berat NUMERIC(10,2),
  volume NUMERIC(10,2),
  jumlah_koli INTEGER,
  catatan_muatan TEXT,

  -- Darat Spesifik (Armada Truk, Supir)
  jenis_armada TEXT,
  vendor_trucking_id UUID REFERENCES kontak(id) ON DELETE SET NULL,
  supir_id UUID REFERENCES kontak(id) ON DELETE SET NULL,
  plat_nomor TEXT,

  -- Jadwal
  estimasi_berangkat DATE,
  estimasi_tiba DATE,

  -- Keuangan
  tarif_customer NUMERIC(15,2) DEFAULT 0,
  biaya_vendor NUMERIC(15,2) DEFAULT 0,
  biaya_lainnya NUMERIC(15,2) DEFAULT 0,

  -- Status
  status TEXT NOT NULL DEFAULT 'booking',
  status_pembayaran TEXT NOT NULL DEFAULT 'belum_ditagih',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pesanan_status ON pesanan(status);
CREATE INDEX IF NOT EXISTS idx_pesanan_user_id ON pesanan(user_id);
CREATE INDEX IF NOT EXISTS idx_pesanan_created_at ON pesanan(created_at DESC);

-- ── Tabel: riwayat_status ──

CREATE TABLE IF NOT EXISTS riwayat_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pesanan_id UUID NOT NULL REFERENCES pesanan(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_riwayat_pesanan_id ON riwayat_status(pesanan_id);

-- ── Tabel: dokumen ──

CREATE TABLE IF NOT EXISTS dokumen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pesanan_id UUID NOT NULL REFERENCES pesanan(id) ON DELETE CASCADE,
  jenis TEXT NOT NULL,
  nomor_dokumen TEXT NOT NULL,
  pdf_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dokumen_pesanan_id ON dokumen(pesanan_id);

-- ── Tabel: pengaturan ──

CREATE TABLE IF NOT EXISTS pengaturan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_perusahaan TEXT NOT NULL DEFAULT 'PT Daff Cargo Nusantara',
  nama_owner TEXT NOT NULL DEFAULT 'Pemilik DCN',
  alamat TEXT NOT NULL DEFAULT 'Jl. Raya Logistik No. 88, Jakarta Utara',
  nomor_telepon TEXT NOT NULL DEFAULT '081234567890',
  email TEXT NOT NULL DEFAULT 'ops@daffcargo.co.id',
  bank_nama TEXT NOT NULL DEFAULT 'BCA',
  bank_rekening TEXT NOT NULL DEFAULT '1234567890',
  bank_atas_nama TEXT NOT NULL DEFAULT 'PT Daff Cargo Nusantara',
  syarat_ketentuan TEXT DEFAULT 'Pembayaran jatuh tempo 14 hari setelah invoice diterima.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Row Level Security (RLS) ──

ALTER TABLE kontak ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE riwayat_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumen ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengaturan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts" ON kontak FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own shipments" ON pesanan FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view shipment history" ON riwayat_status FOR ALL USING (
  EXISTS (SELECT 1 FROM pesanan WHERE pesanan.id = riwayat_status.pesanan_id AND pesanan.user_id = auth.uid())
);
CREATE POLICY "Users can view shipment documents" ON dokumen FOR ALL USING (
  EXISTS (SELECT 1 FROM pesanan WHERE pesanan.id = dokumen.pesanan_id AND pesanan.user_id = auth.uid())
);
CREATE POLICY "Users can view own settings" ON pengaturan FOR ALL USING (auth.uid() = user_id);
