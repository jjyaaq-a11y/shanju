import type { Field, GlobalConfig } from "payload";

const bilingualTextRow = (
  zhName: string,
  enName: string,
  zhLabel: string,
  enLabel: string,
  type: "text" | "textarea" = "text"
): Field => {
  const fields: Field[] = type === "textarea"
    ? [
        { name: zhName, type: "textarea", label: zhLabel, admin: { width: "50%" } },
        { name: enName, type: "textarea", label: enLabel, admin: { width: "50%" } },
      ]
    : [
        { name: zhName, type: "text", label: zhLabel, admin: { width: "50%" } },
        { name: enName, type: "text", label: enLabel, admin: { width: "50%" } },
      ];

  return {
    type: "row",
    fields,
  };
};

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "网站内容设置",
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
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
        bilingualTextRow("titleZh", "titleEn", "主标题（中文）", "Main Title (EN)"),
        bilingualTextRow("taglineZh", "taglineEn", "主标语（中文）", "Tagline (EN)"),
        bilingualTextRow("regionSubZh", "regionSubEn", "地区副文案（中文）", "Region Subtitle (EN)"),
        bilingualTextRow("subtitleZh", "subtitleEn", "描述文字（中文）", "Subtitle (EN)"),
        bilingualTextRow("ctaRoutesZh", "ctaRoutesEn", "按钮文字-查看路线（中文）", "CTA Routes (EN)"),
        bilingualTextRow("ctaContactZh", "ctaContactEn", "按钮文字-联系咨询（中文）", "CTA Contact (EN)"),
        bilingualTextRow("altImageZh", "altImageEn", "图片 Alt（中文）", "Image Alt (EN)"),

        // 兼容旧数据（隐藏，仅读取）
        { name: "title", type: "text", localized: true, admin: { hidden: true } },
        { name: "tagline", type: "text", localized: true, admin: { hidden: true } },
        { name: "regionSub", type: "text", localized: true, admin: { hidden: true } },
        { name: "subtitle", type: "text", localized: true, admin: { hidden: true } },
        { name: "ctaRoutes", type: "text", localized: true, admin: { hidden: true } },
        { name: "ctaContact", type: "text", localized: true, admin: { hidden: true } },
        { name: "altImage", type: "text", localized: true, admin: { hidden: true } },
      ],
    },
    {
      name: "why",
      type: "group",
      label: "为什么选择我们",
      fields: [
        bilingualTextRow("sectionTitleZh", "sectionTitleEn", "板块标题（中文）", "Section Title (EN)"),
        bilingualTextRow("sectionDescZh", "sectionDescEn", "板块描述（中文）", "Section Description (EN)"),
        {
          name: "items",
          type: "array",
          label: "特点列表（固定 4 项）",
          minRows: 4,
          maxRows: 4,
          fields: [
            bilingualTextRow("titleZh", "titleEn", "标题（中文）", "Title (EN)"),
            bilingualTextRow("descZh", "descEn", "描述（中文）", "Description (EN)", "textarea"),
            { name: "title", type: "text", localized: true, admin: { hidden: true } },
            { name: "desc", type: "textarea", localized: true, admin: { hidden: true } },
          ],
        },
        bilingualTextRow("paymentTitleZh", "paymentTitleEn", "支付无忧-标题（中文）", "Payment Title (EN)"),
        bilingualTextRow("paymentDescZh", "paymentDescEn", "支付无忧-描述（中文）", "Payment Description (EN)", "textarea"),
        bilingualTextRow("translationTitleZh", "translationTitleEn", "专业翻译-标题（中文）", "Translation Title (EN)"),
        bilingualTextRow("translationDescZh", "translationDescEn", "专业翻译-描述（中文）", "Translation Description (EN)", "textarea"),

        { name: "sectionTitle", type: "text", localized: true, admin: { hidden: true } },
        { name: "sectionDesc", type: "text", localized: true, admin: { hidden: true } },
        { name: "paymentTitle", type: "text", localized: true, admin: { hidden: true } },
        { name: "paymentDesc", type: "textarea", localized: true, admin: { hidden: true } },
        { name: "translationTitle", type: "text", localized: true, admin: { hidden: true } },
        { name: "translationDesc", type: "textarea", localized: true, admin: { hidden: true } },
      ],
    },
    {
      name: "journal",
      type: "group",
      label: "最新手记（板块标题）",
      fields: [
        bilingualTextRow("sectionTitleZh", "sectionTitleEn", "板块标题（中文）", "Section Title (EN)"),
        bilingualTextRow("sectionDescZh", "sectionDescEn", "板块描述（中文）", "Section Description (EN)"),
        { name: "sectionTitle", type: "text", localized: true, admin: { hidden: true } },
        { name: "sectionDesc", type: "text", localized: true, admin: { hidden: true } },
      ],
    },
    {
      name: "about",
      type: "group",
      label: "关于我们",
      fields: [
        bilingualTextRow("titleZh", "titleEn", "标题（中文）", "Title (EN)"),
        bilingualTextRow("bodyZh", "bodyEn", "正文（中文）", "Body (EN)", "textarea"),
        { name: "title", type: "text", localized: true, admin: { hidden: true } },
        { name: "body", type: "textarea", localized: true, admin: { hidden: true } },
      ],
    },
    {
      name: "footer",
      type: "group",
      label: "页脚",
      fields: [
        bilingualTextRow("descZh", "descEn", "品牌描述（中文）", "Brand Description (EN)"),
        bilingualTextRow("copyrightZh", "copyrightEn", "版权文字（中文）", "Copyright (EN)"),
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

        { name: "desc", type: "text", localized: true, admin: { hidden: true } },
        { name: "copyright", type: "text", localized: true, admin: { hidden: true } },
      ],
    },
  ],
};
