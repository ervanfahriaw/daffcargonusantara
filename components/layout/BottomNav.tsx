"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, UserCircle, Menu } from "lucide-react";

const navItems = [
  {
    label: "Beranda",
    href: "/",
    icon: Home,
  },
  {
    label: "Pesanan",
    href: "/pesanan",
    icon: Package,
  },
  {
    label: "Kontak",
    href: "/kontak",
    icon: UserCircle,
  },
  {
    label: "Lainnya",
    href: "/pengaturan",
    icon: Menu,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Safe area padding for PWA / notched devices */}
      <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[64px] touch-target transition-colors ${
                active
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              <Icon
                className="h-6 w-6"
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className="text-[11px] font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
