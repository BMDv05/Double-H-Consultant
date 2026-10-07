import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useLang } from './LangContext.jsx';
import Home from './pages/Home.jsx';
import Contact from './pages/Contact.jsx';
import Admin from './pages/Admin.jsx';
import {
  IconArrow,
  IconMenu,
  IconClose,
  IconShield,
  IconPhoneCall,
  IconLock,
} from './icons.jsx';

/* ---------- booking context ---------- */
const BookCtx = createContext(() => {});
export const useBook = () => useContext(BookCtx);

export function BookButton({ to = '/contact', className = '', children }) {
  const book = useBook();
  return (
    <button
      type="button"
      className={`btn btn-book ${className}`}
      onClick={(e) => {
        e.preventDefault();
        book(to);
      }}
    >
      <IconPhoneCall className="btn-icon" size={18} />
      <span className="btn-label">{children}</span>
    </button>
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
      { threshold: 0.1 }
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
        const step = Math.max(1, Math.round(to / 35));
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

/* ---------- executive navigation ---------- */
function Nav() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnchor = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(scroll, 180);
    } else {
      scroll();
    }
  };

  return (
    <header className={`nav-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link className="brand" to="/" aria-label="Double H Consulting">
          <img className="brand-logo" src="/logo-dark.png" alt="Double H" />
          <span className="logo-tag">{t('brand_sub')}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main Navigation">
          <NavLink to="/" end onClick={() => setOpen(false)}>
            {t('nav_home')}
          </NavLink>
          <a href="#about" onClick={handleAnchor('about')}>
            {t('nav_about')}
          </a>
          <a href="#divisions" onClick={handleAnchor('divisions')}>
            {t('nav_divisions')}
          </a>
          <a href="#certificates" onClick={handleAnchor('certificates')}>
            {t('nav_certificates')}
          </a>
          <NavLink to="/contact" onClick={() => setOpen(false)}>
            {t('nav_contact')}
          </NavLink>
        </nav>

        {/* Actions / CTA & Language */}
        <div className="nav-actions">
          <div className="lang-switch" role="group" aria-label="Language selector">
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

          <Link to="/contact" className="btn btn-nav-cta">
            <span>{t('nav_book_cta')}</span>
            <IconArrow size={16} />
          </Link>

          <button
            type="button"
            className="burger-btn"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? <IconClose size={24} /> : <IconMenu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const { t } = useLang();
  const year = new Date().getFullYear();
  const navigate = useNavigate();

  const book = useCallback(
    (to) => {
      navigate(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [navigate]
  );

  return (
    <BookCtx.Provider value={book}>
      <ScrollFX />
      <Nav />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-top-grid">
            <div className="footer-brand-col">
              <Link to="/" className="footer-brand">
                <img src="/logo-dark.png" alt="Double H" className="footer-logo" />
                <span className="footer-tag">{t('brand_sub')}</span>
              </Link>
              <p className="footer-desc">{t('footer_about')}</p>
              <div className="footer-trust-pill">
                <IconShield size={16} />
                <span>American PE & ISO 9001 Accredited</span>
              </div>
            </div>

            <div className="footer-links-col">
              <h4>Practice Areas</h4>
              <ul>
                <li><Link to="/contact?division=bim">{t('div_bim')}</Link></li>
                <li><Link to="/contact?division=arch">{t('div_arch')}</Link></li>
                <li><Link to="/contact?division=civil">{t('div_civil')}</Link></li>
                <li><Link to="/contact?division=elec">{t('div_elec')}</Link></li>
                <li><Link to="/contact?division=law">{t('div_law')}</Link></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4>Organization</h4>
              <ul>
                <li><a href="#about">{t('nav_about')}</a></li>
                <li><a href="#divisions">{t('nav_divisions')}</a></li>
                <li><a href="#certificates">{t('nav_certificates')}</a></li>
                <li><Link to="/contact">{t('nav_contact')}</Link></li>
                <li>
                  <Link to="/admin" className="admin-link">
                    <IconLock size={14} />
                    <span>{t('footer_admin')}</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-contact-col">
              <h4>Executive Inquiries</h4>
              <p className="footer-contact-item">info@doubleh.com</p>
              <p className="footer-contact-item">+1 (555) 000-0000</p>
              <p className="footer-contact-item">New York, NY — Serving Global Clients</p>
              <Link to="/contact" className="btn btn-footer-cta">
                {t('cta_book_now')}
              </Link>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p className="footer-copyright">
              © {year} {t('footer_rights')}
            </p>
            <div className="footer-legal-tags">
              <span>Confidentiality Assured</span>
              <span>•</span>
              <span>US Engineering Standards</span>
            </div>
          </div>
        </div>
      </footer>
    </BookCtx.Provider>
  );
}
