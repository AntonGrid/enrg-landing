// js/register.js — регистрация устройства (симуляция)
// Генерирует Ed25519 keypair в браузере (tweetnacl), сохраняет device в localStorage
// и регистрирует его в локальном оракле через POST /api/v1/device/register.

import { initWalletUI } from "./wallet-ui.js";
import { postRegisterDevice } from "./api.js";
import { showToast, setLoading } from "./ui.js";

const nacl = window.nacl; // tweetnacl (CDN, загружен в register.html)

// --- Base64 helpers (browser, без Buffer) ---
function bytesToBase64(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

// --- Generate device: Ed25519 keypair + device_id ---
export function generateDevice() {
  if (!nacl) {
    throw new Error("tweetnacl not loaded — check CDN script in register.html.");
  }

  const kp = nacl.sign.keyPair();
  const deviceId = `dev_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  return {
    device_id: deviceId,
    publicKey: bytesToBase64(kp.publicKey),
    secretKey: bytesToBase64(kp.secretKey), // хранится только локально, на сервер не уходит
    created_at: new Date().toISOString(),
    last_nonce: 0,
    registered: false,
  };
}

// --- localStorage ---
export function getStoredDevices() {
  try {
    const raw = localStorage.getItem("enrg_devices");
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveDeviceToStorage(device) {
  const list = getStoredDevices();
  if (!list.includes(device.device_id)) {
    list.push(device.device_id);
    localStorage.setItem("enrg_devices", JSON.stringify(list));
  }
  localStorage.setItem(`enrg_device_${device.device_id}`, JSON.stringify(device));
}

function getDeviceFromStorage(deviceId) {
  try {
    const raw = localStorage.getItem(`enrg_device_${deviceId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// --- Oracle registration ---
export async function registerDeviceToOracle(device) {
  if (!device.publicKey || device.publicKey.length !== 44) {
    throw new Error("Generated public key must be exactly 44 base64 characters.");
  }
  return postRegisterDevice(device.device_id, device.publicKey);
}

// --- Render device list from localStorage ---
function renderDeviceList() {
  const container = document.getElementById("device-list");
  if (!container) return;

  const ids = getStoredDevices();
  if (ids.length === 0) {
    container.innerHTML = `<p class="empty-message">No devices yet. Click "Register device (simulate)" to create one.</p>`;
    return;
  }

  const rows = ids
    .map((id) => {
      const device = getDeviceFromStorage(id);
      if (!device) return "";
      const status = device.registered
        ? `<span class="device-row__status device-row__status--registered">✅ registered</span>`
        : `<span class="device-row__status device-row__status--unregistered">📋 unregistered</span>`;
      return `
        <div class="device-row">
          <div class="device-row__meta">
            <span class="device-row__id">${device.device_id}</span>
            <span class="device-row__pub">${device.publicKey}</span>
          </div>
          ${status}
        </div>
      `;
    })
    .join("");

  container.innerHTML = rows;
}

// --- Register button handler ---
async function handleRegisterDevice() {
  const btn = document.getElementById("btn-register-device");
  const resultEl = document.getElementById("register-result");
  if (!btn) return;

  setLoading(btn, true);
  if (resultEl) resultEl.innerHTML = "";

  try {
    const device = generateDevice();
    const resp = await registerDeviceToOracle(device);

    device.registered = true;
    device.registered_at = new Date().toISOString();
    saveDeviceToStorage(device);

    showToast("Device registered successfully!", "success");
    if (resultEl) {
      resultEl.innerHTML = `<p class="register-result__ok">✅ ${resp.message || "Device registered successfully"}</p>`;
    }
    renderDeviceList();
  } catch (err) {
    console.warn("Register failed:", err.message);
    showToast(`Registration failed: ${err.message} Please check the oracle and retry.`, "error");
    if (resultEl) {
      resultEl.innerHTML = `<p class="register-result__error">⚠️ ${err.message}</p>`;
    }
  } finally {
    setLoading(btn, false);
  }
}

// --- Init ---
function init() {
  initWalletUI();
  renderDeviceList();

  document.getElementById("btn-register-device")?.addEventListener("click", handleRegisterDevice);
}

init();

