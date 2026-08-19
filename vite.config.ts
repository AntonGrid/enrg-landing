import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * ENRG Landing — футуристический портал экосистемы Axis/ENRG.
 *
 * - Статика собирается в `dist/` и деплоится на GitHub Pages (CNAME: enrg.network).
 * - Публичные страницы: главный SPA (index.html) + legacy-документация в `public/legacy/`.
 * - Статистика экосистемы тянется с CORS-разрешённого оракла
 *   `https://enrg-oracle.onrender.com/api/v1/stats` (см. src/lib/stats.ts).
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    // GitHub Pages деплой через Actions: base "/" (у сайта собственный CNAME).
    outDir: "dist",
  },
});
