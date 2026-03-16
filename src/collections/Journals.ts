import type { CollectionConfig } from "payload";
import { slugify } from "../lib/slugify";

export const Journals: CollectionConfig = {
  slug: "journals",
  labels: { singular: "手记", plural: "手记" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "tag", "date", "published"],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data?.slug) {
          data.slug = slugify(data.title);
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: "标题",
    },
    {
      name: "excerpt",
      type: "textarea",
      localized: true,
      label: "摘要",
      admin: { description: "显示在卡片上的简短描述" },
    },
    {
      name: "tag",
      type: "text",
      localized: true,
      label: "标签",
      admin: { description: "如：路线手记、人文、故事" },
    },
    {
      name: "date",
      type: "text",
      label: "日期文本",
      admin: { description: "如：2024.10 或 Oct 2024（中英文可不同，填在对应语言字段中）" },
      localized: true,
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      label: "URL Slug",
      admin: {
        description: "手记详情页路径，如 daocheng-yading-autumn。留空会按标题自动生成。",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "封面图片",
      admin: { description: "建议 16:10 比例" },
    },
    {
      name: "contentImages",
      type: "array",
      label: "内容长截图",
      admin: { description: "建议上传竖向长图，前台将按顺序展示。" },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "截图",
        },
      ],
    },
    {
      name: "published",
      type: "checkbox",
      defaultValue: true,
      label: "已发布",
      admin: {
        position: "sidebar",
        description: "取消勾选则不在前台显示",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      label: "排序",
      admin: {
        position: "sidebar",
        description: "数字越小越靠前，默认按此字段升序排列",
      },
    },
  ],
};
