const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {load}=require('../scripts/load-typescript.cjs');
const {curriculumTopics,curriculumLibrary}=load('src/lib/curriculum/index.ts');
test('Acht Themenbereiche mit je zehn eigenständigen, zweisprachigen Lernbausteinen und Quellen',()=>{
 assert.equal(curriculumTopics.length,8);
 for(const {category,lessons} of curriculumTopics){assert.equal(lessons.length,10,category.name);assert.equal(new Set(lessons.map(l=>l.id)).size,10);assert.equal(new Set(lessons.map(l=>l.question)).size,10);
 for(const l of lessons){for(const key of ['technical','simple'])assert.ok(l[key].length>=250,`${l.id}: ${key} ausreichend erklärt`);assert.notEqual(l.technical,l.simple);assert.ok(l.sources.length);for(const u of l.sources)assert.equal(new URL(u).protocol,'https:');}}
 assert.equal(curriculumLibrary.cards.length,80);
 for(const d of curriculumLibrary.documents){assert.ok(d.sections.length>=100);assert.equal(d.visualSteps.length,4);assert.ok(fs.existsSync(path.join('public',d.imageUrl)));for(const r of d.resources)if(r.url.startsWith('/'))assert.ok(fs.existsSync(path.join('public',r.url)),r.url)}
});
test('Quizfragen haben genau eine richtige, eindeutig unterscheidbare Antwort und vollständige Auflösung',()=>{
 const ids=new Set();for(const q of curriculumLibrary.quizzes){assert.ok(q.questions.length>=100);const positions=new Set();for(const item of q.questions){assert.ok(!ids.has(item.id));ids.add(item.id);assert.equal(item.answers.filter(a=>a.isCorrect).length,1);assert.equal(new Set(item.answers.map(a=>a.text)).size,3);assert.ok(item.explanation&&item.simpleExplanation&&item.source);positions.add(item.answers.findIndex(a=>a.isCorrect));}assert.equal(positions.size,3)}
});
test('Inhaltsmigration ist wiederholbar und bewahrt redaktionelle Bearbeitungen',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'curriculum-test-'));process.env.MEDLEARN_DATA_DIR=dir;
 const {editorialDb}=load('src/lib/server/editorial.ts');const db=editorialDb();try{
 const rows=()=>db.prepare("SELECT data FROM editorial_content WHERE id LIKE '%:de-basis-%'").all();assert.equal(rows().length,104);
 const record=JSON.parse(rows()[0].data);record.data.title='Eigene redaktionelle Änderung';record.revision=2;
 db.prepare('UPDATE editorial_content SET data=? WHERE id=?').run(JSON.stringify(record),record.id);
 db.prepare("DELETE FROM editorial_meta WHERE key='curriculum-de-v1'").run();editorialDb();editorialDb();assert.equal(rows().length,104);
 assert.deepEqual(JSON.parse(db.prepare('SELECT data FROM editorial_content WHERE id=?').get(record.id).data),record);
 }finally{db.close();fs.rmSync(dir,{recursive:true,force:true})}
});
