# Double H Consulting — Project Documentation

> **ملخص بالعربية:** موقع شركة Double H Consulting مبني بـ React (الواجهة) و Express مع قاعدة بيانات SQLite (الخادم).
> الصفحة الرئيسية تعرّف بالشركة وشهاداتها الأمريكية وأقسامها التسعة، وأزرار «احجز مكالمتك المجانية» تنقل الزائر إلى صفحة التواصل.
> رسائل نموذج التواصل تُحفظ في قاعدة البيانات وتظهر في لوحة الإدارة. اللغتان **English / العربية** فقط مع دعم RTL.
> لوحة الإدارة مخفية: تُفتح بكتابة `/admin` في شريط العنوان (لا يوجد رابط لها في الموقع).

This file is the full reference for the current version. `README.md` has the quick start.

---

## 1. Overview

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19 · Vite 6 · react-router-dom 6 (**HashRouter**) · lucide-react icons |
| Backend    | Node.js 24 · Express 5 |
| Database   | **SQLite** via Node's built-in `node:sqlite` (no native modules) |
| Languages  | English + Arabic (RTL) |
| Deployment | Express serves the built site and the API from one origin (`:3001`) |

The original vanilla-HTML + ASP.NET version is kept under `legacy/` for reference only.
Nothing in the current app depends on it.

---

## 2. Project Structure

```
Double-H-Consultant/
├── frontend/                  → React app (Vite)
│   ├── index.html             → meta tags, Google Fonts, favicon (/logo-dark.png)
│   ├── vite.config.js         → dev server :5173, proxies /api → :3001
│   ├── public/
│   │   ├── logo-dark.png      → wordmark used in the nav and as the favicon
│   │   └── logo-light.png     → white wordmark (currently unused)
│   └── src/
│       ├── main.jsx           → entry: moves typed paths into the hash route, HashRouter + LangProvider
│       ├── App.jsx            → nav, language switch, scroll effects, counters, routes, footer
│       ├── LangContext.jsx    → language state, <html lang/dir>, page title, localStorage 'dh-lang'
│       ├── i18n.js            → EN + AR dictionaries (a missing key falls back to English)
│       ├── icons.jsx          → lucide-react icons with one shared size and stroke
│       ├── Modal.jsx          → native <dialog> wrapper used by the admin page
│       ├── styles.css         → brand theme, layout, animations, RTL rules
│       └── pages/
│           ├── Home.jsx       → company, free-call offer, about, certificates, values, divisions, CTA
│           ├── Contact.jsx    → contact cards + inquiry form
│           └── Admin.jsx      → hidden dashboard: messages + audit log
├── server/                    → Express API
│   ├── index.js               → routes, rate limits, sessions, error handler, serves frontend/dist
│   ├── db.js                  → SQLite schema + status migration, admin seed, queries, audit log
│   └── data/doubleh.db        → created on first run (git-ignored)
├── legacy/                    → old vanilla + .NET files (reference only)
├── start-site.bat             → one-click Windows launcher
├── README.md                  → quick start + API summary
└── DOCUMENTATION.md           → this file
```

---

## 3. Pages & Routes

Routing is **hash-based** (`#/…`), so the app also works on static hosts without rewrite rules.

| Route       | Page    | How visitors reach it |
|-------------|---------|-----------------------|
| `#/`        | Home    | Logo, "Home" nav link. Unknown routes also show Home. |
| `#/contact` | Contact | Every "Claim My Free Call" button. There is no Contact nav link. |
| `#/admin`   | Admin   | **Hidden.** No link anywhere in the UI. |

### Typed paths
The server returns `index.html` for every non-`/api` path. Before React starts, `main.jsx` moves a
typed path into the hash: `/admin` → `#/admin`, `/admin/` → `#/admin`, `/contact` → `#/contact`.
The Vite dev server behaves the same way.

### Navigation
* Nav: logo, **Home**, **About** and **Certificates** (the last two scroll to their Home section), EN / AR switch.
* On small screens the links collapse into a burger menu. Esc, an outside click or a route change closes it.
* Footer: company name, a short description and the copyright line.

---

## 4. Home Page

1. **Hero**: "First Call FREE — No Commitment" badge, title, subtitle, description, then
   **Claim My Free Call** (→ Contact) and **Discover our story** (→ About).
   Below them are four animated counters (years, projects, clients, divisions) read from `GET /api/company`.
   A side card lists the Double H divisions.
