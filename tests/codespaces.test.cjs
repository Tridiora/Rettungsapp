const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));cache.set(file,mod);const native=mod.require.bind(mod);mod.require=request=>{const target=request.startsWith('@/')?path.resolve('src',request.slice(2)):request.startsWith('.')?path.resolve(path.dirname(file),request):null;return target&&fs.existsSync(target+'.ts')?load(target+'.ts'):native(request)};mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return mod.exports}
test('Codespaces: nur die eigene HTTPS-Vorschau darf schreibende Anfragen stellen',()=>{
 const {codespaceOrigin}=load('src/lib/server/app-origin.ts');
 assert.equal(codespaceOrigin({}),undefined);
 assert.equal(codespaceOrigin({CODESPACES:'true',CODESPACE_NAME:'demo',GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:'evil.test/path'}),undefined);
 const names=['CODESPACES','CODESPACE_NAME','GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN'];
 const previous=Object.fromEntries(names.map(n=>[n,process.env[n]]));
 try{
  Object.assign(process.env,{CODESPACES:'true',CODESPACE_NAME:'test-space',GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:'app.github.dev'});
  const {sameOrigin}=load('src/lib/server/security.ts');
  const req=origin=>new Request('http://localhost:3000/api/session',{headers:{origin,'x-forwarded-host':'foreign.example'}});
  assert.doesNotThrow(()=>sameOrigin(req('https://test-space-3000.app.github.dev')));
  for(const origin of ['https://other-space-3000.app.github.dev','http://test-space-3000.app.github.dev','https://foreign.example','http://localhost:3000','null'])assert.throws(()=>sameOrigin(req(origin)),e=>e.status===403);
  delete process.env.CODESPACES;
  assert.doesNotThrow(()=>sameOrigin(req('http://localhost:3000')));
  assert.throws(()=>sameOrigin(req('https://test-space-3000.app.github.dev')),e=>e.status===403);
 }finally{for(const name of names)if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name]}
});

test('Proxy: browserbestätigte eigene Herkunft funktioniert ohne Codespaces-Umgebung',()=>{
 const {sameOrigin}=load('src/lib/server/security.ts');
 const preview='https://actual-space-3000.app.github.dev';
 const req=(origin,site)=>new Request('http://localhost:3000/api/session',{headers:{...(origin===undefined?{}:{origin}),...(site===undefined?{}:{'sec-fetch-site':site}),'x-forwarded-host':'attacker.example'}});
 assert.equal(sameOrigin(req(preview,'same-origin')),preview);
 for(const site of ['cross-site','same-site','none','unexpected'])assert.throws(()=>sameOrigin(req(preview,site)),e=>e.status===403);
 for(const origin of [undefined,'null','https://actual-space-3000.app.github.dev/path','file://','not-a-url'])assert.throws(()=>sameOrigin(req(origin,'same-origin')),e=>e.status===403);
 assert.throws(()=>sameOrigin(req(preview,undefined)),e=>e.status===403);
 assert.throws(()=>sameOrigin(req('http://localhost:3000','cross-site')),e=>e.status===403);
});

test('Proxy: Login, Admin-Sitzung und Logout trotz interner localhost-Adresse',async()=>{
 const os=require('node:os');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'codespaces-session-'));
 process.env.MEDLEARN_DATA_DIR=dir;
 const {database}=load('src/lib/server/database.ts'),db=database();
 const session=load('src/app/api/session/route.ts');
 const password=fs.readFileSync(path.join(dir,'ERSTER-ADMIN.txt'),'utf8').match(/Passwort: (.+)/)[1].trim();
 const req=(method,site='same-origin',cookie='',body)=>new Request('http://localhost:3000/api/session',{method,headers:{origin:'https://actual-space-3000.app.github.dev','sec-fetch-site':site,cookie,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 try {
  const credentials={email:'admin@medlearn.local',password};
  assert.equal((await session.POST(req('POST','cross-site','',credentials))).status,403);
  assert.equal((await session.POST(req('POST','same-origin','',{...credentials,password:'wrong-password'}))).status,401);
  const response=await session.POST(req('POST','same-origin','',credentials));assert.equal(response.status,200);
  const cookie=response.headers.get('set-cookie');assert.match(cookie,/; Secure/);assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);
  const token=cookie.split(';')[0];
  assert.equal((await(await session.GET(req('GET','same-origin',token))).json()).user.role,'admin');
  assert.equal((await session.DELETE(req('DELETE','same-site',token))).status,403);
  assert.equal((await session.DELETE(req('DELETE','same-origin',token))).status,200);
  assert.equal((await(await session.GET(req('GET','same-origin',token))).json()).user,null);
 } finally {db.close();delete process.env.MEDLEARN_DATA_DIR;}
});
