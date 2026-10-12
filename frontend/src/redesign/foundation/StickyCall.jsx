import styles from './StickyCall.module.css';

function scrollTo(event, id) {
  event.preventDefault();
  const target = document.getElementById(id);
  const quiet =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    target?.closest('[data-reduced-motion="true"]');
  if (window.__lenis && !quiet) {
    window.__lenis.scrollTo(target, { offset: -88 });
  } else {
    target?.scrollIntoView({ behavior: quiet ? 'auto' : 'smooth' });
  }
}

export default function StickyCall({ lang, onBook, visible, disabled = false, activeSection = 'divisions' }) {
  if (!visible || disabled) return null;
  const ar = lang === 'ar';
  return (
    <aside
      className={`${styles.dock} ${styles.sticky}`}
      dir={ar ? 'rtl' : 'ltr'}
      lang={lang}
      aria-label={ar ? 'شريط التنقل السريع' : 'Quick navigation dock'}
    >
      <nav className={styles.dockNav} aria-label={ar ? 'أقسام الصفحة' : 'Page sections'}>
        <a
          href="#divisions"
          onClick={(e) => scrollTo(e, 'divisions')}
          className={styles.dockLink}
          data-active={activeSection === 'divisions'}
        >
          {ar ? 'التخصصات' : 'Disciplines'}
        </a>
        <a
          href="#about"
          onClick={(e) => scrollTo(e, 'about')}
          className={styles.dockLink}
          data-active={activeSection === 'about'}
        >
          {ar ? 'عنّا' : 'About'}
        </a>
        <a
          href="#journey"
          onClick={(e) => scrollTo(e, 'journey')}
          className={styles.dockLink}
          data-active={activeSection === 'journey'}
        >
          {ar ? 'مسار الاستشارة' : 'Journey'}
        </a>
      </nav>
      <div className={styles.dockDivider} aria-hidden="true" />
      <button
        className={`${styles.dockCta} ${styles.call}`}
        type="button"
        onClick={() => onBook({ source: 'sticky' })}
      >
        <span className={styles.pulseContainer} aria-hidden="true">
          <span className={styles.pulseDot} />
        </span>
        <span className={`${styles.dockCopy} ${styles.copy}`}>
          <strong className={`${styles.dockTitle} ${styles.title}`}>{ar ? 'احجز استشارة' : 'Schedule Call'}</strong>
          <small className={`${styles.dockHelper} ${styles.helper}`}>{ar ? '15 دقيقة مجاناً' : '15-Min Free'}</small>
        </span>
        <span className={`${styles.dockArrow} ${styles.arrow}`} aria-hidden="true">↗</span>
      </button>
    </aside>
  );
}
