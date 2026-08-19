// js/wallet-ui.js — header wallet button (Connect / Disconnect / Install Phantom)

import {
  connectWallet,
  disconnectWallet,
  getConnectedPubkey,
  getWalletAddress,
  hasPhantom,
  onWalletChange,
  tryAutoConnect,
} from "./wallet.js";
import { showToast, shortAddress } from "./ui.js";

const PHANTOM_URL = "https://phantom.app/";

export async function initWalletUI() {
  const walletBtn = document.getElementById("wallet-btn");
  if (!walletBtn) return;
  const walletAddress = document.getElementById("wallet-address");

  function render(address) {
    if (address) {
      walletBtn.textContent = "Disconnect";
      walletBtn.classList.add("connected");
      walletBtn.dataset.state = "connected";
      if (walletAddress) walletAddress.textContent = shortAddress(address);
      return;
    }

    if (walletAddress) walletAddress.textContent = "";

    if (!hasPhantom()) {
      walletBtn.textContent = "Install Phantom";
      walletBtn.classList.remove("connected");
      walletBtn.dataset.state = "install";
      return;
    }

    walletBtn.textContent = "Connect Wallet";
    walletBtn.classList.remove("connected");
    walletBtn.dataset.state = "disconnected";
  }

  walletBtn.addEventListener("click", async () => {
    const state = walletBtn.dataset.state || "disconnected";

    // Нет Phantom — ведём на установку расширения
    if (state === "install") {
      window.open(PHANTOM_URL, "_blank", "noopener,noreferrer");
      return;
    }

    if (state === "connected") {
      await disconnectWallet();
      render(null);
      showToast("Wallet disconnected.");
      return;
    }

    try {
      await connectWallet();
      render(getWalletAddress());
      showToast("Wallet connected!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  onWalletChange((newKey) => {
    render(newKey ? newKey.toString() : null);
  });

  // Восстанавливаем pubkey из localStorage (после перезагрузки страницы)
  const stored = getConnectedPubkey();
  if (stored) render(stored);

  // Тихий авто-коннект, если Phantom уже разрешил доступ
  try {
    const key = await tryAutoConnect();
    if (key) render(key.toString());
  } catch {
    /* ignore */
  }
}
