/**
 * Phase 4: Free-call request transport API.
 * Submits inquiries to the existing POST /api/contact endpoint.
 *
 * Rules:
 * - Same-origin fetch, JSON payload <= 50KB.
 * - 15-second bounded timeout with caller AbortSignal support.
 * - Distinguishes validation (400), rate-limit (429), server (5xx),
 *   network (offline/aborted), timeout, and protocol errors.
 * - No logging of request bodies or personal data.
 * - No automatic retry of POST requests.
 */

export const DIVISION_KEYS = [
  'bim',
  'arch',
  'civil',
  'elec',
  'mgmt',
  'bd',
  'startup',
  'medical',
  'law',
];

export const DIVISION_CATALOG = {
  bim: {
    en: 'Building Information Modeling (BIM)',
    ar: 'نمذجة معلومات البناء (BIM)',
  },
  arch: {
    en: 'Architectural Consulting',
    ar: 'الاستشارات المعمارية',
  },
  civil: {
    en: 'Structural & Civil Engineering',
    ar: 'الهندسة الإنشائية والمدنية',
  },
  elec: {
    en: 'Electrical & Electromechanical',
    ar: 'الهندسة الكهربائية والكهروميكانيكية',
  },
  mgmt: {
    en: 'Project & Construction Management',
    ar: 'إدارة المشاريع والتشييد',
  },
  bd: {
    en: 'Business Development & Feasibility',
    ar: 'تطوير الأعمال ودراسات الجدوى',
  },
  startup: {
    en: 'Startup & Venture Advisory',
    ar: 'استشارات الشركات الناشئة',
  },
  medical: {
    en: 'Healthcare & Medical Facilities',
    ar: 'استشارات المنشآت الطبية',
  },
  law: {
    en: 'Engineering Contracts & Compliance',
    ar: 'العقود الهندسية والامتثال القانوني',
  },
};

export const TEXTS = {
  en: {
    title: 'Request your free call',
    subtitle: '15-minute introductory consultation.',
    close: 'Close dialog',
    nameLabel: 'Full name',
    namePlaceholder: 'Your full name',
    emailLabel: 'Work or personal email',
    emailPlaceholder: 'you@domain.com',
    serviceLabel: 'Service of interest',
    servicePlaceholder: 'Not sure / General inquiry',
    notesLabel: 'Brief context or project outline',
    notesPlaceholder:
      'Briefly describe what you would like to discuss (optional)',
    optional: 'Optional',
    required: 'Required',
    charsRemaining: 'characters',
    submit: 'Request your free call',
    sending: 'Sending request...',
    notice:
      'We will review your inquiry and contact you to confirm a convenient time.',
    successTitle: 'Request received',
    successBody: (name) =>
      `Thank you${name ? `, ${name}` : ''}. Your request for a free 15-minute introductory call has been received. Our team will review it and get in touch to agree on a suitable time.`,
    referenceLabel: 'Reference ID',
    done: 'Done',
    errName: 'Please enter your name (2–120 characters).',
    errEmail: 'Please enter a valid email address.',
    errNotesLength: 'Brief context must not exceed 2400 characters.',
    errValidation:
      'Some submitted details could not be validated. Please review your entries.',
    errRateLimit:
      'Too many recent requests from this connection. Please wait before trying again.',
    errTimeout:
      'The request timed out after 15 seconds. Delivery could not be confirmed. Please check your connection or try again.',
    errNetwork:
      'Could not reach the server. Please check your internet connection.',
    errServer:
      'The server encountered an error. Your request may not have been saved. Please try again later.',
    errProtocol:
      'Received an unexpected response from the server. Please try again later.',
    errGeneric:
      'Unable to submit request at this time. Please check your entries.',
  },
  ar: {
    title: 'اطلب مكالمتك المجانية',
    subtitle: 'استشارة تمهيدية مدتها 15 دقيقة.',
    close: 'إغلاق النافذة',
    nameLabel: 'الاسم الكامل',
    namePlaceholder: 'اسمك الكامل',
    emailLabel: 'البريد الإلكتروني للعمل أو الشخصي',
    emailPlaceholder: 'you@domain.com',
    serviceLabel: 'الخدمة المطلوبة',
    servicePlaceholder: 'لست متأكداً / استفسار عام',
    notesLabel: 'نبذة مختصرة عن المشروع أو الاستفسار',
    notesPlaceholder: 'صف باختصار ما ترغب في مناقشته (اختياري)',
    optional: 'اختياري',
    required: 'مطلوب',
    charsRemaining: 'حرف',
    submit: 'اطلب مكالمتك المجانية',
    sending: 'جاري إرسال الطلب...',
    notice:
      'سنراجع طلبك ونتواصل معك لتأكيد الموعد المناسب.',
    successTitle: 'تم استلام طلبك',
    successBody: (name) =>
      `شكراً لك${name ? ` يا ${name}` : ''}. تم استلام طلبك لمكالمة تمهيدية مجانية مدتها 15 دقيقة. سيقوم فريقنا بمراجعته والتواصل معك للاتفاق على الموعد المناسب.`,
    referenceLabel: 'رقم المرجع',
    done: 'تم',
    errName: 'يرجى إدخال اسمك (من حرفين إلى 120 حرفاً).',
    errEmail: 'يرجى إدخال بريد إلكتروني صحيح.',
    errNotesLength: 'يجب ألا تتجاوز النبذة المختصرة 2400 حرف.',
    errValidation:
      'تعذر التحقق من بعض البيانات المدخلة. يرجى مراجعة البيانات والمحاولة مجدداً.',
    errRateLimit:
      'تجاوزت الحد المسموح من الطلبات المتكررة. يرجى الانتظار قليلاً قبل إعادة المحاولة.',
    errTimeout:
      'انتهت مهلة الطلب (15 ثانية) دون تأكيد الاستلام. يرجى التحقق من الاتصال والمحاولة لاحقاً.',
    errNetwork:
      'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
    errServer:
      'حدث خطأ في الخادم أثناء معالجة الطلب. يرجى المحاولة مرة أخرى لاحقاً.',
    errProtocol:
      'تم استلام استجابة غير متوقعة من الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
    errGeneric:
      'تعذر إرسال الطلب في الوقت الحالي. يرجى التأكد من البيانات المدخلة.',
  },
};

