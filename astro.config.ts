import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import react from "@vitejs/plugin-react";

export default defineConfig({
  site: "https://floorscalc.com",
  output: "static",
  integrations: [sitemap()],
  vite: { plugins: [react()] },
});
