# Phase 1 — Foundation handoff

Implemented only `frontend/src/redesign/foundation/**`. The existing application on port 3001 is not wired to these modules. Phase 7 owns composition and deployment. No dependencies, lockfiles, API, database, central translations, or other phases were changed.

## Files and frozen interfaces

- `SiteHeader.jsx` (default): `{lang, onLanguageChange, onBook, activeSection}`. Responsive navigation, language switch, original dark logo, one desktop call action, expandable mobile menu. Escape/navigation/language changes close the menu; crossing to desktop restores visible focus when focus was in the mobile menu.
- `SiteFooter.jsx` (default): `{lang, onBook, contacts}`. Invitation, original light logo, concise Consulting identity, section links, supplied contacts only. `contacts` is `{email:null|string, phone:null|string, address:null|string}`. Empty/null/invalid values are omitted. Address is rendered as text. Email/phone URLs use fixed `mailto:`/`tel:` schemes; bounded malformed values are rejected. The caller remains responsible for verifying the details.
- `StickyCall.jsx` (default): `{lang, onBook, visible, disabled=false}`. Returns null if hidden/disabled. Fixed action with bottom/side safe-area spacing and RTL positioning.
- Each component imports only its matching CSS Module. `tokens.css` provides the frozen `--dh-*` palette/font/radius/width variables inside `.dh-public`; no `:root`, body, or global admin selectors.
- `index.html`, `preview.jsx`, `preview.module.css` are local fixtures, not production page content. They exercise routes, callbacks, contact boundaries, input focus, and isolation. The architectural SVG is a layout fixture, not a claimed client project. The dialog sends no request.

Supported language values: `en`, `ar`. Callbacks: header `{source:'header'}`, footer `{source:'final'}`, sticky `{source:'sticky'}`. The public components do not import central booking, icons, translations, or another phase.

## Phase 7 wiring

1. Import `tokens.css` once; mount these components inside the existing HashRouter and a public-only wrapper with `className="dh-public"`, `lang={lang}`, and `dir={lang === 'ar' ? 'rtl' : 'ltr'}`. Never wrap the admin application in this theme.
2. Pass the existing language setter and a single booking callback adapter. Keep requests awaiting confirmation; the footer says a time will be agreed. Keep Cairo/Poppins and `/logo-dark.png`, `/logo-light.png` available through the application public assets.
3. Set `visible` according to the page/scroll policy. Derive `disabled` from dialog-open, form-editing/input-focus, and admin state. On the public wrapper, set `data-sticky-call={visible && !disabled}` so clearance exists only while the fixed action renders. Tokens reserve 104px plus the bottom safe area.
4. Render actual section IDs `about`, `divisions`, `journey`, `certificates`. Links use React Router objects such as `{pathname:'/', hash:'#about'}`; resulting HashRouter URLs are `#/#about`. The composition owner must scroll to `location.hash` after route rendering. Tokens supply header scroll clearance. `activeSection` is optional; otherwise navigation follows the route/hash.
5. Supply only verified contact details. Without any contacts, the footer still links to `/contact` and remains usable. Do not import the preview, its sample contacts, its fixtures, or its test dialog into App.

## Actual verification

- Owned preview production build passed with installed Vite 6.4.3, 39 modules. JS 254.33kB / 80.18kB gzip; CSS 15.94kB / 3.60kB gzip. This includes React/router and preview fixtures, not a component-only bundle.
- Browser: EN/AR at 1440 and 390px, plus EN/AR 360px and AR 768px. No horizontal overflow. At 1440: one visible header CTA, navigation in one row, both original logos loaded with natural proportions. Final EN/AR desktop shared shell controls measured at least 44x44px; mobile language/menu controls also measured 44x44px.
- Keyboard: Tab enters the mobile menu; Escape closes and restores toggle focus. Mobile navigation closes the menu. Changing language closes it. Resizing an open mobile menu to desktop restores visible brand focus. Skip link focuses main without changing the HashRouter route.
- Header, mobile-header, footer, and sticky callbacks return the expected sources. Native preview dialog hides sticky; closing/Escape restores opener focus, including the remounted sticky button.
- `visible=false`, `disabled=true`, and focused input hide sticky and remove clearance; blur restores it. Empty contacts, valid fixture contacts, malformed URI values, and oversized addresses exercised.
- Contact-to-home section navigation and footer journey/quality anchors reached the right IDs below the sticky header.
- Theme-isolation fixture outside `.dh-public` retained its font/color, inherited no `--dh-ink`, and rendered no sticky action. This is not a full regression test of the real admin.
- Clean-load browser console: no warnings/errors. Earlier concurrent edits produced HMR/createRoot and Router future warnings; the preview now opts into supported future flags and disposes its root on hot replacement. This is a clean-load result, not a claim that the entire development session was error-free. Scoped reduced-motion rules reviewed in source; an OS reduced-motion setting was not emulated.
- No lint, typecheck, or unit-test script is configured in the frontend package. Verification uses the owned build and meaningful browser fixtures. Main-app integration and real booking/API verification remain Phase 7 work.

Reproduce from `frontend`:

```powershell
npm run dev -- --port 5174 --host 127.0.0.1 --strictPort
# Open http://127.0.0.1:5174/src/redesign/foundation/index.html
npm exec -- vite build src/redesign/foundation --config vite.config.js --outDir ABSOLUTE_NEW_WORK_DIRECTORY
```

Build output belongs outside the repository and is not staged. The separate preview root does not copy the application's existing public assets; the development preview serves them correctly. The build verifies module compilation, not a standalone deployable preview package.

The independent review supplied by the user was reconciled with this final version: root disposal implemented; physical safe-area values map to the correct logical side in RTL; sticky-opener restoration and conditional clearance documented above. Physical notched-device behavior remains untested. Phase 7 must check interaction with existing application-wide styles, real admin/public routes, destination focus, and real booking/API behavior. The isolated preview does not import those existing styles.

Screenshots and a copy of this handoff are in the current chat's `outputs/phase1-foundation/`: desktop EN/AR, mobile EN/AR, expanded AR menu, desktop EN footer, and mobile AR footer. This phase added only its owned source/handoff files to the index; other workers manage their own staged files. No commit or deployment was requested.
