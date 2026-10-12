# Phase 4 — Free-Call Request & Transport Handoff

Standalone implementation for **Phase 4: Free-call request and transport**.
All work is strictly contained within `frontend/src/redesign/booking/**`.
Baseline inspected: `d4e840286dc309f7b89701d88fa2890a431d904a`.
No changes were made to existing server code, database, dependencies, lockfiles, `App.jsx`, `Modal.jsx`, `ScheduleModal.jsx`, or other redesign phases.

---

## 1. Owned Files & Frozen Exports

All files reside in `frontend/src/redesign/booking/`:

### `ConsultationModal.jsx` (Default Export)
```typescript
interface ConsultationModalProps {
  open: boolean;
  onClose: () => void;
  lang?: 'en' | 'ar';
  request?: {
    source: 'header' | 'hero' | 'journey' | 'division' | 'final' | 'sticky' | 'contact';
    division?: 'bim' | 'arch' | 'civil' | 'elec' | 'mgmt' | 'bd' | 'startup' | 'medical' | 'law';
  };
  onSubmitted?: (res: { id?: number }) => void;
}
```
- **Native `<dialog>`**: Preserves native dialog modal behavior (`showModal()`, backdrop click detection, Escape key cancellation, focus containment trap, and focus restoration to opener on close).
- **Form Fields**: Shows Name (2–120 chars) and Email (valid regex, <= 254 chars) first as the only required fields. Service selection is optional (9 frozen divisions plus "Not sure / General inquiry"). Brief context is optional (<= 2400 chars with live counter).
- **Honest & Concise Copy**: Drops fabricated guarantees, project titles, and corporate jargon. States: *"15-minute introductory call, request awaiting confirmation."* Success displays *"Request received"* and the actual integer ID returned by the server (never synthetic numbers like PE-8840).
- **State Management**: Form inputs are preserved on submission errors. Successful state is reset when reopened. Service selection reflects the new opener request context. Stale receipts or error banners are never shown on reopen.
- **Accessibility & Touch**: Controls meet >= 44px min height/touch targets. Clear focus-visible outlines. CSS logical properties throughout. Arabic typography (`Cairo`, `letter-spacing: 0`) and English typography (`Poppins`). Reduced-motion media query completely stops the decorative spinner rotation (`animation: none !important;`) while retaining the textual sending state.

### `contactApi.js` (Named Export `submitInquiry`)
```typescript
export async function submitInquiry(
  payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
    lang: 'en' | 'ar';
    honeypot?: string;
  },
  options?: { signal?: AbortSignal; timeoutMs?: number }
): Promise<{ ok: true; id?: number }>;
```
- **Transport**: Same-origin `POST /api/contact`, `Content-Type: application/json`.
- **Payload Boundaries**: Validates client-side before dispatch (name 2–120, email valid, subject 2–200, message 10–3000, lang 'en'|'ar', JSON size <= 50KB).
- **Composed Message & Subject**: With no user notes, automatically generates an honest 10+ character brief (`Free 15-minute introductory call requested...`), freeing users without notes from having to fabricate a 10-character brief.
- **15-Second Deadline Across Headers & Body Consumption**: Uses `raceWithSignal` to enforce the deadline and caller abort through both request transmission AND response body reading, cleaning up only once the entire operation completes.
- **Structured Error Kinds**: Throws safe structured errors `{ kind, status?, field?, message }` distinguishing:
  - `'validation'` (400 or schema bounds, with safe field metadata)
  - `'rate-limit'` (429)
  - `'server'` (5xx)
  - `'network'` (offline or caller abort)
  - `'timeout'` (15s elapsed before headers OR during body consumption)
  - `'protocol'` (malformed JSON, invalid receipt ID, or unexpected status)
- **Safe Receipt ID Validation**: Validates returned receipt IDs as positive safe integers (`Number.isSafeInteger(id) && id > 0`). Fractional, negative, zero, string, or unsafe numbers are rejected as protocol failures and never displayed to users. Silent 200 `{ok:true}` without an ID (honeypot) is preserved.
- **Privacy & Security**: Zero logging of request bodies or personal data. No automatic POST retries.

