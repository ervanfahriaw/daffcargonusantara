import { BottomNav } from "@/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      {/* Main content — leaves room for bottom nav */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
