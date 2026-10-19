#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-loading.js ONE LOADER, AND NOTHING ELSE IN THE APP DRAWS A WAIT. § */
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const dir = __dirname;
const root = path.join(dir, '..');

/* ---------- THE APP'S OWN FILES, IN THE ORDER index.html LOADS THEM § */
function appFiles_() {
  let html = '';
  try { html = fs.readFileSync(path.join(root, 'index.html'), 'utf8'); } catch (e) {}
  const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
  if (!m) {
    console.error('cannot read window.FILES out of index.html — this check has nothing to read');
    process.exit(2);
  }
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1] + '.js');
}

/* ---------- 1. THE OLD WORDS § */
const PHRASES = [
  /* ANY WAIT THAT TRAILS OFF, NOT ONLY THE BARE WORD. § */
  [/\b(Loading|Searching|Finding|Opening)\b[^<"]*(…|\.\.\.)/, 'a "Loading…" of its own — or "Searching…", "Finding…", "Opening…"'],
  /* `i`, because "still loading." is the same sentence with a small s. */
  [/\bStill loading\b/i, '"Still loading" — that is the splash\'s line, in index.html, and nowhere in a card'],
  /* WITH ITS ELLIPSIS, because "looking for the TV remote" is a Charades card and not a wait. */
  [/\bLooking for\b[^<"]*(…|\.\.\.)/i, '"Looking for…" — the Videos card said "Looking for videos…"'],
  [/\bLooking in\b[^<"]*(…|\.\.\.)/i, '"Looking in…" — the new-post sheet said "Looking in the folder…"'],
  [/\bFetching\b/i, '"Fetching…" — the business records said "Fetching what is recorded…"'],
  [/\bPlease wait\b/i, '"Please wait"'],
  [/\bStarting the camera\b/i, 'the camera\'s "Starting the camera…"'],
  [/\bstill coming\b/i, 'Find\'s "The questions are still coming"'],
  [/\bOpening the list\b/i, 'the Bible cover\'s "Opening the list of books…"'],
  [/\bbooks is on its way\b/i, 'the Bible\'s "The list of the Bible\'s books is on its way"'],
  /* ARRIVED WITH THE QUIET RETRY ON THE SAME DAY (docs/history/313), in every empty column while the app
     asked again — the column's wait is the loader; the line over the app says why, once. */
  [/\bWaiting for the server\b/i, 'the retry\'s "Waiting for the server" in a column — the quiet line `#reconnect` says it, once, for the whole app'],
  [/\bhave not arrived yet\b/i,'the score board\'s "Scores have not arrived yet" while they were on their way — the sentence is kept only where `scoreBoard_` knows the payload came'],
  [/\bhave not arrived from the server\b/i, 'the hours\' "The hours have not arrived from the server yet" while the payload was on its way — kept only where `initAvail` knows it came without them'],
  /* ---------- AND THE SHAPE, WHATEVER THE WORDS § */
  [/>[^<>]*\w(…|\.\.\.)\s*<\/(p|div|span|li|h\d|b|i|small)>/, 'an element whose text trails off in "…" — the shape of a wait drawn in words of its own'],
];
/* THREE OF THOSE ARE STILL IN THE APP, AND EACH IS RIGHT WHERE IT IS. § */
const AFTER_THE_WAIT = /awaiting_\(\)[\s\S]{0,60}?loading_\(\)/;
const PHRASE_OK = [
  { file: 'map.js', re: /\bhave not arrived yet\b/i, after: AFTER_THE_WAIT,
    why: 'scoreBoard_ draws the loader while the payload is on its way; this sentence is for a payload that came with nobody in it' },
  { file: 'me.js', re: /\bhave not arrived from the server\b/i, after: AFTER_THE_WAIT,
    why: 'initAvail draws the loader while the payload is on its way; this sentence is for a payload that came without `profileFields` — an older server' },
  { file: 'me.js', re: />sending…<\/p>/,
    why: 'a message already sent and in flight under its bubble — a press answered (send_\'s "Sending…", docs/history/094), not content on its way' },
  { file: 'me.js', re: /\bstill loading from the sheet, so nothing was sent\b/,
    why: 'the answer to a press of Save before the saved details came: a refusal said once, after the press, and not a wait drawn on a card' },
];

/* ---------- 2. THE CLASSES A WAIT WAS DRAWN WITH ------------------------------------------------------ */
const WAIT_CLASS = /^(sk|sk-[\w-]+|skeleton[\w-]*|[\w-]*shimmer[\w-]*|[\w-]*spinner[\w-]*|loader[\w-]*|is-wait|is-loading|[\w-]+-loading|loading-[\w-]+)$/;
const LOADER_CLASS = 'loading';

/* ---------- 3. THE STYLESHEET § */
const WAIT_KEYFRAME = /(^|-)(sk|skeleton|shimmer|spin\w*|load\w*|wait\w*|pulse\w*|busy\w*)($|-)/;
/* `mb-spin` WAS THE SECOND — the coin turning over in the blocks splash — and went with it on 10 Oct (docs/history/322). § */
const ACCEPTED_KEYFRAMES = {
  'btn-spin': 'the busy ring on a pressed button or tile (`.btn.is-busy`, `.tile.is-busy`) — an action in flight, '
            + 'not content on its way: docs/history/094. The loader is dots so the two can never be mistaken.',
};
const BLOCK_START = '---------- WAITING: ONE LOADER';

const bad = [];
const note = [];

/* ---------- THE STRINGS OF EVERY APP FILE, AND WHERE EACH SITS § */
const lineOf = (src, at) => src.slice(0, at).split('\n').length;
let strings = 0, calls = 0, loadedCalls = 0;
let loaderSrc = '';
const callers = new Set();

for (const f of appFiles_()) {
  const p = path.join(dir, f);
  let src;
  try { src = fs.readFileSync(p, 'utf8'); } catch (e) { bad.push(`${f}: listed in index.html and not readable`); continue; }

  /* THE TWO FUNCTIONS ALLOWED TO WRITE THE CLASS — found by parsing, not by line number, so moving
     them inside shell.js moves the exemption with them. */
  const own = [];
  if (f === 'shell.js') {
    let ast;
    try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script' }); }
    catch (e) { bad.push(`shell.js does not parse: ${e.message}`); continue; }
    ast.body.forEach(n => {
      if (n.type === 'FunctionDeclaration' && n.id && (n.id.name === 'loading_' || n.id.name === 'loaded_')) {
        own.push([n.start, n.end, n.id.name]);
      }
    });
    if (!own.some(o => o[2] === 'loading_')) bad.push('shell.js: no `function loading_()` — the one loader is not where everything expects it');
    if (!own.some(o => o[2] === 'loaded_')) bad.push('shell.js: no `function loaded_(el)` — nothing takes the loader off a box drawn waiting');
    /* AND WHAT IT RETURNS IS THE CONTRACT. */
    const fn = own.find(o => o[2] === 'loading_');
    if (fn) {
      const body = src.slice(fn[0], fn[1]);
      loaderSrc = body;
      if (!/role="status"/.test(body)) bad.push('loading_() does not say role="status" — a screen reader hears nothing while it waits');
      if (!/aria-label="Loading"/.test(body)) bad.push('loading_() has no aria-label="Loading" — three dots say nothing out loud');
      if ((body.match(/<span><\/span>/g) || []).length !== 3) bad.push('loading_() does not draw three dots');
    }
  }
  const inOwn = at => own.some(o => at >= o[0] && at < o[1]);

  let toks;
  try { toks = [...acorn.tokenizer(src, { ecmaVersion: 'latest' })]; }
  catch (e) { bad.push(`${f} does not tokenize: ${e.message}`); continue; }

  toks.forEach((t, i) => {
    /* COUNT THE CALLERS, so "nobody draws it" cannot pass as "nobody draws a wrong one". */
    if (t.type.label === 'name' && toks[i + 1] && toks[i + 1].type.label === '(' && !(toks[i - 1] && toks[i - 1].type.label === 'function')) {
      if (t.value === 'loading_') { calls++; callers.add(f); }
      if (t.value === 'loaded_') loadedCalls++;
    }
    if (t.type.label !== 'string' && t.type.label !== 'template') return;
    strings++;
    const v = String(t.value || '');
    const at = `${f}:${lineOf(src, t.start)}`;

    /* 1. THE OLD WORDS */
    PHRASES.forEach(([re, what]) => {
      if (!re.test(v)) return;
      const ok = PHRASE_OK.find(o => o.file === f && o.re.test(v)
        && (!o.after || o.after.test(src.slice(Math.max(0, t.start - 400), t.start))));
      if (ok) { note.push(`${at}: ${JSON.stringify(v.trim().slice(0, 50))} — ${ok.why}`); return; }
      bad.push(`${at}: ${what} — ${JSON.stringify(v.trim().slice(0, 70))}. A wait is \`loading_()\`.`);
    });

    /* 2. A WAITING CLASS, OR THE LOADER'S OWN CLASS BY HAND. In a `class="…"` attribute, and as the
       argument of `classList.add/toggle`, `className =` — the three ways a class is written here. */
    const classSets = [];
    for (const m of v.matchAll(/\bclass\s*=\s*["']?([^"'>]*)/g)) classSets.push(m[1]);
    const prev = toks.slice(Math.max(0, i - 4), i).map(x => x.value || x.type.label).join(' ');
    if (/classList \. (add|toggle|replace) \($|className =$|className \+=$/.test(prev)) classSets.push(v);
    classSets.forEach(set => set.split(/\s+/).filter(Boolean).forEach(c => {
      if (c.includes('${')) return;
      if (c === LOADER_CLASS && !inOwn(t.start)) {
        bad.push(`${at}: the loader's class written by hand — call \`loading_()\` (shell.js), the one place it is written`);
      } else if (WAIT_CLASS.test(c)) {
        bad.push(`${at}: a waiting class of its own, "${c}" — a wait is \`loading_()\``);
      }
    }));

    /* AND AN ANIMATION WRITTEN INLINE that names a waiting keyframe — a spinner can be one style
       attribute as easily as a class. */
    for (const m of v.matchAll(/animation(?:-name)?\s*:\s*([\w-]+)/g)) {
      if (WAIT_KEYFRAME.test(m[1]) && !ACCEPTED_KEYFRAMES[m[1]] && !(m[1] === 'loading' && inOwn(t.start))) {
        bad.push(`${at}: an inline animation "${m[1]}" — a wait drawn in a style attribute`);
      }
    }
  });
}

/* ---------- 3 AND 4. THE STYLESHEET ---------------------------------------------------------------- */
let css = '';
try { css = fs.readFileSync(path.join(root, 'style.css'), 'utf8'); }
catch (e) { console.error('style.css is not readable — this check cannot reach half its subject'); process.exit(2); }
/* COMMENTS BLANKED, NOT REMOVED, so every offset below is still an offset into the real file. */
const bare = css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
const bStart = css.indexOf(BLOCK_START);
const bEnd = bStart < 0 ? -1 : css.indexOf('/* ----------', bStart + BLOCK_START.length);
if (bStart < 0 || bEnd < 0) bad.push(`style.css: no block headed "${BLOCK_START.replace('---------- ', '')}" — the one loader has no rules`);
const inBlock = at => at > bStart && at < bEnd;
const cssLine = at => css.slice(0, at).split('\n').length;

let keyframes = 0, loaderRules = 0;
for (const m of bare.matchAll(/@keyframes\s+([\w-]+)/g)) {
  keyframes++;
  const name = m[1];
  if (!WAIT_KEYFRAME.test(name)) continue;
  if (ACCEPTED_KEYFRAMES[name]) { note.push(`style.css:${cssLine(m.index)}: @keyframes ${name} — ${ACCEPTED_KEYFRAMES[name]}`); continue; }
  if (name === 'loading' && inBlock(m.index)) continue;
  bad.push(`style.css:${cssLine(m.index)}: @keyframes ${name} — ` + (inBlock(m.index)
    ? 'a second waiting animation in the loader\'s block, which has one, `loading`'
    : 'a wait animated outside the one loader\'s block'));
}
/* EVERY SELECTOR, with where it starts. A rule inside `@media` is read like any other: its selector
   still precedes a `{`. */
for (const m of bare.matchAll(/([^{}@;]+)\{/g)) {
  const sel = m[1].trim();
  if (!sel || /^(from|to|\d+%)/.test(sel)) continue;
  const at = m.index + m[0].indexOf(sel);
  const classes = [...sel.matchAll(/\.([\w-]+)/g)].map(x => x[1]);
  if (classes.includes(LOADER_CLASS)) {
    loaderRules++;
    if (!inBlock(at)) bad.push(`style.css:${cssLine(at)}: "${sel.replace(/\s+/g, ' ').slice(0, 70)}" — the loader dressed outside its one block`);
  }
  classes.filter(c => WAIT_CLASS.test(c)).forEach(c =>
    bad.push(`style.css:${cssLine(at)}: "${sel.replace(/\s+/g, ' ').slice(0, 70)}" — a rule for a waiting class of its own, "${c}"`));
}
/* THE BLOCK ITSELF: tokens only, rem only, and still for somebody who asked for less movement. */
if (bStart >= 0 && bEnd > 0) {
  const block = bare.slice(bStart, bEnd);
  const lit = block.match(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i);
  if (lit) bad.push(`style.css:${cssLine(bStart + block.indexOf(lit[0]))}: a colour literal in the loader's block (${lit[0]}) — tokens only`);
  const px = block.match(/\b\d*\.?\d+px\b/);
  if (px) bad.push(`style.css:${cssLine(bStart + block.indexOf(px[0]))}: ${px[0]} in the loader's block — nothing in it is pressed, so it is sized in rem`);
  if (!/var\(--gold\)/.test(block)) bad.push('style.css: the loader is not drawn in `var(--gold)`');
  if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.loading[^{]*\{[^}]*animation:\s*none/.test(block)) {
    bad.push('style.css: the loader keeps moving under prefers-reduced-motion — it must be three still dots');
  }
}

/* AN ACCEPTANCE FOR A KEYFRAME THAT IS GONE. */
const kfNames = new Set([...bare.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1]));
Object.keys(ACCEPTED_KEYFRAMES).filter(k => !kfNames.has(k)).forEach(k =>
  bad.push(`check-loading.js: ACCEPTED_KEYFRAMES lets "${k}" through and style.css has no @keyframes ${k} — an acceptance for nothing, waiting for the next wait given that name`));

/* ---------- 5. THE LOADING SCREEN'S LOADER IS `loading_()`'s, WRITTEN OUT § */
let splashLoader = '';
{
  let page = '';
  try { page = fs.readFileSync(path.join(root, 'index.html'), 'utf8'); } catch (e) {}
  let want = '';
  try { want = loaderSrc ? String(new Function(loaderSrc + '\nreturn loading_();')()) : ''; }
  catch (e) { bad.push('loading_() could not be run on its own (' + e.message + ') — the splash\'s copy was NOT compared'); }
  const html = page.replace(/<!--[\s\S]*?-->/g, '');
  const a = html.indexOf('<div id="splash-still"');
  let still = '';
  if (a >= 0) {
    let depth = 0;
    for (const m of html.slice(a).matchAll(/<(\/?)div\b[^>]*>/g)) {
      depth += m[1] ? -1 : 1;
      if (!depth) { still = html.slice(a, a + m.index + m[0].length); break; }
    }
  }
  const hand = (html.match(/\bclass\s*=\s*["']?loading\b/g) || []).length;
  if (!page) bad.push('index.html is not readable — the loading screen\'s loader was NOT compared');
  else if (!want) bad.push('no `loading_()` to run — the loading screen\'s loader was NOT compared');
  else if (!still) bad.push('index.html: no `#splash-still` — a first visit has no loader on its loading screen');
  else if (still.indexOf(want) < 0) {
    const got = (still.match(/<div class="loading"[\s\S]*?<\/div>/) || ['(none)'])[0];
    bad.push('index.html: the loading screen\'s loader is not `loading_()`\'s — it has ' + JSON.stringify(got.slice(0, 120))
      + ' and loading_() returns ' + JSON.stringify(want) + '. Change both, or neither.');
  } else splashLoader = want;
  if (page && hand !== 1) bad.push('index.html: `class="loading"` written ' + hand + ' times — once, in `#splash-still`, is the one copy allowed');
}

/* ---------- THE REPORT --------------------------------------------------------------------------- */
console.log('\nWAITS DRAWN ANOTHER WAY  (' + bad.length + ')');
bad.forEach(b => console.log('  ' + b));
if (!bad.length) console.log('  none');
console.log('\nACCEPTED, EACH WITH ITS REASON  (' + note.length + ')');
note.forEach(n => console.log('  ' + n));
console.log(`\nthe loading screen's loader: ${splashLoader ? 'loading_()\'s own markup, once, in #splash-still' : 'NOT the one loader'}`);
console.log(`\nstrings read: ${strings} · keyframes read: ${keyframes} · loader rules, all in the one block: ${loaderRules}`
  + ` · loading_() called ${calls} times in ${callers.size} files (${[...callers].join(', ')}) · loaded_() ${loadedCalls}`);
/* A LOADER NOTHING DRAWS PASSES EVERY RULE ABOVE — so a handful of callers is a floor. Twenty-four
   waits were replaced; well under that is somebody having taken it out. */
if (calls < 15) bad.push(`loading_() is called ${calls} times — the waits it replaced were not all moved onto it, or were moved off`);
if (!loadedCalls) bad.push('loaded_() is never called — a box drawn waiting is never taken out of it');
if (calls < 15 || !loadedCalls) console.log('\n  ' + bad.slice(-1)[0]);
console.log(bad.length
  ? '\nFAILED — a wait is drawn some other way than `loading_()`. The owner, 9 Oct: "They should all have a simplistic simple loading thing."'
  : '\nOK — every wait in the app is the one loader.');
process.exit(bad.length ? 1 : 0);
