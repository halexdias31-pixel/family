#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/digest-dry.js   SUNDAY'S EMAILS, WRITTEN TO A FOLDER, OVER THE REAL SHEET, SENDING NOTHING

   *"i want to make sure everything is set up"* (the owner, 12 Oct, about the email of Sunday 18 Oct). The
   checks prove the rules on invented people; this proves the WEEK — the real Ledger's people, links and
   submissions through the real `digestPlan_`, `digestRender_` and marking pass, the night before it
   matters, without a single email leaving this machine. docs/history/348.

     node check/digest-dry.js --sheets /path/to/sheets.json --week 2026-10-18 --out /tmp/sunday
     (--marks half|full|none   what the stubbed Gemini gives — half by default; none is Gemini full all day)
     (--library /path/to/questions.json   the library to mark against — the repository's by default)

   `--sheets` is check/live.js's dump — `{ "ledger": { "<tab>": [[header], [row], …] } }`, a cell a string,
   number or boolean — and a date cell may be ISO text, `dd/mm/yyyy hh:mm:ss` as a UK sheet shows it (read
   as London time), or a Sheets serial number. `--week` is any day of the week; the email is that week's
   Sunday at `weekly_digest_hour`, London, and the marking pass runs an hour before it, as the triggers do.

   WHAT IT DOES, IN ORDER, IN ONE BACKEND SCOPE (`check-mail-load.js`'s world: London's calendar, the lock,
   the triggers and MailApp stubbed):
     1. the setup check's reach lines (`checkSundayEmail`) as of the hour before the email — who sent
        answers, who will be emailed, who will not be and why, and what is still unmarked;
     2. the marking pass, again and again until nothing is left, with Gemini STUBBED (`--marks`) and the
        library served from the local file — how many it marks, how many it cannot, and why;
     3. every email the Sunday run would send, put through `mailOut_`'s own net with a MailApp that only
        keeps what it is handed, written to `--out` as NN.html, NN.txt and NN.json (to, subject, text, html),
        with summary.json beside them.

   NOTHING IS SENT, AND THE OUTPUT NEVER LANDS IN THE REPOSITORY. The world's MailApp records anything
   handed to it and this exits 1 if it recorded one; `--out` inside the repository is refused, because
   the emails carry real addresses and children's first names, and this repository is public. THE MARKS
   IN THE EMAILS ARE THE STUB'S, not Gemini's — the point is which answers get one and what the email
   looks like, and the summary says so.
================================================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const arg = n => { const i = argv.indexOf('--' + n); return i < 0 ? null : argv[i + 1]; };
const REPO = path.resolve(__dirname, '..');
const SHEETS = arg('sheets'), WEEK = arg('week'), OUT = arg('out');
const MARKS = arg('marks') || 'half';
const LIBRARY = arg('library') || path.join(REPO, 'data', 'questions.json');

const stop = s => { console.error('check/digest-dry.js: ' + s); process.exit(1); };
if (!SHEETS || !WEEK || !OUT) stop('--sheets <sheets.json>, --week <yyyy-mm-dd> and --out <folder> are all required. See the header of this file.');
if (!/^\d{4}-\d{2}-\d{2}$/.test(WEEK)) stop('--week must be a date, yyyy-mm-dd: ' + WEEK);
if (!/^(half|full|none)$/.test(MARKS)) stop('--marks is half, full or none: ' + MARKS);
/* REFUSING TO WRITE INTO THE REPO — check/live.js's rule, for the same reason: addresses and names. */
if (!path.relative(REPO, path.resolve(OUT)).startsWith('..')) {
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

/* WHAT THE SHEET SAYS, BEFORE THIS RUN TREATS IT AS SWITCHED ON. */
const cfgReal = JSON.parse(JSON.stringify(b.ev('config()')));
const mode = b.ev('digestMode_(config())'), hour = b.ev('digestHour_(config())');
if (mode === 'off') cfgSet(b, 'weekly_digest', 'preview');           // in memory only: the pass runs only while it is on
b.props.GEMINI_API_KEY = 'dry-run-stub-not-a-key';

/* THE CLOCK: the week's Sunday, an hour before the email, London; it moves only when the pass sleeps. */
const d0 = new RealDate(WEEK + 'T12:00:00Z');
const sunday = new RealDate(d0.getTime() + ((7 - d0.getUTCDay()) % 7) * 864e5).toISOString().slice(0, 10);
const [sy, sm, sd] = sunday.split('-').map(Number);
const sendAt = london(sy, sm, sd, hour, 0, 0);
let now = hour ? london(sy, sm, sd, hour - 1, 0, 0) : sendAt - 3600e3;
w.setClock(now);
G.Utilities.sleep = ms => { now += ms; w.setClock(now); };

/* ---------- GEMINI AND THE SITE, STUBBED ---------------------------------------------------------------------
   The library's URL is the local file; Gemini gives half the marks (or all, or is full all day); anything
   else is refused, so nothing here reaches the network. */
const net = { asks: 0, lib: 0 };
G.UrlFetchApp = { fetch: (url, o) => {
  if (/data\/questions\.json/.test(url)) { net.lib++; return { getResponseCode: () => 200, getContentText: () => libText }; }
  if (/generativelanguage/.test(url)) {
    net.asks++;
    if (MARKS === 'none') return { getResponseCode: () => 503, getContentText: () => '{"error":{"code":503,"message":"stubbed: full"}}' };
    const of = +((/<mark_scheme marks="(\d+)">/.exec(JSON.parse(o.payload).contents[0].parts[0].text) || [])[1] || 1);
    const awarded = MARKS === 'full' ? of : Math.floor(of / 2);
    const text = JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ awarded: awarded, feedback: 'Stubbed.' }) }] } }] });
    return { getResponseCode: () => 200, getContentText: () => text };
  }
  throw new Error('check/digest-dry.js reaches no network: ' + url);
} };
const logs = [];
G.console = { log: s => logs.push(String(s)), warn: () => {}, error: () => {}, info: () => {} };
G.Logger = { log: () => {} };

