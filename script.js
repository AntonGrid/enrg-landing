// PARTICLE BACKGROUND WITH LINES
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

  const PARTICLE_COUNT = 120;
  const MAX_DISTANCE = 140;
  const colors = [
    { c: "#00E5FF", glow: "rgba(0,229,255,0.7)" },
    { c: "#FF6B00", glow: "rgba(255,107,0,0.7)" }
  ];

  function createParticle() {
    const color = colors[Math.floor(Math.random() * colors.length)];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2 + 0.6,
      color: color.c,
      glow: color.glow
    };
  }

  function init() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    // Lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DISTANCE) {
          const alpha = 1 - dist / MAX_DISTANCE;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(148, 163, 184, ${alpha * 0.4})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // Particles
    for (const p of particles) {
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        p.r * 4
      );
      gradient.addColorStop(0, p.glow);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
    }

    requestAnimationFrame(draw);
  }

  init();
  draw();
})();

// SCROLL REVEAL
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
})();

// COUNT-UP METRICS
(function () {
  function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-target"), 10);
    if (isNaN(target)) return;
    let current = 0;
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      current = Math.floor(target * progress);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll(".counter, #producers-counter");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
})();

// MINI CONSOLE FAKE LOGS
(function () {
  const feed = document.getElementById("console-feed");
  if (!feed) return;

  const producers = ["Node-12A", "Farm-07", "Solar-Grid-21", "Hydro-03", "Biogas-09"];
  const actions = ["minted", "reported", "staked", "updated"];
  const units = ["kWh", "MWh"];

  function addLine() {
    const p = document.createElement("div");
    const producer = producers[Math.floor(Math.random() * producers.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const unit = units[Math.floor(Math.random() * units.length)];
    const amount = (Math.random() * (unit === "kWh" ? 800 : 4) + 10).toFixed(1);
    const ts = new Date().toISOString().split("T")[1].split(".")[0];
    p.textContent = `[${ts}] ${producer} ${action} ${amount} ${unit}`;
    feed.appendChild(p);
    feed.scrollTop = feed.scrollHeight;
    if (feed.children.length > 40) {
      feed.removeChild(feed.firstChild);
    }
  }

  for (let i = 0; i < 6; i++) addLine();
  setInterval(addLine, 2500);
})();

// HISTORY FAKE ROWS
(function () {
  const body = document.getElementById("history-body");
  if (!body) return;

  const producers = ["Node-12A", "Farm-07", "Solar-Grid-21", "Hydro-03", "Biogas-09"];

  function addRow() {
    const tr = document.createElement("tr");
    const now = new Date();
    const ts = now.toISOString().replace("T", " ").split(".")[0];
    const producer = producers[Math.floor(Math.random() * producers.length)];
    const energy = (Math.random() * 500 + 50).toFixed(1);
    const enrg = (energy / 1000).toFixed(3);

    tr.innerHTML = `
      <td>${ts}</td>
      <td>${producer}</td>
      <td>${energy}</td>
      <td>${enrg}</td>
    `;
    body.prepend(tr);
    if (body.children.length > 20) {
      body.removeChild(body.lastChild);
    }
  }

  for (let i = 0; i < 5; i++) addRow();
  setInterval(addRow, 7000);
})();

// MINTING SIMULATOR
(function () {
  const energyBar = document.getElementById("sim-energy-bar");
  const enrgBar = document.getElementById("sim-enrg-bar");
  const energyValue = document.getElementById("sim-energy-value");
  const enrgValue = document.getElementById("sim-enrg-value");
  const btnSimulate = document.getElementById("btn-simulate-mint");
  const btnSimulateModal = document.getElementById("btn-simulate-mint-modal");

  function runSim() {
    if (!energyBar || !enrgBar) return;
    const energy = Math.floor(Math.random() * 900 + 100);
    const enrg = (energy / 1000).toFixed(3);
    energyBar.style.width = "0%";
    enrgBar.style.width = "0%";
    setTimeout(() => {
      energyBar.style.width = Math.min(100, energy / 10) + "%";
      enrgBar.style.width = Math.min(100, (energy / 10) * 0.7) + "%";
      if (energyValue) energyValue.textContent = energy.toString();
      if (enrgValue) enrgValue.textContent = enrg.toString();
    }, 50);
  }

  if (btnSimulate) btnSimulate.addEventListener("click", runSim);
  if (btnSimulateModal) btnSimulateModal.addEventListener("click", runSim);
})();

// MINT MODAL
(function () {
  const modal = document.getElementById("mint-modal");
  const closeBtn = document.getElementById("mint-modal-close");
  const triggers = [
    document.getElementById("btn-start-minting"),
    document.getElementById("btn-start-minting-hero")
  ];

  function openModal() {
    if (!modal) return;
    modal.classList.add("active");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("active");
  }

  triggers.forEach((btn) => {
    if (btn) btn.addEventListener("click", openModal);
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
})();

// CTA BUTTONS
(function () {
  const btnWhitepaper = document.getElementById("btn-download-whitepaper");
  const btnTechDocs = document.getElementById("btn-technical-docs");
  const footerWhitepaper = document.getElementById("footer-whitepaper");
  const footerTechdocs = document.getElementById("footer-techdocs");
  const btnPartner = document.getElementById("btn-become-partner");
  const btnContact = document.getElementById("btn-contact");
  const btnGetStarted = document.getElementById("btn-get-started");

  function openMailTo() {
    window.location.href = "mailto:contact@enrg.network";
  }

  if (btnWhitepaper) {
    btnWhitepaper.addEventListener("click", () => {
      window.location.href = "whitepaper.pdf";
    });
  }
  if (btnTechDocs) {
    btnTechDocs.addEventListener("click", () => {
      window.location.href = "technical-overview.pdf";
    });
  }
  if (footerWhitepaper) {
    footerWhitepaper.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "whitepaper.pdf";
    });
  }
  if (footerTechdocs) {
    footerTechdocs.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "technical-overview.pdf";
    });
  }
  if (btnPartner) btnPartner.addEventListener("click", () => {
    window.location.href = "mailto:partners@enrg.network";
  });
  if (btnContact) btnContact.addEventListener("click", openMailTo);
  if (btnGetStarted) btnGetStarted.addEventListener("click", openMailTo);
})();

// FOOTER YEAR
(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

