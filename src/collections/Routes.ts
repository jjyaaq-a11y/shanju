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
      ({ data, operation }) => {
        if (data?.name && (!data?.slug || operation === "create")) {
          data.slug = slugify(data.name);
        }
        const days = data?.daysCount;
        if (days != null && typeof days === "number" && days >= 1) {
          const n = Math.round(days);
          const arr = Array.isArray(data.dayItinerary) ? [...data.dayItinerary] : [];
          while (arr.length < n) {
            arr.push({ images: [], description: null });
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
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "URL Slug",
      admin: { description: "从名称自动生成", readOnly: true },
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
      name: "dayItinerary",
      type: "array",
      label: "每日行程",
      admin: {
        description: "根据行程天数自动匹配。每天可上传图片，描述须填写中英文。",
      },
      fields: [
        {
          name: "images",
          type: "array",
          label: "当天图片（上传）",
          maxRows: 2,
          admin: { description: "每天 0–2 张" },
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
          name: "description",
          type: "richText",
          label: "当天描述",
          localized: true,
          admin: { description: "中英文均需填写" },
        },
      ],
    },
  ],
};
