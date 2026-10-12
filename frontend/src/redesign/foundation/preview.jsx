/* Isolated fixtures only. No application, booking, scene, or other phase imports. */
import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Link, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader.jsx';
import SiteFooter from './SiteFooter.jsx';
import StickyCall from './StickyCall.jsx';
import './tokens.css';
import styles from './preview.module.css';

const text = {
  en: { preview: 'Phase 01 / Foundation preview', title: 'Space to think.\nA clear next step.', body: 'A preview of the navigation, footer, and free-call action. Page content and the consultation form are built in their own phases.', explore: 'Explore the page', illustration: 'Layout study — preview fixture', about: 'About', divisions: 'Divisions', journey: 'Your first call', certificates: 'Our approach', values: 'Values', final: 'Start a conversation', target: 'Navigation target. Content belongs to the page phase.', contact: 'Let’s start with your question.', contactBody: 'Contact route fixture. The contact form will be connected in Phase 7.', call: 'Request your free call', tools: 'Preview checks', sticky: 'Show sticky action', disable: 'Disable sticky action', contacts: 'Show sample contacts (preview only)', callback: 'Booking callback', callbackNote: 'Preview only. No request was sent.', close: 'Close preview', admin: 'Open theme-isolation fixture', return: 'Return to preview', skip: 'Skip to content' },
  ar: { preview: 'المرحلة 01 / معاينة الأساس', title: 'مساحة للتفكير.\nخطوة تالية واضحة.', body: 'معاينة للتنقل وأسفل الصفحة وزر المكالمة المجانية. محتوى الصفحة ونموذج الاستشارة ضمن مراحل مستقلة.', explore: 'اكتشف الصفحة', illustration: 'دراسة تخطيط — نموذج للمعاينة', about: 'عنّا', divisions: 'التخصصات', journey: 'مكالمتك الأولى', certificates: 'نهجنا', values: 'القيم', final: 'لنبدأ بمحادثة', target: 'وجهة للتنقل. المحتوى ضمن مرحلة الصفحة.', contact: 'لنبدأ بسؤالك.', contactBody: 'نموذج لمسار التواصل. يُربط نموذج التواصل في المرحلة 7.', call: 'اطلب مكالمتك المجانية', tools: 'فحوصات المعاينة', sticky: 'إظهار زر المكالمة الثابت', disable: 'تعطيل زر المكالمة الثابت', contacts: 'إظهار بيانات تجريبية (للمعاينة فقط)', callback: 'استدعاء حجز المكالمة', callbackNote: 'معاينة فقط. لم يُرسل أي طلب.', close: 'إغلاق المعاينة', admin: 'فتح نموذج عزل التنسيق', return: 'العودة للمعاينة', skip: 'انتقل إلى المحتوى' },
};

const checks = {
  en: { invalid: 'Use invalid contacts (preview only)', input: 'Input-focus fixture', source: 'Callback source' },
  ar: { invalid: 'بيانات غير صالحة (للمعاينة فقط)', input: 'نموذج اختبار التركيز في الحقل', source: 'مصدر الاستدعاء' },
};

function LayoutStudy({ label }) {
  return <figure className={styles.study}>
    <svg viewBox="0 0 480 420" role="img" aria-label={label}>
      <defs><pattern id="preview-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="#12393a" strokeOpacity=".07" /></pattern></defs>
      <rect width="480" height="420" fill="url(#preview-grid)" />
      <g fill="none" stroke="#a1844a" strokeWidth="1"><path d="M24 24h18m-18 0v18M456 24h-18m18 0v18M24 396h18m-18 0v-18M456 396h-18m18 0v-18" /></g>
      <g fill="none" stroke="#12393a" strokeWidth="1.5">
        <path d="M90 302L210 370L397 263L277 195Z" fill="#e2e6dc" />
        <path d="M125 282V139L219 85L219 335Z" fill="#f6f4ee" />
        <path d="M219 85L312 138V282L219 335Z" fill="#d8ded4" />
        <path d="M125 139L219 192L312 138M219 192V335" />
        <path d="M168 307V212L263 157V310" />
        <path d="M125 187L219 240L312 186M125 234L219 287L312 233" strokeOpacity=".3" />
      </g>
      <path d="M90 330L210 398M210 398L397 291" fill="none" stroke="#a1844a" strokeWidth="1" />
    </svg>
    <figcaption>{label}</figcaption>
  </figure>;
}

