import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { LINKS } from "../config";
import { useAnimatedNumber, formatInt } from "../lib/useAnimatedNumber";
import { useEcosystemStats } from "../lib/stats";
import Particles from "./Particles";
import EnergyCore from "./EnergyCore";
import { ExternalIcon, Logo, StatusChip, TiltCard } from "./ui";

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  };
}

const HUD_LINES = [
  "RPC DEVNET · LATENCY 12MS",
  "SRC SCALE 1:1 MW·H",
  "PROOF ED25519 · OK",
  "GRID UPTIME 99.98%",
];

/** Terminal HUD ticker: rotates lines every 2.6s. */
function TerminalHud() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % HUD_LINES.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.span
      key={i}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="text-neon-soft/80"
    >
      {HUD_LINES[i]}
      <span className="animate-blink">▌</span>
    </motion.span>
  );
}

/** Big energy counter in the hero panel. */
function EnergyCounter({ value, loading }: { value: number; loading: boolean }) {
  const animated = useAnimatedNumber(loading ? 0 : value, 1600);
  return (
    <span className={`font-mono font-bold tabular-nums ${loading ? "skeleton-digit" : "text-neon-glow"}`}>
      {formatInt(animated)}
    </span>
  );
}

export default function Hero() {
  const { status, stats } = useEcosystemStats();
  const loading = status === "loading";

  // Scroll parallax: content drifts slower, panel drifts faster
  const { scrollY } = useScroll();
  const yLeft = useTransform(scrollY, [0, 700], [0, -40]);
  const yRight = useTransform(scrollY, [0, 700], [0, 110]);
  const fade = useTransform(scrollY, [0, 550], [1, 0.25]);

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-16">
      <Particles density={1.2} />
      <div className="grid-backdrop grid-backdrop--move" />
      <div className="scan-beam" />

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-cyber-deep/35 blur-[110px] floaty" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-neon/30 blur-[100px] floaty floaty--slow" />

      <motion.div
        style={{ y: yLeft, opacity: fade }}
        className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8"
      >
        {/* Left: holographic logo + tagline */}
        <div className="relative text-center lg:text-left">
          {/* Energy core behind the logo */}
          <EnergyCore />

          <motion.div {...fadeUp(0.05)} className="relative">
            <span className="badge-neon animate-flicker">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-neon-soft text-neon-soft" />
              OPEN PROTOCOL · SOLANA · ESP32
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.15)}
            className="relative flex flex-col items-center gap-3 lg:items-start"
            aria-label="ENRG — tokenizing the energy of the future"
          >
            <Logo size="xl" />
            <span className="typing-caret mt-4 font-display text-2xl font-semibold uppercase tracking-[0.08em] text-slate-100 sm:text-3xl lg:text-4xl">
              Tokenizing <span className="holo-text holo-text--dim">Future Energy</span>
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.28)}
            className="relative mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0"
          >
            An open protocol for cryptographically verifiable physical infrastructure.
            Connect an energy device, prove your output — and earn{" "}
            <span className="text-neon-soft">SRC</span> for every verified kilowatt-hour.
          </motion.p>

          <motion.div
            {...fadeUp(0.4)}
            className="relative mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
          >
            <a
              href={LINKS.axisConnect}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center gap-2">
                Connect Device
                <ExternalIcon className="h-4 w-4" />
              </span>
            </a>
            <a
              href={LINKS.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost w-full sm:w-auto"
            >
              Explore Protocol
            </a>
          </motion.div>

          <motion.div
            {...fadeUp(0.46)}
            className="relative mt-6 flex justify-center font-mono text-[10px] uppercase tracking-[0.25em] lg:justify-start"
          >
            <TerminalHud />
          </motion.div>

          <motion.p
            {...fadeUp(0.5)}
            className="relative mt-6 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500 lg:justify-start"
          >
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-lime text-lime" />
            <span className="text-neon-soft">PWA READY</span>
            <span className="text-slate-700">·</span> works offline
            <span className="text-slate-700">·</span> Android / iOS / Desktop
          </motion.p>
        </div>

        {/* Right: live energy hologram panel */}
        <motion.div style={{ y: yRight }} className="relative">
          {/* Floating HUD chips around the panel */}
          <div className="badge-neon floaty absolute -top-5 -left-4 z-10 hidden sm:inline-flex">
            <span className="text-lime">▲</span> +0.4 kWh · earned
          </div>
          <div className="badge-neon floaty floaty--slow absolute -bottom-5 -right-3 z-10 hidden sm:inline-flex">
            <span className="text-cyber">PoP</span> verified
          </div>

          <TiltCard max={5} scale={1.015} className="[transform-style:preserve-3d]">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotateY: -8 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
            >

          <div className="hud-frame holo-panel holo-panel--glow relative overflow-hidden rounded-xl p-8 sm:p-10">
            {/* HUD corners */}
            <span className="hud-corner hud-corner--tl" aria-hidden="true" />
            <span className="hud-corner hud-corner--tr" aria-hidden="true" />
            <span className="hud-corner hud-corner--bl" aria-hidden="true" />
            <span className="hud-corner hud-corner--br" aria-hidden="true" />
            <div className="scan-beam" />

            <div className="flex items-start justify-between">
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">
                Generated
                <br />
                <span className="text-neon-soft">ecosystem energy</span>
              </div>
              <StatusChip
                tone={status === "live" ? "live" : status === "demo" ? "demo" : "sync"}
                label={status === "live" ? "LIVE" : status === "demo" ? "DEMO" : "SYNC"}
              />
            </div>

            <div className="mt-8 text-5xl leading-none sm:text-6xl lg:text-7xl">
              <EnergyCounter value={stats.totalEnergyKwh} loading={loading} />
            </div>
            <div className="mt-2 font-mono text-xs uppercase tracking-[0.35em] text-slate-500">
              kWh
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-neon/15 pt-6">
              <div>
                <div className="text-2xl font-mono font-semibold text-cyber-glow tabular-nums sm:text-3xl">
                  {loading ? (
                    <span className="skeleton-digit inline-block w-16">000</span>
                  ) : (
                    formatInt(stats.activeDevices)
                  )}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  active devices
                </div>
              </div>
              <div>
                <div className="text-2xl font-mono font-semibold text-cyber-glow tabular-nums sm:text-3xl">
                  {loading ? (
                    <span className="skeleton-digit inline-block w-16">000</span>
                  ) : (
                    formatInt(stats.srcEarned)
                  )}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  SRC earned
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-lime text-lime" />
              {status === "live"
                ? "Live sync from the oracle every 60s"
                : status === "demo"
                  ? "Oracle temporarily unavailable · demo data"
                  : "Syncing with the network…"}
            </div>
            </div>
            </motion.div>
          </TiltCard>
        </motion.div>
      </motion.div>
    </section>
  );
}

