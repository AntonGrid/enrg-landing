/**
 * Единая конфигурация лендинга ENRG.
 * Источник истины по ссылкам и параметрам протокола.
 */

export const LINKS = {
  /** PWA Axis-connect (GitHub Pages) — открывается в новом табе. */
  axisConnect: "https://antongrid.github.io/Axis-connect/",

  /** Публичный оракл ENRG: CORS разрешён только для enrg.network и localhost. */
  oracleStats: "https://enrg-oracle.onrender.com/api/v1/stats",

  /** Документация Axis/ENRG Protocol. */
  docs: "https://github.com/AntonGrid/ENRG",

  /** Легаси-страницы (сохранены в public/legacy). */
  whitepaper: "/legacy/whitepaper.html",
  technicalOverview: "/legacy/technical-overview.html",

  x: "https://x.com/ENRG_Protocol",
  telegram: "https://t.me/enrg_protocol",
  explorer: "https://explorer.solana.com",
  contact: "mailto:anton@enrg.network",
};

export const STATS = {
  /** Заглушки, когда публичный API недоступен. */
  demo: {
    totalEnergyKwh: 65_000,
    activeDevices: 128,
    srcEarned: 8_420,
  },
  /** Интервал live-обновления статистики (мс). */
  refreshMs: 60_000,
  /** Таймаут запроса к оракулу (мс). */
  timeoutMs: 12_000,
};

export const TOKENOMICS = {
  ticker: "SRC",
  peg: "1 SRC = 1 MWh верифицированной энергии",
  maxSupply: 1_000_000_000,
  producerShare: 85, // %
  protocolFee: 15, // %
  feeSplit: [
    { label: "Buyback", value: 20, color: "#22d3ee" },
    { label: "Стейкинг", value: 40, color: "#a78bfa" },
    { label: "DAO", value: 30, color: "#a3e635" },
    { label: "Emergency", value: 10, color: "#fbbf24" },
  ],
  sourceMultipliers: [
    { source: "Солнце", key: "solar", value: 1.0 },
    { source: "Ветер", key: "wind", value: 1.0 },
    { source: "Гидро", key: "hydro", value: 1.0 },
    { source: "Биогаз", key: "biogas", value: 0.8 },
    { source: "Ископаемые", key: "fossil", value: 0.5 },
  ],
};

export const NAV_ITEMS = [
  { label: "HOME", href: "#home", external: false },
  { label: "DASHBOARD", href: LINKS.axisConnect, external: true },
  { label: "MINTING", href: "#tokenomics", external: false },
  { label: "HISTORY", href: "#stats", external: false },
  { label: "SETTINGS", href: LINKS.axisConnect, external: true },
] as const;
