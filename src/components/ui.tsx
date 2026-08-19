import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Заголовок секции с неоновой линией. */
export function SectionHeading({
  kicker,
  title,
  accent,
}: {
  kicker: string;
  title: string;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto mb-14 max-w-3xl text-center"
    >
      <span className="badge-neon mb-4">{kicker}</span>
      <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight text-slate-100 sm:text-4xl lg:text-5xl">
        {title} {accent ? <span className="holo-text">{accent}</span> : null}
      </h2>
      <div className="mx-auto mt-6 h-px w-40 bg-gradient-to-r from-transparent via-neon/70 to-transparent" />
    </motion.div>
  );
}

/** Неоновая панель-карточка с угловыми рамками. */
export function HoloCard({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`corner-frame relative holo-panel rounded-lg ${glow ? "holo-panel--glow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/** Мерцающий индикатор статуса (LIVE / DEMO / SYNC). */
export function StatusChip({
  tone,
  label,
}: {
  tone: "live" | "demo" | "sync";
  label: string;
}) {
  const color =
    tone === "live"
      ? "text-lime border-lime/40 bg-lime/5"
      : tone === "demo"
        ? "text-amber border-amber/40 bg-amber/5"
        : "text-neon-soft border-neon/40 bg-neon/5";
  const dot =
    tone === "live"
      ? "bg-lime"
      : tone === "demo"
        ? "bg-amber"
        : "bg-neon-soft animate-blink";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/** Ссылка «в новый таб». */
export function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

/** Иконка «внешняя ссылка». */
export function ExternalIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

/** Логотип ENRG (голографический текст). */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "xl" }) {
  const textSize =
    size === "xl" ? "text-7xl sm:text-8xl lg:text-9xl" : size === "md" ? "text-3xl" : "text-xl";
  return (
    <span
      className={`holo-text font-display font-bold uppercase tracking-[0.18em] ${textSize} ${size === "xl" ? "animate-flicker" : ""}`}
    >
      ENRG
    </span>
  );
}
