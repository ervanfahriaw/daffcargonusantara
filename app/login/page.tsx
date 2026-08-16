"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email atau password salah. Coba lagi.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-[var(--color-bg)]">
      {/* Logo & Branding */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-navy-900)]">
          <Package className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-navy-900)]">
          DCN OpsHub
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-[280px]">
          Kelola pengiriman PT Daff Cargo Nusantara, dari satu tempat.
        </p>
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-[var(--color-surface)] rounded-3xl p-6 shadow-sm border border-[var(--color-border)]"
      >
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-6">
          Masuk
        </h2>

        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-neutral-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-neutral-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-[var(--color-danger-100)] px-4 py-3 text-sm text-[var(--color-danger-600)]">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
