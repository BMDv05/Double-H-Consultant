import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from './LangContext.jsx';
import Modal from './Modal.jsx';
import {
  IconClose,
  IconArrow,
  IconShield,
  IconClock,
  IconCheckBadge,
  IconBIM,
  IconArch,
  IconCivil,
  IconElec,
  IconMgmt,
  IconBD,
  IconStartups,
  IconMedical,
  IconLaw,
} from './icons.jsx';

const DIVISION_OPTIONS = [
  { key: 'bim', icon: IconBIM },
  { key: 'arch', icon: IconArch },
  { key: 'civil', icon: IconCivil },
  { key: 'elec', icon: IconElec },
  { key: 'mgmt', icon: IconMgmt },
  { key: 'bd', icon: IconBD },
  { key: 'startup', icon: IconStartups },
  { key: 'medical', icon: IconMedical },
  { key: 'law', icon: IconLaw },
];

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

export default function ScheduleModal({
  open,
  onClose,
  initialDivision = '',
  initialSubject = '',
}) {
  const { t, lang } = useLang();

  const [division, setDivision] = useState(initialDivision);
  const [devPhase, setDevPhase] = useState('schematic');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errors, setErrors] = useState({});
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    if (open) {
      setDivision(initialDivision || '');
      setSubject(initialSubject || '');
      setStatus('idle');
      setErrors({});
    }
  }, [open, initialDivision, initialSubject]);

  if (!open) return null;

  const validate = () => {
    const errs = {};
    if (name.trim().length < 2) errs.name = t('err_name');
    if (!validEmail(email.trim())) errs.email = t('err_email');
    if (subject.trim().length < 2) errs.subject = t('err_subject');
    if (notes.trim().length < 10) errs.notes = t('err_message');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return;
    if (!validate()) return;

    setStatus('sending');
    const divisionName = division ? t(`div_${division}`) || division : 'Multidisciplinary';
    const phaseLabel = t(`modal_phase_opt_${devPhase}`) || devPhase;

    const formattedSubject = `[Strategic Consultation // ${divisionName}] ${subject.trim()}`;
    const formattedMessage = `[DIAGNOSTIC ADVISORY INTAKE]\nPractice Division: ${divisionName}\nDevelopment Stage: ${phaseLabel}\n\nProject Scope & Objectives:\n${notes.trim()}`;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: formattedSubject,
          message: formattedMessage,
          lang,
          honeypot,
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setConfirmId(data.id || 'PE-8840');
        setStatus('success');
      } else {
        setStatus('error');
        setErrors({ global: t('err_generic') });
      }
    } catch {
      setStatus('error');
      setErrors({ global: t('err_network') });
    }
  };

  return (
    <Modal onClose={onClose} titleId="sched-modal-title" descriptionId="sched-modal-desc">
      <div className="sched-modal-shell">
        {/* Header */}
        <div className="sched-modal-header">
          <div className="sched-modal-title-col">
            <div className="status-live-badge">
              <span className="status-pulse-dot" />
              <span>{t('status_principal_open')}</span>
            </div>
            <h2 id="sched-modal-title" className="sched-modal-title">
              {t('modal_consult_title')}
            </h2>
            <p id="sched-modal-desc" className="sched-modal-desc">
              {t('modal_consult_desc')}
            </p>
          </div>
          <button
            type="button"
            className="sched-modal-close"
            onClick={onClose}
            aria-label="Close consultation modal"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Content Body */}
        {status === 'success' ? (
          <div className="sched-modal-success">
            <div className="sched-success-badge">
              <IconCheckBadge size={44} />
            </div>
            <h3>{t('modal_success_title')}</h3>
            <p>{t('modal_success_desc')}</p>

            <div className="sched-receipt-box">
              <div className="receipt-row">
                <span>REFERENCE PROTOCOL</span>
                <b>DH-PE-{confirmId}</b>
              </div>
              <div className="receipt-row">
                <span>LEAD PRINCIPAL INTAKE</span>
                <b>US PE &amp; AIA PARTNER REVIEW</b>
              </div>
              <div className="receipt-row">
                <span>GUARANTEED CALENDAR SLA</span>
                <b>&lt; 24 BUSINESS HOURS</b>
              </div>
            </div>

            <button type="button" className="btn btn-primary" onClick={onClose}>
              {t('modal_success_cta')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="sched-modal-form">
            {/* Division Selection Ribbon */}
            <div className="sched-form-section">
              <span className="sched-section-label">{t('modal_step_division')}</span>
              <div className="sched-division-chips" role="radiogroup" aria-label="Practice Division">
                {DIVISION_OPTIONS.map((d) => {
                  const Icon = d.icon;
                  const isSelected = division === d.key;
                  return (
                    <button
                      type="button"
                      key={d.key}
                      role="radio"
                      aria-checked={isSelected}
                      className={`sched-div-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => setDivision(d.key)}
                    >
                      <Icon size={15} />
                      <span>{t(`div_${d.key}`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="sched-form-section">
              <span className="sched-section-label">{t('modal_step_details')}</span>

              <div className="sched-grid-2">
                <div className="field-group">
                  <label htmlFor="sched-name">{t('form_name')}</label>
                  <input
                    id="sched-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Vance"
                    autoComplete="name"
                  />
                  {errors.name && <span className="err-msg">{errors.name}</span>}
                </div>

                <div className="field-group">
                  <label htmlFor="sched-email">{t('form_email')}</label>
                  <input
                    id="sched-email"
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. arthur@enterprise.com"
                    autoComplete="email"
                  />
                  {errors.email && <span className="err-msg">{errors.email}</span>}
                </div>
              </div>

              <div className="sched-grid-2">
                <div className="field-group">
                  <label htmlFor="sched-phase">{t('modal_phase_label')}</label>
                  <select
                    id="sched-phase"
                    value={devPhase}
                    onChange={(e) => setDevPhase(e.target.value)}
                    className="form-select"
                  >
                    <option value="feasibility">{t('modal_phase_opt_feasibility')}</option>
                    <option value="schematic">{t('modal_phase_opt_schematic')}</option>
                    <option value="bim">{t('modal_phase_opt_bim')}</option>
                    <option value="construction">{t('modal_phase_opt_construction')}</option>
                  </select>
                </div>

                <div className="field-group">
                  <label htmlFor="sched-subject">{t('form_subject')}</label>
                  <input
                    id="sched-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. 45-Story Tower Structural Peer Review"
                  />
                  {errors.subject && <span className="err-msg">{errors.subject}</span>}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="sched-notes">{t('modal_notes_label')}</label>
                <textarea
                  id="sched-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('modal_notes_placeholder')}
                />
                {errors.notes && <span className="err-msg">{errors.notes}</span>}
              </div>

              {/* Bot protection */}
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
            </div>

            {/* Fiduciary Reassurance Strip */}
            <div className="sched-trust-strip">
              <div className="trust-item">
                <IconShield size={16} />
                <span>100% Confidential (Strict NDA)</span>
              </div>
              <div className="trust-item">
                <IconClock size={16} />
                <span>24-Hour Calendar SLA</span>
              </div>
              <div className="trust-item">
                <IconCheckBadge size={16} />
                <span>US PE &amp; AIA Principals</span>
              </div>
            </div>

            {/* Actions */}
            <div className="sched-modal-actions">
              <button
                type="submit"
                className="btn btn-primary sched-submit-btn"
                disabled={status === 'sending'}
              >
                <span>
                  {status === 'sending' ? t('modal_submit_submitting') : t('modal_submit_btn')}
                </span>
                <IconArrow size={18} />
              </button>

              <div className="sched-alt-link-wrap">
                <span>{t('modal_alt_contact')}</span>{' '}
                <Link to="/contact" onClick={onClose} className="sched-alt-link">
                  {t('modal_alt_contact_link')}
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
