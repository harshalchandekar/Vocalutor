import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  images: {
    remotePatterns: [
      { hostname: 'img.clerk.com' }
    ]
  }
};

export default withSentryConfig(nextConfig, {
  org: "gwcet",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Prevent source maps from being served publicly to clients
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Treeshake debug logging & monitor configuration
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: false,
  },
});