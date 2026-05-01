import assert from "node:assert/strict";
import { mapPayloadRouteToRoute } from "../src/lib/routes";

const withSections = mapPayloadRouteToRoute({
  id: 1,
  name: "测试路线",
  slug: "test-route",
  daysCount: 2,
  price_2_people: 1200,
  price_3_people: 1100,
  price_4_people: 1000,
  price_5_people: 900,
  price_6_people: 850,
  heroImage: { url: "/api/media/file/route-cover.jpg" },
  whatsIncluded: [{ itemZh: "酒店", itemEn: "Hotels" }],
  travelTipsZh: "注意保暖",
  travelTipsEn: "Keep warm",
  dayItinerary: [
    {
      sections: [
        {
          titleZh: "早上",
          titleEn: "Morning",
          descriptionZh: { root: { children: [{ children: [{ text: "从酒店出发，礼宾车接客。" }] }] } },
          descriptionEn: { root: { children: [{ children: [{ text: "Leave the hotel and board the concierge car." }] }] } },
          images: [
            { image: { url: "/api/media/file/morning-hotel.jpg" } },
            { image: { url: "/api/media/file/morning-car.jpg", rotation: "270" } },
          ],
        },
        {
          titleZh: "下午",
          titleEn: "Afternoon",
          descriptionZh: { root: { children: [{ children: [{ text: "采耳、博物馆、喝茶。" }] }] } },
          descriptionEn: { root: { children: [{ children: [{ text: "Ear cleaning, museum, and tea." }] }] } },
          images: [{ image: { url: "/api/media/file/afternoon-museum.jpg" } }],
        },
      ],
    },
  ],
} as any);

assert.equal(withSections.daySections.length, 1);
assert.equal(withSections.daySections[0]?.length, 2);
assert.equal(withSections.daySections[0]?.[0]?.title.zh, "早上");
assert.equal(withSections.daySections[0]?.[1]?.title.en, "Afternoon");
assert.equal(withSections.daySections[0]?.[0]?.description.zh, "从酒店出发，礼宾车接客。");
assert.equal(withSections.daySections[0]?.[0]?.images.length, 2);
assert.equal(withSections.daySections[0]?.[0]?.images[1]?.rotation, 270);

const legacyFallback = mapPayloadRouteToRoute({
  id: 2,
  name: "旧路线",
  slug: "legacy-route",
  daysCount: 1,
  price_2_people: 800,
  price_3_people: 750,
  price_4_people: 700,
  price_5_people: 650,
  price_6_people: 600,
  dayItinerary: [
    {
      images: [{ image: { url: "/api/media/file/day-1-a.jpg" } }],
      textBlocks: [
        {
          descriptionZh: { root: { children: [{ children: [{ text: "第一段中文" }] }] } },
          descriptionEn: { root: { children: [{ children: [{ text: "First English paragraph" }] }] } },
        },
        {
          descriptionZh: { root: { children: [{ children: [{ text: "第二段中文" }] }] } },
          descriptionEn: { root: { children: [{ children: [{ text: "Second English paragraph" }] }] } },
        },
      ],
    },
  ],
} as any);

assert.equal(legacyFallback.daySections.length, 1);
assert.equal(legacyFallback.daySections[0]?.length, 1);
assert.equal(legacyFallback.daySections[0]?.[0]?.description.zh, "第一段中文\n\n第二段中文");
assert.equal(legacyFallback.daySections[0]?.[0]?.images.length, 1);

console.log("PASS: route itinerary mapping supports nested sections and legacy fallback");
