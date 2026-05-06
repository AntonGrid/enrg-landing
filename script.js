// script.js
// ENRG interactive behaviors — single-file enhancement
// Rules followed: no HTML/CSS changes, only JS; uses existing IDs/classes when present.
// Author: Copied logic tailored to the repository structure described by the user.

// Immediately-invoked function to avoid polluting global scope
(function () {
  'use strict';

  /* -------------------------
     Utility helpers
     -------------------------*/
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const safeText = (el, txt) => { if (el) el.textContent = txt; };
  const parseNumberFromText = (txt) => {
    if (!txt) return 0;
    const n = txt.replace(/[^\d\.\-]/g, '');
    return n === '' ? 0 : Number(n);
  };

  /* -------------------------
     Modal open/close logic
     -------------------------*/
  const modal = $('#mint-modal') || null;
  const startMintBtn = $('#start-mint') || $('#open-mint-modal') || null;
  const openMintTriggers = [];
  if (startMintBtn) openMintTriggers.push(startMintBtn);
  // also any button with data-open-mint or class open-mint (defensive)
  $$('[data-open-mint], .open-mint').forEach((el) => openMintTriggers.push(el));

  function isModalVisible() {
    if (!modal) return false;
    const style = window.getComputedStyle(modal);
    return style && style.display !== 'none' && modal.getAttribute('aria-hidden') !== 'true';
  }

  function openModal() {
    if (!modal) return;
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    // focus first focusable element inside modal if any
    const focusable = modal.querySelector('button, a, input, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
    // start a short simulation automatically when modal opens
    startMintSimulationOnce();
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }

  // Attach open handlers
  openMintTriggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Close handlers: close button, click outside, Escape
  if (modal) {
    modal.addEventListener('click', (e) => {
      // click on close button
      const closeBtn = modal.querySelector('.modal-close');
      if (e.target === closeBtn) {
        closeModal();
        return;
      }
      // click outside modal-content closes it
      const content = modal.querySelector('.modal-content');
      if (content && !content.contains(e.target) && e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isModalVisible()) {
        closeModal();
      }
    });
  }

  /* -------------------------
     Mint simulation
     -------------------------*/
  // We must not create new HTML elements. We'll use existing modal-body or live-feed to show logs.
  const modalBody = modal ? modal.querySelector('.modal-body') : null;
  const liveFeed = $('#live-feed') || null;

  // Guard: if neither modalBody nor liveFeed exist, we will still log to console.
  function appendLog(targetEl, text) {
    if (!targetEl) {
      // fallback to console
      console.log('[ENRG SIM]', text);
      return;
    }
    // Append as a text node with newline separation to avoid creating new element nodes.
    // We will preserve existing markup by adding a text node at the end.
    const time = new Date().toLocaleTimeString();
    const node = document.createTextNode(`[${time}] ${text}\n`);
    targetEl.appendChild(node);
    // Keep scroll at bottom if element is scrollable
    if (targetEl.scrollHeight) {
      targetEl.scrollTop = targetEl.scrollHeight;
    }
  }

  // Simulation state
  let simRunning = false;
  let simOnceTriggered = false;

  function generateRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function formatNumber(n, decimals = 0) {
    if (decimals === 0) return Math.round(n).toLocaleString();
    return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function computeEnrg(energyKwh, multiplier) {
    // simple formula: ENRG = energyKwh * multiplier
    return energyKwh * multiplier;
  }

  function computeFee(enrgAmount) {
    // simple fee model: 0.5% + small fixed
    return enrgAmount * 0.005 + 0.1;
  }

  function animateTextValue(el, start, end, duration = 900, decimals = 0, suffix = '') {
    if (!el) return;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const val = start + (end - start) * t;
      el.textContent = formatNumber(val, decimals) + (suffix || '');
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function runSimulationCycle() {
    // generate random energy between 0.5 and 5.0 kWh for a short demo
    const energy = (Math.random() * 4.5) + 0.5; // kWh
    // multiplier based on device type (random 0.8..1.6)
    const multiplier = (Math.random() * 0.8) + 0.8;
    const enrg = computeEnrg(energy, multiplier);
    const fee = computeFee(enrg);

    // Log to modal-body and live-feed
    const summary = `Simulated: ${formatNumber(energy, 2)} kWh × ${multiplier.toFixed(2)} → ${formatNumber(enrg, 2)} ENRG (fee ${formatNumber(fee, 2)} ENRG)`;
    appendLog(modalBody || liveFeed, summary);
    appendLog(liveFeed, `Producer reported ${formatNumber(energy,2)} kWh`);

    // Animate any metric displays inside modal-body or live-feed if present
    // We will try to find elements with ids used for simulation bars; if not present, we update text only.
    const simEnergyBar = $('#sim-energy-bar');
    const simEnrgBar = $('#sim-enrg-bar');

    if (simEnergyBar && simEnergyBar.style) {
      // animate width from 0 to some percent proportional to energy (cap at 100)
      const pct = Math.min(100, Math.round((energy / 5) * 100));
      simEnergyBar.style.transition = 'width 800ms ease';
      simEnergyBar.style.width = pct + '%';
    } else {
      // fallback: write a short line in modalBody
      appendLog(modalBody, `Energy progress: ${Math.round(Math.min(100, (energy / 5) * 100))}%`);
    }

    if (simEnrgBar && simEnrgBar.style) {
      const pct2 = Math.min(100, Math.round((enrg / 10) * 100));
      simEnrgBar.style.transition = 'width 900ms ease';
      simEnrgBar.style.width = pct2 + '%';
    } else {
      appendLog(modalBody, `ENRG progress: ${Math.round(Math.min(100, (enrg / 10) * 100))}%`);
    }

    // Optionally animate hero metrics slightly to reflect new totals (non-destructive)
    const metricEnergyEl = $('#metric-energy');
    const metricProducersEl = $('#metric-producers');
    const metricStakedEl = $('#metric-staked');

    if (metricEnergyEl) {
      // parse current displayed value and add simulated energy to it (visually)
      const current = parseNumberFromText(metricEnergyEl.textContent);
      animateTextValue(metricEnergyEl, current, current + energy, 1200, 2, ' kWh');
    }
    if (metricProducersEl) {
      const current = parseNumberFromText(metricProducersEl.textContent);
      // occasionally increment producers
      if (Math.random() > 0.85) {
        animateTextValue(metricProducersEl, current, current + 1, 800, 0, '');
      }
    }
    if (metricStakedEl) {
      const current = parseNumberFromText(metricStakedEl.textContent);
      animateTextValue(metricStakedEl, current, current + enrg - fee, 1200, 2, ' ENRG');
    }
  }

  // Start a repeating simulation while modal is open
  let simInterval = null;
  function startSimulation() {
    if (simRunning) return;
    simRunning = true;
    // run an immediate cycle
    runSimulationCycle();
    simInterval = setInterval(() => {
      runSimulationCycle();
    }, 2500 + Math.random() * 2000);
  }

  function stopSimulation() {
    simRunning = false;
    if (simInterval) {
      clearInterval(simInterval);
      simInterval = null;
    }
  }

  // Start simulation once when modal opens (if user expects a button but none exists)
  function startMintSimulationOnce() {
    if (simOnceTriggered) {
      // if modal reopened, start simulation again
      startSimulation();
      return;
    }
    simOnceTriggered = true;
    startSimulation();
  }

  // If there is a specific simulate button inside modal, wire it up.
  const simulateBtnCandidates = modal ? Array.from(modal.querySelectorAll('button, a')).filter((el) => {
    const id = el.id || '';
    const txt = (el.textContent || '').toLowerCase();
    return id.toLowerCase().includes('sim') || txt.includes('simulate') || txt.includes('simulate mint') || txt.includes('start simulation') || txt.includes('simulate mint');
  }) : [];

  if (simulateBtnCandidates.length > 0) {
    simulateBtnCandidates.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        // run a single simulation cycle on demand
        runSimulationCycle();
      });
    });
  } else {
    // No explicit simulate button found; ensure simulation stops when modal closes
    if (modal) {
      // observe modal display changes via MutationObserver as a fallback
      const mo = new MutationObserver(() => {
        if (!isModalVisible()) stopSimulation();
      });
      mo.observe(modal, { attributes: true, attributeFilter: ['style', 'aria-hidden'] });
    }
  }

  /* -------------------------
     Dashboard scroll
     -------------------------*/
  const dashboardBtn = $('#open-dashboard') || $('#open-dashboard-2') || null;
  const dashboardSection = $('#dashboard') || null;
  if (dashboardBtn && dashboardSection) {
    dashboardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* -------------------------
     Wallet connect (nav)
     -------------------------*/
  const navConnect = $('#nav-connect') || null;
  function openPhantomSite() {
    try {
      window.open('https://phantom.app/', '_blank', 'noopener');
    } catch (err) {
      // ignore
    }
  }

  async function tryConnectWallet() {
    if (window.solana && typeof window.solana.connect === 'function') {
      try {
        await window.solana.connect();
        const pub = window.solana.publicKey ? window.solana.publicKey.toString() : 'connected';
        // update nav button text if possible
        if (navConnect) navConnect.textContent = pub.slice ? pub.slice(0, 8) + '...' : 'Connected';
        appendLog(liveFeed || modalBody, `Wallet connected: ${pub}`);
      } catch (err) {
        appendLog(liveFeed || modalBody, `Wallet connection rejected or failed.`);
      }
    } else {
      // no injected provider
      const proceed = confirm('Phantom wallet not detected. Open phantom.app to install?');
      if (proceed) openPhantomSite();
    }
  }

  if (navConnect) {
    navConnect.addEventListener('click', (e) => {
      e.preventDefault();
      tryConnectWallet();
    });
  }

  /* -------------------------
     Hero metrics animate on visibility
     -------------------------*/
  const metricEnergyEl = $('#metric-energy');
  const metricProducersEl = $('#metric-producers');
  const metricStakedEl = $('#metric-staked');

  function animateMetricIfNeeded(el) {
    if (!el) return;
    // parse target from existing text
    const raw = el.textContent || '';
    // keep suffix if present
    const suffixMatch = raw.match(/[a-zA-Z% ]+$/);
    const suffix = suffixMatch ? suffixMatch[0] : '';
    const target = parseNumberFromText(raw);
    // animate from 0 to target
    animateTextValue(el, 0, target, 1400, (suffix && suffix.toLowerCase().includes('kwh')) ? 2 : (suffix && suffix.toLowerCase().includes('enrg') ? 2 : 0), suffix);
  }

  // IntersectionObserver to trigger when metrics enter viewport
  const metricsToObserve = [metricEnergyEl, metricProducersEl, metricStakedEl].filter(Boolean);
  if (metricsToObserve.length > 0 && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateMetricIfNeeded(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    metricsToObserve.forEach((el) => obs.observe(el));
  } else {
    // fallback: animate immediately
    metricsToObserve.forEach((el) => animateMetricIfNeeded(el));
  }

  /* -------------------------
     Live feed filler
     -------------------------*/
  const liveMessages = [
    'Device 0xA1 reported 3.2 kWh',
    'Device 0xB7 verified 1.1 kWh',
    'Oracle aggregated 12 proofs',
    'New producer registered: 0xC3',
    'Mint executed: 24.5 ENRG',
    'Switchboard oracle heartbeat received',
    'Device 0xD9 offline, retrying...',
    'Energy proof validated on Solana',
  ];

  let liveFeedInterval = null;
  function startLiveFeed() {
    if (!liveFeed) return;
    // ensure liveFeed is not overwritten if it contains important content
    liveFeedInterval = setInterval(() => {
      const msg = liveMessages[generateRandomInt(0, liveMessages.length - 1)];
      appendLog(liveFeed, msg);
      // keep live-feed length reasonable by trimming text nodes if too long
      try {
        // if liveFeed has many child text nodes, remove oldest
        const maxNodes = 120;
        while (liveFeed.childNodes.length > maxNodes) {
          liveFeed.removeChild(liveFeed.firstChild);
        }
      } catch (err) {
        // ignore
      }
    }, 2200 + Math.random() * 1800);
  }

  function stopLiveFeed() {
    if (liveFeedInterval) {
      clearInterval(liveFeedInterval);
      liveFeedInterval = null;
    }
  }

  // Start live feed on page load
  document.addEventListener('DOMContentLoaded', () => {
    startLiveFeed();
  });

  /* -------------------------
     Clean up on unload
     -------------------------*/
  window.addEventListener('beforeunload', () => {
    stopSimulation();
    stopLiveFeed();
  });

  /* -------------------------
     Defensive: expose a small API on window for debugging (non-invasive)
     -------------------------*/
  try {
    window.__ENRG = window.__ENRG || {};
    window.__ENRG.openModal = openModal;
    window.__ENRG.closeModal = closeModal;
    window.__ENRG.runSimulationCycle = runSimulationCycle;
    window.__ENRG.startSimulation = startSimulation;
    window.__ENRG.stopSimulation = stopSimulation;
  } catch (err) {
    // ignore
  }

  // End of script
})();
