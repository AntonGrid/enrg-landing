/** Energy core reactor behind the ENRG logo. */
export default function EnergyCore() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[32%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 sm:h-[680px] sm:w-[680px]"
      aria-hidden="true"
    >
      {/* Pulsing core */}
      <div
        className="absolute left-1/2 top-1/2 h-28 w-28"
        style={{
          transform: "translate(-50%, -50%)",
          borderRadius: "9999px",
          background:
            "radial-gradient(circle, rgba(150,247,255,0.95), rgba(0,229,255,0.5) 45%, transparent 70%)",
          boxShadow:
            "0 0 50px 12px rgba(0,229,255,0.55), 0 0 120px 40px rgba(139,92,246,0.3)",
          animation: "core-pulse 3s ease-in-out infinite",
        }}
      />

      {/* Outer conic glow */}
      <div
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] sm:h-[520px] sm:w-[520px]"
        style={{
          transform: "translate(-50%, -50%)",
          borderRadius: "9999px",
          background:
            "conic-gradient(from 0deg, transparent, rgba(0,229,255,0.55), transparent 28%)",
          animation: "spin-slow 8s linear infinite",
          filter: "blur(5px)",
          WebkitMaskImage: "radial-gradient(circle, transparent 42%, black 64%)",
          maskImage: "radial-gradient(circle, transparent 42%, black 64%)",
        }}
      />

      {/* Orbit 1: satellite on the ring */}
      <div
        className="absolute left-1/2 top-1/2 h-[340px] w-[340px] sm:h-[420px] sm:w-[420px]"
        style={{
          transform: "translate(-50%, -50%)",
          borderRadius: "9999px",
          border: "1px solid rgba(150,247,255,0.5)",
          animation: "spin-slow 12s linear infinite",
        }}
      >
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-neon-soft shadow-[0_0_14px_rgba(150,247,255,1)]" />
      </div>

      {/* Orbit 2: dashed, reversed */}
      <div
        className="absolute left-1/2 top-1/2 h-[250px] w-[250px] sm:h-[300px] sm:w-[300px]"
        style={{
          transform: "translate(-50%, -50%)",
          borderRadius: "9999px",
          border: "1.5px dashed rgba(196,176,255,0.65)",
          animation: "spin-slow 18s linear infinite reverse",
        }}
      >
        <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-cyber shadow-[0_0_14px_rgba(196,176,255,1)]" />
      </div>

      {/* Tiny orbital satellites */}
      <div
        className="absolute left-1/2 top-1/2 h-[480px] w-[480px] sm:h-[600px] sm:w-[600px]"
        style={{
          transform: "translate(-50%, -50%)",
          borderRadius: "9999px",
          animation: "spin-slow 26s linear infinite",
        }}
      >
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-lime/90 shadow-[0_0_10px_rgba(183,243,84,0.95)]" />
        <span className="absolute bottom-8 left-3 h-1 w-1 rounded-full bg-neon-soft/80" />
      </div>
    </div>
  );
}
