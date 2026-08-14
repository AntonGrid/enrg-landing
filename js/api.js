// js/api.js — все запросы к Oracle API и on-chain данным
// Источник истины: plans/ENRG_website_truth_sheet.md

import { CONFIG } from "./config.js";

async function request(path, options = {}) {
  const url = `${CONFIG.oracleUrl}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Oracle [${res.status}]: ${errText}`);
  }
  return res.json();
}

// --- Protocol Stats ---
export async function fetchProtocolStats() {
  const data = await request("/stats");
  return {
    totalEnergyMwh: data.total_energy_mwh ?? 0,
    activeProducers: data.active_producers ?? 0,
    totalSupply: data.total_supply ?? 0,
  };
}

// --- Device ---
export async function registerDevice(payload) {
  return request("/device/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Register a device to the oracle: POST /api/v1/device/register { device_id, public_key }
export async function postRegisterDevice(device_id, public_key) {
  return request("/device/register", {
    method: "POST",
    body: JSON.stringify({ device_id, public_key }),
  });
}

export async function fetchDeviceStatus(deviceId) {
  return request(`/device/${encodeURIComponent(deviceId)}/status`);
}

// --- Proof ---
export async function submitProof(payload) {
  return request("/proof/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// POST /api/v1/proof/submit { device_id, timestamp, energyWh, nonce, signature }
export async function postProof(device_id, timestamp, energyWh, nonce, signature) {
  return request("/proof/submit", {
    method: "POST",
    body: JSON.stringify({ device_id, timestamp, energyWh, nonce, signature }),
  });
}

// GET /api/v1/device/:id/status
export async function getDeviceStatus(deviceId) {
  return request(`/device/${encodeURIComponent(deviceId)}/status`);
}

// --- Wallet SRC balance (on-chain, devnet) ---
// pubkey: string (base58) или solanaWeb3.PublicKey. 0, если токенов нет.
export async function getWalletTokenBalance(pubkey) {
  if (typeof solanaWeb3 === "undefined") {
    throw new Error("solana-web3 not loaded in this page.");
  }
  const owner = typeof pubkey === "string" ? new solanaWeb3.PublicKey(pubkey) : pubkey;
  const mint = new solanaWeb3.PublicKey(CONFIG.srcMint);
  const connection = new solanaWeb3.Connection(CONFIG.rpcUrl);

  const tokenAccounts = await connection.getTokenAccountsByOwner(owner, { mint });
  if (tokenAccounts.value.length === 0) return 0;

  const accountInfo = await connection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);
  return Number(accountInfo.value.uiAmount) || 0;
}
