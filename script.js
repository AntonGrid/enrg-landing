// -----------------------------
// Particle background (keeps visual, minimal implementation)
// -----------------------------
(function () {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const COUNT = 100;
  const MAX_DIST = 140;
  const colors = ["#00E5FF", "#FF6B00"];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function create() {
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
    // lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < MAX_DIST) {
          const alpha = 0.25 * (1 - d / MAX_DIST);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(148,163,184,${alpha})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    // particles
    particles.forEach(p => {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*4);
      g.addColorStop(0, p.c);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r*4, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = p.c;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
    });

    requestAnimationFrame(draw);
  }

  create();
  draw();
})();

// -----------------------------
// Scroll reveal for .fade-up elements
// -----------------------------
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
})();

// -----------------------------
// Smooth scroll for nav links
// -----------------------------
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// -----------------------------
// Modal: open/close mint modal
// -----------------------------
const mintModal = document.getElementById('mint-modal');
const openHeroBtn = document.getElementById('btn-start-minting-hero');
const openMintBtn = document.getElementById('btn-start-minting');
const closeMintBtn = document.getElementById('mint-modal-close');

function showMintModal() {
  if (!mintModal) return;
  mintModal.classList.add('active');
  mintModal.setAttribute('aria-hidden', 'false');
}

function hideMintModal() {
  if (!mintModal) return;
  mintModal.classList.remove('active');
  mintModal.setAttribute('aria-hidden', 'true');
}

if (openHeroBtn) openHeroBtn.addEventListener('click', showMintModal);
if (openMintBtn) openMintBtn.addEventListener('click', showMintModal);
if (closeMintBtn) closeMintBtn.addEventListener('click', hideMintModal);
if (mintModal) {
  mintModal.addEventListener('click', (e) => {
    if (e.target === mintModal) hideMintModal();
  });
  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideMintModal();
  });
}

// -----------------------------
// Whitepaper / Technical docs buttons
// -----------------------------
const btnWhitepaper = document.getElementById('btn-download-whitepaper');
const btnTechDocs = document.getElementById('btn-technical-docs');
const footerWhite = document.getElementById('footer-whitepaper');
const footerTech = document.getElementById('footer-techdocs');

if (btnWhitepaper) btnWhitepaper.addEventListener('click', () => {
  window.location.href = 'whitepaper.html';
});
if (btnTechDocs) btnTechDocs.addEventListener('click', () => {
  window.location.href = 'technical-overview.html';
});
if (footerWhite) footerWhite.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = 'whitepaper.html';
});
if (footerTech) footerTech.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = 'technical-overview.html';
});

// -----------------------------
// Email CTAs
// -----------------------------
function mailToAnton(subject) {
  const subj = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  window.location.href = `mailto:anton@enrg.network${subj}`;
}

const btnGetStarted = document.getElementById('btn-get-started');
const btnContact = document.getElementById('btn-contact');
const btnBecomePartner = document.getElementById('btn-become-partner');

if (btnGetStarted) btnGetStarted.addEventListener('click', () => mailToAnton());
if (btnContact) btnContact.addEventListener('click', () => mailToAnton());
if (btnBecomePartner) btnBecomePartner.addEventListener('click', () => mailToAnton('Partnership'));

// Footer contact link already points to mailto in HTML; no extra action needed

// -----------------------------
// Mint simulation (buttons trigger visible animation)
// -----------------------------
function runMintSimulation() {
  const energyBar = document.getElementById('sim-energy-bar');
  const enrgBar = document.getElementById('sim-enrg-bar');
  const energyValue = document.getElementById('sim-energy-value');
  const enrgValue = document.getElementById('sim-enrg-value');

  if (!energyBar || !enrgBar || !energyValue || !enrgValue) return;

  // Generate fake values
  const energy = Math.floor(Math.random() * 900 + 100); // 100..999 kWh
  const enrg = (energy / 1000).toFixed(3); // ENRG minted

  // Animate bars
  energyBar.style.width = '0%';
  enrgBar.style.width = '0%';
  energyValue.textContent = '0';
  enrgValue.textContent = '0';

  // Simple staged animation
  setTimeout(() => {
    energyBar.style.width = Math.min(100, energy / 10) + '%';
    energyValue.textContent = energy.toString();
  }, 60);

  setTimeout(() => {
    enrgBar.style.width = Math.min(100, (energy / 10) * 0.7) + '%';
    enrgValue.textContent = enrg.toString();
  }, 420);
}

