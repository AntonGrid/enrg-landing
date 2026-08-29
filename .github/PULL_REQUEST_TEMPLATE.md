## Description
Briefly describe what was changed and why.

## Key changed files
- (list key files)

## How to test (checklist)
- [ ] `npm run build` in `enrg-landing` passes without errors.
- [ ] The "Connect Device" button opens `https://axis-connect.onrender.com` in a new tab.
- [ ] Menu HOME · DASHBOARD · MINTING · HISTORY · SETTINGS works (anchors / external links).
- [ ] Stats: with a live oracle `https://enrg-oracle.onrender.com/api/v1/stats` — LIVE badge; when unavailable — DEMO fallback with SYNC animation.
- [ ] Landing sections render on desktop, tablet and phone.
- [ ] Legacy pages `/legacy/whitepaper.html` and `/legacy/technical-overview.html` open.

## Deployment (short)
- GitHub Pages via Actions (`.github/workflows/deploy.yml`): push to `main`.
- CNAME `enrg.network` is copied from `public/` into `dist/`.
- Repository Settings → Pages source must be "GitHub Actions".

## Security
- [ ] No real secrets are committed.
- [ ] External links use `rel="noopener noreferrer"`.

## PR Checklist (for merge)
- [ ] Smoke test passed (`npm run build`)
- [ ] Links verified
- [ ] Release notes updated

