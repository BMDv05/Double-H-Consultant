# Double H Consulting — Project Documentation

> **ملخص بالعربية:** موقع شركة (Frontend + Backend) مبني بـ React و Express مع قاعدة بيانات SQLite.
> الصفحة الرئيسية تعرّف بالشركة وشهاداتها الأمريكية، وفيه زر «احجز استشارة» يفتح نافذة طلب
> **الأولى منها مجانية** لكل عميل. اللغتان **English / Arabic** فقط (تبديل `EN | AR` مع دعم RTL).
> لوحة الإدارة مخفية: تُفتح بكتابة `/admin` في شريط العنوان مباشرة (لا يوجد أي زر لها بالموقع).

---

## 1. Overview

Full-stack rebuild of the Double H Consulting company site.

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19 · Vite 6 · react-router-dom 6 (**HashRouter**) |
| Backend    | Node.js 24 · Express 5 |
| Database   | **SQLite** via built-in `node:sqlite` (zero native dependencies) |
| Languages  | English + Arabic only (RTL-ready) |
| Deployment | Express serves the built SPA + API from one origin (`:3001`) |

The original vanilla-HTML + ASP.NET files are preserved under `legacy/` for reference only —
nothing in the current app depends on them.

---

## 2. Project Structure

```
Consultation_Project/
├── frontend/                  → React app (Vite)
│   ├── index.html             → meta, Google Fonts, favicon (/favicon.png)
│   ├── public/favicon.png     → "H" glyph from the official logo on brand square
│   └── src/
│       ├── main.jsx           → entry: HashRouter + LangProvider + /admin URL redirect
│       ├── App.jsx            → nav, scroll FX, counters, routes, modal host
│       ├── ConsultModal.jsx   → booking modal (first-consultation-free logic)
│       ├── Icon.jsx           → thin SVG line-icon set (replaces all emoji icons)
│       ├── i18n.js            → EN + AR dictionaries (fallback to EN on missing keys)
│       ├── LangContext.jsx    → language state, dir=rtl/ltr, title, localStorage 'dh-lang'
│       ├── styles.css         → brand theme, animations, RTL overrides
│       ├── assets/
│       │   ├── logo-dark.png  → official wordmark (dark) — used in nav
│       │   └── logo-light.png → official wordmark (white) — kept in assets, currently unused
│       └── pages/
│           ├── Home.jsx       → company presentation + certificates + divisions + CTA
│           ├── Contact.jsx    → contact info + inquiry form
│           └── Admin.jsx      → hidden dashboard: consultations / messages / audit
├── server/                    → Express API
│   ├── index.js               → routes, rate limits, sessions, static SPA serving
│   ├── db.js                  → SQLite schema, queries, PBKDF2 admin seed, audit log
│   └── data/doubleh.db        → auto-created on first run
├── legacy/                    → original vanilla + .NET files (reference only)
├── README.md                  → quick start + API summary
└── DOCUMENTATION.md           → this file
```

---

## 3. Pages & Routes

Routing is **hash-based** (`#/…`), so any static host works without server rewrites.

| Route        | Page    | Notes |
|--------------|---------|-------|
| `#/`         | Home    | Plain single-column hero, company intro, American certificates, values, 8 divisions (incl. BIM), CTA (no footer) |
| `#/contact`  | Contact | Contact cards + validated inquiry form — direct URL only, no nav link |
| `#/admin`    | Admin   | **Hidden** — no visible link anywhere in the UI |

### Hidden admin access
* Type **`/admin`** or **`/admin/`** in the address bar → the app redirects to `#/admin` and shows the login form.
  (Implemented in `frontend/src/main.jsx`; the Express catch-all serves `index.html` for every non-`/api` path.)
* The footer admin link was **removed** on request — there is no button/link to the admin area in the UI.
* Logout lives inside the dashboard sidebar (`⏻ Log out`).

---

## 4. Home Page Content

1. **Hero** — clean background (no blobs, no grid, no custom cursor):
   * Badge «First Consultation Free»
   * Title `Double H Consulting` (the `H × H` accent was removed)
   * Description + animated counters (18+ years · 450+ projects · 300+ clients · 8 divisions)
   * Single CTA **Book a Consultation** (the «Talk to us» button was removed)
2. **Marquee** — division names ticker
3. **About** — positive company description (integrity, senior experts, on-time delivery, people-first)
4. **American certificates & accreditations** — PE, ISO 9001, LEED AP, OSHA, PMP, Autodesk (from `GET /api/certificates`)
5. **Values** — “Positive by design”
6. **Divisions** — Architecture / BIM / Civil / Medical / Law / Electricity / Management / BD (SVG line icons)
7. **CTA band** — badge + single **Book a Consultation** button (the «Get in touch» button was removed)

---

