import { useEffect, useState } from 'react';
import { useLang } from '../LangContext.jsx';

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 2" />
  </svg>
);

const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

const RL_KEY = 'dh-rl-contact';
const RL_MAX = 5;
const RL_WINDOW = 600000; // 10 min

const readStamps = () => {
  try {
    const now = Date.now();
    return JSON.parse(localStorage.getItem(RL_KEY) || '[]').filter((x) => now - x < RL_WINDOW);
  } catch {
    return [];
  }
};

export default function Contact() {
  const { t, lang } = useLang();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | ok
  const [honeypot, setHoneypot] = useState('');
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch('/api/company')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setInfo(d))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const sending = state === 'sending';
  const msgLen = form.message.trim().length;

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = t('err_name');
    if (!validEmail(form.email.trim())) e.email = t('err_email');
    if (form.subject.trim().length < 2) e.subject = t('err_subject');
    if (msgLen < 10 || msgLen > 3000) e.message = t('err_message');
    setErrors(e);
    return e;
  };

  const focusFirstError = (e) => {
    for (const k of ['name', 'email', 'subject', 'message']) {
      if (e[k]) {
        document.getElementById(`contact-${k}`)?.focus();
        break;
      }
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    /* bot filled the hidden field — pretend it worked */
    if (honeypot) {
      setState('ok');
      return;
    }
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }
    if (readStamps().length >= RL_MAX) {
      setErrors({ global: t('err_rate') });
      return;
    }
    setErrors({});
    setState('sending');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang, honeypot }),
        signal: ctrl.signal,
      });
      if (res.ok) {
        try {
          localStorage.setItem(RL_KEY, JSON.stringify([...readStamps(), Date.now()]));
        } catch {
          /* storage unavailable — ignore */
        }
        setState('ok');
      } else if (res.status === 429) {
        setState('idle');
        setErrors({ global: t('err_rate') });
      } else {
        const body = await res.json().catch(() => ({}));
        setState('idle');
        setErrors({ global: body.error || t('err_generic') });
      }
    } catch (err) {
      setState('idle');
      setErrors({ global: t('err_network') });
    } finally {
      clearTimeout(timer);
    }
  };

  const reset = () => {
    setForm({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setState('idle');
  };

  return (
    <section className="section contact-page">
      <div className="eyebrow">Double H</div>
      <h2>{t('contact_title')}</h2>
      <p className="section-lead">{t('contact_desc')}</p>

      <div className="contact-info contact-info-row reveal">
          <div className="info-card">
            <div className="info-icon" aria-hidden="true">
              <IconMail />
            </div>
            <h3>{t('contact_email')}</h3>
            <p dir="ltr">{info?.email || 'info@doubleh.com'}</p>
          </div>
          <div className="info-card">
            <div className="info-icon" aria-hidden="true">
              <IconPhone />
            </div>
            <h3>{t('contact_phone')}</h3>
            <p dir="ltr">{info?.phone || '+1 (555) 000-0000'}</p>
          </div>
          <div className="info-card">
            <div className="info-icon" aria-hidden="true">
              <IconClock />
            </div>
            <h3>{t('contact_hours')}</h3>
            <p>{t('contact_hours_v')}</p>
          </div>
          <div className="info-card">
            <div className="info-icon" aria-hidden="true">
              <IconPin />
            </div>
            <h3>{t('contact_location')}</h3>
            <p>{info?.address || t('contact_location_v')}</p>
          </div>
        </div>

        <div className="form-wrap form-centered reveal">
          {state === 'ok' ? (
            <div className="ok-box">
              <h3>{t('form_ok_t')}</h3>
              <p>{t('form_ok_d')}</p>
              <button className="btn btn-dark" onClick={reset}>
                {t('form_again')}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label htmlFor="contact-name">{t('form_name')}</label>
              <input
                id="contact-name"
                value={form.name}
                onChange={set('name')}
                autoComplete="name"
                disabled={sending}
                aria-describedby={errors.name ? 'contact-name-err' : undefined}
                aria-invalid={!!errors.name}
              />
              <div className="err" id="contact-name-err" role="alert">{errors.name}</div>

              <label htmlFor="contact-email">{t('form_email')}</label>
              <input
                id="contact-email"
                type="email"
                dir="ltr"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                disabled={sending}
                aria-describedby={errors.email ? 'contact-email-err' : undefined}
                aria-invalid={!!errors.email}
              />
              <div className="err" id="contact-email-err" role="alert">{errors.email}</div>

              <label htmlFor="contact-subject">{t('form_subject')}</label>
              <input
                id="contact-subject"
                value={form.subject}
                onChange={set('subject')}
                disabled={sending}
                aria-describedby={errors.subject ? 'contact-subject-err' : undefined}
                aria-invalid={!!errors.subject}
              />
              <div className="err" id="contact-subject-err" role="alert">{errors.subject}</div>

              <label htmlFor="contact-message">{t('form_message')}</label>
              <textarea
                id="contact-message"
                rows={5}
                maxLength={3000}
                value={form.message}
                onChange={set('message')}
                disabled={sending}
                aria-describedby="contact-message-count contact-message-err"
                aria-invalid={!!errors.message}
              />
              <div className="char-count" id="contact-message-count">{msgLen}/3000</div>
              <div className="err" id="contact-message-err" role="alert">{errors.message}</div>

              {/* honeypot */}
              <input
                className="honey"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                aria-hidden="true"
              />

              {errors.global && (
                <p className="notice" style={{ color: 'var(--deep1)' }} role="alert">
                  {errors.global}
                </p>
              )}

              <button className="btn btn-dark" type="submit" disabled={sending} style={{ marginTop: 12 }}>
                {sending ? t('form_sending') : t('form_send')}
              </button>
            </form>
          )}
        </div>
    </section>
  );
}
