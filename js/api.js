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
