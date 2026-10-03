/**
 * Double H Consulting — SQLite database (node:sqlite, zero native deps).
 * Stores: contact messages, admins, audit logs.
 */
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, 'doubleh.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    lang TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New','Handled')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT
  );
  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_digits TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL,
    lang TEXT NOT NULL DEFAULT 'en',
    is_first_free INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New','Contacted','Scheduled','Completed','Cancelled','Rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
  CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
  CREATE INDEX IF NOT EXISTS idx_consult_email ON consultations(email);
  CREATE INDEX IF NOT EXISTS idx_consult_phone ON consultations(phone_digits);
`);

/* ---------------- password hashing (PBKDF2, salted) ---------------- */
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
}

/* ---------------- seed default admin (demo) ---------------- */
const existingAdmin = db.prepare('SELECT id FROM admins WHERE email = ?').get('admin@doubleh.com');
if (!existingAdmin) {
  const salt = crypto.randomBytes(16).toString('hex');
  db.prepare('INSERT INTO admins (name, email, password_hash, salt) VALUES (?, ?, ?, ?)')
    .run('Administrator', 'admin@doubleh.com', hashPassword('Admin123!', salt), salt);
  console.log('[db] seeded demo admin: admin@doubleh.com / Admin123!');
}

/* ---------------- queries ---------------- */
export function verifyAdmin(email, password) {
  const row = db.prepare('SELECT * FROM admins WHERE email = ?').get(String(email || '').toLowerCase().trim());
  if (!row) return null;
  const candidate = hashPassword(String(password || ''), row.salt);
  const a = Buffer.from(candidate, 'utf8');
  const b = Buffer.from(row.password_hash, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  db.prepare('UPDATE admins SET last_login_at = datetime(\'now\') WHERE id = ?').run(row.id);
  return { id: row.id, name: row.name, email: row.email };
}

export function createMessage({ name, email, subject, message, lang }) {
  const info = db.prepare(
    'INSERT INTO messages (name, email, subject, message, lang) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email, subject, message, lang || 'en');
  return Number(info.lastInsertRowid);
}

export function listMessages({ status = '', q = '' } = {}) {
  const where = [];
  const params = [];
  if (status) { where.push('status = ?'); params.push(status); }
  if (q) { where.push('(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)'); const like = `%${q}%`; params.push(like, like, like, like); }
  const sql = `SELECT * FROM messages ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY datetime(created_at) DESC LIMIT 500`;
  return db.prepare(sql).all(...params);
}

export function getMessage(id) {
  return db.prepare('SELECT * FROM messages WHERE id = ?').get(Number(id));
}

export function updateMessageStatus(id, status) {
  const info = db.prepare('UPDATE messages SET status = ? WHERE id = ?').run(status, Number(id));
  return info.changes > 0;
}

export function messageStats() {
  const total = db.prepare('SELECT COUNT(*) AS n FROM messages').get().n;
  const newN = db.prepare("SELECT COUNT(*) AS n FROM messages WHERE status = 'New'").get().n;
  return { total, new: newN, handled: total - newN };
}

/* ---------------- consultations (first one free per client) ---------------- */
const digits = (p) => String(p || '').replace(/\D/g, '');

export function isConsultationFree(email, phone) {
  const em = String(email || '').toLowerCase().trim();
  const ph = digits(phone);
  // free-first logic: any prior consultation with same email OR phone uses up the free one
  // (Rejected requests are ignored — client may retry)
  const row = db.prepare(
    `SELECT id FROM consultations
     WHERE (lower(email) = ? OR phone_digits = ?) AND status <> 'Rejected'
     LIMIT 1`
  ).get(em, ph);
  return !row;
}

export function createConsultation({ fullName, email, phone, note, lang, isFirstFree }) {
  const info = db.prepare(
    `INSERT INTO consultations (full_name, email, phone, phone_digits, note, lang, is_first_free)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(fullName, email, phone, digits(phone), note, lang || 'en', isFirstFree ? 1 : 0);
  return Number(info.lastInsertRowid);
}

export function listConsultations({ status = '', q = '' } = {}) {
  const where = [];
  const params = [];
  if (status) { where.push('status = ?'); params.push(status); }
  if (q) {
    where.push('(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR note LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  const sql = `SELECT * FROM consultations ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY datetime(created_at) DESC LIMIT 500`;
  return db.prepare(sql).all(...params);
}

export function updateConsultationStatus(id, status) {
  const info = db.prepare('UPDATE consultations SET status = ? WHERE id = ?').run(status, Number(id));
  return info.changes > 0;
}

export function consultationStats() {
  const total = db.prepare('SELECT COUNT(*) AS n FROM consultations').get().n;
  const fresh = db.prepare("SELECT COUNT(*) AS n FROM consultations WHERE status = 'New'").get().n;
  const free = db.prepare('SELECT COUNT(*) AS n FROM consultations WHERE is_first_free = 1').get().n;
  return { total, new: fresh, free };
}

export function addAudit(actor, action, entity, entityId = null) {
  db.prepare('INSERT INTO audit_logs (actor, action, entity, entity_id) VALUES (?, ?, ?, ?)')
    .run(actor, action, entity, entityId == null ? null : String(entityId));
}

export function recentAudit(limit = 50) {
  return db.prepare('SELECT * FROM audit_logs ORDER BY datetime(created_at) DESC, id DESC LIMIT ?').all(limit);
}
