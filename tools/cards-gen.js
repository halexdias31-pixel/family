#!/usr/bin/env node
/* @family. — tools/cards-gen.js ONE CARD RULE, TWO PLACES (owner, 16 Nov): the Sunday email drifted from the site's cards. */
/* run() copies the site's card maker (renderCard and its blocks), name formatter, words and tag dedupe verbatim into backend/cards-gen.gs. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'backend/cards-gen.gs');
/* WHAT IS SHARED, FROM WHERE: each a top-level `function NAME` or `const NAME =` in a site file, copied as it stands. */
const TAKE = [
  ['js/data.js', ['nameBesideHandle_', 'capFirst_', 'nameKid_', 'fmtName_', 'qualLevel_', 'qualRank_']],
  /* A QUESTION WEARS ITS PAPER'S CARD (owner, 17 Nov): the email joins the file's rows as the site does, by LIB_FILES.questions.joined. */
  ['js/library.js', ['libJoinPaper_']],
  /* QUESTION ALIASES (answer-ids): the map and the merge the site reads by, as the backend files answers. */
  ['js/qaliases.js', ['QALIAS', 'qAliasKey_', 'qAliasMine_']],
  /* THE SCHOOL YEAR AND EASTER (491): booking.gs `schoolYear` and setup.gs `easterOf_` date by the site's rule. */
  ['js/arcade.js', ['tdEaster_', 'tdJul_', 'tdYear0_', 'tdYear_']],
  /* A STORED VERDICT AS THE ONE MARKING ENGINE'S SHAPE (owner, 17 Nov): the Sunday email's `digestMark_` reads it as the site's `subSay_` does. */
  ['js/find-marking.js', ['verdictOf_']],
  ['js/find-figures.js', ['TAG_NAME', 'tagMadeOf_']],
  /* THE WORDS FILE AND THE FORMATTERS (owner rule 1.1): every line a card says in an email goes through these. */
  ['js/core.js', ['WORDS_FILE', 'esc', 'text_', 'fmtTime_', 'fmtHours_', 'fmtMoney_', 'DAYS_SHORT', 'fmtDay_', 'fmtDmy_', 'fmtDate_',
    /* ONE PERSON ROW, ONE TUTOR CARD (owner, 17 Nov): get-people.gs `tutorOut_` and me-card.js `cardPatchTutor_` read a row by it. */
    'ageRank_', 'ageOut_', 'tutorCardOf_']],
  /* THE ONE CARD MAKER (owner, 16 Nov: one card maker everywhere): renderCard and the blocks it draws; an email calls it with its inline setting. */
  ['js/cards-render.js', ['cardRuns_', 'CARD_ENT', 'cardHasMarkup_', 'cardMarkupRuns_', 'CARD_SUB', 'cardSub_', 'cardFrac_', 'cardLastGap_', 'cardAttrs_',
    'cardPic_', 'pixSvg_', 'cardTag_', 'renderTags', 'cardControl_', 'cardAnswer_', 'CARD_EMBEDS', 'cardEmbed_', 'cardTree_', 'cardGrid_', 'cardChoice_',
    'cardChoices_', 'CARD_BLOCKS', 'CARD_DRAW_ELS', 'cardDraw_', 'cardBlock_', 'cardBlocks_', 'renderCard', 'cardLetterOf_', 'cardLetterLines_', 'cardLetter_',
    'answerTag_', 'answersRow_', 'answerBox_']],
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
    + JSON.stringify({ moved: L.moved || [], never: L.never, items: L.items, events: L.events, kinds }) + ';';
}
/* THE ONE LIBRARY IMPORTER'S FILES (kinds.json `sheet.lib`, rule 1.80): `libImport_` takes a file or a kind by these. */
function libParts() {
  return '/* from data/settings/kinds.json sheet.lib (tools/lib/lib-files.js) */\nconst LIB_FILES = ' + JSON.stringify(require('./lib/lib-files.js').libFiles()) + ';';
}
/* EACH KIND'S LETTER (kinds.json `card.letter`, rule 1.80): the lines, labels and inline styles renderCard writes an email's card by. */
function letterParts() {
  const kinds = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/kinds.json'), 'utf8')).kinds, out = {};
  Object.keys(kinds).forEach(k => { const c = kinds[k].card; if (c && c.letter) out[k] = { card: { letter: c.letter } }; });
  return '/* from data/settings/kinds.json card.letter */\nconst ITEM_KINDS = ' + JSON.stringify({ kinds: out }) + ';';
}
/* THE ONE PRICE (owner, 17 Nov): js/core-price.js whole, inside \`priceCore_(DATA, askProps_)\` with the core.js readers it leans on, */
/* so createJob prices a booking over the sheet's own rows by the site's own lines (booking.gs \`serverPrice_\`); nothing leaks into the backend's globals. */
const PRICE_READERS = ['norm', 'num', 'parseDMY', 'CLOSED_', 'closedOn_', 'computeSessionDates', 'bookableSpaces', 'spaceFor'];
function priceParts() {
  const core = fs.readFileSync(path.join(ROOT, 'js/core.js'), 'utf8');
  const price = fs.readFileSync(path.join(ROOT, 'js/core-price.js'), 'utf8');
  return '/* from js/core.js (its readers) and js/core-price.js (whole) */\nfunction priceCore_(DATA, askProps_) {\n'
    + PRICE_READERS.map(n => grab(core, n, 'js/core.js')).join('\n') + '\n' + price.trim() + '\n'
    + 'return { priceFrom, bookMoney_, bookShares_, parseDMY };\n}';
}
/* EVERY FIELD'S PROPERTIES (kinds.json \`fields\`: bounds, longest text): the server's \`askProps_\`, the same object form.js reads. */
function seatFieldParts() {
  const k = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/kinds.json'), 'utf8')).kinds;
  const out = Object.assign({}, ...Object.keys(k).map(n => k[n].fields || {}));
  return '/* from data/settings/kinds.json fields */\nconst FIELD_PROPS = ' + JSON.stringify(out) + ';\nconst askProps_ = f => FIELD_PROPS[f] || {};';
}
function grab(src, name, file) {
  const lines = src.split('\n');
  const at = lines.findIndex(l => l.startsWith('function ' + name + '(') || l.startsWith('const ' + name + ' ') || l.startsWith('let ' + name + ' '));
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
  }).concat([tagParts(), factParts(), kindParts(), letterParts(), libParts(), seatFieldParts(), priceParts()]);
  return '/* @family. — cards-gen.gs GENERATED by `node tools/build.js` from the site\'s own code; edit the site, never this. */\n'
    + '/* The Sunday email and every booking email name, tag, word, format and draw their cards by these (renderCard), so none can drift from the site. */\n'
    + parts.join('\n') + '\n';
}
/* THE ONE SETTINGS FILE (data/settings/settings.json), as SHARED_SETTINGS at the top of the first file each side loads. */
const SHARED_RE = /\/\* SHARED:BEGIN[\s\S]*?\/\* SHARED:END \*\//;
function sharedInto(file) {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/settings.json'), 'utf8'));
  const block = '/* SHARED:BEGIN — data/settings/settings.json, written by `node tools/build.js`; edit the json, never this. */\n'
    + 'const SHARED_SETTINGS = ' + JSON.stringify(j, (k, v) => (k === '_about' ? undefined : v)) + ';\n/* SHARED:END */';
  let src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  src = SHARED_RE.test(src) ? src.replace(SHARED_RE, () => block) : src.replace(/^[^\n]*\n/, m => m + block + '\n');
  fs.writeFileSync(path.join(ROOT, file), src);
}
/* THE ONE LIST OF QUESTION TYPES (owner, 17 Nov): data/settings/qengine.json's types, phrases and row, as QENGINE in js/qtypes.js. */
const QENGINE_RE = /\/\* QENGINE:BEGIN[\s\S]*?\/\* QENGINE:END \*\//;
function qengineInto(file) {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/qengine.json'), 'utf8'));
  const block = '/* QENGINE:BEGIN — data/settings/qengine.json, written by `node tools/build.js`; edit the json, never this. */\n'
    + 'const QENGINE = ' + JSON.stringify({ types: j.types, phrases: j.phrases, row: j.row }) + ';\n/* QENGINE:END */';
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (!QENGINE_RE.test(src)) throw new Error(file + ' has no QENGINE block');
  fs.writeFileSync(path.join(ROOT, file), src.replace(QENGINE_RE, () => block));
}
function run() {
  qengineInto('js/qtypes.js');
  const body = build();
  sharedInto('js/core.js');
  sharedInto('backend/constants.gs');
  fs.writeFileSync(OUT, body);
  console.log('cards-gen: backend/cards-gen.gs written (' + TAKE.reduce((n, t) => n + t[1].length, 0) + ' names)');
}
module.exports = { run };
if (require.main === module) run();