/* ---------- 1. THE SETUP CHECK'S REACH, AS OF THE HOUR BEFORE ------------------------------------------------- */
const check = JSON.parse(JSON.stringify(b.ev('clearCache(); checkSundayEmail()'))).lines || [];
const reach = check.filter(l => /^(THIS WEEK|  NOT REACHED|NOT MARKED YET)/.test(l));

/* ---------- 2. THE MARKING PASS, UNTIL NOTHING IS LEFT --------------------------------------------------------- */
const passes = [];
for (let i = 0; i < 12; i++) {
  const r = JSON.parse(JSON.stringify(b.ev('clearCache(); digestMarkPass_(new Date())')));
  passes.push(r);
  if (r.error || r.did || !r.marked || !r.left) break;
}
const cannot = (passes[0] && passes[0].cannot) || {};

/* ---------- 3. THE EMAILS, AT THE SEND HOUR, THROUGH THE NET, TO A FOLDER ------------------------------------- */
now = sendAt; w.setClock(now);
const plan = b.ev('clearCache(); digestPlanNow_(digestWeekToSend_(new Date()))');
const kept = [];
G.MailApp = { sendEmail: m => { kept.push(JSON.parse(JSON.stringify(m))); }, getRemainingDailyQuota: () => 0 };
plan.emails.forEach(m => {
  G.__m = { to: m.to, subject: m.subject, body: m.text, htmlBody: m.html, name: plan.look.brand, firstNamesOnly: true };
  b.ev('mailOut_(__m)');
});
if (mail.sent.length) stop('an email reached the world’s MailApp — nothing may be sent from here. Nothing was written.');

fs.mkdirSync(OUT, { recursive: true });
const pad = n => String(n).padStart(2, '0');
kept.forEach((m, i) => {
  const n = pad(i + 1);
  fs.writeFileSync(path.join(OUT, n + '.json'), JSON.stringify({ to: m.to, subject: m.subject, text: m.body, html: m.htmlBody }, null, 2));
  fs.writeFileSync(path.join(OUT, n + '.txt'), 'To: ' + m.to + '\nSubject: ' + m.subject + '\n\n' + m.body + '\n');
  fs.writeFileSync(path.join(OUT, n + '.html'), '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<title>' + String(m.subject).replace(/</g, '&lt;') + '</title><body style="margin:16px">' + m.htmlBody + '</body>');
});
const summary = {
  sheet: { weekly_digest: String(cfgReal.weekly_digest || ''), weekly_digest_hour: hour, weekly_digest_marking: String(cfgReal.weekly_digest_marking || '') },
  week: { start: plan.week.start, end: plan.week.end, email_at: new RealDate(sendAt).toISOString() },
  reach: reach,
  marking: { stubbed: 'Gemini is STUBBED (' + MARKS + ') — the marks in these emails are not real', passes: passes, cannot: cannot,
             would_mark: passes.reduce((n, r) => n + (r.marked || 0), 0), library_fetches: net.lib, gemini_asks: net.asks },
  emails: kept.map((m, i) => ({ file: pad(i + 1), to: m.to, subject: m.subject })),
  unreachable: plan.unreachable.map(u => ({ count: u.count, why: u.why })),
};
fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));

console.log('The week of ' + plan.week.start + ' to ' + plan.week.end + '; the email at ' + hour + ':00 London on ' + sunday
  + ' (weekly_digest on the sheet: "' + summary.sheet.weekly_digest + '").');
reach.forEach(l => console.log(l));
console.log('Marking (Gemini STUBBED, ' + MARKS + '): ' + passes.length + ' pass(es); would mark ' + summary.marking.would_mark
  + '; cannot mark ' + (Object.keys(cannot).map(k => cannot[k] + ' (' + k + ')').join(', ') || 'none') + '.');
passes.forEach((r, i) => console.log('  pass ' + (i + 1) + ': ' + (r.error ? 'ERROR ' + r.error : r.did ? r.why
  : 'waiting ' + r.waiting + ', marked ' + r.marked + ', left ' + r.left + (r.stopped ? ' (' + r.stopped + ')' : ''))));
console.log(kept.length + ' email(s) written to ' + path.resolve(OUT) + ' — nothing was sent.');
