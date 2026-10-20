const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{EventEmitter}=require('node:events');
const filename=require('node:path').resolve('scripts/codespaces-start.cjs'),source=fs.readFileSync(filename,'utf8');
async function execute({buildFails=false,updated=false}={}){
 const calls=[];let reads=0;
 const modules={
  'node:fs':{readFileSync:p=>p===filename?(++reads>1&&updated?'updated startup':source):'{}',existsSync:p=>p==='node_modules/next',mkdirSync(){},writeFileSync(){},openSync:()=>1,closeSync(){}},
  'node:path':require('node:path'),'node:crypto':require('node:crypto'),
  'node:net':{connect:()=>{const socket=new EventEmitter();socket.destroy=()=>{};queueMicrotask(()=>socket.emit('error'));return socket}},
  'node:child_process':{spawnSync:(cmd,args)=>{calls.push([cmd,args]);return {status:buildFails&&args.join(' ')==='run build'?1:0,stdout:args.includes('--show-current')?'main':''}},spawn:(cmd,args,options)=>{calls.push(['server',args,options]);return {on(){},unref(){}}}}
 };
 const context={require:n=>modules[n],__filename:filename,__dirname:require('node:path').dirname(filename),console:{log(){},error(){}},process:{chdir(){},env:{CODESPACES:'true'},execPath:'node',version:'test',platform:'linux',arch:'x64'},fetch:async()=>({ok:true}),AbortSignal,setTimeout};
 vm.runInNewContext(source.replace('main().catch(error=>{console.error(error.message);process.exitCode=1});','globalThis.result=main();'),context);
 try{await context.result;return calls}catch(error){return {calls,error}}
}
test('Codespace baut vor dem Produktionsstart und öffnet keinen Entwicklungsserver',async()=>{
 const calls=await execute(),build=calls.findIndex(c=>c[1].join(' ')==='run build'),server=calls.findIndex(c=>c[0]==='server');assert.ok(build>=0&&server>build);assert.equal(calls[server][1][1],'start');assert.equal(calls[server][2].env.NODE_ENV,'production');
});
test('Fehlgeschlagener Build startet keinen veralteten Server',async()=>{const {calls,error}=await execute({buildFails:true});assert.ok(error);assert.ok(!calls.some(c=>c[0]==='server'))});
test('Nach einem Update wird das neue Startskript ausgeführt',async()=>{const calls=await execute({updated:true});assert.ok(calls.some(c=>c[0]==='node'&&c[1][0]===filename));assert.ok(!calls.some(c=>c[0]==='server'))});
