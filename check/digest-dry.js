#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/digest-dry.js   SUNDAY'S EMAILS, WRITTEN TO A FOLDER, OVER THE REAL SHEET, SENDING NOTHING

   *"i want to make sure everything is set up"* (the owner, 12 Oct, about the email of Sunday 18 Oct). The
   checks prove the rules on invented people; this proves the WEEK — the real Ledger's people, links and
   submissions through the real `digestPlan_` and `digestRender_`, the night before it matters, without a
   single email leaving this machine. docs/history/348. SINCE 18 OCT IT SIMULATES NO MARKING (docs/history/352,
   the owner: *"The marking is already done on each question."*): the 9pm run prints each verdict as the
   child's press recorded it, so this renders exactly that, and stops if anything asks Gemini.

     node check/digest-dry.js --sheets /path/to/sheets.json --week 2026-10-18 --out /tmp/sunday
     (--library /path/to/questions.json   the library each question is printed from — the repository's by default)

   `--sheets` is check/live.js's dump — `{ "ledger": { "<tab>": [[header], [row], …] } }`, a cell a string,
   number or boolean — and a date cell may be ISO text, `dd/mm/yyyy hh:mm:ss` as a UK sheet shows it (read
   as London time), or a Sheets serial number. `--week` is any day of the week; the email is that week's
   Sunday at `weekly_digest_hour`, London.

   WHAT IT DOES, IN ONE BACKEND SCOPE (`check-mail-load.js`'s world: London's calendar, the lock,
   the triggers and MailApp stubbed):
     0. THE SHEET AS IT IS, FIRST AND LOUD: when `weekly_digest` is not `send`, a real Sunday with this sheet
        sends NOTHING, and the first line says so before anything else. What follows is what it would do
        with `weekly_digest` at `send` and everything else as the sheet has it;
     1. the setup check's reach lines (`checkSundayEmail`) as of the hour before the email — who sent
        answers, who will be emailed, who will not be and why, who has a parent and no work yet;
     2. how many answers in the emails say "not marked" — recorded `sent`, so nothing marked them; no pass
        marks them first (there is none since 18 Oct), and Gemini is never asked;
     3. every email the Sunday run would send — less any the sheet's `digest_log` already records as
        sent for that week — put through `mailOut_`'s own net with a MailApp that only keeps what it is
        handed, written to `--out` as NN.html, NN.txt and NN.json (to, subject, text, html), with
        summary.json beside them. The folder's own NN.* and summary.json from an earlier run are deleted
        first, so nothing stale sits beside the new ones.

   NOTHING IS SENT, AND THE OUTPUT NEVER LANDS IN THE REPOSITORY. The world's MailApp records anything
   handed to it and this exits 1 if it recorded one; `--out` inside the repository is refused — by its
   real path, so a symlink or a folder called `..something` inside it is refused too — because the emails
   carry real addresses and children's first names, and this repository is public. THE MARKS IN THE
   EMAILS ARE THE SHEET'S, as each press recorded them.
================================================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const arg = n => { const i = argv.indexOf('--' + n); return i < 0 ? null : argv[i + 1]; };
const REPO = path.resolve(__dirname, '..');
const SHEETS = arg('sheets'), WEEK = arg('week'), OUT = arg('out');
const LIBRARY = arg('library') || path.join(REPO, 'data', 'questions.json');

const stop = s => { console.error('check/digest-dry.js: ' + s); process.exit(1); };
if (!SHEETS || !WEEK || !OUT) stop('--sheets <sheets.json>, --week <yyyy-mm-dd> and --out <folder> are all required. See the header of this file.');
if (!/^\d{4}-\d{2}-\d{2}$/.test(WEEK)) stop('--week must be a date, yyyy-mm-dd: ' + WEEK);
/* ---------- REFUSING TO WRITE INTO THE REPO — check/live.js's rule, for the same reason: addresses and names.
   INSIDE IS INSIDE BY ITS REAL PATH. It asked `path.relative(...).startsWith('..')`, and a folder in the
   repository called `..sunday` is `..sunday` relative to it — so the real week's emails went into the
   public working tree as untracked files (the review of 12 Oct). Now: outside only when the relative path
   is `..` itself, starts with `../`, or is on another drive; and both sides through `realpath` (of the
   nearest part of `--out` that exists), so a symlink into the repository is inside too. */
const real = p => {
  let at = path.resolve(p), rest = [];
  for (;;) {
    try { return path.join(fs.realpathSync(at), ...rest); } catch (e) { /* not there yet */ }
    const up = path.dirname(at);
    if (up === at) return path.resolve(p);
    rest.unshift(path.basename(at)); at = up;
  }
};
const rel = path.relative(real(REPO), real(OUT));
if (!(rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel))) {
  stop('refusing to write inside the repository — the emails carry real addresses and names, and this\n'
     + 'repository is public. Pass --out with a folder outside ' + REPO);
}
let dump, libText;
try { dump = JSON.parse(fs.readFileSync(SHEETS, 'utf8')); } catch (e) { stop('could not read --sheets ' + SHEETS + ': ' + e.message); }
try { libText = fs.readFileSync(LIBRARY, 'utf8'); } catch (e) { stop('could not read the library ' + LIBRARY + ': ' + e.message); }
const ledger = dump && (dump.ledger || dump);
if (!ledger || typeof ledger !== 'object' || !Array.isArray(ledger.submissions)) stop('the dump has no ledger.submissions tab — is it check/live.js’s shape?');

