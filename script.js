// ENRG onboarding, simulation, and UI orchestration
(function () {
  'use strict';

  const STORAGE_ONBOARD = 'enrgOnboarding';
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
      } else {
        el[key] = value;
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

  const getState = () => {
    const raw = localStorage.getItem(STORAGE_ONBOARD);
    if (!raw) {
      return { step: 1, onboarded: false, walletConnected: false };
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      return { step: 1, onboarded: false, walletConnected: false };
    }
  };

  const saveState = (state) => {
    localStorage.setItem(STORAGE_ONBOARD, JSON.stringify(state));
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

  const saveHistory = (entries) => {
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(entries));
  };

  const addHistoryEntry = (entry) => {
    const history = loadHistory();
    history.unshift(entry);
    if (history.length > 40) history.length = 40;
    saveHistory(history);
    renderHistory();
  };

  const state = getState();

  const refs = {
    modal: $('#mint-modal'),
    modalBody: $('#mint-modal .modal-body'),
    modalTitle: $('#mint-modal-title'),
    modalClose: $('#mint-modal-close'),
    heroStart: $('#btn-start-minting-hero'),
    heroStartAlt: $('#btn-start-minting'),
    headerStart: $('#btn-get-started'),
    dashboard: $('#dashboard'),
    historyBody: $('#history-body'),
    consoleFeed: $('#console-feed'),
    simEnergyBar: $('#sim-energy-bar'),
    simEnrgBar: $('#sim-enrg-bar'),
    simEnergyValue: $('#sim-energy-value'),
    simEnrgValue: $('#sim-enrg-value'),
    simulateButtons: [$('#btn-simulate-mint'), $('#btn-simulate-mint-modal')].filter(Boolean),
    navConnect: $('#nav-connect'),
  };

  const energySources = [
    { name: 'Solar', mult: 1.0 },
    { name: 'Wind', mult: 0.8 },
    { name: 'Hydro', mult: 0.5 },
  ];

  const buildString = (length = 6) => Math.random().toString(36).slice(2, 2 + length).toUpperCase();

  const setModalActive = (active) => {
    if (!refs.modal || !refs.modalBody) return;
    refs.modal.classList.toggle('active', active);
    refs.modal.style.display = active ? 'flex' : 'none';
    refs.modal.setAttribute('aria-hidden', active ? 'false' : 'true');
    document.body.style.overflow = active ? 'hidden' : '';
  };

  const openModal = () => {
    setModalActive(true);
    renderModal();
  };

  const closeModal = () => setModalActive(false);

  const scrollToDashboard = () => {
    if (refs.dashboard) {
      refs.dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const createDashboardSummary = () => {
    if (!refs.dashboard) return null;
    let summary = refs.dashboard.querySelector('.enrg-dashboard-summary');
    if (!summary) {
      summary = createElement('div', {
        className: 'enrg-dashboard-summary',
        style: 'margin:18px 0 0; padding:18px; border:1px solid rgba(148,163,184,0.25); border-radius:18px; background:rgba(15,23,42,0.72);',
      });
      refs.dashboard.insertBefore(summary, refs.dashboard.firstElementChild);
    }
    return summary;
  };

  const renderDashboardSummary = () => {
    const summary = createDashboardSummary();
    if (!summary) return;
    const devices = loadDevices();
    const history = loadHistory();
    summary.innerHTML = '';

    const header = createElement('div', {
      style: 'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;',
    });
    header.appendChild(createElement('h3', { style: 'margin:0; font-size:1.2rem;' }, ['Your ENRG Dashboard']));
    const resetButton = createElement('button', { type: 'button', className: 'btn-secondary' }, ['Start Over']);
    resetButton.addEventListener('click', resetOnboarding);
    header.appendChild(resetButton);
    summary.appendChild(header);

    if (!devices.length) {
      summary.appendChild(createElement('p', { style: 'margin:14px 0 0; color:var(--text-muted);' }, ['No registered devices yet. Click Get Started to onboard your first device.']));
      return;
    }

    const list = createElement('div', { style: 'display:grid;gap:12px;margin-top:16px;' });
    devices.forEach((device) => {
      const card = createElement('div', {
        style: 'padding:14px;border:1px solid rgba(148,163,184,0.18);border-radius:16px;background:rgba(15,23,42,0.5);',
      });
      card.appendChild(createElement('div', { style: 'font-weight:700;margin-bottom:8px;' }, [device.name]));
      card.appendChild(createElement('div', { style: 'color:var(--text-muted);font-size:0.95rem;' }, [`ID: ${device.id}`]));
      card.appendChild(createElement('div', { style: 'color:var(--text-muted);font-size:0.95rem;' }, [`Source: ${device.source}`]));
      card.appendChild(createElement('div', { style: 'color:var(--text-muted);font-size:0.95rem;' }, [`Registered: ${new Date(device.registeredAt).toLocaleDateString()}`]));
      list.appendChild(card);
    });
    summary.appendChild(list);
    summary.appendChild(createElement('p', {
      style: 'margin-top:16px;color:var(--text-muted);',
    }, [`Mining history entries: ${history.length}`]));
  };

  const renderHistory = () => {
    if (!refs.historyBody) return;
    const history = loadHistory();
    refs.historyBody.innerHTML = history
      .slice(0, 20)
      .map((entry) => {
        const timestamp = new Date(entry.timestamp).toLocaleString();
        return `<tr><td>${timestamp}</td><td>${entry.deviceName || 'Unknown'}</td><td>${entry.kWh} kWh</td><td>${entry.enrg.toFixed(3)} ENRG</td></tr>`;
      })
      .join('');
  };

  const animateBar = (bar, percent) => {
    if (!bar) return;
    bar.style.transition = 'width 0.6s ease';
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
      });
    });
  };

  const addLiveFeedLine = (text) => {
    if (!refs.consoleFeed) return;
    const line = createElement('div', { className: 'console-line' }, [`[${new Date().toLocaleTimeString()}] ${text}`]);
    refs.consoleFeed.appendChild(line);
    while (refs.consoleFeed.children.length > 40) {
      refs.consoleFeed.removeChild(refs.consoleFeed.firstChild);
    }
    refs.consoleFeed.scrollTop = refs.consoleFeed.scrollHeight;
  };

  const simulateMining = () => {
    const devices = loadDevices();
    const kWh = Math.floor(Math.random() * 500) + 1;
    const source = devices.length ? devices[Math.floor(Math.random() * devices.length)].source : energySources[Math.floor(Math.random() * energySources.length)].name;
    const sourceDefinition = energySources.find((item) => item.name === source) || energySources[0];
    const effective = kWh * sourceDefinition.mult;
    const enrg = effective / 1000;
    const fee = enrg * 0.15;
    const deviceName = devices.length ? devices[Math.floor(Math.random() * devices.length)].name : 'Virtual device';

    animateBar(refs.simEnergyBar, (kWh / 500) * 100);
    animateBar(refs.simEnrgBar, (enrg / 0.5) * 100);
    if (refs.simEnergyValue) refs.simEnergyValue.textContent = `${kWh}`;
    if (refs.simEnrgValue) refs.simEnrgValue.textContent = `${enrg.toFixed(3)}`;

    const logMessage = `${deviceName} (${source}) generated ${kWh} kWh → ${enrg.toFixed(3)} ENRG (fee ${fee.toFixed(3)})`;
    addLiveFeedLine(logMessage);
    addHistoryEntry({ timestamp: new Date().toISOString(), deviceName, source, kWh, enrg, fee });
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
        alert('Connection failed: ' + (error?.message || error));
      }
    } else {
      window.open('https://phantom.app/', '_blank');
    }
  };

  const renderInviteChoiceStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', { style: 'color:var(--text-muted);' }, ['Choose your onboarding path to begin with ENRG.']));

    const buttonsRow = createElement('div', { style: 'display:flex;flex-wrap:wrap;gap:12px;margin-top:14px;' }, []);

    const inviteButton = createElement('button', { type: 'button', className: 'btn-primary' }, ['I have an invite code']);
    inviteButton.addEventListener('click', () => {
      state.step = 1.5;
      saveState(state);
      renderModal();
    });

    const requestButton = createElement('button', { type: 'button', className: 'btn-secondary' }, ['Request access']);
    requestButton.addEventListener('click', () => {
      state.step = 1.1;
      saveState(state);
      renderModal();
    });

    buttonsRow.appendChild(inviteButton);
    buttonsRow.appendChild(requestButton);
    section.appendChild(buttonsRow);
    return section;
  };

  const renderInviteFormStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', { style: 'color:var(--text-muted);' }, ['Enter your invite code to continue.']));

    const form = createElement('form', { style: 'display:flex;flex-direction:column;gap:14px;margin-top:14px;' }, []);
    const codeInput = createElement('input', {
      type: 'text',
      placeholder: 'Invite code',
      required: true,
      style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:var(--text-main);',
    });
    const continueButton = createElement('button', { type: 'submit', className: 'btn-primary' }, ['Continue']);

    form.appendChild(codeInput);
    form.appendChild(continueButton);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const code = codeInput.value.trim();
      if (!code) {
        alert('Please enter your invite code.');
        return;
      }
      const user = loadUser() || {};
      user.inviteCode = code;
      saveUser(user);
      state.step = 2;
      saveState(state);
      renderModal();
    });

    section.appendChild(form);
    return section;
  };

  const renderRegistrationFormStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', { style: 'color:var(--text-muted);' }, ['Register your account to join ENRG.']));

    const form = createElement('form', { style: 'display:flex;flex-direction:column;gap:14px;margin-top:14px;' }, []);
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
    const registerButton = createElement('button', { type: 'submit', className: 'btn-primary' }, ['Register']);

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
      state.step = 2;
      saveState(state);
      renderModal();
    });

    section.appendChild(form);
    return section;
  };

  const renderWalletStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', { style: 'color:var(--text-muted);' }, ['Connect your wallet to complete onboarding. You may skip and continue later.']));

    const actionRow = createElement('div', { style: 'display:flex;flex-wrap:wrap;gap:12px;margin-top:14px;' }, []);
    const connectButton = createElement('button', { type: 'button', className: 'btn-primary' }, ['Connect Wallet']);
    connectButton.addEventListener('click', handleWalletConnect);

    const skipButton = createElement('button', { type: 'button', className: 'btn-secondary' }, ['Skip for now']);
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

  const renderDeviceFormStep = () => {
    const section = createElement('div', {}, []);
    section.appendChild(createElement('p', { style: 'color:var(--text-muted);' }, ['Register your first device to begin mining with ENRG.']));

    const form = createElement('form', { style: 'display:flex;flex-direction:column;gap:14px;margin-top:14px;' }, []);
    const deviceName = createElement('input', {
      type: 'text',
      placeholder: 'Device name',
      required: true,
      style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:var(--text-main);',
    });
    const deviceId = createElement('input', {
      type: 'text',
      placeholder: 'Device ID (optional)',
      style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:var(--text-main);',
    });
    const sourceSelect = createElement('select', {
      required: true,
      style: 'padding:14px;border-radius:14px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:var(--text-main);',
    });
    ['Solar', 'Wind', 'Hydro'].forEach((source) => {
      sourceSelect.appendChild(createElement('option', { value: source }, [source]));
    });
    const registerButton = createElement('button', { type: 'submit', className: 'btn-primary' }, ['Register Device']);

    form.appendChild(deviceName);
    form.appendChild(deviceId);
    form.appendChild(sourceSelect);
    form.appendChild(registerButton);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = deviceName.value.trim();
      const id = deviceId.value.trim() || `DEV-${buildString(6)}`;
      const source = sourceSelect.value;
      if (!name || !source) {
        alert('Please enter a device name and energy source.');
        return;
      }
      const devices = loadDevices();
      devices.unshift({ name, id, source, registeredAt: new Date().toISOString() });
      saveDevices(devices);
      state.onboarded = true;
      state.step = 4;
      saveState(state);
      renderDashboardSummary();
      renderModal();
      closeModal();
      scrollToDashboard();
    });

    section.appendChild(form);
    return section;
  };

  const renderDashboardStep = () => {
    const section = createElement('div', {}, []);
    const messageText = state.onboarded
      ? 'Your onboarding is complete. Use the simulator to generate your first mining event.'
      : 'Your dashboard will be available after you finish device registration.';
    section.appendChild(createElement('p', { style: 'color:var(--text-muted);' }, [messageText]));

    if (state.onboarded) {
      const devices = loadDevices();
      if (devices.length) {
        const list = createElement('div', { style: 'display:grid;gap:10px;margin-top:14px;' }, []);
        devices.forEach((device) => {
          const deviceCard = createElement('div', {
            style: 'padding:14px;border:1px solid rgba(148,163,184,0.18);border-radius:14px;background:rgba(15,23,42,0.45);',
          }, []);
          deviceCard.appendChild(createElement('div', { style: 'font-weight:700;margin-bottom:6px;' }, [device.name]));
          deviceCard.appendChild(createElement('div', { style: 'color:var(--text-muted);font-size:0.95rem;' }, [`ID: ${device.id}`]));
          deviceCard.appendChild(createElement('div', { style: 'color:var(--text-muted);font-size:0.95rem;' }, [`Energy source: ${device.source}`]));
          list.appendChild(deviceCard);
        });
        section.appendChild(list);
      }

      const simulateButton = createElement('button', { type: 'button', className: 'btn-primary', style: 'margin-top:18px;' }, ['Simulate Mining']);
      simulateButton.addEventListener('click', () => {
        if (refs.simulateButtons.length) {
          refs.simulateButtons[0].click();
        } else {
          simulateMining();
        }
      });
      section.appendChild(simulateButton);
    } else {
      const continueButton = createElement('button', { type: 'button', className: 'btn-primary', style: 'margin-top:18px;' }, ['Register a Device']);
      continueButton.addEventListener('click', () => {
        state.step = 3;
        saveState(state);
        renderModal();
      });
      section.appendChild(continueButton);
    }

    return section;
  };

  const renderModal = () => {
    if (!refs.modalBody || !refs.modalTitle) return;
    refs.modalBody.innerHTML = '';
    refs.modalTitle.textContent = state.onboarded ? 'Welcome back to ENRG' : 'Welcome to ENRG Onboarding';

    const wrapper = createElement('div', { style: 'display:flex;flex-direction:column;gap:18px;' }, []);

    if (!state.onboarded) {
      if (state.step === 1.5) {
        wrapper.appendChild(renderInviteFormStep());
      } else if (state.step === 1.1) {
        wrapper.appendChild(renderRegistrationFormStep());
      } else if (state.step === 2) {
        wrapper.appendChild(renderWalletStep());
      } else if (state.step === 3) {
        wrapper.appendChild(renderDeviceFormStep());
      } else {
        wrapper.appendChild(renderInviteChoiceStep());
      }
    } else {
      wrapper.appendChild(renderDashboardStep());
    }

    const resetAction = createElement('button', { type: 'button', className: 'btn-secondary', style: 'margin-top:16px;' }, ['Start Over']);
    resetAction.addEventListener('click', resetOnboarding);
    wrapper.appendChild(resetAction);

    refs.modalBody.appendChild(wrapper);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_ONBOARD);
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_DEVICES);
    localStorage.removeItem(STORAGE_HISTORY);
    state.step = 1;
    state.onboarded = false;
    state.walletConnected = false;
    delete state.walletAddress;
    saveState(state);
    renderDashboardSummary();
    renderHistory();
    renderModal();
  };

  const initStartButtons = () => {
    const startHandler = (event) => {
      event.preventDefault();
      if (state.onboarded) {
        scrollToDashboard();
        return;
      }
      if (!refs.modal) return;
      openModal();
    };
    [refs.heroStart, refs.heroStartAlt, refs.headerStart].forEach((button) => {
      if (button) button.addEventListener('click', startHandler);
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

  const initFadeUp = () => {
    const fadeItems = $$('.fade-up');
    if (!fadeItems.length) return;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      fadeItems.forEach((item) => observer.observe(item));
    } else {
      fadeItems.forEach((item) => item.classList.add('visible'));
    }
  };

  const initMetricCounters = () => {
    const counters = $$('.counter');
    const special = $('#producers-counter');
    const allCounters = special ? [...counters, special] : counters;
    if (!allCounters.length) return;

    const animate = (element) => {
      const rawTarget = element.getAttribute('data-target');
      const target = rawTarget ? parseInt(rawTarget, 10) : parseInt(element.textContent.replace(/[^\d]/g, ''), 10) || 0;
      if (!target) return;
      const duration = 1500;
      const startTime = performance.now();
      const step = (timestamp) => {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        element.textContent = Math.floor(progress * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      allCounters.forEach((counter) => observer.observe(counter));
    } else {
      allCounters.forEach((counter) => animate(counter));
    }
  };

  const initLiveFeed = () => {
    if (!refs.consoleFeed) return;
    const producers = ['Node-01', 'SolarRig-12', 'WindFarm-7B', 'HydroUnit-3C', 'Rooftop-Alpha', 'GridEdge-09'];
    const actions = ['reported', 'minted', 'staked', 'verified', 'streamed', 'settled'];
    const units = ['kWh', 'MWh'];

    const addLine = (text) => {
      const line = createElement('div', { className: 'console-line' }, [`[${new Date().toLocaleTimeString()}] ${text}`]);
      refs.consoleFeed.appendChild(line);
      while (refs.consoleFeed.children.length > 40) {
        refs.consoleFeed.removeChild(refs.consoleFeed.firstChild);
      }
      refs.consoleFeed.scrollTop = refs.consoleFeed.scrollHeight;
    };

    const produce = () => {
      const producer = producers[Math.floor(Math.random() * producers.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const unit = units[Math.floor(Math.random() * units.length)];
      const value = unit === 'kWh' ? Math.floor(Math.random() * 900 + 5) : (Math.random() * 10 + 0.1).toFixed(1);
      addLine(`${producer} ${action} ${value} ${unit}`);
      setTimeout(produce, Math.floor(Math.random() * 3000) + 2000);
    };

    addLine('Bootstrapping ENRG live feed...');
    setTimeout(produce, 2000);
  };

  const initModal = () => {
    if (!refs.modal || !refs.modalBody || !refs.modalClose) return;
    refs.modalClose.addEventListener('click', closeModal);
    refs.modal.addEventListener('click', (event) => {
      if (event.target === refs.modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && refs.modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });
  };

  const initSimulationButtons = () => {
    refs.simulateButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        simulateMining();
      });
    });
  };

  const initWalletButton = () => {
    if (!refs.navConnect) return;
    refs.navConnect.addEventListener('click', (event) => {
      event.preventDefault();
      handleWalletConnect();
    });
  };

  const init = () => {
    initFadeUp();
    initMetricCounters();
    initLiveFeed();
    initModal();
    initSimulationButtons();
    initNavigationLinks();
    initStartButtons();
    initWalletButton();
    renderHistory();
    renderDashboardSummary();
  };

  init();
})();
