import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/learn", destination: "/llm", permanent: true },
      { source: "/learn/:slug*", destination: "/llm/:slug*", permanent: true },
      { source: "/pro", destination: "/harness", permanent: true },
      { source: "/pro/:slug*", destination: "/harness/:slug*", permanent: true },
    ];
  },
};

export default nextConfig;
