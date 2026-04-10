import { EMPTY_MEDIA_ASSET, getMediaAsset, type MediaAsset } from "@/lib/media";

const PAYLOAD_API =
  process.env.PAYLOAD_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

export type Journal = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  image: MediaAsset;
  contentImages: MediaAsset[];
};

export type JournalListResult = {
  docs: Journal[];
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalDocs: number;
};

function mapJournal(doc: Record<string, unknown>): Journal {
  const contentImagesRaw = Array.isArray(doc.contentImages) ? doc.contentImages : [];
  const contentImages = contentImagesRaw
    .map((item) => {
      if (!item || typeof item !== "object") return EMPTY_MEDIA_ASSET;
      return getMediaAsset((item as Record<string, unknown>).image);
    })
    .filter((asset): asset is MediaAsset => Boolean(asset.url));

  return {
    id: String(doc.id),
    slug: (doc.slug as string) || String(doc.id),
    title: (doc.title as string) || "",
    excerpt: (doc.excerpt as string) || "",
    tag: (doc.tag as string) || "",
    date: (doc.date as string) || "",
    image: getMediaAsset(doc.image) || EMPTY_MEDIA_ASSET,
    contentImages,
  };
}

export async function getJournals(
  locale: "zh" | "en" = "zh",
  limit = 3,
  page = 1
): Promise<JournalListResult> {
  try {
    const url = new URL(`${PAYLOAD_API}/api/journals`);
    url.searchParams.set("locale", locale);
    url.searchParams.set("fallbackLocale", "zh");
    url.searchParams.set("depth", "2");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("page", String(page));
    url.searchParams.set("where[published][equals]", "true");
    url.searchParams.set("sort", "sortOrder");

    const res = await fetch(url.toString(), { cache: "no-store" });
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
      docs: (data.docs ?? []).map((doc: Record<string, unknown>) => mapJournal(doc)),
      page: Number(data.page ?? page),
      totalPages: Number(data.totalPages ?? 1),
      hasNextPage: Boolean(data.hasNextPage),
      hasPrevPage: Boolean(data.hasPrevPage),
      totalDocs: Number(data.totalDocs ?? 0),
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

export async function getJournalBySlug(
  slug: string,
  locale: "zh" | "en" = "zh"
): Promise<Journal | null> {
  try {
    const baseUrl = new URL(`${PAYLOAD_API}/api/journals`);
    baseUrl.searchParams.set("locale", locale);
    baseUrl.searchParams.set("fallbackLocale", "zh");
    baseUrl.searchParams.set("depth", "2");
    baseUrl.searchParams.set("limit", "1");
    baseUrl.searchParams.set("where[published][equals]", "true");

    const slugUrl = new URL(baseUrl);
    slugUrl.searchParams.set("where[slug][equals]", slug);
    const resBySlug = await fetch(slugUrl.toString(), { cache: "no-store" });
    if (resBySlug.ok) {
      const dataBySlug = await resBySlug.json();
      const docBySlug = dataBySlug?.docs?.[0];
      if (docBySlug && typeof docBySlug === "object") {
        return mapJournal(docBySlug as Record<string, unknown>);
      }
    }

    // Backward compatibility for old records created before slug field existed.
    const idUrl = new URL(baseUrl);
    idUrl.searchParams.set("where[id][equals]", slug);
    const resById = await fetch(idUrl.toString(), { cache: "no-store" });
    if (!resById.ok) return null;
    const dataById = await resById.json();
    const docById = dataById?.docs?.[0];
    if (!docById || typeof docById !== "object") return null;
    return mapJournal(docById as Record<string, unknown>);
  } catch {
    return null;
  }
}