const { world, cfgSet, at, RealDate } = require(path.join(REPO, 'js', 'check-mail-load.js'));

/* ---------- A WALL-CLOCK TIME IN LONDON, AS AN INSTANT ----------------------------------------------------
   Twice round, because the offset at a guess an hour out can be the other side of the clocks changing. */
const offsetAt = ms => {
  const p = {};
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new RealDate(ms)).forEach(x => { p[x.type] = x.value; });
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(ms / 1000) * 1000;
};
const london = (y, mo, d, h, mi, s) => {
  const wall = Date.UTC(y, mo - 1, d, h || 0, mi || 0, s || 0);
  let t = wall - offsetAt(wall);
  t = wall - offsetAt(t);
  return t;
};
/* ---------- A DATE CELL AS THE SHEET HANDS IT TO APPS SCRIPT: A Date ---------------------------------------- */
const DATE_COLS = { submitted_at: 1, pressed_at: 0, week_of: 0, at: 1, linked_at: 1, created_at: 1, date_of_birth: 1 };
function cellIn(v, col) {
  if (!(col in DATE_COLS)) return v;
  if (typeof v === 'number' && v > 20000 && v < 80000) {             // a Sheets serial day, London wall time
    const days = Math.floor(v), secs = Math.round((v - days) * 86400);
    const base = new RealDate(Date.UTC(1899, 11, 30) + days * 864e5);
    return new RealDate(london(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), Math.floor(secs / 3600), Math.floor(secs / 60) % 60, secs % 60));
  }
  if (typeof v !== 'string') return v;
  const s = v.replace(/^'/, '').trim();
  const uk = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (uk) return new RealDate(london(+uk[3], +uk[2], +uk[1], +(uk[4] || 0), +(uk[5] || 0), +(uk[6] || 0)));
  const local = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s);      // no zone: London's
  if (local) return new RealDate(london(+local[1], +local[2], +local[3], +local[4], +local[5], +(local[6] || 0)));
  /* `pressed_at` IS TEXT ON THE SHEET (an apostrophe and ISO), and stays text — `answerAtMs_` reads it. */
  if (!DATE_COLS[col]) return v;
  const t = Date.parse(s);
  return isNaN(t) ? v : new RealDate(t);
}

/* ---------- THE WORLD, OVER THE DUMP ------------------------------------------------------------------------ */
const w = world();
const { b, G, mail } = w;
Object.keys(ledger).forEach(name => {
  const grid = ledger[name];
  if (!Array.isArray(grid) || !Array.isArray(grid[0])) return;
  const head = grid[0].map(h => String(h).trim());
  b.tabs[name] = [head].concat(grid.slice(1).map(r => head.map((h, i) => cellIn(r[i] === undefined || r[i] === null ? '' : r[i], h))));
});
b.ev('clearCache()');

