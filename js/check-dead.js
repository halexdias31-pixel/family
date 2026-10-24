#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-dead.js FUNCTIONS NOTHING CALLS, on both sides of the app. § */
const path = require('path');
const fs = require('fs');
const O = path.join(__dirname, '..') + '/';
const strip=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*/g,'');
/* REACHED FROM OUTSIDE THE CODE. Apps Script calls doGet and doPost itself; the editor calls the
   maintenance jobs by name; a person types the console tools. None of these has a caller in the
   source and all of them are alive. */
const KEEP=new Set(['doGet','doPost','missingKeys','layout',
  'ensureSchema_','checkEverything','checkPostsFolder','checkScopes','authoriseDrive',
  'makeBrandAccount','installTriggers_','listTriggers',
  'refreshPageCounts','closeFinishedJobs','geocodeVenues','renameValue_',
  'seedOptions','ensureResourceIds','schemaGaps','dataProblems','autoMigrate_',
  'seedConfig_','seedAvatarItems_','seedPostcodes','ensurePersonIds_',
  /* THE CHECKS' QUESTION "is the builder done?" (docs/history/341) — asked by check-flow, swipe, reach, press
     and ui through the page, and by nothing in the app, which never needs to wait for itself. */
  'aheadBusy_']);
const files=(dir,filter)=>fs.readdirSync(dir).filter(filter).map(f=>({f,p:dir+f}));
const jsF=files(O+'js/',f=>f.endsWith('.js')&&!f.startsWith('check')&&f!=='_scope.js');
/* THE BACKEND FILES, UNDER WHATEVER THEY ARE CALLED. § */
const gsF=['constants','core','people','booking','content','setup','doGet','doPost']
  .map((n,i)=>{
    const tries=[['00_','10_','20_','30_','40_','50_','60_','70_'][i]+n, n, n.toLowerCase()];
    /* `backend/` FIRST. This looked only beside the project and the .gs files moved into backend/, so the second half of this check — dead functions in the BACKEND § */
    const hit=[O+'backend/',O].flatMap(d=>tries.map(x=>d+x+'.gs')).find(p2=>fs.existsSync(p2));
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

/* AND THE TWO RULES ABOUT HEADINGS, which are not style but structure. § */
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