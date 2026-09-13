#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-payload.js

   THE SITE ASKS `DATA` FOR THINGS. THE BACKEND DECIDES WHAT IS IN IT. NOTHING MADE THEM AGREE.

   CLAUDE.md ALREADY NAMES THIS AS THE WORST FAILURE THIS APP HAS: "A key the site asks for and the
   backend does not send fails silently. `|| []` turns it into an empty list, which looks exactly
   like an empty database." It has happened at least four times that left a trace in the comments —
   `liveJobs`, `messages`, `resources`, `people` — and each was found by somebody noticing a feature
   had quietly stopped, not by anything reporting it.

   `missingKeys()` EXISTS AND IS THE WRONG INSTRUMENT. It records a key the moment something reaches
   for one that is not there, so it only knows about the screens you happened to open, in the state
   you happened to be in, as the person you happened to be signed in as. A key read only by an admin
   on the print queue is invisible to it until an admin opens the print queue. This reads the files,
   so it sees every read whether or not anybody performed it.

   --------------------------------------------------------------------------------------------------
   TWO DIRECTIONS, AND THEY ARE NOT THE SAME SEVERITY.

   READ AND NEVER SENT is a feature that silently does nothing. The guard beside it — `|| []`,
   `|| {}` — was written to survive a key being absent and does its job perfectly, which is exactly
   why nobody finds out. This is the one that fails the build.

   SENT AND NEVER READ is weight: a tab walked, rows mapped, JSON serialised and shipped to a phone
   on every single load for nobody. Worth knowing and worth deleting, but it breaks nothing — so it
   is reported and does not fail.

   --------------------------------------------------------------------------------------------------
   COMMENTS ARE STRIPPED FIRST, AND THAT IS NOT A DETAIL.

   This codebase is 64% prose, and a great deal of that prose is about keys that USED to exist:

       `DATA.people` AND `hasRole_` BOTH NEVER EXISTED — I wrote them from memory…
       `DATA.config` is not a thing the payload sends…
       `|| DATA.avatarItems` was here, and the payload has never had that key…

   A scan that counts those finds ten missing keys where there are seven, and three of its findings
   are sentences explaining that the problem was already fixed. A checker that reports the fix as
   the fault is a checker nobody finishes reading.

     node js/check-payload.js
================================================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

/* ---------- ACCEPTED, WITH A REASON EACH -----------------------------------------------------------
   A key here is one the site reads and the backend deliberately does not send. Every entry needs a
   sentence, because "we know about that one" is how a real fault gets added to a list of excuses and
   never looked at again. An empty list is the goal. */
