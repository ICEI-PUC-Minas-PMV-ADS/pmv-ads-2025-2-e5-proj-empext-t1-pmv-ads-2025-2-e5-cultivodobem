import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({}),
    react(),
    // VitePWA({
    //   registerType: "autoUpdate",
    //   // Use injectManifest so we can provide a custom service worker that handles push events
    //   strategies: "injectManifest",
    //   srcDir: "src",
    //   filename: "sw.ts",
    //   injectManifest: {
    //     // include all built assets so workbox can precache them
    //     globPatterns: ["**/*"],
    //     injectionPoint: undefined,
    //   },
    //   manifest: {
    //     name: "cultivodobemwebapp",
    //     short_name: "cultivodobemwebapp",
    //     description: "cultivodobemwebapp - PWA Application",
    //     theme_color: "#0c0c0c",
    //     display: "standalone",
    //     start_url: "/",
    //     icons: [
    //       {
    //         src: "/src/assets/logo-mini.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //         purpose: "any maskable",
    //       },
    //       {
    //         src: "/src/assets/logo.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //         purpose: "any maskable",
    //       },
    //     ],
    //   },
    //   // allow the plugin to generate PWA assets when possible and enable dev mode so
    //   // the `beforeinstallprompt` event can be fired during local development
    //   pwaAssets: { disabled: false, config: false },
    //   devOptions: { enabled: true, navigateFallback: "/", type: "module" },
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