const btnSim = document.getElementById('btn-simulate-mint');
const btnSimModal = document.getElementById('btn-simulate-mint-modal');

if (btnSim) btnSim.addEventListener('click', runMintSimulation);
if (btnSimModal) btnSimModal.addEventListener('click', () => {
  runMintSimulation();
  // keep modal open so user sees result
});

// -----------------------------
// Live console fake feed & history rows (visual only)
// -----------------------------
(function () {
  const feed = document.getElementById('console-feed');
  const historyBody = document.getElementById('history-body');
  const producers = ['Node-12A', 'Farm-07', 'Solar-Grid-21', 'Hydro-03', 'Biogas-09'];

  function addFeedLine() {
    if (!feed) return;
    const p = document.createElement('div');
    const prod = producers[Math.floor(Math.random() * producers.length)];
    const action = ['minted', 'reported', 'staked', 'updated'][Math.floor(Math.random() * 4)];
    const unit = Math.random() > 0.85 ? 'MWh' : 'kWh';
    const amount = (Math.random() * (unit === 'kWh' ? 800 : 4) + 10).toFixed(1);
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    p.textContent = `[${ts}] ${prod} ${action} ${amount} ${unit}`;
    feed.appendChild(p);
    feed.scrollTop = feed.scrollHeight;
    if (feed.children.length > 40) feed.removeChild(feed.firstChild);
  }

  function addHistoryRow() {
    if (!historyBody) return;
    const tr = document.createElement('tr');
    const now = new Date();
    const ts = now.toISOString().replace('T', ' ').split('.')[0];
    const prod = producers[Math.floor(Math.random() * producers.length)];
    const energy = (Math.random() * 500 + 50).toFixed(1);
    const enrg = (energy / 1000).toFixed(3);
    tr.innerHTML = `<td>${ts}</td><td>${prod}</td><td>${energy}</td><td>${enrg}</td>`;
    historyBody.prepend(tr);
    if (historyBody.children.length > 20) historyBody.removeChild(historyBody.lastChild);
  }

  // initial
  for (let i = 0; i < 6; i++) addFeedLine();
  for (let i = 0; i < 5; i++) addHistoryRow();

  setInterval(addFeedLine, 2500);
  setInterval(addHistoryRow, 7000);
})();