### Localized Helpers & Shared Dictionaries
- `TEXTS`: Complete bilingual dictionaries for English and Arabic.
- `getLocalizedErrorMessage(err, lang)`: Maps all error kinds (`validation`, `rate-limit`, `server`, `network`, `timeout`, `protocol`) strictly to localized user-facing copy, ensuring raw server or mock transport text never leaks into the UI.

### Supporting Files
- `ConsultationModal.module.css`: Scoped CSS Module using `--dh-*` variables with fallbacks.
- `harness.js`: Automated acceptance test suite covering 20 distinct edge cases and transport boundaries.
- `index.html`: Standalone preview entry point.
- `preview.jsx` & `preview.module.css`: Interactive test harness with transport simulator (Real API, Mock 201, Mock 200, Mock 400, Mock 429, Mock 500, Mock Network, Mock Malformed Float ID, Mock Delayed Body Timeout) and live 20-test runner.

---

## 2. Review Corrections Implemented

1. **P1 — Deadline and Caller Cancellation Extended to Response-Body Reading**:
   - `contactApi.js` previously cleared its timeout and abort listener before reading `response.json()`.
   - Now uses `raceWithSignal` so that both the network roundtrip and the response body stream are bound to the 15-second deadline and caller abort controller.
   - Timeout during body consumption throws structured `{ kind: 'timeout' }`.
   - Malformed JSON is distinguished and throws structured `{ kind: 'protocol' }` without claiming a timeout.
   - Listener and timer cleanup occurs only in the outermost `finally` block once the entire operation is done.

2. **P2 — Localized Error Copy (Zero Server Error Leakage)**:
   - `ConsultationModal.jsx` previously rendered raw `err.message` on validation/server errors, which could leak English text into an Arabic interface.
   - Now uses `getLocalizedErrorMessage(err, lang)` and maps safe field metadata (`err.field === 'name' | 'email' | 'notes'`).
   - All errors displayed under the Arabic heading are fully localized Arabic strings. Raw server/mock error strings are never rendered in the UI.

3. **P2 — Receipt ID Positive Safe Integer Validation**:
   - `contactApi.js` previously performed only `typeof data.id === 'number'`.
   - Now validates `Number.isSafeInteger(data.id) && data.id > 0`.
   - Fractional (`1.5`), negative (`-1`), zero, string, or unsafe integers are rejected as `{ kind: 'protocol' }` errors and never displayed as references.
   - The documented 200 `{ok:true}` success without an ID (honeypot) continues to return `{ ok: true }` without reference ID.

4. **P2 — Test Harness Expansion & Accurate Classification**:
   - Expanded `harness.js` from 15 to 20 tests.
   - Added specific tests for:
     - Deadline timeout before headers (30ms mock)
     - Deadline timeout during delayed body consumption (120ms delayed stream)
     - Caller abort before dispatch
     - Caller abort during body consumption (delayed stream)
     - Rejection of malformed receipt IDs (fractional, negative, zero, string, non-safe integer)
     - Synchronous guard dropping duplicate in-flight submissions
     - Service context derivation on reopen from different openers
     - Arabic error copy localization ensuring no English leakage across all 6 error kinds.
   - String-only tests explicitly labeled as `Strings: ...`.

5. **Reduced-Motion Preference**:
   - `ConsultationModal.module.css` updated so `prefers-reduced-motion: reduce` completely stops the spinner rotation (`animation: none !important;`) rather than slowing it, while retaining the textual "Sending..." / "جاري إرسال الطلب..." state.

---

## 3. Actual Verification Results

### A. Automated Checks
- **Vite Isolated Production Build**:
  ```powershell
  npm exec -- vite build src/redesign/booking --config vite.config.js --outDir C:\Users\LENOVO\.gemini\antigravity\scratch\Double-H-Consultant\work\phase4-preview
  ```
  Result: **33 modules transformed, 0 errors, 0 warnings**.
  Assets: `work/phase4-preview/index.html` (1.15 kB), CSS (10.32 kB / 2.32 kB gzip), JS (263.52 kB / 81.40 kB gzip).
