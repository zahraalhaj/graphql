import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", 
  distDir: "out", 
  images: {
    unoptimized: true, 
  },
  basePath: "/graphql", 
  assetPrefix: "/graphql",
};

export default nextConfig;
