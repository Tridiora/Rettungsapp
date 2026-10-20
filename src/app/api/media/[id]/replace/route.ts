import {randomUUID} from 'node:crypto'
import {writeFile,unlink} from 'node:fs/promises'
import path from 'node:path'
import {database,dataDirectory} from '@/lib/server/database'
import {readMedia,mediaAccess,audit} from '@/lib/server/media'
import {canEdit} from '@/lib/server/editorial'
import {ApiError,jsonError,limitedBody,requireUser,sameOrigin} from '@/lib/server/security'
export const runtime='nodejs'
export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  let stored:string|undefined
  try{
    sameOrigin(request);const user=requireUser(request),id=(await context.params).id,previous=readMedia(id,request)
    if(!canEdit(user,mediaAccess(previous)))throw new ApiError(403,'Kein Bearbeitungsrecht.')
    const body=await limitedBody(request,21*1024*1024),form=await new Response(new Uint8Array(body),{headers:{'Content-Type':request.headers.get('content-type')||''}}).formData()
    if(Number(form.get('revision'))!==previous.revision)throw new ApiError(409,'Datei wurde inzwischen geändert.')
    const file=form.get('file');if(!(file instanceof File)||!file.size||file.size>20*1024*1024)throw new ApiError(400,'PDF, PNG oder JPEG bis 20 MB wählen.')
    const bytes=Buffer.from(await file.arrayBuffer())
    const mime=bytes.subarray(0,5).toString()==='%PDF-'?'application/pdf':bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':''
    if(!mime)throw new ApiError(400,'Ungültiges Dateiformat.')
    const blobId=randomUUID(),updated={...previous,blobId,fileRevision:(previous.fileRevision||1)+1,filename:file.name.slice(0,180),mime,size:file.size,status:'draft' as const,revision:previous.revision+1,updatedAt:new Date().toISOString()}
    stored=path.join(dataDirectory(),'files',`${blobId}.bin`);await writeFile(stored,bytes,{flag:'wx'})
    database().transaction(()=>{const result=database().prepare("UPDATE media SET status=?,data=? WHERE id=? AND json_extract(data,'$.revision')=?").run('draft',JSON.stringify(updated),id,previous.revision);if(!result.changes)throw new ApiError(409,'Zeitgleiche Änderung. Bitte neu laden.');audit(user.id,id,`Originaldatei ersetzt; Dateiversion ${updated.fileRevision}; erneute Freigabe erforderlich`)})()
    return Response.json(updated)
  }catch(e){if(stored)await unlink(stored).catch(()=>{});return jsonError(e)}
}
