# Double H Consulting — Technical Documentation

This guide describes the current application in this repository. For the short setup path, see [README.md](README.md).

## 1. Architecture

The project is a React single-page website backed by an Express JSON API. In production, Express serves the Vite build and API routes from the same origin. SQLite stores contact inquiries, administrator records, and audit events. The earlier vanilla JavaScript and ASP.NET implementation under `legacy/` is reference-only and is not served by this app.

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 6, React Router 6 `HashRouter` |
| Backend | Node.js 24, Express 5 |
| Persistence | SQLite with built-in `node:sqlite` |
| Languages | English and Arabic; Arabic layout is RTL |
| Production server | Express serves `frontend/dist` plus `/api` (default port `3001`) |

## 2. Source tree

```text
frontend/
  index.html                  Metadata, Google Fonts, favicon and app entry
  vite.config.js              Vite development port/proxy and build configuration
  public/                     Brand logos, photos and scroll-motion helper
  src/
    main.jsx                  React entry, HashRouter, language provider, typed-path redirect
    App.jsx                   Navigation, intro, scroll effects, routes, counters and footer
    LangContext.jsx           Language state, document lang/dir/title and persistence
    i18n.js                   English and Arabic translation dictionaries
    icons.jsx                 Shared SVG icons
    Modal.jsx                 Native dialog wrapper used by admin dialogs
    DivisionCarousel.jsx      Division showcase and carousel interactions
    WorldDots.jsx             Decorative world map/dot visual
    pages/Home.jsx            Hero, about, certificates, values and divisions
    pages/Contact.jsx         Contact details and inquiry form
    pages/Admin.jsx           Login, inquiry dashboard and audit log
    styles.css                Palette, layouts, responsive rules, animation and RTL
server/
  index.js                    API routes, rate limits, sessions, headers and static hosting
  db.js                       SQLite schema, migrations, admin seed, queries and audit log
  data/doubleh.db             Created automatically at runtime; ignored by Git
legacy/                       Archived implementation; not used by the current server
start-site.bat                Windows dependency/build/start helper
README.md                     Quick start and API overview
DOCUMENTATION.md              This guide
```

## 3. Frontend behavior

### Routes and navigation

The application uses hash-based routing, so page navigation is held after `#` and does not need server rewrite rules.

| Route | Page |
| --- | --- |
| `#/` | Home |
| `#/contact` | Contact form and company contact details |
| `#/admin` | Hidden admin dashboard; no public navigation link |
| `#/en/...`, `#/ar/...` | Language-prefixed routes; URL and EN/AR switch stay synchronized |

Unknown app routes render Home. `frontend/src/main.jsx` moves typed paths such as `/admin`, `/contact`, and `/en/contact` into the hash on startup. The header links to Home, About, and Certificates; About/Certificates scroll to home page sections. Free-call buttons navigate to Contact. The compact navigation closes on route changes, Escape, or an outside click.

### Home page

The home page has a company hero with a full-width collaboration photo, headline and statistics, a free-call CTA, about section, six certificates, company values, a nine-division carousel, and closing CTA. Company information/statistics and certificates load from the public API; the page has local fallback certificate/stat values when requests fail. The division imagery and certificate/about/value photographs are under `frontend/public/`.

### Contact form

The contact page reads the email, phone, and address from `GET /api/company`. It collects name, email, subject, message, and language. Client validation identifies the first invalid field, the message has a live length counter, and a hidden honeypot blocks bot submissions. The browser keeps a rolling submission guard in `localStorage['dh-rl-contact']`; the server independently limits requests by IP. Requests have a 15-second timeout and show server/network errors; the typed data is retained when a submission fails.

### Admin dashboard

The dashboard supports authentication, message totals, search/status filtering, full message details, processing status changes, delete confirmation, and an audit tab. The browser stores the bearer token in `sessionStorage['dh-admin-token']`. Tokens expire after eight hours and are held in server memory, so restarting the server signs admins out. Admin API calls without a valid token receive `401`.

## 4. Internationalization and visual system

`frontend/src/i18n.js` contains the EN and AR dictionaries; an unknown translation key falls back to English. `LangContext.jsx` persists language in `localStorage['dh-lang']`, updates `<html lang>` and `<html dir>`, and sets a language-specific page title. Arabic uses RTL layout rules in the stylesheet.

The brand palette is `#12393a`, `#134c4b`, `#e6ecec`, `#46766f`, and `#161919`. Cairo is used for headings and Arabic; Poppins is used for body text. Shared visual behavior includes scroll progress, reveal-on-scroll, animated statistics, intro/page transitions, carousel movement, and pointer/scroll effects from `frontend/public/scroll-motion.js`. The code respects `prefers-reduced-motion` in its page transitions, counters, and smooth scrolling; keep this support when changing animation behavior.

## 5. API reference

