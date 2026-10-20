import { randomUUID } from 'node:crypto'
import { allContent, canEdit, canRead, classes, editorialDb, groups, permissions, validateScope } from '@/lib/server/editorial'
import { ApiError, jsonError, limitedJson, requireUser, sameOrigin, sessionUser, textField } from '@/lib/server/security'
import { kindNames, type EditorialRecord } from '@/lib/editorial-types'
export const runtime='nodejs'
export async function GET(request:Request) {
  try {const user=sessionUser(request),params=new URL(request.url).searchParams,manage=params.has('manage'),history=params.get('history')
    if(history){const record=allContent().find(r=>r.id===history);if(!record||!canEdit(user,record))throw new ApiError(403,'Kein Zugriff auf diesen Versionsverlauf.');return Response.json((editorialDb().prepare('SELECT created_at,data FROM editorial_revisions WHERE content_id=? ORDER BY id DESC LIMIT 50').all(history) as {created_at:string;data:string}[]).map(r=>({at:r.created_at,record:JSON.parse(r.data)})),{headers:{'Cache-Control':'no-store'}})}
    return Response.json({user,permissions:permissions(user),classes:classes(user),groups:user?.role==='admin'?groups():[],records:allContent().filter(r=>manage?canRead(user,r):r.status==='published'&&canRead(user,r))},{headers:{'Cache-Control':'no-store'}})}catch(e){return jsonError(e)}
}
export async function POST(request:Request) {
  try{
    sameOrigin(request);const user=requireUser(request),b=await limitedJson(request,1_000_000),db=editorialDb()
    if(!Object.hasOwn(kindNames,b.kind)||!b.data||Array.isArray(b.data)||typeof b.data!=='object')throw new ApiError(400,'Ungültiger Inhalt.')
    const id=typeof b.id==='string'?textField(b.id,150,true):`${b.kind}:${randomUUID()}`
    const old=allContent().find(r=>r.id===id)
    if(old? !canEdit(user,old):!permissions(user).includes('create'))throw new ApiError(403,'Du darfst diesen Inhalt nicht bearbeiten.')
    if(old&&(old.revision!==b.revision||old.kind!==b.kind))throw new ApiError(409,'Der Inhalt wurde inzwischen geändert. Bitte neu öffnen.')
    if(!['global','class'].includes(b.scope)||!['draft','review','published','archived'].includes(b.status))throw new ApiError(400,'Ungültiger Geltungsbereich oder Status.')
    const row:EditorialRecord={id,kind:b.kind,data:{...b.data,id:old?.data.id||id.split(':').slice(1).join(':')},ownerId:old?.ownerId||user.id,scope:b.scope,classId:b.scope==='class'?textField(b.classId,100,true):'',status:b.status,revision:(old?.revision||0)+1}
    function checkLinks(value:unknown){if(typeof value==='string'&&/^\s*(javascript|vbscript|data):/i.test(value))throw new ApiError(400,'Ausführbare Datenadressen sind nicht erlaubt.');if(Array.isArray(value))value.forEach(checkLinks);else if(value&&typeof value==='object')Object.values(value).forEach(checkLinks)}
    checkLinks(row.data)
    validateScope(user,row)
    if(row.status==='published'){
      if(b.reviewed!==true)throw new ApiError(400,'Vor der Freigabe Quellen, Sprache und deutsche Anwendbarkeit bestätigen.')
      const d=row.data
      if(!String(d.source||'').trim())throw new ApiError(400,'Eine Quelle ist für die Freigabe erforderlich.')
      if(row.kind==='glossary'&&(!String(d.term||'').trim()||String(d.explanation||'').trim().length<120))throw new ApiError(400,'Begriff und ausführliche Erklärung (mindestens 120 Zeichen) ergänzen.')
      if(row.kind==='cards'&&(!d.front||!d.back||String(d.simpleExplanation||'').trim().length<120||!d.deckId))throw new ApiError(400,'Frage, Lernset, Fachtext und ausführliche einfache Erklärung ergänzen.')
      if(row.kind==='quizzes'&&(!Array.isArray(d.questions)||!d.questions.length||d.questions.some((q:Record<string,unknown>)=>!q.text||!q.simpleText||!q.explanation||!q.simpleExplanation||!Array.isArray(q.answers)||q.answers.length<2||!q.answers.some((a:{isCorrect:boolean})=>a.isCorrect))))throw new ApiError(400,'Quizfragen benötigen beide Sprachfassungen, Begründungen und richtige Antworten.')
      if(row.kind==='documents'&&(!Array.isArray(d.sections)||!d.sections.length||d.sections.some((s:Record<string,unknown>)=>!s.title||!s.content||!s.simpleContent)))throw new ApiError(400,'Alle Abschnitte benötigen beide Sprachfassungen.')
      if(row.kind==='anatomy'&&(!d.title||!Array.isArray(d.parts)||!d.parts.length||d.parts.some((p:Record<string,unknown>)=>!p.id||!p.name||!p.term||!p.technical||!p.simple||!p.path)))throw new ApiError(400,'Anatomie benötigt eine Bezeichnung und vollständige Strukturen mit beiden Erklärungen und Vektorpfad.')
    }
    // Aliases are plain strings; patterns/HTML supplied by editors are never executed.
    if(row.kind==='glossary'&&(!Array.isArray(row.data.aliases)||row.data.aliases.length>30||row.data.aliases.some((a:unknown)=>typeof a!=='string'||!a.trim()||a.length>100)))throw new ApiError(400,'Bis zu 30 ausgeschriebene Suchbegriffe angeben.')
    if(row.kind==='glossary'){
      textField(row.data.term,100,true);textField(row.data.explanation,30000,true)
      const names=[row.data.term,...row.data.aliases as string[]].map(v=>String(v).toLocaleLowerCase('de'))
      if(allContent().some(r=>r.id!==id&&r.kind==='glossary'&&r.status!=='archived'&&r.scope===row.scope&&r.classId===row.classId&&[r.data.term,...r.data.aliases as string[]].some(a=>names.includes(String(a).toLocaleLowerCase('de')))))throw new ApiError(409,'Diese Schreibweise ist bereits erklärt. Bitte den vorhandenen Begriff bearbeiten.')
    }
    db.transaction(()=>{
      const latest=db.prepare('SELECT data FROM editorial_content WHERE id=?').get(id) as {data:string}|undefined
      if(latest&&JSON.parse(latest.data).revision!==b.revision)throw new ApiError(409,'Zeitgleiche Änderung. Bitte neu öffnen.')
      if(old&&!db.prepare('SELECT id FROM editorial_revisions WHERE content_id=? LIMIT 1').get(id))db.prepare('INSERT INTO editorial_revisions(content_id,actor,created_at,data) VALUES (?,?,?,?)').run(id,user.id,new Date().toISOString(),JSON.stringify(old))
      db.prepare('INSERT INTO editorial_revisions(content_id,actor,created_at,data) VALUES (?,?,?,?)').run(id,user.id,new Date().toISOString(),JSON.stringify(row))
      db.prepare('INSERT OR REPLACE INTO editorial_content VALUES (?,?,?)').run(id,row.kind,JSON.stringify(row))
    })()
    return Response.json(row)
  }catch(e){return jsonError(e)}
}
