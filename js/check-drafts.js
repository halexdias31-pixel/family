#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-drafts.js

   EVERY BOX A PERSON TYPES INTO SURVIVES A RELOAD, OR SAYS WHY NOT.

   THE OWNER, 9 Oct, during a lesson: *"[the child] accidentally refreshed on his computer when doing the
   english language question. this lost him all his progress on his answer. the box should be
   autosaving his work like everywhere else should be doing this."* "Everywhere else" was not true: an
   answer box saved as it was typed, and the composer, a comment, the new-post sheet, the booking form,
   a settings card, the week of hours, the business records and the make-an-account sheet all lived in
   the page until their button was pressed. docs/history/317 has the hunts and the build.

   SO EVERY `<input>`, `<textarea>` AND `contenteditable` THE APP DRAWS is one of:
     ANSWER   an answer box — saved on every keystroke through `ansStore_` (js/answers.js)
     DRAFT    carries `draftAttr_(…)` (js/data.js), so it is kept as it is typed and drawn back holding
              it — and the surface it names must be dropped somewhere (`draftDrop_`), or a sent message
              would come back in the box after the next reload
     KEPT     saved by its own code the moment it changes (the notepad, the timetable, the cheat sheet,
              the docket, the qualification shelf, the booking note through `BOOKING`) — each with a
              PROOF: a line of the code that does it, which must still be there
     EXEMPT   not kept, on purpose, with the reason — every PIN, a search, a game's answer
     a hidden or a file input, which nothing is typed into, is counted and said.
   A new box that is none of these FAILS — that is the point of the list: the next composer added
   without a draft is red the day it is written, not the day somebody reloads it.

   READ FROM THE SOURCE, as `check.js` reads it: every string and template literal in the files
   `index.html` loads, every tag in them that is an input, a textarea or carries `contenteditable`, and
   every `createElement('input' | 'textarea')`. An entry on either list that matches no box FAILS too,
   so a list cannot quietly outlive what it describes. A `<select>` is a choice re-made in one tap and is
   not asked about; the settings ones are drafts anyway, through `fieldHtml`.

   AND THE HELPER ITSELF, read out of data.js: the delegated listener that does the keeping, the rule
   that refuses a PIN whatever box asks (`DRAFT_NEVER`, run here on the names it must and must not
   refuse), and the "Leave site?" that may only ever ask when something is held by nothing but the page.

     node js/check-drafts.js
