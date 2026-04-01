import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.listonce.com.au",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
