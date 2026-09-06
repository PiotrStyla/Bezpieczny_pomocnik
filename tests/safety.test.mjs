import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePhone,sanitizeFamily,loadFamily,escapeHTML,parseWarnings,parseWarningResponse,warsawTime,LESSONS} from '../frontend/v2/safety.mjs';
import {home,plan,parent} from '../frontend/v2/views.mjs';
const now=Date.parse('2026-09-05T20:00:00Z');
const warning={id:'fixture',nazwa_zdarzenia:'Silny wiatr',stopien:'2',tresc:'Test fixture — not a live alert',obowiazuje_od:'2026-09-05 18:00:00',obowiazuje_do:'2026-09-06 06:00:00',teryt:['3207']};
test('phone links reject injected schemes, controls and dial codes',()=>{
  for(const invalid of ['javascript:alert(1)','112','+48 123;456789','*123#','123456789\n<script>','1234567890123456'])assert.equal(normalizePhone(invalid),'');
  assert.equal(normalizePhone('+48 (123) 456-789'),'+48123456789');
});
test('corrupt, unavailable or wrong-shaped storage never blocks the app',()=>{
  for(const storage of [null,{getItem(){throw Error('denied');}},{getItem(){return '{broken';}},{getItem(){return 'null';}}]){
    assert.equal(loadFamily(storage).phone,'');
    assert.doesNotThrow(()=>home(loadFamily(storage),new Set()));
  }
});
test('family model minimises, bounds and validates stored values',()=>{
  const f=sanitizeFamily({region:'99',phone:'javascript:123456789',contactName:'A'.repeat(100),meeting:'x'.repeat(500),latitude:50,childName:'private'});
  assert.equal(f.region,'');assert.equal(f.phone,'');assert.equal(f.contactName.length,40);assert.equal(f.meeting.length,180);assert.equal(f.latitude,undefined);assert.equal(f.childName,undefined);
});
test('family text cannot become markup in plan or input fields',()=>{
  const value='"><img src=x onerror=alert(1)>';
  const f=sanitizeFamily({contactName:value,phone:'+48123456789',meeting:value,note:value});
  for(const markup of [plan(f),parent(f)]){assert.ok(!markup.includes('<img src=x'));assert.ok(markup.includes('&lt;img'));}
  assert.equal(escapeHTML('<script>'), '&lt;script&gt;');
});
test('Polish timestamps convert correctly in summer and winter',()=>{
  assert.equal(warsawTime('2026-09-06 06:00:00'),Date.parse('2026-09-06T04:00:00Z'));
  assert.equal(warsawTime('2026-01-06 06:00:00'),Date.parse('2026-01-06T05:00:00Z'));
  assert.ok(Number.isNaN(warsawTime('invalid')));
});
test('warnings filter by TERYT region, not guessed device location',()=>{
  assert.equal(parseWarnings([warning],'32',now).length,1);
  assert.equal(parseWarnings([warning],'12',now).length,0);
});
test('expired warnings disappear, future warnings remain labelled upcoming',()=>{
  assert.equal(parseWarnings([warning],'32',Date.parse('2026-09-06T04:00:00Z')).length,0);
  const future=parseWarnings([{...warning,obowiazuje_od:'2026-09-06 02:00:00'}],'32',now)[0];
  assert.equal(future.upcoming,true);
});
test('bad source payload fails closed instead of returning no warnings',()=>{
  for(const data of [{error:'upstream'},[null],[{...warning,teryt:null}],[{...warning,obowiazuje_do:'invalid'}],[{...warning,stopien:'9'}],[{...warning,teryt:['javascript:32']}]]){
    assert.throws(()=>parseWarnings(data,'32',now));
  }
});
test('only an explicit empty source array is an empty result',()=>{
  assert.deepEqual(parseWarnings([],'32',now),[]);
  assert.deepEqual(parseWarnings({status:false,message:'No products were found'},'32',now),[]);
  assert.throws(()=>parseWarnings({status:false,message:'Internal error'},'32',now));
  assert.throws(()=>parseWarnings([],'missing',now));
});
test('four lessons have valid distinct ids and answer keys',()=>{
  assert.equal(new Set(LESSONS.map(l=>l.id)).size,4);
  for(const lesson of LESSONS){assert.ok(lesson.answers[lesson.correct]);assert.ok(lesson.explanation.length>80);}
});
test('IMGW HTTP 404 empty-product response is distinct from an HTTP failure',()=>{
  const empty={status:false,message:'No products were found'};
  assert.deepEqual(parseWarningResponse(404,empty,'32',now),[]);
  assert.throws(()=>parseWarningResponse(500,empty,'32',now));
  assert.throws(()=>parseWarningResponse(404,{message:'Not found'},'32',now));
  assert.equal(parseWarningResponse(200,[warning],'32',now).length,1);
});
