import { randomUUID } from 'node:crypto'
import { hashSync } from 'bcryptjs'
import { database } from '@/lib/server/database'
import { ApiError, jsonError, limitedJson, requireUser, sameOrigin, textField } from '@/lib/server/security'
export const runtime = 'nodejs'
export async function GET(request: Request) { try { requireUser(request, ['admin']); return Response.json(database().prepare('SELECT id,name,email,role FROM users ORDER BY name').all(), {headers:{'Cache-Control':'no-store'}}) } catch(e) { return jsonError(e) } }
export async function POST(request: Request) {
  try {
    sameOrigin(request); requireUser(request, ['admin']); const b = await limitedJson(request, 4096)
    const name = textField(b.name, 100, true), email = textField(b.email, 254, true).toLowerCase(), password = textField(b.password, 128, true)
    if (!email.includes('@') || password.length < 12 || !['learner','moderator','admin'].includes(b.role)) throw new ApiError(400, 'E-Mail, Rolle und Passwort mit mindestens 12 Zeichen angeben.')
    if (database().prepare('SELECT id FROM users WHERE email=?').get(email)) throw new ApiError(409, 'Diese E-Mail wird bereits verwendet.')
    const user = { id: randomUUID(), name, email, role: b.role }
    database().prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(user.id,name,email,hashSync(password,12),b.role)
    return Response.json(user, {status:201})
  } catch(e) { return jsonError(e) }
}
export async function PATCH(request:Request){
  try{
    sameOrigin(request);const actor=requireUser(request,['admin']),b=await limitedJson(request,4096),id=textField(b.id,100,true),role=textField(b.role,30,true)
    if(!['learner','moderator','admin'].includes(role))throw new ApiError(400,'Ungültige Grundrolle.')
    const db=database()
    db.transaction(()=>{
      const old=db.prepare('SELECT role FROM users WHERE id=?').get(id) as {role:string}|undefined
      if(!old)throw new ApiError(404,'Konto nicht gefunden.')
      if(old.role==='admin'&&role!=='admin'&&(db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='admin'").get() as {n:number}).n<=1)throw new ApiError(409,'Mindestens ein Administrationskonto muss erhalten bleiben.')
      db.prepare('UPDATE users SET role=? WHERE id=?').run(role,id)
      db.prepare('INSERT INTO audit(user_id,media_id,action,created_at) VALUES (?,?,?,?)').run(actor.id,id,`Grundrolle geändert: ${role}`,new Date().toISOString())
    })()
    return Response.json({ok:true})
  }catch(e){return jsonError(e)}
}
