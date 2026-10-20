import { database } from './database'
import { ApiError, sessionUser, validId } from './security'
import type { MediaRecord } from '@/lib/media-types'
import { canRead } from './editorial'
export function mediaAccess(media:MediaRecord){return {id:media.id,kind:'media',data:{},ownerId:media.authorId,scope:media.scope||'global' as const,classId:media.classId||'',status:media.status,revision:media.revision}}
export function readMedia(id: string, request: Request): MediaRecord {
  validId(id)
  const row = database().prepare('SELECT data FROM media WHERE id=?').get(id) as {data:string} | undefined
  if (!row) throw new ApiError(404, 'Datei nicht gefunden.')
  const media = JSON.parse(row.data) as MediaRecord
  if (!canRead(sessionUser(request),mediaAccess(media))) throw new ApiError(404, 'Datei nicht gefunden.')
  return media
}
export function audit(userId: string, mediaId: string, action: string) { database().prepare('INSERT INTO audit(user_id,media_id,action,created_at) VALUES (?,?,?,?)').run(userId,mediaId,action,new Date().toISOString()) }
