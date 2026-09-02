// Mobile navigation
(function () {
  const header = document.querySelector('header');
  if (!header) return;

  const mobileNav = document.createElement('div');
  mobileNav.id = 'mobile-nav';
  mobileNav.className = 'fixed inset-0 z-40 bg-obsidian/95 backdrop-blur-lg transform translate-x-full transition-transform duration-300 flex flex-col items-center justify-center gap-8';
  mobileNav.innerHTML = `
    <a class="font-display text-3xl uppercase tracking-widest text-stark-white hover:text-bronze transition-colors" href="/">Home</a>
    <a class="font-display text-3xl uppercase tracking-widest text-stark-white hover:text-bronze transition-colors" href="/pages/about.html">Über uns</a>
    <a class="font-display text-3xl uppercase tracking-widest text-stark-white hover:text-bronze transition-colors" href="/pages/angebot.html">Angebot</a>
    <a class="font-display text-3xl uppercase tracking-widest text-stark-white hover:text-bronze transition-colors" href="/pages/blog.html">Blog</a>
    <a class="font-display text-3xl uppercase tracking-widest text-stark-white hover:text-bronze transition-colors" href="/pages/kontakt.html">Kontakt</a>
    <button id="mobile-nav-close" class="absolute top-6 right-6 text-stark-white hover:text-bronze transition-colors" aria-label="Menü schliessen"><span class="material-symbols-outlined text-4xl">close</span></button>
  `;
  document.body.appendChild(mobileNav);

  const openBtn = header.querySelector('button[aria-label="Menü öffnen"]');
  if (openBtn) {
    openBtn.addEventListener('click', () => mobileNav.classList.remove('translate-x-full'));
  }

  const closeBtn = mobileNav.querySelector('#mobile-nav-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => mobileNav.classList.add('translate-x-full'));
  }

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileNav.classList.add('translate-x-full'));
  });
})();
