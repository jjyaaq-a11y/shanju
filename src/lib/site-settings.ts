import { EMPTY_MEDIA_ASSET, getMediaAsset, type MediaAsset } from "@/lib/media";
import { zh } from "@/locales/zh";
import { en } from "@/locales/en";

const PAYLOAD_API =
  process.env.PAYLOAD_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

export type SiteHero = {
  heroImage: MediaAsset;
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
  qrImage: MediaAsset;
};

export type SiteSettings = {
  hero: SiteHero;
  why: SiteWhy;
  journal: SiteJournalSection;
  about: SiteAbout;
  footer: SiteFooter;
};

export function pickBilingual<T extends Record<string, unknown>>(
  obj: T | undefined,
  baseKey: string,
  locale: "zh" | "en"
): string {
  if (!obj) return "";
  const zh = obj[`${baseKey}Zh`];
  const en = obj[`${baseKey}En`];
  const old = obj[baseKey];
  if (locale === "zh") {
    return String(zh || old || en || "");
  }
  return String(en || old || zh || "");
}

export function mapSiteSettingsData(
  data: Record<string, any> | undefined,
  locale: "zh" | "en",
  defaults: SiteSettings
): SiteSettings {
  if (!data || !data.hero) return defaults;

  const whyItemsFromData = Array.isArray(data.why?.items) && data.why.items.length > 0
    ? data.why.items.map((item: Record<string, unknown>) => ({
        title: pickBilingual(item, "title", locale),
        desc: pickBilingual(item, "desc", locale),
      }))
    : [];
  const hasValidWhyItems = whyItemsFromData.some(
    (item: { title: string; desc: string }) => item.title.trim() || item.desc.trim()
  );

  return {
    hero: {
      heroImage: data.hero?.heroImage ? getMediaAsset(data.hero.heroImage) : defaults.hero.heroImage,
      title: pickBilingual(data.hero, "title", locale) || defaults.hero.title,
      tagline: pickBilingual(data.hero, "tagline", locale) || defaults.hero.tagline,
      regionSub: pickBilingual(data.hero, "regionSub", locale) || defaults.hero.regionSub,
      subtitle: pickBilingual(data.hero, "subtitle", locale) || defaults.hero.subtitle,
      ctaRoutes: pickBilingual(data.hero, "ctaRoutes", locale) || defaults.hero.ctaRoutes,
      ctaContact: pickBilingual(data.hero, "ctaContact", locale) || defaults.hero.ctaContact,
      altImage: pickBilingual(data.hero, "altImage", locale) || defaults.hero.altImage,
    },
    why: {
      sectionTitle: pickBilingual(data.why, "sectionTitle", locale) || defaults.why.sectionTitle,
      sectionDesc: pickBilingual(data.why, "sectionDesc", locale) || defaults.why.sectionDesc,
      items: hasValidWhyItems ? whyItemsFromData : defaults.why.items,
      paymentTitle: pickBilingual(data.why, "paymentTitle", locale) || defaults.why.paymentTitle,
      paymentDesc: pickBilingual(data.why, "paymentDesc", locale) || defaults.why.paymentDesc,
      translationTitle: pickBilingual(data.why, "translationTitle", locale) || defaults.why.translationTitle,
      translationDesc: pickBilingual(data.why, "translationDesc", locale) || defaults.why.translationDesc,
    },
    journal: {
      sectionTitle: pickBilingual(data.journal, "sectionTitle", locale) || defaults.journal.sectionTitle,
      sectionDesc: pickBilingual(data.journal, "sectionDesc", locale) || defaults.journal.sectionDesc,
    },
    about: {
      title: pickBilingual(data.about, "title", locale) || defaults.about.title,
      body: pickBilingual(data.about, "body", locale) || defaults.about.body,
    },
    footer: {
      desc: pickBilingual(data.footer, "desc", locale) || defaults.footer.desc,
      copyright: pickBilingual(data.footer, "copyright", locale) || defaults.footer.copyright,
      email: data.footer?.email || defaults.footer.email,
      instagram: data.footer?.instagram || defaults.footer.instagram,
      facebook: data.footer?.facebook || defaults.footer.facebook,
      whatsapp: data.footer?.whatsapp || defaults.footer.whatsapp,
      telegram: data.footer?.telegram || defaults.footer.telegram,
      wechat: data.footer?.wechat || defaults.footer.wechat,
      qrImage: data.footer?.qrImage ? getMediaAsset(data.footer.qrImage) : defaults.footer.qrImage,
    },
  };
}

/** 兜底数据：DB 为空时回退到 locale 文件中的默认值 */
function getDefaults(locale: "zh" | "en"): SiteSettings {
  const t = locale === "zh" ? zh : en;
  return {
    hero: {
      heroImage: EMPTY_MEDIA_ASSET,
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
      qrImage: EMPTY_MEDIA_ASSET,
    },
  };
}

export async function getSiteSettings(locale: "zh" | "en" = "zh"): Promise<SiteSettings> {
  const defaults = getDefaults(locale);
  try {
    const url = `${PAYLOAD_API}/api/globals/site-settings?locale=${locale}&fallbackLocale=zh&depth=2`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return defaults;
    const data = await res.json();
    return mapSiteSettingsData(data, locale, defaults);
  } catch {
    return defaults;
  }
}
