import assert from "node:assert/strict";
import { mapPayloadRouteToRoute } from "../src/lib/routes";

const mapped = mapPayloadRouteToRoute({
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
      images: [
        { image: { url: "/api/media/file/day-1-a.jpg" } },
        { image: { url: "/api/media/file/day-1-b.jpg", rotation: "270" } },
      ],
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
    {
      descriptionZh: { root: { children: [{ children: [{ text: "旧版中文描述" }] }] } },
      descriptionEn: { root: { children: [{ children: [{ text: "Legacy English description" }] }] } },
      images: [{ image: { url: "/api/media/file/day-2-a.jpg" } }],
    },
  ],
} as any);

assert.equal(mapped.dayTextBlocks.length, 2);
assert.equal(mapped.dayTextBlocks[0]?.length, 2);
assert.equal(mapped.dayTextBlocks[0]?.[0]?.zh, "第一段中文");
assert.equal(mapped.dayTextBlocks[0]?.[1]?.en, "Second English paragraph");
assert.equal(mapped.dayTextBlocks[1]?.[0]?.zh, "旧版中文描述");
assert.equal(mapped.dayImages[0]?.length, 2);
assert.equal(mapped.dayImages[0]?.[1]?.rotation, 270);

console.log("PASS: route itinerary mapping supports multi-block text and up to five images");
