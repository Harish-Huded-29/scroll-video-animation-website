import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
