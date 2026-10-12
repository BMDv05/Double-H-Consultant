import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './SiteHeader.module.css';

const copy = {
  en: { home: 'Home', about: 'About', divisions: 'Divisions', contact: 'Contact', consulting: 'Consulting', navigation: 'Main navigation', menu: 'Open menu', close: 'Close menu', language: 'Switch to Arabic', call: 'Request your free call', helper: 'A 15-minute introductory conversation.' },
  ar: { home: 'الرئيسية', about: 'عنّا', divisions: 'التخصصات', contact: 'تواصل معنا', consulting: 'للاستشارات', navigation: 'التنقل الرئيسي', menu: 'فتح القائمة', close: 'إغلاق القائمة', language: 'التبديل إلى الإنجليزية', call: 'اطلب مكالمتك المجانية', helper: 'محادثة تعارف لمدة 15 دقيقة.' },
};
const destinations = [
  { key: 'home', to: '/' },
  { key: 'about', to: { pathname: '/', hash: '#about' } },
  { key: 'divisions', to: { pathname: '/', hash: '#divisions' } },
  { key: 'contact', to: '/contact' },
];

export default function SiteHeader({ lang, onLanguageChange, onBook, activeSection }) {
  const text = copy[lang === 'ar' ? 'ar' : 'en'];
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const panelRef = useRef(null);
  const menuId = useId();
  const activeKey = location.pathname === '/contact' ? 'contact'
    : location.pathname === '/' ? activeSection || location.hash.slice(1) || 'home' : '';

  function closeMenu(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) menuRef.current?.focus({ preventScroll: true });
  }

  useEffect(() => { setOpen(false); }, [location.pathname, location.hash, lang]);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        menuRef.current?.focus({ preventScroll: true });
      }
    }
    function onPointerDown(event) {
      if (!headerRef.current?.contains(event.target)) setOpen(false);
    }
    const desktop = window.matchMedia('(min-width: 1060px)');
    let mobileHadFocus = menuRef.current === document.activeElement
      || panelRef.current?.contains(document.activeElement);
    function onFocusIn(event) {
      if (event.target === document.body) return;
      mobileHadFocus = menuRef.current === event.target || panelRef.current?.contains(event.target);
    }
    function onResize(event) {
      if (!event.matches) return;
      if (mobileHadFocus) headerRef.current?.querySelector('a')?.focus({ preventScroll: true });
      setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('focusin', onFocusIn);
    desktop.addEventListener('change', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocusIn);
      desktop.removeEventListener('change', onResize);
    };
  }, [open]);

  function links(mobile = false) {
    return destinations.map(({ key, to }) => (
      <Link key={key} to={to} className={styles.link}
        aria-current={activeKey === key ? (key === 'home' || key === 'contact' ? 'page' : 'location') : undefined}
        onClick={(event) => {
          if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) closeMenu(mobile);
        }}>
        {text[key]}
        {mobile && <span className={styles.linkArrow} aria-hidden="true">↗</span>}
      </Link>
    ));
  }

  return (
    <header className={styles.header} ref={headerRef} dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      <div className={styles.bar}>
        <Link className={styles.brand} to="/" aria-label={lang === 'ar' ? 'دبل إتش للاستشارات — الرئيسية' : 'Double H Consulting — Home'} onClick={() => closeMenu(open)}>
          <img src="/logo-dark.png" width="900" height="184" alt="Double H" className={styles.logo} />
          <span className={styles.descriptor}>{text.consulting}</span>
        </Link>
        <nav className={styles.desktopNav} aria-label={text.navigation}>{links()}</nav>
        <div className={styles.actions}>
          <button className={styles.language} type="button"
            aria-label={text.language} onClick={() => onLanguageChange(lang === 'ar' ? 'en' : 'ar')}>
            <span lang={lang === 'ar' ? 'en' : 'ar'}>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
          <button className={styles.desktopCall} type="button" onClick={() => onBook({ source: 'header' })}>
            {text.call}<span className={styles.callArrow} aria-hidden="true">↗</span>
          </button>
          <button className={styles.menuToggle} ref={menuRef} type="button" aria-label={open ? text.close : text.menu}
            aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((value) => !value)}>
            <span className={`${styles.menuLines} ${open ? styles.menuLinesOpen : ''}`} aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </div>
      <div id={menuId} ref={panelRef} className={styles.mobilePanel} hidden={!open}>
        <nav className={styles.mobileNav} aria-label={text.navigation}>{links(true)}</nav>
        <div className={styles.mobileAction}>
          <p>{text.helper}</p>
          <button className={styles.mobileCall} type="button" onClick={() => { closeMenu(true); onBook({ source: 'header' }); }}>
            {text.call}<span className={styles.callArrow} aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </header>
  );
}
