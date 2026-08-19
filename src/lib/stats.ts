import { useCallback, useEffect, useState } from "react";
import { LINKS, STATS } from "../config";

/** Живая статистика экосистемы Axis/ENRG (оракул) или заглушка (demo). */
export interface EcosystemStats {
  /** Сгенерировано энергии, кВт·ч. */
  totalEnergyKwh: number;
  /** Количество активных устройств. */
  activeDevices: number;
  /** Начислено SRC (Supply). */
  srcEarned: number;
}

export type StatsStatus = "loading" | "live" | "demo";

export interface StatsResult {
  status: StatsStatus;
  stats: EcosystemStats;
  /** Форматированная метка источника данных. */
  sourceLabel: string;
}

const EMPTY: EcosystemStats = { totalEnergyKwh: 0, activeDevices: 0, srcEarned: 0 };

/** Заглушки, когда публичный API недоступен. */
function demoStats(): StatsResult {
  return {
    status: "demo",
    stats: { ...STATS.demo },
    sourceLabel: "DEMO · оракул недоступен",
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
 * Подписка на статистику экосистемы.
 * Возвращает fallback-заглушки с флагом `demo`, если API недоступен,
 * и периодически обновляет данные (STATS.refreshMs).
 */
export function useEcosystemStats(): StatsResult {
  const [result, setResult] = useState<StatsResult>({
    status: "loading",
    stats: EMPTY,
    sourceLabel: "SYNC · загрузка данных",
  });

  const load = useCallback(async () => {
    const controller = new AbortController();
    try {
      const next = await fetchOracle(controller.signal);
      setResult(next);
    } catch {
      // Оракул недоступен (offline / спящий free-tier): заглушки + анимация загрузки.
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

/** Одиночный запрос (для hero-панели): 1 запрос, не трогает глобальный цикл. */
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
