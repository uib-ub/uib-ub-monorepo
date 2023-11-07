/** @type {import('next').NextConfig} */

const withNextIntl = require("next-intl/plugin")(
  // This is the default (also the `src` folder is supported out of the box)
  "./i18n.ts"
);

const marcusv4Redirects = [
  {
    source: "/instance/:class/:id.html", // https://marcus.uib.no/instance/photograph/ubb-haa-222.html
    destination: "/items/:id",
    permanent: true,
  },
  {
    source: "/instance/collection/:id", // https://marcus.uib.no/instance/collection/astrup-samlingen
    destination: "/collections/:id",
    permanent: true,
  },
  {
    source: "/instance/exhibition/:id", // https://marcus.uib.no/exhibition/19ff9a99-3639-4324-9af6-37796f12965f
    destination: "/exhibitions/:id",
    permanent: true,
  },
  {
    source: "/instance/event/:id", // https://marcus.uib.no/instance/event/132b08be5e363b9a3e9e5eec79bd0ad72c345af2
    destination: "/events/:id",
    permanent: true,
  },
  {
    source: "/albums", // https://marcus.uib.no/albums
    destination: "/search?query=&type=Album",
    permanent: true,
  },
  {
    source: "/about-marcus", // https://marcus.uib.no/albums
    destination: "/about",
    permanent: true,
  },
  {
    source: "/stats", // https://marcus.uib.no/stats
    destination: "/statistics",
    permanent: true,
  },
  {
    source: "/technology.html", // https://marcus.uib.no/instance/photograph/ubb-haa-222.html
    destination: "https://docs-ub.vercel.app",
    permanent: true,
  },
];

const config = {
  transpilePackages: ["ui-react", "assets"],
  // @TODO turn swcMinify back on once the agressive dead code elimination bug that casues
  // `ReferenceError: FieldPresenceWithOverlay is not defined` is fixed
  swcMinify: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "data.ub.uib.no",
      },
    ],
  },
  typescript: {
    // Set this to false if you want production builds to abort if there's type errors
    ignoreBuildErrors: process.env.VERCEL_ENV === "production",
  },
  eslint: {
    /// Set this to false if you want production builds to abort if there's lint errors
    ignoreDuringBuilds: process.env.VERCEL_ENV === "production",
  },
  redirects: async () => {
    return [...marcusv4Redirects];
  },
};

module.exports = withNextIntl({
  // Other Next.js configuration ...
  ...config,
});
