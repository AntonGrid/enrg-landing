import { useCallback, useEffect, useState } from "react";
import { LINKS, STATS } from "../config";

/** Live Axis/ENRG ecosystem stats (oracle) or demo fallback. */
export interface EcosystemStats {
  /** Total generated energy, kWh. */
  totalEnergyKwh: number;
  /** Number of active devices. */
  activeDevices: number;
  /** SRC earned (supply). */
  srcEarned: number;
}

export type StatsStatus = "loading" | "live" | "demo";

export interface StatsResult {
  status: StatsStatus;
  stats: EcosystemStats;
  /** Human-readable data source label. */
  sourceLabel: string;
}

const EMPTY: EcosystemStats = { totalEnergyKwh: 0, activeDevices: 0, srcEarned: 0 };

/** Fallback values used when the public API is unavailable. */
function demoStats(): StatsResult {
  return {
    status: "demo",
    stats: { ...STATS.demo },
    sourceLabel: "DEMO · oracle unavailable",
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
    const totalEnergyMwh = Number(d.total_energy_mwh ?? 0);
    const activeProducers = Number(d.active_producers ?? 0);
    const totalSupply = Number(d.total_supply ?? 0);

    return {
      status: "live",
      stats: {
        totalEnergyKwh: Math.max(0, Math.round(totalEnergyMwh * 1000)),
        activeDevices: Math.max(0, Math.round(activeProducers)),
        srcEarned: Math.max(0, Math.round(totalSupply)),
      },
      sourceLabel: "LIVE · enrg-oracle",
    };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onOuterAbort);
  }
}

/**
 * Subscription to ecosystem stats.
 * Returns demo fallback values with the `demo` flag if the API is unavailable,
 * and periodically refreshes data (STATS.refreshMs).
 */
export function useEcosystemStats(): StatsResult {
  const [result, setResult] = useState<StatsResult>({
    status: "loading",
    stats: EMPTY,
    sourceLabel: "SYNC · loading data",
  });

  const load = useCallback(async () => {
    const controller = new AbortController();
    try {
      const next = await fetchOracle(controller.signal);
      setResult(next);
    } catch {
      // Oracle unavailable (offline / sleeping free tier): demo values + loading animation.
      setResult((prev) => (prev.status === "loading" ? demoStats() : prev));
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
