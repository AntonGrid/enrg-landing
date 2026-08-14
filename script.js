// ENRG - DePIN Energy Dashboard - Production Module
// Real API integration, Solana blockchain, Phantom wallet
// ============================================================

(function () {
  'use strict';

  // ========== CONFIGURATION ==========
  const CONFIG = {
    API_BASE: (() => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
      }
      return 'http://localhost:3000';
    })(),
    SOLANA_RPC: 'https://api.devnet.solana.com',
    PROGRAM_ID: 'HkuC3FTGAf9ryPqH7fi3RbUHwP4TKFMg5WgHNWm6Vaxb',
    PROFILE_PROGRAM_ID: '78FUdpHn7pWPjnDhA8RWCsXxZq6r4wVPtCcsEKBBvhUt',
    SRC_DECIMALS: 6,
    SRC_MINT: null, // Will be fetched from API
    METRICS_REFRESH_MS: 30000,
    MAX_PROOF_AGE_SEC: 3600,
  };

  // ========== STORAGE KEYS ==========
  const STORAGE = {
    STATE: 'enrgState',
    USER: 'enrgUser',
    DEVICES: 'enrgDevices',
    HISTORY: 'enrgMiningHistory',
    WALLET: 'enrgWalletConnected',
  };

  // ========== DOM HELPERS ==========
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const fmt = (v, d = 0) => v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

  const el = (tag, props = {}, children = []) => {
    const e = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'className') e.className = v;
      else if (k === 'textContent') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'dataset') Object.entries(v).forEach(([dk, dv]) => { e.dataset[dk] = dv; });
      else if (k === 'style') e.style.cssText = v;
      else if (k in e) e[k] = v;
      else e.setAttribute(k, v);
    });
    children.forEach(c => { if (typeof c === 'string') e.appendChild(document.createTextNode(c)); else if (c) e.appendChild(c); });
    return e;
  };

  // ========== STATE ==========
  const defaultState = { step: 1, onboarded: false, walletConnected: false, walletAddress: '', inviteUsed: false, requestedAccess: false };
  const loadJSON = (key, fallback) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } };
  const saveJSON = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  let state = loadJSON(STORAGE.STATE, { ...defaultState });
  let walletPublicKey = null;
  let walletBalance = 0;
  let srcBalance = 0;
  let networkStats = { total_energy_mwh: 0, active_producers: 0, total_supply: 0 };
  let apiAvailable = false;
  let metricsInterval = null;

  // ========== REFS ==========
  const refs = {};
  function resolveRefs() {
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
    refs.simSrcBar = document.getElementById('sim-src-bar');
    refs.simEnergyValue = document.getElementById('sim-energy-value');
    refs.simSrcValue = document.getElementById('sim-src-value');
    refs.simFeeBuyback = document.getElementById('sim-fee-buyback');
    refs.simFeeStaking = document.getElementById('sim-fee-staking');
    refs.simFeeDao = document.getElementById('sim-fee-dao');
    refs.simFeeEmergency = document.getElementById('sim-fee-emergency');
    refs.simulateButtons = [document.getElementById('btn-simulate-mint'), document.getElementById('btn-simulate-mint-modal')].filter(Boolean);
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
    refs.connectWalletBtn = document.getElementById('btn-connect-wallet');
    refs.walletAddressDisplay = document.getElementById('wallet-address-display');
    refs.walletBalanceSpan = document.getElementById('wallet-balance');
    refs.heroProducers = document.getElementById('hero-producers');
    refs.heroEnergy = document.getElementById('hero-energy');
    refs.mintStatus = document.getElementById('mint-status');
  }

  // ========== API ==========
  async function apiFetch(path, options = {}) {
    const url = `${CONFIG.API_BASE}${path}`;
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        throw new Error('Network unavailable, try again later');
      }
      throw err;
    }
  }

  async function loadMetrics() {
    try {
      const stats = await apiFetch('/api/v1/stats');
      networkStats = stats;
      apiAvailable = true;
      updateMetricDisplay();
      addLiveFeedLine(`📊 Stats updated: ${stats.total_energy_mwh} MWh, ${stats.active_producers} producers`);
    } catch (err) {
      apiAvailable = false;
      addLiveFeedLine(`⚠️ API unavailable: ${err.message}`);
    }
  }

  function updateMetricDisplay() {
    const energyEl = document.getElementById('hero-energy');
    const producersEl = document.getElementById('hero-producers');
    if (energyEl) energyEl.textContent = fmt(networkStats.total_energy_mwh, 1);
    if (producersEl) producersEl.textContent = fmt(networkStats.active_producers);
    // Update metric cards
    const counterEls = $$('.counter');
    if (counterEls.length >= 3) {
      counterEls[0].textContent = fmt(networkStats.total_energy_mwh, 1);
      counterEls[1].textContent = fmt(networkStats.active_producers);
      counterEls[2].textContent = fmt(networkStats.total_supply, 1);
    }
  }

  // ========== WALLET ==========
  async function getSrcBalance(publicKey) {
    if (!CONFIG.SRC_MINT) return 0;
    try {
      const connection = new solanaWeb3.Connection(CONFIG.SOLANA_RPC, 'confirmed');
      const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, { mint: new solanaWeb3.PublicKey(CONFIG.SRC_MINT) });
      if (tokenAccounts.value.length > 0) {
        const accountInfo = await connection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);
        return accountInfo.value.uiAmount || 0;
      }
      return 0;
    } catch (err) {
      console.warn('SRC balance fetch error:', err);
      return 0;
    }
  }

  async function getSolBalance(publicKey) {
    try {
      const connection = new solanaWeb3.Connection(CONFIG.SOLANA_RPC, 'confirmed');
      const lamports = await connection.getBalance(publicKey);
      return lamports / solanaWeb3.LAMPORTS_PER_SOL;
    } catch { return 0; }
  }

  function updateWalletUI() {
    if (refs.walletAddressDisplay) {
      refs.walletAddressDisplay.textContent = state.walletConnected && state.walletAddress
        ? `${state.walletAddress.slice(0, 4)}...${state.walletAddress.slice(-4)}`
        : 'Not connected';
    }
    if (refs.walletBalanceSpan) {
      refs.walletBalanceSpan.textContent = state.walletConnected
        ? `${walletBalance.toFixed(4)} SOL · ${srcBalance.toFixed(2)} SRC`
        : '— SOL';
    }
    if (refs.connectWalletBtn) {
      if (state.walletConnected) {
        refs.connectWalletBtn.textContent = 'Disconnect';
        refs.connectWalletBtn.className = 'btn-secondary';
      } else {
        refs.connectWalletBtn.textContent = 'Connect Wallet';
        refs.connectWalletBtn.className = 'btn-outline';
      }
    }
  }

  async function connectWallet() {
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
      saveJSON(STORAGE.STATE, state);
      localStorage.setItem(STORAGE.WALLET, state.walletAddress);

      walletBalance = await getSolBalance(walletPublicKey);
      srcBalance = await getSrcBalance(walletPublicKey);
      updateWalletUI();
      addLiveFeedLine(`✅ Wallet connected: ${state.walletAddress.slice(0, 6)}... | ${walletBalance.toFixed(4)} SOL | ${srcBalance.toFixed(2)} SRC`);

      if (refs.modal && refs.modal.getAttribute('aria-hidden') === 'false') renderModal();
      return true;
    } catch (error) {
      console.error('Wallet connection error:', error);
      addLiveFeedLine(`❌ Wallet connection failed`);
      return false;
    }
  }

  function disconnectWallet() {
    if (window.solana && window.solana.isConnected) window.solana.disconnect();
    state.walletConnected = false;
    state.walletAddress = '';
    walletPublicKey = null;
    walletBalance = 0;
    srcBalance = 0;
    saveJSON(STORAGE.STATE, state);
    localStorage.removeItem(STORAGE.WALLET);
    updateWalletUI();
    addLiveFeedLine('🔌 Wallet disconnected');
  }

  async function checkExistingWallet() {
    if (window.solana && window.solana.isConnected && window.solana.publicKey) {
      const addr = window.solana.publicKey.toString();
      if (addr === state.walletAddress) {
        walletPublicKey = window.solana.publicKey;
        state.walletConnected = true;
        walletBalance = await getSolBalance(walletPublicKey);
        srcBalance = await getSrcBalance(walletPublicKey);
        updateWalletUI();
        return true;
      }
    } else if (localStorage.getItem(STORAGE.WALLET)) {
      state.walletAddress = localStorage.getItem(STORAGE.WALLET);
      state.walletConnected = false;
      updateWalletUI();
    }
    return false;
  }

  // ========== REAL MINT TRANSACTION ==========
  async function sendMintTransaction(deviceId, energyWh, nonce, timestamp) {
    if (!state.walletConnected || !walletPublicKey) {
      addLiveFeedLine('❌ Connect wallet first to mint SRC');
      return null;
    }
    if (!window.solanaWeb3) {
      addLiveFeedLine('❌ Solana Web3 library not loaded');
      return null;
    }

    const connection = new solanaWeb3.Connection(CONFIG.SOLANA_RPC, 'confirmed');
    const programId = new solanaWeb3.PublicKey(CONFIG.PROGRAM_ID);

    try {
      addLiveFeedLine(`⏳ Sending mint transaction... (${energyWh} Wh)`);

      // Build OracleReport
      const deviceIdBytes = new solanaWeb3.PublicKey(deviceId.padEnd(44, '0').slice(0, 44));
      const report = {
        device_id: deviceIdBytes,
        timestamp: new solanaWeb3.BN(timestamp),
        energy_wh: new solanaWeb3.BN(energyWh),
        nonce: new solanaWeb3.BN(nonce),
        signature: new Uint8Array(64).fill(0), // Placeholder - oracle fills this
      };

      // Find PDAs
      const [vaultPda] = solanaWeb3.PublicKey.findProgramAddressSync(
        [Buffer.from('vault')], programId
      );
      const [producerPda] = solanaWeb3.PublicKey.findProgramAddressSync(
        [Buffer.from('producer'), walletPublicKey.toBuffer()], programId
      );
      const [buybackPda] = solanaWeb3.PublicKey.findProgramAddressSync(
        [Buffer.from('buyback'), vaultPda.toBuffer()], programId
      );
      const [stakingPda] = solanaWeb3.PublicKey.findProgramAddressSync(
        [Buffer.from('staking'), vaultPda.toBuffer()], programId
      );
      const [daoPda] = solanaWeb3.PublicKey.findProgramAddressSync(
        [Buffer.from('dao'), vaultPda.toBuffer()], programId
      );
      const [emergencyPda] = solanaWeb3.PublicKey.findProgramAddressSync(
        [Buffer.from('emergency'), vaultPda.toBuffer()], programId
      );

      // Get SRC mint from vault
      const vaultAccount = await connection.getAccountInfo(vaultPda);
      if (!vaultAccount) {
        addLiveFeedLine('❌ Vault not initialized on devnet');
        return null;
      }

      // Build instruction data for mint_energy
      // Discriminator for mint_energy (anchor)
      const discriminator = Buffer.from([175, 27, 214, 22, 207, 172, 142, 101]); // sha256("global:mint_energy")[..8]
      const reportData = Buffer.concat([
        deviceIdBytes.toBuffer(),
        Buffer.from(new solanaWeb3.BN(timestamp).toArray('le', 8)),
        Buffer.from(new solanaWeb3.BN(energyWh).toArray('le', 8)),
        Buffer.from(new solanaWeb3.BN(nonce).toArray('le', 8)),
        Buffer.from(new Uint8Array(64).fill(0)), // signature placeholder
      ]);
      const instructionData = Buffer.concat([discriminator, reportData]);

      const instruction = new solanaWeb3.TransactionInstruction({
        programId,
        keys: [
          { pubkey: vaultPda, isSigner: false, isWritable: true },
          { pubkey: walletPublicKey, isSigner: true, isWritable: false },
          { pubkey: producerPda, isSigner: false, isWritable: true },
          { pubkey: buybackPda, isSigner: false, isWritable: true },
          { pubkey: stakingPda, isSigner: false, isWritable: true },
          { pubkey: daoPda, isSigner: false, isWritable: true },
          { pubkey: emergencyPda, isSigner: false, isWritable: true },
          { pubkey: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
          { pubkey: new solanaWeb3.PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
        ],
        data: instructionData,
      });

      const transaction = new solanaWeb3.Transaction().add(instruction);
      transaction.feePayer = walletPublicKey;
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;

      const signed = await window.solana.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signed.serialize());
      addLiveFeedLine(`⏳ Transaction sent: ${txid.slice(0, 8)}... Waiting for confirmation`);

      const confirmation = await connection.confirmTransaction(txid, 'confirmed');
      if (confirmation.value.err) {
        addLiveFeedLine(`❌ Transaction failed: ${confirmation.value.err}`);
        return null;
      }

      addLiveFeedLine(`✅ Mint successful! TX: ${txid.slice(0, 16)}...`);
      
      // Refresh balances
      walletBalance = await getSolBalance(walletPublicKey);
      srcBalance = await getSrcBalance(walletPublicKey);
      updateWalletUI();

      return txid;
    } catch (err) {
      console.error('Mint transaction error:', err);
      addLiveFeedLine(`❌ Mint failed: ${err.message}`);
      return null;
    }
  }

  // ========== SIMULATE / REAL MINT ==========
  async function simulateMining() {
    const devices = loadJSON(STORAGE.DEVICES, []);
    const selectedDevice = devices.length ? devices[Math.floor(Math.random() * devices.length)] : null;
    const kWh = Math.floor(Math.random() * 500) + 1;
    const enrg = kWh / 1000;
    const fee = enrg * 0.15;
    const distribution = {
      buyback: fee * 0.2,
      staking: fee * 0.4,
      dao: fee * 0.3,
      emergency: fee * 0.1,
    };
    const deviceName = selectedDevice ? selectedDevice.name || selectedDevice.id : 'Virtual device';

    // Animate bars
    const animateBar = (bar, pct) => {
      if (!bar) return;
      bar.style.transition = 'width 0.8s ease';
      bar.style.width = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = `${Math.min(100, Math.max(0, pct))}%`; }));
    };
    animateBar(refs.simEnergyBar, (kWh / 500) * 100);
    animateBar(refs.simSrcBar, Math.min(100, (enrg / 0.5) * 100));
    animateBar(refs.simFeeBuyback, distribution.buyback / fee * 100);
    animateBar(refs.simFeeStaking, distribution.staking / fee * 100);
    animateBar(refs.simFeeDao, distribution.dao / fee * 100);
    animateBar(refs.simFeeEmergency, distribution.emergency / fee * 100);

    if (refs.simEnergyValue) refs.simEnergyValue.textContent = `${kWh}`;
    if (refs.simSrcValue) refs.simSrcValue.textContent = `${enrg.toFixed(3)}`;

    // Try real transaction if wallet connected
    if (state.walletConnected && walletPublicKey && selectedDevice) {
      const nonce = Math.floor(Date.now() / 1000);
      const timestamp = Math.floor(Date.now() / 1000);
      const energyWh = kWh * 1000;
      const txid = await sendMintTransaction(selectedDevice.id || selectedDevice.device_id, energyWh, nonce, timestamp);
      
      if (txid) {
        addLiveFeedLine(`✅ ${deviceName} minted ${kWh} kWh → ${enrg.toFixed(3)} SRC. TX: ${txid.slice(0, 16)}...`);
        const history = loadJSON(STORAGE.HISTORY, []);
        history.unshift({
          timestamp: new Date().toISOString(),
          deviceName,
          source: selectedDevice.source || 'Solar',
          kWh,
          enrg,
          fee,
          distribution,
          txid,
          status: 'confirmed',
        });
        saveJSON(STORAGE.HISTORY, history);
        renderDashboardSummary();
        renderHistory();
        return;
      }
    }

    // Fallback: local simulation
    addLiveFeedLine(`⚡ ${deviceName} produced ${kWh} kWh → ${enrg.toFixed(3)} SRC (simulated)`);
    const history = loadJSON(STORAGE.HISTORY, []);
    history.unshift({
      timestamp: new Date().toISOString(),
      deviceName,
      source: selectedDevice?.source || 'Solar',
      kWh,
      enrg,
      fee,
      distribution,
      txid: null,
      status: 'simulated',
    });
    saveJSON(STORAGE.HISTORY, history);
    renderDashboardSummary();
    renderHistory();
  }

  // ========== LIVE FEED ==========
  function addLiveFeedLine(text) {
    if (!refs.consoleFeed) return;
    const line = el('div', {
      className: 'console-line',
      textContent: `[${new Date().toLocaleTimeString('en-US')}] ${text}`,
      style: 'padding:10px 0;border-bottom:1px solid rgba(148,163,184,0.08);'
    });
    refs.consoleFeed.appendChild(line);
    while (refs.consoleFeed.children.length > 40) refs.consoleFeed.removeChild(refs.consoleFeed.firstChild);
    refs.consoleFeed.scrollTop = refs.consoleFeed.scrollHeight;
  }

  function startLiveFeed() {
    addLiveFeedLine(`🌐 ENRG oracle: ${apiAvailable ? 'connected' : 'connecting...'}`);
    addLiveFeedLine(`📊 Network: ${networkStats.active_producers} producers, ${networkStats.total_energy_mwh} MWh`);
    if (state.walletConnected) {
      addLiveFeedLine(`👛 Wallet: ${state.walletAddress.slice(0, 6)}... | ${srcBalance.toFixed(2)} SRC`);
    }
  }

  // ========== MODAL ==========
  function openModal() {
    if (!refs.modal) return;
    refs.modal.classList.add('active');
    refs.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderModal();
  }

  function closeModal() {
    if (!refs.modal) return;
    refs.modal.classList.remove('active');
    refs.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderProgressBar() {
    const existing = document.getElementById('enrg-progress-container');
    if (existing) return existing;
    if (!refs.modalBody) return null;
    const container = el('div', { id: 'enrg-progress-container', style: 'margin-bottom:24px;' });
    const stepLabels = ['Access', 'Wallet', 'Device', 'Dashboard'];
    const stepRow = el('div', { className: 'enrg-progress-steps' });
    stepLabels.forEach(() => stepRow.appendChild(el('div', { className: 'enrg-progress-step' })));
    const bar = el('div', { className: 'enrg-progress-bar-container' }, [
      el('div', { className: 'enrg-progress-bar-fill' }),
    ]);
    container.appendChild(stepRow);
    container.appendChild(bar);
    refs.modalBody.prepend(container);
    return container;
  }

  function updateProgress() {
    const container = renderProgressBar();
    if (!container) return;
    const steps = container.querySelectorAll('.enrg-progress-step');
    const fill = container.querySelector('.enrg-progress-bar-fill');
    const currentIndex = Math.min(3, Math.max(0, state.step - 1));
    steps.forEach((step, index) => step.classList.toggle('active', index <= currentIndex));
    if (fill) fill.style.width = `${((currentIndex + 1) / steps.length) * 100}%`;
  }

  function renderModal() {
    if (!refs.modalBody || !refs.modalHeaderTitle) return;
    refs.modalBody.innerHTML = '';
    refs.modalHeaderTitle.textContent = state.onboarded ? 'Welcome back to ENRG Protocol' : 'Onboard your energy source';
    updateProgress();
    const wrapper = el('div', { style: 'display:flex;flex-direction:column;gap:18px;max-width:100%;' });
    if (!state.onboarded) {
      if (state.step === 1.5) wrapper.appendChild(renderInviteCodeStep());
      else if (state.step === 1.1) wrapper.appendChild(renderRegistrationStep());
      else if (state.step === 2) wrapper.appendChild(renderWalletStep());
      else if (state.step === 3) wrapper.appendChild(renderDeviceStep());
      else wrapper.appendChild(renderInviteChoiceStep());
    } else {
      wrapper.appendChild(renderDashboardStep());
    }
    const resetAction = el('button', { type: 'button', className: 'btn-secondary', textContent: 'Start Over', style: 'align-self:flex-start;margin-top:10px;' });
    resetAction.addEventListener('click', (e) => { e.preventDefault(); resetOnboarding(); });
    wrapper.appendChild(resetAction);
    refs.modalBody.appendChild(wrapper);
  }

  function renderInviteChoiceStep() {
    const section = el('div', {});
    section.appendChild(el('p', { textContent: 'Start with an invite code or request access to join the ENRG network and start earning SRC tokens.', style: 'color:var(--text-muted);' }));
    const row = el('div', { style: 'display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;' });
    const inviteButton = el('button', { type: 'button', className: 'btn-primary', textContent: 'I have an invite code' });
    inviteButton.addEventListener('click', () => { state.step = 1.5; saveJSON(STORAGE.STATE, state); renderModal(); });
    const requestButton = el('button', { type: 'button', className: 'btn-secondary', textContent: 'Request access' });
    requestButton.addEventListener('click', () => { state.step = 1.1; saveJSON(STORAGE.STATE, state); renderModal(); });
    row.appendChild(inviteButton);
    row.appendChild(requestButton);
    section.appendChild(row);
    return section;
  }

  function renderInviteCodeStep() {
    const section = el('div', {});
    section.appendChild(el('p', { textContent: 'Enter your invite code to continue onboarding.', style: 'color:var(--text-muted);' }));
    const form = el('form', { style: 'display:flex;flex-direction:column;gap:14px;margin-top:18px;' });
    const codeInput = el('input', { type: 'text', placeholder: 'Invite code', required: true, style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#E5E7EB;' });
    const continueButton = el('button', { type: 'submit', className: 'btn-primary', textContent: 'Continue' });
    form.appendChild(codeInput);
    form.appendChild(continueButton);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!codeInput.value.trim()) { alert('Please enter your invite code.'); return; }
      state.inviteUsed = true;
      state.step = 2;
      saveJSON(STORAGE.STATE, state);
      renderModal();
    });
    section.appendChild(form);
    return section;
  }

  function renderRegistrationStep() {
    const section = el('div', {});
    section.appendChild(el('p', { textContent: 'Register with your email and password to join ENRG and start minting SRC tokens.', style: 'color:var(--text-muted);' }));
    const form = el('form', { style: 'display:flex;flex-direction:column;gap:14px;margin-top:18px;' });
    const emailInput = el('input', { type: 'email', placeholder: 'Email address', required: true, style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#E5E7EB;' });
    const passwordInput = el('input', { type: 'password', placeholder: 'Password', required: true, style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#E5E7EB;' });
    const registerButton = el('button', { type: 'submit', className: 'btn-primary', textContent: 'Register' });
    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(registerButton);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      if (!email || !password) { alert('Please provide both email and password.'); return; }
      saveJSON(STORAGE.USER, { email, password, registeredAt: new Date().toISOString() });
      state.requestedAccess = true;
      state.step = 2;
      saveJSON(STORAGE.STATE, state);
      renderModal();
    });
    section.appendChild(form);
    return section;
  }

  function renderWalletStep() {
    const section = el('div', {});
    section.appendChild(el('p', { textContent: 'Connect Phantom to secure wallet actions or skip and continue with onboarding.', style: 'color:var(--text-muted);' }));
    const actionRow = el('div', { style: 'display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;' });
    const connectButton = el('button', { type: 'button', className: 'btn-primary', textContent: 'Connect Phantom' });
    connectButton.addEventListener('click', async () => { await connectWallet(); });
    const skipButton = el('button', { type: 'button', className: 'btn-secondary', textContent: 'Skip for now' });
    skipButton.addEventListener('click', () => { state.walletConnected = false; state.step = 3; saveJSON(STORAGE.STATE, state); renderModal(); });
    actionRow.appendChild(connectButton);
    actionRow.appendChild(skipButton);
    section.appendChild(actionRow);
    return section;
  }

  function renderDeviceStep() {
    const section = el('div', {});
    section.appendChild(el('p', { textContent: 'Register your first device and start tokenizing energy production.', style: 'color:var(--text-muted);' }));
    const form = el('form', { style: 'display:flex;flex-direction:column;gap:14px;margin-top:18px;' });
    const nameInput = el('input', { type: 'text', placeholder: 'Device name', required: true, style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#E5E7EB;' });
    const idInput = el('input', { type: 'text', placeholder: 'Device ID', required: true, style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#E5E7EB;' });
    const sourceSelect = el('select', { required: true, style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#E5E7EB;' });
    ['Solar', 'Wind', 'Hydro', 'Biogas'].forEach((src) => sourceSelect.appendChild(el('option', { value: src }, [src])));
    const registerButton = el('button', { type: 'submit', className: 'btn-primary', textContent: 'Register Device' });
    form.appendChild(nameInput);
    form.appendChild(idInput);
    form.appendChild(sourceSelect);
    form.appendChild(registerButton);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const id = idInput.value.trim();
      const source = sourceSelect.value;
      if (!name || !id || !source) { alert('Please fill device name, ID, and source.'); return; }
      
      // Try to register via API
      try {
        const result = await apiFetch('/api/v1/device/register', {
          method: 'POST',
          body: JSON.stringify({ device_id: id, public_key: name }),
        });
        addLiveFeedLine(`✅ Device registered via API: ${id}`);
      } catch (err) {
        addLiveFeedLine(`⚠️ API registration failed (${err.message}), saving locally`);
      }
      
      const devices = loadJSON(STORAGE.DEVICES, []);
      devices.unshift({ name, id, source, registeredAt: new Date().toISOString() });
      saveJSON(STORAGE.DEVICES, devices);
      state.onboarded = true;
      state.step = 4;
      saveJSON(STORAGE.STATE, state);
      renderDashboardSummary();
      renderHistory();
      renderModal();
    });
    section.appendChild(form);
    return section;
  }

  function renderDashboardStep() {
    const section = el('div', {});
    const devices = loadJSON(STORAGE.DEVICES, []);
    if (!devices.length) {
      section.appendChild(el('p', { textContent: 'Complete device registration to unlock live mining and dashboard insights.', style: 'color:var(--text-muted);' }));
    } else {
      section.appendChild(el('p', { textContent: 'Your onboarding is complete. Use the simulator to mint SRC from verified production.', style: 'color:var(--text-muted);' }));
    }
    const actionRow = el('div', { style: 'display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;' });
    const simButton = el('button', { type: 'button', className: 'btn-primary', textContent: 'Simulate Mining' });
    simButton.addEventListener('click', () => { if (refs.simulateButtons.length) refs.simulateButtons[0].click(); else simulateMining(); });
    actionRow.appendChild(simButton);
    section.appendChild(actionRow);
    return section;
  }

  // ========== DASHBOARD ==========
  function renderDashboardSummary() {
    if (!refs.dashboard) return;
    let summary = refs.dashboard.querySelector('.enrg-dashboard-summary');
    if (!summary) {
      summary = el('div', { className: 'enrg-dashboard-summary', style: 'margin-top:24px;padding:22px;border:1px solid rgba(148,163,184,0.2);border-radius:22px;background:rgba(15,23,42,0.72);' });
      refs.dashboard.appendChild(summary);
    }
    const devices = loadJSON(STORAGE.DEVICES, []);
    const history = loadJSON(STORAGE.HISTORY, []);
    summary.innerHTML = '';
    const header = el('div', { style: 'display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;' });
    header.appendChild(el('h3', { textContent: 'SRC Dashboard Summary', style: 'margin:0;font-size:1.15rem;' }));
    const resetButton = el('button', { type: 'button', className: 'btn-secondary', textContent: 'Start Over', style: 'white-space:nowrap;' });
    resetButton.addEventListener('click', (e) => { e.preventDefault(); resetOnboarding(); });
    header.appendChild(resetButton);
    summary.appendChild(header);
    if (!devices.length) {
      summary.appendChild(el('p', { textContent: 'No registered devices yet. Complete onboarding to start minting SRC from verified energy production.', style: 'color:var(--text-muted);margin-top:16px;max-width:720px;' }));
      return;
    }
    const deviceGrid = el('div', { style: 'display:grid;gap:16px;margin-top:20px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));' });
    devices.forEach((device) => {
      const card = el('div', { style: 'padding:18px;border:1px solid rgba(148,163,184,0.18);border-radius:18px;background:rgba(12,17,28,0.9);' });
      card.appendChild(el('div', { textContent: device.name, style: 'font-weight:700;margin-bottom:10px;' }));
      card.appendChild(el('div', { textContent: `ID: ${device.id}`, style: 'color:var(--text-muted);margin-bottom:6px;' }));
      card.appendChild(el('div', { textContent: `Source: ${device.source}`, style: 'color:var(--text-muted);' }));
      card.appendChild(el('div', { textContent: `Status: ${device.status || 'Active'}`, style: `color:${(device.status === 'Active' || !device.status) ? '#22C55E' : '#FF6B00'};font-size:0.85rem;` }));
      deviceGrid.appendChild(card);
    });
    summary.appendChild(deviceGrid);
    const statsRow = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:20px;' });
    statsRow.appendChild(el('div', { style: 'padding:18px;border:1px solid rgba(148,163,184,0.18);border-radius:18px;background:rgba(12,17,28,0.9);' }, [
      el('div', { textContent: 'Registered Devices', style: 'color:var(--text-muted);margin-bottom:6px;' }),
      el('div', { textContent: `${devices.length}`, style: 'font-size:1.4rem;font-weight:700;' }),
    ]));
    statsRow.appendChild(el('div', { style: 'padding:18px;border:1px solid rgba(148,163,184,0.18);border-radius:18px;background:rgba(12,17,28,0.9);' }, [
      el('div', { textContent: 'Mining Events', style: 'color:var(--text-muted);margin-bottom:6px;' }),
      el('div', { textContent: `${history.length}`, style: 'font-size:1.4rem;font-weight:700;' }),
    ]));
    statsRow.appendChild(el('div', { style: 'padding:18px;border:1px solid rgba(148,163,184,0.18);border-radius:18px;background:rgba(12,17,28,0.9);' }, [
      el('div', { textContent: 'Wallet', style: 'color:var(--text-muted);margin-bottom:6px;' }),
      el('div', { textContent: state.walletConnected ? `${srcBalance.toFixed(2)} SRC` : 'Not connected', style: 'font-size:1.4rem;font-weight:700;' }),
    ]));
    summary.appendChild(statsRow);
  }

  function renderHistory() {
    if (!refs.historyBody) return;
    const history = loadJSON(STORAGE.HISTORY, []);
    refs.historyBody.innerHTML = '';
    if (!history.length) {
      refs.historyBody.appendChild(el('p', { textContent: 'No mining history yet. Connect wallet and register a device to start minting SRC.', style: 'color:var(--text-muted);text-align:center;padding:20px;' }));
      return;
    }
    const table = el('table', { style: 'width:100%;border-collapse:collapse;' });
    const thead = el('thead', {}, [
      el('tr', {}, [
        el('th', { textContent: 'Timestamp', style: 'text-align:left;padding:10px;border-bottom:1px solid rgba(148,163,184,0.2);' }),
        el('th', { textContent: 'Device', style: 'text-align:left;padding:10px;border-bottom:1px solid rgba(148,163,184,0.2);' }),
        el('th', { textContent: 'Source', style: 'text-align:left;padding:10px;border-bottom:1px solid rgba(148,163,184,0.2);' }),
        el('th', { textContent: 'kWh', style: 'text-align:right;padding:10px;border-bottom:1px solid rgba(148,163,184,0.2);' }),
        el('th', { textContent: 'SRC', style: 'text-align:right;padding:10px;border-bottom:1px solid rgba(148,163,184,0.2);' }),
        el('th', { textContent: 'Status', style: 'text-align:center;padding:10px;border-bottom:1px solid rgba(148,163,184,0.2);' }),
      ]),
    ]);
    table.appendChild(thead);
    const tbody = el('tbody', {});
    history.forEach((entry) => {
      const statusColor = entry.status === 'confirmed' ? '#22C55E' : entry.status === 'simulated' ? '#FACC15' : '#FF6B00';
      const row = el('tr', {}, [
        el('td', { textContent: new Date(entry.timestamp).toLocaleString(), style: 'padding:10px;border-bottom:1px solid rgba(148,163,184,0.1);' }),
        el('td', { textContent: entry.deviceName, style: 'padding:10px;border-bottom:1px solid rgba(148,163,184,0.1);' }),
        el('td', { textContent: entry.source, style: 'padding:10px;border-bottom:1px solid rgba(148,163,184,0.1);' }),
        el('td', { textContent: `${entry.kWh}`, style: 'text-align:right;padding:10px;border-bottom:1px solid rgba(148,163,184,0.1);' }),
        el('td', { textContent: entry.enrg.toFixed(3), style: 'text-align:right;padding:10px;border-bottom:1px solid rgba(148,163,184,0.1);' }),
        el('td', { textContent: entry.status || 'simulated', style: `text-align:center;padding:10px;border-bottom:1px solid rgba(148,163,184,0.1);color:${statusColor};` }),
      ]);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    refs.historyBody.appendChild(table);
  }

  // ========== ONBOARDING ==========
  function handleGetStarted() {
    if (state.onboarded) { const d = document.getElementById('dashboard'); if (d) d.scrollIntoView({ behavior: 'smooth' }); return; }
    openModal();
  }

  function resetOnboarding() {
    Object.keys(STORAGE).forEach(k => localStorage.removeItem(STORAGE[k]));
    Object.assign(state, { ...defaultState });
    renderDashboardSummary();
    renderHistory();
    if (refs.modal) { openModal(); renderModal(); }
  }

  // ========== BACKGROUND ==========
  function initBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [], w, h;
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();
    const colors = [{ c: '#00E5FF', glow: 'rgba(0,229,255,0.7)' }, { c: '#FF6B00', glow: 'rgba(255,107,0,0.7)' }];
    function createParticle() {
      const color = colors[Math.floor(Math.random() * colors.length)];
      return { x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 2 + 0.6, color: color.c, glow: color.glow };
    }
    function init() { particles = []; for (let i = 0; i < 120; i++) particles.push(createParticle()); }
    function draw() {
      ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = 'lighter';
      for (const p of particles) {
        ctx.beginPath(); const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        gradient.addColorStop(0, p.glow); gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient; ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.fillStyle = p.color; ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
      }
      requestAnimationFrame(draw);
    }
    init(); draw();
  }

  // ========== CHAT ==========
  function initChatAssistant() {
    if (document.getElementById('enrg-chat-button')) return;
    const button = el('button', { id: 'enrg-chat-button', className: 'enrg-chat-button', textContent: '💬', type: 'button' });
    const panel = el('div', { className: 'enrg-chat-panel', id: 'enrg-chat-panel' });
    const header = el('div', { className: 'enrg-chat-header' }, [
      el('div', { textContent: 'ENRG Protocol Assistant' }),
      el('button', { type: 'button', textContent: '×', style: 'background:none;border:none;color:#E5E7EB;font-size:1.2rem;cursor:pointer;' }),
    ]);
    const body = el('div', { className: 'enrg-chat-body' });
    const actions = el('div', { className: 'enrg-chat-actions' });
    const hints = ['How do I connect a device?', 'Explain the tokenomics.', 'What does SRC staking do?'];
    hints.forEach((hint) => {
      const hintButton = el('button', { type: 'button', className: 'enrg-chat-action', textContent: hint });
      hintButton.addEventListener('click', () => {
        body.innerHTML = '';
        body.appendChild(el('div', { className: 'enrg-chat-message', html: `<strong>Assistant:</strong> ${generateChatReply(hint)}` }));
      });
      actions.appendChild(hintButton);
    });
    body.appendChild(el('div', { className: 'enrg-chat-message', textContent: 'Ask me about ENRG onboarding, SRC minting, or documentation.' }));
    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(actions);
    button.addEventListener('click', () => panel.classList.toggle('active'));
    header.querySelector('button').addEventListener('click', () => panel.classList.remove('active'));
    document.body.appendChild(button);
    document.body.appendChild(panel);
  }

  function generateChatReply(prompt) {
    const responses = {
      'How do I connect a device?': 'Use the onboarding modal to register your device name, ID, and energy source. Then connect Phantom wallet and click "Simulate Mint" to send a real transaction to Solana Devnet.',
      'Explain the tokenomics.': 'SRC is deflationary: max supply 1,000,000,000 SRC, 1 SRC = 1 MWh. Every mint charges a 15% fee split into buyback (20%), staking (40%), DAO (30%), and emergency (10%).',
      'What does SRC staking do?': 'Staking increases network security and rewards long-term holders with a share of protocol fees.',
    };
    return responses[prompt] || 'ENRG connects renewable energy production to SRC token issuance via IoT-verification and Solana minting. 1 SRC = 1 MWh. Connect wallet and register a device to start.';
  }

  // ========== EVENTS ==========
  function initModalEvents() {
    if (!refs.modal) return;
    if (refs.modalClose) refs.modalClose.addEventListener('click', closeModal);
    refs.modal.addEventListener('click', (e) => { if (e.target === refs.modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && refs.modal && refs.modal.getAttribute('aria-hidden') === 'false') closeModal(); });
  }

  function initStartButtons() {
    [refs.heroStart, refs.heroStartAlt, refs.headerStart].forEach((button) => {
      if (!button) return;
      button.addEventListener('click', (e) => { e.preventDefault(); handleGetStarted(); });
    });
    const howButton = document.getElementById('btn-how-start');
    if (howButton) howButton.addEventListener('click', (e) => { e.preventDefault(); handleGetStarted(); });
  }

  function initNavigationLinks() {
    $$('.nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = $(href);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  function initDocumentationButtons() {
    if (refs.downloadWhitepaper) refs.downloadWhitepaper.addEventListener('click', (e) => { e.preventDefault(); window.open('whitepaper.html', '_blank', 'noopener'); });
    if (refs.technicalDocs) refs.technicalDocs.addEventListener('click', (e) => { e.preventDefault(); window.open('technical-overview.html', '_blank', 'noopener'); });
  }

  function initSimulateButtons() {
    refs.simulateButtons.forEach(button => {
      if (button) button.addEventListener('click', (e) => { e.preventDefault(); simulateMining(); });
    });
  }

  function initPartnerContactButtons() {
    if (refs.becomePartner) refs.becomePartner.addEventListener('click', (e) => { e.preventDefault(); window.location.assign('mailto:anton@enrg.network'); });
    if (refs.contactButton) refs.contactButton.addEventListener('click', (e) => { e.preventDefault(); window.location.assign('mailto:anton@enrg.network'); });
  }

  function initFadeUpAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    $$('.fade-up').forEach((el) => observer.observe(el));
  }

  // ========== MAIN INIT ==========
  async function init() {
    // Inject dynamic styles
    const style = el('style', { type: 'text/css' });
    style.textContent = `
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
      .fade-up { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
      .fade-up.visible { opacity: 1; transform: translateY(0); }
      @media (max-width: 767px) { .enrg-chat-panel { right: 12px; bottom: 78px; width: calc(100% - 24px); } }
    `;
    document.head.appendChild(style);

    // Load Solana Web3 from CDN if not present
    if (!window.solanaWeb3) {
      addLiveFeedLine('📦 Loading Solana Web3 library...');
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@solana/web3.js@1.95.3/lib/index.iife.min.js';
        script.onload = resolve;
        script.onerror = () => { addLiveFeedLine('⚠️ Solana Web3 CDN unavailable, using simulation mode'); resolve(); };
        document.head.appendChild(script);
      });
    }

    resolveRefs();
    initBackground();
    initModalEvents();
    initStartButtons();
    initNavigationLinks();
    initDocumentationButtons();
    initSimulateButtons();
    initPartnerContactButtons();
    initChatAssistant();
    initFadeUpAnimations();

    // Load real metrics
    await loadMetrics();
    startLiveFeed();
    
    // Periodic metrics refresh
    metricsInterval = setInterval(loadMetrics, CONFIG.METRICS_REFRESH_MS);

    renderHistory();
    renderDashboardSummary();
    updateWalletUI();
    await checkExistingWallet();

    // Wallet button
    if (refs.connectWalletBtn) {
      refs.connectWalletBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (state.walletConnected) disconnectWallet();
        else await connectWallet();
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
