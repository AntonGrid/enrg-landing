// ENRG - DePIN Energy Dashboard - Complete Interactivity Module
// Does NOT modify index.html or style.css - Pure JavaScript implementation
// 
// FEATURES IMPLEMENTED:
// ✅ 1. Metric Counters: Hero metrics animate on page scroll intersection
// ✅ 2. Live Feed: Real-time console messages every 2-5 seconds (max 40 lines)
// ✅ 3. Modal System: Mint modal opens/closes with keyboard & click support
// ✅ 4. Mining Simulation: Energy generation (1-500 kWh), ENRG calculation, fee distribution
// ✅ 5. Smooth Scroll: Navigation links smooth scroll to sections
// ✅ 6. Wallet Connect: Phantom integration with fallback
// ✅ 7. Particle Background: Animated particles with network connections
// ✅ 8. Fade-Up Animations: Scroll-triggered animations for all fade-up elements

(function () {
  'use strict';

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // ---------- Particle Background ----------
  (function initParticles() {
    const canvas = $('#particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const COUNT = 100;
    const MAX_DIST = 140;
    const colors = ['#00E5FF', '#FF6B00'];

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function createParticles() {
      particles = [];
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: rand(-0.3, 0.3),
          vy: rand(-0.3, 0.3),
          r: rand(0.6, 2.2),
          c: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < MAX_DIST) {
            const alpha = 0.25 * (1 - dist / MAX_DIST);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(148,163,184,${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*4);
        gradient.addColorStop(0, p.c);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r*4, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = p.c;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      });
      requestAnimationFrame(draw);
    }

    createParticles();
    draw();
  })();

  // ---------- Fade-Up Scroll Animation ----------
  (function initFadeUp() {
    const els = $$('.fade-up');
    if (!els.length) return;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      els.forEach(el => observer.observe(el));
    } else {
      els.forEach(el => el.classList.add('in-view'));
    }
  })();

  // ---------- Metric Counters (Hero) ----------
  (function initMetrics() {
    const counters = $$('.counter, #producers-counter');
    if (!counters.length) return;

    function animate(el) {
      const rawTarget = el.getAttribute('data-target');
      let target;
      if (rawTarget) {
        target = parseInt(rawTarget, 10);
      } else {
        const textNum = el.textContent.replace(/[^\d]/g, '');
        target = parseInt(textNum, 10) || 0;
      }
      if (!target) return;

      const duration = 1500;
      const startTime = performance.now();
      function step(ts) {
        const progress = Math.min((ts - startTime) / duration, 1);
        el.textContent = Math.floor(progress * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(el => obs.observe(el));
  })();

  // ---------- Live Feed ----------
  (function initLiveFeed() {
    const feed = $('#console-feed');
    if (!feed) return;
    const producers = ['Node-01','SolarRig-12','WindFarm-7B','HydroUnit-3C','Rooftop-Alpha','GridEdge-09'];
    const actions = ['reported','minted','staked','verified','streamed','settled'];
    const units = ['kWh','MWh'];

    function addLine(text) {
      const div = document.createElement('div');
      div.className = 'console-line';
      div.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
      feed.appendChild(div);
      while (feed.children.length > 40) feed.removeChild(feed.firstChild);
      feed.scrollTop = feed.scrollHeight;
    }

    function produce() {
      const prod = producers[Math.floor(Math.random() * producers.length)];
      const act = actions[Math.floor(Math.random() * actions.length)];
      const unit = units[Math.floor(Math.random() * units.length)];
      const value = unit === 'kWh' ? Math.floor(Math.random() * 900 + 5) : (Math.random() * 10 + 0.1).toFixed(1);
      addLine(`${prod} ${act} ${value} ${unit}`);
      setTimeout(produce, Math.floor(Math.random() * 3000) + 2000);
    }

    addLine('Bootstrapping ENRG live feed...');
    setTimeout(produce, 2000);
  })();

  // ---------- Modal ----------
  (function initModal() {
    const modal = $('#mint-modal');
    if (!modal) return;
    const openBtns = ['#btn-start-minting-hero', '#btn-start-minting']
      .map(id => $(id)).filter(Boolean);

    function open() {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      modal.style.display = 'flex';
    }
    function close() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
    }

    openBtns.forEach(btn => btn.addEventListener('click', open));

    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', close);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') close();
    });
  })();

  // ---------- Minting Simulation ----------
  (function initSimulation() {
    const energyBar = $('#sim-energy-bar');
    const enrgBar = $('#sim-enrg-bar');
    const energyVal = $('#sim-energy-value');
    const enrgVal = $('#sim-enrg-value');
    const feed = $('#console-feed');
    const histBody = $('#history-body');

    const sources = [
      { name: 'Solar', mult: 1.0 },
      { name: 'Wind', mult: 0.8 },
      { name: 'Hydro', mult: 0.5 }
    ];

    function animateBar(bar, percent) {
      if (!bar) return;
      bar.style.transition = 'width 0.6s ease';
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
        });
      });
    }

    function appendLog(text) {
      if (!feed) return;
      const div = document.createElement('div');
      div.className = 'console-line';
      div.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
      feed.appendChild(div);
      while (feed.children.length > 40) feed.removeChild(feed.firstChild);
      feed.scrollTop = feed.scrollHeight;
    }

    function appendHistory(kWh, sourceName, enrg) {
      if (!histBody) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${new Date().toLocaleString()}</td><td>${sourceName}</td><td>${kWh} kWh</td><td>${enrg.toFixed(3)} ENRG</td>`;
      histBody.prepend(tr);
      while (histBody.children.length > 20) histBody.removeChild(histBody.lastChild);
    }

    function simulate() {
      const kWh = Math.floor(Math.random() * 500) + 1;
      const src = sources[Math.floor(Math.random() * sources.length)];
      const effective = kWh * src.mult;
      const enrg = effective / 1000;
      const fee = enrg * 0.15;
      const breakdown = {
        'Buyback & Burn': (fee * 0.2).toFixed(3),
        'Staking Rewards': (fee * 0.4).toFixed(3),
        'DAO Reserve': (fee * 0.3).toFixed(3),
        'Emergency Fund': (fee * 0.1).toFixed(3)
      };

      animateBar(energyBar, (kWh / 500) * 100);
      animateBar(enrgBar, (enrg / 0.5) * 100);

      if (energyVal) energyVal.textContent = kWh;
      if (enrgVal) enrgVal.textContent = enrg.toFixed(3);

      const logMsg = `Simulation: ${kWh}kWh (${src.name}, ×${src.mult}) → ${enrg.toFixed(3)} ENRG (Fee: ${fee.toFixed(3)})`;
      appendLog(logMsg);
      console.log('[ENRG Simulation]', { kWh, source: src.name, enrg, fee, breakdown });
      appendHistory(kWh, src.name, enrg);
    }

    ['#btn-simulate-mint', '#btn-simulate-mint-modal']
      .map(id => $(id))
      .filter(Boolean)
      .forEach(btn => btn.addEventListener('click', simulate));
  })();

  // ---------- Smooth Scroll Navigation ----------
  (function initNav() {
    $$('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = $(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    const dashBtn = $('#open-dashboard');
    if (dashBtn) {
      dashBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = $('#dashboard');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }
  })();

  // ---------- Wallet Connect (Phantom) ----------
  (function initWallet() {
    const connectBtn = $('#nav-connect');
    if (!connectBtn) return;

    connectBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (window.solana && window.solana.isPhantom) {
        try {
          const resp = await window.solana.connect();
          alert('Wallet connected: ' + resp.publicKey.toString());
        } catch (err) {
          alert('Connection failed: ' + err.message);
        }
      } else {
        window.open('https://phantom.app/', '_blank');
      }
    });
  })();
})();
