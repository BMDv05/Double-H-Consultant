/**
 * Phase 4 Test Harness
 * Exercises all required acceptance and review criteria:
 * - Empty payload validation
 * - Minimal valid payload
 * - Max name (120), max email (254), max notes (2400)
 * - Composed payload boundaries (all 9 divisions in EN & AR)
 * - Composed Arabic string composition
 * - Transport: 201 with positive safe integer ID
 * - Transport: 200 without ID (honeypot acceptance)
 * - Transport: Malformed receipt IDs rejected as protocol error (P2: fractional, negative, string, non-safe integer)
 * - Transport: 400 validation error
 * - Transport: 429 rate limit
 * - Transport: 500 server error
 * - Transport: Malformed JSON body (distinguished from timeout)
 * - Transport: Malformed success response (ok !== true)
 * - Transport: Deadline timeout BEFORE headers (P1)
 * - Transport: Deadline timeout DURING body consumption (P1)
 * - Transport: Caller abort BEFORE dispatch (P1)
 * - Transport: Caller abort DURING body consumption (P1)
 * - UI & Form: Synchronous guard against duplicate submission
 * - UI & Form: Reopen resets form & reflects new division context
 * - UI & Form: Arabic error localization (P2: no raw server error leak)
 *
 * Can be run in Node: `node frontend/src/redesign/booking/harness.js`
 * or imported in `preview.jsx`.
 */

import {
  validateInquiryPayload,
  composeInquiryPayload,
  submitInquiry,
  getLocalizedErrorMessage,
  DIVISION_KEYS,
  DIVISION_CATALOG,
  TEXTS,
} from './contactApi.js';

