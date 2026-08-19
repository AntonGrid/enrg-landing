import { motion } from "framer-motion";
import { LINKS } from "../config";
import { ExternalIcon, HoloCard, SectionHeading } from "./ui";

const STEPS = [
  {
    num: "01",
    title: "Подключи",
    desc: "Отсканируй QR энерго-устройства в Axis Connect. Некастодиальный кошелёк создаётся локально за 10 секунд — ничего не нужно устанавливать.",
    tags: ["QR", "PWA", "Ed25519"],
    color: "text-neon-soft",
  },
  {
    num: "02",
    title: "Докажи",
    desc: "Прошивка ESP32 подписывает показания энергии каждые N минут. Доказательства проверяются on-chain через публичный реестр устройств.",
    tags: ["PoP", "ESP32", "Anchor"],
    color: "text-cyber",
  },
  {
    num: "03",
    title: "Зарабатывай",
    desc: "Верифицированная выработка накапливается и конвертируется в SRC по курсу 1 SRC = 1 МВт·ч. 85% — тебе, 15% — в протокол.",
    tags: ["SRC", "85%", "Staking"],
    color: "text-lime",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-20 border-t border-line py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker="// Протокол" title="Как это" accent="работает" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.14, ease: "easeOut" }}
            >
              <HoloCard className="group h-full p-7 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-4xl font-bold tracking-tight ${step.color} [text-shadow:0_0_18px_rgba(103,232,249,0.35)]`}>
                    {step.num}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-600">
                    STEP
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold uppercase tracking-wider text-slate-100">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{step.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-neon/20 bg-neon/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-neon-soft"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </HoloCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <a
            href={LINKS.axisConnect}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon"
          >
            Начать с первого шага
            <ExternalIcon className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
