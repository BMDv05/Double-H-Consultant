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
    status TEXT NOT NULL DEFAULT 'Not Processed' CHECK (status IN ('Not Processed','Processed')),
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
`);

/* ---------------- status migration: New/Handled → Not Processed/Processed ----------------
   Old databases carry CHECK (status IN ('New','Handled')). Rebuild once. */
const msgSchema = db
  .prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'messages'`)
  .get();
if (msgSchema && msgSchema.sql && msgSchema.sql.includes(`'New'`)) {
  db.exec(`
    ALTER TABLE messages RENAME TO messages_legacy;
    CREATE TABLE messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      lang TEXT NOT NULL DEFAULT 'en',
      status TEXT NOT NULL DEFAULT 'Not Processed' CHECK (status IN ('Not Processed','Processed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    INSERT INTO messages (id, name, email, subject, message, lang, status, created_at)
      SELECT id, name, email, subject, message, lang,
        CASE status WHEN 'Handled' THEN 'Processed' ELSE 'Not Processed' END,
        created_at
      FROM messages_legacy;
    DROP TABLE messages_legacy;
    CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
    CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
  `);
  console.log('[db] migrated message statuses → Not Processed/Processed');
}

/* ---------------- password hashing (PBKDF2, salted) ---------------- */
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
}

/* ---------------- seed admin (env override for production) ----------------
   Priority:
     1. ADMIN_PASSWORD env  → used as-is
     2. production (NODE_ENV=production) → strong random password, printed ONCE
     3. development         → known demo password (never use publicly)        */
const seedEmail = (process.env.ADMIN_EMAIL || 'admin@doubleh.com').toLowerCase().trim();
const isProduction = process.env.NODE_ENV === 'production';
let seedPassword = process.env.ADMIN_PASSWORD;
let seedSource = 'env';
if (!seedPassword && isProduction) {
  seedPassword = crypto.randomBytes(18).toString('base64url');
  seedSource = 'generated';
} else if (!seedPassword) {
  seedPassword = 'Admin123!';
  seedSource = 'demo';
}
const existingAdmin = db.prepare('SELECT id FROM admins WHERE email = ?').get(seedEmail);
if (!existingAdmin) {
  const salt = crypto.randomBytes(16).toString('hex');
  db.prepare('INSERT INTO admins (name, email, password_hash, salt) VALUES (?, ?, ?, ?)')
    .run('Administrator', seedEmail, hashPassword(seedPassword, salt), salt);
  if (seedSource === 'generated') {
    console.log('──────────────────────────────────────────────');
    console.log(`[db] ADMIN seeded: ${seedEmail}`);
    console.log(`[db] ONE-TIME password: ${seedPassword}`);
    console.log('[db] Store it now — it is not printed again.');
    console.log('──────────────────────────────────────────────');
  } else if (seedSource === 'demo') {
    console.warn(`[db] WARNING: seeded demo admin ${seedEmail} with the PUBLIC demo password.`);
    console.warn('[db] Set ADMIN_EMAIL / ADMIN_PASSWORD before exposing this server.');
  } else {
    console.log(`[db] seeded admin: ${seedEmail} (from env)`);
  }
}

/* dummy hash used to equalise timing when an email does not exist */
const DUMMY_SALT = crypto.randomBytes(16).toString('hex');
const DUMMY_HASH = hashPassword(crypto.randomBytes(24).toString('base64url'), DUMMY_SALT);

/* ---------------- queries ---------------- */
export function verifyAdmin(email, password) {
  const row = db.prepare('SELECT * FROM admins WHERE email = ?').get(String(email || '').toLowerCase().trim());
  if (!row) {
    /* burn the same PBKDF2 work so response time does not reveal whether the account exists */
    crypto.timingSafeEqual(Buffer.from(DUMMY_HASH, 'utf8'), Buffer.from(DUMMY_HASH, 'utf8'));
    hashPassword(String(password || ''), DUMMY_SALT);
    return null;
  }
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
  if (q) {
    /* escape LIKE wildcards so user input is matched literally, not as patterns */
    const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    where.push(`(name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR subject LIKE ? ESCAPE '\\' OR message LIKE ? ESCAPE '\\')`);
    params.push(like, like, like, like);
  }
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

export function deleteMessage(id) {
  const info = db.prepare('DELETE FROM messages WHERE id = ?').run(Number(id));
  return info.changes > 0;
}

export function messageStats() {
  const total = db.prepare('SELECT COUNT(*) AS n FROM messages').get().n;
  const open = db.prepare("SELECT COUNT(*) AS n FROM messages WHERE status = 'Not Processed'").get().n;
  return { total, open, processed: total - open };
}

export function addAudit(actor, action, entity, entityId = null) {
  db.prepare('INSERT INTO audit_logs (actor, action, entity, entity_id) VALUES (?, ?, ?, ?)')
    .run(actor, action, entity, entityId == null ? null : String(entityId));
}

export function recentAudit(limit = 50) {
  return db.prepare('SELECT * FROM audit_logs ORDER BY datetime(created_at) DESC, id DESC LIMIT ?').all(limit);
}
