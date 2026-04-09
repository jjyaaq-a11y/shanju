/**
 * 数据库初始化种子接口（仅在开发/部署初期使用一次）
 * POST /api/seed?secret=SEED_SECRET
 */

import { getPayload } from "payload";
import config from "@payload-config";
import { NextRequest, NextResponse } from "next/server";

const SEED_SECRET = process.env.SEED_SECRET || "seed-deepchinatrip-2024";

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80",
  journal1: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  journal2: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  journal3: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
};

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`图片下载失败: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function createMediaRecord(
  payload: Awaited<ReturnType<typeof getPayload>>,
  url: string,
  filename: string,
  alt: string
) {
  const buffer = await downloadImage(url);
  return payload.create({
    collection: "media",
    data: { alt },
    file: {
      data: buffer,
      mimetype: "image/jpeg",
      name: filename,
      size: buffer.length,
    },
  });
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 避免因 payload-types 未及时刷新导致初始化接口在构建期报类型错误
    const payload: any = await getPayload({ config });

    // ── 1. 创建 Media 记录 ──────────────────────────────────────
    const [heroMedia, j1Media, j2Media, j3Media] = await Promise.all([
      createMediaRecord(payload, IMAGES.hero, "hero-bg.jpg", "川西雪山 Hero 背景图"),
      createMediaRecord(payload, IMAGES.journal1, "journal-1.jpg", "稻城亚丁秋色"),
      createMediaRecord(payload, IMAGES.journal2, "journal-2.jpg", "色达佛学院"),
      createMediaRecord(payload, IMAGES.journal3, "journal-3.jpg", "四姑娘山"),
    ]);

    // ── 2. 初始化 SiteSettings（中文）───────────────────────────
    await payload.updateGlobal({
      slug: "site-settings",
      data: {
        hero: {
          heroImage: heroMedia.id,
          titleZh: "DeepChinaTrip",
          titleEn: "DeepChinaTrip",
          taglineZh: "深入川西藏区腹地",
          taglineEn: "Deep into Western China's Tibetan Heartland",
          regionSubZh: "发现四川秘境高原",
          regionSubEn: "Authentic Journeys to Sichuan's Hidden Highlands",
          subtitleZh: "2–5人精品小团 · 川西自然风光 · 藏文化沉浸 · 成都周边高端入境游",
          subtitleEn: "2–5 Guest Private Tours · Tibetan Culture · Plateau Landscapes · Premium Chengdu-Area Inbound",
          ctaRoutesZh: "精选路线",
          ctaRoutesEn: "Routes",
          ctaContactZh: "联系咨询",
          ctaContactEn: "Contact",
          altImageZh: "川西雪山",
          altImageEn: "Western Sichuan snow mountains",
        },
        why: {
          sectionTitleZh: "为什么选择我们",
          sectionTitleEn: "Why DeepChinaTrip",
          sectionDescZh: "从人数到住宿，从向导到安全，每一个细节都服务「高原深度探索」与「真实藏文化沉浸」",
          sectionDescEn: "From group size to accommodation, from guides to safety—every detail serves highland discovery and authentic Tibetan immersion.",
          items: [
            { titleZh: "小团限额", titleEn: "Small Groups", descZh: "每团 2–5 人，确保每人都有足够空间与关照，行程更私密、更自在。", descEn: "2–5 guests per trip for space and care—more privacy, more ease." },
            { titleZh: "当地向导", titleEn: "Local Guides", descZh: "深耕西川多年的本地领队，熟悉路况与秘境，带你避开人潮、看见真风景。", descEn: "Veteran Western Sichuan leaders who know the roads and hidden spots—real scenery, fewer crowds." },
            { titleZh: "精选住宿", titleEn: "Curated Stays", descZh: "雪山观景民宿、藏式精品酒店，在舒适与在地文化之间取得平衡。", descEn: "Mountain-view lodges and Tibetan-style boutique hotels—comfort and local culture in balance." },
            { titleZh: "安全保障", titleEn: "Safety First", descZh: "高海拔预案、车辆与保险齐备，让您安心享受每一程。", descEn: "Altitude plans, vehicles and insurance in place—so you can enjoy every mile with peace of mind." },
          ],
          paymentTitleZh: "支付无忧",
          paymentTitleEn: "Worry-free Payment",
          paymentDescZh: "中国境内以支付宝、微信支付为主，境外旅客首次注册较麻烦。我们提供全程代支付服务，您只需安心出行，费用结算由我们代为完成。",
          paymentDescEn: "In China, Alipay and WeChat Pay dominate—and signing up from abroad can be a hassle. We offer full-trip payment proxy: you travel with peace of mind; we handle the local payments for you.",
          translationTitleZh: "专业翻译",
          translationTitleEn: "Fluent English & Local Insight",
          translationDescZh: "流利的英语沟通，为您介绍当地历史人文与风土人情，让旅程轻松愉快、毫无语言障碍。",
          translationDescEn: "Our guides speak fluent English and bring the region's history, culture, and customs to life—so you can relax and enjoy the journey without the language barrier.",
        },
        journal: {
          sectionTitleZh: "最新手记",
          sectionTitleEn: "Latest Journal",
          sectionDescZh: "领队与客人的真实见闻——秘境、藏区、高原风光，故事驱动的深度探索",
          sectionDescEn: "Stories from our guides and guests—hidden gems, Tibetan culture, plateau landscapes. Story-driven, immersive.",
        },
        about: {
          titleZh: "关于我们",
          titleEn: "About Us",
          bodyZh: "DeepChinaTrip 聚焦川西自然风光、藏文化与成都周边高端入境游。我们相信，真正的旅行是深入藏区腹地、探访秘境高原——小团、专车、当地向导、精选住宿，不赶路、不扎堆。稻城亚丁、色达、四姑娘山、九寨黄龙——我们带您发现隐藏珍宝，体验真实的藏地人文与高原风光。",
          bodyEn: "DeepChinaTrip focuses on Western Sichuan's natural scenery, Tibetan culture, and premium Chengdu-area inbound travel. We believe real travel is diving deep into the Tibetan heartland—hidden gems, plateau landscapes, authentic immersion. Small groups, dedicated vehicles, local guides, curated stays. No rushing, no crowds. Daocheng Yading, Sertar, Siguniangshan, Jiuzhaigou & Huanglong—we take you beyond the surface to discover the real highlands.",
        },
        footer: {
          descZh: "DeepChinaTrip · 川西秘境高原 · 藏文化沉浸 · 2–5 人精品私团 · 成都周边高端入境游。",
          descEn: "DeepChinaTrip · Sichuan's hidden highlands · Tibetan immersion · 2–5 guest private tours · Premium Chengdu-area inbound.",
          copyrightZh: "保留所有权利.",
          copyrightEn: "All rights reserved.",
          email: "hello@deepchinatrip.com",
          instagram: "@deepchinatrip",
          facebook: "deepchinatrip",
          whatsapp: "+86 138 0000 0000",
          telegram: "@deepchinatrip",
          wechat: "deepchinatrip",
        },
      },
    });

    // ── 4. 创建手记文章 ─────────────────────────────────────────
    const journalData = [
      {
        zh: { title: "稻城亚丁的秋，是上帝打翻的调色盘", excerpt: "十月的亚丁，层林尽染。从冲古寺到洛绒牛场，我们避开人潮，在雪山与海子之间慢慢走。", tag: "路线手记", date: "2024.10" },
        en: { title: "Autumn in Daocheng Yading: Nature's Palette", excerpt: "In October, Yading turns gold. From Chonggu Temple to Luorong Pasture, we walked slowly between peaks and lakes, away from the crowds.", tag: "Route notes", date: "Oct 2024" },
        mediaId: j1Media.id, sortOrder: 1,
      },
      {
        zh: { title: "色达：在海拔 4000 米，与红房子对视", excerpt: "五明佛学院的清晨，炊烟与诵经声一起升起。我们不再赶路，而是留足时间，与这片土地对话。", tag: "人文", date: "2024.09" },
        en: { title: "Sertar at 4,000m: Facing the Red Houses", excerpt: "At Larung Gar at dawn, smoke and chanting rise together. We didn't rush—we gave time to the land.", tag: "Culture", date: "Sep 2024" },
        mediaId: j2Media.id, sortOrder: 2,
      },
      {
        zh: { title: "四姑娘山脚下，一场只属于 6 人的小型婚礼", excerpt: "客人选择在 DeepChinaTrip 私团中完成仪式。雪山为证，我们负责把这一程变成独一无二的回忆。", tag: "故事", date: "2024.08" },
        en: { title: "A Wedding for Six at the Foot of Siguniangshan", excerpt: "Our guests chose to hold their ceremony on a DeepChinaTrip private tour. The mountains witnessed; we made the journey unforgettable.", tag: "Story", date: "Aug 2024" },
        mediaId: j3Media.id, sortOrder: 3,
      },
    ];

    for (const entry of journalData) {
      const doc = await payload.create({
        collection: "journals",
        locale: "zh",
        data: {
          title: entry.zh.title,
          excerpt: entry.zh.excerpt,
          tag: entry.zh.tag,
          date: entry.zh.date,
          image: entry.mediaId,
          published: true,
          sortOrder: entry.sortOrder,
        },
      });
      await payload.update({
        collection: "journals",
        id: doc.id,
        locale: "en",
        data: {
          title: entry.en.title,
          excerpt: entry.en.excerpt,
          tag: entry.en.tag,
          date: entry.en.date,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "数据库初始化完成",
      created: {
        media: 4,
        journals: 3,
        siteSettings: "zh + en",
      },
    });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
