import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useLang } from './LangContext.jsx';
import { LANGS } from './i18n.js';
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
  const { lang } = useLang();
  const [ringing, setRinging] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const dest = `/${lang}${to}`;
  return (
    <a
      href={`#${dest}`}
      className={`btn btn-book ${className}${ringing ? ' ringing' : ''}`}
      onClick={(e) => {
        /* let modifier/middle clicks open natively in a new tab */
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
        e.preventDefault();
        setRinging(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setRinging(false), 750);
        book(dest);
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
    let frame = 0;
    const update = () => {
      frame = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
      if (barRef.current) barRef.current.style.width = p + '%';

    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    onScroll();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const seen = new WeakSet();
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
    /* also pick up .reveal nodes added later (e.g. fetched certificates) */
    const observe = () =>
      document
        .querySelectorAll(
          '.reveal, .section > .eyebrow, .section > h2, .section > .section-lead, .div-pin > .eyebrow, .div-pin > h2, .div-pin > .section-lead'
        )
        .forEach((el) => {
          if (!seen.has(el)) {
            el.classList.add('reveal');
            seen.add(el);
            io.observe(el);
          }
        });
    observe();
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return <div id="progress" ref={barRef} />;
}

/* ---------- animated counters ---------- */
export function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = to + suffix;
      return;
    }
    let iv;
    const io = new IntersectionObserver((es) => {
      es.forEach((x) => {
        if (!x.isIntersecting) return;
        io.unobserve(x.target);
        let s = 0;
        const step = Math.max(1, Math.round(to / 40));
        iv = setInterval(() => {
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
    return () => {
      io.disconnect();
      if (iv) clearInterval(iv);
    };
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
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  /* Esc and outside-click close the burger menu */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    addEventListener('keydown', onKey);
    addEventListener('mousedown', onClick);
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('mousedown', onClick);
    };
  }, [open ]);

  const homePath = `/${lang}`;
  /* switch language everywhere: on /:lang/* pages also move the URL prefix
     (otherwise Localized would snap the toggle back to the URL language) */
  const switchLang = (l) => {
    setLang(l);
    const m = location.pathname.match(/^\/([a-z]{2})(\/.*)?$/);
    if (m && LANGS[m[1]]) {
      navigate(`/${l}${m[2] || ''}`, { replace: true });
    }
  };
  const homeAnchor = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const scroll = () =>
      document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    if (location.pathname !== homePath && location.pathname !== '/') {
      // navigate home first, then scroll once the section exists (retry briefly)
      navigate(homePath);
      let n = 0;
      const iv = setInterval(() => {
        if (document.getElementById(id)) {
          clearInterval(iv);
          scroll();
        } else if (++n > 15) {
          clearInterval(iv);
        }
      }, 100);
    } else {
      scroll();
    }
  };

  return (
    <nav className="nav">
      <div className="nav-inner" ref={menuRef}>
        <Link className="brand" to={homePath}>
          <img className="brand-logo" src="/logo-dark.png" alt="Double H" />
          <span className="logo-tag">{t('brand_sub')}</span>
        </Link>
        <div className={`nav-links${open ? ' open' : ''}`} id="nav-links">
          <NavLink to={homePath} end style={{ '--i': 0 }}>
            {t('nav_home')}
          </NavLink>
          <a href="#about" onClick={homeAnchor('about')} style={{ '--i': 1 }}>
            {t('nav_about')}
          </a>
          <a href="#certificates" onClick={homeAnchor('certificates')} style={{ '--i': 2 }}>
            {t('nav_certificates')}
          </a>
        </div>
        <div className="lang-toggle-wrap">
          <div className="lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={lang === 'en' ? 'on' : ''}
              onClick={() => switchLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              className={lang === 'ar' ? 'on' : ''}
              onClick={() => switchLang('ar')}
              aria-pressed={lang === 'ar'}
            >
              AR
            </button>
          </div>
        </div>
        <button
          className={`burger${open ? ' open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="nav-links"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}

/* ---------- /:lang/* routes: sync the language from the URL, then render the page ---------- */
function Localized() {
  const { lang, setLang } = useLang();
  const { lang: urlLang, '*': rest } = useParams();

  useEffect(() => {
    if (LANGS[urlLang] && urlLang !== lang) setLang(urlLang);
  }, [urlLang, lang, setLang]);

  if (!LANGS[urlLang]) return <Home />;
  const page = (rest || '').replace(/\/+$/, '');
  if (page === 'contact') return <Contact />;
  if (page === 'admin') return <Admin />;
  return <Home />;
}

export default function App() {
  const { t } = useLang();
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const [veil, setVeil] = useState(null);
  const bookId = useRef(0);

  /* every booking remounts a fresh veil (new key) so the zoom always replays,
     centered on screen. Navigation happens immediately on click — the veil is
     a quick non-blocking fade over the new page, never a wait. */
  const book = useCallback(
    (to) => {
      navigate(to);
      window.scrollTo(0, 0);
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      bookId.current += 1;
      setVeil({ to, phase: 'out', id: bookId.current });
    },
    [navigate]
  );

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
          <Route path="/:lang/*" element={<Localized />} />
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
