import type { CollectionConfig } from "payload";

export const Addons: CollectionConfig = {
  slug: "addons",
  admin: {
    useAsTitle: "labelKey",
    defaultColumns: ["category", "labelKey", "pricePerDay"],
  },
  labels: {
    singular: "附加项",
    plural: "附加项",
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "category",
      type: "select",
      required: true,
      label: "类别",
      options: [
        { label: "酒店 (hotel)", value: "hotel" },
        { label: "车辆 (vehicle)", value: "vehicle" },
        { label: "摄影 (photography)", value: "photography" },
        { label: "导游 (guide)", value: "guide" },
      ],
    },
    {
      name: "labelKey",
      type: "text",
      required: true,
      label: "标签 Key",
      admin: { description: "用于多语言，如 luxuryHotel" },
    },
    {
      name: "descriptionKey",
      type: "text",
      label: "描述 Key",
      admin: { description: "用于多语言" },
    },
    {
      name: "pricePerDay",
      type: "number",
      required: true,
      defaultValue: 0,
      label: "每天价格（美金）",
    },
    {
      name: "description",
      type: "richText",
      label: "描述",
    },
  ],
};
