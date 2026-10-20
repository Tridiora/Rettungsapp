import { randomUUID } from 'node:crypto'
import { database } from '@/lib/server/database'
import { readMedia } from '@/lib/server/media'
import { ApiError, jsonError, limitedJson, requireUser, sameOrigin, textField } from '@/lib/server/security'
export const runtime = 'nodejs'
type Context = {params:Promise<{id:string}>}
export async function GET(request: Request, context: Context) {
  try {const user=requireUser(request),id=(await context.params).id; const media=readMedia(id,request); const rows=database().prepare('SELECT data FROM notes WHERE user_id=? AND media_id=?').all(user.id,id) as {data:string}[];return Response.json(rows.map(r=>JSON.parse(r.data)).filter(n=>(n.fileRevision||1)===(media.fileRevision||1)),{headers:{'Cache-Control':'no-store'}})} catch(e){return jsonError(e)}
}
export async function POST(request: Request, context: Context) {
  try {sameOrigin(request);const user=requireUser(request),id=(await context.params).id;const media=readMedia(id,request);const b=await limitedJson(request,10000)
    if(!Number.isInteger(b.page)||b.page<1||b.page>10000||![b.x,b.y,b.width,b.height].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1)||b.x+b.width>1.001||b.y+b.height>1.001||!['#facc15','#4ade80','#60a5fa','#f472b6'].includes(b.color))throw new ApiError(400,'Ungültige Markierung.')
    const note={id:randomUUID(),fileRevision:media.fileRevision||1,page:b.page,x:b.x,y:b.y,width:b.width,height:b.height,color:b.color,text:textField(b.text,4000)}
    database().prepare('INSERT INTO notes VALUES (?,?,?,?)').run(note.id,user.id,id,JSON.stringify(note));return Response.json(note,{status:201})
  }catch(e){return jsonError(e)}
}
export async function DELETE(request: Request, context: Context) {
  try {sameOrigin(request);const user=requireUser(request),id=(await context.params).id,b=await limitedJson(request,1000);readMedia(id,request);database().prepare('DELETE FROM notes WHERE id=? AND user_id=? AND media_id=?').run(textField(b.id,50,true),user.id,id);return Response.json({ok:true})}catch(e){return jsonError(e)}
}
