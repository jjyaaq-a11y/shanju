"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";

const navKeys = ["home", "routes", "journal", "about", "contact"] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();

  const switchLocale = (next: "zh" | "en") => {
    if (next === locale) return;
    setLocale(next);
    startTransition(() => {
      router.refresh();
    });
  };

  const localeButtonClass = (target: "zh" | "en", compact = false) =>
    cn(
      "rounded-full transition-all duration-200",
      compact ? "px-3 py-1.5 text-xs font-semibold" : "px-3.5 py-2 text-sm font-semibold",
      locale === target
        ? "bg-plateau text-cream shadow-sm shadow-plateau/30"
        : "text-rock/80 hover:bg-cream hover:text-ink"
    );

  const navItems = navKeys.map((key) => ({
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
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        "bg-cream/80 backdrop-blur-md border-b border-rock/10"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-serif text-xl font-semibold text-ink hover:text-plateau transition-colors"
        >
          DeepChinaTrip
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-ink/90 hover:text-plateau transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-l border-rock/20 pl-6">
            <div className="flex items-center gap-1 rounded-full border border-plateau/20 bg-white/75 p-1 shadow-sm shadow-rock/10 backdrop-blur-sm">
              <span className="sr-only">Switch language</span>
              <button
                type="button"
                onClick={() => switchLocale("zh")}
                className={localeButtonClass("zh")}
                aria-label="中文"
                aria-pressed={locale === "zh"}
              >
                中文
              </button>
              <button
                type="button"
                onClick={() => switchLocale("en")}
                className={localeButtonClass("en")}
                aria-label="English"
                aria-pressed={locale === "en"}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        <div className="flex md:hidden items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-plateau/20 bg-white/80 p-1 shadow-sm shadow-rock/10 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => switchLocale("zh")}
              className={localeButtonClass("zh", true)}
              aria-pressed={locale === "zh"}
            >
              中文
            </button>
            <button
              type="button"
              onClick={() => switchLocale("en")}
              className={localeButtonClass("en", true)}
              aria-pressed={locale === "en"}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            aria-label="菜单"
            className="p-2 text-ink"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="block w-6 h-0.5 bg-ink mb-1.5" />
            <span className="block w-6 h-0.5 bg-ink mb-1.5" />
            <span className="block w-6 h-0.5 bg-ink" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-rock/10 bg-cream/95 backdrop-blur"
          >
            <ul className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-2 text-ink hover:text-plateau"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
