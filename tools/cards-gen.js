#!/usr/bin/env node
/* @family. — tools/cards-gen.js ONE CARD RULE, TWO PLACES (owner, 16 Nov): the Sunday email drifted from the site's cards. */
/* run() copies the site's card maker (renderCard and its blocks), name formatter, words and tag dedupe verbatim into backend/cards-gen.gs. */
'use strict';
const SD = require('./lib/site-data.js');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'backend/cards-gen.gs');
/* WHAT IS SHARED, FROM WHERE: each a top-level `function NAME` or `const NAME =` in a site file, copied as it stands. */
const TAKE = [
  ['js/data.js', ['nameBesideHandle_', 'capFirst_', 'nameKid_', 'fmtName_', 'qualLevel_', 'qualRank_']],
  /* A QUESTION WEARS ITS PAPER'S CARD (owner, 17 Nov): the email joins the file's rows as the site does, by LIB_FILES.questions.joined. */
  ['js/library.js', ['libPaperEach_', 'libJoinPaper_']],
  /* QUESTION ALIASES (answer-ids): the map and the merge the site reads by, as the backend files answers. */
  ['js/qaliases.js', ['QALIAS', 'qAliasKey_', 'qAliasMine_']],
  /* THE SCHOOL YEAR AND EASTER (491): booking.gs `schoolYear` and setup.gs `easterOf_` date by the site's rule. */
  ['js/arcade.js', ['tdEaster_', 'tdJul_', 'tdYear0_', 'tdYear_']],
  /* A STORED VERDICT AS THE ONE MARKING ENGINE'S SHAPE (owner, 17 Nov): the Sunday email's `digestMark_` reads it as the site's `subSay_` does. */
  /* AND A PICK QUESTION'S OPTIONS READ AS THE MARKER READS THEM (owner, 22 Nov: one Question card): the email marks the option they typed by `choicePicks_`. */
  ['js/find-marking.js', ['STATUS_IDS', 'markResult_', 'statusOf_', 'statusWord_', 'verdictOf_', 'markNorm_', 'MARK_SUPS', 'MARK_SYNONYMS', 'CHOICE_LETTERS', 'choicePicks_']],
  ['js/find-figures.js', ['TAG_NAME', 'tagMadeOf_', 'tagKindOf_', 'tagsKept_']],
  /* THE WORDS FILE AND THE FORMATTERS (owner rule 1.1): every line a card says in an email goes through these. */
  ['js/core.js', ['WORDS_FILE', 'esc', 'text_', 'fmtTime_', 'fmtHours_', 'plural_', 'fmtMoney_', 'DAYS_SHORT', 'fmtDay_', 'fmtDmy_', 'fmtDate_',
    /* ONE DATE READER, ONE TODAY (owner, 20 Nov): tools/date-cases.js holds this copy to the site's. */
    'dateOf_', 'tz_', 'todayIso_',
    /* ONE PERSON ROW, ONE TUTOR CARD (owner, 17 Nov): get-people.gs `tutorOut_` and me-card.js `cardPatchTutor_` read a row by it. */
    'ageRank_', 'ageOut_', 'tutorCardOf_']],
  /* THE ONE CARD MAKER (owner, 16 Nov: one card maker everywhere): renderCard and the blocks it draws; an email calls it with its inline setting. */
  ['js/cards-render.js', ['cardRuns_', 'CARD_ENT', 'cardHasMarkup_', 'cardMarkupRuns_', 'CARD_SUB', 'cardSub_', 'cardFrac_', 'cardLastGap_', 'cardAttrs_',
    'cardPic_', 'pixSvg_', 'cardTag_', 'renderTags', 'cardControl_', 'cardAnswer_', 'CARD_EMBEDS', 'cardEmbed_', 'cardTree_', 'cardGrid_', 'cardChoice_',
    'cardChoices_', 'CARD_BLOCKS', 'CARD_DRAW_ELS', 'cardDraw_', 'cardBlock_', 'cardBlocks_', 'renderCard', 'cardLetterOf_', 'cardSiteParts_', 'cardLetterParts_', 'cardLetterRow_','cardLetterLines_', 'cardLetter_',
    'answerTag_', 'answersRow_', 'answerBox_']],
  /* EACH FACET'S HUE (tools/facet-hues.js): a card's tag is `h` + TAG_OF[field], and so is the email's. */
  ['js/find-bundles.js', ['TAG_OF']],
  /* HOW MANY DIGITS A PIN HAS (owner, 16 Nov): the sign-in keypad's number is the one the backend makes PINs to. */
  ['js/find-account.js', ['SIGN_PIN_LEN']],
  /* A PART THAT NAMES A PICTURE HAS ONE (11 Nov): the email's `Verified` asks `figUndrawn_` as the card's `verifyTags_` does. */
  /* A VALUE TOO LONG FOR A TAG IS SAID AS THE MENU SAYS IT (`showForms_`, `SHOW_MAX`): "Section A: Modern prose or…". */
  ['js/find-facets.js', ['SHOW_MAX', 'showForms_']],
  /* ONE FORM ENGINE (job G): the gap tests a form is sent by; the backend asks them again over FORM_GAPS. */
  ['js/form.js', ['FORM_TESTS', 'formGaps_', 'CLASH_DAYS', 'clashDays_', 'clashMin_', 'clashOf_', 'phoneCodes_', 'phoneOut', 'phoneIn', 'HANDLE_SHAPE', 'handleTyped_', 'handleFold_']],
  /* ONE LEVEL, KEY STAGE, SITTING AND PART READER (unify batch 7): the Sunday email's `digestTag*_` (digest-tags.gs) ask these of a */
  /* site-shaped item, so the email tags a question as the site's card does. LEVEL_TABLE and spellKey_ with them; `docById_` is digest-tags.gs's. */
  ['js/data-text.js', ['MONTH_NAMES']],
  ['js/find-aloud.js', ['LEVEL_TABLE']],
  ['js/find-finder.js', ['SPELL_KEYS', 'spellKey_']],
  ['js/find-levels.js', ['levelsIn_', 'LEVELS_IN', 'levelsMemo_', 'levelsOf_', 'satsStagesOf_', 'ksLevel_', 'keyStagesOf_', 'ksFallback_',
    'yearOf', 'seriesOf_', 'SERIES_SUMMER', 'SERIES_AUTUMN', 'waveOf', 'waveFromDoc_']],
  /* THE ANSWER AS THE CARD SAYS IT (owner, 22 Nov: one Question card): the email's Answer line is the site's answer card's. */
  /* ONE ANSWER FORMAT (UNIFY AFTER 7): a pick's key as letters, read as the site reads it. */
  ['js/library.js', ['choiceKeys_']],
  ['js/find-parts.js', ['ROMAN_ONLY', 'NUM_ROMAN', 'partBare_', 'partSplit_', 'answerParts_', 'answerSay_']],
  /* A ROW'S `cells` (owner, batch 7): the site's reader, for digest.gs to switch its `digestCells_` to. */
  ['js/find-cells.js', ['CELL_ENT', 'cellsOf_']],
  /* THE RULES' ONE SHAPE (496): core.gs `rulesClean_` is its length cap and this; `RULE_OF_` is core.gs's, off RULE_IDS/RULES_LOCKED. */
  ['js/rules.js', ['rulesSane_']],
  /* THE DOCKET'S ORDER (owner, 21 Nov; one list 25 Nov night): the private plain-text address (post-account.gs docketAddress_) sorts and says it as the site does. */
  ['js/map.js', ['dkMin_', 'dkIso_', 'dkEv_', 'dkRep_', 'dkOn_', 'dkIsDone_', 'dkOccur_', 'dkSlot_', 'dkSort_', 'dkLeaves_', 'dkOption_', 'dkTitle_', 'dkWhen_', 'dkNowNextOf_', 'dkSay_', 'dkMatch_', 'dkTick_']],
  ['js/predicates-fig.js', ['FIG_WORDS', 'FIG_NOT_WORDS', 'figWords_', 'figPictured_', 'figUndrawn_']],
];
/* THE EMAIL'S COLOURS, FROM style.css `:root` (20 Nov): DIGEST_INK, each email name as the token it draws; `--email-*` where the email needs its own. */
const DIGEST_INK_TOKENS = { page: 'bg', pane: 'email-pane', paneLine: 'email-pane-line', card: 'raised', line: 'line', ink: 'ink', dim: 'dim',
  faint: 'faint', chip: 'email-chip', gold: 'email-gold', right: 'good', wrong: 'bad', box: 'email-box' };
