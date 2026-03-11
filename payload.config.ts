import path from "path";
import sharp from "sharp";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { buildConfig } from "payload";
import { Users } from "./src/collections/Users";
import { Media } from "./src/collections/Media";
import { Routes } from "./src/collections/Routes";
import { Addons } from "./src/collections/Addons";

export default buildConfig({
  admin: {
    user: "users",
    meta: {
      titleSuffix: " · DeepChinaTrip",
    },
  },
  collections: [Users, Media, Routes, Addons],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "changeme-in-production",
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || "file:./payload.db",
    },
  }),
  sharp,
  localization: {
    locales: [
      { label: "中文", code: "zh" },
      { label: "English", code: "en" },
    ],
    defaultLocale: "zh",
    fallback: true,
  },
});
