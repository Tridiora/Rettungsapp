import type { NextConfig } from "next";
import { codespaceOrigin } from "./src/lib/server/app-origin";
const previewOrigin = codespaceOrigin();

const nextConfig: NextConfig = {
  ...(process.env.NEXT_PUBLIC_LEARNING_BETA === '1' ? { output: 'export' as const, trailingSlash: true, images: { unoptimized: true } } : {}),
  allowedDevOrigins: previewOrigin ? [new URL(previewOrigin).hostname] : [],
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
