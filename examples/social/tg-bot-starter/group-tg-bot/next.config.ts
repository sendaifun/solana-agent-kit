import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@solana-agent-kit/plugin-defi"],
};

export default nextConfig;
