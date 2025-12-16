import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all HTTPS domains for generated images
      },
    ],
    unoptimized: false,
  },
  // Enable React strict mode
  reactStrictMode: true,
  // Turbopack configuration (Next.js 16+)
  turbopack: {
    resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
};

export default nextConfig;
