// js/wallet.js — Phantom adapter + signAuthMessage

import { CONFIG } from "./config.js";

const PUBKEY_STORAGE_KEY = "enrg_pubkey";

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

// True, если установлено расширение Phantom (window.solana.isPhantom)
export function hasPhantom() {
  return typeof window !== "undefined" && Boolean(window.solana && window.solana.isPhantom);
}

// --- Persist connected pubkey to localStorage["enrg_pubkey"] ---
function _persistPubkey(pubkey) {
  try {
    if (pubkey) localStorage.setItem(PUBKEY_STORAGE_KEY, pubkey);
    else localStorage.removeItem(PUBKEY_STORAGE_KEY);
  } catch {
    /* localStorage недоступен — игнорируем */
  }
}

function _setWallet(publicKey) {
  _wallet = publicKey;
  _persistPubkey(publicKey ? publicKey.toString() : null);
  return publicKey;
}

// --- Connect ---
export async function connectWallet() {
  const provider = getProvider();
  const resp = await provider.connect();
  _setWallet(resp.publicKey);
  _listenWalletEvents(provider);
  return _wallet;
}

// --- Auto connect (silent) ---
export async function tryAutoConnect() {
  try {
    const provider = getProvider();
    if (!provider.isConnected) return null;
    const resp = await provider.connect({ onlyIfTrusted: true });
    _setWallet(resp.publicKey);
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
  _setWallet(null);
}

// --- Get address ---
export function getWalletAddress() {
  return _wallet ? _wallet.toString() : null;
}

export function getPublicKey() {
  return _wallet;
}

// Connected pubkey: из памяти, либо из localStorage (после перезагрузки страницы)
export function getConnectedPubkey() {
  if (_wallet) return _wallet.toString();
  try {
    return localStorage.getItem(PUBKEY_STORAGE_KEY);
  } catch {
    return null;
  }
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
    _setWallet(newKey);
    _changeCallbacks.forEach(cb => cb(newKey));
  });

  provider.on("disconnect", () => {
    _setWallet(null);
    _changeCallbacks.forEach(cb => cb(null));
  });
}
