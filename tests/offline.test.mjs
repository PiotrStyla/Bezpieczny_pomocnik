import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {PUBLIC_FILES} from '../scripts/public-files.mjs';
const code=await readFile(new URL('../frontend/sw.js',import.meta.url),'utf8');
function worker({failInstall=false}={}){
  const events={},records=new Map(),deleted=[];
  const scope='https://example.test/Bezpieczny_pomocnik/';
  const cache={async addAll(requests){if(failInstall)throw Error('disk full');for(const req of requests)records.set(req.url,{ok:true});},async match(req){return records.get(typeof req==='string'?req:req.url);}};
  const self={registration:{scope},location:{origin:'https://example.test'},addEventListener(name,fn){events[name]=fn;},async skipWaiting(){self.skipped=true;},clients:{async claim(){}}};
  vm.runInNewContext(code,{self,URL,Request,Set,caches:{async open(){return cache;},async keys(){return ['unrelated-app','bp-v2:'+scope+':old'];},async delete(key){deleted.push(key);}},fetch(){throw Error('network unavailable');}});
  return {events,records,deleted,self};
}
const runEvent=(handler,extra={})=>{let work;handler({waitUntil(p){work=p;},...extra});return work;};
test('offline shell installs every public runtime dependency atomically',async()=>{
  const w=worker();await runEvent(w.events.install);
  assert.ok(w.self.skipped);
  for(const file of PUBLIC_FILES.filter(f=>f!=='sw.js'))assert.ok(w.records.has('https://example.test/Bezpieczny_pomocnik/'+file),file);
});
test('failed cache install does not report readiness or activate partial shell',async()=>{
  const w=worker({failInstall:true});await assert.rejects(runEvent(w.events.install));assert.ok(!w.self.skipped);
  const messages=[];await runEvent(w.events.message,{data:{type:'BP_CHECK_READY'},ports:[{postMessage:m=>messages.push(m)}]});assert.equal(messages.length,0);
});
test('activation only removes this scope old cache, never another app cache',async()=>{
  const w=worker();await runEvent(w.events.activate);assert.deepEqual(w.deleted,['bp-v2:https://example.test/Bezpieczny_pomocnik/:old']);
});
test('offline navigation returns cached HTML and does not generate alerts',async()=>{
  const w=worker();await runEvent(w.events.install);let result;
  w.events.fetch({request:new Request('https://example.test/Bezpieczny_pomocnik/'),respondWith:p=>{result=p;}});
  assert.ok((await result).ok);
  assert.equal(w.events.push,undefined);
});
test('weather API and unrelated origin are never cached or intercepted',()=>{
  const w=worker();let intercepted=false;
  for(const url of ['https://danepubliczne.imgw.pl/api/data/warningsmeteo','https://example.test/other-app/index.html','https://example.test/Bezpieczny_pomocnik/app.js']){
    w.events.fetch({request:new Request(url),respondWith:()=>{intercepted=true;}});
  }
  assert.equal(intercepted,false);
});
test('direct hash routes open offline at the root and explicit index',async()=>{
  const w=worker();await runEvent(w.events.install);
  for(const path of ['#plan','index.html#parent','index.html#learn']){
    let result;
    w.events.fetch({request:new Request('https://example.test/Bezpieczny_pomocnik/'+path),respondWith:p=>{result=p;}});
    assert.ok((await result)?.ok,path);
  }
});
