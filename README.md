# Double H Consulting

Responsive company website for Double H Consulting, built with React and Vite and served with an Express API. The API stores contact inquiries and admin audit events in SQLite. The old vanilla and ASP.NET implementation remains under `legacy/` for reference; it is not part of the current runtime.

## Stack

- React 19, Vite 6, React Router 6 (`HashRouter`)
- Node.js 24, Express 5
- SQLite through Node's built-in `node:sqlite`
- English and Arabic, including RTL layout

## Requirements

- Node.js 24 or later
- npm

## Start the site

### Windows launcher

Run `start-site.bat`. It installs missing dependencies, builds the frontend if its production output is missing, opens `http://localhost:3001`, and starts the Express server. Keep the terminal open while using the site. Rebuild the frontend after changing its source files.

### Development mode

Start the API in one PowerShell terminal:

```powershell
npm.cmd --prefix server install
npm.cmd --prefix server run dev
```

Start Vite in another:

```powershell
npm.cmd --prefix frontend install
npm.cmd --prefix frontend run dev
```

Open `http://localhost:5173/#/`. Vite proxies `/api` requests to the API at `http://localhost:3001`.

### Production-style local run

```powershell
npm.cmd --prefix frontend install
npm.cmd --prefix frontend run build
npm.cmd --prefix server install
npm.cmd --prefix server start
```

Express serves `frontend/dist` and the API from port `3001` by default. Set `PORT` to use a different port.

## Pages

| Route | Page |
| --- | --- |
| `#/` | Home: company introduction, statistics, certificates, values and divisions |
| `#/contact` | Contact details and inquiry form |
| `#/admin` | Hidden admin sign-in, inquiry management and audit log |

The language switch supports EN and AR; Arabic uses RTL direction. Language is persisted in `localStorage['dh-lang']`. Typed paths such as `/admin` are redirected to their hash routes on startup.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/company` | Company contact details and statistics |
| `GET` | `/api/certificates` | Certificates and accreditations |
| `POST` | `/api/contact` | Validate and store an inquiry |
| `POST` | `/api/admin/login` | Authenticate and issue a bearer token |
| `POST` | `/api/admin/logout` | Invalidate the bearer token |
| `GET` | `/api/admin/messages` | List inquiries and totals (`?q=`, `?status=`) |
| `GET` | `/api/admin/messages/:id` | Read one inquiry |
| `PATCH` | `/api/admin/messages/:id` | Set status to `Not Processed` or `Processed` |
| `DELETE` | `/api/admin/messages/:id` | Delete an inquiry |
| `GET` | `/api/admin/audit` | Read recent audit events |

Admin routes except login require `Authorization: Bearer <token>`. See [DOCUMENTATION.md](DOCUMENTATION.md) for request schemas, data storage, security controls and deployment notes.

## Admin account and local data

On a fresh development database, the default account is `admin@doubleh.com` / `Admin123!`. In production, the server generates and logs a one-time random password if `ADMIN_PASSWORD` is unset, or uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` provided before the first run. Seeding only creates an account when that email does not already exist; changing environment values does not replace an existing row.

SQLite creates `server/data/doubleh.db` at startup. This runtime data is ignored by Git. Back it up before deployment or database maintenance.

## Project map

```text
frontend/                   React/Vite client
  src/App.jsx                Shared layout, navigation, routes and motion
  src/pages/Home.jsx         Company home page and content sections
  src/pages/Contact.jsx      Inquiry form
  src/pages/Admin.jsx        Admin dashboard
  src/DivisionCarousel.jsx   Division showcase carousel
  src/WorldDots.jsx          Decorative dot-map visual
  src/Modal.jsx              Accessible native-dialog wrapper
  src/i18n.js                English and Arabic dictionaries
  src/styles.css             Brand palette, responsive layout, motion and RTL
  public/                    Logos, photos and scroll-motion helper
server/                     Express API and SQLite persistence
  index.js                   Routes, security headers, sessions and static serving
  db.js                      Schema, migrations, seed and persistence queries
legacy/                     Archived implementation; not served by current app
start-site.bat               Windows setup/build/start launcher
DOCUMENTATION.md             Full technical guide
```

## Deployment checklist

- Set `NODE_ENV=production` and configure the admin email/password before the first database seed.
- Replace placeholder phone and location values in `server/index.js`.
- Serve the application over HTTPS. If a reverse proxy is used, set `TRUST_PROXY` to its hop count.
- Back up `server/data/doubleh.db` regularly.
- Sessions and rate-limit counters are held in process memory. Restarts invalidate sessions, and multi-instance deployments need a shared session/rate-limit store.
