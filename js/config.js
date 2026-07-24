// js/config.js — единая конфигурация проекта
// Источник истины: plans/ENRG_website_truth_sheet.md

export const CONFIG = {
  // Network
  network: "devnet", // "devnet" | "mainnet-beta"

  // RPC
  rpcUrl: "https://api.devnet.solana.com",

  // Oracle API (реальный)
  oracleUrl: "https://enrg-oracle.onrender.com/api/v1",

  // Program IDs (реальные, из Anchor.toml)
  programId: "EsaKY8C3EZeRLL1wG5UECAnDWjbLfWJr7jL3pBLmpFfW", // enrg-mvp
  profileProgramId: "H9GDJQhaLqHeZZmuiqL1JTCaQ4nSquKterUyFVRdL5GZ", // enrg-profile

  // Token SRC (Source)
  srcMint: "EsaKY8C3EZeRLL1wG5UECAnDWjbLfWJr7jL3pBLmpFfW", // same as programId for MVP
  srcDecimals: 6, // ✅ Утверждено: 6 decimals
  srcMaxSupply: 1_000_000_000,
  srcPeg: "1 SRC = 1 MWh",

  // Fee distribution
  protocolFee: 0.15, // 15%
  producerShare: 0.85, // 85%
  feeDistribution: {
    buyback: 0.20,   // 20% of fee
    staking: 0.40,   // 40% of fee
    dao: 0.30,       // 30% of fee
    emergency: 0.10, // 10% of fee
  },

  // Source Multipliers
  sourceMultipliers: {
    solar: 1.0,
    wind: 1.0,
    hydro: 1.0,
    biogas: 0.8,
    fossil: 0.5,
  },

  // Auth message (для Ed25519 подписи)
  authMessage: "ENRG Protocol: verify wallet ownership",

  // UI
  toastDuration: 4000, // ms

  // Explorer
  explorerUrl: "https://explorer.solana.com",

  // Devnet faucet
  faucetUrl: "https://faucet.solana.com",

  // Metrics refresh interval
  metricsRefreshMs: 30000, // 30 seconds
};
