#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-look.js THE OWNER'S LOOK DECISIONS (8 Nov), each one a rule a change cannot quietly undo. */
const fs = require('fs'), path = require('path');
const dir = __dirname, root = path.join(dir, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const listed = (html.match(/FILES\s*=\s*\[([\s\S]*?)\]/) || [, ''])[1];
const files = [...listed.matchAll(/'([\w-]+)'/g)].map(m => m[1])
  .filter(n => fs.existsSync(path.join(dir, n + '.js')))
  .map(n => ({ n, src: fs.readFileSync(path.join(dir, n + '.js'), 'utf8') }));
const bad = [];

/* ---------- 1. EVERY ACTION IS A ROUND TILE ---------- */
/* EVERY <button> HAS ONE MAKER, tile_ (tiles.js): a thing's tile, or with `form: true` a form's control. A comment or a regex naming one is not one. */
const MAKERS = ['tiles', 'form'];
files.forEach(({ n, src }) => {
  if (MAKERS.indexOf(n) !== -1) return;
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const raw = [...code.matchAll(/(^|\S)\s*<button\b/gm)].filter(m => !/[/*(|]/.test(m[1]));
  if (raw.length) bad.push(`1 raw <button>: ${n}.js has ${raw.length} — draw it with tile_({…}) (a thing) or tile_({ form: true, … }) (a form)`);
});

/* ---------- 2. NO GREY SENTENCES ---------- */
/* Text is ink or a tag; the two greys colour only a control that cannot be pressed (P8) or a placeholder. */
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const GREY = /(?<![-\w])color:\s*var\(--(dim|faint)\)/;
const STILL = /disabled|placeholder|is-off|\.shut|locked|\.off\b|:empty|read-only/;
for (const m of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (GREY.test(m[2]) && !STILL.test(sel)) bad.push(`2 grey text: "${sel.slice(0, 80)}" — ink, a tag (.qtag), or nothing`);
}
files.forEach(({ n, src }) => {
  if (/(?<![-\w])color:\s*var\(--(dim|faint)\)/.test(src)) bad.push(`2 grey text: inline in ${n}.js`);
});

/* ---------- 2b. NO GREY LINE FROM JS: information is a tag (.qtag) or it is gone ---------- */
/* The grey-line classes, per file: a ratchet at nothing left; a file may only be listed here with a count that goes down. */
const GREY_CLS = /class="(?:[^"]* )?(?:faint|sub|muted|dim|hint)(?: [^"]*)?"/g;
const GREY_LEFT = {};
files.forEach(({ n, src }) => {
  const k = (src.match(GREY_CLS) || []).length, may = GREY_LEFT[n] || 0;
  if (k > may) bad.push(`2b grey line: ${n}.js has ${k} class="faint|sub|muted|dim|hint", allowed ${may} — a tag (<span class="qtag">) or nothing`);
  if (k < may) bad.push(`2b ${n}.js is down to ${k} grey line(s): lower GREY_LEFT['${n}'] to ${k} so it cannot come back`);
});
/* A faded ink is grey by another name: only a mark that is not words (a tick, the tap chevron) may fade. */
const FADE = /(?<![-\w])color:\s*color-mix\(in srgb, var\(--(ink|white)\) \d+%/;
const FADE_OK = /::after|\.bk-tick|\.tap::after/;
for (const m of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (FADE.test(m[2]) && !STILL.test(sel) && !FADE_OK.test(sel)) bad.push(`2b faded text: "${sel.slice(0, 80)}" — var(--ink), or a tag`);
}

/* ---------- 3. SAME LOOK EVERYWHERE: COLOUR IS A TOKEN ---------- */
/* A literal lives only in a :root block; everything else names a token, so one palette changes the whole site. */
const LIT = /(?<![\w&-])#[0-9a-fA-F]{3,8}\b(?![\w-])|\brgba?\(/;
const noComments = css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '));
for (const m of noComments.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  if (/^\s*:root\s*$/.test(m[1]) || !LIT.test(m[2])) continue;
  bad.push(`3 colour literal in "${m[1].trim().slice(0, 80)}" — use a token from :root`);
}
/* The one exception: the pH scale (mat.js) IS a set of colours, the content itself, not the site's look. */
const LIT_OK = new Set(['mat']);
files.forEach(({ n, src }) => {
  if (LIT_OK.has(n)) return;
  for (const m of src.matchAll(/style="([^"]*)"/g)) {
    if (/(?<![\w&-])#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(m[1])) bad.push(`3 inline colour literal in ${n}.js: ${m[1].slice(0, 60)}`);
  }
});

/* ---------- 4. ONE EMPTY STATE ---------- */
/* `empty_(text)` (tiles.js) is the only maker; a hand-made empty paragraph is the variant this replaced. */
files.forEach(({ n, src }) => {
  if (n === 'tiles') return;
  if (/class="empty\b/.test(src)) bad.push(`4 empty state by hand in ${n}.js — empty_('No … yet.')`);
  if (/class="(?:faint|sub)[^"]*">\s*(?:No |Nothing|None|Nobody)/.test(src)) bad.push(`4 a grey "nothing" line in ${n}.js — empty_('No … yet.')`);
});

/* ---------- 5. SPACING IS A CLASS ---------- */
/* index.html's boot-trouble sheet keeps its inline styles: it is drawn when style.css may not have loaded. */
files.forEach(({ n, src }) => {
  for (const m of src.matchAll(/style="([^"]*)"/g)) {
    if (/(^|;)\s*(margin|padding|gap)[\w-]*\s*:/.test(m[1])) bad.push(`5 inline spacing in ${n}.js: style="${m[1].slice(0, 50)}" — a class in style.css`);
  }
});

/* ---------- 4c. TILES ARE ICON-ONLY; A LONG PRESS SAYS THE WORD ---------- */
if (/attr\(data-w\)/.test(css)) bad.push('4c a tile prints its word on the page (attr(data-w)) — tiles are icon-only; the word is a long press');
const tilesSrc = (files.find(f => f.n === 'tiles') || {}).src || '';
if (!/function tileWordShow_/.test(tilesSrc) || !/'pointerdown'/.test(tilesSrc)) bad.push('4c the one long-press handler (tileWordShow_ in tiles.js) is missing');

/* ---------- 5a. A RISKY ACTION IS TAPPED TWICE (sure_), NEVER A confirm() ---------- */
const stripC = t => t.replace(/(^|[\s;{}(),])\/\*[\s\S]*?\*\//g, '$1').replace(/(^|\s)\/\/[^\n]*/g, '$1');
/* Not risky: a cancel closes an unsaved editor, and a filter chip or a photo not yet sent is only a choice on screen. */
const SAFE = new Set(['card-cancel', 'person-cancel', 'post-cancel', 'rep-cancel', 'filter-drop', 'cam-drop', 'msg-unqueue']);
const RISKY = /(delete|decline|cancel|remove|drop|leave|revoke|unlink|refuse|reject|wipe|reset|del)\b/;
const body = {};
files.forEach(({ n, src }) => {
  const code = stripC(src);
  if (/(^|[^\w.$])(window\.)?confirm\(/.test(code)) bad.push(`5a a confirm() pop-up in ${n}.js — sure_(el, 'Remove?') instead`);
  const hits = [...code.matchAll(/\bon\(\s*'([a-z0-9-]+)'/g)];
  hits.forEach((m, k) => { body[m[1]] = (body[m[1]] || '') + code.slice(m.index, k + 1 < hits.length ? hits[k + 1].index : m.index + 3000); });
});
const armed = act => /\b(sure_|layArm_)\(/.test(body[act] || '');
Object.keys(body).forEach(act => {
  if (RISKY.test(act.replace(/-/g, ' ')) && !SAFE.has(act) && !armed(act)) bad.push(`5a on('${act}') is risky and not tapped twice — sure_(el, …) first`);
});
files.forEach(({ n, src }) => {
  for (const m of src.matchAll(/tile_\(\{[^}]*?label:\s*'(Delete|Decline|Remove)[^']*'[^}]*?act:\s*'([a-z0-9-]+)'/g)) {
    if (!SAFE.has(m[2]) && body[m[2]] && !armed(m[2])) bad.push(`5a the ${m[1]} tile (${m[2]}, ${n}.js) is not tapped twice — sure_`);
  }
});

/* ---------- 11a. ADMIN THINGS ARE BLACK AND WHITE, AND ONLY AN ADMIN SEES THEM ---------- */
for (const m of noComments.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  if (/admin/.test(m[1]) && /var\(--(admin|gold|warn)\)/.test(m[2]) && !/^\s*:root/.test(m[1])) bad.push(`11a an admin marker in colour: "${m[1].trim().slice(0, 60)}"`);
}
if (!/tone === 'admin' && !\(typeof isAdmin === 'function' && isAdmin\(\)\)\) return ''/.test(tilesSrc)) bad.push('11a tile_ draws an admin tile for someone who is not an admin');

/* ---------- 30a. ONE LOADING LOOK: THE THREE DOTS (comments aside) ---------- */
if (/rotate\((360deg|1turn)\)/.test(noComments)) bad.push('30a a spinner in style.css — a wait is the three dots (loading_, .is-busy)');

/* ---------- 57a. ONE CORNER: --r-ui, or round (--r-round, 50%); a slash or four-corner value is a drawn shape ---------- */
for (const m of noComments.matchAll(/border-radius:\s*([^;}]+?)\s*(?=[;}])/g)) {
  const v = m[1];
  if (/\//.test(v) || (/\S\s+\S/.test(v) && !/^var/.test(v))) continue;
  if (!/^(0|50%|var\(--r-ui\)|var\(--r-round\))$/.test(v)) bad.push(`57a a corner of its own: border-radius: ${v} — var(--r-ui) (or var(--r-round))`);
}

/* ---------- 58a. ONE PICTURE HEIGHT: a card's picture is var(--pic-h) tall and cropped to fill ---------- */
if (!/\.card\.kc > \.kc-pic \{[^}]*height: var\(--pic-h\)/.test(noComments) || !/\.kc-pic :is\([^)]*img[^)]*\) \{[^}]*object-fit: cover/.test(noComments)) bad.push('58a a card picture is not var(--pic-h) tall with object-fit: cover');
for (const m of noComments.matchAll(/([^{}]*kc-pic[^{}]*)\{([^{}]*)\}/g)) {
  if (/(^|;)\s*(max-|min-)?height:\s*(?!\s|var\(--pic-h\)|100%)/.test(m[2])) bad.push(`58a a picture height of its own in "${m[1].trim().slice(0, 60)}"`);
}

/* ---------- 59a. ONE COLUMN ON EVERY SCREEN SIZE: no wider-window rule adds a column; the wide grid stays off ---------- */
for (const m of noComments.matchAll(/@media[^{]*min-width[^{]*\{([^{}]*\{[^{}]*\}\s*)+\}/g)) {
  if (/grid-template-columns|column-count|(?<![-\w])columns:/.test(m[0])) bad.push(`59a a second column on a wide window: ${m[0].slice(0, 80)}`);
}
const bootSrc = (files.find(f => f.n === 'shell-boot') || {}).src || '';
if (!/const FLOW_LAYOUT = true;/.test(bootSrc)) bad.push('59a FLOW_LAYOUT is not true (shell-boot.js) — the wide multi-column grid would come back');

/* ---------- 60b. NORMAL CASE EVERYWHERE: no uppercase transform, no ALL-CAPS words on screen ---------- */
/* The one exception is a drawn calculator's printed brand and key labels (.calc-*): a picture of a thing, not the site's words. */
for (const m of noComments.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  if (/text-transform:\s*uppercase/.test(m[2]) && !/^\s*(\.calc-|#kp\.is-shift)/.test(m[1])) bad.push(`60b uppercase in "${m[1].trim().slice(0, 60)}" — normal case`);
}
files.forEach(({ n, src }) => {
  if (/text-transform:\s*uppercase/.test(src)) bad.push(`60b inline uppercase in ${n}.js`);
  for (const m of stripC(src).matchAll(/>\s*([A-Z]{2,}(?: [A-Z]{2,})+)\s*</g)) bad.push(`60b ALL-CAPS words on screen in ${n}.js: "${m[1]}"`);
});

/* ---------- 61a. THREE TEXT SIZES: --fs-body, --fs-title, --fs-small ---------- */
/* Not a text size: the root lever (html), a printed sheet at paper size (mm), a drawing scaled to its box (cq*), the Talmud page's viewer-set size. */
/* A tag's size is the owner's one tag dial (--tp-fs, set by --tag-scale), not a fourth size of its own. */
const FS_OK = /^(var\(--fs-(body|title|small)\)|inherit)$|mm\b|cq[whi]\b|^var\(--(tal|tp)-fs\)$/;
for (const m of noComments.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  if (/(^|[\s,}])html\s*$/.test(m[1]) || /^\s*:root\s*$/.test(m[1])) continue;
  for (const d of m[2].matchAll(/(?:^|;)\s*font-size:\s*([^;]+?)\s*(?=;|$)/g)) {
    if (!FS_OK.test(d[1])) bad.push(`61a a fourth text size in "${m[1].trim().slice(0, 50)}": ${d[1]} — var(--fs-body|title|small)`);
  }
  for (const d of m[2].matchAll(/(?:^|;)\s*font:\s*([^;]+?)\s*(?=;|$)/g)) {
    if (d[1] === 'inherit') continue;
    const size = d[1].split(/\s+(?![^(]*\))/).find(t => !/^(italic|normal|bold|oblique|small-caps|\d00)$/.test(t)) || '';
    if (!FS_OK.test(size.split(/\/(?![^(]*\))/)[0])) bad.push(`61a a fourth text size in "${m[1].trim().slice(0, 50)}": font: ${d[1]}`);
  }
}
if (/--fs-(xs|sm|md|lg|xl|2xl)\b/.test(css)) bad.push('61a an old size token (--fs-xs/sm/md/lg/xl/2xl) is back');

/* ---------- 62a. ONE GAP BETWEEN CARDS: a card's own margin above or below is 0 or var(--card-gap) ---------- */
const CARD_SEL = /(^|[\s>+~])(\.card|\.qcard)(\.[\w-]+|:[\w-]+(\([^)]*\))?)*$/;
for (const m of noComments.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  if (!m[1].split(',').some(s => CARD_SEL.test(s.trim()))) continue;
  for (const d of m[2].matchAll(/(?:^|;)\s*(margin(?:-top|-bottom|-block)?)\s*:\s*([^;]+?)\s*(?=;|$)/g)) {
    const parts = d[2].split(/\s+(?![^(]*\))/);
    const vert = d[1] === 'margin' ? [parts[0], parts[2] !== undefined ? parts[2] : parts[0]] : d[1] === 'margin-block' ? parts : [parts[0]];
    if (vert.some(v => !/^(0|var\(--card-gap\))$/.test(v))) bad.push(`62a a gap of its own between cards in "${m[1].trim().slice(0, 60)}": ${d[1]}: ${d[2]} — var(--card-gap)`);
  }
}
if (!/\.card\s*\{[^}]*padding: var\(--card-gap\) 0/.test(noComments)) bad.push('62a a bare card is not padded var(--card-gap) either side of its rule');

/* ---------- 63a. ONE TICK: every ticked box is drawn by the ONE TICK rules; a week-grid hour is a cell, not a tick ---------- */
const TICK_ONE = /^:is\(\.check input:checked \+ \.box/;
for (const m of noComments.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  const sel = m[1].trim();
  if (!/input:checked|\.bk-tick\.on|\.box\b/.test(sel) || /option\[|\.hr\b/.test(sel) || TICK_ONE.test(sel)) continue;
  if (/(^|;)\s*(background|border|box-shadow)(-color)?\s*:/.test(m[2]) && /:checked|\.on\b/.test(sel)) bad.push(`63a a tick drawn its own way: "${sel.slice(0, 60)}" — the ONE TICK rules`);
}
if ((noComments.match(/border: 1\.5px solid color-mix\(in srgb, var\(--white\) 14%/g) || []).length !== 1) bad.push('63a the tick\'s edge is written more than once — one :is(...) rule draws every tick');

/* ---------- 64a. NUMBERS ARE DIGITS: "3 words", never "three words", in anything the site says ---------- */
/* Content, not copy: facts (facts.js), revision notes (mat), help for the question types (qtypes), what is read aloud (shell-click, arcade), titles of works (finder-tags' short shows). */
const WORDS_OK = new Set(['facts', 'mat', 'qtypes', 'shell-click', 'arcade', 'writings', 'hadith', 'finder-tags']);
const NUM_WORD = /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|hundred)\b(?! or two)/i;
const IDIOM = /\bor two\b|\bthe two\b(?! new)|\bone or two\b/i;
files.forEach(({ n, src }) => {
  if (WORDS_OK.has(n)) return;
  for (const m of stripC(src).matchAll(/'((?:\\.|[^'\\\n])*)'|`((?:\\.|[^`\\])*)`/g)) {
    const s = (m[1] || m[2] || '').replace(/\$\{[^}]*\}/g, ' ').replace(/<[^>]*>/g, ' ');
    if (/[a-z] [a-z]/i.test(s) && NUM_WORD.test(s) && !IDIOM.test(s)) bad.push(`64a a number in words in ${n}.js: "${s.trim().slice(0, 70)}" — digits`);
  }
});

/* ---------- 65a. A MISSING VALUE IS dash_() (core.js), never a hand-typed '—' ---------- */
/* mat.js's trig table holds "—" as content (tan 90° is undefined), not as a missing value. */
const coreSrc = (files.find(f => f.n === 'core') || {}).src || '';
if (!/const dash_ = /.test(coreSrc)) bad.push('65a dash_ is missing from core.js');
files.forEach(({ n, src }) => {
  if (n === 'core' || n === 'mat') return;
  const k = (stripC(src).replace(/placeholder="—"/g, '').match(/'—'|"—"|'\\u2014'|'&mdash;'/g) || []).length;
  if (k) bad.push(`65a ${k} hand-typed "—" in ${n}.js — dash_(value)`);
});

/* ---------- 66a. ONE ICON STYLE: thin outline marks in ink, never filled, never a colour of their own ---------- */
if (!/fill="none" stroke="currentColor" stroke-width="1\.4"/.test(tilesSrc)) bad.push('66a tileIcon_ no longer draws a thin outline (fill="none", stroke 1.4)');
const iconsSrc = (tilesSrc.match(/const TILE_ICONS = \{[\s\S]*?\n\};/) || [''])[0];
if (/fill="(?!none)/.test(iconsSrc)) bad.push('66a a filled mark in TILE_ICONS — outline only');
for (const m of noComments.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  if (/tile-i/.test(m[1]) && /(^|;)\s*fill:\s*(?!none)/.test(m[2])) bad.push(`66a a filled icon: "${m[1].trim().slice(0, 60)}"`);
  if (/^\s*\.tile(\.[\w-]+)*\s*$/.test(m[1]) && !/is-sure/.test(m[1]) && /var\(--(bad|alert|warn|coral|green|purple|pink|admin|hue-\d+)\)/.test(m[2])) bad.push(`66a a coloured tile: "${m[1].trim()}" — ink, black and white`);
}

/* ---------- 68a. WHAT OPENS, OPENS IN PLACE (fileView_), inside its card ---------- */
/* Leaving is kept only where it must be: Google's sign-in and consent pages, the backend's own page, a sheet (none of them may be framed), a boxer's source site, and links a person typed in a message. */
const LEAVES = { 'find-boxers': 1, 'me-account': 1, 'me-messages': 1, 'shell-api': 1, tiles: 1 };
files.forEach(({ n, src }) => {
  const k = [...stripC(src).matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].filter(m => !/data-do="file-view"/.test(m[0])).length;
  if (k > (LEAVES[n] || 0)) bad.push(`68a ${n}.js opens ${k} link(s) in a new tab, allowed ${LEAVES[n] || 0} — data-do="file-view" opens it inside the card`);
  for (const m of src.matchAll(/tile_\(\{[^}]*\bhref:[^}]*\}\)/g)) if (!/leave: true/.test(m[0]) && n !== 'tiles') bad.push(`68a an href tile in ${n}.js — it opens in place unless leave: true (a sign-in)`);
});
if (!/!o\.leave && \/\^https/.test(tilesSrc)) bad.push('68a tile_ no longer opens an https tile in place (fileView_)');

/* ---------- 69a. A TIME IS A SPAN, start–end, and hours_ (core.js) is the one that writes it ---------- */
/* book-steps sends the first hour as data (`time`) to the backend: a field, not words on screen. */
files.forEach(({ n, src }) => {
  if (n === 'core') return;
  const code = stripC(src);
  const k = (code.match(/time_\([^()]*\+ ':00'\)/g) || []).length - (n === 'book-steps' ? 1 : 0);
  if (k > 0) bad.push(`69a an hour said by hand in ${n}.js — hours_(start, end): 16:00–18:00`);
  if (/time_\([^)]*\)\s*\+\s*'\s*[–-]\s*'\s*\+\s*time_\(/.test(code)) bad.push(`69a a span built by hand in ${n}.js — hours_(start, end)`);
});
if (!/const hours_ = \(a, b\) => time_\(a \+ ':00'\) \+ '–' \+ time_\(b \+ ':00'\)/.test(coreSrc)) bad.push('69a hours_ no longer writes start–end');

/* ---------- 70a. A RATE IS £12.00/h, written by perHour_ (core.js); a total stays a total ---------- */
if (!/const perHour_ = n => money_\(n\) \+ '\/h';/.test(coreSrc)) bad.push('70a perHour_ is missing from core.js');
files.forEach(({ n, src }) => {
  if (n === 'core') return;
  const code = stripC(src);
  if (/'\/hour'|' per hour'|money_\([^()]*(\([^()]*\))?[^()]*\) \+ '(\/h|\/hr| an hour| per hour| a hour)'/.test(code)) bad.push(`70a a rate written by hand in ${n}.js — perHour_(n): £12.00/h`);
});

if (bad.length) { bad.forEach(b => console.log('  ✗ ' + b)); console.log(`check-look: ${bad.length} problem(s)`); process.exit(1); }
console.log('check-look: ok');
