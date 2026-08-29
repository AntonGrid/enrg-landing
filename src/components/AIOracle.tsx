import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AI_ORACLE } from "../config";
import {
  fetchAIAttestation,
} from "../lib/aiOracle";
import type { AIOracleResult, AISignal } from "../lib/aiOracle";
import { HoloCard, SectionHeading, StatusChip } from "./ui";
import { formatEnergy } from "../lib/stats";

/** Shortened clock "14:35" from an ISO attestation timestamp. */
function timeOf(ts: string): string {
  const m = /T(\d{2}:\d{2})/.exec(ts ?? "");
  return m ? m[1] : "–";
}

function shortKey(pub: string): string {
  if (!pub) return "—";
  return `${pub.slice(0, 10)}…${pub.slice(-6)}`;
}

/** Forecast bar: value with an 80% interval band. */
function ForecastBar({
  label,
  value,
  low,
  high,
  max,
}: {
  label: string;
  value: number;
  low: number;
  high: number;
  max: number;
}) {
  const width = max > 0 ? (value / max) * 100 : 0;
  const lowPct = max > 0 ? (low / max) * 100 : 0;
  const highPct = max > 0 ? (high / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between font-mono text-[11px] text-slate-400">
        <span className="text-slate-500">{label}</span>
        <span className="text-neon-glow tabular-nums">{value.toFixed(2)} Wh</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-800/70">
        <div
          className="absolute inset-y-0 rounded-full bg-neon/70"
          style={{ width: `${Math.min(width, 100)}%` }}
        />
        <div
          className="absolute inset-y-0 rounded-full border border-cyber/70"
          style={{ left: `${lowPct}%`, width: `${Math.max(0, highPct - lowPct)}%` }}
        />
      </div>
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-slate-600">
        <span>q10 {low.toFixed(1)}</span>
        <span>q90 {high.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function AIOracle() {
  const [result, setResult] = useState<AIOracleResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const next = await fetchAIAttestation();
      if (!cancelled) setResult(next);
    };
    void load();
    const interval = setInterval(load, AI_ORACLE.refreshMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const status = result?.status ?? "demo";
  const signals: AISignal[] = result?.attestation.message.signals ?? [];
  const meta = result?.attestation.message.meta;

  const forecasts = signals
    .filter((s) => s.kind === "generation_forecast")
    .slice(0, 4);
  const anomalies = signals.filter((s) => s.kind === "generation_anomaly");
  const market = signals.filter((s) => s.kind === "market_forecast");
  const maxFc = Math.max(...forecasts.map((f) => f.interval_high), 1);

  return (
    <section id="ai" className="relative scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="// Sovereign AI · signals, not decisions"
          title="AI Oracle"
          accent="Neural Core"
        />

        <div className="mb-6 flex justify-center">
          <StatusChip tone={status} label={result?.sourceLabel ?? "DEMO · projected AI signals"} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Generation forecast */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
          >
            <HoloCard className="h-full p-7" glow>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  01 / FORECAST
                </span>
                <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-lime text-lime" />
              </div>
              <div className="mt-4 text-3xl font-bold text-neon-glow">
                {formatEnergy(meta?.observed_generation_wh ?? 0)}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                verified generation · next {forecasts.length} × {meta?.bucket_minutes ?? 15} min
              </div>
              <div className="mt-6 space-y-4">
                {forecasts.map((f, i) => (
                  <ForecastBar
                    key={f.ts + i}
                    label={timeOf(f.ts)}
                    value={f.value}
                    low={f.interval_low}
                    high={f.interval_high}
                    max={maxFc}
                  />
                ))}
              </div>
            </HoloCard>
          </motion.div>


          {/* Anomaly watch */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            <HoloCard className="h-full p-7">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  02 / ANOMALY WATCH
                </span>
                {anomalies.length > 0 ? (
                  <span className="rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber">
                    flagged
                  </span>
                ) : (
                  <span className="rounded-full border border-lime/30 bg-lime/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-lime">
                    nominal
                  </span>
                )}
              </div>
              <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-slate-500">
                MAD-based plausibility over the proof stream
              </div>

              {anomalies.length === 0 ? (
                <div className="mt-8 space-y-3">
                  <div className="text-2xl font-semibold text-cyber-glow">No anomalies</div>
                  <p className="font-mono text-[11px] leading-relaxed text-slate-500">
                    The device stream stays inside its own learned band. The AI
                    only observes — the Policy Engine decides (constitution C-1).
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {anomalies.map((a, i) => (
                    <div key={i} className="rounded-lg border border-amber/30 bg-amber/5 p-4">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-amber">
                        device deviates from its own history
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-400">
                        <span>observed {String(a.meta.observed_wh ?? "?")} Wh</span>
                        <span>expected {String(a.meta.expected_wh ?? "?")} Wh</span>
                        <span>residual {String(a.meta.residual_wh ?? "?")} Wh</span>
                        <span>threshold {String(a.meta.threshold_wh ?? "?")} Wh</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </HoloCard>
          </motion.div>



          {/* Market forecast */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
          >
            <HoloCard className="h-full p-7">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  03 / MARKET
                </span>
                <span className="h-2 w-2 rounded-full bg-amber/70 animate-pulse" />
              </div>
              <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-slate-500">
                USD/kWh forecast · next step · 80% interval
              </div>
              <div className="mt-6 space-y-4">
                {market.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-neon/10 bg-slate-900/40 px-4 py-3"
                  >
                    <div>
                      <div className="font-display text-sm font-semibold uppercase tracking-wider text-slate-200">
                        {String(m.meta.market_source ?? "—")}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        {m.interval_low.toFixed(3)} … {m.interval_high.toFixed(3)}
                      </div>
                    </div>
                    <div className="font-mono text-2xl font-semibold text-cyber-glow tabular-nums">
                      {m.value.toFixed(3)}
                    </div>
                  </div>
                ))}
                {market.length === 0 && (
                  <p className="font-mono text-[11px] text-slate-500">no market feed</p>
                )}
              </div>
            </HoloCard>
          </motion.div>
        </div>

        {/* Signature strip */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
          <span>signed {result ? "attestation" : "…"}</span>
          <span className="text-cyber/80">
            ed25519 · {shortKey(result?.attestation.public_key ?? "")}
          </span>
          <span>
            generated{" "}
            {result
              ? result.attestation.message.generated_at.slice(0, 16).replace("T", " ")
              : "…"}
          </span>
        </div>
      </div>
    </section>
  );
}
