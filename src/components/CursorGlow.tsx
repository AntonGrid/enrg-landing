import { useEffect, useRef } from "react";

/** Neon glow that follows the cursor (desktop only). */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = `translate3d(${e.clientX - 240}px, ${e.clientY - 240}px, 0)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[2] h-[480px] w-[480px] rounded-full opacity-70 mix-blend-screen transition-transform duration-300 ease-out"
      style={{
        background:
          "radial-gradient(circle, rgba(0,229,255,0.22) 0%, rgba(139,92,246,0.12) 35%, transparent 70%)",
      }}
    />
  );
}
