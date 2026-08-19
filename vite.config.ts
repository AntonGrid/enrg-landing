import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * ENRG Landing — futuristic portal of the Axis/ENRG ecosystem.
 *
 * - Static assets are built into `dist/` and deployed to GitHub Pages (CNAME: enrg.network).
 * - Public pages: main SPA (index.html) + legacy docs in `public/legacy/`.
 * - Ecosystem stats are fetched from the CORS-enabled oracle
 *   `https://enrg-oracle.onrender.com/api/v1/stats` (see src/lib/stats.ts).
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    // GitHub Pages deployment via Actions: base "/" (the site has its own CNAME).
    outDir: "dist",
  },
});