Routes live in `server/index.js`. JSON request bodies are limited to 50 KB. Except for the public login endpoint, admin endpoints require `Authorization: Bearer <token>`.

| Method | Path | Request | Result |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | `{ status, time }` |
| `GET` | `/api/company` | — | Company name, tagline, contact values and statistics |
| `GET` | `/api/certificates` | — | Array of certificate records (`id`, `name`, `issuer`, `year`) |
| `POST` | `/api/contact` | `{ name, email, subject, message, lang, honeypot }` | `201 { ok, id }` when stored; honeypot submissions are silently accepted |
| `POST` | `/api/admin/login` | `{ email, password }` | `{ token, name, email }` |
| `POST` | `/api/admin/logout` | Bearer token | Invalidates token and returns `{ ok: true }` |
| `GET` | `/api/admin/messages` | Optional `?q=` and `?status=` | `{ messages, stats }`, up to 500 newest-first records |
| `GET` | `/api/admin/messages/:id` | Numeric message id | `{ message }` |
| `PATCH` | `/api/admin/messages/:id` | `{ status: "Not Processed" \| "Processed" }` | Updates status and creates an audit event |
| `DELETE` | `/api/admin/messages/:id` | Numeric message id | Deletes the record and creates an audit event |
| `GET` | `/api/admin/audit` | — | `{ audit }`, up to 50 newest events |

### Validation and limits

- Contact name: 2–120 characters; email: valid pattern and at most 254 characters; subject: 2–200 characters; message: 10–3000 characters.
- Contact is limited to 5 requests per IP in 10 minutes. Admin login is limited to 10 requests per IP in 15 minutes.
- Login errors use the same generic response for an unknown email or incorrect password. Empty credentials are rejected before PBKDF2 verification.
- Common response codes: `400` invalid request/validation, `401` missing or invalid admin token or credentials, `404` unknown message, `413` body exceeds the JSON limit, `429` rate limit, `500` unexpected server error.
- Unknown `/api/*` paths return JSON `404`.
- `X-Powered-By` is disabled. The server sets CSP, MIME sniffing/frame/referrer/permissions policies, cross-origin isolation headers, and HSTS when the request is secure.

## 6. Database and admin setup

The server creates `server/data/doubleh.db` on startup, enables SQLite WAL mode, and uses a 5-second busy timeout.

| Table | Data |
| --- | --- |
| `messages` | Contact fields, language, status and creation time |
| `admins` | Unique email, display name, salted password hash and login timestamps |
| `audit_logs` | Actor, action, entity, entity id and creation time |

Message status is constrained to `Not Processed` or `Processed`; startup migrates the earlier `New`/`Handled` schema. Indexes support status and date queries. Database operations use parameterized SQL. Admin passwords are stored as PBKDF2-SHA256 hashes with per-user salts; unknown-account logins perform a dummy hash and comparisons are constant-time.

On an empty database, `ADMIN_EMAIL` selects the seeded account. `ADMIN_PASSWORD` is used when supplied. Otherwise development seeds `Admin123!`; production generates a random password and prints it once to the server console. Seed environment values only create an admin if that email does not already exist; changing them does not update an existing row.

## 7. Configuration and run modes

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | Express listening port and production site port |
| `ADMIN_EMAIL` | `admin@doubleh.com` | Email for a newly seeded admin |
| `ADMIN_PASSWORD` | Development demo password; generated in production when empty | Password for a newly seeded admin |
| `NODE_ENV` | `development` when unset | Enables production seed behavior when set to `production` |
| `TRUST_PROXY` | `0` | Number of trusted proxies for `req.ip` behind a reverse proxy |

For two-process development, run `npm.cmd --prefix server run dev` and `npm.cmd --prefix frontend run dev` in separate PowerShell terminals. Vite listens on port `5173` and proxies `/api` to port `3001`.

For a production-style local run, build with `npm.cmd --prefix frontend run build`, then start the backend with `npm.cmd --prefix server start`. Express serves the output in `frontend/dist`. The Windows `start-site.bat` helper performs dependency installation and only builds when that output is absent; rebuild manually after frontend edits.

## 8. Production operations

- Set production admin credentials before the first database initialization. If an account already exists, update it through a controlled database/admin process or use a fresh database; environment variables do not rotate existing credentials.
- Replace placeholder phone/address values in `server/index.js` before publishing the contact details.
- Serve over HTTPS. When behind a reverse proxy, set `TRUST_PROXY` to the number of trusted proxy hops so IP-based limits use the client address.
- Back up `server/data/doubleh.db` regularly and keep it outside Git.
- Sessions and rate-limit buckets are in process memory. A restart clears both, and multiple application instances do not share state; use shared storage before scaling horizontally.
- Do not deploy `legacy/`; it contains a separate, older implementation and does not use the current backend authentication.
