// js/wallet.js — Phantom adapter + signAuthMessage

import { CONFIG } from "./config.js";

let _wallet = null;
let _changeCallbacks = [];

// --- Detect Phantom ---
function getProvider() {
  if ("solana" in window) {
    const provider = window.solana;
    if (provider.isPhantom) return provider;
  }
  throw new Error("Phantom wallet not found. Please install it from https://phantom.app");
}

// --- Connect ---
export async function connectWallet() {
  const provider = getProvider();
  const resp = await provider.connect();
  _wallet = resp.publicKey;
  _listenWalletEvents(provider);
  return _wallet;
}

// --- Auto connect (silent) ---
export async function tryAutoConnect() {
  try {
    const provider = getProvider();
    if (!provider.isConnected) return null;
    const resp = await provider.connect({ onlyIfTrusted: true });
    _wallet = resp.publicKey;
    _listenWalletEvents(provider);
    return _wallet;
  } catch {
    return null;
  }
}

// --- Disconnect ---
export async function disconnectWallet() {
  try {
    const provider = getProvider();
    await provider.disconnect();
  } catch {}
  _wallet = null;
}

// --- Get address ---
export function getWalletAddress() {
  return _wallet ? _wallet.toString() : null;
}

export function getPublicKey() {
  return _wallet;
}

// --- Sign auth message (Ed25519) ---
export async function signAuthMessage() {
  if (!_wallet) throw new Error("Wallet not connected");

  const provider = getProvider();
  const message = `${CONFIG.authMessage}\n\nTimestamp: ${Date.now()}\nAddress: ${_wallet.toString()}`;
  const encoded = new TextEncoder().encode(message);

  const { signature } = await provider.signMessage(encoded, "utf8");
  return { signature, message };
}

// --- Sign transaction ---
export async function signTransaction(transaction) {
  if (!_wallet) throw new Error("Wallet not connected");
  const provider = getProvider();
  return provider.signTransaction(transaction);
}

// --- Sign all transactions ---
export async function signAllTransactions(transactions) {
  if (!_wallet) throw new Error("Wallet not connected");
  const provider = getProvider();
  return provider.signAllTransactions(transactions);
}

// --- Wallet change listener ---
export function onWalletChange(callback) {
  _changeCallbacks.push(callback);
}

function _listenWalletEvents(provider) {
  provider.on("accountChanged", (newKey) => {
    _wallet = newKey;
    _changeCallbacks.forEach(cb => cb(newKey));
  });

  provider.on("disconnect", () => {
    _wallet = null;
    _changeCallbacks.forEach(cb => cb(null));
  });
}
