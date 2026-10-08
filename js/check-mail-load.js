/* ==================================================================================================
   @family. — check-mail-load.js   THE BACKEND WITH ITS MAIL, TRIGGERS, LOCK AND CLOCK STUBBED

   NOT A CHECK — a harness, like `check-gas-load.js` underneath it, and not on the roster in
   check-all.js. LIFTED OUT OF `check-digest.js`, WHICH WROTE IT, the day a second parent email needed
   it. That email (after each session, then every day of work) was removed on 8 Oct — docs/history/295
   — and its check with it; check-digest.js is the one user again, and the harness stays a file of its
   own because it is a world, not a list of rules.

     · THE RECEIPT THE MAIL STUB LOOKS FOR IS A PARAMETER. `world({ receipt: { tab, keyCol } })` —
       `digest_log` / `week_of` by default, the weekly email's. A send with no row for that address
       saying `sending`, under a well-formed key, at the moment of sending, is recorded in
       `mail.unreceipted`; a send while the lock is held, in `mail.locked`.
     · THE TRIGGER STUB KNOWS `everyHours`, so a check can book the kind of hourly trigger
       `installWeeklyDigest` must take away (`DIGEST_RETIRED_RUNS`).
     · `formatDate` ANSWERS `yyyy-MM-dd HH:mm` IN THE ZONE NAMED, as well as `yyyy-MM-dd`, so a London
       clock is never quietly a UTC one — the whole of the summer question.

   AND THE STATIC READERS check-digest's "nothing starts it" section wrote — `strip`, `calls`,
   `mentions`, `unquote`. Every person the check invents is invented, and every PIN is 0000.
================================================================================================== */
'use strict';
const path = require('path');
const { backend } = require('./check-gas-load.js');

const REPO = path.resolve(__dirname, '..');

/* ---------- A CALENDAR THAT KNOWS WHERE LONDON IS --------------------------------------------------
   THE HARNESS'S `formatDate` IS UTC WHATEVER ZONE IT IS ASKED FOR, which is right for what it was
   written for and would make these checks unable to tell a London day from a UTC one — the whole of the
   BST question. So here `yyyy-MM-dd` (and `yyyy-MM-dd HH:mm`) is answered in the zone named, by the
   same tz database a browser uses. A backend that asked for UTC (or never asked) gets UTC, and the
   summer cases catch it. */
const dayIn = (d, tz) => {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(new Date(d));
  } catch (e) { return new Date(d).toISOString().slice(0, 10); }
};
const wallIn = (d, tz) => {
  try {
    const p = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: tz || 'UTC', hourCycle: 'h23', year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(d)).forEach(x => { p[x.type] = x.value; });
    return p.year + '-' + p.month + '-' + p.day + ' ' + p.hour + ':' + p.minute;
  } catch (e) { return new Date(d).toISOString().slice(0, 16).replace('T', ' '); }
};
const iso = d => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);

