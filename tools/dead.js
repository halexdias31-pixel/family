/* @family. — tools/dead.js THE ONE LIST OF FUNCTIONS NOTHING CALLS (rule 11.2): js/check-dead.js fails on it, tools/stability.js
   weighs it and tools/health.js scores it (`dead`), so the three can never disagree. */
const path = require('path');
const fs = require('fs');
const O = path.join(__dirname, '..') + '/';
/* A COMMENT OPENS AFTER A SPACE OR PUNCTUATION (check-doors' rule): `accept="image/*"` is not one, and swallowed biz-check.js's calls. */
const strip=t=>t.replace(/(^|[\s;{}(),])\/\*[\s\S]*?\*\//g,'$1').replace(/(^|[^:])\/\/.*/g,'$1');
/* REACHED FROM OUTSIDE THE CODE. Apps Script calls doGet and doPost itself; the editor calls the
   maintenance jobs by name; a person types the console tools. None of these has a caller in the
   source and all of them are alive. */
const KEEP=new Set(['doGet','doPost','missingKeys','layout',
  'ensureSchema_','checkEverything','checkPostsFolder','checkScopes','authoriseDrive',
  'makeBrandAccount','installTriggers_','listTriggers',
  'refreshPageCounts','closeFinishedJobs','geocodeVenues','renameValue_',
  'seedOptions','ensureResourceIds','schemaGaps','dataProblems','autoMigrate_',
  'seedConfig_','seedAvatarItems_','seedPostcodes','ensurePersonIds_','gallery','landmarks',
  /* Run from the editor's dropdown and say what they found in words (core.gs, setup.gs). */
  'testCache','checkTabs',
  /* THE CHECKS' QUESTION "is the builder done?" (docs/history/341) — asked by check-flow, swipe, reach, press
     and ui through the page, and by nothing in the app, which never needs to wait for itself. */
  'aheadBusy_',
  /* READ BY THE JOURNEYS AND CHECKS THROUGH THE PAGE (w.name(...)), as aheadBusy_ is: the app's own state, asked from outside. */
  'dropOnFront_','mondayOf_','cardSeen_','cardStartAt_','mergedNow_','ktLessonCount_','workPics_',
  'contentPageTitle_','insertsFor_','qtFigureOf_','writingOf_',
  /* THE SOURCE OF THE BACKEND'S COPY (tools/aliases_gs.js writes it into constants.gs, where doGet calls it). */
  'qAliasKey_',
  /* THE OLD RING PORTRAIT: personPic_ replaced it on 6 Nov; check-flow and check-library still prove its look tables. */
  'boxerPic_']);
const files=(dir,filter)=>fs.readdirSync(dir).filter(filter).map(f=>({f,p:dir+f}));
const jsF=files(O+'js/',f=>f.endsWith('.js')&&!f.startsWith('check')&&f!=='_scope.js');
/* THE BACKEND FILES: backend/files.json's list (tools/file-lists.js), the one the deploy pushes. */
const gsF=fs.existsSync(O+'backend/files.json')?require('../tools/file-lists.js').gsFiles(O).filter(p2=>fs.existsSync(p2)).map(p2=>({f:path.basename(p2),p:p2})):[];
/* Every dead function, front end and backend, each with its side and file. */
function deadFunctions() {
  const out = [];
  const run = (set, side) => { const code = strip(set.map(x => fs.readFileSync(x.p, 'utf8')).join('\n'));
    for (const m of code.matchAll(/^function ([A-Za-z_$][\w$]*)/gm)) { const n = m[1];
      if (KEEP.has(n) || (code.match(new RegExp('\\b' + n + '\\b', 'g')) || []).length > 1) continue;
      const x = set.find(x => new RegExp('^function ' + n + '\\(', 'm').test(fs.readFileSync(x.p, 'utf8')));
      out.push({ name: n, file: x ? x.f : '', side }); } };
  run(jsF, 'frontend'); if (gsF.length) run(gsF, 'backend');
  return out;
}
module.exports = { deadFunctions, jsF, gsF };
