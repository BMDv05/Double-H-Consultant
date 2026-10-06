/**
 * Double H Consulting — Express API
 * Public: GET /api/health, GET /api/company, GET /api/certificates, POST /api/contact
 * Admin:  POST /api/admin/login|logout, GET /api/admin/messages, PATCH /api/admin/messages/:id, GET /api/admin/audit
 */
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  verifyAdmin, createMessage, listMessages, getMessage,
  updateMessageStatus, deleteMessage, messageStats, addAudit, recentAudit
} from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '50kb' }));

/* behind nginx / a load balancer set TRUST_PROXY=1 so req.ip (and the rate
   limiter) sees the real client instead of the proxy's address            */
const trustProxy = Number(process.env.TRUST_PROXY || 0);
if (trustProxy > 0) app.set('trust proxy', trustProxy);

/* ---------- security headers ---------- */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  /* React writes inline style attributes; Google Fonts serves the CSS */
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests"
].join('; ');
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

/* ---------- tiny in-memory rate limiter (per IP) ---------- */
const buckets = new Map();
const BUCKET_MAX = 5000;
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    buckets.set(key, arr);
    return false;
  }
  arr.push(now);
  /* drop idle keys so a flood of distinct IPs cannot grow memory forever */
  if (buckets.size > BUCKET_MAX) {
    for (const [k, v] of buckets) {
      if (!v.length || v[v.length - 1] < now - windowMs) buckets.delete(k);
      if (buckets.size <= BUCKET_MAX) break;
    }
  }
  buckets.set(key, arr);
  return true;
}

/* ---------- sessions (admin bearer tokens) ---------- */
const sessions = new Map(); // token -> { email, name, exp }
const TOKEN_TTL = 8 * 60 * 60 * 1000; // 8h
function issueToken(admin) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { email: admin.email, name: admin.name, exp: Date.now() + TOKEN_TTL });
  return token;
}
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const sess = sessions.get(token);
  if (!sess || sess.exp < Date.now()) {
    if (sess) sessions.delete(token);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.admin = sess;
  req.token = token;
  next();
}
setInterval(() => {
  for (const [t, s] of sessions) if (s.exp < Date.now()) sessions.delete(t);
}, 60 * 60 * 1000).unref?.();

/* ---------- validation helpers ---------- */
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || ''));
const str = (v) => String(v ?? '').trim();

/* =======================================================================
 * PUBLIC API
 * ===================================================================== */
app.get('/api/health', (req, res) => res.json({ status: 'healthy', time: new Date().toISOString() }));

app.get('/api/company', (req, res) => {
  res.json({
    name: 'Double H Consulting',
    tagline: 'American standards. Global ambition.',
    email: 'info@doubleh.com',
    phone: '+1 (555) 000-0000',
    address: 'New York, NY — serving clients worldwide',
    stats: { years: 18, projects: 450, clients: 300, divisions: 9 }
  });
});

app.get('/api/certificates', (req, res) => {
  res.json([
    { id: 'pe', name: 'Professional Engineer (PE)', issuer: 'State Boards of Professional Engineering — USA', year: 'Active' },
    { id: 'iso', name: 'ISO 9001 — Quality Management', issuer: 'International / US-accredited registrars', year: 'Certified' },
    { id: 'leed', name: 'LEED Accredited Professional', issuer: 'GBCI — USA', year: 'Certified' },
    { id: 'osha', name: 'OSHA Safety Certification', issuer: 'Occupational Safety and Health Administration — USA', year: 'Active' },
    { id: 'pmp', name: 'PMP — Project Management Professional', issuer: 'Project Management Institute — USA', year: 'Active' },
    { id: 'autodesk', name: 'Autodesk Certified Professional', issuer: 'Autodesk — USA', year: 'Certified' }
  ]);
});

app.post('/api/contact', (req, res) => {
  const ip = req.ip || 'unknown';
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many attempts — try again later.' });
  }
  const name = str(req.body?.name);
  const email = str(req.body?.email);
  const subject = str(req.body?.subject);
  const message = str(req.body?.message);
  const lang = ['ar', 'en'].includes(req.body?.lang) ? req.body.lang : 'en';
  const honeypot = str(req.body?.honeypot);

  if (honeypot) return res.json({ ok: true }); // bot filled hidden field — silently accept
  if (name.length < 2 || name.length > 120) return res.status(400).json({ error: 'Name is required (2–120 chars).' });
  if (!isEmail(email) || email.length > 254) return res.status(400).json({ error: 'A valid email is required.' });
  if (subject.length < 2 || subject.length > 200) return res.status(400).json({ error: 'Subject must be 2–200 characters.' });
  if (message.length < 10 || message.length > 3000) return res.status(400).json({ error: 'Message must be 10–3000 characters.' });

  const id = createMessage({ name, email, subject, message, lang });
  addAudit('public', 'create', 'message', id);
  console.log(`[contact] new message #${id} from ${email}`);
  res.status(201).json({ ok: true, id });
});

/* =======================================================================
 * ADMIN API
 * ===================================================================== */
app.post('/api/admin/login', (req, res) => {
  const ip = req.ip || 'unknown';
  if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many attempts — try again later.' });
  }
  const admin = verifyAdmin(str(req.body?.email), str(req.body?.password));
  /* generic message — never disclose which field is wrong or any demo credentials */
  if (!admin) return res.status(401).json({ error: 'Invalid email or password.' });
  const token = issueToken(admin);
  addAudit(admin.email, 'login', 'admin', admin.email);
  res.json({ token, name: admin.name, email: admin.email });
});

app.post('/api/admin/logout', requireAuth, (req, res) => {
  addAudit(req.admin.email, 'logout', 'admin', req.admin.email);
  sessions.delete(req.token);
  res.json({ ok: true });
});

app.get('/api/admin/messages', requireAuth, (req, res) => {
  const { status = '', q = '' } = req.query;
  res.json({ messages: listMessages({ status: str(status), q: str(q) }), stats: messageStats() });
});

app.patch('/api/admin/messages/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const status = str(req.body?.status);
  if (!['Not Processed', 'Processed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Not Processed or Processed' });
  }
  const msg = getMessage(id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  updateMessageStatus(id, status);
  addAudit(req.admin.email, `status:${status}`, 'message', id);
  res.json({ ok: true });
});

app.get('/api/admin/messages/:id', requireAuth, (req, res) => {
  const msg = getMessage(Number(req.params.id));
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  res.json({ message: msg });
});

app.delete('/api/admin/messages/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const msg = getMessage(id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  deleteMessage(id);
  addAudit(req.admin.email, 'delete', 'message', id);
  res.json({ ok: true });
});

app.get('/api/admin/audit', requireAuth, (req, res) => {
  res.json({ audit: recentAudit(50) });
});

/* =======================================================================
 * SERVE REACT BUILD (production)
 * ===================================================================== */
const dist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(dist));
app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(path.join(dist, 'index.html'), (err) => err && next());
});

/* ---------- error handler ---------- */
app.use((err, req, res, next) => {
  /* body-parser marks its own errors: 400 = malformed JSON, 413 = payload too large */
  const status = Number(err.status) || 500;
  if (status >= 500) console.error('[error]', err.message);
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : 'Invalid request.' });
});

app.listen(PORT, () => {
  console.log(`✅ Double H API running → http://localhost:${PORT}`);
  console.log(`   health: http://localhost:${PORT}/api/health`);
});
