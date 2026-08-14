// js/dashboard.js — логика дашборда
// Источник истины: plans/ENRG_website_truth_sheet.md

import { requireAuth, logout } from "./auth.js";
import { getDeviceStatus } from "./api.js";
import { formatSrc, shortAddress, renderError } from "./ui.js";
import { getPublicKey } from "./wallet.js";
import { initWalletUI } from "./wallet-ui.js";
import { getStoredDevices, getDeviceFromStorage } from "./device-store.js";
import { bindSimulateButtons } from "./simulate-buttons.js";
import { CONFIG } from "./config.js";

let session = null;
let _lastStatusFetch = 0;
const STATUS_THROTTLE_MS = 5000; // throttle: не чаще раза в 5 сек

async function init() {
  initWalletUI();

  session = await requireAuth("/index.html");
  if (!session) return;

  document.getElementById("user-address").textContent = shortAddress(session.address);

  const deviceIds = getStoredDevices();
  if (deviceIds.length === 0) {
    renderError(document.getElementById("dashboard-root"), "No device registered. Please register first.");
    return;
  }

  document.getElementById("device-id-display").textContent = deviceIds[0];

  bindSimulateButtons(document.getElementById("devices-list"), {
    onDone: () => refreshDeviceList(deviceIds, true),
  });

  await Promise.all([
    loadDeviceData(deviceIds[0]),
    refreshDeviceList(deviceIds, true),
    loadSrcBalance(),
  ]);

  // Live polling: статусы устройств (+ статистика в след. шаге)
  setInterval(() => refreshDeviceList(deviceIds), CONFIG.dashboardPollMs);
}

// --- Logout ---
document.getElementById("logout-btn")?.addEventListener("click", () => {
  logout();
  window.location.href = "/index.html";
});

// --- Device Card (primary device) ---
const STATUS_MAP = {
  active: { text: "✅ Active", cls: "status--active" },
  offline: { text: "⏸️ Offline", cls: "status--offline" },
  quarantine: { text: "⚠️ Quarantine", cls: "status--warning" },
  unregistered: { text: "📋 Unregistered", cls: "status--muted" },
  revoked: { text: "🚫 Revoked", cls: "status--error" },
};

function renderDeviceCard(deviceId, data) {
  const container = document.getElementById("device-info");
  if (!container) return;

  const state = data.state || "active";
  const si = STATUS_MAP[state.toLowerCase()] || { text: state, cls: "" };

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
      <div class="device-card__row">
        <span class="device-card__label">Nonce</span>
        <span class="device-card__value">${data.nonce ?? 0}</span>
      </div>
    </div>
  `;
}

async function loadDeviceData(deviceId) {
  try {
    const data = await getDeviceStatus(deviceId);
    renderDeviceCard(deviceId, data);
  } catch (err) {
    renderError(document.getElementById("device-info"), err.message);
  }
}

// --- Device list: статусы всех устройств из localStorage (throttle) ---
async function refreshDeviceList(deviceIds, force = false) {
  const now = Date.now();
  if (!force && now - _lastStatusFetch < STATUS_THROTTLE_MS) return;
  _lastStatusFetch = now;

  const container = document.getElementById("devices-list");
  if (!container) return;

  const statuses = await Promise.all(
    deviceIds.map(async (id) => {
      try {
        return { id, status: await getDeviceStatus(id), error: null };
      } catch (err) {
        return { id, status: null, error: (err && err.message) || String(err) };
      }
    })
  );

  // Обновляем карточку первого (primary) устройства
  const primary = statuses.find((s) => s.status);
  if (primary) renderDeviceCard(primary.id, primary.status);

  container.innerHTML = statuses
    .map(({ id, status, error }) => {
      const device = getDeviceFromStorage(id);
      const energyWh = status && status.energy_wh !== undefined ? status.energy_wh : device ? device.energy_wh : 0;
      const nonce = status && status.nonce !== undefined ? status.nonce : device ? device.last_nonce : 0;
      return `
        <div class="device-row">
          <div class="device-row__meta">
            <span class="device-row__id">${id}</span>
            <span class="device-row__stats">nonce: ${nonce ?? 0} · energy: ${energyWh ?? 0} Wh</span>
            ${error ? `<span class="device-row__error">⚠️ ${error}</span>` : ""}
          </div>
          <div class="device-row__actions">
            <button class="btn btn--sm btn--sim" data-device-id="${id}" data-energy-wh="250">Simulate proof (250 Wh)</button>
          </div>
        </div>
      `;
    })
    .join("");
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
