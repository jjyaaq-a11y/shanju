import type { Route as PayloadRoute, Media } from "payload-types";

const PAYLOAD_API =
  process.env.NEXT_PUBLIC_PAYLOAD_URL || process.env.PAYLOAD_URL || "http://localhost:3000";
const REVALIDATE = 3600;

export type LocaleKey = "zh" | "en";

/** Extract plain text from Lexical JSON */
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

export type Route = {
  id: string;
  name: { zh: string; en: string };
  days: { zh: string; en: string };
  daysCount: number;
  overview: { zh: string; en: string };
  pricePerGroup: Record<2 | 3 | 4 | 5 | 6, number>;
  /** 每人每天基础价（由 pricePerGroup 推导，用于定制页预算计算） */
  basePricePerPersonPerDay: number;
  image: string;
  dayDescriptions: { zh: string; en: string }[];
  /** 每天多张图片：dayImages[dayIndex] = [url1, url2] */
  dayImages: string[][];
};

function formatDays(daysCount: number, locale: LocaleKey): string {
  const nights = Math.max(0, daysCount - 1);
  return locale === "zh"
    ? `${daysCount}天${nights}晚`
    : `${daysCount}D ${nights}N`;
}

function getMediaUrl(media: unknown): string {
  if (media == null) return "";
  const m = typeof media === "object" ? (media as Media) : null;
  if (!m) return "";
  const mediaObj = m as Media & { sizes?: { card?: { url?: string }; tablet?: { url?: string } } };
  const rawUrl = mediaObj.url || mediaObj.sizes?.card?.url || mediaObj.sizes?.tablet?.url;
  if (!rawUrl) return "";
  if (rawUrl.startsWith("http")) return rawUrl;
  const base = PAYLOAD_API.replace(/\/$/, "");
  return `${base}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
}

type DayItineraryItem = {
  description?: unknown;
  images?: Array<{ image?: unknown }>;
};

type PrRoute = PayloadRoute & {
  overviewZh?: string;
  overviewEn?: string;
  heroImage?: number | Media | null;
  price_2_people?: number;
  price_3_people?: number;
  price_4_people?: number;
  price_5_people?: number;
  price_6_people?: number;
  dayItinerary?: DayItineraryItem[];
};

function mapPayloadRouteToRoute(pr: PrRoute): Route {
  const name = pr.name || "";
  const daysCount = pr.daysCount ?? 0;
  const dayItinerary = pr.dayItinerary ?? [];

  const dayDescriptions: { zh: string; en: string }[] = dayItinerary.map((day: DayItineraryItem) => {
    const desc = day.description;
    let text = "";
    if (desc && typeof desc === "object" && "root" in (desc as object)) {
      text = lexicalToText((desc as { root?: unknown }).root);
    }
    return { zh: text, en: text };
  });

  const dayImagesList: string[][] = dayItinerary.map((day: DayItineraryItem) => {
    return (day.images ?? [])
      .map((item) => getMediaUrl(item.image))
      .filter((url): url is string => Boolean(url));
  });

  const imageUrl = getMediaUrl(pr.heroImage) || "";

  const pricePerGroup: Record<2 | 3 | 4 | 5 | 6, number> = {
    2: pr.price_2_people ?? 0,
    3: pr.price_3_people ?? 0,
    4: pr.price_4_people ?? 0,
    5: pr.price_5_people ?? 0,
    6: pr.price_6_people ?? 0,
  };
  const daysSafe = Math.max(1, daysCount);
  const basePricePerPersonPerDay = (pr.price_2_people ?? 0) / daysSafe;

  return {
    id: pr.slug || String(pr.id),
    name: { zh: name, en: name },
    days: { zh: formatDays(daysCount, "zh"), en: formatDays(daysCount, "en") },
    daysCount,
    overview: {
      zh: pr.overviewZh ?? "",
      en: pr.overviewEn ?? "",
    },
    pricePerGroup,
    basePricePerPersonPerDay,
    image: imageUrl,
    dayDescriptions,
    dayImages: dayImagesList,
  };
}

/** Merge zh and en API responses to get full dayDescriptions */
function mergeDayDescriptions(
  zhDescs: { zh: string; en: string }[],
  enDescs: { zh: string; en: string }[]
): { zh: string; en: string }[] {
  return zhDescs.map((z, i) => ({
    zh: z.zh || (enDescs[i]?.zh ?? ""),
    en: (enDescs[i]?.en ?? "") || z.en,
  }));
}

export async function getRoutes(locale: LocaleKey = "zh"): Promise<Route[]> {
  try {
    const url = new URL(`${PAYLOAD_API}/api/routes`);
    url.searchParams.set("depth", "3");
    url.searchParams.set("limit", "100");
    url.searchParams.set("locale", locale);
    url.searchParams.set("fallbackLocale", "zh");

    const res = await fetch(url.toString(), {
      next: { revalidate: REVALIDATE },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const docs = data?.docs ?? [];

    return docs.map((pr: PrRoute) => mapPayloadRouteToRoute(pr));
  } catch {
    return [];
  }
}

export async function getRouteBySlug(
  slug: string,
  locale: LocaleKey = "zh"
): Promise<Route | null> {
  try {
    const [resZh, resEn] = await Promise.all([
      fetch(
        `${PAYLOAD_API}/api/routes?where[slug][equals]=${encodeURIComponent(slug)}&depth=3&limit=1&locale=zh&fallbackLocale=zh`,
        { next: { revalidate: REVALIDATE }, headers: { "Content-Type": "application/json" } }
      ),
      fetch(
        `${PAYLOAD_API}/api/routes?where[slug][equals]=${encodeURIComponent(slug)}&depth=3&limit=1&locale=en&fallbackLocale=zh`,
        { next: { revalidate: REVALIDATE }, headers: { "Content-Type": "application/json" } }
      ),
    ]);

    if (!resZh.ok) throw new Error(`API ${resZh.status}`);
    const dataZh = await resZh.json();
    const dataEn = await resEn.json();
    const pr = dataZh?.docs?.[0];
    if (!pr) return null;

    const dayItinerary = (pr.dayItinerary ?? []) as DayItineraryItem[];
    const dayDescriptionsZh = dayItinerary.map((day) => {
      const desc = day.description;
      let text = "";
      if (desc && typeof desc === "object" && "root" in (desc as object)) {
        text = lexicalToText((desc as { root?: unknown }).root);
      }
      return { zh: text, en: "" };
    });
    const docEn = dataEn?.docs?.[0];
    const dayItineraryEn = (docEn?.dayItinerary ?? []) as DayItineraryItem[];
    const dayDescriptionsEn = dayItineraryEn.map((day) => {
      const desc = day.description;
      let text = "";
      if (desc && typeof desc === "object" && "root" in (desc as object)) {
        text = lexicalToText((desc as { root?: unknown }).root);
      }
      return { zh: "", en: text };
    });

    const merged = mergeDayDescriptions(dayDescriptionsZh, dayDescriptionsEn);

    const dayImagesList: string[][] = dayItinerary.map((day: DayItineraryItem) => {
      return (day.images ?? [])
        .map((item) => getMediaUrl(item.image))
        .filter((url): url is string => Boolean(url));
    });

    const imageUrl = getMediaUrl(pr.heroImage) || "";
    const daysSafe = Math.max(1, pr.daysCount ?? 0);
    const basePricePerPersonPerDay = (pr.price_2_people ?? 0) / daysSafe;

    return {
      id: pr.slug || String(pr.id),
      name: { zh: pr.name ?? "", en: pr.name ?? "" },
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
      image: imageUrl,
      dayDescriptions: merged,
      dayImages: dayImagesList,
    };
  } catch {
    return null;
  }
}
