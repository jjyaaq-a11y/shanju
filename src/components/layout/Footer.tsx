"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";

const linkKeys = ["home", "routes", "journal", "about", "contact"] as const;

export function Footer() {
  const { t } = useLocale();

  const links = linkKeys.map((key) => ({
    href: key === "home" ? "/" : `/#${key === "routes" ? "routes" : key === "journal" ? "journal" : key === "about" ? "about" : "contact"}`,
    label: t.nav[key],
  }));

  return (
    <footer id="contact" className="bg-ink text-cream py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <h3 className="font-serif text-2xl font-semibold mb-4">
              DeepChinaTrip
            </h3>
            <p className="text-cream/80 text-sm leading-relaxed mb-6 max-w-md">
              {t.footer.desc}
            </p>
            <ul className="flex flex-wrap gap-6">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream/80 hover:text-wheat text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-start md:items-end"
          >
            <p className="text-cream/70 text-sm mb-3">{t.footer.contact}</p>
            <p className="text-cream/60 text-xs mb-4">{t.footer.contactChannels}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${t.footer.email}`}
                  className="text-cream/90 hover:text-wheat transition-colors"
                >
                  {t.footer.emailLabel}: {t.footer.email}
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/deepchinatrip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/90 hover:text-wheat transition-colors"
                >
                  {t.footer.instagramLabel}: {t.footer.instagram}
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com/deepchinatrip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/90 hover:text-wheat transition-colors"
                >
                  {t.footer.facebookLabel}: {t.footer.facebook}
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/8613800000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/90 hover:text-wheat transition-colors"
                >
                  {t.footer.whatsappLabel}: {t.footer.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/deepchinatrip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/90 hover:text-wheat transition-colors"
                >
                  {t.footer.telegramLabel}: {t.footer.telegram}
                </a>
              </li>
              <li>
                <span className="text-cream/90">
                  {t.footer.wechatLabel}: {t.footer.wechat}
                </span>
                <span className="text-cream/60 text-xs ml-2">({t.footer.scanQR})</span>
              </li>
            </ul>
            <div
              className="mt-4 w-28 h-28 rounded-lg bg-rock/50 flex items-center justify-center text-cream/50 text-xs"
              aria-label={t.footer.qrPlaceholder}
            >
              {t.footer.qrPlaceholder}
            </div>
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/20">
          <p className="text-cream/60 text-xs">
            © {new Date().getFullYear()} DeepChinaTrip. {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
