#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-settings.js

   THE NINE TABS THAT BECAME FILES, AND WHETHER THE APP IS STILL READING THE RIGHT COLUMNS.

   `brand`, `facets`, `kinds`, `laws`, `facts`, `splashes`, `links`, `campaigns` and `copy` left the
   Settings spreadsheet and became `data/settings/*.json`. `settingsInto_` maps them onto `DATA`, and
   the rule there is the one `libraryExtras_` already had: a file with rows WINS, a file with none
   leaves the payload's key alone. That makes them the source of truth for nine tabs.

   NOTHING CHECKED THEM. `check-rows.js` asks whether every `r.<name>` in the backend is a column of
   the tab that row came from, and it was written because folding two tabs together left SEVEN reads
   of `r.link` on rows that call the URL `source_url` — every checklist topic arriving with no link
   on it, and nothing throwing. `check-columns.js` could not see it either, because `link` is a
   column of some other tab.

   THE SAME FAULT IS NOW AVAILABLE ONE LAYER ALONG. These files are the tab. A column renamed in an
   export, or a read written from memory, is a value that silently arrives as `undefined` and then as
   `''` — a brand key that never resolves, a facet with no label, a campaign with no accent — and
   every one of those has a fallback, which is exactly why nobody would notice.

   IT IS A SLICE, NOT A PARSE, and that is honest here in a way it would not be in the backend.
   `settingsInto_` is nine blocks of the same shape, each opening `const x = extra['settings/x']`, so
   the block that belongs to a tab is the text between its own line and the next one's. `check-rows`
   needed acorn because `dopost.gs` binds `r` to a different tab in every handler; here one block is
   one tab by construction.

   WHAT IT REFUSES, AND WHAT IT ONLY PRINTS:

     FAILS   a column READ that the file does not have. That is a value that will always be empty.
     FAILS   a tab named in `SETTINGS_TABS` with no file beside it — a fetch that 404s for ever.
     PRINTS  a column the file HAS and nothing reads. Weight shipped to every phone for nobody,
             which is `check-payload.js`'s "sent and never read" and breaks nothing.
     PRINTS  a file in `data/settings/` that `SETTINGS_TABS` does not name. Eleven of those are
             deliberate: they moved to the Ledger because the backend computes something from them.

   AN EMPTY FILE CANNOT BE CHECKED and says so rather than passing. `kinds` and `laws` are `[]`
   because both tabs were empty — that is the escape hatch `check/fixture.json` proves, and it means
   this file cannot know what columns they have. "I did not manage to look" printed as "I looked and
   it was fine" is the failure this repository keeps finding in its own checks.

     node js/check-settings.js
================================================================================================== */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const srcPath = path.join(dir, 'js', 'settings.js');
if (!fs.existsSync(srcPath)) { console.log('no js/settings.js — nothing to check'); process.exit(1); }
const raw = fs.readFileSync(srcPath, 'utf8');

/* ---------- PARSED, BECAUSE A SLICE MIS-ATTRIBUTED ON ITS FIRST RUN ------------------------------
   THE FIRST VERSION CUT THE FILE INTO NINE BLOCKS, one per `const x = extra['settings/x']`, and
   reported seven columns "read and not there" on `copy`. Every one of them belongs to CAMPAIGNS:
   `settingsInto_` builds the copy index INSIDE the campaigns block, because a campaign carries its
   own words, so the copy binding opens before the campaign mapping and a flat slice handed the
   campaign's reads to the wrong tab. Meanwhile `campaigns` reported reading nothing at all, which
   is the tell — a check that finds zero reads in a block full of them has lost its subject.

   THAT IS `check-rows.js`'s FAULT EXACTLY. Its first version reported 95 findings with 2 real ones
   in them because one binding map per FILE let a handler's `r` outlive the handler. The answer
   there was a scope chain, and the answer here is the same instrument: acorn, which is already a
   dependency for that check.

   THE BINDING IS THE CALL, NOT THE LINE. Every read in this file is inside `X.forEach(r => …)` or
   `X.map(r => …)`, so the tab is whatever `X` resolves to — a local `const` bound to
   `extra['settings/x']`, or the expression itself, or the head of a chain like
   `campaigns.filter(…).map(…)`. One arrow is one tab by construction, and nothing has to guess. */
const acorn = require('acorn');
let ast;
try { ast = acorn.parse(raw, { ecmaVersion: 'latest', sourceType: 'script' }); }
catch (e) { console.log('! could not parse js/settings.js: ' + e.message); process.exit(1); }

