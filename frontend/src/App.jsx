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
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      if (barRef.current) barRef.current.style.width = p + '%';
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const els = [...document.querySelectorAll('.reveal')];
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
    return () => io.disconnect();
  }, [pathname]);

  return <div id="progress" ref={barRef} />;
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
