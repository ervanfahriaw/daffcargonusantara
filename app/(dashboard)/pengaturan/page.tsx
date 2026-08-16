import { Header } from "@/components/layout/Header";
import { CompanyProfileForm } from "@/components/settings/CompanyProfileForm";
import { WhatsAppGatewayCard } from "@/components/settings/WhatsAppGatewayCard";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { LogoutButton } from "@/components/settings/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { Shield, Sparkles } from "lucide-react";

export const metadata = {
  title: "Pengaturan — DCN OpsHub",
  description: "Pengaturan profil perusahaan, WhatsApp Gateway, rekening bank invoice, dan keamanan akun.",
};

export default async function PengaturanPage() {
  const supabase = await createClient();

  // 1. Ambil info user aktif
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Ambil data profil perusahaan
  const { data: pengaturan } = await supabase
    .from("pengaturan")
    .select("*")
    .limit(1)
    .single();

  return (
    <>
      <Header title="Pengaturan" />

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-28">
        {/* ── Integrasi WhatsApp Gateway & Scan QR ── */}
        <WhatsAppGatewayCard
          ownerPhone={pengaturan?.telepon_operasional || "081282200880"}
          ownerName={pengaturan?.nama_owner || "Pemilik DCN"}
        />

        {/* ── Form Profil Perusahaan & Rekening ── */}
        <CompanyProfileForm initialData={pengaturan} />

        {/* ── Keamanan Akun (Ganti Password) ── */}
        <ChangePasswordForm />

        {/* ── Akun & Sesi (Logout) ── */}
        <LogoutButton userEmail={user?.email} />

        {/* ── Footer Info Versi Aplikasi ── */}
        <div className="pt-4 text-center space-y-1">
          <p className="text-xs font-bold text-[var(--color-navy-900)]">
            DCN OpsHub v1.0 — PT Daff Cargo Nusantara
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Sistem Manajemen Operasional & Forwarding Domestik
          </p>
        </div>
      </div>
    </>
  );
}
