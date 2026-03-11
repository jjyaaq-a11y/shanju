import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Sans_SC } from "next/font/google";
import "../globals.css";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

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

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${notoSansSC.variable}`}>
      <body className="min-h-screen font-sans">
        <LocaleProvider>
          <LenisProvider>{children}</LenisProvider>
          <CookieConsentBanner />
        </LocaleProvider>
      </body>
    </html>
  );
}
