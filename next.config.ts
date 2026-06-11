/** @format */
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import fs from "fs";
import path from "path";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Frontend lives inside the backend monorepo; pin the project root so Next.js
// does not resolve React/Next from the parent lockfile (duplicate React breaks App Router context).
// realpathSync.native normalizes Windows casing (Frontend vs frontend) so webpack does not
// load two copies of react/next and break App Router context ("layout router to be mounted").
const projectRoot = fs.realpathSync.native(__dirname);
const frontendNodeModules = path.join(projectRoot, "node_modules");
const parentNodeModules = path.join(projectRoot, "..", "node_modules");
const frontendReact = fs.realpathSync.native(
  path.join(frontendNodeModules, "react"),
);
const frontendReactDom = fs.realpathSync.native(
  path.join(frontendNodeModules, "react-dom"),
);
const frontendNext = fs.realpathSync.native(
  path.join(frontendNodeModules, "next"),
);

/** Webpack: absolute realpaths so Windows `frontend` vs `Frontend` cwd does not load duplicate React. */
const webpackReactResolveAlias: Record<string, string> = {
  react: frontendReact,
  "react-dom": frontendReactDom,
  "react/jsx-runtime": path.join(frontendReact, "jsx-runtime.js"),
  "react/jsx-dev-runtime": path.join(frontendReact, "jsx-dev-runtime.js"),
  "react-dom/client": path.join(frontendReactDom, "client.js"),
  "react-dom/server": path.join(frontendReactDom, "server.browser.js"),
  "react-dom/server.browser": path.join(frontendReactDom, "server.browser.js"),
  next: frontendNext,
  [path.join(parentNodeModules, "react")]: frontendReact,
  [path.join(parentNodeModules, "react-dom")]: frontendReactDom,
  [path.join(parentNodeModules, "next")]: frontendNext,
};

/** Turbopack: relative paths only (absolute Windows paths are not supported). */
const turbopackReactResolveAlias: Record<string, string> = {
  react: "./node_modules/react",
  "react-dom": "./node_modules/react-dom",
  "react/jsx-runtime": "./node_modules/react/jsx-runtime.js",
  "react/jsx-dev-runtime": "./node_modules/react/jsx-dev-runtime.js",
  "react-dom/client": "./node_modules/react-dom/client.js",
  "react-dom/server": "./node_modules/react-dom/server.browser.js",
  "react-dom/server.browser": "./node_modules/react-dom/server.browser.js",
  next: "./node_modules/next",
};

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
    resolveAlias: turbopackReactResolveAlias,
  },
  allowedDevOrigins: ['192.168.0.3', 'localhost', '127.0.0.1'],
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    esmExternals: true,
  },
  serverExternalPackages: ["axios"],
  webpack: (config, { dev }) => {
    // Parent monorepo installs a second React copy; pin all bundles to this app's React/Next
    // so App Router context (layout router, useRouter, usePathname) stays consistent.
    // Do not walk up to the backend monorepo's node_modules (second React/Next copy).
    config.resolve.modules = [frontendNodeModules];

    config.resolve.alias = {
      ...config.resolve.alias,
      ...webpackReactResolveAlias,
    };

    // Belt-and-suspenders: rewrite any lowercase "frontend" segment in resolved paths.
    if (process.platform === "win32") {
      const normalizeCasing = (resourcePath: string) =>
        resourcePath.replace(
          /khabiteq_backend[\\/]frontend(?=[\\/]|$)/gi,
          `khabiteq_backend${path.sep}Frontend`,
        );

      config.plugins.push({
        apply(compiler) {
          compiler.hooks.normalModuleFactory.tap(
            "NormalizeFrontendPathCasing",
            (nmf) => {
              nmf.hooks.afterResolve.tap(
                "NormalizeFrontendPathCasing",
                (result) => {
                  if (result?.resource) {
                    result.resource = normalizeCasing(result.resource);
                  }
                  if (result?.userRequest) {
                    result.userRequest = normalizeCasing(result.userRequest);
                  }
                },
              );
            },
          );
        },
      });
    }

    // Dev compiles can be slow on first load; avoid false ChunkLoadError timeouts.
    if (dev && config.output) {
      config.output.chunkLoadTimeout = 120000;
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
