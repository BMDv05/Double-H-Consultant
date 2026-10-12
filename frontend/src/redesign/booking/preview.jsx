import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ConsultationModal from './ConsultationModal.jsx';
import styles from './preview.module.css';
import { runAllTests } from './harness.js';
import { DIVISION_CATALOG } from './contactApi.js';

export default function BookingPreview() {
  const [lang, setLang] = useState('en');
  const [open, setOpen] = useState(false);
  const [request, setRequest] = useState({ source: 'hero' });
  const [mockMode, setMockMode] = useState('real');
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const originalFetchRef = useRef(globalThis.fetch);

  // Setup mock interceptor based on mockMode
  useEffect(() => {
    if (mockMode === 'real') {
      globalThis.fetch = originalFetchRef.current;
      return;
    }

    globalThis.fetch = async (url, options = {}) => {
      if (typeof url === 'string' && url.includes('/api/contact')) {
        await new Promise((r) => setTimeout(r, 450)); // Simulated network latency

        if (mockMode === 'mock-201') {
          return {
            status: 201,
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              ok: true,
              id: Math.floor(Math.random() * 8000) + 1000,
            }),
          };
        }

        if (mockMode === 'mock-200') {
          return {
            status: 200,
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ ok: true }),
          };
        }

        if (mockMode === 'mock-400') {
          return {
            status: 400,
            ok: false,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              error:
                'Mock validation failed: Name must be between 2 and 120 chars.',
            }),
          };
        }

        if (mockMode === 'mock-429') {
          return {
            status: 429,
            ok: false,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              error: 'Mock rate limit: Too many attempts — try again later.',
            }),
          };
        }

        if (mockMode === 'mock-500') {
          return {
            status: 500,
            ok: false,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ error: 'Mock database error.' }),
          };
        }

        if (mockMode === 'mock-malformed-id') {
          return {
            status: 201,
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              ok: true,
              id: 1.5, // Malformed non-integer ID
            }),
          };
        }

        if (mockMode === 'mock-delayed-body') {
          return {
            status: 201,
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: () =>
              new Promise((r) =>
                setTimeout(() => r({ ok: true, id: 9999 }), 16000)
              ),
          };
        }

        if (mockMode === 'mock-network') {
          throw new TypeError('Failed to fetch (simulated network disconnect)');
        }
      }

      return originalFetchRef.current(url, options);
    };

    return () => {
      globalThis.fetch = originalFetchRef.current;
    };
  }, [mockMode]);

  const handleOpenWith = (opts) => {
    setRequest(opts);
    setOpen(true);
  };

  const handleSubmitted = (res) => {
    const record = {
      id: res?.id ?? 'None (honeypot/bot)',
      time: new Date().toLocaleTimeString(),
      source: request.source,
      division: request.division || 'None',
    };
    setSubmissionHistory((prev) => [record, ...prev]);
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await runAllTests();
      setTestResults(results);
    } finally {
      setIsRunningTests(false);
    }
  };

  const isAr = lang === 'ar';

  return (
    <div
      className={styles.previewContainer}
      dir={isAr ? 'rtl' : 'ltr'}
      lang={lang}
    >
      <div className={styles.shell}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {isAr
                ? 'معاينة المرحلة الرابعة: طلب واستدعاء المكالمة المجانية'
                : 'Phase 4 Preview: Free-Call Request & Transport'}
            </h1>
            <p className={styles.subtitle}>
              {isAr
                ? 'واجهة تفاعلية لاختبار النافذة المنبثقة، النقل الشبكي، سيناريوهات الأخطاء، وإمكانية الوصول.'
                : 'Interactive harness for native dialog, transport, mock edge cases, and accessibility.'}
            </p>
          </div>
          <div className={styles.topControls}>
            <button
              type="button"
              className={styles.langButton}
              onClick={() => setLang((l) => (l === 'en' ? 'ar' : 'en'))}
              aria-label="Toggle language"
            >
              {lang === 'en' ? 'العربية (AR)' : 'English (EN)'}
            </button>
          </div>
        </header>

        {/* Modal Launchers */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {isAr ? 'اختبار مشغلات النافذة (Opener Sources)' : 'Trigger Opener Options'}
          </h2>
          <div className={styles.buttonGrid}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => handleOpenWith({ source: 'hero' })}
            >
              Hero CTA (Default)
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => handleOpenWith({ source: 'header' })}
            >
              Header CTA
            </button>
            <button
              type="button"
              className={styles.actionButtonSecondary}
              onClick={() =>
                handleOpenWith({ source: 'division', division: 'bim' })
              }
            >
              Division: BIM ({DIVISION_CATALOG.bim.en})
            </button>
            <button
              type="button"
              className={styles.actionButtonSecondary}
              onClick={() =>
                handleOpenWith({ source: 'division', division: 'medical' })
              }
            >
              Division: Medical ({DIVISION_CATALOG.medical.en})
            </button>
            <button
              type="button"
              className={styles.actionButtonSecondary}
              onClick={() => handleOpenWith({ source: 'journey' })}
            >
              15-Minute Journey
            </button>
            <button
              type="button"
              className={styles.actionButtonSecondary}
              onClick={() => handleOpenWith({ source: 'sticky' })}
            >
              Sticky Call Action
            </button>
          </div>
        </section>

        {/* Transport & Mock Simulator */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {isAr ? 'محاكي النقل الشبكي وحالات الخادم' : 'Transport & Mock Environment'}
          </h2>
          <div className={styles.mockSelector}>
            <label htmlFor="mock-mode-select" style={{ fontWeight: 500 }}>
              Mode:
            </label>
            <select
              id="mock-mode-select"
              className={styles.selectInput}
              value={mockMode}
              onChange={(e) => setMockMode(e.target.value)}
            >
              <option value="real">Real Server (/api/contact)</option>
              <option value="mock-201">Mock 201 Created (Success with ID)</option>
              <option value="mock-200">Mock 200 OK (Honeypot silent success)</option>
              <option value="mock-400">Mock 400 Bad Request (Validation)</option>
              <option value="mock-429">Mock 429 Too Many Requests (Rate limit)</option>
              <option value="mock-500">Mock 500 Server Fault</option>
              <option value="mock-network">Mock Network Offline / Disconnect</option>
              <option value="mock-malformed-id">Mock 201 (Malformed float ID 1.5)</option>
              <option value="mock-delayed-body">Mock Body Timeout (16s delayed body)</option>
            </select>
            <span style={{ fontSize: '0.8125rem', color: '#52625e' }}>
              Current transport: <strong>{mockMode}</strong>
            </span>
          </div>
        </section>

        {/* Test Suite Runner */}
        <section className={styles.panel}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2 className={styles.panelTitle}>
              {isAr ? 'فحص معايير القبول (Automated Acceptance Tests)' : 'Automated Acceptance Tests'}
            </h2>
            <button
              type="button"
              className={styles.actionButton}
              onClick={handleRunTests}
              disabled={isRunningTests}
            >
              {isRunningTests ? 'Running...' : 'Run Test Suite'}
            </button>
          </div>

          {testResults && (
            <div>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.875rem' }}>
                Summary:{' '}
                <strong>
                  {testResults.filter((r) => r.passed).length} /{' '}
                  {testResults.length} passed
                </strong>
              </p>
              {testResults.map((r, idx) => (
                <div key={idx} className={styles.testRow}>
                  <div>
                    <strong>{r.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#52625e' }}>
                      {r.detail}
                    </div>
                  </div>
                  <span className={r.passed ? styles.testPass : styles.testFail}>
                    {r.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Submission Log */}
        {submissionHistory.length > 0 && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>
              {isAr ? 'سجل الطلبات المرسلة في هذه الجلسة' : 'Session Submission Log'}
            </h2>
            <div className={styles.logBox}>
              <pre style={{ margin: 0 }}>
                {JSON.stringify(submissionHistory, null, 2)}
              </pre>
            </div>
          </section>
        )}
      </div>

      {/* The Owned ConsultationModal Component */}
      <ConsultationModal
        open={open}
        onClose={() => setOpen(false)}
        lang={lang}
        request={request}
        onSubmitted={handleSubmitted}
      />
    </div>
  );
}

// Clean HMR Mounting
const container = document.getElementById('root');
if (container) {
  if (globalThis.__dh_booking_root) {
    globalThis.__dh_booking_root.unmount();
  }
  const root = createRoot(container);
  globalThis.__dh_booking_root = root;
  root.render(<BookingPreview />);
}
