/**
 * 精选路线 & 手记配图
 * - 稻城亚丁：雪山/高原（避免有鱼等无关图）
 * - 九寨黄龙：使用稳定可用的碧水/秋色类图
 */
const UNSPLASH = "https://images.unsplash.com";

export const routeImages = [
  `${UNSPLASH}/photo-1464822759023-fed622ff2c3b?w=800&q=80`, // 稻城亚丁 - 雪山
  `${UNSPLASH}/photo-1506905925346-21bda4d32df4?w=800&q=80`, // 色达 - 高原山景
  `${UNSPLASH}/photo-1519681393784-d120267933ba?w=800&q=80`, // 四姑娘山 - 雪山
  `${UNSPLASH}/photo-1470071459604-3b5ec3a7fe05?w=800&q=80`, // 九寨黄龙 - 山水/自然
] as const;

export const heroImage = `${UNSPLASH}/photo-1464822759023-fed622ff2c3b?w=1920&q=80`;

/** 手记卡片图片（与路线 1、2、3 对应） */
export const journalImages = [
  `${UNSPLASH}/photo-1464822759023-fed622ff2c3b?w=600&q=80`,
  `${UNSPLASH}/photo-1506905925346-21bda4d32df4?w=600&q=80`,
  `${UNSPLASH}/photo-1519681393784-d120267933ba?w=600&q=80`,
] as const;

/** 每日行程配图（路线 slug -> 第 N 天图片） */
export const dayImages = {
  daochengYading: [
    `${UNSPLASH}/photo-1464822759023-fed622ff2c3b?w=800&q=80`, // Day1 雪山公路
    `${UNSPLASH}/photo-1506905925346-21bda4d32df4?w=800&q=80`, // Day2 高原山景
    `${UNSPLASH}/photo-1519681393784-d120267933ba?w=800&q=80`, // Day3 雪山海子
    `${UNSPLASH}/photo-1470071459604-3b5ec3a7fe05?w=800&q=80`, // Day4 秋色层林
    `${UNSPLASH}/photo-1441974231531-c6227db76b6e?w=800&q=80`, // Day5 返程草原
  ] as const,
  chengduZoo: [
    `${UNSPLASH}/photo-1543589077-47d21006e91c?w=800&q=80`, // Day1 大熊猫
    `${UNSPLASH}/photo-1508804185872-d7badad00f7d?w=800&q=80`, // Day2 都江堰水流
    `${UNSPLASH}/photo-1548013146-7247f4d01c82?w=800&q=80`, // Day3 博物馆/文化
  ] as const,
  fallback: [
    `${UNSPLASH}/photo-1464822759023-fed622ff2c3b?w=800&q=80`,
  ] as const,
};
