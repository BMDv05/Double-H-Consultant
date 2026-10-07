# Double H Consulting — React Full-Stack Platform

Corporate site rebuilt with **React 19 + Vite** frontend and **Node.js + Express + SQLite** backend.
The consultation booking flow has been removed — the **Home page now presents the company**, its
**American certificates**, and a positive description of the firm. 2 languages (AR/EN, RTL-ready).

## What's new vs the old build
| | Old (legacy) | New (current) |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | **React 19 + Vite** (`frontend/`) |
| Backend | ASP.NET Core 6 | **Node.js + Express** (`server/`) |
| Database | SQL Server schema | **SQLite** via built-in `node:sqlite` (`server/data/doubleh.db`) |
| Pages | Home, Categories, Request, Consultants, Contact, Admin | **Home (company + certificates), Contact, Admin** |
| Consultation flow | ✅ present | ❌ removed (per requirements) |

## Run it (development — two terminals)

```powershell
# 1) API  → http://localhost:3001
cd server
npm install
npm run dev

# 2) React → http://localhost:5173  (proxies /api to :3001)
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173/#/en/home**

## Run it (production — single port)

```powershell
cd frontend && npm run build     # → frontend/dist
cd ../server && npm start        # → http://localhost:3001 (serves the React build + API)
```

## Home page content
- **Hero** — company intro, animated stats (18+ years, 450+ projects, 300+ clients, 8 divisions)
- **About** — positive description of Double H Consulting (integrity, senior experts, on-time delivery, people-first)
- **American certificates** — PE, ISO 9001, LEED AP, OSHA, PMP, Autodesk Certified Professional (from `GET /api/certificates`)
- **Values** — "Positive by design" section
- **Divisions** — Architecture / Civil / BIM / Medical / Law / Electricity / Management / BD
- **CTA** → Contact page

## Pages & routes (HashRouter)
- `#/` — company presentation (language switcher in the nav: **AR / EN**; AR switches `dir="rtl"` automatically)
- `#/contact` — contact info + inquiry form (validated, honeypot, rate-limited 5/10 min)
- `#/admin` — hidden admin (footer "Admin" link only): messages, KPIs, mark-handled, audit log

> There is **no language segment in the URL** — the language lives in `localStorage` (`dh-lang`).

## API
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | health check |
| GET | `/api/company` | — | company info + stats |
| GET | `/api/certificates` | — | American certificates list |
| POST | `/api/contact` | — | save contact message (rate-limited) |
| POST | `/api/admin/login` | — | get bearer token (PBKDF2 verify) |
| POST | `/api/admin/logout` | Bearer | invalidate token |
| GET | `/api/admin/messages` | Bearer | list requests + stats (`?q=` `?status=`) |
| GET | `/api/admin/messages/:id` | Bearer | single request with full client details |
| PATCH | `/api/admin/messages/:id` | Bearer | set status `Not Processed` / `Processed` |
| DELETE | `/api/admin/messages/:id` | Bearer | delete a request (audit-logged) |
| GET | `/api/admin/audit` | Bearer | audit trail |

**Admin sign-in:** development seeds `admin@doubleh.com` / `Admin123!` (local only).
With `NODE_ENV=production` a **random password is generated and printed once** on the first
run, or set `ADMIN_EMAIL` / `ADMIN_PASSWORD` yourself — see `.env.example`.
Failed logins always return the generic `Invalid email or password.` (no credential hints).

## Admin requests — acceptance criteria
| # | Criterion | How it is met |
|---|---|---|
| 1 | Admin can see **all** requests | `GET /api/admin/messages` (Bearer) returns newest-first list + KPIs (Total / Not Processed / Processed) |
| 2 | Admin can **open a request and see full client details** | "Details" button → `GET /api/admin/messages/:id` opens a modal with client name, email, language, received date, status and the full message |
| 3 | Admin can mark a request **Processed / Not Processed** | `PATCH /api/admin/messages/:id` `{status}` (validated against the DB `CHECK` constraint) — toggle from the table row or the details modal; both directions |
| 4 | Admin can **search / filter** | Text search over name, email, subject and message + status dropdown filter (client-side, instant); server also supports `?q=&status=` |
| 5 | Admin can **delete with confirmation** | Delete button opens a confirm dialog (shows the request preview); only "Yes, delete" calls `DELETE /api/admin/messages/:id`; Esc / backdrop / Cancel abort |
| 6 | **Only the authorized admin** can view / edit / delete | Every admin route is behind `requireAuth` (PBKDF2 login → bearer token, 8 h expiry) — unauthenticated calls get `401`; all view/status/delete actions are written to the audit log |

Status values: `Not Processed` (default) / `Processed` — enforced by SQLite `CHECK`; legacy `New`/`Handled` rows are migrated automatically on first run.

## Brand (from your documentation)
- Palette: `#12393a` `#134c4b` `#e6ecec` `#46766f` `#161919`
- Fonts: **Cairo** (headings/AR) · **Poppins** (body) — loaded from Google Fonts
- Logo: **Double H — CONSULTING**, custom crosshair cursor, intro splash, scroll reveals, tilt cards, click particles, marquee, parallax hero

## Structure
```
frontend/               → React app (Vite)
  index.html
  src/main.jsx          → entry (HashRouter + LangProvider)
  src/App.jsx           → nav, footer, cursor FX, intro, counters, routes
  src/i18n.js           → bilingual dictionary (AR/EN)
  src/LangContext.jsx   → language state + RTL switching (persists to localStorage)
  src/pages/Home.jsx    → company + certificates + values (consultation removed)
  src/pages/Contact.jsx → inquiry form → POST /api/contact
  src/pages/Admin.jsx   → hidden dashboard (Bearer auth)
  src/styles.css        → brand theme + animations + RTL
server/                 → Express API
  index.js              → routes, rate limit, sessions, static serving
  db.js                 → SQLite (node:sqlite) + PBKDF2 admin seed
  data/doubleh.db       → created automatically on first run
legacy/                 → old vanilla + .NET files kept for reference
README.md
```

## Notes
- Node.js LTS (v24) required — installed via winget if missing.
- SQLite uses Node's built-in `node:sqlite` — **no native modules, no SQL Server needed**.
- `legacy/` is **reference-only**: it is never served by the Express app and uses
  client-side-only demo auth. **Do not deploy it** — real authentication lives in
  `server/index.js` + `server/db.js` (PBKDF2, hashed + salted, bearer tokens).
- Security: per-IP rate limiting (login + contact), honeypot, strict field validation with
  length caps, PBKDF2 password hashing with per-user salt, constant-time compare plus a
  dummy hash on unknown accounts (no user enumeration), bearer tokens with 8 h expiry,
  audit trail, parameterized queries with `LIKE` wildcard escaping.
- Security headers on every response: `Content-Security-Policy`, `X-Content-Type-Options`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy`,
  `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, and HSTS when served over TLS.
- Login failures never reveal which credential was wrong, and no demo credentials ship in
  the API response or the frontend bundle.
- Behind nginx set `TRUST_PROXY=1` so rate limiting keys on the real client IP.
- Production checklist: HTTPS, `NODE_ENV=production` (random admin password on first run
  or `ADMIN_EMAIL` / `ADMIN_PASSWORD` via env — see `.env.example`), daily DB backups.