const walk = (node, fn) => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach(n => walk(n, fn)); return; }
  if (node.type) fn(node);
  for (const k of Object.keys(node)) {
    if (k === 'type' || k === 'start' || k === 'end') continue;
    walk(node[k], fn);
  }
};

/* `const facets = extra['settings/facets']` — the only way a tab gets a local name here. */
const tabOfExpr = n => {
  if (!n) return null;
  if (n.type === 'LogicalExpression') return tabOfExpr(n.left) || tabOfExpr(n.right);
  if (n.type === 'MemberExpression' && n.computed
      && n.object.type === 'Identifier' && n.object.name === 'extra'
      && n.property.type === 'Literal') return String(n.property.value);
  return null;
};
const named = {};
walk(ast, n => {
  if (n.type !== 'VariableDeclarator' || !n.id || n.id.type !== 'Identifier') return;
  const t = tabOfExpr(n.init);
  if (t) named[n.id.name] = t;
});

/* THE HEAD OF A CHAIN. `campaigns.filter(…).map(r => …)` is a `.map` on a `.filter` on a name. */
const rootTab = n => {
  for (let i = 0; i < 12 && n; i++) {
    const t = tabOfExpr(n);
    if (t) return t;
    if (n.type === 'Identifier') return named[n.name] || null;
    if (n.type === 'CallExpression') { n = n.callee; continue; }
    if (n.type === 'MemberExpression') { n = n.object; continue; }
    if (n.type === 'ParenthesizedExpression') { n = n.expression; continue; }
    return null;
  }
  return null;
};

/* THE LIST ITSELF, off the AST rather than out of a regex — `SETTINGS_TABS` is what `library.js`
   fetches, so it is the list that decides which files are asked for at all. */
let TABS = [];
walk(ast, n => {
  if (n.type !== 'VariableDeclarator' || !n.id || n.id.name !== 'SETTINGS_TABS') return;
  if (!n.init || n.init.type !== 'ArrayExpression') return;
  TABS = n.init.elements.filter(e => e && e.type === 'Literal').map(e => String(e.value));
});
if (!TABS.length) { console.log('! SETTINGS_TABS is empty or not an array — this checked nothing'); process.exit(1); }

const READS = {};      /* tab -> Set of columns */
const ITER = /^(forEach|map|filter|find|some|every|reduce|flatMap|sort)$/;
walk(ast, n => {
  if (n.type !== 'CallExpression' || !n.callee || n.callee.type !== 'MemberExpression') return;
  if (n.callee.computed || n.callee.property.type !== 'Identifier') return;
  if (!ITER.test(n.callee.property.name)) return;
  const arrow = n.arguments[0];
  if (!arrow || (arrow.type !== 'ArrowFunctionExpression' && arrow.type !== 'FunctionExpression')) return;
  if (!arrow.params.length || arrow.params[0].type !== 'Identifier') return;
  const tab = rootTab(n.callee.object);
  if (!tab) return;
  const p0 = arrow.params[0].name;
  const set = READS[tab] || (READS[tab] = new Set());
  walk(arrow.body, m => {
    if (m.type !== 'MemberExpression' || m.computed || m.property.type !== 'Identifier') return;
    if (m.property.name === '_row') return;    /* the sheet's own row number, added by `read()` */
    /* THE ROW ITSELF — `facts.map(r => …)`. */
    if (p0 === 'r' && m.object.type === 'Identifier' && m.object.name === 'r') { set.add(m.property.name); return; }
    /* ---------- OR THE ROW CARRIED IN A WRAPPER ----------------------------------------------
       `facts` NEEDS ITS INDEX, so it maps to `{ r, i }` first and every read after that is
       `x.r.heading`. Reading only `r.<col>` found nothing at all in that block and reported the
       tab as mapped nowhere — which is the right complaint about the wrong thing, and the tell was
       that a block plainly full of reads came back with zero.

       ANY PARAMETER NAME, but only through `.r`, so the `.sort((a, b) => a.order - b.order)` at the
       end of that same chain contributes nothing: `order` and `row` are fields of the MAPPED object
       and are not columns of anything. */
    if (m.object.type === 'MemberExpression' && !m.object.computed
        && m.object.object.type === 'Identifier' && m.object.object.name === p0
        && m.object.property.type === 'Identifier' && m.object.property.name === 'r') set.add(m.property.name);
  });
});

/* ---------- READ ON PURPOSE, AND THE COLUMN IS NOT THERE -------------------------------------------
   THE `ACCEPTED` PATTERN FOR THE SIXTH TIME, after check-payload, `VOCAB`, `ACCEPTED_TAP`,
   `RETIRED_FACETS` and `HANDLE_ALLOWED`. One entry, one written reason, still printed. */
