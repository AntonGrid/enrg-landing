import { motion } from "framer-motion";
import { LINKS } from "../config";
import Particles from "./Particles";
import { ExternalIcon } from "./ui";

const INSTALL_STEPS = [
  "Открой Axis Connect в браузере",
  "Нажми «Установить приложение» в меню браузера",
  "Отсканируй QR устройства — всё готово",
];

export default function Cta() {
  return (
    <section id="start" className="relative scroll-mt-20 border-t border-line py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="corner-frame holo-panel relative overflow-hidden rounded-xl px-6 py-14 text-center sm:px-12 sm:py-16"
        >
          <Particles density={0.5} />
          <div className="grid-backdrop" />
          <div className="scan-beam" />

          <div className="relative">
            <span className="badge-neon mb-6">Экосистема Axis · ENRG</span>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-slate-100 sm:text-4xl lg:text-5xl">
              Готовы <span className="holo-text">производить энергию</span>
              <br className="hidden sm:block" /> будущего?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Подключите первое устройство за 10 секунд. Кошелёк, сканирование QR и
              on-chain регистрация — в одном PWA, без установки серверов.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={LINKS.axisConnect}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neon w-full sm:w-auto sm:!px-10 sm:!py-4 sm:!text-base"
              >
                Начать
                <ExternalIcon className="h-5 w-5" />
              </a>
              <a
                href={LINKS.axisConnect}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full sm:w-auto"
              >
                Скачать приложение
                <ExternalIcon className="h-4 w-4" />
              </a>
            </div>

            <div className="mx-auto mt-10 flex max-w-xl flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
              {INSTALL_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neon-soft">{i + 1}.</span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                    {step}
                  </span>
                  {i < INSTALL_STEPS.length - 1 && (
                    <span className="hidden text-slate-700 sm:inline">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