function Preview() {
  const [lang, setLang] = useState('en');
  const [visible, setVisible] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [sampleContacts, setSampleContacts] = useState(false);
  const [invalidContacts, setInvalidContacts] = useState(false);
  const [editing, setEditing] = useState(false);
  const [request, setRequest] = useState(null);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const location = useLocation();
  const copy = text[lang];
  const checkCopy = checks[lang];
  const stickyDisabled = disabled || Boolean(request) || editing;
  const stickyRendered = visible && !stickyDisabled;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);
  useEffect(() => {
    const element = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (element) element.scrollIntoView({ behavior: 'instant' });
    else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  useEffect(() => {
    if (request && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
    if (!request && openerRef.current) {
      const opener = openerRef.current.isConnected ? openerRef.current
        : document.querySelector('[data-preview-sticky] button');
      opener?.focus({ preventScroll: true });
      openerRef.current = null;
    }
  }, [request]);

  function book(options) {
    openerRef.current = document.activeElement;
    setRequest(options);
  }
  function closePreview() {
    dialogRef.current?.close();
    setRequest(null);
  }

  if (location.pathname === '/admin') return <main style={{ padding: 32, font: '16px monospace', color: 'rgb(61, 47, 80)', background: 'rgb(240, 236, 247)', minHeight: '100vh' }} data-isolation-fixture>
    <h1>Theme isolation fixture</h1><p>This sits outside .dh-public. It does not import the real admin application.</p><Link to="/">Return to preview</Link>
  </main>;

  return <div className="dh-public" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} data-sticky-call={stickyRendered}>
    <a href="#preview-content" className={styles.skip} onClick={(event) => { event.preventDefault(); document.getElementById('preview-content')?.focus(); }}>{copy.skip}</a>
    <SiteHeader lang={lang} onLanguageChange={setLang} onBook={book} />
    <main id="preview-content" tabIndex={-1}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{copy.preview}</p>
          <h1>{location.pathname === '/contact' ? copy.contact : copy.title}</h1>
          <p className={styles.intro}>{location.pathname === '/contact' ? copy.contactBody : copy.body}</p>
          <Link to={{ pathname: '/', hash: '#about' }} className={styles.explore}>{copy.explore}<span aria-hidden="true">↓</span></Link>
        </div>
        <LayoutStudy label={copy.illustration} />
      </section>
      {['certificates', 'about', 'journey', 'divisions', 'values', 'final-call'].map((id, index) => <section id={id} key={id} className={styles.target}>
        <span className={styles.index} aria-hidden="true">0{index + 1}</span>
        <h2>{copy[id === 'final-call' ? 'final' : id]}</h2><p>{copy.target}</p>
      </section>)}
      <section className={styles.tools} aria-label={copy.tools}>
        <h2>{copy.tools}</h2>
        <label><input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} />{copy.sticky}</label>
        <label><input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.target.checked)} />{copy.disable}</label>
        <label><input type="checkbox" checked={sampleContacts} onChange={(event) => setSampleContacts(event.target.checked)} />{copy.contacts}</label>
        <label><input type="checkbox" checked={invalidContacts} onChange={(event) => setInvalidContacts(event.target.checked)} />{checkCopy.invalid}</label>
        <label>{checkCopy.input}<textarea rows={2} onFocus={() => setEditing(true)} onBlur={() => setEditing(false)} /></label>
        <Link to="/admin">{copy.admin}</Link>
      </section>
    </main>
    <SiteFooter lang={lang} onBook={book} contacts={invalidContacts ? { email: 'hello@example.invalid?bcc=other@example.invalid', phone: 'javascript:alert(1)', address: 'x'.repeat(301) } : sampleContacts ? { email: 'hello@example.invalid', phone: '+1 202 555 0100', address: lang === 'ar' ? 'عنوان تجريبي للمعاينة فقط' : 'Sample address — preview only' } : { email: null, phone: null, address: null }} />
    <div data-preview-sticky><StickyCall lang={lang} onBook={book} visible={visible} disabled={stickyDisabled} /></div>
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="callback-title" onCancel={(event) => { event.preventDefault(); closePreview(); }} onClose={() => setRequest(null)}>
      <h2 id="callback-title">{copy.callback}</h2><p>{copy.callbackNote}</p>
      <output aria-label={checkCopy.source}>{request?.source}</output>
      <button type="button" autoFocus onClick={closePreview}>{copy.close}</button>
    </dialog>
  </div>;
}

const previewRoot = createRoot(document.getElementById('root'));
previewRoot.render(<StrictMode><HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Preview /></HashRouter></StrictMode>);
if (import.meta.hot) import.meta.hot.dispose(() => previewRoot.unmount());
