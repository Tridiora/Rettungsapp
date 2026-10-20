const {test}=require('node:test'),assert=require('node:assert/strict');
const {load}=require('../scripts/load-typescript.cjs');
const {apiJson}=load('src/lib/api-client.ts');
test('API: Netzwerkfehler und Proxy-HTML sind verständlich, Schreibzugriffe werden nicht wiederholt',async t=>{
 let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;throw new TypeError('Failed to fetch')});
 await assert.rejects(apiJson('/api/session',{method:'POST'}),/Verbindung zur App wurde unterbrochen/);assert.equal(calls,1);
 globalThis.fetch=async()=>new Response('<html>GitHub login</html>',{headers:{'Content-Type':'text/html'}});
 await assert.rejects(apiJson('/api/session'),/Port 3000/);
 globalThis.fetch=async()=>Response.json({error:'E-Mail oder Passwort ist nicht korrekt.'},{status:401});
 await assert.rejects(apiJson('/api/session'),/Passwort ist nicht korrekt/);
});
test('API: langsame Anfrage endet nach 20 Sekunden mit verständlicher Meldung',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 t.mock.method(globalThis,'fetch',(_url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')))));
 const request=apiJson('/api/editorial');const check=assert.rejects(request,/Server antwortet zu langsam/);t.mock.timers.tick(20000);await check;
});
test('Inhalte: Verbindungsfehler erhalten Daten, Sitzungswechsel verwirft verspätete Antworten',async t=>{
 const {useEditorialStore:store}=load('src/stores/editorial-store.ts');
 t.mock.method(globalThis,'fetch',async()=>Response.json({records:[{id:'published'}]}));await store.getState().refresh();
 globalThis.fetch=async()=>{throw new TypeError('Failed to fetch')};await store.getState().refresh();assert.equal(store.getState().records[0].id,'published');assert.match(store.getState().error,/Verbindung/);
 let finish;globalThis.fetch=()=>new Promise(resolve=>{finish=resolve});const pending=store.getState().refresh();store.getState().reset();finish(Response.json({records:[{id:'old-private-data'}]}));await pending;assert.equal(store.getState().records,null);
});
