import { database } from '@/lib/server/database'
import { audit, readMedia,mediaAccess } from '@/lib/server/media'
import { canEdit,validateScope } from '@/lib/server/editorial'
import { ApiError, jsonError, limitedJson, requireUser, sameOrigin, textField } from '@/lib/server/security'
export const runtime = 'nodejs'
type Context = { params: Promise<{id:string}> }
export async function GET(request: Request, context: Context) { try { return Response.json(readMedia((await context.params).id,request),{headers:{'Cache-Control':'no-store'}}) } catch(e) {return jsonError(e)} }
export async function PATCH(request: Request, context: Context) {
  try {
    sameOrigin(request); const user = requireUser(request), id = (await context.params).id, body = await limitedJson(request), previous = readMedia(id,request)
    if(!canEdit(user,mediaAccess(previous)))throw new ApiError(403,'Kein Bearbeitungsrecht für diese Datei.')
    if (previous.revision !== body.revision) throw new ApiError(409, 'Der Inhalt wurde inzwischen geändert. Bitte neu laden.')
    const status = body.status
    if (!['draft','review','published','archived'].includes(status)) throw new ApiError(400,'Ungültiger Status.')
    const updated = {...previous,title:textField(body.title,180,true),category:textField(body.category,100,true),source:textField(body.source,2000,true),rights:textField(body.rights,2000,true),sourceDate:textField(body.sourceDate,30,true),technical:textField(body.technical,10000),simple:textField(body.simple,10000),status,updatedAt:new Date().toISOString(),revision:previous.revision+1}
    const scope=body.scope??previous.scope??'global'
    if(!['global','class'].includes(scope))throw new ApiError(400,'Ungültige Sichtbarkeit.')
    const scoped={...updated,scope,classId:scope==='class'?textField(body.classId??previous.classId,100,true):''}
    validateScope(user,mediaAccess(scoped))
    Object.assign(updated,scoped)
    if(status === 'published' && (body.reviewed!==true || !updated.technical || !updated.simple)) throw new ApiError(400,'Vor Veröffentlichung beide Erklärungen ergänzen und die Prüfung für Deutschland bestätigen.')
    database().transaction(() => { const result = database().prepare("UPDATE media SET status=?,data=? WHERE id=? AND json_extract(data,'$.revision')=?").run(status,JSON.stringify(updated),id,body.revision); if(!result.changes) throw new ApiError(409,'Zeitgleiche Änderung. Bitte neu laden.'); audit(user.id,id,`Metadaten / Status: ${status}, Version ${updated.revision}`) })()
    return Response.json(updated)
  } catch(e) {return jsonError(e)}
}
