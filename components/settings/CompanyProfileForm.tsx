"use client";

import { useState } from "react";
import { Building2, CreditCard, Save, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { updatePengaturanAction } from "@/lib/actions/pengaturan";
import { type CompanyProfileInput } from "@/lib/validations/pengaturan";

interface CompanyProfileFormProps {
  initialData?: {
    nama_perusahaan?: string | null;
    alamat?: string | null;
    npwp?: string | null;
    telepon?: string | null;
    email?: string | null;
    bank_name?: string | null;
    bank_account?: string | null;
    bank_holder?: string | null;
  } | null;
}

export function CompanyProfileForm({ initialData }: CompanyProfileFormProps) {
  const [loading, setLoading] = useState(false);

  const [namaPerusahaan, setNamaPerusahaan] = useState(
    initialData?.nama_perusahaan || "PT Daff Cargo Nusantara"
  );
  const [alamat, setAlamat] = useState(
    initialData?.alamat ||
      "Jl. Raya Logistik No. 88, Jakarta Utara, DKI Jakarta 14110"
  );
  const [npwp, setNpwp] = useState(initialData?.npwp || "01.234.567.8-901.000");
  const [telepon, setTelepon] = useState(
    initialData?.telepon || "0812-9876-5432"
  );
  const [email, setEmail] = useState(
    initialData?.email || "operasional@daffcargo.co.id"
  );

  const [bankName, setBankName] = useState(
    initialData?.bank_name || "Bank Central Asia (BCA)"
  );
  const [bankAccount, setBankAccount] = useState(
    initialData?.bank_account || "8830-1234-56"
  );
  const [bankHolder, setBankHolder] = useState(
    initialData?.bank_holder || "PT Daff Cargo Nusantara"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload: CompanyProfileInput = {
      nama_perusahaan: namaPerusahaan,
      alamat,
      npwp: npwp || undefined,
      telepon: telepon || undefined,
      email: email || undefined,
      bank_name: bankName || undefined,
      bank_account: bankAccount || undefined,
      bank_holder: bankHolder || undefined,
    };

    const res = await updatePengaturanAction(payload);
    setLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan pengaturan.");
      return;
    }

    toast.success(res.message);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── SEKSI 1: PROFIL PERUSAHAAN ── */}
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-surface-tint)] text-[var(--color-primary)]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-navy-900)]">
              Profil Perusahaan
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Data ini otomatis tercetak di kop Surat Jalan, Invoice, dan Cost Sheet.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
              Nama Resmi Perusahaan <span className="text-[var(--color-danger-600)]">*</span>
            </label>
            <input
              type="text"
              required
              value={namaPerusahaan}
              onChange={(e) => setNamaPerusahaan(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm font-bold text-[var(--color-navy-900)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
              Alamat Kantor Operasional <span className="text-[var(--color-danger-600)]">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                NPWP Perusahaan
              </label>
              <input
                type="text"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                placeholder="00.000.000.0-000.000"
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Nomor Telepon Kantor
              </label>
              <input
                type="text"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="021-xxxxxxx / 0812xxxx"
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
              Email Korespondensi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operasional@perusahaan.co.id"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── SEKSI 2: REKENING PEMBAYARAN (INVOICE) ── */}
      <div className="rounded-3xl bg-[var(--color-surface)] p-5 md:p-6 border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-teal-100)] text-[var(--color-teal-500)]">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-navy-900)]">
              Rekening Pembayaran (Invoice)
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Informasi rekening bank yang tercetak di lembar Invoice untuk pembayaran customer.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
              Nama Bank
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Contoh: Bank Central Asia (BCA)"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Nomor Rekening
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Contoh: 8830-1234-56"
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm font-bold text-[var(--color-navy-900)] tabular-nums focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Atas Nama (A/N)
              </label>
              <input
                type="text"
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                placeholder="Contoh: PT Daff Cargo Nusantara"
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── TOMBOL SIMPAN PENGATURAN ── */}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--color-primary-dark)] active:scale-[0.99] transition-all touch-target"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Menyimpan Perubahan...</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>Simpan Profil Perusahaan & Rekening</span>
          </>
        )}
      </button>
    </form>
  );
}
