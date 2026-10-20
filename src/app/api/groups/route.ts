import { randomUUID } from 'node:crypto'
import { editorialDb, groups } from '@/lib/server/editorial'
import { permissionNames } from '@/lib/editorial-types'
import { ApiError,jsonError,limitedJson,requireUser,sameOrigin,textField } from '@/lib/server/security'
export const runtime='nodejs'
export async function GET(request:Request){try{requireUser(request,['admin']);return Response.json(groups(),{headers:{'Cache-Control':'no-store'}})}catch(e){return jsonError(e)}}
export async function POST(request:Request){
  try{sameOrigin(request);requireUser(request,['admin']);const b=await limitedJson(request),db=editorialDb()
    if(!['class','role'].includes(b.kind)||!Array.isArray(b.members)||!Array.isArray(b.permissions)||b.permissions.some((p:string)=>!Object.hasOwn(permissionNames,p)))throw new ApiError(400,'Ungültige Gruppe oder Rechte.')
    const users=new Set((db.prepare('SELECT id FROM users').all() as {id:string}[]).map(u=>u.id))
    if(b.members.some((id:unknown)=>typeof id!=='string'||!users.has(id)))throw new ApiError(400,'Unbekanntes Mitglied.')
    const group={id:b.id?textField(b.id,100,true):randomUUID(),name:textField(b.name,100,true),kind:b.kind,permissions:b.kind==='role'?[...new Set(b.permissions)]:[],members:[...new Set(b.members)]}
    db.prepare('INSERT OR REPLACE INTO editorial_groups VALUES (?,?)').run(group.id,JSON.stringify(group));return Response.json(group)
  }catch(e){return jsonError(e)}
}
