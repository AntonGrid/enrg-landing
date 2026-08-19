import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: string;
  alpha: number;
}

/**
 * Background particle network (canvas).
 * Lightweight: ~60 particles on desktop, links between neighbors, neon palette
 * cyan/violet. Fully disabled with prefers-reduced-motion.
 */
export default function Particles({ density = 1 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let mouseX = -9999;
    let mouseY = -9999;

    const colors = ["34,211,238", "167,139,250", "163,230,53"];

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(90, Math.max(28, Math.floor((width * height) / 22000) * density));
      particles = Array.from({ length: count }, () => {
        const hue = colors[Math.floor(Math.random() * colors.length)];
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1 + Math.random() * 1.8,
          hue,
          alpha: 0.35 + Math.random() * 0.5,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Cursor: gentle repulsion when close
        const mdx = p.x - mouseX;
        const mdy = p.y - mouseY;
        const md2 = mdx * mdx + mdy * mdy;
        if (md2 < 3600 && md2 > 0.01) {
          const dist = Math.sqrt(md2);
          const force = (60 - dist) / 60;
          p.x += (mdx / dist) * force * 1.6;
          p.y += (mdy / dist) * force * 1.6;
        }

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      }

      // Links between particles
      const linkDist = 130;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            const alpha = (1 - Math.sqrt(d2) / linkDist) * 0.14;
            ctx.strokeStyle = `rgba(103,232,249,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Links to the cursor
      const mouseLink = 170;
      for (const p of particles) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const d2 = dx * dx + dy * dy;
        if (d2 < mouseLink * mouseLink) {
          const alpha = (1 - Math.sqrt(d2) / mouseLink) * 0.2;
          ctx.strokeStyle = `rgba(167,139,250,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }
      }

      // Dots
      for (const p of particles) {
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        glow.addColorStop(0, `rgba(${p.hue},${p.alpha})`);
        glow.addColorStop(1, `rgba(${p.hue},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      build();
      if (reduceMotion) {
        // static frame
        ctx.clearRect(0, 0, width, height);
        for (const p of particles) {
          ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    build();
    if (reduceMotion) {
      onResize();
    } else {
      raf = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