/* ---------- MAIL, TRIGGERS AND THE CLOCK, STUBBED ---------------------------------------------------- */
const RealDate = Date;
function world(opts) {
  opts = opts || {};
  const receipt = opts.receipt || { tab: 'digest_log', keyCol: 'week_of' };
  const mail = { sent: [], quota: opts.quota == null ? 100 : opts.quota, fail: false, unreceipted: [], locked: [] };
  /* THE RECEIPT IS ASKED FOR AT THE MOMENT OF SENDING. At-most-once is "the log says `sending` before
     the email goes", and a check that only read the log afterwards could not tell that order from the
     reverse — sending first and writing `sent` after passed it. So the stub looks at the log itself:
     a row for this address, under a well-formed key, saying `sending`, or the send is recorded as
     unreceipted. And the lock: an email sent while the run holds it is the whole mailing holding up
     the site. */
  let tabsRef = null;
  const MailApp = {
    sendEmail(m) {
      if (lock.held) mail.locked.push(m && m.to);
      const g = tabsRef && tabsRef[receipt.tab], h = g && g[0];
      const ok = g && g.slice(1).some(r => String(r[h.indexOf('to')]) === String(m && m.to)
        && String(r[h.indexOf('status')]) === 'sending' && /^'?\d{4}-\d{2}-\d{2}$/.test(String(r[h.indexOf(receipt.keyCol)])));
      if (!ok) mail.unreceipted.push(m && m.to);
      if (mail.fail) throw new Error('Invalid email: ' + (m && m.to));
      if (mail.quota <= 0) throw new Error('Service invoked too many times for one day: email.');
      mail.quota--; mail.sent.push(m);
    },
    getRemainingDailyQuota: () => mail.quota,
  };
  const trig = [];
  const ScriptApp = {
    getScriptId: () => 'local', getOAuthToken: () => '', getService: () => ({ getUrl: () => '' }),
    getAuthorizationInfo: () => ({ getAuthorizationStatus: () => 'NOT_REQUIRED' }), AuthMode: { FULL: 'FULL' },
    WeekDay: { MONDAY: 'MONDAY', TUESDAY: 'TUESDAY', WEDNESDAY: 'WEDNESDAY', THURSDAY: 'THURSDAY',
               FRIDAY: 'FRIDAY', SATURDAY: 'SATURDAY', SUNDAY: 'SUNDAY' },
    getProjectTriggers: () => trig.slice(),
    deleteTrigger: t => { const i = trig.indexOf(t); if (i >= 0) trig.splice(i, 1); },
    newTrigger(fn) {
      const spec = { fn: fn };
      const make = () => { const t = { spec: spec, getHandlerFunction: () => spec.fn }; trig.push(t); return t; };
      const clock = {
        onWeekDay: d => { spec.weekDay = d; return clock; }, atHour: h => { spec.hour = h; return clock; },
        nearMinute: m => { spec.minute = m; return clock; }, inTimezone: z => { spec.tz = z; return clock; },
        everyDays: n => { spec.everyDays = n; return clock; }, everyMinutes: n => { spec.everyMinutes = n; return clock; },
        everyHours: n => { spec.everyHours = n; return clock; },
        everyWeeks: n => { spec.everyWeeks = n; return clock; }, after: ms => { spec.after = ms; return clock; },
        create: make,
      };
      return { timeBased: () => clock, forSpreadsheet: () => ({ onChange: () => ({ create: make }) }) };
    },
  };
  const lock = { free: true, held: false };
  const take = () => { if (!lock.free) return false; lock.held = true; return true; };
  const LockService = { getScriptLock: () => ({ tryLock: take, waitLock: take, releaseLock: () => { lock.held = false; } }) };
  const b = backend({ MailApp, ScriptApp, LockService });
  tabsRef = b.tabs;
  const G = b.ev('globalThis');
  const fmt0 = G.Utilities.formatDate;
  G.Utilities.formatDate = (d, tz, f) => (f === 'yyyy-MM-dd' ? dayIn(d, tz) : f === 'yyyy-MM-dd HH:mm' ? wallIn(d, tz) : fmt0(d, tz, f));
  /* THE CLOCK. `new Date()` with no argument, inside the backend, is this instant; everything else is a
     real Date, and a Date the harness made is still `instanceof Date` to the backend's `isoDate_`. */
  const setClock = ms => {
    class Clock extends RealDate {
      constructor(...a) { if (a.length) super(...a); else super(ms); }
      static now() { return ms; }
      static [Symbol.hasInstance](x) { return x instanceof RealDate; }
    }
    G.Date = Clock;
  };
  return { b, mail, trig, lock, G, setClock };
}

const cfgSet = (b, k, v) => {
  const g = b.tabs.config, h = g[0], ki = h.indexOf('key'), vi = h.indexOf('value');
  const r = g.find((x, i) => i > 0 && x[ki] === k);
  if (r) r[vi] = v;
  else { const row = h.map(() => ''); row[ki] = k; row[vi] = v; g.push(row); }
  b.ev('clearCache()');
};
const rowsOf = (b, tab) => {
  const g = b.tabs[tab], h = g[0];
  return g.slice(1).map(r => { const o = {}; h.forEach((c, i) => { o[c] = r[i] instanceof Date ? iso(r[i]) : r[i]; }); return o; });
};
const at = s => new RealDate(s).getTime();

/* ---------- READING THE SOURCE FOR WHO NAMES WHAT ------------------------------------------------------
   Comments out; strings blanked by `unquote`, because "run weeklyDigestRun again" in a message is an
   instruction to a person, not a call. `calls` is a name followed by `(`; `mentions` is every
   word-bounded use, because `sunday: installWeeklyDigest,` in RUNNABLE calls nothing in the text and
   books the trigger from `?run=sunday`. Both skip the function's own declaration. */
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
const calls = (src, name) => [...src.matchAll(new RegExp('(^|[^\\w.])' + name + '\\s*\\(', 'g'))]
  .filter(m => !/function\s+$/.test(src.slice(Math.max(0, m.index - 10), m.index + m[1].length)));
const unquote = t => t.replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g, "''");
const mentions = (src0, name) => { const src = unquote(src0); return [...src.matchAll(new RegExp('(^|[^\\w.$])' + name + '(?![\\w$])', 'g'))]
  .filter(m => !/function\s+$/.test(src.slice(Math.max(0, m.index - 10), m.index + m[1].length))); };

module.exports = { world, cfgSet, rowsOf, at, iso, dayIn, wallIn, RealDate, REPO, strip, calls, unquote, mentions };
