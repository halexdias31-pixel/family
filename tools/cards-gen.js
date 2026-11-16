#!/usr/bin/env node
/* @family. — tools/cards-gen.js ONE CARD RULE, TWO PLACES (owner, 16 Nov): the Sunday email drifted from the site's cards. */
/* `--write` copies the site's name formatter and tag dedupe verbatim into backend/cards-gen.gs; else it fails on a stale copy, */
/* or on the digest growing its own copy back (a madeOf, a hand-capitalised name, a tag trim, a topic cap, a clip that swaps words for "on the site"). */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'backend/cards-gen.gs');
/* WHAT IS SHARED, FROM WHERE: each a top-level `function NAME` or `const NAME =` in a site file, copied as it stands. */
const TAKE = [
  ['js/data.js', ['nameBesideHandle_', 'capFirst_', 'nameKid_', 'fmtName_']],
  ['js/find-figures.js', ['TAG_NAME', 'tagMadeOf_']],
  /* THE WORDS FILE, THE FORMATTERS AND THE ONE TEXT CARD (owner rule 1.1): every booking email, receipt and notice is cardText_. */
  ['js/core.js', ['WORDS_FILE', 'text_', 'fmtTime_', 'fmtHours_', 'fmtMoney_', 'DAYS_SHORT', 'fmtDay_', 'fmtDmy_', 'fmtDate_', 'cardText_']],
  /* EACH FACET'S HUE (tools/facet-hues.js): a card's tag is `h` + TAG_OF[field], and so is the email's. */
  ['js/find-bundles.js', ['TAG_OF']],
  /* HOW MANY DIGITS A PIN HAS (owner, 16 Nov): the sign-in keypad's number is the one the backend makes PINs to. */
  ['js/find-account.js', ['SIGN_PIN_LEN']],
  /* A PART THAT NAMES A PICTURE HAS ONE (11 Nov): the email's `Verified` asks `figUndrawn_` as the card's `verifyTags_` does. */
  /* A VALUE TOO LONG FOR A TAG IS SAID AS THE MENU SAYS IT (`showForms_`, `SHOW_MAX`): "Section A: Modern prose or…". */
  ['js/find-facets.js', ['SHOW_MAX', 'showForms_']],
  ['js/predicates-fig.js', ['FIG_WORDS', 'FIG_NOT_WORDS', 'figWords_', 'figPictured_', 'figUndrawn_']],
];
/* THE EMAIL'S TAGS, FROM THE SITE'S ONE RULE (owner rule 1.1, 16 Nov): no hand table of facets or colours in the backend. */
/* DIGEST_TAG_FIELDS: data/settings/facets.json's live facets in its order (the site's one facet list, rule 1.80). */
/* DIGEST_TAG_INK: each hue `hN` as style.css's `--hue-N`, the colour `[data-tag="hN"]` draws. */
function tagParts() {
  const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/facets.json'), 'utf8'));
  const fields = rows.filter(r => r && r.field && r.active !== false && isFinite(Number(r.sort_order)) && String(r.sort_order) !== '')
    .map((r, i) => ({ f: r.field, at: Number(r.sort_order), i })).sort((x, y) => x.at - y.at || x.i - y.i).map(o => o.f);
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8'), ink = {};
  let m;
  const re = /--hue-(\d+):\s*(#[0-9a-fA-F]{3,8})/g;
  while ((m = re.exec(css))) if (!(('h' + m[1]) in ink)) ink['h' + m[1]] = m[2];
  if (!Object.keys(ink).length) throw new Error('tools/cards-gen.js: style.css has no `--hue-N: #…` tokens');
  return '/* from data/settings/facets.json and style.css --hue-N */\n'
    + 'const DIGEST_TAG_FIELDS = ' + JSON.stringify(fields).replace(/","/g, '", "') + ';\n'
    + 'const DIGEST_TAG_INK = ' + JSON.stringify(ink).replace(/":"/g, '": "').replace(/","/g, '", "') + ';';
}
/* THE PERSON FACT KEYS (kinds.json person.facts.keys, rule 1.80): the backend drops any fact whose `what` is not one. */
function factParts() {
  const keys = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/kinds.json'), 'utf8')).kinds.person.facts.keys;
  return '/* from data/settings/kinds.json person.facts.keys */\nconst PERSON_FACT_KEYS = ' + JSON.stringify(keys).replace(/","/g, '", "') + ';';
}
/* EVERY KIND'S STORE AND WHO SEES IT (kinds.json `kinds`, `stored`, `ledger`; owner, 16 Nov): the one general action `item` reads this. */
function kindParts() {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/kinds.json'), 'utf8')), kinds = {};
  const take = (k, v) => { if (v.sheet && v.sheet.tab) kinds[k] = { sheet: v.sheet, see: v.see || {}, edit: v.edit || null }; };
  Object.entries(j.kinds).forEach(([k, v]) => take(k, v));
  Object.entries(j.stored || {}).forEach(([k, v]) => take(k, v));
  const L = j.ledger;
  return '/* from data/settings/kinds.json kinds/stored/ledger: each kind\'s sheet, see and edit */\nconst ITEM_STORE_KINDS = '
    + JSON.stringify({ never: L.never, items: L.items, events: L.events, kinds }) + ';';
}
function grab(src, name, file) {
  const lines = src.split('\n');
  const at = lines.findIndex(l => l.startsWith('function ' + name + '(') || l.startsWith('const ' + name + ' '));
  if (at < 0) throw new Error('tools/cards-gen.js: ' + file + ' has no top-level ' + name);
  const out = [];
  if (lines[at].startsWith('function ')) {
    for (let i = at; i < lines.length; i++) { out.push(lines[i]); if (/^}/.test(lines[i])) break; }
  } else {
    /* A `const` ENDS at an unindented `;` line, or at an indented one that the next statement follows (a three-line arrow). */
    for (let i = at; i < lines.length; i++) { out.push(lines[i]); if (/;\s*$/.test(lines[i]) && (!/^\s/.test(lines[i]) || /^(const |let |function |\/\*|$)/.test(lines[i + 1] || ''))) break; }
  }
  return out.join('\n');
}
function build() {
  const parts = TAKE.map(([file, names]) => {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    return '/* from ' + file + ' */\n' + names.map(n => grab(src, n, file)).join('\n');
  }).concat([tagParts(), factParts(), kindParts()]);
  return '/* @family. — cards-gen.gs GENERATED by `node tools/cards-gen.js --write` from the site\'s own code; edit the site, never this. */\n'
    + '/* The Sunday email and every booking email name, tag, word, format and card by these (cardText_), so none can drift from the site. */\n'
    + parts.join('\n') + '\n';
}
const body = build();
if (process.argv.includes('--write')) {
  fs.writeFileSync(OUT, body);
  console.log('cards-gen: backend/cards-gen.gs written (' + TAKE.reduce((n, t) => n + t[1].length, 0) + ' names)');
  process.exit(0);
}
const bad = [];
let have = '';
try { have = fs.readFileSync(OUT, 'utf8'); } catch (e) { /* missing is stale */ }
if (have !== body) bad.push('backend/cards-gen.gs is not the site\'s current code — node tools/cards-gen.js --write');
/* AND THE DIGEST HAS NO COPY OF ITS OWN: each pattern is a second renderer of something the site already decides. */
const NOT = [
  [/const madeOf\s*=/, 'its own tag dedupe (use tagMadeOf_)'],
  [/said\['tags:'/, 'a per-card tag trim (every card wears its full tag set, as on the site)'],
  [/topics\.slice\(0,\s*\d+\)/, 'a cap on the topics (every topic is listed)'],
  [/\bcutOut\b|opts\.cut\b|DIGEST_CUT_FIRST|DIGEST_CLIP_BYTES|\(the question’s words are on the site\)/, 'a clip that swaps a card\'s words for "on the site" (the card carries them whole)'],
  [/S\(L\.first\)\s*\|\|/, 'a child\'s name not through fmtName_'],
  [/const DIGEST_TAG_(FACETS|INK|FIELDS)\s*=/, 'its own table of tag facets or colours (cards-gen.gs generates DIGEST_TAG_FIELDS, DIGEST_TAG_INK and TAG_OF)'],
];
['backend/digest.gs', 'backend/digest-tags.gs'].forEach(f => {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  NOT.forEach(([re, what]) => { if (re.test(src)) bad.push(f + ' has ' + what); });
});
/* AND NO EMAIL ANYWHERE IN THE BACKEND BUILDS A CARD BY HAND: a bullet of a booking's fields, a hand-made £, a hand-made card's HTML. */
const HAND = [
  [/£['"]\s*\+/, 'money written by hand (use fmtMoney_)'],
  [/'•\s*'\s*\+\s*S\(\w+\.(subject|day|location|level|price)\)/, 'a card\'s lines written by hand (use cardText_)'],
  [/htmlBody\s*:\s*['"`]</, 'a card\'s HTML written by hand in an email'],
];
fs.readdirSync(path.join(ROOT, 'backend')).filter(f => /\.gs$/.test(f) && f !== 'cards-gen.gs').forEach(f => {
  const src = fs.readFileSync(path.join(ROOT, 'backend', f), 'utf8');
  if (!/mailOut_\(|notify\(|MailApp\./.test(src)) return;
  src.split('\n').forEach((line, i) => {
    if (/^\s*(\/\*|\*|\/\/)/.test(line)) return;
    HAND.forEach(([re, what]) => { if (re.test(line)) bad.push('backend/' + f + ':' + (i + 1) + ' has ' + what); });
  });
});
if (bad.length) { bad.forEach(b => console.log('  ✗ ' + b)); console.log('cards-gen: ' + bad.length + ' problem(s)'); process.exitCode = 1; }
else if (process.env.VERBOSE || process.argv.includes('-v')) console.log('cards-gen: ok — the email names and tags by the site\'s own code');
