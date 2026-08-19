# ENRG Landing — Release Notes

> Date: 2026-08-19 · Branch: `main` · Repository: `enrg-landing`
> Status: v2.0 — futuristic portal, deployed to GitHub Pages (enrg.network).

## v2.0 — Futuristic portal (React + Vite)

Complete rebuild of the static landing into a modern SPA:

| Commit | Content |
|---|---|
| `9c46461` | **React + Vite + Tailwind + Framer Motion rebuild.** Neon particle background, animated ecosystem stats (kWh / devices / SRC), tokenomics, 3-step flow, partners, GitHub Actions deploy, legacy pages moved to `/legacy/`. |
| `a055f33` | **"Site from the future".** Holographic boot screen, energy core reactor, cursor glow, scroll progress, 3D tilt cards, hero parallax, terminal HUD ticker, neon marquee, particles reacting to the cursor. |
| `fe46095` | **Deploy fix.** Switched GitHub Pages to "GitHub Actions" source; `.nojekyll`; empty-commit trigger. |
| `92d87ca` | **Full English.** UI, code comments, README, PR template and docs translated to English for the international launch. |

## Key files

- `src/App.tsx` — global layers (aurora, scanlines, cursor glow, scroll progress, boot screen)
- `src/components/` — Hero, Stats, HowItWorks, Tokenomics, Partners, Cta, Footer, Navbar, Marquee, EnergyCore, Particles, BootScreen
- `src/lib/stats.ts` — oracle stats with demo fallback + timeout
- `src/config.ts` — links (Axis Connect, oracle, docs) and SRC tokenomics
- `.github/workflows/deploy.yml` — GitHub Pages deploy on push to `main`
- `public/legacy/` — old static pages (whitepaper, docs, dashboard, register)

## How to test

1. `npm install && npm run dev`
2. Verify the holographic boot screen appears and fades out.
3. Hero: energy core orbits, cursor glow, 3D tilt on the energy panel.
4. Stats: with a live oracle → LIVE badge; when unavailable → DEMO fallback with SYNC animation.
5. "Connect Device" opens `https://antongrid.github.io/Axis-connect/` in a new tab.
6. Check responsiveness on desktop, tablet and phone.

## Reviewer checklist

- [ ] `npm run build` passes without errors
- [ ] All texts are in English (UI, docs, comments)
- [ ] Stats fallback works when the oracle is offline
- [ ] GitHub Pages source is set to "GitHub Actions"
- [ ] No secrets committed (`FOUNDER_KEY` is not in the repo)

## Oracle deployment (manual)

Prod oracle deployment is manual (Render access + `FOUNDER_KEY` secret required):

1. Render → New → Web Service → oracle repo, branch `main`, root `.`
2. Build: `npm install --omit=dev` · Start: `node server.js` · Health: `/api/v1/stats`
3. Render → Environment → **Add Secret Variable** → `FOUNDER_KEY` = JSON key array
4. After deploy: `curl https://<render-url>/api/v1/stats`
5. In the frontend: `window.ENRG_ORACLE_URL` override before loading modules

Details: `docs/docker-oracle.md`, `docs/render-deploy.md`.
