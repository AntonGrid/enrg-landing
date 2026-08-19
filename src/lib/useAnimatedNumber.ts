import { useEffect, useRef, useState } from "react";

/**
 * Animated number: smoothly "catches up" to `value` when it changes.
 * Supports integer and fractional values.
 */
export function useAnimatedNumber(value: number, durationMs = 1200): number {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(from + (value - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, durationMs]);

  return display;
}

/** Format an integer with thousand separators (1 234 567). */
export function formatInt(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}
