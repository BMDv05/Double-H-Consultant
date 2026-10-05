import { useEffect, useState } from 'react';
import { useLang } from '../LangContext.jsx';
import Words from '../Words.jsx';
import Icon from '../Icon.jsx';

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

export default function Contact() {
  const { t, lang } = useLang();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | ok | error
  const [honeypot, setHoneypot] = useState('');
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch('/api/company')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setInfo(d))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // client-side rate limit: max 5 / 10 min per browser
  const rateOk = () => {
    try {
      const key = 'dh-rl-contact';
      const now = Date.now();
      let arr = JSON.parse(localStorage.getItem(key) || '[]').filter((x) => now - x < 600000);
      if (arr.length >= 5) return false;
      arr.push(now);
      localStorage.setItem(key, JSON.stringify(arr));
      return true;
    } catch {
      return true;
    }
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = t('err_name');
    if (!validEmail(form.email.trim())) e.email = t('err_email');
    if (form.subject.trim().length < 2) e.subject = t('err_subject');
    if (form.message.trim().length < 10 || form.message.trim().length > 3000) e.message = t('err_message');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (honeypot) return; // bot filled hidden field
    if (!validate()) return;
    if (!rateOk()) {
      setErrors({ global: t('err_rate') });
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang, honeypot }),
      });
      if (res.ok) {
        setState('ok');
      } else {
        setState('error');
        setErrors({ global: t('err_generic') });
      }
    } catch {
      setState('error');
      setErrors({ global: t('err_network') });
    }
  };

  const reset = () => {
    setForm({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setState('idle');
  };

  return (
    <section className="section">
      <div className="eyebrow reveal">Double H</div>
      <h2 className="w3d">
        <Words text={t('contact_title')} />
      </h2>
      <p className="section-lead w3d">
        <Words text={t('contact_desc')} cap={30} />
      </p>

      <div className="contact-grid">
        <div className="contact-info">
          {[
            ['mail', 'contact_email', info?.email || 'info@doubleh.com', true],
            ['phone', 'contact_phone', info?.phone || '+1 (555) 000-0000', true],
            ['clock', 'contact_hours', t('contact_hours_v'), false],
            ['globe', 'contact_location', info?.address || t('contact_location_v'), false],
          ].map(([icon, key, value, ltr], i) => (
            <div className="info-card reveal" key={key} style={{ '--d': `${i * 90}ms` }}>
              <div className="icon-line">
                <Icon name={icon} size={22} />
              </div>
              <div>
                <h3>{t(key)}</h3>
                <p dir={ltr ? 'ltr' : undefined}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="form-wrap reveal">
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
              <label>{t('form_name')}</label>
              <input value={form.name} onChange={set('name')} autoComplete="name" />
              <div className="err">{errors.name}</div>

              <label>{t('form_email')}</label>
              <input type="email" dir="ltr" value={form.email} onChange={set('email')} autoComplete="email" />
              <div className="err">{errors.email}</div>

              <label>{t('form_subject')}</label>
              <input value={form.subject} onChange={set('subject')} />
              <div className="err">{errors.subject}</div>

              <label>{t('form_message')}</label>
              <textarea rows={5} maxLength={3000} value={form.message} onChange={set('message')} />
              <div className="err">{errors.message}</div>

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
                <p className="notice" style={{ color: '#b42318' }}>
                  {errors.global}
                </p>
              )}

              <button className="btn btn-dark" type="submit" disabled={state === 'sending'} style={{ marginTop: 12 }}>
                {state === 'sending' ? t('form_sending') : t('form_send')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
