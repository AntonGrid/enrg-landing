import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { SectionHeading } from "./ui";

function SolanaLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M4.9 17.2h11.7c.3 0 .5.2.7.4l2.2 2.4c.2.2.1.6-.3.6H7.5c-.3 0-.5-.2-.7-.4L4.6 17.8c-.2-.2-.1-.6.3-.6zm.9-6.3h11.7c.3 0 .5.2.7.4l2.2 2.4c.2.2.1.6-.3.6H8.4c-.3 0-.5-.2-.7-.4l-2.2-2.4c-.2-.2-.1-.6.3-.6zM6.4 6.6c-.3 0-.5-.2-.7-.4L4 4.2c-.2-.2-.1-.6.3-.6h11.6c.3 0 .5.2.7.4l2.2 2.4c.2.2.1.6-.3.6H6.4z" />
    </svg>
  );
}

function ChipIcon({ label }: { label: string }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded border border-neon/25 bg-neon/5 font-mono text-[13px] font-bold text-neon-soft">
      {label}
    </span>
  );
}

const PARTNERS: { name: string; tag: string; icon: ReactNode }[] = [
  {
    name: "Solana",
    tag: "первая референсная реализация",
    icon: <SolanaLogo />,
  },
  { name: "ESP32", tag: "железо · Ed25519 · PZEM-004T", icon: <ChipIcon label="32" /> },
  { name: "Rust", tag: "смарт-контракты · Anchor", icon: <ChipIcon label="Rs" /> },
  { name: "TypeScript", tag: "PWA · оракул · SDK", icon: <ChipIcon label="TS" /> },
];

export default function Partners() {
  return (
    <section id="partners" className="relative scroll-mt-20 border-t border-line py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker="// Стек" title="Построено на" accent="открытых стандартах" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNERS.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: "easeOut" }}
              className="group flex items-center gap-4 rounded-lg border border-line bg-panel/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-neon/40 hover:shadow-[0_0_24px_rgba(34,211,238,0.15)]"
            >
              <span className="text-neon-soft transition-transform duration-300 group-hover:scale-110">
                {partner.icon}
              </span>
              <span>
                <span className="block font-display text-lg font-bold uppercase tracking-wider text-slate-100">
                  {partner.name}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  {partner.tag}
                </span>
              </span>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-slate-600"
        >
          Протокол определяет поведение, а не конкретную реализацию
        </motion.p>
      </div>
    </section>
  );
}
