# Double H Consulting — React Full-Stack Platform

Corporate site rebuilt with **React 19 + Vite** frontend and **Node.js + Express + SQLite** backend.
The consultation booking flow has been removed — the **Home page now presents the company**, its
**American certificates**, and a positive description of the firm. Languages: **English / Arabic** only (RTL-ready).

📘 **Full documentation: [DOCUMENTATION.md](DOCUMENTATION.md)** — architecture, routes, API, database, brand assets, work log and verification results.

## What's new vs the old build
| | Old (legacy) | New (current) |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | **React 19 + Vite** (`frontend/`) |
| Backend | ASP.NET Core 6 | **Node.js + Express** (`server/`) |
| Database | SQL Server schema | **SQLite** via built-in `node:sqlite` (`server/data/doubleh.db`) |
| Pages | Home, Categories, Request, Consultants, Contact, Admin | **Home (company + certificates), Contact, Admin** |
| Languages | AR/TR/EN/FR | **EN / AR only** — compact `EN · AR` toggle |
| Consultation | Full page flow | **Modal on Home** — first consultation free (once per client: email OR phone; Rejected ignored) |
| Icons / cursor | Emoji icons, custom crosshair cursor | **Thin SVG line icons**, native cursor (removed custom cursor, hero blobs & grid background) |
| Logo | CSS "H" mark + text | **Official PDF wordmark** (nav + favicon) |

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
Open **http://localhost:5173/**

## Run it (production — single port)

```powershell
cd frontend && npm run build     # → frontend/dist
cd ../server && npm start        # → http://localhost:3001 (serves the React build + API)
```

## Home page content
- **Hero** — clean background (no blobs/grid), company intro, "First Consultation Free" badge, animated stats (18+ years, 450+ projects, 300+ clients, 8 divisions)
- **Book a Consultation** — buttons in nav, hero and CTA band open a modal form (name/email/phone/note);
  the API marks the **first request per client as FREE** (email OR phone match, Rejected ignored)
- **About** — positive description of Double H Consulting (integrity, senior experts, on-time delivery, people-first)
- **American certificates** — PE, ISO 9001, LEED AP, OSHA, PMP, Autodesk Certified Professional (from `GET /api/certificates`)
- **Values** — "Positive by design" section
- **Divisions** — Architecture / Civil / Medical / Law / Electricity / Management / BD
- **CTA** → consultation modal only (no footer on the site)

## Pages & routes (HashRouter)
- `#/` — company presentation (toggle `EN` / `AR`; `ar` switches `dir="rtl"` automatically)
- `#/contact` — contact info + inquiry form (validated, honeypot, rate-limited 5/10 min); direct URL only, no nav link
- `#/admin` — **hidden** admin: **Consultations** (status select, CSV export), Messages, Audit log.
  No link/button exists anywhere in the UI — type **`/admin`** (or `#/admin`) directly in the address bar

## API
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | health check |
| GET | `/api/company` | — | company info + stats |
| GET | `/api/certificates` | — | American certificates list |
| POST | `/api/consultations` | — | consultation request → **first one free** (rate-limited) |
| POST | `/api/contact` | — | save contact message (rate-limited) |
| POST | `/api/admin/login` | — | get bearer token (PBKDF2 verify) |
| POST | `/api/admin/logout` | Bearer | invalidate token |
| GET | `/api/admin/messages` | Bearer | list messages + stats |
| PATCH | `/api/admin/messages/:id` | Bearer | set status New/Handled |
| GET | `/api/admin/consultations` | Bearer | list consultations + stats (total/new/free) |
| PATCH | `/api/admin/consultations/:id` | Bearer | set status New→…→Rejected |
| GET | `/api/admin/audit` | Bearer | audit trail |

**Demo admin:** `admin@doubleh.com` / `Admin123!` (seeded on first run — change in production).

## Brand (from your documentation)
- Palette: `#12393a` `#134c4b` `#e6ecec` `#46766f` `#161919`
- Fonts: **Cairo** (headings/AR) · **Poppins** (body) — loaded from Google Fonts
- Logo: official **Double H Logos.pdf** wordmark — dark PNG in nav, `H`-glyph favicon; sub-line `— CONSULTANT —`
- Effects: scroll progress bar, hero parallax, 3D word-scroll titles/descriptions, reveal-on-scroll (staggered cards), 3D card tilt, compact sticky nav, back-to-top, marquee, badge pulse, CTA sheen (custom cursor, hero blobs & grid background removed; no footer)

## Structure
```
frontend/               → React app (Vite)
  index.html
  src/main.jsx          → entry (HashRouter + LangProvider)
  src/App.jsx           → nav (EN/AR toggle), counters, routes, modal trigger
  src/ConsultModal.jsx  → booking modal (first consultation free)
  src/Icon.jsx          → thin SVG line icons (replaces emoji)
  src/i18n.js           → EN + AR dictionary
  src/LangContext.jsx   → language state + RTL switching (persists to localStorage)
  src/pages/Home.jsx    → company + certificates + values
  src/pages/Contact.jsx → inquiry form → POST /api/contact
  src/pages/Admin.jsx   → hidden dashboard: consultations / messages / audit
  src/styles.css        → brand theme + animations + RTL (cursor/blobs/grid removed)
server/                 → Express API
  index.js              → routes, rate limit, sessions, free-first logic, static serving
  db.js                 → SQLite (node:sqlite) + PBKDF2 admin seed + consultation queries
  data/doubleh.db       → created automatically on first run
legacy/                 → old vanilla + .NET files kept for reference
README.md
```

## Notes
- Node.js LTS (v24) required — installed via winget if missing.
- SQLite uses Node's built-in `node:sqlite` — **no native modules, no SQL Server needed**.
- Security: rate limiting (per IP), honeypot, input validation, PBKDF2 password hashing,
  bearer tokens with expiry, security headers, parameterized queries.
- Production checklist: HTTPS, real secrets via env, change demo admin password, daily DB backups.