function cssTokens() {
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  const root = (/:root\s*\{([\s\S]*?)\n\}/.exec(css) || [])[1] || '';
  const t = {}, re = /--([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g; let m;
  while ((m = re.exec(root))) if (!(m[1] in t)) t[m[1]] = m[2].toLowerCase();
  return t;
}
function inkOf() {
  const t = cssTokens(), ink = {};
  for (const [k, tok] of Object.entries(DIGEST_INK_TOKENS)) {
    if (!t[tok]) throw new Error('tools/cards-gen.js: style.css :root has no `--' + tok + ': #…` for the email\'s ' + k);
    ink[k] = t[tok];
  }
  return ink;
}
function inkParts() {
  return '/* from style.css :root (tools/cards-gen.js DIGEST_INK_TOKENS) */\nconst DIGEST_INK = ' + JSON.stringify(inkOf()).replace(/":"/g, '": "').replace(/","/g, '", "') + ';';
}
/* THE EMAIL'S TAGS, FROM THE SITE'S ONE RULE (owner rule 1.1, 16 Nov): no hand table of facets or colours in the backend. */
/* DIGEST_TAG_FIELDS: data/settings/facets.json's live facets in its order (the site's one facet list, rule 1.80). */
/* DIGEST_TAG_INK: each hue `hN` as style.css's `--hue-N`, the colour `[data-tag="hN"]` draws. */
const cardTags = () => { const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/tags.json'), 'utf8')); return { max: j.max, kinds: j.kinds }; };
function tagParts() {
  const rows = SD.facets();
  const fields = rows.filter(r => r && r.field && r.active !== false && isFinite(Number(r.sort_order)) && String(r.sort_order) !== '')
    .map((r, i) => ({ f: r.field, at: Number(r.sort_order), i })).sort((x, y) => x.at - y.at || x.i - y.i).map(o => o.f);
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8'), ink = {};
  let m;
  const re = /--hue-(\d+):\s*(#[0-9a-fA-F]{3,8})/g;
  while ((m = re.exec(css))) if (!(('h' + m[1]) in ink)) ink['h' + m[1]] = m[2];
  if (!Object.keys(ink).length) throw new Error('tools/cards-gen.js: style.css has no `--hue-N: #…` tokens');
  return '/* from data/settings/facets.json and style.css --hue-N */\n'
    + 'const DIGEST_TAG_FIELDS = ' + JSON.stringify(fields).replace(/","/g, '", "') + ';\n'
    + 'const DIGEST_TAG_INK = ' + JSON.stringify(ink).replace(/":"/g, '": "').replace(/","/g, '", "') + ';\n'
    /* THE ONE TAG SET (owner, 23 Nov): data/settings/tags.json, the site's js/kinds.js CARD_TAGS, read by the one picker tagsKept_. */
    + 'const CARD_TAGS = ' + JSON.stringify(cardTags()) + ';';
}
/* THE PERSON FACT KEYS (kinds.json person.facts.keys, rule 1.80): the backend drops any fact whose `what` is not one. */
function factParts() {
  const keys = SD.kinds().person.facts.keys;
  return '/* from data/settings/kinds.json person.facts.keys */\nconst PERSON_FACT_KEYS = ' + JSON.stringify(keys).replace(/","/g, '", "') + ';';
}
/* EVERY KIND'S STORE AND WHO SEES IT (kinds.json `kinds`, `stored`, `ledger`; owner, 16 Nov): the one general action `item` reads this. */
function kindParts() {
  const j = SD.json('data/settings/kinds.json'), kinds = {};
  const take = (k, v) => { if (v.sheet && v.sheet.tab) kinds[k] = Object.assign({ sheet: v.sheet, see: v.see || {}, edit: v.edit || null }, v.clash ? { clash: v.clash } : {}); };
  Object.entries(j.kinds).forEach(([k, v]) => take(k, v));
  Object.entries(j.stored || {}).forEach(([k, v]) => take(k, v));
  const L = j.ledger;
  return '/* from data/settings/kinds.json kinds/stored/ledger: each kind\'s sheet, see and edit */\nconst ITEM_STORE_KINDS = '
    + JSON.stringify({ moved: L.moved || [], never: L.never, items: L.items, events: L.events, kinds }) + ';';
}
/* THE OWNER'S LISTS AS ONE LIST KIND (UNIFY NEXT 6): each kind's `list` (its name, storage, fields and rules), read by post-account.gs listTidy_, the one tidy. */
function listParts() {
  const out = {};
  Object.entries(SD.kinds()).forEach(([k, v]) => { if (v.list) { const { say, ...L } = v.list; out[k] = L; } });
  return '/* from data/settings/kinds.json kinds.<kind>.list */\nconst LIST_KINDS = ' + JSON.stringify(out) + ';';
}
/* EACH FORM'S GAPS (kinds.json `forms.<id>.gaps`, job G): what the backend refuses a form without, as the phone does. */
function formGapParts() {
  const kinds = SD.kinds(), out = {};
  Object.values(kinds).forEach(k => Object.entries(k.forms || {}).forEach(([id, f]) => { if (f.gaps) out[id] = f.gaps; }));
  return '/* from data/settings/kinds.json forms.<id>.gaps */\nconst FORM_GAPS = ' + JSON.stringify(out) + ';';
}
/* THE FORM SPECS (data/settings/forms.json kinds, rules, cards) as FORM_SPECS in js/form.js: no hand copy to drift. */
const FORMS_RE = /\/\* FORMS:BEGIN[\s\S]*?\/\* FORMS:END \*\//;
function formsBlock() {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/forms.json'), 'utf8'));
  return '/* FORMS:BEGIN — data/settings/forms.json, written by `node tools/build.js` (tools/cards-gen.js); edit the json, never this. */\n'
    + 'const FORM_SPECS = ' + JSON.stringify({ kinds: j.kinds, rules: j.rules, cards: j.cards }) + ';\n/* FORMS:END */';
}
function formsInto(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (!FORMS_RE.test(src)) throw new Error(file + ' has no FORMS block');
  fs.writeFileSync(path.join(ROOT, file), src.replace(FORMS_RE, () => formsBlock()));
}
/* THE ONE LIBRARY IMPORTER'S FILES (kinds.json `sheet.lib`, rule 1.80): `libImport_` takes a file or a kind by these. */
function libParts() {
  return '/* from data/settings/kinds.json sheet.lib (tools/lib/lib-files.js) */\nconst LIB_FILES = ' + JSON.stringify(require('./lib/lib-files.js').libFiles()) + ';';
}
/* EACH KIND'S LETTER (kinds.json `card.letter`, rule 1.80): how each part is said, the labels and inline styles renderCard writes an email's card by. */
function letterParts() {
  const kinds = SD.kinds(), out = {};
  /* AND THE ONE QUESTION CARD'S PARTS IN ORDER (`card.question.parts`, owner 22 Nov): the email draws the site's parts, in the site's order. */
  /* AND A RECORD'S (a booking's) `tags` and `record` (owner 23 Nov: EVERY EMAIL CARD IS THE SITE CARD): `cardSiteParts_` reads the parts and their order off them. */
  Object.keys(kinds).forEach(k => { const c = kinds[k].card; if (c && c.letter) out[k] = { card: Object.assign({ letter: c.letter }, c.question && c.question.parts ? { question: { parts: c.question.parts } } : {},
    c.record ? { record: c.record, tags: c.tags || [] } : {}) }; });
  return '/* from data/settings/kinds.json card.letter, card.question.parts, card.record and card.tags */\nconst ITEM_KINDS = ' + JSON.stringify({ kinds: out }) + ';';
}
/* THE ONE PRICE (owner, 17 Nov): js/core-price.js whole, inside \`priceCore_(DATA, askProps_)\` with the core.js readers it leans on, */
/* so createJob prices a booking over the sheet's own rows by the site's own lines (booking.gs \`serverPrice_\`); nothing leaks into the backend's globals. */
const PRICE_READERS = ['norm', 'num', 'parseDMY', 'CLOSED_', 'closedOn_', 'computeSessionDates', 'bookableSpaces', 'spaceFor'];
const PRICE_PHONE_ONLY = ['priced_', 'cardSeatParts_', 'cardGroupTotal_'];
function priceParts() {
  const core = fs.readFileSync(path.join(ROOT, 'js/core.js'), 'utf8');
  /* PHONE-ONLY (job E, 21 Nov): the card's own sums, which nothing in backend/ calls, stay out of the copy. */
  const price = PRICE_PHONE_ONLY.reduce((s, n) => s.replace(grab(s, n, 'js/core-price.js') + '\n', ''),
    fs.readFileSync(path.join(ROOT, 'js/core-price.js'), 'utf8'));
  return '/* from js/core.js (its readers) and js/core-price.js (whole) */\nfunction priceCore_(DATA, askProps_) {\n'
    + PRICE_READERS.map(n => grab(core, n, 'js/core.js')).join('\n') + '\n' + price.trim() + '\n'
    + 'return { priceFrom, bookMoney_, bookShares_, parseDMY };\n}';
}
/* EVERY FIELD'S PROPERTIES (kinds.json \`fields\`: bounds, longest text): the server's \`askProps_\`, the same object form.js reads. */
function seatFieldParts() {
  const k = SD.kinds();
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
    /* A COPIED CONST THAT READS SHARED_SETTINGS IS READ WHEN ASKED (22 Nov: the backend was down): Apps Script loads files A–Z, so
       cards-gen.gs runs before constants.gs defines SHARED_SETTINGS; a getter waits until a function asks. */
    return '/* from ' + file + ' */\n' + names.map(n => grab(src, n, file)
      .replace(/^const (\w+) = (SHARED_SETTINGS\b[^;\n]*);$/m, (m, k, e) => 'Object.defineProperty(globalThis, \'' + k + '\', { get: () => ' + e + ' });')).join('\n');
  }).concat([inkParts(), tagParts(), factParts(), kindParts(), letterParts(), formGapParts(), listParts(), libParts(), seatFieldParts(), priceParts()]);
  return '/* @family. — cards-gen.gs GENERATED by `node tools/build.js` from the site\'s own code; edit the site, never this. */\n'
    + '/* The Sunday email and every booking email name, tag, word, format and draw their cards by these (renderCard), so none can drift from the site. */\n'
    + parts.join('\n') + '\n';
}
/* THE ONE SETTINGS FILE (data/settings/settings.json), as SHARED_SETTINGS at the top of the first file each side loads. */
const { SHARED_RE } = require('./lib/gen.js');
function sharedInto(file) {
  const j = SD.settings();
  /* AND OUR PICTURES' NAMES (owner, 20 Nov): data/settings/default-pictures.json, the one list, as `pictures` (PFP_PICTURES, PFP_ART's keys). */
  j.pictures = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/default-pictures.json'), 'utf8')).map(r => String(r.picture || '').trim()).filter(Boolean);
  const block = '/* SHARED:BEGIN — data/settings/settings.json (and default-pictures.json as `pictures`), written by `node tools/build.js`; edit the json, never this. */\n'
    + 'const SHARED_SETTINGS = ' + JSON.stringify(j, (k, v) => (k === '_about' ? undefined : v)) + ';\n'
    /* AND THE ROLE HELPERS BOTH SIDES SHARE (one role check, owner 21 Nov): data/settings/roles.js as it stands. */
    + fs.readFileSync(path.join(ROOT, 'data/settings/roles.js'), 'utf8').replace(/\n*$/, '\n') + '/* SHARED:END */';
  let src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  src = SHARED_RE.test(src) ? src.replace(SHARED_RE, () => block) : src.replace(/^[^\n]*\n/, m => m + block + '\n');
  fs.writeFileSync(path.join(ROOT, file), src);
}
/* THE ONE LIST OF QUESTION TYPES (owner, 17 Nov): data/settings/qengine.json's types, phrases, row and its every-button list (buttons, cut), as QENGINE in js/qtypes.js. */
const QENGINE_RE = /\/\* QENGINE:BEGIN[\s\S]*?\/\* QENGINE:END \*\//;
function qengineInto(file) {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/qengine.json'), 'utf8'));
  const block = '/* QENGINE:BEGIN — data/settings/qengine.json, written by `node tools/build.js`; edit the json, never this. */\n'
    + 'const QENGINE = ' + JSON.stringify({ types: j.types, phrases: j.phrases, row: j.row, buttons: j.buttons, cut: j.cut }) + ';\n/* QENGINE:END */';
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (!QENGINE_RE.test(src)) throw new Error(file + ' has no QENGINE block');
  fs.writeFileSync(path.join(ROOT, file), src.replace(QENGINE_RE, () => block));
}
function run() {
  qengineInto('js/qtypes.js');
  formsInto('js/form.js');
  const body = build();
  sharedInto('js/core.js');
  sharedInto('backend/constants.gs');
  fs.writeFileSync(OUT, body);
  console.log('cards-gen: backend/cards-gen.gs written (' + TAKE.reduce((n, t) => n + t[1].length, 0) + ' names)');
}
module.exports = { cardTags, run, build, formsBlock, FORMS_RE, inkOf, cssTokens, DIGEST_INK_TOKENS };
if (require.main === module) run();
