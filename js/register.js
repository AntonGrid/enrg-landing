// js/register.js — логика регистрации устройства

import { requireAuth } from "./auth.js";
import { registerDevice, fetchProfile, createProfile } from "./api.js";
import { showToast, setLoading, renderError } from "./ui.js";

let session = null;

// --- Init ---
async function init() {
  session = await requireAuth("/index.html");
  if (!session) return;

  await checkProfile();
}

// --- Profile check ---
async function checkProfile() {
  try {
    await fetchProfile(session.address);
    showStep("step-device");
  } catch (err) {
    if (err.message.includes("404")) {
      showStep("step-profile");
    } else {
      renderError(document.getElementById("register-root"), err.message);
    }
  }
}

// --- Step navigation ---
function showStep(stepId) {
  document.querySelectorAll(".register-step").forEach(el => {
    el.classList.toggle("active", el.id === stepId);
  });
}

// --- Profile form ---
document.getElementById("profile-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  setLoading(btn, true);

  const name = document.getElementById("profile-name").value.trim();
  const email = document.getElementById("profile-email").value.trim();
  const country = document.getElementById("profile-country").value.trim();

  if (!name || !country) {
    showToast("Name and country are required.", "error");
    setLoading(btn, false);
    return;
  }

  try {
    await createProfile({
      walletAddress: session.address,
      name,
      email,
      country,
    });
    showToast("Profile created!", "success");
    showStep("step-device");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    setLoading(btn, false);
  }
});

// --- Device form ---
document.getElementById("device-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  setLoading(btn, true);

  const name = document.getElementById("device-name").value.trim();
  const type = document.getElementById("device-type").value;
  const capacity = parseFloat(document.getElementById("device-capacity").value);
  const location = document.getElementById("device-location").value.trim();

  if (!name || !type || isNaN(capacity) || !location) {
    showToast("All fields are required.", "error");
    setLoading(btn, false);
    return;
  }

  if (capacity <= 0) {
    showToast("Capacity must be greater than 0.", "error");
    setLoading(btn, false);
    return;
  }

  try {
    await registerDevice({
      walletAddress: session.address,
      name,
      type,
      capacity,
      location,
    });
    showToast("Device registered!", "success");
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
