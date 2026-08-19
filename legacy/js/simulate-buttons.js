// js/simulate-buttons.js — общий обработчик кнопок «Simulate proof» (register + dashboard)

import { showToast } from "./ui.js";
import { getDeviceFromStorage, saveDeviceToStorage } from "./device-store.js";
import { simulateProof, refreshDeviceFromOracle } from "./device-proof.js";
import { getDeviceStatus } from "./api.js";

// Привязывает клики по .btn--sim[data-device-id] внутри container.
// onDone() вызывается после завершения (для перерисовки списка).
export function bindSimulateButtons(container, { onDone } = {}) {
  if (!container) return;

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn--sim[data-device-id]");
    if (!btn || btn.disabled) return;

    const deviceId = btn.dataset.deviceId;
    const energyWh = Number(btn.dataset.energyWh || 250);

    // Concurrent-safe: блокируем кнопку на время запроса
    btn.disabled = true;
    btn.classList.add("is-loading");
    btn.textContent = "Submitting...";

    try {
      const resp = await simulateProof(deviceId, energyWh);
      const acc = resp && resp.accumulated !== undefined ? resp.accumulated : null;
      showToast(acc !== null ? `Proof accepted! Accumulated: ${acc} Wh` : "Proof accepted!", "success");
      // Синхронизируем с ораклом, чтобы показать актуальные значения
      try {
        await refreshDeviceFromOracle(deviceId);
      } catch {
        /* некритично для UX */
      }
    } catch (err) {
      const msg = (err && err.message) || String(err);
      console.warn("Proof failed:", msg);
      showToast(`Proof failed: ${msg}`, "error");

      // InvalidNonce: синхронизируем локальный nonce с сервером и просим повторить
      if (msg.includes("InvalidNonce")) {
        try {
          const status = await getDeviceStatus(deviceId);
          const device = getDeviceFromStorage(deviceId);
          if (device && status && typeof status.nonce === "number") {
            device.last_nonce = status.nonce;
            saveDeviceToStorage(device);
            showToast(`Nonce synced to ${status.nonce}. Click "Simulate proof" again to retry.`, "info");
          }
        } catch (syncErr) {
          console.warn("Nonce sync failed:", syncErr.message);
        }
      }
    } finally {
      if (typeof onDone === "function") await onDone();
    }
  });
}