- **Automated Node Test Suite**:
  ```powershell
  node frontend/src/redesign/booking/harness.js
  ```
  Result: **20 / 20 tests PASSED**:
  1. ✓ Payload: Empty validation
  2. ✓ Payload: Valid minimal boundary
  3. ✓ Payload: Max fields boundary (Name: 120, Msg: 2588 within 50KB limit)
  4. ✓ Payload: Composed boundaries (all 9 divisions in EN/AR within length limits)
  5. ✓ Strings: Arabic subject & message composition
  6. ✓ Transport: 201 with positive integer ID (Received ID: 8812)
  7. ✓ Transport: 200 without ID (honeypot silently accepted)
  8. ✓ Transport: Malformed receipt IDs rejected (P2)
  9. ✓ Transport: 400 validation error
  10. ✓ Transport: 429 rate limit
  11. ✓ Transport: 500 server error
  12. ✓ Transport: Malformed JSON body distinguished (P1)
  13. ✓ Transport: Malformed success (`ok !== true`)
  14. ✓ Transport: Deadline timeout BEFORE headers (P1)
  15. ✓ Transport: Deadline timeout DURING body consumption (P1)
  16. ✓ Transport: Caller abort BEFORE dispatch (P1)
  17. ✓ Transport: Caller abort DURING body consumption (P1)
  18. ✓ UI & Form: Synchronous guard drops duplicate in-flight submit
  19. ✓ UI & Form: Reopen derives service context from new opener
  20. ✓ UI & Form: Arabic error localization (P2: no raw server leak)

### B. Manual Preview Checks
- Verified in preview on port 5174/5178:
  - English at 1440px desktop: Name and Email first, optional service dropdown, 15-minute introductory notice, clean focus rings.
  - Arabic at 390px mobile viewport: RTL layout, `Cairo` font, no letter-spacing tracking, error banner renders pure Arabic copy.
  - Opener options: Hero (no division default), Medical (`medical` preselected), BIM (`bim` preselected).
  - Modal reopen: Closing and reopening after success resets inputs and adopts the new opener's service context.
  - Mock modes: Tested `mock-201`, `mock-200`, `mock-400`, `mock-429`, `mock-500`, `mock-network`, `mock-malformed-id` (triggers protocol error and alert), and `mock-delayed-body` (triggers timeout after deadline).

### C. Unverified / External Constraints
- **Physical Mobile Devices**: Physical touch devices and notched displays remain untested; verified only via CSS logical properties and desktop viewport emulation.
- **Backend Idempotency**: The existing backend `POST /api/contact` does not support idempotency keys; duplicate client requests are mitigated by our synchronous client guard (`inFlightRef.current`), but server-side idempotency remains a backend limitation.
- **Production Lead Delivery**: Live database insertion and email/calendar notifications were intentionally not executed to prevent generating fake production leads.

---

## 4. Phase 7 Wiring Instructions

1. Import `ConsultationModal`:
   ```jsx
   import ConsultationModal from './redesign/booking/ConsultationModal.jsx';
   ```
2. Connect state with frozen `onBook(options)`:
   ```jsx
   const [isBookingOpen, setIsBookingOpen] = useState(false);
   const [bookingRequest, setBookingRequest] = useState({ source: 'hero' });

   const handleBook = (options = { source: 'hero' }) => {
     setBookingRequest(options);
     setIsBookingOpen(true);
   };
   ```
3. Mount in public page layout:
   ```jsx
   <ConsultationModal
     open={isBookingOpen}
     onClose={() => setIsBookingOpen(false)}
     lang={currentLang}
     request={bookingRequest}
     onSubmitted={({ id }) => {
       // Optional: pass received id to outer analytics or state
     }}
   />
   ```
4. **Reconciliation Note**: `ConsultationModal` is fully encapsulated and self-contained with its own native `<dialog>`, accessibility trap, and CSS module. No modifications to `Modal.jsx` or existing app files are required.
