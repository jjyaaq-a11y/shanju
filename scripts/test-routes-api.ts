import assert from "node:assert/strict";

type LoginResult = {
  token?: string;
};

function makeLexical(text: string) {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: "",
              mode: "normal",
              style: "",
              text,
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

async function tryCreateRoute(baseUrl: string, token: string, cookie: string, payload: Record<string, unknown>) {
  const authHeaders: Array<Record<string, string>> = [
    { Authorization: `JWT ${token}` },
    { Authorization: `Bearer ${token}` },
    cookie ? { Cookie: cookie } : {},
  ];
  const failures: string[] = [];

  for (const extraHeaders of authHeaders) {
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    for (const [key, value] of Object.entries(extraHeaders)) {
      headers.set(key, value);
    }

    const response = await fetch(`${baseUrl}/api/routes`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return response;
    }

    failures.push(`${response.status} ${response.statusText} via ${JSON.stringify(extraHeaders)} -> ${await response.text()}`);
  }

  throw new Error(`Failed to create route with token or cookie auth\n${failures.join("\n")}`);
}

async function main() {
  const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
  const email = process.env.TEST_ADMIN_EMAIL || "routes-api-test@example.com";
  const password = process.env.TEST_ADMIN_PASSWORD || "TestPassword123!";
  const slug = `chengdu-yading-9d-${Date.now()}`;

  const loginRes = await fetch(`${baseUrl}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  assert.equal(loginRes.ok, true, `login failed: ${loginRes.status}`);
  const loginJson = (await loginRes.json()) as LoginResult;
  assert.ok(loginJson.token, "login token missing");

  const setCookie = loginRes.headers.get("set-cookie") || "";
  const cookie = setCookie.split(",").map((part) => part.split(";")[0]).join("; ");

  const createPayload = {
    name: "成都 + 稻城亚丁 9日游",
    nameEn: "Chengdu and Daocheng Yading 9-Day Tour",
    slug,
    daysCount: 9,
    overviewZh: "成都城市体验结合川西高原与稻城亚丁景区，适合第一次来四川做深度旅行的客人。",
    overviewEn: "A nine-day journey combining Chengdu highlights, western Sichuan highlands, and Daocheng Yading for first-time visitors seeking a deeper Sichuan itinerary.",
    price_2_people: 2680,
    price_3_people: 2480,
    price_4_people: 2280,
    price_5_people: 2180,
    price_6_people: 2180,
    travelTipsZh: "高海拔路段较多，建议前两天充分休息并控制节奏。",
    travelTipsEn: "This route involves several high-altitude sections. Rest well in the first two days and keep a steady pace.",
    whatsIncluded: [
      { itemZh: "接送机服务", itemEn: "Airport transfers" },
      { itemZh: "全程专车", itemEn: "Private vehicle throughout" },
    ],
    dayItinerary: [
      { descriptionZh: makeLexical("落地成都，接机后入住酒店，自由活动。"), descriptionEn: makeLexical("Arrive in Chengdu, airport pickup, hotel check-in, free time.") },
      { descriptionZh: makeLexical("酒店出发，游览成都大熊猫繁育基地与三星堆博物馆。"), descriptionEn: makeLexical("Visit Chengdu Panda Base and Sanxingdui Museum from the hotel.") },
      { descriptionZh: makeLexical("成都前往康定，经折多山前往鱼子西观景，入住新都桥。"), descriptionEn: makeLexical("Drive from Chengdu to Kangding, cross Zheduo Pass, sunset at Yuzixi, overnight in Xinduqiao.") },
      { descriptionZh: makeLexical("新都桥经雅江、理塘勒通古镇与海子山到香格里拉镇。"), descriptionEn: makeLexical("From Xinduqiao via Yajiang, Litang Letong town and Haizi Mountain to Shangri-La Town.") },
      { descriptionZh: makeLexical("稻城亚丁景区一日游，返回香格里拉镇。"), descriptionEn: makeLexical("Full-day Daocheng Yading visit, return to Shangri-La Town.") },
      { descriptionZh: makeLexical("香格里拉镇经稻城白塔、雅江返回新都桥。"), descriptionEn: makeLexical("Return from Shangri-La Town via Daocheng White Pagoda and Yajiang to Xinduqiao.") },
      { descriptionZh: makeLexical("新都桥前往塔公草原、墨石公园、雅拉雪山观景台，入住丹巴。"), descriptionEn: makeLexical("Visit Tagong Grassland, Moshi Park and Yala Snow Mountain Viewpoint, overnight in Danba.") },
      { descriptionZh: makeLexical("丹巴出发，游览四姑娘山双桥沟，返回成都。"), descriptionEn: makeLexical("From Danba to Mount Siguniang Shuangqiaogou, then back to Chengdu.") },
      { descriptionZh: makeLexical("自由活动，按航班时间送机。"), descriptionEn: makeLexical("Free time before airport transfer based on flight schedule.") },
    ],
  };

  const createRes = await tryCreateRoute(baseUrl, loginJson.token, cookie, createPayload);
  const created = await createRes.json() as { doc?: Record<string, unknown> } & Record<string, unknown>;
  const createdId = created?.doc?.id || created?.id;
  assert.ok(createdId, "created route id missing");

  const getRes = await fetch(`${baseUrl}/api/routes?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`);
  assert.equal(getRes.ok, true, `route fetch failed: ${getRes.status}`);
  const getJson = await getRes.json() as { docs?: Array<Record<string, any>> };
  const doc = getJson.docs?.[0];
  assert.ok(doc, "created route not found by slug");
  assert.equal(doc.slug, slug);
  assert.equal(doc.name, "成都 + 稻城亚丁 9日游");
  assert.equal(doc.daysCount, 9);

  console.log(`PASS: login + token + route create works for ${slug}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
