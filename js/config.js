// js/config.js — единая конфигурация проекта

export const CONFIG = {
  // Network
  network: "devnet", // "devnet" | "mainnet-beta"

  // RPC
  rpcUrl: "https://api.devnet.solana.com",

  // Oracle API
  oracleUrl: "https://oracle.enrg.io/api/v1",

  // Program IDs
  programId: "ENRGmvpXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  profileProgramId: "PROFmvpXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",

  // Token
  srcMint: "SRCmintXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  srcDecimals: 9,
  srcMaxSupply: 1_000_000_000,

  // Auth message (для Ed25519 подписи)
  authMessage: "ENRG Protocol: verify wallet ownership",

  // UI
  toastDuration: 4000, // ms

  // Explorer
  explorerUrl: "https://explorer.solana.com",

  // Devnet faucet
  faucetUrl: "https://faucet.solana.com",
};
