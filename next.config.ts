import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: ["@libsql/client", "libsql"],
  experimental: {
    // Leave room for multipart boundaries and escaped editor JSON.
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default config;
