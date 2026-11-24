import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The app uses client-side Supabase access, so it can ship as static assets.
  output: "export",
};

export default nextConfig;
