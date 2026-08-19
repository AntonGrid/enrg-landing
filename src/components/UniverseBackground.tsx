import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number; // depth 0..1 (parallax + size)
  r: number;
  hue: string; // "r,g,b"
  twinkle: number;
  twinkleSpeed: number;
}

interface Nebula {
  x: number;
  y: number;
  r: number;
  hue: string;
  alpha: number;
  dx: number;
  dy: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface GalaxyDot {
  angle: number;
  radius: number;
  hue: string;
  size: number;
}

const COLORS = ["150,247,255", "196,176,255", "183,243,84", "255,255,255"];

/**
 * Moving neon universe background (canvas):
 * - 3 depth layers of twinkling stars drifting with parallax
 * - drifting nebula clouds (cyan / violet / lime)
 * - a slowly rotating spiral galaxy with a glowing core
 * - occasional shooting stars
 * Animation is disabled under prefers-reduced-motion (static frame).
 */
export default function UniverseBackground({ density = 1 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let width = 0;
    let height = 0;
    let t = 0;

    const stars: Star[] = [];
    const nebulae: Nebula[] = [];
    const meteors: Meteor[] = [];
    let galaxy: GalaxyDot[] = [];

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Stars
      const count = Math.floor((width * height) / 6500) * density;
      stars.length = 0;
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random(),
          r: 0.5 + Math.random() * 1.5,
          hue: COLORS[Math.floor(Math.random() * COLORS.length)],
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.5 + Math.random() * 1.6,
        });
      }

      // Nebulae
      nebulae.length = 0;
      const nebDefs = [
        { hue: "0,229,255", alpha: 0.24, r: 0.48 },
        { hue: "139,92,246", alpha: 0.28, r: 0.52 },
        { hue: "183,243,84", alpha: 0.13, r: 0.42 },
      ];
      for (const def of nebDefs) {
        nebulae.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.max(width, height) * def.r,
          hue: def.hue,
          alpha: def.alpha,
          dx: (Math.random() - 0.5) * 0.18,
          dy: (Math.random() - 0.5) * 0.18,
        });
      }

      // Spiral galaxy
      galaxy = [];
      const arms = 3;
      const dots = 300;
      for (let i = 0; i < dots; i++) {
        const arm = i % arms;
        const progress = (i / dots) * 7 + arm * (7 / arms);
        galaxy.push({
          angle: progress * 0.9 + arm * ((Math.PI * 2) / arms),
          radius: Math.pow(progress, 1.6) * 24,
          hue: COLORS[i % 2 === 0 ? 0 : 1],
          size: 0.7 + Math.random() * 1.7,
        });
      }
    };
    const render = (dt: number) => {
      t += dt;
      ctx.clearRect(0, 0, width, height);

      // Nebulae (soft clouds)
      for (const neb of nebulae) {
        neb.x += neb.dx;
        neb.y += neb.dy;
        if (neb.x < -neb.r) neb.x = width + neb.r;
        if (neb.x > width + neb.r) neb.x = -neb.r;
        if (neb.y < -neb.r) neb.y = height + neb.r;
        if (neb.y > height + neb.r) neb.y = -neb.r;

        const g = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r);
        g.addColorStop(0, `rgba(${neb.hue},${neb.alpha})`);
        g.addColorStop(1, `rgba(${neb.hue},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }

      // Spiral galaxy (slow rotation)
      const gx = width * 0.84;
      const gy = height * 0.16;
      const maxR = Math.max(width, height) * 0.24;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(t * 0.05);
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, maxR * 0.55);
      core.addColorStop(0, "rgba(196,176,255,0.55)");
      core.addColorStop(0.3, "rgba(139,92,246,0.2)");
      core.addColorStop(1, "rgba(139,92,246,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, maxR * 0.55, 0, Math.PI * 2);
      ctx.fill();
      for (const dot of galaxy) {
        const rad = Math.min(dot.radius, maxR);
        const x = Math.cos(dot.angle) * rad;
        const y = Math.sin(dot.angle) * rad;
        ctx.fillStyle = `rgba(${dot.hue},0.8)`;
        ctx.beginPath();
        ctx.arc(x, y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Stars: parallax drift + twinkle + glow
      for (const s of stars) {
        s.x -= 0.05 + s.z * 0.4;
        s.y += Math.sin(t * 0.4 + s.twinkle) * 0.015;
        if (s.x < -2) {
          s.x = width + 2;
          s.y = Math.random() * height;
        }
        const tw = 0.4 + 0.6 * Math.sin(t * s.twinkleSpeed + s.twinkle);
        ctx.fillStyle = `rgba(${s.hue},${tw * 0.95})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (0.6 + s.z), 0, Math.PI * 2);
        ctx.fill();
        if (s.z > 0.78) {
          const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 7);
          glow.addColorStop(0, `rgba(${s.hue},${tw * 0.4})`);
          glow.addColorStop(1, `rgba(${s.hue},0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Shooting stars
      if (Math.random() < 0.01 && meteors.length < 3) {
        meteors.push({
          x: Math.random() > 0.5 ? -40 : Math.random() * width,
          y: Math.random() > 0.5 ? Math.random() * height * 0.5 : -40,
          vx: 7 + Math.random() * 6,
          vy: 4 + Math.random() * 4,
          life: 1,
        });
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.012;
        if (m.life <= 0 || m.x > width + 80 || m.y > height + 80) {
          meteors.splice(i, 1);
          continue;
        }
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
        grad.addColorStop(0, `rgba(150,247,255,${m.life})`);
        grad.addColorStop(1, "rgba(150,247,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9);
        ctx.stroke();
      }
    };

    const loop = () => {
      render(0.016);
      raf = requestAnimationFrame(loop);
    };

    const onResize = () => build();

    build();
    if (reduceMotion) {
      render(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}

