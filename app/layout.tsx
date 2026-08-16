import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DCN OpsHub — PT Daff Cargo Nusantara",
  description:
    "Aplikasi operasional freight forwarding & customs broker domestik PT Daff Cargo Nusantara.",
  applicationName: "DCN OpsHub",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DCN OpsHub",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B2545",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <OfflineBanner />
        <ServiceWorkerRegister />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
