// js/main.js — точка входа для index.html
// Источник истины: plans/ENRG_website_truth_sheet.md

import { CONFIG } from "./config.js";
import { connectWallet, tryAutoConnect, getWalletAddress, onWalletChange } from "./wallet.js";
import { fetchProtocolStats } from "./api.js";
import { showToast, shortAddress, formatSrc } from "./ui.js";

// --- Wallet button ---
const walletBtn = document.getElementById("wallet-btn");
const walletAddress = document.getElementById("wallet-address");

async function updateWalletUI(address) {
  if (address) {
    walletBtn.textContent = shortAddress(address);
    walletBtn.classList.add("connected");
    if (walletAddress) walletAddress.textContent = shortAddress(address);
  } else {
    walletBtn.textContent = "Connect Wallet";
    walletBtn.classList.remove("connected");
    if (walletAddress) walletAddress.textContent = "";
  }
}

walletBtn?.addEventListener("click", async () => {
  try {
    await connectWallet();
    const address = getWalletAddress();
    await updateWalletUI(address);
    showToast("Wallet connected!", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
});

// --- Auto connect ---
async function init() {
  const key = await tryAutoConnect();
  if (key) await updateWalletUI(key.toString());

  onWalletChange((newKey) => {
    updateWalletUI(newKey ? newKey.toString() : null);
  });

  await loadStats();
  // Refresh metrics periodically
  setInterval(loadStats, CONFIG.metricsRefreshMs);
}

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

init();
