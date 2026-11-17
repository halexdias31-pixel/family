#!/usr/bin/env node
/* @family. — tools/cards-gen.js ONE CARD RULE, TWO PLACES (owner, 16 Nov): the Sunday email drifted from the site's cards. */
/* `--write` copies the site's card maker (renderCard and its blocks), name formatter, words and tag dedupe verbatim into backend/cards-gen.gs. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'backend/cards-gen.gs');
/* WHAT IS SHARED, FROM WHERE: each a top-level `function NAME` or `const NAME =` in a site file, copied as it stands. */
const TAKE = [
  ['js/data.js', ['nameBesideHandle_', 'capFirst_', 'nameKid_', 'fmtName_']],
  ['js/find-figures.js', ['TAG_NAME', 'tagMadeOf_']],
  /* THE WORDS FILE AND THE FORMATTERS (owner rule 1.1): every line a card says in an email goes through these. */
  ['js/core.js', ['WORDS_FILE', 'esc', 'text_', 'fmtTime_', 'fmtHours_', 'fmtMoney_', 'DAYS_SHORT', 'fmtDay_', 'fmtDmy_', 'fmtDate_']],
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
/* EACH KIND'S LETTER (kinds.json `card.letter`, rule 1.80): the lines, labels and inline styles renderCard writes an email's card by. */
function letterParts() {
  const kinds = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/kinds.json'), 'utf8')).kinds, out = {};
  Object.keys(kinds).forEach(k => { const c = kinds[k].card; if (c && c.letter) out[k] = { card: { letter: c.letter } }; });
  return '/* from data/settings/kinds.json card.letter */\nconst ITEM_KINDS = ' + JSON.stringify({ kinds: out }) + ';';
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
  }).concat([tagParts(), factParts(), kindParts(), letterParts()]);
  return '/* @family. — cards-gen.gs GENERATED by `node tools/cards-gen.js --write` from the site\'s own code; edit the site, never this. */\n'
    + '/* The Sunday email and every booking email name, tag, word, format and draw their cards by these (renderCard), so none can drift from the site. */\n'
    + parts.join('\n') + '\n';
}
const body = build();
/* THE ONE SETTINGS FILE (data/settings/settings.json), as SHARED_SETTINGS at the top of the first file each side loads. */
const SHARED_RE = /\/\* SHARED:BEGIN[\s\S]*?\/\* SHARED:END \*\//;
function sharedInto(file) {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/settings.json'), 'utf8'));
  delete j._about;
  const block = '/* SHARED:BEGIN — data/settings/settings.json, written by `node tools/cards-gen.js --write`; edit the json, never this. */\n'
    + 'const SHARED_SETTINGS = ' + JSON.stringify(j) + ';\n/* SHARED:END */';
  let src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  src = SHARED_RE.test(src) ? src.replace(SHARED_RE, () => block) : src.replace(/^[^\n]*\n/, m => m + block + '\n');
  fs.writeFileSync(path.join(ROOT, file), src);
}
if (process.argv.includes('--write')) {
  sharedInto('js/core.js');
  sharedInto('backend/constants.gs');
  fs.writeFileSync(OUT, body);
  console.log('cards-gen: backend/cards-gen.gs written (' + TAKE.reduce((n, t) => n + t[1].length, 0) + ' names)');
} else console.log('usage: node tools/cards-gen.js --write');
