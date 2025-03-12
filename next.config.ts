import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", 
  distDir: "out", 
  images: {
    unoptimized: true, 
  },
  basePath: "/graphql", 
  assetPrefix: "/graphql",

  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
