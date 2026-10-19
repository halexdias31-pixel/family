#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check.js WHAT A COMPILER WOULD HAVE DONE. § */
const fs=require('fs'),path=require('path');
const acorn=require('acorn');
const {freeVars,eagerFree}=require('./_scope.js');

/* ---------- THIS LIST HAD GONE STALE, AND A STALE LIST HERE IS WORSE THAN NO LIST § */
/* ---------- THE ORDER IS READ FROM index.html, NOT KEPT HERE § */
function loadOrder_() {
  const html = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'index.html'), 'utf8');
  const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
  if (!m) {
    console.error('cannot read window.FILES out of index.html — that list IS the load order');
    process.exit(1);
  }
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}
const ORDER = loadOrder_();

/* ---------- AND THE LIST AGAINST THE FOLDER, WHICH NOTHING COMPARED § */
const NOT_LOADED = { _scope: 'the scope note. Deliberately not loaded — see `.nojekyll`, and the '
                           + 'entry in CLAUDE.md about Jekyll dropping any name beginning with `_`.' };
(() => {
  const fs2 = require('fs'), path2 = require('path');
  const jsDir = path2.join(__dirname);
  const onDisk = fs2.readdirSync(jsDir)
    .filter(f => f.endsWith('.js') && !f.startsWith('check'))
    .map(f => f.replace(/\.js$/, ''));
  const missing = ORDER.filter(f => !fs2.existsSync(path2.join(jsDir, f + '.js')));
  const unlisted = onDisk.filter(f => !ORDER.includes(f) && !(f in NOT_LOADED));
  if (missing.length) {
    console.error('');
    console.error('index.html asks for ' + missing.length + ' file(s) that are not in js/: '
                + missing.join(', ') + '\n  Every one of those is a 404 on every visit.');
    process.exitCode = 1;
  }
  if (unlisted.length) {
    console.error('in js/ and not in window.FILES, so the browser never loads it: '
                + unlisted.join(', ') + '\n  Dead code that reads as live. Add it to index.html, '
                + 'delete it, or name it in NOT_LOADED with a reason.');
    process.exitCode = 1;
  }
})();

const GLOBALS=new Set(('window document navigator localStorage sessionStorage console Math JSON Date '+
'Array Object String Number Boolean Set Map WeakMap WeakSet Promise RegExp Error TypeError Symbol '+
'Proxy Reflect Intl fetch setTimeout clearTimeout setInterval clearInterval requestAnimationFrame '+
'cancelAnimationFrame queueMicrotask parseInt parseFloat isNaN isFinite encodeURIComponent '+
'decodeURIComponent encodeURI decodeURI alert confirm prompt addEventListener removeEventListener '+
'location history screen Image Audio Blob File FileReader FormData URL URLSearchParams TextEncoder '+
'TextDecoder IntersectionObserver ResizeObserver MutationObserver AbortController CustomEvent Event '+
/* MediaRecorder — the camera widget records video with it. § */
'MediaRecorder Blob URL '+
'Element HTMLElement Node NodeList crypto performance structuredClone globalThis undefined NaN '+
'Infinity matchMedia getComputedStyle scrollTo innerWidth innerHeight devicePixelRatio '+
'speechSynthesis SpeechSynthesisUtterance AudioContext webkitAudioContext caches indexedDB open '+
'close top self parent frames name status origin atob btoa CSS Function DOMParser XMLHttpRequest '+
'Notification navigator visualViewport onerror '+
/* XMLSerializer — sharing a booking puts the receipt's clone in an SVG, and an SVG is XML: an HTML
   serialisation would leave `<br>` unclosed and the picture would not parse. See `rcPng_`. */
'XMLSerializer '+
/* NodeFilter — the keypad walks a worded answer's drawing for its text nodes (`kpHitWords_`) to put
   the caret where a finger landed. A browser global beside `Node`. */
'NodeFilter '+
/* requestIdleCallback — the builder that draws ahead of a flick (`ahead_`, shell.js) asks for idle time with it, and is written for its absence: § */
'requestIdleCallback '+
/* GOOGLE IDENTITY SERVICES. § */
'google '+
/* THE TYPED ARRAYS. Missing from this list since it was written, which nothing noticed because nothing used one until the overworld started merging geometry into § */
'Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint8ClampedArray '+
'Uint16Array Uint32Array BigInt64Array BigUint64Array ArrayBuffer SharedArrayBuffer DataView '+
'BigInt WeakRef FinalizationRegistry').split(/\s+/));

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

