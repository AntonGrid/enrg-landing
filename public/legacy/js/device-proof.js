// js/device-proof.js — подпись и отправка proof (симуляция устройства)
// Секретный ключ не покидает браузер: подпись создаётся только на клиенте.

import { postProof, getDeviceStatus } from "./api.js";
import { getDeviceFromStorage, saveDeviceToStorage } from "./device-store.js";

// --- Base64 helpers (browser, без Buffer) ---
export function bytesToBase64(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function getNacl() {
  if (!window.nacl) {
    throw new Error("tweetnacl not loaded — check CDN script in the HTML page.");
  }
  return window.nacl;
}

// Сформировать и подписать proof-сообщение: msg = device_id|timestamp|energyWh|nonce
export function signProof(device, energyWh, nonce, timestamp) {
  const nacl = getNacl();
  const msg = `${device.device_id}|${timestamp}|${energyWh}|${nonce}`;
  const msgBytes = new TextEncoder().encode(msg);
  const secretKeyBytes = base64ToBytes(device.secretKey);
  const signature = nacl.sign.detached(msgBytes, secretKeyBytes);
  return { msg, signatureBase64: bytesToBase64(signature) };
}

// Полный флоу симуляции proof: подпись + POST /api/v1/proof/submit + обновление localStorage
export async function simulateProof(deviceId, energyWh = 250) {
  const device = getDeviceFromStorage(deviceId);
  if (!device) throw new Error("Device not found in localStorage. Register it first.");

  const nonce = (device.last_nonce || 0) + 1;
  const timestamp = new Date().toISOString();
  const { signatureBase64 } = signProof(device, energyWh, nonce, timestamp);

  const resp = await postProof(deviceId, timestamp, energyWh, nonce, signatureBase64);

  // Успех — обновляем локальное состояние (nonce и накопленную энергию)
  device.last_nonce = nonce;
  device.energy_wh = (device.energy_wh || 0) + Number(energyWh);
  saveDeviceToStorage(device);

  return resp;
}

// GET /api/v1/device/:id/status и синхронизация локального состояния с сервером
export async function refreshDeviceFromOracle(deviceId) {
  const status = await getDeviceStatus(deviceId);
  const device = getDeviceFromStorage(deviceId);
  if (device && status) {
    if (typeof status.energy_wh === "number") device.energy_wh = status.energy_wh;
    if (typeof status.nonce === "number") device.last_nonce = status.nonce;
    saveDeviceToStorage(device);
  }
  return status;
}
