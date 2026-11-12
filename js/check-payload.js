#!/usr/bin/env node
/* @family. — check-payload.js THE SITE ASKS `DATA` FOR THINGS. § */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report

const fs = require('fs');
const path = require('path');

/* SENT AND READ BY NO SCREEN, KEPT ON PURPOSE (433): what a person reads in the raw JSON. Anything else sent and unread is weight to delete. */
const UNREAD_KEPT = {
  health: 'the admin\'s data report — `?health=1` asks for it by name and an admin\'s load carries it; read in the raw JSON, not drawn.',
  migrated: 'what the sheet did on the first request after a deploy (the admin\'s first open runs setup, 361); null on every other request.',
  schemaBehind: 'whether the sheet is behind the code, said on every load for whoever opens the raw JSON; one property read.',
};
/* ---------- ACCEPTED, WITH A REASON EACH § */
const ACCEPTED = {
  /* ---------- A KEY ONLY AN OLDER BACKEND SENDS, READ ONCE TO CARRY WHAT IT KNEW ACROSS § */
  attempts: 'sent only by a backend from before 9 Oct; read once by subMigrate_ (js/submit.js) so the '
          + 'questions a child did before the switch to submissions become submissions, not blanks. '
          + 'The new doGet never sends it, and the read then finds nothing.',
};

const WHERE = [path.join(__dirname, '..', 'backend'), path.join(__dirname, 'backend'),
               path.join(__dirname, '..'), __dirname];
const findGs = name => {
  for (const w of WHERE) {
    for (const n of [name, name.toLowerCase()]) {
      const p = path.join(w, n);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
};

/* Block and line comments out. § */
const decomment = src => src
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  .replace(/^([ \t]*)\/\/.*$/gm, '$1');

/* ---------- WHAT THE SITE ASKS FOR --------------------------------------------------------------- */
const jsDir = fs.existsSync(path.join(__dirname, 'core.js')) ? __dirname
            : path.join(__dirname, 'js');
const siteFiles = fs.readdirSync(jsDir)
  .filter(f => f.endsWith('.js') && !f.startsWith('check') && f !== '_scope.js');

const reads = new Map();                     // key -> "file:line, file:line"
siteFiles.forEach(f => {
  const src = decomment(fs.readFileSync(path.join(jsDir, f), 'utf8'));
  src.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/\bDATA\s*\.\s*([A-Za-z_][\w]*)/g)) {
      const at = f.replace(/\.js$/, '') + ':' + (i + 1);
      reads.set(m[1], (reads.get(m[1]) ? reads.get(m[1]) + ', ' : '') + at);
    }
  });
});

/* index.html reaches for a couple of its own before any file is loaded. */
const indexPath = path.join(jsDir, '..', 'index.html');
if (fs.existsSync(indexPath)) {
  const src = decomment(fs.readFileSync(indexPath, 'utf8'));
  for (const m of src.matchAll(/\bDATA\s*\.\s*([A-Za-z_][\w]*)/g)) {
    if (!reads.has(m[1])) reads.set(m[1], 'index.html');
  }
}

/* ---------- WHAT THE BACKEND SENDS § */
const gsPath = findGs('doget.gs') || findGs('doGet.gs') || findGs('60_doGet.gs');
if (!gsPath) {
  console.log('FAILED — doget.gs not found, so NOTHING was checked. Looked in:\n  ' + WHERE.join('\n  '));
  process.exit(1);
}
/* AND EVERY get-*.gs, where doGet's sections are since 1140 (`tools/get-src.js`). */
const gs = decomment(require('../tools/get-src.js').getFiles(path.join(path.dirname(gsPath), '..')).map(f => fs.readFileSync(f, 'utf8')).join('\n'));

const sent = new Set();

