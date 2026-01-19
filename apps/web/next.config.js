const path = require("path");

module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},
};