================================================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let acorn;
try { acorn = require(path.join(ROOT, 'node_modules', 'acorn')); }
catch (e) { console.log('check-drafts: acorn is not installed (npm install) — NOTHING was checked'); process.exit(1); }

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
if (!m) { console.log('check-drafts: cannot read window.FILES out of index.html — NOTHING was checked'); process.exit(1); }
const FILES = [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1] + '.js');
const SRC = {};
FILES.forEach(f => { SRC[f] = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'); });
const ALL = FILES.map(f => SRC[f]).join('\n');

/* ---------- THE LISTS ----------------------------------------------------------------------------------
   `file` and (optionally) `fn` — the function the markup is written in — and `has`, a piece of the tag's
   own text, so an entry names its box the way a reader would find it. */
const KEPT = [
  { file: 'keypad.js', fn: 'kpField_', has: '${lock}', count: 2,
    why: 'an answer box — every kind, every card and every practical slot is drawn here, and saved on every keystroke through `ansStore_`',
    proof: [['find.js', /closest\('\[data-do="qp-ans"\]'\)[\s\S]{0,700}?ansStore_\(/], ['keypad.js', /data-do="qp-ans"/]] },
  { file: 'me.js', fn: 'qualSlot_', has: "f('_board')",
    why: 'a qualification\'s board — the shelf saves each answer on its `change` (`qualCommit_`)',
    proof: [['me.js', /qualCommit_\(slot\);/]] },
  { file: 'me.js', has: 'createElement(input)',
    why: 'the qualification shelf\'s "Something else…" box — saved on its own `change` like the select it replaces',
    proof: [['me.js', /sel\.replaceWith\(box\)/], ['me.js', /qualCommit_\(slot\);/]] },
  { file: 'find.js', has: 'id="stuff-q"',
    why: 'Find\'s search — kept with Find\'s place for a reload (`findPlaceKeep_`), never on its own',
    proof: [['find.js', /function findPlaceKeep_[\s\S]{0,900}?STUFF\.q/], ['shell.js', /findPlaceBack_\(\)/]] },
  { file: 'find.js', fn: 'paintDocket', has: 'dock-tick',
    why: 'a docket tick — saved the moment it is ticked (`docketSave`), and sent as the page goes',
    proof: [['find.js', /keepDue_\('docket', sendTodo\)/]] },
  { file: 'map.js', has: 'id="notepad"',
    why: 'the notepad — on the device at every keystroke (`familyUser`), on the account 1.4 s later or as the page goes',
    proof: [['find.js', /USER\.notepad = e\.target\.value/], ['find.js', /keepDue_\('notepad', padSend_\)/]] },
  { file: 'book.js', fn: 'noteRow_', has: 'book-note',
    why: 'the booking note — an answer in `BOOKING`, which is kept whole as it is typed (`bookKeep_`)',
    proof: [['book.js', /closest\('\[data-do="book-note"\]'\)[\s\S]{0,120}?BOOKING\.note = el\.value \|\| '';\s*bookKeep_\(\);/]] },
  { file: 'mat.js', has: 'id="mat-text"',
    why: 'the cheat sheet maker\'s words — kept in `matChoice` 0.2 s after typing, and as the page goes',
    proof: [['mat.js', /keepDue_\('mat'/]] },
  { file: 'mat.js', has: 'mat-exam',
    why: 'the cheat sheet maker\'s exam tick — kept in `matChoice` as it changes',
    proof: [['mat.js', /function matRemember\(/]] },
  { file: 'mat.js', has: 'mat-tick',
    why: 'a cheat sheet maker\'s topic tick — kept in `matChoice` as it changes',
    proof: [['mat.js', /function matRemember\(/]] },
  { file: 'games.js', fn: 'tmtRow_', has: 'tmt-in', count: 3,
    why: 'a timetable box — kept by `tmtKeep_` on every keystroke, on the account signed in and the device signed out',
    proof: [['games.js', /document\.addEventListener\('input', tmtKeep_\)/], ['games.js', /keepDue_\('timetable', send\)/]] },
  { file: 'games.js', fn: 'tmtHtml_', has: 'tmt-weekend',
    why: 'the timetable\'s weekend tick — kept as it changes, like the rest of the timetable',
    proof: [['games.js', /tmt-weekend/]] },
];
const PIN = 'a PIN — never written to the device, by a draft or anything else';
const EXEMPT = [
  { file: 'me.js', fn: 'signInCard_', has: 'id="in-name"', why: 'the sign-in box — a handle remembered after a sign-in that worked (`familyHandles`); half of one is not work' },
  { file: 'me.js', fn: 'signInCard_', has: 'id="in-pin"', why: PIN },
  { file: 'me.js', fn: 'registerSheet_', has: 'id="reg-pin"', why: PIN },
  { file: 'me.js', fn: 'childMakeCard_', has: 'data-kid-new="pin"', why: PIN },
  { file: 'me.js', fn: 'settingsPages_', has: 'id="pin-now"', why: PIN },
  { file: 'me.js', fn: 'settingsPages_', has: 'id="pin-new"', why: PIN },
  { file: 'me.js', fn: 'settingsPages_', has: 'id="pin-again"', why: PIN },
  { file: 'me.js', fn: 'registerSheet_', has: 'id="reg-noemail"', why: 'reset by the who-is-it question above it, which is asked again on purpose (`REG_NOTE`)' },
  { file: 'me.js', fn: 'friendsSheet', has: 'id="fr-add"', why: 'one handle, typed in seconds and sent by the button beside it' },
  { file: 'me.js', fn: 'rolesCard_', has: 'data-role-pick', why: 'an admin\'s ticks of somebody else\'s roles — a decision about another person\'s account is made and saved there and then, not left half-made on a device' },
  { file: 'me.js', fn: 'agreementCard_', has: 'agree-sign', why: 'acts the moment it is ticked (`agree-sign`) — nothing waits between the tick and the server' },
  { file: 'me.js', fn: 'cutCard_', has: 'id="cut-val"', why: 'an admin\'s one number, saved by the tile beside it' },
  { file: 'posts.js', fn: 'cameraCard', has: 'id="cam-cap"', why: 'the caption of photographs held in memory (`CAM_ITEMS`), which a reload loses with it — keeping those needs IndexedDB (317)' },
  { file: 'posts.js', has: 'id="pe-pin"', why: 'one tick, pinning a post that is already up' },
  { file: 'map.js', has: 'id="tt-answer"', why: 'a times-tables round — a reload is a new round, with a new question' },
  { file: 'map.js', has: 'id="dock-add"', why: 'one line, kept the moment Enter or + puts it on the docket' },
  { file: 'receipt.js', fn: 'askHow_', has: 'id="paid-how"', why: 'how an admin was paid — one word, already "cash", sent by the same sheet' },
  { file: 'receipt.js', has: 'id="fest-kids"', why: 'a one-line sheet, answered and sent in one go' },
  { file: 'flyer.js', fn: 'flyControls', has: 'type="checkbox"', why: 'the admin\'s flyer maker — picks, re-made in a tap; nothing is written' },
  { file: 'flyer.js', fn: 'flyControls', has: 'type="color"', count: 3, why: 'the admin\'s flyer maker — colours, re-picked in a tap' },
  { file: 'games.js', fn: 'ktPaint_', has: 'kt-in', why: 'touch typing — the line being typed IS the drill; the progress is kept (`kt`)' },
  { file: 'games.js', fn: 'vidPaint_', has: 'vid-q', why: 'a search — retyped in a second, and it may be a film\'s title, which signing out clears (`VID.q`)' },
];

/* ---------- THE BOXES ------------------------------------------------------------------------------------ */
/* A TAG'S OWN TEXT, from `<` to its closing `>`, stepping over `${ … }` so an attribute written as an
   expression stays part of the tag it is in. */
function tagAt(src, p) {
  let i = p, depth = 0;
  while (i < src.length) {
    const c = src[i];
    if (depth === 0 && c === '>') return src.slice(p, i + 1);
    if (c === '$' && src[i + 1] === '{') { depth++; i += 2; continue; }
    if (depth > 0 && c === '{') depth++;
    else if (depth > 0 && c === '}') depth--;
    i++;
  }
  return src.slice(p, p + 300);
}
const sites = [];
const fnSrc = {};
for (const f of FILES) {
  const src = SRC[f];
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true }); }
  catch (e) { console.log('check-drafts: ' + f + ' does not parse (' + e.message + ') — NOTHING was checked'); process.exit(1); }
  (function walk(n, fn) {
    if (!n || typeof n.type !== 'string') return;
    let name = fn;
    if (/Function/.test(n.type) && n.id && n.id.name) name = n.id.name;
    if (n.type === 'VariableDeclarator' && n.id && n.id.name && n.init && /Function/.test(n.init.type)) name = n.id.name;
    if (name !== fn && !fnSrc[f + ':' + name]) {
      const body = n.type === 'VariableDeclarator' ? n.init : n;
      fnSrc[f + ':' + name] = src.slice(body.start, body.end);
    }
    const spans = [];
    if (n.type === 'Literal' && typeof n.value === 'string') spans.push([n.start, n.end]);
    if (n.type === 'TemplateElement') spans.push([n.start, n.end]);
    for (const [a, b] of spans) {
      const seg = src.slice(a, b);
      const re = /<([a-z][\w-]*)\b/gi;
      let t;
      while ((t = re.exec(seg))) {
        const tag = t[1].toLowerCase();
        const text = tagAt(src, a + t.index);
        if (!(tag === 'input' || tag === 'textarea' || /\scontenteditable\b/i.test(text))) continue;
        sites.push({ file: f, fn: name, line: src.slice(0, a + t.index).split('\n').length, tag, text: text.replace(/\s+/g, ' ') });
      }
    }
    if (n.type === 'CallExpression' && n.callee && n.callee.property && n.callee.property.name === 'createElement'
        && n.arguments[0] && /^(input|textarea)$/.test(n.arguments[0].value)) {
      sites.push({ file: f, fn: name, line: n.loc.start.line, tag: n.arguments[0].value, text: 'createElement(' + n.arguments[0].value + ')' });
    }
    for (const k in n) {
      if (k === 'loc') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(c => c && typeof c === 'object' && walk(c, name));
      else if (v && typeof v === 'object' && typeof v.type === 'string') walk(v, name);
    }
  })(ast, '(top)');
}

/* ---------- WHICH IS EACH ------------------------------------------------------------------------------- */
const bad = [];
const said = [];
const hits = new Map();
const matches = (e, s) => s.file === e.file && (!e.fn || s.fn === e.fn) && (!e.has || s.text.indexOf(e.has) !== -1);
/* A DRAFT: `draftAttr_(` in the tag, or `${name}` where the function the tag is in sets `name` from it. */
function draftOf(s) {
  if (/draftAttr_\(|data-draft=/.test(s.text)) return (s.text.match(/draftAttr_\(\s*'([\w-]+)'/) || [])[1] || '?';
  const body = fnSrc[s.file + ':' + s.fn] || '';
  for (const x of s.text.matchAll(/\$\{\s*([A-Za-z_$][\w$]*)\s*\}/g)) {
    const set = new RegExp('\\b' + x[1] + '\\s*=\\s*[^;]*?draftAttr_\\(\\s*\'([\\w-]+)\'').exec(body);
    if (set) return set[1];
  }
  return '';
}
const count = { answer: 0, draft: 0, kept: 0, exempt: 0, none: 0 };
const surfaces = new Set();
for (const s of sites) {
  const where = s.file + ':' + s.line + ' (' + s.fn + ')';
  const type = (s.text.match(/\btype="([a-z-]+)"/i) || [])[1] || '';
  if (/^(hidden|file)$/i.test(type)) { count.none++; continue; }
  const d = draftOf(s);
  if (d) {
    count.draft++;
    surfaces.add(d);
    if (/^password$/i.test(type) || /type="password"/.test(s.text)) bad.push(where + ' is a password box carrying a draft — a PIN would be written to the device');
    continue;
  }
  const k = KEPT.find(e => matches(e, s));
  if (k) { hits.set(k, (hits.get(k) || 0) + 1); if (/kpField_/.test(k.fn || '')) count.answer++; else count.kept++; continue; }
  const x = EXEMPT.find(e => matches(e, s));
  if (x) { hits.set(x, (hits.get(x) || 0) + 1); count.exempt++; continue; }
  bad.push(where + ' draws ' + s.text.slice(0, 140) + ' — not an answer, not a draft, not kept by its own code, and not on the EXEMPT list with a reason. A reload loses what is typed into it.');
}
/* EVERY ENTRY STILL NAMES A BOX, AS MANY AS IT SAYS — and every KEPT box's code is still there. */
[...KEPT, ...EXEMPT].forEach(e => {
  const n = hits.get(e) || 0, want = e.count || 1;
  if (n !== want) bad.push('the list entry ' + e.file + (e.fn ? ' ' + e.fn : '') + ' "' + e.has + '" names ' + n + ' box(es), wanted ' + want + ' — stale, or a box was added beside it');
});
KEPT.forEach(e => (e.proof || []).forEach(([f, re]) => {
  if (!SRC[f] || !re.test(SRC[f])) bad.push(e.file + ' "' + e.has + '" is listed as kept by its own code, and the code that keeps it is gone from ' + f + ': ' + re);
}));
/* EVERY DRAFTED SURFACE IS DROPPED SOMEWHERE — sent, saved or started again. */
surfaces.forEach(sf => {
  if (sf === '?') { bad.push('a draft is drawn with a surface name that is not a plain string — it cannot be checked'); return; }
  if (!new RegExp('draftDrop_\\(\\s*\'' + sf.replace(/[-]/g, '\\-') + '\'').test(ALL)) bad.push('the "' + sf + '" drafts are kept and never dropped — what was sent comes back in the box after the next reload');
});

/* ---------- AND THE HELPER --------------------------------------------------------------------------- */
const data = SRC['data.js'] || '';
if (!/\['input', 'change'\]\.forEach\(ev => document\.addEventListener\(ev, e => \{[\s\S]{0,160}draftFrom_\(/.test(data)) {
  bad.push('data.js has no delegated input/change listener calling `draftFrom_` — every DRAFT above is drawn back and never kept');
}
const never = /const DRAFT_NEVER = (\/.+\/[a-z]*);/.exec(data);
if (!never) bad.push('data.js has no `DRAFT_NEVER` — nothing refuses a PIN that a draft box asks to keep');
else {
  const re = eval(never[1]);
  ['set:lib1_pin', 'reg:pin', 'kid-new:pin', 'set:pin', 'x:password', 'set:lib3_pin'].forEach(k => { if (!re.test(k)) bad.push('`DRAFT_NEVER` lets "' + k + '" be kept'); });
  ['set:pinned', 'post:cap', 'set:headline', 'msg:P-12', 'set:spinner'].forEach(k => { if (re.test(k)) bad.push('`DRAFT_NEVER` refuses "' + k + '", which is not a PIN'); });
}
if (!/\^\(password\|file\|hidden\)\$/.test(data)) bad.push('`draftFrom_` no longer skips password, file and hidden boxes');
const leave = /window\.addEventListener\('beforeunload', e => \{([\s\S]*?)\n\}\);/.exec(data);
if (!leave) bad.push('data.js has no "Leave site?" for work held by nothing but the page');
else if (!/^\s*if \(!keepAtRisk_\(\)\.length\) return;/.test(leave[1])) bad.push('the `beforeunload` in data.js does not return first when nothing is at risk — a prompt on every refresh is noise');
const others = FILES.filter(f => f !== 'data.js' && /addEventListener\(\s*'beforeunload'/.test(SRC[f]));
if (others.length) bad.push('a second "Leave site?" in ' + others.join(', ') + ' — the one in data.js asks only when the work is in nothing but the page');

said.push(sites.length + ' boxes in ' + FILES.length + ' files: ' + count.answer + ' answer boxes (kpField_), ' + count.draft + ' drafts in '
  + surfaces.size + ' surfaces (' + [...surfaces].sort().join(', ') + '), ' + count.kept + ' kept by their own code, '
  + count.exempt + ' exempt with a reason, ' + count.none + ' hidden or file');

console.log('');
said.forEach(s => console.log('  ' + s));
console.log('\nWRONG  (' + bad.length + ')');
if (!bad.length) console.log('  none');
bad.forEach(b => console.log('  ' + b));
if (bad.length) {
  console.log('\nFAILED — a box that is none of these loses what is typed into it on a reload, which is the essay of 9 Oct (docs/history/317).');
  process.exit(1);
}
console.log('\nOK — every box the app draws is an answer, a draft that is dropped when it is sent, kept by its own code, or exempt with a reason.');
