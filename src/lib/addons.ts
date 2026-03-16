import type { Addon as PayloadAddon } from "payload-types";

const PAYLOAD_API =
  process.env.NEXT_PUBLIC_PAYLOAD_URL || process.env.PAYLOAD_URL || "http://localhost:3000";
const REVALIDATE = 3600;

export type AddonItem = {
  key: string;
  labelKey: string;
  pricePerDay: number;
  descriptionKey: string;
  previewImage: string;
  minPeople?: number;
};

export type AddonsConfig = Record<string, AddonItem[]>;

/** Static fallback when API fails */
export const addonsConfigFallback: AddonsConfig = {
  hotel: [
    { key: "hotel.basic", labelKey: "hotel.basic", pricePerDay: 0, descriptionKey: "hotel.basic", previewImage: "" },
    { key: "hotel.premium", labelKey: "hotel.premium", pricePerDay: 50, descriptionKey: "hotel.premium", previewImage: "" },
    { key: "hotel.luxury", labelKey: "hotel.luxury", pricePerDay: 100, descriptionKey: "hotel.luxury", previewImage: "" },
  ],
  vehicle: [
    { key: "vehicle.standardBusinessVan", labelKey: "vehicle.standardBusinessVan", pricePerDay: 0, descriptionKey: "vehicle.standardBusinessVan", previewImage: "", minPeople: 3 },
    { key: "vehicle.luxuryBusinessVan", labelKey: "vehicle.luxuryBusinessVan", pricePerDay: 80, descriptionKey: "vehicle.luxuryBusinessVan", previewImage: "", minPeople: 3 },
    { key: "vehicle.standardSuv", labelKey: "vehicle.standardSuv", pricePerDay: 0, descriptionKey: "vehicle.standardSuv", previewImage: "" },
    { key: "vehicle.luxurySuv", labelKey: "vehicle.luxurySuv", pricePerDay: 80, descriptionKey: "vehicle.luxurySuv", previewImage: "" },
  ],
  photography: [
    { key: "photography.basic", labelKey: "photography.basic", pricePerDay: 0, descriptionKey: "photography.basic", previewImage: "" },
    { key: "photography.pro", labelKey: "photography.pro", pricePerDay: 50, descriptionKey: "photography.pro", previewImage: "" },
  ],
  guide: [
    { key: "guide.basic", labelKey: "guide.basic", pricePerDay: 0, descriptionKey: "guide.basic", previewImage: "" },
    { key: "guide.expert", labelKey: "guide.expert", pricePerDay: 100, descriptionKey: "guide.expert", previewImage: "" },
    { key: "guide.elite", labelKey: "guide.elite", pricePerDay: 200, descriptionKey: "guide.elite", previewImage: "" },
  ],
};

export const addonsConfig = addonsConfigFallback;

/** Fetch addons from Payload API and map to AddonsConfig */
export async function getAddons(): Promise<AddonsConfig> {
  try {
    const url = new URL(`${PAYLOAD_API}/api/addons`);
    url.searchParams.set("depth", "0");
    url.searchParams.set("limit", "100");

    const res = await fetch(url.toString(), {
      next: { revalidate: REVALIDATE },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const docs: PayloadAddon[] = data?.docs ?? [];

    const byCategory: Record<string, AddonItem[]> = {
      hotel: [],
      vehicle: [],
      photography: [],
      guide: [],
    };

    for (const a of docs) {
      const cat = a.category ?? "hotel";
      if (!byCategory[cat]) byCategory[cat] = [];
      const key = `${cat}.${a.labelKey}`;
      byCategory[cat].push({
        key,
        labelKey: key,
        pricePerDay: a.pricePerDay ?? 0,
        descriptionKey: a.descriptionKey ?? key,
        previewImage: "",
      });
    }

    const hasAny = Object.values(byCategory).some((items) => items.length > 0);
    if (!hasAny) return addonsConfigFallback;

    // Keep front-end assumptions stable: always have all categories.
    (["hotel", "vehicle", "photography", "guide"] as const).forEach((cat) => {
      if (!byCategory[cat] || byCategory[cat].length === 0) {
        byCategory[cat] = addonsConfigFallback[cat];
      }
    });

    return byCategory;
  } catch {
    return addonsConfigFallback;
  }
}

/** 根据 key 如 'hotel.basic' 从 t.addons 取出 { label, desc } */
export function getAddonLocale(
  addons: Record<string, Record<string, { label: string; desc: string }>>,
  key: string
): { label: string; desc: string } {
  const [cat, sub] = key.split(".");
  const node = addons[cat]?.[sub];
  return node ?? { label: key, desc: "" };
}
