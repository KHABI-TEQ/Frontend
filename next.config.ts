/** @format */
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import fs from "fs";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Frontend lives inside the backend monorepo; pin the project root so Next.js
// does not resolve React/Next from the parent lockfile (duplicate React breaks App Router context).
// realpathSync.native normalizes Windows casing (Frontend vs frontend) so webpack does not
// load two copies of react/next and break App Router context ("layout router to be mounted").
const projectRoot = fs.realpathSync.native(__dirname);

function rewriteReactServerFile(request: string) {
  return request
    .replace(/jsx-runtime\.react-server\.js$/, "jsx-runtime.js")
    .replace(/jsx-dev-runtime\.react-server\.js$/, "jsx-dev-runtime.js")
    .replace(/react\.react-server\.js$/, "index.js");
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  allowedDevOrigins: ['192.168.0.3', 'localhost', '127.0.0.1'],
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ["axios"],
  webpack: (config, { dev, isServer, webpack }) => {
    // Webpack-only safety net. Next 16 webpack can put react.react-server.js
    // in the browser bundle (no createContext). Fast Refresh then full-reloads
    // GET / on every later HMR "BUILT". Prefer Turbopack for daily `next dev`.
    if (!isServer && webpack?.NormalModuleReplacementPlugin) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /react(?:\.react-server|\/jsx(?:-dev)?-runtime\.react-server)\.js$/,
          (resource: { request?: string }) => {
            if (resource.request) {
              resource.request = rewriteReactServerFile(resource.request);
            }
          },
        ),
      );
    }

    if (dev) {
      config.watchOptions = {
        ...(config.watchOptions || {}),
        aggregateTimeout: 500,
        ignored: [
          "**/.git/**",
          "**/node_modules/**",
          "**/.next/**",
        ],
      };
      if (config.output) {
        config.output.chunkLoadTimeout = 120000;
      }
    }
    return config;
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.res.cloudinary.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: false,
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: process.env.NODE_ENV === "development",
    formats: ['image/avif', 'image/webp'],
    loader: 'default',
  },
  headers: async () => {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/:path*.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Content-Type',
            value: 'font/woff2'
          }
        ]
      },
      {
        source: '/:path*.woff',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Content-Type',
            value: 'font/woff'
          }
        ]
      },
      {
        source: '/:path*.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, must-revalidate'
          }
        ]
      },
      {
        source: '/:path*.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, must-revalidate'
          }
        ]
      },
      {
        source: '/khabi-logo-nav.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/:path*.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, must-revalidate'
          }
        ]
      }
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
