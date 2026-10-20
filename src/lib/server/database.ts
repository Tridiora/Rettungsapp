import Database from 'better-sqlite3'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { randomBytes, randomUUID } from 'node:crypto'
import { hashSync } from 'bcryptjs'

// Runtime data is provisioned separately; it must never be bundled into a build.
export const dataDirectory = () => path.resolve(/* turbopackIgnore: true */ process.env.MEDLEARN_DATA_DIR || path.join(process.cwd(), '.data'))
const databases = new Map<string, Database.Database>()
export function database() {
  const directory = dataDirectory()
  if (databases.has(directory)) return databases.get(directory)!
  mkdirSync(path.join(directory, 'files'), { recursive: true })
  const db = new Database(path.join(directory, 'medlearn.sqlite'))
  db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON'); db.pragma('busy_timeout = 5000')
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, status TEXT NOT NULL, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), media_id TEXT NOT NULL REFERENCES media(id), data TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS notes_owner ON notes(user_id, media_id);
    CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, media_id TEXT NOT NULL, action TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS login_limits (email TEXT PRIMARY KEY, attempts INTEGER NOT NULL, until_at INTEGER NOT NULL);
  `)
  if (!(db.prepare('SELECT id FROM users LIMIT 1').get())) {
    const password = randomBytes(18).toString('base64url')
    db.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?)').run(randomUUID(), 'Administration', 'admin@medlearn.local', hashSync(password, 12), 'admin')
    writeFileSync(path.join(directory, 'ERSTER-ADMIN.txt'), `MedLearn – lokaler Erstzugang\n\nE-Mail: admin@medlearn.local\nPasswort: ${password}\n\nAnmeldung: http://localhost:3000/medien\nDie Vorschaurolle der bisherigen Lernkartenverwaltung hat hier keine Berechtigung.\nDieses Dokument enthält ein Passwort. Privat aufbewahren.\n`, { mode: 0o600, flag: 'wx' })
  }
  databases.set(directory, db)
  return db
}
