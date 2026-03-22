import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/analyze": ["node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"],
    "/api/documents": ["node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"],
  },
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
};

export default nextConfig;
