// ENRG landing page orchestration: onboarding, docs, simulation and responsive layout
(function () {
  'use strict';

  const STORAGE_STATE = 'enrgState';
  const STORAGE_USER = 'enrgUser';
  const STORAGE_DEVICES = 'enrgDevices';
  const STORAGE_HISTORY = 'enrgMiningHistory';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

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

  const refs = {
    modal: $('#mint-modal'),
    modalBody: $('#mint-modal .modal-body'),
    modalTitle: $('#mint-modal-title'),
    modalClose: $('#mint-modal-close'),
    heroStart: $('#btn-start-minting-hero'),
    heroStartAlt: $('#btn-start-minting'),
    headerStart: $('#btn-get-started'),
    downloadWhitepaper: $('#btn-download-whitepaper'),
    technicalDocs: $('#btn-technical-docs'),
    dashboard: $('#dashboard'),
    historyBody: $('#history-body'),
    consoleFeed: $('#console-feed'),
    simEnergyBar: $('#sim-energy-bar'),
    simEnrgBar: $('#sim-enrg-bar'),
    simEnergyValue: $('#sim-energy-value'),
    simEnrgValue: $('#sim-enrg-value'),
    simulateButtons: [$('#btn-simulate-mint'), $('#btn-simulate-mint-modal')].filter(Boolean),
    becomePartner: $('#btn-become-partner'),
    contactButton: $('#btn-contact'),
    heroTitle: $('.hero-title'),
    heroTagline: $('.hero-tagline'),
    heroSlogan: $('.hero-slogan'),
    heroActions: $('.hero-actions'),
    heroGrid: $('.hero-grid'),
    metricsGrid: $('.metrics-grid'),
    footerLinks: $('.footer-links'),
  };

  const energySources = [
    { name: 'Solar', multiplier: 1.0 },
    { name: 'Wind', multiplier: 0.8 },
    { name: 'Hydro', multiplier: 0.5 },
  ];

  const liveFeedSources = ['Node-01', 'SolarRig-12', 'WindFarm-7B', 'HydroUnit-3C', 'Rooftop-Alpha', 'GridEdge-09'];
  const liveFeedActions = ['reported', 'minted', 'verified', 'streamed', 'settled', 'synced'];
  const liveFeedUnits = ['kWh', 'MWh'];

  const isMobile = () => window.innerWidth < 768;

  const setModalActive = (active) => {
    if (!refs.modal) return;
    refs.modal.style.display = active ? 'flex' : 'none';
    refs.modal.setAttribute('aria-hidden', active ? 'false' : 'true');
    document.body.style.overflow = active ? 'hidden' : '';
  };

  const openModal = () => {
    setModalActive(true);
    renderModal();
  };

  const closeModal = () => {
    setModalActive(false);
  };

  const scrollToElement = (selector) => {
    const target = $(selector);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openDocumentationPage = (href) => {
    if (!href) return;
    window.open(href, '_blank', 'noopener');
  };

  const openEmailContact = () => {
    window.location.assign('mailto:anton@enrg.network');
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
      setModalActive(true);
      renderModal();
    }
  };

  const buildMetricValue = (value) => value.toLocaleString('en-US');

  const renderHistory = () => {
    if (!refs.historyBody) return;
    const history = loadHistory();
    refs.historyBody.innerHTML = history
      .slice(0, 20)
      .map((entry) => {
        const timestamp = new Date(entry.timestamp).toLocaleString('en-US');
        return `
          <tr>
            <td>${timestamp}</td>
            <td>${entry.deviceName}</td>
            <td>${entry.kWh}</td>
            <td>${entry.enrg.toFixed(3)}</td>
          </tr>`;
      })
      .join('');
  };

  const addHistoryEntry = (entry) => {
    const history = loadHistory();
    history.unshift(entry);
    if (history.length > 40) history.length = 40;
    saveHistory(history);
    renderHistory();
  };

  const updateMetricCounters = () => {
    const metricEls = $$('.counter');
    if (!metricEls.length) return;
    const targets = metricEls.map((el) => parseInt(el.dataset.target, 10) || 0);
    metricEls.forEach((el, index) => {
      const target = targets[index] || 0;
      const duration = 1400;
      const startTime = performance.now();

      const step = (current) => {
        const progress = Math.min((current - startTime) / duration, 1);
        el.textContent = Math.floor(progress * target).toLocaleString('en-US');
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    });
  };

  const createHowItWorksSection = () => {
    if ($('#how-it-works')) return;

    const section = createElement('section', {
      id: 'how-it-works',
      className: 'section glass-section fade-up',
      style: 'overflow:visible;',
    });

    section.appendChild(createElement('h2', { textContent: 'How It Works' }));
    section.appendChild(createElement('p', {
      textContent: 'Connect devices, onboard your wallet, and start earning ENRG with transparent mining simulations.',
      style: 'color:var(--text-muted);max-width:760px;margin-top:12px;',
    }));

    const cards = createElement('div', {
      className: 'how-grid',
      style: 'display:grid;gap:18px;margin-top:24px;grid-template-columns:repeat(3,minmax(0,1fr));',
    });

    const items = [
      {
        icon: '🔌',
        title: 'Connect a Source',
        description: 'Register your solar, wind, or hydro device and bring physical energy into ENRG.',
      },
      {
        icon: '🦾',
        title: 'Link a Wallet',
        description: 'Use Phantom or skip for now, then secure your onboarding with a wallet address.',
      },
      {
        icon: '⚡',
        title: 'Earn with Mining',
        description: 'Simulate energy generation, mint ENRG, and follow rewards in your live dashboard.',
      },
    ];

    items.forEach((item) => {
      const card = createElement('div', {
        className: 'process-card',
        style: 'padding:24px;border:1px solid rgba(148,163,184,0.2);border-radius:24px;background:rgba(15,23,42,0.65);min-height:220px;display:flex;flex-direction:column;gap:14px;',
      });
      card.appendChild(createElement('div', {
        textContent: item.icon,
        style: 'font-size:1.9rem;',
      }));
      card.appendChild(createElement('h3', { textContent: item.title, style: 'margin:0;font-size:1.05rem;' }));
      card.appendChild(createElement('p', {
        textContent: item.description,
        style: 'color:var(--text-muted);margin:0;flex:1;',
      }));
      cards.appendChild(card);
    });

    section.appendChild(cards);
    section.appendChild(createElement('div', { style: 'margin-top:24px;' }, [
      createElement('button', {
        type: 'button',
        className: 'btn-primary',
        id: 'btn-how-get-started',
        textContent: 'Get Started',
        style: 'width:auto;',
      }),
    ]));

    if (refs.dashboard) {
      refs.dashboard.parentNode.insertBefore(section, refs.dashboard);
    }

    const learnButton = $('#btn-how-get-started');
    if (learnButton) {
      learnButton.addEventListener('click', (event) => {
        event.preventDefault();
        handleGetStarted();
      });
    }
  };

  const enhanceHeroContent = () => {
    if (refs.heroTitle) {
      refs.heroTitle.textContent = 'Turn Energy into Value';
    }
    if (refs.heroTagline) {
      refs.heroTagline.textContent = 'Connect your solar panels or wind turbine to the ENRG protocol. Earn real tokens for every verified megawatt‑hour.';
    }
    if (refs.heroSlogan) {
      refs.heroSlogan.textContent = 'The Only DePIN Protocol with Buyback & Burn – Backed by Real MWh, Not Loyalty Points.';
    }
    if (refs.heroStart) {
      refs.heroStart.textContent = 'Get Started';
    }
    if (refs.downloadWhitepaper) {
      refs.downloadWhitepaper.textContent = 'Download White Paper';
    }
    if (refs.technicalDocs) {
      refs.technicalDocs.textContent = 'Technical Documentation';
    }

    if (refs.heroActions && !$('#btn-learn-more')) {
      const learnMoreButton = createElement('button', {
        type: 'button',
        className: 'btn-secondary',
        id: 'btn-learn-more',
        textContent: 'Learn More',
      });
      refs.heroActions.insertBefore(learnMoreButton, refs.technicalDocs || null);
    }
  };

  const handleGetStarted = () => {
    if (state.onboarded) {
      scrollToElement('#dashboard');
      return;
    }
    openModal();
  };

  const renderDashboardSummary = () => {
    if (!refs.dashboard) return;
    let summary = refs.dashboard.querySelector('.enrg-dashboard-summary');
    if (!summary) {
      summary = createElement('div', {
        className: 'enrg-dashboard-summary',
        style: 'margin-top:24px;padding:22px;border:1px solid rgba(148,163,184,0.2);border-radius:22px;background:rgba(15,23,42,0.68);',
      });
      refs.dashboard.appendChild(summary);
    }

    const devices = loadDevices();
    const history = loadHistory();
    summary.innerHTML = '';

    const header = createElement('div', {
      style: 'display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;',
    });
    header.appendChild(createElement('h3', { textContent: 'ENRG Dashboard Summary', style: 'margin:0;font-size:1.15rem;' }));
    const resetButton = createElement('button', {
      type: 'button',
      className: 'btn-secondary',
      textContent: 'Start Over',
      style: 'white-space:nowrap;',
    });
    resetButton.addEventListener('click', (event) => {
      event.preventDefault();
      resetOnboarding();
    });
    header.appendChild(resetButton);
    summary.appendChild(header);

    if (!devices.length) {
      summary.appendChild(createElement('p', {
        textContent: 'No devices registered yet. Complete onboarding to start mining with ENRG.',
        style: 'color:var(--text-muted);margin-top:16px;max-width:680px;',
      }));
      return;
    }

    const deviceGrid = createElement('div', {
      style: 'display:grid;gap:16px;margin-top:20px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));',
    });
    devices.forEach((device) => {
      const card = createElement('div', {
        style: 'padding:18px;border:1px solid rgba(148,163,184,0.18);border-radius:18px;background:rgba(12,17,28,0.9);',
      });
      card.appendChild(createElement('div', { textContent: device.name, style: 'font-weight:700;margin-bottom:10px;' }));
      card.appendChild(createElement('div', { textContent: `ID: ${device.id}`, style: 'color:var(--text-muted);margin-bottom:6px;' }));
      card.appendChild(createElement('div', { textContent: `Source: ${device.source}`, style: 'color:var(--text-muted);' }));
      deviceGrid.appendChild(card);
    });
    summary.appendChild(deviceGrid);

    summary.appendChild(createElement('div', {
      style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:20px;',
    }, [
      createElement('div', { style: 'padding:18px;border:1px solid rgba(148,163,184,0.18);border-radius:18px;background:rgba(12,17,28,0.9);' }, [
        createElement('div', { textContent: 'Registered Devices', style: 'color:var(--text-muted);margin-bottom:6px;' }),
        createElement('div', { textContent: `${devices.length}`, style: 'font-size:1.4rem;font-weight:700;' }),
      ]),
      createElement('div', { style: 'padding:18px;border:1px solid rgba(148,163,184,0.18);border-radius:18px;background:rgba(12,17,28,0.9);' }, [
        createElement('div', { textContent: 'Mining Events', style: 'color:var(--text-muted);margin-bottom:6px;' }),
        createElement('div', { textContent: `${history.length}`, style: 'font-size:1.4rem;font-weight:700;' }),
      ]),
    ]));
  };

  const renderModal = () => {
    if (!refs.modalBody || !refs.modalTitle) return;
    refs.modalBody.innerHTML = '';
    refs.modalTitle.textContent = state.onboarded ? 'Welcome back to ENRG' : 'Start your ENRG onboarding';

    const wrapper = createElement('div', {
      style: 'display:flex;flex-direction:column;gap:18px;max-width:100%;',
    });

    const appendSection = (section) => {
      wrapper.appendChild(section);
    };

    if (!state.onboarded) {
      if (state.step === 1.5) {
        appendSection(renderInviteCodeStep());
      } else if (state.step === 1.1) {
        appendSection(renderRegistrationFormStep());
      } else if (state.step === 2) {
        appendSection(renderWalletStep());
      } else if (state.step === 3) {
        appendSection(renderDeviceRegistrationStep());
      } else {
        appendSection(renderInviteChoiceStep());
      }
    } else {
      appendSection(renderDashboardStep());
    }

    const footerRow = createElement('div', {
      style: 'display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-end;margin-top:8px;',
    });
    const resetAction = createElement('button', {
      type: 'button',
      className: 'btn-secondary',
      textContent: 'Start Over',
    });
    resetAction.addEventListener('click', (event) => {
      event.preventDefault();
      resetOnboarding();
    });
    footerRow.appendChild(resetAction);
    wrapper.appendChild(footerRow);

    refs.modalBody.appendChild(wrapper);
  };

  const renderInviteChoiceStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', {
      textContent: 'Choose how you want to start with ENRG. Invite code users can fast-track onboarding, while new users can register directly.',
      style: 'color:var(--text-muted);',
    }));

    const buttonRow = createElement('div', {
      style: 'display:flex;flex-wrap:wrap;gap:12px;margin-top:16px;',
    });

    const inviteButton = createElement('button', {
      type: 'button',
      className: 'btn-primary',
      textContent: 'I have an invite code',
    });
    inviteButton.addEventListener('click', () => {
      state.step = 1.5;
      saveState(state);
      renderModal();
    });

    const requestButton = createElement('button', {
      type: 'button',
      className: 'btn-secondary',
      textContent: 'Request access',
    });
    requestButton.addEventListener('click', () => {
      state.step = 1.1;
      saveState(state);
      renderModal();
    });

    buttonRow.appendChild(inviteButton);
    buttonRow.appendChild(requestButton);
    section.appendChild(buttonRow);
    return section;
  };

  const renderInviteCodeStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', {
      textContent: 'Enter your invite code to continue with onboarding.',
      style: 'color:var(--text-muted);',
    }));

    const form = createElement('form', {
      style: 'display:flex;flex-direction:column;gap:14px;margin-top:16px;',
    });
    const codeInput = createElement('input', {
      type: 'text',
      placeholder: 'Invite code',
      required: true,
      style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:var(--text-main);',
    });
    const continueButton = createElement('button', {
      type: 'submit',
      className: 'btn-primary',
      textContent: 'Continue',
    });

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

  const renderRegistrationFormStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', {
      textContent: 'Register with your email and secure password to join ENRG.',
      style: 'color:var(--text-muted);',
    }));

    const form = createElement('form', {
      style: 'display:flex;flex-direction:column;gap:14px;margin-top:16px;',
    });
    const emailInput = createElement('input', {
      type: 'email',
      placeholder: 'Email address',
      required: true,
      style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:var(--text-main);',
    });
    const passwordInput = createElement('input', {
      type: 'password',
      placeholder: 'Password',
      required: true,
      style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:var(--text-main);',
    });
    const registerButton = createElement('button', {
      type: 'submit',
      className: 'btn-primary',
      textContent: 'Register',
    });

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
    section.appendChild(createElement('p', {
      textContent: 'Connect Phantom to securely manage your wallet, or skip this step and continue with onboarding.',
      style: 'color:var(--text-muted);',
    }));

    const actionRow = createElement('div', {
      style: 'display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;',
    });
    const connectButton = createElement('button', {
      type: 'button',
      className: 'btn-primary',
      textContent: 'Connect Phantom',
    });
    connectButton.addEventListener('click', async () => {
      await handleWalletConnect();
    });

    const skipButton = createElement('button', {
      type: 'button',
      className: 'btn-secondary',
      textContent: 'Skip for now',
    });
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

  const renderDeviceRegistrationStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', {
      textContent: 'Register your first device to begin mining and tracking energy production.',
      style: 'color:var(--text-muted);',
    }));

    const form = createElement('form', {
      style: 'display:flex;flex-direction:column;gap:14px;margin-top:16px;',
    });
    const nameInput = createElement('input', {
      type: 'text',
      placeholder: 'Device name',
      required: true,
      style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:var(--text-main);',
    });
    const idInput = createElement('input', {
      type: 'text',
      placeholder: 'Device ID',
      required: true,
      style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:var(--text-main);',
    });
    const sourceSelect = createElement('select', {
      required: true,
      style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:var(--text-main);',
    });
    ['Solar', 'Wind', 'Hydro'].forEach((optionText) => {
      sourceSelect.appendChild(createElement('option', { value: optionText }, [optionText]));
    });
    const registerButton = createElement('button', {
      type: 'submit',
      className: 'btn-primary',
      textContent: 'Register Device',
    });

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
        alert('Please fill device name, ID, and energy source.');
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
      section.appendChild(createElement('p', {
        textContent: 'You are onboarded. Add your first device to start mining and turn energy into ENRG.',
        style: 'color:var(--text-muted);',
      }));
    } else {
      section.appendChild(createElement('p', {
        textContent: 'Your dashboard is ready. Use the simulator to generate ENRG from your connected devices.',
        style: 'color:var(--text-muted);',
      }));
    }

    const actionRow = createElement('div', {
      style: 'display:flex;flex-wrap:wrap;gap:12px;margin-top:18px;',
    });
    const simulateButton = createElement('button', {
      type: 'button',
      className: 'btn-primary',
      textContent: 'Simulate Mining',
    });
    simulateButton.addEventListener('click', () => {
      if (refs.simulateButtons.length) {
        refs.simulateButtons[0].click();
      } else {
        simulateMining();
      }
    });

    actionRow.appendChild(simulateButton);
    section.appendChild(actionRow);
    return section;
  };

  const handleWalletConnect = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        state.walletConnected = true;
        state.walletAddress = resp.publicKey.toString();
        saveState(state);
        const user = loadUser() || {};
        user.walletAddress = state.walletAddress;
        saveUser(user);
        addLiveFeedLine(`Wallet connected: ${state.walletAddress}`);
        state.step = 3;
        saveState(state);
        renderModal();
      } catch (error) {
        alert('Wallet connection failed: ' + (error?.message || error));
      }
    } else {
      window.open('https://phantom.app/', '_blank', 'noopener');
    }
  };

  const simulateMining = () => {
    const devices = loadDevices();
    const pickedDevice = devices.length
      ? devices[Math.floor(Math.random() * devices.length)]
      : null;
    const sourceCandidate = pickedDevice?.source || energySources[Math.floor(Math.random() * energySources.length)].name;
    const sourceDefinition = energySources.find((item) => item.name === sourceCandidate) || energySources[0];
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
    const deviceName = pickedDevice ? pickedDevice.name : 'Virtual device';

    animateBar(refs.simEnergyBar, (kWh / 500) * 100);
    animateBar(refs.simEnrgBar, Math.min(100, (enrg / 0.5) * 100));
    if (refs.simEnergyValue) refs.simEnergyValue.textContent = `${kWh}`;
    if (refs.simEnrgValue) refs.simEnrgValue.textContent = `${enrg.toFixed(3)}`;

    const logLine = `${deviceName} (${sourceDefinition.name}) generated ${kWh} kWh → ${enrg.toFixed(3)} ENRG (fee ${fee.toFixed(3)} ENRG)`;
    addLiveFeedLine(logLine);

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
  };

  const animateBar = (bar, percent) => {
    if (!bar) return;
    bar.style.transition = 'width 0.7s ease';
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
      });
    });
  };

  const addLiveFeedLine = (text) => {
    if (!refs.consoleFeed) return;
    const line = createElement('div', {
      className: 'console-line',
      textContent: `[${new Date().toLocaleTimeString('en-US')}] ${text}`,
      style: 'padding:8px 0;border-bottom:1px solid rgba(148,163,184,0.08);',
    });
    refs.consoleFeed.appendChild(line);
    while (refs.consoleFeed.children.length > 40) {
      refs.consoleFeed.removeChild(refs.consoleFeed.firstChild);
    }
    refs.consoleFeed.scrollTop = refs.consoleFeed.scrollHeight;
  };

  const startLiveFeed = () => {
    const produce = () => {
      const producer = liveFeedSources[Math.floor(Math.random() * liveFeedSources.length)];
      const action = liveFeedActions[Math.floor(Math.random() * liveFeedActions.length)];
      const unit = liveFeedUnits[Math.floor(Math.random() * liveFeedUnits.length)];
      const value = unit === 'kWh'
        ? Math.floor(Math.random() * 900 + 10)
        : (Math.random() * 9 + 0.5).toFixed(1);
      addLiveFeedLine(`${producer} ${action} ${value} ${unit}`);
      setTimeout(produce, Math.floor(Math.random() * 3000) + 2000);
    };
    produce();
  };

  const initModal = () => {
    if (!refs.modal || !refs.modalClose) return;
    refs.modalClose.addEventListener('click', closeModal);
    refs.modal.addEventListener('click', (event) => {
      if (event.target === refs.modal) {
        closeModal();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && refs.modal.getAttribute('aria-hidden') === 'false') {
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
    const learnMore = $('#btn-learn-more');
    if (learnMore) {
      learnMore.addEventListener('click', (event) => {
        event.preventDefault();
        scrollToElement('#how-it-works');
      });
    }
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
      if (mobile) {
        refs.heroActions.querySelectorAll('button').forEach((button) => {
          button.style.width = '100%';
        });
      } else {
        refs.heroActions.querySelectorAll('button').forEach((button) => {
          button.style.width = '';
        });
      }
    }
    const howGrid = $('#how-it-works .how-grid');
    if (howGrid) {
      howGrid.style.gridTemplateColumns = mobile ? '1fr' : 'repeat(3,minmax(0,1fr))';
    }
    const historyTable = $('.history-table');
    if (historyTable) {
      historyTable.style.width = '100%';
      if (mobile) {
        historyTable.parentElement.style.overflowX = 'auto';
      }
    }
  };

  const ensureDocumentationPages = () => {
    const requiredFiles = [
      { name: 'whitepaper.html', title: 'ENRG White Paper', description: 'Comprehensive overview of ENRG protocol, tokenomics, and DePIN energy infrastructure.' },
      { name: 'technical-overview.html', title: 'ENRG Technical Documentation', description: 'Technical reference for the ENRG protocol, smart contracts, and integration flows.' },
    ];

    requiredFiles.forEach((page) => {
      if (!window.location || !page) return;
      // Document creation handled server-side; script only assumes files exist.
    });
  };

  const init = () => {
    enhanceHeroContent();
    createHowItWorksSection();
    initModal();
    initStartButtons();
    initNavigationLinks();
    initDocumentationButtons();
    startLiveFeed();
    renderHistory();
    renderDashboardSummary();
    updateMetricCounters();
    applyResponsiveLayout();
    window.addEventListener('resize', applyResponsiveLayout);
  };

  init();
})();
