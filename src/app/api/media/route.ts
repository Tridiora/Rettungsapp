import { randomUUID } from 'node:crypto'
import { writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { database, dataDirectory } from '@/lib/server/database'
import { ApiError, jsonError, limitedBody, requireUser, sameOrigin, sessionUser, textField } from '@/lib/server/security'
import { audit,mediaAccess } from '@/lib/server/media'
import { canRead,permissions,validateScope } from '@/lib/server/editorial'
import type { MediaRecord } from '@/lib/media-types'
export const runtime = 'nodejs'
export async function GET(request: Request) {
  try { const user = sessionUser(request); const rows = database().prepare('SELECT data FROM media ORDER BY rowid DESC').all() as {data:string}[]; return Response.json(rows.map(r => JSON.parse(r.data) as MediaRecord).filter(r=>canRead(user,mediaAccess(r))), {headers:{'Cache-Control':'no-store'}}) } catch(e) { return jsonError(e) }
}
export async function POST(request: Request) {
  let stored: string | undefined
  try {
    sameOrigin(request); const user = requireUser(request)
    if(!permissions(user).includes('create'))throw new ApiError(403,'Für Uploads fehlt das Erstellungsrecht.')
    const bytes = await limitedBody(request, 21 * 1024 * 1024)
    const form = await new Response(new Uint8Array(bytes), {headers:{'Content-Type':request.headers.get('content-type') || ''}}).formData()
    const file = form.get('file'); if (!(file instanceof File) || file.size > 20 * 1024 * 1024 || file.size === 0) throw new ApiError(400, 'Bitte eine PDF-, PNG- oder JPEG-Datei bis 20 MB auswählen.')
    const data = Buffer.from(await file.arrayBuffer())
    const mime = data.subarray(0,5).toString() === '%PDF-' ? 'application/pdf' : data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'image/png' : data[0] === 255 && data[1] === 216 && data[2] === 255 ? 'image/jpeg' : ''
    if (!mime) throw new ApiError(400, 'Das Dateiformat wird nicht unterstützt. SVG und ausführbare Dateien sind nicht erlaubt.')
    const id = randomUUID(), now = new Date().toISOString()
    const media: MediaRecord = {id,title:textField(form.get('title'),180,true),filename:file.name.slice(0,180),mime,size:file.size,category:textField(form.get('category'),100,true),source:textField(form.get('source'),2000,true),rights:textField(form.get('rights'),2000,true),sourceDate:textField(form.get('sourceDate'),30,true),technical:textField(form.get('technical') || '',10000),simple:textField(form.get('simple') || '',10000),country:'DE',status:'draft',createdAt:now,updatedAt:now,revision:1,authorId:user.id}
    media.scope=form.get('scope')==='class'?'class':'global';media.classId=media.scope==='class'?textField(form.get('classId'),100,true):''
    validateScope(user,mediaAccess(media))
    stored = path.join(dataDirectory(),'files',`${id}.bin`); await writeFile(stored,data,{flag:'wx'})
    database().transaction(() => { database().prepare('INSERT INTO media VALUES (?,?,?)').run(id,'draft',JSON.stringify(media)); audit(user.id,id,'Datei als Entwurf hochgeladen') })()
    return Response.json(media,{status:201})
  } catch(e) { if(stored) await unlink(stored).catch(()=>{}); return jsonError(e) }
}