/* ---------- 0. WHAT THE SHEET SAYS, BEFORE THIS RUN TREATS IT AS SWITCHED ON --------------------------------
   `weekly_digest` is the one switch this run assumes is `send` — the owner's step 3 — so the rest is the
   week as it will be. The plan does not read the switch, so nothing is changed for it. */
const cfgReal = JSON.parse(JSON.stringify(b.ev('config()')));
const mode = b.ev('digestMode_(config())'), hour = b.ev('digestHour_(config())');
const loud = [];
if (mode !== 'send') {
  loud.push('ON THE SHEET AS IT IS, SUNDAY SENDS NOTHING: weekly_digest is "'
    + String(cfgReal.weekly_digest || '') + '"' + (mode === 'preview' ? ' (preview writes the digest_log tab and emails nobody)' : '')
    + '. What follows is what it would do with weekly_digest set to send.');
}

/* ---------- THE CLOCK, AND THE ANSWERS AS THEY HAD ARRIVED BY IT --------------------------------------------
   The dump is the sheet as it is now, so every answer that arrived after the simulated moment is taken off
   the tab before the backend reads it. The grid is changed in place, because the backend's own table holds
   that array. */
const d0 = new RealDate(WEEK + 'T12:00:00Z');
const sunday = new RealDate(d0.getTime() + ((7 - d0.getUTCDay()) % 7) * 864e5).toISOString().slice(0, 10);
const [sy, sm, sd] = sunday.split('-').map(Number);
const sendAt = london(sy, sm, sd, hour, 0, 0);
let now = sendAt - 3600e3;
const setNow = t => { now = Math.max(now, t); w.setClock(now); };
w.setClock(now);
G.Utilities.sleep = ms => { now += ms; w.setClock(now); };
const sub = b.tabs.submissions || [[]];
const subHead = sub[0];
const atCol = subHead.indexOf('submitted_at');
const arrived = r => { const v = r[atCol]; return v instanceof RealDate || (v && typeof v.getTime === 'function') ? v.getTime() : -Infinity; };
const orig = sub.slice(1);
const showUpTo = t => {
  const seen = orig.filter(r => arrived(r) <= t);
  sub.length = 0;
  sub.push(subHead, ...seen);
  b.ev('clearCache()');
  return seen.length;
};

/* ---------- THE SITE STUBBED, AND GEMINI REFUSED ------------------------------------------------------------
   The library's URL is the local file. A Gemini call STOPS the run: the 9pm email marks nothing (18 Oct), so
   one is a bug, not a thing to simulate. Anything else is refused, so nothing here reaches the network. */
const net = { lib: 0 };
G.UrlFetchApp = { fetch: (url, o) => {
  if (/data\/questions\.json/.test(url)) { net.lib++; return { getResponseCode: () => 200, getContentText: () => libText }; }
  if (/generativelanguage/.test(url)) stop('the Sunday run asked Gemini — it must mark nothing, only print each verdict as it was recorded. Nothing was written.');
  throw new Error('check/digest-dry.js reaches no network: ' + url);
} };
const logs = [];
G.console = { log: s => logs.push(String(s)), warn: () => {}, error: () => {}, info: () => {} };
G.Logger = { log: () => {} };

/* ---------- 1. THE SETUP CHECK'S REACH, AS OF THE HOUR BEFORE, over the answers that had arrived by then:
   what `checkSundayEmail` would say if the owner ran it then. */
showUpTo(now);
const check = JSON.parse(JSON.stringify(b.ev('clearCache(); checkSundayEmail()'))).lines || [];
const reach = check.filter(l => /^(THIS WEEK|  NOT REACHED|  NO ANSWERS YET)/.test(l));

/* ---------- 3. THE EMAILS, AT THE SEND HOUR, THROUGH THE NET, TO A FOLDER --------------------------------------
   The answers as they stood when the run planned; less any email the sheet's own `digest_log` says went. */
setNow(sendAt);
showUpTo(now);
/* AND EACH QUESTION AS IT IS ON THE SITE (18 Oct) — the library's rows fetched as the run fetches them
   (`digestEmailLibrary_`, from the local file here), so the emails written are the ones the run would send. */
