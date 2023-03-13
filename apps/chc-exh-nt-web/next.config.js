module.exports = {
  /* experimental: {
    appDir: true,
    // FIX: replaces node-fetch which has a bug maxes the payload to 15k for some reason
    enableUndici: true,
  }, */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['tailwind-ui'],
  i18n: {
    locales: ['en', 'no'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  images: {
    domains: ['cdn.sanity.io'],
    loader: 'custom'
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
};
