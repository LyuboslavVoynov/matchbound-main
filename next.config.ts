import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent monorepo/root inference from escaping this standalone application.
  outputFileTracingRoot: __dirname,
};
export default nextConfig;
