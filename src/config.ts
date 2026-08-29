/**
 * ENRG landing — single source of truth for links and protocol parameters.
 */

export const LINKS = {
  /** Axis-connect PWA (Render) — opens in a new tab. */
  axisConnect: "https://axis-connect.onrender.com",

  /** Public ENRG oracle: CORS is allowed for enrg.network and localhost only. */
  oracleStats: "https://enrg-oracle.onrender.com/api/v1/stats",

  /** Signed AI-oracle attestation published by ENRG-AI (GitHub Pages). */
  aiAssessments: "https://antongrid.github.io/ENRG-AI/ai/assessments.json",

  /** Axis/ENRG Protocol documentation. */
  docs: "https://github.com/AntonGrid/ENRG",

  /** Legacy pages (kept in public/legacy). */
  whitepaper: "/legacy/whitepaper.html",
  technicalOverview: "/legacy/technical-overview.html",

  x: "https://x.com/ENRG_Protocol",
  telegram: "https://t.me/enrg_protocol",
  explorer: "https://explorer.solana.com",
  contact: "mailto:enrg.project@gmail.com",
};

export const STATS = {
  /** Fallback values used when the public API is unavailable (pilot scale,
   *  clearly marked as DEMO in the UI — never show a blank/zero hero). */
  demo: {
    totalEnergyWh: 240,
    activeDevices: 3,
    srcEarned: 0.00024,
    mintedProofs: 180,
    lastProofTs: 0,
  },
  /** Live stats refresh interval (ms). */
  refreshMs: 45_000,
  /** Oracle request timeout (ms) — Render free tier cold-starts, so keep it short. */
  timeoutMs: 5_000,
};

/** AI Oracle attestation widget (Sovereign AI signals). */
export const AI_ORACLE = {
  /** Demo generation used while the published attestation is unreachable. */
  demo: {
    bucketMinutes: 15,
    horizonSteps: 8,
    observedWh: 86, // demo daily production (Wh)
  },
  /** Attestation refresh interval (ms). */
  refreshMs: 300_000,
  /** Attestation request timeout (ms). */
  timeoutMs: 6_000,
};

export const TOKENOMICS = {
  ticker: "SRC",
  peg: "1 SRC = 1 MWh of verified energy",
  maxSupply: 1_000_000_000,
  producerShare: 85, // %
  protocolFee: 15, // %
  feeSplit: [
    { label: "Buyback", value: 20, color: "#00e5ff" },
    { label: "Staking", value: 40, color: "#c4b0ff" },
    { label: "DAO", value: 30, color: "#b7f354" },
    { label: "Emergency", value: 10, color: "#fcd34d" },
  ],
  sourceMultipliers: [
    { source: "Solar", key: "solar", value: 1.0 },
    { source: "Wind", key: "wind", value: 1.0 },
    { source: "Hydro", key: "hydro", value: 1.0 },
    { source: "Biogas", key: "biogas", value: 0.8 },
    { source: "Fossil", key: "fossil", value: 0.5 },
  ],
};

export const NAV_ITEMS = [
  { label: "HOME", href: "#home", external: false },
  { label: "DASHBOARD", href: LINKS.axisConnect, external: true },
  { label: "MINTING", href: "#tokenomics", external: false },
  { label: "HISTORY", href: "#stats", external: false },
  { label: "SETTINGS", href: LINKS.axisConnect, external: true },
] as const;

