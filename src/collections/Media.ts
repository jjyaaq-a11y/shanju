import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "媒体",
    plural: "媒体",
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: () => true, // 公开可读，便于前台展示路线等图片
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    staticDir: "media",
    formatOptions: {
      format: "webp",
      options: {
        quality: 88,
      },
    },
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 768, height: 512, position: "centre" },
      { name: "tablet", width: 1024, height: undefined, position: "centre" },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "rotation",
      type: "select",
      label: "前台旋转角度",
      defaultValue: "0",
      options: [
        { label: "0°", value: "0" },
        { label: "90°", value: "90" },
        { label: "180°", value: "180" },
        { label: "270°", value: "270" },
      ],
      admin: {
        description: "上传后若画面方向不对，可在这里调整；保存后前台会立即按该角度展示。",
      },
    },
    {
      name: "alt",
      type: "text",
      label: "替代文本",
      admin: { description: "图片描述，用于无障碍与 SEO" },
    },
  ],
};
