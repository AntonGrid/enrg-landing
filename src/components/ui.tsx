import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
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
      <span className="badge-neon mb-4 animate-flicker">{kicker}</span>
      <h2 className="heading-scan title-glow mt-4 font-display text-3xl font-bold uppercase tracking-tight text-slate-100 sm:text-4xl lg:text-5xl">
        {title} {accent ? <span className="holo-text">{accent}</span> : null}
      </h2>
      <div className="neon-divider mx-auto mt-6 w-40" />
    </motion.div>
  );
}

/** Неоновая панель-карточка: свечение + бегущая рамка на hover + опциональный 3D-tilt. */
export function HoloCard({
  children,
  className = "",
  glow = false,
  tilt = false,
  tiltMax = 5,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  tilt?: boolean;
  tiltMax?: number;
}) {
  const card = (
    <div
      className={`border-flow corner-frame relative holo-panel rounded-lg transition-transform duration-300 hover:-translate-y-1.5 ${glow ? "holo-panel--glow" : ""} ${className}`}
    >
      {children}
    </div>
  );
  if (!tilt) return card;
  return (
    <TiltCard max={tiltMax} className="h-full">
      {card}
    </TiltCard>
  );
}

/** Неоновая кнопка-ссылка (основной/ghost вариант). */
export function NeonLink({
  href,
  children,
  variant = "neon",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "neon" | "ghost";
  className?: string;
}) {
  const isExternal = href.startsWith("http");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={`${variant === "neon" ? "btn-neon" : "btn-ghost"} ${className}`}
    >
      {children}
    </a>
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

/** 3D-наклон за курсором (desktop + no-reduced-motion). */
export function TiltCard({
  children,
  className = "",
  max = 8,
  scale = 1.02,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
}) {
  const [enabled, setEnabled] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const s = useSpring(1, { stiffness: 220, damping: 18 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduce);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
    s.set(scale);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    s.set(1);
  };

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, scale: s, transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Логотип ENRG (голографический текст + RGB-глитч). */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "xl" }) {
  const textSize =
    size === "xl" ? "text-7xl sm:text-8xl lg:text-9xl" : size === "md" ? "text-3xl" : "text-xl";
  return (
    <span
      className={`holo-text font-display font-bold uppercase tracking-[0.18em] ${textSize} ${size === "xl" ? "rgb-split" : ""}`}
    >
      ENRG
    </span>
  );
}
