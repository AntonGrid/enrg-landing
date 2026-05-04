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
