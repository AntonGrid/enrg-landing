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

  // ========== MODAL HELPERS ==========
  const openModal = () => {
    if (!refs.modal) return;
    refs.modal.classList.add('active');
    refs.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderModal();
  };

  const closeModal = () => {
    if (!refs.modal) return;
    refs.modal.classList.remove('active');
    refs.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // ========== STORAGE KEYS ==========
  const STORAGE_STATE = 'enrgState';
  const STORAGE_USER = 'enrgUser';
  const STORAGE_DEVICES = 'enrgDevices';
  const STORAGE_HISTORY = 'enrgMiningHistory';
  const STORAGE_WALLET = 'enrgWalletConnected';

  // ========== DOM HELPERS ==========
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const formatNumber = (value, decimals = 0) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const createElement = (tag, props = {}, children = []) => {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className') {
        el.className = value;
      } else if (key === 'textContent') {
        el.textContent = value;
      } else if (key === 'html') {
        el.innerHTML = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          el.dataset[dataKey] = dataValue;
        });
      } else if (key === 'style') {
        el.style.cssText = value;
      } else if (key in el) {
        el[key] = value;
      } else {
        el.setAttribute(key, value);
      }
    });
    children.forEach((child) => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child) {
        el.appendChild(child);
      }
    });
    return el;
  };

  const scrollToElement = (selector) => {
    const el = $(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // ========== STATE MANAGEMENT ==========
  const defaultState = {
    step: 1,
    onboarded: false,
    walletConnected: false,
    walletAddress: '',
    inviteUsed: false,
    requestedAccess: false,
  };

  const loadState = () => {
    const raw = localStorage.getItem(STORAGE_STATE);
    if (!raw) return { ...defaultState };
    try {
      return { ...defaultState, ...JSON.parse(raw) };
    } catch (error) {
      return { ...defaultState };
    }
  };

  const saveState = (value) => {
    localStorage.setItem(STORAGE_STATE, JSON.stringify(value));
  };

  const loadUser = () => {
    const raw = localStorage.getItem(STORAGE_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  };

  const saveUser = (user) => {
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  };

  const loadDevices = () => {
    const raw = localStorage.getItem(STORAGE_DEVICES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (error) {
      return [];
    }
  };

  const saveDevices = (devices) => {
    localStorage.setItem(STORAGE_DEVICES, JSON.stringify(devices));
  };

  const loadHistory = () => {
    const raw = localStorage.getItem(STORAGE_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (error) {
      return [];
    }
  };

  const saveHistory = (history) => {
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
  };

  const state = loadState();

  // ========== REFS (DOM elements) ==========
  const refs = {
    modal: null,
    modalBody: null,
    modalHeaderTitle: null,
    modalClose: null,
    heroStart: null,
    heroStartAlt: null,
    headerStart: null,
    downloadWhitepaper: null,
    technicalDocs: null,
    dashboard: null,
    historyBody: null,
    consoleFeed: null,
    simEnergyBar: null,
    simEnrgBar: null,
    simEnergyValue: null,
    simEnrgValue: null,
    simFeeBuyback: null,
    simFeeStaking: null,
    simFeeDao: null,
    simFeeEmergency: null,
    simulateButtons: [],
    becomePartner: null,
    contactButton: null,
    heroTitle: null,
    heroTagline: null,
    heroSlogan: null,
    heroActions: null,
    heroGrid: null,
    heroRight: null,
    metricsGrid: null,
    footerLinks: null,
    // Wallet specific
    connectWalletBtn: null,
    walletAddressDisplay: null,
    walletBalanceSpan: null,
  };

  (function resolveRefs() {
    refs.modal = document.getElementById('mint-modal');
    refs.modalBody = document.querySelector('.modal-body');
    refs.modalHeaderTitle = document.getElementById('mint-modal-title');
    refs.modalClose = document.getElementById('mint-modal-close');
    refs.heroStart = document.getElementById('btn-start-minting-hero');
    refs.heroStartAlt = document.getElementById('btn-start-minting');
    refs.headerStart = document.getElementById('btn-get-started');
    refs.downloadWhitepaper = document.getElementById('btn-download-whitepaper');
    refs.technicalDocs = document.getElementById('btn-technical-docs');
    refs.dashboard = document.getElementById('dashboard');
    refs.historyBody = document.getElementById('history-body');
    refs.consoleFeed = document.getElementById('console-feed');
    refs.simEnergyBar = document.getElementById('sim-energy-bar');
    refs.simEnrgBar = document.getElementById('sim-enrg-bar');
    refs.simEnergyValue = document.getElementById('sim-energy-value');
    refs.simEnrgValue = document.getElementById('sim-enrg-value');
    refs.simFeeBuyback = document.getElementById('sim-fee-buyback');
    refs.simFeeStaking = document.getElementById('sim-fee-staking');
    refs.simFeeDao = document.getElementById('sim-fee-dao');
    refs.simFeeEmergency = document.getElementById('sim-fee-emergency');
    refs.simulateButtons = [
      document.getElementById('btn-simulate-mint'),
      document.getElementById('btn-simulate-mint-modal')
    ].filter(Boolean);
    refs.becomePartner = document.getElementById('btn-become-partner');
    refs.contactButton = document.getElementById('btn-contact');
    refs.heroTitle = document.querySelector('.hero-title');
    refs.heroTagline = document.querySelector('.hero-tagline');
    refs.heroSlogan = document.querySelector('.hero-slogan');
    refs.heroActions = document.getElementById('hero-actions');
    refs.heroGrid = document.querySelector('.hero-grid');
    refs.heroRight = document.getElementById('hero-right');
    refs.metricsGrid = document.getElementById('metrics-grid');
    refs.footerLinks = document.getElementById('footer-links');
    // Wallet elements
    refs.connectWalletBtn = document.getElementById('btn-connect-wallet');
    refs.walletAddressDisplay = document.getElementById('wallet-address-display');
    refs.walletBalanceSpan = document.getElementById('wallet-balance');
  })();

  // ========== CONSTANTS ==========
  const energySources = [
    { name: 'Solar', multiplier: 1.0, color: '#FFD166' },
    { name: 'Wind', multiplier: 0.8, color: '#9BF6FF' },
    { name: 'Hydro', multiplier: 0.5, color: '#A0C4FF' },
  ];

  const liveFeedSources = ['Node-01', 'SolarRig-12', 'WindFarm-7B', 'HydroUnit-3C', 'Rooftop-Alpha', 'GridEdge-09'];
  const liveFeedActions = ['verified', 'minted', 'streamed', 'settled', 'synced', 'registered'];
  const liveFeedUnits = ['kWh', 'MWh'];

  const isMobile = () => window.innerWidth < 768;

  const playClickTone = (() => {
    let context = null;
    return () => {
      try {
        if (!context) {
          context = new (window.AudioContext || window.webkitAudioContext)();
        }
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.value = 880;
        gain.gain.setValueAtTime(0.08, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.12);
      } catch (error) {
        // ignore audio errors
      }
    };
  })();

  // ========== BACKGROUND CANVAS ==========
  const initBackground = () => {
    const particleCanvas = document.getElementById('particle-canvas');
    if (!particleCanvas) return;
    particleCanvas.classList.add('enrg-particle-canvas');
    const gridCanvas = createElement('canvas', { id: 'enrg-grid-canvas', className: 'enrg-grid-canvas' });
    document.body.insertBefore(gridCanvas, particleCanvas.nextSibling);

    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight;

    const particleCtx = particleCanvas.getContext('2d');
    const gridCtx = gridCanvas.getContext('2d');
    const PARTICLE_COUNT = 80;
    const particles = Array.from({ length: PARTICLE_COUNT }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 2.2 + 1,
      pulse: Math.random() * Math.PI * 2,
      hue: Math.random() * 50,
    }));

    let gridOffset = 0;

    const resize = () => {
      particleCanvas.width = window.innerWidth;
      particleCanvas.height = window.innerHeight;
      gridCanvas.width = window.innerWidth;
      gridCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const drawGrid = () => {
      gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
      const step = 90;
      gridOffset += 0.1;
      gridCtx.strokeStyle = 'rgba(0, 229, 255, 0.06)';
      gridCtx.lineWidth = 1;
      for (let x = (gridOffset % step) - step; x < gridCanvas.width; x += step) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, gridCanvas.height);
        gridCtx.stroke();
      }
      for (let y = (gridOffset % step) - step; y < gridCanvas.height; y += step) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(gridCanvas.width, y);
        gridCtx.stroke();
      }
      gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      gridCtx.lineWidth = 1.2;
      for (let i = 0; i < 8; i++) {
        const alpha = 0.04 - i * 0.005;
        gridCtx.strokeStyle = `rgba(255,255,255,${alpha})`;
        gridCtx.beginPath();
        gridCtx.arc(gridCanvas.width / 2, gridCanvas.height / 2, 120 + i * 28 + ((gridOffset * 4) % 28), 0, Math.PI * 2);
        gridCtx.stroke();
      }
    };

    const drawParticles = () => {
      particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.03;
        const brightness = 0.55 + Math.sin(particle.pulse) * 0.3;
        particle.r = 1.3 + Math.sin(particle.pulse) * 0.8;
        if (particle.x < -20) particle.x = particleCanvas.width + 20;
        if (particle.x > particleCanvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = particleCanvas.height + 20;
        if (particle.y > particleCanvas.height + 20) particle.y = -20;

        particleCtx.beginPath();
        const gradient = particleCtx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.r * 6);
        gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 75%, ${0.7 * brightness})`);
        gradient.addColorStop(0.4, `hsla(${particle.hue}, 100%, 60%, ${0.2 * brightness})`);
        gradient.addColorStop(1, 'transparent');
        particleCtx.fillStyle = gradient;
        particleCtx.arc(particle.x, particle.y, particle.r * 6, 0, Math.PI * 2);
        particleCtx.fill();

        for (let j = index + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            particleCtx.strokeStyle = `rgba(0, 229, 255, ${0.08 - dist / 180 * 0.05})`;
            particleCtx.lineWidth = 1;
            particleCtx.beginPath();
            particleCtx.moveTo(particle.x, particle.y);
            particleCtx.lineTo(other.x, other.y);
            particleCtx.stroke();
          }
        }
      });
    };

    const animate = () => {
      drawGrid();
      drawParticles();
      requestAnimationFrame(animate);
    };
    animate();
  };

  // ========== DOCUMENTATION LINKS ==========
  const openDocumentationPage = (href) => {
    if (!href) return;
    window.open(href, '_blank', 'noopener');
  };

  const openEmailContact = () => {
    window.location.assign('mailto:anton@enrg.network');
  };

  // ========== WALLET INTEGRATION ==========
  let walletPublicKey = null;
  let walletBalance = 0;

  const updateWalletUI = () => {
    if (refs.walletAddressDisplay) {
      if (state.walletConnected && state.walletAddress) {
        const short = state.walletAddress.slice(0, 4) + '...' + state.walletAddress.slice(-4);
        refs.walletAddressDisplay.textContent = short;
      } else {
        refs.walletAddressDisplay.textContent = 'Not connected';
      }
    }
    if (refs.walletBalanceSpan) {
      if (state.walletConnected && walletBalance !== null) {
        refs.walletBalanceSpan.textContent = `${walletBalance.toFixed(4)} SOL`;
      } else {
        refs.walletBalanceSpan.textContent = '— SOL';
      }
    }
    // Update connect button text
    if (refs.connectWalletBtn) {
      if (state.walletConnected) {
        refs.connectWalletBtn.textContent = 'Disconnect';
        refs.connectWalletBtn.classList.remove('btn-outline');
        refs.connectWalletBtn.classList.add('btn-secondary');
      } else {
        refs.connectWalletBtn.textContent = 'Connect Wallet';
        refs.connectWalletBtn.classList.remove('btn-secondary');
        refs.connectWalletBtn.classList.add('btn-outline');
      }
    }
  };

  const getWalletBalance = async (publicKey) => {
    if (!window.solana || !window.solana.isConnected) return 0;
    try {
      const connection = new solanaWeb3.Connection('https://rpc.ankr.com/solana', 'confirmed');
      const balanceLamports = await connection.getBalance(publicKey);
      const balanceSol = balanceLamports / solanaWeb3.LAMPORTS_PER_SOL;
      return balanceSol;
    } catch (err) {
      console.warn('Balance fetch error:', err);
      return 0;
    }
  };

  const connectWallet = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      alert('Phantom wallet not found. Please install Phantom from https://phantom.app/');
      window.open('https://phantom.app/', '_blank');
      return false;
    }
    try {
      const resp = await window.solana.connect();
      walletPublicKey = resp.publicKey;
      state.walletConnected = true;
      state.walletAddress = walletPublicKey.toString();
      saveState(state);
      localStorage.setItem(STORAGE_WALLET, state.walletAddress);
      
      walletBalance = await getWalletBalance(walletPublicKey);
      updateWalletUI();
      
      addLiveFeedLine(`✅ Wallet connected: ${state.walletAddress.slice(0,6)}... Balance: ${walletBalance.toFixed(4)} SOL`);
      playClickTone();
      
      if (refs.modal && refs.modal.getAttribute('aria-hidden') === 'false') {
        renderModal();
      }
      return true;
    } catch (error) {
      console.error('Wallet connection error:', error);
      addLiveFeedLine(`❌ Wallet connection failed: ${error.message}`);
      return false;
    }
  };

  const disconnectWallet = () => {
    if (window.solana && window.solana.isConnected) {
      window.solana.disconnect();
    }
    state.walletConnected = false;
    state.walletAddress = '';
    walletPublicKey = null;
    walletBalance = 0;
    saveState(state);
    localStorage.removeItem(STORAGE_WALLET);
    updateWalletUI();
    addLiveFeedLine('🔌 Wallet disconnected');
  };

  const checkExistingWallet = async () => {
    if (window.solana && window.solana.isConnected && window.solana.publicKey) {
      const addr = window.solana.publicKey.toString();
      if (addr === state.walletAddress) {
        walletPublicKey = window.solana.publicKey;
        state.walletConnected = true;
        walletBalance = await getWalletBalance(walletPublicKey);
        updateWalletUI();
        return true;
      }
    } else if (localStorage.getItem(STORAGE_WALLET)) {
      state.walletAddress = localStorage.getItem(STORAGE_WALLET);
      state.walletConnected = false;
      updateWalletUI();
    }
    return false;
  };

  // ========== LIVE FEED ==========
  const addLiveFeedLine = (text) => {
    if (!refs.consoleFeed) return;
    const line = createElement('div', {
      className: 'console-line',
      textContent: `[${new Date().toLocaleTimeString('en-US')}] ${text}`,
      style: 'padding:10px 0;border-bottom:1px solid rgba(148,163,184,0.08);'
    });
    refs.consoleFeed.appendChild(line);
    while (refs.consoleFeed.children.length > 40) {
      refs.consoleFeed.removeChild(refs.consoleFeed.firstChild);
    }
    refs.consoleFeed.scrollTop = refs.consoleFeed.scrollHeight;
  };

  const startLiveFeed = () => {
    const tick = () => {
      const producer = liveFeedSources[randInt(0, liveFeedSources.length - 1)];
      const action = liveFeedActions[randInt(0, liveFeedActions.length - 1)];
      const unit = liveFeedUnits[randInt(0, liveFeedUnits.length - 1)];
      const value = unit === 'kWh'
        ? randInt(10, 900)
        : (Math.random() * 9 + 0.5).toFixed(1);
      addLiveFeedLine(`${producer} ${action} ${value} ${unit}`);
      setTimeout(tick, randInt(2000, 5000));
    };
    tick();
  };

  // ========== SIMULATION ==========
  const animateBar = (bar, percent) => {
    if (!bar) return;
    bar.style.transition = 'width 0.8s ease';
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
      });
    });
  };

  const addHistoryEntry = (entry) => {
    const history = loadHistory();
    history.unshift(entry);
    saveHistory(history);
  };

  const simulateMining = () => {
    const devices = loadDevices();
    const selectedDevice = devices.length ? devices[Math.floor(Math.random() * devices.length)] : null;
    const chosenSource = selectedDevice?.source || energySources[Math.floor(Math.random() * energySources.length)];
    const sourceDefinition = typeof chosenSource === 'string'
      ? energySources.find((item) => item.name === chosenSource) || energySources[0]
      : chosenSource;
    const kWh = Math.floor(Math.random() * 500) + 1;
    const effective = kWh * sourceDefinition.multiplier;
    const enrg = effective / 1000;
    const fee = enrg * 0.15;
    const distribution = {
      buyback: fee * 0.2,
      staking: fee * 0.4,
      dao: fee * 0.3,
      emergency: fee * 0.1,
    };
    const deviceName = selectedDevice ? selectedDevice.name : 'Virtual device';

    // Animate bars
    animateBar(refs.simEnergyBar, (kWh / 500) * 100);
    animateBar(refs.simEnrgBar, Math.min(100, (enrg / 0.5) * 100));
    animateBar(refs.simFeeBuyback, distribution.buyback / fee * 100);
    animateBar(refs.simFeeStaking, distribution.staking / fee * 100);
    animateBar(refs.simFeeDao, distribution.dao / fee * 100);
    animateBar(refs.simFeeEmergency, distribution.emergency / fee * 100);

    if (refs.simEnergyValue) refs.simEnergyValue.textContent = `${kWh}`;
    if (refs.simEnrgValue) refs.simEnrgValue.textContent = `${enrg.toFixed(3)}`;

    const text = `${deviceName} (${sourceDefinition.name}) produced ${kWh} kWh → ${enrg.toFixed(3)} ENRG. Fee: buyback ${distribution.buyback.toFixed(3)}, staking ${distribution.staking.toFixed(3)}, DAO ${distribution.dao.toFixed(3)}, emergency ${distribution.emergency.toFixed(3)}.`;
    addLiveFeedLine(text);
    playClickTone();

    addHistoryEntry({
      timestamp: new Date().toISOString(),
      deviceName,
      source: sourceDefinition.name,
      kWh,
      enrg,
      fee,
      distribution,
    });
    renderDashboardSummary();
    renderHistory();
  };

  // ========== PROGRESS BAR & MODAL ==========
  const renderProgressBar = () => {
    const existing = document.getElementById('enrg-progress-container');
    if (existing) return existing;
    if (!refs.modalBody) return null;
    const container = createElement('div', { id: 'enrg-progress-container', style: 'margin-bottom:24px;' }, []);
    const stepLabels = ['Access', 'Wallet', 'Device', 'Dashboard'];
    const stepRow = createElement('div', { className: 'enrg-progress-steps' }, []);
    stepLabels.forEach(() => {
      stepRow.appendChild(createElement('div', { className: 'enrg-progress-step' }));
    });
    const bar = createElement('div', { className: 'enrg-progress-bar-container' }, [
      createElement('div', { className: 'enrg-progress-bar-fill' }),
    ]);
    container.appendChild(stepRow);
    container.appendChild(bar);
    refs.modalBody.prepend(container);
    return container;
  };

  const updateProgress = () => {
    const container = renderProgressBar();
    if (!container) return;
    const steps = container.querySelectorAll('.enrg-progress-step');
    const fill = container.querySelector('.enrg-progress-bar-fill');
    const currentIndex = Math.min(3, Math.max(0, state.step - 1));
    steps.forEach((step, index) => {
      step.classList.toggle('active', index <= currentIndex);
    });
    const width = ((currentIndex + 1) / steps.length) * 100;
    if (fill) fill.style.width = `${width}%`;
  };

  const renderModal = () => {
    if (!refs.modalBody || !refs.modalHeaderTitle) return;
    refs.modalBody.innerHTML = '';
    refs.modalHeaderTitle.textContent = state.onboarded ? 'Welcome back to ENRG' : 'Onboard your energy source';
    updateProgress();

    const wrapper = createElement('div', { style: 'display:flex;flex-direction:column;gap:18px;max-width:100%;' });
    if (!state.onboarded) {
      if (state.step === 1.5) {
        wrapper.appendChild(renderInviteCodeStep());
      } else if (state.step === 1.1) {
        wrapper.appendChild(renderRegistrationStep());
      } else if (state.step === 2) {
        wrapper.appendChild(renderWalletStep());
      } else if (state.step === 3) {
        wrapper.appendChild(renderDeviceStep());
      } else {
        wrapper.appendChild(renderInviteChoiceStep());
      }
    } else {
      wrapper.appendChild(renderDashboardStep());
    }

    const resetAction = createElement('button', {
      type: 'button',
      className: 'btn-secondary',
      textContent: 'Start Over',
      style: 'align-self:flex-start;margin-top:10px;',
    });
    resetAction.addEventListener('click', (event) => {
      event.preventDefault();
      resetOnboarding();
    });
    wrapper.appendChild(resetAction);
    refs.modalBody.appendChild(wrapper);
  };

  const renderInviteChoiceStep = () => {
    const section = createElement('div', {} , []);
    section.appendChild(createElement('p', { textContent: 'Start with an invite code or request access to join the ENRG network.', style: 'color:var(--text-muted);' }));
    const row = createElement('div', { style: 'display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;' }, []);
    const inviteButton = createElement('button', { type: 'button', className: 'btn-primary', textContent: 'I have an invite code' });
    inviteButton.addEventListener('click', () => {
      state.step = 1.5;
      saveState(state);
      renderModal();
    });
    const requestButton = createElement('button', { type: 'button', className: 'btn-secondary', textContent: 'Request access' });
    requestButton.addEventListener('click', () => {
      state.step = 1.1;
      saveState(state);
      renderModal();
    });
    row.appendChild(inviteButton);
    row.appendChild(requestButton);
    section.appendChild(row);
    return section;
  };

  const renderInviteCodeStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', { textContent: 'Enter your invite code to continue onboarding.', style: 'color:var(--text-muted);' }));
    const form = createElement('form', { style: 'display:flex;flex-direction:column;gap:14px;margin-top:18px;' }, []);
    const codeInput = createElement('input', { type: 'text', placeholder: 'Invite code', required: true, style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#E5E7EB;' });
    const continueButton = createElement('button', { type: 'submit', className: 'btn-primary', textContent: 'Continue' });
    form.appendChild(codeInput);
    form.appendChild(continueButton);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const code = codeInput.value.trim();
      if (!code) {
        alert('Please enter your invite code.');
        return;
      }
      state.inviteUsed = true;
      state.step = 2;
      saveState(state);
      renderModal();
    });
    section.appendChild(form);
    return section;
  };

  const renderRegistrationStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', { textContent: 'Register with your email and password to join ENRG.', style: 'color:var(--text-muted);' }));
    const form = createElement('form', { style: 'display:flex;flex-direction:column;gap:14px;margin-top:18px;' }, []);
    const emailInput = createElement('input', { type: 'email', placeholder: 'Email address', required: true, style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#E5E7EB;' });
    const passwordInput = createElement('input', { type: 'password', placeholder: 'Password', required: true, style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#E5E7EB;' });
    const registerButton = createElement('button', { type: 'submit', className: 'btn-primary', textContent: 'Register' });
    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(registerButton);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      if (!email || !password) {
        alert('Please provide both email and password.');
        return;
      }
      saveUser({ email, password, registeredAt: new Date().toISOString() });
      state.requestedAccess = true;
      state.step = 2;
      saveState(state);
      renderModal();
    });
    section.appendChild(form);
    return section;
  };

  const renderWalletStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', { textContent: 'Connect Phantom to secure wallet actions or skip and continue with onboarding.', style: 'color:var(--text-muted);' }));
    const actionRow = createElement('div', { style: 'display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;' }, []);
    const connectButton = createElement('button', { type: 'button', className: 'btn-primary', textContent: 'Connect Phantom' });
    connectButton.addEventListener('click', async () => {
      await connectWallet();
    });
    const skipButton = createElement('button', { type: 'button', className: 'btn-secondary', textContent: 'Skip for now' });
    skipButton.addEventListener('click', () => {
      state.walletConnected = false;
      state.step = 3;
      saveState(state);
      renderModal();
    });
    actionRow.appendChild(connectButton);
    actionRow.appendChild(skipButton);
    section.appendChild(actionRow);
    return section;
  };

  const renderDeviceStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', { textContent: 'Register your first device and start tokenizing energy production.', style: 'color:var(--text-muted);' }));
    const form = createElement('form', { style: 'display:flex;flex-direction:column;gap:14px;margin-top:18px;' }, []);
    const nameInput = createElement('input', { type: 'text', placeholder: 'Device name', required: true, style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#E5E7EB;' });
    const idInput = createElement('input', { type: 'text', placeholder: 'Device ID', required: true, style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#E5E7EB;' });
    const sourceSelect = createElement('select', { required: true, style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#E5E7EB;' });
    ['Solar', 'Wind', 'Hydro'].forEach((source) => {
      sourceSelect.appendChild(createElement('option', { value: source }, [source]));
    });
    const registerButton = createElement('button', { type: 'submit', className: 'btn-primary', textContent: 'Register Device' });
    form.appendChild(nameInput);
    form.appendChild(idInput);
    form.appendChild(sourceSelect);
    form.appendChild(registerButton);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      const id = idInput.value.trim();
      const source = sourceSelect.value;
      if (!name || !id || !source) {
        alert('Please fill device name, ID, and source.');
        return;
      }
      const devices = loadDevices();
      devices.unshift({ name, id, source, registeredAt: new Date().toISOString() });
      saveDevices(devices);
      state.onboarded = true;
      state.step = 4;
      saveState(state);
      renderDashboardSummary();
      renderHistory();
      renderModal();
    });
    section.appendChild(form);
    return section;
  };

  const renderDashboardStep = () => {
    const section = createElement('div', {}, []);
    const devices = loadDevices();
    if (!devices.length) {
      section.appendChild(createElement('p', { textContent: 'Complete device registration to unlock live mining and dashboard insights.', style: 'color:var(--text-muted);' }));
    } else {
      section.appendChild(createElement('p', { textContent: 'Your onboarding is complete. Use the simulator to mint ENRG from verified production.', style: 'color:var(--text-muted);' }));
    }
    const actionRow = createElement('div', { style: 'display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;' }, []);
    const simButton = createElement('button', { type: 'button', className: 'btn-primary', textContent: 'Simulate Mining' });
    simButton.addEventListener('click', () => {
      if (refs.simulateButtons.length) {
        refs.simulateButtons[0].click();
      } else {
        simulateMining();
      }
    });
    actionRow.appendChild(simButton);
    section.appendChild(actionRow);
    return section;
  };

  // ========== DASHBOARD ==========
  const renderDashboardSummary = () => {
    if (!refs.dashboard) return;
    let summary = refs.dashboard.querySelector('.enrg-dashboard-summary');
    if (!summary) {
      summary = createElement('div', { className: 'enrg-dashboard-summary', style: 'margin-top:24px;padding:22px;border:1px solid rgba(148,163,184,0.2);border-radius:22px;background:rgba(15,23,42,0.72);' }, []);
      refs.dashboard.appendChild(summary);
    }
    const devices = loadDevices();
    const history = loadHistory();
    summary.innerHTML = '';
    const header = createElement('div', { style: 'display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;' }, []);
    header.appendChild(createElement('h3', { textContent: 'ENRG Dashboard Summary', style: 'margin:0;font-size:1.15rem;' }));
    const resetButton = createElement('button', { type: 'button', className: 'btn-secondary', textContent: 'Start Over', style: 'white-space:nowrap;' });
    resetButton.addEventListener('click', (event) => { event.preventDefault(); resetOnboarding(); });
    header.appendChild(resetButton);
    summary.appendChild(header);
    if (!devices.length) {
      summary.appendChild(createElement('p', { textContent: 'No registered devices yet. Complete onboarding to start minting ENRG from verified energy production.', style: 'color:var(--text-muted);margin-top:16px;max-width:720px;' }));
      return;
    }
    const deviceGrid = createElement('div', { style: 'display:grid;gap:16px;margin-top:20px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));' }, []);
    devices.forEach((device) => {
      const card = createElement('div', { style: 'padding:18px;border:1px solid rgba(148,163,184,0.18);border-radius:18px;background:rgba(12,17,28,0.9);' }, []);
      card.appendChild(createElement('div', { textContent: device.name, style: 'font-weight:700;margin-bottom:10px;' }));
      card.appendChild(createElement('div', { textContent: `ID: ${device.id}`, style: 'color:var(--text-muted);margin-bottom:6px;' }));
      card.appendChild(createElement('div', { textContent: `Source: ${device.source}`, style: 'color:var(--text-muted);' }));
      deviceGrid.appendChild(card);
    });
    summary.appendChild(deviceGrid);
    const statsRow = createElement('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:20px;' }, []);
    statsRow.appendChild(createElement('div', { style: 'padding:18px;border:1px solid rgba(148,163,184,0.18);border-radius:18px;background:rgba(12,17,28,0.9);' }, [
      createElement('div', { textContent: 'Registered Devices', style: 'color:var(--text-muted);margin-bottom:6px;' }),
      createElement('div', { textContent: `${devices.length}`, style: 'font-size:1.4rem;font-weight:700;' }),
    ]));
    statsRow.appendChild(createElement('div', { style: 'padding:18px;border:1px solid rgba(148,163,184,0.18);border-radius:18px;background:rgba(12,17,28,0.9);' }, [
      createElement('div', { textContent: 'Mining Events', style: 'color:var(--text-muted);margin-bottom:6px;' }),
      createElement('div', { textContent: `${history.length}`, style: 'font-size:1.4rem;font-weight:700;' }),
    ]));
    summary.appendChild(statsRow);
  };

  const renderHistory = () => {
    if (!refs.historyBody) return;
    const history = loadHistory();
    refs.historyBody.innerHTML = '';
    if (!history.length) {
      refs.historyBody.appendChild(createElement('p', { textContent: 'No mining history yet. Simulate or register a device to start.', style: 'color:var(--text-muted);text-align:center;padding:20px;' }));
      return;
    }
    const table = createElement('table', { style: 'width:100%;border-collapse:collapse;' }, []);
    const thead = createElement('thead', {}, [
      createElement('tr', {}, [
        createElement('th', { textContent: 'Timestamp', style: 'text-align:left;padding:10px;border-bottom:1px solid rgba(148,163,184,0.2);' }),
        createElement('th', { textContent: 'Device', style: 'text-align:left;padding:10px;border-bottom:1px solid rgba(148,163,184,0.2);' }),
        createElement('th', { textContent: 'Source', style: 'text-align:left;padding:10px;border-bottom:1px solid rgba(148,163,184,0.2);' }),
        createElement('th', { textContent: 'kWh', style: 'text-align:right;padding:10px;border-bottom:1px solid rgba(148,163,184,0.2);' }),
        createElement('th', { textContent: 'ENRG', style: 'text-align:right;padding:10px;border-bottom:1px solid rgba(148,163,184,0.2);' }),
        createElement('th', { textContent: 'Fee', style: 'text-align:right;padding:10px;border-bottom:1px solid rgba(148,163,184,0.2);' }),
      ]),
    ]);
    table.appendChild(thead);
    const tbody = createElement('tbody', {}, []);
    history.forEach((entry) => {
      const row = createElement('tr', {}, [
        createElement('td', { textContent: new Date(entry.timestamp).toLocaleString(), style: 'padding:10px;border-bottom:1px solid rgba(148,163,184,0.1);' }),
        createElement('td', { textContent: entry.deviceName, style: 'padding:10px;border-bottom:1px solid rgba(148,163,184,0.1);' }),
        createElement('td', { textContent: entry.source, style: 'padding:10px;border-bottom:1px solid rgba(148,163,184,0.1);' }),
        createElement('td', { textContent: entry.kWh, style: 'text-align:right;padding:10px;border-bottom:1px solid rgba(148,163,184,0.1);' }),
        createElement('td', { textContent: entry.enrg.toFixed(3), style: 'text-align:right;padding:10px;border-bottom:1px solid rgba(148,163,184,0.1);' }),
        createElement('td', { textContent: entry.fee.toFixed(3), style: 'text-align:right;padding:10px;border-bottom:1px solid rgba(148,163,184,0.1);' }),
      ]);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    refs.historyBody.appendChild(table);
  };

  // ========== ONBOARDING ==========
  const handleGetStarted = () => {
    if (state.onboarded) {
      scrollToElement('#dashboard');
      return;
    }
    openModal();
  };

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_STATE);
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_DEVICES);
    localStorage.removeItem(STORAGE_HISTORY);
    Object.assign(state, { ...defaultState });
    renderDashboardSummary();
    renderHistory();
    if (refs.modal) {
      openModal();
      renderModal();
    }
  };

  // ========== ENERGY DECORATIONS ==========
  const initEnergyDecorations = () => {
    const metricCards = $$('.metric-card');
    metricCards.forEach((card) => card.classList.add('energy-glow'));
    if (!refs.heroRight) return;
    refs.heroRight.style.position = 'relative';
    if (document.getElementById('enrg-energy-overlay')) return;
    const overlay = createElement('div', { className: 'enrg-energy-overlay', id: 'enrg-energy-overlay' });
    overlay.appendChild(createElement('div', { className: 'enrg-energy-ring' }));
    overlay.appendChild(createElement('svg', { className: 'enrg-energy-path', viewBox: '0 0 220 220', xmlns: 'http://www.w3.org/2000/svg', html: `<path d="M20,180 C80,80 140,80 200,20" fill="none" stroke="rgba(0,229,255,0.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="200" cy="20" r="8" fill="#00E5FF"/><circle cx="20" cy="180" r="8" fill="#FF6B00"/>` }));

    const nodes = [
      { class: 'energy-1', symbol: '⚡', label: 'Future Grid', target: '#dashboard' },
      { class: 'energy-2', symbol: '🔋', label: 'IoT Flow', target: '#minting' },
      { class: 'energy-3', symbol: '🌐', label: 'Clean Power', target: '#tokenomics' },
    ];
    nodes.forEach((item) => {
      const node = createElement('div', {
        className: `enrg-energy-node ${item.class}`,
        html: `<div>${item.symbol}<span>${item.label}</span></div>`,
      });
      node.style.cursor = 'pointer';
      node.addEventListener('click', () => {
        const targetElement = document.querySelector(item.target);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      overlay.appendChild(node);
    });
    refs.heroRight.appendChild(overlay);
  };

  // ========== ANIMATIONS ==========
  const animateMetric = (el, target, duration = 2000) => {
    if (!el) return;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      el.textContent = formatNumber(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const updateMetricCounters = () => {
    const metricEls = $$('.counter');
    if (!metricEls.length) return;
    metricEls.forEach((el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      animateMetric(el, target);
    });
  };

  const initFadeUpAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    $$('.fade-up').forEach((el) => observer.observe(el));
  };

  const initMetricScrollAnimation = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateMetricCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    const metricsSection = document.getElementById('metrics-grid') || refs.heroRight;
    if (metricsSection) observer.observe(metricsSection);
  };

  // ========== RESPONSIVE ==========
  const applyResponsiveLayout = () => {
    const mobile = isMobile();
    if (refs.heroGrid) {
      refs.heroGrid.style.gridTemplateColumns = mobile ? '1fr' : 'minmax(0, 1.2fr) minmax(0, 1fr)';
    }
    if (refs.metricsGrid) {
      refs.metricsGrid.style.gridTemplateColumns = mobile ? '1fr' : 'repeat(3, minmax(0, 1fr))';
    }
    if (refs.heroActions) {
      refs.heroActions.style.display = 'flex';
      refs.heroActions.style.flexWrap = 'wrap';
      refs.heroActions.style.gap = '12px';
      refs.heroActions.querySelectorAll('button').forEach((button) => {
        button.style.width = mobile ? '100%' : 'auto';
      });
    }
    const howGrid = document.querySelector('#how-it-works .how-grid');
    if (howGrid) {
      howGrid.style.gridTemplateColumns = mobile ? '1fr' : 'repeat(3,minmax(0,1fr))';
    }
    const historyTableWrap = document.querySelector('.history-table-wrap');
    if (historyTableWrap) {
      historyTableWrap.style.overflowX = mobile ? 'auto' : 'visible';
    }
  };

  // ========== CHAT ASSISTANT ==========
  const initChatAssistant = () => {
    if (document.getElementById('enrg-chat-button')) return;
    const button = createElement('button', { id: 'enrg-chat-button', className: 'enrg-chat-button', textContent: '💬', type: 'button' });
    const panel = createElement('div', { className: 'enrg-chat-panel', id: 'enrg-chat-panel' }, []);
    const header = createElement('div', { className: 'enrg-chat-header' }, [
      createElement('div', { textContent: 'ENRG Assistant' }),
      createElement('button', { type: 'button', textContent: '×', style: 'background:none;border:none;color:#E5E7EB;font-size:1.2rem;cursor:pointer;' }),
    ]);
    const body = createElement('div', { className: 'enrg-chat-body' }, []);
    const actions = createElement('div', { className: 'enrg-chat-actions' }, []);
    const hints = [
      'How do I connect a device?',
      'Explain the tokenomics.',
      'What does ENRG staking do?',
    ];
    hints.forEach((hint) => {
      const hintButton = createElement('button', { type: 'button', className: 'enrg-chat-action', textContent: hint });
      hintButton.addEventListener('click', () => {
        body.innerHTML = '';
        body.appendChild(createElement('div', { className: 'enrg-chat-message', html: `<strong>Assistant:</strong> ${generateChatReply(hint)}` }));
      });
      actions.appendChild(hintButton);
    });
    body.appendChild(createElement('div', { className: 'enrg-chat-message', textContent: 'Ask me about ENRG onboarding, minting, or documentation.' }));
    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(actions);
    button.addEventListener('click', () => panel.classList.toggle('active'));
    header.querySelector('button').addEventListener('click', () => panel.classList.remove('active'));
    document.body.appendChild(button);
    document.body.appendChild(panel);
  };

  const generateChatReply = (prompt) => {
    const responses = {
      'How do I connect a device?': 'Use the onboarding modal to register your device name, ID, and energy source. Then run the mining simulation to see ENRG generated.',
      'Explain the tokenomics.': 'ENRG is deflationary: every mint charges a 15% fee that is split into buyback, staking, DAO reserve, and emergency funds.',
      'What does ENRG staking do?': 'Staking increases network security and rewards long-term holders with a share of protocol fees.',
    };
    return responses[prompt] || 'ENRG connects renewable energy production to token issuance via IoT-verification and Solana minting. Start with onboarding to see it live.';
  };

  // ========== EVENT INITIALIZATION ==========
  const initModalEvents = () => {
    if (!refs.modal) return;
    if (refs.modalClose) {
      refs.modalClose.addEventListener('click', closeModal);
    }
    refs.modal.addEventListener('click', (event) => {
      if (event.target === refs.modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && refs.modal && refs.modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });
  };

  const initStartButtons = () => {
    [refs.heroStart, refs.heroStartAlt, refs.headerStart].forEach((button) => {
      if (!button) return;
      button.addEventListener('click', (event) => {
        event.preventDefault();
        handleGetStarted();
      });
    });
    // How it works "Start Now" button
    const howButton = document.getElementById('btn-how-start');
    if (howButton) {
      howButton.addEventListener('click', (event) => {
        event.preventDefault();
        handleGetStarted();
      });
    }
  };

  const initNavigationLinks = () => {
    $$('.nav-link').forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = $(href);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  };

  const initDocumentationButtons = () => {
    if (refs.downloadWhitepaper) {
      refs.downloadWhitepaper.addEventListener('click', (event) => {
        event.preventDefault();
        openDocumentationPage('whitepaper.html');
      });
    }
    if (refs.technicalDocs) {
      refs.technicalDocs.addEventListener('click', (event) => {
        event.preventDefault();
        openDocumentationPage('technical-overview.html');
      });
    }
  };

  const initSimulateButtons = () => {
    refs.simulateButtons.forEach(button => {
      if (button) {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          simulateMining();
        });
      }
    });
  };

  const initPartnerContactButtons = () => {
    if (refs.becomePartner) {
      refs.becomePartner.addEventListener('click', (event) => {
        event.preventDefault();
        openEmailContact();
      });
    }
    if (refs.contactButton) {
      refs.contactButton.addEventListener('click', (event) => {
        event.preventDefault();
        openEmailContact();
      });
    }
  };

  const initFooterLinks = () => {
    if (!refs.footerLinks) return;
    const external = [
      { href: 'https://github.com/AntonGrid/enrg-landing', text: 'GitHub' },
      { href: 'https://t.me/enrg_network', text: 'Telegram' },
    ];
    external.forEach((linkData) => {
      if (!$(`a[href="${linkData.href}"]`, refs.footerLinks)) {
        const anchor = createElement('a', { href: linkData.href, target: '_blank', rel: 'noreferrer', textContent: linkData.text });
        refs.footerLinks.appendChild(anchor);
      }
    });
  };

  // ========== MAIN INIT ==========
  const init = () => {
    // Inject dynamic styles
    const style = createElement('style', { type: 'text/css' });
    style.textContent = `
      .enrg-grid-canvas, .enrg-particle-canvas { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: -3; }
      .enrg-grid-canvas { z-index: -2; }
      .enrg-chat-button { position: fixed; right: 20px; bottom: 20px; width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #00E5FF, #FF6B00); color: #020617; border: none; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; cursor: pointer; box-shadow: 0 18px 40px rgba(0,0,0,0.35); z-index: 30; }
      .enrg-chat-panel { position: fixed; right: 20px; bottom: 90px; width: 320px; max-width: calc(100% - 32px); background: rgba(7,13,25,0.96); border: 1px solid rgba(0,229,255,0.18); border-radius: 24px; box-shadow: 0 24px 60px rgba(0,0,0,0.5); color: #E5E7EB; z-index: 30; overflow: hidden; display: none; flex-direction: column; }
      .enrg-chat-panel.active { display: flex; }
      .enrg-chat-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid rgba(148,163,184,0.12); }
      .enrg-chat-body { padding: 14px; display: flex; flex-direction: column; gap: 12px; max-height: 280px; overflow-y: auto; }
      .enrg-chat-message { padding: 12px 14px; border-radius: 16px; background: rgba(15,23,42,0.9); line-height: 1.45; }
      .enrg-chat-message strong { color: #00E5FF; }
      .enrg-chat-actions { display: flex; flex-wrap: wrap; gap: 10px; padding: 12px 14px 16px; border-top: 1px solid rgba(148,163,184,0.12); }
      .enrg-chat-action { padding: 10px 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(148,163,184,0.18); border-radius: 14px; cursor: pointer; color: #E5E7EB; }
      .enrg-progress-bar-container { width: 100%; background: rgba(255,255,255,0.05); border-radius: 999px; height: 10px; overflow: hidden; margin-bottom: 18px; }
      .enrg-progress-bar-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #FF6B00, #00E5FF); transition: width 0.4s ease; }
      .enrg-progress-steps { display: flex; gap: 10px; margin-bottom: 16px; }
      .enrg-progress-step { flex: 1; height: 8px; border-radius: 999px; background: rgba(255,255,255,0.08); }
      .enrg-progress-step.active { background: linear-gradient(90deg, #FF6B00, #00E5FF); }
      .enrg-hero-badges { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 18px; }
      .enrg-hero-badge { padding: 12px 16px; border-radius: 18px; background: rgba(15,23,42,0.82); border: 1px solid rgba(0,229,255,0.16); display: inline-flex; gap: 10px; align-items: center; }
      .enrg-hero-badge span { font-weight: 700; color: #00E5FF; }
      .enrg-step-card { padding: 24px; border-radius: 22px; background: rgba(12,17,28,0.92); border: 1px solid rgba(0,229,255,0.1); min-height: 220px; display: flex; flex-direction: column; gap: 14px; }
      .enrg-step-card h3 { margin: 0; font-size: 1.05rem; }
      .enrg-step-card p { margin: 0; color: #9CA3AF; line-height: 1.55; }
      .enrg-step-card .step-icon { font-size: 2rem; }
      .enrg-hero-note { color: #9CA3AF; max-width: 780px; margin-top: 12px; }
      .energy-glow { position: relative; overflow: hidden; }
      .energy-glow::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 20%, rgba(0,229,255,0.2), transparent 28%), radial-gradient(circle at 80% 80%, rgba(255,107,0,0.18), transparent 24%); pointer-events: none; opacity: 0.8; transition: transform 0.8s ease; transform: scale(0.96); }
      .energy-glow:hover::before { transform: scale(1.05); }
      .enrg-energy-overlay { position: absolute; top: 0; right: 0; width: 100%; max-width: 320px; height: 100%; pointer-events: none; z-index: 1; }
      .enrg-energy-node { position: absolute; width: 86px; height: 86px; border-radius: 50%; border: 1px solid rgba(59,130,246,0.22); background: rgba(1,10,21,0.72); box-shadow: 0 0 28px rgba(0,229,255,0.18); display: flex; align-items: center; justify-content: center; color: #E5E7EB; font-size: 0.85rem; text-align: center; padding: 12px; opacity: 0.95; animation: floatEnergy 7s ease-in-out infinite; }
      .enrg-energy-node span { display: block; font-size: 0.7rem; margin-top: 8px; color: #A5F3FC; line-height: 1.2; }
      .enrg-energy-node.energy-1 { top: 10%; right: 12%; animation-delay: 0s; }
      .enrg-energy-node.energy-2 { top: 42%; right: 16%; animation-delay: 1.4s; }
      .enrg-energy-node.energy-3 { bottom: 10%; right: 10%; animation-delay: 2.8s; }
      .enrg-energy-ring { position: absolute; top: 26%; right: 18%; width: 140px; height: 140px; border-radius: 50%; border: 1px solid rgba(56,189,248,0.22); box-shadow: 0 0 48px rgba(56,189,248,0.2); animation: pulseGlow 2.8s ease-out infinite; }
      .enrg-energy-path { position: absolute; top: 8%; right: 6%; width: 220px; height: 220px; pointer-events: none; }
      @keyframes floatEnergy { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      @keyframes pulseGlow { 0% { transform: scale(0.92); opacity: 0.4; } 50% { transform: scale(1.02); opacity: 0.65; } 100% { transform: scale(0.92); opacity: 0.4; } }
      .fade-up { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
      .fade-up.visible { opacity: 1; transform: translateY(0); }
      @media (max-width: 767px) {
        .enrg-chat-panel { right: 12px; bottom: 78px; width: calc(100% - 24px); }
        .enrg-step-card { min-height: auto; }
      }
    `;
    document.head.appendChild(style);

    initBackground();
    initModalEvents();
    initStartButtons();
    initNavigationLinks();
    initDocumentationButtons();
    initSimulateButtons();
    initPartnerContactButtons();
    initFooterLinks();
    initChatAssistant();
    initEnergyDecorations();
    startLiveFeed();
    renderHistory();
    renderDashboardSummary();
    updateMetricCounters();
    applyResponsiveLayout();
    initFadeUpAnimations();
    initMetricScrollAnimation();
    window.addEventListener('resize', applyResponsiveLayout);
    
    updateWalletUI();
    checkExistingWallet();
    
    if (refs.connectWalletBtn) {
      refs.connectWalletBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (state.walletConnected) {
          disconnectWallet();
        } else {
          await connectWallet();
        }
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// Загружаем метрики с Oracle API при загрузке страницы
document.addEventListener('DOMContentLoaded', loadStats);