const ACCEPTED = {
  /* ---------- THE LEGAL DOCUMENTS, AND A NAME COLLISION THAT WOULD SURVIVE THE OBVIOUS FIX --------
     This one needs reading before anybody "fixes" it. terms.js wants LEGAL DOCUMENTS: it filters for
     `r.docid && r.version` and goes on to use `live`, `audience`, `title` and `mustsign`. The tab
     called `terms` in SCHEMA is SCHOOL TERMS — term_id, term_name, kind, start_date, end_date — and
     doGet already sends those, computed into `intervals`.

     So adding `terms` to the payload from TAB.terms would make this line stop being reported while
     leaving the feature exactly as dead: every row would fail the `docid` filter and termsDocs_
     would return [] for ever, now with a checker saying it was fine. The legal documents need their
     own tab under their own name. */
  terms: 'terms.js wants legal documents (docid/version/mustsign); TAB.terms is SCHOOL terms and is '
       + 'already sent as `intervals`. Needs its own tab under another name — sending TAB.terms here '
       + 'would silence this line without making the feature work.',

  /* The other half of the same unbuilt feature, and both are already named in CLAUDE.md. terms.js
     posts `acceptTerms`, for which there is no handler anywhere in backend/, and reads these two
     back, for which there is no tab and no payload key. A handler, a tab and two keys — a decision
     to build something, not a repair. */
  termsAccepted: 'no acceptTerms handler and no tab; the signature half of the terms feature was '
               + 'never built. See CLAUDE.md.',
  termsAcceptedWhen: 'the timestamp half of the same unbuilt signature feature.',

  /* Wired at both ends of the front end with no middle: collections.js has an admin star toggle
     that posts `spotlight`, dopost.gs has no such handler, SCHEMA has no such tab. check-access.js
     reports the handler half; this reports the payload half. Also already in CLAUDE.md. */
  spotlight: 'admin star toggle with no handler, no tab and no payload key — never finished, not a '
           + 'regression. check-access.js names the other half.',

  /* ---------- THE ONE WORTH BUILDING ------------------------------------------------------------
     `applyColumns_` in shell.js lets the SHEET decide which screens exist, in what order, with what
     label and icon — it mutates TABS rather than replacing it, guards against a sheet naming nothing
     this build has, and treats a blank cell as "keep what the code says". It is careful, complete,
     and reads a key nothing sends, so it has never once run.

     This is the thing this whole project is for: the sheet deciding the site. It needs a `columns`
     tab in SCHEMA and one line in doGet, and it stays here until somebody decides the column set is
     the sheet's to own. */
  columns: 'applyColumns_ would let the sheet decide the screens and their order. Needs a `columns` '
         + 'tab in SCHEMA and a payload key — worth building, and a decision rather than a repair.',
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

/* Block and line comments out. Crude on purpose: a `//` inside a string would be cut too, and the
   only thing that costs is a missed READ, which the other direction of this check would then report
   as "sent and never read" — visible either way.

   A BLOCK COMMENT IS REPLACED BY ITS OWN NEWLINES, NOT BY A SPACE. The first version collapsed each
   one to ' ', which is correct for finding reads and wrong for reporting them: this codebase is 64%
   prose, so a file's comments are most of its lines, and every line number after the first block
   comment came out short by however many lines that comment ran. The first run of this check pointed
   at `me:601`, which is the middle of a paragraph about double-tapping Sign in. A checker that names
   the wrong line is one you stop believing before you stop running it. */
const decomment = src => src
  .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  .replace(/^([ \t]*)\/\/.*$/gm, '$1');

/* ---------- WHAT THE SITE ASKS FOR --------------------------------------------------------------- */
const jsDir = fs.existsSync(path.join(__dirname, 'shell.js')) ? __dirname
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

/* ---------- WHAT THE BACKEND SENDS ----------------------------------------------------------------
   Three shapes, because doGet uses all three: a key in the `const payload = { … }` literal, a later
   `payload.x = …`, and `payload.x.push(…)` filling one declared empty up top. */
const gsPath = findGs('doget.gs') || findGs('doGet.gs') || findGs('60_doGet.gs');
if (!gsPath) {
  console.log('FAILED — doget.gs not found, so NOTHING was checked. Looked in:\n  ' + WHERE.join('\n  '));
  process.exit(1);
}
const gs = decomment(fs.readFileSync(gsPath, 'utf8'));

const sent = new Set();

/* THE LITERAL IS WALKED, NOT PATTERN-MATCHED, AND THE FIRST VERSION SHOWS WHY.
   It took keys with `/^ {6}(\w+)\s*:/gm` — the literal's own indent, anchored to the line. That
   reads every key that STARTS a line and none of the ones after it, and this literal packs related
   keys together:

       links: [], shop: [], promotions: [], intervals: [], landmarks: [],
       profileFields: PROFILE_GROUPS, clientFields: CLIENT_GROUPS,

   so `links` and `profileFields` counted as sent and `promotions` and `clientFields` did not. Both
   were then reported as features the backend never sends, which is the worst thing this check can
   do: it is here to be believed about exactly that, and two of its nine findings were its own regex.
   Walking depth costs twenty lines and cannot be wrong about where a key sits. */
const scanLiteral = src => {
  const at = src.indexOf('const payload = {');
  if (at === -1) return [];
  const keys = [];
  let i = src.indexOf('{', at), depth = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    /* Strings are skipped whole. A `:` inside one is prose, and `'a: b'` at depth 1 would otherwise
       read as a key. Template literals nest `${}` and are skipped the same crude way — anything
       they contain is a value, never a key of this object. */
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
      /* THE FIRST CHARACTER OF THE VALUE IS TAKEN TOO, because a key being sent and a key being
         sent as the right SHAPE are different claims, and the fixture can fail the second while
         passing the first — see the fixture block below. `[` and `{` are the only two this can
         be sure of; a constant or a call says nothing here and is recorded as unknown. */
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

/* ---------- AND WHAT THE CHECKS PRETEND IT SENDS ---------------------------------------------------
   `check/fixture.json` IS THE BACKEND, for every check that stands one up — `check/ui.js` serves it
   in place of the real `doGet`, so nine screens at four widths are measured against whatever is in
   that file rather than against whatever doGet returns.

   SO A KEY IT TYPES DIFFERENTLY IS A PAYLOAD THE APP WILL NEVER RECEIVE, and every green tick taken
   against it is green about fiction. `intervals` was `{}` in the fixture and `[]` from doGet, and
   `(DATA.intervals || []).map` throws on an object — `{}` is truthy, so the fallback that exists for
   exactly this never fires. The booking breakdown could not be drawn at all under the harness.

   NOTHING CAUGHT IT for as long as it was there. `check/ui.js` draws nine screens and none of them
   builds a breakdown; `check-flow.js` has its own payload written inline, where `intervals` is a
   proper list — so the one harness that would have thrown was reading a different fixture from the
   one that was wrong.

   ONLY THE TWO SHAPES doGet STATES OUTRIGHT ARE CHECKED. `landmarks: []` and `gallery: { … }` are
   claims; `brand: BRAND` is a name and says nothing here, and guessing at it would put this check
   in the business of being wrong about things it cannot see. A key the fixture simply lacks is not
   a mismatch either: absent reaches the site as `undefined`, which is what `|| []` is for. */
/* ---------- AND THE SHAPE OF A ROW, WHICH IS WHERE IT WAS REALLY WRONG ---------------------------
   THE CHECK ABOVE COMPARES CONTAINERS — is `posts` a list or an object. That caught `intervals` and
   it is not where the damage was. `check/fixture.json` held SHEET ROWS for posts, tutors and venues:

       fixture   { post_id: 'PO1', date: '01/09/2026', active: 'yes', likes: '3' }
       doGet     { id, author, handle, avatar, image, caption, body, location, when, at,
                   pinned, active, waiting, refused, approvedBy, poll, reactions, rowIndex }

   Nine of eighteen keys absent, `id` among them. So every post the harness ever drew had no id, no
   picture, no timestamp and no handle — `p.id` was `undefined`, which made the share control's
   `data-id` empty and, once the actions became tiles, made `postTiles_` correctly draw nothing at
   all. Tutors were missing `id`, `image`, `subtitle` and `tags`; venues the same. Three of the most
   drawn things in the app, measured as cards that could not have been built from real data.

   A FIXTURE IN SHEET SPELLING IS AN EASY MISTAKE because both are plausible JSON off the same tab,
   and nothing anywhere said which side of `doGet` this file sits on. It sits AFTER: it stands in
   for the response, not for the spreadsheet.

   EVERY TAB IS PUSHED FROM EXACTLY ONE PLACE in `doget.gs`, checked rather than assumed, so the key
   list for a tab is unambiguous and this can be strict about it.

   TWO SEVERITIES, AS ELSEWHERE IN THIS FILE. A row that exists in the wrong shape is a lie and
   fails; a tab with no rows at all is thin coverage — real, worth knowing, and not a false claim —
   so it is printed and does not fail. Fourteen tabs are in that state today. */
const rowKeys = new Map();
{
  const re = /payload\.([A-Za-z_]\w*)\.push\(\{/g;
  let m;
  while ((m = re.exec(gs))) {
    const keys = [];
    let i = gs.indexOf('{', m.index + m[0].length - 1), depth = 0;
    for (; i < gs.length; i++) {
      const c = gs[i];
      if (c === '"' || c === "'" || c === '`') {
        const q = c;
        for (i++; i < gs.length && gs[i] !== q; i++) if (gs[i] === '\\') i++;
        continue;
      }
      if (c === '{' || c === '[') { depth++; continue; }
      if (c === '}' || c === ']') { depth--; if (depth === 0) break; continue; }
      /* ---------- A SHORTHAND PROPERTY IS STILL A KEY ---------------------------------------------
         `payload.venues.push({ id: i, type: 'venue', title, borough: … })` — `title` has no colon
         after it, so a scanner looking for `name:` does not see it, and this reported `title` as a
         key doGet never sends. I then wrote a fixture venue without one, and every venue in the
         booking dropdown came out as `undefined`. The check was wrong and the app was fine, which
         is the most expensive way round.

         A KEY IS AN IDENTIFIER IN KEY POSITION, which is directly after the opening `{` or after a
         comma at this depth. Testing for `[:,}]` after the name instead would have read `rate` in
         `bestRate: rate,` as a key of its own — the value, counted as a field. What comes BEFORE is
         what settles it. */
      if (depth === 1 && /[A-Za-z_]/.test(c) && !/\w/.test(gs[i - 1] || '')) {
        let j = i - 1;
        while (j >= 0 && /\s/.test(gs[j])) j--;
        if (gs[j] === '{' || gs[j] === ',') {
          const k = /^([A-Za-z_]\w*)\s*[:,}]/.exec(gs.slice(i, i + 80));
          if (k) { keys.push(k[1]); i += k[1].length - 1; }
        }
      }
    }
    if (keys.length) rowKeys.set(m[1], keys);
  }
}

const fxPath = path.join(__dirname, '..', 'check', 'fixture.json');
const shapeOf = v => Array.isArray(v) ? '[' : (v && typeof v === 'object' ? '{' : null);
const fxWrong = [];
const rowWrong = [];
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
    /* MISSING FROM EVERY ROW, not from the first. A tab may have one row exercising a key another
       does not — `poll` on a post, `refused` on one waiting — and demanding every key on every row
       would report a good fixture as a bad one. */
    const have = new Set();
    rows.forEach(r => Object.keys(r || {}).forEach(x => have.add(x)));
    const miss = keys.filter(x => !have.has(x));
    if (miss.length) rowWrong.push([tab, miss, keys.length, rows.length]);
  }
} catch (e) {
  /* A FIXTURE THAT CANNOT BE READ IS NOT A PASS. Every check that serves it is measuring nothing,
     and "I did not check" must not exit 0 — the same rule the three `.gs` finders learned. */
  fxWrong.push(['(the whole file)', '', '']);
  console.log('\ncheck/fixture.json could not be read: ' + e.message);
}

/* ---------- THE TWO LISTS ------------------------------------------------------------------------- */
const readNotSent = [...reads.keys()].filter(k => !sent.has(k) && !(k in ACCEPTED)).sort();
const sentNotRead = [...sent].filter(k => !reads.has(k)).sort();
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

if (rowThin.length) {
  console.log('');
  console.log('TABS THE FIXTURE HAS NO ROWS FOR  (' + rowThin.length + ')');
  console.log('  ' + rowThin.join(', '));
  console.log('  → every screen drawn from these is measured empty. Not a false claim, so this '
            + 'does not fail —');
  console.log('    but a card that is never drawn is a card no check has an opinion about.');
}

if (accepted.length) {
  console.log('');
  console.log('ACCEPTED, WITH A REASON  (' + accepted.length + ')');
  accepted.forEach(k => console.log('  DATA.' + k + ' — ' + ACCEPTED[k]));
}

console.log('');
console.log('keys read: ' + reads.size + '   keys sent: ' + sent.size
  + '   shapes doGet states: ' + shapeSent.size + '   keys in the fixture: ' + fxRead);
/* THE VERDICT MUST NOT OVERSTATE ITSELF. "everything the site reads, the backend sends" was printed
   here whenever the failing list was empty — including with five entries sitting in ACCEPTED saying
   the opposite three lines above. A summary that contradicts its own report is worse than no
   summary: the report is what gets skimmed, and this is the line that gets read. */
console.log(fxWrong.length || rowWrong.length
  ? 'FAILED — the fixture is not the payload, so nothing served it was really checked.'
  : readNotSent.length
  ? 'FAILED — each of those is a feature that does nothing and says nothing.'
  : accepted.length
    ? 'OK — nothing NEW is unsent. ' + accepted.length + ' known dead key'
      + (accepted.length === 1 ? '' : 's') + ' above, each an unbuilt feature rather than a break.'
    : 'OK — everything the site reads, the backend sends.');
process.exit(readNotSent.length || fxWrong.length || rowWrong.length ? 1 : 0);
