const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {load}=require('../scripts/load-typescript.cjs');
const {expandedTopics,expandedLibrary}=load('src/lib/curriculum/expanded.ts');
const {curriculumLibrary}=load('src/lib/curriculum/index.ts');
const {questionsForYear}=load('src/lib/learning-filters.ts');
test('Jedes Fachgebiet hat mindestens 100 unterschiedliche Zusatzfragen und jede Auflösung ein vorhandenes Erklärbild',()=>{
 assert.equal(expandedTopics.length,8);assert.equal(expandedLibrary.cards.length,820);
 for(const topic of expandedTopics){assert.ok(topic.facts.length>=100);assert.equal(new Set(topic.facts.map(f=>f.question)).size,topic.facts.length);}
 for(const q of curriculumLibrary.quizzes){assert.ok(q.questions.length>=100);for(const year of [1,2,3])assert.ok(questionsForYear(q,year).length>=20,`${q.title}, Jahr ${year}`);for(const item of q.questions){assert.ok(fs.existsSync(path.join('public',item.explanationImageUrl)));assert.equal(item.answers.filter(a=>a.isCorrect).length,1)}}
 for(const card of [...expandedLibrary.cards,...curriculumLibrary.cards])assert.ok(card.explanationImageUrl&&fs.existsSync(path.join('public',card.explanationImageUrl)));
});
test('Lehrjahrfilter trennt Fragen wirklich und lässt alte unzugeordnete Inhalte nur im ersten Jahr zu',()=>{
 const quiz={yearLevel:undefined,questions:[{id:'old'},{id:'one',yearLevel:1},{id:'two',yearLevel:2},{id:'three',yearLevel:3}]};
 assert.deepEqual(questionsForYear(quiz,1).map(q=>q.id),['old','one']);assert.deepEqual(questionsForYear(quiz,2).map(q=>q.id),['two']);assert.deepEqual(questionsForYear(quiz,3).map(q=>q.id),['three']);assert.equal(questionsForYear(quiz,'all').length,4);
});
test('Elf Anatomiebereiche besitzen eigene Skizze, Video und deutsche Untertitel',()=>{
 const {anatomyModels}=load('src/lib/anatomy-data.ts');assert.equal(anatomyModels.length,11);
 for(const m of anatomyModels)for(const ext of ['svg','mp4','vtt'])assert.ok(fs.statSync(`public/anatomie/eigen/${m.id}.${ext}`).size>50);
});
test('Neue Migration bleibt wiederholbar und überschreibt keine redaktionell geänderten Inhalte',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'beta-migration-'));process.env.MEDLEARN_DATA_DIR=dir;
 const {editorialDb}=load('src/lib/server/editorial.ts');const db=editorialDb();try{
 const id='cards:beta-anatomy-001';const row=JSON.parse(db.prepare('SELECT data FROM editorial_content WHERE id=?').get(id).data);row.revision=2;row.data.back='Redaktionell geprüft';db.prepare('UPDATE editorial_content SET data=? WHERE id=?').run(JSON.stringify(row),id);
 const count=db.prepare('SELECT count(*) AS n FROM editorial_content').get().n;
 db.prepare("DELETE FROM editorial_meta WHERE key='beta-curriculum-v2'").run();editorialDb();editorialDb();assert.equal(db.prepare('SELECT count(*) AS n FROM editorial_content').get().n,count);assert.deepEqual(JSON.parse(db.prepare('SELECT data FROM editorial_content WHERE id=?').get(id).data),row);
 }finally{db.close();fs.rmSync(dir,{recursive:true,force:true})}
});
