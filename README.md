# ENRG — Tokenization of Future Energy

Futuristic landing portal for the **Axis/ENRG** ecosystem: dark theme, neon,
holograms, and particles. The main goal of the landing is to guide users to the
**Axis Connect** PWA ("Connect Device") and display live ecosystem statistics.

## Tech Stack

- **React 19 + TypeScript + Vite 8**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Framer Motion** — section animations, animated counters
- **Canvas Particles** — background network reacting to cursor (no Three.js)
- **Fonts**: Space Grotesk + JetBrains Mono (local, via `@fontsource`)

## "Energy of the Future" — visual effects

- **Holographic boot screen** — "INITIALIZING ENRG CORE…" sequence on load
- **Energy core** — pulsing reactor with 3 orbiting rings behind the logo
- **Aurora background** — drifting neon clouds + film grain across the page
- **CRT scanlines** — subtle holographic texture over the whole site
- **Cursor glow** — neon halo following the mouse (desktop only)
- **Scroll progress** — neon bar at the top of the page
- **3D tilt** — hero panel and cards lean toward the cursor
- **Hero parallax** — content and panel move at different speeds on scroll
- **Terminal HUD ticker** — live status line in the hero
- **RGB glitch** — periodic RGB-split on the logo
- **Moving grid** — animated holographic grid in the Hero
- **Neon marquee** — infinite scrolling protocol-terms ribbon
- **Flowing borders** — conic-gradient card borders on hover
- **Shimmer buttons** — light sweep across primary CTAs
- **Floating HUD chips** and **blinking panel corners**
- **Particles** link to the cursor and are repelled by it

All effects live in `src/animations.css` and `src/effects.css`; with
`prefers-reduced-motion` they are disabled automatically.

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
GitHub Pages, two working options (pick one in Settings → Pages → Source):

Option A — GitHub Actions (recommended). Source = "GitHub Actions".
.github/workflows/deploy.yml builds and publishes dist/ on every push to main.

Option B — gh-pages branch. Source = "Deploy from a branch: gh-pages / root".
The built site lives at the root of the gh-pages branch. Update manually:
npm run build
git checkout gh-pages
git rm -rf . && cp -r dist/. . && rm -rf dist
git add -A && git commit -m "deploy: build" && git push origin gh-pages
git checkout main

> ⚠️ Important: Pages must NOT be set to "Deploy from a branch: main / root".
> main contains Vite sources (index.html with src="/src/main.tsx"); GitHub Pages
> would serve them as static files: .tsx is served as application/octet-stream and
> the browser shows "Failed to load module script". That is what broke the site.

CNAME (enrg.network) is copied from public/ into dist/.

© 2026 ENRG Protocol. The protocol is governed. The protocol is not owned.
