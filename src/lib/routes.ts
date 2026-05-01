import type { Route as PayloadRoute, Media } from "payload-types";
import { EMPTY_MEDIA_ASSET, getMediaAsset, type MediaAsset } from "@/lib/media";

const PAYLOAD_API =
  process.env.PAYLOAD_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";
export type LocaleKey = "zh" | "en";

function lexicalToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const obj = node as Record<string, unknown>;
  if (typeof obj.text === "string") return obj.text;
  const children = obj.children;
  if (Array.isArray(children)) {
    return children.map(lexicalToText).filter(Boolean).join("");
  }
  return "";
}

export type RouteTextBlock = { zh: string; en: string };
export type RouteItinerarySection = {
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  images: MediaAsset[];
};

export type Route = {
  id: string;
  name: { zh: string; en: string };
  days: { zh: string; en: string };
  daysCount: number;
  overview: { zh: string; en: string };
  pricePerGroup: Record<2 | 3 | 4 | 5 | 6, number>;
  basePricePerPersonPerDay: number;
  image: MediaAsset;
  daySections: RouteItinerarySection[][];
  whatsIncluded: { zh: string[]; en: string[] };
  travelTips: { zh: string; en: string };
};

export type RouteListResult = {
  docs: Route[];
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalDocs: number;
};

function formatDays(daysCount: number, locale: LocaleKey): string {
  const nights = Math.max(0, daysCount - 1);
  return locale === "zh"
    ? `${daysCount}天${nights}晚`
    : `${daysCount}D ${nights}N`;
}

type DayTextBlockItem = {
  descriptionZh?: unknown;
  descriptionEn?: unknown;
};

type DaySectionItem = {
  titleZh?: unknown;
  titleEn?: unknown;
  descriptionZh?: unknown;
  descriptionEn?: unknown;
  images?: Array<{ image?: unknown }>;
};

type DayItineraryItem = {
  description?: unknown;
  descriptionZh?: unknown;
  descriptionEn?: unknown;
  images?: Array<{ image?: unknown }>;
  textBlocks?: DayTextBlockItem[];
  sections?: DaySectionItem[];
};

type PrRoute = PayloadRoute & {
  nameEn?: string;
  overviewZh?: string;
  overviewEn?: string;
  heroImage?: number | Media | null;
  price_2_people?: number;
  price_3_people?: number;
  price_4_people?: number;
  price_5_people?: number;
  price_6_people?: number;
  dayItinerary?: DayItineraryItem[];
  whatsIncluded?: Array<{ item?: string; itemZh?: string; itemEn?: string; id?: string }>;
  travelTips?: string;
  travelTipsZh?: string;
  travelTipsEn?: string;
};

function richTextToPlain(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const root = (value as { root?: unknown }).root;
  if (!root) return "";
  return lexicalToText(root);
}

function englishNameFromSlug(slug?: string | null): string {
  if (!slug) return "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapDayTextBlocks(day: DayItineraryItem): RouteTextBlock[] {
  const textBlocks = Array.isArray(day.textBlocks)
    ? day.textBlocks
        .map((block) => ({
          zh: richTextToPlain(block.descriptionZh),
          en: richTextToPlain(block.descriptionEn),
        }))
        .filter((block) => block.zh || block.en)
    : [];

  if (textBlocks.length > 0) {
    return textBlocks.map((block) => ({
      zh: block.zh,
      en: block.en || block.zh,
    }));
  }

  const legacyZh = richTextToPlain(day.descriptionZh) || richTextToPlain(day.description);
  const legacyEn = richTextToPlain(day.descriptionEn) || legacyZh;
  if (!legacyZh && !legacyEn) return [];
  return [{ zh: legacyZh, en: legacyEn }];
}

function mapSectionImages(images: Array<{ image?: unknown }> | undefined): MediaAsset[] {
  return (images ?? [])
    .map((item) => getMediaAsset(item.image))
    .filter((asset): asset is MediaAsset => Boolean(asset.url));
}

