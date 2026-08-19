# ENRG — Tokenization of Future Energy

Futuristic landing portal for the **Axis/ENRG** ecosystem: dark theme, neon,
holograms, and particles. The main goal of the landing is to guide users to the
**Axis Connect** PWA ("Connect Device") and display live ecosystem statistics.

## Tech Stack

- **React 19 + TypeScript + Vite 8**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Framer Motion** — section animations, animated counters
- **Canvas Particles** — background network (no Three.js, lightweight)
- **Fonts**: Space Grotesk + JetBrains Mono (local, via `@fontsource`)

## Structure
src/
main.tsx, App.tsx — entry point, section assembly
config.ts — links (Axis Connect, oracle, docs) and SRC params
index.css, effects.css — Tailwind theme, neon/hologram/buttons
lib/
stats.ts — fetch stats from oracle + fallback (demo) + timeout
useAnimatedNumber.ts — animated numbers and formatting
components/
Particles.tsx — background particles (canvas)
Navbar.tsx — menu HOME·DASHBOARD·MINTING·HISTORY·SETTINGS
Hero.tsx — holographic logo + live energy panel
Stats.tsx — ecosystem stats (kWh / devices / SRC)
HowItWorks.tsx — 3 steps: Connect → Prove → Earn
Tokenomics.tsx — SRC economics, distribution, multipliers
Partners.tsx — Solana, ESP32, Rust, TypeScript
Cta.tsx — "Start" / "Download App" → Axis Connect
Footer.tsx
ui.tsx — SectionHeading, HoloCard, StatusChip, Logo…
public/
logo.svg, CNAME — Pages favicon and enrg.network domain
legacy/ — legacy static pages (whitepaper, docs, dashboard)

text

## Axis-connect Integration

- Buttons **"Connect Device"**, **"Download App"**, **"Start"** and
  menu items **DASHBOARD / SETTINGS** open the PWA in a new tab:
  `https://antongrid.github.io/Axis-connect/`.
- **Axis Connect** remains an independent PWA — the landing does not include its code.

## Ecosystem Statistics

- Endpoint: `GET https://enrg-oracle.onrender.com/api/v1/stats`
  (CORS allowed for `enrg.network` and `localhost`).
- Response: `{ total_energy_mwh, active_producers, total_supply }`.
- Landing shows: energy generated (kWh), active devices, SRC minted.
  Updates every 60s, request timeout 12s.
- If API is unavailable — **fallback** with `DEMO` badge and
  "SYNC · loading data" animation (see `src/lib/stats.ts`).

## Run Locally

```bash
npm install
npm run dev       # Vite dev server
npm run build     # typecheck + production build to dist/
npm run preview   # preview the build
Deployment
GitHub Pages via Actions (.github/workflows/deploy.yml): npm ci →
npm run build → upload dist/ → deploy-pages. CNAME (enrg.network)
is copied from public/. For Pages deployment to work, repository settings
must have "GitHub Actions" as the source.

© 2026 ENRG Protocol. The protocol is governed. The protocol is not owned.