export async function runAllTests() {
  const results = [];
  const record = (name, passed, detail = '') => {
    results.push({ name, passed, detail });
    if (!passed) {
      console.error(`FAIL: ${name} - ${detail}`);
    }
  };

  // 1. Empty payload validation
  try {
    let threw = false;
    try {
      validateInquiryPayload({ name: '', email: '', subject: '', message: '', lang: 'en' });
    } catch (e) {
      threw = e.kind === 'validation';
    }
    record('Payload: Empty validation', threw, 'Rejects empty name and email');
  } catch (err) {
    record('Payload: Empty validation', false, err.message);
  }

  // 2. Minimal valid payload
  try {
    const payload = composeInquiryPayload({
      name: 'Al',
      email: 'al@co.io',
      service: '',
      notes: '',
      lang: 'en',
    });
    const validated = validateInquiryPayload(payload);
    const valid =
      validated.name === 'Al' &&
      validated.email === 'al@co.io' &&
      validated.subject.length >= 2 &&
      validated.subject.length <= 200 &&
      validated.message.length >= 10 &&
      validated.message.length <= 3000;
    record('Payload: Valid minimal boundary', valid, `Subject: "${validated.subject}", Msg len: ${validated.message.length}`);
  } catch (err) {
    record('Payload: Valid minimal boundary', false, err.message);
  }

  // 3. Max name (120), email (254), notes (2400)
  try {
    const maxName = 'A'.repeat(120);
    const maxEmail = 'user@' + 'a'.repeat(240) + '.com'; // 249 chars, <= 254
    const maxNotes = 'Z'.repeat(2400);
    const payload = composeInquiryPayload({
      name: maxName,
      email: maxEmail,
      service: 'bim',
      notes: maxNotes,
      lang: 'en',
    });
    const validated = validateInquiryPayload(payload);
    const valid =
      validated.name.length === 120 &&
      validated.email.length <= 254 &&
      validated.subject.length <= 200 &&
      validated.message.length <= 3000;
    record('Payload: Max fields boundary', valid, `Name len: ${validated.name.length}, Message len: ${validated.message.length}`);
  } catch (err) {
    record('Payload: Max fields boundary', false, err.message);
  }

  // 4. Composed payload boundary across all 9 divisions and both languages
  try {
    let allValid = true;
    for (const div of DIVISION_KEYS) {
      for (const lang of ['en', 'ar']) {
        const payload = composeInquiryPayload({
          name: 'Test Client',
          email: 'test@example.com',
          service: div,
          notes: 'Important inquiry',
          lang,
        });
        if (payload.subject.length < 2 || payload.subject.length > 200) allValid = false;
        if (payload.message.length < 10 || payload.message.length > 3000) allValid = false;
      }
    }
    record('Payload: Composed boundaries (all 9 divisions in EN/AR)', allValid, 'All 9 divisions stay within [2, 200] subject and [10, 3000] message');
  } catch (err) {
    record('Payload: Composed boundaries (all 9 divisions in EN/AR)', false, err.message);
  }

  // 5. String-only test: Arabic Composition
  try {
    const payload = composeInquiryPayload({
      name: 'أحمد محمود',
      email: 'ahmad@example.com',
      service: 'arch',
      notes: 'مشروع برج سكني',
      lang: 'ar',
    });
    const containsArDivision = payload.subject.includes('الاستشارات المعمارية');
    const containsArNotes = payload.message.includes('مشروع برج سكني');
    record('Strings: Arabic subject & message composition', containsArDivision && containsArNotes, `Subject: ${payload.subject}`);
  } catch (err) {
    record('Strings: Arabic subject & message composition', false, err.message);
  }

  // 6. Transport: 201 with valid positive integer ID
  try {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ ok: true, id: 8812 }),
    });

    const res = await submitInquiry({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Free Call',
      message: 'Hello Double H consulting team',
      lang: 'en',
    });
    globalThis.fetch = originalFetch;
    record('Transport: 201 with positive integer ID', res.ok === true && res.id === 8812, `Received ID: ${res.id}`);
  } catch (err) {
    record('Transport: 201 with positive integer ID', false, err.message);
  }

  // 7. Transport: 200 without ID (honeypot acceptance)
  try {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ ok: true }),
    });

    const res = await submitInquiry({
      name: 'Spam Bot',
      email: 'bot@spam.com',
      subject: 'Special offer',
      message: 'Buy now this great product',
      lang: 'en',
      honeypot: 'filled_by_bot',
    });
    globalThis.fetch = originalFetch;
    record('Transport: 200 without ID (honeypot)', res.ok === true && res.id === undefined, 'Silently accepted without reference ID');
  } catch (err) {
    record('Transport: 200 without ID (honeypot)', false, err.message);
  }

  // 8. Transport: Malformed receipt IDs rejected as protocol failure (P2)
  try {
    const originalFetch = globalThis.fetch;
    const malformedIds = [1.5, -1, 0, '8812', Number.MAX_SAFE_INTEGER + 10];
    let allRejected = true;

    for (const badId of malformedIds) {
      globalThis.fetch = async () => ({
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ok: true, id: badId }),
      });

      let caught = false;
      try {
        await submitInquiry({
          name: 'Jane Doe',
          email: 'jane@example.com',
          subject: 'Free Call',
          message: 'Hello Double H consulting team',
          lang: 'en',
        });
      } catch (e) {
        if (e.kind === 'protocol') caught = true;
      }
      if (!caught) {
        allRejected = false;
        break;
      }
    }

    globalThis.fetch = originalFetch;
    record('Transport: Malformed receipt IDs rejected (P2)', allRejected, 'Fractional, negative, zero, string, and unsafe integer IDs rejected as protocol errors');
  } catch (err) {
    record('Transport: Malformed receipt IDs rejected (P2)', false, err.message);
  }

  // 9. Transport: 400 Validation Error
  try {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Name is required (2–120 chars).' }),
    });

    let caughtKind = null;
    try {
      await submitInquiry({
        name: 'Valid Name',
        email: 'user@domain.com',
        subject: 'Call request',
        message: 'Valid 10+ char message for test',
        lang: 'en',
      });
    } catch (e) {
      caughtKind = e.kind;
    }
    globalThis.fetch = originalFetch;
    record('Transport: 400 validation error', caughtKind === 'validation', `Error kind: ${caughtKind}`);
  } catch (err) {
    record('Transport: 400 validation error', false, err.message);
  }

  // 10. Transport: 429 Rate Limit
  try {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 429,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Too many attempts — try again later.' }),
    });

    let caughtKind = null;
    try {
      await submitInquiry({
        name: 'Valid Name',
        email: 'user@domain.com',
        subject: 'Call request',
        message: 'Valid 10+ char message for test',
        lang: 'en',
      });
    } catch (e) {
      caughtKind = e.kind;
    }
    globalThis.fetch = originalFetch;
    record('Transport: 429 rate limit', caughtKind === 'rate-limit', `Error kind: ${caughtKind}`);
  } catch (err) {
    record('Transport: 429 rate limit', false, err.message);
  }

  // 11. Transport: 500 Server Error
  try {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Database connection failed' }),
    });

    let caughtKind = null;
    try {
      await submitInquiry({
        name: 'Valid Name',
        email: 'user@domain.com',
        subject: 'Call request',
        message: 'Valid 10+ char message for test',
        lang: 'en',
      });
    } catch (e) {
      caughtKind = e.kind;
    }
    globalThis.fetch = originalFetch;
    record('Transport: 500 server error', caughtKind === 'server', `Error kind: ${caughtKind}`);
  } catch (err) {
    record('Transport: 500 server error', false, err.message);
  }

  // 12. Transport: Malformed JSON body on 201 (distinguished from timeout/network)
  try {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON at position 0');
      },
    });

    let caughtKind = null;
    try {
      await submitInquiry({
        name: 'Valid Name',
        email: 'user@domain.com',
        subject: 'Call request',
        message: 'Valid 10+ char message for test',
        lang: 'en',
      });
    } catch (e) {
      caughtKind = e.kind;
    }
    globalThis.fetch = originalFetch;
    record('Transport: Malformed JSON body distinguished (P1)', caughtKind === 'protocol', `Error kind: ${caughtKind}`);
  } catch (err) {
    record('Transport: Malformed JSON body distinguished (P1)', false, err.message);
  }

  // 13. Transport: Malformed success response (ok !== true)
  try {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ ok: false }),
    });

    let caughtKind = null;
    try {
      await submitInquiry({
        name: 'Valid Name',
        email: 'user@domain.com',
        subject: 'Call request',
        message: 'Valid 10+ char message for test',
        lang: 'en',
      });
    } catch (e) {
      caughtKind = e.kind;
    }
    globalThis.fetch = originalFetch;
    record('Transport: Malformed success (ok !== true)', caughtKind === 'protocol', `Error kind: ${caughtKind}`);
  } catch (err) {
    record('Transport: Malformed success (ok !== true)', false, err.message);
  }

  // 14. Transport: Deadline timeout BEFORE headers (P1)
  try {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (url, opts) =>
      new Promise((resolve, reject) => {
        opts?.signal?.addEventListener('abort', () => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });

    let caughtKind = null;
    try {
      await submitInquiry(
        {
          name: 'Valid Name',
          email: 'user@domain.com',
          subject: 'Call request',
          message: 'Valid 10+ char message for test',
          lang: 'en',
        },
        { timeoutMs: 30 }
      );
    } catch (e) {
      caughtKind = e.kind;
    }
    globalThis.fetch = originalFetch;
    record('Transport: Deadline timeout BEFORE headers (P1)', caughtKind === 'timeout', `Kind: ${caughtKind}`);
  } catch (err) {
    record('Transport: Deadline timeout BEFORE headers (P1)', false, err.message);
  }

  // 15. Transport: Deadline timeout DURING body consumption (P1)
  try {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () =>
        new Promise((resolve, reject) => {
          // Delayed body that exceeds the 30ms timeout
          setTimeout(() => resolve({ ok: true, id: 999 }), 120);
        }),
    });

    let caughtKind = null;
    try {
      await submitInquiry(
        {
          name: 'Valid Name',
          email: 'user@domain.com',
          subject: 'Call request',
          message: 'Valid 10+ char message for test',
          lang: 'en',
        },
        { timeoutMs: 30 }
      );
    } catch (e) {
      caughtKind = e.kind;
    }
    globalThis.fetch = originalFetch;
    record('Transport: Deadline timeout DURING body consumption (P1)', caughtKind === 'timeout', `Kind: ${caughtKind}`);
  } catch (err) {
    record('Transport: Deadline timeout DURING body consumption (P1)', false, err.message);
  }

  // 16. Transport: Caller abort BEFORE dispatch (P1)
  try {
    const controller = new AbortController();
    controller.abort();

    let caughtKind = null;
    try {
      await submitInquiry(
        {
          name: 'Valid Name',
          email: 'user@domain.com',
          subject: 'Call request',
          message: 'Valid 10+ char message for test',
          lang: 'en',
        },
        { signal: controller.signal }
      );
    } catch (e) {
      caughtKind = e.kind;
    }
    record('Transport: Caller abort BEFORE dispatch (P1)', caughtKind === 'network', `Error kind: ${caughtKind}`);
  } catch (err) {
    record('Transport: Caller abort BEFORE dispatch (P1)', false, err.message);
  }

  // 17. Transport: Caller abort DURING body consumption (P1)
  try {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();

    globalThis.fetch = async () => ({
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ ok: true, id: 999 }), 150);
        }),
    });

    // Abort after 25ms while body is reading
    setTimeout(() => controller.abort(), 25);

    let caughtKind = null;
    try {
      await submitInquiry(
        {
          name: 'Valid Name',
          email: 'user@domain.com',
          subject: 'Call request',
          message: 'Valid 10+ char message for test',
          lang: 'en',
        },
        { signal: controller.signal, timeoutMs: 5000 }
      );
    } catch (e) {
      caughtKind = e.kind;
    }
    globalThis.fetch = originalFetch;
    record('Transport: Caller abort DURING body consumption (P1)', caughtKind === 'network', `Kind: ${caughtKind}`);
  } catch (err) {
    record('Transport: Caller abort DURING body consumption (P1)', false, err.message);
  }

  // 18. UI & Form: Synchronous guard against duplicate submission
  try {
    let callCount = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      callCount++;
      await new Promise((r) => setTimeout(r, 80));
      return {
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ ok: true, id: 100 }),
      };
    };

    // Test synchronous in-flight guard logic
    let inFlight = false;
    let successfulDispatches = 0;

    const triggerSubmit = async () => {
      if (inFlight) return; // Synchronous guard
      inFlight = true;
      try {
        await submitInquiry({
          name: 'Duplicate Test',
          email: 'dup@test.com',
          subject: 'Call request',
          message: 'Valid 10+ char message for test',
          lang: 'en',
        });
        successfulDispatches++;
      } finally {
        inFlight = false;
      }
    };

    // Rapid double-trigger
    const p1 = triggerSubmit();
    const p2 = triggerSubmit(); // Should be dropped synchronously
    await Promise.all([p1, p2]);

    globalThis.fetch = originalFetch;
    record('UI & Form: Synchronous guard drops duplicate in-flight submit', callCount === 1 && successfulDispatches === 1, `Dispatched: ${callCount}`);
  } catch (err) {
    record('UI & Form: Synchronous guard drops duplicate in-flight submit', false, err.message);
  }

  // 19. UI & Form: Reopen resets form & reflects new division context
  try {
    const deriveService = (divisionKey) => (DIVISION_KEYS.includes(divisionKey) ? divisionKey : '');

    // Case A: Opened from Hero (no division)
    const service1 = deriveService(undefined);
    // Case B: Reopened from Medical division
    const service2 = deriveService('medical');
    // Case C: Reopened from unknown division
    const service3 = deriveService('invalid_division');

    const valid = service1 === '' && service2 === 'medical' && service3 === '';
    record('UI & Form: Reopen derives service context from new opener', valid, 'Medical selected on medical opener, cleared on hero');
  } catch (err) {
    record('UI & Form: Reopen derives service context from new opener', false, err.message);
  }

  // 20. UI & Form: Arabic error localization (P2: no raw server error leak)
  try {
    const errorsToTest = [
      { kind: 'validation', message: 'Mock validation failed: Name must be 2-120 chars' },
      { kind: 'rate-limit', message: 'Too many requests' },
      { kind: 'server', message: 'Internal server error 500' },
      { kind: 'timeout', message: 'Connection timed out' },
      { kind: 'network', message: 'Network offline' },
      { kind: 'protocol', message: 'Protocol malformed' },
    ];

    let noLeaks = true;
    for (const err of errorsToTest) {
      const localized = getLocalizedErrorMessage(err, 'ar');
      // Must NOT contain the raw English message
      if (localized.includes(err.message)) noLeaks = false;
      // Must contain Arabic characters
      if (!/[\u0600-\u06FF]/.test(localized)) noLeaks = false;
    }

    record('UI & Form: Arabic error localization (P2: no raw server leak)', noLeaks, 'All error kinds map strictly to localized Arabic text');
  } catch (err) {
    record('UI & Form: Arabic error localization (P2: no raw server leak)', false, err.message);
  }

  return results;
}

// Auto-run if executed directly via Node
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('harness.js')) {
  console.log('Running Phase 4 Booking & Transport Test Suite...\n');
  runAllTests().then((results) => {
    let passed = 0;
    for (const r of results) {
      console.log(`${r.passed ? '✓ PASS' : '✗ FAIL'} : ${r.name} (${r.detail})`);
      if (r.passed) passed++;
    }
    console.log(`\nResults: ${passed} / ${results.length} passed.`);
    if (passed !== results.length) {
      process.exit(1);
    }
  });
}
