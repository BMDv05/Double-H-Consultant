# Double H Consulting — React Full-Stack Platform

Corporate site rebuilt with a **React 19 + Vite** frontend and a **Node.js + Express + SQLite** backend.
The consultation booking flow has been removed. The **Home page presents the company**, its
**American certificates** and its divisions, and every "Claim My Free Call" button leads to the Contact page.
English and Arabic, with RTL support.

Full reference: [DOCUMENTATION.md](DOCUMENTATION.md).

## What's new vs the old build
| | Old (legacy) | New (current) |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | **React 19 + Vite** (`frontend/`) |
| Backend | ASP.NET Core 6 | **Node.js + Express** (`server/`) |
| Database | SQL Server schema | **SQLite** via built-in `node:sqlite` (`server/data/doubleh.db`) |
| Pages | Home, Categories, Request, Consultants, Contact, Admin | **Home (company + certificates), Contact, Admin** |
| Consultation flow | ✅ present | ❌ removed (per requirements) |

## Run it (one click, Windows)
Double-click **`start-site.bat`**. On the first run it installs dependencies and builds the frontend,
then it starts the server and opens **http://localhost:3001/#/**.
It does not rebuild on later runs, so after editing `frontend/src` run the build command below first.

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
Open **http://localhost:5173/#/**

## Run it (production — single port)

```powershell
npm.cmd --prefix frontend run build   # → frontend/dist
npm.cmd --prefix server start         # → http://localhost:3001 (serves the React build + API)
```

## Home page content
- **Hero** — company intro, "Claim My Free Call" + "Discover our story", animated stats (18+ years, 450+ projects, 300+ clients, 9 divisions)
- **Free-call offer** — card linking to the Contact page
- **About** — American standards, senior experts, on-time and on-budget, people first
- **American certificates** — PE, ISO 9001, LEED AP, OSHA, PMP, Autodesk Certified Professional (from `GET /api/certificates`)
- **Values** — "Positive by design" section
- **Divisions** — BIM / Architecture / Civil / Medical / Law / Electricity / Management / BD / Startups
- **CTA** → Contact page

## Pages & routes (HashRouter)
- `#/` — company presentation; the EN / AR switch updates the language and writing direction
- `#/contact` — contact info + inquiry form (validated, honeypot, rate-limited 5/10 min)
- `#/admin` — hidden admin dashboard (no link in the UI): messages, KPIs, processing status, audit log

Typing a path without the `#` also works: `/admin` opens `#/admin` and `/contact` opens `#/contact`.

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

Errors are JSON `{ "error": "…" }`: `400` invalid input or malformed JSON, `401` not signed in,
`404` unknown message, `413` body over 50 KB, `429` rate limit, `500` server error.

**Demo admin:** `admin@doubleh.com` / `Admin123!` (seeded on first run — replace before production, see Notes).

## Admin requests — acceptance criteria
| # | Criterion | How it is met |
|---|---|---|
| 1 | Admin can see **all** requests | `GET /api/admin/messages` (Bearer) returns newest-first list + KPIs (Total / Not Processed / Processed) |
| 2 | Admin can **open a request and see full client details** | "Details" button → `GET /api/admin/messages/:id` opens a modal with client name, email, language, received date, status and the full message |
| 3 | Admin can mark a request **Processed / Not Processed** | `PATCH /api/admin/messages/:id` `{status}` (validated against the DB `CHECK` constraint) — toggle from the table row or the details modal; both directions |
| 4 | Admin can **search / filter** | Text search over name, email, subject and message + status dropdown filter (client-side, instant); server also supports `?q=&status=` |
| 5 | Admin can **delete with confirmation** | Delete button opens a confirm dialog (shows the request preview); only "Yes, delete" calls `DELETE /api/admin/messages/:id`; Esc / backdrop / Cancel abort |
| 6 | **Only the authorized admin** can view / edit / delete | Every admin route is behind `requireAuth` (PBKDF2 login → bearer token, 8 h expiry) — unauthenticated calls get `401`; logins, logouts, status changes and deletions are written to the audit log (opening details is not) |

Status values: `Not Processed` (default) / `Processed` — enforced by SQLite `CHECK`; legacy `New`/`Handled` rows are migrated automatically on first run.

## Brand (from your documentation)
- Palette: `#12393a` `#134c4b` `#e6ecec` `#46766f` `#161919`
- Fonts: **Cairo** (headings/AR) · **Poppins** (body) — loaded from Google Fonts
- Logo: **Double H — CONSULTING** wordmark (`frontend/public/logo-dark.png`), also used as the favicon

## Structure
```
frontend/               → React app (Vite)
  index.html
  public/               → logo-dark.png (nav + favicon), logo-light.png (unused)
  src/main.jsx          → entry: typed-path → hash redirect, HashRouter + LangProvider
  src/App.jsx           → nav, language switch, scroll effects, counters, routes, footer
  src/i18n.js           → EN + AR dictionaries
  src/LangContext.jsx   → language state + RTL switching (persists to localStorage)
  src/icons.jsx         → lucide-react icon set
  src/Modal.jsx         → native <dialog> wrapper for the admin modals
  src/pages/Home.jsx    → company + certificates + values + divisions
  src/pages/Contact.jsx → inquiry form → POST /api/contact
  src/pages/Admin.jsx   → hidden dashboard (Bearer auth)
  src/styles.css        → brand theme + animations + RTL
server/                 → Express API
  index.js              → routes, rate limit, sessions, error handler, static serving
  db.js                 → SQLite (node:sqlite) + PBKDF2 admin seed
  data/doubleh.db       → created automatically on first run
legacy/                 → old vanilla + .NET files kept for reference
start-site.bat          → one-click launcher (Windows)
```

## Notes
- Node.js 24 LTS required (the server uses the built-in `node:sqlite` module).
- SQLite uses Node's built-in `node:sqlite` — **no native modules, no SQL Server needed**.
- Security: rate limiting (per IP), honeypot, input validation, PBKDF2 password hashing,
  bearer tokens with expiry, security headers, parameterized queries.
- Admin sessions are kept in memory, so restarting the server signs admins out.
- Production checklist: HTTPS, daily DB backups, and replace the placeholder phone and address in `server/index.js`.
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` only **add** an admin when that email isn't in the database yet; they never change
  an existing password. If the demo `admin@doubleh.com` row already exists, start from a fresh database with the
  variables set, or delete that row.

## UI and accessibility

The interface uses only the five brand colors (#12393a, #134c4b, #e6ecec, #46766f, #161919), including transparent blends. Lucide React provides the shared icon family. The EN / AR language control is a 120 × 52 px switch with a sliding rounded highlight whose order stays stable in RTL.

Section headings and content fade in as they enter view, including asynchronously fetched certificate rows. Reduced-motion preferences disable transitions, scroll animation, and animated counters. CTAs open the contact page directly. Keyboard users have a skip link, a dismissible mobile menu, linked form labels, inline errors, and native modal focus containment/restoration. Contact submission preserves input after failure, times out after 15 seconds, and prevents simultaneous duplicate submissions.

After UI changes, build with `npm.cmd --prefix frontend run build`, then restart the server.
