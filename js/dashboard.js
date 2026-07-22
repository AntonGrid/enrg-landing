// js/dashboard.js — логика дашборда

import { requireAuth, logout } from "./auth.js";
import { fetchDevices, fetchMintHistory, submitMintRequest } from "./api.js";
import { showToast, formatSrc, formatDate, shortAddress, renderError, renderEmpty, setLoading } from "./ui.js";
import { signAuthMessage } from "./wallet.js";

let session = null;

// --- Init ---
async function init() {
  session = await requireAuth("/index.html");
  if (!session) return;

  document.getElementById("user-address").textContent = shortAddress(session.address);

  await Promise.all([
    loadDevices(),
    loadMintHistory(),
  ]);
}

// --- Logout ---
document.getElementById("logout-btn")?.addEventListener("click", () => {
  logout();
  window.location.href = "/index.html";
});

// --- Devices ---
async function loadDevices() {
  const container = document.getElementById("devices-list");
  if (!container) return;

  try {
    const devices = await fetchDevices(session.address);

    if (!devices.length) {
      renderEmpty(container, "No devices registered yet.");
      return;
    }

    container.innerHTML = devices.map(device => `
      <div class="device-card" data-id="${device.id}">
        <div class="device-card__name">${device.name}</div>
        <div class="device-card__type">${device.type}</div>
        <div class="device-card__status device-card__status--${device.status}">
          ${device.status}
        </div>
        <div class="device-card__energy">${formatSrc(device.pendingEnergy)} pending</div>
        <button class="btn btn--primary mint-btn" data-id="${device.id}">
          Mint SRC
        </button>
      </div>
    `).join("");

    container.querySelectorAll(".mint-btn").forEach(btn => {
      btn.addEventListener("click", () => mintSrc(btn));
    });

  } catch (err) {
    renderError(container, err.message);
  }
}

// --- Mint ---
async function mintSrc(btn) {
  const deviceId = btn.dataset.id;
  setLoading(btn, true);

  try {
    const { signature, message } = await signAuthMessage();

    await submitMintRequest({
      walletAddress: session.address,
      deviceId,
      signature: Array.from(signature),
      message,
    });

    showToast("SRC minted successfully!", "success");
    await Promise.all([loadDevices(), loadMintHistory()]);

  } catch (err) {
    showToast(err.message, "error");
  } finally {
    setLoading(btn, false);
  }
}

// --- Mint History ---
async function loadMintHistory() {
  const container = document.getElementById("mint-history");
  if (!container) return;

  try {
    const history = await fetchMintHistory(session.address);

    if (!history.length) {
      renderEmpty(container, "No mint history yet.");
      return;
    }

    container.innerHTML = `
      <table class="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Device</th>
            <th>Amount</th>
            <th>Tx</th>
          </tr>
        </thead>
        <tbody>
          ${history.map(item => `
            <tr>
              <td>${formatDate(item.timestamp)}</td>
              <td>${item.deviceName}</td>
              <td>${formatSrc(item.amount)}</td>
              <td>
                <a href="https://explorer.solana.com/tx/${item.txHash}?cluster=devnet"
                   target="_blank" rel="noopener">
                  ${shortAddress(item.txHash)}
                </a>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

  } catch (err) {
    renderError(container, err.message);
  }
}

init();