const ACCEPTED_GONE = {
  'settings/facts': {
    clip: 'A REEL IS A FACT WITH A CLIP ON IT, and the exported tab has never had that column — the '
        + 'clips live in `FEED_FACTS` in `chess.js`. `clipsNow_` asks the sheet for rows with a clip '
        + 'and falls through to the code\'s list when it finds none, which is the house rule stated '
        + 'per LIST rather than per tab: one ordinary fact typed into the sheet must not take the '
        + 'Reels column dark. The read is what makes the fall-through work, and it is also the door: '
        + 'add a `clip` column and a row wins over the code.',
  },
};

let failed = 0;
const notes = [];
const rows = [];
const accepted = [];

TABS.forEach(tab => {
  const read = READS[tab] || new Set();
  if (!read.size) {
    failed++;
    rows.push({ tab, kind: 'nothing reads it', detail: 'named in SETTINGS_TABS and no `r.` read is '
      + 'attributed to it — either it is mapped nowhere, or this check lost its subject' });
    return;
  }

  const file = path.join(dir, 'data', tab + '.json');
  if (!fs.existsSync(file)) {
    failed++; rows.push({ tab, kind: 'no file', detail: 'data/' + tab + '.json is not there' });
    return;
  }
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { failed++; rows.push({ tab, kind: 'unreadable', detail: String(e.message).slice(0, 80) }); return; }
  if (!Array.isArray(data)) {
    failed++; rows.push({ tab, kind: 'not a list', detail: 'the file holds ' + typeof data });
    return;
  }
  if (!data.length) {
    rows.push({ tab, kind: 'empty', detail: 'no rows, so its columns cannot be known — '
      + read.size + ' read(s) unchecked' });
    return;
  }

  const cols = new Set();
  data.forEach(r => { if (r && typeof r === 'object') Object.keys(r).forEach(k => cols.add(k)); });

  const gone = [...read].filter(k => !cols.has(k) && !(ACCEPTED_GONE[tab] || {})[k]).sort();
  const said = [...read].filter(k => !cols.has(k) && (ACCEPTED_GONE[tab] || {})[k]).sort();
  const dead = [...cols].filter(k => !read.has(k)).sort();
  if (gone.length) { failed++; rows.push({ tab, kind: 'read and not there', detail: gone.join(', ') }); }
  else rows.push({ tab, kind: 'ok', detail: data.length + ' rows, ' + read.size + ' column(s) read' });
  said.forEach(k => accepted.push({ tab, col: k, why: ACCEPTED_GONE[tab][k] }));
  if (dead.length) notes.push({ tab, cols: dead });
});

/* AND THE OTHER WAY ROUND: a file nobody fetches. Eleven of these are deliberate — `config`,
   `pricing` and `venues` feed `quotePerHour` SERVER-SIDE, because "a total posted by a browser is a
   total the client chose", and five more are reshaped by a function on the backend before anybody
   sees them. They are listed rather than judged. */
const onDisk = fs.existsSync(path.join(dir, 'data', 'settings'))
  ? fs.readdirSync(path.join(dir, 'data', 'settings')).filter(f => f.endsWith('.json'))
      .map(f => 'settings/' + f.replace(/\.json$/, ''))
  : [];
const unfetched = onDisk.filter(t => !TABS.includes(t)).sort();

console.log('');
rows.forEach(r => {
  const mark = r.kind === 'ok' ? '  ok  ' : r.kind === 'empty' ? '  ??  ' : ' FAIL ';
  console.log(mark + r.tab.padEnd(20) + r.kind.padEnd(20) + r.detail);
});
if (accepted.length) {
  console.log('\nREAD ON PURPOSE AND NOT IN THE FILE, WITH A REASON:');
  accepted.forEach(a => console.log('   ' + a.tab + ' · ' + a.col + '\n      ' + a.why));
}
if (notes.length) {
  console.log('\nIN THE FILE AND READ BY NOTHING — weight, not breakage:');
  notes.forEach(n => console.log('   ' + n.tab.padEnd(20) + n.cols.join(', ')));
}
if (unfetched.length) {
  console.log('\nbeside them on disk and not fetched (moved to the Ledger, or not wired yet):');
  console.log('   ' + unfetched.join(', '));
}

console.log('');
if (failed) console.log(failed + ' problem(s) — a column read off a file that does not have it is a '
                      + 'value that is always empty, with a fallback hiding it.');
else console.log('every column the app reads off a settings file is a column that file has.');
process.exit(failed ? 1 : 0);
