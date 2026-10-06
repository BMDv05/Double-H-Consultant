import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useLang } from './LangContext.jsx';
import Home from './pages/Home.jsx';
import Contact from './pages/Contact.jsx';
import Admin from './pages/Admin.jsx';

/* ---------- cursor FX disabled — normal system cursor ---------- */
function CursorFX() {
  return null;
}

/* ---------- booking transition (zoom into the handset, then go to booking) ---------- */
const BookCtx = createContext(() => {});
export const useBook = () => useContext(BookCtx);

export function BookButton({ to = '/contact', className = '', children }) {
  const book = useBook();
  const [ringing, setRinging] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <a
      href={`#${to}`}
      className={`btn btn-book ${className}${ringing ? ' ringing' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        setRinging(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setRinging(false), 750);
        book(to);
      }}
    >
      <svg
        className="btn-phone"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
      <span className="btn-label">{children}</span>
    </a>
  );
}

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

/* ---------- welcome intro (per session) ---------- */
function Intro() {
  const { t } = useLang();
  const [done, setDone] = useState(() => !!sessionStorage.getItem('dh-intro'));
  const [gone, setGone] = useState(() => !!sessionStorage.getItem('dh-intro'));

  useEffect(() => {
    if (gone) return;
    const finish = () => {
      setDone(true);
      sessionStorage.setItem('dh-intro', '1');
      setTimeout(() => setGone(true), 800);
    };
    const timer = setTimeout(finish, 2200);
    const onClick = () => {
      clearTimeout(timer);
      finish();
    };
    addEventListener('click', onClick, { once: true });
    return () => {
      clearTimeout(timer);
      removeEventListener('click', onClick);
    };
  }, [gone]);

  if (gone) return null;
  return (
    <div id="intro" className={done ? 'done' : ''} aria-hidden="true">
      <div className="intro-inner">
        <img className="intro-logo-img" src="/logo-light.png" alt="Double H" />
        <div className="intro-rule">
          <span />
        </div>
        <div className="intro-sub">{t('brand_sub')}</div>
        <div className="intro-bar">
          <i />
        </div>
      </div>
    </div>
  );
}

/* ---------- navigation (no contact button — booking goes through the free-call CTAs) ---------- */
function Nav() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const homeAnchor = (id) => (e) => {
    e.preventDefault();
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    if (location.pathname !== '/') {
      // navigate home first, then scroll
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
          <img className="brand-logo" src="/logo-dark.png" alt="Double H" />
          <span className="logo-tag">{t('brand_sub')}</span>
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
        </div>
        <div className="lang-toggle-wrap">
          <div className="lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={lang === 'en' ? 'on' : ''}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              className={lang === 'ar' ? 'on' : ''}
              onClick={() => setLang('ar')}
              aria-pressed={lang === 'ar'}
            >
              AR
            </button>
          </div>
        </div>
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">
          ☰
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  const { t } = useLang();
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const [veil, setVeil] = useState(null);
  const bookId = useRef(0);

  /* every booking remounts a fresh veil (new key) so the zoom always replays,
     centered on screen */
  const book = useCallback(
    (to) => {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        navigate(to);
        return;
      }
      bookId.current += 1;
      setVeil({ to, phase: 'in', id: bookId.current });
    },
    [navigate]
  );

  /* zoom in → navigate → fade out revealing the booking page */
  useEffect(() => {
    if (!veil || veil.phase !== 'in') return;
    const t = setTimeout(() => {
      navigate(veil.to);
      window.scrollTo(0, 0);
      setVeil((v) => (v && v.id === veil.id ? { ...v, phase: 'out' } : v));
    }, 850);
    return () => clearTimeout(t);
  }, [veil, navigate]);

  /* unmount after the fade so the next booking starts clean */
  useEffect(() => {
    if (!veil || veil.phase !== 'out') return;
    const t = setTimeout(() => {
      setVeil((v) => (v && v.id === veil.id ? null : v));
    }, 550);
    return () => clearTimeout(t);
  }, [veil]);

  return (
    <BookCtx.Provider value={book}>
      <CursorFX />
      <ScrollFX />
      <Intro />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer>
        <div className="foot foot-centered">
          <div className="foot-brand">Double H Consulting</div>
          <p className="foot-note">{t('footer_about')}</p>
          <div className="foot-rights">
            © {year} {t('footer_rights')}
          </div>
        </div>
      </footer>
      {veil && (
        <div key={veil.id} className={`book-veil ${veil.phase}`} aria-hidden="true">
          <div className="book-circle" />
          <div className="book-phone-wrap">
            <span className="book-ring r1" />
            <span className="book-ring r2" />
            <span className="book-ring r3" />
            <span className="book-phone-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
          </div>
        </div>
      )}
    </BookCtx.Provider>
  );
}
