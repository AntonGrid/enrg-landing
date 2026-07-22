// js/main.js — точка входа для index.html

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
}

// --- Protocol stats ---
async function loadStats() {
  try {
    const stats = await fetchProtocolStats();
    const el = document.getElementById("protocol-stats");
    if (!el) return;
    el.innerHTML = `
      <div class="stat">
        <span class="stat__label">Total Minted</span>
        <span class="stat__value">${formatSrc(stats.totalMinted)}</span>
      </div>
      <div class="stat">
        <span class="stat__label">Active Devices</span>
        <span class="stat__value">${stats.activeDevices}</span>
      </div>
      <div class="stat">
        <span class="stat__label">Participants</span>
        <span class="stat__value">${stats.participants}</span>
      </div>
    `;
  } catch (err) {
    console.warn("Stats unavailable:", err.message);
  }
}

init();
