import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: { '*': ['./.data/**/*', './android/**/*', './ios/**/*', './tests/**/*'] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
