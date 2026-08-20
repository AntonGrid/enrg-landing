import { motion } from "framer-motion";
import { useEcosystemStats } from "../lib/stats";
import { useAnimatedNumber, formatInt } from "../lib/useAnimatedNumber";
import { HoloCard, SectionHeading, StatusChip } from "./ui";

function StatDigit({
  value,
  loading,
  prefix = "",
  suffix = "",
  decimals = 0,
  accent = "text-neon-glow",
}: {
  value: number;
  loading: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  accent?: string;
}) {
  const animated = useAnimatedNumber(loading ? 0 : value, 1400);
  const formatted = decimals > 0 ? animated.toFixed(decimals) : formatInt(animated);
  return (
    <span className={loading ? "skeleton-digit" : `tabular-nums ${accent}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

const METRICS = [
  {
    key: "energy",
    label: "Energy Generated",
    hint: "verified ecosystem generation",
    prefix: "",
    suffix: " kWh",
    decimals: 0,
    accent: "text-neon-glow",
  },
  {
    key: "devices",
    label: "Active Devices",
    hint: "online and producing energy",
    prefix: "",
    suffix: "",
    decimals: 0,
    accent: "text-cyber-glow",
  },
  {
    key: "src",
    label: "SRC Earned",
    hint: "tokens for proven energy · 1 SRC = 1 MWh",
    prefix: "",
    suffix: " SRC",
    decimals: 0,
    accent: "text-amber [text-shadow:0_0_14px_rgba(251,191,36,0.5)]",
  },
] as const;

export default function Stats() {
  const { status, stats } = useEcosystemStats();
  const loading = status === "loading";
  const values: Record<(typeof METRICS)[number]["key"], number> = {
    energy: stats.totalEnergyKwh,
    devices: stats.activeDevices,
    src: stats.srcEarned,
  };

  return (
    <section id="stats" className="relative scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="// Protocol by numbers"
          title="Ecosystem"
          accent="History"
        />

        <div className="mb-6 flex justify-center">
          <StatusChip
            tone={status === "live" ? "live" : status === "demo" ? "demo" : "sync"}
            label={
              status === "live"
                ? "LIVE · oracle data"
                : status === "demo"
                  ? "DEMO · projected data"
                  : "SYNC · loading data…"
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((metric, i) => (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
            >
              <HoloCard className="h-full p-7" glow={i === 0}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
                    0{i + 1} / METRIC
                  </span>
                  <span className="h-2 w-2 rounded-full bg-neon/60 animate-pulse" />
                </div>
                <div className="mt-6 text-4xl font-bold sm:text-5xl">
                  <StatDigit
                    value={values[metric.key]}
                    loading={loading}
                    prefix={metric.prefix}
                    suffix={metric.suffix}
                    decimals={metric.decimals}
                    accent={metric.accent}
                  />
                </div>
                <div className="mt-3 font-display text-sm font-semibold uppercase tracking-wider text-slate-200">
                  {metric.label}
                </div>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-500">
                  {metric.hint}
                </p>
              </HoloCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
