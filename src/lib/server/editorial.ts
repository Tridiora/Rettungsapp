import { expandedLibrary } from '@/lib/curriculum/expanded'
import { database } from './database'
import { ApiError } from './security'
import type { Account } from '@/lib/media-types'
import { permissionNames, type Permission, type EditorialGroup, type EditorialRecord } from '@/lib/editorial-types'
import { germanStarter } from '@/lib/db/german-starter'
import { decks, flashcards, quizzes } from '@/lib/db/mock-data'
import { officialDocuments } from '@/lib/db/documents'
import { anatomyModels } from '@/lib/anatomy-data'
import { glossary } from '@/lib/learning-glossary'
import { detailedExplanations } from '@/lib/detailed-explanations'
import { atlasMedia } from '@/lib/atlas-media-data'
import { curriculumLibrary } from '@/lib/curriculum/index'

export function editorialDb() {
  const db=database()
  db.exec(`CREATE TABLE IF NOT EXISTS editorial_groups(id TEXT PRIMARY KEY,data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS editorial_content(id TEXT PRIMARY KEY,kind TEXT NOT NULL,data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS editorial_revisions(id INTEGER PRIMARY KEY AUTOINCREMENT,content_id TEXT NOT NULL,actor TEXT NOT NULL,created_at TEXT NOT NULL,data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS editorial_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);`)
  if(!db.prepare("SELECT value FROM editorial_meta WHERE key='seed-v1'").get()) db.transaction(()=>{
    const insert=db.prepare('INSERT OR IGNORE INTO editorial_content VALUES (?,?,?)')
    const seed=(kind:string,id:string,data:unknown,status='published')=>{
      const record={id:`${kind}:${id}`,kind,data,ownerId:'system',scope:'global',classId:'',status,revision:1}
      insert.run(record.id,kind,JSON.stringify(record))
    }
    for(const kind of ['decks','cards','quizzes','documents'] as const)for(const row of germanStarter[kind])seed(kind,row.id,row)
    for(const [kind,rows]of Object.entries({decks,cards:flashcards,quizzes,documents:officialDocuments}))for(const row of rows)seed(kind,row.id,row,'draft')
    for(const row of anatomyModels)seed('anatomy',row.id,row)
    glossary.forEach((row,i)=>seed('glossary',String(i),{...row,id:String(i)}))
    for(const group of [
      {id:'students',name:'Schüler',kind:'role',permissions:[],members:[]},
      {id:'teachers',name:'Lehrer',kind:'role',permissions:['create','editOwn','publishClass'],members:[]},
    ])db.prepare('INSERT OR IGNORE INTO editorial_groups VALUES (?,?)').run(group.id,JSON.stringify(group))
    db.prepare("INSERT INTO editorial_meta VALUES ('seed-v1','1')").run()
  })()
  if(!db.prepare("SELECT value FROM editorial_meta WHERE key='detail-v2'").get())db.transaction(()=>{
    const rows=db.prepare('SELECT data FROM editorial_content').all() as {data:string}[]
    for(const raw of rows){const row=JSON.parse(raw.data) as EditorialRecord;if(row.revision!==1||row.ownerId!=='system')continue
      if(row.kind==='glossary'&&detailedExplanations[String(row.data.term)])row.data.explanation=detailedExplanations[String(row.data.term)]
      if(row.kind==='anatomy'&&Array.isArray(row.data.parts))row.data.parts=row.data.parts.map(p=>({...p,simple:detailedExplanations[p.term]||p.simple,technical:detailedExplanations[p.term]?`${p.technical}\n\nZusammenhang: ${detailedExplanations[p.term]}`:p.technical}))
      if(row.kind==='cards'){const part=anatomyModels.flatMap(m=>m.parts).find(p=>String(row.data.back).startsWith(p.term+':'));if(part&&detailedExplanations[part.term]){row.data.simpleExplanation=detailedExplanations[part.term];row.data.back=`${part.term}: ${part.technical}\n\n${detailedExplanations[part.term]}`}}
      if(row.kind==='quizzes'&&Array.isArray(row.data.questions))row.data.questions=row.data.questions.map(q=>{const part=anatomyModels.flatMap(m=>m.parts).find(p=>String(q.explanation).startsWith(p.term+':'));return part&&detailedExplanations[part.term]?{...q,imageUrl:q.imageUrl||'',simpleExplanation:detailedExplanations[part.term],explanation:`${part.term}: ${part.technical}\n\n${detailedExplanations[part.term]}`} : q})
      db.prepare('UPDATE editorial_content SET data=? WHERE id=?').run(JSON.stringify(row),row.id)
    }
    db.prepare("INSERT INTO editorial_meta VALUES ('detail-v2','1')").run()
  })()
  if(!db.prepare("SELECT value FROM editorial_meta WHERE key='atlas-v1'").get())db.transaction(()=>{
    for(const data of atlasMedia){const row={id:`illustrations:${data.id}`,kind:'illustrations',data,ownerId:'system',scope:'global',classId:'',status:'published',revision:1};db.prepare('INSERT OR IGNORE INTO editorial_content VALUES (?,?,?)').run(row.id,row.kind,JSON.stringify(row))}
    db.prepare("INSERT INTO editorial_meta VALUES ('atlas-v1','1')").run()
  })()
  if(!db.prepare("SELECT value FROM editorial_meta WHERE key='curriculum-de-v1'").get())db.transaction(()=>{
    for(const kind of ['decks','cards','quizzes','documents'] as const)for(const data of curriculumLibrary[kind]){
      const row={id:kind+':'+data.id,kind,data,ownerId:'system',scope:'global',classId:'',status:'published',revision:1}
      db.prepare('INSERT OR IGNORE INTO editorial_content VALUES (?,?,?)').run(row.id,kind,JSON.stringify(row))
    }
    db.prepare("INSERT INTO editorial_meta VALUES ('curriculum-de-v1','1')").run()
  })()
  if(!db.prepare("SELECT value FROM editorial_meta WHERE key='beta-curriculum-v2'").get())db.transaction(()=>{
    for(const library of [curriculumLibrary,expandedLibrary,germanStarter]) for(const kind of ['decks','cards','quizzes','documents'] as const)for(const data of library[kind]){
      const id=kind+':'+data.id;const old=db.prepare('SELECT data FROM editorial_content WHERE id=?').get(id) as {data:string}|undefined;
      if(old){const row=JSON.parse(old.data) as EditorialRecord;if(row.ownerId!=='system'||row.revision!==1)continue;row.data=data as unknown as Record<string,unknown>;if(kind==='quizzes'&&Array.isArray(row.data.questions)&&row.data.questions.length<20)row.status='archived';db.prepare('UPDATE editorial_content SET data=? WHERE id=?').run(JSON.stringify(row),id)}
      else{const row={id,kind,data,ownerId:'system',scope:'global',classId:'',status:'published',revision:1};db.prepare('INSERT INTO editorial_content VALUES (?,?,?)').run(id,kind,JSON.stringify(row))}
    }
    db.prepare("INSERT INTO editorial_meta VALUES ('beta-curriculum-v2','1')").run();
  })()
  return db
}
export function groups():EditorialGroup[]{return (editorialDb().prepare('SELECT data FROM editorial_groups').all() as {data:string}[]).map(r=>JSON.parse(r.data))}
export function permissions(user:Account|null):Permission[]{
  if(!user)return []
  if(['admin','moderator'].includes(user.role))return Object.keys(permissionNames) as Permission[]
  return [...new Set(groups().filter(g=>g.kind==='role'&&g.members.includes(user.id)).flatMap(g=>g.permissions))]
}
export function classes(user:Account|null){return groups().filter(g=>g.kind==='class'&&(user?.role==='admin'||user?.role==='moderator'||g.members.includes(user?.id||'')))}
export function canEdit(user:Account|null,row:EditorialRecord){const p=permissions(user);return !!user&&(p.includes('editAll')||(row.ownerId===user.id&&p.includes('editOwn')))}
export function canRead(user:Account|null,row:EditorialRecord){return canEdit(user,row)||(row.status==='published'&&(row.scope==='global'||classes(user).some(g=>g.id===row.classId)))}
export function allContent():EditorialRecord[]{return (editorialDb().prepare('SELECT data FROM editorial_content').all() as {data:string}[]).map(r=>JSON.parse(r.data))}
export function validateScope(user:Account,row:EditorialRecord) {
  if(row.scope==='class'&&!classes(user).some(g=>g.id===row.classId))throw new ApiError(403,'Diese Klasse ist dir nicht zugeordnet.')
  if(row.status==='published'&&!permissions(user).includes(row.scope==='global'?'publishGlobal':'publishClass'))throw new ApiError(403,'Für diesen Geltungsbereich fehlt das Veröffentlichungsrecht. Global kannst du den Inhalt zur Prüfung einreichen.')
}
