"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";

const CONSENT_COOKIE = "shanju-cookie-consent";

function getConsent(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  return m ? m.split("=")[1] ?? null : null;
}

function setConsent(value: "accepted" | "declined") {
  document.cookie = `${CONSENT_COOKIE}=${value};path=/;max-age=31536000;SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("cookie-consent", { detail: value }));
}

export function CookieConsentBanner() {
  const { t, locale } = useLocale();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const consent = getConsent();
    setVisible(!consent);
  }, [mounted]);

  const handleAccept = () => {
    setConsent("accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    setConsent("declined");
    setVisible(false);
  };

  if (!visible || !mounted) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={locale === "zh" ? "Cookie 同意" : "Cookie consent"}
      className="fixed bottom-0 left-0 right-0 z-50 bg-ink/95 text-cream px-4 py-4 shadow-lg"
    >
      <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-cream/95 flex-1">{t.cookie.message}</p>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="wheat"
            size="sm"
            onClick={handleAccept}
            className="flex-1 sm:flex-initial"
          >
            {t.cookie.accept}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecline}
            className="border-cream/50 text-cream hover:bg-cream/20 flex-1 sm:flex-initial"
          >
            {t.cookie.decline}
          </Button>
        </div>
      </div>
    </div>
  );
}