/* THE LITERAL IS WALKED, NOT PATTERN-MATCHED, AND THE FIRST VERSION SHOWS WHY. § */
/* EVERY `const payload = {`: getPayloadInit_ builds the payload from four parts, each its own literal. */
const scanLiteral = src => {
  const out = [];
  for (let at = src.indexOf('const payload = {'); at !== -1; at = src.indexOf('const payload = {', at + 1)) out.push(...scanOne(src, at));
  return out;
};
const scanOne = (src, at) => {
  const keys = [];
  let i = src.indexOf('{', at), depth = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    /* Strings are skipped whole. § */
    if (c === '"' || c === "'" || c === '`') {
      const q = c;
      for (i++; i < src.length && src[i] !== q; i++) if (src[i] === '\\') i++;
      continue;
    }
    if (c === '{' || c === '[') { depth++; continue; }
    if (c === '}' || c === ']') { depth--; if (depth === 0) break; continue; }
    /* Depth 1 is the payload's own keys. Deeper is a value's insides — `gallery: { error: '' }`
       must not put `error` on the sent list, or a real missing key hides behind it. */
    if (depth === 1 && /[A-Za-z_]/.test(c)) {
      /* THE FIRST CHARACTER OF THE VALUE IS TAKEN TOO, because a key being sent and a key being sent as the right SHAPE are different claims, and the fixture can fail § */
      const m = /^([A-Za-z_]\w*)\s*:\s*(\S)/.exec(src.slice(i, i + 120));
      if (m && !/\w/.test(src[i - 1] || '')) { keys.push([m[1], m[2]]); i += m[1].length - 1; }
    }
  }
  return keys;
};
const shapeSent = new Map();               // key -> '[' or '{', for the ones doGet states outright
scanLiteral(gs).forEach(([k, mark]) => {
  sent.add(k);
  if (mark === '[' || mark === '{') shapeSent.set(k, mark);
});

/* Later assignments and the fill loops: `payload.x = …`, `payload.x.push(…)`. */
for (const m of gs.matchAll(/\bpayload\s*\.\s*([A-Za-z_][\w]*)/g)) sent.add(m[1]);

