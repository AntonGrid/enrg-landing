/**
 * ENRG landing — single source of truth for links and protocol parameters.
 */

export const LINKS = {
  /** Axis-connect PWA (GitHub Pages) — opens in a new tab. */
  axisConnect: "https://antongrid.github.io/Axis-connect/",

  /** Public ENRG oracle: CORS is allowed for enrg.network and localhost only. */
  oracleStats: "https://enrg-oracle.onrender.com/api/v1/stats",

  /** Axis/ENRG Protocol documentation. */
  docs: "https://github.com/AntonGrid/ENRG",

  /** Legacy pages (kept in public/legacy). */
  whitepaper: "/legacy/whitepaper.html",
  technicalOverview: "/legacy/technical-overview.html",

  x: "https://x.com/ENRG_Protocol",
  telegram: "https://t.me/enrg_protocol",
  explorer: "https://explorer.solana.com",
  contact: "mailto:anton@enrg.network",
};

export const STATS = {
  /** Fallback values used when the public API is unavailable. */
  demo: {
    totalEnergyKwh: 65_000,
    activeDevices: 128,
    srcEarned: 8_420,
  },
  /** Live stats refresh interval (ms). */
  refreshMs: 60_000,
  /** Oracle request timeout (ms). */
  timeoutMs: 12_000,
};

export const TOKENOMICS = {
  ticker: "SRC",
  peg: "1 SRC = 1 MWh of verified energy",
  maxSupply: 1_000_000_000,
  producerShare: 85, // %
  protocolFee: 15, // %
  feeSplit: [
    { label: "Buyback", value: 20, color: "#22d3ee" },
    { label: "Staking", value: 40, color: "#a78bfa" },
    { label: "DAO", value: 30, color: "#a3e635" },
    { label: "Emergency", value: 10, color: "#fbbf24" },
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