/**
 * Maps structured transport or server errors to localized user-facing copy.
 * Guarantees that raw server/transport text never leaks to users in EN or AR.
 */
export function getLocalizedErrorMessage(err, lang = 'en') {
  const isAr = lang === 'ar';
  const t = TEXTS[isAr ? 'ar' : 'en'] || TEXTS.en;
  if (err?.kind === 'rate-limit') return t.errRateLimit;
  if (err?.kind === 'timeout') return t.errTimeout;
  if (err?.kind === 'network') return t.errNetwork;
  if (err?.kind === 'server') return t.errServer;
  if (err?.kind === 'protocol') return t.errProtocol;
  if (err?.kind === 'validation') return t.errValidation;
  return t.errGeneric;
}

const SOURCE_LABELS = {
  header: { en: 'Header', ar: 'ترويسة الموقع' },
  hero: { en: 'Hero Section', ar: 'القسم الرئيسي' },
  journey: { en: '15-Minute Journey', ar: 'رحلة الـ 15 دقيقة' },
  division: { en: 'Divisions', ar: 'قسم الاختصاصات' },
  final: { en: 'Final CTA', ar: 'الدعوة الختامية' },
  sticky: { en: 'Sticky Call', ar: 'زر الاتصال العائم' },
  contact: { en: 'Contact Page', ar: 'صفحة التواصل' },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validates the raw fields and final payload boundary.
 * Throws a structured validation error if any requirement fails.
 */
export function validateInquiryPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw { kind: 'validation', message: 'Payload must be an object' };
  }

  const name = String(payload.name ?? '').trim();
  const email = String(payload.email ?? '').trim();
  const subject = String(payload.subject ?? '').trim();
  const message = String(payload.message ?? '').trim();
  const lang = payload.lang;

  if (name.length < 2 || name.length > 120) {
    throw {
      kind: 'validation',
      field: 'name',
      message: 'Name must be between 2 and 120 characters',
    };
  }

  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    throw {
      kind: 'validation',
      field: 'email',
      message: 'A valid email address is required (maximum 254 characters)',
    };
  }

  if (subject.length < 2 || subject.length > 200) {
    throw {
      kind: 'validation',
      field: 'subject',
      message: 'Subject must be between 2 and 200 characters',
    };
  }

  if (message.length < 10 || message.length > 3000) {
    throw {
      kind: 'validation',
      field: 'message',
      message: 'Message must be between 10 and 3000 characters',
    };
  }

  if (lang !== 'en' && lang !== 'ar') {
    throw {
      kind: 'validation',
      field: 'lang',
      message: 'Language must be "en" or "ar"',
    };
  }

  const serialized = JSON.stringify({
    name,
    email,
    subject,
    message,
    lang,
    honeypot: payload.honeypot ? String(payload.honeypot).trim() : '',
  });

  if (new TextEncoder().encode(serialized).length > 50 * 1024) {
    throw {
      kind: 'validation',
      message: 'Payload size exceeds 50KB limit',
    };
  }

  return {
    name,
    email,
    subject,
    message,
    lang,
    honeypot: payload.honeypot ? String(payload.honeypot).trim() : '',
  };
}

