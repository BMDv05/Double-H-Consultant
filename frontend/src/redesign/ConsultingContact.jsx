import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DIVISION_CATALOG,
  DIVISION_KEYS,
  getLocalizedErrorMessage,
  submitInquiry,
  validateInquiryPayload,
} from "./booking/contactApi.js";
import styles from "./ConsultingContact.module.css";

export function buildContactPayload(form, lang) {
  const service = DIVISION_KEYS.includes(form.division) ? form.division : "";
  const prefix = service ? `[${DIVISION_CATALOG[service][lang]}] ` : "";
  return validateInquiryPayload({
    name: form.name,
    email: form.email,
    subject: prefix + form.subject.trim(),
    message: form.message,
    lang,
    honeypot: form.honeypot,
  });
}

export default function ConsultingContact({
  lang,
  onBook,
  submit = submitInquiry,
}) {
  const ar = lang === "ar";
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    division: DIVISION_KEYS.includes(params.get("division"))
      ? params.get("division")
      : "",
    subject: (params.get("subject") || "").slice(0, 120),
    message: "",
    honeypot: "",
  });
  const [state, setState] = useState("idle");
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const inFlight = useRef(false);
  const controller = useRef(null);
  const status = useRef(null);
  const formRef = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!params.has("division") && !params.has("subject")) return;
    setForm((previous) => ({
      ...previous,
      division: params.has("division")
        ? DIVISION_KEYS.includes(params.get("division"))
          ? params.get("division")
          : ""
        : previous.division,
      subject: params.has("subject")
        ? (params.get("subject") || "").slice(0, 120)
        : previous.subject,
    }));
  }, [params]);
  const copy = ar
    ? {
        eyebrow: "تواصل مع دبل إتش",
        title: "لنبدأ بسؤالك.",
        intro: "مشروع جديد، قرار مهم، أو فكرة تحتاج إلى منظور آخر.",
        formTitle: "أخبرنا بما يشغلك.",
        name: "الاسم الكامل",
        email: "البريد الإلكتروني",
        division: "التخصص — اختياري",
        general: "لست متأكداً / استفسار عام",
        subject: "الموضوع",
        message: "رسالتك",
        send: "أرسل استفسارك",
        sending: "جارٍ الإرسال…",
        received: "وصل استفسارك.",
        confirmation:
          "شكراً لتواصلك. سنراجع رسالتك ونتواصل معك عبر البريد الإلكتروني.",
        again: "أرسل استفساراً آخر",
        reference: "رقم المرجع",
        callTitle: "تفضّل أن نتحدث؟",
        callBody: "لنبدأ بمحادثة تعارف مجانية لمدة 15 دقيقة.",
        call: "اطلب مكالمتك المجانية",
        helper: "نتفق معك على الموعد بعد استلام الطلب.",
        nameError: "أدخل اسماً من حرفين إلى 120 حرفاً.",
        emailError: "أدخل بريداً إلكترونياً صحيحاً.",
        subjectError: "أدخل موضوعاً من حرفين إلى 120 حرفاً.",
        messageError: "اكتب رسالة من 10 إلى 2700 حرف.",
        note: "هذه الرسالة استفسار عام. طلب المكالمة متاح بشكل منفصل.",
        imagery: "صورة تصورية",
      }
    : {
        eyebrow: "Get in touch with Double H",
        title: "Let’s start with your question.",
        intro:
          "A new project, an important decision, or an idea that needs another perspective.",
        formTitle: "Tell us what’s on your mind.",
        name: "Full name",
        email: "Email address",
        division: "Service — optional",
        general: "Not sure / General inquiry",
        subject: "Subject",
        message: "Your message",
        send: "Send your inquiry",
        sending: "Sending…",
        received: "Your inquiry is received.",
        confirmation:
          "Thank you for getting in touch. We’ll review your message and contact you by email.",
        again: "Send another inquiry",
        reference: "Reference",
        callTitle: "Prefer a conversation?",
        callBody: "Start with a free 15-minute introductory call.",
        call: "Request your free call",
        helper: "We’ll agree a time after receiving your request.",
        nameError: "Enter a name between 2 and 120 characters.",
        emailError: "Enter a valid email address.",
        subjectError: "Enter a subject between 2 and 120 characters.",
        messageError: "Write a message between 10 and 2700 characters.",
        note: "This sends a general inquiry. You can request a call separately.",
        imagery: "Illustrative imagery",
      };
  function change(event) {
    if (error?.field === event.target.name) setError(null);
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }
  async function send(event) {
    event.preventDefault();
    if (inFlight.current) return;
    let payload;
    try {
      payload = buildContactPayload(form, lang);
    } catch (err) {
      setError(err);
      requestAnimationFrame(() =>
        formRef.current?.elements.namedItem(err.field)?.focus(),
      );
      return;
    }
    inFlight.current = true;
    controller.current = new AbortController();
    const signal = controller.current.signal;
    setError(null);
    setState("sending");
    try {
      const result = await submit(payload, { signal });
      if (!signal.aborted) {
        setReceipt(result.id ?? null);
        setState("success");
        requestAnimationFrame(() => status.current?.focus());
      }
    } catch (err) {
      if (!signal.aborted) {
        setError(err);
        setState("idle");
        requestAnimationFrame(() => status.current?.focus());
      }
    } finally {
      inFlight.current = false;
    }
  }
  const busy = state === "sending";
  const validationText =
    error?.kind === "validation" && error.field
      ? copy[`${error.field}Error`]
      : null;
  return (
    <div className={styles.contact}>
      <header className={styles.intro}>
        <p>{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>
      <div className={styles.columns}>
        <aside className={styles.callPanel}>
          <img
            src="/consulting-images/discretion.webp"
            srcSet="/consulting-images/discretion-small.webp 800w, /consulting-images/discretion.webp 1672w"
            sizes="(max-width:760px) 100vw, 40vw"
            width="1672"
            height="941"
            alt=""
          />
          <div>
            <h2>{copy.callTitle}</h2>
            <p>{copy.callBody}</p>
            <button type="button" onClick={() => onBook({ source: "contact" })}>
              {copy.call}
              <span aria-hidden="true">↗</span>
            </button>
            <small>{copy.helper}</small>
            <small>{copy.imagery}</small>
          </div>
        </aside>
        <section className={styles.formPanel} aria-label={copy.formTitle}>
          {state === "success" ? (
            <div
              className={styles.success}
              ref={status}
              tabIndex={-1}
              role="status"
            >
              <h2>{copy.received}</h2>
              <p>{copy.confirmation}</p>
              {receipt && (
                <small>
                  {copy.reference}: #{receipt}
                </small>
              )}
              <button
                type="button"
                onClick={() => {
                  setForm({
                    name: "",
                    email: "",
                    division: "",
                    subject: "",
                    message: "",
                    honeypot: "",
                  });
                  setState("idle");
                  setReceipt(null);
                  requestAnimationFrame(() =>
                    formRef.current?.elements.namedItem("name")?.focus(),
                  );
                }}
              >
                {copy.again}
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={send} noValidate>
              <h2>{copy.formTitle}</h2>
              <fieldset disabled={busy}>
                {["name", "email"].map((field) => (
                  <label key={field}>
                    {copy[field]}
                    <input
                      name={field}
                      type={field === "email" ? "email" : "text"}
                      autoComplete={field}
                      required
                      maxLength={field === "name" ? 120 : 254}
                      value={form[field]}
                      onChange={change}
                      aria-invalid={error?.field === field || undefined}
                      aria-describedby={
                        error?.field === field ? "contact-status" : undefined
                      }
                    />
                  </label>
                ))}
                <label>
                  {copy.division}
                  <select
                    name="division"
                    value={form.division}
                    onChange={change}
                  >
                    <option value="">{copy.general}</option>
                    {DIVISION_KEYS.map((service) => (
                      <option key={service} value={service}>
                        {DIVISION_CATALOG[service][lang]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {copy.subject}
                  <input
                    name="subject"
                    required
                    maxLength={120}
                    value={form.subject}
                    onChange={change}
                    aria-invalid={error?.field === "subject" || undefined}
                    aria-describedby={
                      error?.field === "subject" ? "contact-status" : undefined
                    }
                  />
                </label>
                <label>
                  {copy.message}
                  <textarea
                    name="message"
                    required
                    rows={5}
                    maxLength={2700}
                    value={form.message}
                    onChange={change}
                    aria-invalid={error?.field === "message" || undefined}
                    aria-describedby={
                      error?.field === "message" ? "contact-status" : undefined
                    }
                  />
                </label>
                <div className={styles.honeypot} aria-hidden="true">
                  <label>
                    Website
                    <input
                      name="honeypot"
                      tabIndex={-1}
                      autoComplete="off"
                      maxLength={100}
                      value={form.honeypot}
                      onChange={change}
                    />
                  </label>
                </div>
                <p
                  id="contact-status"
                  ref={status}
                  className={styles.error}
                  tabIndex={-1}
                  role={error ? "alert" : "status"}
                >
                  {error
                    ? validationText || getLocalizedErrorMessage(error, lang)
                    : ""}
                </p>
                <button type="submit">
                  {busy ? copy.sending : copy.send}
                  <span aria-hidden="true">↗</span>
                </button>
                <small>{copy.note}</small>
              </fieldset>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
