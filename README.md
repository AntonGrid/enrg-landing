<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ENRG Protocol – Open Standard for Cryptographic Trust | SRC Token</title>
  <meta name="description" content="ENRG is an open, blockchain-independent protocol for cryptographically verifiable physical infrastructure. Tokenize verified energy production as SRC (Source) tokens on Solana. 1 SRC = 1 MWh." />
  <link rel="stylesheet" href="css/style.css" />
  <link rel="icon" href="favicon.ico" />
</head>
<body>

  <!-- Navigation -->
  <header class="navbar">
    <a href="/" class="navbar__logo">
      <img src="assets/logo.svg" alt="ENRG" width="32" height="32" />
      <span>ENRG</span>
    </a>
    <nav class="navbar__links">
      <a href="/whitepaper.html">Whitepaper</a>
      <a href="/technical-overview.html">Docs</a>
      <a href="/dashboard.html">Dashboard</a>
      <a href="https://x.com/ENRG_Protocol" target="_blank" rel="noopener noreferrer">X</a>
      <a href="https://t.me/enrg_protocol" target="_blank" rel="noopener noreferrer">Telegram</a>
    </nav>
    <button id="wallet-btn" class="btn btn--outline">Connect Wallet</button>
    <span id="wallet-address" class="wallet-address"></span>
  </header>

  <main>

    <!-- Hero -->
    <section class="hero">
      <div class="hero__content">
        <h1 class="hero__title">
          Trust is not granted.<br />
          <span class="hero__title--accent">Trust is verified.</span>
        </h1>
        <p class="hero__subtitle">
          An open, blockchain-independent protocol for cryptographically verifiable
          physical infrastructure. The first reference implementation tokenizes
          verified energy production as <strong>SRC (Source)</strong> tokens on Solana.
        </p>
        <div class="hero__actions">
          <a href="/technical-overview.html" class="btn btn--primary">Explore the Protocol</a>
          <a href="/register.html" class="btn btn--outline">Start Building</a>
          <a href="/whitepaper.html" class="btn btn--ghost">Read Whitepaper</a>
        </div>
        <div class="hero__metrics" id="protocol-stats">
          <div class="stat">
            <span class="stat__label">Total Energy Tokenized</span>
            <span class="stat__value" id="hero-energy">Coming soon</span>
          </div>
          <div class="stat">
            <span class="stat__label">Active Producers</span>
            <span class="stat__value" id="hero-producers">Be the first</span>
          </div>
          <div class="stat">
            <span class="stat__label">SRC Supply</span>
            <span class="stat__value" id="hero-supply">Join the network</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Problem -->
    <section class="section section--dark">
      <div class="section__inner">
        <h2 class="section__title">The Trust Problem</h2>
        <div class="grid grid--2">
          <div class="card card--problem">
            <h3>Today's Model</h3>
            <ul>
              <li>Centralized certification authorities</li>
              <li>Opaque verification processes</li>
              <li>Vendor lock-in and fragmented markets</li>
              <li>Trust based on institutional authority</li>
            </ul>
          </div>
          <div class="card card--solution">
            <h3>ENRG's Model</h3>
            <ul>
              <li>Cryptographic verification on-chain</li>
              <li>Deterministic, auditable proofs</li>
              <li>Open standard, any implementation</li>
              <li>Trust based on Ed25519 signatures</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Architecture -->
    <section class="section">
      <div class="section__inner">
        <h2 class="section__title">Architecture</h2>
        <p class="section__lead">Seven independent components, one trust model.</p>
        <div class="arch-flow">
          <div class="arch-flow__item">
            <span class="arch-flow__icon">📡</span>
            <span class="arch-flow__label">Device</span>
          </div>
          <span class="arch-flow__arrow">→</span>
          <div class="arch-flow__item">
            <span class="arch-flow__icon">🔧</span>
            <span class="arch-flow__label">Provisioning</span>
          </div>
          <span class="arch-flow__arrow">→</span>
          <div class="arch-flow__item">
            <span class="arch-flow__icon">📋</span>
            <span class="arch-flow__label">Registry</span>
          </div>
          <span class="arch-flow__arrow">→</span>
          <div class="arch-flow__item">
            <span class="arch-flow__icon">⚖️</span>
            <span class="arch-flow__label">Policy Engine</span>
          </div>
          <span class="arch-flow__arrow">→</span>
          <div class="arch-flow__item">
            <span class="arch-flow__icon">🔗</span>
            <span class="arch-flow__label">Oracle</span>
          </div>
          <span class="arch-flow__arrow">→</span>
          <div class="arch-flow__item arch-flow__item--highlight">
            <span class="arch-flow__icon">📜</span>
            <span class="arch-flow__label">Smart Contract</span>
          </div>
          <span class="arch-flow__arrow">→</span>
          <div class="arch-flow__item">
            <span class="arch-flow__icon">🏛️</span>
            <span class="arch-flow__label">DAO</span>
          </div>
        </div>
        <p class="section__note">
          Each component has one responsibility. Verification, policy, state, execution,
          and governance remain independent. <a href="/technical-overview.html#architecture">Learn more →</a>
        </p>
      </div>
    </section>

    <!-- Use Cases -->
    <section class="section section--dark">
      <div class="section__inner">
        <h2 class="section__title">Use Cases</h2>
        <p class="section__lead">Energy is the first application. The protocol is designed for any verifiable physical data.</p>
        <div class="grid grid--4">
          <div class="card">
            <span class="card__icon">⚡</span>
            <h3>Energy Production</h3>
            <p>Solar, wind, hydro — verify and mint SRC tokens.</p>
            <span class="card__badge badge--live">Live</span>
          </div>
          <div class="card">
            <span class="card__icon">💧</span>
            <h3>Water & Utilities</h3>
            <p>Metered consumption, verified flow.</p>
            <span class="card__badge badge--soon">Coming Soon</span>
          </div>
          <div class="card">
            <span class="card__icon">🌾</span>
            <h3>Agriculture</h3>
            <p>Crop yield, soil sensors, supply chain.</p>
            <span class="card__badge badge--soon">Coming Soon</span>
          </div>
          <div class="card">
            <span class="card__icon">🏭</span>
            <h3>Manufacturing</h3>
            <p>Production line output, quality metrics.</p>
            <span class="card__badge badge--soon">Coming Soon</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Tokenomics -->
    <section class="section">
      <div class="section__inner">
        <h2 class="section__title">SRC Token</h2>
        <p class="section__lead">Energy-Backed. Hard-Capped. Programmatically Deflationary.</p>
        <div class="grid grid--3">
          <div class="card card--token">
            <span class="card__label">Ticker</span>
            <span class="card__value">SRC</span>
            <span class="card__sub">Source</span>
          </div>
          <div class="card card--token">
            <span class="card__label">Max Supply</span>
            <span class="card__value">1,000,000,000</span>
            <span class="card__sub">Fixed cap</span>
          </div>
          <div class="card card--token">
            <span class="card__label">Peg</span>
            <span class="card__value">1 SRC = 1 MWh</span>
            <span class="card__sub">Verified energy</span>
          </div>
          <div class="card card--token">
            <span class="card__label">Decimals</span>
            <span class="card__value">9</span>
            <span class="card__sub">SPL Token standard</span>
          </div>
          <div class="card card--token">
            <span class="card__label">Protocol Fee</span>
            <span class="card__value">15%</span>
            <span class="card__sub">85% to producer</span>
          </div>
          <div class="card card--token">
            <span class="card__label">Source Multipliers</span>
            <span class="card__value">100% / 80% / 50%</span>
            <span class="card__sub">Solar · Biogas · Fossil</span>
          </div>
        </div>

        <h3 class="section__subtitle">Fee Distribution (15% of Every Mint)</h3>
        <div class="grid grid--4">
          <div class="card card--fee">
            <span class="card__fee-pct">20%</span>
            <span class="card__fee-label">Buyback & Burn</span>
          </div>
          <div class="card card--fee">
            <span class="card__fee-pct">40%</span>
            <span class="card__fee-label">Staking Rewards</span>
          </div>
          <div class="card card--fee">
            <span class="card__fee-pct">30%</span>
            <span class="card__fee-label">DAO Reserve</span>
          </div>
          <div class="card card--fee">
            <span class="card__fee-pct">10%</span>
            <span class="card__fee-label">Emergency Fund</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Device Lifecycle -->
    <section class="section section--dark">
      <div class="section__inner">
        <h2 class="section__title">Device Lifecycle</h2>
        <p class="section__lead">8 cryptographically enforced states per ADR-0005.</p>
        <div class="lifecycle-flow">
          <span class="lifecycle__state">UNREGISTERED</span>
          <span class="lifecycle__arrow">→</span>
          <span class="lifecycle__state">REGISTERED</span>
          <span class="lifecycle__arrow">→</span>
          <span class="lifecycle__state">CLAIMED</span>
          <span class="lifecycle__arrow">→</span>
          <span class="lifecycle__state">PROVISIONED</span>
          <span class="lifecycle__arrow">→</span>
          <span class="lifecycle__state lifecycle__state--active">ACTIVE</span>
          <span class="lifecycle__arrow">↔</span>
          <span class="lifecycle__state lifecycle__state--warning">QUARANTINE</span>
          <span class="lifecycle__arrow">↔</span>
          <span class="lifecycle__state lifecycle__state--active">ACTIVE</span>
          <span class="lifecycle__arrow">↔</span>
          <span class="lifecycle__state lifecycle__state--muted">MAINTENANCE</span>
          <span class="lifecycle__arrow">→</span>
          <span class="lifecycle__state lifecycle__state--error">REVOKED</span>
        </div>
        <p class="section__note">
          <a href="/technical-overview.html#device-lifecycle">Full lifecycle specification (ADR-0005) →</a>
        </p>
      </div>
    </section>

    <!-- For Developers -->
    <section class="section">
      <div class="section__inner">
        <h2 class="section__title">Build on ENRG</h2>
        <p class="section__lead">Open standard. Open source. Any stack.</p>
        <div class="grid grid--3">
          <div class="card">
            <h3>📜 Smart Contracts</h3>
            <p>Anchor Framework, Rust, Solana. Two programs: enrg-mvp (core) and enrg-profile (energy profiles). CPI via <code>declare_program!</code>.</p>
            <a href="/technical-overview.html#programs" class="btn btn--ghost">View Programs →</a>
          </div>
          <div class="card">
            <h3>🔗 Oracle</h3>
            <p>Node.js, Express, PostgreSQL. REST API for device registration, proof submission, and protocol stats.</p>
            <a href="/technical-overview.html#api" class="btn btn--ghost">API Reference →</a>
          </div>
          <div class="card">
            <h3>📡 Firmware</h3>
            <p>ESP32 + PZEM-004T, ATECC608 Secure Element, Ed25519 signing. Industrial Modbus/RS485 support.</p>
            <a href="https://github.com/AntonGrid/ENRG/tree/main/firmware" class="btn btn--ghost" target="_blank">View on GitHub →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Security -->
    <section class="section section--dark">
      <div class="section__inner">
        <h2 class="section__title">Security Model</h2>
        <p class="section__lead">Multi-layer protection from device to blockchain.</p>
        <div class="grid grid--3">
          <div class="card">
            <h3>🔐 Ed25519 via Sysvar</h3>
            <p>All signatures verified on-chain via <code>solana_instructions_sysvar::get_instruction_relative</code>. Private key never leaves the device (ATECC608).</p>
          </div>
          <div class="card">
            <h3>🛡️ Replay Protection</h3>
            <p>Monotonic nonce per device. MAX_PROOF_AGE = 1 hour. Duplicate nonces rejected on-chain.</p>
          </div>
          <div class="card">
            <h3>📊 Energy Reputation</h3>
            <p>ERS tracks flawless operation, verified volume, and anomaly detection. High ERS = better rewards.</p>
          </div>
        </div>
        <div class="grid grid--3" style="margin-top:1rem;">
          <div class="card">
            <h3>📋 STRIDE Model</h3>
            <p>Spoofing → Ed25519 · Tampering → Signed packets · Repudiation → Nonce+timestamp · DoS → Gas limits · Elevation → PDA architecture</p>
          </div>
          <div class="card">
            <h3>🏭 Trust Levels</h3>
            <p>Basic (100 kWh/mo), Verified (10 MWh/mo), Industrial (unlimited), Institutional (unlimited).</p>
          </div>
          <div class="card">
            <h3>🔍 Anomaly Detection</h3>
            <p>Sudden spikes, night-time generation, profile anomalies trigger automatic quarantine.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Roadmap -->
    <section class="section">
      <div class="section__inner">
        <h2 class="section__title">Roadmap</h2>
        <div class="roadmap">
          <div class="roadmap__item roadmap__item--done">
            <span class="roadmap__phase">Q2–Q3 2026</span>
            <strong>Genesis — Foundation ✅</strong>
            <p>Smart contract, Oracle, ESP32 PoP, device registration, minting, documentation, ADRs.</p>
          </div>
          <div class="roadmap__item roadmap__item--active">
            <span class="roadmap__phase">Q4 2026 – Q1 2027</span>
            <strong>Mainnet — Platform 🚧</strong>
            <p>Device Registry, Provisioning Service, Device Manifest, Policy Engine, Dashboard, REST API.</p>
          </div>
          <div class="roadmap__item">
            <span class="roadmap__phase">Q2–Q3 2027</span>
            <strong>Vault Growth — Ecosystem</strong>
            <p>SDK, CLI, Developer Portal, Oracle Network, Community Contributions.</p>
          </div>
          <div class="roadmap__item">
            <span class="roadmap__phase">2028+</span>
            <strong>Global Standard</strong>
            <p>Multi-chain, Carbon Credits, Energy Marketplace, Full DAO Governance.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Partners -->
    <section class="section section--dark">
      <div class="section__inner">
        <h2 class="section__title">Built on Open Standards</h2>
        <div class="partners">
          <span class="partner">Solana</span>
          <span class="partner">Anchor</span>
          <span class="partner">Phantom</span>
          <span class="partner">ESP32</span>
          <span class="partner">Switchboard</span>
        </div>
      </div>
    </section>

  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__links">
        <a href="/whitepaper.html">Whitepaper</a>
        <a href="/technical-overview.html">Technical Docs</a>
        <a href="https://github.com/AntonGrid/ENRG" target="_blank">GitHub</a>
        <a href="https://x.com/ENRG_Protocol" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
        <a href="https://t.me/enrg_protocol" target="_blank" rel="noopener noreferrer">Telegram</a>
        <a href="mailto:anton@enrg.network">Contact</a>
      </div>
      <p class="footer__copy">
        © 2026 ENRG Protocol. Built on Solana. Open source & community driven.
        <br />
        <em>The protocol is governed. The protocol is not owned.</em>
      </p>
    </div>
  </footer>

  <script type="module" src="js/main.js"></script>
</body>
</html>
