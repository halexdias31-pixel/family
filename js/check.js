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

/* ---------- THIS LIST HAD GONE STALE, AND A STALE LIST HERE IS WORSE THAN NO LIST ----------------
   `collections` and `tiles` were added to index.html and never added here, so the checker read 21
   of the 23 files that actually load. What it printed was four names USED BUT NEVER DECLARED —
   `cardTiles_`, `tileSet_`, `adoptSpotlight_` — every one of them a false alarm, in the one report
   whose whole value is that it can be believed without checking. Two missing entries and the
   safety net reads FAILED on a working app, which is how a safety net stops being read at all.

   IT MUST MATCH index.html, IN ORDER. That is not documentation, it is the third check below:
   whether a const is read before the file declaring it has loaded. Get the order wrong here and
   that check answers a question about an app that does not exist. */
const ORDER=['core','price-rows','chess','data','shell','cards','me','posts','links','find',
             'resource','arcade','map','book','receipt','flyer','mat','games','overworld','select',
             'collections','tiles','boot'];

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
'Notification navigator visualViewport onerror '+
/* GOOGLE IDENTITY SERVICES. `google.accounts.id` is put on the window by the script me.js appends
   at sign-in time, so it is a global that arrives late rather than a name anybody forgot to
   declare — and me.js already guards it with `if (!window.google)`, which is the right check for
   a third party that may be blocked. Reported as undeclared since the sign-in button was written. */
'google '+
/* THE TYPED ARRAYS. Missing from this list since it was written, which nothing noticed because
   nothing used one until the overworld started merging geometry into Float32Arrays. A global the
   list does not know about is reported as a name nobody declared — a false alarm, in the one report
   that has to be believed without checking. */
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

/* --- 3. LOAD-TIME reads of something declared later. A function is hoisted and fine; a const is
       in its temporal dead zone and throws before the app draws anything. Only top-level
       statements are checked, because only they run at load. --- */
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
    /* A FUNCTION IS HOISTED — but what it TOUCHES is not, and that is the trap this missed.

       `on('card-back', …)` was called at the top of shell.js. `on` is a function declaration, so it
       is hoisted and the call is fine. What `on` DOES is write to `ACTIONS`, a `const` a hundred
       lines further down — so the call threw in that const's dead zone, shell.js stopped there, and
       every listener after it never existed. Swiping and clicking both died and the message named
       `ACTIONS`, not the line that ran too early.

       This said "hoisted across files, always safe" and skipped it. Hoisting is about reaching the
       function, not about the function being able to do its job yet.

       So a call at load time to a function in the SAME file is followed one level in: if that
       function reads a top-level value declared below the call, it is reported. One level is
       enough for the shape that actually occurs — a registrar writing to a table — and stops well
       short of chasing every branch of the program. */
    if (kindOf[n] === 'function') return;   // reaching it is fine; what it touches is checked below
    if(ORDER.indexOf(home)>i) tdz.push(f.name+'.js reads '+n+' at load, but '+home+'.js declares it later');
  });
});

/* ---------- 4. A CALL MADE AT LOAD TIME, INTO A FUNCTION THAT IS NOT READY -----------------------
   A FUNCTION IS HOISTED. WHAT IT TOUCHES IS NOT — and that is the trap the check above cannot see.

   `on('card-back', …)` sat at the top of shell.js. `on` is a function declaration, so it is hoisted
   and the call itself is fine. What `on` DOES is write to `ACTIONS`, a `const` a hundred lines
   below — so the call threw in that const's dead zone, shell.js stopped there, and every listener
   after it never existed. Swiping and clicking died together, and the message named `ACTIONS`
   rather than the line that ran too early.

   So every statement that RUNS at load is examined: which functions it calls, and whether any of
   those functions reads a top-level value declared later in the same file. One level deep, which
   is the shape that actually occurs — a registrar writing to a table — and no further. */
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
        /* NOT INSIDE A FUNCTION BODY. A call written inside an arrow or a function expression does
           not happen at load — it happens when somebody calls the thing. This walked into them, so
           `const repaint = () => { paint(AT); }` was read as "paint runs at load", and it reported
           thirteen faults that were not there.
           A report that is mostly wrong is one nobody reads, and the two real entries in it would
           have been lost. Same mistake as the CSS checker made with comma groups, caught the same
           way: by the numbers looking implausible. */
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
console.log('');
console.log(fail?'FAILED':'OK — nothing is used that is not declared, and nothing is read before it exists.');
process.exit(fail?1:0);