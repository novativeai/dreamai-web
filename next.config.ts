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
};

export default nextConfig;
