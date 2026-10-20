const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),Module=require('node:module'),ts=require('typescript');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));cache.set(file,mod);const native=mod.require.bind(mod);mod.require=request=>{const target=request.startsWith('@/')?path.resolve('src',request.slice(2)):request.startsWith('.')?path.resolve(path.dirname(file),request):null;return target&&fs.existsSync(target+'.ts')?load(target+'.ts'):native(request)};mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return mod.exports}
test('Medien: echte Berechtigungen, Freigabe, Versionskonflikt und private Markierungen',async()=>{
  process.env.MEDLEARN_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'medlearn-test-'));
  const db=load('src/lib/server/database.ts').database();
  const session=load('src/app/api/session/route.ts'),accounts=load('src/app/api/accounts/route.ts'),media=load('src/app/api/media/route.ts'),item=load('src/app/api/media/[id]/route.ts'),notes=load('src/app/api/media/[id]/notes/route.ts'),fileRoute=load('src/app/api/media/[id]/file/route.ts');
  const req=(method='GET',body,cookie='',origin='http://localhost:3000')=>new Request('http://localhost:3000/api/media',{method,headers:{origin,cookie,...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});
  try{
    const password=fs.readFileSync(path.join(process.env.MEDLEARN_DATA_DIR,'ERSTER-ADMIN.txt'),'utf8').match(/Passwort: (.+)/)[1];
    const auth=await session.POST(req('POST',{email:'admin@medlearn.local',password}));assert.equal(auth.status,200);const admin=auth.headers.get('set-cookie').split(';')[0];
    assert.match(auth.headers.get('set-cookie'),/HttpOnly/);
    assert.equal((await media.POST(req('POST',{},'role=admin'))).status,401);
    assert.equal((await accounts.POST(req('POST',{name:'Lernkonto',email:'lernen@example.test',password:'test-only-long-password',role:'learner'},admin))).status,201);
    const learner=(await session.POST(req('POST',{email:'lernen@example.test',password:'test-only-long-password'}))).headers.get('set-cookie').split(';')[0];
    assert.equal((await media.POST(req('POST',{},learner))).status,403);
    assert.equal((await accounts.GET(req('GET',undefined,learner))).status,403);
    assert.equal((await media.POST(req('POST',{},admin,'https://foreign.example'))).status,403);
    const form=new FormData();for(const [key,value]of Object.entries({title:'Test-PDF',category:'Bedienungsprobe',source:'Eigene Testdatei',rights:'Eigene Datei',sourceDate:'2026-10-19',technical:'Technischer Begleittext',simple:'Einfacher Begleittext'}))form.set(key,value);
    form.set('file',new Blob(['<script>unsafe</script>'],{type:'application/pdf'}),'fake.pdf');assert.equal((await media.POST(req('POST',form,admin))).status,400);
    form.set('file',new Blob(['%PDF-1.4\n%%EOF'],{type:'application/pdf'}),'test.pdf');const uploaded=await media.POST(req('POST',form,admin));assert.equal(uploaded.status,201);let m=await uploaded.json();const context={params:Promise.resolve({id:m.id})};
    assert.equal((await media.GET(req())).status,200);assert.equal((await(await media.GET(req())).json()).length,0);
    assert.equal((await fileRoute.GET(req(),context)).status,404);
    assert.equal((await item.PATCH(req('PATCH',{...m,status:'published',reviewed:false},admin),context)).status,400);
    const published=await item.PATCH(req('PATCH',{...m,status:'published',reviewed:true},admin),context);assert.equal(published.status,200);
    assert.equal((await item.PATCH(req('PATCH',{...m,status:'published',reviewed:true},admin),context)).status,409);
    m=await published.json();assert.equal((await(await media.GET(req())).json()).length,1);assert.equal((await fileRoute.GET(req(),context)).status,200);
    const saved=await notes.POST(req('POST',{page:1,x:.1,y:.2,width:.3,height:.1,color:'#facc15',text:'Privat'},learner),context);assert.equal(saved.status,201);const note=await saved.json();
    assert.equal((await(await notes.GET(req('GET',undefined,admin),context)).json()).length,0);
    await notes.DELETE(req('DELETE',{id:note.id},admin),context);
    assert.equal((await(await notes.GET(req('GET',undefined,learner),context)).json()).length,1);
    assert.equal((await notes.GET(req(),context)).status,401);
    assert.equal((await notes.POST(req('POST',{page:1,x:.9,y:0,width:.5,height:.2,color:'#facc15',text:''},learner),context)).status,400);
    const replace=load('src/app/api/media/[id]/replace/route.ts');
    const replacement=new FormData();replacement.set('revision',String(m.revision));replacement.set('file',new Blob(['%PDF-1.4\n% revised file\n%%EOF'],{type:'application/pdf'}),'replacement.pdf');
    assert.equal((await replace.POST(req('POST',replacement,learner),context)).status,403);
    const replaced=await replace.POST(req('POST',replacement,admin),context);assert.equal(replaced.status,200);m=await replaced.json();
    assert.equal(m.fileRevision,2);assert.equal(m.status,'draft');assert.equal((await fileRoute.GET(req(),context)).status,404);
    assert.equal((await replace.POST(req('POST',replacement,admin),context)).status,409);
    assert.equal((await item.PATCH(req('PATCH',{...m,status:'published',reviewed:true},admin),context)).status,200);
    assert.equal((await(await notes.GET(req('GET',undefined,learner),context)).json()).length,0);
    await session.DELETE(req('DELETE',undefined,learner));assert.equal((await notes.GET(req('GET',undefined,learner),context)).status,401);
    assert.ok(db.prepare('SELECT count(*) AS n FROM audit').get().n>=2);
  }finally{db.close();/* Isolated test directory retained for diagnosis; no production data is touched. */}
});
