import { useEffect, useRef, useState } from 'react';
import { Routes, Route, NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { useLang } from './LangContext.jsx';
import { LANGS } from './i18n.js';
import Home from './pages/Home.jsx';
import Contact from './pages/Contact.jsx';
import Admin from './pages/Admin.jsx';
import ConsultModal from './ConsultModal.jsx';
import logoDark from './assets/logo-dark.png';

/* ---------- scroll progress + reveal-on-scroll ---------- */
function ScrollFX() {
  const barRef = useRef(null);
  const toTopRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    let raf = 0;
    let cur = null;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const par = [...document.querySelectorAll('[data-par]')];
    // delegated 3D tilt (works for cards added later, e.g. fetched certificates)
    const onMove = reduce
      ? null
      : (e) => {
          const el = e.target instanceof Element ? e.target.closest('.card, .point, .info-card') : null;
          if (el !== cur) {
            if (cur) {
              cur.style.setProperty('--rx', '0deg');
              cur.style.setProperty('--ry', '0deg');
            }
            cur = el;
          }
          if (!el) return;
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
          el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
        };
    // rect-based reveal (also covers elements IO may miss,
    // e.g. cards rendered after an async fetch)
    const revealCheck = () => {
      const vh0 = window.innerHeight;
      document
        .querySelectorAll('.reveal:not(.visible), .w3d:not(.visible)')
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < vh0 * 0.9 && r.bottom > vh0 * 0.06) el.classList.add('visible');
        });
    };
    const run = () => {
      raf = 0;
      const h = document.documentElement;
      const y = h.scrollTop;
      document.body.classList.toggle('scrolled', y > 24);
      const p = (y / Math.max(1, h.scrollHeight - h.clientHeight)) * 100;
      if (barRef.current) barRef.current.style.width = p + '%';
      if (toTopRef.current) toTopRef.current.classList.toggle('show', y > 600);
      revealCheck();
      if (reduce) return;
      const vh = window.innerHeight;
      for (const el of par) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) continue;
        // +1 (below viewport center) → 0 (centered) → -1 (above)
        const d = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        el.style.setProperty('--par', d.toFixed(3));
      }
    };
    const onScroll = () => {
      // synchronous so reveals never lag behind, even if rAF is throttled
      revealCheck();
      if (!raf) raf = requestAnimationFrame(run);
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    if (onMove) document.addEventListener('mousemove', onMove, { passive: true });
    run();
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (onMove) document.removeEventListener('mousemove', onMove);
      if (cur) {
        cur.style.setProperty('--rx', '0deg');
        cur.style.setProperty('--ry', '0deg');
      }
    };
  }, [pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const els = [...document.querySelectorAll('.reveal, .w3d')];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((x) => {
          if (x.isIntersecting) {
            x.target.classList.add('visible');
            io.unobserve(x.target);
          }
        }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    // pick up reveal targets rendered later (e.g. fetched certificates)
    const mo = new MutationObserver(() => {
      document
        .querySelectorAll('.reveal:not(.visible), .w3d:not(.visible)')
        .forEach((el) => io.observe(el));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return (
    <>
      <div id="progress" ref={barRef} />
      <button id="toTop" ref={toTopRef} onClick={() => scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}

/* ---------- animated counters ---------- */
export function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((x) => {
        if (!x.isIntersecting) return;
        io.unobserve(x.target);
        let s = 0;
        const step = Math.max(1, Math.round(to / 40));
        const iv = setInterval(() => {
          s += step;
          if (s >= to) {
            s = to;
            clearInterval(iv);
          }
          el.textContent = s + suffix;
        }, 25);
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to, suffix]);
  return <b ref={ref}>0{suffix}</b>;
}

/* ---------- navigation ---------- */
function Nav({ onBook }) {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const homeAnchor = (id) => (e) => {
    e.preventDefault();
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    if (location.pathname !== '/') {
      window.location.hash = '#/';
      setTimeout(scroll, 120);
    } else {
      scroll();
    }
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="brand" to="/">
          <img className="brand-logo" src={logoDark} alt="Double H" />
          <span className="brand-sub">
            <i />
            {t('brand_sub')}
            <i />
          </span>
        </Link>
        <div className={`nav-links${open ? ' open' : ''}`}>
          <NavLink to="/" end>
            {t('nav_home')}
          </NavLink>
          <a href="#about" onClick={homeAnchor('about')}>
            {t('nav_about')}
          </a>
          <a href="#certificates" onClick={homeAnchor('certificates')}>
            {t('nav_certificates')}
          </a>
          <button className="btn-nav" onClick={onBook}>
            {t('nav_book')}
          </button>
        </div>
        {/* compact AR / EN toggle */}
        <div className="lang-toggle" role="group" aria-label="Language">
          {Object.entries(LANGS).map(([code, l]) => (
            <button
              key={code}
              className={lang === code ? 'active' : ''}
              onClick={() => setLang(code)}
              title={l.name}
            >
              {l.short}
            </button>
          ))}
        </div>
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">
          ☰
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  const [consultOpen, setConsultOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const openConsult = () => {
    if (location.pathname !== '/') {
      navigate('/');
      // let home mount, then open the modal
      setTimeout(() => setConsultOpen(true), 150);
    } else {
      setConsultOpen(true);
    }
  };

  return (
    <>
      <ScrollFX />
      <Nav onBook={openConsult} />
      <main>
        <Routes>
          <Route path="/" element={<Home onBook={openConsult} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home onBook={openConsult} />} />
        </Routes>
      </main>
      <ConsultModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </>
  );
}
