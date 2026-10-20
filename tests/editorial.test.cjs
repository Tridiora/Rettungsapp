const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),Module=require('node:module'),ts=require('typescript');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));cache.set(file,mod);const native=mod.require.bind(mod);mod.require=request=>{const target=request.startsWith('@/')?path.resolve('src',request.slice(2)):request.startsWith('.')?path.resolve(path.dirname(file),request):null;return target&&fs.existsSync(target+'.ts')?load(target+'.ts'):native(request)};mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return mod.exports}
test('Gruppenrechte, Klassenisolation, sofortiger Rechteentzug und globale Freigabe',async()=>{
 process.env.MEDLEARN_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'medlearn-editorial-'));
 const {database}=load('src/lib/server/database.ts'),db=database(),session=load('src/app/api/session/route.ts'),accounts=load('src/app/api/accounts/route.ts'),groups=load('src/app/api/groups/route.ts'),content=load('src/app/api/editorial/route.ts');
 const req=(method,body,cookie='',url='http://localhost:3000/api/editorial')=>new Request(url,{method,headers:{origin:'http://localhost:3000',cookie,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const password=fs.readFileSync(path.join(process.env.MEDLEARN_DATA_DIR,'ERSTER-ADMIN.txt'),'utf8').match(/Passwort: (.+)/)[1];
 async function login(email,pw=password){const r=await session.POST(req('POST',{email,password:pw}));assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0]}
 try {
 const admin=await login('admin@medlearn.local'),users=[];
 for(const name of ['teacher','studentA','studentB']){const r=await accounts.POST(req('POST',{name,email:name+'@example.test',password:'test-only-password',role:'learner'},admin));assert.equal(r.status,201);users.push(await r.json())}
 const [teacher,a,b]=await Promise.all(users.map(u=>login(u.email,'test-only-password')));
 const g={id:'teachers',name:'Lehrer',kind:'role',members:[users[0].id],permissions:['create','editOwn','publishClass']};
 assert.equal((await groups.POST(req('POST',g,teacher))).status,403);
 assert.equal((await groups.POST(req('POST',g,admin))).status,200);
 await groups.POST(req('POST',{id:'class-a',name:'Klasse A',kind:'class',members:[users[0].id,users[1].id],permissions:[]},admin));
 await groups.POST(req('POST',{id:'class-b',name:'Klasse B',kind:'class',members:[users[2].id],permissions:[]},admin));
 const draft={kind:'glossary',scope:'class',classId:'class-a',status:'published',reviewed:true,data:{term:'Hallo',aliases:['Hallo'],explanation:'Hallo ist eine Begrüßung. Mit diesem Beispiel prüfen wir, dass eine ausführliche Erklärung nur für die richtige Klasse sichtbar ist und Änderungen an einer einzigen Stelle gepflegt werden können.',source:'Eigene Bedienungsprobe'}};
 assert.equal((await content.POST(req('POST',draft,a))).status,403);
 assert.equal((await content.POST(req('POST',{...draft,classId:'class-b'},teacher))).status,403);
 assert.equal((await content.POST(req('POST',{...draft,scope:'global',classId:''},teacher))).status,403);
 const saved=await content.POST(req('POST',draft,teacher));assert.equal(saved.status,200);const row=await saved.json();
 const list=async cookie=>(await(await content.GET(req('GET',undefined,cookie))).json()).records;
 assert.ok((await list(a)).some(r=>r.id===row.id));assert.ok(!(await list(b)).some(r=>r.id===row.id));assert.ok(!(await list('')).some(r=>r.id===row.id));
 assert.equal((await content.POST(req('POST',{...row,reviewed:true,revision:0},teacher))).status,409);
 assert.equal((await content.POST(req('POST',{...draft,scope:'global',classId:'',status:'review'},teacher))).status,200);
 const global=await content.POST(req('POST',{...draft,scope:'global',classId:''},admin));assert.equal(global.status,409); // existing review must be edited, never ambiguously duplicated
 await groups.POST(req('POST',{...g,permissions:[]},admin));
 assert.equal((await content.POST(req('POST',{...row,reviewed:true},teacher))).status,403);
 assert.equal((await content.POST(req('POST',{...row,reviewed:true,data:{...row.data,source:'javascript:alert(1)'}},admin))).status,400);
 }finally{db.close()}
});
test('Zentrale Begriffe: Wortgrenzen, Großschreibung, Alias und längster Treffer',()=>{
 const {splitTerms}=load('src/lib/learning-glossary.ts');
 const entries=[{term:'Hallo',aliases:['Hallo','Guten Tag'],explanation:'Begrüßung',source:''},{term:'Hallo Welt',aliases:['Hallo Welt'],explanation:'Beispiel',source:''}];
 const parts=splitTerms('HALLO! Halloberge, Hallo Welt. Guten Tag.',entries);
 assert.deepEqual(parts.filter(p=>p.index!==undefined).map(p=>[p.text,p.index]),[['HALLO',0],['Hallo Welt',1],['Guten Tag',0]]);
});
test('Alle vorhandenen Glossarbegriffe besitzen ausführliche Fassungen',()=>{
 const {glossary}=load('src/lib/learning-glossary.ts'),{detailedExplanations}=load('src/lib/detailed-explanations.ts');
 for(const entry of glossary)assert.ok(detailedExplanations[entry.term]?.length>=180,entry.term);
});