/* 3. LOAD-TIME reads of something declared later. § */
/* WHERE EACH TOP-LEVEL VALUE IS DECLARED, and the body of each function, so a call made at load
   time can be followed one level into what it touches. */
const declaredAt={}, fnBodies={}, callLines={};
const kindOf={};
files.forEach(f=>f.ast.body.forEach(n=>{
  if(n.type==='FunctionDeclaration'){
    kindOf[n.id.name]='function';
    fnBodies[n.id.name]=n.body;
    declaredAt[n.id.name]=n.loc.start.line;
  }
  else if(n.type==='VariableDeclaration') n.declarations.forEach(d=>{
    if(d.id.type==='Identifier'){ kindOf[d.id.name]=n.kind; declaredAt[d.id.name]=n.loc.start.line; }
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
    /* A FUNCTION IS HOISTED — but what it TOUCHES is not, and that is the trap this missed. § */
    if (kindOf[n] === 'function' && ORDER.indexOf(home) < i) return;   // reached; what it touches is checked below
    if(ORDER.indexOf(home)>i) tdz.push(f.name+'.js reads '+n+' at load, but '+home+'.js declares it later');
  });
});

/* ---------- 4. A CALL MADE AT LOAD TIME, INTO A FUNCTION THAT IS NOT READY § */
{
  const bad = [];
  files.forEach(f => {
    f.ast.body.forEach(stmt => {
      if (stmt.type === 'FunctionDeclaration') return;          // does not run yet
      const at = stmt.loc.start.line;
      /* Every name called anywhere inside this statement. */
      const called = new Set();
      (function walk(n) {
        if (!n || typeof n.type !== 'string') return;
        /* NOT INSIDE A FUNCTION BODY. § */
        if (n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression'
            || n.type === 'FunctionDeclaration') return;
        if (n.type === 'CallExpression' && n.callee.type === 'Identifier') called.add(n.callee.name);
        for (const k in n) {
          if (k === 'loc' || k === 'start' || k === 'end' || k === 'type') continue;
          const v = n[k];
          if (Array.isArray(v)) v.forEach(x => x && typeof x.type === 'string' && walk(x));
          else if (v && typeof v.type === 'string') walk(v);
        }
      })(stmt);

      called.forEach(fn => {
        if (kindOf[fn] !== 'function' || owner[fn] !== f.name) return;
        const body = fnBodies[fn];
        if (!body) return;
        freeVars([body]).free.forEach(v => {
          if (kindOf[v] === 'function' || owner[v] !== f.name) return;
          if (declaredAt[v] > at) {
            bad.push(f.name + '.js line ' + at + ': calls ' + fn + '(), which uses `' + v
              + '` — declared at line ' + declaredAt[v] + ' of the same file, so it is still in its '
              + 'dead zone and this throws. Everything below it in the file never loads.');
          }
        });
      });
    });
  });
  if (bad.length) { fail = 1; }
  console.log('');
  console.log('CALLED AT LOAD, BUT NOT READY  (' + bad.length + ')');
  console.log(bad.length ? '  ' + [...new Set(bad)].join('\n  ') : '  none');
}

console.log('files      : '+files.length);
console.log('top-level names: '+Object.keys(owner).length);
console.log('');
console.log('USED BUT NEVER DECLARED  ('+missing.length+')');
console.log(missing.length?'  '+[...new Set(missing)].join('\n  '):'  none');
console.log('');
console.log('READ AT LOAD BEFORE DECLARED  ('+tdz.length+')');
console.log(tdz.length?'  '+[...new Set(tdz)].join('\n  '):'  none');
if(missing.length||tdz.length) fail=1;
/* THE MANIFEST CHECK AT THE TOP SETS `process.exitCode` AND THIS LINE USED TO THROW IT AWAY. § */
if(process.exitCode) fail=1;
console.log('');
console.log(fail?'FAILED':'OK — nothing is used that is not declared, and nothing is read before it exists.');
process.exit(fail?1:0);