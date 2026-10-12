import { Link } from 'react-router-dom';
import styles from './SiteFooter.module.css';

const copy = {
  en: { title: 'A clear next step starts with a conversation.', call: 'Request your free call', helper: '15 minutes. No fee. We’ll agree a time with you.', identity: 'Engineering, business, and specialist consulting.', consulting: 'Consulting', explore: 'Explore', about: 'About', journey: 'Your first call', divisions: 'Divisions', quality: 'Our approach', contact: 'Contact', reach: 'Get in touch', contactPage: 'Send an inquiry', privacy: 'Tell us what you need. We’ll take it from there.', navigation: 'Footer navigation' },
  ar: { title: 'خطوتك التالية تبدأ بمحادثة.', call: 'اطلب مكالمتك المجانية', helper: '15 دقيقة. دون رسوم. نتفق معك على الموعد.', identity: 'استشارات هندسية وإدارية وتخصصية.', consulting: 'للاستشارات', explore: 'اكتشف', about: 'عنّا', journey: 'مكالمتك الأولى', divisions: 'التخصصات', quality: 'نهجنا', contact: 'تواصل معنا', reach: 'للتواصل', contactPage: 'أرسل استفسارك', privacy: 'أخبرنا بما تحتاجه، ولنبدأ من هناك.', navigation: 'روابط أسفل الصفحة' },
};
const sections = [ ['about', '#about'], ['journey', '#journey'], ['divisions', '#divisions'], ['quality', '#certificates'] ];

// Only a composition owner with verified details should supply contacts.
// Ignore malformed URI values rather than making a potentially unsafe link.
function emailHref(email) {
  return typeof email === 'string' && email.trim().length <= 254 && /^[^\s@?#:&\x00-\x1f\x7f]+@[^\s@?#:&\x00-\x1f\x7f]+\.[^\s@?#:&\x00-\x1f\x7f]+$/.test(email.trim())
    ? `mailto:${encodeURIComponent(email.trim()).replace('%40', '@')}` : null;
}
function phoneHref(phone) {
  if (typeof phone !== 'string' || !/^\+?[\d\s().-]{6,30}$/.test(phone.trim())) return null;
  const digits = phone.replace(/[^\d+]/g, '');
  return /^\+?\d{6,15}$/.test(digits) ? `tel:${digits}` : null;
}

export default function SiteFooter({ lang, onBook, contacts = {} }) {
  const text = copy[lang === 'ar' ? 'ar' : 'en'];
  const supplied = contacts || {};
  const email = emailHref(supplied.email);
  const phone = phoneHref(supplied.phone);
  const address = typeof supplied.address === 'string' && supplied.address.trim().length <= 300
    && !/[\x00-\x1f\x7f]/.test(supplied.address) ? supplied.address.trim() : '';
  return (
    <footer className={styles.footer} dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      <div className={styles.inner}>
        <div className={styles.invitation}>
          <h2>{text.title}</h2>
          <div className={styles.invitationAction}>
            <button type="button" className={styles.call} onClick={() => onBook({ source: 'final' })}>
              {text.call}<span className={styles.arrow} aria-hidden="true">↗</span>
            </button>
            <p>{text.helper}</p>
          </div>
        </div>
        <div className={styles.details}>
          <div className={styles.identity}>
            <Link to="/" aria-label={lang === 'ar' ? 'دبل إتش للاستشارات — الرئيسية' : 'Double H Consulting — Home'} className={styles.brand}>
              <img src="/logo-light.png" width="900" height="184" alt="Double H" />
              <span>{text.consulting}</span>
            </Link>
            <p>{text.identity}</p>
          </div>
          <nav className={styles.navigation} aria-label={text.navigation}>
            <h3>{text.explore}</h3>
            {sections.map(([key, hash]) => <Link key={key} to={{ pathname: '/', hash }}>{text[key]}</Link>)}
          </nav>
          <div className={styles.contact}>
            <h3>{text.reach}</h3>
            {email && <a href={email} dir="ltr">{supplied.email.trim()}</a>}
            {phone && <a href={phone} dir="ltr">{supplied.phone.trim()}</a>}
            {address && <p>{address}</p>}
            <Link to="/contact" className={styles.contactLink}>{text.contactPage}<span className={styles.arrow} aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className={styles.bottom}>
          <small>© {new Date().getFullYear()} Double H Consulting</small>
          <p>{text.privacy}</p>
        </div>
      </div>
    </footer>
  );
}