const plan = b.ev('clearCache(); (() => { const week = digestWeekToSend_(new Date()); let cfg = {}; try { cfg = config(); } catch (e) { cfg = {}; }'
  + ' return digestPlanNow_(week, new Date(), digestEmailLibrary_(week, read(TAB.submissions).rows, cfg)); })()');
let notMarked = 0;
plan.learners.forEach(L => (L.fresh || []).concat(L.again || []).forEach(q => {
  if (b.ev('digestMark_(' + JSON.stringify(String(q.verdict || '')) + ')') === 'not marked') notMarked++;
}));
const sentAlready = [];
const toWrite = plan.emails.filter(m => {
  const row = b.ev('digestLogFind_(read(TAB.digest_log), ' + JSON.stringify(plan.week.start) + ', ' + JSON.stringify(m.learner_id) + ', ' + JSON.stringify(m.parent_id) + ')');
  const st = String(row && row.status || '').trim().toLowerCase();
  if (st === 'sent' || st === 'sending') { sentAlready.push(m); return false; }
  return true;
});
const kept = [];
G.MailApp = { sendEmail: m => { kept.push(JSON.parse(JSON.stringify(m))); }, getRemainingDailyQuota: () => 0 };
toWrite.forEach(m => {
  G.__m = { to: m.to, subject: m.subject, body: m.text, htmlBody: m.html, name: plan.look.brand, firstNamesOnly: true };
  b.ev('mailOut_(__m)');
});
if (mail.sent.length) stop('an email reached the world’s MailApp — nothing may be sent from here. Nothing was written.');

fs.mkdirSync(OUT, { recursive: true });
/* AN EARLIER RUN'S FILES GO FIRST — its own names only, so nothing else in the folder is touched. */
fs.readdirSync(OUT).filter(f => /^\d{2,}\.(html|txt|json)$/.test(f) || f === 'summary.json').forEach(f => fs.unlinkSync(path.join(OUT, f)));
const pad = n => String(n).padStart(2, '0');
kept.forEach((m, i) => {
  const n = pad(i + 1);
  fs.writeFileSync(path.join(OUT, n + '.json'), JSON.stringify({ to: m.to, subject: m.subject, text: m.body, html: m.htmlBody }, null, 2));
  fs.writeFileSync(path.join(OUT, n + '.txt'), 'To: ' + m.to + '\nSubject: ' + m.subject + '\n\n' + m.body + '\n');
  fs.writeFileSync(path.join(OUT, n + '.html'), '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<title>' + String(m.subject).replace(/</g, '&lt;') + '</title><body style="margin:16px">' + m.htmlBody + '</body>');
});


const summary = {
  sheet: { weekly_digest: String(cfgReal.weekly_digest || ''), weekly_digest_hour: hour, sends: mode === 'send', loud: loud },
  week: { start: plan.week.start, end: plan.week.end, email_at: new RealDate(sendAt).toISOString() },
  reach: reach,
  verdicts: { as: 'each verdict as the child’s press recorded it — the 9pm run marks nothing (docs/history/352)',
              not_marked_in_emails: notMarked, library_fetches: net.lib, gemini_asks: 0 },
  emails: kept.map((m, i) => ({ file: pad(i + 1), to: m.to, subject: m.subject })),
  already_sent: sentAlready.map(m => ({ to: m.to, subject: m.subject })),
  unreachable: plan.unreachable.map(u => ({ count: u.count, why: u.why })),
};
fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));

loud.forEach(l => console.log(l));
console.log('The week of ' + plan.week.start + ' to ' + plan.week.end + '; the email at ' + hour + ':00 London on ' + sunday
  + ' (weekly_digest on the sheet: "' + summary.sheet.weekly_digest + '").');
reach.forEach(l => console.log(l));
console.log('Marking: none — the 9pm run prints each verdict as it was recorded when the child sent it; '
  + notMarked + ' answer(s) say "not marked" (recorded `sent`: nothing marked them). Gemini was not asked.');
if (sentAlready.length) console.log(sentAlready.length + ' email(s) not written: the sheet’s digest_log already has them sent for this week, so the run would skip them.');
console.log(kept.length + ' email(s) written to ' + path.resolve(OUT) + ' — nothing was sent.');
