// js/auth.js — wallet-based аутентификация (без пароля)

import { connectWallet, signAuthMessage, tryAutoConnect, getWalletAddress } from "./wallet.js";

const AUTH_KEY = "enrg_auth";
const AUTH_TTL = 1000 * 60 * 60 * 24; // 24 часа

export async function login() {
  await connectWallet();
  const { signature, message } = await signAuthMessage();
  const address = getWalletAddress();

  const session = {
    address,
    signature: Array.from(signature),
    message,
    expiresAt: Date.now() + AUTH_TTL,
  };

  sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  sessionStorage.removeItem(AUTH_KEY);
}

export function getSession() {
  const raw = sessionStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(AUTH_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return getSession() !== null;
}

export async function requireAuth(redirectUrl = "/index.html") {
  if (isAuthenticated()) return getSession();

  const key = await tryAutoConnect();
  if (key) {
    const { signature, message } = await signAuthMessage();
    const session = {
      address: key.toString(),
      signature: Array.from(signature),
      message,
      expiresAt: Date.now() + AUTH_TTL,
    };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
  }

  window.location.href = redirectUrl;
  return null;
}
