// MarkenDing — shared site JS

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navEl = document.querySelector('nav');
if (navToggle && navEl) {
  navToggle.addEventListener('click', () => {
    navEl.classList.toggle('nav-open');
  });
}

// Angebot dropdown toggle
document.querySelectorAll('.nav-dropdown-toggle').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = btn.closest('.nav-dropdown');
    const isOpen = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
});
// Close dropdown on outside click
document.addEventListener('click', (e) => {
  document.querySelectorAll('.nav-dropdown.open').forEach(dd => {
    if (!dd.contains(e.target)) {
      dd.classList.remove('open');
      const btn = dd.querySelector('.nav-dropdown-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });
});
// Close dropdown on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.nav-dropdown.open').forEach(dd => {
      dd.classList.remove('open');
      const btn = dd.querySelector('.nav-dropdown-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }
});

// Counter animation (Social Sales System page)
document.querySelectorAll('[data-counter-target]').forEach(el => {
  const target = parseInt(el.dataset.counterTarget, 10);
  const suffix = el.dataset.counterSuffix || '';
  const duration = parseInt(el.dataset.counterDuration || '2200', 10);
  let startTime = null;
  const formatCH = (n) => Math.floor(n).toLocaleString('de-CH').replace(/,/g, "'");
  const animate = (ts) => {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatCH(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(animate);
  };
  const start = () => {
    startTime = null;
    requestAnimationFrame(animate);
  };
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        start();
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  obs.observe(el);
});
