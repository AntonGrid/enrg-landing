// js/dashboard.js — логика дашборда
// Источник истины: plans/ENRG_website_truth_sheet.md

import { requireAuth, logout } from "./auth.js";
import { fetchDeviceStatus } from "./api.js";
import { showToast, formatSrc, shortAddress, renderError, renderEmpty } from "./ui.js";
import { getPublicKey } from "./wallet.js";
import { CONFIG } from "./config.js";

let session = null;

async function init() {
  session = await requireAuth("/index.html");
  if (!session) return;

  const deviceId = localStorage.getItem("enrgDeviceId");
  if (!deviceId) {
    renderError(document.getElementById("dashboard-root"), "No device registered. Please register first.");
    return;
  }

  document.getElementById("user-address").textContent = shortAddress(session.address);
  document.getElementById("device-id-display").textContent = deviceId;

  await Promise.all([
    loadDeviceData(deviceId),
    loadSrcBalance(),
  ]);
}

// --- Logout ---
document.getElementById("logout-btn")?.addEventListener("click", () => {
  logout();
  window.location.href = "/index.html";
});

// --- Device Data ---
async function loadDeviceData(deviceId) {
  const container = document.getElementById("device-info");
  if (!container) return;

  try {
    const data = await fetchDeviceStatus(deviceId);
    const state = data.state || "active";
    const statusMap = {
      active: { text: "✅ Active", cls: "status--active" },
      offline: { text: "⏸️ Offline", cls: "status--offline" },
      quarantine: { text: "⚠️ Quarantine", cls: "status--warning" },
      unregistered: { text: "📋 Unregistered", cls: "status--muted" },
      revoked: { text: "🚫 Revoked", cls: "status--error" },
    };
    const si = statusMap[state.toLowerCase()] || { text: state, cls: "" };

    container.innerHTML = `
      <div class="device-card">
        <div class="device-card__row">
          <span class="device-card__label">Device ID</span>
          <span class="device-card__value">${deviceId}</span>
        </div>
        <div class="device-card__row">
          <span class="device-card__label">Status</span>
          <span class="device-card__value ${si.cls}">${si.text}</span>
        </div>
        <div class="device-card__row">
          <span class="device-card__label">Accumulated Energy</span>
          <span class="device-card__value">${data.energy_wh ?? 0} Wh</span>
        </div>
      </div>
    `;
  } catch (err) {
    renderError(container, err.message);
  }
}

// --- SRC Balance ---
async function loadSrcBalance() {
  const container = document.getElementById("src-balance");
  if (!container) return;

  const pubKey = getPublicKey();
  if (!pubKey) {
    container.textContent = "Connect wallet to see balance";
    return;
  }

  try {
    const connection = new solanaWeb3.Connection(CONFIG.rpcUrl);
    const mintPubkey = new solanaWeb3.PublicKey(CONFIG.srcMint);
    const tokenAccounts = await connection.getTokenAccountsByOwner(pubKey, { mint: mintPubkey });

    if (tokenAccounts.value.length === 0) {
      container.textContent = "0 SRC";
      return;
    }

    const accountInfo = await connection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);
    container.textContent = formatSrc(Number(accountInfo.value.uiAmount) || 0);
  } catch (err) {
    console.warn("Error fetching SRC balance:", err);
    container.textContent = "—";
  }
}

init();
