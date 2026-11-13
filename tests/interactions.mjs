import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const site = new URL('../site/',import.meta.url);
const realDate = Date;
class FrozenDate extends Date {
  constructor(...args){ super(...(args.length?args:['2026-11-19T12:00:00Z'])); }
  static now(){ return realDate.parse('2026-11-19T12:00:00Z'); }
}
const quietCanvas = new Proxy({}, { get(_obj,key){
  if(key==='createLinearGradient'||key==='createRadialGradient')return ()=>({addColorStop(){}});
  if(key==='measureText')return ()=>({width:20});
  if(key==='getImageData')return ()=>({data:new Uint8ClampedArray(4)});
  return ()=>{};
},set(){return true}});
function classList(){const names=new Set();return {add:v=>names.add(v),remove:v=>names.delete(v),contains:v=>names.has(v),toggle(v,force){if(force??!names.has(v))names.add(v);else names.delete(v)}}}
function fakePage(page,storage=new Map(),extra={}){
 const html=fs.readFileSync(new URL(page,site),'utf8');
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script,`missing inline script for ${page}`);
 const elements=new Map(); const buttons=[];
 function elem(id=''){
  if(elements.has(id))return elements.get(id);
  const e={id,textContent:'',innerHTML:'',value:'',style:{},dataset:{},attributes:{},classList:classList(),clientWidth:375,clientHeight:667,
   setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]},addEventListener(event,cb){(this.listeners??={})[event]=cb},
   append(_child){},remove(){},focus(){},click(){this.onclick?.()},getContext(){return quietCanvas},toDataURL(){return 'data:image/png;base64,AA=='}};
  elements.set(id,e);return e;
 }
 for(const match of html.matchAll(/\bid="([^"]+)"/g))elem(match[1]);
 function querySelectorAll(query){
  if(query==='[data-page]'||query==='[data-mode]'){
   const prop=query==='[data-page]'?'page':'mode';
   return [...html.matchAll(new RegExp(`<button\\s+data-${prop}="([^"]+)"`, 'g'))].map(m=>{
    const b=elem(`button-${prop}-${m[1]}`);b.dataset[prop]=m[1];return b;
   });
  }
  if(query==='[data-id]')return [...elem('timeline').innerHTML.matchAll(/<button data-id="([^"]+)"/g)].map(m=>{
   const b=elem(`season-${m[1]}`);b.dataset.id=m[1];return b;
  });
  return [];
 }
 const doc={hidden:false,documentElement:{requestFullscreen(){}},fullscreenElement:null,
  getElementById:elem,querySelectorAll,createElement:(tag)=>elem(`created-${tag}-${++counter}`),
  addEventListener(event,cb){documentListeners[event]=cb}};
 let counter=0;const documentListeners={},windowListeners={},timers=[];
 const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const win={open:()=>({document:{write(){},close(){}},focus(){},print(){}}),print(){},
  addEventListener(event,cb){windowListeners[event]=cb},document:doc};
 const sandbox={...win,window:win,document:doc,localStorage,Date:extra.Date??FrozenDate,
  URLSearchParams,location:{search:extra.search??''},navigator:{mediaDevices:extra.mediaDevices},
  AudioContext:extra.AudioContext??class {constructor(){throw Error('Unexpected audio creation')}},
  performance:{now:()=>10},devicePixelRatio:1,innerWidth:375,innerHeight:667,
  setInterval:fn=>{timers.push(fn);return timers.length},clearInterval(){},setTimeout:()=>1,clearTimeout(){},
  requestAnimationFrame(){},addEventListener:(event,cb)=>{windowListeners[event]=cb},alert:()=>{},console,
 };
 vm.runInNewContext(script,sandbox,{filename:page,timeout:5000});
 return {elements,elem,buttons,timers,storage,sandbox,windowListeners,documentListeners};
}

// P1: complete sit / micro-actions / departure / tree / reload flow without audio.
{
 const storage=new Map();let app=fakePage('city-hermitage/index.html',storage);
 app.elem('sit').click();assert.equal(app.elem('sit').textContent,'起身');
 assert.ok(app.elem('micro').classList.contains('visible'));
 for(const id of ['water','leaf','light'])app.elem(id).click();
 assert.equal(storage.get('city-lamp'),'on');
 app.elem('sit').click();assert.ok(app.elem('plant').classList.contains('visible'));
 app.elem('plantBtn').click();assert.equal(JSON.parse(storage.get('city-hermitage-static-trees')).length,1);
 app.elem('share').click();
 app=fakePage('city-hermitage/index.html',storage);
 assert.match(app.elem('treeList').innerHTML,/一棵树/);
 console.log('PASS P1: sit, three actions, plant, persistence, share canvas');
}
// P2: four choices, privacy, optional mic denial and track cleanup.
{
 const tracks=[{stopped:false,stop(){this.stopped=true}}];
 const stream={getTracks:()=>tracks};
 const mediaDevices={getUserMedia:async()=>stream};
 class BrokenAudioContext{constructor(){throw Error('Audio unavailable')}}
 const app=fakePage('hearth/index.html',new Map(),{mediaDevices,AudioContext:BrokenAudioContext});
 for(const m of ['紧','乱','钝','空']){
  app.elem(`button-mode-${m}`).click();assert.ok(app.elem('choices').classList.contains('hidden'));
  assert.ok(app.elem('heading').textContent.length>0);
 }
 app.elem('privacy').click();assert.ok(!app.elem('panel').classList.contains('hidden'));
 await app.elem('mic').onclick();
 assert.ok(tracks[0].stopped,'Failed mic initialization must stop acquired track');
 assert.match(app.elem('signal').textContent,/未获麦克风权限/);
 console.log('PASS P2: all four states, privacy, mic resource cleanup');
}
// P4: calendar must not advance before start date; switching, action, persistence and PDF.
{
 const storage=new Map();let app=fakePage('season-garden/index.html',storage);
 assert.equal(app.elem('seasonName').textContent,'立冬','Nov 19 must not prematurely show 小雪');
 app.elem('act').click();assert.ok(!app.elem('noteArea').classList.contains('hidden'));
 app.elem('note').value='只写在纸上';app.elem('bury').click();
 assert.equal(JSON.parse(storage.get('season-garden-records')).lidong.visits.length,1);
 app.elem('season-xiaoxue').click();assert.equal(app.elem('seasonName').textContent,'小雪');
 app.elem('act').click();assert.equal(JSON.parse(storage.get('season-garden-records')).xiaoxue.visits.length,1);
 app.elem('export').click();app.elem('year').click();app.elem('pdf').click();
 app=fakePage('season-garden/index.html',storage);
 assert.match(app.elem('verse').textContent,/园子/);
 console.log('PASS P4: active season, switching, two actions, persistence, exports');
}
console.log('PASS all three prototype interaction smoke tests (simulated DOM)');
