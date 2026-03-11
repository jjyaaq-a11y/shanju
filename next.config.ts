import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  output: "standalone", // 打包成独立目录，部署时只需上传 .next/standalone + .next/static，无需整份 node_modules
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
      { protocol: "https", hostname: "www.deepchinatrip.com", pathname: "/**" },
      { protocol: "http", hostname: "www.deepchinatrip.com", pathname: "/**" },
      { protocol: "https", hostname: "deepchinatrip.com", pathname: "/**" },
      { protocol: "http", hostname: "deepchinatrip.com", pathname: "/**" },
    ],
  },
};

export default withPayload(nextConfig);
