#!/usr/bin/env node
/* @family. — check-drafts.js EVERY BOX A PERSON TYPES INTO SURVIVES A RELOAD, OR SAYS WHY NOT. § */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
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

/* ---------- THE LISTS § */
const KEPT = [
  { file: 'keypad.js', fn: 'kpField_', has: '${lock}', count: 2,
    why: 'an answer box — every kind, every card and every practical slot is drawn here, and saved on every keystroke through `ansStore_`',
    proof: [['find.js', /closest\('\[data-do="qp-ans"\]'\)[\s\S]{0,700}?ansStore_\(/], ['keypad.js', /data-do="qp-ans"/]] },
  { file: 'find.js', fn: 'cellInput_', has: 'class="qp-cell"',
    why: 'a blank of a fill-in table — every cell of the card joined and saved on each keystroke through `ansStore_`, drawn back from `ansRead_`',
    proof: [['find.js', /classList\.contains\('qp-cell'\)[\s\S]{0,400}?ansStore_\(/]] },
  { file: 'me.js', fn: 'qualSlot_', has: "f('_board')",
    why: 'a qualification\'s board — the shelf saves each answer on its `change` (`qualCommit_`)',
    proof: [['me.js', /qualCommit_\(slot\);/]] },
  { file: 'board.js', fn: 'nbPicAsk_', has: 'createElement(input)',
    why: 'the whiteboard\'s picture picker (402) — a file chosen, never typed; the picture is saved on the board the moment it lands (`nbPicAdd_` → `nbDo_`)',
    proof: [['board.js', /function nbPicAdd_[\s\S]{0,600}?nbDo_\(/]] },
  { file: 'me.js', has: 'createElement(input)',
    why: 'the qualification shelf\'s "Something else…" box — saved on its own `change` like the select it replaces',
    proof: [['me.js', /sel\.replaceWith\(box\)/], ['me.js', /qualCommit_\(slot\);/]] },
  /* ONE BOX IN THE SOURCE FOR BOTH FINDERS — Find's `stuff-q` and the second finder's `res-q` are the same template under the finder's id § */
  { file: 'find.js', fn: 'finderScreen_', has: 'id="${F.id}-q"',
    why: 'a finder\'s search (Find\'s `stuff-q`, the second finder\'s `res-q`) — kept with that finder\'s place for a reload (`findPlaceKeep_`), never on its own',
    proof: [['find.js', /function findPlaceKeep_[\s\S]{0,900}?STUFF\.q/], ['find.js', /draftKeep_\(F\.place, 'place'/], ['shell.js', /findPlaceBack_\(\)/]] },
  { file: 'find.js', fn: 'paintDocket', has: 'dock-tick',
    why: 'a docket tick — saved the moment it is ticked (`docketSave`), and sent as the page goes',
    proof: [['find.js', /keepDue_\('docket', sendTodo\)/]] },
  { file: 'map.js', has: 'id="notepad"',
    why: 'the notepad — on the device at every keystroke (`familyUser`), on the account 1.4 s later or as the page goes',
    proof: [['find.js', /USER\.notepad = e\.target\.value/], ['find.js', /keepDue_\('notepad', padSend_\)/]] },
  { file: 'book.js', fn: 'noteRow_', has: 'book-note',
    why: 'the booking note — an answer in `BOOKING`, which is kept whole as it is typed (`bookKeep_`)',
    proof: [['book.js', /closest\('\[data-do="book-note"\]'\)[\s\S]{0,120}?BOOKING\.note = el\.value \|\| '';\s*bookKeep_\(\);/]] },
  { file: 'book.js', fn: 'discountRow_', has: "at('disc", count: 2,
    why: 'an admin\'s discount rows (How much, Code or reason; 421) — answers in `BOOKING`, kept whole as they are typed (`bookKeep_`), like the booking note (docs/history/353)',
    proof: [['book.js', /closest\('input\[data-do="book-disc"\]'\)[\s\S]{0,160}?BOOKING\[el\.dataset\.field\] = String\(el\.value \|\| ''\); bookKeep_\(\);/]] },
  { file: 'records.js', fn: 'profitControl_', has: 'data-pf=', count: 2,
    why: 'a term of the Profit card\'s sum (393) — slider and number box, kept as they move in `PROFIT.vals` on this device (`profitKeep_`), never sent',
    proof: [['records.js', /PROFIT\.vals\[el\.dataset\.pf\] = x;\s*profitKeep_\(\);/]] },
  { file: 'map.js', has: 'id="sr-text"',
    why: 'the speed reader\'s pasted text (403) — kept on the device as it is typed (`speedDraft`), never sent',
    proof: [['reader.js', /localStorage\.setItem\('speedDraft', e\.target\.value\)/]] },
  { file: 'reader.js', fn: 'speedSheet_', has: 'id="rsvp-wpm"',
    why: 'the speed reader\'s words a minute (403) — kept on the device as it moves (`speedWpm`)',
    proof: [['reader.js', /localStorage\.setItem\('speedWpm', String\(SPEED\.wpm\)\)/]] },
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
  { file: 'book.js', fn: 'stepManyList_', has: 'book-many-pick',
    why: 'a booking several-of-a-list tick — an answer in `BOOKING` (`book-many-pick`), and every answer goes through `drawBooker`, which keeps the form whole (`bookKeep_`)',
    proof: [['book.js', /on\('book-many-pick'[\s\S]{0,300}?drawBooker\(\);/], ['receipt.js', /function drawBooker\(\) \{[\s\S]{0,200}?bookKeep_\(\)/]] },
  { file: 'me.js', fn: 'fieldHtml', has: 'data-many-of',
    why: 'a settings several-of-a-list tick (the venues you teach at) — its `change` writes the hidden answer and keeps it as the field\'s draft (315 met 317)',
    proof: [['me.js', /matches\('input\[type="checkbox"\]\[data-many-of\]'\)[\s\S]{0,1500}?draftKeep_\(surface, id, box\.value/], ['me.js', /<input type="hidden" \$\{attr\}="\$\{esc\(name\)\}" value="\$\{esc\(said\)\}"\$\{da\}>/]] },
];
const PIN = 'a PIN — never written to the device, by a draft or anything else';
const PEOPLE_FORM = 'an admin making or changing somebody else\'s account — a decision made and saved there and then, not left half-made on a device';
const EXEMPT = [
  /* THE STAFF HUB'S PRICING (405): a what-if moved and saved in one sitting; the saved rate is what a reload draws. */
  { file: 'staff.js', fn: 'ctl', has: 'type="range" data-pv', why: 'the Staff hub\'s rate and seat sliders (405) — moved and saved in one sitting; a reload draws the saved rate' },
  { file: 'staff.js', fn: 'ctl', has: 'class="pf-num" data-pv', why: 'the Staff hub\'s rate and seat boxes (405) — typed and saved in one sitting; a reload draws the saved rate' },
  { file: 'me.js', fn: 'signInCard_', has: 'id="in-name"', why: 'the sign-in box — half a handle is not work, and none is kept after (383)' },
  { file: 'me.js', fn: 'peopleSearchPage_', has: 'data-psearch', why: 'the People search (442) — a handle looked up, not work; half a child\'s handle is better forgotten' },
  { file: 'me.js', fn: 'signInCard_', has: 'id="in-pin"', why: PIN },
  { file: 'me.js', fn: 'registerSheet_', has: 'id="reg-pin"', why: PIN },
  { file: 'me.js', fn: 'youSettingsPages_', has: 'id="pin-now"', why: PIN },
  { file: 'me.js', fn: 'youSettingsPages_', has: 'id="pin-new"', why: PIN },
  { file: 'me.js', fn: 'youSettingsPages_', has: 'id="pin-again"', why: PIN },
  { file: 'me.js', fn: 'registerSheet_', has: 'id="reg-noemail"', why: 'reset by the who-is-it question above it, which is asked again on purpose (`REG_NOTE`)' },
  { file: 'me.js', fn: 'friendsSheet', has: 'id="fr-add"', why: 'one handle, typed in seconds and sent by the button beside it' },
  /* THE PEOPLE COLUMN'S PERSON FORM (373): another person's account, decided and saved there and then. */
  { file: 'me.js', fn: 'box', has: 'data-pf="${k}"', why: PEOPLE_FORM },
  { file: 'me.js', fn: 'personFormHtml_', has: 'data-pf="dob"', why: PEOPLE_FORM },
  { file: 'me.js', fn: 'personFormHtml_', has: 'data-pf-role', why: PEOPLE_FORM },
  { file: 'me.js', fn: 'personFormHtml_', has: 'data-pf-parent', why: PEOPLE_FORM },
  /* AN ADMIN'S REEL OR VIDEO FORM (404): kept in `MEDIA_FORM` as typed, and one link pasted and saved there and then. */
  { file: 'games.js', fn: 'box', has: 'data-mf="${k}"', why: 'an admin adding a reel or video — kept in `MEDIA_FORM` as typed, a paste and a Save, not work left on a device' },
  { file: 'games.js', fn: 'mediaFormHtml_', has: 'data-mf="url"', why: 'one pasted YouTube link, looked up and saved there and then' },
  /* APPLY TO TEACH (400): one sheet filled and sent in a sitting; a reload starts the application again. */
  { file: 'me.js', fn: 'box', has: 'data-app="${k}"', why: 'the application to teach (400) — filled and sent in one sitting from its sheet' },
  { file: 'me.js', fn: 'area', has: 'data-app="${k}"', why: 'the application to teach (400) — filled and sent in one sitting from its sheet' },
  { file: 'me.js', fn: 'applyFormHtml_', has: 'data-app="dbsNeeded"', why: 'the application to teach (400) — a tick in the sheet sent with it' },
  { file: 'me.js', fn: 'applyFormHtml_', has: 'data-app="consent"', why: 'the application to teach (400) — a tick in the sheet sent with it' },
  { file: 'staff.js', fn: 'agreementCard_', has: 'agree-sign', why: 'acts the moment it is ticked (`agree-sign`) — nothing waits between the tick and the server' },
  { file: 'me.js', fn: 'notifyCard_', has: 'notify-pick', why: 'a Notifications tick is a `setNotify` the moment it is ticked, and a failure puts it back to what the server has — the agreement\'s reason: there is no Save to wait for, so nothing is half-made on the device, and a reload draws the server\'s answer (docs/history/309)' },
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
        /* A TEXTAREA'S VALUE IS ITS WORDS, between the tag and `</textarea>` — where its draft is drawn. */
        const from = a + t.index + text.length, close = tag === 'textarea' ? src.indexOf('</textarea>', from) : -1;
        const body = close > from && close - from < 600 ? src.slice(from, close) : '';
        sites.push({ file: f, fn: name, line: src.slice(0, a + t.index).split('\n').length, tag, text: text.replace(/\s+/g, ' '), body });
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
/* A DRAFT: `draftAttr_(` in the tag, or `${name}` where the function the tag is in sets `name` from it.
   The surface, and the id as written (`'first'`, `p.id`, `item.id + ':' + k`), for `drawnBack` below. */
const ATTR = /draftAttr_\(\s*'([\w-]+)'\s*(?:,\s*([^,)]+))?/;
function draftCall(s) {
  if (/draftAttr_\(/.test(s.text)) { const m = ATTR.exec(s.text); return m ? { surface: m[1], id: (m[2] || '').trim() } : { surface: '?', id: '' }; }
  const lit = /data-draft="([\w-]+):([^"]*)"/.exec(s.text);
  if (lit) return { surface: lit[1], id: '' };
  const body = fnSrc[s.file + ':' + s.fn] || '';
  for (const x of s.text.matchAll(/\$\{\s*([A-Za-z_$][\w$]*)\s*\}/g)) {
    const set = new RegExp('\\b' + x[1] + '\\s*=\\s*[^;]*?' + ATTR.source).exec(body);
    if (set) return { surface: set[1], id: (set[2] || '').trim() };
  }
  return null;
}
const draftOf = s => { const c = draftCall(s); return c ? c.surface : ''; };
/* AND DRAWN BACK: `draftVal_('<surface>', <the same id>` in the tag or a textarea's words, in the function the tag is in, or in a helper either of them calls § */
const squash = x => String(x || '').replace(/\s+/g, '');
function drawnBack(s, c) {
  const want = squash("draftVal_('" + c.surface + "'," + c.id);
  const fn = fnSrc[s.file + ':' + s.fn] || '';
  const near = s.text + ' ' + (s.body || '');
  const helpers = [...near.matchAll(/\b([A-Za-z_$][\w$]*)\(/g)].map(m => fnSrc[s.file + ':' + m[1]] || '').join(' ');
  if (c.id && [near, fn, helpers].some(t => squash(t).indexOf(want) !== -1)) return true;
  const sf = c.surface.replace(/-/g, '\\-');
  const attrs = (fn.match(new RegExp("draftAttr_\\(\\s*'" + sf + "'", 'g')) || []).length;
  return attrs <= 1 && [near, fn, helpers].some(t => new RegExp("draftVal_\\(\\s*'" + sf + "'").test(t));
}
const count = { answer: 0, draft: 0, kept: 0, exempt: 0, none: 0 };
const surfaces = new Set();
for (const s of sites) {
  const where = s.file + ':' + s.line + ' (' + s.fn + ')';
  const type = (s.text.match(/\btype="([a-z-]+)"/i) || [])[1] || '';
  if (/^(hidden|file)$/i.test(type)) { count.none++; continue; }
  const c = draftCall(s);
  if (c) {
    const d = c.surface;
    count.draft++;
    surfaces.add(d);
    if (/^password$/i.test(type) || /type="password"/.test(s.text)) bad.push(where + ' is a password box carrying a draft — a PIN would be written to the device');
    if (d !== '?' && !drawnBack(s, c)) bad.push(where + ' keeps a "' + d + '" draft (' + (c.id || 'no id') + ') and never draws it back — no `draftVal_(\'' + d + '\', ' + (c.id || '…') + ', …)` in the tag, its function or a helper it calls. The device holds the words and the reload shows an empty box.');
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
  if (!new RegExp('(draftDrop_|draftSentDone_)\\(\\s*\'' + sf.replace(/[-]/g, '\\-') + '\'').test(ALL)) bad.push('the "' + sf + '" drafts are kept and never dropped — what was sent comes back in the box after the next reload');
});

/* ---------- AND THE HELPER --------------------------------------------------------------------------- */
const data = SRC['data.js'] || '';
if (!/\['input', 'change'\]\.forEach\(ev => document\.addEventListener\(ev, e => \{[\s\S]{0,160}draftFrom_\(/.test(data)) {
  bad.push('data.js has no delegated input/change listener calling `draftFrom_` — every DRAFT above is drawn back and never kept');
}
const never = /const DRAFT_NEVER = (\/.+\/[a-z]*);/.exec(data);
const neverFn = /function draftNever_\(name\) \{[^\n]*\}/.exec(data);
if (!never || !neverFn) bad.push('data.js has no `DRAFT_NEVER` and `draftNever_` — nothing refuses a PIN that a draft box asks to keep');
else {
  /* THE REAL RULE, AS data.js WRITES IT — the pattern and the camelCase split together. */
  const refuses = new Function(never[0] + '\n' + neverFn[0] + '\nreturn draftNever_;')();
  ['set:lib1_pin', 'reg:pin', 'kid-new:pin', 'set:pin', 'x:password', 'set:lib3_pin',
   /* the review of 317's: camelCase, joined, and what pays */
   'set:pinNew', 'x:newPin', 'x:pincode', 'x:pinNumber', 'x:card_number', 'x:sortcode', 'x:security_code',
   'set:account_number', 'set:sort_code', 'x:cardNo', 'x:cvv2'].forEach(k => { if (!refuses(k)) bad.push('`DRAFT_NEVER` lets "' + k + '" be kept'); });
  ['set:pinned', 'post:cap', 'set:headline', 'msg:P-12', 'set:spinner', 'set:opinion', 'set:phone_no',
   'rec:R1:reference', 'post-edit:PO2:when', 'set:account_name', 'msg:P002'].forEach(k => { if (refuses(k)) bad.push('`DRAFT_NEVER` refuses "' + k + '", which is not a PIN'); });
  if (!/function draftKeep_\([^)]*\) \{\s*if \(draftNever_\(/.test(data)) bad.push('`draftKeep_` does not ask `draftNever_` first — the rule above refuses nothing');
}
if (!/\^\(password\|file\|hidden\)\$/.test(data)) bad.push('`draftFrom_` no longer skips password, file and hidden boxes');
const leave = /window\.addEventListener\('beforeunload', e => \{([\s\S]*?)\n\}\);/.exec(data);
if (!leave) bad.push('data.js has no "Leave site?" for work held by nothing but the page');
else if (!/^\s*if \(!keepAtRisk_\(\)\.length\) return;/.test(leave[1])) bad.push('the `beforeunload` in data.js does not return first when nothing is at risk — a prompt on every refresh is noise');
const others = FILES.filter(f => f !== 'data.js' && /addEventListener\(\s*'beforeunload'/.test(SRC[f]));
if (others.length) bad.push('a second "Leave site?" in ' + others.join(', ') + ' — the one in data.js asks only when the work is in nothing but the page');

/* ---------- AND THE CARD BEING EDITED, WHICH KEEPS ONE DRAFT FOR THE WHOLE CARD (docs/history/330) § */
const me = SRC['me.js'] || '';
[
  [/\['input', 'change'\]\.forEach\(ev => document\.addEventListener\(ev, e => \{[\s\S]{0,160}closest\('\.card-ed \.me-form'\)[\s\S]{0,120}cardKeep_\(form\);/,
   'a delegated input/change listener on the card being edited that calls `cardKeep_`'],
  [/draftKeep_\('card', e\.pid, JSON\.stringify\(\{ v, from \}\)\)/, '`cardKeep_` writing the card\'s draft, each box with the saved value it was typed over'],
  [/draftRead_\('card', pid\)/, 'the card drawn back from its draft (`cardDraft_`)'],
  [/function qualSave_\(el\) \{[\s\S]{0,900}?cardKeep_\(ed\); return Promise\.resolve\(true\);/, 'the qualification shelf keeping an answer on a card rather than posting it (`qualSave_`)'],
  [/function cardClose_\(e, pane\) \{\s*try \{ draftDrop_\('card', e\.pid\); \}/, 'Save and Cancel dropping the card\'s draft (`cardClose_`)'],
  [/const keep = attr === 'data-me' && !ro && o\.draft !== false && setDraftOk_\(name\);/, '`fieldHtml` honouring `draft: false`, so a box on the card does not keep a `set` draft as well'],
].forEach(([re, what]) => { if (!re.test(me)) bad.push('me.js has no ' + what + ' — a card typed into and reloaded loses what was typed'); });

said.push(sites.length + ' boxes in ' + FILES.length + ' files: ' + count.answer + ' answer boxes (kpField_), ' + count.draft + ' drafts in '
  + surfaces.size + ' surfaces (' + [...surfaces].sort().join(', ') + '), ' + count.kept + ' kept by their own code, '
  + count.exempt + ' exempt with a reason, ' + count.none + ' hidden or file; and the card being edited, one draft for the whole card');

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
