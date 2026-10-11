(() => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (media.matches) return;

  const images = '.hero-visual img, .point-photo img, .cert-photo img, .value-photo img, .div-icon img';
  let frame = 0;
  const update = () => {
    frame = 0;
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll(images).forEach((image) => {
      const rect = image.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewport) return;
      const center = rect.top + rect.height / 2;
      const range = (viewport + rect.height) / 2;
      const progress = Math.max(-1, Math.min(1, (center - viewport / 2) / range));
      image.style.setProperty('--scroll-shift', `${(-progress * 14).toFixed(1)}px`);
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });

  const revealTargets = '.section > .eyebrow, .section > h2, .section > .section-lead, .div-pin > .eyebrow, .div-pin > h2, .div-pin > .section-lead';
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('visible');
      revealObserver.unobserve(target);
    });
  }, { threshold: 0.12 });
  const observeReveals = () => {
    document.querySelectorAll(revealTargets).forEach((element) => {
      if (element.dataset.scrollReveal) return;
      element.dataset.scrollReveal = 'true';
      element.classList.add('reveal');
      revealObserver.observe(element);
    });
  };
  let mutations;
  const syncHero = (root) => {
    const heroImage = root.querySelector('.hero-visual img');
    if (heroImage && !heroImage.src.endsWith('/hero-collaboration.jpg')) heroImage.src = '/hero-collaboration.jpg';
    root.querySelector('.hero-map')?.remove();
    root.querySelector('.hero-visual-mark')?.remove();
  };
  const start = () => {
    const root = document.getElementById('root');
    if (!root) return;
    const onRender = () => {
      syncHero(root);
      observeReveals();
    };
    mutations = new MutationObserver(onRender);
    mutations.observe(root, { childList: true, subtree: true });
    onRender();
    schedule();
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
