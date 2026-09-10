import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Keep headers for static hosting (optional, often set via .htaccess instead)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;