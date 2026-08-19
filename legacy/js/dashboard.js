// js/dashboard.js — логика дашборда
// Источник истины: plans/ENRG_website_truth_sheet.md

import { requireAuth, logout } from "./auth.js";
import { getDeviceStatus, fetchProtocolStats, getWalletTokenBalance } from "./api.js";
import { showToast, formatSrc, shortAddress, renderError } from "./ui.js";
import { getConnectedPubkey } from "./wallet.js";
import { initWalletUI } from "./wallet-ui.js";
import { getStoredDevices, getDeviceFromStorage } from "./device-store.js";
import { bindSimulateButtons } from "./simulate-buttons.js";
import { CONFIG } from "./config.js";

let session = null;
let _lastStatusFetch = 0;
let _statsTimer = null;
let _backoffMs = CONFIG.pollBackoffBaseMs;

async function init() {
  initWalletUI();

  session = await requireAuth("/index.html");
  if (!session) return;

  document.getElementById("user-address").textContent = shortAddress(session.address);

  const deviceIds = getStoredDevices();

  // Stats и SRC balance показываем всегда, даже без зарегистрированных устройств
  loadStats();
  loadSrcBalance();

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
  ]);

  // Live polling статусов устройств (отдельно от stats)
  setInterval(() => refreshDeviceList(deviceIds), CONFIG.dashboardPollMs);
}

// --- Logout ---
document.getElementById("logout-btn")?.addEventListener("click", () => {
  logout();
  window.location.href = "/index.html";
});

// --- Manual refresh: немедленное обновление stats ---
document.getElementById("btn-refresh")?.addEventListener("click", () => {
  if (_statsTimer) clearTimeout(_statsTimer);
  _backoffMs = CONFIG.pollBackoffBaseMs;
  loadStats();
});

// --- Protocol stats: polling с экспоненциальным бэкоффом ---
function updateStatsWidgets(stats) {
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  set("stat-producers", stats.activeProducers);
  set("stat-energy", `${stats.totalEnergyMwh} MWh`);
  set("stat-supply", formatSrc(stats.totalSupply));
}

async function loadStats() {
  const statsEl = document.getElementById("dashboard-stats");
  if (statsEl) statsEl.classList.add("is-loading");

  try {
    const stats = await fetchProtocolStats();
    _backoffMs = CONFIG.pollBackoffBaseMs; // успех — сбрасываем бэкофф
    updateStatsWidgets(stats);
    _scheduleStatsPoll(CONFIG.dashboardPollMs);
  } catch (err) {
    const msg = (err && err.message) || String(err);
    console.warn("Stats poll failed:", msg);
    showToast(`Stats update failed: ${msg} — retrying in ${Math.round(_backoffMs / 1000)}s`, "error");
    _scheduleStatsPoll(_backoffMs);
    _backoffMs = Math.min(_backoffMs * 2, CONFIG.pollBackoffMaxMs); // 2s -> 4s -> ... -> 60s
  } finally {
    if (statsEl) statsEl.classList.remove("is-loading");
  }
}

function _scheduleStatsPoll(delayMs) {
  if (_statsTimer) clearTimeout(_statsTimer);
  _statsTimer = setTimeout(loadStats, delayMs);
}

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

// --- Device list: статусы всех устройств из localStorage (throttle 5s) ---
async function refreshDeviceList(deviceIds, force = false) {
  const now = Date.now();
  if (!force && now - _lastStatusFetch < CONFIG.deviceStatusThrottleMs) return;
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

// --- SRC Balance (on-chain, через localStorage["enrg_pubkey"]) ---
async function loadSrcBalance() {
  const container = document.getElementById("src-balance");
  if (!container) return;

  const pubkey = getConnectedPubkey();
  if (!pubkey) {
    container.textContent = "Connect wallet to see balance";
    return;
  }

  try {
    const balance = await getWalletTokenBalance(pubkey);
    container.textContent = formatSrc(balance);
  } catch (err) {
    console.warn("Error fetching SRC balance:", err);
    container.textContent = "—";
  }
}

init();
