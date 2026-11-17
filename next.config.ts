import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * GitHub Pages only serves files, so the whole site is exported at build
   * time. That rules out `cacheComponents` and `partialPrefetching` — PPR
   * cannot be enabled in export mode — which costs nothing here: every route
   * was already fully static, with no server actions or route handlers to lose.
   */
  output: "export",

  /** Pages resolves `/case/the-wildcard/` to that directory's index.html. */
  trailingSlash: true,

  // Pin the upgrade policy: check stable installs against published security
  // advisories and recommend a safe upgrade when one applies.
  experimental: {
    agentUpgrade: "security",
  },

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