## 5. Consultation Flow (First One Free)

`Book a Consultation` buttons (nav · hero · hero card · CTA band) open a modal
(`ConsultModal.jsx`) with: Full name · Email · Phone · Note.

### Free-first rule (server-side, `POST /api/consultations`)
* A request is marked **FREE** when there is **no previous consultation** with the same
  **email OR phone** (case-insensitive email, digits-only phone).
* Consultations with status `Rejected` are **ignored** so the client may retry.
* Any other match → the request is stored as **standard (paid)**.
* Response: `{ ok, id, isFirstFree, status:"New" }` — the modal shows
  “Your first consultation is FREE” or “Standard consultation”.

### Anti-abuse
* Honeypot field (bots silently accepted, nothing stored)
* Rate limit **5 requests / 10 min / IP** (server) + same limit client-side
* Validation: name ≥ 2, valid email, phone `+? digits ( ) -` 7–18 chars, note 10–2000 chars

---

## 6. Contact Form

`POST /api/contact` → stored in `messages` with status `New`.
Same protections: honeypot, **5 / 10 min / IP**, field validation (message 10–3000 chars).

---

## 7. Admin Dashboard

### Endpoints (all require `Authorization: Bearer <token>`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST   | `/api/admin/login` | `{email,password}` → `{token}` (8 h TTL), rate-limited 10/15 min |
| POST   | `/api/admin/logout` | invalidate current token |
| GET    | `/api/admin/consultations` | list + stats `{total, new, free}`, supports `?status=&q=` |
| PATCH  | `/api/admin/consultations/:id` | set status: New · Contacted · Scheduled · Completed · Cancelled · Rejected |
| GET    | `/api/admin/messages` | list + stats `{total, new, handled}` |
| PATCH  | `/api/admin/messages/:id` | `New` → `Handled` |
| GET    | `/api/admin/audit` | last 50 audit entries |

### UI tabs
* **Consultations** — KPIs (Total / New / Free), search, status dropdown per row, **Export CSV**
* **Messages** — KPIs, search, “Mark handled”
* **Audit log** — actor · action · entity · time

### Credentials
Demo admin is seeded automatically on first run:
```
admin@doubleh.com  /  Admin123!
```
⚠️ **Change this before any production deployment.**

---

## 8. Public API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET  | `/api/health` | health check |
| GET  | `/api/company` | name, contact info, stats |
| GET  | `/api/certificates` | American certificates list (6 items) |
| POST | `/api/consultations` | consultation request → first one free |
| POST | `/api/contact` | contact message |

All responses are JSON; errors return `{ error: "message" }` with an appropriate status code.

---

## 9. Database (SQLite)

Auto-created at `server/data/doubleh.db` on first run (`server/db.js`).

| Table          | Purpose |
|----------------|---------|
| `admins`       | email + PBKDF2 salt/hash (210 000 iterations, SHA-256) |
| `consultations`| full_name, email, phone, phone_digits, note, lang, `is_first_free`, status, created_at |
| `messages`     | name, email, subject, message, lang, status (`New`/`Handled`), created_at |
| `audit_logs`   | actor, action, entity, entity_id, created_at |

Indexes: `messages(status)`, `messages(created_at)`, `consultations(email)`, `consultations(phone_digits)`.

### Security measures
* Rate limiting per IP (in-memory, no dependency)
* Honeypot on public forms
* Bearer sessions with expiry + server-side invalidation
* PBKDF2 password hashing
* Audit trail for every admin action and every consultation create (`create-free` / `create-paid`)
* Security headers + `express.json({ limit: '50kb' })`

---

## 10. Internationalization (EN / AR)

* Only **English** and **Arabic** exist (Türkçe / Français were removed on request).
* Toggle in the nav: a compact pill showing **`EN | AR`** — active language highlighted.
* `ar` sets `<html dir="rtl" lang="ar">` automatically; full RTL layout via CSS logical properties.
* Choice persists in `localStorage['dh-lang']`; missing keys fall back to English.
* Consultation/contact requests store the current `lang` so admins see the language used.

---

## 11. Branding & Assets

| Item | Value |
|------|-------|
| Palette | `#12393a` (deep1) · `#134c4b` (deep2) · `#e6ecec` (mist) · `#46766f` (sage) · `#161919` (ink) |
| Fonts | **Cairo** (headings/AR) · **Poppins** (body) — Google Fonts |
| Logo | Extracted from the official **Double H Logos.pdf**: wordmark cropped to a transparent PNG in two variants |

Logo usage:
* `logo-dark.png` → navigation bar (38 px height)
* `logo-light.png` → kept in assets, currently unused (footer + intro splash removed)
* `public/favicon.png` → the distinctive **H** glyph on a brand-colored rounded square
* Sub-line under the wordmark: `— CONSULTANT —` / `— استشاري —`

