import { useEffect, useRef, useState } from 'react';
import { Routes, Route, NavLink, useLocation, Link } from 'react-router-dom';
import { useLang } from './LangContext.jsx';
import Home from './pages/Home.jsx';
import Contact from './pages/Contact.jsx';
import Admin from './pages/Admin.jsx';
import { IconPhoneCall, IconMenu, IconClose, IconArrow } from './icons.jsx';

const reducedMotion = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export function BookButton({ to = '/contact', className = '', children }) {
  return (
    <Link to={to} className={`btn btn-book ${className}`}>
      <span className="book-ic">
        <IconPhoneCall />
      </span>
      <span>{children}</span>
      <IconArrow className="cta-arrow" />
    </Link>
  );
}

function ScrollFX() {
  const barRef = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;
    const targets =
      '.reveal, .section > .eyebrow, .section > h2, .section > .section-lead';
    const observed = new WeakSet();
    let frame = 0;
    const update = () => {
      frame = 0;
      const total = root.scrollHeight - root.clientHeight;
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${total > 0 ? root.scrollTop / total : 0})`;
      root.classList.toggle('nav-scrolled', root.scrollTop > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            target.classList.add('visible');
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -32px 0px' },
    );
    const collect = () => {
      document.querySelectorAll(targets).forEach((el) => {
        el.classList.add('reveal');
        if (media.matches || el.getBoundingClientRect().top < innerHeight - 32)
          el.classList.add('visible');
        else if (!observed.has(el)) {
          observed.add(el);
          observer.observe(el);
        }
      });
      onScroll();
    };
    const onPreference = () => {
      root.dataset.motion = media.matches ? 'reduce' : 'ready';
      collect();
    };
    onPreference();
    // Only inserted elements need discovery; counter text changes happen every frame.
    const mutations = new MutationObserver((records) => {
      if (
        records.some((record) =>
          [...record.addedNodes].some((node) => node.nodeType === 1),
        )
      )
        collect();
    });
    mutations.observe(document.querySelector('main'), {
      childList: true,
      subtree: true,
    });
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    media.addEventListener('change', onPreference);
    update();
    return () => {
      observer.disconnect();
      mutations.disconnect();
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      media.removeEventListener('change', onPreference);
      cancelAnimationFrame(frame);
      delete root.dataset.motion;
    };
  }, [pathname]);
  return <div id="progress" ref={barRef} aria-hidden="true" />;
}

export function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let start;
    const finish = () => {
      cancelAnimationFrame(frame);
      el.textContent = to + suffix;
    };
    const step = (time) => {
      start ??= time;
      const progress = Math.min(1, (time - start) / 850);
      el.textContent =
        Math.round(to * (1 - Math.pow(1 - progress, 3))) + suffix;
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        if (media.matches) finish();
        else frame = requestAnimationFrame(step);
      }
    });
    if (media.matches) finish();
    else observer.observe(el);
    const onPreference = () => {
      if (media.matches) finish();
    };
    media.addEventListener('change', onPreference);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      media.removeEventListener('change', onPreference);
    };
  }, [to, suffix]);
  return (
    <b ref={ref} dir="ltr">
      {to}
      {suffix}
    </b>
  );
}

function Nav() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);
  const menuRef = useRef(null);
  useEffect(() => setOpen(false), [location.pathname, lang]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuRef.current?.focus();
      }
    };
    const onOutside = (e) => {
      if (!navRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onOutside);
    };
  }, [open]);
  return (
    <nav
      className="nav"
      aria-label={lang === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}
      ref={navRef}
    >
      <div className="nav-inner">
        <Link className="brand" to="/" aria-label="Double H Consulting — Home">
          <img className="brand-logo" src="/logo-dark.png" alt="Double H" />
          <span className="logo-tag">{t('brand_sub')}</span>
        </Link>
        <div id="main-navigation" className={`nav-links${open ? ' open' : ''}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>
            {t('nav_home')}
          </NavLink>
          <Link
            to="/"
            state={{ section: 'about' }}
            onClick={() => setOpen(false)}
          >
            {t('nav_about')}
          </Link>
          <Link
            to="/"
            state={{ section: 'certificates' }}
            onClick={() => setOpen(false)}
          >
            {t('nav_certificates')}
          </Link>
        </div>
        <div className="lang-toggle-wrap">
          <button
            className="lang-switch"
            type="button"
            data-language={lang}
            role="switch"
            aria-checked={lang === 'ar'}
            aria-label="Arabic language"
            title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            dir="ltr"
          >
            <span className="lang-thumb" aria-hidden="true" />
            <span
              className="lang-option lang-option-en"
              lang="en"
              aria-hidden="true"
            >
              EN
            </span>
            <span
              className="lang-option lang-option-ar"
              lang="ar"
              aria-hidden="true"
            >
              AR
            </span>
          </button>
        </div>
        <button
          ref={menuRef}
          className="burger"
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="main-navigation"
          aria-label={
            lang === 'ar'
              ? open
                ? 'إغلاق القائمة'
                : 'فتح القائمة'
              : open
                ? 'Close menu'
                : 'Open menu'
          }
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  const { t, lang } = useLang();
  const location = useLocation();
  const mainRef = useRef(null);
  const firstRoute = useRef(true);
  useEffect(() => {
    if (location.state?.section) {
      const target = document.getElementById(location.state.section);
      target?.scrollIntoView({
        behavior: reducedMotion() ? 'instant' : 'smooth',
        block: 'start',
      });
      target?.focus({ preventScroll: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (!firstRoute.current) mainRef.current?.focus({ preventScroll: true });
    }
    firstRoute.current = false;
  }, [location.key]);
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        {lang === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content'}
      </a>
      <ScrollFX />
      <Nav />
      <main id="main-content" ref={mainRef} tabIndex={-1}>
        <div className="page-content" key={location.pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </main>
      <footer>
        <div className="foot foot-centered">
          <div className="foot-brand">Double H Consulting</div>
          <p className="foot-note">{t('footer_about')}</p>
          <div className="foot-rights">
            © {new Date().getFullYear()} {t('footer_rights')}
          </div>
        </div>
      </footer>
    </>
  );
}
