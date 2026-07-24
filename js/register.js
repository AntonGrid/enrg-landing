// js/register.js — логика регистрации устройства
// Источник истины: plans/ENRG_website_truth_sheet.md

import { requireAuth } from "./auth.js";
import { registerDevice } from "./api.js";
import { showToast, setLoading, renderError } from "./ui.js";

let session = null;

async function init() {
  session = await requireAuth("/index.html");
  if (!session) return;
}

// --- Device form ---
document.getElementById("device-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  setLoading(btn, true);

  const deviceId = document.getElementById("device-id").value.trim();
  const publicKey = document.getElementById("device-public-key").value.trim();

  if (!deviceId || !publicKey) {
    showToast("Device ID and Public Key are required.", "error");
    setLoading(btn, false);
    return;
  }

  if (publicKey.length !== 44) {
    showToast("Public key must be exactly 44 characters (base64).", "error");
    setLoading(btn, false);
    return;
  }

  try {
    await registerDevice({
      device_id: deviceId,
      public_key: publicKey,
      wallet_address: session.address,
    });
    showToast("Device registered!", "success");
    localStorage.setItem("enrgDeviceId", deviceId);
    localStorage.setItem("enrgPublicKey", publicKey);
    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 1500);
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    setLoading(btn, false);
  }
});

init();
