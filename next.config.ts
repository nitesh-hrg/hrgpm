import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-expect-error: NextConfig type definition mismatch
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
