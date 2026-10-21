/* Isolated export: never move/delete the server application's API routes. */
const fs = require('node:fs'), path = require('node:path'), {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..'), work = path.join(root, '.beta-build');
process.chdir(root);
const {load} = require('./load-typescript.cjs');
const {curriculumLibrary} = load('src/lib/curriculum/index.ts');
const {expandedLibrary} = load('src/lib/curriculum/expanded.ts');
const {germanStarter} = load('src/lib/db/german-starter.ts');
const {anatomyModels} = load('src/lib/anatomy-data.ts');
const {glossary} = load('src/lib/learning-glossary.ts');
const {detailedExplanations} = load('src/lib/detailed-explanations.ts');
fs.rmSync(work, {recursive:true, force:true}); fs.mkdirSync(work);
for(const file of ['src','public','next.config.ts','tsconfig.json','package.json','scripts']) fs.cpSync(path.join(root,file),path.join(work,file),{recursive:true});
fs.symlinkSync(path.join(root,'node_modules'),path.join(work,'node_modules'),'junction');
fs.rmSync(path.join(work,'src/app/api'),{recursive:true});
for(const dir of ['verwaltung','medien']) {
 fs.rmSync(path.join(work,'src/app',dir),{recursive:true}); fs.mkdirSync(path.join(work,'src/app',dir));
 fs.writeFileSync(path.join(work,'src/app',dir,'page.tsx'),`import Link from 'next/link'; export default function Page(){return <section className="p-8 space-y-4"><h1 className="text-2xl font-bold">Lern-Beta</h1><p>Konten, zentrale Redaktion und Uploads stehen in der Serverversion zur Verfügung. Diese Beta speichert deinen Lernfortschritt lokal in diesem Browser.</p><Link href="/dashboard">Zur Lernübersicht</Link></section>}`);
}
// No database, account, private content or uploaded media is exported.
const records=[];
function add(kind,data){records.push({id:kind+':'+data.id,kind,data,ownerId:'system',scope:'global',classId:'',status:'published',revision:1})}
for(const library of [germanStarter,curriculumLibrary,expandedLibrary])for(const [kind,items] of Object.entries(library))for(const item of items)if(item.publication==='published' && (kind!=='quizzes'||item.questions.length>=20))add(kind,item);
for(const model of anatomyModels)add('anatomy',model);
glossary.forEach((item,i)=>add('glossary',{...item,id:String(i),explanation:detailedExplanations[item.term]||item.explanation}));
for(const row of records)if(row.kind==='documents'&&row.data.resources)row.data={...row.data,resources:row.data.resources.filter(r=>!r.url.includes('herz.webm'))};
for(const file of ['herz.webm','skelett.png','gehirn.svg'])fs.rmSync(path.join(work,'public/anatomie',file),{force:true});
fs.writeFileSync(path.join(work,'public/beta-content.json'),JSON.stringify({records}));
const result=spawnSync(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'build'],{cwd:work,stdio:'inherit',env:{...process.env,NEXT_PUBLIC_LEARNING_BETA:'1'}});
if(result.status!==0)process.exit(result.status||1);
const out=path.join(root,'dist-infinityfree'); fs.rmSync(out,{recursive:true,force:true});fs.renameSync(path.join(work,'out'),out);
fs.writeFileSync(path.join(out,'.htaccess'),'DirectoryIndex index.html\nErrorDocument 404 /404.html\nOptions -Indexes\n<IfModule mod_headers.c>\n<FilesMatch "\\.(html|json)$">\nHeader set Cache-Control "no-cache"\n</FilesMatch>\n</IfModule>\n');
const oversized=[];function check(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())check(f);else if(fs.statSync(f).size>10*1024*1024)oversized.push(path.relative(out,f))}}check(out);
if(oversized.length){console.error('Dateien über 10 MiB; Hosting-Limit prüfen:',oversized);process.exit(1)}
fs.writeFileSync(path.join(out,'BETA-INFO.txt'),'MedLearn Lern-Beta\nDen gesamten Inhalt dieses Ordners nach htdocs hochladen, einschließlich _next und .htaccess.\nLernfortschritt: nur lokal im Browser. Kein Serverlogin, keine zentrale Redaktion.\nMedizinische Inhalte: Lernmaterial in fachlicher Erprobung, keine Einsatz-SOP.\n');
console.log('InfinityFree-Paket: dist-infinityfree ('+records.length+' öffentliche Inhaltsdatensätze).');
