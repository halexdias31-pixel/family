#!/usr/bin/env node
/* ==================================================================================================
   @family. — check.js

   WHAT A COMPILER WOULD HAVE DONE. These files share one global scope, so a name used in find.js
   and declared nowhere at all does not fail at load — it fails at the moment somebody taps the
   thing that needs it, which may be weeks later and on somebody else's phone. That is the one cost
   of splitting into plain scripts rather than modules, and this is what pays it.

   It reads every file in ORDER, works out every name each one DECLARES and every name each one
   USES, and reports:

     · a name used and never declared anywhere        → it will throw when that line runs
     · a name declared twice at the top level         → the second silently replaces the first
     · a name used in a file that loads BEFORE the    → fine for a function (hoisted), fatal for
       file declaring it, at load time                  a const (temporal dead zone)

   The third is the only thing the split itself can break, and it is the reason ORDER below is not
   just documentation.

     node check.js

   Run it after every change. Two seconds, and it is the whole safety net.
================================================================================================== */
const fs=require('fs'),path=require('path');
const acorn=require('acorn');
const {freeVars,eagerFree}=require('./_scope.js');

const ORDER=['core','price-rows','chess','data','shell','cards','me','posts','links','find',
             'resource','arcade','map','book','receipt','games','overworld','boot'];

const GLOBALS=new Set(('window document navigator localStorage sessionStorage console Math JSON Date '+
'Array Object String Number Boolean Set Map WeakMap WeakSet Promise RegExp Error TypeError Symbol '+
'Proxy Reflect Intl fetch setTimeout clearTimeout setInterval clearInterval requestAnimationFrame '+
'cancelAnimationFrame queueMicrotask parseInt parseFloat isNaN isFinite encodeURIComponent '+
'decodeURIComponent encodeURI decodeURI alert confirm prompt addEventListener removeEventListener '+
'location history screen Image Audio Blob File FileReader FormData URL URLSearchParams TextEncoder '+
'TextDecoder IntersectionObserver ResizeObserver MutationObserver AbortController CustomEvent Event '+
'Element HTMLElement Node NodeList crypto performance structuredClone globalThis undefined NaN '+
'Infinity matchMedia getComputedStyle scrollTo innerWidth innerHeight devicePixelRatio '+
'speechSynthesis SpeechSynthesisUtterance AudioContext webkitAudioContext caches indexedDB open '+
'close top self parent frames name status origin atob btoa CSS Function DOMParser XMLHttpRequest '+
'Notification navigator visualViewport onerror').split(/\s+/));

const dir=__dirname;
let fail=0;
const files=ORDER.map(n=>{
  const p=path.join(dir,n+'.js');
  if(!fs.existsSync(p)){ console.log('MISSING FILE: '+n+'.js'); fail=1; return null; }
  const src=fs.readFileSync(p,'utf8');
  let ast;
  try{ ast=acorn.parse(src,{ecmaVersion:2022,locations:true}); }
  catch(e){ console.log('SYNTAX ERROR in '+n+'.js line '+(e.loc&&e.loc.line)+': '+e.message); fail=1; return null; }
  const {free,declared}=freeVars(ast.body);
  return {name:n,src,ast,free,declared};
}).filter(Boolean);
if(fail) process.exit(1);

/* --- 1. a name declared in two files. The second wins, silently, and the first file's version of
       it is simply gone — which reads as that file's feature having stopped working. --- */
const owner={};
files.forEach(f=>f.declared.forEach(n=>{
  if(owner[n]){ console.log('DECLARED TWICE: '+n+'  ('+owner[n]+'.js and '+f.name+'.js)'); fail=1; }
  else owner[n]=f.name;
}));

/* --- 2. a name nothing declares. This is the one that throws. --- */
const missing=[];
files.forEach(f=>f.free.forEach(n=>{
  if(owner[n]||GLOBALS.has(n)) return;
  missing.push(f.name+'.js: '+n);
}));

/* --- 3. LOAD-TIME reads of something declared later. A function is hoisted and fine; a const is
       in its temporal dead zone and throws before the app draws anything. Only top-level
       statements are checked, because only they run at load. --- */
const kindOf={};
files.forEach(f=>f.ast.body.forEach(n=>{
  if(n.type==='FunctionDeclaration') kindOf[n.id.name]='function';
  else if(n.type==='VariableDeclaration') n.declarations.forEach(d=>{
    if(d.id.type==='Identifier') kindOf[d.id.name]=n.kind;
  });
}));
const tdz=[];
files.forEach((f,i)=>{
  // the statements that RUN at load: everything that is not a declaration
  const eager=f.ast.body.filter(n=>n.type!=='FunctionDeclaration');
  if(!eager.length) return;
  const free=eagerFree(eager);
  free.forEach(n=>{
    const home=owner[n]; if(!home||home===f.name) return;
    if(kindOf[n]==='function') return;                    // hoisted across files, always safe
    if(ORDER.indexOf(home)>i) tdz.push(f.name+'.js reads '+n+' at load, but '+home+'.js declares it later');
  });
});

console.log('files      : '+files.length);
console.log('top-level names: '+Object.keys(owner).length);
console.log('');
console.log('USED BUT NEVER DECLARED  ('+missing.length+')');
console.log(missing.length?'  '+[...new Set(missing)].join('\n  '):'  none');
console.log('');
console.log('READ AT LOAD BEFORE DECLARED  ('+tdz.length+')');
console.log(tdz.length?'  '+[...new Set(tdz)].join('\n  '):'  none');
if(missing.length||tdz.length) fail=1;
console.log('');
console.log(fail?'FAILED':'OK — nothing is used that is not declared, and nothing is read before it exists.');
process.exit(fail?1:0);