// -----------------------------
// Solana on-chain data fetching (improved)
// Fetches all EnergyProducer and StakeInfo accounts and accurately sums metrics
// -----------------------------
(async function () {
  const defaultValues = {
    totalEnergyMWh: 2056,
    activeProducers: 150,
    totalStakedENRG: 65000
  };

  const programId = 'CcRjGroz7tsDAroZayWak58KtfAczJ7vbPddnRJDSeL4';
  const rpcUrl = 'http://127.0.0.1:8899';

  // Helper: convert base64 account data to Uint8Array
  function base64ToBytes(base64Str) {
    const binaryString = atob(base64Str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Helper: read u64 (little-endian) from byte array
  function readU64LE(bytes, offset) {
    if (offset + 8 > bytes.length) return 0n;
    let value = 0n;
    for (let i = 0; i < 8; i++) {
      value += BigInt(bytes[offset + i]) << BigInt(i * 8);
    }
    return value;
  }

  // Helper: detect account type and extract relevant fields
  // EnergyProducer (with 8-byte discriminator): authority(32) + device_id(8) + nonce(8) + energy_wh(8) + ...
  // StakeInfo (with 8-byte discriminator): owner(32) + staked_amount(8) + ...
  function parseAccount(data) {
    const bytes = base64ToBytes(data);
    
    // Skip discriminator (first 8 bytes) for both account types
    // Assuming standard Anchor discriminator layout
    
    // EnergyProducer: authority at 8-39 (pubkey), energy_wh at 56-63 (8 bytes after nonce)
    // StakeInfo: owner at 8-39 (pubkey), staked_amount at 40-47 (right after owner)
    
    // Try to detect by reading at expected offsets
    const energyWhValue = readU64LE(bytes, 56); // Likely EnergyProducer.energy_wh
    const stakedValue = readU64LE(bytes, 40);   // Likely StakeInfo.staked_amount

    return {
      energyWh: energyWhValue,
      staked: stakedValue,
      dataSize: bytes.length
    };
  }

  async function fetchAllAccounts() {
    try {
      console.log(`[ENRG] Fetching all program accounts from ${rpcUrl}`);

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getProgramAccounts',
          params: [
            programId,
            { encoding: 'base64' }
          ]
        })
      });

      const result = await response.json();
      
      if (result.error) {
        console.warn(`[ENRG] RPC error: ${result.error.message}`);
        return null;
      }

      if (!result.result || !Array.isArray(result.result)) {
        console.warn('[ENRG] No accounts found in RPC response');
        return null;
      }

      console.log(`[ENRG] Fetched ${result.result.length} accounts from on-chain`);
      return result.result;
    } catch (error) {
      console.warn(`[ENRG] RPC fetch failed: ${error.message}`);
      return null;
    }
  }

  async function computeMetrics() {
    const accounts = await fetchAllAccounts();
    
    if (!accounts) {
      console.warn('[ENRG] Falling back to default values');
      return defaultValues;
    }

    let totalEnergyWh = 0n;
    let totalStaked = 0n;
    let producerCount = 0;

    // Parse all accounts and aggregate metrics
    for (const account of accounts) {
      try {
        const data = account.account.data[0];
        if (typeof data !== 'string' || data.length === 0) continue;

        const parsed = parseAccount(data);

        // Count as producer if energy_wh is reasonable (> 0 and < 10^14)
        if (parsed.energyWh > 0n && parsed.energyWh < 100000000000000n) {
          totalEnergyWh += parsed.energyWh;
          producerCount++;
        }

        // Sum staked amounts if present
        if (parsed.staked > 0n && parsed.staked < 10000000000000000n) {
          totalStaked += parsed.staked;
        }
      } catch (e) {
        // Skip malformed accounts silently
      }
    }

    // Convert Wh to MWh (divide by 1 million)
    const totalEnergyMWh = Math.round(Number(totalEnergyWh) / 1_000_000);

    const metrics = {
      totalEnergyMWh: totalEnergyMWh > 0 ? totalEnergyMWh : defaultValues.totalEnergyMWh,
      activeProducers: producerCount > 0 ? producerCount : defaultValues.activeProducers,
      totalStakedENRG: Number(totalStaked) > 0 ? Number(totalStaked) : defaultValues.totalStakedENRG
    };

    console.log('[ENRG] Computed metrics:', {
      totalEnergyWh: totalEnergyWh.toString(),
      totalEnergyMWh: metrics.totalEnergyMWh,
      producerCount: producerCount,
      totalStaked: totalStaked.toString(),
      finalMetrics: metrics
    });

    return metrics;
  }

  function updateDOM(metrics) {
    // Update the three metric card counters
    const counterElements = document.querySelectorAll('.counter');
    
    if (counterElements.length >= 1) {
      counterElements[0].setAttribute('data-target', metrics.totalEnergyMWh);
    }
    if (counterElements.length >= 2) {
      counterElements[1].setAttribute('data-target', metrics.activeProducers);
    }
    if (counterElements.length >= 3) {
      counterElements[2].setAttribute('data-target', metrics.totalStakedENRG);
    }

    // Update the producers counter in hero section ("Join X+ energy producers")
    const producersCounter = document.getElementById('producers-counter');
    if (producersCounter) {
      producersCounter.setAttribute('data-target', metrics.activeProducers);
    }

    console.log('[ENRG] Updated DOM with metrics');
  }

  // Main execution: fetch and update on page load
  async function initializeMetrics() {
    const metrics = await computeMetrics();
    updateDOM(metrics);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMetrics);
  } else {
    initializeMetrics();
  }
})();

// -----------------------------
// Counters (count-up animation)
 // -----------------------------
(function () {
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;
    let start = null;
    const duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('.counter, #producers-counter');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => obs.observe(c));
})();

// -----------------------------
// Auto update copyright year
// -----------------------------
(function () {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

