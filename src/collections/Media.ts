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
      name: "alt",
      type: "text",
      label: "替代文本",
      admin: { description: "图片描述，用于无障碍与 SEO" },
    },
  ],
};
