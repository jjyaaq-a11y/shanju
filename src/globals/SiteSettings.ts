import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "网站内容设置",
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // ─── Hero 横幅 ───────────────────────────────────────────────
    {
      name: "hero",
      type: "group",
      label: "Hero 横幅",
      fields: [
        {
          name: "heroImage",
          type: "upload",
          relationTo: "media",
          label: "背景图片",
          admin: { description: "建议宽度 1920px 以上的横版图片" },
        },
        { name: "title", type: "text", label: "主标题", localized: true },
        { name: "tagline", type: "text", label: "主标语", localized: true },
        { name: "regionSub", type: "text", label: "地区副文案", localized: true },
        { name: "subtitle", type: "text", label: "描述文字", localized: true },
        { name: "ctaRoutes", type: "text", label: "按钮文字（查看路线）", localized: true },
        { name: "ctaContact", type: "text", label: "按钮文字（联系咨询）", localized: true },
        { name: "altImage", type: "text", label: "图片 Alt 文本（无障碍）", localized: true },
      ],
    },

    // ─── 为什么选择我们 ─────────────────────────────────────────
    {
      name: "why",
      type: "group",
      label: "为什么选择我们",
      fields: [
        { name: "sectionTitle", type: "text", label: "板块标题", localized: true },
        { name: "sectionDesc", type: "text", label: "板块描述", localized: true },
        {
          name: "items",
          type: "array",
          label: "特点列表（固定 4 项）",
          minRows: 4,
          maxRows: 4,
          fields: [
            { name: "title", type: "text", label: "标题", localized: true },
            { name: "desc", type: "textarea", label: "描述", localized: true },
          ],
        },
        { name: "paymentTitle", type: "text", label: "支付无忧 - 标题", localized: true },
        { name: "paymentDesc", type: "textarea", label: "支付无忧 - 描述", localized: true },
        { name: "translationTitle", type: "text", label: "专业翻译 - 标题", localized: true },
        { name: "translationDesc", type: "textarea", label: "专业翻译 - 描述", localized: true },
      ],
    },

    // ─── 最新手记（板块标题/描述，文章内容在 Journals 集合中） ────
    {
      name: "journal",
      type: "group",
      label: "最新手记（板块标题）",
      fields: [
        { name: "sectionTitle", type: "text", label: "板块标题", localized: true },
        { name: "sectionDesc", type: "text", label: "板块描述", localized: true },
      ],
    },

    // ─── 关于我们 ────────────────────────────────────────────────
    {
      name: "about",
      type: "group",
      label: "关于我们",
      fields: [
        { name: "title", type: "text", label: "标题", localized: true },
        { name: "body", type: "textarea", label: "正文", localized: true },
      ],
    },

    // ─── 页脚 ────────────────────────────────────────────────────
    {
      name: "footer",
      type: "group",
      label: "页脚",
      fields: [
        { name: "desc", type: "text", label: "品牌描述", localized: true },
        { name: "copyright", type: "text", label: "版权文字", localized: true },
        {
          name: "email",
          type: "email",
          label: "邮箱地址",
          admin: { description: "如：hello@deepchinatrip.com" },
        },
        { name: "instagram", type: "text", label: "Instagram 账号", admin: { description: "如：@deepchinatrip" } },
        { name: "facebook", type: "text", label: "Facebook 账号", admin: { description: "如：deepchinatrip" } },
        { name: "whatsapp", type: "text", label: "WhatsApp 号码", admin: { description: "如：+86 138 0000 0000" } },
        { name: "telegram", type: "text", label: "Telegram 账号", admin: { description: "如：@deepchinatrip" } },
        { name: "wechat", type: "text", label: "微信号" },
        {
          name: "qrImage",
          type: "upload",
          relationTo: "media",
          label: "微信/WhatsApp 二维码图片",
        },
      ],
    },
  ],
};
