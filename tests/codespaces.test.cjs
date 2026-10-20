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
