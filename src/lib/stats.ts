import { useCallback, useEffect, useState } from "react";
import { LINKS, STATS } from "../config";

/** Live Axis/ENRG ecosystem stats (oracle) or demo fallback. */
export interface EcosystemStats {
  /** Verified energy (proofs table), Wh. */
  totalEnergyWh: number;
  /** Proofs minted on-chain (mint_status = minted). */
  mintedProofs: number;
  /** Distinct producing devices. */
  activeDevices: number;
  /** SRC supply from verified energy (1 SRC = 1 MWh). */
  srcEarned: number;
  /** Unix seconds of the last proof. */
  lastProofTs: number;
}

export type StatsStatus = "live" | "demo";

export interface StatsResult {
  status: StatsStatus;
  stats: EcosystemStats;
  /** Human-readable data source label. */
  sourceLabel: string;
}

/**
 * Format verified energy in a human-friendly unit:
 * 11 → "11 Wh", 1 540 → "1.5 kWh", 2 300 000 → "2.3 MWh".
 * The DePIN pilot runs in Wh, so MWh-only formatting would show "0".
 */
export function formatEnergy(wh: number): string {
  const n = Math.max(0, wh);
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} MWh`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} kWh`;
  }
  return `${Math.round(n)} Wh`;
}

/** Relative "last proof" time: "just now", "4 min ago", "2 h ago". */
export function formatAgo(ts: number): string {
  if (!ts) return "—";
  const sec = Math.floor(Date.now() / 1000) - ts;
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} h ago`;
  return `${Math.floor(sec / 86400)} d ago`;
}

/** Fallback values used while the public API is unavailable (pilot scale). */
function demoStats(): StatsResult {
  return {
    status: "demo",
    stats: { ...STATS.demo },
    sourceLabel: "DEMO · projected pilot data",
  };
}

async function fetchOracle(signal: AbortSignal): Promise<StatsResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STATS.timeoutMs);
  const onOuterAbort = () => controller.abort();
  signal.addEventListener("abort", onOuterAbort, { once: true });

  try {
    const res = await fetch(LINKS.oracleStats, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: unknown = await res.json();
    if (typeof data !== "object" || data === null) throw new Error("bad payload");

    const d = data as Record<string, unknown>;
    // New fields (proofs table, ADR-0010) with backward-compatible fallbacks.
    const totalEnergyWh = Math.max(
      0,
      Math.round(Number(d.total_energy_wh ?? Math.round(Number(d.total_energy_mwh ?? 0) * 1e6))),
    );
    const mintedProofs = Math.max(0, Math.round(Number(d.minted_proofs ?? 0)));
    const activeDevices = Math.max(0, Math.round(Number(d.active_producers ?? 0)));
    const srcEarned = Math.max(0, Number(d.total_supply ?? 0));
    const lastProofTs = Math.max(0, Math.round(Number(d.last_proof_ts ?? 0)));

    return {
      status: "live",
      stats: { totalEnergyWh, mintedProofs, activeDevices, srcEarned, lastProofTs },
      sourceLabel: "LIVE · enrg-oracle",
    };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onOuterAbort);
  }
}

/**
 * Subscription to ecosystem stats.
 * Starts with demo values immediately (never a blank/zero hero), then swaps
 * to live oracle data as soon as it arrives. Refreshes every STATS.refreshMs.
 */
export function useEcosystemStats(): StatsResult {
  const [result, setResult] = useState<StatsResult>(demoStats);

  const load = useCallback(async () => {
    const controller = new AbortController();
    try {
      const next = await fetchOracle(controller.signal);
      setResult(next);
    } catch {
      // Oracle unavailable (offline / sleeping free tier): keep the last known
      // state — demo values were already shown on mount, so the page never
      // flashes zeros.
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;

    const run = async () => {
      dispose = await load();
      if (cancelled) dispose?.();
    };
    void run();

    const interval = setInterval(() => {
      void load();
    }, STATS.refreshMs);

    return () => {
      cancelled = true;
      dispose?.();
      clearInterval(interval);
    };
  }, [load]);

  return result;
}

/** One-shot request (for the hero panel): 1 request, does not touch the global loop. */
export async function fetchEcosystemStatsOnce(): Promise<StatsResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STATS.timeoutMs);
  try {
    return await fetchOracle(controller.signal);
  } catch {
    return demoStats();
  } finally {
    clearTimeout(timer);
  }
}
