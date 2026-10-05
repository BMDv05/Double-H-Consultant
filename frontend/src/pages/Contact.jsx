import { useEffect, useRef, useState } from 'react';
import { useLang } from '../LangContext.jsx';
import {
  IconMail,
  IconPhone,
  IconClock,
  IconPin,
  IconCheck,
} from '../icons.jsx';

const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

export default function Contact() {
  const { t, lang } = useLang();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');
  const [honeypot, setHoneypot] = useState('');
  const [info, setInfo] = useState(null);
  const formRef = useRef(null);
  const successRef = useRef(null);
  const inFlight = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/company', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then(setInfo)
      .catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (state === 'ok') successRef.current?.focus();
  }, [state]);

  const rateOk = () => {
    try {
      const now = Date.now();
      const stored = JSON.parse(localStorage.getItem('dh-rl-contact') || '[]');
      const attempts = Array.isArray(stored)
        ? stored.filter((time) => Number.isFinite(time) && now - time < 600000)
        : [];
      if (attempts.length >= 5) return false;
      localStorage.setItem('dh-rl-contact', JSON.stringify([...attempts, now]));
      return true;
    } catch {
      return true;
    }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (inFlight.current || honeypot) return;
    const next = {};
    if (form.name.trim().length < 2) next.name = t('err_name');
    if (!validEmail(form.email.trim())) next.email = t('err_email');
    if (form.subject.trim().length < 2) next.subject = t('err_subject');
    if (form.message.trim().length < 10 || form.message.trim().length > 3000)
      next.message = t('err_message');
    setErrors(next);
    if (Object.keys(next).length) {
      formRef.current?.elements.namedItem(Object.keys(next)[0])?.focus();
      return;
    }
    if (!rateOk()) {
      setErrors({ global: t('err_rate') });
      return;
    }
    inFlight.current = true;
    setState('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang, honeypot }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        setState('error');
        setErrors({
          global: t(response.status === 429 ? 'err_rate' : 'err_generic'),
        });
      } else setState('ok');
    } catch {
      setState('error');
      setErrors({ global: t('err_network') });
    } finally {
      inFlight.current = false;
    }
  };

  const fields = [
    { key: 'name', label: 'form_name', autoComplete: 'name', maxLength: 200 },
    {
      key: 'email',
      label: 'form_email',
      type: 'email',
      autoComplete: 'email',
      maxLength: 254,
    },
    { key: 'subject', label: 'form_subject', maxLength: 200 },
    { key: 'message', label: 'form_message', maxLength: 3000 },
  ];
  const email = info?.email || 'info@doubleh.com';
  const phone = info?.phone || '+1 (555) 000-0000';
  return (
    <section className="section contact-page">
      <div className="eyebrow">Double H</div>
      <h1 className="page-title">{t('contact_title')}</h1>
      <p className="section-lead">{t('contact_desc')}</p>
      <p className="notice book-note">{t('free_note')}</p>
      <div className="contact-info contact-info-row">
        <div className="info-card reveal">
          <div className="icon">
            <IconMail />
          </div>
          <h2>{t('contact_email')}</h2>
          <a dir="ltr" href={`mailto:${email}`}>
            {email}
          </a>
        </div>
        <div className="info-card reveal">
          <div className="icon">
            <IconPhone />
          </div>
          <h2>{t('contact_phone')}</h2>
          <a dir="ltr" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
            {phone}
          </a>
        </div>
        <div className="info-card reveal">
          <div className="icon">
            <IconClock />
          </div>
          <h2>{t('contact_hours')}</h2>
          <p>{t('contact_hours_v')}</p>
        </div>
        <div className="info-card reveal">
          <div className="icon">
            <IconPin />
          </div>
          <h2>{t('contact_location')}</h2>
          <p>{info?.address || t('contact_location_v')}</p>
        </div>
      </div>
      <div className="form-wrap form-centered reveal">
        {state === 'ok' ? (
          <div className="ok-box" role="status" tabIndex={-1} ref={successRef}>
            <IconCheck />
            <h2>{t('form_ok_t')}</h2>
            <p>{t('form_ok_d')}</p>
            <button
              className="btn btn-dark"
              onClick={() => {
                setForm({ name: '', email: '', subject: '', message: '' });
                setErrors({});
                setState('idle');
              }}
            >
              {t('form_again')}
            </button>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={submit}
            noValidate
            aria-busy={state === 'sending'}
          >
            <p className="form-hint">
              {lang === 'ar'
                ? 'جميع الحقول مطلوبة.'
                : 'All fields are required.'}
            </p>
            {fields.map(({ key, label, ...options }) => {
              const props = {
                ...options,
                id: `contact-${key}`,
                name: key,
                required: true,
                value: form[key],
                disabled: state === 'sending',
                onChange: (event) => {
                  setForm((previous) => ({
                    ...previous,
                    [key]: event.target.value,
                  }));
                  setErrors((previous) => ({ ...previous, [key]: undefined }));
                },
                'aria-invalid': Boolean(errors[key]),
                'aria-describedby': errors[key]
                  ? `error-${key}`
                  : key === 'message'
                    ? 'message-count'
                    : undefined,
              };
              return (
                <div className="form-field" key={key}>
                  <label htmlFor={props.id}>{t(label)}</label>
                  {key === 'message' ? (
                    <textarea {...props} rows={5} />
                  ) : (
                    <input
                      {...props}
                      dir={key === 'email' ? 'ltr' : undefined}
                    />
                  )}
                  {errors[key] && (
                    <p className="err" id={`error-${key}`}>
                      {errors[key]}
                    </p>
                  )}
                  {key === 'message' && (
                    <p id="message-count" className="field-help">
                      {form.message.length} / 3000
                    </p>
                  )}
                </div>
              );
            })}
            <input
              className="honey"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              aria-hidden="true"
            />
            {Object.values(errors).some(Boolean) && (
              <p className="notice form-error" role="alert">
                {errors.global ||
                  (lang === 'ar'
                    ? 'يرجى تصحيح الحقول المحددة.'
                    : 'Please correct the marked fields.')}
              </p>
            )}
            <button
              className="btn btn-dark"
              type="submit"
              disabled={state === 'sending'}
            >
              {state === 'sending' ? t('form_sending') : t('form_send')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
