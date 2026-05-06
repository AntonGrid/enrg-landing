// script.js
// ENRG – DePIN Energy Command Center interactivity
// Only uses existing HTML structure and IDs/classes as in index.html

(function () {
  'use strict';

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const formatNumber = (value, decimals = 0) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const nowTime = () => new Date().toLocaleTimeString();

  // ---------- Metric Counters (hero section) ----------
  function initMetricCounters() {
    const counters = $$('.counter');
    const producersCounter = $('#producers-counter');
    const allCounters = [...counters, producersCounter].filter(Boolean);

    if (!allCounters.length) return;

    const animateCounter = (el) => {
      const targetAttr = el.getAttribute('data-target');
      let target = targetAttr ? Number(targetAttr) : 0;
      if (!target) {
        const raw = el.textContent || '0';
        target = Number(raw.replace(/[^\d.]/g, '')) || 0;
      }
      const duration = 1500;
      const start = 0;
      const startTime = performance.now();

      function step(ts) {
        const progress = Math.min(1, (ts - startTime) / duration);
        const value = start + (target - start) * progress;
        el.textContent = formatNumber(value, 0);
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      allCounters.forEach((el) => observer.observe(el));
    } else {
      allCounters.forEach(animateCounter);
    }
  }

  // ---------- Live Feed (right panel console) ----------
  function initLiveFeed() {
    const feed = $('#console-feed');
    if (!feed) return;

    const producers = ['Node-01', 'SolarRig-12', 'WindFarm-7B', 'HydroUnit-3C', 'Rooftop-Alpha', 'GridEdge-09'];
    const actions = ['reported', 'minted', 'staked', 'verified', 'streamed', 'settled'];
    const units = ['kWh', 'MWh'];

    function appendFeedLine(text) {
      const line = document.createElement('div');
      line.className = 'console-line';
      line.textContent = `[${nowTime()}] ${text}`;
      feed.appendChild(line);

      while (feed.children.length > 40) {
        feed.removeChild(feed.firstChild);
      }

      feed.scrollTop = feed.scrollHeight;
    }

    function generateMessage() {
      const producer = producers[randInt(0, producers.length - 1)];
      const action = actions[randInt(0, actions.length - 1)];
      const unit = units[randInt(0, units.length - 1)];
      const value = unit === 'kWh' ? randInt(5, 900) : (randInt(1, 40) / 10).toFixed(1);
      return `${producer} ${action} ${value} ${unit}`;
    }

    function scheduleNext() {
      const delay = randInt(2000, 5000);
      setTimeout(() => {
        appendFeedLine(generateMessage());
        scheduleNext();
      }, delay);
    }

    // Seed with a couple of lines
    appendFeedLine('Bootstrapping ENRG live feed...');
    appendFeedLine('Oracle connection established. Listening for energy proofs...');
    scheduleNext();
  }

  // ---------- Modal (Minting Demo) ----------
  function initModal() {
    const modalBackdrop = $('#mint-modal');
    if (!modalBackdrop) return;

    const modal = modalBackdrop.querySelector('.modal');
    const closeBtn = $('#mint-modal-close');
    const heroStartBtn = $('#btn-start-minting-hero');
    const mintSectionStartBtn = $('#btn-start-minting');

    const openTriggers = [heroStartBtn, mintSectionStartBtn].filter(Boolean);

    const openModal = () => {
      modalBackdrop.classList.add('active');
      modalBackdrop.setAttribute('aria-hidden', 'false');
      modalBackdrop.style.display = 'flex';
    };

    const closeModal = () => {
      modalBackdrop.classList.remove('active');
      modalBackdrop.setAttribute('aria-hidden', 'true');
      modalBackdrop.style.display = 'none';
    };

    openTriggers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    }

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });
  }

  // ---------- Minting Simulation ----------
  function initMintSimulation() {
    const energyBar = $('#sim-energy-bar');
    const enrgBar = $('#sim-enrg-bar');
    const energyValueEl = $('#sim-energy-value');
    const enrgValueEl = $('#sim-enrg-value');
    const consoleFeed = $('#console-feed');
    const historyBody = $('#history-body');

    const btnSimMintMain = $('#btn-simulate-mint');
    const btnSimMintModal = $('#btn-simulate-mint-modal');

    const simTriggers = [btnSimMintMain, btnSimMintModal].filter(Boolean);

    const sources = [
      { name: 'Solar', multiplier: 1.0 },
      { name: 'Wind', multiplier: 0.8 },
      { name: 'Hydro', multiplier: 0.5 },
    ];

    function animateBar(el, targetPercent) {
      if (!el) return;
      el.style.transition = 'width 0.8s ease-out';
      el.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.width = `${Math.max(0, Math.min(100, targetPercent))}%`;
        });
      });
    }

    function appendConsoleLog(text) {
      if (!consoleFeed) {
        console.log('[ENRG]', text);
        return;
      }
      const line = document.createElement('div');
      line.className = 'console-line';
      line.textContent = `[${nowTime()}] ${text}`;
      consoleFeed.appendChild(line);
      while (consoleFeed.children.length > 40) {
        consoleFeed.removeChild(consoleFeed.firstChild);
      }
      consoleFeed.scrollTop = consoleFeed.scrollHeight;
    }

    function appendHistoryRow(timestamp, producer, energy, enrg) {
      if (!historyBody) return;
      const tr = document.createElement('tr');
      const tdTime = document.createElement('td');
      const tdProd = document.createElement('td');
      const tdEnergy = document.createElement('td');
      const tdEnrg = document.createElement('td');

      tdTime.textContent = timestamp;
      tdProd.textContent = producer;
      tdEnergy.textContent = `${formatNumber(energy, 0)} kWh`;
      tdEnrg.textContent = `${formatNumber(enrg, 3)} ENRG`;

      tr.appendChild(tdTime);
      tr.appendChild(tdProd);
      tr.appendChild(tdEnergy);
      tr.appendChild(tdEnrg);

      historyBody.insertBefore(tr, historyBody.firstChild);
      while (historyBody.children.length > 50) {
        historyBody.removeChild(historyBody.lastChild);
      }
    }

    function runSimulation() {
      const energyKwh = randInt(1, 500);
      const source = sources[randInt(0, sources.length - 1)];
      const effectiveEnergy = energyKwh * source.multiplier;
      const enrgMinted = effectiveEnergy / 1000;
      const enrgMintedRounded = Number(enrgMinted.toFixed(3));
      const protocolFee = enrgMintedRounded * 0.15;

      const feeBuyback = protocolFee * 0.2;
      const feeStaking = protocolFee * 0.4;
      const feeDao = protocolFee * 0.3;
      const feeEmergency = protocolFee * 0.1;

      const energyPercent = (energyKwh / 500) * 100;
      const enrgPercent = (enrgMintedRounded / 0.5) * 100;

      animateBar(energyBar, energyPercent);
      animateBar(enrgBar, enrgPercent);

      if (energyValueEl) energyValueEl.textContent = formatNumber(energyKwh, 0);
      if (enrgValueEl) enrgValueEl.textContent = formatNumber(enrgMintedRounded, 3);

      const summary = `Simulated ${energyKwh} kWh (${source.name}, x${source.multiplier}) → ${enrgMintedRounded.toFixed(
        3
      )} ENRG, fee ${protocolFee.toFixed(3)} ENRG`;
      appendConsoleLog(summary);

      console.log('[ENRG Mint Simulation]');
      console.log('Energy (kWh):', energyKwh);
      console.log('Source:', source.name, 'Multiplier:', source.multiplier);
      console.log('Effective energy (kWh):', effectiveEnergy);
      console.log('ENRG minted:', enrgMintedRounded);
      console.log('Protocol fee (15%):', protocolFee.toFixed(3));
      console.log('Fee breakdown:');
      console.log('  Buyback & Burn (20%):', feeBuyback.toFixed(3));
      console.log('  Staking Rewards (40%):', feeStaking.toFixed(3));
      console.log('  DAO Reserve (30%):', feeDao.toFixed(3));
      console.log('  Emergency Fund (10%):', feeEmergency.toFixed(3));

      appendHistoryRow(new Date().toISOString(), source.name, energyKwh, enrgMintedRounded);
    }

    simTriggers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        runSimulation();
      });
    });
  }

  // ---------- Navigation (smooth scroll) ----------
  function initNavigation() {
    const navLinks = $$('.nav-link[href^="#"]');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = $(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    const dashboardSection = $('#dashboard');
    const dashboardButtons = [$('#btn-start-minting'), $('#btn-start-minting-hero')].filter(Boolean);
    dashboardButtons.forEach((btn) => {
      btn.addEventListener('dblclick', (e) => {
        if (!dashboardSection) return;
        e.preventDefault();
        dashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ---------- Wallet Connect ----------
  function initWalletConnect() {
    const connectButtons = [
      $('#btn-get-started'),
      $('#btn-contact'),
      $('#btn-become-partner'),
    ].filter(Boolean);

    async function connectPhantom() {
      const provider = window.solana;
      if (provider && provider.isPhantom) {
        try {
          const res = await provider.connect();
          const pubkey = (res && res.publicKey && res.publicKey.toString()) || 'Unknown public key';
          alert(`Phantom wallet connected:\n${pubkey}`);
          console.log('[ENRG] Phantom wallet connected:', pubkey);
        } catch (err) {
          console.error('[ENRG] Phantom connection rejected or failed', err);
          alert('Phantom connection was rejected or failed.');
        }
      } else {
        window.open('https://phantom.app/', '_blank', 'noopener');
      }
    }

    connectButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        connectPhantom();
      });
    });
  }

  // ---------- Particles Background ----------
  function initParticles() {
    const canvas = $('#particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const PARTICLE_COUNT = 80;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    function step() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00E5FF';

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(step);
    }

    step();
  }

  // ---------- Fade-up scroll animations (preserve) ----------
  function initFadeUp() {
    const fadeEls = $$('.fade-up');
    if (!fadeEls.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      fadeEls.forEach((el) => observer.observe(el));
    } else {
      fadeEls.forEach((el) => el.classList.add('in-view'));
    }
  }

  // ---------- Init on DOMContentLoaded ----------
  document.addEventListener('DOMContentLoaded', () => {
    initMetricCounters();
    initLiveFeed();
    initModal();
    initMintSimulation();
    initNavigation();
    initWalletConnect();
    initParticles();
    initFadeUp();
  });
})();