/* AND WHAT A COMMITTED SETTINGS FILE SENDS (830): `settingsInto_` writes `d.key` from `extra['settings/<name>']`, sent when data/settings/<name>.json is in the repo. */
const SETTINGS_SRC = decomment(require('../tools/piece-src.js').pieceSrc('settings', path.join(__dirname, '..')));
const SENT_BY_FILE = [];
SETTINGS_SRC.split(/(?=extra\['settings\/)/).forEach(seg => {
  const f = /^extra\['settings\/([\w-]+)'\]/.exec(seg);
  if (!f || !fs.existsSync(path.join(__dirname, '..', 'data', 'settings', f[1] + '.json'))) return;
  for (const m of seg.matchAll(/\bd\.([A-Za-z_]\w*)\s*=(?!=)/g)) { if (!sent.has(m[1])) SENT_BY_FILE.push(m[1] + ' (' + f[1] + '.json)'); sent.add(m[1]); }
});

/* ---------- AND WHAT THE CHECKS PRETEND IT SENDS § */
/* ---------- AND THE SHAPE OF A ROW, WHICH IS WHERE IT WAS REALLY WRONG § */
const rowKeys = new Map();
{
  /* A COMMENT AT THE END OF A LINE IS PROSE, and `decomment` only takes whole-line ones. § */
  const rs = (src => {
    const out = src.split('');
    for (let i = 0; i < out.length; i++) {
      const c = out[i];
      if (c === '"' || c === "'" || c === '`') {
        for (i++; i < out.length && out[i] !== c && (c === '`' || out[i] !== '\n'); i++) if (out[i] === '\\') i++;
        continue;
      }
      if (c === '/' && out[i + 1] === '/') { for (; i < out.length && out[i] !== '\n'; i++) out[i] = ' '; }
    }
    return out.join('');
  })(gs);
  const keysAt = start => {
    const keys = [];
    let i = start, depth = 0;
    for (; i < rs.length; i++) {
      const c = rs[i];
      if (c === '"' || c === "'" || c === '`') {
        const q = c;
        for (i++; i < rs.length && rs[i] !== q; i++) if (rs[i] === '\\') i++;
        continue;
      }
      if (c === '{' || c === '[' || c === '(') { depth++; continue; }
      if (c === '}' || c === ']' || c === ')') { depth--; if (depth === 0) break; continue; }
      /* ---------- A SHORTHAND PROPERTY IS STILL A KEY § */
      if (depth === 1 && /[A-Za-z_]/.test(c) && !/\w/.test(rs[i - 1] || '')) {
        let j = i - 1;
        while (j >= 0 && /\s/.test(rs[j])) j--;
        if (rs[j] === '{' || rs[j] === ',') {
          const k = /^([A-Za-z_]\w*)\s*[:,}]/.exec(rs.slice(i, i + 80));
          if (k) { keys.push(k[1]); i += k[1].length - 1; }
        }
      }
    }
    return keys;
  };
  const re = /payload\.([A-Za-z_]\w*)\.push\(\{/g;
  let m;
  while ((m = re.exec(rs))) {
    const keys = keysAt(rs.indexOf('{', m.index + m[0].length - 1));
    if (keys.length) rowKeys.set(m[1], keys);
  }
  /* A ROW BUILT BY HELPERS (`push(Object.assign(a_(…), b_(…)))`): each helper's returned literal, in order. */
  for (const c of rs.matchAll(/payload\.([A-Za-z_]\w*)\.push\((?!\{)([^;]*)\);/g)) {
    const keys = [];
    for (const f of c[2].matchAll(/\b(\w+_)\(/g)) {
      const at = rs.search(new RegExp('\\nfunction ' + f[1] + '\\('));
      const ret = at < 0 ? -1 : rs.indexOf('return {', at);
      if (ret >= 0) keys.push(...keysAt(ret + 7));
    }
    if (keys.length) rowKeys.set(c[1], keys);
  }
}

const fxPath = path.join(__dirname, '..', 'check', 'fixture.json');
const shapeOf = v => Array.isArray(v) ? '[' : (v && typeof v === 'object' ? '{' : null);
const fxWrong = [];
const rowWrong = [];
const rowExtra = [];
const rowThin = [];
let fxRead = 0;
try {
  const fx = JSON.parse(fs.readFileSync(fxPath, 'utf8'));
  fxRead = Object.keys(fx).length;
  for (const [k, mark] of shapeSent) {
    if (!(k in fx)) continue;
    const got = shapeOf(fx[k]);
    if (got && got !== mark) fxWrong.push([k, mark, got]);
  }
  for (const [tab, keys] of rowKeys) {
    const rows = fx[tab];
    if (!Array.isArray(rows) || !rows.length) { rowThin.push(tab); continue; }
    /* MISSING FROM EVERY ROW, not from the first. § */
    const have = new Set();
    rows.forEach(r => Object.keys(r || {}).forEach(x => have.add(x)));
    const miss = keys.filter(x => !have.has(x));
    if (miss.length) rowWrong.push([tab, miss, keys.length, rows.length]);
    /* ---------- AND THE REVERSE: A KEY THE FIXTURE HAS AND doGet NEVER BUILDS § */
    const fiction = [...have].filter(x => !keys.includes(x));
    if (fiction.length) rowExtra.push([tab, fiction]);
  }
} catch (e) {
  /* A FIXTURE THAT CANNOT BE READ IS NOT A PASS. Every check that serves it is measuring nothing,
     and "I did not check" must not exit 0 — the same rule the three `.gs` finders learned. */
  fxWrong.push(['(the whole file)', '', '']);
  console.log('\ncheck/fixture.json could not be read: ' + e.message);
}

/* ---------- THE TWO LISTS ------------------------------------------------------------------------- */
const readNotSent = [...reads.keys()].filter(k => !sent.has(k) && !(k in ACCEPTED)).sort();
const sentNotRead = [...sent].filter(k => !reads.has(k) && !(k in UNREAD_KEPT)).sort();
const unreadKept  = [...sent].filter(k => !reads.has(k) && (k in UNREAD_KEPT)).sort();
const accepted    = [...reads.keys()].filter(k => !sent.has(k) && (k in ACCEPTED)).sort();

console.log('');
console.log('THE SITE READS IT AND THE BACKEND NEVER SENDS IT  (' + readNotSent.length + ')');
if (!readNotSent.length) console.log('  none');
readNotSent.forEach(k => {
  console.log('  DATA.' + k);
  console.log('      read at ' + reads.get(k));
  console.log('      → silently empty. The `|| []` beside it is why nobody finds out.');
});

console.log('');
console.log('THE BACKEND SENDS IT AND NOTHING READS IT  (' + sentNotRead.length + ')');
console.log('  ' + (sentNotRead.length ? sentNotRead.join(', ') : 'none'));
if (sentNotRead.length) {
  console.log('  → a tab walked and shipped to every phone on every load, for nobody.');
  console.log('    Not a fault; weight. Delete the ones nothing is waiting for.');
}

console.log('');
console.log('THE FIXTURE AND doGet DISAGREE ABOUT A KEY\'S SHAPE  (' + fxWrong.length + ')');
if (!fxWrong.length) console.log('  none — every shape doGet states, the fixture matches.');
fxWrong.forEach(([k, want, got]) => {
  const said = m => (m === '[' ? 'a list' : m === '{' ? 'an object' : 'unreadable');
  console.log('  ' + k + ': doGet sends ' + said(want) + ', check/fixture.json has ' + said(got));
  console.log('      → every check served this fixture is measuring a payload the app never gets.');
});

console.log('');
console.log('THE FIXTURE\'S ROWS ARE NOT THE ROWS doGet BUILDS  (' + rowWrong.length + ')');
if (!rowWrong.length) console.log('  none — every row carries the keys its tab is sent with.');
rowWrong.forEach(([tab, miss, sent, n]) => {
  console.log('  ' + tab + ': doGet sends ' + sent + ' keys per row; no row of the '
            + n + ' in the fixture has ' + miss.length + ' of them');
  console.log('      missing: ' + miss.join(', '));
  console.log('      → usually a SHEET row pasted in where a PAYLOAD row belongs. The fixture '
            + 'stands in for');
  console.log('        the response, not for the spreadsheet.');
});

console.log('');
console.log('THE FIXTURE\'S ROWS CARRY KEYS doGet NEVER BUILDS  (' + rowExtra.length + ')');
if (!rowExtra.length) console.log('  none — every key a fixture row carries, doGet sends.');
rowExtra.forEach(([tab, extra]) => {
  console.log('  ' + tab + ': ' + extra.join(', '));
  console.log('      → every check served this fixture draws something the live site never has.');
});

if (rowThin.length) {
  console.log('');
  console.log('TABS THE FIXTURE HAS NO ROWS FOR  (' + rowThin.length + ')');
  console.log('  ' + rowThin.join(', '));
  console.log('  → every screen drawn from these is measured empty. Not a false claim, so this '
            + 'does not fail —');
  console.log('    but a card that is never drawn is a card no check has an opinion about.');
}

if (unreadKept.length) {
  console.log('');
  console.log('SENT AND READ BY NO SCREEN, KEPT WITH A REASON  (' + unreadKept.length + ')');
  unreadKept.forEach(k => console.log('  ' + k + ' — ' + UNREAD_KEPT[k]));
}

if (accepted.length) {
  console.log('');
  console.log('ACCEPTED, WITH A REASON  (' + accepted.length + ')');
  accepted.forEach(k => console.log('  DATA.' + k + ' — ' + ACCEPTED[k]));
}

console.log('');
console.log('sent by a committed settings file (`settingsInto_`): ' + SENT_BY_FILE.length + ' — ' + SENT_BY_FILE.join(', '));
console.log('keys read: ' + reads.size + '   keys sent: ' + sent.size
  + '   shapes doGet states: ' + shapeSent.size + '   keys in the fixture: ' + fxRead);
/* ONE LIST OF ROLE WORDS (batch G): core.js's `ROLE_ALIASES` is only the stand-in for doGet's `roleAliases`, word for word. */
const roleOff = [];
try {
  const lit = (f, re) => { const m = re.exec(fs.readFileSync(path.join(__dirname, '..', f), 'utf8')); return m ? Function('return ' + m[1])() : null; };
  const gs = lit('backend/constants.gs', /const ROLE_ALIASES = (\{[\s\S]*?\});/), js = lit('js/core.js', /const ROLE_ALIASES = (\{[\s\S]*?\});/);
  if (!gs || !js) roleOff.push('ROLE_ALIASES not found in ' + (!gs ? 'backend/constants.gs' : 'js/core.js'));
  else if (JSON.stringify(Object.entries(gs).sort()) !== JSON.stringify(Object.entries(js).sort())) roleOff.push('js/core.js ROLE_ALIASES is not backend/constants.gs ROLE_ALIASES');
  if (!sent.has('roleAliases')) roleOff.push('doGet does not send roleAliases');
  /* AND data.js's ROLE_THREE_ names no word ROLE_ALIASES maps: an old word is translated once, by roleOf. */
  const three = lit('js/data.js', /const ROLE_THREE_ = (\{[\s\S]*?\});/);
  if (!three) roleOff.push('ROLE_THREE_ not found in js/data.js');
  else if (gs) Object.keys(three).filter(k => k in gs).forEach(k => roleOff.push('js/data.js ROLE_THREE_ keeps the alias word ' + k + ' — ROLE_ALIASES maps it'));
} catch (e) { roleOff.push('(role words could not be read: ' + e.message + ')'); }
roleOff.forEach(x => console.log('ROLE WORDS: ' + x));
if (roleOff.length) process.exitCode = 1;
/* THE VERDICT MUST NOT OVERSTATE ITSELF. § */
console.log(fxWrong.length || rowWrong.length || rowExtra.length
  ? 'FAILED — the fixture is not the payload, so nothing served it was really checked.'
  : readNotSent.length
  ? 'FAILED — each of those is a feature that does nothing and says nothing.'
  : accepted.length
    ? 'OK — nothing NEW is unsent. ' + accepted.length + ' known dead key'
      + (accepted.length === 1 ? '' : 's') + ' above, each an unbuilt feature rather than a break.'
    : 'OK — everything the site reads, the backend sends.');
process.exit(roleOff.length || readNotSent.length || fxWrong.length || rowWrong.length || rowExtra.length ? 1 : 0);
