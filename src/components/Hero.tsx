import { motion } from "framer-motion";
import { LINKS } from "../config";
import { useAnimatedNumber, formatInt } from "../lib/useAnimatedNumber";
import { useEcosystemStats } from "../lib/stats";
import Particles from "./Particles";
import { ExternalIcon, Logo, StatusChip } from "./ui";

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  };
}

/** Крупная цифра энергии в hero-панели. */
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

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden pt-24 pb-16">
      <Particles density={1} />
      <div className="grid-backdrop" />
      <div className="scan-beam" />

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-cyber-deep/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-neon/15 blur-[110px]" />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        {/* Left: holographic logo + tagline */}
        <div className="text-center lg:text-left">
          <motion.div {...fadeUp(0.05)}>
            <span className="badge-neon mb-6 animate-flicker">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-soft" />
              OPEN PROTOCOL · SOLANA · ESP32
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.15)}
            className="flex flex-col items-center gap-2 lg:items-start"
            aria-label="ENRG — токенизация энергии будущего"
          >
            <Logo size="xl" />
            <span className="mt-4 font-display text-2xl font-semibold uppercase tracking-[0.08em] text-slate-100 sm:text-3xl lg:text-4xl">
              Токенизация <span className="holo-text holo-text--dim">энергии будущего</span>
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.28)}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0"
          >
            Открытый протокол криптографически верифицируемой физической инфраструктуры.
            Подключите энерго-устройство, докажите выработку — и накапливайте{" "}
            <span className="text-neon-soft">SRC</span> за каждую верифицированную киловатт-час.
          </motion.p>

          <motion.div
            {...fadeUp(0.4)}
            className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
          >
            <a
              href={LINKS.axisConnect}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon w-full sm:w-auto"
            >
              Подключить устройство
              <ExternalIcon className="h-4 w-4" />
            </a>
            <a href={LINKS.docs} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full sm:w-auto">
              Изучить протокол
            </a>
          </motion.div>

          <motion.p
            {...fadeUp(0.5)}
            className="mt-5 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500 lg:justify-start"
          >
            <span className="text-neon-soft">PWA READY</span>
            <span className="text-slate-700">·</span> работает офлайн
            <span className="text-slate-700">·</span> Android / iOS / Desktop
          </motion.p>
        </div>

        {/* Right: live energy hologram panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
        >
          <div className="corner-frame holo-panel holo-panel--glow relative overflow-hidden rounded-xl p-8 sm:p-10">
            <div className="flex items-start justify-between">
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">
                Сгенерировано
                <br />
                <span className="text-neon-soft">энергии экосистемы</span>
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
              кВт · ч
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
                  активных устройств
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
                  начислено SRC
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-lime animate-blink" />
              {status === "live"
                ? "Данные обновляются с оракула каждые 60 с"
                : status === "demo"
                  ? "Оракул временно недоступен · демо-данные"
                  : "Синхронизация с сетью…"}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

