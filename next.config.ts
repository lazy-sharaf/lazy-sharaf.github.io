import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  // Next only ships the dev client to origins it trusts. Without this, a phone
  // hitting the LAN address gets server HTML with no client bundle: no
  // hydration, no 3D, no menu.
  allowedDevOrigins: ["192.168.0.130", "192.168.0.37", "*.local"],
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
