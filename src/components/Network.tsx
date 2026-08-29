import { motion } from "framer-motion";
import { SectionHeading, HoloCard } from "./ui";

/**
 * The Network — visualisation of the hierarchical federated brain (L0..L3).
 *
 * Every device trains only its local context; gateways sign weight updates;
 * regions aggregate; the global backbone learns the world's patterns. The
 * model proposes, the Policy Engine decides, the DAO governs (C-1..C-7).
 *
 * Numbers are the pilot/demo state; a live network endpoint will feed them.
 */

const LAYERS = [
  {
    level: "L3",
    name: "GLOBAL BACKBONE",
    hint: "hierarchical aggregation · world patterns · no keys, no power",
    nodes: "1",
    metric: "hierFedAvg · daily rounds",
    tone: "text-neon-glow",
    bar: "bg-neon/70",
  },
  {
    level: "L2",
    name: "REGIONAL AGGREGATOR",
    hint: "FedAvg per region · weather + market context",
    nodes: "1",
    metric: "weights f(ERS, samples, loss)",
    tone: "text-cyber-glow",
    bar: "bg-cyber/70",
  },
  {
    level: "L1",
    name: "GATEWAYS",
    hint: "local training + Ed25519-signed contributions",
    nodes: "5",
    metric: "MAD-rejected: 0",
    tone: "text-amber",
    bar: "bg-amber/70",
  },
  {
    level: "L0",
    name: "DEVICES · ESP32",
    hint: "inference + signing in the Secure Element · data never leaves",
    nodes: "1",
    metric: "proofs every 60 s",
    tone: "text-lime",
    bar: "bg-lime/70",
  },
] as const;

export default function Network() {
  return (
    <section id="network" className="relative scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="// The network is the model"
          title="Neural Network"
          accent="Hierarchy"
        />

        <div className="mx-auto mb-8 max-w-2xl text-center font-mono text-xs uppercase tracking-[0.25em] text-slate-500">
          a global model trained by real devices — without their data leaving them
        </div>

        <div className="relative mx-auto max-w-4xl space-y-3">
          {LAYERS.map((layer, i) => (
            <motion.div
              key={layer.level}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: "easeOut" }}
            >
              <HoloCard className="p-5">
                <div className="flex items-center gap-5">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-current/20 font-display text-2xl font-bold ${layer.tone}`}
                  >
                    {layer.level}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-display text-base font-semibold uppercase tracking-wider text-slate-100">
                        {layer.name}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                        {layer.nodes} node{layer.nodes === "1" ? "" : "s"}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-slate-500">
                      {layer.hint}
                    </div>
                  </div>
                  <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                    <div className={`h-1.5 w-24 rounded-full ${layer.bar} animate-pulse`} />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                      {layer.metric}
                    </span>
                  </div>
                </div>
              </HoloCard>
            </motion.div>
          ))}

          {/* Data-flow chevrons between layers */}
          <div className="pointer-events-none flex flex-col items-center gap-1 py-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="font-mono text-cyber/60"
                animate={{ opacity: [0.3, 1, 0.3], y: [0, 2, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5 }}
              >
                ▲ signed contribution
              </motion.span>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { k: "devices", v: "1", label: "producing now" },
            { k: "gateways", v: "5", label: "in simulation" },
            { k: "regions", v: "1", label: "aggregator" },
            { k: "rounds", v: "0", label: "published" },
          ].map((m) => (
            <div
              key={m.k}
              className="rounded-lg border border-neon/10 bg-slate-900/40 px-4 py-3 text-center"
            >
              <div className="font-mono text-2xl font-bold text-neon-glow tabular-nums">{m.v}</div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-500">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
