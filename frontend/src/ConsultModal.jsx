import { useEffect, useState } from 'react';
import { useLang } from './LangContext.jsx';
import Icon from './Icon.jsx';

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const validPhone = (p) => /^\+?[0-9\s\-()]{7,18}$/.test(p);

const EMPTY = { fullName: '', email: '', phone: '', note: '' };

export default function ConsultModal({ open, onClose }) {
  const { t, lang } = useLang();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | ok
  const [result, setResult] = useState(null);
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    document.body.classList.add('locked');
    return () => {
      removeEventListener('keydown', onKey);
      document.body.classList.remove('locked');
    };
  }, [open, onClose]);

  if (!open) return null;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const rateOk = () => {
    try {
      const key = 'dh-rl-consult';
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
    if (form.fullName.trim().length < 2) e.fullName = t('consult_err_name');
    if (!validEmail(form.email.trim())) e.email = t('consult_err_email');
    if (!validPhone(form.phone.trim())) e.phone = t('consult_err_phone');
    if (form.note.trim().length < 10 || form.note.trim().length > 2000) e.note = t('consult_err_note');
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
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang, honeypot }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setResult(body);
        setState('ok');
      } else {
        setState('idle');
        setErrors({ global: body.error || t('err_generic') });
      }
    } catch {
      setState('idle');
      setErrors({ global: t('err_network') });
    }
  };

  const reset = () => {
    setForm(EMPTY);
    setErrors({});
    setResult(null);
    setState('idle');
  };

  return (
    <div id="modal" className="modal open" onClick={(e) => e.target.id === 'modal' && onClose()}>
      <div className="modal-box" role="dialog" aria-modal="true" aria-label={t('consult_title')}>
        <button className="modal-x" onClick={onClose} aria-label={t('consult_close')}>
          ✕
        </button>

        <div className="modal-head">
          <span className="free-badge small">
            {t('consult_free_badge')}
          </span>
          <h3>{t('consult_title')}</h3>
          <p>{state === 'ok' ? t('consult_ok_d') : t('consult_desc')}</p>
        </div>

        {state === 'ok' ? (
          <div className="ok-box">
            <div className="ok-icon">
              <Icon name="check" size={34} />
            </div>
            <h3>{t('consult_ok_t')}</h3>
            <span className={`pill ${result?.isFirstFree ? 'pill-free' : ''}`}>
              {result?.isFirstFree ? t('consult_ok_free') : t('consult_ok_paid')}
            </span>
            <div className="modal-actions">
              <button className="btn btn-dark" onClick={reset}>
                {t('consult_again')}
              </button>
              <button className="btn btn-ghost-dark" onClick={onClose}>
                {t('consult_close')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <label>{t('consult_name')}</label>
            <input value={form.fullName} onChange={set('fullName')} autoComplete="name" />
            <div className="err">{errors.fullName}</div>

            <label>{t('consult_email')}</label>
            <input type="email" dir="ltr" value={form.email} onChange={set('email')} autoComplete="email" />
            <div className="err">{errors.email}</div>

            <label>{t('consult_phone')}</label>
            <input type="tel" dir="ltr" value={form.phone} onChange={set('phone')} autoComplete="tel" />
            <div className="err">{errors.phone}</div>

            <label>{t('consult_note')}</label>
            <textarea
              rows={3}
              maxLength={2000}
              placeholder={t('consult_note_ph')}
              value={form.note}
              onChange={set('note')}
            />
            <div className="err">{errors.note}</div>

            {/* honeypot */}
            <input
              className="honey"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              aria-hidden="true"
            />

            <p className="notice">{t('consult_privacy')}</p>
            {errors.global && (
              <p className="notice" style={{ color: '#b42318' }}>
                {errors.global}
              </p>
            )}

            <div className="modal-actions">
              <button className="btn btn-dark" type="submit" disabled={state === 'sending'}>
                <Icon name="send" size={17} />
                {state === 'sending' ? t('consult_sending') : t('consult_submit')}
              </button>
              <button type="button" className="btn btn-ghost-dark" onClick={onClose}>
                {t('consult_close')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