**Removed on request:** emoji icons (→ thin SVG line icons), custom crosshair cursor,
animated green blobs, background grid squares, `H × H` hero accent,
«Talk to us» / «Get in touch» buttons, footer admin button, the whole footer bar,
the Contact nav link (page still reachable by direct `#/contact` URL),
the certificates "renewed on schedule" notice, the hero-card division list
(replaced by the hero magnifier, later removed entirely with the magnifier), and the full-screen intro overlay.

---

## 12. Visual Effects & Animation

Plain single-column hero (the 3D magnifier experiment was removed on request).

**Scroll-driven motion**
- Slim glowing scroll-progress bar (top) that fills as you read.
- Hero content parallax (`data-par`) — the hero text lags gently behind the scroll.
- 3D word-scroll titles & descriptions (`Words.jsx` + `.w3d`): every section
  title and every descriptive paragraph (About text, Certificates, Values,
  Divisions, CTA, Contact header) flips in word-by-word in 3D
  (`rotateX(82°) → 0` with a per-word stagger) instead of sitting as static
  text. The About left-column paragraphs use it instead of a plain description.
- Reveal-on-scroll on every eyebrow, card, and info row (staggered per group
  via the `--d` CSS variable).
- The eyebrow line draws itself in (scaleX) when its section enters the view.
- Sticky nav compacts + gains a shadow after 24px of scroll.
- "Back to top" button fades in past 600px.
- Hero scroll cue (bouncing chevron) fades out as soon as you scroll.
- `IntersectionObserver` in `App.jsx` (`ScrollFX`) drives all of the above,
  backed by a synchronous rect check on every scroll (so reveals never lag,
  even if animation frames are throttled) and a `MutationObserver` that picks
  up targets rendered later (e.g. fetched certificates).

**Ambient motion in empty space**
- Decorative dashed/solid rings, rotating rounded squares, and pulsing dot
  triplets placed in the empty corners of each section (`<i class="orn">`).
  They rotate, float, and pulse slowly; hidden below 900px viewport width so
  they never collide with text.
- Marquee band, CTA band light sweep, pulsing "First Consultation Free" badge.

**Pointer motion**
- 3D tilt on cards / feature points / contact cards (`--rx`, `--ry` custom
  properties set by a delegated `mousemove` listener — works for dynamically
  rendered certificate cards too), combined with the existing lift +
  top-border draw + pill invert on hover.
- Button shine sweep, icon-line pop + tilt on hover.

**Other**
- Staggered hero entrance · animated counters · modal open/close animations.
- `prefers-reduced-motion: reduce` disables all of it: CSS animations and
  transitions collapse to 0.01ms, smooth scrolling becomes instant, and the
  JS side skips parallax and tilt entirely.

---

## 13. Running the Project

### Production (single server)
```powershell
# 1) build the frontend
cd frontend
npm.cmd run build

# 2) start the API + static site
cd ../server
npm.cmd start
# → http://localhost:3001        (site)
# → http://localhost:3001/api/health
# → http://localhost:3001/admin  (redirects to the admin login)
```

### Development (two processes)
```powershell
# terminal 1 — API on :3001
cd server
npm.cmd start

# terminal 2 — Vite on :5173 (proxies /api → :3001)
cd frontend
npm.cmd run dev
```

### Notes for this machine
* Use **`npm.cmd`** in PowerShell (execution policy blocks `npm.ps1`).
* Refresh the PATH in a new shell after installing Node:
  `[Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`
* `esbuild` postinstall was approved once via `npm approve-scripts esbuild`.

---

## 14. Verification Log

| Check | Result |
|-------|--------|
| `vite build` | ✅ ~2 s, no errors |
| Browser console | ✅ 0 errors, 0 warnings |
| Hero: blobs / grid / cursor / emoji | ✅ 0 / 0 / 0 / 0 |
| SVG line icons on home | ✅ 22 |
| Language toggle | ✅ `EN` `AR` only; `ar` → `dir=rtl` + Arabic title |
| Free-first logic | ✅ 1st request free · same email paid · same phone paid |
| Admin via footer link | ✅ removed (no links in footer) |
| Typing `/admin` | ✅ redirects → `#/admin` → login form → dashboard |
| Typing `/admin/` | ✅ same redirect |
| Admin login + status patch + CSV | ✅ works |
| Contact form → SQLite | ✅ end-to-end |
| API health / certificates / SPA routes | ✅ 200 |

---

## 15. Production Hardening TODO

- [ ] Change the demo admin password (and consider env-based secrets)
- [ ] Serve over HTTPS
- [ ] Move rate limiting to a shared store if scaling to multiple instances
- [ ] Add automated tests (API + E2E)
- [ ] Optional: daily DB backups of `server/data/doubleh.db`
