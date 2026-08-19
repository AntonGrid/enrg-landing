import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "./ui";

const BOOT_STEPS = [
  "ИНИЦИАЛИЗАЦИЯ ЯДРА ENRG",
  "СИНХРОНИЗАЦИЯ RPC · DEVNET",
  "ЗАГРУЗКА ГОЛОГРАФИЧЕСКОГО ИНТЕРФЕЙСА",
];

const BOOT_MS = 2000;

/** Голографический boot-экран при загрузке. */
export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let finish = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / BOOT_MS);
      setProgress(Math.round(t * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        finish = window.setTimeout(onDone, 300);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(finish);
    };
  }, [onDone]);

  const step = BOOT_STEPS[Math.min(BOOT_STEPS.length - 1, Math.floor((progress / 100) * BOOT_STEPS.length))];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void"
      exit={{ opacity: 0, scale: 1.06, filter: "blur(6px)" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      aria-label="Загрузка ENRG"
    >
      {/* фоновые свечения */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyber-deep/20 blur-[100px]" />
      <div className="grid-backdrop grid-backdrop--move" />

      <div className="relative flex flex-col items-center">
        <div className="relative">
          <div
            className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent, rgba(34,211,238,0.4), transparent 30%)",
              animation: "spin-slow 2.4s linear infinite",
            }}
          />
          <Logo size="xl" />
        </div>

        <div className="mt-8 h-px w-72 overflow-hidden bg-line">
          <motion.div
            className="h-full bg-gradient-to-r from-neon via-cyber to-lime"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-neon-soft">
          {step}
          <span className="ml-1 animate-blink">▌</span>
        </div>
        <div className="mt-1 font-mono text-[10px] tracking-widest text-slate-600">
          {progress}% · ENRG v2.0
        </div>
      </div>
    </motion.div>
  );
}