2. **Free-call offer**: a card repeating the offer, with a button to the Contact page.
3. **Marquee**: scrolling ticker of division names (decorative, hidden from screen readers).
4. **About**: two paragraphs and four points (American standards, senior experts, on-time and on-budget, people first).
5. **American certificates**: six rows from `GET /api/certificates`, with loading, error and empty states.
6. **Values**: four numbered values.
7. **Divisions**: nine numbered rows (BIM, Architecture, Civil, Medical, Law, Electricity, Management, BD, Startups).
8. **CTA band**: the free-call offer again, with a button to the Contact page.

Certificate names and the hero-card division list come from English data and are not translated.

---

## 5. Contact Page

* Four info cards (email, phone, hours, location). Email, phone and address come from `GET /api/company`.
* The form has name, email, subject and message (10–3000 characters, with a live counter). All fields are required.
* Client-side checks: field validation with inline errors and focus on the first invalid field,
  a hidden honeypot field, a 5-per-10-minutes limit stored in `localStorage['dh-rl-contact']`,
  a 15-second request timeout, and no double submissions.
* The typed input is kept if sending fails. On success a confirmation box replaces the form.
* `POST /api/contact` stores the message with status `Not Processed` and the visitor's current language.

---

## 6. Admin Dashboard

Open `/admin` (or `#/admin`) and sign in.

### Login and session
* `POST /api/admin/login` checks the PBKDF2 hash and returns a bearer token valid for **8 hours**.
* The token is kept in `sessionStorage['dh-admin-token']`, so closing the tab signs the admin out.
* Sessions live in server memory, so **restarting the server signs every admin out**.
* Any `401` response sends the dashboard back to the login form.

### Messages tab
* KPIs: **Total**, **Not Processed** and **Processed**.
* Status filter and text search over name, email, subject and message. Both filter instantly in the browser.
* Row actions: **view details**, **mark Processed / Not Processed** (both directions) and **delete**.
* The details modal shows the client's name, email, language, received date, status and full message,
  and has the same status and delete actions.
* Delete always opens a confirmation dialog that previews the message. Only "Yes, delete" removes it.
  Esc, the backdrop and Cancel all abort.

### Audit log tab
The last 50 entries: logins, logouts, status changes, deletions and new public messages.
Opening a message's details is not logged.

### Credentials
The first run seeds a demo admin, `admin@doubleh.com` / `Admin123!`, unless `ADMIN_EMAIL` /
`ADMIN_PASSWORD` are set. See §11 before deploying.

---

## 7. API

All responses are JSON. Errors return `{ "error": "message" }`.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET    | `/api/health` | — | health check |
| GET    | `/api/company` | — | name, tagline, email, phone, address, stats |
| GET    | `/api/certificates` | — | the six American certificates |
| POST   | `/api/contact` | — | save a contact message (rate-limited) |
| POST   | `/api/admin/login` | — | `{email, password}` → `{token, name, email}` (rate-limited) |
| POST   | `/api/admin/logout` | Bearer | invalidate the token |
| GET    | `/api/admin/messages` | Bearer | newest-first list (max 500) + stats; supports `?q=` and `?status=` |
| GET    | `/api/admin/messages/:id` | Bearer | one message with full details |
| PATCH  | `/api/admin/messages/:id` | Bearer | `{status}`: `Not Processed` or `Processed` |
| DELETE | `/api/admin/messages/:id` | Bearer | delete a message |
| GET    | `/api/admin/audit` | Bearer | last 50 audit entries |

### Status codes
| Code | When |
|------|------|
| 400 | Failed validation, or a request body that isn't valid JSON |
| 401 | Missing, invalid or expired admin token; wrong login |
| 404 | Message id not found |
| 413 | Request body over 50 KB |
| 429 | Rate limit hit: contact 5 per 10 min per IP, login 10 per 15 min per IP |
| 500 | Unexpected server error (the details go to the server console only) |

The company details and the certificate list are hard-coded in `server/index.js`.
The phone number (`+1 (555) 000-0000`) and address are **placeholders** to replace.

---

## 8. Database (SQLite)

Created automatically at `server/data/doubleh.db` by `server/db.js`.

| Table        | Columns |
|--------------|---------|
| `messages`   | name, email, subject, message, lang, status (`Not Processed` / `Processed`, enforced by `CHECK`), created_at |
| `admins`     | name, email (unique), password_hash, salt, created_at, last_login_at |
| `audit_logs` | actor, action, entity, entity_id, created_at |

Indexes: `messages(status)` and `messages(created_at)`.

**Migration:** databases from the earlier version stored `New` / `Handled`. On startup these are
rebuilt once into `Not Processed` / `Processed`. Older databases may also still contain a
`consultations` table from the removed booking flow. The current code never reads it.

**Passwords:** PBKDF2-SHA256, 100,000 iterations, 64-byte key, random 16-byte salt per admin,
compared in constant time.

