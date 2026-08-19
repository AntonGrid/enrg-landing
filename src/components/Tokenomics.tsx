import { motion } from "framer-motion";
import { TOKENOMICS } from "../config";
import { HoloCard, SectionHeading } from "./ui";

function supplyShort(n: number): string {
  return n.toLocaleString("ru-RU");
}

export default function Tokenomics() {
  return (
    <section
      id="tokenomics"
      className="relative scroll-mt-20 border-t border-line py-24 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading kicker="// Экономика" title="Токеномика" accent="SRC" />

        {/* Main facts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <HoloCard className="h-full p-7" glow>
              <div className="flex items-baseline gap-3">
                <span className="holo-text font-mono text-6xl font-bold">{TOKENOMICS.ticker}</span>
              </div>
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-neon-soft">
                {TOKENOMICS.peg}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Токен — экономическое следствие успешной проверки доказательства. Эмиссия
                асимптотическая: сложность выпуска растёт с каждым начислением.
              </p>
            </HoloCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <HoloCard className="h-full p-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Максимальное предложение
              </div>
              <div className="mt-3 font-mono text-3xl font-bold text-cyber-glow tabular-nums sm:text-4xl">
                {supplyShort(TOKENOMICS.maxSupply)}
              </div>
              <div className="mt-1 font-mono text-xs uppercase tracking-[0.25em] text-slate-500">
                SRC · масштаб 9
              </div>

              <div className="mt-6 border-t border-neon/15 pt-6">
                <div className="font-mono text-xs uppercase tracking-widest text-slate-500">
                  Начисления по типу источника
                </div>
                <div className="mt-4 space-y-3">
                  {TOKENOMICS.sourceMultipliers.map((m) => (
                    <div key={m.key} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                        {m.source}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-neon to-cyber"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.value * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-neon-soft">
                        ×{m.value.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </HoloCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <HoloCard className="h-full p-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Распределение начислений
              </div>

              {/* Producer / Protocol split */}
              <div className="mt-5 flex h-8 w-full overflow-hidden rounded-md border border-neon/20 font-mono text-[10px] font-bold uppercase tracking-wider">
                <div
                  className="flex items-center justify-center bg-gradient-to-r from-neon/80 to-neon/40 text-void"
                  style={{ width: `${TOKENOMICS.producerShare}%` }}
                >
                  {TOKENOMICS.producerShare}%
                </div>
                <div
                  className="flex items-center justify-center bg-gradient-to-r from-cyber-deep/80 to-cyber/60 text-white"
                  style={{ width: `${TOKENOMICS.protocolFee}%` }}
                >
                  {TOKENOMICS.protocolFee}%
                </div>
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-slate-500">
                <span>Производителю</span>
                <span>Протокол</span>
              </div>

              {/* Fee split */}
              <div className="mt-6 space-y-3">
                {TOKENOMICS.feeSplit.map((f) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                      {f.label}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: f.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${f.value * 2}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    </div>
                    <span
                      className="w-10 shrink-0 text-right font-mono text-xs tabular-nums"
                      style={{ color: f.color }}
                    >
                      {f.value}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-6 font-mono text-[10px] leading-relaxed uppercase tracking-wider text-slate-600">
                15% протокольного сбора → Buyback · Стейкинг · DAO · Emergency
              </p>
            </HoloCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