function mapDaySections(day: DayItineraryItem): RouteItinerarySection[] {
  const sections = Array.isArray(day.sections)
    ? day.sections
        .map((section) => {
          const titleZh = typeof section.titleZh === "string" ? section.titleZh : "";
          const titleEn = typeof section.titleEn === "string" ? section.titleEn : "";
          const descriptionZh = richTextToPlain(section.descriptionZh);
          const descriptionEn = richTextToPlain(section.descriptionEn);
          const images = mapSectionImages(section.images);

          return {
            title: {
              zh: titleZh,
              en: titleEn || titleZh,
            },
            description: {
              zh: descriptionZh,
              en: descriptionEn || descriptionZh,
            },
            images,
          };
        })
        .filter(
          (section) =>
            section.title.zh ||
            section.title.en ||
            section.description.zh ||
            section.description.en ||
            section.images.length > 0
        )
    : [];

  if (sections.length > 0) return sections;

  const legacyTextBlocks = mapDayTextBlocks(day);
  const legacyImages = mapSectionImages(day.images);
  if (legacyTextBlocks.length === 0 && legacyImages.length === 0) return [];

  return [
    {
      title: { zh: "", en: "" },
      description: {
        zh: legacyTextBlocks.map((block) => block.zh).filter(Boolean).join("\n\n"),
        en: legacyTextBlocks.map((block) => block.en).filter(Boolean).join("\n\n"),
      },
      images: legacyImages,
    },
  ];
}

export function mapPayloadRouteToRoute(pr: PrRoute): Route {
  const nameZh = pr.name || "";
  const nameEn = pr.nameEn?.trim() || englishNameFromSlug(pr.slug) || nameZh;
  const daysCount = pr.daysCount ?? 0;
  const dayItinerary = pr.dayItinerary ?? [];
  const daySections = dayItinerary.map((day) => mapDaySections(day));

  const imageAsset = pr.heroImage ? getMediaAsset(pr.heroImage) : EMPTY_MEDIA_ASSET;

  const pricePerGroup: Record<2 | 3 | 4 | 5 | 6, number> = {
    2: pr.price_2_people ?? 0,
    3: pr.price_3_people ?? 0,
    4: pr.price_4_people ?? 0,
    5: pr.price_5_people ?? 0,
    6: pr.price_6_people ?? 0,
  };
  const daysSafe = Math.max(1, daysCount);
  const basePricePerPersonPerDay = (pr.price_2_people ?? 0) / daysSafe;

  const includedItemsZh = (pr.whatsIncluded ?? [])
    .map((w) => w.itemZh || w.item || "")
    .filter(Boolean);
  const includedItemsEn = (pr.whatsIncluded ?? [])
    .map((w) => w.itemEn || w.itemZh || w.item || "")
    .filter(Boolean);

  return {
    id: pr.slug || String(pr.id),
    name: { zh: nameZh, en: nameEn },
    days: { zh: formatDays(daysCount, "zh"), en: formatDays(daysCount, "en") },
    daysCount,
    overview: {
      zh: pr.overviewZh ?? "",
      en: pr.overviewEn ?? "",
    },
    pricePerGroup,
    basePricePerPersonPerDay,
    image: imageAsset,
    daySections,
    whatsIncluded: { zh: includedItemsZh, en: includedItemsEn },
    travelTips: {
      zh: pr.travelTipsZh ?? pr.travelTips ?? "",
      en: pr.travelTipsEn ?? pr.travelTipsZh ?? pr.travelTips ?? "",
    },
  };
}

function mergeDaySections(
  zhDays: RouteItinerarySection[][],
  enDays: RouteItinerarySection[][]
): RouteItinerarySection[][] {
  const maxDays = Math.max(zhDays.length, enDays.length);
  return Array.from({ length: maxDays }, (_, dayIndex) => {
    const zhDay = zhDays[dayIndex] ?? [];
    const enDay = enDays[dayIndex] ?? [];
    const maxSections = Math.max(zhDay.length, enDay.length);

    return Array.from({ length: maxSections }, (_, sectionIndex) => {
      const zhSection = zhDay[sectionIndex];
      const enSection = enDay[sectionIndex];
      return {
        title: {
          zh: zhSection?.title.zh || enSection?.title.zh || "",
          en:
            enSection?.title.en ||
            zhSection?.title.en ||
            zhSection?.title.zh ||
            "",
        },
        description: {
          zh:
            zhSection?.description.zh ||
            enSection?.description.zh ||
            "",
          en:
            enSection?.description.en ||
            zhSection?.description.en ||
            zhSection?.description.zh ||
            "",
        },
        images:
          zhSection?.images?.length
            ? zhSection.images
            : enSection?.images?.length
              ? enSection.images
              : [],
      };
    }).filter(
      (section) =>
        section.title.zh ||
        section.title.en ||
        section.description.zh ||
        section.description.en ||
        section.images.length > 0
    );
  });
}

