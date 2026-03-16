"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { zh } from "@/locales/zh";
import { en } from "@/locales/en";
import type { LocaleMessages } from "@/locales/zh";

export type Locale = "zh" | "en";

const messages: Record<Locale, LocaleMessages> = { zh, en };

const STORAGE_KEY = "shanju-locale";
const CONSENT_COOKIE = "shanju-cookie-consent";

function hasCookieConsent(): boolean {
  if (typeof document === "undefined") return false;
  const m = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  const v = m ? m.split("=")[1] : null;
  return v === "accepted";
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: LocaleMessages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? "en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const applyConsent = () => {
      try {
        const consented = hasCookieConsent();
        const fromCookie = document.cookie
          .split("; ")
          .find((c) => c.startsWith("shanju-locale="))
          ?.split("=")[1] as Locale | undefined;
        const fromStorage = (localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)) as Locale | null;
        const next = fromCookie === "zh" || fromCookie === "en" ? fromCookie
          : fromStorage === "zh" || fromStorage === "en" ? fromStorage
          : undefined;
        if (next) setLocaleState(next);
        if (consented && next) {
          document.cookie = `shanju-locale=${next};path=/;max-age=31536000`;
          localStorage.setItem(STORAGE_KEY, next);
        }
      } catch { /* ignore */ }
    };
    applyConsent();
    setMounted(true);
    window.addEventListener("cookie-consent", applyConsent);
    return () => window.removeEventListener("cookie-consent", applyConsent);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      const consent = hasCookieConsent();
      // Keep a session-level locale cookie so server-rendered data can switch immediately.
      document.cookie = `shanju-locale=${next};path=/;SameSite=Lax`;
      if (consent) {
        localStorage.setItem(STORAGE_KEY, next);
        document.cookie = `shanju-locale=${next};path=/;max-age=31536000;SameSite=Lax`;
      } else {
        sessionStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // ignore
    }
  }, []);

  const t = messages[locale];

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
