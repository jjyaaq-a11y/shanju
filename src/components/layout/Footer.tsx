"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CmsImage } from "@/components/ui/CmsImage";
import { useLocale } from "@/contexts/LocaleContext";
import type { SiteFooter } from "@/lib/site-settings";

const linkKeys = ["home", "routes", "journal", "about", "contact"] as const;

type FooterProps = { siteFooter: SiteFooter };

export function Footer({ siteFooter }: FooterProps) {
  const { t } = useLocale();

  const links = linkKeys.map((key) => ({
    href:
      key === "home"
        ? "/"
        : key === "routes"
          ? "/routes"
        : key === "journal"
          ? "/journal"
          : `/#${key === "about" ? "about" : "contact"}`,
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
              {siteFooter.desc}
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
              {siteFooter.email && (
                <li>
                  <a
                    href={`mailto:${siteFooter.email}`}
                    className="text-cream/90 hover:text-wheat transition-colors"
                  >
                    {t.footer.emailLabel}: {siteFooter.email}
                  </a>
                </li>
              )}
              {siteFooter.instagram && (
                <li>
                  <a
                    href={`https://instagram.com/${siteFooter.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cream/90 hover:text-wheat transition-colors"
                  >
                    {t.footer.instagramLabel}: {siteFooter.instagram}
                  </a>
                </li>
              )}
              {siteFooter.facebook && (
                <li>
                  <a
                    href={`https://facebook.com/${siteFooter.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cream/90 hover:text-wheat transition-colors"
                  >
                    {t.footer.facebookLabel}: {siteFooter.facebook}
                  </a>
                </li>
              )}
              {siteFooter.whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${siteFooter.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cream/90 hover:text-wheat transition-colors"
                  >
                    {t.footer.whatsappLabel}: {siteFooter.whatsapp}
                  </a>
                </li>
              )}
              {siteFooter.telegram && (
                <li>
                  <a
                    href={`https://t.me/${siteFooter.telegram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cream/90 hover:text-wheat transition-colors"
                  >
                    {t.footer.telegramLabel}: {siteFooter.telegram}
                  </a>
                </li>
              )}
              {siteFooter.wechat && (
                <li>
                  <span className="text-cream/90">
                    {t.footer.wechatLabel}: {siteFooter.wechat}
                  </span>
                  <span className="text-cream/60 text-xs ml-2">({t.footer.scanQR})</span>
                </li>
              )}
            </ul>

            {siteFooter.qrImage.url ? (
              <div className="mt-4 w-28 h-28 rounded-lg overflow-hidden relative">
                <CmsImage
                  src={siteFooter.qrImage.url}
                  alt={t.footer.qrPlaceholder}
                  fill
                  className="object-cover"
                  rotation={siteFooter.qrImage.rotation}
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="mt-4 w-28 h-28 rounded-lg bg-rock/50 flex items-center justify-center text-cream/50 text-xs"
                aria-label={t.footer.qrPlaceholder}
              >
                {t.footer.qrPlaceholder}
              </div>
            )}
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/20">
          <p className="text-cream/60 text-xs">
            © {new Date().getFullYear()} DeepChinaTrip. {siteFooter.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
