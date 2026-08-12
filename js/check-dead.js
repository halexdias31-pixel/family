#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-dead.js

   FUNCTIONS NOTHING CALLS, on both sides of the app.

   WHY THIS IS A CHECK AND NOT A TIDY-UP. Dead code is not untidy, it is MISLEADING. `arrive()` cost
   four rounds of chasing a swipe bug because it looked like the thing animating the swipe and had
   no CSS at all. `bmConfirmPayment` read as the rule that stops a button reaching a paid booking,
   and nothing consulted it. A function that is never called still gets read, still gets trusted,
   and still gets maintained.

   IT HAS TO BE RUN TO A FIXED POINT. Removing one dead function uncovers the ones it was holding
   up — `chessTap` was the only caller of `bestMove`, so the first pass found one of them and the
   second found the other. Run it, delete what it names, run it again, until it says none twice.

   WHAT IT DELIBERATELY KEEPS. Anything reached from outside the source: `doGet` and `doPost`, which
   Apps Script calls; the maintenance jobs, picked from the editor's dropdown or a `?run=` URL; and
   the console tools a person types. None has a caller in the code and all of them are alive. That
   list is below and adding to it is the price of adding one of those.

     node check-dead.js

   Paths are relative to this file, so it runs from anywhere.
================================================================================================== */
const path = require('path');
const fs = require('fs');
const O = path.join(__dirname, '..') + '/';
const strip=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*/g,'');
/* REACHED FROM OUTSIDE THE CODE. Apps Script calls doGet and doPost itself; the editor calls the
   maintenance jobs by name; a person types the console tools. None of these has a caller in the
   source and all of them are alive. */
const KEEP=new Set(['doGet','doPost','missingKeys','layout',
  'ensureSchema','checkEverything','checkPostsFolder','checkScopes','authoriseDrive',
  'makeBrandAccount','migrateLikes','installTriggers','listTriggers','seedFamilies',
  'refreshPageCounts','closeFinishedJobs','geocodeVenues','fetchMap','renameValue',
  'seedOptions','ensureResourceIds','schemaGaps','dataProblems','autoMigrate',
  'seedConfig','seedAvatarItems','seedPostcodes','ensurePersonIds','gallery','landmarks']);
const files=(dir,filter)=>fs.readdirSync(dir).filter(filter).map(f=>({f,p:dir+f}));
const jsF=files(O+'js/',f=>f.endsWith('.js')&&!f.startsWith('check')&&f!=='_scope.js');
/* THE BACKEND FILES, UNDER WHATEVER THEY ARE CALLED. Numbered in one place, plain in another, and
   this refused to run rather than look — so the backend half of this check has never once run
   against the real project. A checker that only works against a naming convention is a checker
   that does not work.
   Anything genuinely absent is skipped rather than fatal: the frontend half is worth having on its
   own, and half a report beats an exit code. */
const gsF=['constants','core','people','booking','content','setup','doGet','doPost']
  .map((n,i)=>{
    const tries=[['00_','10_','20_','30_','40_','50_','60_','70_'][i]+n, n, n.toLowerCase()];
    const hit=tries.map(x=>O+x+'.gs').find(p2=>fs.existsSync(p2));
    return hit?{f:path.basename(hit),p:hit}:null;
  }).filter(Boolean);
const scan=(set,label)=>{
  const code=strip(set.map(x=>fs.readFileSync(x.p,'utf8')).join('\n'));
  const d=[...code.matchAll(/^function ([A-Za-z_$][\w$]*)/gm)].map(m=>m[1]);
  const dead=d.filter(n=>!KEEP.has(n)&&(code.match(new RegExp('\\b'+n+'\\b','g'))||[]).length<=1);
  const where={};
  dead.forEach(n=>{ set.forEach(x=>{ if(new RegExp('^function '+n+'\\(','m').test(fs.readFileSync(x.p,'utf8'))) where[n]=x.f; }); });
  console.log(label+': '+(dead.length?dead.map(n=>n+' ('+where[n]+')').join(', '):'none'));
  return dead.length;
};
const a=scan(jsF,'frontend');
const b=gsF.length?scan(gsF,'backend')
  :(console.log('backend: no .gs files found beside the project — skipped'),0);

/* ==================================================================================================
   AND THE TWO RULES ABOUT HEADINGS, which are not style but structure.

   `<h2>` DOES TWO JOBS. It is a section heading inside a sheet — "Digital", "Printed", "Admin" —
   and it is what `split_` cuts a column of cards on. So an `<h2>` written INSIDE a card does not
   look like a heading in a card: it cuts that card in half, and the bottom of it becomes a separate
   page you have to swipe to.

   That has happened. A heading inside the You card split it, and it took a screenshot to notice —
   nothing threw, and the two halves looked like two cards somebody had meant.

   `<h3>` is the card's own title and cuts nothing. The rule is: a heading inside a card is an h3, a
   heading between cards is an h2. It held everywhere when this was written, and it held by nobody
   enforcing it, which is the reason for enforcing it.
================================================================================================== */
const CARD = /<div class="card[^>]*>([\s\S]{0,900}?)<\/div>/g;
const split = [];
jsF.forEach(x => {
  const src = fs.readFileSync(x.p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  let m;
  while ((m = CARD.exec(src))) {
    if (/<h2[ >]/.test(m[1])) {
      split.push(x.f + ':' + src.slice(0, m.index).split('\n').length
        + '  an <h2> inside a card — `split_` cuts there, so the card becomes two pages');
    }
  }
});
console.log('');
console.log('HEADINGS THAT WOULD SPLIT A CARD  (' + split.length + ')');
console.log(split.length ? '  ' + split.join('\n  ') : '  none');

process.exit(a + b + split.length ? 1 : 0);