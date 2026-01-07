import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

const config = defineConfig({
  plugins: [
    tanstackStart(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    viteReact(),
    // Bundle analyzer - only runs when ANALYZE=true
    process.env.ANALYZE === "true" &&
      visualizer({
        filename: "stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: "treemap", // or "sunburst", "network"
      }),
  ].filter(Boolean),
  optimizeDeps: {
    // Exclude Prisma from dependency optimization (handled by TanStack Start)
    exclude: ["@prisma/client", ".prisma/client"],
  },
  ssr: {
    // Mark Prisma as external for SSR (required at runtime, not bundled)
    external: ["@prisma/client", ".prisma/client"],
  },
});

export default config;
