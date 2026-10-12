import { useEffect, useRef, useState, useId, useCallback } from 'react';
import styles from './ConsultationModal.module.css';
import {
  DIVISION_KEYS,
  DIVISION_CATALOG,
  TEXTS,
  getLocalizedErrorMessage,
  composeInquiryPayload,
  submitInquiry,
} from './contactApi.js';

export { TEXTS };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ConsultationModal({
  open = false,
  onClose,
  lang = 'en',
  request = { source: 'hero' },
  onSubmitted,
}) {
  const isAr = lang === 'ar';
  const t = TEXTS[isAr ? 'ar' : 'en'] || TEXTS.en;

  const titleId = useId();
  const descId = useId();
  const nameErrorId = useId();
  const emailErrorId = useId();
  const notesErrorId = useId();
  const globalAlertId = useId();

  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const notesInputRef = useRef(null);
  const alertRef = useRef(null);
  const inFlightRef = useRef(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // Status: 'idle' | 'sending' | 'success' | 'error'
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [submittedName, setSubmittedName] = useState('');

  const isBusy = status === 'sending';

  // Synchronize initial service with opener request
  const deriveService = useCallback(
    (divisionKey) =>
      DIVISION_KEYS.includes(divisionKey) ? divisionKey : '',
    []
  );

  // Native dialog open / close lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      openerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      // Reset form if reopening after a previous success or clear stale errors
      if (status === 'success') {
        setName('');
        setEmail('');
        setNotes('');
        setHoneypot('');
        setStatus('idle');
        setConfirmId(null);
        setSubmittedName('');
      }
      setErrors({});
      setService(deriveService(request?.division));

      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {
          // Dialog may already be open in some test environments
        }
      }
      document.body.classList.add('dialog-open');

      // Focus first field after microtask so modal is rendered
      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    } else {
      if (dialog.open) {
        dialog.close();
      }
      document.body.classList.remove('dialog-open');

      if (openerRef.current && openerRef.current.isConnected) {
        openerRef.current.focus({ preventScroll: true });
      }
      inFlightRef.current = false;
    }

    return () => {
      document.body.classList.remove('dialog-open');
    };
  }, [open, request?.division, deriveService]);

  // Handle Escape key safely
  const handleCancel = (e) => {
    e.preventDefault();
    if (!isBusy && typeof onClose === 'function') {
      onClose();
    }
  };

  // Handle backdrop clicks outside the modal box
  const handleDialogClick = (e) => {
    if (isBusy || !dialogRef.current) return;
    if (e.target === dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      const inBox =
        rect.top <= e.clientY &&
        e.clientY <= rect.bottom &&
        rect.left <= e.clientX &&
        e.clientX <= rect.right;
      if (!inBox && typeof onClose === 'function') {
        onClose();
      }
    }
  };

  // Focus containment trap
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (!isBusy && typeof onClose === 'function') {
        onClose();
      }
      return;
    }

    if (e.key === 'Tab' && dialogRef.current) {
      const focusables = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const validateFields = () => {
    const errs = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedNotes = notes.trim();

    if (trimmedName.length < 2 || trimmedName.length > 120) {
      errs.name = t.errName;
    }

    if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 254) {
      errs.email = t.errEmail;
    }

    if (trimmedNotes.length > 2400) {
      errs.notes = t.errNotesLength;
    }

    setErrors(errs);
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Synchronous in-flight guard
    if (inFlightRef.current) return;

    const validationErrs = validateFields();
    if (Object.keys(validationErrs).length > 0) {
      if (validationErrs.name) {
        nameInputRef.current?.focus();
      } else if (validationErrs.email) {
        emailInputRef.current?.focus();
      } else if (validationErrs.notes) {
        notesInputRef.current?.focus();
      }
      return;
    }

    inFlightRef.current = true;
    setStatus('sending');
    setErrors({});

    const composedPayload = composeInquiryPayload({
      name,
      email,
      service,
      notes,
      lang: isAr ? 'ar' : 'en',
      request,
      honeypot,
    });

    try {
      const result = await submitInquiry(composedPayload);
      inFlightRef.current = false;
      setStatus('success');
      setSubmittedName(name.trim());
      const resId =
        Number.isSafeInteger(result?.id) && result.id > 0 ? result.id : null;
      setConfirmId(resId);
      if (typeof onSubmitted === 'function') {
        onSubmitted({ id: resId ?? undefined });
      }
    } catch (err) {
      inFlightRef.current = false;
      setStatus('error');

      // Map error kinds to localized copy; never display raw server/transport text
      let globalMsg = getLocalizedErrorMessage(err, lang);
      if (err?.kind === 'validation') {
        // Use safe field metadata if available
        if (err.field === 'name') {
          setErrors({ name: t.errName, global: t.errValidation });
          requestAnimationFrame(() => {
            nameInputRef.current?.focus();
          });
          return;
        } else if (err.field === 'email') {
          setErrors({ email: t.errEmail, global: t.errValidation });
          requestAnimationFrame(() => {
            emailInputRef.current?.focus();
          });
          return;
        } else if (err.field === 'notes' || err.field === 'message') {
          setErrors({ notes: t.errNotesLength, global: t.errValidation });
          requestAnimationFrame(() => {
            notesInputRef.current?.focus();
          });
          return;
        }
        // Otherwise announce localized form-level error while preserving inputs
        globalMsg = t.errValidation;
      }

      setErrors({ global: globalMsg });
      requestAnimationFrame(() => {
        alertRef.current?.focus();
      });
    }
  };

  const handleDone = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  if (!open && !dialogRef.current?.open) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      dir={isAr ? 'rtl' : 'ltr'}
      lang={lang}
      aria-labelledby={titleId}
      aria-describedby={descId}
      aria-modal="true"
      aria-busy={isBusy}
      onCancel={handleCancel}
      onClick={handleDialogClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.dialogInner}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <h2 id={titleId} className={styles.title}>
              {status === 'success' ? t.successTitle : t.title}
            </h2>
            <p id={descId} className={styles.subtitle}>
              {status === 'success' ? '' : t.subtitle}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isBusy}
            aria-label={t.close}
            title={t.close}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Success View */}
        {status === 'success' ? (
          <div className={styles.successContainer}>
            <div className={styles.successIconBadge} aria-hidden="true">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className={styles.successMessage}>
              {t.successBody(submittedName)}
            </p>
            {Number.isSafeInteger(confirmId) && confirmId > 0 && (
              <div className={styles.referenceBadge}>
                {t.referenceLabel}: #{confirmId}
              </div>
            )}
            <button
              type="button"
              className={styles.successButton}
              onClick={handleDone}
              autoFocus
            >
              {t.done}
            </button>
          </div>
        ) : (
          /* Form View */
          <form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Global Error Alert */}
            {errors.global && (
              <div
                ref={alertRef}
                id={globalAlertId}
                className={styles.alert}
                role="alert"
                aria-live="assertive"
                tabIndex={-1}
              >
                <div className={styles.alertTitle}>
                  {isAr ? 'تعذر إرسال الطلب' : 'Submission failed'}
                </div>
                <div className={styles.alertMessage}>{errors.global}</div>
              </div>
            )}

            {/* Name Field (Required) */}
            <div className={styles.field}>
              <label htmlFor="dh-consult-name" className={styles.label}>
                <span>
                  {t.nameLabel}
                  <span className={styles.requiredMark} aria-hidden="true">
                    *
                  </span>
                </span>
              </label>
              <input
                ref={nameInputRef}
                id="dh-consult-name"
                type="text"
                name="name"
                className={`${styles.input} ${
                  errors.name ? styles.inputError : ''
                }`}
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                disabled={isBusy}
                required
                maxLength={120}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? nameErrorId : undefined}
              />
              {errors.name && (
                <p id={nameErrorId} className={styles.fieldError} role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field (Required) */}
            <div className={styles.field}>
              <label htmlFor="dh-consult-email" className={styles.label}>
                <span>
                  {t.emailLabel}
                  <span className={styles.requiredMark} aria-hidden="true">
                    *
                  </span>
                </span>
              </label>
              <input
                ref={emailInputRef}
                id="dh-consult-email"
                type="email"
                name="email"
                className={`${styles.input} ${
                  errors.email ? styles.inputError : ''
                }`}
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                disabled={isBusy}
                required
                maxLength={254}
                autoComplete="email"
                dir="ltr"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? emailErrorId : undefined}
              />
              {errors.email && (
                <p id={emailErrorId} className={styles.fieldError} role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Service of Interest (Optional) */}
            <div className={styles.field}>
              <label htmlFor="dh-consult-service" className={styles.label}>
                <span>{t.serviceLabel}</span>
                <span className={styles.optionalBadge}>{t.optional}</span>
              </label>
              <select
                id="dh-consult-service"
                name="service"
                className={styles.select}
                value={service}
                onChange={(e) => setService(e.target.value)}
                disabled={isBusy}
              >
                <option value="">{t.servicePlaceholder}</option>
                {DIVISION_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {DIVISION_CATALOG[key][isAr ? 'ar' : 'en']}
                  </option>
                ))}
              </select>
            </div>

            {/* Brief Context / Notes (Optional, <= 2400 chars) */}
            <div className={styles.field}>
              <label htmlFor="dh-consult-notes" className={styles.label}>
                <span>{t.notesLabel}</span>
                <span className={styles.optionalBadge}>{t.optional}</span>
              </label>
              <textarea
                ref={notesInputRef}
                id="dh-consult-notes"
                name="notes"
                rows={3}
                className={`${styles.textarea} ${
                  errors.notes ? styles.inputError : ''
                }`}
                placeholder={t.notesPlaceholder}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (errors.notes) {
                    setErrors((prev) => ({ ...prev, notes: undefined }));
                  }
                }}
                disabled={isBusy}
                maxLength={2400}
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={errors.notes ? notesErrorId : undefined}
              />
              <div className={styles.fieldFooter}>
                {errors.notes ? (
                  <p id={notesErrorId} className={styles.fieldError} role="alert">
                    {errors.notes}
                  </p>
                ) : (
                  <span />
                )}
                <span className={styles.charCount} aria-live="polite">
                  {notes.length} / 2400 {t.charsRemaining}
                </span>
              </div>
            </div>

            {/* Honeypot field (hidden from assistive tech) */}
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor="dh-consult-website">Leave this field blank</label>
              <input
                id="dh-consult-website"
                type="text"
                name="honeypot"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Honest Notice */}
            <div className={styles.notice}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flexShrink: 0, marginTop: 2 }}
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <p className={styles.noticeText}>{t.notice}</p>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isBusy}
              >
                {isBusy && <span className={styles.spinner} aria-hidden="true" />}
                <span>{isBusy ? t.sending : t.submit}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
