const TERMS = [
  "SOLANA",
  "ESP32",
  "ED25519",
  "SRC",
  "1 SRC = 1 MWH",
  "PROOF OF PRODUCTION",
  "PWA",
  "RUST",
  "TYPESCRIPT",
  "ON-CHAIN VERIFICATION",
];

function Term() {
  return (
    <>
      {TERMS.map((term) => (
        <span key={term} className="flex items-center gap-14">
          <span className="whitespace-nowrap font-mono text-sm uppercase tracking-[0.35em] text-neon-soft/90 transition-colors hover:text-neon-soft">
            {term}
          </span>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyber/70 animate-pulse" />
        </span>
      ))}
    </>
  );
}

/** Infinite neon ribbon of protocol terms. */
export default function Marquee() {
  return (
    <div className="marquee relative border-y border-neon/10 bg-panel/50 py-5 backdrop-blur-sm">
      <div className="marquee__track" aria-hidden="true">
        <span className="flex items-center gap-14">
          <Term />
        </span>
        <span className="flex items-center gap-14">
          <Term />
        </span>
      </div>
    </div>
  );
}