---

## 9. Internationalization (EN / AR)

* Only English and Arabic exist. `i18n.js` holds one dictionary per language.
* The nav switch is a 120 × 52 px toggle with a sliding highlight. Its order stays EN | AR in RTL.
* Arabic sets `<html dir="rtl" lang="ar">` and an Arabic page title. Layout flips through CSS logical
  properties plus a few `[dir='rtl']` rules (nav underline, arrow icons, form fields).
* The choice persists in `localStorage['dh-lang']`.
* Contact messages store the language used, and admins see it in the table and the details modal.

---

## 10. Branding, Motion & Accessibility

| Item | Value |
|------|-------|
| Palette | `#12393a` (deep1) · `#134c4b` (deep2) · `#e6ecec` (mist) · `#46766f` (sage) · `#161919` (ink), plus transparent blends |
| Fonts | **Cairo** (headings / Arabic) · **Poppins** (body), from Google Fonts |
| Logo | Double H wordmark, `frontend/public/logo-dark.png` (nav + favicon) |
| Icons | lucide-react, one family, wrapped in `icons.jsx` |

**Motion**
* A slim scroll-progress bar at the top of the page.
* The nav gains a shadow after 24 px of scroll.
* Section headings, cards and rows fade in as they enter the view, staggered per group with the `--d` CSS variable.
  Content fetched later (the certificates) is picked up automatically.
* Hero entrance, page-change transition, marquee ticker, modal open animation and number counters.
* `prefers-reduced-motion: reduce` turns all of this off and shows the final counter values immediately.

**Accessibility**
* A skip link, focus moved to the main content on route change, and focusable section targets for the About and Certificates links.
* Labelled form fields with inline errors linked through `aria-describedby`.
* The admin modals use the native `<dialog>`, which traps focus and returns it to the button that opened it.

---

## 11. Running the Project

### One click (Windows)
Double-click **`start-site.bat`**. It checks for Node.js, runs `npm install` and builds the frontend
**only on the first run**, then starts the server and opens `http://localhost:3001/#/`.
After editing anything in `frontend/src`, rebuild before restarting (see below).

### Production (single server)
```powershell
npm.cmd --prefix frontend run build   # → frontend/dist
npm.cmd --prefix server start         # → http://localhost:3001 (site + API)
```

### Development (two processes)
```powershell
npm.cmd --prefix server run dev       # API on :3001, restarts on change
npm.cmd --prefix frontend run dev     # Vite on :5173, proxies /api → :3001
```
Open `http://localhost:5173/#/`.

### Environment variables
| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3001` | server port |
| `ADMIN_EMAIL` | `admin@doubleh.com` | admin seeded on startup if that email isn't in the database yet |
| `ADMIN_PASSWORD` | `Admin123!` | password for that seeded admin |

⚠️ The seed only **adds** an admin. If the demo `admin@doubleh.com` account already exists, setting new
variables leaves it in place with the demo password. For production, either start with a fresh
database with the variables set, or delete the demo row from `admins`.

### Notes for this machine
* Use **`npm.cmd`** in PowerShell (the execution policy blocks `npm.ps1`).
* The `esbuild` postinstall script is allowed in `frontend/package.json` (`allowScripts`).

---

## 12. Production Checklist

- [ ] Replace the demo admin (see §11) and the placeholder phone and address in `server/index.js`
- [ ] Serve over HTTPS behind a reverse proxy, and set Express `trust proxy` so rate limits see real client IPs
- [ ] Move sessions and rate limits to a shared store if running more than one instance
- [ ] Back up `server/data/doubleh.db` daily
- [ ] Add automated tests (API + end-to-end)

---

## 13. Verification Log (2026-10-05)

| Check | Result |
|-------|--------|
| `vite build` | ✅ no errors (main bundle 312 KB, 97 KB gzipped) |
| Browser console on Home / Contact / Admin | ✅ no errors or warnings |
| Certificates and divisions render | ✅ 6 and 9 |
| Typing `/admin`, `/admin/`, `/contact` | ✅ redirects to `#/admin` (login form), `#/admin`, `#/contact` (form) |
| Launcher URL `#/` | ✅ Home, with the "Home" nav link active |
| EN → AR switch | ✅ `dir=rtl`, Arabic title and nav; switching back restores English |
| Phone width (375 px), Arabic | ✅ no horizontal overflow |
| Malformed JSON / 60 KB body to `/api/contact` | ✅ `400` / `413` (previously `500`) |
| Admin API without a token | ✅ `401` |
| Every translation key used by the UI exists in both EN and AR | ✅ |
