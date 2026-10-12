# Editorial homepage rebuild — 2026-10-12

The production homepage now renders the image-led redesign. React/Vite are retained. This supersedes the prior geometric “Clarity in motion” implementation and its visual handoff.

## Experience
- Full-bleed illustrative hero, oversized type, visible first-call action, and a restrained entrance.
- An editorial introduction with a large photographic frame.
- Three native sticky image chapters for engineering, business, and specialist advice. All nine canonical services remain immediately selectable; the chosen ID reaches booking.
- Bounded image parallax and reversible card scaling, with no wheel interception or synthetic scrolling library.
- An interactive three-step first-call sequence, values, closing invitation, and contact section.
- Normal document flow on mobile, short desktop viewports, system reduced motion, and the new footer “Reduce motion” control. Content never waits for an animation to become visible.
- English/Arabic composition, logical positioning, focus outlines, skip link, keyboard-accessible selectors, and preserved free-call language: a request, with a time agreed afterwards.

## Interfaces and integration
`ConsultingHome({lang,onBook,content,heroVisual,credentials,aboutVisual})` is preserved. The eight section IDs and `final-call` alias remain. Visual slots are optional; the default uses local WebP assets rather than SVG studies. The section sequence now puts service chapters before the first-call journey.

`frontend/src/redesign/ConsultingSite.jsx` composes the existing foundation header, sticky call, homepage, short footer, and Phase 4 consultation modal. Booking/transport and foundation source files were not changed by this rebuild. The public composition overrides canvas/accent locally; shared frozen foundation tokens are unchanged.

`App.jsx` routes the homepage to this composition. The previous App implementation is preserved in `LegacyApp.jsx` and loaded lazily for `/admin`, including trailing-slash routes. `/contact` now renders the matching public inquiry page. `pages/Home.jsx` and `BimDigitalTwin.jsx` only changed their imports to the moved legacy module. Legacy CSS is loaded with that module. The admin implementation remains unchanged. The former contact implementation is retained in the legacy module but no longer serves the public contact route.

`LangContext.jsx` and `index.html` remove unverified certification claims from the title/description. No backend routes, database, lockfiles, or project dependencies changed. No live inquiry was submitted, no commit created, and no external deployment performed.

## Images
`frontend/public/consulting-images/` contains three generated illustrative scenes in large and small WebP variants. They show perspective, conversation, and discretion; they are not client projects or documented Double H offices. Hero and service images carry a discreet illustrative caption. Original generation outputs are retained under the Codex generated-images directory. Combined six optimized files: 544,132 bytes. Hero priority is high; lower images are lazy-loaded; responsive `srcset` selects smaller files. Failed images leave a readable colored fallback.

## Verification
- Homepage content/SSR/source checks: 19/19 passed. These verify content fallback, IDs, slots, semantic heading count, and limited CSS contracts; they do not prove animation quality.
- Unchanged Phase 4 transport harness: 20/20 passed, including body deadline/cancellation and receipt validation. Some UI-named assertions in that harness are model-level checks rather than browser end-to-end tests.
- Final production build: Vite 6.4.3, 1,942 modules, success. Homepage entry JS: 356.19 kB (112.06 kB gzip); entry CSS: 35.27 kB (7.65 kB gzip). Legacy JS: 647.98 kB and a separate CSS chunk. Vite still warns about that legacy chunk. Bundle figures are not Core Web Vitals.
- New/rewritten public files pass Prettier checks; `git diff --check` passes.
- The moved legacy implementation matches its pre-rebuild copy apart from its name, CSS import, and whitespace.
- Browser checked the compiled site on port 3001, EN/AR at 1440×900, 390×844, and 360×640: no observed horizontal overflow, one h1, first-call action visible on the small hero.
- Browser checked service selection into booking (architecture desktop, legal Arabic mobile), empty-form validation, Escape closing/focus return, Arabic mobile menu/Escape, anchor navigation, forward/reverse scrolling, and the actual Reduce motion control. That control removes sticky positioning and image transforms.

Native OS reduced-motion preference, physical devices, a screen reader, Lighthouse, field performance, and live lead delivery were not tested. Backend submission behavior was intentionally exercised through mocks/harness rather than real customer records. Review the working tree, not only the Git index: earlier phase snapshots were already staged before this rebuild.

## Local review
Production: http://127.0.0.1:3001/
Development: http://127.0.0.1:5174/
Home-only composition preview: http://127.0.0.1:5174/src/redesign/home/index.html

After future source edits, run `npm run build` inside `frontend` to update the assets served by the existing server. No server restart was required for this asset rebuild.
## Public contact page
`ConsultingContact.jsx` and its CSS module replace the old placeholder-heavy public contact layout. There is one semantic h1, an illustrated introductory-call panel, and a separate general inquiry form. It does not fetch the seeded `/api/company` details or claim a response deadline. All nine service options and query prefill are supported. General inquiries retain the original name/email/subject/message/lang/honeypot API shape and service subject prefix. A duplicate-submit guard, bounded validation, abort on unmount, localized errors, retained fields on failure, and a reference/success/reset state reuse the existing Phase 4 transport without editing that module.

Three contact boundary/SSR tests pass: all-service bilingual payload limits, invalid/unknown inputs, and encoded query prefill with no seeded contact details. `contact-check/` is a development harness with injected mocked submission; it is not linked from the public site or included in the normal production entry. Browser checked mock success/reference/reset and Arabic server failure with retained input, focus on the error, and no raw diagnostic leakage. The compiled contact page was checked in EN/AR at 1440×900 and 390×844, with no observed horizontal overflow and no fake phone/location text. Empty-form validation was checked on port 3001 without sending a request.

Meaningful security boundary: the browser collects inquiry details and POSTs bounded, validated text to the existing same-origin API. React encodes user/query values; canonical service IDs prevent arbitrary prefix lookup; the existing transport enforces response validation/deadline/cancellation. No new third-party form endpoint, permissions, or backend data migration was introduced.

Browser additionally verified query prefill changing from BIM/Coordination to Legal/Contract, the admin login entry, and return to the public homepage after loading legacy styles. The clean final production review tab captured no console warnings/errors.

## Motion update — 2026-10-12
The production default hero now includes a live 3D perspective sculpture and stronger scroll/hover effects. See ../scene/HANDOFF.md for current render lifecycle, bundle sizes, verification and limits. It supersedes the earlier motion description and build figures above.