export async function getRoutesPage(
  locale: LocaleKey = "zh",
  limit = 10,
  page = 1
): Promise<RouteListResult> {
  try {
    const url = new URL(`${PAYLOAD_API}/api/routes`);
    url.searchParams.set("depth", "4");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("page", String(page));
    url.searchParams.set("locale", locale);
    url.searchParams.set("fallbackLocale", "zh");

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      return {
        docs: [],
        page,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        totalDocs: 0,
      };
    }
    const data = await res.json();
    return {
      docs: (data?.docs ?? []).map((pr: PrRoute) => mapPayloadRouteToRoute(pr)),
      page: Number(data?.page ?? page),
      totalPages: Number(data?.totalPages ?? 1),
      hasNextPage: Boolean(data?.hasNextPage),
      hasPrevPage: Boolean(data?.hasPrevPage),
      totalDocs: Number(data?.totalDocs ?? 0),
    };
  } catch {
    return {
      docs: [],
      page,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      totalDocs: 0,
    };
  }
}

export async function getRoutes(locale: LocaleKey = "zh"): Promise<Route[]> {
  const result = await getRoutesPage(locale, 100, 1);
  return result.docs;
}

export async function getRouteBySlug(
  slug: string,
  locale: LocaleKey = "zh"
): Promise<Route | null> {
  try {
    const [resZh, resEn] = await Promise.all([
      fetch(
        `${PAYLOAD_API}/api/routes?where[slug][equals]=${encodeURIComponent(slug)}&depth=4&limit=1&locale=zh&fallbackLocale=zh`,
        { cache: "no-store", headers: { "Content-Type": "application/json" } }
      ),
      fetch(
        `${PAYLOAD_API}/api/routes?where[slug][equals]=${encodeURIComponent(slug)}&depth=4&limit=1&locale=en&fallbackLocale=zh`,
        { cache: "no-store", headers: { "Content-Type": "application/json" } }
      ),
    ]);

    if (!resZh.ok) throw new Error(`API ${resZh.status}`);
    const dataZh = await resZh.json();
    const dataEn = await resEn.json();
    const pr = dataZh?.docs?.[0] as PrRoute | undefined;
    if (!pr) return null;

    const dayItineraryZh = (pr.dayItinerary ?? []) as DayItineraryItem[];
    const daySectionsZh = dayItineraryZh.map((day) => mapDaySections(day));
    const docEn = dataEn?.docs?.[0] as PrRoute | undefined;
    const dayItineraryEn = (docEn?.dayItinerary ?? []) as DayItineraryItem[];
    const daySectionsEn = dayItineraryEn.map((day) => mapDaySections(day));
    const merged = mergeDaySections(daySectionsZh, daySectionsEn);

    const imageAsset = pr.heroImage ? getMediaAsset(pr.heroImage) : EMPTY_MEDIA_ASSET;
    const daysSafe = Math.max(1, pr.daysCount ?? 0);
    const basePricePerPersonPerDay = (pr.price_2_people ?? 0) / daysSafe;

    const prZh = pr as PrRoute;
    const prEnDoc = docEn as PrRoute | undefined;
    const nameZh = prZh.name ?? "";
    const nameEn =
      prEnDoc?.nameEn?.trim() ||
      prZh.nameEn?.trim() ||
      englishNameFromSlug(prZh.slug) ||
      nameZh;
    const whatsIncludedZh = (prZh.whatsIncluded ?? []).map((w) => w.itemZh || w.item || "").filter(Boolean);
    const whatsIncludedEn = (prEnDoc?.whatsIncluded ?? []).map((w) => w.itemEn || w.itemZh || w.item || "").filter(Boolean);

    return {
      id: pr.slug || String(pr.id),
      name: { zh: nameZh, en: nameEn },
      days: {
        zh: formatDays(pr.daysCount ?? 0, "zh"),
        en: formatDays(pr.daysCount ?? 0, "en"),
      },
      daysCount: pr.daysCount ?? 0,
      overview: {
        zh: pr.overviewZh ?? "",
        en: pr.overviewEn ?? "",
      },
      pricePerGroup: {
        2: pr.price_2_people ?? 0,
        3: pr.price_3_people ?? 0,
        4: pr.price_4_people ?? 0,
        5: pr.price_5_people ?? 0,
        6: pr.price_6_people ?? 0,
      },
      basePricePerPersonPerDay,
      image: imageAsset,
      daySections: merged,
      whatsIncluded: {
        zh: whatsIncludedZh.length > 0 ? whatsIncludedZh : whatsIncludedEn,
        en: whatsIncludedEn.length > 0 ? whatsIncludedEn : whatsIncludedZh,
      },
      travelTips: {
        zh: prZh.travelTipsZh ?? prZh.travelTips ?? "",
        en: prEnDoc?.travelTipsEn ?? prEnDoc?.travelTips ?? prZh.travelTipsEn ?? prZh.travelTipsZh ?? prZh.travelTips ?? "",
      },
    };
  } catch {
    return null;
  }
}
