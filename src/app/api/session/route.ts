import { randomBytes } from 'node:crypto'
import { compareSync } from 'bcryptjs'
import { database } from '@/lib/server/database'
import { ApiError, digest, jsonError, limitedJson, sameOrigin, sessionUser, textField } from '@/lib/server/security'
export const runtime = 'nodejs'
export async function GET(request: Request) { database(); return Response.json({ user: sessionUser(request) }, { headers: { 'Cache-Control': 'no-store' } }) }
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    const body = await limitedJson(request, 4096), email = textField(body.email, 254, true).toLowerCase(), password = textField(body.password, 128, true)
    const db = database(), limit = db.prepare('SELECT attempts,until_at FROM login_limits WHERE email=?').get(email) as { attempts: number; until_at: number } | undefined
    if (limit && limit.until_at > Date.now() && limit.attempts >= 8) throw new ApiError(429, 'Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.')
    const user = db.prepare('SELECT * FROM users WHERE email=?').get(email) as { id: string; password: string; name: string; role: string; email: string } | undefined
    if (!user || !compareSync(password, user.password)) {
      db.prepare('INSERT OR REPLACE INTO login_limits VALUES (?,?,?)').run(email, limit && limit.until_at > Date.now() ? limit.attempts + 1 : 1, Date.now() + 900_000)
      throw new ApiError(401, 'E-Mail oder Passwort ist nicht korrekt.')
    }
    db.prepare('DELETE FROM login_limits WHERE email=?').run(email)
    db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now())
    const token = randomBytes(32).toString('base64url')
    db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token), user.id, Date.now() + 7 * 86400_000)
    return Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { headers: { 'Set-Cookie': `medlearn_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`, 'Cache-Control': 'no-store' } })
  } catch (e) { return jsonError(e) }
}
export async function DELETE(request: Request) {
  try { sameOrigin(request); const token = request.headers.get('cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith('medlearn_session='))?.slice(17); if (token) database().prepare('DELETE FROM sessions WHERE token=?').run(digest(token)); return Response.json({ ok: true }, { headers: { 'Set-Cookie': 'medlearn_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' } }) } catch(e) { return jsonError(e) }
}
