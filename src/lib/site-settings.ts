import type { Media } from "payload-types";
import { zh } from "@/locales/zh";
import { en } from "@/locales/en";

const PAYLOAD_API =
  process.env.NEXT_PUBLIC_PAYLOAD_URL || process.env.PAYLOAD_URL || "http://localhost:3000";
const REVALIDATE = process.env.NODE_ENV === "development" ? 0 : 3600;

function getMediaUrl(media: unknown): string {
  if (!media || typeof media !== "object") return "";
  const m = media as Media;
  const rawUrl = m.url;
  if (!rawUrl) return "";
  if (rawUrl.startsWith("http")) return rawUrl;
  const base = PAYLOAD_API.replace(/\/$/, "");
  return `${base}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
}

export type SiteHero = {
  heroImage: string;
  title: string;
  tagline: string;
  regionSub: string;
  subtitle: string;
  ctaRoutes: string;
  ctaContact: string;
  altImage: string;
};

export type SiteWhyItem = { title: string; desc: string };

export type SiteWhy = {
  sectionTitle: string;
  sectionDesc: string;
  items: SiteWhyItem[];
  paymentTitle: string;
  paymentDesc: string;
  translationTitle: string;
  translationDesc: string;
};

export type SiteJournalSection = {
  sectionTitle: string;
  sectionDesc: string;
};

export type SiteAbout = {
  title: string;
  body: string;
};

export type SiteFooter = {
  desc: string;
  copyright: string;
  email: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  telegram: string;
  wechat: string;
  qrImage: string;
};

export type SiteSettings = {
  hero: SiteHero;
  why: SiteWhy;
  journal: SiteJournalSection;
  about: SiteAbout;
  footer: SiteFooter;
};

/** 兜底数据：DB 为空时回退到 locale 文件中的默认值 */
function getDefaults(locale: "zh" | "en"): SiteSettings {
  const t = locale === "zh" ? zh : en;
  return {
    hero: {
      heroImage: "",
      title: t.hero.title,
      tagline: t.hero.tagline,
      regionSub: t.hero.regionSub,
      subtitle: t.hero.subtitle,
      ctaRoutes: t.hero.ctaRoutes,
      ctaContact: t.hero.ctaContact,
      altImage: t.hero.altImage,
    },
    why: {
      sectionTitle: t.why.sectionTitle,
      sectionDesc: t.why.sectionDesc,
      items: (t.why.items as ReadonlyArray<{ title: string; desc: string }>).map((item) => ({
        title: item.title,
        desc: item.desc,
      })),
      paymentTitle: t.why.payment.title,
      paymentDesc: t.why.payment.desc,
      translationTitle: t.why.translation.title,
      translationDesc: t.why.translation.desc,
    },
    journal: {
      sectionTitle: t.journal.sectionTitle,
      sectionDesc: t.journal.sectionDesc,
    },
    about: {
      title: t.about.title,
      body: t.about.body,
    },
    footer: {
      desc: t.footer.desc,
      copyright: t.footer.copyright,
      email: t.footer.email,
      instagram: t.footer.instagram,
      facebook: t.footer.facebook,
      whatsapp: t.footer.whatsapp,
      telegram: t.footer.telegram,
      wechat: t.footer.wechat,
      qrImage: "",
    },
  };
}

export async function getSiteSettings(locale: "zh" | "en" = "zh"): Promise<SiteSettings> {
  const defaults = getDefaults(locale);
  try {
    const url = `${PAYLOAD_API}/api/globals/site-settings?locale=${locale}&fallbackLocale=zh&depth=2`;
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return defaults;
    const data = await res.json();

    // 如果 DB 还未初始化任何内容，就用默认值
    if (!data || !data.hero) return defaults;

    const whyItemsFromData = Array.isArray(data.why?.items) && data.why.items.length > 0
      ? data.why.items.map((item: { title?: string; desc?: string }) => ({
          title: item.title || "",
          desc: item.desc || "",
        }))
      : [];
    const hasValidWhyItems = whyItemsFromData.some(
      (item: { title: string; desc: string }) => item.title.trim() || item.desc.trim()
    );

    return {
      hero: {
        heroImage: getMediaUrl(data.hero?.heroImage) || defaults.hero.heroImage,
        title: data.hero?.title || defaults.hero.title,
        tagline: data.hero?.tagline || defaults.hero.tagline,
        regionSub: data.hero?.regionSub || defaults.hero.regionSub,
        subtitle: data.hero?.subtitle || defaults.hero.subtitle,
        ctaRoutes: data.hero?.ctaRoutes || defaults.hero.ctaRoutes,
        ctaContact: data.hero?.ctaContact || defaults.hero.ctaContact,
        altImage: data.hero?.altImage || defaults.hero.altImage,
      },
      why: {
        sectionTitle: data.why?.sectionTitle || defaults.why.sectionTitle,
        sectionDesc: data.why?.sectionDesc || defaults.why.sectionDesc,
        items: hasValidWhyItems ? whyItemsFromData : defaults.why.items,
        paymentTitle: data.why?.paymentTitle || defaults.why.paymentTitle,
        paymentDesc: data.why?.paymentDesc || defaults.why.paymentDesc,
        translationTitle: data.why?.translationTitle || defaults.why.translationTitle,
        translationDesc: data.why?.translationDesc || defaults.why.translationDesc,
      },
      journal: {
        sectionTitle: data.journal?.sectionTitle || defaults.journal.sectionTitle,
        sectionDesc: data.journal?.sectionDesc || defaults.journal.sectionDesc,
      },
      about: {
        title: data.about?.title || defaults.about.title,
        body: data.about?.body || defaults.about.body,
      },
      footer: {
        desc: data.footer?.desc || defaults.footer.desc,
        copyright: data.footer?.copyright || defaults.footer.copyright,
        email: data.footer?.email || defaults.footer.email,
        instagram: data.footer?.instagram || defaults.footer.instagram,
        facebook: data.footer?.facebook || defaults.footer.facebook,
        whatsapp: data.footer?.whatsapp || defaults.footer.whatsapp,
        telegram: data.footer?.telegram || defaults.footer.telegram,
        wechat: data.footer?.wechat || defaults.footer.wechat,
        qrImage: getMediaUrl(data.footer?.qrImage) || defaults.footer.qrImage,
      },
    };
  } catch {
    return defaults;
  }
}
