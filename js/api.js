// js/api.js — все запросы к Oracle и on-chain данным

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

export async function fetchDevices(walletAddress) {
  return request(`/device/${walletAddress}`);
}

export async function registerDevice(payload) {
  return request("/device/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMintHistory(walletAddress) {
  return request(`/mints/${walletAddress}`);
}

export async function submitMintRequest({ walletAddress, deviceId, signature, message }) {
  return request("/mint", {
    method: "POST",
    body: JSON.stringify({ walletAddress, deviceId, signature, message }),
  });
}

export async function fetchProfile(walletAddress) {
  return request(`/profile/${walletAddress}`);
}

export async function createProfile(payload) {
  return request("/profile/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchProtocolStats() {
  return request("/stats");
}