/**
 * Composes bounded subject and message from validated service, source, and optional notes.
 * Guarantees message >= 10 and <= 3000, and subject >= 2 and <= 200.
 */
export function composeInquiryPayload({
  name,
  email,
  service = '',
  notes = '',
  lang = 'en',
  request = {},
  honeypot = '',
}) {
  const isAr = lang === 'ar';
  const cleanDivision = DIVISION_KEYS.includes(service) ? service : null;
  const divisionLabel = cleanDivision
    ? DIVISION_CATALOG[cleanDivision][isAr ? 'ar' : 'en']
    : isAr
      ? 'استفسار عام / لست متأكداً'
      : 'General inquiry / Not sure';

  const sourceKey = request?.source || 'hero';
  const sourceLabel = SOURCE_LABELS[sourceKey]
    ? SOURCE_LABELS[sourceKey][isAr ? 'ar' : 'en']
    : isAr
      ? 'الموقع'
      : 'Website';

  // Compose subject (2–200 chars)
  let subject = cleanDivision
    ? isAr
      ? `طلب مكالمة مجانية: ${divisionLabel}`
      : `Free call request: ${divisionLabel}`
    : isAr
      ? 'طلب مكالمة تمهيدية مجانية (15 دقيقة)'
      : 'Free 15-minute introductory call request';

  if (subject.length > 200) {
    subject = subject.slice(0, 197) + '...';
  }

  // Compose honest intro (guarantees >= 10 chars)
  const introHeader = isAr
    ? `طلب مكالمة تمهيدية مجانية مدتها 15 دقيقة (المصدر: ${sourceLabel}).\nالخدمة المطلوبة: ${divisionLabel}.\nحالة الطلب: بانتظار تأكيد الموعد المناسب.`
    : `Free 15-minute introductory call requested (Source: ${sourceLabel}).\nRequested service: ${divisionLabel}.\nStatus: Awaiting confirmation of convenient time.`;

  const trimmedNotes = String(notes || '').trim().slice(0, 2400);

  let message = introHeader;
  if (trimmedNotes.length > 0) {
    message += isAr
      ? `\n\nملاحظات وتفاصيل العميل:\n${trimmedNotes}`
      : `\n\nClient notes:\n${trimmedNotes}`;
  }

  if (message.length > 3000) {
    message = message.slice(0, 2997) + '...';
  }

  return {
    name: String(name || '').trim(),
    email: String(email || '').trim(),
    subject,
    message,
    lang: isAr ? 'ar' : 'en',
    honeypot: honeypot ? String(honeypot).trim() : '',
  };
}

function raceWithSignal(promise, signal) {
  if (signal.aborted) {
    const err = new Error('Aborted');
    err.name = 'AbortError';
    return Promise.reject(err);
  }
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      signal.addEventListener(
        'abort',
        () => {
          const err = new Error('Aborted');
          err.name = 'AbortError';
          reject(err);
        },
        { once: true }
      );
    }),
  ]);
}

/**
 * Submits an inquiry to the backend.
 *
 * @param {object} payload - { name, email, subject, message, lang, honeypot }
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - Caller abort signal
 * @param {number} [options.timeoutMs=15000] - Bounded timeout duration in milliseconds
 * @returns {Promise<{ ok: true, id?: number }>}
 * @throws {{ kind: 'validation'|'rate-limit'|'server'|'network'|'timeout'|'protocol', status?: number, field?: string, message: string }}
 */
