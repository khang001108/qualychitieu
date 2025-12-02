// /** Next.js default config - empty for now */
// module.exports = {};
const isProd = process.env.NODE_ENV === "production";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: !isProd,
});

module.exports = withPWA({
  reactStrictMode: false,
});
