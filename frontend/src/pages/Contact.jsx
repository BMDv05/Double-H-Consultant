import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../LangContext.jsx';
import {
  IconMail,
  IconPhone,
  IconClock,
  IconPin,
  IconShield,
  IconArrow,
  IconCheckBadge,
} from '../icons.jsx';

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

export default function Contact() {
  const { t, lang } = useLang();
  const [searchParams] = useSearchParams();
  const prefillDiv = searchParams.get('division') || '';
  const prefillSubject = searchParams.get('subject') || '';

  const [form, setForm] = useState({
    name: '',
    email: '',
    division: prefillDiv,
    subject: prefillSubject ? `Inquiry: ${prefillSubject}` : '',
    message: '',
  });

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

  useEffect(() => {
    if (prefillDiv || prefillSubject) {
      setForm((prev) => ({
        ...prev,
        division: prefillDiv || prev.division,
        subject: prefillSubject ? `Inquiry: ${prefillSubject}` : prev.subject,
      }));
    }
  }, [prefillDiv, prefillSubject]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Client-side rate limit: max 5 requests per 10 minutes
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
    if (honeypot) return;
    if (!validate()) return;
    if (!rateOk()) {
      setErrors({ global: t('err_rate') });
      return;
    }

    setState('sending');
    const finalSubject = form.division
      ? `[${t(`div_${form.division}`) || form.division}] ${form.subject}`
      : form.subject;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: finalSubject.trim(),
          message: form.message.trim(),
          lang,
          honeypot,
        }),
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
    setForm({ name: '', email: '', division: '', subject: '', message: '' });
    setErrors({});
    setState('idle');
  };

  return (
    <div className="contact-page-wrap">
      <section className="section contact-page">
        <div className="contact-hero-banner reveal">
          <div className="eyebrow">{t('contact_eyebrow')}</div>
          <h2>{t('contact_title')}</h2>
          <p className="section-lead">{t('contact_desc')}</p>
        </div>

        {/* Executive Contact Cards */}
        <div className="contact-info-grid reveal">
          <div className="info-card">
            <div className="info-icon" aria-hidden="true">
              <IconMail size={22} />
            </div>
            <div className="info-text">
              <h3>{t('contact_email')}</h3>
              <p dir="ltr">{info?.email || 'info@doubleh.com'}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon" aria-hidden="true">
              <IconPhone size={22} />
            </div>
            <div className="info-text">
              <h3>{t('contact_phone')}</h3>
              <p dir="ltr">{info?.phone || '+1 (555) 000-0000'}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon" aria-hidden="true">
              <IconClock size={22} />
            </div>
            <div className="info-text">
              <h3>{t('contact_hours')}</h3>
              <p>{t('contact_hours_v')}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon" aria-hidden="true">
              <IconPin size={22} />
            </div>
            <div className="info-text">
              <h3>{t('contact_location')}</h3>
              <p>{info?.address || t('contact_location_v')}</p>
            </div>
          </div>
        </div>

        {/* Consultation Request Form */}
        <div className="form-container reveal">
          {state === 'ok' ? (
            <div className="ok-box">
              <div className="ok-icon-circle">
                <IconCheckBadge size={36} />
              </div>
              <h3>{t('form_ok_t')}</h3>
              <p>{t('form_ok_d')}</p>
              <button className="btn btn-primary" onClick={reset}>
                {t('form_again')}
              </button>
            </div>
          ) : (
            <div className="form-card">
              <div className="form-card-header">
                <div className="form-badge">
                  <IconShield size={16} />
                  <span>Confidential Advisory</span>
                </div>
                <h3>Schedule Diagnostic Consultation</h3>
                <p>Provide your project parameters below to connect with an executive practice lead.</p>
              </div>

              <form onSubmit={submit} noValidate className="consultation-form">
                <div className="form-row-2">
                  <div className="field-group">
                    <label htmlFor="client-name">{t('form_name')}</label>
                    <input
                      id="client-name"
                      value={form.name}
                      onChange={set('name')}
                      autoComplete="name"
                      placeholder="e.g. Dr. Arthur Vance"
                    />
                    {errors.name && <div className="err-msg">{errors.name}</div>}
                  </div>

                  <div className="field-group">
                    <label htmlFor="client-email">{t('form_email')}</label>
                    <input
                      id="client-email"
                      type="email"
                      dir="ltr"
                      value={form.email}
                      onChange={set('email')}
                      autoComplete="email"
                      placeholder="e.g. arthur@enterprise.com"
                    />
                    {errors.email && <div className="err-msg">{errors.email}</div>}
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="field-group">
                    <label htmlFor="client-division">{t('form_division')}</label>
                    <select
                      id="client-division"
                      value={form.division}
                      onChange={set('division')}
                      className="form-select"
                    >
                      <option value="">{t('form_division_select')}</option>
                      <option value="bim">{t('div_bim')}</option>
                      <option value="arch">{t('div_arch')}</option>
                      <option value="civil">{t('div_civil')}</option>
                      <option value="elec">{t('div_elec')}</option>
                      <option value="medical">{t('div_medical')}</option>
                      <option value="law">{t('div_law')}</option>
                      <option value="mgmt">{t('div_mgmt')}</option>
                      <option value="bd">{t('div_bd')}</option>
                      <option value="startup">{t('div_startup')}</option>
                    </select>
                  </div>

                  <div className="field-group">
                    <label htmlFor="client-subject">{t('form_subject')}</label>
                    <input
                      id="client-subject"
                      value={form.subject}
                      onChange={set('subject')}
                      placeholder="e.g. Commercial Mixed-Use Structural Peer Review"
                    />
                    {errors.subject && <div className="err-msg">{errors.subject}</div>}
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="client-message">{t('form_message')}</label>
                  <textarea
                    id="client-message"
                    rows={5}
                    maxLength={3000}
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Describe your project scope, location, timeline, and current development phase…"
                  />
                  {errors.message && <div className="err-msg">{errors.message}</div>}
                </div>

                {/* Honeypot field for anti-bot protection */}
                <input
                  className="honey"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  aria-hidden="true"
                />

                {errors.global && (
                  <div className="form-error-banner" role="alert">
                    {errors.global}
                  </div>
                )}

                <div className="form-action-row">
                  <button className="btn btn-primary btn-submit" type="submit" disabled={state === 'sending'}>
                    <span>{state === 'sending' ? t('form_sending') : t('form_send')}</span>
                    <IconArrow size={18} />
                  </button>
                  <span className="form-disclaimer">
                    <IconClock size={14} />
                    <span>Response guaranteed within 1 business day</span>
                  </span>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
