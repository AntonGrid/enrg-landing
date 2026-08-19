// js/ui.js — общие UI-хелперы

import { CONFIG } from "./config.js";

export function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), CONFIG.toastDuration);
}

export function setLoading(buttonEl, isLoading) {
  buttonEl.disabled = isLoading;
  buttonEl.dataset.label = buttonEl.dataset.label || buttonEl.textContent;
  buttonEl.textContent = isLoading ? "Loading..." : buttonEl.dataset.label;
}

export function formatSrc(amount) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(amount) + " SRC";
}

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function renderError(containerEl, message) {
  containerEl.innerHTML = `<p class="error-message">⚠️ ${message}</p>`;
}

export function renderEmpty(containerEl, message = "No data yet.") {
  containerEl.innerHTML = `<p class="empty-message">${message}</p>`;
}
