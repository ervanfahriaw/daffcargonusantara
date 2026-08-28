# DCN OpsHub — PT Daff Cargo Nusantara

Sistem manajemen operasional pengiriman untuk PT Daff Cargo Nusantara. Dibangun dengan Next.js 16, Supabase, dan Tailwind CSS.

🌐 **Live**: [https://project-two-lovat-41.vercel.app](https://project-two-lovat-41.vercel.app)

---

## 🚀 Quick Start (Jalankan di Perangkat Lain)

### Prasyarat

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) versi **18** atau lebih baru
- [Git](https://git-scm.com/)

### 1. Clone Repository

```bash
git clone git@github.com:ervanfahriaw/daffcargonusantara.git
cd daffcargonusantara
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Salin file template environment, lalu isi dengan credential Supabase Anda:

```bash
# Windows (CMD)
copy .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local

# Mac / Linux
cp .env.example .env.local
```

Buka `.env.local` dan isi value-nya:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> **💡 Cara dapatkan credential Supabase:**
> 1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
> 2. Pilih project → **Settings** → **API**
> 3. Copy URL, anon key, dan service role key

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📁 Struktur Project

```
├── app/                  # Next.js App Router (halaman & API routes)
│   ├── (dashboard)/      # Halaman dashboard (protected)
│   ├── api/              # API endpoints
│   ├── login/            # Halaman login
│   ├── lacak/            # Halaman lacak pengiriman (public)
│   └── tracking/         # Halaman tracking (public)
├── components/           # Komponen UI reusable
├── lib/                  # Utility, Supabase client, helpers
├── gateway/              # WhatsApp Web gateway
├── assets/               # Asset statis
├── public/               # File publik (favicon, dll)
└── middleware.ts         # Auth middleware
```

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| **Next.js 16** | Framework React full-stack |
| **Supabase** | Database & Authentication |
| **Tailwind CSS 4** | Styling |
| **Recharts** | Grafik & chart |
| **Lucide React** | Ikon |
| **WhatsApp Web.js** | Gateway notifikasi WA |
| **Zod** | Validasi data |

## 📜 Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm start` | Jalankan production server |
| `npm run lint` | Cek linting |
| `npm run wa:server` | Jalankan WhatsApp gateway |

## 🚢 Deploy ke Vercel

1. Push ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Tambahkan environment variables di Vercel Dashboard
4. Deploy otomatis setiap push ke `main`

---

**© 2026 PT Daff Cargo Nusantara**
