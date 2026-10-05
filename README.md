# Double H Consulting — React Full-Stack Platform

Corporate site rebuilt with **React 19 + Vite** frontend and **Node.js + Express + SQLite** backend.
The consultation booking flow has been removed — the **Home page now presents the company**, its
**American certificates**, and a positive description of the firm. 4 languages (AR/TR/EN/FR, RTL-ready).

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
- `#/en/home` — company presentation (also `ar`, `tr`, `fr`; `ar` switches `dir="rtl"` automatically)
- `#/en/contact` — contact info + inquiry form (validated, honeypot, rate-limited 5/10 min)
- `#/en/admin` — hidden admin (footer "Admin" link only): messages, KPIs, mark-handled, audit log

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

**Demo admin:** `admin@doubleh.com` / `Admin123!` (seeded on first run — change in production).

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
  src/i18n.js           → 4-language dictionary (AR/TR/EN/FR)
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
- Security: rate limiting (per IP), honeypot, input validation, PBKDF2 password hashing,
  bearer tokens with expiry, security headers, parameterized queries.
- Production checklist: HTTPS, real secrets via env, set a strong admin password via `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars (used on first run), daily DB backups.
