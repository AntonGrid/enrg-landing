const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -50px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);
// Анимация фоновых частиц
const canvas = document.getElementById('energyCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
const maxParticles = 100;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.1;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 212, 170, ${this.opacity})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

resizeCanvas();
initParticles();
animateParticles();
window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('section, .step, .tokenomics-item, .timeline-item').forEach(el => {
    el.classList.add('fade-up');
    observer.observe(el);
  });

  const metrics = {
    totalEnergy: 2056,
    activeProducers: 150,
    totalStaked: 65000,
  };

  const animateMetric = (id, value, suffix = '') => {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const end = value;
    const duration = 1500;
    const step = Math.ceil(end / (duration / 16));
    const tick = () => {
      start += step;
      if (start >= end) {
        el.textContent = end + suffix;
        return;
      }
      el.textContent = start + suffix;
      requestAnimationFrame(tick);
    };
    tick();
  };

  animateMetric('total-energy', metrics.totalEnergy, ' MWh');
  animateMetric('active-producers', metrics.activeProducers);
  animateMetric('total-staked', metrics.totalStaked, ' ENRG');

  const counterEl = document.querySelector('.hero-community .counter');
  if (counterEl) {
    const target = +counterEl.dataset.target || 1200;
    let current = 0;
    const increment = Math.ceil(target / 100);
    const updateCounter = () => {
      current += increment;
      if (current >= target) {
        counterEl.textContent = target;
        return;
      }
      counterEl.textContent = current;
      requestAnimationFrame(updateCounter);
    };
    updateCounter();
  }
});
