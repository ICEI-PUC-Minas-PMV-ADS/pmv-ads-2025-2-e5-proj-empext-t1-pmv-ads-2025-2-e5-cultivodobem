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
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "cultivodobemwebapp",
        short_name: "cultivodobemwebapp",
        description: "cultivodobemwebapp - PWA Application",
        theme_color: "#0c0c0c",
      },
      pwaAssets: { disabled: true, config: false },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
