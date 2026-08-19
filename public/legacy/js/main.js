// js/main.js — точка входа для index.html
// Источник истины: plans/ENRG_website_truth_sheet.md

import { CONFIG } from "./config.js";
import { fetchProtocolStats } from "./api.js";
import { formatSrc } from "./ui.js";
import { initWalletUI } from "./wallet-ui.js";

// --- Wallet (Phantom) header UI: Connect / Disconnect / Install Phantom ---
initWalletUI();

// --- Protocol stats ---
async function loadStats() {
  try {
    const stats = await fetchProtocolStats();
    
    // Update hero metrics
    const producersEl = document.getElementById("hero-producers");
    const energyEl = document.getElementById("hero-energy");
    const supplyEl = document.getElementById("hero-supply");
    
    if (producersEl) producersEl.textContent = stats.activeProducers;
    if (energyEl) energyEl.textContent = stats.totalEnergyMwh;
    if (supplyEl) supplyEl.textContent = formatSrc(stats.totalSupply);

    // Update protocol stats section
    const el = document.getElementById("protocol-stats");
    if (!el) return;
    el.innerHTML = `
      <div class="stat">
        <span class="stat__label">Total Energy Tokenized</span>
        <span class="stat__value">${stats.totalEnergyMwh} MWh</span>
      </div>
      <div class="stat">
        <span class="stat__label">Active Producers</span>
        <span class="stat__value">${stats.activeProducers}</span>
      </div>
      <div class="stat">
        <span class="stat__label">SRC Supply</span>
        <span class="stat__value">${formatSrc(stats.totalSupply)}</span>
      </div>
    `;
  } catch (err) {
    console.warn("Stats unavailable:", err.message);
  }
}

loadStats();
setInterval(loadStats, CONFIG.metricsRefreshMs);

