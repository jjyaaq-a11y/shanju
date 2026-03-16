import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Sans_SC } from "next/font/google";
import "../globals.css";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { getLocaleFromRequest } from "@/lib/locale-server";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-sans-sc",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeepChinaTrip · Deep into Western China's Tibetan Heartland",
  description:
    "Authentic journeys to Sichuan's hidden highlands. Tibetan culture, plateau landscapes, Chengdu-area premium inbound tours. Hidden gems, authentic immersion.",
};

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleFromRequest();
  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      className={`${playfair.variable} ${inter.variable} ${notoSansSC.variable}`}
    >
      <body className="min-h-screen font-sans">
        <LocaleProvider initialLocale={locale}>
          <LenisProvider>{children}</LenisProvider>
          <CookieConsentBanner />
        </LocaleProvider>
      </body>
    </html>
  );
}
