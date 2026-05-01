import type { CollectionConfig } from "payload";
import { slugify } from "../lib/slugify";

export const Routes: CollectionConfig = {
  slug: "routes",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "daysCount"],
  },
  labels: {
    singular: "路线",
    plural: "路线",
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.name && !data?.slug) {
          data.slug = slugify(data.name);
        }
        const days = data?.daysCount;
        if (days != null && typeof days === "number" && days >= 1) {
          const n = Math.round(days);
          const arr = Array.isArray(data.dayItinerary) ? [...data.dayItinerary] : [];
          while (arr.length < n) {
            arr.push({
              images: [],
              sections: [],
              textBlocks: [],
              descriptionZh: null,
              descriptionEn: null,
              description: null,
            });
          }
          data.dayItinerary = arr.slice(0, n);
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
      label: "名称",
    },
    {
      name: "nameEn",
      type: "text",
      label: "英文名称",
      admin: {
        description: "首页与英文界面显示的路线英文名；留空时前台会用 slug 自动生成。",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "URL Slug",
      admin: {
        description: "路线页面的 URL 路径，如 daocheng-yading。留空则从名称自动生成；中文名称建议手动填写英文拼音，便于分享。",
      },
    },
    {
      name: "daysCount",
      type: "number",
      required: true,
      label: "行程天数",
      admin: { description: "整数" },
      min: 1,
    },
    {
      name: "overviewZh",
      type: "textarea",
      label: "路线介绍（中文）",
    },
    {
      name: "overviewEn",
      type: "textarea",
      label: "路线介绍（英文）",
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: "首页展示图",
      admin: {
        description: "在首页路线卡片展示的大图。不填则使用第一天行程图片或默认图。",
      },
    },
    { name: "price_2_people", type: "number", required: true, label: "2 人 每人（美金）", min: 0, admin: { description: "每人报价" } },
    { name: "price_3_people", type: "number", required: true, label: "3 人 每人（美金）", min: 0 },
    { name: "price_4_people", type: "number", required: true, label: "4 人 每人（美金）", min: 0 },
    { name: "price_5_people", type: "number", required: true, label: "5 人 每人（美金）", min: 0 },
    { name: "price_6_people", type: "number", required: true, label: "6 人 每人（美金）", min: 0 },
    {
      name: "whatsIncluded",
      type: "array",
      label: "行程包含（我们提供）",
      admin: {
        description: "列出此路线包含的服务，如：餐饮、专车、导游、酒店、代付等。在同一页填写中英文。",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "itemZh",
              type: "text",
              label: "包含项目（中文）",
              admin: { width: "50%" },
            },
            {
              name: "itemEn",
              type: "text",
              label: "Included Item (EN)",
              admin: { width: "50%" },
            },
          ],
        },
      ],
    },
    { name: "travelTipsZh", type: "textarea", label: "旅游注意事项（中文）", admin: { description: "高原反应、季节温度、衣物建议等。" } },
    { name: "travelTipsEn", type: "textarea", label: "Travel Tips (EN)" },
    {
      name: "dayItinerary",
      type: "array",
      label: "每日行程",
      admin: {
        description: "根据行程天数自动匹配。每一天可以拆成多个内容段落，每个段落都能单独编辑标题、描述和图片。",
      },
      fields: [
        {
          name: "sections",
          type: "array",
          label: "当天内容段落",
          admin: {
            description: "例如：上午 / 下午 / 晚上。每个段落都可单独上传图片并填写中英文描述。",
          },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "titleZh",
                  type: "text",
                  label: "段落标题（中文）",
                  admin: { width: "50%" },
                },
                {
                  name: "titleEn",
                  type: "text",
                  label: "Section Title (EN)",
                  admin: { width: "50%" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "descriptionZh",
                  type: "richText",
                  label: "段落描述（中文）",
                  admin: { width: "50%" },
                },
                {
                  name: "descriptionEn",
                  type: "richText",
                  label: "Section Description (EN)",
                  admin: { width: "50%" },
                },
              ],
            },
            {
              name: "images",
              type: "array",
              label: "段落图片",
              maxRows: 5,
              admin: { description: "每个段落最多 5 张图。" },
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  label: "图片",
                },
              ],
            },
          ],
        },
        {
          name: "images",
          type: "array",
          label: "当天图片（上传）",
          maxRows: 5,
          admin: { description: "旧版字段，已隐藏兼容。", hidden: true },
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              label: "图片",
            },
          ],
        },
        {
          name: "textBlocks",
          type: "array",
          label: "当天多段描述",
          admin: { description: "旧版字段，已隐藏兼容。", hidden: true },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "descriptionZh",
                  type: "richText",
                  label: "段落描述（中文）",
                  admin: { width: "50%" },
                },
                {
                  name: "descriptionEn",
                  type: "richText",
                  label: "Paragraph Description (EN)",
                  admin: { width: "50%" },
                },
              ],
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "descriptionZh",
              type: "richText",
              label: "旧版当天描述（中文，兼容）",
              admin: { width: "50%", hidden: true },
            },
            {
              name: "descriptionEn",
              type: "richText",
              label: "Legacy Description (EN)",
              admin: { width: "50%", hidden: true },
            },
          ],
        },
        {
          name: "description",
          type: "richText",
          localized: true,
          admin: { hidden: true },
          label: "旧版本地化描述（兼容）",
        },
      ],
    },
  ],
};
