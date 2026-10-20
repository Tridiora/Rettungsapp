import { createHash } from 'node:crypto'
import { database } from './database'
import type { Account } from '@/lib/media-types'

export class ApiError extends Error { constructor(public status: number, message: string) { super(message) } }
export const digest = (token: string) => createHash('sha256').update(token).digest('hex')
export function sessionUser(request: Request): Account | null {
  const token = request.headers.get('cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith('medlearn_session='))?.slice(17)
  if (!token) return null
  return database().prepare('SELECT u.id,u.name,u.email,u.role FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.token=? AND s.expires>?').get(digest(token), Date.now()) as Account || null
}
export function requireUser(request: Request, roles?: string[]): Account {
  const user = sessionUser(request)
  if (!user) throw new ApiError(401, 'Bitte mit einem Serverkonto anmelden.')
  if (roles && !roles.includes(user.role)) throw new ApiError(403, 'Für diese Aktion fehlen die Rechte.')
  return user
}
export function sameOrigin(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) throw new ApiError(403, 'Der Zugriff muss aus dieser Anwendung erfolgen.')
}
export function jsonError(error: unknown) {
  if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status })
  console.error('MedLearn API:', error instanceof Error ? error.message : 'Unbekannter Fehler')
  return Response.json({ error: 'Die Anfrage konnte nicht gespeichert werden.' }, { status: 500 })
}
export function validId(id: string) { if (!/^[a-z0-9-]{20,50}$/.test(id)) throw new ApiError(404, 'Inhalt nicht gefunden.') }
export function textField(value: unknown, max: number, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new ApiError(400, 'Bitte alle Pflichtfelder korrekt ausfüllen.')
  return value.trim()
}
export async function limitedJson(request: Request, max = 100_000) {
  const data = await limitedBody(request, max)
  try { return JSON.parse(data.toString('utf8')) } catch { throw new ApiError(400, 'Ungültige Eingabe.') }
}
export async function limitedBody(request: Request, max: number) {
  if (Number(request.headers.get('content-length')) > max) throw new ApiError(413, 'Datei oder Anfrage ist zu groß.')
  const reader = request.body?.getReader(); const chunks: Uint8Array[] = []; let size = 0
  if (!reader) throw new ApiError(400, 'Keine Daten übertragen.')
  while (true) { const {done, value} = await reader.read(); if (done) break; size += value.length; if (size > max) { await reader.cancel(); throw new ApiError(413, 'Maximal 20 MB pro Datei.') } chunks.push(value) }
  return Buffer.concat(chunks)
}