export async function submitInquiry(
  payload,
  { signal, timeoutMs = 15000 } = {}
) {
  const sanitized = validateInquiryPayload(payload);

  const timeoutController = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    timeoutController.abort();
  }, timeoutMs);

  let removeCallerListener = null;
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timer);
      throw {
        kind: 'network',
        message: 'Request was cancelled before transmission.',
      };
    }
    const onCallerAbort = () => {
      clearTimeout(timer);
      timeoutController.abort();
    };
    signal.addEventListener('abort', onCallerAbort, { once: true });
    removeCallerListener = () => {
      signal.removeEventListener('abort', onCallerAbort);
    };
  }

  let response;
  let data = null;
  let jsonParseError = null;

  try {
    const fetchPromise = fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitized),
      signal: timeoutController.signal,
    });

    response = await raceWithSignal(fetchPromise, timeoutController.signal);

    const contentType = response.headers?.get?.('content-type') || '';
    if (contentType.includes('application/json')) {
      // Keep deadline timer and caller abort active during body reading.
      try {
        data = await raceWithSignal(
          response.json(),
          timeoutController.signal
        );
      } catch (bodyErr) {
        if (timedOut || signal?.aborted || timeoutController.signal.aborted) {
          throw bodyErr;
        }
        jsonParseError = bodyErr;
        data = null;
      }
    }
  } catch (err) {
    if (timedOut) {
      throw {
        kind: 'timeout',
        message:
          'Request timed out after 15 seconds. Delivery could not be confirmed.',
      };
    }
    if (signal?.aborted) {
      throw {
        kind: 'network',
        message: 'Request cancelled by user.',
      };
    }
    throw {
      kind: 'network',
      message:
        'Network connection failed. Please check your internet connection.',
    };
  } finally {
    // Only clean up after headers, body reading, and classification are finished
    clearTimeout(timer);
    if (removeCallerListener) {
      removeCallerListener();
    }
  }

  const status = response.status;

  // Rate limiting (429)
  if (status === 429) {
    throw {
      kind: 'rate-limit',
      status: 429,
      message:
        (typeof data?.error === 'string' && data.error) ||
        'Too many attempts. Please try again later.',
    };
  }

  // Client validation error (400)
  if (status === 400) {
    const field = typeof data?.field === 'string' ? data.field : undefined;
    throw {
      kind: 'validation',
      status: 400,
      field,
      message:
        (typeof data?.error === 'string' && data.error) ||
        'Validation failed. Please review the submitted details.',
    };
  }

  // Server error (5xx)
  if (status >= 500) {
    throw {
      kind: 'server',
      status,
      message:
        (typeof data?.error === 'string' && data.error) ||
        'Server encountered an error while processing the request.',
    };
  }

  // Normal success (201)
  if (status === 201) {
    if (jsonParseError) {
      throw {
        kind: 'protocol',
        status: 201,
        message:
          'Server returned 201 Created but the response body was malformed JSON.',
      };
    }
    if (data && typeof data === 'object' && data.ok === true) {
      if (data.id !== undefined && data.id !== null) {
        if (!Number.isSafeInteger(data.id) || data.id <= 0) {
          throw {
            kind: 'protocol',
            status: 201,
            message:
              'Server returned 201 Created but the provided receipt ID is invalid.',
          };
        }
        return { ok: true, id: data.id };
      }
      return { ok: true };
    }
    throw {
      kind: 'protocol',
      status: 201,
      message:
        'Server returned 201 Created but with an invalid response format.',
    };
  }

  // Silent honeypot acceptance (200)
  if (status === 200) {
    if (jsonParseError) {
      throw {
        kind: 'protocol',
        status: 200,
        message:
          'Server returned 200 OK but the response body was malformed JSON.',
      };
    }
    if (data && typeof data === 'object' && data.ok === true) {
      if (data.id !== undefined && data.id !== null) {
        if (!Number.isSafeInteger(data.id) || data.id <= 0) {
          throw {
            kind: 'protocol',
            status: 200,
            message:
              'Server returned 200 OK but the provided receipt ID is invalid.',
          };
        }
        return { ok: true, id: data.id };
      }
      return { ok: true };
    }
    throw {
      kind: 'protocol',
      status: 200,
      message:
        'Server returned 200 OK but with an unexpected response format.',
    };
  }

  // Any other unexpected status code
  throw {
    kind: 'protocol',
    status,
    message:
      (typeof data?.error === 'string' && data.error) ||
      `Unexpected server response status: ${status}.`,
  };
}
